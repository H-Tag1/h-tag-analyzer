import unittest
from unittest.mock import patch

from models.bounding_box import BoundingBox
from models.network_tag_hit import NetworkTagHit
from models.page_element import PageElement
from models.tag_request_validation import TagRequestItem
from services.hybrid_tag_judgment_service import (
    HybridTagJudgmentResolver,
    RagJudgmentEvidence,
)
from services.rag_storage_service import RagSearchResult
from services.tag_classification_service import classify_network_tags
from services.tag_request_validation_service import _validate_request_item


def _rag_hit(score: float = 0.9) -> RagSearchResult:
    return RagSearchResult(
        chunk_id="sample",
        score=score,
        code='$(document).on("click", ".buy", function() {});',
        channel="kr_pc",
        channel_id="kr_pc",
        channel_label="국문 PC",
        hostname="www.hddfs.com",
        element_selector=".buy",
        event_name="click_PC_국문_상품",
        ep_button_area="상품",
        ep_button_area2="상세",
        ep_button_name="구매하기",
        keywords="구매하기 buy",
        metadata={},
    )


def _element() -> PageElement:
    return PageElement(
        selector=".buy",
        text="구매하기",
        element_type="button",
        bounding_box=BoundingBox(x=10, y=20, width=100, height=40),
        click_tested=True,
    )


class HybridTagJudgmentResolverTest(unittest.TestCase):
    @patch("services.hybrid_tag_judgment_service.ensure_channel_indexed", return_value=0)
    def test_empty_channel_index_is_unavailable(self, _mock_index) -> None:
        resolver = HybridTagJudgmentResolver("https://cn.hd-dfs.com")

        evidence = resolver.find_for_element(".buy", "구매하기")

        self.assertFalse(evidence.available)
        self.assertFalse(evidence.matched)
        self.assertEqual(evidence.reason, "empty_channel_index")

    @patch("services.hybrid_tag_judgment_service.fetch_reference_chunks")
    @patch("services.hybrid_tag_judgment_service.ensure_channel_indexed", return_value=1)
    def test_same_group_uses_cached_high_confidence_reference(self, _mock_index, mock_fetch) -> None:
        mock_fetch.return_value = [_rag_hit()]
        resolver = HybridTagJudgmentResolver("https://www.hddfs.com")

        first = resolver.find_for_element(".buy:first", "구매하기", group_key="buy-group")
        second = resolver.find_for_element(".buy:last", "바로구매", group_key="buy-group")

        self.assertTrue(first.available)
        self.assertTrue(first.matched)
        self.assertEqual(first.reference.event_name, "click_PC_국문_상품")
        self.assertIs(first, second)
        mock_fetch.assert_called_once()

    @patch("services.hybrid_tag_judgment_service.fetch_reference_chunks")
    @patch("services.hybrid_tag_judgment_service.ensure_channel_indexed", return_value=1)
    def test_request_search_filters_exact_event_name(self, _mock_index, mock_fetch) -> None:
        mock_fetch.return_value = [_rag_hit()]
        resolver = HybridTagJudgmentResolver("https://www.hddfs.com")

        resolver.find_for_request(
            event_name="click_PC_국문_상품",
            ep_button_area="상품",
            ep_button_area2="상세",
            ep_button_name="구매하기",
        )

        self.assertEqual(
            mock_fetch.call_args.kwargs["event_name"],
            "click_PC_국문_상품",
        )


