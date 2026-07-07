from typing import List, Optional
from pydantic import BaseModel, Field

from .network_tag_display_field import NetworkTagDisplayField


class NetworkTagHit(BaseModel):
    event_name: Optional[str] = None
    trigger: str = "page_load"
    display_fields: List[NetworkTagDisplayField] = Field(default_factory=list)
    tid: Optional[str] = Field(default=None, exclude=True)
