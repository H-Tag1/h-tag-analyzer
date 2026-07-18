from typing import Any, Dict, Literal, Optional
from pydantic import BaseModel
from .bounding_box import BoundingBox

IssueVerificationSource = Literal["direct", "group_inherited"]


class AiAnalysisItem(BaseModel):
    element_selector: str
    element_text: str
    bounding_box: BoundingBox
    issue: str
    recommended_ga_spec: Dict[str, Any]
    judgment_source: str = "rule"
    rag_score: Optional[float] = None
    verification_source: IssueVerificationSource = "direct"
    click_group_id: Optional[str] = None
