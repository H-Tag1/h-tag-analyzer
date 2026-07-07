import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List
from urllib.parse import urlparse

from config import settings
from models.ai_analysis_item import AiAnalysisItem
from models.dismiss_issue_request import DismissIssueRequest
from models.dismissed_issue import DismissedIssue

logger = logging.getLogger(__name__)


def normalize_page_url(url: str) -> str:
    parsed = urlparse(url.strip())
    path = parsed.path.rstrip("/") or "/"
    scheme = parsed.scheme or "https"
    host = (parsed.netloc or "").lower()
    return f"{scheme}://{host}{path}"


def issue_identity_key(page_url: str, element_selector: str, element_text: str) -> str:
    return f"{normalize_page_url(page_url)}|{element_selector.strip()}|{element_text.strip()}"


def dismiss_issue(request: DismissIssueRequest) -> DismissedIssue:
    records = _load_records()
    identity = issue_identity_key(request.page_url, request.element_selector, request.element_text)

    for record in records:
        if _record_identity(record) == identity:
            return record

    dismissed = DismissedIssue(
        id=str(uuid.uuid4()),
        page_url=normalize_page_url(request.page_url),
        element_selector=request.element_selector.strip(),
        element_text=request.element_text.strip(),
        event_name=request.event_name.strip(),
        ep_button_area=request.ep_button_area.strip(),
        ep_button_area2=request.ep_button_area2.strip(),
        ep_button_name=request.ep_button_name.strip(),
        dismissed_at=datetime.now(timezone.utc).isoformat(),
    )
    records.append(dismissed)
    _save_records(records)
    logger.info("Dismissed issue: %s", identity)
    return dismissed


def list_dismissed_issues() -> List[DismissedIssue]:
    return _load_records()


def filter_dismissed_issues(issues: List[AiAnalysisItem], page_url: str) -> List[AiAnalysisItem]:
    dismissed_keys = {_record_identity(record) for record in _load_records()}
    if not dismissed_keys:
        return issues

    return [
        issue
        for issue in issues
        if issue_identity_key(page_url, issue.element_selector, issue.element_text) not in dismissed_keys
    ]


def is_issue_dismissed(page_url: str, element_selector: str, element_text: str) -> bool:
    identity = issue_identity_key(page_url, element_selector, element_text)
    return any(_record_identity(record) == identity for record in _load_records())


def _record_identity(record: DismissedIssue) -> str:
    return issue_identity_key(record.page_url, record.element_selector, record.element_text)


def _load_records() -> List[DismissedIssue]:
    path = settings.dismissed_issues_file
    if not os.path.exists(path):
        return []

    try:
        with open(path, "r", encoding="utf-8") as file:
            raw = json.load(file)
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to load dismissed issues: %s", exc)
        return []

    records: List[DismissedIssue] = []
    for item in raw:
        try:
            records.append(DismissedIssue(**item))
        except Exception as exc:
            logger.warning("Skipping invalid dismissed issue record: %s", exc)
    return records


def _save_records(records: List[DismissedIssue]) -> None:
    path = settings.dismissed_issues_file
    os.makedirs(os.path.dirname(path), exist_ok=True)
    payload = [record.model_dump() for record in records]
    with open(path, "w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
