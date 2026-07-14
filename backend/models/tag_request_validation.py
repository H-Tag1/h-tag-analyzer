from typing import List, Optional

from pydantic import BaseModel, Field

from .bounding_box import BoundingBox
from .screenshot_segment import ScreenshotSegment


class TagRequestItem(BaseModel):
    sheet_name: str
    row_number: int
    request_no: str
    event_name: str
    ep_button_area: str = ""
    ep_button_area2: str = ""
    ep_button_name: str = ""


class TagRequestMatch(BaseModel):
    event_name: str
    ep_button_area: str = ""
    ep_button_area2: str = ""
    ep_button_name: str = ""
    trigger: str = "page_load"


class TagRequestSubstitution(BaseModel):
    field: str
    placeholder: str
    value: str


class TagRequestValidationItem(BaseModel):
    request: TagRequestItem
    status: str
    missing_fields: List[str] = Field(default_factory=list)
    bounding_box: Optional[BoundingBox] = None
    substitutions: List[TagRequestSubstitution] = Field(default_factory=list)
    match_source: str = "rule"
    matched_tag: Optional[TagRequestMatch] = None


class TagRequestSheetResult(BaseModel):
    sheet_name: str
    url: Optional[str] = None
    event_name: Optional[str] = None
    screenshot_id: Optional[str] = None
    screenshot_width: int = 0
    screenshot_height: int = 0
    screenshot_segments: List[ScreenshotSegment] = Field(default_factory=list)
    element_count: int = 0
    total_count: int = 0
    normal_count: int = 0
    missing_count: int = 0
    error: Optional[str] = None
    items: List[TagRequestValidationItem] = Field(default_factory=list)


class TagRequestValidationResponse(BaseModel):
    file_name: str
    total_count: int = 0
    normal_count: int = 0
    missing_count: int = 0
    sheets: List[TagRequestSheetResult] = Field(default_factory=list)
