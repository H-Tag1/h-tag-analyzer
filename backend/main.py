import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import scan, screenshots, code, dismissed_issues, scan_history, tag_requests
from config import settings
from logging_setup import configure_logging

configure_logging(settings.log_level)

logger = logging.getLogger(__name__)

app = FastAPI(title="H-Tag API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/api")
app.include_router(screenshots.router, prefix="/api")
app.include_router(code.router, prefix="/api")
app.include_router(dismissed_issues.router, prefix="/api")
app.include_router(scan_history.router, prefix="/api")
app.include_router(tag_requests.router, prefix="/api")

import os
os.makedirs(settings.screenshot_dir, exist_ok=True)
os.makedirs(os.path.dirname(settings.dismissed_issues_file), exist_ok=True)
os.makedirs(settings.scan_history_dir, exist_ok=True)
os.makedirs(os.path.dirname(settings.scan_history_index_file), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

logger.info("H-Tag API started (log_level=%s)", settings.log_level)


@app.get("/health")
async def health():
    return {"status": "ok"}
