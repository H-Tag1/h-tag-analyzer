import hashlib
import json
import logging
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple

import chromadb
from chromadb.api.models.Collection import Collection
from chromadb.utils import embedding_functions
from openai import AzureOpenAI

from config import settings
from services.code_generator_service import parse_ga_event_call
from services.ga4_channel_service import CHANNELS, Ga4Channel, _template_path

logger = logging.getLogger(__name__)

_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAG_INDEX_SCHEMA_VERSION = "2"

CLICK_HANDLER_HEAD = re.compile(
    r"\$\(\s*document\s*\)\.on\s*\(\s*"
    r"(?:"
    r"\"click\"\s*,\s*\"(?P<selector_dq>(?:\\.|[^\"\\])*)\"\s*,\s*"
    r"|"
    r"'click'\s*,\s*'(?P<selector_sq>(?:\\.|[^'\\])*)'\s*,\s*"
    r")"
    r"function\s*(?:\([^)]*\))?\s*\{",
    re.IGNORECASE,
)
GA_EVENT_START = re.compile(r"GA_Event\s*\(", re.IGNORECASE)
STUB_MARKER = ".example-selector"


@dataclass(frozen=True)
class Ga4CodeChunk:
    chunk_id: str
    channel: str
    channel_id: str
    channel_label: str
    hostname: str
    template_filename: str
    template_path: str
    section_comment: str
    element_selector: str
    event_name: str
    ep_button_area: str
    ep_button_area2: str
    ep_button_name: str
    code: str
    keywords: str

    def to_document(self) -> str:
        return (
            f"channel: {self.channel}\n"
            f"channel_label: {self.channel_label}\n"
            f"section_comment: {self.section_comment}\n"
            f"selector: {self.element_selector}\n"
            f"event_name: {self.event_name}\n"
            f"ep_button_area: {self.ep_button_area}\n"
            f"ep_button_area2: {self.ep_button_area2}\n"
            f"ep_button_name: {self.ep_button_name}\n"
            f"keywords: {self.keywords}\n"
            f"code:\n{self.code}"
        )

    def to_metadata(self) -> Dict[str, str]:
        return {
            "channel": self.channel,
            "channel_id": self.channel_id,
            "channel_label": self.channel_label,
            "hostname": self.hostname,
            "template_filename": self.template_filename,
            "template_path": self.template_path,
            "section_comment": self.section_comment,
            "element_selector": self.element_selector,
            "selector": self.element_selector,
            "event_name": self.event_name,
            "ep_button_area": self.ep_button_area,
            "ep_button_area2": self.ep_button_area2,
            "ep_button_name": self.ep_button_name,
            "keywords": self.keywords,
        }


@dataclass(frozen=True)
class RagIndexStats:
    indexed_channels: int
    indexed_chunks: int
    skipped_channels: int
    reindexed: bool
    channel_chunk_counts: Dict[str, int]


@dataclass(frozen=True)
class RagSearchResult:
    chunk_id: str
    score: float
    code: str
    channel: str
    channel_id: str
    channel_label: str
    hostname: str
    element_selector: str
    event_name: str
    ep_button_area: str
    ep_button_area2: str
    ep_button_name: str
    keywords: str
    metadata: Dict[str, Any]


class AzureOpenAIEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self, deployment: str) -> None:
        self.deployment = deployment
        self._client = AzureOpenAI(
            api_key=settings.azure_openai_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
        )

    def __call__(self, input: Sequence[str]) -> List[List[float]]:
        if not input:
            return []

        response = self._client.embeddings.create(
            model=self.deployment,
            input=list(input),
        )
        return [item.embedding for item in response.data]


def _resolve_persist_dir() -> str:
    configured = settings.rag_persist_dir
    path = configured if os.path.isabs(configured) else os.path.join(_BACKEND_ROOT, configured)
    os.makedirs(path, exist_ok=True)
    return path


def _manifest_path(persist_dir: str) -> str:
    return os.path.join(persist_dir, "manifest.json")


def _file_fingerprint(path: str) -> str:
    stat = os.stat(path)
    digest = hashlib.sha256()
    digest.update(RAG_INDEX_SCHEMA_VERSION.encode("utf-8"))
    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return f"{stat.st_mtime_ns}:{stat.st_size}:{digest.hexdigest()}"


def _channel_id_from_filename(filename: str) -> str:
    return os.path.splitext(os.path.basename(filename))[0]


