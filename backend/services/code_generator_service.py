import asyncio
import json
import logging
import re
from typing import Any, Dict, List, Tuple

from openai import AzureOpenAI

from config import settings
from services.ga4_channel_service import Ga4Channel, resolve_channel

logger = logging.getLogger(__name__)


def _escape_js_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def _format_ga_event_arg(value: str, arg_type: str) -> str:
    if arg_type in ("variable", "expression"):
        return value.strip()
    return f'"{_escape_js_string(value)}"'


def _looks_like_ga_event_spec(ga_spec: Dict[str, Any]) -> bool:
    return bool(
        ga_spec.get("element_selector")
        and (ga_spec.get("event_name") or ga_spec.get("event"))
        and ga_spec.get("ep_button_area") is not None
    )


def generate_ga_event_code_fallback(ga_spec: Dict[str, Any]) -> str:
    selector = ga_spec.get("element_selector", "")
    event_name = ga_spec.get("event_name") or ga_spec.get("event", "")
    ep_button_area = ga_spec.get("ep_button_area", "")
    ep_button_area2 = ga_spec.get("ep_button_area2", "")
    ep_button_name = ga_spec.get("ep_button_name", "")
    is_virtual = bool(ga_spec.get("is_virtual", False))
    setup_lines: List[str] = list(ga_spec.get("setup_lines") or [])

    name_param = ga_spec.get("ep_button_name_param")
    if name_param is None:
        name_type = ga_spec.get("ep_button_name_type", "literal")
        name_param = _format_ga_event_arg(ep_button_name, name_type)

    ga_args = [
        f'"{_escape_js_string(event_name)}"',
        f'"{_escape_js_string(ep_button_area)}"',
        f'"{_escape_js_string(ep_button_area2)}"',
        name_param,
    ]
    if is_virtual:
        ga_args.append("true")

    lines = [f'$(document).on("click", "{_escape_js_string(selector)}", function(){{']
    for setup_line in setup_lines:
        lines.append(f"\t{setup_line.rstrip(';')};")
    lines.append(f"\tGA_Event({', '.join(ga_args)});")
    lines.append("});")
    return "\n".join(lines)


def generate_ga_event_code(ga_spec: Dict[str, Any]) -> str:
    return generate_ga_event_code_fallback(ga_spec)


def generate_datalayer_code(ga_spec: Dict[str, Any]) -> str:
    if _looks_like_ga_event_spec(ga_spec):
        return generate_ga_event_code_fallback(ga_spec)
    formatted = json.dumps(ga_spec, indent=2, ensure_ascii=False)
    return f"window.dataLayer = window.dataLayer || [];\nwindow.dataLayer.push({formatted});"


async def generate_ga_event_code_for_page(
    ga_spec: Dict[str, Any],
    page_url: str,
) -> Tuple[str, Ga4Channel]:
    channel = resolve_channel(page_url)

    if settings.azure_openai_key and settings.azure_openai_endpoint:
        try:
            code = await _generate_with_llm(ga_spec, channel)
            return code, channel
        except Exception as exc:
            logger.warning("LLM code generation failed, using fallback: %s", exc)

    return generate_ga_event_code_fallback(ga_spec), channel


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


async def _generate_with_llm(
    ga_spec: Dict[str, Any],
    channel: Ga4Channel,
) -> str:
    return await asyncio.to_thread(
        _ask_llm_for_ga_event_code,
        ga_spec,
        channel,
    )


def _ask_llm_for_ga_event_code(
    ga_spec: Dict[str, Any],
    channel: Ga4Channel,
) -> str:
    from services.rag_storage_service import (
        RAG_REFERENCE_TOP_K_CODE,
        build_rag_query_from_ga_spec,
        resolve_reference_context,
    )

    client = _make_client()
    spec_json = json.dumps(ga_spec, ensure_ascii=False, indent=2)
    rag_query = build_rag_query_from_ga_spec(ga_spec)
    resolution = resolve_reference_context(channel, rag_query, top_k=RAG_REFERENCE_TOP_K_CODE)
    reference_section = resolution.prompt_section

    if resolution.used_fallback:
        logger.warning(
            "Code generation using RAG fallback for %s: %s",
            channel.channel_id,
            resolution.fallback_reason,
        )
    else:
        logger.info(
            "Code generation RAG hits=%d for %s query=%r",
            len(resolution.hits),
            channel.channel_id,
            rag_query,
        )

    prompt = f"""You are a GA4 tagging expert for Hyundai Duty Free (HDDfs).
Generate ONE jQuery delegated click handler block for ga4common.js.

Channel: {channel.label} ({channel.channel_id}, {channel.hostname})

{reference_section}

GA spec to implement:
```json
{spec_json}
```

Rules:
- Output ONLY one $(document).on("click", selector, function() {{ ... }}) block
- Follow naming, selector style, setup lines, and GA_Event usage from the reference snippets above
- Use GA_Event(event_name, ep_button_area, ep_button_area2, ep_button_name, isVirtual?)
- Include setup_lines from the spec before GA_Event when provided
- ep_button_name_type=literal means quoted string; variable/expression means raw JS
- Do not wrap the answer in markdown fences
- Do not add explanations or comments unless they exist in similar reference snippets
"""

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2048,
        temperature=0.2,
    )

    raw = (response.choices[0].message.content or "").strip()
    return _strip_code_fence(raw)


def _strip_code_fence(raw: str) -> str:
    fenced = re.match(r"^```(?:javascript|js)?\s*\n?(.*?)\n?```$", raw, re.DOTALL | re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()
    return raw


def parse_ga_event_call(source: str) -> Dict[str, Any]:
    match = re.search(
        r"GA_Event\s*\(\s*"
        r"(['\"])(?P<event_name>.*?)\1\s*,\s*"
        r"(['\"])(?P<ep_button_area>.*?)\3\s*,\s*"
        r"(['\"])(?P<ep_button_area2>.*?)\5\s*,\s*"
        r"(?P<ep_button_name>[^,)]+)"
        r"(?:\s*,\s*(?P<is_virtual>true|false))?"
        r"\s*\)",
        source,
        re.IGNORECASE,
    )
    if not match:
        return {}

    ep_button_name = match.group("ep_button_name").strip()
    name_type = "literal"
    literal_match = re.fullmatch(r"['\"](.*)['\"]", ep_button_name)
    if literal_match:
        ep_button_name = literal_match.group(1)
    else:
        name_type = "expression"

    return {
        "event_name": match.group("event_name"),
        "ep_button_area": match.group("ep_button_area"),
        "ep_button_area2": match.group("ep_button_area2"),
        "ep_button_name": ep_button_name,
        "ep_button_name_type": name_type,
        "is_virtual": match.group("is_virtual") == "true",
    }
