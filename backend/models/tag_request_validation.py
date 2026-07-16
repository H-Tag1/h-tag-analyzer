from typing import Dict, List, Optional

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
    examples: Dict[str, List[str]] = Field(default_factory=dict)


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


class TagRequestCodeTarget(BaseModel):
    target_id: str
    selector: str
    reference_code: str = ""
    source: str = "reference"


class TagRequestCandidateResult(BaseModel):
    candidate_key: str
    element_selector: str = ""
    element_text: str = ""
    status: str
    click_tested: bool = False
    bounding_box: Optional[BoundingBox] = None
    missing_fields: List[str] = Field(default_factory=list)
    substitutions: List[TagRequestSubstitution] = Field(default_factory=list)
    matched_tag: Optional[TagRequestMatch] = None
    reference_rule_ids: List[str] = Field(default_factory=list)
    reason: str = ""


class TagRequestValidationItem(BaseModel):
    request: TagRequestItem
    status: str
    missing_fields: List[str] = Field(default_factory=list)
    bounding_box: Optional[BoundingBox] = None
    substitutions: List[TagRequestSubstitution] = Field(default_factory=list)
    match_source: str = "rule"
    judgment_source: str = "rule"
    judgment_reason: str = ""
    rag_score: Optional[float] = None
    matched_tag: Optional[TagRequestMatch] = None
    candidate_count: int = 0
    tested_count: int = 0
    matched_count: int = 0
    missing_candidate_count: int = 0
    review_candidate_count: int = 0
    candidate_results: List[TagRequestCandidateResult] = Field(default_factory=list)
    code_targets: List[TagRequestCodeTarget] = Field(default_factory=list)


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
    review_count: int = 0
    error: Optional[str] = None
    items: List[TagRequestValidationItem] = Field(default_factory=list)


class TagRequestValidationResponse(BaseModel):
    file_name: str
    total_count: int = 0
    normal_count: int = 0
    missing_count: int = 0
    review_count: int = 0
    sheets: List[TagRequestSheetResult] = Field(default_factory=list)
