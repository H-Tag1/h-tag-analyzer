from pydantic import BaseModel

from .bounding_box import BoundingBox


class ExcludedAnalysisItem(BaseModel):
    element_selector: str
    element_text: str
    bounding_box: BoundingBox
    exclusion_reason: str
