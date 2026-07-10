import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem
from models.element_tracking_signal import ElementTrackingSignal
from services.code_generator_service import parse_ga_event_call
from services.tracking.click_detector import apply_click_tracking_detection
from services.tracking.tracking_data import has_ga_event_fields, merge_tracking_data

logger = logging.getLogger(__name__)

GTM_ATTR_MAP = {
    "data-gtm-event": "event",
    "data-gtm-category": "event_category",
    "data-gtm-action": "event_action",
    "data-gtm-label": "event_label",
    "data-gtm-value": "value",
    "data-ga-event": "event",
    "data-ga-category": "event_category",
    "data-ga-action": "event_action",
    "data-ga-label": "event_label",
    "data-analytics-event": "event",
    "data-event": "event",
    "data-category": "event_category",
    "data-action": "event_action",
    "data-label": "event_label",
}


def apply_static_tracking_detection(elements: List[PageElement]) -> List[PageElement]:
    for element in elements:
        tracking_data, methods = _build_tracking_from_static_signals(element.static_tracking_signals)
        if tracking_data:
            element.tracking_data = tracking_data
            element.tracking_methods = methods
            element.has_ga_tag = True
    return elements


def build_tracked_items_from_elements(elements: List[PageElement]) -> List[TrackedAnalysisItem]:
    items: List[TrackedAnalysisItem] = []
    seen_keys = set()

    for element in elements:
        if not element.has_ga_tag or not element.bounding_box:
            continue

        key = _element_key(element.selector, element.text or "")
        if key in seen_keys:
            continue
        seen_keys.add(key)

        tracking_data = element.tracking_data or {}
        if element.click_tracking_events and not has_ga_event_fields(tracking_data):
            tracking_data = merge_tracking_data(tracking_data, element.click_tracking_events[0])

        items.append(
            TrackedAnalysisItem(
                element_selector=element.selector,
                element_text=element.text or "",
                bounding_box=element.bounding_box,
                tracking_description=_build_tracking_description(element),
                tracking_data=tracking_data,
                detection_methods=list(element.tracking_methods),
            )
        )

    return items


def merge_tracked_items(
    code_items: List[TrackedAnalysisItem],
    ai_items: List[TrackedAnalysisItem],
) -> List[TrackedAnalysisItem]:
    merged: Dict[str, TrackedAnalysisItem] = {}

    for item in code_items:
        merged[_element_key(item.element_selector, item.element_text)] = item

    for item in ai_items:
        key = _element_key(item.element_selector, item.element_text)
        existing = merged.get(key)
        if existing:
            existing.tracking_description = _merge_descriptions(existing.tracking_description, item.tracking_description)
            existing.tracking_data = merge_tracking_data(existing.tracking_data, item.tracking_data)
            for method in item.detection_methods or ["ai"]:
                if method not in existing.detection_methods:
                    existing.detection_methods.append(method)
            if "ai" not in existing.detection_methods:
                existing.detection_methods.append("ai")
        else:
            item.detection_methods = list(item.detection_methods or ["ai"])
            if "ai" not in item.detection_methods:
                item.detection_methods.append("ai")
            merged[key] = item

    return list(merged.values())


def filter_issues_by_tracked(issues, tracked_items: List[TrackedAnalysisItem]):
    tracked_keys = {_element_key(item.element_selector, item.element_text) for item in tracked_items}
    return [
        issue
        for issue in issues
        if _element_key(issue.element_selector, issue.element_text) not in tracked_keys
    ]


def parse_static_signals(raw_signals: List[Dict[str, Any]]) -> List[ElementTrackingSignal]:
    signals = []
    for item in raw_signals or []:
        try:
            signals.append(ElementTrackingSignal(**item))
        except Exception:
            continue
    return signals


def _build_tracking_from_static_signals(
    signals: List[ElementTrackingSignal],
) -> Tuple[Dict[str, Any], List[str]]:
    tracking_data: Dict[str, Any] = {}
    methods: List[str] = []

    for signal in signals:
        if signal.type == "attribute" and signal.name and signal.value is not None:
            attr_name = signal.name.lower()
            if attr_name == "data-gtm-ecommerce":
                parsed = _parse_js_object(signal.value)
                if parsed:
                    tracking_data["ecommerce"] = parsed
                    if "gtm_attribute" not in methods:
                        methods.append("gtm_attribute")
                continue

            mapped_key = GTM_ATTR_MAP.get(attr_name)
            if mapped_key:
                tracking_data[mapped_key] = signal.value
                if "gtm_attribute" not in methods:
                    methods.append("gtm_attribute")
            else:
                tracking_data[signal.name] = signal.value
                if "tracking_attribute" not in methods:
                    methods.append("tracking_attribute")
        elif signal.type == "onclick" and signal.value:
            parsed = _parse_onclick_tracking(signal.value)
            if parsed:
                tracking_data = merge_tracking_data(tracking_data, parsed)
                if "onclick_handler" not in methods:
                    methods.append("onclick_handler")

    return tracking_data, methods


def _parse_onclick_tracking(onclick: str) -> Dict[str, Any]:
    ga_event = parse_ga_event_call(onclick)
    if ga_event:
        return ga_event

    datalayer_match = re.search(r"dataLayer\.push\s*\(\s*(\{[\s\S]*?\})\s*\)", onclick)
    if datalayer_match:
        parsed = _parse_js_object(datalayer_match.group(1))
        if parsed:
            return parsed

    gtag_match = re.search(
        r"gtag\s*\(\s*['\"]event['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)",
        onclick,
    )
    if gtag_match:
        payload: Dict[str, Any] = {"event": gtag_match.group(1)}
        if gtag_match.group(2):
            extra = _parse_js_object(gtag_match.group(2))
            if extra:
                payload.update(extra)
        return payload

    ga_match = re.search(r"ga\s*\(\s*['\"]send['\"]\s*,\s*['\"]event['\"]\s*,\s*['\"]([^'\"]+)['\"]", onclick)
    if ga_match:
        return {"event": ga_match.group(1), "legacy_ga": True}

    return {}


def _parse_js_object(raw: str) -> Dict[str, Any]:
    cleaned = raw.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    normalized = cleaned
    normalized = re.sub(r"(\w+)\s*:", r'"\1":', normalized)
    normalized = normalized.replace("'", '"')
    try:
        parsed = json.loads(normalized)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        return {}


def _build_tracking_description(element: PageElement) -> str:
    parts = []
    method_labels = {
        "gtm_attribute": "GTM data-* 속성",
        "tracking_attribute": "트래킹 data-* 속성",
        "onclick_handler": "onclick 핸들러 (GA_Event/gtag/dataLayer)",
        "click_datalayer": "클릭 시 dataLayer push 감지",
    }

    for method in element.tracking_methods:
        label = method_labels.get(method, method)
        if label not in parts:
            parts.append(label)

    event_name = None
    if element.tracking_data:
        event_name = element.tracking_data.get("event_name") or element.tracking_data.get("event")
    if event_name:
        return f"{', '.join(parts)} · 이벤트: {event_name}"
    return ", ".join(parts) if parts else "코드 기반 트래킹 감지"


def _merge_descriptions(left: str, right: str) -> str:
    if left == right:
        return left
    if left in right:
        return right
    if right in left:
        return left
    return f"{left} / {right}"


def _element_key(selector: str, text: str) -> str:
    return f"{selector.strip()}|{text.strip()}"
