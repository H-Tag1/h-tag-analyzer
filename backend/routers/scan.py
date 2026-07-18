import logging
import time
import uuid
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from models.scan_request import ScanRange, ScanStartRequest
from services.batch_scan_service import single_scan, batch_scan

router = APIRouter()
logger = logging.getLogger(__name__)
_SESSION_TTL_SECONDS = 300
_scan_sessions: dict[str, tuple[float, ScanStartRequest]] = {}


@router.get("/scan")
async def scan(
    url: str,
    fullScan: bool = False,
    trackingId: str = "G-1NWKV3S1TW",
    rangePreset: Literal["viewport", "top2", "full", "custom"] = "full",
    rangeStartY: Optional[float] = None,
    rangeEndY: Optional[float] = None,
):
    scan_range = ScanRange(preset=rangePreset, startY=rangeStartY, endY=rangeEndY)

    async def generator():
        try:
            if fullScan:
                async for event in batch_scan(url, tracking_id=trackingId, scan_range=scan_range):
                    yield {"data": event}
            else:
                async for event in single_scan(url, tracking_id=trackingId, scan_range=scan_range):
                    yield {"data": event}
        except Exception as e:
            logger.error(f"Scan error: {e}", exc_info=True)
            import json
            yield {"data": json.dumps({"type": "error", "message": str(e)})}

    return EventSourceResponse(generator())


@router.post("/scan-sessions")
async def create_scan_session(payload: ScanStartRequest):
    _cleanup_expired_sessions()

    if payload.login and payload.login.enabled:
        if not payload.login.username.strip() or not payload.login.password:
            raise HTTPException(status_code=400, detail="로그인 ID와 비밀번호를 입력해주세요.")

    scan_id = str(uuid.uuid4())
    _scan_sessions[scan_id] = (time.time(), payload)
    return {"scanId": scan_id}


@router.get("/scan-sessions/{scan_id}/events")
async def scan_session_events(scan_id: str):
    _cleanup_expired_sessions()

    session = _scan_sessions.pop(scan_id, None)
    if session is None:
        raise HTTPException(status_code=404, detail="검사 세션이 만료되었거나 존재하지 않습니다.")

    _, payload = session

    async def generator():
        try:
            if payload.fullScan:
                async for event in batch_scan(payload.url, payload.login, payload.trackingId, payload.scanRange):
                    yield {"data": event}
            else:
                async for event in single_scan(payload.url, payload.login, payload.trackingId, payload.scanRange):
                    yield {"data": event}
        except Exception as e:
            logger.error(f"Scan error: {e}", exc_info=True)
            import json
            yield {"data": json.dumps({"type": "error", "message": str(e)})}

    return EventSourceResponse(generator())


def _cleanup_expired_sessions() -> None:
    now = time.time()
    expired_ids = [
        scan_id
        for scan_id, (created_at, _) in _scan_sessions.items()
        if now - created_at > _SESSION_TTL_SECONDS
    ]
    for scan_id in expired_ids:
        _scan_sessions.pop(scan_id, None)
