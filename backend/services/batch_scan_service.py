import json
import logging
import os
from typing import AsyncGenerator, Optional

from config import settings
from models.scan_request import ScanLoginCredentials
from models.page_scan_data import PageScanData
from services.page_scan_service import collect_page_data, discover_links
from services.ai_analysis_service import analyze_page

logger = logging.getLogger(__name__)


async def batch_scan(url: str, login: Optional[ScanLoginCredentials] = None) -> AsyncGenerator[str, None]:
    yield json.dumps({"type": "scan_start", "url": url, "mode": "batch"})

    if login and login.enabled:
        yield json.dumps({"type": "error", "message": "로그인 후 검사는 단일 URL 검사만 지원합니다."})
        return

    discovered = await discover_links(url, max_pages=20)
    all_urls = [url] + discovered

    yield json.dumps({"type": "pages_discovered", "urls": all_urls, "total": len(all_urls)})

    pages = []
    for idx, page_url in enumerate(all_urls):
        yield json.dumps({"type": "page_start", "url": page_url, "index": idx + 1, "total": len(all_urls)})

        try:
            page_data = await _scan_single(page_url)
            yield json.dumps({"type": "page_complete", "url": page_url, "index": idx + 1, "data": page_data.model_dump()})
            pages.append(page_data.model_dump())
        except Exception as e:
            logger.error(f"Failed to scan {page_url}: {e}")
            yield json.dumps({"type": "page_error", "url": page_url, "message": str(e)})

    yield json.dumps({"type": "batch_complete", "pages": pages})


async def single_scan(url: str, login: Optional[ScanLoginCredentials] = None) -> AsyncGenerator[str, None]:
    yield json.dumps({"type": "scan_start", "url": url, "mode": "single"})

    screenshot_id, width, height, elements, datalayer = await collect_page_data(url, login)

    yield json.dumps({"type": "screenshot_done", "screenshotId": screenshot_id, "width": width, "height": height})
    yield json.dumps({"type": "elements_collected", "count": len(elements)})
    yield json.dumps({"type": "ai_analyzing"})

    screenshot_path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    issues = await analyze_page(screenshot_path, elements, datalayer)

    page_data = PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        datalayer_events=datalayer,
        issues=issues,
    )

    yield json.dumps({"type": "scan_complete", "data": page_data.model_dump()})


async def _scan_single(url: str) -> PageScanData:
    screenshot_id, width, height, elements, datalayer = await collect_page_data(url)
    screenshot_path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    issues = await analyze_page(screenshot_path, elements, datalayer)
    return PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        datalayer_events=datalayer,
        issues=issues,
    )
