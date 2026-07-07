import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from config import settings
from models.generated_code_snapshot import GeneratedCodeSnapshot
from models.page_scan_data import PageScanData
from models.save_generated_code_request import SaveGeneratedCodeRequest
from models.scan_history_record import ScanHistoryRecord
from models.scan_history_summary import ScanHistorySummary

logger = logging.getLogger(__name__)


def save_scan_history(
    url: str,
    mode: str,
    full_scan: bool,
    tracking_id: str,
    pages: List[PageScanData],
) -> ScanHistoryRecord:
    summaries = _load_index()
    record_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    issue_count = sum(len(page.issues) for page in pages)
    tracked_count = sum(len(page.tracked_items) for page in pages)

    record = ScanHistoryRecord(
        id=record_id,
        url=url,
        mode=mode,
        full_scan=full_scan,
        tracking_id=tracking_id,
        page_count=len(pages),
        issue_count=issue_count,
        tracked_count=tracked_count,
        has_generated_code=False,
        created_at=created_at,
        pages=pages,
        generated_codes=[],
    )

    _save_record_file(record)
    summaries.insert(0, ScanHistorySummary(**record.model_dump(exclude={"pages", "generated_codes"})))
    _trim_history(summaries)
    _save_index(summaries)

    logger.info("Saved scan history %s (%s, %d pages)", record_id, url, len(pages))
    return record


def list_scan_history() -> List[ScanHistorySummary]:
    return _load_index()


def get_scan_history(record_id: str) -> Optional[ScanHistoryRecord]:
    path = _record_path(record_id)
    if not os.path.exists(path):
        return None

    try:
        with open(path, "r", encoding="utf-8") as file:
            raw = json.load(file)
        return ScanHistoryRecord(**raw)
    except (json.JSONDecodeError, OSError, ValueError) as exc:
        logger.warning("Failed to load scan history %s: %s", record_id, exc)
        return None


def delete_scan_history(record_id: str) -> bool:
    summaries = _load_index()
    next_summaries = [item for item in summaries if item.id != record_id]
    if len(next_summaries) == len(summaries):
        return False

    _save_index(next_summaries)
    path = _record_path(record_id)
    if os.path.exists(path):
        os.remove(path)

    logger.info("Deleted scan history %s", record_id)
    return True


def save_generated_code(record_id: str, request: SaveGeneratedCodeRequest) -> Optional[ScanHistoryRecord]:
    record = get_scan_history(record_id)
    if record is None:
        return None

    snapshot = GeneratedCodeSnapshot(
        page_url=request.page_url,
        code=request.code,
        issue_count=request.issue_count,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )

    existing = [item for item in record.generated_codes if item.page_url != request.page_url]
    existing.append(snapshot)
    record.generated_codes = existing
    record.has_generated_code = len(record.generated_codes) > 0

    _save_record_file(record)
    _update_summary(record)
    return record


def _update_summary(record: ScanHistoryRecord) -> None:
    summaries = _load_index()
    updated = False
    for idx, summary in enumerate(summaries):
        if summary.id == record.id:
            summaries[idx] = ScanHistorySummary(**record.model_dump(exclude={"pages", "generated_codes"}))
            updated = True
            break
    if updated:
        _save_index(summaries)


def _trim_history(summaries: List[ScanHistorySummary]) -> None:
    max_count = settings.max_scan_history
    if len(summaries) <= max_count:
        return

    removed = summaries[max_count:]
    summaries[:] = summaries[:max_count]
    for item in removed:
        path = _record_path(item.id)
        if os.path.exists(path):
            os.remove(path)


def _record_path(record_id: str) -> str:
    return os.path.join(settings.scan_history_dir, f"{record_id}.json")


def _load_index() -> List[ScanHistorySummary]:
    path = settings.scan_history_index_file
    if not os.path.exists(path):
        return []

    try:
        with open(path, "r", encoding="utf-8") as file:
            raw = json.load(file)
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to load scan history index: %s", exc)
        return []

    summaries: List[ScanHistorySummary] = []
    for item in raw:
        try:
            summaries.append(ScanHistorySummary(**item))
        except Exception as exc:
            logger.warning("Skipping invalid scan history summary: %s", exc)
    return summaries


def _save_index(summaries: List[ScanHistorySummary]) -> None:
    path = settings.scan_history_index_file
    os.makedirs(os.path.dirname(path), exist_ok=True)
    payload = [item.model_dump() for item in summaries]
    with open(path, "w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)


def _save_record_file(record: ScanHistoryRecord) -> None:
    os.makedirs(settings.scan_history_dir, exist_ok=True)
    path = _record_path(record.id)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(record.model_dump(), file, ensure_ascii=False, indent=2)
