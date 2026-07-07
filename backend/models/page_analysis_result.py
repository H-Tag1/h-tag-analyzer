from typing import List
from pydantic import BaseModel
from .ai_analysis_item import AiAnalysisItem
from .tracked_analysis_item import TrackedAnalysisItem


class PageAnalysisResult(BaseModel):
    issues: List[AiAnalysisItem]
    tracked_items: List[TrackedAnalysisItem]
