import json
import logging
from collections import Counter
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple

from playwright.async_api import Page

from models.page_element import PageElement
from services.ga_event_exclusion_service import (
    is_ignored_datalayer_event,
    is_ignored_ga_event_name,
)
from services.tracking.event_normalizer import extract_ep_params, is_interaction_event
from services.tracking.tracking_data import merge_tracking_data
from services.element_grouping_service import (
    propagate_group_click_results,
    should_click_for_verification,
)


logger = logging.getLogger(__name__)
ProgressReporter = Callable[[Dict[str, Any]], Awaitable[None]]

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

PERSISTENT_NAVIGATION_CHECK_JS = """
function isPersistentNavigationElement(element) {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const edgeTolerance = Math.max(viewportHeight * 0.02, 4);
    const topLimit = Math.min(Math.max(viewportHeight * 0.2, 100), 180);
    const maxBarHeight = Math.min(Math.max(viewportHeight * 0.22, 120), 180);
    let node = element;

    while (node && node !== document.documentElement) {
        if (node.hasAttribute?.('data-h-tag-persistent-navigation')) return true;

        const style = window.getComputedStyle(node);
        if (style.position === 'fixed' || style.position === 'sticky') {
            const rect = node.getBoundingClientRect();
            const spansViewport = (
                rect.width >= viewportWidth * 0.55 &&
                rect.left <= viewportWidth * 0.15 &&
                rect.right >= viewportWidth * 0.85
            );
            const tagName = node.tagName.toLowerCase();
            const semanticNavigation = (
                ['header', 'nav', 'footer'].includes(tagName) ||
                node.getAttribute('role') === 'navigation'
            );
            const navigationHint = /(gnb|menu|navigation|drawer|sidebar)/i.test(
                `${node.id || ''} ${String(node.className || '')}`
            );
            const interactiveCount = node.querySelectorAll(
                'a, button, [onclick], input[type="button"], input[type="submit"]'
            ).length;
            const navigationPanel = (
                style.position === 'fixed' &&
                rect.width >= viewportWidth * 0.25 &&
                rect.height >= viewportHeight * 0.5 &&
                interactiveCount >= 2 &&
                (semanticNavigation || navigationHint)
            );
            if (navigationPanel) return true;

            const shortNavigationBar = (
                rect.width > 0 &&
                rect.height > 0 &&
                rect.height <= maxBarHeight &&
                spansViewport &&
                (semanticNavigation || interactiveCount >= 2)
            );
            const anchoredTop = rect.top <= topLimit && style.top !== 'auto';
            const anchoredBottom = (
                style.position === 'fixed' &&
                rect.top > viewportHeight / 2 &&
                rect.bottom >= viewportHeight - edgeTolerance
            );
            if (shortNavigationBar && (anchoredTop || anchoredBottom)) return true;
        }
        node = node.parentElement;
    }
    return false;
}
"""

DANGEROUS_CLICK_TEXTS = ("구매하기", "결제", "주문", "탈퇴", "삭제", "purchase", "checkout", "order now")


async def apply_click_tracking_detection(
    page: Page,
    elements: List[PageElement],
    page_url: str,
    network_collector=None,
    progress: Optional[ProgressReporter] = None,
    exclude_persistent_navigation: bool = False,
) -> List[PageElement]:
    clickable_elements = [element for element in elements if _should_click_element(element)]
    candidates = _build_representative_click_candidates(clickable_elements)
    optimization_stats = _compute_click_reduction_stats(clickable_elements, candidates)

    candidates.sort(key=_click_priority)
    initial_url = page.url or page_url
    total_candidates = len(candidates)
    completed_candidates = 0

    logger.info(
        "Click optimization: total_clickable=%d actual_clicks=%d skipped_siblings=%d reduction=%.1f%%",
        optimization_stats["total_clickable"],
        optimization_stats["actual_clicks"],
        optimization_stats["skipped_siblings"],
        optimization_stats["reduction_percent"],
    )

    await _report_progress(progress, {
        "type": "click_scan_start",
        "current": completed_candidates,
        "total": total_candidates,
        "totalClickable": optimization_stats["total_clickable"],
        "skippedGroupedSiblings": optimization_stats["skipped_siblings"],
        "reductionPercent": optimization_stats["reduction_percent"],
    })

    for element in candidates:
        try:
            await _restore_initial_click_state(page, page_url, initial_url)
            url_before = page.url
            datalayer_before = await _collect_datalayer(page)
            network_hit_count_before = len(network_collector.get_hits()) if network_collector else 0

            clicked = await _click_initial_element(
                page,
                element,
                exclude_persistent_navigation=exclude_persistent_navigation,
            )
            if not clicked:
                continue
            element.click_tested = True

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
                await _close_click_side_effects(page)
                await _restore_initial_click_state(page, page_url, initial_url, force=page.url != initial_url)
                continue

            normalized_events = [_normalize_tracking_event(event) for event in ga_events]
            normalized_events.extend(network_events)
            normalized_events.sort(key=_tracking_event_priority)
            element.click_tracking_events.extend(normalized_events)
            element.has_ga_tag = True
            if "click_datalayer" not in element.tracking_methods:
                element.tracking_methods.append("click_datalayer")
            element.tracking_data = merge_tracking_data(element.tracking_data, normalized_events[0])

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
        finally:
            completed_candidates += 1
            await _report_progress(progress, {
                "type": "click_scan_progress",
                "current": completed_candidates,
                "total": total_candidates,
            })

    await _close_click_side_effects(page)
    elements = propagate_group_click_results(elements)

    await _report_progress(progress, {
        "type": "click_scan_complete",
        "current": completed_candidates,
        "total": total_candidates,
        "totalClickable": optimization_stats["total_clickable"],
        "skippedGroupedSiblings": optimization_stats["skipped_siblings"],
        "reductionPercent": optimization_stats["reduction_percent"],
        "propagatedSiblings": sum(
            1 for element in elements
            if element.click_group_id and not element.click_group_representative
        ),
    })
    return elements


