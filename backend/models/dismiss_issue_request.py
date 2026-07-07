from pydantic import BaseModel


class DismissIssueRequest(BaseModel):
    page_url: str
    element_selector: str
    element_text: str = ""
    event_name: str = ""
    ep_button_area: str = ""
    ep_button_area2: str = ""
    ep_button_name: str = ""