def load_ga4common_source(template_path: str) -> str:
    if not os.path.isfile(template_path):
        raise FileNotFoundError(f"ga4Common 템플릿 파일을 찾을 수 없습니다: {template_path}")

    with open(template_path, "r", encoding="utf-8") as file:
        content = file.read()

    if not content.strip():
        raise ValueError(f"ga4Common 템플릿 파일이 비어 있습니다: {template_path}")

    if STUB_MARKER in content and len(content.strip()) < 500:
        raise ValueError(
            f"예시 스텁 템플릿은 인덱싱하지 않습니다. 실제 ga4Common.js를 배치하세요: {template_path}"
        )

    return content


def _is_inside_line_comment(source: str, index: int) -> bool:
    line_start = source.rfind("\n", 0, index) + 1
    line_prefix = source[line_start:index]
    in_block = False
    cursor = line_start
    while cursor < index:
        if source.startswith("/*", cursor):
            in_block = True
            cursor += 2
            continue
        if in_block:
            if source.startswith("*/", cursor):
                in_block = False
                cursor += 2
                continue
            cursor += 1
            continue
        if source.startswith("//", cursor):
            return True
        cursor += 1
    return in_block or "//" in line_prefix


def _find_balanced_delimiter(source: str, open_index: int, open_char: str, close_char: str) -> int:
    depth = 0
    index = open_index
    in_string: Optional[str] = None
    escape = False

    while index < len(source):
        char = source[index]

        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == in_string:
                in_string = None
            index += 1
            continue

        if char in ("'", '"', "`"):
            in_string = char
            index += 1
            continue

        if char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                return index
        index += 1

    return -1


def _find_handler_end(source: str, function_body_open_brace: int) -> int:
    brace_end = _find_balanced_delimiter(source, function_body_open_brace, "{", "}")
    if brace_end == -1:
        return -1

    end = brace_end + 1
    while end < len(source) and source[end] in " \t\r\n":
        end += 1
    if end < len(source) and source[end] == ")":
        end += 1
    while end < len(source) and source[end] in " \t\r\n":
        end += 1
    if end < len(source) and source[end] == ";":
        end += 1
    return end


def _collect_preceding_comments(source: str, handler_start: int) -> Tuple[str, int]:
    line_start = source.rfind("\n", 0, handler_start) + 1
    prefix = source[:line_start]
    if not prefix:
        return "", handler_start

    lines = prefix.splitlines()
    collected: List[str] = []
    index = len(lines) - 1

    while index >= 0:
        line = lines[index]
        stripped = line.strip()
        if not stripped:
            if collected:
                break
            index -= 1
            continue

        if stripped.startswith("//"):
            collected.append(line.rstrip())
            index -= 1
            continue

        if stripped.startswith("*") or stripped.endswith("*/") or stripped.startswith("/**") or stripped.startswith("/*"):
            collected.append(line.rstrip())
            index -= 1
            continue

        break

    if not collected:
        return "", handler_start

    comment_text = "\n".join(reversed(collected))
    comment_start = source.rfind(collected[0].strip(), 0, handler_start)
    if comment_start == -1:
        comment_start = handler_start
    return comment_text, comment_start


def _extract_section_comment(comment_text: str) -> str:
    labels: List[str] = []
    for line in comment_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("//"):
            body = stripped[2:].strip()
            if body.startswith("$(document)") or body.startswith("GA_Event") or body.startswith("var "):
                continue
            if body in {"});", "};"}:
                continue
            if body:
                labels.append(body)
        elif stripped.startswith("*") and not stripped.startswith("/**"):
            body = stripped.lstrip("* ").strip()
            if body:
                labels.append(body)
    return " | ".join(labels)


def _extract_ga_event_calls(source: str) -> List[str]:
    calls: List[str] = []
    for match in GA_EVENT_START.finditer(source):
        start = match.start()
        close_paren = _find_balanced_delimiter(source, match.end() - 1, "(", ")")
        if close_paren != -1:
            calls.append(source[start : close_paren + 1])
    return calls


def _build_keywords(
    section_comment: str,
    selector: str,
    event_name: str,
    ep_button_area: str,
    ep_button_area2: str,
    ep_button_name: str,
    code: str,
) -> str:
    inline_comments = " ".join(
        match.group(1).strip()
        for match in re.finditer(r"//\s*(.+)$", code, re.MULTILINE)
    )
    parts = [
        section_comment,
        selector,
        event_name,
        ep_button_area,
        ep_button_area2,
        ep_button_name,
        inline_comments,
    ]
    return " ".join(part.strip() for part in parts if part and part.strip())


