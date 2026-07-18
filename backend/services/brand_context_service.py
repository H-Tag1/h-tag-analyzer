"""Resolve {{branNm}} / {{branCd}} placeholders in GA tag specs."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import parse_qs, urlparse

from config import settings
from models.page_element import PageElement
from services.code_generator_service import _make_client

logger = logging.getLogger(__name__)

BRAND_PLACEHOLDER_RE = re.compile(r"\{\{(branNm|branCd)\}\}", re.IGNORECASE)
BRAND_NAME_SUFFIXES = ("_확장형", "_기본형")
BRAND_SELECTOR_HINTS = (
    "shop_title",
    "page_tit",
    "headertitle",
    "brandtit",
    "sub_title",
)
SPEC_STRING_FIELDS = (
    "event_name",
    "ep_button_area",
    "ep_button_area2",
    "ep_button_name",
)


@dataclass(frozen=True)
class BrandContext:
    brand_name: str = ""
    brand_code: str = ""
    source: str = "none"

    def has_name(self) -> bool:
        return bool(self.brand_name.strip())

    def has_code(self) -> bool:
        return bool(self.brand_code.strip())


def spec_has_brand_placeholder(spec: Dict[str, Any]) -> bool:
    for field in SPEC_STRING_FIELDS:
        value = str(spec.get(field) or "")
        if BRAND_PLACEHOLDER_RE.search(value):
            return True
    return False


def extract_brand_code_from_url(page_url: Optional[str]) -> str:
    if not page_url:
        return ""

    parsed = urlparse(page_url)
    params = parse_qs(parsed.query)
    for key in ("onlnBranCd", "onlnbrancd", "branCd"):
        values = params.get(key)
        if values:
            code = re.sub(r"\D", "", values[0])
            if code:
                return code

    match = re.search(r"onlnBranCd[=:](\d+)", page_url, re.IGNORECASE)
    if match:
        return match.group(1)
    return ""


def _normalize_brand_name(name: str) -> str:
    return re.sub(r"\s+", "", (name or "").strip())


def _tracking_data(item: Any) -> Dict[str, Any]:
    tracking = getattr(item, "tracking_data", None)
    if tracking is None and isinstance(item, dict):
        tracking = item.get("tracking_data")
    return tracking or {}


def infer_brand_name_from_tracked(tracked_items: Optional[Sequence[Any]]) -> str:
    for item in tracked_items or []:
        tracking = _tracking_data(item)
        area = _normalize_brand_name(str(tracking.get("ep_button_area") or ""))
        for suffix in BRAND_NAME_SUFFIXES:
            if area.endswith(suffix):
                prefix = area[: -len(suffix)]
                if prefix:
                    return prefix

        area2 = str(tracking.get("ep_button_area2") or "")
        if "_상세탭_" in area2:
            prefix = area2.split("_상세탭_")[0]
            if prefix:
                return _normalize_brand_name(prefix)

        plain_area = _normalize_brand_name(str(tracking.get("ep_button_area") or ""))
        area2_value = str(tracking.get("ep_button_area2") or "")
        if plain_area and area2_value and plain_area == area2_value.split("_")[0]:
            if len(plain_area) <= 20 and "click" not in plain_area.lower():
                return plain_area
    return ""


def infer_brand_code_from_tracked(tracked_items: Optional[Sequence[Any]]) -> str:
    for item in tracked_items or []:
        tracking = _tracking_data(item)
        event_name = str(tracking.get("event") or tracking.get("event_name") or "")
        match = re.search(r"(?:템플릿관|브랜드상세|대표브랜드관)_(\d+)", event_name)
        if match:
            return match.group(1)
    return ""


def infer_brand_name_from_elements(elements: Optional[List[PageElement]]) -> str:
    prioritized: List[tuple[int, int, str]] = []
    for element in elements or []:
        text = _normalize_brand_name(element.text or "")
        if not text or len(text) > 40:
            continue

        selector = (element.selector or "").lower()
        priority = 100
        if any(hint in selector for hint in BRAND_SELECTOR_HINTS):
            priority = 0
        elif element.bounding_box and element.bounding_box.y < 250:
            priority = 10

        prioritized.append((priority, element.bounding_box.y if element.bounding_box else 9999, text))

    if not prioritized:
        return ""

    prioritized.sort(key=lambda item: (item[0], item[1], len(item[2])))
    return prioritized[0][2]


def _collect_ai_context(
    page_url: Optional[str],
    elements: Optional[List[PageElement]],
    tracked_items: Optional[Sequence[Any]],
    issue_texts: Optional[List[str]] = None,
) -> Dict[str, Any]:
    element_texts: List[str] = []
    for element in elements or []:
        text = (element.text or "").strip()
        if text and text not in element_texts:
            element_texts.append(text)
        if len(element_texts) >= 40:
            break

    tracked_samples: List[Dict[str, str]] = []
    for item in (tracked_items or [])[:8]:
        tracking = _tracking_data(item)
        tracked_samples.append(
            {
                "element_text": str(getattr(item, "element_text", "") or ""),
                "event_name": str(tracking.get("event") or tracking.get("event_name") or ""),
                "ep_button_area": str(tracking.get("ep_button_area") or ""),
                "ep_button_area2": str(tracking.get("ep_button_area2") or ""),
                "ep_button_name": str(tracking.get("ep_button_name") or ""),
            }
        )

    return {
        "page_url": page_url or "",
        "brand_code_from_url": extract_brand_code_from_url(page_url),
        "element_texts": element_texts[:30],
        "issue_element_texts": [text for text in (issue_texts or []) if text][:20],
        "tracked_samples": tracked_samples,
    }


def _parse_brand_json(raw: str) -> Dict[str, str]:
    cleaned = raw.strip()
    fenced = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```$", cleaned, re.DOTALL | re.IGNORECASE)
    if fenced:
        cleaned = fenced.group(1).strip()

    data = json.loads(cleaned)
    if not isinstance(data, dict):
        raise ValueError("Expected JSON object")

    return {
        "brand_name": _normalize_brand_name(
            str(data.get("brand_name") or data.get("branNm") or "")
        ),
        "brand_code": re.sub(
            r"\D",
            "",
            str(data.get("brand_code") or data.get("branCd") or ""),
        ),
    }


def _ask_ai_for_brand(context: Dict[str, Any]) -> BrandContext:
    client = _make_client()
    prompt = f"""You identify the brand name and brand code for a Hyundai Duty Free (HDDfs) shop page for GA4 tagging.

