from typing import Any, Dict, List, Literal
from pydantic import BaseModel, Field
from .bounding_box import BoundingBox

TrackedVerificationSource = Literal["direct", "group_inherited"]


class TrackedAnalysisItem(BaseModel):
    element_selector: str
    element_text: str
    bounding_box: BoundingBox
    tracking_description: str
    tracking_data: Dict[str, Any]
    detection_methods: List[str] = Field(default_factory=list)
    verification_source: TrackedVerificationSource = "direct"
