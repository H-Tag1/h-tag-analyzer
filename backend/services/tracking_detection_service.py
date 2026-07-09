import json
import logging
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple
from playwright.async_api import Page

from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem
from models.element_tracking_signal import ElementTrackingSignal
from services.code_generator_service import parse_ga_event_call
from services.ga_event_exclusion_service import (
    is_ignored_datalayer_event,
    is_ignored_ga_event_name,
)

logger = logging.getLogger(__name__)

CLICK_WAIT_MS = 350
CLICK_EVENT_WAIT_MS = 1200
CLICK_EVENT_POLL_MS = 100

ELEMENT_QUERY_JS = """
Array.from(document.querySelectorAll('button, a, [onclick], input[type="submit"], input[type="button"]'))
    .filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.right > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity || '1') > 0
        );
    })
"""

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

DANGEROUS_CLICK_TEXTS = ("구매하기", "결제", "주문", "탈퇴", "삭제", "purchase", "checkout", "order now")


def apply_static_tracking_detection(elements: List[PageElement]) -> List[PageElement]:
    for element in elements:
        tracking_data, methods = _build_tracking_from_static_signals(element.static_tracking_signals)
        if tracking_data:
            element.tracking_data = tracking_data
            element.tracking_methods = methods
            element.has_ga_tag = True
    return elements


async def apply_click_tracking_detection(
    page: Page,
    elements: List[PageElement],
    page_url: str,
    network_collector=None,
) -> List[PageElement]:
    candidates = [
        element
        for element in elements
        if _should_click_element(element, page_url)
    ]
    candidates.sort(key=_click_priority)
    initial_url = page.url or page_url

    for element in candidates:
        await _restore_initial_click_state(page, page_url, initial_url)
        url_before = page.url
        datalayer_before = await _collect_datalayer(page)
        network_hit_count_before = len(network_collector.get_hits()) if network_collector else 0

        clicked = await _click_initial_element(page, element)
        if not clicked:
            continue

        datalayer_after = await _collect_datalayer(page)
        url_after_datalayer = page.url
        new_events = (
            _diff_datalayer(datalayer_before, datalayer_after)
            if url_after_datalayer == url_before
            else []
        )

        await _wait_for_click_events(page, datalayer_before, network_collector, network_hit_count_before)
        datalayer_after = await _collect_datalayer(page)
        url_after_datalayer = page.url
        new_events = (
            _diff_datalayer(datalayer_before, datalayer_after)
            if url_after_datalayer == url_before
            else new_events
        )

        ga_events = [
            event
            for event in new_events
            if isinstance(event, dict) and _is_ga_tracking_event(event) and not is_ignored_datalayer_event(event)
        ]

        network_events = _collect_click_network_events(network_collector, network_hit_count_before)
        if not ga_events and not network_events:
            await _restore_initial_click_state(page, page_url, initial_url, force=page.url != initial_url)
            continue

        normalized_events = [_normalize_tracking_event(event) for event in ga_events]
        normalized_events.extend(network_events)
        normalized_events.sort(key=_tracking_event_priority)
        element.click_tracking_events.extend(normalized_events)
        element.has_ga_tag = True
        if "click_datalayer" not in element.tracking_methods:
            element.tracking_methods.append("click_datalayer")
        element.tracking_data = _merge_tracking_data(element.tracking_data, normalized_events[0])

        logger.info(
            "Click tracking detected on %s (%s): %s",
            element.selector,
            element.text,
            normalized_events[0].get("event_name") or normalized_events[0].get("event"),
        )

        if _should_reset_page_after_click(normalized_events):
            await _restore_initial_click_state(page, page_url, initial_url, force=True)
        else:
            await _close_click_side_effects(page)
            await _restore_initial_click_state(page, page_url, initial_url, force=page.url != initial_url)

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
        if element.click_tracking_events and not _has_ga_event_fields(tracking_data):
            tracking_data = _merge_tracking_data(tracking_data, element.click_tracking_events[0])

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
            existing.tracking_data = _merge_tracking_data(existing.tracking_data, item.tracking_data)
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
                tracking_data = _merge_tracking_data(tracking_data, parsed)
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


