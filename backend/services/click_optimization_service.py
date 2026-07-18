import asyncio
import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from openai import AzureOpenAI

from config import settings
from models.page_element import PageElement

logger = logging.getLogger(__name__)

MIN_CLUSTER_SIZE = 2
MAX_ELEMENTS_FOR_LLM = 150
MIN_HEURISTIC_GROUP_PROTECT_SIZE = 8
HEURISTIC_GROUP_PREFIXES = ("structure:", "layout:")


@dataclass(frozen=True)
class ClickClusterAssignment:
    element_index: int
    group_id: str
    is_representative: bool


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


def build_element_payload_for_clustering(elements: List[PageElement]) -> List[Dict[str, Any]]:
    payload: List[Dict[str, Any]] = []
    for element in elements[:MAX_ELEMENTS_FOR_LLM]:
        bbox = element.bounding_box
        payload.append(
            {
                "element_index": element.element_index,
                "selector": element.selector,
                "text": (element.text or "")[:120],
                "element_type": element.element_type,
                "structure_group_key": element.structure_group_key or "",
                "bounding_box": {
                    "x": round(bbox.x, 1) if bbox else 0,
                    "y": round(bbox.y, 1) if bbox else 0,
                    "width": round(bbox.width, 1) if bbox else 0,
                    "height": round(bbox.height, 1) if bbox else 0,
                },
            }
        )
    return payload


def build_clustering_prompt(element_payload: List[Dict[str, Any]]) -> str:
    elements_json = json.dumps(element_payload, ensure_ascii=False, indent=2)
    return f"""너는 프론트엔드 DOM 구조 분석 전문가야.
제공된 요소 리스트 중 HTML 구조가 완전히 반복되거나 동일한 부모 컴포넌트 하위에 존재하는 중복 구좌(예: 반복문 리스트, 탭 그룹, 배너 배열)를 찾아내서 그룹(group_id)으로 묶어줘.

각 그룹별로 Playwright가 실제로 테스트할 '대표 요소를 딱 1개(is_representative: true)' 지정하고, 나머지 형제 요소들은 is_representative: false로 마킹하여 JSON 리스트로 반환해 줘.

입력 요소 목록:
```json
{elements_json}
```

반환 형식 (JSON 배열만, markdown 금지):
[
  {{
    "element_index": 0,
    "group_id": "tab_special_price",
    "is_representative": true
  }},
  {{
    "element_index": 1,
    "group_id": "tab_special_price",
    "is_representative": false
  }}
]

규칙:
- 중복 구좌로 판단되는 요소만 배열에 포함해 줘. 단독 요소는 생략해 줘.
- group_id는 snake_case로, 같은 컴포넌트/리스트/탭 그룹은 동일 group_id를 사용해 줘.
- 각 group_id마다 is_representative=true는 정확히 1개만 지정해 줘.
- structure_group_key가 같거나 selector/레이아웃이 같은 반복 리스트·탭·배너·카드는 하나의 그룹으로 묶어 줘.
- element_index는 입력값과 정확히 일치해야 해.
- 그룹은 최소 {MIN_CLUSTER_SIZE}개 요소 이상일 때만 만들어 줘.
- 하나의 element_index는 하나의 group_id에만 속해야 해.
"""