class ScanClassificationTest(unittest.TestCase):
    @patch("services.tag_classification_service.HybridTagJudgmentResolver")
    def test_no_event_and_low_rag_confidence_requires_review(self, resolver_type) -> None:
        resolver_type.return_value.find_for_element.return_value = RagJudgmentEvidence(
            available=True,
            matched=False,
            reason="low_similarity",
            score=0.2,
        )

        tracked, missing, review = classify_network_tags(
            [],
            [_element()],
            page_url="https://www.hddfs.com",
        )

        self.assertEqual(tracked, [])
        self.assertEqual(missing, [])
        self.assertEqual(len(review), 1)
        self.assertEqual(review[0].judgment_source, "rag")

    @patch("services.tag_classification_service.HybridTagJudgmentResolver")
    def test_no_event_and_unavailable_rag_keeps_existing_missing_rule(self, resolver_type) -> None:
        resolver_type.return_value.find_for_element.return_value = RagJudgmentEvidence(
            available=False,
            matched=False,
            reason="empty_channel_index",
        )

        tracked, missing, review = classify_network_tags(
            [],
            [_element()],
            page_url="https://cn.hd-dfs.com",
        )

        self.assertEqual(tracked, [])
        self.assertEqual(len(missing), 1)
        self.assertEqual(review, [])

    @patch("services.tag_classification_service.HybridTagJudgmentResolver")
    def test_no_event_and_matching_rag_reference_is_missing(self, resolver_type) -> None:
        resolver_type.return_value.find_for_element.return_value = RagJudgmentEvidence(
            available=True,
            matched=True,
            reason="matched_reference",
            score=0.9,
            reference=_rag_hit(),
        )

        tracked, missing, review = classify_network_tags(
            [],
            [_element()],
            page_url="https://www.hddfs.com",
        )

        self.assertEqual(tracked, [])
        self.assertEqual(len(missing), 1)
        self.assertEqual(review, [])
        self.assertEqual(missing[0].recommended_ga_spec["event_name"], "click_PC_국문_상품")


class TagRequestClassificationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.request = TagRequestItem(
            sheet_name="요청",
            row_number=2,
            request_no="1",
            event_name="click_PC_국문_상품",
            ep_button_area="상품",
            ep_button_area2="상세",
            ep_button_name="구매하기",
        )

    def test_matching_actual_event_is_normal_without_rag_override(self) -> None:
        class Resolver:
            def find_for_request(self, **_kwargs):
                raise AssertionError("RAG must not run for a hard normal match")

        item = _validate_request_item(
            self.request,
            [NetworkTagHit(
                event_name=self.request.event_name,
                ep_button_area="상품",
                ep_button_area2="상세",
                ep_button_name="구매하기",
                trigger="click",
            )],
            [],
            [],
            Resolver(),
        )

        self.assertEqual(item.status, "normal")
        self.assertEqual(item.judgment_source, "rule")

    def test_mismatching_actual_event_is_missing_without_rag_override(self) -> None:
        class Resolver:
            def find_for_request(self, **_kwargs):
                raise AssertionError("RAG must not override an explicit specification mismatch")

        item = _validate_request_item(
            self.request,
            [NetworkTagHit(
                event_name=self.request.event_name,
                ep_button_area="상품",
                ep_button_area2="메인",
                ep_button_name="구매하기",
                trigger="click",
            )],
            [],
            [],
            Resolver(),
        )

        self.assertEqual(item.status, "missing")
        self.assertEqual(item.judgment_source, "rule")
        self.assertEqual(item.missing_fields, ["ep_button_area2"])

    def test_no_actual_event_and_low_rag_confidence_requires_review(self) -> None:
        class Resolver:
            def find_for_request(self, **_kwargs):
                return RagJudgmentEvidence(
                    available=True,
                    matched=False,
                    reason="low_similarity",
                    score=0.1,
                )

        item = _validate_request_item(self.request, [], [], [], Resolver())

        self.assertEqual(item.status, "review")
        self.assertEqual(item.judgment_source, "rag")

    def test_no_actual_event_and_matching_rag_reference_is_missing(self) -> None:
        class Resolver:
            def find_for_request(self, **_kwargs):
                return RagJudgmentEvidence(
                    available=True,
                    matched=True,
                    reason="matched_reference",
                    score=0.9,
                    reference=_rag_hit(),
                )

        item = _validate_request_item(self.request, [], [], [], Resolver())

        self.assertEqual(item.status, "missing")
        self.assertEqual(item.judgment_source, "rag")

    def test_no_actual_event_and_unavailable_rag_keeps_existing_missing_rule(self) -> None:
        class Resolver:
            def find_for_request(self, **_kwargs):
                return RagJudgmentEvidence(
                    available=False,
                    matched=False,
                    reason="empty_channel_index",
                )

        item = _validate_request_item(self.request, [], [], [], Resolver())

        self.assertEqual(item.status, "missing")
        self.assertEqual(item.judgment_source, "rule")


if __name__ == "__main__":
    unittest.main()
