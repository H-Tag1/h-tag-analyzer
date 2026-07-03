from typing import Literal, Optional

from pydantic import BaseModel


class ScanLoginCredentials(BaseModel):
    enabled: bool = False
    memberType: Literal["integrated", "simple"] = "integrated"
    username: str = ""
    password: str = ""


class ScanStartRequest(BaseModel):
    url: str
    fullScan: bool = False
    login: Optional[ScanLoginCredentials] = None
