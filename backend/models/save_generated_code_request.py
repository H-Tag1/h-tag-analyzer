from pydantic import BaseModel


class SaveGeneratedCodeRequest(BaseModel):
    page_url: str
    code: str
    issue_count: int
