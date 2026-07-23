import asyncio

from playwright.async_api import async_playwright

from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from services.element_grouping_service import (
    apply_group_tracking_inheritance,
    propagate_group_click_results,
)
from services.tag_classification_service import classify_network_tags
from services.tracking.click_detector import (
    CLICK_EVENT_WAIT_MS,
    REQUEST_CLICK_EVENT_WAIT_MS,
    _click_initial_element,
    _click_event_wait_ms,
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


def test_filter_events_rejects_ga_interaction_when_ep_name_differs():
    element = _best_product_element(click_tracking_events=[])
    events = [{
        "event_name": "click_PC_국문_베스트",
        "ep_button_area": "베스트",
        "ep_button_area2": "베스트_탭_베스트상품",
        "ep_button_name": "상품_다른상품",
    }]

    filtered = _filter_events_for_element_label(element, events)

    assert filtered == []


def test_filter_events_keeps_contextual_name_for_request_rule_candidate():
    element = _best_product_element(
        selector=".lamer .main_lamerstory .rel a",
        text="A SEA OF INSPIRATION 깊은 푸른 바다에서 영감을 얻다 자세히 보기",
        click_tracking_events=[],
        request_rule_ids=["rule-5"],
    )
    event = {
        "event_name": "click_MO_국문_명품관_025301",
        "ep_button_area": "라메르",
        "ep_button_area2": "라메르 스토리",
        "ep_button_name": "라메르 스토리_자세히보기",
    }

    filtered = _filter_events_for_element_label(element, [event])

    assert filtered == [event]


def test_request_rule_candidate_uses_extended_click_event_wait():
    standard = _best_product_element(click_tracking_events=[])
    requested = _best_product_element(
        click_tracking_events=[],
        request_rule_ids=["rule-6"],
    )

    assert _click_event_wait_ms(standard) == CLICK_EVENT_WAIT_MS
    assert _click_event_wait_ms(requested) == REQUEST_CLICK_EVENT_WAIT_MS
    assert REQUEST_CLICK_EVENT_WAIT_MS > CLICK_EVENT_WAIT_MS


def test_request_rule_candidate_outside_viewport_uses_dom_click():
    async def verify_click() -> None:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            page = await browser.new_page(viewport={"width": 390, "height": 844})
            await page.set_content("""
                <a
                    id="inactive-slide"
                    href="#"
                    style="position: fixed; left: 1000px; top: 100px; width: 120px; height: 60px"
                    onclick="window.__requestClickCount = (window.__requestClickCount || 0) + 1"
                >Inactive slide</a>
            """)
            element = PageElement(
                selector="#inactive-slide",
                text="Inactive slide",
                element_type="a",
                request_rule_ids=["request-rule"],
                request_rule_selectors=["#inactive-slide"],
                request_dom_index=0,
            )

            clicked = await _click_initial_element(page, element)

            assert clicked is True
            assert await page.evaluate("window.__requestClickCount") == 1
            await browser.close()

    asyncio.run(verify_click())


def test_classify_does_not_mark_click_tested_element_as_tracked_on_name_mismatch():
    element = _best_product_element(click_tracking_events=[{
        "event_name": "click_PC_국문_베스트",
        "ep_button_area": "베스트",
        "ep_button_area2": "베스트_탭_베스트상품",
        "ep_button_name": "상품_다른상품",
    }])

    tracked, missing, review = classify_network_tags(
        [],
        [element],
        page_url="https://www.hddfs.com/shop/dm/best/monthly.do",
    )

    assert tracked == []
    assert len(missing) + len(review) == 1


def test_attach_click_network_hits_rejects_ep_name_mismatch():
    element = _best_product_element(click_tracking_events=[], click_tested=True)
    hits = [
        NetworkTagHit(
            event_name="click_PC_국문_베스트",
            ep_button_area="베스트",
            ep_button_area2="베스트_탭_베스트상품",
            ep_button_name="상품_다른상품",
            trigger="click",
        )
    ]

    attached = attach_click_network_hits_to_elements([element], hits)

    assert attached == 0
    assert element.click_tracking_events == []


def test_attach_click_network_hits_accepts_unique_normalized_name_match():
    element = _best_product_element(
        text="세일",
        click_tracking_events=[],
        click_tested=True,
    )
    hits = [
        NetworkTagHit(
            event_name="click_PC_국문_공통",
            ep_button_area="GNB",
            ep_button_area2="GNB_공통",
            ep_button_name="메뉴_세일",
            trigger="click",
        )
    ]

    attached = attach_click_network_hits_to_elements([element], hits)

    assert attached == 1
    assert element.click_tracking_events[0]["ep_button_name"] == "메뉴_세일"


def test_attach_click_network_hits_does_not_reuse_verified_element_hit():
    verified = _best_product_element(
        element_index=0,
        text="로그인",
        click_tracking_events=[{
            "event_name": "click_PC_국문_공통",
            "ep_button_area": "Header",
            "ep_button_area2": "Header",
            "ep_button_name": "로그인",
        }],
    )
    unresolved = _best_product_element(
        element_index=1,
        text="회원가입",
        click_tracking_events=[],
        click_tested=True,
    )
    hits = [
        NetworkTagHit(
            event_name="click_PC_국문_공통",
            ep_button_area="Header",
            ep_button_area2="Header",
            ep_button_name="로그인",
            trigger="click",
        )
    ]

    attached = attach_click_network_hits_to_elements([verified, unresolved], hits)

    assert attached == 0
    assert unresolved.click_tracking_events == []


def test_attach_click_network_hits_does_not_reuse_tracking_data_hit():
    verified = _best_product_element(
        element_index=0,
        text="로그인",
        click_tracking_events=[],
        tracking_data={
            "event_name": "click_PC_국문_공통",
            "ep_button_area": "Header",
            "ep_button_area2": "Header",
            "ep_button_name": "로그인",
        },
    )
    unresolved = _best_product_element(
        element_index=1,
        text="회원가입",
        click_tracking_events=[],
        click_tested=True,
    )
    hits = [
        NetworkTagHit(
            event_name="click_PC_국문_공통",
            ep_button_area="Header",
            ep_button_area2="Header",
            ep_button_name="로그인",
            trigger="click",
        )
    ]

    attached = attach_click_network_hits_to_elements([verified, unresolved], hits)

    assert attached == 0
    assert unresolved.click_tracking_events == []


def test_attach_click_network_hits_skips_ambiguous_duplicate_labels():
    first = _best_product_element(
        element_index=0,
        text="세일",
        click_tracking_events=[],
        click_tested=True,
    )
    second = _best_product_element(
        element_index=1,
        text="세일",
        click_tracking_events=[],
        click_tested=True,
    )
    hits = [
        NetworkTagHit(
            event_name="click_PC_국문_공통",
            ep_button_area="GNB",
            ep_button_area2="GNB_공통",
            ep_button_name="메뉴_세일",
            trigger="click",
        )
    ]

    attached = attach_click_network_hits_to_elements([first, second], hits)

    assert attached == 0
    assert first.click_tracking_events == []
    assert second.click_tracking_events == []


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
        "1 록시땅 시어 버터 핸드 크림 150ML",
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
        "6 아워글래스 AMBIENT POWDER",
        click_group_representative=False,
        click_tested=True,
        click_tracking_events=[{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "베스트_탭_베스트상품",
            "ep_button_name": "상품_아워글래스_AMBIENTPOWDER",
        }],
    )
    rep = _grouped_best_product(
        0,
        "1 시어 버터 핸드 크림 150ML",
        click_tested=False,
    )
    sibling = _grouped_best_product(60, "60 시어 버터 풋 크림 150ML")

    tracked, issues = apply_group_tracking_inheritance([], [], [rep, verified_member, sibling])

    assert issues == []
    assert len(tracked) == 3
    assert sum(item.verification_source == "direct" for item in tracked) == 1
    assert sum(item.verification_source == "group_inherited" for item in tracked) == 2
    assert any(item.element_text.startswith("1") for item in tracked)
    assert any(item.element_text.startswith("60") for item in tracked)


