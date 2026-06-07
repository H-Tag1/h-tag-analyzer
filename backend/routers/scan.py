import logging
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from services.batch_scan_service import single_scan, batch_scan

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/scan")
async def scan(url: str, fullScan: bool = False):
    async def generator():
        try:
            if fullScan:
                async for event in batch_scan(url):
                    yield {"data": event}
            else:
                async for event in single_scan(url):
                    yield {"data": event}
        except Exception as e:
            logger.error(f"Scan error: {e}", exc_info=True)
            import json
            yield {"data": json.dumps({"type": "error", "message": str(e)})}

    return EventSourceResponse(generator())