def _build_representative_click_candidates(elements: List[PageElement]) -> List[PageElement]:
    return [element for element in elements if should_click_for_verification(element)]


def _compute_click_reduction_stats(
    clickable_elements: List[PageElement],
    candidates: List[PageElement],
) -> Dict[str, Any]:
    total_clickable = len(clickable_elements)
    actual_clicks = len(candidates)
    skipped_siblings = max(total_clickable - actual_clicks, 0)
    reduction_percent = (
        (skipped_siblings / total_clickable) * 100.0
        if total_clickable > 0
        else 0.0
    )
    return {
        "total_clickable": total_clickable,
        "actual_clicks": actual_clicks,
        "skipped_siblings": skipped_siblings,
        "reduction_percent": round(reduction_percent, 1),
    }


async def _report_progress(progress: Optional[ProgressReporter], event: Dict[str, Any]) -> None:
    if progress:
        await progress(event)


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


def _should_click_element(element: PageElement) -> bool:
    text = (element.text or "").strip().lower()
    if any(keyword in text for keyword in DANGEROUS_CLICK_TEXTS):
        return False
    return True


async def _click_initial_element(
    page: Page,
    element: PageElement,
    exclude_persistent_navigation: bool = False,
) -> bool:
    try:
        click_point = await page.evaluate(
            f"""(payload) => {{
                const els = {ELEMENT_QUERY_JS};
                {PERSISTENT_NAVIGATION_CHECK_JS}
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
                if (payload.excludePersistentNavigation && isPersistentNavigationElement(el)) return null;
                el.scrollIntoView({{ block: 'center', inline: 'center' }});
                const rect = el.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                if (payload.excludePersistentNavigation) {{
                    const hitElement = document.elementFromPoint(x, y);
                    if (
                        !hitElement ||
                        isPersistentNavigationElement(hitElement) ||
                        (hitElement !== el && !el.contains(hitElement))
                    ) {{
                        return null;
                    }}
                }}
                return {{
                    x,
                    y,
                }};
            }}""",
            {
                "index": element.element_index,
                "selector": element.selector,
                "text": element.text or "",
                "elementType": element.element_type,
                "excludePersistentNavigation": exclude_persistent_navigation,
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

    try:
        closed = await page.evaluate("""() => {
            const closeWords = ['close', '닫기', '×', 'x'];
            const layerWords = ['search', 'modal', 'layer', 'popup', 'pop', 'dialog'];

            function isVisible(el) {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    rect.bottom > 0 &&
                    rect.right > 0 &&
                    rect.top < window.innerHeight &&
                    rect.left < window.innerWidth &&
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    Number(style.opacity || '1') > 0
                );
            }

            function textOf(el) {
                return [
                    el.innerText,
                    el.textContent,
                    el.value,
                    el.title,
                    el.getAttribute('aria-label'),
                    el.getAttribute('alt'),
                    el.className,
                    el.id,
                ].filter(Boolean).join(' ').trim().toLowerCase();
            }

            function hasCloseSignal(el) {
                const text = textOf(el);
                return closeWords.some(word => text === word || text.includes(word)) ||
                    /(^|[-_\\s])close($|[-_\\s])|btn[-_]?close|close[-_]?btn/.test(text);
            }

            function isLayerContext(el) {
                let node = el;
                for (let depth = 0; depth < 6 && node; depth++) {
                    const text = textOf(node);
                    const rect = node.getBoundingClientRect();
                    if (
                        layerWords.some(word => text.includes(word)) ||
                        node.getAttribute('role') === 'dialog' ||
                        (rect.width >= window.innerWidth * 0.45 && rect.height >= window.innerHeight * 0.25)
                    ) {
                        return true;
                    }
                    node = node.parentElement;
                }
                return false;
            }

            const candidates = Array.from(document.querySelectorAll('button, a, [role="button"], [onclick]'))
                .filter(el => isVisible(el) && hasCloseSignal(el) && isLayerContext(el))
                .sort((a, b) => {
                    const ar = a.getBoundingClientRect();
                    const br = b.getBoundingClientRect();
                    return (br.top - ar.top) || (br.right - ar.right);
                });

            if (!candidates.length) return false;
            candidates[0].click();
            return true;
        }""")
        if closed:
            await page.wait_for_timeout(200)
    except Exception:
        pass


def _should_reset_page_after_click(events: List[Dict[str, Any]]) -> bool:
    for event in events:
        button_area = str(event.get("ep_button_area") or "")
        button_name = str(event.get("ep_button_name") or "")
        if button_name == "햄버거" or button_area.startswith("햄버거_메뉴"):
            return True
    return False


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
