from typing import Any, Dict, Optional
from pydantic import BaseModel


class ElementTrackingSignal(BaseModel):
    type: str
    name: Optional[str] = None
    value: Optional[str] = None
    depth: int = 0
