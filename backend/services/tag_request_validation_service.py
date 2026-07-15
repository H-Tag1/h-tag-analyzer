import asyncio
import base64
import json
import logging
import os
import re
from typing import Any, Awaitable, Callable, Dict, List, Optional

from openai import AzureOpenAI

from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from models.scan_request import ScanRange
from models.screenshot_segment import ScreenshotSegment
from models.tag_request_validation import (
    TagRequestItem,
    TagRequestMatch,
    TagRequestSheetResult,
    TagRequestSubstitution,
    TagRequestValidationItem,
    TagRequestValidationResponse,
)
from config import settings
from services.page_scan_service import collect_page_data_with_clean_capture
from services.tag_request_excel_service import ParsedTagRequestSheet, parse_tag_request_workbook
from services.tracking.event_normalizer import EP_FIELDS, event_name_from_dict, extract_ep_params, params_from_event_dict
from services.tracking_filter_service import filter_network_tags, normalize_tracking_id

logger = logging.getLogger(__name__)
ProgressReporter = Callable[[Dict[str, Any]], Awaitable[None]]


async def validate_tag_request_workbook(
    file_name: str,
    content: bytes,
    tracking_id: str = "G-1NWKV3S1TW",
    progress: Optional[ProgressReporter] = None,
) -> TagRequestValidationResponse:
    sheets = parse_tag_request_workbook(file_name, content)
    target_tracking_id = normalize_tracking_id(tracking_id)
    results: List[TagRequestSheetResult] = []
    total_sheets = len(sheets)

    await _report_progress(progress, {
        "type": "validation_start",
        "sheetTotal": total_sheets,
    })

    for index, sheet in enumerate(sheets, start=1):
        context = {
            "sheetIndex": index,
            "sheetTotal": total_sheets,
            "sheetName": sheet.sheet_name,
            "url": sheet.url or "",
        }

        async def report_sheet_progress(
            event: Dict[str, Any],
            sheet_context: Dict[str, Any] = context,
        ) -> None:
            await _report_progress(progress, {**event, **sheet_context})

        await _report_progress(progress, {
            "type": "sheet_start",
            **context,
            "itemTotal": len(sheet.items),
        })
        result = await _validate_sheet(sheet, target_tracking_id, report_sheet_progress)
        results.append(result)
        await _report_progress(progress, {
            "type": "sheet_complete",
            **context,
            "normalCount": result.normal_count,
            "missingCount": result.missing_count,
            "hasError": bool(result.error),
        })

    response = TagRequestValidationResponse(
        file_name=file_name,
        total_count=sum(result.total_count for result in results),
        normal_count=sum(result.normal_count for result in results),
        missing_count=sum(result.missing_count for result in results),
        sheets=results,
    )
    await _report_progress(progress, {
        "type": "validation_complete",
        "data": response.model_dump(mode="json"),
    })
    return response


async def _report_progress(
    progress: Optional[ProgressReporter],
    event: Dict[str, Any],
) -> None:
    if progress:
        await progress(event)


async def _validate_sheet(
    sheet: ParsedTagRequestSheet,
    tracking_id: str,
    progress: Optional[ProgressReporter] = None,
) -> TagRequestSheetResult:
    if not sheet.url:
        return _sheet_error(sheet, "URL을 찾지 못했습니다.")
    if not sheet.items:
        return _sheet_error(sheet, "태깅 요청 항목을 찾지 못했습니다.")

    try:
        (
            screenshot_segments,
            width,
            height,
            tracking_elements,
            capture_elements,
            network_tags,
        ) = await collect_page_data_with_clean_capture(
            sheet.url,
            scan_range=ScanRange(preset="full"),
            progress=progress,
        )
        network_tags = filter_network_tags(network_tags, tracking_id)
    except Exception as exc:
        return _sheet_error(sheet, f"페이지 검사 중 오류가 발생했습니다: {exc}")

    await _report_progress(progress, {
        "type": "matching_start",
        "itemTotal": len(sheet.items),
    })
    items = [
        _validate_request_item(item, network_tags, tracking_elements, capture_elements)
        for item in sheet.items
    ]
    await _apply_ai_bounding_box_fallback(
        items,
        capture_elements,
        screenshot_segments,
        width,
        height,
        progress=progress,
    )
    await _report_progress(progress, {
        "type": "matching_done",
        "itemTotal": len(items),
    })
    normal_count = sum(1 for item in items if item.status == "normal")
    missing_count = len(items) - normal_count

    return TagRequestSheetResult(
        sheet_name=sheet.sheet_name,
        url=sheet.url,
        event_name=sheet.event_name,
        screenshot_id=screenshot_segments[0].screenshot_id if screenshot_segments else None,
        screenshot_width=width,
        screenshot_height=height,
        screenshot_segments=screenshot_segments,
        element_count=len(capture_elements),
        total_count=len(items),
        normal_count=normal_count,
        missing_count=missing_count,
        items=items,
    )


