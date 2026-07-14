from pydantic import BaseModel


class ScreenshotSegment(BaseModel):
    screenshot_id: str
    offset_y: float = 0
    width: int
    height: int
