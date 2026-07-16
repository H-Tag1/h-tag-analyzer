import hashlib
import logging
from dataclasses import dataclass
from typing import Any, Dict, List

from services.ga4_channel_service import _template_path, resolve_channel
from services.rag_storage_service import (
    Ga4CodeChunk,
    extract_ga4_code_chunks,
    load_ga4common_source,
)
from services.tag_request_excel_service import ParsedTagRequestSheet
from services.tag_request_matching_service import (
    match_request_parameters,
    request_example_score,
)


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TagRequestReferenceRule:
    rule_id: str
    request_no: str
    request_row_number: int
    selector: str
    event_name: str
    ep_button_area: str
    ep_button_area2: str
    ep_button_name: str
    example_score: int = 0

    def to_browser_payload(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "selector": self.selector,
        }


def build_tag_request_reference_rules(
    sheet: ParsedTagRequestSheet,
) -> List[TagRequestReferenceRule]:
    if not sheet.url or not sheet.items:
        return []

    try:
        channel = resolve_channel(sheet.url)
        template_path = _template_path(channel)
        source = load_ga4common_source(template_path)
        chunks = extract_ga4_code_chunks(source, channel, template_path)
    except (FileNotFoundError, ValueError) as exc:
        logger.warning("Tag request source rules unavailable for %s: %s", sheet.sheet_name, exc)
        return []

    rules: List[TagRequestReferenceRule] = []
    seen: set[tuple[int, str]] = set()
    for request in sheet.items:
        matching_chunks: List[tuple[int, Ga4CodeChunk]] = []
        for chunk in chunks:
            if chunk.event_name != request.event_name or not chunk.element_selector:
                continue
            actual_params = {
                "ep_button_area": chunk.ep_button_area,
                "ep_button_area2": chunk.ep_button_area2,
                "ep_button_name": chunk.ep_button_name,
            }
            match = match_request_parameters(request, actual_params)
            if match.matched:
                matching_chunks.append((request_example_score(request, actual_params), chunk))

        matching_chunks.sort(key=lambda item: (-item[0], item[1].element_selector))
        for example_score, chunk in matching_chunks:
            dedupe_key = (request.row_number, chunk.element_selector)
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)
            rule_id = hashlib.sha1(
                f"{sheet.sheet_name}|{request.row_number}|{chunk.chunk_id}".encode("utf-8")
            ).hexdigest()[:16]
            rules.append(TagRequestReferenceRule(
                rule_id=rule_id,
                request_no=request.request_no,
                request_row_number=request.row_number,
                selector=chunk.element_selector,
                event_name=chunk.event_name,
                ep_button_area=chunk.ep_button_area,
                ep_button_area2=chunk.ep_button_area2,
                ep_button_name=chunk.ep_button_name,
                example_score=example_score,
            ))

    logger.info(
        "Built %d deterministic source rules for %s (%d requests)",
        len(rules),
        sheet.sheet_name,
        len(sheet.items),
    )
    return rules
