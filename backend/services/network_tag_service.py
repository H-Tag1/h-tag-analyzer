import html
import json
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import parse_qs, unquote, urlparse

from playwright.async_api import Page, Request

from models.network_tag_hit import NetworkTagHit
from models.network_tag_display_field import NetworkTagDisplayField
from services.ga_event_exclusion_service import is_ignored_ga_event_name

logger = logging.getLogger(__name__)

ANALYTICS_HOST_PATTERNS = (
    re.compile(r"(^|\.)google-analytics\.com$"),
    re.compile(r"(^|\.)analytics\.google\.com$"),
    re.compile(r"(^|\.)googletagmanager\.com$"),
    re.compile(r"(^|\.)google\.com$"),
    re.compile(r"(^|\.)doubleclick\.net$"),
)

COLLECT_PATH_PATTERNS = (
    re.compile(r"/g/collect"),
    re.compile(r"/collect"),
    re.compile(r"/ccm/collect"),
    re.compile(r"/gtm\.js"),
    re.compile(r"/gtag/js"),
    re.compile(r"/gtag/destination"),
)

GA4_COLLECT_PATH_PATTERNS = (
    re.compile(r"/g/collect"),
    re.compile(r"/ccm/collect"),
)


class NetworkTagCollector:
    def __init__(self, page: Page, block_ga_transmission: bool = True):
        self.page = page
        self.hits: List[NetworkTagHit] = []
        self._trigger = "page_load"
        self._listener = None
        self._route_handler = None
        self.block_ga_transmission = block_ga_transmission

    async def start(self) -> None:
        if self.block_ga_transmission:
            self._route_handler = self._handle_route
            await self.page.route("**/*", self._route_handler)
            logger.info("GA4 collect transmission blocked (inspection-only mode)")
            return

        self._listener = self._handle_request
        self.page.on("request", self._listener)

    async def stop(self) -> None:
        if self._route_handler:
            try:
                await self.page.unroute("**/*", self._route_handler)
            except Exception as exc:
                logger.debug("Failed to unroute GA collector: %s", exc)
            self._route_handler = None

        if self._listener:
            self.page.remove_listener("request", self._listener)
            self._listener = None

    def set_trigger(self, trigger: str) -> None:
        self._trigger = trigger

    def reset(self) -> None:
        self.hits = []
        self._trigger = "page_load"

    def get_hits(self) -> List[NetworkTagHit]:
        return list(self.hits)

    async def _handle_route(self, route) -> None:
        request = route.request
        if _is_ga4_collect_request(request.url):
            hit = _parse_analytics_request(request, self._trigger)
            if hit:
                self.hits.append(hit)
            await route.abort()
            return

        await route.continue_()

    def _handle_request(self, request: Request) -> None:
        if not _is_analytics_request(request.url):
            return

        hit = _parse_analytics_request(request, self._trigger)
        if hit:
            self.hits.append(hit)


def _is_ga4_collect_request(url: str) -> bool:
    if _detect_provider(url) != "ga4":
        return False

    try:
        parsed = urlparse(url)
    except Exception:
        return False

    path = parsed.path or ""
    return any(pattern.search(path) for pattern in GA4_COLLECT_PATH_PATTERNS)


