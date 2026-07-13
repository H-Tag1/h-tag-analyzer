from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.tag_request_validation import TagRequestValidationResponse
from services.tag_request_validation_service import validate_tag_request_workbook


router = APIRouter()


@router.post("/tag-requests/validate", response_model=TagRequestValidationResponse)
async def validate_tag_request(
    file: UploadFile = File(...),
    trackingId: str = Form("G-1NWKV3S1TW"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="엑셀 파일을 업로드해주세요.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="엑셀 파일이 비어 있습니다.")

    try:
        return await validate_tag_request_workbook(file.filename, content, trackingId)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
