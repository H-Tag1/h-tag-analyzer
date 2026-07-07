from typing import List, Optional
from pydantic import BaseModel, Field

from .network_tag_display_field import NetworkTagDisplayField


class NetworkTagHit(BaseModel):
    event_name: Optional[str] = None
    trigger: str = "page_load"
    ep_button_area: Optional[str] = None
    ep_button_area2: Optional[str] = None
    ep_button_name: Optional[str] = None
    display_fields: List[NetworkTagDisplayField] = Field(default_factory=list)
    tid: Optional[str] = Field(default=None, exclude=True)
