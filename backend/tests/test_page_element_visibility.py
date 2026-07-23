import asyncio

from playwright.async_api import async_playwright

from services.page_scan_service import _collect_elements


def test_occluded_target_without_visible_twin_is_excluded():
    async def collect_selectors():
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            try:
                page = await browser.new_page(viewport={"width": 800, "height": 600})
                await page.set_content(
                    """
                    <style>
                      #ghost, #visible, #cover {
                        position: absolute;
                        width: 100px;
                        height: 40px;
                      }
                      #ghost { left: 100px; top: 100px; }
                      #cover { left: 100px; top: 100px; z-index: 2; }
                      #visible { left: 300px; top: 100px; }
                    </style>
                    <a id="ghost" href="#">검색</a>
                    <div id="cover"></div>
                    <button id="visible">검색 실행</button>
                    """
                )
                return {element.selector for element in await _collect_elements(page)}
            finally:
                await browser.close()

    selectors = asyncio.run(collect_selectors())

    assert "#ghost" not in selectors
    assert "#visible" in selectors
