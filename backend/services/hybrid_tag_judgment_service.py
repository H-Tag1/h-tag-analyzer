import logging
from dataclasses import dataclass
from typing import Dict, Optional

from services.ga4_channel_service import Ga4Channel, resolve_channel_or_none
from services.rag_storage_service import (
    RagSearchResult,
    build_rag_query,
    ensure_channel_indexed,
    fetch_reference_chunks,
    filter_rag_hits_by_score,
    rag_hit_to_tag_spec,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RagJudgmentEvidence:
    available: bool
    matched: bool
    reason: str
    score: Optional[float] = None
    reference: Optional[RagSearchResult] = None


class HybridTagJudgmentResolver:
    """Resolve same-channel ga4Common references for otherwise ambiguous items."""

    def __init__(self, page_url: str) -> None:
        self.channel: Optional[Ga4Channel] = resolve_channel_or_none(page_url)
        self._availability: Optional[bool] = None
        self._availability_reason = ""
        self._cache: Dict[str, RagJudgmentEvidence] = {}

    def find_for_element(
        self,
        element_selector: str,
        element_text: str,
        group_key: str = "",
    ) -> RagJudgmentEvidence:
        query = build_rag_query(
            element_selector=element_selector,
            element_text=element_text,
        )
        cache_key = f"element|{group_key or query}"
        return self._search(cache_key, query)

    def find_for_request(
        self,
        event_name: str,
        ep_button_area: str,
        ep_button_area2: str,
        ep_button_name: str,
    ) -> RagJudgmentEvidence:
        query = build_rag_query(
            event_name=event_name,
            ep_button_area=ep_button_area,
            ep_button_area2=ep_button_area2,
            ep_button_name=ep_button_name,
        )
        return self._search(f"request|{query}", query, event_name=event_name)

    def _search(
        self,
        cache_key: str,
        query: str,
        event_name: str = "",
    ) -> RagJudgmentEvidence:
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        if not self._is_available():
            evidence = RagJudgmentEvidence(
                available=False,
                matched=False,
                reason=self._availability_reason,
            )
            self._cache[cache_key] = evidence
            return evidence

        if not query.strip():
            evidence = RagJudgmentEvidence(
                available=True,
                matched=False,
                reason="empty_query",
            )
            self._cache[cache_key] = evidence
            return evidence

        try:
            hits = fetch_reference_chunks(
                self.channel,
                query,
                top_k=3,
                event_name=event_name or None,
            )  # type: ignore[arg-type]
            matched_hits = filter_rag_hits_by_score(hits)
        except Exception as exc:
            logger.warning(
                "RAG judgment search failed for %s: %s",
                self.channel.channel_id if self.channel else "unknown",
                exc,
            )
            self._availability = False
            self._availability_reason = "search_failed"
            evidence = RagJudgmentEvidence(
                available=False,
                matched=False,
                reason="search_failed",
            )
            self._cache[cache_key] = evidence
            return evidence

        if matched_hits:
            best = matched_hits[0]
            evidence = RagJudgmentEvidence(
                available=True,
                matched=True,
                reason="matched_reference",
                score=best.score,
                reference=best,
            )
        else:
            best_score = hits[0].score if hits else None
            evidence = RagJudgmentEvidence(
                available=True,
                matched=False,
                reason="low_similarity" if hits else "no_results",
                score=best_score,
            )

        self._cache[cache_key] = evidence
        return evidence

    def _is_available(self) -> bool:
        if self._availability is not None:
            return self._availability

        if self.channel is None:
            self._availability = False
            self._availability_reason = "unsupported_channel"
            return False

        try:
            chunk_count = ensure_channel_indexed(self.channel)
        except Exception as exc:
            logger.warning("RAG judgment index unavailable for %s: %s", self.channel.channel_id, exc)
            self._availability = False
            self._availability_reason = "index_failed"
            return False

        self._availability = chunk_count > 0
        self._availability_reason = "" if self._availability else "empty_channel_index"
        return self._availability


def recommended_spec_from_evidence(
    evidence: RagJudgmentEvidence,
    element_selector: str,
    element_text: str,
) -> Dict[str, str]:
    if not evidence.reference:
        return {"element_selector": element_selector}

    return {
        **rag_hit_to_tag_spec(evidence.reference, element_text),
        "element_selector": element_selector,
    }
