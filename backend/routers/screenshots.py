import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from config import settings

router = APIRouter()


@router.get("/screenshots/{screenshot_id}")
async def get_screenshot(screenshot_id: str):
    if "/" in screenshot_id or ".." in screenshot_id:
        raise HTTPException(status_code=400, detail="Invalid screenshot id")

    path = os.path.join(settings.screenshot_dir, f"{screenshot_id}.png")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Screenshot not found")

    return FileResponse(path, media_type="image/png")
