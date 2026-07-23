from models.bounding_box import BoundingBox
from models.page_element import PageElement
from services.page_scan_service import _shift_elements_to_screenshot


def _element(box: BoundingBox, render_box: BoundingBox | None = None) -> PageElement:
    return PageElement(
        selector="a.card",
        text="상품",
        element_type="a",
        bounding_box=box,
        render_box=render_box,
    )


def test_shift_clips_boxes_to_screenshot_edges():
    element = _element(
        BoundingBox(x=1300, y=250, width=300, height=100),
        render_box=BoundingBox(x=-40, y=260, width=100, height=80),
    )

    shifted = _shift_elements_to_screenshot([element], 200, 1440, 900)[0]

    assert shifted.bounding_box == BoundingBox(x=1300, y=50, width=140, height=100)
    assert shifted.render_box == BoundingBox(x=0, y=60, width=60, height=80)


def test_shift_removes_boxes_fully_outside_screenshot():
    element = _element(
        BoundingBox(x=1500, y=250, width=100, height=100),
        render_box=BoundingBox(x=100, y=1200, width=50, height=50),
    )

    shifted = _shift_elements_to_screenshot([element], 0, 1440, 900)[0]

    assert shifted.bounding_box is None
    assert shifted.render_box is None
