#!/usr/bin/env python3
"""RAG + POST /api/generate-code integration verification."""

from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Any, Dict, List

_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from fastapi.testclient import TestClient

from main import app
from services.ga4_channel_service import CHANNELS
from services.rag_storage_service import (
    SAMPLE_KR_PC_SOURCE,
    build_rag_query_from_ga_spec,
    index_inline_source,
    print_rag_resolution_diagnostics,
    resolve_reference_context,
)

DEFAULT_PAGE_URL = "https://www.hddfs.com/shop/main"
DEFAULT_GA_SPEC: Dict[str, Any] = {
    "element_selector": ".list-main-category a",
    "element_text": "향수",
    "event_name": "click_PC_국문_공통",
    "ep_button_area": "GNB",
    "ep_button_area2": "GNB_공통",
    "ep_button_name": "향수",
}

NOVEL_GA_SPEC: Dict[str, Any] = {
    "element_selector": ".brand-new-widget-2099 button",
    "element_text": "완전신규UI",
    "event_name": "click_PC_국문_공통",
    "ep_button_area": "신규영역",
    "ep_button_area2": "신규영역_버튼",
    "ep_button_name": "완전신규UI",
}


def validate_generated_code(code: str, ga_spec: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    if not code.strip():
        errors.append("generated code is empty")
        return errors

    if not re.search(r"\$\(\s*document\s*\)\.on\s*\(\s*[\"']click[\"']", code, re.IGNORECASE):
        errors.append("missing jQuery delegated click handler")

    if "GA_Event" not in code:
        errors.append("missing GA_Event call")

    selector = str(ga_spec.get("element_selector") or "").strip()
    if selector and selector not in code:
        errors.append(f"selector not found in generated code: {selector}")

    event_name = str(ga_spec.get("event_name") or ga_spec.get("event") or "").strip()
    if event_name and event_name not in code:
        errors.append(f"event_name not found in generated code: {event_name}")

    open_braces = code.count("{")
    close_braces = code.count("}")
    if open_braces != close_braces:
        errors.append(f"unbalanced braces: open={open_braces}, close={close_braces}")

    return errors


def run_rag_diagnostics(page_url: str, ga_spec: Dict[str, Any]) -> None:
    channel = CHANNELS["www.hddfs.com"] if "www.hddfs.com" in page_url else None
    if channel is None:
        from services.ga4_channel_service import resolve_channel

        channel = resolve_channel(page_url)

    query = build_rag_query_from_ga_spec(ga_spec)
    resolution = resolve_reference_context(channel, query)
    print_rag_resolution_diagnostics(resolution)


def call_generate_code_endpoint(page_url: str, ga_spec: Dict[str, Any]) -> Dict[str, Any]:
    client = TestClient(app)
    response = client.post(
        "/api/generate-code",
        json={"page_url": page_url, "ga_spec": ga_spec},
    )
    print(f"HTTP {response.status_code}")
    payload = response.json()
    print(f"channel_id: {payload.get('channel_id')}")
    print(f"channel_label: {payload.get('channel_label')}")
    print("generated code:")
    print(payload.get("code") or "")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify RAG + /api/generate-code integration")
    parser.add_argument("--page-url", default=DEFAULT_PAGE_URL)
    parser.add_argument("--index-sample", action="store_true", help="Index SAMPLE_KR_PC_SOURCE for kr_pc")
    parser.add_argument(
        "--scenario",
        choices=("matched", "fallback", "both"),
        default="both",
        help="matched=RAG hit expected, fallback=novel UI low-similarity path",
    )
    args = parser.parse_args()

    if args.index_sample:
        channel = CHANNELS["www.hddfs.com"]
        try:
            indexed = index_inline_source(channel, SAMPLE_KR_PC_SOURCE, "verify://kr_pc.js")
            print(f"Indexed sample chunks for kr_pc: {indexed}")
        except Exception as exc:
            print(
                "WARN: sample indexing failed; matched scenario may fall back.\n"
                f"      reason: {exc}\n"
                "      tip: configure AZURE_OPENAI_EMBEDDING_DEPLOYMENT or run "
                "`python3 -m services.rag_storage_service` after placing real ga4Common.js files."
            )

    scenarios = []
    if args.scenario in ("matched", "both"):
        scenarios.append(("matched", DEFAULT_GA_SPEC))
    if args.scenario in ("fallback", "both"):
        scenarios.append(("fallback", NOVEL_GA_SPEC))

    exit_code = 0
    for name, ga_spec in scenarios:
        print(f"\n########## Scenario: {name} ##########")
        run_rag_diagnostics(args.page_url, ga_spec)

        try:
            payload = call_generate_code_endpoint(args.page_url, ga_spec)
        except Exception as exc:
            print(f"Endpoint call failed: {exc}")
            exit_code = 1
            continue

        if "code" not in payload:
            print(f"Endpoint error payload: {payload}")
            exit_code = 1
            continue

        errors = validate_generated_code(payload["code"], ga_spec)
        if errors:
            print("Validation errors:")
            for error in errors:
                print(f"  - {error}")
            exit_code = 1
        else:
            print("Validation: OK")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