def extract_ga4_code_chunks(template_content: str, channel: Ga4Channel, template_path: str) -> List[Ga4CodeChunk]:
    chunks: List[Ga4CodeChunk] = []
    seen_ids: set[str] = set()
    skipped_commented = 0
    skipped_incomplete = 0

    for match in CLICK_HANDLER_HEAD.finditer(template_content):
        handler_start = match.start()
        if _is_inside_line_comment(template_content, handler_start):
            skipped_commented += 1
            continue

        selector = (match.group("selector_dq") or match.group("selector_sq") or "").strip()
        function_body_open = match.end() - 1
        if template_content[function_body_open] != "{":
            skipped_incomplete += 1
            continue

        handler_end = _find_handler_end(template_content, function_body_open)
        if handler_end == -1:
            skipped_incomplete += 1
            logger.debug("Skip incomplete handler at %s selector=%s", handler_start, selector)
            continue

        comment_text, chunk_start = _collect_preceding_comments(template_content, handler_start)
        handler_code = template_content[handler_start:handler_end].strip()
        code = f"{comment_text}\n{handler_code}".strip() if comment_text else handler_code

        ga_event_calls = _extract_ga_event_calls(handler_code)
        parsed = parse_ga_event_call(ga_event_calls[0]) if ga_event_calls else {}

        event_name = str(parsed.get("event_name") or "")
        ep_button_area = str(parsed.get("ep_button_area") or "")
        ep_button_area2 = str(parsed.get("ep_button_area2") or "")
        ep_button_name = str(parsed.get("ep_button_name") or "")
        section_comment = _extract_section_comment(comment_text)

        chunk_id = hashlib.sha1(
            f"{channel.channel_id}|{selector}|{event_name}|{handler_start}".encode("utf-8")
        ).hexdigest()
        if chunk_id in seen_ids:
            continue
        seen_ids.add(chunk_id)

        keywords = _build_keywords(
            section_comment,
            selector,
            event_name,
            ep_button_area,
            ep_button_area2,
            ep_button_name,
            code,
        )

        chunks.append(
            Ga4CodeChunk(
                chunk_id=chunk_id,
                channel=channel.channel_id,
                channel_id=channel.channel_id,
                channel_label=channel.label,
                hostname=channel.hostname,
                template_filename=channel.template_filename,
                template_path=template_path,
                section_comment=section_comment,
                element_selector=selector,
                event_name=event_name,
                ep_button_area=ep_button_area,
                ep_button_area2=ep_button_area2,
                ep_button_name=ep_button_name,
                code=code,
                keywords=keywords,
            )
        )

    logger.info(
        "Parsed %d click handlers from %s (skipped commented=%d, incomplete=%d)",
        len(chunks),
        channel.channel_id,
        skipped_commented,
        skipped_incomplete,
    )
    return chunks


