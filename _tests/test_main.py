from web._tests.common import driver, FullUrl  # noqa


def test_positive_main_page_redirects_to_login_if_user_is_not_auth() -> None:
    driver.get(FullUrl.MAIN)
    assert driver.current_url == FullUrl.LOGIN
