from typing import Any, Dict, List, Optional

from models.network_tag_hit import NetworkTagHit

# GA가 자동 수집하는 이벤트 — 누락 검증 대상에서 제외
IGNORED_GA_EVENT_NAMES = frozenset({
    "user_engagement",
    "hit_type",
})


def normalize_event_name(event_name: Optional[str]) -> Optional[str]:
    if event_name is None:
        return None
    text = str(event_name).strip().lower()
    return text or None


def is_ignored_ga_event_name(event_name: Optional[str]) -> bool:
    normalized = normalize_event_name(event_name)
    return bool(normalized and normalized in IGNORED_GA_EVENT_NAMES)


def extract_event_name_from_datalayer(event: Any) -> Optional[str]:
    if not isinstance(event, dict):
        return None

    for key in ("event_name", "en", "event"):
        value = event.get(key)
        if value and str(value).strip().lower() != "ga_event":
            return str(value)

    return None


def is_ignored_datalayer_event(event: Any) -> bool:
    if not isinstance(event, dict):
        return False
    return is_ignored_ga_event_name(extract_event_name_from_datalayer(event))


def is_ignored_network_hit(hit: NetworkTagHit) -> bool:
    if is_ignored_ga_event_name(hit.event_name):
        return True

    for field in hit.display_fields:
        if field.label == "Hit Type" and is_ignored_ga_event_name(field.value):
            return True

    return False


def filter_ignored_datalayer_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [event for event in events if not is_ignored_datalayer_event(event)]


def filter_ignored_network_tags(hits: List[NetworkTagHit]) -> List[NetworkTagHit]:
    return [hit for hit in hits if not is_ignored_network_hit(hit)]
