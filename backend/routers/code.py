from typing import Any, Dict
from fastapi import APIRouter
from pydantic import BaseModel

from services.code_generator_service import generate_datalayer_code

router = APIRouter()


class GenerateCodeRequest(BaseModel):
    ga_spec: Dict[str, Any]


class GenerateCodeResponse(BaseModel):
    code: str


@router.post("/generate-code", response_model=GenerateCodeResponse)
async def generate_code(req: GenerateCodeRequest):
    code = generate_datalayer_code(req.ga_spec)
    return GenerateCodeResponse(code=code)
