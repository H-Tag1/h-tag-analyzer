import logging
import os
from dataclasses import dataclass
from typing import Dict, Optional
from urllib.parse import urlparse

from config import settings

logger = logging.getLogger(__name__)

MAX_TEMPLATE_PROMPT_CHARS = 80_000
_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@dataclass(frozen=True)
class Ga4Channel:
    channel_id: str
    label: str
    hostname: str
    template_filename: str


CHANNELS: Dict[str, Ga4Channel] = {
    "www.hddfs.com": Ga4Channel("kr_pc", "국문 PC", "www.hddfs.com", "kr_pc.js"),
    "cn.hd-dfs.com": Ga4Channel("cn_pc", "중문 PC", "cn.hd-dfs.com", "cn_pc.js"),
    "en.hddfs.com": Ga4Channel("en_pc", "영문 PC", "en.hddfs.com", "en_pc.js"),
    "m.hddfs.com": Ga4Channel("kr_mo", "국문 MO", "m.hddfs.com", "kr_mo.js"),
    "mcn.hd-dfs.com": Ga4Channel("cn_mo", "중문 MO", "mcn.hd-dfs.com", "cn_mo.js"),
    "men.hddfs.com": Ga4Channel("en_mo", "영문 MO", "men.hddfs.com", "en_mo.js"),
}


def resolve_channel(url: str) -> Ga4Channel:
    hostname = (urlparse(url).hostname or "").strip().lower()
    if not hostname:
        raise ValueError("스캔 URL에서 호스트를 확인할 수 없습니다.")

    channel = CHANNELS.get(hostname)
    if channel:
        return channel

    supported = ", ".join(sorted(CHANNELS.keys()))
    raise ValueError(
        f"지원하지 않는 채널 도메인입니다: {hostname}. "
        f"지원 도메인: {supported}"
    )


def resolve_channel_or_none(url: str) -> Optional[Ga4Channel]:
    try:
        return resolve_channel(url)
    except ValueError:
        return None


def _template_path(channel: Ga4Channel) -> str:
    configured = settings.ga4common_templates_dir
    base_dir = configured if os.path.isabs(configured) else os.path.join(_BACKEND_ROOT, configured)
    return os.path.join(base_dir, channel.template_filename)


def load_ga4common_template(channel: Ga4Channel) -> str:
    path = _template_path(channel)
    if not os.path.isfile(path):
        raise FileNotFoundError(
            f"채널 템플릿 파일을 찾을 수 없습니다: {path} ({channel.label})"
        )

    with open(path, "r", encoding="utf-8") as file:
        content = file.read().strip()

    if not content:
        raise ValueError(f"채널 템플릿 파일이 비어 있습니다: {path} ({channel.label})")

    logger.info("Loaded ga4Common template for %s from %s", channel.label, path)
    return content


def prepare_template_for_prompt(template_content: str) -> str:
    if len(template_content) <= MAX_TEMPLATE_PROMPT_CHARS:
        return template_content

    head_size = MAX_TEMPLATE_PROMPT_CHARS // 2
    tail_size = MAX_TEMPLATE_PROMPT_CHARS - head_size
    logger.warning(
        "ga4Common template truncated for LLM prompt (%d -> %d chars)",
        len(template_content),
        MAX_TEMPLATE_PROMPT_CHARS,
    )
    return (
        f"{template_content[:head_size]}\n\n"
        "/* ... template truncated for prompt ... */\n\n"
        f"{template_content[-tail_size:]}"
    )
