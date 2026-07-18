import logging
from typing import Any, Dict, List, Optional, Tuple

from models.ai_analysis_item import AiAnalysisItem
from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem
from services.tracking.event_normalizer import (
    EP_FIELDS,
    element_click_param_keys,
    element_has_verified_click_tracking,
    event_name_from_dict,
    event_signature,
    extract_ep_params,
    has_click_equivalent,
    is_click_event,
    is_interaction_event,
    is_page_view_event,
    param_signature,
    params_from_event_dict,
    prefer_click_events,
)
from services.ga4_channel_service import resolve_channel_or_none
from services.hamburger_menu_filter import is_hamburger_drawer_element
from services.element_grouping_service import expand_grouped_overlay_results
from services.hybrid_tag_judgment_service import (
    HybridTagJudgmentResolver,
    RagJudgmentEvidence,
    recommended_spec_from_evidence,
)

logger = logging.getLogger(__name__)

EP_FIELD_LABELS = {
    "ep_button_area": "ep_button_area",
    "ep_button_area2": "ep_button_area2",
    "ep_button_name": "ep_button_name",
}
EMPTY_BOUNDING_BOX = BoundingBox(x=0, y=0, width=0, height=0)
HEADER_DEFAULT_MENU_LABELS = frozenset({"검색", "장바구니", "마이현대"})
HEADER_DEFAULT_MENU_MAX_Y = 160


def _header_default_menu_event_name(channel_id: str) -> Optional[str]:
    if channel_id.endswith("_pc"):
        platform = "PC"
    elif channel_id.endswith("_mo"):
        platform = "MO"
    else:
        return None

    lang_map = {"kr": "국문", "en": "영문", "cn": "중문"}
    lang = lang_map.get(channel_id.split("_")[0])
    if not lang:
        return None
    return f"click_{platform}_{lang}_공통"


def _infer_header_default_menu_params(
    page_url: Optional[str],
    element: PageElement,
) -> Optional[Dict[str, str]]:
    if not page_url or not element.click_tested or not element.bounding_box:
        return None
    if element.bounding_box.y > HEADER_DEFAULT_MENU_MAX_Y:
        return None

    label = _normalize_label(element.text or "")
    if label not in HEADER_DEFAULT_MENU_LABELS:
        return None

    channel = resolve_channel_or_none(page_url)
    if not channel:
        return None

    event_name = _header_default_menu_event_name(channel.channel_id)
    if not event_name:
        return None

    return {
        "event_name": event_name,
        "ep_button_area": "Header",
        "ep_button_area2": "Header",
        "ep_button_name": label,
    }


