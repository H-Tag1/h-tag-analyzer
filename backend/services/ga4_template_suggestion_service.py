import asyncio
import json
import logging
import re
from typing import Any, Dict, List

from config import settings
from services.code_generator_service import _make_client
from services.ga4_channel_service import Ga4Channel, resolve_channel
from services.rag_storage_service import (
    RAG_REFERENCE_TOP_K_SUGGEST,
    build_default_tag_spec,
    build_rag_query_from_issue,
    fetch_reference_chunks,
    filter_rag_hits_by_score,
    rag_hit_to_tag_spec,
    resolve_reference_context,
)

logger = logging.getLogger(__name__)

TAG_SPEC_FIELDS = ("event_name", "ep_button_area", "ep_button_area2", "ep_button_name")
LLM_BATCH_SIZE = 10


def _empty_tag_spec() -> Dict[str, str]:
    return {field: "" for field in TAG_SPEC_FIELDS}


def _normalize_tag_spec(raw: Dict[str, Any]) -> Dict[str, str]:
    return {
        "event_name": str(raw.get("event_name") or raw.get("event") or "").strip(),
        "ep_button_area": str(raw.get("ep_button_area") or "").strip(),
        "ep_button_area2": str(raw.get("ep_button_area2") or "").strip(),
        "ep_button_name": str(raw.get("ep_button_name") or "").strip(),
    }


def merge_tag_spec(existing: Dict[str, str], suggested: Dict[str, str]) -> Dict[str, str]:
    merged = dict(existing)
    for field in TAG_SPEC_FIELDS:
        if not merged.get(field) and suggested.get(field):
            merged[field] = suggested[field]
    return merged


def _build_issue_prompt_sections(
    channel: Ga4Channel,
    issues: List[Dict[str, Any]],
) -> str:
    sections: List[str] = []
    for index, issue in enumerate(issues):
        query = build_rag_query_from_issue(issue)
        resolution = resolve_reference_context(
            channel,
            query,
            top_k=RAG_REFERENCE_TOP_K_SUGGEST,
            section_title=f"[Few-Shot Context - Item {index}]",
        )
        if resolution.used_fallback:
            logger.warning(
                "Tag spec suggestion RAG fallback for item %d (%s): %s",
                index,
                channel.channel_id,
                resolution.fallback_reason,
            )
        few_shot = resolution.prompt_section
        issue_payload = {
            "index": index,
            "element_selector": str(issue.get("element_selector") or ""),
            "element_text": str(issue.get("element_text") or ""),
            "known_values": _normalize_tag_spec(issue.get("recommended_ga_spec") or {}),
        }
        sections.append(
            "\n".join(
                [
                    f"### Missing item {index}",
                    few_shot,
                    "Missing item payload:",
                    "```json",
                    json.dumps(issue_payload, ensure_ascii=False, indent=2),
                    "```",
                ]
            )
        )
    return "\n\n".join(sections)


def _parse_llm_json_array(raw: str) -> List[Dict[str, Any]]:
    cleaned = raw.strip()
    fenced = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```$", cleaned, re.DOTALL | re.IGNORECASE)
    if fenced:
        cleaned = fenced.group(1).strip()

    data = json.loads(cleaned)
    if not isinstance(data, list):
        raise ValueError("LLM response is not a JSON array")
    return data


def _ask_llm_for_tag_spec_batch(
    page_url: str,
    channel: Ga4Channel,
    issues: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    client = _make_client()
    issue_sections = _build_issue_prompt_sections(channel, issues)

    prompt = f"""You are a GA4 tagging expert for Hyundai Duty Free (HDDfs).
Suggest GA_Event naming values for missing click tracking items.

Page URL: {page_url}
Channel: {channel.label} ({channel.channel_id}, {channel.hostname})

Each missing item below includes a Few-Shot Context section retrieved from the same channel's ga4Common.js.
Use those reference snippets to infer naming conventions for event_name, ep_button_area, ep_button_area2, and ep_button_name.

{issue_sections}

Return ONLY a JSON array with one object per item, in the same order as Missing item 0, 1, ...
Each object must contain exactly these string fields:
- event_name
- ep_button_area
- ep_button_area2
- ep_button_name

Rules:
- Follow naming patterns from the Few-Shot reference snippets for the same channel
- event_name should follow the channel's click_* naming convention shown in the references
- ep_button_name should be a literal label suitable for reporting (not a JS variable name)
- Use element_text when it helps choose ep_button_name, applying the same prefix patterns used in the references (e.g. "배너_", "메뉴_", "탭_")
- Do not wrap the answer in markdown fences
- Do not add explanations
"""

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
        temperature=0.2,
    )

    raw = (response.choices[0].message.content or "").strip()
    parsed = _parse_llm_json_array(raw)
    if len(parsed) != len(issues):
        raise ValueError(f"LLM returned {len(parsed)} suggestions for {len(issues)} issues")

    return [_normalize_tag_spec(item) for item in parsed]


def _suggest_tag_specs_with_llm(
    page_url: str,
    channel: Ga4Channel,
    issues: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    results: List[Dict[str, str]] = []
    for start in range(0, len(issues), LLM_BATCH_SIZE):
        batch = issues[start : start + LLM_BATCH_SIZE]
        results.extend(_ask_llm_for_tag_spec_batch(page_url, channel, batch))
    return results


def _suggest_tag_specs_with_rag(
    channel: Ga4Channel,
    issues: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    results: List[Dict[str, str]] = []
    for issue in issues:
        existing = _normalize_tag_spec(issue.get("recommended_ga_spec") or {})
        query = build_rag_query_from_issue(issue)
        hits = fetch_reference_chunks(channel, query, top_k=1)
        if not hits:
            suggested = build_default_tag_spec(channel, str(issue.get("element_text") or ""))
            results.append(merge_tag_spec(existing, suggested))
            continue

        filtered = filter_rag_hits_by_score(hits)
        if not filtered:
            suggested = build_default_tag_spec(channel, str(issue.get("element_text") or ""))
            results.append(merge_tag_spec(existing, suggested))
            continue

        suggested = rag_hit_to_tag_spec(filtered[0], str(issue.get("element_text") or ""))
        results.append(merge_tag_spec(existing, suggested))
    return results


async def suggest_tag_specs_for_page(page_url: str, issues: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    if not issues:
        return []

    channel = resolve_channel(page_url)

    if settings.azure_openai_key and settings.azure_openai_endpoint:
        try:
            return await asyncio.to_thread(
                _suggest_tag_specs_with_llm,
                page_url,
                channel,
                issues,
            )
        except Exception as exc:
            logger.warning("LLM tag spec suggestion failed, using RAG fallback: %s", exc)

    return _suggest_tag_specs_with_rag(channel, issues)
