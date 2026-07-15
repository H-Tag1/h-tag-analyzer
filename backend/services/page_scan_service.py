import base64
import io
import uuid
import os
import logging
import math
from dataclasses import dataclass
from typing import Awaitable, Callable, List, Dict, Any, Tuple, Optional
from urllib.parse import urlparse, urlunparse

from PIL import Image
from playwright.async_api import Browser, CDPSession, Page, async_playwright

from services.tracking_detection_service import (
    apply_click_tracking_detection,
    apply_static_tracking_detection,
    parse_static_signals,
)
from services.element_grouping_service import (
    apply_click_grouping_with_llm,
)
from services.network_tag_service import NetworkTagCollector
from services.site_adapters.hddfs import (
    goto_scan_target as _goto_scan_target,
    is_auth_action_element as _hddfs_is_auth_action_element,
    is_auth_related_url as _hddfs_is_auth_related_url,
    login as _login_hddfs,
    new_scan_page as _new_scan_page,
)
from config import settings
from models.page_element import PageElement
from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.scan_request import ScanLoginCredentials, ScanRange
from models.screenshot_segment import ScreenshotSegment

logger = logging.getLogger(__name__)
ProgressReporter = Callable[[Dict[str, Any]], Awaitable[None]]
PERSISTENT_NAV_ATTRIBUTE = "data-h-tag-persistent-navigation"


@dataclass(frozen=True)
class _ScreenshotLayer:
    image_bytes: bytes
    x: int
    y: int
    width: int
    height: int


@dataclass(frozen=True)
class _PersistentNavigationCapture:
    top: Optional[_ScreenshotLayer] = None
    bottom: Optional[_ScreenshotLayer] = None


async def collect_page_data(
    url: str,
    login: Optional[ScanLoginCredentials] = None,
    scan_range: Optional[ScanRange] = None,
    progress: Optional[ProgressReporter] = None,
) -> Tuple[str, int, int, List[PageElement], List[Dict[str, Any]], List[NetworkTagHit]]:
    """
    Returns: (screenshot_id, width, height, elements, datalayer_events, network_tags)
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        collector: Optional[NetworkTagCollector] = None
        try:
            page = await _new_scan_page(browser, url)
            collector = NetworkTagCollector(page)
            await collector.start()

            if login and login.enabled:
                await _login_hddfs(page, url, login)
            else:
                await page.goto(url, wait_until="load", timeout=60000)
            await page.wait_for_timeout(1500)
            collector.reset()

            return await _scan_current_page(
                page=page,
                page_url=url,
                collector=collector,
                exclude_auth_actions=bool(login and login.enabled),
                scan_range=scan_range,
                progress=progress,
            )
        finally:
            if collector:
                await collector.stop()
            await browser.close()


async def collect_page_data_with_clean_capture(
    url: str,
    scan_range: Optional[ScanRange] = None,
    progress: Optional[ProgressReporter] = None,
) -> Tuple[List[ScreenshotSegment], int, int, List[PageElement], List[PageElement], List[NetworkTagHit]]:
    """
    Returns: (screenshot_segments, width, height, tracking_elements, capture_elements, network_tags)

    Click tracking is collected on one page, then a fresh page is used for the
    screenshot so click side effects cannot leak into the evidence image.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        collector: Optional[NetworkTagCollector] = None
        try:
            tracking_page = await _new_scan_page(browser, url)
            collector = NetworkTagCollector(tracking_page)
            await collector.start()

            await _goto_scan_target(tracking_page, url)
            await tracking_page.wait_for_timeout(500)
            await _mark_persistent_navigation(tracking_page)
            await _report_progress(progress, {"type": "page_loaded"})
            collector.reset()
            tracking_elements, _, network_tags = await _collect_tracking_data(
                page=tracking_page,
                page_url=url,
                collector=collector,
                exclude_auth_actions=False,
                exclude_persistent_navigation=True,
                scan_range=scan_range,
                progress=progress,
            )
            await _report_progress(progress, {
                "type": "tracking_collected",
                "elementCount": len(tracking_elements),
            })

            await _report_progress(progress, {"type": "capture_start"})
            capture_page = await _new_scan_page(browser, url)
            await _goto_scan_target(capture_page, url)
            await capture_page.wait_for_timeout(500)
            await _prepare_capture_page(capture_page, scan_range)
            await _mark_persistent_navigation(capture_page)

            capture_elements = await _collect_elements(
                capture_page,
                exclude_persistent_navigation=True,
                scan_range=scan_range,
            )
            navigation_capture = await _capture_persistent_navigation(capture_page)
            screenshot_segments, width, height, screenshot_offset_y = await _take_capture_screenshots(
                capture_page,
                scan_range,
                navigation_capture,
            )
            capture_elements = _shift_elements_to_screenshot(
                capture_elements,
                screenshot_offset_y,
                height,
            )
            await _report_progress(progress, {
                "type": "capture_done",
                "segmentCount": len(screenshot_segments),
            })

            return (
                screenshot_segments,
                width,
                height,
                tracking_elements,
                capture_elements,
                network_tags,
            )
        finally:
            if collector:
                await collector.stop()
            await browser.close()


