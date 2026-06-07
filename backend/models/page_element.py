from typing import Optional
from pydantic import BaseModel
from .bounding_box import BoundingBox


class PageElement(BaseModel):
    selector: str
    text: Optional[str] = None
    element_type: str
    bounding_box: Optional[BoundingBox] = None
    has_ga_tag: bool = False