Page URL: {context["page_url"]}
Brand code from URL (onlnBranCd): {context["brand_code_from_url"] or "unknown"}

Page element texts (sample from DOM scan):
{json.dumps(context["element_texts"], ensure_ascii=False)}

Missing item element texts:
{json.dumps(context["issue_element_texts"], ensure_ascii=False)}

Already tracked GA events on this page (sample):
{json.dumps(context["tracked_samples"], ensure_ascii=False)}

Return ONLY JSON:
{{"brand_name": "...", "brand_code": "..."}}

Rules:
- brand_name: used in GA tags like {{name}}_확장형 — remove all spaces (e.g. 르라보, LeLabo)
- Prefer the Korean display name on kr pages when visible
- brand_code: 6-digit onlnBranCd if known (from URL or page data)
- Do not invent values; use page evidence only
"""

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=256,
        temperature=0,
    )
    content = (response.choices[0].message.content or "").strip()
    parsed = _parse_brand_json(content)
    return BrandContext(
        brand_name=parsed["brand_name"],
        brand_code=parsed["brand_code"],
        source="ai",
    )


def resolve_brand_context(
    page_url: Optional[str],
    elements: Optional[List[PageElement]] = None,
    tracked_items: Optional[Sequence[Any]] = None,
    issue_texts: Optional[List[str]] = None,
) -> BrandContext:
    brand_code = extract_brand_code_from_url(page_url) or infer_brand_code_from_tracked(
        tracked_items
    )
    rule_name = infer_brand_name_from_tracked(tracked_items) or infer_brand_name_from_elements(
        elements
    )

    if settings.azure_openai_key and settings.azure_openai_endpoint:
        try:
            ai_context = _ask_ai_for_brand(
                _collect_ai_context(page_url, elements, tracked_items, issue_texts)
            )
            return BrandContext(
                brand_name=ai_context.brand_name or rule_name,
                brand_code=brand_code or ai_context.brand_code,
                source="ai" if ai_context.brand_name else ("rules" if rule_name else "none"),
            )
        except Exception as exc:
            logger.warning("AI brand resolution failed, using rule-based fallback: %s", exc)

    if rule_name or brand_code:
        return BrandContext(brand_name=rule_name, brand_code=brand_code, source="rules")
    return BrandContext()


def apply_brand_placeholders(value: str, ctx: BrandContext) -> str:
    if not value:
        return value

    result = value
    if ctx.has_name():
        result = re.sub(r"\{\{branNm\}\}", ctx.brand_name, result, flags=re.IGNORECASE)
    if ctx.has_code():
        result = re.sub(r"\{\{branCd\}\}", ctx.brand_code, result, flags=re.IGNORECASE)
    return result


def apply_brand_placeholders_to_spec(spec: Dict[str, Any], ctx: BrandContext) -> Dict[str, Any]:
    if not ctx.has_name() and not ctx.has_code():
        return spec

    updated = dict(spec)
    for field in SPEC_STRING_FIELDS:
        if field in updated and isinstance(updated[field], str):
            updated[field] = apply_brand_placeholders(updated[field], ctx)
    return updated
