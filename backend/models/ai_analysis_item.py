from typing import Any, Dict, Optional
from pydantic import BaseModel
from .bounding_box import BoundingBox


class AiAnalysisItem(BaseModel):
    element_selector: str
    element_text: str
    bounding_box: BoundingBox
    issue: str
    recommended_ga_spec: Dict[str, Any]
    judgment_source: str = "rule"
    rag_score: Optional[float] = None
