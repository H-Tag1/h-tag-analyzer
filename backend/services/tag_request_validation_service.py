import re
from typing import Dict, List, Optional

from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from models.scan_request import ScanRange
from models.tag_request_validation import (
    TagRequestItem,
    TagRequestMatch,
    TagRequestSheetResult,
    TagRequestValidationItem,
    TagRequestValidationResponse,
)
from services.page_scan_service import collect_page_data
from services.tag_request_excel_service import ParsedTagRequestSheet, parse_tag_request_workbook
from services.tracking.event_normalizer import EP_FIELDS, event_name_from_dict, extract_ep_params, params_from_event_dict
from services.tracking_filter_service import filter_network_tags, normalize_tracking_id


async def validate_tag_request_workbook(
    file_name: str,
    content: bytes,
    tracking_id: str = "G-1NWKV3S1TW",
) -> TagRequestValidationResponse:
    sheets = parse_tag_request_workbook(file_name, content)
    target_tracking_id = normalize_tracking_id(tracking_id)
    results: List[TagRequestSheetResult] = []

    for sheet in sheets:
        results.append(await _validate_sheet(sheet, target_tracking_id))

    return TagRequestValidationResponse(
        file_name=file_name,
        total_count=sum(result.total_count for result in results),
        normal_count=sum(result.normal_count for result in results),
        missing_count=sum(result.missing_count for result in results),
        sheets=results,
    )


async def _validate_sheet(sheet: ParsedTagRequestSheet, tracking_id: str) -> TagRequestSheetResult:
    if not sheet.url:
        return _sheet_error(sheet, "URL을 찾지 못했습니다.")
    if not sheet.items:
        return _sheet_error(sheet, "태깅 요청 항목을 찾지 못했습니다.")

    try:
        screenshot_id, width, height, elements, _, network_tags = await collect_page_data(
            sheet.url,
            scan_range=ScanRange(preset="top2"),
        )
        network_tags = filter_network_tags(network_tags, tracking_id)
    except Exception as exc:
        return _sheet_error(sheet, f"페이지 검사 중 오류가 발생했습니다: {exc}")

    items = [
        _validate_request_item(item, network_tags, elements)
        for item in sheet.items
    ]
    normal_count = sum(1 for item in items if item.status == "normal")
    missing_count = len(items) - normal_count

    return TagRequestSheetResult(
        sheet_name=sheet.sheet_name,
        url=sheet.url,
        event_name=sheet.event_name,
        screenshot_id=screenshot_id,
        screenshot_width=width,
        screenshot_height=height,
        element_count=len(elements),
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
    elements: List[PageElement],
) -> TagRequestValidationItem:
    best_mismatch: Optional[Dict[str, str]] = None

    for hit in network_tags:
        event_name = (hit.event_name or "").strip()
        if event_name != request.event_name:
            continue

        actual_params = extract_ep_params(hit)
        missing_fields = _missing_fields(request, actual_params)
        if not missing_fields:
            element = _find_element_for_request(request, elements)
            return TagRequestValidationItem(
                request=request,
                status="normal",
                bounding_box=element.bounding_box if element else None,
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

    missing_fields = list(best_mismatch.keys()) if best_mismatch else ["event_name", *EP_FIELDS]
    return TagRequestValidationItem(
        request=request,
        status="missing",
        missing_fields=missing_fields,
        bounding_box=_find_element_for_request(request, elements).bounding_box
        if _find_element_for_request(request, elements)
        else None,
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