async def collect_authenticated_page_data(
    page: Page,
    url: str,
    scan_range: Optional[ScanRange] = None,
    progress: Optional[ProgressReporter] = None,
) -> Tuple[str, int, int, List[PageElement], List[Dict[str, Any]], List[NetworkTagHit]]:
    collector = NetworkTagCollector(page)
    await collector.start()
    try:
        await _goto_scan_target(page, url)
        await page.wait_for_timeout(1500)
        collector.reset()

        return await _scan_current_page(
            page=page,
            page_url=url,
            collector=collector,
            exclude_auth_actions=True,
            scan_range=scan_range,
            progress=progress,
        )
    finally:
        await collector.stop()


async def prepare_authenticated_scan_page(browser: Browser, url: str, login: ScanLoginCredentials) -> Page:
    page = await _new_scan_page(browser, url)
    await _login_hddfs(page, url, login)
    return page


async def _scan_current_page(
    page: Page,
    page_url: str,
    collector: NetworkTagCollector,
    exclude_auth_actions: bool,
    scan_range: Optional[ScanRange] = None,
    progress: Optional[ProgressReporter] = None,
) -> Tuple[str, int, int, List[PageElement], List[Dict[str, Any]], List[NetworkTagHit]]:
    elements, datalayer, network_tags = await _collect_tracking_data(
        page=page,
        page_url=page_url,
        collector=collector,
        exclude_auth_actions=exclude_auth_actions,
        scan_range=scan_range,
        progress=progress,
    )
    screenshot_id, width, height, screenshot_offset_y = await _take_screenshot(page, scan_range)
    await _report_progress(progress, {
        "type": "screenshot_done",
        "screenshotId": screenshot_id,
        "width": width,
        "height": height,
    })
    elements = _shift_elements_to_screenshot(elements, screenshot_offset_y, height)

    return screenshot_id, width, height, elements, datalayer, network_tags


async def _collect_tracking_data(
    page: Page,
    page_url: str,
    collector: NetworkTagCollector,
    exclude_auth_actions: bool,
    exclude_persistent_navigation: bool = False,
    scan_range: Optional[ScanRange] = None,
    progress: Optional[ProgressReporter] = None,
) -> Tuple[List[PageElement], List[Dict[str, Any]], List[NetworkTagHit]]:
    elements = await _collect_elements(
        page,
        exclude_auth_actions=exclude_auth_actions,
        exclude_persistent_navigation=exclude_persistent_navigation,
        scan_range=scan_range,
    )
    elements = await apply_click_grouping_with_llm(elements)
    grouped_count = sum(1 for element in elements if element.click_group_id)
    representative_count = sum(1 for element in elements if element.click_group_representative)
    await _report_progress(progress, {
        "type": "elements_collected",
        "count": len(elements),
        "groupedCount": grouped_count,
        "clickCandidateCount": representative_count,
    })
    datalayer = await _collect_datalayer(page)
    elements = apply_static_tracking_detection(elements)
    collector.set_trigger("click")
    elements = await apply_click_tracking_detection(
        page,
        elements,
        page_url,
        collector,
        progress=progress,
        exclude_persistent_navigation=exclude_persistent_navigation,
    )
    network_tags = collector.get_hits()

    return elements, datalayer, network_tags


async def _report_progress(progress: Optional[ProgressReporter], event: Dict[str, Any]) -> None:
    if progress:
        await progress(event)


