from typing import List

from pydantic import BaseModel, Field

from .generated_code_snapshot import GeneratedCodeSnapshot
from .page_scan_data import PageScanData
from .scan_history_summary import ScanHistorySummary


class ScanHistoryRecord(ScanHistorySummary):
    pages: List[PageScanData] = Field(default_factory=list)
    generated_codes: List[GeneratedCodeSnapshot] = Field(default_factory=list)
