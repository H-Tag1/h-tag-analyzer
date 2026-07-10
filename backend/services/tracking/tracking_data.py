from typing import Any, Dict


def merge_tracking_data(base: Dict[str, Any], extra: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(base or {})
    for key, value in (extra or {}).items():
        if key not in merged or merged[key] in (None, "", {}):
            merged[key] = value
    return merged


def has_ga_event_fields(tracking_data: Dict[str, Any]) -> bool:
    return bool(
        tracking_data.get("event_name")
        or tracking_data.get("event")
        or tracking_data.get("ep_button_area")
    )