def _is_analytics_request(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except Exception:
        return False

    host = (parsed.hostname or "").lower()
    if not any(pattern.search(host) for pattern in ANALYTICS_HOST_PATTERNS):
        return False

    path = parsed.path or ""
    if host.endswith("google.com") and not any(pattern.search(path) for pattern in COLLECT_PATH_PATTERNS):
        return False

    return any(pattern.search(path) for pattern in COLLECT_PATH_PATTERNS) or "googletagmanager.com" in host


def _parse_analytics_request(request: Request, trigger: str) -> Optional[NetworkTagHit]:
    url = request.url
    provider = _detect_provider(url)
    if provider != "ga4":
        return None

    params = _extract_params(url, request.post_data)
    event_name = _as_str(params.get("en"))
    tid = _as_str(params.get("tid"))

    if is_ignored_ga_event_name(event_name):
        return None

    ep_button_area = _extract_ep_param(params, "ep_button_area")
    ep_button_area2 = _extract_ep_param(params, "ep_button_area2")
    ep_button_name = _extract_ep_param(params, "ep_button_name")
    display_fields = _build_display_fields(params, url)

    if not event_name and not display_fields:
        return None

    return NetworkTagHit(
        event_name=event_name,
        trigger=trigger,
        ep_button_area=ep_button_area,
        ep_button_area2=ep_button_area2,
        ep_button_name=ep_button_name,
        display_fields=display_fields,
        tid=tid,
    )


def _extract_ep_param(params: Dict[str, Any], field_name: str) -> Optional[str]:
    candidates = (
        f"ep.{field_name}",
        f"ep.{field_name.replace('ep_', '')}",
        field_name,
        field_name.replace("ep_", ""),
    )
    for key in candidates:
        value = _as_str(params.get(key))
        if value:
            return value
    return None


def _build_display_fields(params: Dict[str, Any], request_url: str) -> List[NetworkTagDisplayField]:
    fields: List[NetworkTagDisplayField] = []

    standard_fields = (
        ("Client ID", "cid"),
        ("Document location URL", "dl"),
        ("Document Referrer", "dr"),
        ("Document Title", "dt"),
    )
    for label, key in standard_fields:
        _append_field(fields, label, params.get(key))

    host = urlparse(request_url).hostname
    if host:
        fields.append(NetworkTagDisplayField(label="Google Analytics Host", value=host))

    _append_field(fields, "Protocol Version", params.get("_v"))
    _append_field(fields, "Screen Resolution", params.get("sr"))
    _append_field(fields, "Tracking ID", params.get("tid"))
    _append_field(fields, "User Language", params.get("ul"))

    event_param_keys = sorted(
        key for key in params
        if (
            key.startswith("ep.")
            or key.startswith("epn.")
            or _is_ecommerce_param_key(key)
        )
    )
    for key in event_param_keys:
        param_name = key.replace(".", "_")
        _append_field(fields, f"Event Data ({param_name})", params.get(key))

    return fields


def _is_ecommerce_param_key(key: str) -> bool:
    return bool(re.match(r"^(pr\d+|il\d+|promo\d+|cu|tr|ta|tt|ts|pa|ti|ic|in|iv|ip|iq|ca)$", key))


def _append_field(fields: List[NetworkTagDisplayField], label: str, value: Any) -> None:
    text = _format_display_value(value)
    if text:
        fields.append(NetworkTagDisplayField(label=label, value=text))


def _format_display_value(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = html.unescape(str(value).strip())
    return text or None


def _detect_provider(url: str) -> str:
    lower = url.lower()
    if "googletagmanager.com/gtm.js" in lower or "googletagmanager.com/gtag/js" in lower:
        return "gtm"
    if "/g/collect" in lower or "google-analytics.com/collect" in lower or "/ccm/collect" in lower:
        return "ga4"
    if "google-analytics.com" in lower:
        return "ua"
    if "googletagmanager.com" in lower:
        return "gtm"
    return "unknown"


def _extract_params(url: str, post_data: Optional[str]) -> Dict[str, Any]:
    parsed = urlparse(url)
    params: Dict[str, Any] = {}

    for key, values in parse_qs(parsed.query, keep_blank_values=True).items():
        if values:
            params[key] = _decode_value(values[-1])

    if post_data:
        for key, values in parse_qs(post_data, keep_blank_values=True).items():
            if values:
                params[key] = _decode_value(values[-1])

    return params


def _decode_value(value: str) -> Any:
    decoded = unquote(value)
    if decoded.startswith("{") and decoded.endswith("}"):
        try:
            return json.loads(decoded)
        except json.JSONDecodeError:
            pass
    return decoded


def _as_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
