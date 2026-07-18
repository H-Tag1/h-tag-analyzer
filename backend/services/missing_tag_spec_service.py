import logging
import re
from functools import lru_cache
from typing import Any, Dict, List, Optional, Sequence, Tuple

from models.page_element import PageElement
from services.code_generator_service import _extract_ga_event_arguments, parse_ga_event_call
from services.ga4_channel_service import CHANNELS, Ga4Channel, _template_path, resolve_channel_or_none
from services.tracking.event_normalizer import ep_button_names_match
from services.rag_storage_service import (
    Ga4CodeChunk,
    _extract_ga_event_calls,
    build_default_tag_spec,
    extract_ga4_code_chunks,
    load_ga4common_source,
)
from services.brand_context_service import (
    apply_brand_placeholders_to_spec,
    resolve_brand_context,
    spec_has_brand_placeholder,
)
from services.header_tag_spec_service import (
    build_header_inferred_params,
    is_header_element,
    is_header_language_element,
    is_misassigned_header_event,
)

logger = logging.getLogger(__name__)

TAG_SPEC_FIELDS = ("event_name", "ep_button_area", "ep_button_area2", "ep_button_name")
CLICK_SELECTOR_PATTERN = re.compile(
    r'\$\(\s*document\s*\)\.on\s*\(\s*["\']click["\']\s*,\s*["\']([^"\']+)["\']',
    re.IGNORECASE,
)
SETUP_LINE_PATTERN = re.compile(r"^\s*(?:var|let|const)\s+.+")
IF_ELSE_BLOCK_PATTERN = re.compile(
    r"(?:if|else\s+if)\s*\((?P<condition>[^)]+)\)\s*\{(?P<body>[^{}]*(?:\{[^{}]*\}[^{}]*)*)\}",
    re.DOTALL | re.IGNORECASE,
)
ID_CONDITION_PATTERN = re.compile(
    r'attr\(\s*["\']id["\']\s*\)\s*==\s*["\']([^"\']+)["\']',
    re.IGNORECASE,
)
CLASS_CONDITION_PATTERN = re.compile(
    r'hasClass\(\s*["\']([^"\']+)["\']\s*\)',
    re.IGNORECASE,
)


def _normalize_label(value: str) -> str:
    return re.sub(r"\s+", "", (value or "").strip())


