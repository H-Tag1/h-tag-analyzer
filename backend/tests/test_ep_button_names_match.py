from services.tracking.event_normalizer import ep_button_names_match


def test_ep_button_names_match_exact():
    assert ep_button_names_match("스킨케어", "스킨케어")


def test_ep_button_names_match_category_prefix():
    assert ep_button_names_match("스킨케어", "카테고리_스킨케어")
    assert ep_button_names_match("메이크업", "카테고리_메이크업")


def test_ep_button_names_match_tab_prefix():
    assert ep_button_names_match("베스트 상품", "탭_베스트상품")


def test_ep_button_names_match_alias_group():
    assert ep_button_names_match("알림", "알림설정")


def test_ep_button_names_match_rejects_unrelated():
    assert not ep_button_names_match("스킨케어", "카테고리_메이크업")
