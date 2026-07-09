import asyncio
import uuid
import os
import logging
from typing import List, Dict, Any, Tuple, Optional
from urllib.parse import quote, urlparse, urlunparse

from PIL import Image
from playwright.async_api import Browser, Error as PlaywrightError, Page, TimeoutError as PlaywrightTimeoutError, async_playwright

from services.tracking_detection_service import (
    apply_click_tracking_detection,
    apply_static_tracking_detection,
    parse_static_signals,
)
from services.network_tag_service import NetworkTagCollector
from config import settings
from models.page_element import PageElement
from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.scan_request import ScanLoginCredentials

logger = logging.getLogger(__name__)

MOBILE_HOSTS = {"m.hddfs.com", "mcn.hd-dfs.com", "men.hddfs.com"}
MOBILE_USER_AGENT = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
    "Mobile/15E148 Safari/604.1"
)
AUTH_EXCLUDED_PATH_PARTS = ("/mm/mbshAuca/", "/mm/mbshJoin/")
AUTH_EXCLUDED_TEXTS = {"로그인", "로그아웃", "회원가입"}


async def collect_page_data(
    url: str,
    login: Optional[ScanLoginCredentials] = None,
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

            elements = await _collect_elements(page, exclude_auth_actions=bool(login and login.enabled))
            datalayer = await _collect_datalayer(page)
            screenshot_id, width, height = await _take_screenshot(page)
            elements = apply_static_tracking_detection(elements)
            collector.set_trigger("click")
            elements = await apply_click_tracking_detection(page, elements, url, collector)
            network_tags = collector.get_hits()

            return screenshot_id, width, height, elements, datalayer, network_tags
        finally:
            if collector:
                await collector.stop()
            await browser.close()


async def collect_authenticated_page_data(
    page: Page,
    url: str,
) -> Tuple[str, int, int, List[PageElement], List[Dict[str, Any]], List[NetworkTagHit]]:
    collector = NetworkTagCollector(page)
    await collector.start()
    try:
        await _goto_scan_target(page, url)
        await page.wait_for_timeout(1500)
        collector.reset()

        elements = await _collect_elements(page, exclude_auth_actions=True)
        datalayer = await _collect_datalayer(page)
        screenshot_id, width, height = await _take_screenshot(page)
        elements = apply_static_tracking_detection(elements)
        collector.set_trigger("click")
        elements = await apply_click_tracking_detection(page, elements, url, collector)
        network_tags = collector.get_hits()

        return screenshot_id, width, height, elements, datalayer, network_tags
    finally:
        await collector.stop()


async def prepare_authenticated_scan_page(browser: Browser, url: str, login: ScanLoginCredentials) -> Page:
    page = await _new_scan_page(browser, url)
    await _login_hddfs(page, url, login)
    return page


async def _collect_elements(page: Page, exclude_auth_actions: bool = False) -> List[PageElement]:
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

    await page.screenshot(path=path, full_page=True, scale="css")

    with Image.open(path) as image:
        width, height = image.size

    logger.info(f"Screenshot saved: {screenshot_id} ({width}x{height})")
    return screenshot_id, width, height


async def _new_scan_page(browser: Browser, url: str) -> Page:
    if _is_mobile_url(url):
        return await browser.new_page(
            viewport={"width": 390, "height": 844},
            user_agent=MOBILE_USER_AGENT,
            is_mobile=True,
            has_touch=True,
            device_scale_factor=3,
        )

    return await browser.new_page(viewport={"width": 1440, "height": 900})


async def _login_hddfs(page: Page, target_url: str, login: ScanLoginCredentials) -> None:
    if _is_mobile_url(target_url):
        await _login_hddfs_mobile(page, target_url, login)
    else:
        await _login_hddfs_pc(page, target_url, login)

    await _ensure_target_page(page, target_url)

    if not await _is_logged_in(page):
        raise RuntimeError("로그인에 실패했습니다. ID/PW 또는 추가 인증 필요 여부를 확인해주세요.")


async def _login_hddfs_pc(page: Page, target_url: str, login: ScanLoginCredentials) -> None:
    page.on("dialog", _accept_dialog)
    await page.goto(target_url, wait_until="load", timeout=60000)
    await page.wait_for_timeout(1000)

    login_page = await _open_pc_login_page(page, target_url)

    login_page.on("dialog", _accept_dialog)
    await _submit_login_form(login_page, login)

    if login_page is not page:
        try:
            await login_page.wait_for_event("close", timeout=15000)
        except PlaywrightTimeoutError:
            await _raise_login_error(login_page)

    try:
        await page.wait_for_load_state("load", timeout=15000)
    except PlaywrightTimeoutError:
        pass


async def _open_pc_login_page(page: Page, target_url: str) -> Page:
    has_login_function = await page.evaluate("() => typeof login === 'function'")
    if has_login_function:
        try:
            async with page.expect_popup(timeout=10000) as popup_info:
                await page.evaluate("(url) => login(url)", target_url)
            return await popup_info.value
        except (PlaywrightError, PlaywrightTimeoutError):
            pass

    await page.goto(_login_url_for(target_url), wait_until="load", timeout=60000)
    return page


async def _login_hddfs_mobile(page: Page, target_url: str, login: ScanLoginCredentials) -> None:
    page.on("dialog", _accept_dialog)
    await page.goto(_login_url_for(target_url), wait_until="load", timeout=60000)
    await _submit_login_form(page, login)

    try:
        await page.wait_for_load_state("load", timeout=15000)
    except PlaywrightTimeoutError:
        pass

    await page.wait_for_timeout(1000)
    if "mbshAuca/addLgin" in page.url:
        await _raise_login_error(page)


async def _submit_login_form(page: Page, login: ScanLoginCredentials) -> None:
    if login.memberType == "simple":
        form = "#frmGeneLgin"
        user_selector = f"{form} #mbshId"
        password_selector = f"{form} #mbshPwd"
        button_selector = f"{form} #btnLgin2, {form} #btnLgin"
    else:
        form = "#frmIntgLgin"
        user_selector = f"{form} #custId"
        password_selector = f"{form} #custPwd"
        button_selector = f"{form} #btnLgin1, {form} #btnLgin"

    await page.wait_for_selector(user_selector, timeout=15000)
    await page.fill(user_selector, login.username.strip())
    await page.fill(password_selector, login.password)
    await page.locator(button_selector).first.click()


async def _is_logged_in(page: Page) -> bool:
    try:
        result = await page.evaluate("() => typeof isLogin !== 'undefined' ? Boolean(isLogin) : false")
        if result:
            return True
    except Exception:
        pass

    try:
        return await page.locator("text=로그아웃").count() > 0
    except Exception:
        return False


async def _raise_login_error(page: Page) -> None:
    for selector in ("#frmIntgLgin #pError", "#frmGeneLgin #pError", ".t_error2", ".t_error"):
        try:
            text = (await page.locator(selector).first.text_content(timeout=1000) or "").strip()
            if text:
                raise RuntimeError(text)
        except PlaywrightTimeoutError:
            continue

    raise RuntimeError("로그인에 실패했습니다. ID/PW 또는 추가 인증 필요 여부를 확인해주세요.")


def _login_url_for(target_url: str) -> str:
    parsed = urlparse(target_url)
    base = urlunparse((parsed.scheme or "https", parsed.netloc, "", "", "", ""))
    return f"{base}/shop/mm/mbshAuca/addLgin.do?redirectUrl={quote(target_url, safe='')}"


async def _ensure_target_page(page: Page, target_url: str) -> None:
    try:
        await page.wait_for_load_state("load", timeout=10000)
    except PlaywrightTimeoutError:
        pass

    await page.wait_for_timeout(1000)

    if "mbshAuca/addLgin" in page.url:
        await _raise_login_error(page)

    if _same_host(page.url, target_url) and "mbshAuca/addLgin" not in page.url:
        return

    try:
        await page.goto(target_url, wait_until="load", timeout=60000)
    except PlaywrightError as e:
        if "interrupted by another navigation" not in str(e):
            raise
        try:
            await page.wait_for_load_state("load", timeout=15000)
        except PlaywrightTimeoutError:
            pass

    await page.wait_for_timeout(1000)


async def _goto_scan_target(page: Page, url: str) -> None:
    if page.url == url:
        return

    try:
        await page.goto(url, wait_until="load", timeout=60000)
    except PlaywrightError as e:
        if "interrupted by another navigation" not in str(e):
            raise
        try:
            await page.wait_for_load_state("load", timeout=15000)
        except PlaywrightTimeoutError:
            pass

    await page.wait_for_timeout(1000)


def _same_host(current_url: str, target_url: str) -> bool:
    try:
        return (urlparse(current_url).hostname or "").lower() == (urlparse(target_url).hostname or "").lower()
    except Exception:
        return False


def _accept_dialog(dialog) -> None:
    asyncio.create_task(dialog.accept())


def _is_mobile_url(url: str) -> bool:
    from urllib.parse import urlparse

    try:
        host = (urlparse(url).hostname or "").lower()
        return host in MOBILE_HOSTS
    except Exception:
        return False


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
    try:
        path = urlparse(url).path
        return any(part in path for part in AUTH_EXCLUDED_PATH_PARTS)
    except Exception:
        return False


def _is_auth_action_element(item: Dict[str, Any]) -> bool:
    text = (item.get("text") or "").strip()
    selector = (item.get("selector") or "").strip()

    if text in AUTH_EXCLUDED_TEXTS:
        return True

    return selector == "#loginBtn" or "menu_login_join" in selector
