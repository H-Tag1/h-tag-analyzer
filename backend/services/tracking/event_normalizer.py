from typing import Any, Dict, List, Optional

from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement


EP_FIELDS = ("ep_button_area", "ep_button_area2", "ep_button_name")


def is_click_event(event_name: str) -> bool:
    return event_name.lower().startswith("click_")


def is_page_view_event(event_name: str) -> bool:
    return (event_name or "").strip().lower() == "page_view"


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


def params_from_event_dict(event: Dict[str, Any]) -> Dict[str, str]:
    return {
        field: str(event.get(field) or "").strip()
        for field in EP_FIELDS
    }


def event_signature(event_name: str, params: Dict[str, str]) -> str:
    return "|".join([
        event_name,
        params["ep_button_area"],
        params["ep_button_area2"],
        params["ep_button_name"],
    ])


def param_signature(params: Dict[str, str]) -> str:
    return "|".join([
        params["ep_button_area"],
        params["ep_button_area2"],
        params["ep_button_name"],
    ])


def event_name_from_dict(event: Dict[str, Any]) -> str:
    event_name = str(event.get("event_name") or "").strip()
    if event_name and event_name.lower() not in {"ga_event", "ga_virtual"}:
        return event_name

    raw_event = str(event.get("event") or "").strip()
    if raw_event.lower().startswith("click_"):
        return raw_event
    return event_name or raw_event


def prefer_click_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    click_param_signatures = {
        param_signature(params_from_event_dict(event))
        for event in events
        if is_click_event(event_name_from_dict(event))
    }
    if not click_param_signatures:
        return events

    preferred: List[Dict[str, Any]] = []
    for event in events:
        event_name = event_name_from_dict(event)
        params = params_from_event_dict(event)
        if (
            not is_click_event(event_name)
            and event_name.lower() in {"page_view", "undefined"}
            and param_signature(params) in click_param_signatures
        ):
            continue
        preferred.append(event)
    return preferred


def element_click_param_keys(elements: List[PageElement], element_key_lookup) -> set[str]:
    keys: set[str] = set()
    for element in elements:
        for event in element.click_tracking_events:
            event_name = event_name_from_dict(event)
            if not is_click_event(event_name):
                continue
            params = params_from_event_dict(event)
            keys.add(element_param_key(element, params, element_key_lookup))
    return keys


def element_param_key(element: PageElement, params: Dict[str, str], element_key_lookup) -> str:
    return f"{element_key_lookup(element)}|{param_signature(params)}"


def has_click_equivalent(
    event_name: str,
    params: Dict[str, str],
    element: Optional[PageElement],
    element_click_keys: set[str],
    click_param_signatures: set[str],
    element_key_lookup,
) -> bool:
    if is_click_event(event_name):
        return False
    if event_name.lower() not in {"page_view", "undefined"}:
        return False

    signature = param_signature(params)
    if element and element_param_key(element, params, element_key_lookup) in element_click_keys:
        return True
    return signature in click_param_signatures
