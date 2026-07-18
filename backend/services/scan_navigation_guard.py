import logging
from typing import Optional, Set
from urllib.parse import urlparse, urlunparse

from playwright.async_api import Page, Request

logger = logging.getLogger(__name__)

NAVIGATION_LOCK_INIT_SCRIPT = """
(() => {
    if (window.__H_TAG_NAV_LOCK_INSTALLED__) {
        return;
    }
    window.__H_TAG_NAV_LOCK_INSTALLED__ = true;

    window.addEventListener('beforeunload', (event) => {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }, true);

    document.addEventListener('click', (event) => {
        const anchor = event.target && event.target.closest
            ? event.target.closest('a[href]')
            : null;
        if (!anchor) {
            return;
        }

        const href = (anchor.getAttribute('href') || '').trim();
        if (!href || href.startsWith('#') || href.toLowerCase().startsWith('javascript:')) {
            return;
        }

        // preventDefault로 href 이동만 막고 stopPropagation은 걸지 않는다.
        // stopPropagation을 걸면 사이트의 GA 클릭 핸들러(이벤트 위임)까지 차단되어
        // 링크의 GA 이벤트가 발생하지 않는다. JS 기반 이동은 네트워크 라우트 가드가 차단한다.
        event.preventDefault();
    }, true);

    document.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
    }, true);
})();
"""

EMPTY_DOCUMENT_HTML = "<!DOCTYPE html><html><head></head><body></body></html>"


def normalize_document_url(url: str) -> str:
    normalized = (url or "").strip()
    if not normalized:
        return ""

    parsed = urlparse(normalized)
    scheme = (parsed.scheme or "https").lower()
    host = (parsed.hostname or "").lower()
    if not host:
        return normalized

    path = parsed.path or "/"
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")

    return urlunparse((scheme, host, path, "", "", ""))


def should_block_document_navigation(
    request: Request,
    allowed_document_urls: Set[str],
    navigation_lock_enabled: bool,
) -> bool:
    if not navigation_lock_enabled:
        return False
    if request.resource_type != "document":
        return False

    request_url = normalize_document_url(request.url)
    if not request_url:
        return False

    normalized_allowed = {
        normalize_document_url(value)
        for value in allowed_document_urls
        if value
    }
    return request_url not in normalized_allowed


async def install_scan_navigation_guard(page: Page) -> None:
    await page.add_init_script(NAVIGATION_LOCK_INIT_SCRIPT)
    await page.evaluate(NAVIGATION_LOCK_INIT_SCRIPT)
    logger.info("Installed scan navigation guard script on page")


async def fulfill_blocked_document(route) -> None:
    try:
        await route.abort()
    except Exception:
        await route.fulfill(
            status=200,
            body=EMPTY_DOCUMENT_HTML,
            content_type="text/html; charset=utf-8",
        )
