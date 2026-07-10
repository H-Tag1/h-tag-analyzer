from typing import Literal, Optional

from pydantic import BaseModel


class ScanLoginCredentials(BaseModel):
    enabled: bool = False
    memberType: Literal["integrated", "simple"] = "integrated"
    username: str = ""
    password: str = ""


class ScanRange(BaseModel):
    preset: Literal["viewport", "top2", "full", "custom"] = "top2"
    startY: Optional[float] = None
    endY: Optional[float] = None


class ScanStartRequest(BaseModel):
    url: str
    fullScan: bool = False
    trackingId: str = "G-1NWKV3S1TW"
    login: Optional[ScanLoginCredentials] = None
    scanRange: Optional[ScanRange] = None
