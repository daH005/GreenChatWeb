from __future__ import annotations
from selenium.webdriver.common.by import By
from time import sleep

from web._tests.common.drivers import driver  # noqa
from web._tests.common.constants import FullUrl  # noqa
from web._tests.common.info_generation import NewUserInfo  # noqa


def test_positive_all() -> None:
    _test_positive_main_page_redirects_to_login_if_user_is_not_auth()

    first_user = NewUserInfo.new_and_count()
    _test_positive_reg(first_user)
    _test_positive_login(first_user)

    second_user = NewUserInfo.new_and_count()
    _test_positive_reg(second_user)
    _test_positive_login(second_user)

    _test_positive_search_chat_and_send_messages()


def _test_positive_main_page_redirects_to_login_if_user_is_not_auth() -> None:
    driver.get(FullUrl.MAIN)
    assert driver.current_url == FullUrl.LOGIN


def _test_positive_reg(new_user_info: NewUserInfo) -> None:
    driver.get(FullUrl.REG)

    next_buttons = driver.find_elements(By.XPATH, '//button[@class="js-next"]')

    driver.find_element(By.XPATH, '//input[@id="js-first-name"]').send_keys(new_user_info.first_name)
    driver.find_element(By.XPATH, '//input[@id="js-last-name"]').send_keys(new_user_info.last_name)
    next_buttons[0].click()
    sleep(0.3)  # wait css transition end

    driver.find_element(By.XPATH, '//input[@id="js-username"]').send_keys(new_user_info.username)
    driver.find_element(By.XPATH, '//input[@id="js-password"]').send_keys(new_user_info.password)
    driver.find_element(By.XPATH, '//input[@id="js-password-confirm"]').send_keys(new_user_info.password)
    next_buttons[1].click()
    sleep(0.3)  # wait css transition end

    driver.find_element(By.XPATH, '//input[@id="js-email"]').send_keys(new_user_info.email)
    driver.find_element(By.XPATH, '//input[@id="js-mail-code"]').send_keys(new_user_info.code)

    driver.find_element(By.XPATH, '//button[@id="js-create-account"]').click()
    sleep(0.5)  # wait api registration

    assert driver.current_url == FullUrl.MAIN


def _test_positive_login(user_info: NewUserInfo) -> None:
    driver.get(FullUrl.LOGIN)

    driver.find_element(By.XPATH, '//input[@id="js-username"]').send_keys(user_info.username)
    driver.find_element(By.XPATH, '//input[@id="js-password"]').send_keys(user_info.password)

    driver.find_element(By.XPATH, '//button[@id="js-button"]').click()
    sleep(0.5)  # wait api authorization

    assert driver.current_url == FullUrl.MAIN


def _test_positive_search_chat_and_send_messages() -> None:
    driver.get(FullUrl.MAIN)

    my_id: int = int(driver.find_element(By.XPATH, '//div[@id="js-user-id"]').text.replace('ID: ', ''))
    driver.find_element(By.XPATH, '//input[@id="js-search-input"]').send_keys(str(my_id - 1))
    driver.find_element(By.XPATH, '//button[@id="js-search-button"]').click()

    first_text_message: str = 'Hello!'
    driver.find_element(By.XPATH, '//textarea[@id="js-new-chat-input"]').send_keys(first_text_message)
    driver.find_element(By.XPATH, '//button[@id="js-new-chat-button"]').click()
    sleep(0.5)  # wait for api chat creating

    last_message_text = driver.find_element(By.XPATH,
                                            '//div[@class="chat"]//div[@class="chat__message__text"]').text
    assert last_message_text == first_text_message

    text_messages: list[str] = ['How are you?', 'Bye!']
    for text in text_messages:
        driver.find_element(By.XPATH, '//div[@class="chat"]'
                                      '//div[@class="chat__input-container"]//textarea').send_keys(text)
        driver.find_element(By.XPATH, '//div[@class="chat"]//div[@class="chat__input-container"]//button').click()
        sleep(0.5)  # wait for api chat message creating

        last_message_text = driver.find_element(By.XPATH,
                                                '//div[@class="chat"]'
                                                '//div[@class="chat__message chat__message--self"][last()]'
                                                '//div[@class="chat__message__text"]').text
        assert last_message_text == text