async def _collect_elements(
    page: Page,
    exclude_auth_actions: bool = False,
    exclude_persistent_navigation: bool = False,
    scan_range: Optional[ScanRange] = None,
) -> List[PageElement]:
    vertical_range = await _resolve_scan_range(page, scan_range)
    raw = await page.evaluate("""() => {
        const TRACKING_ATTR_PREFIXES = ['data-gtm', 'data-ga', 'data-analytics', 'data-track', 'data-event'];
        const TRACKING_ATTR_EXACT = ['data-category', 'data-action', 'data-label', 'data-ecommerce'];

        function collectSignals(el) {
            const signals = [];
            let node = el;
            for (let depth = 0; depth < 6 && node; depth++) {
                for (const attr of Array.from(node.attributes || [])) {
                    const name = attr.name.toLowerCase();
                    if (
                        TRACKING_ATTR_PREFIXES.some(prefix => name.startsWith(prefix)) ||
                        TRACKING_ATTR_EXACT.includes(name)
                    ) {
                        signals.push({
                            type: 'attribute',
                            name: attr.name,
                            value: attr.value,
                            depth,
                        });
                    }
                }

                const onclick = node.getAttribute('onclick') || '';
                if (onclick && /gtag\\s*\\(|dataLayer\\.push|ga\\s*\\(|google_analytics/i.test(onclick)) {
                    signals.push({
                        type: 'onclick',
                        value: onclick.slice(0, 800),
                        depth,
                    });
                }

                node = node.parentElement;
            }
            return signals;
        }

        function buildSelector(el) {
            if (el.id) return '#' + CSS.escape(el.id);
            if (el.className && typeof el.className === 'string') {
                const cls = el.className.trim().split(/\\s+/)[0];
                if (cls) return el.tagName.toLowerCase() + '.' + CSS.escape(cls);
            }
            return el.tagName.toLowerCase();
        }

        function nodeKey(node) {
            if (!node || node === document.documentElement) return '';
            if (node.id) return '#' + CSS.escape(node.id);
            if (node.className && typeof node.className === 'string') {
                const cls = node.className.trim().split(/\\s+/).filter(Boolean).slice(0, 2).join('.');
                if (cls) return node.tagName.toLowerCase() + '.' + cls;
            }
            return node.tagName.toLowerCase();
        }

        function buildStructureGroupKey(el) {
            let node = el;
            while (node && node.parentElement) {
                const parent = node.parentElement;
                const peers = Array.from(parent.children).filter((child) => (
                    child.tagName === node.tagName &&
                    String(child.className || '') === String(node.className || '')
                ));
                if (peers.length >= 2) {
                    return `${nodeKey(parent)}>${nodeKey(node)}>${nodeKey(el)}`;
                }
                node = parent;
            }
            return '';
        }

        return Array.from(document.querySelectorAll('button, a, [onclick], input[type="submit"], input[type="button"]'))
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
            .map((el, index) => {
                const rect = el.getBoundingClientRect();
                const scrollX = window.scrollX || window.pageXOffset || 0;
                const scrollY = window.scrollY || window.pageYOffset || 0;
                const staticTrackingSignals = collectSignals(el);
                return {
                    element_index: index,
                    selector: buildSelector(el),
                    text: (el.innerText || el.value || el.title || el.getAttribute('aria-label') || '').trim().slice(0, 120),
                    element_type: el.tagName.toLowerCase(),
                    structure_group_key: buildStructureGroupKey(el),
                    bounding_box: {
                        x: rect.x + scrollX,
                        y: rect.y + scrollY,
                        width: rect.width,
                        height: rect.height,
                    },
                    static_tracking_signals: staticTrackingSignals,
                    has_ga_tag: staticTrackingSignals.length > 0,
                    in_persistent_navigation: Boolean(
                        el.closest('[data-h-tag-persistent-navigation]')
                    ),
                };
            })
            .slice(0, 500);
    }""")

    elements = []
    for item in raw:
        if exclude_auth_actions and _is_auth_action_element(item):
            continue
        if exclude_persistent_navigation and item.get("in_persistent_navigation"):
            continue

        bb_data = item.get("bounding_box", {})
        if vertical_range and not _intersects_vertical_range(bb_data, vertical_range):
            continue

        elements.append(PageElement(
            selector=item["selector"],
            text=item.get("text") or None,
            element_type=item["element_type"],
            bounding_box=BoundingBox(**bb_data) if bb_data else None,
            element_index=item.get("element_index", 0),
            has_ga_tag=item.get("has_ga_tag", False),
            static_tracking_signals=parse_static_signals(item.get("static_tracking_signals", [])),
            structure_group_key=item.get("structure_group_key") or None,
        ))
    return elements


