import logging
from collections import defaultdict
from typing import Any, Awaitable, Callable, Dict, List, Optional

from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from models.scan_request import ScanRange
from models.tag_request_validation import (
    TagRequestCandidateResult,
    TagRequestItem,
    TagRequestMatch,
    TagRequestSheetResult,
    TagRequestSubstitution,
    TagRequestValidationItem,
    TagRequestValidationResponse,
)
from services.page_scan_service import collect_page_data_with_clean_capture
from services.hybrid_tag_judgment_service import HybridTagJudgmentResolver
from services.tag_request_excel_service import ParsedTagRequestSheet, parse_tag_request_workbook
from services.tag_request_matching_service import (
    RequestParameterMatch,
    match_request_parameters,
)
from services.tag_request_reference_service import (
    TagRequestReferenceRule,
    build_tag_request_reference_rules,
)
from services.tracking.event_normalizer import EP_FIELDS, event_name_from_dict, extract_ep_params, params_from_event_dict
from services.tracking_filter_service import (
    filter_elements_by_tracking_id,
    filter_network_tags,
    normalize_tracking_id,
)

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
            "reviewCount": result.review_count,
            "hasError": bool(result.error),
        })

    response = TagRequestValidationResponse(
        file_name=file_name,
        total_count=sum(result.total_count for result in results),
        normal_count=sum(result.normal_count for result in results),
        missing_count=sum(result.missing_count for result in results),
        review_count=sum(result.review_count for result in results),
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

    reference_rules = build_tag_request_reference_rules(sheet)
    rules_by_row: Dict[int, List[TagRequestReferenceRule]] = defaultdict(list)
    for rule in reference_rules:
        rules_by_row[rule.request_row_number].append(rule)
    verification_only = all(
        bool(rules_by_row.get(item.row_number))
        for item in sheet.items
    )

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
            verification_rules=[rule.to_browser_payload() for rule in reference_rules],
            verification_only=verification_only,
        )
        tracking_elements = filter_elements_by_tracking_id(
            tracking_elements,
            tracking_id,
        )
        network_tags = filter_network_tags(network_tags, tracking_id)
    except Exception as exc:
        return _sheet_error(sheet, f"페이지 검사 중 오류가 발생했습니다: {exc}")

    await _report_progress(progress, {
        "type": "matching_start",
        "itemTotal": len(sheet.items),
    })
    rag_resolver = HybridTagJudgmentResolver(sheet.url)
    items: List[TagRequestValidationItem] = []
    for item_index, item in enumerate(sheet.items, start=1):
        item_rules = rules_by_row.get(item.row_number, [])
        if item_rules:
            validation_item = _validate_request_candidates(
                item,
                item_rules,
                tracking_elements,
                capture_elements,
            )
        else:
            validation_item = _validate_request_item(
                item,
                network_tags,
                tracking_elements,
                capture_elements,
                rag_resolver,
            )
        items.append(validation_item)
        await _report_progress(progress, {
            "type": "matching_progress",
            "current": item_index,
            "total": len(sheet.items),
        })
    await _report_progress(progress, {
        "type": "matching_done",
        "itemTotal": len(items),
    })
    normal_count = sum(1 for item in items if item.status == "normal")
    missing_count = sum(1 for item in items if item.status == "missing")
    review_count = sum(1 for item in items if item.status == "review")

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
        review_count=review_count,
        items=items,
    )


def _sheet_error(sheet: ParsedTagRequestSheet, message: str) -> TagRequestSheetResult:
    items = [
        TagRequestValidationItem(
            request=item,
            status="review",
            missing_fields=["scan_error"],
            judgment_source="rule",
            judgment_reason=message,
        )
        for item in sheet.items
    ]
    return TagRequestSheetResult(
        sheet_name=sheet.sheet_name,
        url=sheet.url,
        event_name=sheet.event_name,
        total_count=len(items),
        normal_count=0,
        missing_count=0,
        review_count=len(items),
        error=message,
        items=items,
    )


