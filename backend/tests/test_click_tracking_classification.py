from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from services.element_grouping_service import apply_group_tracking_inheritance
from services.tag_classification_service import classify_network_tags
from services.tracking.click_detector import (
    _filter_events_for_element_label,
    attach_click_network_hits_to_elements,
)


def _best_product_element(**overrides) -> PageElement:
    base = {
        "selector": ".area-display-bests .list-product__searchlist li a",
        "text": "1 시어 버터 핸드 크림 150ML 록시땅 시어 버터 핸드 크림 150ML",
        "element_type": "a",
        "bounding_box": BoundingBox(x=10, y=200, width=300, height=80),
        "click_tested": True,
        "click_tracking_events": [{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "베스트_탭_베스트상품",
            "ep_button_name": "상품_록시땅_시어버터핸드크림150ML",
        }],
    }
    base.update(overrides)
    return PageElement(**base)


def test_filter_events_keeps_ga_interaction_even_when_ep_name_differs():
    element = _best_product_element(click_tracking_events=[])
    events = [{
        "event_name": "click_PC_국문_베스트",
        "ep_button_area": "베스트",
        "ep_button_area2": "베스트_탭_베스트상품",
        "ep_button_name": "상품_록시땅_시어버터핸드크림150ML",
    }]

    filtered = _filter_events_for_element_label(element, events)

    assert filtered == events


def test_classify_marks_click_tested_element_as_tracked_despite_name_mismatch():
    element = _best_product_element()

    tracked, missing, review = classify_network_tags(
        [],
        [element],
        page_url="https://www.hddfs.com/shop/dm/best/monthly.do",
    )

    assert len(tracked) == 1
    assert missing == []
    assert review == []
    assert tracked[0].tracking_data["ep_button_name"] == "상품_록시땅_시어버터핸드크림150ML"


def test_attach_click_network_hits_without_ep_name_match():
    element = _best_product_element(click_tracking_events=[], click_tested=True)
    hits = [
        NetworkTagHit(
            event_name="click_PC_국문_베스트",
            ep_button_area="베스트",
            ep_button_area2="베스트_탭_베스트상품",
            ep_button_name="상품_록시땅_시어버터핸드크림150ML",
            trigger="click",
        )
    ]

    attached = attach_click_network_hits_to_elements([element], hits)

    assert attached == 1
    assert len(element.click_tracking_events) == 1


def _grouped_best_product(index: int, text: str, **overrides) -> PageElement:
    defaults = {
        "element_index": index,
        "text": text,
        "bounding_box": BoundingBox(x=10, y=200 + (index * 120), width=300, height=80),
        "click_group_id": "structure:container>ul>li>a",
        "click_group_size": 3,
        "click_group_representative": index == 0,
        "click_tested": index == 0,
        "click_tracking_events": [],
    }
    defaults.update(overrides)
    return _best_product_element(**defaults)


def test_group_inheritance_marks_siblings_tracked_when_rep_verified():
    rep = _grouped_best_product(
        0,
        "1 시어 버터 핸드 크림 150ML",
        click_tracking_events=[{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "베스트_탭_베스트상품",
            "ep_button_name": "상품_록시땅_시어버터핸드크림150ML",
        }],
    )
    sibling_60 = _grouped_best_product(60, "60 시어 버터 풋 크림 150ML")
    sibling_61 = _grouped_best_product(61, "61 아토베리어365 하이드로 수딩크림")

    tracked, missing, review = classify_network_tags(
        [],
        [rep, sibling_60, sibling_61],
        page_url="https://www.hddfs.com/shop/dm/best/monthly.do",
    )

    assert missing == []
    assert review == []
    assert len(tracked) == 3
    assert all(item.verification_source == "group_inherited" for item in tracked[1:])
    assert tracked[1].element_text.startswith("60")


def test_apply_group_tracking_inheritance_uses_non_representative_source():
    verified_member = _grouped_best_product(
        5,
        "6 AMBIENT POWDER",
        click_group_representative=False,
        click_tested=True,
        click_tracking_events=[{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "베스트_탭_베스트상품",
            "ep_button_name": "상품_아워글래스_AMBIENTPOWDER",
        }],
    )
    rep = _grouped_best_product(0, "1 시어 버터 핸드 크림 150ML")
    sibling = _grouped_best_product(60, "60 시어 버터 풋 크림 150ML")

    tracked, issues = apply_group_tracking_inheritance([], [], [rep, verified_member, sibling])

    assert issues == []
    assert len(tracked) == 3
    assert sum(item.verification_source == "direct" for item in tracked) == 1
    assert sum(item.verification_source == "group_inherited" for item in tracked) == 2
    assert any(item.element_text.startswith("1") for item in tracked)
    assert any(item.element_text.startswith("60") for item in tracked)
