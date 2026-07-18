import logging
from typing import List

from models.page_element import PageElement

logger = logging.getLogger(__name__)

HAMBURGER_DRAWER_EXCLUSION_REASON = (
    "햄버거 메뉴 내부 항목으로, 햄버거 버튼 클릭만 검증하고 드로어 항목은 분석 대상에서 제외합니다"
)

CLOSE_HAMBURGER_DRAWER_JS = """
function closeHamburgerDrawerIfOpen() {
    const drawer = document.querySelector('.navication');
    if (!drawer) return false;

    const rect = drawer.getBoundingClientRect();
    const style = window.getComputedStyle(drawer);
    const visible = (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity || '1') > 0
    );
    if (!visible) return false;

    const toggle = document.querySelector('.area-gnb .wrap-gnb-logo .btn_gnb, .btn_gnb');
    if (toggle) {
        toggle.click();
        return true;
    }
    return false;
}
"""

HAMBURGER_MENU_FILTER_JS = """
function isHamburgerToggle(el) {
    if (!el) return false;

    try {
        if (el.matches('.btn_gnb, .area-gnb .wrap-gnb-logo .btn_gnb')) {
            return true;
        }
    } catch (_error) {}

    const onclick = (el.getAttribute('onclick') || '').toLowerCase();
    if (onclick.includes('callsidemenulayer') || onclick.includes('callsidemenu')) {
        return true;
    }

    const headerScope = el.closest('.area-gnb .wrap-gnb-logo, .header h1, .header .header_top');
    if (!headerScope) return false;

    const hint = [
        el.getAttribute('aria-label') || '',
        el.title || '',
        String(el.className || ''),
        el.innerText || '',
    ].join(' ').replace(/\\s/g, '');

    return /햄버거|navigationdrawer|navigation|메뉴/i.test(hint);
}

function isInsideHamburgerDrawer(el) {
    if (!el || isHamburgerToggle(el)) return false;

    const drawerSelectors = [
        '.navication',
        '.gnb-category__inner',
        '.gnb-category__content',
    ];

    for (const selector of drawerSelectors) {
        try {
            if (el.closest(selector)) return true;
        } catch (_error) {}
    }
    return false;
}
"""


def is_hamburger_drawer_element(element: PageElement) -> bool:
    return bool(getattr(element, "in_hamburger_drawer", False))


def filter_out_hamburger_drawer_elements(elements: List[PageElement]) -> List[PageElement]:
    filtered = [element for element in elements if not is_hamburger_drawer_element(element)]
    removed = len(elements) - len(filtered)
    if removed:
        logger.info("Excluded %d hamburger drawer element(s) from scan results", removed)
    return filtered


async def close_hamburger_drawer_if_open(page) -> bool:
    try:
        return bool(await page.evaluate(CLOSE_HAMBURGER_DRAWER_JS + "closeHamburgerDrawerIfOpen();"))
    except Exception:
        return False
