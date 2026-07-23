import copy
import logging
import re
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

from models.ai_analysis_item import AiAnalysisItem
from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem
from services.click_optimization_service import apply_llm_click_clustering
from services.hamburger_menu_filter import is_hamburger_drawer_element

from services.tracking.event_normalizer import (
    EP_BUTTON_NAME_VALUE_PREFIXES,
    element_has_verified_click_tracking,
    event_name_from_dict,
    params_from_event_dict,
    prefer_click_events,
)

logger = logging.getLogger(__name__)

MIN_GROUP_SIZE = 2
LAYOUT_ROW_TOLERANCE_PX = 48
LAYOUT_COLUMN_TOLERANCE_PX = 48
VARIABLE_EP_BUTTON_NAME_PREFIXES = EP_BUTTON_NAME_VALUE_PREFIXES


def _normalize_label(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", "", text.strip())


def _structure_group_members_compatible(members: List[PageElement]) -> bool:
    drawer_flags = {bool(member.in_hamburger_drawer) for member in members}
    if len(drawer_flags) > 1:
        return False

    xs = [member.bounding_box.x for member in members if member.bounding_box]
    ys = [member.bounding_box.y for member in members if member.bounding_box]
    if not xs or not ys:
        return True

    x_spread = max(xs) - min(xs)
    y_spread = max(ys) - min(ys)
    # Horizontal siblings (same row) or vertical menu/tab list (same column).
    if y_spread <= LAYOUT_ROW_TOLERANCE_PX:
        return True
    if x_spread <= LAYOUT_COLUMN_TOLERANCE_PX:
        return True
    return False


def _pick_representative_index(members: List[PageElement]) -> int:
    if not members:
        raise ValueError("Cannot pick representative from empty group")

    def rank(element: PageElement) -> Tuple[int, int, int]:
        text_rank = 0 if (element.text or "").strip() else 1
        static_rank = 0 if element.static_tracking_signals else 1
        return (text_rank, static_rank, element.element_index)

    return min(members, key=rank).element_index


def _apply_group_assignment(
    elements: List[PageElement],
    group_id: str,
    member_indices: List[int],
    representative_index: int,
) -> None:
    if len(member_indices) < MIN_GROUP_SIZE:
        return

    index_map = {element.element_index: element for element in elements}
    members = [index_map[index] for index in member_indices if index in index_map]
    if len(members) < MIN_GROUP_SIZE:
        return
    if representative_index not in index_map:
        representative_index = _pick_representative_index(members)

    for member in members:
        member.click_group_id = group_id
        member.click_group_size = len(members)
        member.click_group_representative = member.element_index == representative_index


def _group_by_structure_key(elements: List[PageElement]) -> int:
    buckets: Dict[str, List[PageElement]] = defaultdict(list)
    for element in elements:
        key = (element.structure_group_key or "").strip()
        if key:
            buckets[key].append(element)

    group_count = 0
    for key, members in buckets.items():
        if len(members) < MIN_GROUP_SIZE:
            continue
        if not _structure_group_members_compatible(members):
            continue
        representative_index = _pick_representative_index(members)
        group_id = f"structure:{key}"
        _apply_group_assignment(
            elements,
            group_id,
            [member.element_index for member in members],
            representative_index,
        )
        group_count += 1
    return group_count


def _group_by_selector_layout(elements: List[PageElement]) -> int:
    ungrouped = [element for element in elements if not element.click_group_id]
    by_selector: Dict[str, List[PageElement]] = defaultdict(list)
    for element in ungrouped:
        by_selector[element.selector].append(element)

    group_count = 0
    for selector, members in by_selector.items():
        if len(members) < MIN_GROUP_SIZE:
            continue

        rows: List[List[PageElement]] = []
        for member in sorted(members, key=lambda item: (item.bounding_box.y if item.bounding_box else 0, item.element_index)):
            if not member.bounding_box:
                continue
            placed = False
            for row in rows:
                anchor = row[0].bounding_box
                if anchor and abs(member.bounding_box.y - anchor.y) <= LAYOUT_ROW_TOLERANCE_PX:
                    row.append(member)
                    placed = True
                    break
            if not placed:
                rows.append([member])

        columns: List[List[PageElement]] = []
        for member in sorted(members, key=lambda item: (item.bounding_box.x if item.bounding_box else 0, item.element_index)):
            if not member.bounding_box:
                continue
            placed = False
            for column in columns:
                anchor = column[0].bounding_box
                if anchor and abs(member.bounding_box.x - anchor.x) <= LAYOUT_COLUMN_TOLERANCE_PX:
                    column.append(member)
                    placed = True
                    break
            if not placed:
                columns.append([member])

        clusters = [cluster for cluster in rows + columns if len(cluster) >= MIN_GROUP_SIZE]
        seen_indices: set[int] = set()
        for cluster in clusters:
            unique_members = [item for item in cluster if item.element_index not in seen_indices]
            if len(unique_members) < MIN_GROUP_SIZE:
                continue
            if not _structure_group_members_compatible(unique_members):
                continue
            for item in unique_members:
                seen_indices.add(item.element_index)
            representative_index = _pick_representative_index(unique_members)
            group_id = f"layout:{selector}:{representative_index}"
            _apply_group_assignment(
                elements,
                group_id,
                [item.element_index for item in unique_members],
                representative_index,
            )
            group_count += 1
    return group_count


def apply_click_grouping(elements: List[PageElement]) -> List[PageElement]:
    if not elements:
        return elements

    for element in elements:
        element.click_group_id = None
        element.click_group_representative = True
        element.click_group_size = 1

    structure_groups = _group_by_structure_key(elements)
    layout_groups = _group_by_selector_layout(elements)

    grouped_elements = sum(1 for element in elements if element.click_group_id)
    representatives = sum(1 for element in elements if element.click_group_representative)
    logger.info(
        "Heuristic click grouping: structure_groups=%d layout_groups=%d grouped_elements=%d representatives=%d",
        structure_groups,
        layout_groups,
        grouped_elements,
        representatives,
    )
    return elements


async def apply_click_grouping_with_llm(elements: List[PageElement]) -> List[PageElement]:
    elements = apply_click_grouping(elements)
    return await apply_llm_click_clustering(elements)


def should_click_for_verification(element: PageElement) -> bool:
    if element.request_rule_ids:
        return True
    if is_hamburger_drawer_element(element):
        return False
    if not element.click_group_id:
        return True
    return element.click_group_representative


def _has_direct_click_result(element: PageElement) -> bool:
    return (
        element.click_tested
        and not element.click_result_inherited
    )


def _adapt_ep_button_name_for_member(existing_name: str, member_label: str) -> str:
    if not member_label:
        return existing_name
    for prefix in VARIABLE_EP_BUTTON_NAME_PREFIXES:
        if existing_name.startswith(prefix):
            return f"{prefix}{member_label}"
    if existing_name:
        return member_label
    return member_label


def _members_have_variable_labels(members: List[PageElement]) -> bool:
    labels = {_normalize_label(member.text) for member in members if _normalize_label(member.text)}
    return len(labels) > 1


def _adapt_recommended_spec_for_member(
    spec: Dict[str, Any],
    member: PageElement,
) -> Dict[str, Any]:
    adapted = copy.deepcopy(spec)
    adapted["element_selector"] = member.selector
    label = _normalize_label(member.text)
    if label:
        existing_name = str(adapted.get("ep_button_name") or "")
        adapted["ep_button_name"] = _adapt_ep_button_name_for_member(existing_name, label)
    return adapted


def _adapt_events_for_member(
    events: List[Dict[str, Any]],
    member: PageElement,
) -> List[Dict[str, Any]]:
    if not events:
        return []

    copied = copy.deepcopy(events)
    label = _normalize_label(member.text)
    if not label:
        return copied

    for event in copied:
        if not isinstance(event, dict):
            continue
        existing_name = str(event.get("ep_button_name") or "")
        event["ep_button_name"] = _adapt_ep_button_name_for_member(existing_name, label)
    return copied


def propagate_group_click_results(elements: List[PageElement]) -> List[PageElement]:
    groups: Dict[str, List[PageElement]] = defaultdict(list)
    for element in elements:
        if element.click_group_id:
            groups[element.click_group_id].append(element)

    propagated = 0
    for group_id, members in groups.items():
        representative = next((member for member in members if member.click_group_representative), None)
        if not representative:
            representative = members[0]
            representative.click_group_representative = True

        for member in members:
            if member.element_index == representative.element_index:
                continue
            if member.request_rule_ids or member.click_tested:
                continue

            member.click_tested = representative.click_tested
            member.click_result_inherited = representative.click_tested
            member.click_tracking_events = _adapt_events_for_member(
                representative.click_tracking_events,
                member,
            )
            member.has_ga_tag = representative.has_ga_tag
            member.tracking_data = copy.deepcopy(representative.tracking_data)
            member.tracking_methods = list(representative.tracking_methods)
            propagated += 1

    if propagated:
        logger.info("Propagated click results to %d grouped sibling elements", propagated)
    return elements


def _element_overlay_key(element: PageElement) -> str:
    return f"{element.selector}|{(element.text or '').strip()}"


def _overlay_key_from_item(selector: str, text: str) -> str:
    return f"{selector}|{text.strip()}"


def _adapt_tracking_data_for_member(
    tracking_data: Dict[str, Any],
    member: PageElement,
) -> Dict[str, Any]:
    adapted = copy.deepcopy(tracking_data)
    label = _normalize_label(member.text)
    if not label:
        return adapted

    existing_name = str(adapted.get("ep_button_name") or "")
    adapted["ep_button_name"] = _adapt_ep_button_name_for_member(existing_name, label)
    return adapted


def _tracked_item_from_verified_element(element: PageElement) -> Optional[TrackedAnalysisItem]:
    if not element.bounding_box or not element_has_verified_click_tracking(element):
        return None

    for click_event in prefer_click_events(element.click_tracking_events):
        event_name = event_name_from_dict(click_event)
        params = params_from_event_dict(click_event)
        return TrackedAnalysisItem(
            element_selector=element.selector,
            element_text=element.text or "",
            bounding_box=element.bounding_box,
            tracking_description="GA4 collect (click)",
            tracking_data={
                "event_name": event_name,
                "trigger": "click",
                **params,
            },
            detection_methods=["click_datalayer"],
            verification_source="direct",
        )
    return None


def _find_group_tracking_source(
    members: List[PageElement],
    tracked_items: List[TrackedAnalysisItem],
) -> Tuple[Optional[PageElement], Optional[TrackedAnalysisItem]]:
    tracked_by_key = {
        _overlay_key_from_item(item.element_selector, item.element_text): item
        for item in tracked_items
    }

    for member in members:
        member_key = _element_overlay_key(member)
        if member_key in tracked_by_key:
            return member, tracked_by_key[member_key]

    for member in members:
        tracked_item = _tracked_item_from_verified_element(member)
        if tracked_item:
            return member, tracked_item

    return None, None


def apply_group_tracking_inheritance(
    tracked_items: List[TrackedAnalysisItem],
    issues: List[AiAnalysisItem],
    elements: Optional[List[PageElement]],
) -> Tuple[List[TrackedAnalysisItem], List[AiAnalysisItem]]:
    if not elements:
        return tracked_items, issues

    groups: Dict[str, List[PageElement]] = defaultdict(list)
    for element in elements:
        if element.click_group_id and element.bounding_box:
            groups[element.click_group_id].append(element)

    expanded_tracked = list(tracked_items)
    tracked_keys = {
        _overlay_key_from_item(item.element_selector, item.element_text)
        for item in expanded_tracked
    }
    promoted_keys: set[str] = set()
    inherited_count = 0

    for members in groups.values():
        if len(members) < MIN_GROUP_SIZE:
            continue

        source_member, source_tracked = _find_group_tracking_source(members, expanded_tracked)
        if not source_member or not source_tracked:
            continue

        source_label = (source_member.text or "").strip() or source_member.selector
        source_key = _element_overlay_key(source_member)
        if source_key not in tracked_keys:
            expanded_tracked.append(source_tracked)
            tracked_keys.add(source_key)

        for member in members:
            if member.element_index == source_member.element_index:
                continue
            if is_hamburger_drawer_element(member):
                continue
            if _has_direct_click_result(member):
                continue

            member_key = _element_overlay_key(member)
            if member_key in tracked_keys:
                continue

            expanded_tracked.append(
                source_tracked.model_copy(
                    update={
                        "element_selector": member.selector,
                        "element_text": member.text or "",
                        "bounding_box": member.bounding_box,
                        "tracking_data": _adapt_tracking_data_for_member(
                            source_tracked.tracking_data,
                            member,
                        ),
                        "tracking_description": (
                            "그룹 내 검증된 요소 기준 정상 처리 "
                            f"(기준: {source_label})"
                        ),
                        "verification_source": "group_inherited",
                    }
                )
            )
            tracked_keys.add(member_key)
            promoted_keys.add(member_key)
            inherited_count += 1

    if not promoted_keys:
        return expanded_tracked, issues

    filtered_issues = [
        issue
        for issue in issues
        if _overlay_key_from_item(issue.element_selector, issue.element_text) not in promoted_keys
    ]
    logger.info(
        "Applied group tracking inheritance to %d sibling elements (%d issues removed)",
        inherited_count,
        len(issues) - len(filtered_issues),
    )
    return expanded_tracked, filtered_issues


def expand_grouped_overlay_results(
    tracked_items: List[TrackedAnalysisItem],
    issues: List[AiAnalysisItem],
    elements: Optional[List[PageElement]],
    review_items: Optional[List[AiAnalysisItem]] = None,
) -> Tuple[List[TrackedAnalysisItem], List[AiAnalysisItem], List[AiAnalysisItem]]:
    source_reviews = review_items or []
    if not elements:
        return tracked_items, issues, source_reviews

    classified_keys = {
        _overlay_key_from_item(item.element_selector, item.element_text)
        for item in tracked_items
    }
    classified_keys.update(
        _overlay_key_from_item(item.element_selector, item.element_text)
        for item in issues
    )
    classified_keys.update(
        _overlay_key_from_item(item.element_selector, item.element_text)
        for item in source_reviews
    )

    groups: Dict[str, List[PageElement]] = defaultdict(list)
    for element in elements:
        if element.click_group_id and element.bounding_box:
            groups[element.click_group_id].append(element)

    expanded_tracked = list(tracked_items)
    expanded_issues = list(issues)
    expanded_reviews = list(source_reviews)
    inherited_count = 0

    for group_id, members in groups.items():
        if len(members) < MIN_GROUP_SIZE:
            continue

        representative = next((member for member in members if member.click_group_representative), members[0])
        rep_key = _element_overlay_key(representative)

        source_member, rep_tracked = _find_group_tracking_source(members, tracked_items)
        if source_member is None:
            rep_tracked = None
        elif rep_tracked is None:
            rep_tracked = next(
                (
                    item for item in tracked_items
                    if _overlay_key_from_item(item.element_selector, item.element_text) == rep_key
                ),
                None,
            )
        else:
            representative = source_member
            rep_key = _element_overlay_key(representative)

        rep_issue = next(
            (
                item for item in issues
                if _overlay_key_from_item(item.element_selector, item.element_text) == rep_key
            ),
            None,
        )
        rep_review = next(
            (
                item for item in source_reviews
                if _overlay_key_from_item(item.element_selector, item.element_text) == rep_key
            ),
            None,
        )
        if not rep_tracked and not rep_issue and not rep_review:
            continue

        rep_label = (representative.text or "").strip() or representative.selector

        if rep_issue:
            rep_index = next(
                (
                    idx for idx, issue in enumerate(expanded_issues)
                    if _overlay_key_from_item(issue.element_selector, issue.element_text) == rep_key
                ),
                None,
            )
            if rep_index is not None:
                expanded_issues[rep_index] = expanded_issues[rep_index].model_copy(
                    update={
                        "verification_source": "direct",
                        "click_group_id": group_id,
                    }
                )
                rep_issue = expanded_issues[rep_index]

        for member in members:
            if member.element_index == representative.element_index:
                continue
            if is_hamburger_drawer_element(member):
                continue
            if _has_direct_click_result(member):
                continue

            member_key = _element_overlay_key(member)
            if not member.bounding_box:
                continue

            if rep_tracked:
                member_overlay_key = _overlay_key_from_item(member.selector, member.text or "")
                expanded_issues = [
                    issue for issue in expanded_issues
                    if _overlay_key_from_item(issue.element_selector, issue.element_text) != member_overlay_key
                ]
                expanded_reviews = [
                    review for review in expanded_reviews
                    if _overlay_key_from_item(review.element_selector, review.element_text) != member_overlay_key
                ]
                classified_keys.discard(member_overlay_key)

                already_tracked = any(
                    _overlay_key_from_item(item.element_selector, item.element_text) == member_key
                    for item in expanded_tracked
                )
                if not already_tracked:
                    expanded_tracked.append(
                        rep_tracked.model_copy(
                            update={
                                "element_selector": member.selector,
                                "element_text": member.text or "",
                                "bounding_box": member.bounding_box,
                                "tracking_data": _adapt_tracking_data_for_member(
                                    rep_tracked.tracking_data,
                                    member,
                                ),
                                "tracking_description": (
                                    "그룹 대표 요소 클릭 검증으로 정상 처리 "
                                    f"(대표: {(representative.text or '').strip() or representative.selector})"
                                ),
                                "verification_source": "group_inherited",
                            }
                        )
                    )
                classified_keys.add(member_key)
                inherited_count += 1
                continue

            if member_key in classified_keys:
                continue

            if rep_issue or rep_review:
                source_item = rep_issue or rep_review
                if source_item is None:
                    continue
                base_spec = (
                    rep_issue.recommended_ga_spec
                    if rep_issue
                    else source_item.recommended_ga_spec
                )
                adapted_spec = _adapt_recommended_spec_for_member(base_spec, member)
                inherited_issue = (
                    f"그룹 대표 요소 누락과 동일 (대표: {rep_label})"
                    if rep_issue
                    else source_item.issue
                )
                target = expanded_issues if rep_issue else expanded_reviews
                target.append(
                    source_item.model_copy(
                        update={
                            "element_selector": member.selector,
                            "element_text": member.text or "",
                            "bounding_box": member.bounding_box,
                            "issue": inherited_issue,
                            "recommended_ga_spec": adapted_spec,
                            "verification_source": "group_inherited" if rep_issue else "direct",
                            "click_group_id": group_id,
                        }
                    )
                )

            classified_keys.add(member_key)
            inherited_count += 1

    if inherited_count:
        logger.info(
            "Expanded grouped overlay results to %d sibling elements across %d groups",
            inherited_count,
            len(groups),
        )

    return expanded_tracked, expanded_issues, expanded_reviews