def _validate_request_item(
    request: TagRequestItem,
    network_tags: List[NetworkTagHit],
    tracking_elements: List[PageElement],
    capture_elements: List[PageElement],
    rag_resolver: HybridTagJudgmentResolver,
) -> TagRequestValidationItem:
    best_mismatch: Optional[Dict[str, str]] = None
    best_actual_params: Optional[Dict[str, str]] = None
    best_trigger = "page_load"

    for hit in network_tags:
        event_name = (hit.event_name or "").strip()
        if event_name != request.event_name:
            continue

        actual_params = extract_ep_params(hit)
        parameter_match = match_request_parameters(request, actual_params)
        missing_fields = parameter_match.missing_fields
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
                substitutions=_substitutions_from_match(parameter_match),
                judgment_source="rule",
                judgment_reason="실제 GA 이벤트가 요청 명세와 일치합니다.",
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

    bounding_box = _find_capture_bounding_box(
        request,
        tracking_elements,
        capture_elements,
    )

    if best_mismatch is not None:
        return TagRequestValidationItem(
            request=request,
            status="missing",
            missing_fields=list(best_mismatch.keys()),
            bounding_box=bounding_box,
            substitutions=_extract_substitutions(request, best_actual_params or {}),
            judgment_source="rule",
            judgment_reason="실제 이벤트가 발생했지만 요청 명세와 일치하지 않습니다.",
            matched_tag=TagRequestMatch(
                event_name=request.event_name,
                ep_button_area=(best_actual_params or {}).get("ep_button_area", ""),
                ep_button_area2=(best_actual_params or {}).get("ep_button_area2", ""),
                ep_button_name=(best_actual_params or {}).get("ep_button_name", ""),
                trigger=best_trigger,
            ),
        )

    evidence = rag_resolver.find_for_request(
        event_name=request.event_name,
        ep_button_area=request.ep_button_area,
        ep_button_area2=request.ep_button_area2,
        ep_button_name=request.ep_button_name,
    )
    should_review = evidence.available and not evidence.matched

    return TagRequestValidationItem(
        request=request,
        status="review" if should_review else "missing",
        missing_fields=[] if should_review else ["event_name", *EP_FIELDS],
        bounding_box=bounding_box,
        substitutions=[],
        judgment_source="rag" if evidence.available else "rule",
        judgment_reason=(
            "실제 이벤트가 없고 유사한 ga4Common 근거도 부족해 확인이 필요합니다."
            if should_review
            else "유사한 ga4Common 태깅 사례는 있으나 실제 이벤트가 발생하지 않았습니다."
            if evidence.matched
            else "RAG 데이터를 사용할 수 없어 기존 기준으로 누락 처리했습니다."
        ),
        rag_score=evidence.score,
        matched_tag=None,
    )


def _validate_request_candidates(
    request: TagRequestItem,
    rules: List[TagRequestReferenceRule],
    tracking_elements: List[PageElement],
    capture_elements: List[PageElement],
) -> TagRequestValidationItem:
    rule_ids = {rule.rule_id for rule in rules}
    candidate_groups: Dict[str, List[PageElement]] = defaultdict(list)
    for element in tracking_elements:
        if not rule_ids.intersection(element.request_rule_ids):
            continue
        key = element.request_candidate_key or (
            f"{','.join(sorted(rule_ids.intersection(element.request_rule_ids)))}|"
            f"{element.selector}|{element.element_index}"
        )
        candidate_groups[key].append(element)

    if not candidate_groups:
        return TagRequestValidationItem(
            request=request,
            status="review",
            missing_fields=["dom_candidate"],
            judgment_source="rule",
            judgment_reason=(
                "ga4Common 규칙은 확인했지만 현재 페이지에서 검사할 대상 요소를 찾지 못했습니다."
            ),
        )

    candidate_results: List[TagRequestCandidateResult] = []
    for candidate_key, elements in candidate_groups.items():
        representative = _pick_candidate_representative(elements)
        bounding_box = _find_candidate_capture_box(
            candidate_key,
            representative,
            capture_elements,
        )
        candidate_results.append(_validate_candidate_element(
            request,
            candidate_key,
            representative,
            bounding_box,
        ))

    missing_count = sum(1 for result in candidate_results if result.status == "missing")
    review_count = sum(1 for result in candidate_results if result.status == "review")
    normal_count = sum(1 for result in candidate_results if result.status == "normal")
    tested_count = sum(1 for result in candidate_results if result.click_tested)
    if missing_count:
        status = "missing"
    elif review_count:
        status = "review"
    else:
        status = "normal"

    primary = next(
        (result for result in candidate_results if result.status == status),
        candidate_results[0],
    )
    missing_fields = list(dict.fromkeys(
        field
        for result in candidate_results
        if result.status != "normal"
        for field in result.missing_fields
    ))
    substitutions = _unique_substitutions(
        substitution
        for result in candidate_results
        if result.status == "normal"
        for substitution in result.substitutions
    )
    matched_tag = next(
        (result.matched_tag for result in candidate_results if result.matched_tag),
        None,
    )

    return TagRequestValidationItem(
        request=request,
        status=status,
        missing_fields=missing_fields,
        bounding_box=primary.bounding_box,
        substitutions=substitutions,
        match_source="rule",
        judgment_source="rule",
        judgment_reason=(
            f"대상 후보 {len(candidate_results)}개 중 정상 {normal_count}개, "
            f"누락 {missing_count}개, 확인 필요 {review_count}개입니다."
        ),
        matched_tag=matched_tag,
        candidate_count=len(candidate_results),
        tested_count=tested_count,
        matched_count=normal_count,
        missing_candidate_count=missing_count,
        review_candidate_count=review_count,
        candidate_results=candidate_results,
    )


