import re
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from models.tag_request_validation import TagRequestItem


EP_FIELDS = ("ep_button_area", "ep_button_area2", "ep_button_name")
PLACEHOLDER_PATTERN = re.compile(r"\{\{\s*([^{}]+?)\s*\}\}")


@dataclass(frozen=True)
class FieldBinding:
    field: str
    placeholder: str
    value: str


@dataclass(frozen=True)
class RequestParameterMatch:
    matched: bool
    missing_fields: List[str] = field(default_factory=list)
    bindings: Dict[str, str] = field(default_factory=dict)
    field_bindings: List[FieldBinding] = field(default_factory=list)


def normalize_tracking_value(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", str(value or "")).strip()
    return re.sub(r"\s+", "", normalized)


def match_request_parameters(
    request: TagRequestItem,
    actual_params: Dict[str, str],
) -> RequestParameterMatch:
    bindings: Dict[str, str] = {}
    field_bindings: List[FieldBinding] = []
    missing_fields: List[str] = []

    for field_name in EP_FIELDS:
        expected = str(getattr(request, field_name, "") or "")
        actual = str(actual_params.get(field_name, "") or "")
        matched, next_bindings, extracted = _match_field(
            field_name,
            expected,
            actual,
            bindings,
        )
        if not matched:
            missing_fields.append(field_name)
            continue
        bindings = next_bindings
        field_bindings.extend(extracted)

    return RequestParameterMatch(
        matched=not missing_fields,
        missing_fields=missing_fields,
        bindings=bindings,
        field_bindings=field_bindings,
    )


def request_example_score(request: TagRequestItem, actual_params: Dict[str, str]) -> int:
    score = 0
    for field_name, examples in request.examples.items():
        actual = normalize_tracking_value(actual_params.get(field_name, ""))
        if not actual:
            continue
        for example in examples:
            normalized_example = normalize_tracking_value(example)
            if normalized_example and (
                normalized_example == actual
                or normalized_example in actual
                or actual in normalized_example
            ):
                score += 1
    return score


def _match_field(
    field_name: str,
    expected: str,
    actual: str,
    existing_bindings: Dict[str, str],
) -> Tuple[bool, Dict[str, str], List[FieldBinding]]:
    normalized_expected = unicodedata.normalize("NFKC", expected).strip()
    normalized_actual = unicodedata.normalize("NFKC", actual).strip()
    if not normalized_expected:
        return True, dict(existing_bindings), []
    if not normalized_actual:
        return False, dict(existing_bindings), []

    pattern_parts: List[str] = []
    new_placeholders: List[Tuple[str, str]] = []
    last_index = 0

    for index, match in enumerate(PLACEHOLDER_PATTERN.finditer(normalized_expected)):
        pattern_parts.append(_whitespace_flexible_literal(
            normalized_expected[last_index:match.start()]
        ))
        placeholder_name = match.group(1).strip()
        bound_value = existing_bindings.get(placeholder_name)
        if bound_value is not None:
            pattern_parts.append(_whitespace_flexible_literal(bound_value))
        else:
            group_name = f"p{index}"
            new_placeholders.append((placeholder_name, group_name))
            pattern_parts.append(f"(?P<{group_name}>.+?)")
        last_index = match.end()
    pattern_parts.append(_whitespace_flexible_literal(normalized_expected[last_index:]))

    regex_match = re.fullmatch("".join(pattern_parts), normalized_actual)
    if not regex_match:
        return False, dict(existing_bindings), []

    next_bindings = dict(existing_bindings)
    extracted: List[FieldBinding] = []
    for placeholder_name, group_name in new_placeholders:
        value = regex_match.group(group_name).strip()
        existing_value = next_bindings.get(placeholder_name)
        if (
            existing_value is not None
            and normalize_tracking_value(existing_value) != normalize_tracking_value(value)
        ):
            return False, dict(existing_bindings), []
        if existing_value is None:
            next_bindings[placeholder_name] = value
            extracted.append(FieldBinding(
                field=field_name,
                placeholder=f"{{{{{placeholder_name}}}}}",
                value=value,
            ))

    return True, next_bindings, extracted


def _whitespace_flexible_literal(value: str) -> str:
    compact = normalize_tracking_value(value)
    return r"\s*".join(re.escape(char) for char in compact)
