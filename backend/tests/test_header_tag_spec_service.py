from models.bounding_box import BoundingBox
from models.page_element import PageElement
from services.ga4_channel_service import resolve_channel_or_none
from services.header_tag_spec_service import (
    build_header_inferred_params,
    is_header_element,
    is_misassigned_header_event,
)
from services.missing_tag_spec_service import suggest_spec_from_ga4common_reference
from services.tag_classification_service import classify_network_tags


def _header_element(text: str, **overrides) -> PageElement:
    defaults = {
        "selector": "a.currency",
        "text": text,
        "element_type": "a",
        "bounding_box": BoundingBox(x=900, y=40, width=40, height=20),
        "click_tested": True,
    }
    defaults.update(overrides)
    return PageElement(**defaults)


def test_header_exchange_rate_uses_common_header_spec():
    element = _header_element("KRW")
    channel = resolve_channel_or_none("https://www.hddfs.com/shop/dm/best/monthly.do")
    params = build_header_inferred_params(channel, element)

    assert params is not None
    assert params["event_name"] == "click_PC_국문_공통"
    assert params["ep_button_area"] == "Header"
    assert params["ep_button_area2"] == "Header"
    assert params["ep_button_name"] == "KRW"


def test_suggest_spec_does_not_recommend_luxury_hall_for_header():
    element = _header_element("CNY")

    spec = suggest_spec_from_ga4common_reference(
        "https://www.hddfs.com/shop/dm/best/monthly.do",
        element,
    )

    assert spec["event_name"] == "click_PC_국문_공통"
    assert "명품관" not in spec["event_name"]
    assert spec["ep_button_area"] == "Header"


def test_misassigned_header_event_is_flagged():
    element = _header_element(
        "KRW",
        click_tracking_events=[{
            "event_name": "click_PC_국문_명품관_006801",
            "ep_button_area": "슈에무라",
            "ep_button_area2": "슈에무라_카테고리메뉴",
            "ep_button_name": "카테고리메뉴_테스트",
        }],
    )

    tracked, missing, _review = classify_network_tags(
        [],
        [element],
        page_url="https://www.hddfs.com/shop/dm/best/monthly.do",
    )

    assert tracked == []
    assert len(missing) == 1
    assert "비공통 이벤트" in missing[0].issue
    assert missing[0].recommended_ga_spec["event_name"] == "click_PC_국문_공통"
    assert is_misassigned_header_event("click_PC_국문_명품관_006801")
    assert is_header_element(element)