def classify_network_tags(
    hits: List[NetworkTagHit],
    elements: Optional[List[PageElement]] = None,
    page_url: Optional[str] = None,
) -> Tuple[List[TrackedAnalysisItem], List[AiAnalysisItem], List[AiAnalysisItem]]:
    tracked_items: List[TrackedAnalysisItem] = []
    issues: List[AiAnalysisItem] = []
    review_items: List[AiAnalysisItem] = []
    seen_keys: set[str] = set()
    classified_element_keys: set[str] = set()
    rag_resolver = HybridTagJudgmentResolver(page_url) if page_url else None

    click_hits = [
        hit for hit in hits
        if is_interaction_event((hit.event_name or "").strip(), extract_ep_params(hit))
    ]
    click_param_signatures = {
        param_signature(extract_ep_params(hit))
        for hit in click_hits
        if is_click_event((hit.event_name or "").strip())
    }
    element_click_keys = element_click_param_keys(elements or [], _element_key)

    for element in elements or []:
        if not element.bounding_box:
            continue

        for click_event in prefer_click_events(element.click_tracking_events):
            event_name = event_name_from_dict(click_event)
            if is_page_view_event(event_name):
                continue
            params = params_from_event_dict(click_event)
            if not is_interaction_event(event_name, params):
                continue

            hit = _find_network_hit_for_event(click_hits, event_name, click_event)
            missing_fields = [field for field in EP_FIELDS if not params[field]]

            item_key = f"{_element_key(element)}|{event_signature(event_name, params)}"
            if item_key in seen_keys:
                continue
            seen_keys.add(item_key)

            trigger = hit.trigger if hit else "click"
            if not missing_fields:
                tracked_items.append(_to_tracked_item(element, event_name, params, trigger))
            else:
                issues.append(_to_issue_item(element, event_name, params, missing_fields, trigger))
            classified_element_keys.add(_element_key(element))

    for hit in click_hits:
        event_name = (hit.event_name or "").strip()
        if is_page_view_event(event_name):
            continue
        params = extract_ep_params(hit)
        element = _find_element_for_hit(hit, elements or [])

        if has_click_equivalent(event_name, params, element, element_click_keys, click_param_signatures, _element_key):
            continue

        signature = event_signature(event_name, params)

        if _signature_covered(seen_keys, signature):
            continue

        item_key = f"network|{signature}"
        seen_keys.add(item_key)
        missing_fields = [field for field in EP_FIELDS if not params[field]]

        if not missing_fields:
            tracked_items.append(_to_tracked_item(element, event_name, params, hit.trigger))
        else:
            issues.append(_to_issue_item(element, event_name, params, missing_fields, hit.trigger))
        if element:
            classified_element_keys.add(_element_key(element))

    for element in elements or []:
        element_key = _element_key(element)
        if element_key in classified_element_keys:
            continue
        inferred = _infer_header_default_menu_params(page_url, element)
        if not inferred:
            continue
        tracked_items.append(
            _to_tracked_item(
                element,
                inferred["event_name"],
                inferred,
                "click_inferred",
            )
        )
        classified_element_keys.add(element_key)

    for element in elements or []:
        if not element.bounding_box or not element.click_tested:
            continue
        if is_hamburger_drawer_element(element):
            continue
        if element.click_group_id and not element.click_group_representative:
            continue
        if element_has_verified_click_tracking(element):
            continue

        element_key = _element_key(element)
        if element_key in classified_element_keys:
            continue

        evidence = rag_resolver.find_for_element(
            element_selector=element.selector,
            element_text=element.text or "",
            group_key=element.click_group_id or element.structure_group_key or "",
        ) if rag_resolver else None

        if evidence and evidence.available and not evidence.matched:
            review_items.append(_to_review_item(element, evidence))
        else:
            issues.append(_to_missing_event_issue_item(element, evidence))
        classified_element_keys.add(element_key)

    tracked_items, issues, review_items = expand_grouped_overlay_results(
        tracked_items,
        issues,
        elements,
        review_items,
    )

    logger.info(
        "Classified tags: %d network click hits, %d elements -> %d tracked, %d missing, %d review",
        len(click_hits),
        len(elements or []),
        len(tracked_items),
        len(issues),
        len(review_items),
    )
    return tracked_items, issues, review_items


def _element_key(element: PageElement) -> str:
    return f"{element.selector}|{(element.text or '').strip()}"


def _find_element_for_hit(
    hit: NetworkTagHit,
    elements: List[PageElement],
) -> Optional[PageElement]:
    params = extract_ep_params(hit)
    button_name = _normalize_label(params.get("ep_button_name", ""))
    event_name = (hit.event_name or "").strip().lower()

    click_verified = _find_click_verified_elements(elements, event_name, params)
    if len(click_verified) == 1:
        return click_verified[0]

    if button_name:
        exact_matches = [
            element for element in elements
            if element.bounding_box and _normalize_label(element.text or "") == button_name
        ]
        if len(exact_matches) == 1:
            return exact_matches[0]

        if params.get("ep_button_area"):
            area = _normalize_label(params["ep_button_area"])
            area_matches = [
                element for element in exact_matches
                if area in _normalize_label(element.selector)
                or area in _normalize_label(element.text or "")
            ]
            if len(area_matches) == 1:
                return area_matches[0]

    return None


def _find_click_verified_elements(
    elements: List[PageElement],
    event_name: str,
    params: Dict[str, str],
) -> List[PageElement]:
    button_name = _normalize_label(params.get("ep_button_name", ""))
    matches: List[PageElement] = []

    for element in elements:
        if not element.bounding_box or not element.click_tracking_events:
            continue
        for click_event in element.click_tracking_events:
            if event_name_from_dict(click_event).lower() != event_name:
                continue
            event_params = params_from_event_dict(click_event)
            if button_name:
                if _normalize_label(event_params.get("ep_button_name", "")) == button_name:
                    matches.append(element)
                    break
                continue
            if _params_match_score(event_params, params) >= 2:
                matches.append(element)
                break
    return matches


def _params_match_score(left: Dict[str, str], right: Dict[str, str]) -> int:
    score = 0
    for field in EP_FIELDS:
        if left[field] and right[field] and _normalize_label(left[field]) == _normalize_label(right[field]):
            score += 1
    return score


