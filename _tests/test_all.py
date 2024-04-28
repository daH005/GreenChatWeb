from __future__ import annotations
from selenium.webdriver.common.by import By
from time import sleep

from web._tests.common.drivers import driver  # noqa
from web._tests.common.constants import FullUrl  # noqa
from web._tests.common.info_generation import NewUserInfo  # noqa
from web._tests.all_test_data import *  # noqa


def test_positive_all() -> None:
    _test_positive_main_page_redirects_to_login_if_user_is_not_auth()

    # registration
    users = []
    for _ in range(3):
        user = NewUserInfo.new_and_count()
        users.append(user)
        _test_positive_login(user)  # as registration

    # check id
    for user in users:
        _test_positive_login(user)
        assert user.id == _get_my_id()

    # messages sendings
    users_pairs_data = [
        [users[0], users[1], HISTORIES[0]],
        [users[0], users[2], HISTORIES[1]],
        [users[1], users[2], HISTORIES[2]],
    ]
    for data in users_pairs_data:
        _test_positive_login(data[0])
        _test_positive_create_new_chat(data[1].id, data[2][0])
        cur_user = data[0]

        for step in data[2][1:]:

            # user changing
            if step == CHANGE_MARK:
                old_user = cur_user
                cur_user: NewUserInfo = data[0]
                if old_user == data[0]:
                    cur_user = data[1]
                _test_positive_close_cur_chat()
                _test_positive_login(cur_user)
                _test_positive_search(old_user.id)
                continue

            _test_positive_send_messages_in_cur_chat([step])

        history_without_change_mark = list(filter(lambda x: x != CHANGE_MARK, data[2].copy()))
        _test_positive_history(history_without_change_mark)


def _get_my_id() -> int:
    return int(driver.find_element(By.XPATH, '//span[@id="js-user-id"]').text)


def _test_positive_main_page_redirects_to_login_if_user_is_not_auth() -> None:
    driver.get(FullUrl.MAIN)
    assert driver.current_url == FullUrl.LOGIN


def _test_positive_login(user_info: NewUserInfo) -> None:
    driver.get(FullUrl.LOGIN)

    driver.find_element(By.XPATH, '//input[@id="js-email"]').send_keys(user_info.email)
    driver.find_element(By.XPATH, '//input[@id="js-email-code"]').send_keys(user_info.code)

    driver.find_element(By.XPATH, '//button[@id="js-button"]').click()
    sleep(0.5)  # wait api authorization

    assert driver.current_url == FullUrl.MAIN


def _test_positive_create_new_chat(id_: int,
                                   first_text_message: str,
                                   ) -> None:
    _test_positive_search(id_)

    driver.find_element(By.XPATH, '//div[@id="js-new-chat"]//textarea').send_keys(first_text_message)
    driver.find_element(By.XPATH, '//div[@id="js-new-chat"]//button').click()
    sleep(0.5)  # wait for api chat creating


def _test_positive_search(id_: int) -> None:
    input_el = driver.find_element(By.XPATH, '//input[@id="js-search-input"]')
    input_el.clear()
    input_el.send_keys(str(id_))
    driver.find_element(By.XPATH, '//button[@id="js-search-button"]').click()
    sleep(0.5)  # wait for switch and history loading


# FixMe: Вернуть прогон теста после того, как сделаем редактирование имени и фамилии
def _test_positive_switch_to_chat_by_sidebar(interlocutor_full_name: str) -> None:
    driver.find_element(By.XPATH, f'//div[@class="sidebar__links"]'
                                  f'/div[@class="chat-link"]'
                                  f'//div[@class="chat-link__chat-name"][text()="{interlocutor_full_name}"]').click()
    sleep(0.5)  # wait for switch and history loading


def _test_positive_send_messages_in_cur_chat(text_messages: list[str]) -> None:
    chat_input_container_el = _get_cur_chat_el().find_element(By.XPATH, 'div[@class="chat__input-container"]')
    input_el = chat_input_container_el.find_element(By.XPATH, './/textarea')
    button_el = chat_input_container_el.find_element(By.XPATH, './/button')

    for text_message in text_messages:
        input_el.send_keys(text_message)
        button_el.click()
        sleep(0.5)  # wait for api chat message creating


def _test_positive_history(expected_text_messages: list[str]) -> None:
    text_messages_els = _get_cur_chat_el().find_elements(By.XPATH, './/div[@class="chat__message__text"]')
    for i, text_message_el in enumerate(text_messages_els):
        assert text_message_el.text == expected_text_messages[i]


def _test_positive_close_cur_chat() -> None:
    _get_cur_chat_el().find_element(By.XPATH, './/div[@class="chat__back-link"]').click()


def _get_cur_chat_el():
    return driver.find_element(By.XPATH, '//div[@class="chat" and not(@class="chat--hidden")]')