def _merge_tracking_data(base: Dict[str, Any], extra: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(base or {})
    for key, value in (extra or {}).items():
        if key not in merged or merged[key] in (None, "", {}):
            merged[key] = value
    return merged


def _element_key(selector: str, text: str) -> str:
    return f"{selector.strip()}|{text.strip()}"


def _click_priority(element: PageElement) -> Tuple[int, int, int, int]:
    needs_click = 0 if not element.click_tracking_events else 1
    if element.element_type == "button":
        type_rank = 0
    elif element.element_type == "input":
        type_rank = 1
    else:
        type_rank = 2
    static_rank = 0 if element.static_tracking_signals else 1
    return (needs_click, type_rank, static_rank, element.element_index)


def _should_click_element(element: PageElement, page_url: str) -> bool:
    text = (element.text or "").strip().lower()
    if any(keyword in text for keyword in DANGEROUS_CLICK_TEXTS):
        return False
    return True


async def _click_initial_element(page: Page, element: PageElement) -> bool:
    try:
        click_point = await page.evaluate(
            f"""(payload) => {{
                const els = {ELEMENT_QUERY_JS};
                function buildSelector(el) {{
                    if (el.id) return '#' + CSS.escape(el.id);
                    if (el.className && typeof el.className === 'string') {{
                        const cls = el.className.trim().split(/\\s+/)[0];
                        if (cls) return el.tagName.toLowerCase() + '.' + CSS.escape(cls);
                    }}
                    return el.tagName.toLowerCase();
                }}
                function textOf(el) {{
                    return (el.innerText || el.value || el.title || el.getAttribute('aria-label') || '').trim().slice(0, 120);
                }}
                function matches(el) {{
                    return (
                        buildSelector(el) === payload.selector &&
                        el.tagName.toLowerCase() === payload.elementType &&
                        textOf(el) === payload.text
                    );
                }}

                let el = null;
                if (payload.index >= 0 && payload.index < els.length && matches(els[payload.index])) {{
                    el = els[payload.index];
                }} else {{
                    el = els.find(matches) || null;
                }}
                if (!el) return null;
                el.scrollIntoView({{ block: 'center', inline: 'center' }});
                const rect = el.getBoundingClientRect();
                return {{
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                }};
            }}""",
            {
                "index": element.element_index,
                "selector": element.selector,
                "text": element.text or "",
                "elementType": element.element_type,
            },
        )
        if not click_point:
            return False
        await page.mouse.click(click_point["x"], click_point["y"])
        return True
    except Exception as exc:
        logger.debug("Click failed for index %s: %s", element.element_index, exc)
        return False


async def _restore_initial_click_state(page: Page, scan_url: str, initial_url: str, force: bool = False) -> None:
    if not force and page.url == initial_url:
        return

    try:
        await page.goto(initial_url, wait_until="load", timeout=30000)
        await page.wait_for_timeout(500)
        return
    except Exception:
        pass

    try:
        await page.goto(scan_url, wait_until="load", timeout=30000)
        await page.wait_for_timeout(500)
    except Exception as exc:
        logger.warning("Failed to restore initial page before click: %s", exc)


async def _close_click_side_effects(page: Page) -> None:
    try:
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(100)
    except Exception:
        pass


def _should_reset_page_after_click(events: List[Dict[str, Any]]) -> bool:
    for event in events:
        button_area = str(event.get("ep_button_area") or "")
        button_name = str(event.get("ep_button_name") or "")
        if button_name == "햄버거" or button_area.startswith("햄버거_메뉴"):
            return True
    return False


async def _restore_page(page: Page, scan_url: str, url_before: str) -> None:
    try:
        await page.go_back(wait_until="load", timeout=10000)
        await page.wait_for_timeout(500)
        return
    except Exception:
        pass

    try:
        await page.goto(url_before, wait_until="load", timeout=30000)
        await page.wait_for_timeout(500)
        return
    except Exception:
        pass

    try:
        await page.goto(scan_url, wait_until="load", timeout=30000)
        await page.wait_for_timeout(500)
    except Exception as exc:
        logger.warning("Failed to restore page after click: %s", exc)


async def _collect_datalayer(page: Page) -> List[Dict[str, Any]]:
    try:
        result = await page.evaluate("() => JSON.parse(JSON.stringify(window.dataLayer || []))")
        return result if isinstance(result, list) else []
    except Exception:
        return []


def _diff_datalayer(before: List[Dict[str, Any]], after: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    before_serialized = [json.dumps(item, sort_keys=True, ensure_ascii=False) for item in before]
    after_serialized = [json.dumps(item, sort_keys=True, ensure_ascii=False) for item in after]
    before_counts = Counter(before_serialized)

    new_items = []
    for serialized in after_serialized:
        if before_counts[serialized] > 0:
            before_counts[serialized] -= 1
        else:
            new_items.append(json.loads(serialized))
    return new_items


def _is_ga_tracking_event(event: Dict[str, Any]) -> bool:
    if is_ignored_datalayer_event(event):
        return False
    if event.get("event_name"):
        return not is_ignored_ga_event_name(str(event.get("event_name")))
    if event.get("event") in (None, "ga_event", "ga_virtual"):
        return bool(event.get("ep_button_area") or event.get("ep_button_name"))
    event_name = event.get("event")
    return bool(event_name) and not is_ignored_ga_event_name(str(event_name))


def _normalize_tracking_event(event: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(event)
    if normalized.get("event_name"):
        return normalized

    raw_event = str(normalized.get("event") or "").strip()
    if raw_event and raw_event.lower() not in {"ga_event", "ga_virtual"}:
        normalized["event_name"] = raw_event
    return normalized


async def _wait_for_click_events(page: Page, datalayer_before, network_collector, hit_count_before: int) -> None:
    waited_ms = 0
    while waited_ms < CLICK_EVENT_WAIT_MS:
        if _collect_click_network_events(network_collector, hit_count_before):
            return

        datalayer_after = await _collect_datalayer(page)
        new_events = _diff_datalayer(datalayer_before, datalayer_after)
        if any(_event_name_from_tracking_dict(event).lower().startswith("click_") for event in new_events if isinstance(event, dict)):
            return

        await page.wait_for_timeout(CLICK_EVENT_POLL_MS)
        waited_ms += CLICK_EVENT_POLL_MS


def _collect_click_network_events(network_collector, hit_count_before: int) -> List[Dict[str, Any]]:
    if not network_collector:
        return []

    from services.tag_classification_service import extract_ep_params, is_interaction_event

    events: List[Dict[str, Any]] = []
    for hit in network_collector.get_hits()[hit_count_before:]:
        event_name = (hit.event_name or "").strip()
        params = extract_ep_params(hit)
        if not is_interaction_event(event_name, params):
            continue
        events.append({
            "event_name": event_name,
            **params,
        })
    return events


def _tracking_event_priority(event: Dict[str, Any]) -> int:
    event_name = _event_name_from_tracking_dict(event).lower()
    if event_name.startswith("click_"):
        return 0
    if event_name == "page_view":
        return 2
    return 1


def _event_name_from_tracking_dict(event: Dict[str, Any]) -> str:
    return str(event.get("event_name") or event.get("event") or "").strip()


def _has_ga_event_fields(tracking_data: Dict[str, Any]) -> bool:
    return bool(
        tracking_data.get("event_name")
        or tracking_data.get("event")
        or tracking_data.get("ep_button_area")
    )
