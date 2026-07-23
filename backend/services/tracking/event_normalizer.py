from typing import Any, Dict, List, Optional

from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from services.ga_event_exclusion_service import is_ignored_datalayer_event


EP_FIELDS = ("ep_button_area", "ep_button_area2", "ep_button_name")

# UI label vs GA ep_button_name mismatches (ga4Common template naming).
EP_BUTTON_NAME_ALIAS_GROUPS: tuple[frozenset[str], ...] = (
    frozenset({"알림", "알림설정"}),
)


# ga4Common ep_button_name often prefixes the visible label (e.g. 카테고리_스킨케어).
EP_BUTTON_NAME_VALUE_PREFIXES: tuple[str, ...] = (
    "카테고리_",
    "카테고리메뉴_",
    "탭_",
    "상세탭_",
    "배너_",
    "메뉴_",
    "브랜드_",
    "상품_",
)


def normalize_element_label(text: Optional[str]) -> str:
    return "".join((text or "").split()).lower()


def ep_button_names_match(
    element_text: Optional[str],
    ep_button_name: Optional[str],
) -> bool:
    element_label = normalize_element_label(element_text)
    event_label = normalize_element_label(ep_button_name)
    if not element_label:
        return not event_label
    if not event_label:
        return True
    if element_label == event_label:
        return True
    for group in EP_BUTTON_NAME_ALIAS_GROUPS:
        if element_label in group and event_label in group:
            return True
    for prefix in EP_BUTTON_NAME_VALUE_PREFIXES:
        if event_label == normalize_element_label(f"{prefix}{element_text or ''}"):
            return True
        normalized_prefix = normalize_element_label(prefix)
        if not event_label.startswith(normalized_prefix):
            continue
        event_value = "".join(
            char
            for char in event_label[len(normalized_prefix):]
            if char.isalnum()
        )
        element_value = "".join(char for char in element_label if char.isalnum())
        if len(event_value) >= 4 and event_value in element_value:
            return True
    return False


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


def is_verified_click_tracking_event(event: Any) -> bool:
    if not isinstance(event, dict) or is_ignored_datalayer_event(event):
        return False
    return is_click_event(event_name_from_dict(event))


def tracking_event_matches_element_label(
    element: PageElement,
    event: Dict[str, Any],
) -> bool:
    element_label = normalize_element_label(element.text)
    event_label = params_from_event_dict(event).get("ep_button_name", "")
    if not element_label or not event_label:
        return True
    return ep_button_names_match(element.text, event_label)


def element_has_verified_click_tracking(element: PageElement) -> bool:
    if (
        is_verified_click_tracking_event(element.tracking_data)
        and tracking_event_matches_element_label(element, element.tracking_data)
    ):
        return True
    for event in prefer_click_events(element.click_tracking_events):
        if (
            is_verified_click_tracking_event(event)
            and tracking_event_matches_element_label(element, event)
        ):
            return True
    return False


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
            if (
                not is_click_event(event_name)
                or not tracking_event_matches_element_label(element, event)
            ):
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
