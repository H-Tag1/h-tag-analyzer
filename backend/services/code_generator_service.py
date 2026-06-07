import json
from typing import Any, Dict


def generate_datalayer_code(ga_spec: Dict[str, Any]) -> str:
    formatted = json.dumps(ga_spec, indent=2, ensure_ascii=False)
    return f"window.dataLayer = window.dataLayer || [];\nwindow.dataLayer.push({formatted});"
