from pydantic import BaseModel


class ScanHistorySummary(BaseModel):
    id: str
    url: str
    mode: str
    full_scan: bool
    tracking_id: str
    page_count: int
    issue_count: int
    tracked_count: int
    has_generated_code: bool
    created_at: str
