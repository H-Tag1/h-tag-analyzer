import json
import logging
from typing import AsyncGenerator, List, Optional

from playwright.async_api import async_playwright

from config import settings
from models.page_scan_data import PageScanData
from models.scan_request import ScanLoginCredentials
from services.page_scan_service import (
    collect_authenticated_page_data,
    collect_page_data,
    discover_links,
    discover_links_from_page,
    prepare_authenticated_scan_page,
)
from services.tracking_filter_service import (
    filter_datalayer_events,
    filter_elements_by_tracking_id,
    filter_network_tags,
    normalize_tracking_id,
)
from services.dismissed_issue_service import filter_dismissed_issues
from services.scan_history_service import save_scan_history
from services.tag_classification_service import classify_network_tags

logger = logging.getLogger(__name__)


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

    page_data = _assemble_page_data(
        url=url,
        screenshot_id=screenshot_id,
        width=width,
        height=height,
        elements=elements,
        datalayer=datalayer,
        network_tags=network_tags,
        tracking_id=target_tracking_id,
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
    return _assemble_page_data(
        url=url,
        screenshot_id=screenshot_id,
        width=width,
        height=height,
        elements=elements,
        datalayer=datalayer,
        network_tags=network_tags,
        tracking_id=target_tracking_id,
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
    return _assemble_page_data(
        url=url,
        screenshot_id=screenshot_id,
        width=width,
        height=height,
        elements=elements,
        datalayer=datalayer,
        network_tags=network_tags,
        tracking_id=target_tracking_id,
    )


def _assemble_page_data(
    url: str,
    screenshot_id: str,
    width: int,
    height: int,
    elements: List,
    datalayer: list,
    network_tags: list,
    tracking_id: str,
) -> PageScanData:
    tracked_items, issues = classify_network_tags(network_tags, elements)
    issues = filter_dismissed_issues(issues, url)

    return PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        tracking_id=tracking_id,
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


def _persist_batch_history(url: str, pages: list, tracking_id: str) -> str:
    page_models = [PageScanData(**page) for page in pages]
    record = save_scan_history(
        url=url,
        mode="batch",
        full_scan=True,
        tracking_id=tracking_id,
        pages=page_models,
    )
    return record.id
