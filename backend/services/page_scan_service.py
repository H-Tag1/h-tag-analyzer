import uuid
import os
import logging
from typing import Awaitable, Callable, List, Dict, Any, Tuple, Optional
from urllib.parse import urlparse, urlunparse

from PIL import Image
from playwright.async_api import Browser, Page, async_playwright

from services.tracking_detection_service import (
    apply_click_tracking_detection,
    apply_static_tracking_detection,
    parse_static_signals,
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

logger = logging.getLogger(__name__)
ProgressReporter = Callable[[Dict[str, Any]], Awaitable[None]]


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
    elements = await _collect_elements(
        page,
        exclude_auth_actions=exclude_auth_actions,
        scan_range=scan_range,
    )
    await _report_progress(progress, {"type": "elements_collected", "count": len(elements)})
    datalayer = await _collect_datalayer(page)
    elements = apply_static_tracking_detection(elements)
    collector.set_trigger("click")
    elements = await apply_click_tracking_detection(page, elements, page_url, collector)
    screenshot_id, width, height, screenshot_offset_y = await _take_screenshot(page, scan_range)
    await _report_progress(progress, {
        "type": "screenshot_done",
        "screenshotId": screenshot_id,
        "width": width,
        "height": height,
    })
    elements = _shift_elements_to_screenshot(elements, screenshot_offset_y, height)
    network_tags = collector.get_hits()

    return screenshot_id, width, height, elements, datalayer, network_tags


async def _report_progress(progress: Optional[ProgressReporter], event: Dict[str, Any]) -> None:
    if progress:
        await progress(event)


async def _collect_elements(
    page: Page,
    exclude_auth_actions: bool = False,
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
                    bounding_box: {
                        x: rect.x + scrollX,
                        y: rect.y + scrollY,
                        width: rect.width,
                        height: rect.height,
                    },
                    static_tracking_signals: staticTrackingSignals,
                    has_ga_tag: staticTrackingSignals.length > 0,
                };
            })
            .slice(0, 500);
    }""")

    elements = []
    for item in raw:
        if exclude_auth_actions and _is_auth_action_element(item):
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
