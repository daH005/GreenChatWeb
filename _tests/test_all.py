from __future__ import annotations
from selenium.webdriver.common.by import By
from time import sleep

from web._tests.common.drivers import driver  # noqa
from web._tests.common.constants import FullUrl  # noqa
from web._tests.common.info_generation import NewUserInfo  # noqa


def _get_my_id() -> int:
    return int(driver.find_element(By.XPATH, '//div[@id="js-user-id"]').text.replace('ID: ', ''))


def _get_cur_chat_el():
    return driver.find_element(By.XPATH, '//div[@class="chat" and not(@class="chat--hidden")]')


def test_positive_all() -> None:
    histories = [
        [
            'Hello!',  # 1
            'My name is Danil.',  # 1
            'How are u?',  # 1
            'Im fine',  # 2
            'Ok, goodbye!',  # 1
        ],
        [
            '1',  # 1
            '2',  # 1
            '3',  # 1
            '4',  # 1
            '5',  # 1
            'stop it!!!',  # 2
            'Ok, goodbye!',  # 1
        ]
    ]

    _test_positive_main_page_redirects_to_login_if_user_is_not_auth()

    users = []
    for _ in range(3):
        user = NewUserInfo.new_and_count()
        users.append(user)
        _test_positive_reg(user)

    _test_positive_login(users[0])
    id_ = _get_my_id()

    _test_positive_create_new_chat(id_ + 1, histories[0][0])
    _test_positive_send_messages_in_cur_chat(histories[0][1:2])
    _test_positive_close_cur_chat()

    _test_positive_create_new_chat(id_ + 2, histories[1][0])
    _test_positive_send_messages_in_cur_chat(histories[1][1:5])

    _test_positive_switch_to_chat_by_sidebar(users[1].first_name)
    _test_positive_send_messages_in_cur_chat(histories[0][2:3])

    _test_positive_login(users[1])
    id_ = _get_my_id()

    _test_positive_search(id_ - 1)
    _test_positive_send_messages_in_cur_chat(histories[0][3:4])
    _test_positive_close_cur_chat()

    _test_positive_login(users[2])

    _test_positive_switch_to_chat_by_sidebar(users[0].first_name)
    _test_positive_send_messages_in_cur_chat(histories[1][5:6])
    _test_positive_close_cur_chat()

    _test_positive_login(users[0])

    _test_positive_switch_to_chat_by_sidebar(users[1].first_name)
    _test_positive_send_messages_in_cur_chat(histories[0][4:5])
    _test_positive_history(histories[0])

    _test_positive_switch_to_chat_by_sidebar(users[2].first_name)
    _test_positive_send_messages_in_cur_chat(histories[1][6:7])
    _test_positive_history(histories[1])


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


def _test_positive_create_new_chat(id_: int,
                                   first_text_message: str,
                                   ) -> None:
    _test_positive_search(id_)

    driver.find_element(By.XPATH, '//textarea[@id="js-new-chat-input"]').send_keys(first_text_message)
    driver.find_element(By.XPATH, '//button[@id="js-new-chat-button"]').click()
    sleep(0.5)  # wait for api chat creating


def _test_positive_search(id_: int) -> None:
    input_el = driver.find_element(By.XPATH, '//input[@id="js-search-input"]')
    input_el.clear()
    input_el.send_keys(str(id_))
    driver.find_element(By.XPATH, '//button[@id="js-search-button"]').click()
    sleep(0.5)  # wait for switch and history loading


def _test_positive_switch_to_chat_by_sidebar(interlocutor_first_name: str) -> None:
    driver.find_element(By.XPATH, f'//div[@class="sidebar__links"]'
                                  f'/div[@class="chat-link"]'
                                  f'/div[@class="chat-link__chat-name"][text()="{interlocutor_first_name}"]').click()
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
