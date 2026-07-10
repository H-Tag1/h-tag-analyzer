import asyncio
from typing import Any, Dict, List
from urllib.parse import quote, urlparse, urlunparse

from playwright.async_api import Browser, Error as PlaywrightError, Page, TimeoutError as PlaywrightTimeoutError

from models.scan_request import ScanLoginCredentials


MOBILE_HOSTS = {"m.hddfs.com", "mcn.hd-dfs.com", "men.hddfs.com"}
MOBILE_USER_AGENT = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
    "Mobile/15E148 Safari/604.1"
)
AUTH_EXCLUDED_PATH_PARTS = ("/mm/mbshAuca/", "/mm/mbshJoin/")
AUTH_EXCLUDED_TEXTS = {"로그인", "로그아웃", "회원가입"}


async def new_scan_page(browser: Browser, url: str) -> Page:
    if is_mobile_url(url):
        return await browser.new_page(
            viewport={"width": 390, "height": 844},
            user_agent=MOBILE_USER_AGENT,
            is_mobile=True,
            has_touch=True,
            device_scale_factor=3,
        )

    return await browser.new_page(viewport={"width": 1440, "height": 900})


async def login(page: Page, target_url: str, credentials: ScanLoginCredentials) -> None:
    if is_mobile_url(target_url):
        await _login_mobile(page, target_url, credentials)
    else:
        await _login_pc(page, target_url, credentials)

    await ensure_target_page(page, target_url)

    if not await _is_logged_in(page):
        raise RuntimeError("로그인에 실패했습니다. ID/PW 또는 추가 인증 필요 여부를 확인해주세요.")


async def goto_scan_target(page: Page, url: str) -> None:
    if page.url == url:
        return

    try:
        await page.goto(url, wait_until="load", timeout=60000)
    except PlaywrightError as e:
        if "interrupted by another navigation" not in str(e):
            raise
        try:
            await page.wait_for_load_state("load", timeout=15000)
        except PlaywrightTimeoutError:
            pass

    await page.wait_for_timeout(1000)
    await _raise_if_web_firewall_blocked(page)


def is_auth_related_url(url: str) -> bool:
    try:
        path = urlparse(url).path
        return any(part in path for part in AUTH_EXCLUDED_PATH_PARTS)
    except Exception:
        return False


def is_auth_action_element(item: Dict[str, Any]) -> bool:
    text = (item.get("text") or "").strip()
    selector = (item.get("selector") or "").strip()

    if text in AUTH_EXCLUDED_TEXTS:
        return True

    return selector == "#loginBtn" or "menu_login_join" in selector


def is_mobile_url(url: str) -> bool:
    try:
        host = (urlparse(url).hostname or "").lower()
        return host in MOBILE_HOSTS
    except Exception:
        return False


async def ensure_target_page(page: Page, target_url: str) -> None:
    try:
        await page.wait_for_load_state("load", timeout=10000)
    except PlaywrightTimeoutError:
        pass

    await page.wait_for_timeout(1000)
    await _raise_if_web_firewall_blocked(page)

    if "mbshAuca/addLgin" in page.url:
        await _raise_login_error(page)

    if _same_host(page.url, target_url) and "mbshAuca/addLgin" not in page.url:
        return

    try:
        await page.goto(target_url, wait_until="load", timeout=60000)
    except PlaywrightError as e:
        if "interrupted by another navigation" not in str(e):
            raise
        try:
            await page.wait_for_load_state("load", timeout=15000)
        except PlaywrightTimeoutError:
            pass

    await page.wait_for_timeout(1000)
    await _raise_if_web_firewall_blocked(page)


async def _login_pc(page: Page, target_url: str, credentials: ScanLoginCredentials) -> None:
    page.on("dialog", _accept_dialog)
    await page.goto(target_url, wait_until="load", timeout=60000)
    await page.wait_for_timeout(1000)
    await _raise_if_web_firewall_blocked(page)

    login_page = await _open_pc_login_page(page, target_url)

    login_page.on("dialog", _accept_dialog)
    await _submit_login_form(login_page, credentials)

    if login_page is not page:
        try:
            await login_page.wait_for_event("close", timeout=15000)
        except PlaywrightTimeoutError:
            await _raise_login_error(login_page)

    try:
        await page.wait_for_load_state("load", timeout=15000)
    except PlaywrightTimeoutError:
        pass


async def _open_pc_login_page(page: Page, target_url: str) -> Page:
    has_login_function = await page.evaluate("() => typeof login === 'function'")
    if has_login_function:
        try:
            async with page.expect_popup(timeout=15000) as popup_info:
                await page.evaluate("(url) => login(url)", target_url)
            login_page = await popup_info.value
            await _wait_for_login_page(login_page)
            return login_page
        except (PlaywrightError, PlaywrightTimeoutError):
            pass

    try:
        async with page.expect_popup(timeout=15000) as popup_info:
            await page.get_by_text("로그인", exact=True).first.click()
        login_page = await popup_info.value
        await _wait_for_login_page(login_page)
        return login_page
    except (PlaywrightError, PlaywrightTimeoutError):
        pass

    await page.goto(_login_url_for(target_url), wait_until="load", timeout=60000)
    await _wait_for_login_page(page)
    return page


