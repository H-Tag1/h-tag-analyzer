from typing import List, Any, Dict, Optional
from pydantic import BaseModel, Field
from .ai_analysis_item import AiAnalysisItem
from .tracked_analysis_item import TrackedAnalysisItem
from .network_tag_hit import NetworkTagHit


class PageScanData(BaseModel):
    url: str
    screenshot_id: str
    screenshot_width: int
    screenshot_height: int
    element_count: int
    tracking_id: str = "G-1NWKV3S1TW"
    channel_id: Optional[str] = None
    channel_label: Optional[str] = None
    datalayer_events: List[Dict[str, Any]]
    issues: List[AiAnalysisItem]
    review_items: List[AiAnalysisItem] = Field(default_factory=list)
    tracked_items: List[TrackedAnalysisItem] = Field(default_factory=list)
    network_tags: List[NetworkTagHit] = Field(default_factory=list)