async def _resolve_scan_range(page: Page, scan_range: Optional[ScanRange]) -> Optional[Tuple[float, float]]:
    preset = scan_range.preset if scan_range else "top2"
    if preset == "full":
        return None

    viewport_height = await page.evaluate(
        "() => window.innerHeight || document.documentElement.clientHeight || 0"
    )
    viewport_height = float(viewport_height or 0)

    if preset == "viewport":
        return 0.0, viewport_height
    if preset == "top2":
        return 0.0, viewport_height * 2
    if preset == "custom":
        start_y = float(scan_range.startY or 0)
        end_y = float(scan_range.endY or 0)
        if start_y < 0 or end_y <= start_y:
            raise ValueError("검사 범위는 0 이상의 시작값과 시작값보다 큰 종료값이 필요합니다.")
        return start_y, end_y

    return 0.0, viewport_height * 2


def _intersects_vertical_range(bb_data: Dict[str, Any], vertical_range: Tuple[float, float]) -> bool:
    if not bb_data:
        return False

    start_y, end_y = vertical_range
    top = float(bb_data.get("y") or 0)
    height = float(bb_data.get("height") or 0)
    bottom = top + height
    return bottom >= start_y and top <= end_y


async def _collect_datalayer(page: Page) -> List[Dict[str, Any]]:
    try:
        result = await page.evaluate("() => JSON.parse(JSON.stringify(window.dataLayer || []))")
        return result if isinstance(result, list) else []
    except Exception:
        return []


async def _mark_persistent_navigation(page: Page) -> None:
    marked = await page.evaluate("""(attributeName) => {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        if (!viewportWidth || !viewportHeight) return { top: 0, bottom: 0, panel: 0 };

        document.querySelectorAll(`[${attributeName}]`).forEach((element) => {
            element.removeAttribute(attributeName);
        });

        const edgeTolerance = Math.max(viewportHeight * 0.02, 4);
        const topLimit = Math.min(Math.max(viewportHeight * 0.2, 100), 180);
        const maxBarHeight = Math.min(Math.max(viewportHeight * 0.22, 120), 180);

        function navigationRole(element) {
            const style = window.getComputedStyle(element);
            if (style.position !== 'fixed' && style.position !== 'sticky') return null;

            const rect = element.getBoundingClientRect();
            const rendered = (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                Number(style.opacity || '1') > 0
            );
            if (!rendered) return null;

            const tagName = element.tagName.toLowerCase();
            const semanticNavigation = (
                ['header', 'nav', 'footer'].includes(tagName) ||
                element.getAttribute('role') === 'navigation'
            );
            const navigationHint = /(gnb|menu|navigation|drawer|sidebar)/i.test(
                `${element.id || ''} ${String(element.className || '')}`
            );
            const interactiveCount = element.querySelectorAll(
                'a, button, [onclick], input[type="button"], input[type="submit"]'
            ).length;
            const navigationPanel = (
                style.position === 'fixed' &&
                rect.width >= viewportWidth * 0.25 &&
                rect.height >= viewportHeight * 0.5 &&
                interactiveCount >= 2 &&
                (semanticNavigation || navigationHint)
            );
            if (navigationPanel) return 'panel';

            const visible = (
                rect.right > 0 &&
                rect.left < viewportWidth &&
                rect.bottom > 0 &&
                rect.top < viewportHeight
            );
            if (!visible || rect.height > maxBarHeight) return null;

            const spansViewport = (
                rect.width >= viewportWidth * 0.55 &&
                rect.left <= viewportWidth * 0.15 &&
                rect.right >= viewportWidth * 0.85
            );
            if (!spansViewport) return null;

            if (!semanticNavigation && interactiveCount < 2) return null;

            if (rect.top <= topLimit && style.top !== 'auto') return 'top';
            if (
                style.position === 'fixed' &&
                rect.top > viewportHeight / 2 &&
                rect.bottom >= viewportHeight - edgeTolerance
            ) {
                return 'bottom';
            }
            return null;
        }

        const candidates = Array.from(document.querySelectorAll('body *'))
            .map((element) => ({ element, role: navigationRole(element) }))
            .filter((candidate) => candidate.role);
        const roots = candidates.filter((candidate) => !candidates.some((other) => (
            other !== candidate &&
            other.role === candidate.role &&
            other.element.contains(candidate.element)
        )));

        roots.forEach(({ element, role }) => element.setAttribute(attributeName, role));
        return {
            top: roots.filter((candidate) => candidate.role === 'top').length,
            bottom: roots.filter((candidate) => candidate.role === 'bottom').length,
            panel: roots.filter((candidate) => candidate.role === 'panel').length,
        };
    }""", PERSISTENT_NAV_ATTRIBUTE)
    logger.info(
        "Persistent navigation marked: top=%s bottom=%s panel=%s",
        marked.get("top", 0),
        marked.get("bottom", 0),
        marked.get("panel", 0),
    )


