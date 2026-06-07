import base64
import json
import logging
from typing import List

from openai import AzureOpenAI

from config import settings
from models.page_element import PageElement
from models.ai_analysis_item import AiAnalysisItem
from models.bounding_box import BoundingBox

logger = logging.getLogger(__name__)

GA4_GUIDELINE = """
You are a GA4 (Google Analytics 4) tagging expert for e-commerce websites.
Analyze the provided webpage screenshot and interactive element list to identify elements that are MISSING GA4 event tracking.

GA4 E-commerce Standard Events to check:
- view_item: product detail page view
- add_to_cart: add to cart button
- remove_from_cart: remove from cart
- begin_checkout: start checkout button
- purchase: final purchase/order button
- add_to_wishlist: wishlist/favorite button
- view_item_list: product list/category pages
- select_item: clicking on a product item
- login: login button
- sign_up: signup/register button
- search: search button/form submit
- share: share button

Focus on buttons and links that clearly represent user actions but lack GA4 tracking.
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


async def analyze_page(
    screenshot_path: str,
    elements: List[PageElement],
    datalayer_events: list,
) -> List[AiAnalysisItem]:
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
            }
            for el in elements
        ],
        ensure_ascii=False,
    )

    existing_events = json.dumps(
        [e.get("event") for e in datalayer_events if isinstance(e, dict) and "event" in e],
        ensure_ascii=False,
    )

    prompt = f"""{GA4_GUIDELINE}

Interactive elements on this page:
{elements_json}

Existing GA4 events already tracked (from dataLayer):
{existing_events}

Return a JSON object with a single key "items" containing an array.
Each item must follow this exact structure:
{{
  "element_selector": "CSS selector string",
  "element_text": "visible button/link text",
  "bounding_box": {{"x": number, "y": number, "width": number, "height": number}},
  "issue": "description of missing GA4 event in Korean",
  "recommended_ga_spec": {{
    "event": "ga4_event_name",
    ...other GA4 parameters
  }}
}}

Only include elements that are MISSING GA4 tracking and are meaningful for analytics.
Use the exact boundingBox values from the provided element list — do NOT estimate coordinates.
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
        max_tokens=4096,
    )

    raw = response.choices[0].message.content
    logger.info(f"AI response length: {len(raw)} chars")

    parsed = json.loads(raw)
    items_raw = parsed.get("items", [])

    results = []
    for item in items_raw:
        try:
            bb = item.get("bounding_box", {})
            results.append(
                AiAnalysisItem(
                    element_selector=item["element_selector"],
                    element_text=item.get("element_text", ""),
                    bounding_box=BoundingBox(
                        x=bb.get("x", 0),
                        y=bb.get("y", 0),
                        width=bb.get("width", 100),
                        height=bb.get("height", 40),
                    ),
                    issue=item.get("issue", ""),
                    recommended_ga_spec=item.get("recommended_ga_spec", {}),
                )
            )
        except Exception as e:
            logger.warning(f"Skipping malformed AI item: {e}")

    return results