def _merge_spec(existing: Dict[str, Any], inferred: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(existing)
    for field in TAG_SPEC_FIELDS:
        current = str(merged.get(field) or "").strip()
        suggested = str(inferred.get(field) or "").strip()
        if not current and suggested:
            merged[field] = suggested
    for field, value in inferred.items():
        if field in TAG_SPEC_FIELDS:
            continue
        if field not in merged or not merged.get(field):
            merged[field] = value
    return merged


@lru_cache(maxsize=len(CHANNELS))
def _load_channel_chunks(channel_id: str) -> Tuple[Ga4CodeChunk, ...]:
    channel = next((item for item in CHANNELS.values() if item.channel_id == channel_id), None)
    if not channel:
        return tuple()

    template_path = _template_path(channel)
    source = load_ga4common_source(template_path)
    return tuple(extract_ga4_code_chunks(source, channel, template_path))


def _query_tokens(*parts: Optional[str]) -> set[str]:
    tokens: set[str] = set()
    for part in parts:
        if not part:
            continue
        for token in re.findall(r"[\w가-힣]+", part.lower()):
            if len(token) >= 2:
                tokens.add(token)
    return tokens


def _chunk_search_text(chunk: Ga4CodeChunk) -> str:
    return " ".join(
        part
        for part in (
            chunk.section_comment,
            chunk.element_selector,
            chunk.event_name,
            chunk.ep_button_area,
            chunk.ep_button_area2,
            chunk.ep_button_name,
            chunk.keywords,
            chunk.code,
        )
        if part
    ).lower()


def _element_match_hints(element: PageElement) -> Dict[str, set[str]]:
    hints: Dict[str, set[str]] = {"ids": set(), "classes": set(), "texts": set()}
    selector = (element.selector or "").strip()
    if selector.startswith("#"):
        hints["ids"].add(selector[1:].split(".")[0])

    tag_prefix, _, class_part = selector.partition(".")
    if class_part:
        for class_name in class_part.split("."):
            normalized = class_name.strip()
            if normalized:
                hints["classes"].add(normalized)
    elif tag_prefix and tag_prefix not in {"button", "a", "span", "div", "input"}:
        if not tag_prefix.startswith("#"):
            hints["classes"].add(tag_prefix)

    label = _normalize_label(element.text or "")
    if label:
        hints["texts"].add(label)
    return hints


def _branch_condition_matches(condition: str, hints: Dict[str, set[str]]) -> bool:
    condition = condition.strip()
    id_match = ID_CONDITION_PATTERN.search(condition)
    if id_match and id_match.group(1) in hints["ids"]:
        return True

    for class_match in CLASS_CONDITION_PATTERN.finditer(condition):
        if class_match.group(1) in hints["classes"]:
            return True
    return False


def _ga_event_matches_element_text(ga_call: str, hints: Dict[str, set[str]]) -> bool:
    parsed = parse_ga_event_call(ga_call)
    ep_name = str(parsed.get("ep_button_name") or "")
    for text in hints["texts"]:
        if ep_button_names_match(text, ep_name):
            return True
    return False


def _find_matching_ga_event_call(
    handler_code: str,
    hints: Dict[str, set[str]],
) -> Optional[str]:
    ga_calls = _extract_ga_event_calls(handler_code)
    if not ga_calls:
        return None
    if len(ga_calls) == 1:
        return ga_calls[0]

    for block in IF_ELSE_BLOCK_PATTERN.finditer(handler_code):
        condition = block.group("condition")
        body = block.group("body")
        if "GA_Event" not in body:
            continue
        if not _branch_condition_matches(condition, hints):
            continue
        branch_calls = _extract_ga_event_calls(body)
        if branch_calls:
            return branch_calls[0]

    for ga_call in ga_calls:
        if _ga_event_matches_element_text(ga_call, hints):
            return ga_call

    return ga_calls[0]


def _infer_template_variant_from_tracked(
    tracked_items: Optional[Sequence[Any]],
) -> Optional[str]:
    for item in tracked_items or []:
        tracking = getattr(item, "tracking_data", None) or {}
        area = str(tracking.get("ep_button_area") or "")
        if "_확장형" in area:
            return "expand"
        if "_기본형" in area:
            return "basic"
    return None


def _handler_element_match_score(
    chunk: Ga4CodeChunk,
    hints: Dict[str, set[str]],
    template_variant: Optional[str],
) -> int:
    score = 0
    code = chunk.code
    handler_selector = chunk.element_selector or ""

    for element_id in hints["ids"]:
        if element_id in code:
            score += 12
        if f'"{element_id}"' in code or f"'{element_id}'" in code:
            score += 8

    for class_name in hints["classes"]:
        if class_name in code:
            score += 6

    matched_call = _find_matching_ga_event_call(code, hints)
    if matched_call:
        if any(
            _branch_condition_matches(block.group("condition"), hints)
            for block in IF_ELSE_BLOCK_PATTERN.finditer(code)
        ):
            score += 15
        elif _ga_event_matches_element_text(matched_call, hints):
            score += 10

    if template_variant == "expand" and ".expand" in handler_selector:
        score += 6
    if template_variant == "basic" and ".basic" in handler_selector:
        score += 6

    return score


def _score_chunk(
    chunk: Ga4CodeChunk,
    element: PageElement,
    member_labels: Sequence[str],
    prefer_variable: bool,
    page_url: Optional[str] = None,
    element_hints: Optional[Dict[str, set[str]]] = None,
    template_variant: Optional[str] = None,
) -> int:
    hints = element_hints or _element_match_hints(element)
    score = _handler_element_match_score(chunk, hints, template_variant)
    tokens = _query_tokens(
        element.selector,
        element.text,
        element.structure_group_key,
        *member_labels,
    )
    haystack = _chunk_search_text(chunk)

    for token in tokens:
        if token in haystack:
            score += 1

    if prefer_variable:
        if "tabnm" in haystack.replace(" ", ""):
            score += 3
        if "상세탭" in haystack:
            score += 4

    if page_url and "brand.do" in page_url:
        if "템플릿관" in chunk.event_name:
            score += 5
        if "shop_menu" in chunk.element_selector or "depth1" in chunk.element_selector:
            score += 4
        if "브랜드상세" in chunk.event_name:
            score += 2

    if element.selector and element.selector in chunk.element_selector:
        score += 2

    if is_header_element(element):
        if "_공통" in chunk.event_name:
            score += 18
        if chunk.ep_button_area == "Header":
            score += 12
        chunk_selector = chunk.element_selector or ""
        if "list-gnb-util" in chunk_selector and not is_header_language_element(element):
            score += 14
        if "list-language" in chunk_selector and is_header_language_element(element):
            score += 14
        if is_misassigned_header_event(chunk.event_name):
            score -= 40

    return score


def _is_variable_text_handler(chunk: Ga4CodeChunk) -> bool:
    if "$(this).text()" not in chunk.code and ".text().replace" not in chunk.code:
        return False
    ga_calls = _extract_ga_event_calls(chunk.code)
    if not ga_calls:
        return False
    parsed = parse_ga_event_call(ga_calls[0])
    return parsed.get("ep_button_name_type") in {"expression", "variable"}


def _find_reference_chunk(
    channel: Ga4Channel,
    element: PageElement,
    member_labels: Sequence[str],
    prefer_variable: bool,
    page_url: Optional[str] = None,
    tracked_items: Optional[Sequence[Any]] = None,
) -> Optional[Ga4CodeChunk]:
    chunks = _load_channel_chunks(channel.channel_id)
    if not chunks:
        return None

    element_hints = _element_match_hints(element)
    template_variant = _infer_template_variant_from_tracked(tracked_items)

    if prefer_variable:
        chunks = [chunk for chunk in chunks if _is_variable_text_handler(chunk)]
        if not chunks:
            logger.warning("No variable-text ga4Common handlers found for grouped missing spec")
            return None

    ranked = sorted(
        (
            (
                _score_chunk(
                    chunk,
                    element,
                    member_labels,
                    prefer_variable,
                    page_url,
                    element_hints,
                    template_variant,
                ),
                chunk,
            )
            for chunk in chunks
        ),
        key=lambda item: item[0],
        reverse=True,
    )
    best_score, best_chunk = ranked[0]
    if best_score <= 0:
        return None
    return best_chunk


def _extract_setup_lines(handler_code: str) -> List[str]:
    setup_lines: List[str] = []
    for line in handler_code.splitlines():
        if "GA_Event" in line:
            break
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        if SETUP_LINE_PATTERN.match(stripped):
            setup_lines.append(stripped if stripped.endswith(";") else f"{stripped};")
    return setup_lines


def _handler_code_to_spec(
    handler_code: str,
    fallback_selector: str,
    element: Optional[PageElement] = None,
) -> Dict[str, Any]:
    hints = _element_match_hints(element) if element else {"ids": set(), "classes": set(), "texts": set()}
    ga_call = _find_matching_ga_event_call(handler_code, hints)
    if not ga_call:
        return {}

    parsed = parse_ga_event_call(ga_call)
    if not parsed.get("event_name"):
        return {}

    selector_match = CLICK_SELECTOR_PATTERN.search(handler_code)
    selector = selector_match.group(1) if selector_match else fallback_selector

    spec: Dict[str, Any] = {
        "element_selector": selector,
        "event_name": parsed.get("event_name", ""),
        "ep_button_area": parsed.get("ep_button_area", ""),
        "ep_button_area2": parsed.get("ep_button_area2", ""),
        "ep_button_name": parsed.get("ep_button_name", ""),
        "reference_handler_code": handler_code.strip(),
    }

    name_type = parsed.get("ep_button_name_type", "literal")
    if name_type in {"expression", "variable"}:
        args = _extract_ga_event_arguments(ga_call)
        if len(args) >= 4:
            spec["ep_button_name_type"] = name_type
            spec["ep_button_name_param"] = args[3].strip()
        setup_lines = _extract_setup_lines(handler_code)
        if setup_lines:
            spec["setup_lines"] = setup_lines

    return spec


def _chunk_to_recommended_spec(
    chunk: Ga4CodeChunk,
    element: PageElement,
    member_labels: Sequence[str],
    prefer_variable: bool,
) -> Dict[str, Any]:
    spec = _handler_code_to_spec(chunk.code, chunk.element_selector or element.selector, element)
    if not spec:
        spec = {
            "element_selector": chunk.element_selector or element.selector,
            "event_name": chunk.event_name,
            "ep_button_area": chunk.ep_button_area,
            "ep_button_area2": chunk.ep_button_area2,
            "ep_button_name": chunk.ep_button_name,
        }

    if prefer_variable and spec.get("ep_button_name_type") not in {"expression", "variable"}:
        pass

    return spec


def _adapt_ep_button_name_for_member(existing_name: str, member_label: str) -> str:
    if not member_label:
        return existing_name
    for prefix in ("상세탭_", "탭_", "배너_", "메뉴_", "카테고리메뉴_", "상품_"):
        if existing_name.startswith(prefix):
            return f"{prefix}{member_label}"
    if existing_name.endswith("{tabNm}") or "{tabNm}" in existing_name:
        return existing_name.replace("{tabNm}", member_label)
    return member_label or existing_name


def suggest_spec_from_ga4common_reference(
    page_url: Optional[str],
    element: Optional[PageElement],
    existing: Optional[Dict[str, Any]] = None,
    member_labels: Optional[Sequence[str]] = None,
    prefer_variable: bool = False,
    tracked_items: Optional[Sequence[Any]] = None,
) -> Dict[str, Any]:
    merged = dict(existing or {})
    if not page_url or not element:
        return merged

    channel = resolve_channel_or_none(page_url)
    if not channel:
        return merged

    header_spec = build_header_inferred_params(channel, element)
    if header_spec:
        merged = _merge_spec(merged, header_spec)
        logger.info(
            "Missing spec from header ga4Common pattern: selector=%s event=%s",
            merged.get("element_selector"),
            merged.get("event_name"),
        )
        if not str(merged.get("element_selector") or "").strip():
            merged["element_selector"] = element.selector
        return merged

    labels = list(member_labels or [])
    chunk = _find_reference_chunk(
        channel,
        element,
        labels,
        prefer_variable=prefer_variable,
        page_url=page_url,
        tracked_items=tracked_items,
    )
    if chunk:
        inferred = _chunk_to_recommended_spec(
            chunk,
            element,
            labels,
            prefer_variable=prefer_variable,
        )
        merged = _merge_spec(merged, inferred)
        logger.info(
            "Missing spec from ga4Common reference: selector=%s event=%s",
            merged.get("element_selector"),
            merged.get("event_name"),
        )
    else:
        default_spec = build_default_tag_spec(channel, element.text or "")
        merged = _merge_spec(merged, default_spec)

    if not str(merged.get("element_selector") or "").strip():
        merged["element_selector"] = element.selector

    return merged


def suggest_group_representative_spec(
    page_url: Optional[str],
    representative: PageElement,
    members: Sequence[PageElement],
    existing: Optional[Dict[str, Any]] = None,
    tracked_items: Optional[Sequence[Any]] = None,
) -> Dict[str, Any]:
    member_labels = [
        _normalize_label(member.text or "")
        for member in members
        if _normalize_label(member.text or "")
    ]
    variable_group = len(set(member_labels)) > 1
    return suggest_spec_from_ga4common_reference(
        page_url,
        representative,
        existing,
        member_labels=member_labels,
        prefer_variable=variable_group,
        tracked_items=tracked_items,
    )


def adapt_group_member_spec(
    representative_spec: Dict[str, Any],
    member: PageElement,
    existing: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    adapted = dict(existing or {})
    adapted.update(representative_spec)
    label = _normalize_label(member.text or "")
    if label and adapted.get("ep_button_name_type") in {"expression", "variable"}:
        adapted["element_selector"] = member.selector
        return adapted
    if label:
        adapted["ep_button_name"] = _adapt_ep_button_name_for_member(
            str(adapted.get("ep_button_name") or ""),
            label,
        )
    adapted["element_selector"] = member.selector
    return adapted


def enrich_issues_recommended_specs(
    issues: List[Any],
    page_url: Optional[str],
    elements: Optional[List[PageElement]],
    tracked_items: Optional[Sequence[Any]] = None,
) -> List[Any]:
    if not issues:
        return issues

    element_by_key = {
        f"{element.selector}|{(element.text or '').strip()}": element
        for element in (elements or [])
    }
    members_by_group: Dict[str, List[PageElement]] = {}
    for element in elements or []:
        if element.click_group_id:
            members_by_group.setdefault(element.click_group_id, []).append(element)

    group_rep_specs: Dict[str, Dict[str, Any]] = {}
    for group_id, members in members_by_group.items():
        if len(members) < 2:
            continue
        representative = next(
            (member for member in members if member.click_group_representative),
            members[0],
        )
        rep_issue = next(
            (
                issue for issue in issues
                if issue.click_group_id == group_id and issue.verification_source == "direct"
            ),
            None,
        )
        existing = rep_issue.recommended_ga_spec if rep_issue else {}
        group_rep_specs[group_id] = suggest_group_representative_spec(
            page_url,
            representative,
            members,
            existing,
            tracked_items=tracked_items,
        )

    pending: List[tuple[Any, Dict[str, Any]]] = []
    for issue in issues:
        group_id = getattr(issue, "click_group_id", None)
        verification_source = getattr(issue, "verification_source", "direct")
        element = element_by_key.get(
            f"{issue.element_selector}|{(issue.element_text or '').strip()}"
        )

        if group_id and group_id in group_rep_specs:
            if verification_source == "group_inherited" and element:
                spec = adapt_group_member_spec(
                    group_rep_specs[group_id],
                    element,
                    issue.recommended_ga_spec,
                )
            else:
                spec = dict(group_rep_specs[group_id])
        else:
            spec = suggest_spec_from_ga4common_reference(
                page_url,
                element,
                issue.recommended_ga_spec,
                tracked_items=tracked_items,
            )

        pending.append((issue, spec))

    brand_ctx = None
    if any(spec_has_brand_placeholder(spec) for _, spec in pending):
        brand_ctx = resolve_brand_context(
            page_url,
            elements=elements,
            tracked_items=tracked_items,
            issue_texts=[str(getattr(issue, "element_text", "") or "") for issue in issues],
        )
        if brand_ctx.has_name() or brand_ctx.has_code():
            logger.info(
                "Resolved brand placeholders: name=%s code=%s source=%s",
                brand_ctx.brand_name,
                brand_ctx.brand_code,
                brand_ctx.source,
            )

    enriched: List[Any] = []
    for issue, spec in pending:
        if brand_ctx and (brand_ctx.has_name() or brand_ctx.has_code()):
            spec = apply_brand_placeholders_to_spec(spec, brand_ctx)
        enriched.append(issue.model_copy(update={"recommended_ga_spec": spec}))

    return enriched


def enrich_issue_recommended_spec(
    issue_recommended_spec: Dict[str, Any],
    page_url: Optional[str],
    element: Optional[PageElement],
    tracked_items: Optional[Any] = None,
) -> Dict[str, Any]:
    del tracked_items
    return suggest_spec_from_ga4common_reference(
        page_url,
        element,
        issue_recommended_spec,
    )
