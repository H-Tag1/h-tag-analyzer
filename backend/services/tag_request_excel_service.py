import re
import zipfile
from dataclasses import dataclass
from io import BytesIO
from typing import Dict, List, Optional
from xml.etree import ElementTree as ET

from models.tag_request_validation import TagRequestItem


NAMESPACES = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg_rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
SKIP_SHEET_NAMES = {"가이드", "작성 예시"}
URL_PATTERN = re.compile(r"https?://[^\s]+")


@dataclass
class ParsedTagRequestSheet:
    sheet_name: str
    url: Optional[str]
    event_name: Optional[str]
    items: List[TagRequestItem]


def parse_tag_request_workbook(file_name: str, content: bytes) -> List[ParsedTagRequestSheet]:
    if not file_name.lower().endswith(".xlsx"):
        raise ValueError("현재는 .xlsx 요청서만 지원합니다.")

    with zipfile.ZipFile(BytesIO(content)) as archive:
        shared_strings = _read_shared_strings(archive)
        sheet_infos = _read_sheet_infos(archive)

        parsed_sheets: List[ParsedTagRequestSheet] = []
        for sheet_name, sheet_path in sheet_infos:
            if sheet_name in SKIP_SHEET_NAMES:
                continue

            rows = _read_sheet_rows(archive, sheet_path, shared_strings)
            parsed = _parse_request_sheet(sheet_name, rows)
            if parsed.url or parsed.items:
                parsed_sheets.append(parsed)

    return parsed_sheets


def _read_shared_strings(archive: zipfile.ZipFile) -> List[str]:
    try:
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []

    values: List[str] = []
    for item in root.findall("main:si", NAMESPACES):
        text_parts = [node.text or "" for node in item.findall(".//main:t", NAMESPACES)]
        values.append("".join(text_parts))
    return values


def _read_sheet_infos(archive: zipfile.ZipFile) -> List[tuple[str, str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))

    rel_targets = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels.findall("pkg_rel:Relationship", NAMESPACES)
    }

    result: List[tuple[str, str]] = []
    for sheet in workbook.findall("main:sheets/main:sheet", NAMESPACES):
        name = sheet.attrib.get("name", "").strip()
        rel_id = sheet.attrib.get(f"{{{NAMESPACES['rel']}}}id")
        target = rel_targets.get(rel_id or "")
        if not name or not target:
            continue
        result.append((name, _normalize_sheet_path(target)))
    return result


def _normalize_sheet_path(target: str) -> str:
    target = target.lstrip("/")
    return target if target.startswith("xl/") else f"xl/{target}"


def _read_sheet_rows(
    archive: zipfile.ZipFile,
    sheet_path: str,
    shared_strings: List[str],
) -> Dict[int, Dict[int, str]]:
    root = ET.fromstring(archive.read(sheet_path))
    rows: Dict[int, Dict[int, str]] = {}

    for row in root.findall(".//main:sheetData/main:row", NAMESPACES):
        row_index = int(row.attrib.get("r", "0") or 0)
        row_values: Dict[int, str] = {}
        for cell in row.findall("main:c", NAMESPACES):
            ref = cell.attrib.get("r", "")
            col_index = _column_index(ref)
            if not col_index:
                continue

            value = _cell_value(cell, shared_strings)
            if value:
                row_values[col_index] = value

        if row_values:
            rows[row_index] = row_values

    return rows


def _cell_value(cell: ET.Element, shared_strings: List[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//main:t", NAMESPACES)).strip()

    value_node = cell.find("main:v", NAMESPACES)
    if value_node is None or value_node.text is None:
        return ""

    raw = value_node.text.strip()
    if cell_type == "s":
        try:
            return shared_strings[int(raw)].strip()
        except (IndexError, ValueError):
            return ""
    return raw


def _column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha()).upper()
    index = 0
    for ch in letters:
        index = index * 26 + ord(ch) - ord("A") + 1
    return index


def _parse_request_sheet(sheet_name: str, rows: Dict[int, Dict[int, str]]) -> ParsedTagRequestSheet:
    event_name = _find_first_value(rows, lambda value: value.startswith("click_"))
    url = _find_first_url(rows)
    table_row = _find_table_header_row(rows)

    items: List[TagRequestItem] = []
    if table_row:
        items = _parse_request_items(sheet_name, rows, table_row, event_name)

    return ParsedTagRequestSheet(
        sheet_name=sheet_name,
        url=url,
        event_name=event_name,
        items=items,
    )


def _find_first_value(rows: Dict[int, Dict[int, str]], predicate) -> Optional[str]:
    for row_index in sorted(rows):
        for col_index in sorted(rows[row_index]):
            value = rows[row_index][col_index].strip()
            if predicate(value):
                return value
    return None


def _find_first_url(rows: Dict[int, Dict[int, str]]) -> Optional[str]:
    for row_index in sorted(rows):
        for value in rows[row_index].values():
            match = URL_PATTERN.search(value)
            if match:
                return match.group(0).rstrip(")")
    return None


def _find_table_header_row(rows: Dict[int, Dict[int, str]]) -> Optional[int]:
    for row_index, row in rows.items():
        values = {value.strip() for value in row.values()}
        if "이벤트 이름" in values and "매개변수" in values and "매개변수값" in values:
            return row_index
    return None


def _parse_request_items(
    sheet_name: str,
    rows: Dict[int, Dict[int, str]],
    table_row: int,
    fallback_event_name: Optional[str],
) -> List[TagRequestItem]:
    header = rows[table_row]
    event_col = _find_col(header, "이벤트 이름")
    param_cols = [
        col
        for col, value in header.items()
        if value.strip() == "매개변수" and header.get(col + 1, "").strip() == "매개변수값"
    ]
    if not event_col or not param_cols:
        return []

    items: List[TagRequestItem] = []
    blank_rows = 0
    for row_index in range(table_row + 1, max(rows.keys()) + 1):
        row = rows.get(row_index, {})
        if not row:
            blank_rows += 1
            if blank_rows >= 3:
                break
            continue
        blank_rows = 0

        params = {}
        for param_col in param_cols:
            key = row.get(param_col, "").strip()
            value = _clean_param_value(row.get(param_col + 1, ""))
            if key:
                params[key] = value

        request_no = row.get(event_col + 1, "").strip()
        event_name = row.get(event_col, "").strip() or fallback_event_name or ""
        if not request_no and not any(params.values()):
            continue
        if not event_name or not any(key.startswith("ep_button_") for key in params):
            continue

        items.append(TagRequestItem(
            sheet_name=sheet_name,
            row_number=row_index,
            request_no=request_no or str(len(items) + 1),
            event_name=event_name,
            ep_button_area=params.get("ep_button_area", ""),
            ep_button_area2=params.get("ep_button_area2", ""),
            ep_button_name=params.get("ep_button_name", ""),
        ))
    return items


def _find_col(row: Dict[int, str], label: str) -> Optional[int]:
    for col, value in row.items():
        if value.strip() == label:
            return col
    return None


def _clean_param_value(value: str) -> str:
    text = (value or "").strip()
    if not text:
        return ""

    first_line = next((line.strip() for line in text.splitlines() if line.strip()), text)
    for marker in (" / ex.", "/ ex.", " ex.", " 예:"):
        marker_index = first_line.find(marker)
        if marker_index >= 0:
            first_line = first_line[:marker_index]
    return first_line.strip()
