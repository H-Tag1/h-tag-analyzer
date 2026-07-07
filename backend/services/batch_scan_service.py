import json
import logging
import os
from typing import AsyncGenerator, Optional

from playwright.async_api import async_playwright

from config import settings
from models.scan_request import ScanLoginCredentials
from models.page_scan_data import PageScanData
from services.page_scan_service import (
    collect_authenticated_page_data,
    collect_page_data,
    discover_links,
    discover_links_from_page,
    prepare_authenticated_scan_page,
)
from services.ai_analysis_service import analyze_page
from services.tracking_detection_service import (
    build_tracked_items_from_elements,
    filter_issues_by_tracked,
    merge_tracked_items,
)
from services.tracking_filter_service import (
    filter_datalayer_events,
    filter_elements_by_tracking_id,
    filter_network_tags,
    normalize_tracking_id,
)
from services.dismissed_issue_service import filter_dismissed_issues
from services.scan_history_service import save_scan_history

logger = logging.getLogger(__name__)
AUTH_RESULT_EVENTS = {"login", "logout", "sign_up"}
AUTH_RESULT_TEXTS = {"로그인", "로그아웃", "회원가입"}


async def batch_scan(
    url: str,
    login: Optional[ScanLoginCredentials] = None,
    tracking_id: str = "G-1NWKV3S1TW",
) -> AsyncGenerator[str, None]:
    yield json.dumps({"type": "scan_start", "url": url, "mode": "batch"})

    if login and login.enabled:
        async for event in _authenticated_batch_scan(url, login, tracking_id):
            yield event
        return

    discovered = await discover_links(url, max_pages=20)
    all_urls = [url] + discovered

    yield json.dumps({"type": "pages_discovered", "urls": all_urls, "total": len(all_urls)})

    pages = []
    for idx, page_url in enumerate(all_urls):
        yield json.dumps({"type": "page_start", "url": page_url, "index": idx + 1, "total": len(all_urls)})

        try:
            page_data = await _scan_single(page_url, tracking_id)
            yield json.dumps({"type": "page_complete", "url": page_url, "index": idx + 1, "data": page_data.model_dump()})
            pages.append(page_data.model_dump())
        except Exception as e:
            logger.error(f"Failed to scan {page_url}: {e}")
            yield json.dumps({"type": "page_error", "url": page_url, "message": str(e)})

    yield json.dumps({"type": "batch_complete", "pages": pages, "history_id": _persist_batch_history(url, pages, tracking_id)})


async def single_scan(
    url: str,
    login: Optional[ScanLoginCredentials] = None,
    tracking_id: str = "G-1NWKV3S1TW",
) -> AsyncGenerator[str, None]:
    yield json.dumps({"type": "scan_start", "url": url, "mode": "single"})

    target_tracking_id = normalize_tracking_id(tracking_id)
    screenshot_id, width, height, elements, datalayer, network_tags = await collect_page_data(url, login)
    elements, datalayer, network_tags = _apply_tracking_id_filter(
        elements, datalayer, network_tags, target_tracking_id
    )

    yield json.dumps({"type": "screenshot_done", "screenshotId": screenshot_id, "width": width, "height": height})
    yield json.dumps({"type": "elements_collected", "count": len(elements)})
    yield json.dumps({"type": "ai_analyzing"})

    screenshot_path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    analysis = await analyze_page(screenshot_path, elements, datalayer, target_tracking_id)
    code_tracked = build_tracked_items_from_elements(elements)
    tracked_items = merge_tracked_items(code_tracked, analysis.tracked_items)
    issues = filter_issues_by_tracked(analysis.issues, tracked_items)
    if login and login.enabled:
        issues = _exclude_auth_results(issues)
        tracked_items = _exclude_auth_tracked(tracked_items)
    issues = filter_dismissed_issues(issues, url)

    page_data = PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        tracking_id=target_tracking_id,
        datalayer_events=datalayer,
        issues=issues,
        tracked_items=tracked_items,
        network_tags=network_tags,
    )

    yield json.dumps({
        "type": "scan_complete",
        "data": page_data.model_dump(),
        "history_id": save_scan_history(
            url=url,
            mode="single",
            full_scan=False,
            tracking_id=target_tracking_id,
            pages=[page_data],
        ).id,
    })


