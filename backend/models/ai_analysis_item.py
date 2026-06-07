from typing import Any, Dict
from pydantic import BaseModel
from .bounding_box import BoundingBox


class AiAnalysisItem(BaseModel):
    element_selector: str
    element_text: str
    bounding_box: BoundingBox
    issue: str
    recommended_ga_spec: Dict[str, Any]
