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

logger = logging.getLogger(__name__)

MIN_GROUP_SIZE = 2
LAYOUT_ROW_TOLERANCE_PX = 48
LAYOUT_COLUMN_TOLERANCE_PX = 48


def _normalize_label(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", "", text.strip())


def _structure_group_members_compatible(members: List[PageElement]) -> bool:
    drawer_flags = {bool(member.in_hamburger_drawer) for member in members}
    if len(drawer_flags) > 1:
        return False

    ys = [member.bounding_box.y for member in members if member.bounding_box]
    if ys and max(ys) - min(ys) > LAYOUT_ROW_TOLERANCE_PX:
        return False

    labels = {_normalize_label(member.text) for member in members if _normalize_label(member.text)}
    if len(labels) > 1:
        return False

    return True


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
        if existing_name.startswith("탭_") or existing_name.startswith("배너_") or existing_name.startswith("메뉴_"):
            prefix = existing_name.split("_", 1)[0] + "_"
            event["ep_button_name"] = f"{prefix}{label}"
        elif existing_name:
            event["ep_button_name"] = label
        else:
            event["ep_button_name"] = label
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
            if _normalize_label(member.text) != _normalize_label(representative.text):
                continue

            member.click_tested = representative.click_tested
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
    if existing_name.startswith("탭_") or existing_name.startswith("배너_") or existing_name.startswith("메뉴_"):
        adapted["ep_button_name"] = f"{existing_name.split('_', 1)[0]}_{label}"
    else:
        adapted["ep_button_name"] = label
    return adapted


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

        rep_tracked = next(
            (
                item for item in tracked_items
                if _overlay_key_from_item(item.element_selector, item.element_text) == rep_key
            ),
            None,
        )
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

        for member in members:
            if member.element_index == representative.element_index:
                continue
            if is_hamburger_drawer_element(member):
                continue

            member_key = _element_overlay_key(member)
            if member_key in classified_keys:
                continue
            if not member.bounding_box:
                continue

            if rep_tracked:
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
                        }
                    )
                )
            elif rep_issue or rep_review:
                source_item = rep_issue or rep_review
                if source_item is None:
                    continue
                adapted_spec = copy.deepcopy(source_item.recommended_ga_spec)
                adapted_spec["element_selector"] = member.selector
                adapted_spec["ep_button_name"] = member.text or adapted_spec.get("ep_button_name", "")
                target = expanded_issues if rep_issue else expanded_reviews
                target.append(
                    source_item.model_copy(
                        update={
                            "element_selector": member.selector,
                            "element_text": member.text or "",
                            "bounding_box": member.bounding_box,
                            "recommended_ga_spec": adapted_spec,
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