def _normalize_label(value: str) -> str:
    return "".join(value.split()).lower()


def _signature_covered(seen_keys: set[str], signature: str) -> bool:
    suffix = f"|{signature}"
    return any(key.endswith(suffix) or key == f"network|{signature}" for key in seen_keys)


def _find_network_hit_for_event(
    hits: List[NetworkTagHit],
    event_name: str,
    click_event: Dict[str, Any],
) -> Optional[NetworkTagHit]:
    candidates = [
        hit for hit in hits
        if (hit.event_name or "").strip().lower() == event_name.lower()
    ]
    if not candidates:
        return None

    click_triggered = [hit for hit in candidates if hit.trigger == "click"]
    pool = click_triggered or candidates
    return max(pool, key=lambda hit: _match_score(extract_ep_params(hit), click_event))


def _match_score(params: Dict[str, str], event: Dict[str, Any]) -> int:
    score = 0
    event_params = params_from_event_dict(event)
    for field in EP_FIELDS:
        if params[field] and event_params[field] and params[field] == event_params[field]:
            score += 1
    return score


def _to_tracked_item(
    element: Optional[PageElement],
    event_name: str,
    params: Dict[str, str],
    trigger: str,
) -> TrackedAnalysisItem:
    return TrackedAnalysisItem(
        element_selector=element.selector if element else event_name,
        element_text=(element.text or event_name) if element else event_name,
        bounding_box=element.bounding_box if element and element.bounding_box else EMPTY_BOUNDING_BOX,
        tracking_description=f"GA4 collect ({trigger})",
        tracking_data={
            "event_name": event_name,
            "trigger": trigger,
            **params,
        },
        detection_methods=["network"] if not element else ["network", "click_datalayer"],
    )


def _to_issue_item(
    element: Optional[PageElement],
    event_name: str,
    params: Dict[str, str],
    missing_fields: List[str],
    trigger: str,
) -> AiAnalysisItem:
    missing_labels = ", ".join(EP_FIELD_LABELS[field] for field in missing_fields)
    selector = element.selector if element else event_name
    text = (element.text or event_name) if element else event_name
    return AiAnalysisItem(
        element_selector=selector,
        element_text=text,
        bounding_box=element.bounding_box if element and element.bounding_box else EMPTY_BOUNDING_BOX,
        issue=f"{missing_labels} 파라미터 누락",
        recommended_ga_spec={
            "event_name": event_name,
            "element_selector": selector if element else "",
            **params,
        },
    )


def _to_missing_event_issue_item(
    element: PageElement,
    evidence: Optional[RagJudgmentEvidence] = None,
) -> AiAnalysisItem:
    rag_matched = bool(evidence and evidence.matched and evidence.reference)
    if rag_matched and evidence:
        recommended_spec = recommended_spec_from_evidence(
            evidence,
            element.selector,
            element.text or "",
        )
        issue = "클릭 이벤트 미발생 · 유사한 ga4Common 태깅 사례 확인"
    else:
        recommended_spec = {
            "event_name": "",
            "element_selector": element.selector,
            "ep_button_area": "",
            "ep_button_area2": "",
            "ep_button_name": element.text or "",
        }
        issue = "클릭 이벤트 미발생"

    return AiAnalysisItem(
        element_selector=element.selector,
        element_text=element.text or "",
        bounding_box=element.bounding_box if element.bounding_box else EMPTY_BOUNDING_BOX,
        issue=issue,
        recommended_ga_spec=recommended_spec,
        judgment_source="rag" if rag_matched else "rule",
        rag_score=evidence.score if rag_matched and evidence else None,
    )


def _to_review_item(element: PageElement, evidence: RagJudgmentEvidence) -> AiAnalysisItem:
    return AiAnalysisItem(
        element_selector=element.selector,
        element_text=element.text or "",
        bounding_box=element.bounding_box if element.bounding_box else EMPTY_BOUNDING_BOX,
        issue="실제 클릭 이벤트와 유사한 ga4Common 근거가 없어 확인이 필요합니다.",
        recommended_ga_spec={
            "event_name": "",
            "element_selector": element.selector,
            "ep_button_area": "",
            "ep_button_area2": "",
            "ep_button_name": element.text or "",
        },
        judgment_source="rag",
        rag_score=evidence.score,
    )