def _sheet_error(sheet: ParsedTagRequestSheet, message: str) -> TagRequestSheetResult:
    items = [
        TagRequestValidationItem(
            request=item,
            status="missing",
            missing_fields=["scan_error"],
        )
        for item in sheet.items
    ]
    return TagRequestSheetResult(
        sheet_name=sheet.sheet_name,
        url=sheet.url,
        event_name=sheet.event_name,
        total_count=len(items),
        normal_count=0,
        missing_count=len(items),
        error=message,
        items=items,
    )


def _validate_request_item(
    request: TagRequestItem,
    network_tags: List[NetworkTagHit],
    tracking_elements: List[PageElement],
    capture_elements: List[PageElement],
) -> TagRequestValidationItem:
    best_mismatch: Optional[Dict[str, str]] = None
    best_actual_params: Optional[Dict[str, str]] = None
    best_trigger = "page_load"

    for hit in network_tags:
        event_name = (hit.event_name or "").strip()
        if event_name != request.event_name:
            continue

        actual_params = extract_ep_params(hit)
        missing_fields = _missing_fields(request, actual_params)
        if not missing_fields:
            bounding_box = _find_capture_bounding_box(
                request,
                tracking_elements,
                capture_elements,
            )
            return TagRequestValidationItem(
                request=request,
                status="normal",
                bounding_box=bounding_box,
                substitutions=_extract_substitutions(request, actual_params),
                matched_tag=TagRequestMatch(
                    event_name=event_name,
                    ep_button_area=actual_params["ep_button_area"],
                    ep_button_area2=actual_params["ep_button_area2"],
                    ep_button_name=actual_params["ep_button_name"],
                    trigger=hit.trigger,
                ),
            )

        if best_mismatch is None or len(missing_fields) < len(best_mismatch):
            best_mismatch = {field: actual_params.get(field, "") for field in missing_fields}
            best_actual_params = actual_params
            best_trigger = hit.trigger

    missing_fields = list(best_mismatch.keys()) if best_mismatch else ["event_name", *EP_FIELDS]
    bounding_box = _find_capture_bounding_box(
        request,
        tracking_elements,
        capture_elements,
    )
    return TagRequestValidationItem(
        request=request,
        status="missing",
        missing_fields=missing_fields,
        bounding_box=bounding_box,
        substitutions=_extract_substitutions(request, best_actual_params or {}),
        matched_tag=TagRequestMatch(
            event_name=request.event_name,
            ep_button_area=(best_actual_params or {}).get("ep_button_area", ""),
            ep_button_area2=(best_actual_params or {}).get("ep_button_area2", ""),
            ep_button_name=(best_actual_params or {}).get("ep_button_name", ""),
            trigger=best_trigger,
        ) if best_actual_params else None,
    )


def _find_element_for_request(
    request: TagRequestItem,
    elements: List[PageElement],
) -> Optional[PageElement]:
    for element in elements:
        if not element.bounding_box:
            continue
        for event in element.click_tracking_events:
            event_name = event_name_from_dict(event)
            if event_name != request.event_name:
                continue
            actual_params = params_from_event_dict(event)
            if not _missing_fields(request, actual_params):
                return element
    return None


def _find_capture_bounding_box(
    request: TagRequestItem,
    tracking_elements: List[PageElement],
    capture_elements: List[PageElement],
) -> Optional[BoundingBox]:
    tracking_element = _find_element_for_request(request, tracking_elements)
    if not tracking_element:
        return None

    capture_element = _find_corresponding_capture_element(tracking_element, capture_elements)
    return capture_element.bounding_box if capture_element else None


def _find_corresponding_capture_element(
    tracking_element: PageElement,
    capture_elements: List[PageElement],
) -> Optional[PageElement]:
    tracking_text = _normalize_element_text(tracking_element.text)
    for element in capture_elements:
        if (
            element.element_index == tracking_element.element_index
            and element.selector == tracking_element.selector
            and element.element_type == tracking_element.element_type
            and _normalize_element_text(element.text) == tracking_text
        ):
            return element

    exact_matches = [
        element
        for element in capture_elements
        if (
            element.selector == tracking_element.selector
            and element.element_type == tracking_element.element_type
            and _normalize_element_text(element.text) == tracking_text
        )
    ]
    if len(exact_matches) == 1:
        return exact_matches[0]
    if exact_matches and tracking_element.bounding_box:
        return min(
            exact_matches,
            key=lambda element: _bounding_box_distance(
                tracking_element.bounding_box,
                element.bounding_box,
            ),
        )
    return None


def _bounding_box_distance(source: BoundingBox, target: Optional[BoundingBox]) -> float:
    if not target:
        return float("inf")
    return abs(source.x - target.x) + abs(source.y - target.y)