async def _capture_persistent_navigation(page: Page) -> _PersistentNavigationCapture:
    bounds = await page.evaluate("""(attributeName) => {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

        function groupBounds(role) {
            const rects = Array.from(document.querySelectorAll(`[${attributeName}="${role}"]`))
                .map((element) => element.getBoundingClientRect())
                .filter((rect) => (
                    rect.width > 0 && rect.height > 0 &&
                    rect.right > 0 && rect.left < viewportWidth &&
                    rect.bottom > 0 && rect.top < viewportHeight
                ));
            if (!rects.length) return null;

            const left = Math.max(Math.floor(Math.min(...rects.map((rect) => rect.left))), 0);
            const top = Math.max(Math.floor(Math.min(...rects.map((rect) => rect.top))), 0);
            const right = Math.min(Math.ceil(Math.max(...rects.map((rect) => rect.right))), viewportWidth);
            const bottom = Math.min(Math.ceil(Math.max(...rects.map((rect) => rect.bottom))), viewportHeight);
            return {
                x: left,
                y: top,
                width: Math.max(right - left, 0),
                height: Math.max(bottom - top, 0),
            };
        }

        return {
            viewportWidth,
            viewportHeight,
            markedCount: document.querySelectorAll(`[${attributeName}]`).length,
            top: groupBounds('top'),
            bottom: groupBounds('bottom'),
        };
    }""", PERSISTENT_NAV_ATTRIBUTE)

    if not bounds.get("markedCount"):
        return _PersistentNavigationCapture()

    top_layer = None
    bottom_layer = None
    if bounds.get("top") or bounds.get("bottom"):
        viewport_bytes = await page.screenshot(full_page=False, scale="css")
        viewport_width = max(int(bounds.get("viewportWidth") or 0), 1)
        viewport_height = max(int(bounds.get("viewportHeight") or 0), 1)

        with Image.open(io.BytesIO(viewport_bytes)) as viewport_image:
            top_layer = _crop_screenshot_layer(
                viewport_image,
                bounds.get("top"),
                viewport_width,
                viewport_height,
            )
            bottom_layer = _crop_screenshot_layer(
                viewport_image,
                bounds.get("bottom"),
                viewport_width,
                viewport_height,
            )

    await page.evaluate("""async (attributeName) => {
        document.querySelectorAll(`[${attributeName}]`).forEach((element) => {
            element.style.setProperty('display', 'none', 'important');
        });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }""", PERSISTENT_NAV_ATTRIBUTE)
    return _PersistentNavigationCapture(top=top_layer, bottom=bottom_layer)