async def _scan_single(url: str, tracking_id: str = "G-1NWKV3S1TW") -> PageScanData:
    target_tracking_id = normalize_tracking_id(tracking_id)
    screenshot_id, width, height, elements, datalayer, network_tags = await collect_page_data(url)
    elements, datalayer, network_tags = _apply_tracking_id_filter(
        elements, datalayer, network_tags, target_tracking_id
    )
    screenshot_path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    analysis = await analyze_page(screenshot_path, elements, datalayer, target_tracking_id)
    code_tracked = build_tracked_items_from_elements(elements)
    tracked_items = merge_tracked_items(code_tracked, analysis.tracked_items)
    issues = filter_issues_by_tracked(analysis.issues, tracked_items)
    issues = filter_dismissed_issues(issues, url)
    return PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        tracking_id=target_tracking_id,
        datalayer_events=datalayer,
        issues=issues,
        tracked_items=tracked_items,
        network_tags=network_tags,
    )


async def _authenticated_batch_scan(
    url: str,
    login: ScanLoginCredentials,
    tracking_id: str = "G-1NWKV3S1TW",
) -> AsyncGenerator[str, None]:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await prepare_authenticated_scan_page(browser, url, login)
            discovered = await discover_links_from_page(page, url, max_pages=20)
            all_urls = [url] + discovered

            yield json.dumps({"type": "pages_discovered", "urls": all_urls, "total": len(all_urls)})

            pages = []
            for idx, page_url in enumerate(all_urls):
                yield json.dumps({"type": "page_start", "url": page_url, "index": idx + 1, "total": len(all_urls)})

                try:
                    page_data = await _scan_authenticated_single(page, page_url, tracking_id)
                    yield json.dumps({
                        "type": "page_complete",
                        "url": page_url,
                        "index": idx + 1,
                        "data": page_data.model_dump(),
                    })
                    pages.append(page_data.model_dump())
                except Exception as e:
                    logger.error(f"Failed to scan {page_url}: {e}")
                    yield json.dumps({"type": "page_error", "url": page_url, "message": str(e)})

            yield json.dumps({"type": "batch_complete", "pages": pages, "history_id": _persist_batch_history(url, pages, tracking_id)})
        finally:
            await browser.close()


async def _scan_authenticated_single(page, url: str, tracking_id: str = "G-1NWKV3S1TW") -> PageScanData:
    target_tracking_id = normalize_tracking_id(tracking_id)
    screenshot_id, width, height, elements, datalayer, network_tags = await collect_authenticated_page_data(page, url)
    elements, datalayer, network_tags = _apply_tracking_id_filter(
        elements, datalayer, network_tags, target_tracking_id
    )
    screenshot_path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    analysis = await analyze_page(screenshot_path, elements, datalayer, target_tracking_id)
    code_tracked = build_tracked_items_from_elements(elements)
    tracked_items = merge_tracked_items(code_tracked, analysis.tracked_items)
    issues = filter_issues_by_tracked(analysis.issues, tracked_items)
    issues = _exclude_auth_results(issues)
    tracked_items = _exclude_auth_tracked(tracked_items)
    issues = filter_dismissed_issues(issues, url)
    return PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        tracking_id=target_tracking_id,
        datalayer_events=datalayer,
        issues=issues,
        tracked_items=tracked_items,
        network_tags=network_tags,
    )


def _apply_tracking_id_filter(elements, datalayer, network_tags, tracking_id):
    return (
        filter_elements_by_tracking_id(elements, tracking_id),
        filter_datalayer_events(datalayer, tracking_id),
        filter_network_tags(network_tags, tracking_id),
    )


def _exclude_auth_results(issues):
    return [
        issue
        for issue in issues
        if not _is_auth_result(issue)
    ]


def _exclude_auth_tracked(tracked_items):
    return [
        item
        for item in tracked_items
        if not _is_auth_tracked(item)
    ]


def _is_auth_tracked(item) -> bool:
    event_name = item.tracking_data.get("event") if isinstance(item.tracking_data, dict) else None
    text = (item.element_text or "").strip()
    selector = (item.element_selector or "").strip()

    if event_name in AUTH_RESULT_EVENTS:
        return True
    if text in AUTH_RESULT_TEXTS:
        return True
    return selector == "#loginBtn" or "menu_login_join" in selector


def _is_auth_result(issue) -> bool:
    event_name = issue.recommended_ga_spec.get("event") if isinstance(issue.recommended_ga_spec, dict) else None
    text = (issue.element_text or "").strip()
    selector = (issue.element_selector or "").strip()

    if event_name in AUTH_RESULT_EVENTS:
        return True
    if text in AUTH_RESULT_TEXTS:
        return True
    return selector == "#loginBtn" or "menu_login_join" in selector