def _normalize_element_text(value: Optional[str]) -> str:
    return " ".join((value or "").split())


def _missing_fields(request: TagRequestItem, actual_params: Dict[str, str]) -> List[str]:
    missing = []
    expected = {
        "ep_button_area": request.ep_button_area,
        "ep_button_area2": request.ep_button_area2,
        "ep_button_name": request.ep_button_name,
    }
    for field, expected_value in expected.items():
        if expected_value and not _template_matches(expected_value, actual_params.get(field, "")):
            missing.append(field)
    return missing


def _template_matches(expected: str, actual: str) -> bool:
    expected = (expected or "").strip()
    actual = (actual or "").strip()
    if not expected:
        return True
    if not actual:
        return False

    pattern_parts = []
    last_index = 0
    for match in re.finditer(r"\{\{[^{}]+\}\}", expected):
        pattern_parts.append(re.escape(expected[last_index:match.start()]))
        pattern_parts.append(r".+")
        last_index = match.end()
    pattern_parts.append(re.escape(expected[last_index:]))
    return re.fullmatch("".join(pattern_parts), actual) is not None


def _extract_substitutions(request: TagRequestItem, actual_params: Dict[str, str]) -> List[TagRequestSubstitution]:
    substitutions: List[TagRequestSubstitution] = []
    expected_by_field = {
        "ep_button_area": request.ep_button_area,
        "ep_button_area2": request.ep_button_area2,
        "ep_button_name": request.ep_button_name,
    }
    for field, expected in expected_by_field.items():
        actual = actual_params.get(field, "")
        substitutions.extend(_extract_field_substitutions(field, expected, actual))
    return substitutions


def _extract_field_substitutions(field: str, expected: str, actual: str) -> List[TagRequestSubstitution]:
    expected = (expected or "").strip()
    actual = (actual or "").strip()
    placeholders = [match.group(0) for match in re.finditer(r"\{\{[^{}]+\}\}", expected)]
    if not placeholders or not actual:
        return []

    pattern_parts = []
    last_index = 0
    for idx, match in enumerate(re.finditer(r"\{\{[^{}]+\}\}", expected)):
        pattern_parts.append(re.escape(expected[last_index:match.start()]))
        pattern_parts.append(f"(?P<v{idx}>.+?)")
        last_index = match.end()
    pattern_parts.append(re.escape(expected[last_index:]))

    match = re.fullmatch("".join(pattern_parts), actual)
    if not match:
        if len(placeholders) == 1:
            return [TagRequestSubstitution(field=field, placeholder=placeholders[0], value=actual)]
        return []

    return [
        TagRequestSubstitution(field=field, placeholder=placeholder, value=match.group(f"v{idx}"))
        for idx, placeholder in enumerate(placeholders)
    ]


async def _apply_ai_bounding_box_fallback(
    items: List[TagRequestValidationItem],
    elements: List[PageElement],
    screenshot_segments: List[ScreenshotSegment],
    width: int,
    height: int,
    progress: Optional[ProgressReporter] = None,
) -> None:
    pending = [item for item in items if item.bounding_box is None]
    if not pending or not settings.azure_openai_key or not settings.azure_openai_endpoint:
        return

    if not screenshot_segments:
        return
    if any(
        not os.path.exists(os.path.join(settings.screenshot_dir, f"{segment.screenshot_id}.png"))
        for segment in screenshot_segments
    ):
        return

    await _report_progress(progress, {
        "type": "ai_matching_start",
        "itemTotal": len(pending),
    })
    try:
        ai_matches = await asyncio.to_thread(
            _ask_ai_for_request_matches,
            pending,
            elements,
            screenshot_segments,
            width,
            height,
        )
    except Exception as exc:
        logger.warning("AI tag request matching skipped: %s", exc)
        await _report_progress(progress, {
            "type": "ai_matching_done",
            "matchedCount": 0,
        })
        return
    await _report_progress(progress, {
        "type": "ai_matching_done",
        "matchedCount": len(ai_matches),
    })

    element_lookup: Dict[str, List[PageElement]] = {}
    for element in elements:
        if not element.bounding_box:
            continue
        key = f"{element.selector}|{element.text or ''}"
        element_lookup.setdefault(key, []).append(element)

    for item in pending:
        match = ai_matches.get(item.request.request_no)
        if not match:
            continue

        element = _find_ai_matched_element(match, element_lookup, screenshot_segments)
        if element and element.bounding_box:
            item.bounding_box = element.bounding_box
            item.match_source = "ai"
            continue

        raw_box = match.get("bounding_box")
        if isinstance(raw_box, dict):
            try:
                segment_index = _match_segment_index(match, screenshot_segments)
                if segment_index is None:
                    continue
                segment = screenshot_segments[segment_index]

                item.bounding_box = BoundingBox(
                    x=float(raw_box.get("x", 0)),
                    y=float(raw_box.get("y", 0)) + segment.offset_y,
                    width=float(raw_box.get("width", 0)),
                    height=float(raw_box.get("height", 0)),
                )
                item.match_source = "ai"
            except (TypeError, ValueError):
                continue


