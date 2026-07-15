import asyncio
import json
import logging
import time
import uuid
from typing import Any, Dict

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sse_starlette.sse import EventSourceResponse

from models.tag_request_validation import TagRequestValidationResponse
from services.tag_request_validation_service import validate_tag_request_workbook


router = APIRouter()
logger = logging.getLogger(__name__)
_SESSION_TTL_SECONDS = 300
_tag_request_sessions: dict[str, tuple[float, str, bytes, str]] = {}


@router.post("/tag-requests/validate", response_model=TagRequestValidationResponse)
async def validate_tag_request(
    file: UploadFile = File(...),
    trackingId: str = Form("G-1NWKV3S1TW"),
):
    file_name, content = await _read_upload(file)

    try:
        return await validate_tag_request_workbook(file_name, content, trackingId)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/tag-request-sessions")
async def create_tag_request_session(
    file: UploadFile = File(...),
    trackingId: str = Form("G-1NWKV3S1TW"),
):
    _cleanup_expired_sessions()
    file_name, content = await _read_upload(file)

    validation_id = str(uuid.uuid4())
    _tag_request_sessions[validation_id] = (
        time.time(),
        file_name,
        content,
        trackingId,
    )
    return {"validationId": validation_id}


@router.get("/tag-request-sessions/{validation_id}/events")
async def tag_request_session_events(validation_id: str):
    _cleanup_expired_sessions()

    session = _tag_request_sessions.pop(validation_id, None)
    if session is None:
        raise HTTPException(status_code=404, detail="검증 세션이 만료되었거나 존재하지 않습니다.")

    _, file_name, content, tracking_id = session

    async def generator():
        progress_queue: asyncio.Queue[Dict[str, Any]] = asyncio.Queue()

        async def report_progress(event: Dict[str, Any]) -> None:
            await progress_queue.put(event)

        validation_task = asyncio.create_task(
            validate_tag_request_workbook(
                file_name,
                content,
                tracking_id,
                progress=report_progress,
            )
        )

        try:
            while not validation_task.done() or not progress_queue.empty():
                try:
                    event = await asyncio.wait_for(progress_queue.get(), timeout=0.2)
                except asyncio.TimeoutError:
                    continue
                yield {"data": json.dumps(event, ensure_ascii=False)}

            await validation_task
        except asyncio.CancelledError:
            raise
        except ValueError as exc:
            yield {"data": json.dumps({
                "type": "error",
                "message": str(exc),
            }, ensure_ascii=False)}
        except Exception as exc:
            logger.error("Tag request validation error: %s", exc, exc_info=True)
            yield {"data": json.dumps({
                "type": "error",
                "message": f"요청서 검증 중 오류가 발생했습니다: {exc}",
            }, ensure_ascii=False)}
        finally:
            if not validation_task.done():
                validation_task.cancel()
            await asyncio.gather(validation_task, return_exceptions=True)

    return EventSourceResponse(generator())


async def _read_upload(file: UploadFile) -> tuple[str, bytes]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="엑셀 파일을 업로드해주세요.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="엑셀 파일이 비어 있습니다.")
    return file.filename, content


def _cleanup_expired_sessions() -> None:
    now = time.time()
    expired_ids = [
        validation_id
        for validation_id, (created_at, _, _, _) in _tag_request_sessions.items()
        if now - created_at > _SESSION_TTL_SECONDS
    ]
    for validation_id in expired_ids:
        _tag_request_sessions.pop(validation_id, None)
