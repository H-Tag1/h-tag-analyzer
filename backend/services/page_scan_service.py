import uuid
import os
import logging
from typing import List, Dict, Any, Tuple, Optional

from PIL import Image
from playwright.async_api import async_playwright, Page

from config import settings
from models.page_element import PageElement
from models.bounding_box import BoundingBox

logger = logging.getLogger(__name__)


async def collect_page_data(url: str) -> Tuple[str, int, int, List[PageElement], List[Dict[str, Any]]]:
    """
    Returns: (screenshot_id, width, height, elements, datalayer_events)
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page(viewport={"width": 1440, "height": 900})
            await page.goto(url, wait_until="load", timeout=60000)
            await page.wait_for_timeout(1500)

            elements = await _collect_elements(page)
            datalayer = await _collect_datalayer(page)
            screenshot_id, width, height = await _take_screenshot(page)

            return screenshot_id, width, height, elements, datalayer
        finally:
            await browser.close()


async def _collect_elements(page: Page) -> List[PageElement]:
    raw = await page.evaluate("""() => {
        return Array.from(document.querySelectorAll('button, a, [onclick], input[type="submit"], input[type="button"]'))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && rect.top >= 0;
            })
            .map(el => {
                let selector = el.tagName.toLowerCase();
                if (el.id) selector = '#' + el.id;
                else if (el.className && typeof el.className === 'string') {
                    const cls = el.className.trim().split(/\\s+/)[0];
                    if (cls) selector = el.tagName.toLowerCase() + '.' + cls;
                }
                const rect = el.getBoundingClientRect();
                return {
                    selector,
                    text: (el.innerText || el.value || el.title || '').trim().slice(0, 120),
                    element_type: el.tagName.toLowerCase(),
                    bounding_box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                    has_ga_tag: false
                };
            })
            .slice(0, 200);
    }""")

    elements = []
    for item in raw:
        bb_data = item.get("bounding_box", {})
        elements.append(PageElement(
            selector=item["selector"],
            text=item.get("text") or None,
            element_type=item["element_type"],
            bounding_box=BoundingBox(**bb_data) if bb_data else None,
            has_ga_tag=item.get("has_ga_tag", False),
        ))
    return elements


async def _collect_datalayer(page: Page) -> List[Dict[str, Any]]:
    try:
        result = await page.evaluate("() => JSON.parse(JSON.stringify(window.dataLayer || []))")
        return result if isinstance(result, list) else []
    except Exception:
        return []


async def _take_screenshot(page: Page) -> Tuple[str, int, int]:
    screenshot_id = str(uuid.uuid4())
    os.makedirs(settings.screenshot_dir, exist_ok=True)
    path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")

    await page.screenshot(path=path, full_page=True)

    with Image.open(path) as image:
        width, height = image.size

    logger.info(f"Screenshot saved: {screenshot_id} ({width}x{height})")
    return screenshot_id, width, height


async def discover_links(url: str, max_pages: int = 20) -> List[str]:
    """동일 도메인 내부 링크 수집 (depth 1)"""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    base_domain = f"{parsed.scheme}://{parsed.netloc}"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page(viewport={"width": 1440, "height": 900})
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
