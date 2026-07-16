import unittest

from models.bounding_box import BoundingBox
from models.page_element import PageElement
from models.tag_request_validation import TagRequestItem
from services.code_generator_service import parse_ga_event_call
from services.tag_request_excel_service import ParsedTagRequestSheet, _parse_param_value
from services.tag_request_matching_service import match_request_parameters
from services.tag_request_reference_service import (
    TagRequestReferenceRule,
    build_tag_request_reference_rules,
)
from services.tracking_filter_service import filter_elements_by_tracking_id
from services.tag_request_validation_service import _validate_request_candidates


def _request(
    request_no: str,
    row_number: int,
    area2: str,
    name: str,
) -> TagRequestItem:
    return TagRequestItem(
        sheet_name="MO_국문_명품관_라메르",
        row_number=row_number,
        request_no=request_no,
        event_name="click_MO_국문_명품관_025301",
        ep_button_area="{{브랜드명}}",
        ep_button_area2=area2,
        ep_button_name=name,
    )


class GaEventParserTest(unittest.TestCase):
    def test_dynamic_arguments_are_preserved_as_templates(self) -> None:
        parsed = parse_ga_event_call(
            'GA_Event("click_MO_국문_명품관_025301", "라메르", '
            '"라메르 패밀리_"+cateName, '
            '"라메르 패밀리_"+cateName+"_"+prodName);'
        )

        self.assertEqual(parsed["ep_button_area2"], "라메르 패밀리_{{cateName}}")
        self.assertEqual(
            parsed["ep_button_name"],
            "라메르 패밀리_{{cateName}}_{{prodName}}",
        )


class ExcelExampleParserTest(unittest.TestCase):
    def test_example_lines_are_retained(self) -> None:
        template, examples = _parse_param_value(
            "{{브랜드명}}_{{컨텐츠명}}\nex. 라메르_모이스춰라이저"
        )

        self.assertEqual(template, "{{브랜드명}}_{{컨텐츠명}}")
        self.assertEqual(examples, ["라메르_모이스춰라이저"])


class RequestParameterMatcherTest(unittest.TestCase):
    def setUp(self) -> None:
        self.request = _request(
            "4",
            10,
            "{{브랜드명}}_{{컨텐츠명}}",
            "{{컨텐츠명}}_{{상품명}}",
        )

    def test_shared_placeholders_match_across_all_ep_fields(self) -> None:
        result = match_request_parameters(self.request, {
            "ep_button_area": "라메르",
            "ep_button_area2": "라메르_모이스춰라이저",
            "ep_button_name": "모이스춰라이저_크림 드 라메르",
        })

        self.assertTrue(result.matched)
        self.assertEqual(result.bindings["브랜드명"], "라메르")
        self.assertEqual(result.bindings["컨텐츠명"], "모이스춰라이저")
        self.assertEqual(result.bindings["상품명"], "크림 드 라메르")

    def test_inconsistent_placeholder_value_is_rejected(self) -> None:
        result = match_request_parameters(self.request, {
            "ep_button_area": "라메르",
            "ep_button_area2": "라메르_모이스춰라이저",
            "ep_button_name": "컨센트레이트_크림 드 라메르",
        })

        self.assertFalse(result.matched)
        self.assertEqual(result.missing_fields, ["ep_button_name"])


