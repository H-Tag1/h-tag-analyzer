import asyncio
import functools
import json
import logging
import re
from pathlib import Path
from typing import AsyncGenerator, List, Optional

from playwright.async_api import async_playwright

from config import settings
from models.page_scan_data import PageScanData
from models.scan_request import ScanLoginCredentials, ScanRange
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
from services.ga4_channel_service import resolve_channel_or_none
from services.ga4_template_suggestion_service import suggest_tag_specs_for_page
from services.marketing_exclusion_service import build_page_excluded_items
from services.scan_history_service import save_scan_history
from services.tag_classification_service import classify_network_tags

logger = logging.getLogger(__name__)


async def batch_scan(
    url: str,
    login: Optional[ScanLoginCredentials] = None,
    tracking_id: str = "G-1NWKV3S1TW",
    scan_range: Optional[ScanRange] = None,
) -> AsyncGenerator[str, None]:
    yield json.dumps({"type": "scan_start", "url": url, "mode": "batch"})

    if login and login.enabled:
        async for event in _authenticated_batch_scan(url, login, tracking_id, scan_range):
            yield event
        return

    discovered = await discover_links(url, max_pages=20)
    all_urls = [url] + discovered

    yield json.dumps({"type": "pages_discovered", "urls": all_urls, "total": len(all_urls)})

    pages = []
    for idx, page_url in enumerate(all_urls):
        yield json.dumps({"type": "page_start", "url": page_url, "index": idx + 1, "total": len(all_urls)})

        try:
            page_data = await _scan_single(page_url, tracking_id, scan_range)
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
    scan_range: Optional[ScanRange] = None,
) -> AsyncGenerator[str, None]:
    yield json.dumps({"type": "scan_start", "url": url, "mode": "single"})

    target_tracking_id = normalize_tracking_id(tracking_id)
    progress_queue: asyncio.Queue[dict] = asyncio.Queue()

    async def report_progress(event: dict) -> None:
        await progress_queue.put(event)

    collect_task = asyncio.create_task(collect_page_data(
        url,
        login,
        scan_range,
        report_progress,
    ))

    while not collect_task.done():
        try:
            event = await asyncio.wait_for(progress_queue.get(), timeout=0.2)
            yield json.dumps(event)
        except asyncio.TimeoutError:
            continue

    while not progress_queue.empty():
        yield json.dumps(progress_queue.get_nowait())

    screenshot_id, width, height, elements, datalayer, network_tags = await collect_task
    elements, datalayer, network_tags = _apply_tracking_id_filter(
        elements, datalayer, network_tags, target_tracking_id
    )

    yield json.dumps({"type": "ai_analyzing"})

    page_data = await _assemble_page_data(
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


async def _scan_single(
    url: str,
    tracking_id: str = "G-1NWKV3S1TW",
    scan_range: Optional[ScanRange] = None,
) -> PageScanData:
    target_tracking_id = normalize_tracking_id(tracking_id)
    screenshot_id, width, height, elements, datalayer, network_tags = await collect_page_data(
        url,
        scan_range=scan_range,
    )
    elements, datalayer, network_tags = _apply_tracking_id_filter(
        elements, datalayer, network_tags, target_tracking_id
    )
    return await _assemble_page_data(
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
    scan_range: Optional[ScanRange] = None,
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
                    page_data = await _scan_authenticated_single(page, page_url, tracking_id, scan_range)
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


async def _scan_authenticated_single(
    page,
    url: str,
    tracking_id: str = "G-1NWKV3S1TW",
    scan_range: Optional[ScanRange] = None,
) -> PageScanData:
    target_tracking_id = normalize_tracking_id(tracking_id)
    screenshot_id, width, height, elements, datalayer, network_tags = await collect_authenticated_page_data(
        page,
        url,
        scan_range,
    )
    elements, datalayer, network_tags = _apply_tracking_id_filter(
        elements, datalayer, network_tags, target_tracking_id
    )
    return await _assemble_page_data(
        url=url,
        screenshot_id=screenshot_id,
        width=width,
        height=height,
        elements=elements,
        datalayer=datalayer,
        network_tags=network_tags,
        tracking_id=target_tracking_id,
    )


def _apply_render_box_corrections(elements, *item_lists) -> None:
    """가려진 중복 요소(예: 스티키 헤더의 숨은 nav)의 오버레이 박스를, 화면에서 보이는
    쌍둥이 위치(element.render_box)로 옮긴다. 그룹핑/분류/카운트는 이미 원본 bounding_box로
    끝난 뒤이므로, 이 교정은 프론트로 나가는 렌더 좌표에만 영향을 준다."""
    def correction_key(item, box):
        selector = (
            getattr(item, "selector", None)
            or getattr(item, "element_selector", None)
            or ""
        )
        text = (
            getattr(item, "text", None)
            or getattr(item, "element_text", None)
            or ""
        )
        return (
            str(selector),
            str(text).strip(),
            round(box.x),
            round(box.y),
            round(box.width),
            round(box.height),
        )

    corrections: dict = {}
    for element in elements:
        render_box = getattr(element, "render_box", None)
        box = getattr(element, "bounding_box", None)
        if not render_box or not box:
            continue
        corrections[correction_key(element, box)] = render_box
    if not corrections:
        return
    for items in item_lists:
        for item in items:
            box = item.bounding_box
            if not box:
                continue
            corrected = corrections.get(correction_key(item, box))
            if corrected is not None:
                item.bounding_box = corrected


_EVENT_NAME_PATTERN = re.compile(r"click_[A-Za-z]+_[가-힣A-Za-z0-9_{}]+")


@functools.lru_cache(maxsize=8)
def _known_event_names(template_filename: str) -> frozenset:
    """채널의 실제 ga4Common.js 파일에서 event_name 집합을 추출한다.

    LLM이 지어낸(파일에 없는) event_name을 걸러내는 근거로 쓴다. 파일이 없으면
    빈 집합을 반환하고, 이 경우 가드레일은 비활성(모든 값 통과)된다.
    """
    if not template_filename:
        return frozenset()
    path = Path(settings.ga4common_templates_dir) / template_filename
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        logger.warning("Failed to read GA template %s for event validation: %s", path, exc)
        return frozenset()
    return frozenset(_EVENT_NAME_PATTERN.findall(text))


# 상품 카드 이름에서 잘라낼 노이즈 경계: 줄바꿈 / 할인율 / 가격($·원·천단위콤마)
_PRODUCT_NAME_CUT = re.compile(r"\n|\d+\s*%|\$|원|\d{1,3},\d{3}")
# 이름 끝에 붙는 용량/수량 단위
_PRODUCT_VOLUME = re.compile(r"\s*\d+\s*(ml|mL|ML|L|포|개입|매|정|병)\b")


def _clean_product_name(ep_button_name: str, element_text: str) -> str:
    """리터럴 상품명(상품_...)에서 가격·할인율·용량 노이즈를 제거한다.

    LLM이 상품 카드 전체 텍스트를 이름에 넣어 '상품_시주198853%500ml'처럼 나오는 것을,
    element_text(공백·줄바꿈이 살아있는 원본)에서 상품명 앞부분만 재도출해 '상품_시주1988'로.
    '상품_' 접두사 + 카드에 가격/할인 노이즈가 있을 때만 동작(다른 이름·변수형엔 무영향).
    """
    if not ep_button_name or not ep_button_name.startswith("상품_") or not element_text:
        return ep_button_name
    if not re.search(r"%|\$|원|,\d{3}", element_text):
        return ep_button_name
    match = _PRODUCT_NAME_CUT.search(element_text)
    name_part = element_text[: match.start()] if match else element_text
    name_part = _PRODUCT_VOLUME.sub("", name_part)
    name_part = re.sub(r"\s+", "", name_part).strip()
    return f"상품_{name_part}" if name_part else ep_button_name


def _is_preserved_variable_spec(spec) -> bool:
    """진짜 변수 표현식(이름에 {{ }} 템플릿이 있는 것, 예: 정렬기준_{{optNm}})인지 판별한다.

    이런 스펙은 GA파일 핸들러에서 그대로 온 정확한 값이므로 LLM으로 덮지 않고 보존한다.
    RAG 그룹 로직이 type=expression 플래그만 달고 이름은 리터럴을 채운 경우가 있어,
    플래그가 아니라 실제 {{ }} 유무로 판별해야 오탐(리터럴 노이즈 보존)을 막는다.
    """
    spec = spec or {}
    return (
        spec.get("ep_button_name_type") in {"expression", "variable"}
        and "{{" in str(spec.get("ep_button_name") or "")
    )


async def _refine_issue_specs_with_llm(page_url: str, issues) -> None:
    """누락(issues) 항목의 추천 GA 스펙을 LLM으로 정교화한다.

    기존 RAG top-1 매칭은 문맥을 못 봐서 오매칭이 잦다(예: '확대' 버튼에 로그인/비밀번호찾기
    스펙, 특가상품 전부에 대표 상품의 가격 오염 이름). LLM은 요소 문맥을 보고 event/area를
    바로잡고 상품/브랜드/카테고리에 맞는 ep_button_name 접두사를 부여한다.

    - 분류(정상/누락/확인/예외)/카운트/박스는 건드리지 않고 recommended_ga_spec 내용만 개선한다.
    - Azure OpenAI 미설정이면 no-op(기존 RAG 스펙 유지). LLM 실패 시에도 기존 스펙 유지.
    - 가드레일: LLM이 낸 event_name이 실제 GA파일에 없으면(지어낸 값) 근거 있는 원래 RAG
      event_name으로 되돌린다. area/name 개선은 유지하되 event_name은 파일 실재값만 나가게 한다.
    """
    if not issues:
        return
    if not (settings.azure_openai_key and settings.azure_openai_endpoint):
        return

    # 진짜 변수 표현식({{ }})은 이미 정확하므로 LLM에 보내지 않고 보존한다(토큰 절약).
    refine_items = [item for item in issues if not _is_preserved_variable_spec(item.recommended_ga_spec)]
    if not refine_items:
        return

    issue_dicts = [
        {
            "element_selector": item.element_selector,
            "element_text": item.element_text,
            "recommended_ga_spec": {},
        }
        for item in refine_items
    ]
    try:
        refined_specs = await suggest_tag_specs_for_page(page_url, issue_dicts)
    except Exception as exc:  # noqa: BLE001 - LLM 실패 시 기존 스펙 유지
        logger.warning("LLM issue spec refinement failed, keeping RAG specs: %s", exc)
        return

    channel = resolve_channel_or_none(page_url)
    known_events = _known_event_names(channel.template_filename) if channel else frozenset()

    for item, refined in zip(refine_items, refined_specs):
        if not refined:
            continue
        original = dict(item.recommended_ga_spec or {})
        # LLM 값 우선, LLM이 비운 필드는 기존 RAG 스펙으로 보완(무손실)
        merged = dict(original)
        for key, value in refined.items():
            if value:
                merged[key] = value
        # 가드레일: 파일에 없는 event_name은 근거 있는 원래 값으로 되돌림
        event_name = merged.get("event_name")
        if known_events and event_name and event_name not in known_events:
            fallback = original.get("event_name")
            if fallback:
                logger.info(
                    "LLM event_name %r not found in GA file, reverting to RAG value %r",
                    event_name,
                    fallback,
                )
                merged["event_name"] = fallback
        # 리터럴 상품명의 가격/할인/용량 노이즈 제거 (진짜 변수형은 위에서 이미 skip)
        name = merged.get("ep_button_name")
        if name:
            merged["ep_button_name"] = _clean_product_name(name, item.element_text or "")
        # 이름이 리터럴로 확정됐는데 expression 플래그/파라미터가 남아있으면(RAG 오설정) 정리
        if merged.get("ep_button_name_type") in {"expression", "variable"} and "{{" not in str(
            merged.get("ep_button_name") or ""
        ):
            merged.pop("ep_button_name_type", None)
            merged.pop("ep_button_name_param", None)
            merged.pop("setup_lines", None)
        item.recommended_ga_spec = merged


async def _assemble_page_data(
    url: str,
    screenshot_id: str,
    width: int,
    height: int,
    elements: List,
    datalayer: list,
    network_tags: list,
    tracking_id: str,
) -> PageScanData:
    tracked_items, issues, review_items = classify_network_tags(
        network_tags,
        elements,
        page_url=url,
    )
    issues = filter_dismissed_issues(issues, url)
    excluded_items, issues, tracked_items = await build_page_excluded_items(
        url,
        elements,
        screenshot_id,
        tracked_items,
        issues,
    )
    channel = resolve_channel_or_none(url)

    _apply_render_box_corrections(
        elements, tracked_items, issues, review_items, excluded_items
    )

    await _refine_issue_specs_with_llm(url, issues)

    return PageScanData(
        url=url,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
        tracking_id=tracking_id,
        channel_id=channel.channel_id if channel else None,
        channel_label=channel.label if channel else None,
        datalayer_events=datalayer,
        issues=issues,
        review_items=review_items,
        tracked_items=tracked_items,
        excluded_items=excluded_items,
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
