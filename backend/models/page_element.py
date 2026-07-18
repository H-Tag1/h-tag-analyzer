from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from .bounding_box import BoundingBox
from .element_tracking_signal import ElementTrackingSignal


class PageElement(BaseModel):
    selector: str
    text: Optional[str] = None
    element_type: str
    bounding_box: Optional[BoundingBox] = None
    # 렌더링 전용 교정 좌표. 화면에서 가려진 중복 요소(예: 스티키 헤더의 숨은 nav)의
    # 오버레이 박스를 보이는 쌍둥이 위치로 옮길 때만 채운다. 그룹핑/분류 등 로직은
    # 항상 bounding_box(원본 DOM 좌표)를 사용하므로 이 필드는 로직에 영향을 주지 않는다.
    render_box: Optional[BoundingBox] = None
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
    in_hamburger_drawer: bool = False
    ga4common_tracking_required: Optional[bool] = None
    ga4common_exclusion_reason: Optional[str] = None
