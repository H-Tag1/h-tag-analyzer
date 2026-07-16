from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from .bounding_box import BoundingBox
from .element_tracking_signal import ElementTrackingSignal


class PageElement(BaseModel):
    selector: str
    text: Optional[str] = None
    element_type: str
    bounding_box: Optional[BoundingBox] = None
    element_index: int = 0
    has_ga_tag: bool = False
    static_tracking_signals: List[ElementTrackingSignal] = Field(default_factory=list)
    click_tracking_events: List[Dict[str, Any]] = Field(default_factory=list)
    click_tested: bool = False
    tracking_data: Dict[str, Any] = Field(default_factory=dict)
    tracking_methods: List[str] = Field(default_factory=list)
    structure_group_key: Optional[str] = None
    click_group_id: Optional[str] = None
    click_group_representative: bool = True
    click_group_size: int = 1
    request_rule_ids: List[str] = Field(default_factory=list)
    request_rule_selectors: List[str] = Field(default_factory=list)
    request_candidate_key: Optional[str] = None
    request_dom_index: int = -1
