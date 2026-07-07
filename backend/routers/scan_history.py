from fastapi import APIRouter, HTTPException

from models.save_generated_code_request import SaveGeneratedCodeRequest
from models.scan_history_record import ScanHistoryRecord
from models.scan_history_summary import ScanHistorySummary
from services.scan_history_service import (
    delete_scan_history,
    get_scan_history,
    list_scan_history,
    save_generated_code,
)

router = APIRouter()


@router.get("/scan-history", response_model=list[ScanHistorySummary])
async def get_scan_histories():
    return list_scan_history()


@router.get("/scan-history/{record_id}", response_model=ScanHistoryRecord)
async def get_scan_history_detail(record_id: str):
    record = get_scan_history(record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="검사 이력을 찾을 수 없습니다.")
    return record


@router.delete("/scan-history/{record_id}")
async def remove_scan_history(record_id: str):
    deleted = delete_scan_history(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="검사 이력을 찾을 수 없습니다.")
    return {"ok": True}


@router.post("/scan-history/{record_id}/generated-code", response_model=ScanHistoryRecord)
async def add_generated_code(record_id: str, request: SaveGeneratedCodeRequest):
    record = save_generated_code(record_id, request)
    if record is None:
        raise HTTPException(status_code=404, detail="검사 이력을 찾을 수 없습니다.")
    return record
