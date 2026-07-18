"""Header (GNB) element detection and ga4Common spec inference."""

from __future__ import annotations

import re
from typing import Dict, Optional

from models.page_element import PageElement
from services.ga4_channel_service import Ga4Channel

HEADER_Y_MAX = 160
HEADER_SELECTOR_HINTS = (
    "area-gnb",
    "wrap-gnb",
    "wrap-gnb-util",
    "list-gnb-util",
    "box-gnb-util",
    "list-language",
    "wrap-gnb-logo",
    "default_menu",
    "wrap-gnb-search",
)
HEADER_UTIL_LABELS = frozenset({
    "krw",
    "cny",
    "로그인",
    "회원가입",
    "고객센터",
    "지점안내",
    "주문가능시간",
    "검색",
    "장바구니",
    "마이현대",
})
HEADER_LANGUAGE_LABELS = frozenset({
    "한국어",
    "简体中文",
    "english",
    "언어설정",
})
NON_HEADER_EVENT_MARKERS = (
    "_명품관_",
    "_템플릿관_",
    "_브랜드상세_",
    "_대표브랜드관_",
)
HEADER_GNB_UTIL_SELECTOR = ".area-gnb .wrap-gnb-util ul.list-gnb-util li a"
HEADER_LANGUAGE_SELECTOR = ".area-gnb .wrap-gnb-util .box-gnb-util ul.list-language li a"


def _normalize_label(value: str) -> str:
    return re.sub(r"\s+", "", (value or "").strip())


def is_header_element(element: PageElement) -> bool:
    if not element.bounding_box:
        return False

    selector = (element.selector or "").lower()
    if any(hint in selector for hint in HEADER_SELECTOR_HINTS):
        return element.bounding_box.y <= HEADER_Y_MAX

    label = _normalize_label(element.text or "").lower()
    if label in HEADER_UTIL_LABELS and element.bounding_box.y <= HEADER_Y_MAX:
        return True

    if _normalize_label(element.text or "") in HEADER_LANGUAGE_LABELS:
        return element.bounding_box.y <= HEADER_Y_MAX

    return False


def is_header_language_element(element: PageElement) -> bool:
    label = _normalize_label(element.text or "")
    if label in HEADER_LANGUAGE_LABELS:
        return True
    selector = (element.selector or "").lower()
    return "list-language" in selector


def is_misassigned_header_event(event_name: str) -> bool:
    name = (event_name or "").strip()
    if not name or "_공통" in name:
        return False
    return any(marker in name for marker in NON_HEADER_EVENT_MARKERS)


def _header_common_event_name(channel_id: str) -> Optional[str]:
    if channel_id.endswith("_pc"):
        platform = "PC"
    elif channel_id.endswith("_mo"):
        platform = "MO"
    else:
        return None

    lang_map = {"kr": "국문", "en": "영문", "cn": "중문"}
    lang = lang_map.get(channel_id.split("_")[0])
    if not lang:
        return None
    return f"click_{platform}_{lang}_공통"


def build_header_inferred_params(
    channel: Ga4Channel,
    element: PageElement,
) -> Optional[Dict[str, str]]:
    if not is_header_element(element):
        return None

    event_name = _header_common_event_name(channel.channel_id)
    if not event_name:
        return None

    label = _normalize_label(element.text or "")
    if is_header_language_element(element):
        language_map = {
            "한국어": "언어_한국어",
            "简体中文": "언어_중국어",
            "english": "언어_영어",
        }
        ep_button_name = language_map.get(label, label or "언어")
        return {
            "event_name": event_name,
            "ep_button_area": "Header",
            "ep_button_area2": "Header_언어",
            "ep_button_name": ep_button_name,
            "element_selector": HEADER_LANGUAGE_SELECTOR,
        }

    return {
        "event_name": event_name,
        "ep_button_area": "Header",
        "ep_button_area2": "Header",
        "ep_button_name": label,
        "element_selector": HEADER_GNB_UTIL_SELECTOR,
    }
