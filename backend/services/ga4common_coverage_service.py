import logging
import re
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Dict, List, Optional, Tuple

from playwright.async_api import Page

from models.ai_analysis_item import AiAnalysisItem
from models.bounding_box import BoundingBox
from models.excluded_analysis_item import ExcludedAnalysisItem
from models.page_element import PageElement
from services.ga4_channel_service import Ga4Channel, load_ga4common_template, resolve_channel_or_none

logger = logging.getLogger(__name__)

CLICK_HANDLER_PATTERN = re.compile(
    r'\$\(document\)\.on\(\s*"click"\s*,\s*"([^"]+)"',
    re.MULTILINE,
)
PAGE_BLOCK_PATTERN = re.compile(
    r'if\s*\(\s*\$\("#container"\)\.find\("([^"]+)"\)\.length\s*>\s*0\s*\)\s*\{',
    re.MULTILINE,
)

DEFAULT_EXCLUSION_REASON = "ga4Common.js에 해당 요소의 클릭 핸들러가 정의되어 있지 않습니다"

ELEMENT_QUERY_JS = """
Array.from(document.querySelectorAll('button, a, [onclick], input[type="submit"], input[type="button"]'))
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
"""


@dataclass(frozen=True)
class Ga4CommonPageBlock:
    container_marker: str
    click_selectors: Tuple[str, ...]


@dataclass(frozen=True)
class Ga4CommonClickSpec:
    global_click_selectors: Tuple[str, ...]
    page_blocks: Tuple[Ga4CommonPageBlock, ...] = field(default_factory=tuple)


