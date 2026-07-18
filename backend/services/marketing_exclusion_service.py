import asyncio
import base64
import json
import logging
import os
import re
from typing import Dict, List, Optional, Set, Tuple

from openai import AzureOpenAI

from config import settings
from models.ai_analysis_item import AiAnalysisItem
from models.excluded_analysis_item import ExcludedAnalysisItem
from models.page_element import PageElement
from models.tracked_analysis_item import TrackedAnalysisItem
from services.ga4_channel_service import resolve_channel_or_none

logger = logging.getLogger(__name__)

MAX_ELEMENTS_FOR_LLM = 150
DEFAULT_EXCLUSION_REASON = "마케팅 관점에서 GA4 클릭 트래킹이 불필요한 요소로 판단되었습니다"
FOOTER_REGION_RATIO = 0.65
FOOTER_CLICK_GROUP_IDS = frozenset({"policy_menu_links", "business_info_links"})

_FOOTER_LEGAL_TEXT_RULES: List[Tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"개인정보\s*처리\s*방침", re.I),
        "법적 고지 링크로, 개인정보처리방침은 컴플라이언스 목적이며 마케팅 성과 측정 대상이 아닙니다",
    ),
    (
        re.compile(r"이용\s*약관", re.I),
        "법적 고지 링크로, 이용약관 안내는 마케팅 전환 측정 대상이 아닙니다",
    ),
    (
        re.compile(r"영상정보\s*처리\s*기기", re.I),
        "법적 고지 링크로, 영상정보처리기기 운영·관리방침은 컴플라이언스 목적입니다",
    ),
    (
        re.compile(r"이메일\s*무단\s*수집\s*거부", re.I),
        "법적 고지 링크로, 이메일무단수집거부 안내는 마케팅 분석 대상이 아닙니다",
    ),
    (
        re.compile(r"입점\s*/?\s*제휴", re.I),
        "B2B 제휴 안내 링크로, 일반 쇼핑 전환 측정 대상이 아닙니다",
    ),
    (
        re.compile(r"지점\s*안내", re.I),
        "Footer 지점 안내 링크로, 핵심 쇼핑 퍼널 측정 대상이 아닙니다",
    ),
    (
        re.compile(r"판매자\s*별\s*사업자\s*정보", re.I),
        "사업자 정보 고지 링크로, 판매자별 사업자 정보는 마케팅 이벤트 추적이 불필요합니다",
    ),
    (
        re.compile(r"사업자\s*정보\s*확인", re.I),
        "공정거래위원회 사업자정보 확인 링크로, 컴플라이언스 목적입니다",
    ),
    (
        re.compile(r"family\s*site", re.I),
        "Family Site 드롭다운 토글은 UI 전환 요소로, 마케팅 성과 측정 대상이 아닙니다",
    ),
    (
        re.compile(r"^facebook$", re.I),
        "Footer SNS 아웃링크로, 면세점 쇼핑 전환과 무관한 외부 채널입니다",
    ),
    (
        re.compile(r"^instagram$", re.I),
        "Footer SNS 아웃링크로, 면세점 쇼핑 전환과 무관한 외부 채널입니다",
    ),
    (
        re.compile(r"가입\s*확인\s*하기", re.I),
        "에스크로 가입확인 배지로, 결제 안전 표시 목적이며 마케팅 클릭 트래킹이 불필요합니다",
    ),
    (
        re.compile(r"ISO\s*\d+", re.I),
        "Footer ISO 인증 배지로, 신뢰 표시 목적이며 마케팅 클릭 트래킹이 불필요합니다",
    ),
    (
        re.compile(r"인증\s*범위", re.I),
        "Footer 인증 배지로, 서비스 인증 표시 목적이며 마케팅 클릭 트래킹이 불필요합니다",
    ),
    (
        re.compile(r"개인정보\s*보호\s*우수", re.I),
        "Footer 개인정보보호 인증 배지로, 신뢰 표시 목적이며 마케팅 클릭 트래킹이 불필요합니다",
    ),
    (
        re.compile(r"스마트\s*앱\s*어워드", re.I),
        "Footer 수상/인증 배지로, 마케팅 클릭 트래킹이 불필요합니다",
    ),
    (
        re.compile(r"소비자\s*중심\s*경영", re.I),
        "Footer 소비자중심경영 인증 배지로, 신뢰 표시 목적이며 마케팅 클릭 트래킹이 불필요합니다",
    ),
]

