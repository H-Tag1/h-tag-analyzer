from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.code_generator_service import generate_ga_event_code_for_page
from services.ga4_template_suggestion_service import suggest_tag_specs_for_page

router = APIRouter()


class GenerateCodeRequest(BaseModel):
    ga_spec: Dict[str, Any]
    page_url: str = Field(min_length=1)


class GenerateCodeResponse(BaseModel):
    code: str
    channel_id: Optional[str] = None
    channel_label: Optional[str] = None


class SuggestIssueInput(BaseModel):
    element_selector: str = ""
    element_text: str = ""
    recommended_ga_spec: Dict[str, Any] = Field(default_factory=dict)


class SuggestTagSpecsRequest(BaseModel):
    page_url: str = Field(min_length=1)
    issues: List[SuggestIssueInput]


class TagSpecSuggestion(BaseModel):
    event_name: str = ""
    ep_button_area: str = ""
    ep_button_area2: str = ""
    ep_button_name: str = ""


class SuggestTagSpecsResponse(BaseModel):
    suggestions: List[TagSpecSuggestion]


@router.post("/suggest-tag-specs", response_model=SuggestTagSpecsResponse)
async def suggest_tag_specs(req: SuggestTagSpecsRequest):
    try:
        raw = await suggest_tag_specs_for_page(
            req.page_url,
            [issue.model_dump() for issue in req.issues],
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return SuggestTagSpecsResponse(
        suggestions=[TagSpecSuggestion(**item) for item in raw],
    )


@router.post("/generate-code", response_model=GenerateCodeResponse)
async def generate_code(req: GenerateCodeRequest):
    try:
        code, channel = await generate_ga_event_code_for_page(req.ga_spec, req.page_url)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return GenerateCodeResponse(
        code=code,
        channel_id=channel.channel_id,
        channel_label=channel.label,
    )
