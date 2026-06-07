from typing import List, Any, Dict
from pydantic import BaseModel
from .ai_analysis_item import AiAnalysisItem


class PageScanData(BaseModel):
    url: str
    screenshot_id: str
    screenshot_width: int
    screenshot_height: int
    element_count: int
    datalayer_events: List[Dict[str, Any]]
    issues: List[AiAnalysisItem]
