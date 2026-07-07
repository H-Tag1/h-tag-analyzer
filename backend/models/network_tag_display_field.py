from typing import List
from pydantic import BaseModel


class NetworkTagDisplayField(BaseModel):
    label: str
    value: str
