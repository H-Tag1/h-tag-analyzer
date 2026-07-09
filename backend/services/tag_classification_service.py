import logging
from typing import Any, Dict, List, Optional, Tuple

from models.ai_analysis_item import AiAnalysisItem
from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem

logger = logging.getLogger(__name__)

EP_FIELDS = ("ep_button_area", "ep_button_area2", "ep_button_name")
EP_FIELD_LABELS = {
    "ep_button_area": "ep_button_area",
    "ep_button_area2": "ep_button_area2",
    "ep_button_name": "ep_button_name",
}
EMPTY_BOUNDING_BOX = BoundingBox(x=0, y=0, width=0, height=0)


def classify_network_tags(
    hits: List[NetworkTagHit],
    elements: Optional[List[PageElement]] = None,
) -> Tuple[List[TrackedAnalysisItem], List[AiAnalysisItem]]:
    tracked_items: List[TrackedAnalysisItem] = []
    issues: List[AiAnalysisItem] = []
    seen_keys: set[str] = set()

    click_hits = [
        hit for hit in hits
        if is_interaction_event((hit.event_name or "").strip(), extract_ep_params(hit))
    ]

    for element in elements or []:
        if not element.bounding_box:
            continue

        for click_event in element.click_tracking_events:
            event_name = _event_name_from_dict(click_event)
            params = _params_from_event_dict(click_event)
            if not is_interaction_event(event_name, params):
                continue

            hit = _find_network_hit_for_event(click_hits, event_name, click_event)
            missing_fields = [field for field in EP_FIELDS if not params[field]]

            item_key = f"{_element_key(element)}|{_event_signature(event_name, params)}"
            if item_key in seen_keys:
                continue
            seen_keys.add(item_key)

            trigger = hit.trigger if hit else "click"
            if not missing_fields:
                tracked_items.append(_to_tracked_item(element, event_name, params, trigger))
            else:
                issues.append(_to_issue_item(element, event_name, params, missing_fields, trigger))

    for hit in click_hits:
        event_name = (hit.event_name or "").strip()
        params = extract_ep_params(hit)
        signature = _event_signature(event_name, params)

        if _signature_covered(seen_keys, signature):
            continue

        item_key = f"network|{signature}"
        seen_keys.add(item_key)
        missing_fields = [field for field in EP_FIELDS if not params[field]]
        element = _find_element_for_hit(hit, elements or [])

        if not missing_fields:
            tracked_items.append(_to_tracked_item(element, event_name, params, hit.trigger))
        else:
            issues.append(_to_issue_item(element, event_name, params, missing_fields, hit.trigger))

    logger.info(
        "Classified tags: %d network click hits, %d elements -> %d tracked, %d missing",
        len(click_hits),
        len(elements or []),
        len(tracked_items),
        len(issues),
    )
    return tracked_items, issues


def is_click_event(event_name: str) -> bool:
    return event_name.lower().startswith("click_")


def is_interaction_event(event_name: str, params: Dict[str, str]) -> bool:
    if is_click_event(event_name):
        return True
    if event_name.lower() not in {"page_view", "undefined"}:
        return False
    return any((params.get(field) or "").strip() for field in EP_FIELDS)


def extract_ep_params(hit: NetworkTagHit) -> Dict[str, str]:
    if hit.ep_button_area or hit.ep_button_area2 or hit.ep_button_name:
        return {
            "ep_button_area": (hit.ep_button_area or "").strip(),
            "ep_button_area2": (hit.ep_button_area2 or "").strip(),
            "ep_button_name": (hit.ep_button_name or "").strip(),
        }

    extracted = {field: "" for field in EP_FIELDS}
    for field in hit.display_fields:
        normalized = field.label.lower()
        if "ep_button_area2" in normalized:
            extracted["ep_button_area2"] = field.value.strip()
        elif "ep_button_area" in normalized:
            extracted["ep_button_area"] = field.value.strip()
        elif "ep_button_name" in normalized:
            extracted["ep_button_name"] = field.value.strip()
    return extracted


def _params_from_event_dict(event: Dict[str, Any]) -> Dict[str, str]:
    return {
        field: str(event.get(field) or "").strip()
        for field in EP_FIELDS
    }


def _merge_params(primary: Dict[str, str], secondary: Dict[str, str]) -> Dict[str, str]:
    merged = dict(primary)
    for field in EP_FIELDS:
        if not merged[field] and secondary.get(field):
            merged[field] = secondary[field]
    return merged


def _event_signature(event_name: str, params: Dict[str, str]) -> str:
    return "|".join([
        event_name,
        params["ep_button_area"],
        params["ep_button_area2"],
        params["ep_button_name"],
    ])


def _element_key(element: PageElement) -> str:
    return f"{element.selector}|{(element.text or '').strip()}"


def _event_name_from_dict(event: Dict[str, Any]) -> str:
    event_name = str(event.get("event_name") or "").strip()
    if event_name and event_name.lower() not in {"ga_event", "ga_virtual"}:
        return event_name

    raw_event = str(event.get("event") or "").strip()
    if raw_event.lower().startswith("click_"):
        return raw_event
    return event_name or raw_event


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
            if _event_name_from_dict(click_event).lower() != event_name:
                continue
            event_params = _params_from_event_dict(click_event)
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
    event_params = _params_from_event_dict(event)
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
