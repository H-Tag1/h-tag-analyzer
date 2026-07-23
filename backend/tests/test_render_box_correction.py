from models.ai_analysis_item import AiAnalysisItem
from models.bounding_box import BoundingBox
from models.excluded_analysis_item import ExcludedAnalysisItem
from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem
from services.batch_scan_service import _apply_render_box_corrections


def _element(text, box, render_box=None):
    return PageElement(
        selector="a.nav",
        text=text,
        element_type="a",
        bounding_box=box,
        render_box=render_box,
    )


def _tracked(text, box):
    return TrackedAnalysisItem(
        element_selector="a.nav",
        element_text=text,
        bounding_box=box,
        tracking_description="click",
        tracking_data={},
    )


def test_occluded_item_box_moved_to_render_box():
    # 가려진 유령(y=168)은 render_box(y=212)를 갖는다.
    phantom = _element("세일", BoundingBox(x=398, y=168, width=28, height=22),
                       render_box=BoundingBox(x=394, y=212, width=30, height=22))
    item = _tracked("세일", BoundingBox(x=398, y=168, width=28, height=22))

    _apply_render_box_corrections([phantom], [item])

    # 렌더용 item 박스는 212로 이동
    assert round(item.bounding_box.y) == 212
    assert round(item.bounding_box.x) == 394
    # 로직용 원본 element.bounding_box는 불변
    assert round(phantom.bounding_box.y) == 168


def test_visible_item_box_unchanged():
    # render_box 없는 보이는 요소는 그대로 둔다.
    real = _element("세일", BoundingBox(x=394, y=212, width=30, height=22))
    item = _tracked("세일", BoundingBox(x=394, y=212, width=30, height=22))

    _apply_render_box_corrections([real], [item])

    assert round(item.bounding_box.y) == 212


def test_correction_applies_across_all_item_types():
    phantom = _element("혜택", BoundingBox(x=548, y=168, width=28, height=22),
                       render_box=BoundingBox(x=546, y=212, width=30, height=22))
    tracked = _tracked("혜택", BoundingBox(x=548, y=168, width=28, height=22))
    excluded = ExcludedAnalysisItem(
        element_selector="a.nav",
        element_text="혜택",
        bounding_box=BoundingBox(x=548, y=168, width=28, height=22),
        exclusion_reason="marketing-irrelevant",
    )
    issue = AiAnalysisItem(
        element_selector="a.nav",
        element_text="혜택",
        bounding_box=BoundingBox(x=548, y=168, width=28, height=22),
        issue="missing",
        recommended_ga_spec={},
    )

    _apply_render_box_corrections([phantom], [tracked], [excluded], [issue])

    assert round(tracked.bounding_box.y) == 212
    assert round(excluded.bounding_box.y) == 212
    assert round(issue.bounding_box.y) == 212


def test_no_render_box_is_noop():
    real = _element("세일", BoundingBox(x=394, y=212, width=30, height=22))
    item = _tracked("세일", BoundingBox(x=394, y=212, width=30, height=22))
    # render_box가 하나도 없으면 아무것도 하지 않는다 (early return).
    _apply_render_box_corrections([real], [item])
    assert round(item.bounding_box.y) == 212


def test_same_coordinates_do_not_correct_a_different_element():
    phantom = _element(
        "세일",
        BoundingBox(x=398, y=168, width=28, height=22),
        render_box=BoundingBox(x=394, y=212, width=30, height=22),
    )
    other = TrackedAnalysisItem(
        element_selector="button.nav",
        element_text="베스트",
        bounding_box=BoundingBox(x=398, y=168, width=28, height=22),
        tracking_description="click",
        tracking_data={},
    )

    _apply_render_box_corrections([phantom], [other])

    assert round(other.bounding_box.x) == 398
    assert round(other.bounding_box.y) == 168