async def _login_mobile(page: Page, target_url: str, credentials: ScanLoginCredentials) -> None:
    page.on("dialog", _accept_dialog)
    await page.goto(_login_url_for(target_url), wait_until="load", timeout=60000)
    await _raise_if_web_firewall_blocked(page)
    await _submit_login_form(page, credentials)

    try:
        await page.wait_for_load_state("load", timeout=15000)
    except PlaywrightTimeoutError:
        pass

    await page.wait_for_timeout(1000)
    if "mbshAuca/addLgin" in page.url:
        await _raise_login_error(page)


async def _submit_login_form(page: Page, credentials: ScanLoginCredentials) -> None:
    await _activate_login_member_tab(page, credentials.memberType)
    form_candidates = _login_form_candidates(credentials.memberType)
    selected_form = None

    for candidate in form_candidates:
        try:
            await page.locator(candidate["user_selector"]).wait_for(state="visible", timeout=3000)
            selected_form = candidate
            break
        except PlaywrightTimeoutError:
            continue

    if not selected_form:
        raise RuntimeError("로그인 입력 폼을 찾지 못했습니다. 회원 유형 또는 로그인 페이지 상태를 확인해주세요.")

    await page.fill(selected_form["user_selector"], credentials.username.strip())
    await page.fill(selected_form["password_selector"], credentials.password)
    await page.locator(selected_form["button_selector"]).first.click()


async def _wait_for_login_page(page: Page) -> None:
    try:
        await page.wait_for_load_state("load", timeout=15000)
    except PlaywrightTimeoutError:
        pass

    await _raise_if_web_firewall_blocked(page)

    selectors = ", ".join(candidate["user_selector"] for candidate in _login_form_candidates("integrated"))
    try:
        await page.locator(selectors).first.wait_for(state="attached", timeout=15000)
    except PlaywrightTimeoutError:
        raise RuntimeError("로그인 페이지가 정상적으로 열리지 않았습니다. 로그인 팝업 차단 또는 페이지 상태를 확인해주세요.")


async def _activate_login_member_tab(page: Page, member_type: str) -> None:
    tab_text = "면세점간편회원" if member_type == "simple" else "H.Point통합회원"
    try:
        tab = page.get_by_text(tab_text, exact=True).first
        if await tab.is_visible(timeout=1000):
            await tab.click()
            await page.wait_for_timeout(300)
    except (PlaywrightError, PlaywrightTimeoutError):
        pass


def _login_form_candidates(member_type: str) -> List[Dict[str, str]]:
    integrated_form = {
        "user_selector": "#frmIntgLgin #custId",
        "password_selector": "#frmIntgLgin #custPwd",
        "button_selector": "#frmIntgLgin #btnLgin1, #frmIntgLgin #btnLgin",
    }
    simple_form = {
        "user_selector": "#frmGeneLgin #mbshId",
        "password_selector": "#frmGeneLgin #mbshPwd",
        "button_selector": "#frmGeneLgin #btnLgin2, #frmGeneLgin #btnLgin",
    }

    if member_type == "simple":
        return [simple_form, integrated_form]
    return [integrated_form, simple_form]


async def _is_logged_in(page: Page) -> bool:
    try:
        result = await page.evaluate("() => typeof isLogin !== 'undefined' ? Boolean(isLogin) : false")
        if result:
            return True
    except Exception:
        pass

    try:
        return await page.locator("text=로그아웃").count() > 0
    except Exception:
        return False


async def _raise_login_error(page: Page) -> None:
    await _raise_if_web_firewall_blocked(page)

    for selector in ("#frmIntgLgin #pError", "#frmGeneLgin #pError", ".t_error2", ".t_error"):
        try:
            text = (await page.locator(selector).first.text_content(timeout=1000) or "").strip()
            if text:
                raise RuntimeError(text)
        except PlaywrightTimeoutError:
            continue

    raise RuntimeError("로그인에 실패했습니다. ID/PW 또는 추가 인증 필요 여부를 확인해주세요.")


async def _raise_if_web_firewall_blocked(page: Page) -> None:
    try:
        body_text = await page.evaluate("() => document.body ? document.body.innerText : ''")
    except PlaywrightError:
        return

    if "Web firewall security policies" in body_text:
        raise RuntimeError("현대면세점 보안 정책(WAF)에 의해 페이지 접근이 차단되었습니다. 현재 자동 브라우저에서 해당 페이지를 열 수 없습니다.")


def _login_url_for(target_url: str) -> str:
    parsed = urlparse(target_url)
    base = urlunparse((parsed.scheme or "https", parsed.netloc, "", "", "", ""))
    return f"{base}/shop/mm/mbshAuca/addLgin.do?redirectUrl={quote(target_url, safe='')}"


def _same_host(current_url: str, target_url: str) -> bool:
    try:
        return (urlparse(current_url).hostname or "").lower() == (urlparse(target_url).hostname or "").lower()
    except Exception:
        return False


def _accept_dialog(dialog) -> None:
    asyncio.create_task(dialog.accept())
