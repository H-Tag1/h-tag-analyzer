from fastapi import APIRouter

from models.dismiss_issue_request import DismissIssueRequest
from models.dismissed_issue import DismissedIssue
from services.dismissed_issue_service import dismiss_issue, list_dismissed_issues

router = APIRouter()


@router.post("/dismissed-issues", response_model=DismissedIssue)
async def create_dismissed_issue(request: DismissIssueRequest):
    return dismiss_issue(request)


@router.get("/dismissed-issues", response_model=list[DismissedIssue])
async def get_dismissed_issues():
    return list_dismissed_issues()
