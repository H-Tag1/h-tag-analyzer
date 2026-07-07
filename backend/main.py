import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import scan, screenshots, code, dismissed_issues, scan_history
from config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")

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

import os
os.makedirs(settings.screenshot_dir, exist_ok=True)
os.makedirs(os.path.dirname(settings.dismissed_issues_file), exist_ok=True)
os.makedirs(settings.scan_history_dir, exist_ok=True)
os.makedirs(os.path.dirname(settings.scan_history_index_file), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health")
async def health():
    return {"status": "ok"}