def _find_matching_brace_end(content: str, open_brace_index: int) -> int:
    depth = 0
    for index in range(open_brace_index, len(content)):
        char = content[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
    return len(content) - 1


def parse_ga4common_click_spec(template_content: str) -> Ga4CommonClickSpec:
    page_blocks: List[Ga4CommonPageBlock] = []
    blocked_ranges: List[Tuple[int, int]] = []

    for match in PAGE_BLOCK_PATTERN.finditer(template_content):
        open_brace = match.end() - 1
        close_brace = _find_matching_brace_end(template_content, open_brace)
        blocked_ranges.append((match.start(), close_brace))
        block_text = template_content[open_brace:close_brace + 1]
        selectors = tuple(
            dict.fromkeys(
                handler_match.group(1).strip()
                for handler_match in CLICK_HANDLER_PATTERN.finditer(block_text)
                if handler_match.group(1).strip()
            )
        )
        page_blocks.append(
            Ga4CommonPageBlock(
                container_marker=match.group(1).strip(),
                click_selectors=selectors,
            )
        )

    global_selectors: List[str] = []
    for handler_match in CLICK_HANDLER_PATTERN.finditer(template_content):
        if any(start <= handler_match.start() <= end for start, end in blocked_ranges):
            continue
        selector = handler_match.group(1).strip()
        if selector:
            global_selectors.append(selector)

    return Ga4CommonClickSpec(
        global_click_selectors=tuple(dict.fromkeys(global_selectors)),
        page_blocks=tuple(page_blocks),
    )


@lru_cache(maxsize=16)
def _cached_ga4common_click_spec(channel_id: str) -> Ga4CommonClickSpec:
    from services.ga4_channel_service import CHANNELS

    channel = next(item for item in CHANNELS.values() if item.channel_id == channel_id)
    content = load_ga4common_template(channel)
    spec = parse_ga4common_click_spec(content)
    logger.info(
        "Parsed ga4Common click spec for %s: global=%d page_blocks=%d",
        channel_id,
        len(spec.global_click_selectors),
        len(spec.page_blocks),
    )
    return spec


def get_ga4common_click_spec_for_channel(channel: Ga4Channel) -> Ga4CommonClickSpec:
    return _cached_ga4common_click_spec(channel.channel_id)


async def collect_active_container_markers(page: Page, page_blocks: Tuple[Ga4CommonPageBlock, ...]) -> List[str]:
    marker_payload = [block.container_marker for block in page_blocks]
    if not marker_payload:
        return []
    return await page.evaluate(
        """(markers) => {
            return markers.filter((marker) => {
                const css = (
                    marker.startsWith('.') ||
                    marker.startsWith('#') ||
                    marker.startsWith('[')
                ) ? `#container ${marker}` : `#container ${marker}`;
                try {
                    return !!document.querySelector(css);
                } catch (error) {
                    return false;
                }
            });
        }""",
        marker_payload,
    )


def build_applicable_selectors(
    spec: Ga4CommonClickSpec,
    active_markers: List[str],
) -> List[str]:
    active_marker_set = set(active_markers)
    selectors = list(spec.global_click_selectors)
    for block in spec.page_blocks:
        if block.container_marker in active_marker_set:
            selectors.extend(block.click_selectors)
    return list(dict.fromkeys(selectors))


async def annotate_ga4common_tracking_requirements(
    page: Page,
    page_url: str,
    elements: List[PageElement],
) -> List[PageElement]:
    channel = resolve_channel_or_none(page_url)
    if not channel:
        return elements

    try:
        spec = get_ga4common_click_spec_for_channel(channel)
    except (FileNotFoundError, ValueError, StopIteration) as exc:
        logger.warning("Skip ga4Common coverage annotation: %s", exc)
        return elements

    active_markers = await collect_active_container_markers(page, spec.page_blocks)
    applicable_selectors = build_applicable_selectors(spec, active_markers)
    if not applicable_selectors:
        for element in elements:
            element.ga4common_tracking_required = False
            element.ga4common_exclusion_reason = DEFAULT_EXCLUSION_REASON
        return elements

    element_payload = [
        {
            "element_index": element.element_index,
            "selector": element.selector,
            "text": element.text or "",
            "element_type": element.element_type,
        }
        for element in elements
    ]
    required_flags = await page.evaluate(
        f"""(payload) => {{
            const elements = {ELEMENT_QUERY_JS};
            const selectors = payload.selectors;

            function buildSelector(el) {{
                if (el.id) return '#' + CSS.escape(el.id);
                if (el.className && typeof el.className === 'string') {{
                    const cls = el.className.trim().split(/\\s+/)[0];
                    if (cls) return el.tagName.toLowerCase() + '.' + CSS.escape(cls);
                }}
                return el.tagName.toLowerCase();
            }}

            function textOf(el) {{
                return (el.innerText || el.value || el.title || el.getAttribute('aria-label') || '').trim().slice(0, 120);
            }}

            function resolveElement(item) {{
                function matches(el) {{
                    return (
                        buildSelector(el) === item.selector &&
                        el.tagName.toLowerCase() === item.element_type &&
                        textOf(el) === item.text
                    );
                }}

                if (
                    item.element_index >= 0 &&
                    item.element_index < elements.length &&
                    matches(elements[item.element_index])
                ) {{
                    return elements[item.element_index];
                }}
                return elements.find(matches) || null;
            }}

            function matchesGa4Selector(el, selector) {{
                if (!el) return false;
                try {{
                    if (el.matches(selector)) return true;
                }} catch (error) {{
                    return false;
                }}
                try {{
                    return Array.from(document.querySelectorAll(selector)).some((node) => (
                        node === el || node.contains(el)
                    ));
                }} catch (error) {{
                    return false;
                }}
            }}

            function describeExclusion(el) {{
                if (!el) {{
                    return {DEFAULT_EXCLUSION_REASON!r};
                }}
                if (el.closest('.shop_menu')) {{
                    const container = document.querySelector('#container');
                    const shopTmpl = container?.querySelector('.shop_tmpl');
                    const isBasicTemplate = (
                        container?.classList.contains('basic') ||
                        (shopTmpl && !shopTmpl.classList.contains('expand'))
                    );
                    if (isBasicTemplate) {{
                        return '템플릿관 기본형(.basic): ga4Common에는 확장형(.expand) 브랜드 탭만 정의되어 있습니다';
                    }}
                }}
                if (el.closest('.mark_list, .footer_cert, .cert_list, .escrow_area')) {{
                    return 'Footer 인증/에스크로 배지: ga4Common에 클릭 핸들러가 없습니다';
                }}
                const familySite = el.closest('#footer .family_site');
                if (familySite && !el.closest('#footer .family_site .list a')) {{
                    return 'Family Site 드롭다운: ga4Common에는 하위 링크(.list a)만 정의되어 있습니다';
                }}
                return {DEFAULT_EXCLUSION_REASON!r};
            }}

            const results = {{}};
            for (const item of payload.items) {{
                const el = resolveElement(item);
                let required = false;
                for (const selector of selectors) {{
                    if (matchesGa4Selector(el, selector)) {{
                        required = true;
                        break;
                    }}
                }}
                results[item.element_index] = {{
                    required,
                    reason: required ? null : describeExclusion(el),
                }};
            }}
            return results;
        }}""",
        {
            "selectors": applicable_selectors,
            "items": element_payload,
        },
    )

    required_count = 0
    excluded_count = 0
    for element in elements:
        flag = required_flags.get(str(element.element_index), required_flags.get(element.element_index))
        if isinstance(flag, dict):
            required = bool(flag.get("required"))
            reason = flag.get("reason")
        else:
            required = bool(flag)
            reason = None

        element.ga4common_tracking_required = required
        if required:
            required_count += 1
            element.ga4common_exclusion_reason = None
        else:
            excluded_count += 1
            element.ga4common_exclusion_reason = reason or DEFAULT_EXCLUSION_REASON

    logger.info(
        "ga4Common coverage for %s (%s): active_blocks=%s applicable_selectors=%d required=%d excluded=%d",
        page_url,
        channel.channel_id,
        active_markers,
        len(applicable_selectors),
        required_count,
        excluded_count,
    )
    return elements


def _element_key(element: PageElement) -> str:
    return f"{element.selector}|{(element.text or '').strip()}"


def issue_element_key(issue: AiAnalysisItem) -> str:
    return f"{issue.element_selector}|{(issue.element_text or '').strip()}"


def filter_issues_by_ga4common_coverage(
    issues: List[AiAnalysisItem],
    elements: Optional[List[PageElement]],
) -> List[AiAnalysisItem]:
    if not elements:
        return issues

    element_map = {_element_key(element): element for element in elements}
    filtered: List[AiAnalysisItem] = []
    removed = 0

    for issue in issues:
        element = element_map.get(issue_element_key(issue))
        if element is not None and element.ga4common_tracking_required is False:
            removed += 1
            continue
        filtered.append(issue)

    if removed:
        logger.info(
            "Filtered %d issue(s) not covered by ga4Common click handlers",
            removed,
        )
    return filtered


def build_excluded_analysis_items(
    elements: Optional[List[PageElement]],
) -> List[ExcludedAnalysisItem]:
    if not elements:
        return []

    items: List[ExcludedAnalysisItem] = []
    seen_keys: set[str] = set()

    for element in elements:
        if not element.bounding_box or not element.click_tested:
            continue
        if element.ga4common_tracking_required is not False:
            continue
        if element.click_group_id and not element.click_group_representative:
            continue

        element_key = _element_key(element)
        if element_key in seen_keys:
            continue
        seen_keys.add(element_key)

        items.append(
            ExcludedAnalysisItem(
                element_selector=element.selector,
                element_text=element.text or "",
                bounding_box=element.bounding_box,
                exclusion_reason=element.ga4common_exclusion_reason or DEFAULT_EXCLUSION_REASON,
            )
        )

    if items:
        logger.info("Built %d ga4Common excluded item(s)", len(items))
    return items
