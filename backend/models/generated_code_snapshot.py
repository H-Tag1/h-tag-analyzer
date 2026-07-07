from pydantic import BaseModel


class GeneratedCodeSnapshot(BaseModel):
    page_url: str
    code: str
    issue_count: int
    generated_at: str
