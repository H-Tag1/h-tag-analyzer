import base64
import json
import logging
from typing import List

from openai import AzureOpenAI

from config import settings
from models.page_element import PageElement
from models.ai_analysis_item import AiAnalysisItem
from models.tracked_analysis_item import TrackedAnalysisItem
from models.page_analysis_result import PageAnalysisResult
from models.bounding_box import BoundingBox

logger = logging.getLogger(__name__)

GA4_GUIDELINE = """
You are a GA4 tagging expert for a Korean duty-free e-commerce website.
The site manages all click events in a single file (ga4common.js) using this pattern:

$(document).on("click", ".css-selector", function(){
    let dynamicValue = $(this).text().replace(/\\s/g, "");
    GA_Event("click_PC_국문_메인", "상단메뉴", "상단메뉴_카테고리", dynamicValue);
});

GA_Event signature:
GA_Event(event_name, ep_button_area, ep_button_area2, ep_button_name, isVirtual)

- event_name: e.g. click_PC_국문_메인, click_PC_국문_공통, click_PC_국문_상품상세
- ep_button_area: button area (e.g. Header, GNB, 베스트셀러)
- ep_button_area2: sub area (e.g. Header, 베스트셀러_탭)
- ep_button_name: button name, often prefixed (탭_, 상품_, 배너_, 더보기)
- isVirtual: optional boolean, default false

Analyze the provided webpage screenshot, interactive element list, and dataLayer snapshot.

Your job is to classify meaningful interactive elements into TWO groups:
1. MISSING — elements that should have GA4 tracking but do not
2. TRACKED — elements that already have GA4 tracking implemented correctly

Focus on click-worthy buttons, links, tabs, and banners.
Use dataLayer snapshot and codeTrackingData to infer tracked elements.
"""


def _make_client() -> AzureOpenAI:
    if not settings.azure_openai_key:
        raise RuntimeError("AZURE_OPENAI_KEY is not set. Please configure the .env file.")
    if not settings.azure_openai_endpoint:
        raise RuntimeError("AZURE_OPENAI_ENDPOINT is not set. Please configure the .env file.")
    return AzureOpenAI(
        api_key=settings.azure_openai_key,
        api_version=settings.azure_openai_api_version,
        azure_endpoint=settings.azure_openai_endpoint,
    )


def _parse_bounding_box(raw: dict) -> BoundingBox:
    bb = raw or {}
    return BoundingBox(
        x=bb.get("x", 0),
        y=bb.get("y", 0),
        width=bb.get("width", 100),
        height=bb.get("height", 40),
    )


def _parse_missing_items(items_raw: list) -> List[AiAnalysisItem]:
    results = []
    for item in items_raw:
        try:
            results.append(
                AiAnalysisItem(
                    element_selector=item["element_selector"],
                    element_text=item.get("element_text", ""),
                    bounding_box=_parse_bounding_box(item.get("bounding_box")),
                    issue=item.get("issue", ""),
                    recommended_ga_spec=item.get("recommended_ga_spec", {}),
                )
            )
        except Exception as e:
            logger.warning(f"Skipping malformed missing item: {e}")
    return results


def _parse_tracked_items(items_raw: list) -> List[TrackedAnalysisItem]:
    results = []
    for item in items_raw:
        try:
            results.append(
                TrackedAnalysisItem(
                    element_selector=item["element_selector"],
                    element_text=item.get("element_text", ""),
                    bounding_box=_parse_bounding_box(item.get("bounding_box")),
                    tracking_description=item.get("tracking_description", ""),
                    tracking_data=item.get("tracking_data", {}),
                    detection_methods=["ai"],
                )
            )
        except Exception as e:
            logger.warning(f"Skipping malformed tracked item: {e}")
    return results