_FOOTER_SELECTOR_RULES: List[Tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"(^|\.)facebook($|\.)", re.I),
        "Footer SNS 아웃링크로, 면세점 쇼핑 전환과 무관한 외부 채널입니다",
    ),
    (
        re.compile(r"(^|\.)instagram($|\.)", re.I),
        "Footer SNS 아웃링크로, 면세점 쇼핑 전환과 무관한 외부 채널입니다",
    ),
    (
        re.compile(r"btn_escrow", re.I),
        "에스크로 가입확인 배지로, 결제 안전 표시 목적이며 마케팅 클릭 트래킹이 불필요합니다",
    ),
]


def _normalize_footer_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", "", text.strip())


def _footer_region_threshold(elements: List[PageElement]) -> float:
    ys = [element.bounding_box.y for element in elements if element.bounding_box]
    if not ys:
        return float("inf")
    return max(ys) * FOOTER_REGION_RATIO


def _is_footer_region_element(element: PageElement, footer_threshold: float) -> bool:
    if not element.bounding_box:
        return False
    return element.bounding_box.y >= footer_threshold


def _match_footer_legal_rule(element: PageElement) -> Optional[str]:
    normalized_text = _normalize_footer_text(element.text)
    if normalized_text:
        for pattern, reason in _FOOTER_LEGAL_TEXT_RULES:
            if pattern.search(normalized_text):
                return reason

    selector = (element.selector or "").strip()
    if selector:
        for pattern, reason in _FOOTER_SELECTOR_RULES:
            if pattern.search(selector):
                return reason
    return None


def _is_footer_marketing_exclusion_candidate(
    element: PageElement,
    footer_threshold: float,
) -> bool:
    if not element.bounding_box or not element.click_tested:
        return False

    if element.click_group_id in FOOTER_CLICK_GROUP_IDS and _is_footer_region_element(element, footer_threshold):
        return True

    if _match_footer_legal_rule(element) and _is_footer_region_element(element, footer_threshold):
        return True

    return False


def _build_rule_based_exclusions(elements: List[PageElement]) -> Dict[int, str]:
    footer_threshold = _footer_region_threshold(elements)
    exclusions: Dict[int, str] = {}

    for element in elements:
        if not _is_footer_marketing_exclusion_candidate(element, footer_threshold):
            continue
        reason = _match_footer_legal_rule(element)
        if not reason:
            if element.click_group_id == "policy_menu_links":
                reason = "Footer 정책/안내 메뉴 링크로, 법적 고지·운영 안내 목적이며 마케팅 성과 측정 대상이 아닙니다"
            elif element.click_group_id == "business_info_links":
                reason = "Footer 사업자 정보 고지 링크로, 컴플라이언스 목적이며 마케팅 클릭 트래킹이 불필요합니다"
            else:
                reason = DEFAULT_EXCLUSION_REASON
        exclusions[element.element_index] = reason

    if exclusions:
        logger.info("Rule-based footer exclusions identified %d item(s)", len(exclusions))
    return exclusions


def _merge_exclusion_maps(*maps: Dict[int, str]) -> Dict[int, str]:
    merged: Dict[int, str] = {}
    for exclusion_map in maps:
        merged.update(exclusion_map)
    return merged


def _element_key(element: PageElement) -> str:
    return f"{element.selector}|{(element.text or '').strip()}"


def _issue_key(issue: AiAnalysisItem) -> str:
    return f"{issue.element_selector}|{(issue.element_text or '').strip()}"


def _make_client() -> AzureOpenAI:
    if not settings.azure_openai_key:
        raise RuntimeError("AZURE_OPENAI_KEY is not set.")
    if not settings.azure_openai_endpoint:
        raise RuntimeError("AZURE_OPENAI_ENDPOINT is not set.")
    return AzureOpenAI(
        api_key=settings.azure_openai_key,
        api_version=settings.azure_openai_api_version,
        azure_endpoint=settings.azure_openai_endpoint,
    )


def _serialize_element_for_payload(element: PageElement) -> dict:
    return {
        "element_index": element.element_index,
        "selector": element.selector,
        "text": (element.text or "")[:120],
        "element_type": element.element_type,
        "click_tested": element.click_tested,
        "has_verified_click": bool(element.click_tracking_events),
        "click_group_id": element.click_group_id,
        "is_footer_candidate": True,
    }


