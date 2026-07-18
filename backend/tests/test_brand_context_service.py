from services.brand_context_service import (
    BrandContext,
    apply_brand_placeholders,
    apply_brand_placeholders_to_spec,
    extract_brand_code_from_url,
    infer_brand_name_from_tracked,
    resolve_brand_context,
    spec_has_brand_placeholder,
)


def test_extract_brand_code_from_url():
    url = "https://www.hddfs.com/shop/dm/bran/brand.do?onlnBranCd=024901"
    assert extract_brand_code_from_url(url) == "024901"


def test_infer_brand_name_from_tracked_expand_template():
    class Item:
        tracking_data = {
            "event": "click_PC_국문_템플릿관_024901",
            "ep_button_area": "르라보_확장형",
            "ep_button_area2": "르라보_확장형_상단",
            "ep_button_name": "알림설정",
        }

    assert infer_brand_name_from_tracked([Item()]) == "르라보"


def test_apply_brand_placeholders():
    ctx = BrandContext(brand_name="르라보", brand_code="024901", source="rules")
    assert apply_brand_placeholders("{{branNm}}_확장형", ctx) == "르라보_확장형"
    assert (
        apply_brand_placeholders("click_PC_국문_템플릿관_{{branCd}}", ctx)
        == "click_PC_국문_템플릿관_024901"
    )


def test_apply_brand_placeholders_to_spec():
    ctx = BrandContext(brand_name="르라보", brand_code="024901", source="rules")
    spec = {
        "event_name": "click_PC_국문_템플릿관_{{branCd}}",
        "ep_button_area": "{{branNm}}_확장형",
        "ep_button_area2": "{{branNm}}_확장형_상단_상세탭",
        "ep_button_name": "상세탭_{{tabNm}}",
    }
    updated = apply_brand_placeholders_to_spec(spec, ctx)
    assert updated["event_name"] == "click_PC_국문_템플릿관_024901"
    assert updated["ep_button_area"] == "르라보_확장형"
    assert updated["ep_button_name"] == "상세탭_{{tabNm}}"


def test_spec_has_brand_placeholder():
    assert spec_has_brand_placeholder({"event_name": "click_{{branCd}}"})
    assert not spec_has_brand_placeholder({"event_name": "click_PC_국문_메인"})


def test_resolve_brand_context_uses_url_and_tracked_without_ai(monkeypatch):
    monkeypatch.setattr("services.brand_context_service.settings.azure_openai_key", "")

    class Item:
        tracking_data = {
            "ep_button_area": "르라보_확장형",
        }

    ctx = resolve_brand_context(
        "https://www.hddfs.com/shop/dm/bran/brand.do?onlnBranCd=024901",
        elements=None,
        tracked_items=[Item()],
    )
    assert ctx.brand_name == "르라보"
    assert ctx.brand_code == "024901"
    assert ctx.source == "rules"