def parse_clustering_response(raw: str) -> List[ClickClusterAssignment]:
    cleaned = raw.strip()
    fenced = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```$", cleaned, re.DOTALL | re.IGNORECASE)
    if fenced:
        cleaned = fenced.group(1).strip()

    data = json.loads(cleaned)
    if isinstance(data, dict):
        data = data.get("assignments") or data.get("elements") or data.get("groups") or []

    if not isinstance(data, list):
        raise ValueError("LLM clustering response is not a JSON array")

    assignments: List[ClickClusterAssignment] = []
    for item in data:
        if not isinstance(item, dict):
            continue

        index_raw = item.get("element_index")
        group_id = str(item.get("group_id") or "").strip()
        if index_raw is None or not group_id:
            continue
        if not str(index_raw).isdigit():
            continue

        assignments.append(
            ClickClusterAssignment(
                element_index=int(index_raw),
                group_id=group_id,
                is_representative=bool(item.get("is_representative")),
            )
        )
    return assignments


def validate_cluster_assignments(
    assignments: List[ClickClusterAssignment],
    elements: List[PageElement],
) -> List[ClickClusterAssignment]:
    valid_indices = {element.element_index for element in elements}
    grouped: Dict[str, List[ClickClusterAssignment]] = {}
    seen_indices: set[int] = set()
    validated: List[ClickClusterAssignment] = []

    for assignment in assignments:
        if assignment.element_index not in valid_indices:
            continue
        if assignment.element_index in seen_indices:
            continue
        seen_indices.add(assignment.element_index)
        grouped.setdefault(assignment.group_id, []).append(assignment)

    for group_id, members in grouped.items():
        if len(members) < MIN_CLUSTER_SIZE:
            continue

        representatives = [member for member in members if member.is_representative]
        if len(representatives) != 1:
            fallback_index = min(member.element_index for member in members)
            members = [
                ClickClusterAssignment(
                    element_index=member.element_index,
                    group_id=group_id,
                    is_representative=member.element_index == fallback_index,
                )
                for member in members
            ]
        validated.extend(members)

    return validated


def apply_cluster_assignments(
    elements: List[PageElement],
    assignments: List[ClickClusterAssignment],
) -> int:
    if not assignments:
        return 0

    index_map = {element.element_index: element for element in elements}
    grouped: Dict[str, List[ClickClusterAssignment]] = {}
    for assignment in assignments:
        grouped.setdefault(assignment.group_id, []).append(assignment)

    applied_groups = 0
    for group_id, members in grouped.items():
        if len(members) < MIN_CLUSTER_SIZE:
            continue

        for assignment in members:
            element = index_map.get(assignment.element_index)
            if not element:
                continue
            element.click_group_id = group_id
            element.click_group_representative = assignment.is_representative
            element.click_group_size = len(members)

        applied_groups += 1

    return applied_groups


def cluster_duplicate_elements_with_llm(elements: List[PageElement]) -> List[ClickClusterAssignment]:
    if len(elements) < MIN_CLUSTER_SIZE:
        return []

    payload = build_element_payload_for_clustering(elements)
    prompt = build_clustering_prompt(payload)

    client = _make_client()
    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
        temperature=0.1,
    )

    raw = (response.choices[0].message.content or "").strip()
    assignments = parse_clustering_response(raw)
    return validate_cluster_assignments(assignments, elements)


def _is_protected_heuristic_group(element: PageElement) -> bool:
    group_id = element.click_group_id or ""
    if not any(group_id.startswith(prefix) for prefix in HEURISTIC_GROUP_PREFIXES):
        return False
    return (element.click_group_size or 0) >= MIN_HEURISTIC_GROUP_PROTECT_SIZE


async def apply_llm_click_clustering(elements: List[PageElement]) -> List[PageElement]:
    if not elements:
        return elements

    if not settings.azure_openai_key or not settings.azure_openai_endpoint:
        logger.info("Skip LLM click clustering: Azure OpenAI is not configured")
        return elements

    try:
        assignments = await asyncio.to_thread(cluster_duplicate_elements_with_llm, elements)
        if not assignments:
            logger.info("LLM click clustering returned no duplicate groups")
            return elements

        llm_indices = {assignment.element_index for assignment in assignments}
        protected_indices = {
            element.element_index
            for element in elements
            if element.element_index in llm_indices and _is_protected_heuristic_group(element)
        }
        if protected_indices:
            logger.info(
                "Preserving heuristic click groups for %d elements (skip LLM override)",
                len(protected_indices),
            )
            llm_indices -= protected_indices

        for element in elements:
            if element.element_index in llm_indices:
                element.click_group_id = None
                element.click_group_representative = True
                element.click_group_size = 1

        filtered_assignments = [
            assignment
            for assignment in assignments
            if assignment.element_index not in protected_indices
        ]
        applied_groups = apply_cluster_assignments(elements, filtered_assignments)
        logger.info(
            "LLM click clustering applied: groups=%d grouped_elements=%d click_candidates=%d",
            applied_groups,
            sum(1 for element in elements if element.click_group_id),
            sum(1 for element in elements if element.click_group_representative),
        )
    except Exception as exc:
        logger.warning("LLM click clustering failed: %s", exc)

    return elements