def _build_element_payload(elements: List[PageElement]) -> List[dict]:
    footer_threshold = _footer_region_threshold(elements)
    priority_indices: Set[int] = set()
    payload: List[dict] = []

    for element in elements:
        if not element.bounding_box:
            continue
        if not _is_footer_marketing_exclusion_candidate(element, footer_threshold):
            continue
        priority_indices.add(element.element_index)
        payload.append(_serialize_element_for_payload(element))

    for element in elements:
        if len(payload) >= MAX_ELEMENTS_FOR_LLM:
            break
        if not element.bounding_box:
            continue
        if element.element_index in priority_indices:
            continue
        if element.click_group_id and not element.click_group_representative:
            continue
        payload.append(
            {
                "element_index": element.element_index,
                "selector": element.selector,
                "text": (element.text or "")[:120],
                "element_type": element.element_type,
                "click_tested": element.click_tested,
                "has_verified_click": bool(element.click_tracking_events),
                "click_group_id": element.click_group_id,
                "is_footer_candidate": False,
            }
        )
    return payload


def _build_exclusion_prompt(page_url: str, channel_label: str, element_payload: List[dict]) -> str:
    elements_json = json.dumps(element_payload, ensure_ascii=False, indent=2)
    return f"""너는 면세점 e-commerce GA4 태깅 컨설턴트다.
페이지 URL: {page_url}
채널: {channel_label or "unknown"}

아래 클릭 가능 요소 중 **마케팅/분석 목적으로 GA4 클릭 트래킹이 굳이 필요 없는 요소**만 골라라.
이 요소들은 '예외' 탭으로 분류되며, 정상/누락 검사 대상이 아니다.

예외로 분류해도 되는 예:
- Footer 정책/법적 고지: 개인정보처리방침, 이용약관, 영상정보처리기기 운영/관리방침, 이메일무단수집거부, 입점/제휴, Footer 지점 안내
- Footer 사업자/컴플라이언스: 사업자정보확인, 판매자별 사업자 정보
- Footer ISO/인증/에스크로/보안 배지: ISO 27001, ISO 27701, 개인정보보호 우수 웹사이트, 소비자중심경영, 스마트앱어워드, 가입확인하기
- Footer SNS: facebook, instagram
- Family Site 드롭다운 토글(하위 패밀리사이트 링크는 제외하지 않음)
- 장식용/접근성용 UI로 클릭 의도가 거의 없는 요소

`is_footer_candidate=true`인 요소는 Footer 영역 후보이므로, 위 범주에 해당하면 개별 element_index마다 예외로 분류하라.
같은 click_group_id라도 Footer 정책 링크는 항목별로 각각 예외 처리할 수 있다.

절대 예외로 분류하면 안 되는 예 (이건 정상 또는 누락으로 둬야 함):
- 브랜드 상호작용: 좋아요, 알림, 찜, 공유
- 브랜드/상품 메뉴 탭: 프래그런스, 바디 컬렉션, 르 라보 소개 등
- 헤더/GNB/검색/장바구니/로그인 등 핵심 네비게이션
- 배너, 상품, 프로모션, CTA, 탭 전환 등 비즈니스 성과 측정 대상
- ga4Common.js에 핸들러가 없다는 이유만으로 예외 처리하지 말 것

입력 요소:
```json
{elements_json}
```

JSON만 반환:
{{
  "excluded_items": [
    {{
      "element_index": 0,
      "exclusion_reason": "한국어로 1문장, 왜 마케팅 트래킹 불필요한지"
    }}
  ]
}}

해당 없으면 {{"excluded_items": []}}
"""


def _parse_exclusion_response(raw: str, elements: List[PageElement]) -> Dict[int, str]:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    parsed = json.loads(cleaned)
    items = parsed.get("excluded_items", [])
    if not isinstance(items, list):
        return {}

    index_map = {element.element_index: element for element in elements}
    footer_threshold = _footer_region_threshold(elements)
    exclusions: Dict[int, str] = {}

    for item in items:
        if not isinstance(item, dict):
            continue
        element_index = item.get("element_index")
        reason = str(item.get("exclusion_reason") or "").strip()
        if not isinstance(element_index, int) or element_index not in index_map:
            continue
        element = index_map[element_index]
        if element.click_group_id and not element.click_group_representative:
            if not _is_footer_marketing_exclusion_candidate(element, footer_threshold):
                continue
        exclusions[element_index] = reason or DEFAULT_EXCLUSION_REASON

    return exclusions