def test_group_inheritance_does_not_override_direct_failed_click():
    rep = _grouped_best_product(
        0,
        "1 시어 버터 핸드 크림 150ML",
        click_tracking_events=[{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "베스트_탭_베스트상품",
            "ep_button_name": "상품_1 시어 버터 핸드 크림 150ML",
        }],
    )
    direct_failed = _grouped_best_product(
        1,
        "2 이벤트 없는 상품",
        click_tested=True,
        click_result_inherited=False,
    )
    untested_sibling = _grouped_best_product(
        2,
        "3 그룹 상속 대상 상품",
        click_tested=False,
    )

    tracked, missing, review = classify_network_tags(
        [],
        [rep, direct_failed, untested_sibling],
        page_url="https://www.hddfs.com/shop/dm/best/monthly.do",
    )

    tracked_texts = {item.element_text for item in tracked}
    assert direct_failed.text not in tracked_texts
    assert untested_sibling.text in tracked_texts
    assert len(missing) + len(review) == 1
    assert (missing + review)[0].element_text == direct_failed.text


def test_group_inheritance_does_not_override_direct_incomplete_event():
    rep = _grouped_best_product(
        0,
        "1 록시땅 시어 버터 핸드 크림 150ML",
        click_tracking_events=[{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "베스트_탭_베스트상품",
            "ep_button_name": "상품_록시땅_시어버터핸드크림150ML",
        }],
    )
    direct_incomplete = _grouped_best_product(
        1,
        "2 테스트 상품",
        click_tested=True,
        click_result_inherited=False,
        click_tracking_events=[{
            "event_name": "click_PC_국문_베스트",
            "ep_button_area": "베스트",
            "ep_button_area2": "",
            "ep_button_name": "상품_2테스트상품",
        }],
    )

    tracked, missing, review = classify_network_tags(
        [],
        [rep, direct_incomplete],
        page_url="https://www.hddfs.com/shop/dm/best/monthly.do",
    )

    assert [item.element_text for item in tracked] == [rep.text]
    assert len(missing) + len(review) == 1
    assert (missing + review)[0].element_text == direct_incomplete.text


def test_propagated_group_click_result_is_marked_as_inherited():
    rep = _grouped_best_product(
        0,
        "1 시어 버터 핸드 크림 150ML",
        click_tested=True,
    )
    sibling = _grouped_best_product(
        1,
        "2 시어 버터 풋 크림 150ML",
        click_tested=False,
    )

    propagate_group_click_results([rep, sibling])

    assert sibling.click_tested is True
    assert sibling.click_result_inherited is True
