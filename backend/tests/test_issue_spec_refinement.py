import asyncio

from models.ai_analysis_item import AiAnalysisItem
from models.bounding_box import BoundingBox
from services import batch_scan_service


def _issue(text, spec):
    return AiAnalysisItem(
        element_selector="button.x",
        element_text=text,
        bounding_box=BoundingBox(x=0, y=0, width=10, height=10),
        issue="missing",
        recommended_ga_spec=spec,
    )


def _enable_azure(monkeypatch):
    monkeypatch.setattr(batch_scan_service.settings, "azure_openai_key", "k", raising=False)
    monkeypatch.setattr(batch_scan_service.settings, "azure_openai_endpoint", "https://e", raising=False)


def test_llm_spec_overrides_rag(monkeypatch):
    _enable_azure(monkeypatch)
    # RAG가 '확대'에 로그인/비밀번호찾기를 잘못 붙인 상태
    issues = [_issue("확대", {"event_name": "click_PC_국문_로그인", "ep_button_area": "비밀번호찾기", "ep_button_name": "확대"})]

    async def fake_suggest(url, dicts):
        return [{"event_name": "click_PC_국문_메인", "ep_button_area": "동영상", "ep_button_name": "확대"}]

    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://site", issues))

    spec = issues[0].recommended_ga_spec
    assert spec["event_name"] == "click_PC_국문_메인"
    assert spec["ep_button_area"] == "동영상"


def test_llm_empty_field_falls_back_to_rag(monkeypatch):
    _enable_azure(monkeypatch)
    issues = [_issue("담톤", {"event_name": "click_PC_국문_메인", "ep_button_area": "브랜드홍보", "ep_button_name": "담톤"})]

    async def fake_suggest(url, dicts):
        # LLM이 name만 개선하고 area는 비워서 반환 → area는 기존 RAG 유지되어야
        return [{"event_name": "click_PC_국문_메인", "ep_button_area": "", "ep_button_name": "브랜드_담톤"}]

    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://site", issues))

    spec = issues[0].recommended_ga_spec
    assert spec["ep_button_name"] == "브랜드_담톤"   # LLM 개선값
    assert spec["ep_button_area"] == "브랜드홍보"      # 기존 RAG 보존


def test_noop_without_azure_config(monkeypatch):
    monkeypatch.setattr(batch_scan_service.settings, "azure_openai_key", "", raising=False)
    monkeypatch.setattr(batch_scan_service.settings, "azure_openai_endpoint", "", raising=False)
    original = {"event_name": "click_PC_국문_로그인", "ep_button_area": "비밀번호찾기", "ep_button_name": "확대"}
    issues = [_issue("확대", dict(original))]

    called = {"v": False}

    async def fake_suggest(url, dicts):
        called["v"] = True
        return [{}]

    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://site", issues))

    assert called["v"] is False               # LLM 호출 안 함
    assert issues[0].recommended_ga_spec == original  # 기존 스펙 그대로


def test_keeps_rag_on_llm_failure(monkeypatch):
    _enable_azure(monkeypatch)
    original = {"event_name": "click_PC_국문_메인", "ep_button_area": "오늘의특가", "ep_button_name": "상품A"}
    issues = [_issue("상품A", dict(original))]

    async def fake_suggest(url, dicts):
        raise RuntimeError("azure down")

    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://site", issues))

    assert issues[0].recommended_ga_spec == original


def test_noop_empty_issues(monkeypatch):
    _enable_azure(monkeypatch)
    called = {"v": False}

    async def fake_suggest(url, dicts):
        called["v"] = True
        return []

    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://site", []))
    assert called["v"] is False


class _FakeChannel:
    template_filename = "kr_pc.js"


def _guard_env(monkeypatch, known):
    _enable_azure(monkeypatch)
    monkeypatch.setattr(batch_scan_service, "resolve_channel_or_none", lambda url: _FakeChannel())
    monkeypatch.setattr(batch_scan_service, "_known_event_names", lambda fn: frozenset(known))


def test_invented_event_name_reverts_to_rag(monkeypatch):
    # RAG 원래 event는 실재값(메인). LLM이 파일에 없는 '상품클릭'을 지어냄.
    issues = [_issue("페넬로페", {"event_name": "click_PC_국문_메인", "ep_button_area": "오늘의특가", "ep_button_name": "상품_페넬로페"})]

    async def fake_suggest(url, dicts):
        return [{"event_name": "click_PC_국문_상품클릭", "ep_button_area": "상품리스트", "ep_button_name": "페넬로페 바렐 스트렝스"}]

    _guard_env(monkeypatch, {"click_PC_국문_메인"})
    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://hddfs", issues))

    spec = issues[0].recommended_ga_spec
    assert spec["event_name"] == "click_PC_국문_메인"       # 지어낸 값 → 실재 RAG값으로 폴백
    assert spec["ep_button_area"] == "상품리스트"            # area 개선은 유지
    assert spec["ep_button_name"] == "페넬로페 바렐 스트렝스"   # name 개선도 유지


def test_valid_event_name_kept(monkeypatch):
    # LLM이 문맥으로 교정한 event가 파일에 실재하면 그대로 둔다(잘못된 RAG값으로 안 되돌림).
    issues = [_issue("확대", {"event_name": "click_PC_국문_로그인", "ep_button_area": "비밀번호찾기", "ep_button_name": "확대"})]

    async def fake_suggest(url, dicts):
        return [{"event_name": "click_PC_국문_메인", "ep_button_area": "동영상", "ep_button_name": "확대"}]

    _guard_env(monkeypatch, {"click_PC_국문_메인", "click_PC_국문_로그인"})
    monkeypatch.setattr(batch_scan_service, "suggest_tag_specs_for_page", fake_suggest)
    asyncio.run(batch_scan_service._refine_issue_specs_with_llm("https://hddfs", issues))

    spec = issues[0].recommended_ga_spec
    assert spec["event_name"] == "click_PC_국문_메인"   # 실재값 → LLM 교정 유지


def test_known_event_names_extracts_from_ga_file():
    # 실제 kr_pc.js에서 이벤트명 추출 (통합 검증)
    known = batch_scan_service._known_event_names("kr_pc.js")
    assert "click_PC_국문_메인" in known
    assert "click_PC_국문_상품클릭" not in known
    assert batch_scan_service._known_event_names("nonexistent.js") == frozenset()
