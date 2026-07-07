import json
import re
from typing import Any, Dict, List


def _escape_js_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def _format_ga_event_arg(value: str, arg_type: str) -> str:
    if arg_type in ("variable", "expression"):
        return value.strip()
    return f'"{_escape_js_string(value)}"'


def generate_ga_event_code(ga_spec: Dict[str, Any]) -> str:
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


def generate_datalayer_code(ga_spec: Dict[str, Any]) -> str:
    if _looks_like_ga_event_spec(ga_spec):
        return generate_ga_event_code(ga_spec)
    formatted = json.dumps(ga_spec, indent=2, ensure_ascii=False)
    return f"window.dataLayer = window.dataLayer || [];\nwindow.dataLayer.push({formatted});"


def _looks_like_ga_event_spec(ga_spec: Dict[str, Any]) -> bool:
    return bool(
        ga_spec.get("element_selector")
        and (ga_spec.get("event_name") or ga_spec.get("event"))
        and ga_spec.get("ep_button_area") is not None
    )


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