async def analyze_page(
    screenshot_path: str,
    elements: List[PageElement],
    datalayer_events: list,
    tracking_id: str = "G-1NWKV3S1TW",
) -> PageAnalysisResult:
    client = _make_client()

    with open(screenshot_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    elements_json = json.dumps(
        [
            {
                "selector": el.selector,
                "text": el.text or "",
                "type": el.element_type,
                "boundingBox": el.bounding_box.model_dump() if el.bounding_box else None,
                "hasCodeTracking": el.has_ga_tag,
                "codeTrackingData": el.tracking_data if el.has_ga_tag else None,
                "codeTrackingMethods": el.tracking_methods if el.has_ga_tag else [],
            }
            for el in elements
        ],
        ensure_ascii=False,
    )

    datalayer_json = json.dumps(datalayer_events, ensure_ascii=False, indent=2)

    prompt = f"""{GA4_GUIDELINE}

Target GA4 Measurement ID: {tracking_id}
ONLY analyze GA4 tags for this measurement ID. Ignore tags belonging to other measurement IDs.

Interactive elements on this page:
{elements_json}

Current dataLayer snapshot (filtered for target measurement ID):
{datalayer_json}

Return a JSON object with exactly two keys: "missing_items" and "tracked_items".

Each missing item must follow this structure:
{{
  "element_selector": "CSS selector for $(document).on click binding",
  "element_text": "visible button/link text",
  "bounding_box": {{"x": number, "y": number, "width": number, "height": number}},
  "issue": "description of missing GA4 event in Korean",
  "recommended_ga_spec": {{
    "element_selector": "same CSS selector",
    "event_name": "click_PC_국문_페이지명",
    "ep_button_area": "area name",
    "ep_button_area2": "sub area name",
    "ep_button_name": "button name or JS expression for 4th GA_Event arg",
    "ep_button_name_type": "literal | variable | expression",
    "setup_lines": ["optional JS lines before GA_Event, e.g. let menuNm = $(this).data('dispnm').replace(/\\\\s/g, '');"],
    "is_virtual": false
  }}
}}

Each tracked item must follow this structure:
{{
  "element_selector": "CSS selector string",
  "element_text": "visible button/link text",
  "bounding_box": {{"x": number, "y": number, "width": number, "height": number}},
  "tracking_description": "how this element is tracked in Korean (e.g. GA_Event on delegated click)",
  "tracking_data": {{
    "event_name": "click_PC_국문_페이지명",
    "ep_button_area": "area name",
    "ep_button_area2": "sub area name",
    "ep_button_name": "button name",
    "is_virtual": false
  }}
}}

Rules:
- Put elements WITHOUT GA4 tracking in missing_items
- Put elements WITH confirmed GA4 tracking in tracked_items
- Do not include the same element in both arrays
- Do NOT include elements in missing_items if hasCodeTracking is true (already verified by code analysis)
- Use codeTrackingData as reference when confirming tracked_items for those elements
- Use the exact boundingBox values from the provided element list — do NOT estimate coordinates
- For tracked_items, prefer codeTrackingData and dataLayer snapshot when available
- recommended_ga_spec must be copy-paste ready for ga4common.js (jQuery delegated click + GA_Event)
- Use specific CSS selectors similar to ga4common.js (class-based, not overly generic)
- ep_button_name_type=literal for fixed strings like "더보기", variable/expression when dynamic
- Only include elements meaningful for analytics
- IGNORE automatic GA events: user_engagement, hit_type (system-collected, not manual tagging)
Respond ONLY with valid JSON.
"""

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_b64}", "detail": "high"},
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        response_format={"type": "json_object"},
        max_tokens=8192,
    )

    raw = response.choices[0].message.content
    logger.info(f"AI response length: {len(raw)} chars")

    parsed = json.loads(raw)
    missing_raw = parsed.get("missing_items", parsed.get("items", []))
    tracked_raw = parsed.get("tracked_items", [])

    return PageAnalysisResult(
        issues=_parse_missing_items(missing_raw),
        tracked_items=_parse_tracked_items(tracked_raw),
    )