class ReferenceRuleMappingTest(unittest.TestCase):
    def test_lamer_requests_map_to_expected_source_handlers(self) -> None:
        requests = [
            _request("1", 7, "카테고리메뉴", "{{카테고리명}}"),
            _request("2", 8, "메인배너", "{{배너명}}"),
            _request("3", 9, "면세전용상품", "{{상품명}}"),
            _request("4", 10, "{{브랜드명}}_{{컨텐츠명}}", "{{컨텐츠명}}_{{상품명}}"),
            _request("5", 11, "라메르 스토리", "라메르 스토리_자세히보기"),
            _request("6", 12, "라메르 패밀리", "라메르 패밀리_{{카테고리명}}"),
            _request(
                "7",
                13,
                "라메르 패밀리_{{카테고리명}}",
                "라메르 패밀리_{{카테고리명}}_{{상품명}}",
            ),
        ]
        sheet = ParsedTagRequestSheet(
            sheet_name="MO_국문_명품관_라메르",
            url="https://m.hddfs.com/shop/dm/lgBran/lamer/lgBranMain.do",
            event_name="click_MO_국문_명품관_025301",
            items=requests,
        )

        rules = build_tag_request_reference_rules(sheet)
        counts = {
            request.request_no: sum(rule.request_no == request.request_no for rule in rules)
            for request in requests
        }

        self.assertEqual(counts, {
            "1": 1,
            "2": 1,
            "3": 1,
            "4": 3,
            "5": 1,
            "6": 1,
            "7": 1,
        })
        content_selectors = {
            rule.selector for rule in rules if rule.request_no == "4"
        }
        self.assertNotIn(
            ".lamer .main_category .rel > ul li .cat_prod_list a",
            content_selectors,
        )


class CandidateCoverageTest(unittest.TestCase):
    def setUp(self) -> None:
        self.request = _request("3", 9, "면세전용상품", "{{상품명}}")
        self.rule = TagRequestReferenceRule(
            rule_id="rule-3",
            request_no="3",
            request_row_number=9,
            selector=".lamer .main_travel ul li a",
            event_name=self.request.event_name,
            ep_button_area="라메르",
            ep_button_area2="면세전용상품",
            ep_button_name="{{prodName}}",
        )

    def _element(self, key: str, area2: str, name: str, tested: bool = True) -> PageElement:
        return PageElement(
            selector="a.product",
            text=name,
            element_type="a",
            bounding_box=BoundingBox(x=0, y=0, width=100, height=40),
            click_tested=tested,
            click_tracking_events=[{
                "event_name": self.request.event_name,
                "ep_button_area": "라메르",
                "ep_button_area2": area2,
                "ep_button_name": name,
            }] if tested else [],
            request_rule_ids=[self.rule.rule_id],
            request_rule_selectors=[self.rule.selector],
            request_candidate_key=key,
        )

    def test_one_mismatching_candidate_marks_request_missing(self) -> None:
        normal = self._element("normal", "면세전용상품", "크림")
        missing = self._element("missing", "카테고리메뉴", "로션")

        result = _validate_request_candidates(
            self.request,
            [self.rule],
            [normal, missing],
            [normal.model_copy(deep=True), missing.model_copy(deep=True)],
        )

        self.assertEqual(result.status, "missing")
        self.assertEqual(result.candidate_count, 2)
        self.assertEqual(result.matched_count, 1)
        self.assertEqual(result.missing_candidate_count, 1)

    def test_unclickable_candidate_requires_review(self) -> None:
        element = self._element("unclickable", "면세전용상품", "크림", tested=False)

        result = _validate_request_candidates(
            self.request,
            [self.rule],
            [element],
            [element.model_copy(deep=True)],
        )

        self.assertEqual(result.status, "review")
        self.assertEqual(result.review_candidate_count, 1)

    def test_candidate_network_events_are_filtered_by_measurement_id(self) -> None:
        element = self._element("measurement", "면세전용상품", "크림")
        element.click_tracking_events = [
            {
                "event_name": self.request.event_name,
                "ep_button_area": "라메르",
                "ep_button_area2": "면세전용상품",
                "ep_button_name": "다른 속성",
                "tid": "G-OTHER",
            },
            {
                "event_name": self.request.event_name,
                "ep_button_area": "라메르",
                "ep_button_area2": "면세전용상품",
                "ep_button_name": "크림",
                "tid": "G-TARGET",
            },
        ]

        filtered = filter_elements_by_tracking_id([element], "G-TARGET")

        self.assertEqual(len(filtered[0].click_tracking_events), 1)
        self.assertEqual(filtered[0].click_tracking_events[0]["ep_button_name"], "크림")


if __name__ == "__main__":
    unittest.main()