def _identify_exclusions_with_llm(
    page_url: str,
    elements: List[PageElement],
    screenshot_path: Optional[str],
) -> Dict[int, str]:
    rule_exclusions = _build_rule_based_exclusions(elements)
    payload = _build_element_payload(elements)
    if not payload:
        return rule_exclusions

    channel = resolve_channel_or_none(page_url)
    prompt = _build_exclusion_prompt(page_url, channel.label if channel else "", payload)
    client = _make_client()

    messages: List[dict] = []
    if screenshot_path and os.path.isfile(screenshot_path):
        with open(screenshot_path, "rb") as handle:
            img_b64 = base64.b64encode(handle.read()).decode()
        messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_b64}", "detail": "low"},
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        )
    else:
        messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=messages,
        response_format={"type": "json_object"},
        max_tokens=4096,
        temperature=0.1,
    )
    raw = (response.choices[0].message.content or "").strip()
    llm_exclusions = _parse_exclusion_response(raw, elements)
    exclusions = _merge_exclusion_maps(llm_exclusions, rule_exclusions)
    logger.info(
        "Marketing exclusion identified %d item(s) on %s (rule=%d, llm=%d)",
        len(exclusions),
        page_url,
        len(rule_exclusions),
        len(llm_exclusions),
    )
    return exclusions


def build_marketing_excluded_items(
    elements: List[PageElement],
    exclusion_map: Dict[int, str],
) -> List[ExcludedAnalysisItem]:
    if not exclusion_map:
        return []

    items: List[ExcludedAnalysisItem] = []
    seen_keys: Set[str] = set()

    for element in elements:
        reason = exclusion_map.get(element.element_index)
        if not reason or not element.bounding_box:
            continue

        element_key = _element_key(element)
        if element_key in seen_keys:
            continue

        seen_keys.add(element_key)
        items.append(
            ExcludedAnalysisItem(
                element_selector=element.selector,
                element_text=element.text or "",
                bounding_box=element.bounding_box,
                exclusion_reason=reason,
            )
        )

    return items


def filter_issues_by_marketing_exclusions(
    issues: List[AiAnalysisItem],
    elements: List[PageElement],
    exclusion_map: Dict[int, str],
) -> List[AiAnalysisItem]:
    if not exclusion_map:
        return issues

    excluded_keys = {
        _element_key(element)
        for element in elements
        if element.element_index in exclusion_map
    }
    filtered = [issue for issue in issues if _issue_key(issue) not in excluded_keys]
    removed = len(issues) - len(filtered)
    if removed:
        logger.info("Removed %d missing item(s) classified as marketing exclusions", removed)
    return filtered


def filter_tracked_by_marketing_exclusions(
    tracked_items: List[TrackedAnalysisItem],
    elements: List[PageElement],
    exclusion_map: Dict[int, str],
) -> List[TrackedAnalysisItem]:
    if not exclusion_map:
        return tracked_items

    excluded_keys = {
        _element_key(element)
        for element in elements
        if element.element_index in exclusion_map
    }
    filtered = [
        item for item in tracked_items
        if f"{item.element_selector}|{(item.element_text or '').strip()}" not in excluded_keys
    ]
    removed = len(tracked_items) - len(filtered)
    if removed:
        logger.info("Removed %d tracked item(s) classified as marketing exclusions", removed)
    return filtered


def _screenshot_path(screenshot_id: str) -> Optional[str]:
    if not screenshot_id:
        return None
    path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    return path if os.path.isfile(path) else None


async def resolve_marketing_exclusions(
    page_url: str,
    elements: List[PageElement],
    screenshot_id: str,
) -> Dict[int, str]:
    rule_exclusions = _build_rule_based_exclusions(elements)
    if not settings.azure_openai_key or not settings.azure_openai_endpoint:
        logger.info("Skip marketing exclusion LLM: Azure OpenAI is not configured")
        return rule_exclusions

    try:
        screenshot_path = _screenshot_path(screenshot_id)
        return await asyncio.to_thread(
            _identify_exclusions_with_llm,
            page_url,
            elements,
            screenshot_path,
        )
    except Exception as exc:
        logger.warning("Marketing exclusion LLM failed for %s: %s", page_url, exc)
        return rule_exclusions


async def build_page_excluded_items(
    page_url: str,
    elements: List[PageElement],
    screenshot_id: str,
    tracked_items: List[TrackedAnalysisItem],
    issues: List[AiAnalysisItem],
) -> Tuple[List[ExcludedAnalysisItem], List[AiAnalysisItem], List[TrackedAnalysisItem]]:
    exclusion_map = await resolve_marketing_exclusions(page_url, elements, screenshot_id)
    excluded_items = build_marketing_excluded_items(elements, exclusion_map)
    filtered_issues = filter_issues_by_marketing_exclusions(issues, elements, exclusion_map)
    filtered_tracked = filter_tracked_by_marketing_exclusions(tracked_items, elements, exclusion_map)
    return excluded_items, filtered_issues, filtered_tracked