def _crop_screenshot_layer(
    viewport_image: Image.Image,
    bounds: Optional[Dict[str, Any]],
    viewport_width: int,
    viewport_height: int,
) -> Optional[_ScreenshotLayer]:
    if not bounds:
        return None

    x = max(int(bounds.get("x") or 0), 0)
    y = max(int(bounds.get("y") or 0), 0)
    width = max(int(bounds.get("width") or 0), 0)
    height = max(int(bounds.get("height") or 0), 0)
    if not width or not height:
        return None

    scale_x = viewport_image.width / viewport_width
    scale_y = viewport_image.height / viewport_height
    crop_box = (
        round(x * scale_x),
        round(y * scale_y),
        round((x + width) * scale_x),
        round((y + height) * scale_y),
    )
    layer_image = viewport_image.crop(crop_box)
    if layer_image.size != (width, height):
        layer_image = layer_image.resize((width, height), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    layer_image.save(buffer, format="PNG")
    return _ScreenshotLayer(
        image_bytes=buffer.getvalue(),
        x=x,
        y=y,
        width=width,
        height=height,
    )


async def _prepare_capture_page(page: Page, scan_range: Optional[ScanRange]) -> None:
    try:
        await page.evaluate("() => document.fonts?.ready || Promise.resolve()")
    except Exception:
        pass

    if not scan_range or scan_range.preset != "full":
        await page.evaluate("() => window.scrollTo(0, 0)")
        return

    try:
        await page.evaluate("""async () => {
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const pageHeight = () => Math.max(
                document.documentElement?.scrollHeight || 0,
                document.body?.scrollHeight || 0,
                window.innerHeight || 0
            );
            const viewportHeight = Math.max(window.innerHeight || 0, 1);
            let y = 0;
            let stableBottomPasses = 0;

            for (let step = 0; step < 60; step++) {
                const heightBefore = pageHeight();
                const bottom = Math.max(heightBefore - viewportHeight, 0);
                y = Math.min(y + Math.max(viewportHeight * 0.8, 320), bottom);
                window.scrollTo(0, y);
                await wait(80);

                const heightAfter = pageHeight();
                if (y >= bottom && heightAfter <= heightBefore) {
                    stableBottomPasses += 1;
                    if (stableBottomPasses >= 2) break;
                } else {
                    stableBottomPasses = 0;
                }
            }

            window.scrollTo(0, 0);
            await wait(300);
        }""")
        await page.wait_for_function(
            "() => Array.from(document.images).every((image) => image.complete)",
            timeout=3000,
        )
    except Exception:
        await page.evaluate("() => window.scrollTo(0, 0)")


async def _take_capture_screenshots(
    page: Page,
    scan_range: Optional[ScanRange],
    navigation_capture: Optional[_PersistentNavigationCapture] = None,
) -> Tuple[List[ScreenshotSegment], int, int, float]:
    vertical_range = await _resolve_scan_range(page, scan_range)
    if vertical_range:
        screenshot_id, width, height, screenshot_offset_y = await _take_screenshot(page, scan_range)
        segments = [ScreenshotSegment(
            screenshot_id=screenshot_id,
            offset_y=0,
            width=width,
            height=height,
        )]
        height = _apply_persistent_navigation_capture(
            segments,
            height,
            navigation_capture,
        )
        return segments, width, height, screenshot_offset_y

    metrics = await page.evaluate("""() => ({
        width: Math.max(
            document.documentElement.clientWidth || 0,
            window.innerWidth || 0
        ),
        height: Math.max(
            document.documentElement.scrollHeight || 0,
            document.body?.scrollHeight || 0,
            window.innerHeight || 0
        ),
        viewportHeight: window.innerHeight || document.documentElement.clientHeight || 0
    })""")
    page_width = max(math.ceil(float(metrics.get("width") or 0)), 1)
    page_height = max(math.ceil(float(metrics.get("height") or 0)), 1)
    viewport_height = max(math.ceil(float(metrics.get("viewportHeight") or 0)), 1)
    segment_height = viewport_height * 3

    if page_width > 500 or page_height <= segment_height:
        screenshot_id, width, height, _ = await _take_screenshot(page, scan_range)
        segments = [ScreenshotSegment(
            screenshot_id=screenshot_id,
            offset_y=0,
            width=width,
            height=height,
        )]
        height = _apply_persistent_navigation_capture(
            segments,
            height,
            navigation_capture,
        )
        return segments, width, height, 0.0

    os.makedirs(settings.screenshot_dir, exist_ok=True)
    segments: List[ScreenshotSegment] = []
    offset_y = 0
    cdp_session = await page.context.new_cdp_session(page)
    try:
        while offset_y < page_height:
            clip_height = min(segment_height, page_height - offset_y)
            screenshot_id = str(uuid.uuid4())
            path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
            await _capture_page_segment(
                cdp_session,
                path,
                x=0,
                y=offset_y,
                width=page_width,
                height=clip_height,
            )

            segments.append(ScreenshotSegment(
                screenshot_id=screenshot_id,
                offset_y=float(offset_y),
                width=page_width,
                height=clip_height,
            ))
            logger.info(
                "Screenshot segment saved: %s (%sx%s at y=%s)",
                screenshot_id,
                page_width,
                clip_height,
                offset_y,
            )
            offset_y += clip_height
    finally:
        await cdp_session.detach()

    total_width = segments[0].width
    total_height = sum(segment.height for segment in segments)
    total_height = _apply_persistent_navigation_capture(
        segments,
        total_height,
        navigation_capture,
    )
    return segments, total_width, total_height, 0.0


def _apply_persistent_navigation_capture(
    segments: List[ScreenshotSegment],
    total_height: int,
    navigation_capture: Optional[_PersistentNavigationCapture],
) -> int:
    if not segments or not navigation_capture:
        return total_height

    if navigation_capture.top:
        first_segment = segments[0]
        first_path = os.path.join(
            settings.screenshot_dir,
            f"{first_segment.screenshot_id}.png",
        )
        _overlay_screenshot_layer(
            first_path,
            navigation_capture.top,
            local_y=round(navigation_capture.top.y - first_segment.offset_y),
        )

    if navigation_capture.bottom:
        last_segment = segments[-1]
        last_path = os.path.join(
            settings.screenshot_dir,
            f"{last_segment.screenshot_id}.png",
        )
        appended_height = _append_screenshot_layer(
            last_path,
            navigation_capture.bottom,
        )
        if appended_height:
            segments[-1] = last_segment.model_copy(update={
                "height": last_segment.height + appended_height,
            })
            total_height += appended_height

    return total_height


def _overlay_screenshot_layer(path: str, layer: _ScreenshotLayer, local_y: int) -> None:
    with Image.open(path) as screenshot_image:
        composed = screenshot_image.copy()
    with Image.open(io.BytesIO(layer.image_bytes)) as layer_image:
        _paste_image(composed, layer_image, layer.x, local_y)
    composed.save(path, format="PNG")


def _append_screenshot_layer(path: str, layer: _ScreenshotLayer) -> int:
    with Image.open(path) as screenshot_image:
        source = screenshot_image.copy()

    composed = Image.new(source.mode, (source.width, source.height + layer.height))
    composed.paste(source, (0, 0))
    if source.height > 0:
        last_row = source.crop((0, source.height - 1, source.width, source.height))
        composed.paste(last_row.resize((source.width, layer.height)), (0, source.height))

    with Image.open(io.BytesIO(layer.image_bytes)) as layer_image:
        _paste_image(composed, layer_image, layer.x, source.height)
    composed.save(path, format="PNG")
    return layer.height


def _paste_image(base: Image.Image, overlay: Image.Image, x: int, y: int) -> None:
    left = max(x, 0)
    top = max(y, 0)
    right = min(x + overlay.width, base.width)
    bottom = min(y + overlay.height, base.height)
    if right <= left or bottom <= top:
        return

    cropped = overlay.crop((left - x, top - y, right - x, bottom - y))
    if "A" in cropped.getbands():
        base.paste(cropped, (left, top), cropped)
    else:
        base.paste(cropped, (left, top))


async def _capture_page_segment(
    cdp_session: CDPSession,
    path: str,
    x: int,
    y: int,
    width: int,
    height: int,
) -> None:
    result = await cdp_session.send("Page.captureScreenshot", {
        "format": "png",
        "fromSurface": True,
        "captureBeyondViewport": True,
        "clip": {
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "scale": 1,
        },
    })
    image_bytes = base64.b64decode(result["data"])
    with Image.open(io.BytesIO(image_bytes)) as image:
        if image.size != (width, height):
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(path, format="PNG")


async def _take_screenshot(
    page: Page,
    scan_range: Optional[ScanRange] = None,
) -> Tuple[str, int, int, float]:
    screenshot_id = str(uuid.uuid4())
    os.makedirs(settings.screenshot_dir, exist_ok=True)
    path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")

    clip = await _resolve_screenshot_clip(page, scan_range)
    if clip:
        await page.screenshot(path=path, clip=clip, scale="css")
        screenshot_offset_y = float(clip["y"])
    else:
        await page.screenshot(path=path, full_page=True, scale="css")
        screenshot_offset_y = 0.0

    with Image.open(path) as image:
        width, height = image.size

    logger.info(f"Screenshot saved: {screenshot_id} ({width}x{height})")
    return screenshot_id, width, height, screenshot_offset_y


async def _resolve_screenshot_clip(page: Page, scan_range: Optional[ScanRange]) -> Optional[Dict[str, float]]:
    vertical_range = await _resolve_scan_range(page, scan_range)
    if not vertical_range:
        return None

    metrics = await page.evaluate("""() => ({
        width: Math.max(
            document.documentElement.clientWidth || 0,
            window.innerWidth || 0
        ),
        height: Math.max(
            document.documentElement.scrollHeight || 0,
            document.body?.scrollHeight || 0,
            window.innerHeight || 0
        )
    })""")
    page_width = float(metrics.get("width") or 0)
    page_height = float(metrics.get("height") or 0)
    start_y, end_y = vertical_range
    start_y = max(0.0, min(start_y, max(page_height - 1, 0.0)))
    end_y = max(start_y + 1, min(end_y, page_height))

    return {
        "x": 0.0,
        "y": start_y,
        "width": max(page_width, 1.0),
        "height": max(end_y - start_y, 1.0),
    }


def _shift_elements_to_screenshot(
    elements: List[PageElement],
    offset_y: float,
    screenshot_height: int,
) -> List[PageElement]:
    for element in elements:
        if not element.bounding_box:
            continue

        box = element.bounding_box
        top = max(box.y - offset_y, 0.0)
        bottom = min(box.y + box.height - offset_y, float(screenshot_height))
        height = max(bottom - top, 0.0)
        element.bounding_box = BoundingBox(
            x=box.x,
            y=top,
            width=box.width,
            height=height,
        )
    return elements


async def discover_links(url: str, max_pages: int = 20) -> List[str]:
    """동일 도메인 내부 링크 수집 (depth 1)"""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    base_domain = f"{parsed.scheme}://{parsed.netloc}"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await _new_scan_page(browser, url)
            await page.goto(url, wait_until="load", timeout=60000)
            await page.wait_for_timeout(1500)

            hrefs = await page.evaluate("""() =>
                Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(h => h && !h.startsWith('javascript') && !h.startsWith('mailto'))
            """)
        finally:
            await browser.close()

    seen = {url}
    result = []
    for href in hrefs:
        normalized = _normalize_url(href, base_domain)
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
            if len(result) >= max_pages:
                break

    return result


async def discover_links_from_page(page: Page, url: str, max_pages: int = 20) -> List[str]:
    from urllib.parse import urlparse

    parsed = urlparse(url)
    base_domain = f"{parsed.scheme}://{parsed.netloc}"

    await _goto_scan_target(page, url)
    await page.wait_for_timeout(1500)

    hrefs = await page.evaluate("""() =>
        Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.href)
            .filter(h => h && !h.startsWith('javascript') && !h.startsWith('mailto'))
    """)

    return _filter_normalized_links(hrefs, url, base_domain, max_pages, exclude_auth_pages=True)


def _normalize_url(href: str, base_domain: str) -> Optional[str]:
    from urllib.parse import urlparse, urlunparse
    import re

    try:
        parsed = urlparse(href)
        if not href.startswith(base_domain):
            return None

        path = re.sub(r'/\d{5,}', '/{id}', parsed.path)
        normalized = urlunparse(parsed._replace(path=path, query='', fragment=''))
        return normalized
    except Exception:
        return None


def _filter_normalized_links(
    hrefs: List[str],
    url: str,
    base_domain: str,
    max_pages: int,
    exclude_auth_pages: bool = False,
) -> List[str]:
    seen = {url}
    result = []
    for href in hrefs:
        normalized = _normalize_url(href, base_domain)
        if exclude_auth_pages and normalized and _is_auth_related_url(normalized):
            continue

        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
            if len(result) >= max_pages:
                break

    return result


def _is_auth_related_url(url: str) -> bool:
    return _hddfs_is_auth_related_url(url)


def _is_auth_action_element(item: Dict[str, Any]) -> bool:
    return _hddfs_is_auth_action_element(item)
