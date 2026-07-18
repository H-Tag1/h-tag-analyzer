import json
import re
from typing import Any, Dict, List, Optional

from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from services.ga_event_exclusion_service import (
    filter_ignored_datalayer_events as _filter_ignored_datalayer_events,
    filter_ignored_network_tags as _filter_ignored_network_tags,
    is_ignored_datalayer_event,
)
from services.tracking.event_normalizer import (
    element_has_verified_click_tracking,
    is_verified_click_tracking_event,
)

DEFAULT_TRACKING_ID = "G-1NWKV3S1TW"
GA_MEASUREMENT_ID_PATTERN = re.compile(r"\bG-[A-Z0-9]+\b", re.IGNORECASE)


def normalize_tracking_id(tracking_id: Optional[str]) -> str:
    value = (tracking_id or DEFAULT_TRACKING_ID).strip().upper()
    return value or DEFAULT_TRACKING_ID


def filter_network_tags(hits: List[NetworkTagHit], tracking_id: Optional[str]) -> List[NetworkTagHit]:
    target = normalize_tracking_id(tracking_id)
    filtered = [hit for hit in hits if network_tag_matches_tracking_id(hit, target)]
    return _filter_ignored_network_tags(filtered)


def filter_datalayer_events(events: List[Dict[str, Any]], tracking_id: Optional[str]) -> List[Dict[str, Any]]:
    target = normalize_tracking_id(tracking_id)
    filtered = [event for event in events if datalayer_event_matches_tracking_id(event, target)]
    return _filter_ignored_datalayer_events(filtered)


def network_tag_matches_tracking_id(hit: NetworkTagHit, tracking_id: str) -> bool:
    target = normalize_tracking_id(tracking_id)
    if hit.tid:
        return hit.tid.upper() == target

    for field in hit.display_fields:
        if field.label == "Tracking ID":
            return field.value.upper() == target

    return False


def datalayer_event_matches_tracking_id(event: Any, tracking_id: str) -> bool:
    target = normalize_tracking_id(tracking_id)
    if isinstance(event, dict):
        send_to = _as_str(event.get("send_to"))
        if send_to and send_to.upper() != target:
            return False

        referenced_ids = _find_measurement_ids(json.dumps(event, ensure_ascii=False))
        if referenced_ids and target not in referenced_ids:
            return False
        return True

    if isinstance(event, list):
        if len(event) >= 2 and _as_str(event[0]) == "config":
            config_id = _as_str(event[1])
            return bool(config_id and config_id.upper() == target)
        if len(event) >= 2 and _as_str(event[0]) == "event":
            if len(event) >= 3 and isinstance(event[2], dict):
                return tracking_data_matches_tracking_id(event[2], target)
            return True

        referenced_ids = _find_measurement_ids(json.dumps(event, ensure_ascii=False))
        if referenced_ids and target not in referenced_ids:
            return False
        return True

    referenced_ids = _find_measurement_ids(str(event))
    if referenced_ids and target not in referenced_ids:
        return False
    return True


def tracking_data_matches_tracking_id(data: Dict[str, Any], tracking_id: Optional[str]) -> bool:
    target = normalize_tracking_id(tracking_id)
    send_to = _as_str(data.get("send_to"))
    if send_to and send_to.upper() != target:
        return False

    referenced_ids = _find_measurement_ids(json.dumps(data, ensure_ascii=False))
    if referenced_ids and target not in referenced_ids:
        return False
    return True


def filter_elements_by_tracking_id(elements: List[PageElement], tracking_id: Optional[str]) -> List[PageElement]:
    target = normalize_tracking_id(tracking_id)

    for element in elements:
        element.click_tracking_events = [
            event
            for event in element.click_tracking_events
            if datalayer_event_matches_tracking_id(event, target)
            and not is_ignored_datalayer_event(event)
        ]

        if element.tracking_data and (
            not tracking_data_matches_tracking_id(element.tracking_data, target)
            or not is_verified_click_tracking_event(element.tracking_data)
        ):
            element.tracking_data = {}

        element.has_ga_tag = bool(
            element_has_verified_click_tracking(element)
            or _static_signals_match_tracking_id(element, target)
        )

    return elements


def _static_signals_match_tracking_id(element: PageElement, tracking_id: str) -> bool:
    if not element.static_tracking_signals:
        return False

    serialized = json.dumps(
        [signal.model_dump() for signal in element.static_tracking_signals],
        ensure_ascii=False,
    )
    referenced_ids = _find_measurement_ids(serialized)
    if referenced_ids:
        return tracking_id in referenced_ids

    # GTM data-* 속성만 있고 Measurement ID가 없으면 대상 페이지 설정으로 간주
    return bool(element.static_tracking_signals)


def _extract_id_query_param(url: str) -> Optional[str]:
    from urllib.parse import parse_qs, urlparse

    parsed = urlparse(url)
    values = parse_qs(parsed.query).get("id")
    if values:
        return _as_str(values[-1])
    return None


def _find_measurement_ids(text: str) -> List[str]:
    return [match.upper() for match in GA_MEASUREMENT_ID_PATTERN.findall(text or "")]


def _as_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