def _ask_ai_for_request_matches(
    items: List[TagRequestValidationItem],
    elements: List[PageElement],
    screenshot_segments: List[ScreenshotSegment],
    width: int,
    height: int,
) -> Dict[str, Dict[str, object]]:
    client = AzureOpenAI(
        api_key=settings.azure_openai_key,
        api_version=settings.azure_openai_api_version,
        azure_endpoint=settings.azure_openai_endpoint,
    )
    requests_json = json.dumps([
        {
            "request_no": item.request.request_no,
            "event_name": item.request.event_name,
            "ep_button_area": item.request.ep_button_area,
            "ep_button_area2": item.request.ep_button_area2,
            "ep_button_name": item.request.ep_button_name,
        }
        for item in items
    ], ensure_ascii=False)
    elements_json = json.dumps([
        {
            "selector": element.selector,
            "text": element.text or "",
            "bounding_box": element.bounding_box.model_dump() if element.bounding_box else None,
            "segment_index": _segment_index_for_box(element.bounding_box, screenshot_segments),
        }
        for element in elements
        if element.bounding_box
    ][:250], ensure_ascii=False)

    prompt = f"""
You are helping match GA4 tagging request rows to visible elements on a duty-free page.
The full page is split into {len(screenshot_segments)} screenshot segments.
Each segment label provides its zero-based index and global page Y offset.
Use all screenshot segments and the interactive element list. Prefer returning an element from the provided list.
Persistent headers and bottom navigation are context only. Never match requests to those controls.

Full page size: {width}x{height}

Requests:
{requests_json}

Interactive elements:
{elements_json}

Return JSON only:
{{
  "matches": [
    {{
      "request_no": "1",
      "segment_index": 0,
      "selector": "selector from provided element list if possible",
      "text": "text from provided element list if possible",
      "bounding_box": {{"x": 0, "y": 0, "width": 0, "height": 0}},
      "reason": "short Korean reason"
    }}
  ]
}}
bounding_box coordinates must be relative to the selected screenshot segment, not the full page.
If no reasonable visual match exists for a request, omit it.
"""
    image_content = []
    for index, segment in enumerate(screenshot_segments):
        screenshot_path = os.path.join(settings.screenshot_dir, f"{segment.screenshot_id}.png")
        with open(screenshot_path, "rb") as file:
            image_b64 = base64.b64encode(file.read()).decode()
        image_content.extend([
            {
                "type": "text",
                "text": (
                    f"Screenshot segment {index}: global y offset {segment.offset_y}, "
                    f"size {segment.width}x{segment.height}"
                ),
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{image_b64}", "detail": "high"},
            },
        ])
    image_content.append({"type": "text", "text": prompt})

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[{
            "role": "user",
            "content": image_content,
        }],
        response_format={"type": "json_object"},
        max_tokens=4096,
    )
    parsed = json.loads(response.choices[0].message.content or "{}")
    return {
        str(match.get("request_no")): match
        for match in parsed.get("matches", [])
        if isinstance(match, dict) and match.get("request_no")
    }


def _segment_index_for_box(
    box: Optional[BoundingBox],
    screenshot_segments: List[ScreenshotSegment],
) -> Optional[int]:
    if not box:
        return None

    center_y = box.y + (box.height / 2)
    for index, segment in enumerate(screenshot_segments):
        if segment.offset_y <= center_y < segment.offset_y + segment.height:
            return index
    return None


def _find_ai_matched_element(
    match: Dict[str, object],
    element_lookup: Dict[str, List[PageElement]],
    screenshot_segments: List[ScreenshotSegment],
) -> Optional[PageElement]:
    key = f"{match.get('selector', '')}|{match.get('text', '')}"
    candidates = element_lookup.get(key, [])
    if len(candidates) == 1:
        return candidates[0]

    segment_index = _match_segment_index(match, screenshot_segments)
    if segment_index is None:
        return None
    segment_candidates = [
        element
        for element in candidates
        if _segment_index_for_box(element.bounding_box, screenshot_segments) == segment_index
    ]
    return segment_candidates[0] if len(segment_candidates) == 1 else None


def _match_segment_index(
    match: Dict[str, object],
    screenshot_segments: List[ScreenshotSegment],
) -> Optional[int]:
    raw_index = match.get("segment_index")
    if raw_index is None and len(screenshot_segments) == 1:
        return 0
    try:
        index = int(raw_index)
    except (TypeError, ValueError):
        return None
    return index if 0 <= index < len(screenshot_segments) else None
