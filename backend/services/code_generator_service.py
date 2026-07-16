import asyncio
import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

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
    arguments = _extract_ga_event_arguments(source)
    if len(arguments) < 4:
        return {}

    event_name, event_name_type = _js_expression_to_template(arguments[0])
    ep_button_area, area_type = _js_expression_to_template(arguments[1])
    ep_button_area2, area2_type = _js_expression_to_template(arguments[2])
    ep_button_name, name_type = _js_expression_to_template(arguments[3])
    if not event_name:
        return {}

    return {
        "event_name": event_name,
        "event_name_type": event_name_type,
        "ep_button_area": ep_button_area,
        "ep_button_area_type": area_type,
        "ep_button_area2": ep_button_area2,
        "ep_button_area2_type": area2_type,
        "ep_button_name": ep_button_name,
        "ep_button_name_type": name_type,
        "is_virtual": len(arguments) >= 5 and arguments[4].strip().lower() == "true",
    }


def _extract_ga_event_arguments(source: str) -> List[str]:
    match = re.search(r"GA_Event\s*\(", source, re.IGNORECASE)
    if not match:
        return []

    open_index = source.find("(", match.start())
    if open_index < 0:
        return []

    depth = 1
    in_string: Optional[str] = None
    escape = False
    index = open_index + 1
    while index < len(source):
        char = source[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == in_string:
                in_string = None
        elif char in ("'", '"', "`"):
            in_string = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return _split_top_level(source[open_index + 1:index], ",")
        index += 1
    return []


def _split_top_level(source: str, delimiter: str) -> List[str]:
    parts: List[str] = []
    start = 0
    depths = {"(": 0, "[": 0, "{": 0}
    closing = {")": "(", "]": "[", "}": "{"}
    in_string: Optional[str] = None
    escape = False

    for index, char in enumerate(source):
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == in_string:
                in_string = None
            continue

        if char in ("'", '"', "`"):
            in_string = char
            continue
        if char in depths:
            depths[char] += 1
            continue
        if char in closing:
            opener = closing[char]
            depths[opener] = max(depths[opener] - 1, 0)
            continue
        if char == delimiter and all(depth == 0 for depth in depths.values()):
            parts.append(source[start:index].strip())
            start = index + 1

    parts.append(source[start:].strip())
    return [part for part in parts if part]


def _js_expression_to_template(source: str) -> tuple[str, str]:
    expression = source.strip()
    literal = _parse_js_string_literal(expression)
    if literal is not None:
        return literal, "literal"

    template_literal = _parse_js_template_literal(expression)
    if template_literal is not None:
        return template_literal, "expression"

    parts = _split_top_level(expression, "+")
    if len(parts) <= 1:
        return _dynamic_placeholder(expression), "expression"

    rendered: List[str] = []
    for part in parts:
        part_literal = _parse_js_string_literal(part)
        if part_literal is not None:
            rendered.append(part_literal)
        else:
            rendered.append(_dynamic_placeholder(part))
    return "".join(rendered), "expression"


def _parse_js_string_literal(source: str) -> Optional[str]:
    if len(source) < 2 or source[0] not in ("'", '"') or source[-1] != source[0]:
        return None
    body = source[1:-1]
    return re.sub(r"\\(['\"\\])", r"\1", body)


def _parse_js_template_literal(source: str) -> Optional[str]:
    if len(source) < 2 or source[0] != "`" or source[-1] != "`":
        return None

    body = source[1:-1]
    return re.sub(
        r"\$\{([^{}]+)\}",
        lambda match: _dynamic_placeholder(match.group(1)),
        body,
    )


def _dynamic_placeholder(source: str) -> str:
    expression = source.strip()
    while expression.startswith("(") and expression.endswith(")"):
        expression = expression[1:-1].strip()
    identifier = re.fullmatch(r"[A-Za-z_$][\w$]*", expression)
    if identifier:
        return f"{{{{{identifier.group(0)}}}}}"

    compact = re.sub(r"\W+", "_", expression, flags=re.UNICODE).strip("_")
    return f"{{{{{compact[:40] or 'dynamic'}}}}}"