class RagStorageService:
    def __init__(
        self,
        persist_dir: Optional[str] = None,
        collection_name: Optional[str] = None,
    ) -> None:
        self.persist_dir = persist_dir or _resolve_persist_dir()
        self.collection_name = collection_name or settings.rag_collection_name
        self._client = chromadb.PersistentClient(path=self.persist_dir)
        self._embedding_function = self._build_embedding_function()
        self._collection = self._get_or_create_collection()

    def _build_embedding_function(self) -> embedding_functions.EmbeddingFunction:
        deployment = settings.azure_openai_embedding_deployment.strip()
        if settings.azure_openai_key and settings.azure_openai_endpoint and deployment:
            logger.info("Using Azure OpenAI embeddings for RAG: %s", deployment)
            return AzureOpenAIEmbeddingFunction(deployment)

        logger.info("Using Chroma default embeddings for RAG")
        return embedding_functions.DefaultEmbeddingFunction()

    def _get_or_create_collection(self) -> Collection:
        return self._client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self._embedding_function,
            metadata={"hnsw:space": "cosine"},
        )

    def _load_manifest(self) -> Dict[str, str]:
        path = _manifest_path(self.persist_dir)
        if not os.path.isfile(path):
            return {}
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    def _save_manifest(self, manifest: Dict[str, str]) -> None:
        path = _manifest_path(self.persist_dir)
        with open(path, "w", encoding="utf-8") as file:
            json.dump(manifest, file, ensure_ascii=False, indent=2)

    def _collect_channel_chunks(self, channel: Ga4Channel) -> List[Ga4CodeChunk]:
        template_path = _template_path(channel)
        template_content = load_ga4common_source(template_path)
        line_count = template_content.count("\n") + 1
        logger.info(
            "Loaded ga4Common source for %s (%s): %d lines, %d chars from %s",
            channel.channel_id,
            channel.label,
            line_count,
            len(template_content),
            template_path,
        )
        return extract_ga4_code_chunks(template_content, channel, template_path)

    def index_channel(self, channel: Ga4Channel, force: bool = False) -> int:
        template_path = _template_path(channel)
        fingerprint = _file_fingerprint(template_path)
        manifest = self._load_manifest()

        if not force and manifest.get(channel.channel_id) == fingerprint:
            logger.info("Skip unchanged channel index: %s", channel.channel_id)
            return 0

        try:
            chunks = self._collect_channel_chunks(channel)
        except (FileNotFoundError, ValueError) as exc:
            logger.warning("Skip channel %s: %s", channel.channel_id, exc)
            return 0

        self._collection.delete(where={"channel_id": channel.channel_id})

        if chunks:
            batch_size = 128
            for start in range(0, len(chunks), batch_size):
                batch = chunks[start : start + batch_size]
                self._collection.add(
                    ids=[chunk.chunk_id for chunk in batch],
                    documents=[chunk.to_document() for chunk in batch],
                    metadatas=[chunk.to_metadata() for chunk in batch],
                )

        manifest[channel.channel_id] = fingerprint
        self._save_manifest(manifest)
        logger.info("Indexed %d chunks for channel %s", len(chunks), channel.channel_id)

        for sample in chunks[:3]:
            logger.info(
                "Sample chunk [%s] selector=%s event=%s comment=%s",
                channel.channel_id,
                sample.element_selector,
                sample.event_name,
                sample.section_comment or "-",
            )

        return len(chunks)

    def index_all_channels(self, force_reindex: bool = False) -> RagIndexStats:
        indexed_channels = 0
        indexed_chunks = 0
        skipped_channels = 0
        channel_chunk_counts: Dict[str, int] = {}

        for channel in CHANNELS.values():
            template_path = _template_path(channel)
            if not os.path.isfile(template_path):
                logger.warning("Skip missing template for %s: %s", channel.channel_id, template_path)
                skipped_channels += 1
                continue

            fingerprint = _file_fingerprint(template_path)
            manifest = self._load_manifest()
            if not force_reindex and manifest.get(channel.channel_id) == fingerprint:
                existing = self.count(channel.channel_id)
                channel_chunk_counts[channel.channel_id] = existing
                logger.info(
                    "Skip unchanged channel %s (existing chunks=%d)",
                    channel.channel_id,
                    existing,
                )
                skipped_channels += 1
                continue

            chunk_count = self.index_channel(channel, force=True)
            channel_chunk_counts[channel.channel_id] = chunk_count
            if chunk_count > 0:
                indexed_channels += 1
                indexed_chunks += chunk_count
            else:
                skipped_channels += 1

        logger.info(
            "RAG index summary: channels=%d chunks=%d skipped=%d detail=%s",
            indexed_channels,
            indexed_chunks,
            skipped_channels,
            channel_chunk_counts,
        )

        return RagIndexStats(
            indexed_channels=indexed_channels,
            indexed_chunks=indexed_chunks,
            skipped_channels=skipped_channels,
            reindexed=force_reindex or indexed_channels > 0,
            channel_chunk_counts=channel_chunk_counts,
        )

    def search(
        self,
        query: str,
        channel_id: Optional[str] = None,
        event_name: Optional[str] = None,
        top_k: int = 5,
    ) -> List[RagSearchResult]:
        normalized_query = query.strip()
        if not normalized_query:
            return []

        filters: List[Dict[str, str]] = []
        if channel_id:
            filters.append({"channel_id": channel_id})
        if event_name:
            filters.append({"event_name": event_name})
        if len(filters) > 1:
            where: Optional[Dict[str, Any]] = {"$and": filters}
        elif filters:
            where = filters[0]
        else:
            where = None
        result = self._collection.query(
            query_texts=[normalized_query],
            n_results=max(top_k, 1),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        ids = (result.get("ids") or [[]])[0]
        documents = (result.get("documents") or [[]])[0]
        metadatas = (result.get("metadatas") or [[]])[0]
        distances = (result.get("distances") or [[]])[0]

        results: List[RagSearchResult] = []
        for idx, chunk_id in enumerate(ids):
            metadata = metadatas[idx] or {}
            distance = float(distances[idx]) if idx < len(distances) and distances[idx] is not None else 1.0
            score = max(0.0, 1.0 - distance)
            document = documents[idx] if idx < len(documents) else ""
            code = self._extract_code_from_document(document)

            results.append(
                RagSearchResult(
                    chunk_id=chunk_id,
                    score=score,
                    code=code,
                    channel=str(metadata.get("channel") or metadata.get("channel_id") or ""),
                    channel_id=str(metadata.get("channel_id") or ""),
                    channel_label=str(metadata.get("channel_label") or ""),
                    hostname=str(metadata.get("hostname") or ""),
                    element_selector=str(metadata.get("element_selector") or metadata.get("selector") or ""),
                    event_name=str(metadata.get("event_name") or ""),
                    ep_button_area=str(metadata.get("ep_button_area") or ""),
                    ep_button_area2=str(metadata.get("ep_button_area2") or ""),
                    ep_button_name=str(metadata.get("ep_button_name") or ""),
                    keywords=str(metadata.get("keywords") or ""),
                    metadata=metadata,
                )
            )

        return results

    @staticmethod
    def _extract_code_from_document(document: str) -> str:
        marker = "code:\n"
        if marker in document:
            return document.split(marker, 1)[1].strip()
        return document.strip()

    def count(self, channel_id: Optional[str] = None) -> int:
        if channel_id:
            result = self._collection.get(
                where={"channel_id": channel_id},
                include=[],
            )
            return len(result.get("ids") or [])
        return self._collection.count()


RAG_REFERENCE_TOP_K_CODE = 3
RAG_REFERENCE_TOP_K_SUGGEST = 3
RAG_MIN_REFERENCE_SCORE = 0.35
PREAMBLE_MAX_CHARS = 6_000

DEFAULT_EVENT_NAME_BY_CHANNEL: Dict[str, str] = {
    "kr_pc": "click_PC_국문_공통",
    "kr_mo": "click_MO_국문_공통",
    "cn_pc": "click_PC_중문_공통",
    "cn_mo": "click_MO_중문_공통",
    "en_pc": "click_PC_영문_공통",
    "en_mo": "click_MO_영문_공통",
}

_DOCUMENT_READY_MARKER = re.compile(r"\$\(\s*document\s*\)\.ready\s*\(", re.IGNORECASE)
_GA_EVENT_DEFINITION = re.compile(
    r"(?:function\s+GA_Event\s*\([^)]*\)|(?:var|let|const)\s+GA_Event\s*=\s*function\s*\([^)]*\))\s*\{",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class RagReferenceResolution:
    query: str
    hits: List["RagSearchResult"]
    used_fallback: bool
    fallback_reason: str
    prompt_section: str


_rag_service_singleton: Optional[RagStorageService] = None


def get_rag_storage_service() -> RagStorageService:
    global _rag_service_singleton
    if _rag_service_singleton is None:
        _rag_service_singleton = RagStorageService()
    return _rag_service_singleton


def build_rag_query(
    element_selector: str = "",
    element_text: str = "",
    event_name: str = "",
    ep_button_area: str = "",
    ep_button_area2: str = "",
    ep_button_name: str = "",
) -> str:
    parts = [
        element_selector,
        element_text,
        event_name,
        ep_button_area,
        ep_button_area2,
        ep_button_name,
    ]
    return " ".join(part.strip() for part in parts if part and part.strip())


def build_rag_query_from_ga_spec(ga_spec: Dict[str, Any]) -> str:
    return build_rag_query(
        element_selector=str(ga_spec.get("element_selector") or ""),
        element_text=str(ga_spec.get("element_text") or ""),
        event_name=str(ga_spec.get("event_name") or ga_spec.get("event") or ""),
        ep_button_area=str(ga_spec.get("ep_button_area") or ""),
        ep_button_area2=str(ga_spec.get("ep_button_area2") or ""),
        ep_button_name=str(ga_spec.get("ep_button_name") or ""),
    )


def build_rag_query_from_issue(issue: Dict[str, Any]) -> str:
    spec = issue.get("recommended_ga_spec") or {}
    return build_rag_query(
        element_selector=str(issue.get("element_selector") or spec.get("element_selector") or ""),
        element_text=str(issue.get("element_text") or ""),
        event_name=str(spec.get("event_name") or spec.get("event") or ""),
        ep_button_area=str(spec.get("ep_button_area") or ""),
        ep_button_area2=str(spec.get("ep_button_area2") or ""),
        ep_button_name=str(spec.get("ep_button_name") or ""),
    )


def format_reference_chunks_for_prompt(
    chunks: List[RagSearchResult],
    section_title: str = "[참조 표준 코드 스펙]",
) -> str:
    if not chunks:
        return f"{section_title}\n(유사 참조 코드를 찾지 못했습니다.)"

    blocks: List[str] = []
    for index, hit in enumerate(chunks, start=1):
        blocks.append(
            "\n".join(
                [
                    f"--- 참조 {index} (score={hit.score:.3f}) ---",
                    f"event_name: {hit.event_name}",
                    f"selector: {hit.element_selector}",
                    f"ep_button_area: {hit.ep_button_area}",
                    f"ep_button_area2: {hit.ep_button_area2}",
                    f"ep_button_name: {hit.ep_button_name}",
                    "code:",
                    hit.code,
                ]
            )
        )

    return f"{section_title}\n```javascript\n" + "\n\n".join(blocks) + "\n```"


def filter_rag_hits_by_score(
    hits: List[RagSearchResult],
    min_score: float = RAG_MIN_REFERENCE_SCORE,
) -> List[RagSearchResult]:
    return [hit for hit in hits if hit.score >= min_score]


def _is_stub_template_content(content: str) -> bool:
    normalized = content.strip()
    if not normalized:
        return True
    if STUB_MARKER in normalized and len(normalized) < 500:
        return True
    if "실제 ga4Common.js 원본을" in normalized and len(normalized) < 500:
        return True
    if (
        len(normalized) < 500
        and CLICK_HANDLER_HEAD.search(normalized) is None
        and _GA_EVENT_DEFINITION.search(normalized) is None
    ):
        return True
    return False


def _extract_ga_event_definition(content: str) -> str:
    match = _GA_EVENT_DEFINITION.search(content)
    if not match:
        return ""

    brace_start = content.find("{", match.start())
    if brace_start == -1:
        return content[match.start() : match.start() + 2_000].strip()

    brace_end = _find_balanced_delimiter(content, brace_start, "{", "}")
    if brace_end == -1:
        return content[match.start() : match.start() + 2_000].strip()

    return content[match.start() : brace_end + 1].strip()


def extract_ga4common_preamble(channel: Ga4Channel, max_chars: int = PREAMBLE_MAX_CHARS) -> str:
    from services.ga4_channel_service import load_ga4common_template

    try:
        content = load_ga4common_template(channel)
    except (FileNotFoundError, ValueError) as exc:
        logger.info("Skip preamble extraction for %s: %s", channel.channel_id, exc)
        return ""

    if _is_stub_template_content(content):
        return ""

    end_index = len(content)
    ready_match = _DOCUMENT_READY_MARKER.search(content)
    if ready_match:
        end_index = min(end_index, ready_match.start())

    handler_match = CLICK_HANDLER_HEAD.search(content)
    if handler_match:
        end_index = min(end_index, handler_match.start())

    preamble = content[:end_index].strip()
    ga_event_def = _extract_ga_event_definition(content[: max_chars * 2])
    if ga_event_def and ga_event_def not in preamble:
        preamble = f"{preamble}\n\n{ga_event_def}".strip() if preamble else ga_event_def

    if not preamble:
        return ""

    if len(preamble) > max_chars:
        preamble = f"{preamble[:max_chars]}\n/* ... preamble truncated ... */"

    return preamble


def build_default_handler_format(channel: Ga4Channel) -> str:
    event_name = DEFAULT_EVENT_NAME_BY_CHANNEL.get(channel.channel_id, "click_공통")
    return (
        f'$(document).on("click", ".example-selector", function(){{\n'
        f"\tvar label = $(this).text().replace(/\\s/g, \"\");\n"
        f'\tGA_Event("{event_name}", "영역", "영역_세부", label);\n'
        f"}});"
    )


def build_fallback_reference_context(
    channel: Ga4Channel,
    reason: str,
    section_title: str = "[참조 표준 코드 스펙]",
) -> str:
    preamble = extract_ga4common_preamble(channel)
    default_handler = build_default_handler_format(channel)
    default_event = DEFAULT_EVENT_NAME_BY_CHANNEL.get(channel.channel_id, "click_공통")

    blocks: List[str] = [
        f"{section_title} (Fallback: {reason})",
        "RAG 유사도 검색 결과가 없거나 점수가 낮아, 채널 ga4Common.js 공통 선언부와 기본 포맷을 참조합니다.",
    ]

    if preamble:
        blocks.extend(
            [
                "",
                "공통 선언부:",
                "```javascript",
                preamble,
                "```",
            ]
        )

    blocks.extend(
        [
            "",
            "기본 클릭 핸들러 포맷:",
            "```javascript",
            default_handler,
            "```",
            "",
            "GA_Event 시그니처:",
            "GA_Event(event_name, ep_button_area, ep_button_area2, ep_button_name, isVirtual?)",
            f"권장 event_name 예시: {default_event}",
        ]
    )

    return "\n".join(blocks)


def resolve_reference_context(
    channel: Ga4Channel,
    query: str,
    top_k: int = RAG_REFERENCE_TOP_K_CODE,
    section_title: str = "[참조 표준 코드 스펙]",
    min_score: float = RAG_MIN_REFERENCE_SCORE,
) -> RagReferenceResolution:
    normalized_query = query.strip()
    if not normalized_query:
        reason = "empty_query"
        logger.info("RAG fallback for %s: %s", channel.channel_id, reason)
        return RagReferenceResolution(
            query=normalized_query,
            hits=[],
            used_fallback=True,
            fallback_reason=reason,
            prompt_section=build_fallback_reference_context(channel, reason, section_title),
        )

    raw_hits = fetch_reference_chunks(channel, normalized_query, top_k=top_k)
    hits = filter_rag_hits_by_score(raw_hits, min_score=min_score)

    if not raw_hits:
        reason = "no_results"
    elif not hits:
        best_score = max((hit.score for hit in raw_hits), default=0.0)
        reason = f"low_similarity(best={best_score:.3f},min={min_score:.3f})"
    else:
        return RagReferenceResolution(
            query=normalized_query,
            hits=hits,
            used_fallback=False,
            fallback_reason="",
            prompt_section=format_reference_chunks_for_prompt(hits, section_title),
        )

    logger.warning(
        "RAG fallback for %s: %s (query=%r raw_hits=%d)",
        channel.channel_id,
        reason,
        normalized_query,
        len(raw_hits),
    )
    return RagReferenceResolution(
        query=normalized_query,
        hits=[],
        used_fallback=True,
        fallback_reason=reason,
        prompt_section=build_fallback_reference_context(channel, reason, section_title),
    )


def build_default_tag_spec(channel: Ga4Channel, element_text: str = "") -> Dict[str, str]:
    event_name = DEFAULT_EVENT_NAME_BY_CHANNEL.get(channel.channel_id, "click_공통")
    ep_button_name = re.sub(r"\s+", "", element_text.strip()) if element_text.strip() else ""
    return {
        "event_name": event_name,
        "ep_button_area": "영역",
        "ep_button_area2": "영역_세부",
        "ep_button_name": ep_button_name,
    }


def index_inline_source(
    channel: Ga4Channel,
    source: str,
    source_label: str = "inline",
    force: bool = True,
) -> int:
    """Verify/test helper: index arbitrary ga4Common source text for one channel."""
    service = get_rag_storage_service()
    chunks = extract_ga4_code_chunks(source, channel, source_label)
    if not chunks:
        logger.warning("No chunks parsed from inline source for %s", channel.channel_id)
        return 0

    if force:
        service._collection.delete(where={"channel_id": channel.channel_id})

    batch_size = 128
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        service._collection.add(
            ids=[chunk.chunk_id for chunk in batch],
            documents=[chunk.to_document() for chunk in batch],
            metadatas=[chunk.to_metadata() for chunk in batch],
        )

    logger.info("Indexed %d inline chunks for channel %s", len(chunks), channel.channel_id)
    return len(chunks)


def print_rag_resolution_diagnostics(resolution: RagReferenceResolution) -> None:
    print("\n=== RAG Reference Resolution ===")
    print(f"query: {resolution.query!r}")
    print(f"used_fallback: {resolution.used_fallback}")
    if resolution.used_fallback:
        print(f"fallback_reason: {resolution.fallback_reason}")
    print(f"hit_count: {len(resolution.hits)}")
    for index, hit in enumerate(resolution.hits, start=1):
        preview = hit.code.replace("\n", " ")[:160]
        print(
            f"  [{index}] score={hit.score:.3f} event={hit.event_name!r} "
            f"selector={hit.element_selector!r}"
        )
        print(f"       {preview}")
    print(f"prompt_section_chars: {len(resolution.prompt_section)}")
    print("=== End RAG Diagnostics ===\n")


def ensure_channel_indexed(channel: Ga4Channel) -> int:
    service = get_rag_storage_service()
    indexed = service.index_channel(channel, force=False)
    if indexed > 0:
        return indexed
    existing = service.count(channel.channel_id)
    if existing > 0:
        return existing
    if indexed == 0:
        indexed = service.index_channel(channel, force=True)
    return indexed


def fetch_reference_chunks(
    channel: Ga4Channel,
    query: str,
    top_k: int = RAG_REFERENCE_TOP_K_CODE,
    event_name: Optional[str] = None,
) -> List[RagSearchResult]:
    normalized_query = query.strip()
    if not normalized_query:
        logger.info("Skip RAG search for %s: empty query", channel.channel_id)
        return []

    ensure_channel_indexed(channel)
    service = get_rag_storage_service()
    hits = service.search(
        normalized_query,
        channel_id=channel.channel_id,
        event_name=event_name,
        top_k=top_k,
    )
    logger.info(
        "RAG search channel=%s event=%s query=%r top_k=%d hits=%d",
        channel.channel_id,
        event_name or "*",
        normalized_query,
        top_k,
        len(hits),
    )
    return hits


def rag_hit_to_tag_spec(hit: RagSearchResult, element_text: str = "") -> Dict[str, str]:
    ep_button_name = hit.ep_button_name
    if element_text.strip() and ep_button_name and not re.fullmatch(r"['\"].*['\"]", ep_button_name):
        normalized = re.sub(r"\s+", "", element_text.strip())
        if normalized:
            ep_button_name = normalized

    return {
        "event_name": hit.event_name,
        "ep_button_area": hit.ep_button_area,
        "ep_button_area2": hit.ep_button_area2,
        "ep_button_name": ep_button_name,
    }


SAMPLE_KR_PC_SOURCE = """
$(document).ready(function(){
\t//상단메뉴
\t$(document).on("click", ".wrap-main-category .inner-main-category .swiper-slide", function(){
\t\tlet categoryName = $(this).find("a").text().replace(/\\s/g, "");
\t\tGA_Event("click_PC_국문_메인", "상단메뉴", "상단메뉴_카테고리", categoryName);
\t});

\t// 20260309 수정
\t// $(document).on("click", ".wrap-main-category .list-main-category a", function(){
\t// \tvar menuNm = $(this).find('span').text().replace(/\\s/g, "")
\t// \tGA_Event("click_PC_국문_메인", "상단메뉴", "상단메뉴_카테고리", menuNm);
\t// });
\t$(document).on("click", ".list-main-category a", function() {
\t\tvar menuNm = $(this).data("dispnm").replace(/\\s/g, "");
\t\tGA_Event("click_PC_국문_공통", "GNB", "GNB_공통", menuNm);
\t});

\t//메인배너 (2023-07-26 수정)
\t$(document).on("click", ".area-visual .box-visual .swiper-slide", function(){
\t\tif($(this).find("img").length){
\t\t\tlet bannerNameImg = $(this).find("img").attr("alt").replace(/\\s/g, "");
\t\t\tGA_Event("click_PC_국문_메인", "메인배너", "메인배너", "배너_"+bannerNameImg);
\t\t}
\t});

\t// 대시보드 20260427 추가
\t$(document).on("click", ".main__dashboard a", function(){
\t\tlet menuNm = $(this).find('.main__dashboard--tit').text().replace(/\\s/g, "");
\t\tGA_Event("click_PC_국문_메인", "대시보드", "대시보드_메뉴", "메뉴_"+menuNm);
\t});
});
"""


def run_chunking_self_test() -> int:
    channel = CHANNELS["www.hddfs.com"]
    chunks = extract_ga4_code_chunks(SAMPLE_KR_PC_SOURCE, channel, "sample://kr_pc.js")
    print("\n=== Chunking Self Test ===")
    print(f"parsed_chunks={len(chunks)}")
    for index, chunk in enumerate(chunks, start=1):
        print(
            f"{index}. channel={chunk.channel} selector={chunk.element_selector} "
            f"event={chunk.event_name} comment={chunk.section_comment or '-'}"
        )
        assert chunk.code.startswith("//") or "$(document).on" in chunk.code
        assert chunk.element_selector
        assert "GA_Event" in chunk.code
    return len(chunks)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")

    parsed = run_chunking_self_test()
    if parsed < 4:
        raise SystemExit(f"Chunking self test failed: expected >= 4 chunks, got {parsed}")

    service = get_rag_storage_service()
    stats = service.index_all_channels(force_reindex=True)

    print("\n=== RAG Index Summary ===")
    print(f"indexed_channels={stats.indexed_channels}")
    print(f"indexed_chunks={stats.indexed_chunks}")
    print(f"skipped_channels={stats.skipped_channels}")
    for channel_id, chunk_count in sorted(stats.channel_chunk_counts.items()):
        print(f"  - {channel_id}: {chunk_count} chunks")

    sample_queries = [
        ("kr_pc", "상단메뉴 GNB click"),
        ("kr_pc", "메인배너 banner"),
        ("kr_pc", "대시보드 메뉴"),
        (None, "click_PC_국문_메인 Header"),
    ]

    for channel_id, query in sample_queries:
        print(f"\n=== search channel={channel_id or 'ALL'} query={query!r} ===")
        hits = service.search(query, channel_id=channel_id, top_k=3)
        if not hits:
            print("No results")
            continue

        for rank, hit in enumerate(hits, start=1):
            preview = hit.code.replace("\n", " ")[:180]
            print(
                f"{rank}. score={hit.score:.3f} channel={hit.channel} "
                f"event={hit.event_name} selector={hit.element_selector}"
            )
            print(f"   {preview}")
