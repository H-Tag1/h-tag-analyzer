from pydantic import BaseModel, Field


class DismissedIssue(BaseModel):
    id: str
    page_url: str
    element_selector: str
    element_text: str = ""
    event_name: str = ""
    ep_button_area: str = ""
    ep_button_area2: str = ""
    ep_button_name: str = ""
    dismissed_at: str