def _pick_candidate_representative(elements: List[PageElement]) -> PageElement:
    return min(
        elements,
        key=lambda element: (
            0 if element.click_tested and element.click_tracking_events else 1,
            0 if element.click_tested else 1,
            0 if element.bounding_box else 1,
            element.element_index,
        ),
    )


def _find_candidate_capture_box(
    candidate_key: str,
    tracking_element: PageElement,
    capture_elements: List[PageElement],
) -> Optional[BoundingBox]:
    exact = next(
        (
            element for element in capture_elements
            if element.request_candidate_key == candidate_key and element.bounding_box
        ),
        None,
    )
    if exact:
        return exact.bounding_box
    corresponding = _find_corresponding_capture_element(tracking_element, capture_elements)
    return corresponding.bounding_box if corresponding else None


def _validate_candidate_element(
    request: TagRequestItem,
    candidate_key: str,
    element: PageElement,
    bounding_box: Optional[BoundingBox],
) -> TagRequestCandidateResult:
    if not element.click_tested:
        return TagRequestCandidateResult(
            candidate_key=candidate_key,
            element_selector=element.selector,
            element_text=element.text or "",
            status="review",
            click_tested=False,
            bounding_box=bounding_box,
            missing_fields=["click_unavailable"],
            reason="요소를 클릭하지 못해 실제 이벤트 발생 여부를 확인할 수 없습니다.",
        )

    target_events = [
        event
        for event in element.click_tracking_events
        if event_name_from_dict(event) == request.event_name
    ]
    if not target_events:
        return TagRequestCandidateResult(
            candidate_key=candidate_key,
            element_selector=element.selector,
            element_text=element.text or "",
            status="missing",
            click_tested=True,
            bounding_box=bounding_box,
            missing_fields=["event_name", *EP_FIELDS],
            reason="클릭은 수행됐지만 요청한 click_* 이벤트가 발생하지 않았습니다.",
        )

    evaluated: List[tuple[RequestParameterMatch, Dict[str, str], Dict[str, Any]]] = []
    for event in target_events:
        actual_params = params_from_event_dict(event)
        evaluated.append((
            match_request_parameters(request, actual_params),
            actual_params,
            event,
        ))
    parameter_match, actual_params, event = min(
        evaluated,
        key=lambda result: len(result[0].missing_fields),
    )
    matched_tag = TagRequestMatch(
        event_name=request.event_name,
        ep_button_area=actual_params.get("ep_button_area", ""),
        ep_button_area2=actual_params.get("ep_button_area2", ""),
        ep_button_name=actual_params.get("ep_button_name", ""),
        trigger=str(event.get("trigger") or "click"),
    )
    return TagRequestCandidateResult(
        candidate_key=candidate_key,
        element_selector=element.selector,
        element_text=element.text or "",
        status="normal" if parameter_match.matched else "missing",
        click_tested=True,
        bounding_box=bounding_box,
        missing_fields=parameter_match.missing_fields,
        substitutions=_substitutions_from_match(parameter_match),
        matched_tag=matched_tag,
        reason=(
            "실제 GA 이벤트가 요청 명세와 일치합니다."
            if parameter_match.matched
            else "실제 이벤트는 발생했지만 요청 명세와 일치하지 않습니다."
        ),
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
    return match_request_parameters(request, actual_params).missing_fields


def _extract_substitutions(request: TagRequestItem, actual_params: Dict[str, str]) -> List[TagRequestSubstitution]:
    return _substitutions_from_match(match_request_parameters(request, actual_params))


def _substitutions_from_match(
    parameter_match: RequestParameterMatch,
) -> List[TagRequestSubstitution]:
    return [
        TagRequestSubstitution(
            field=binding.field,
            placeholder=binding.placeholder,
            value=binding.value,
        )
        for binding in parameter_match.field_bindings
    ]


def _unique_substitutions(
    substitutions,
) -> List[TagRequestSubstitution]:
    unique: List[TagRequestSubstitution] = []
    seen: set[tuple[str, str, str]] = set()
    for substitution in substitutions:
        key = (
            substitution.field,
            substitution.placeholder,
            substitution.value,
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(substitution)
    return unique
