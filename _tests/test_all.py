from selenium.webdriver.common.by import By
from selenium.webdriver import Chrome
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import NoSuchElementException
from time import sleep
from itertools import combinations
from typing import Iterator

from _tests.common.drivers import new_chrome_driver
from _tests.common.constants import EMAIL_CODE, FullUrl
from _tests.common.info_generation import UserInfo
from _tests.data import *


class TestAll:

    driver: Chrome = new_chrome_driver()
    users: list[UserInfo] = []
    users_pairs_with_histories: list[tuple[UserInfo, UserInfo, list[str]]] = []
    iter_histories: Iterator[list[str]] = iter(HISTORIES)

    cur_user: UserInfo
    cur_chat_el: WebElement

    @classmethod
    def teardown_class(cls) -> None:
        cls.driver.quit()

    @classmethod
    def test_positive_all(cls) -> None:
        cls._test_negative_redirect_to_login_if_is_not_authorized()

        cls._register_all()
        cls._test_positive_redirect_to_main_after_login(cls.users[0])

        cls._make_users_pairs_with_histories()
        cls._make_chats_and_check_histories()

    @classmethod
    def _test_negative_redirect_to_login_if_is_not_authorized(cls) -> None:
        cls.driver.get(FullUrl.MAIN)
        sleep(0.1)
        assert cls.driver.current_url == FullUrl.LOGIN

    @classmethod
    def _register_all(cls) -> None:
        for _ in range(USERS_COUNT):
            cls._register_new()

    @classmethod
    def _register_new(cls) -> None:
        user: UserInfo = UserInfo.new()
        cls.users.append(user)
        cls._login(user)  # as registration
        cls._set_full_name()

    @classmethod
    def _login(cls, user: UserInfo) -> None:
        cls.driver.get(FullUrl.LOGIN)

        cls.driver.find_element(By.XPATH, '//input[@id="js-email"]').send_keys(user.email)
        cls.driver.find_element(By.XPATH, '//input[@id="js-email-code"]').send_keys(str(EMAIL_CODE))

        cls.driver.find_element(By.XPATH, '//button[@id="js-button"]').click()
        sleep(0.5)  # wait api authorization

        user.id = cls._get_my_id()
        cls.cur_user = user

    @classmethod
    def _get_my_id(cls) -> int:
        return int(cls.driver.find_element(By.XPATH, '//span[@id="js-user-id"]').text)

    @classmethod
    def _set_full_name(cls) -> None:
        cls.driver.find_element(By.XPATH, '//div[@id="js-user-settings-open"]').click()

        first_name_input_el = cls.driver.find_element(By.XPATH, '//input[@id="js-user-settings-first-name"]')
        first_name_input_el.clear()
        first_name_input_el.send_keys(cls.cur_user.first_name)

        last_name_input_el = cls.driver.find_element(By.XPATH, '//input[@id="js-user-settings-last-name"]')
        last_name_input_el.clear()
        last_name_input_el.send_keys(cls.cur_user.last_name)

        cls.driver.find_element(By.XPATH, '//button[@id="js-user-settings-save"]').click()

    @classmethod
    def _test_positive_redirect_to_main_after_login(cls, user: UserInfo) -> None:
        cls._login(user)
        assert cls.driver.current_url == FullUrl.MAIN

    @classmethod
    def _make_chats_and_check_histories(cls) -> None:
        for first_user, second_user, history in cls.users_pairs_with_histories:
            cls._login(first_user)
            cls._create_new_chat(second_user.id, history[0])

            for cur_text_message in history[1:]:
                if cur_text_message == CHANGE_MARK:
                    cls._change_users(first_user, second_user)
                    continue
                cls._send_message_in_cur_chat(cur_text_message)

            history_without_change_mark = list(filter(lambda x: x != CHANGE_MARK, history.copy()))
            cls._test_positive_history(history_without_change_mark)

    @classmethod
    def _make_users_pairs_with_histories(cls) -> None:
        users_pairs: list[tuple[UserInfo, UserInfo]] = combinations(cls.users, 2)
        cur_history: list[str]
        for pair in users_pairs:
            cur_history = cls._next_history()
            cls.users_pairs_with_histories.append(
                (*pair, cur_history)  # type: ignore
            )

    @classmethod
    def _next_history(cls) -> list[str]:
        try:
            return next(cls.iter_histories)
        except StopIteration:
            cls.iter_histories = iter(HISTORIES)
            return next(cls.iter_histories)

    @classmethod
    def _create_new_chat(cls, interlocutor_id: int,
                         first_text_message: str,
                         ) -> None:
        cls._search_interlocutor(interlocutor_id)

        cls.driver.find_element(By.XPATH, '//div[@id="js-new-chat"]//textarea').send_keys(first_text_message)
        cls.driver.find_element(By.XPATH, '//div[@id="js-new-chat"]//button').click()
        sleep(0.5)  # wait for api chat creating

        cls._find_cur_chat_el()

    @classmethod
    def _search_interlocutor(cls, interlocutor_id: int) -> None:
        input_el = cls.driver.find_element(By.XPATH, '//input[@id="js-search-input"]')
        input_el.clear()
        input_el.send_keys(str(interlocutor_id))
        cls.driver.find_element(By.XPATH, '//button[@id="js-search-button"]').click()
        sleep(0.5)  # wait for switch and history loading

        try:
            cls._find_cur_chat_el()
        except NoSuchElementException:
            pass

    @classmethod
    def _switch_to_chat_by_sidebar(cls, interlocutor_full_name: str) -> None:
        cls.driver.find_element(By.XPATH, f'//div[@id="js-all-chats-links"]'
                                          f'//div[@class="chat-link__chat-name"]'
                                          f'[text()="{interlocutor_full_name}"]').click()
        sleep(0.5)  # wait for switch and history loading
        cls._find_cur_chat_el()

    @classmethod
    def _find_cur_chat_el(cls) -> None:
        cls.cur_chat_el = cls.driver.find_element(By.XPATH, '//div[@class="chat" and not(@class="chat--hidden")]')

    @classmethod
    def _send_message_in_cur_chat(cls, text_message: str) -> None:
        chat_input_container_el = cls.cur_chat_el.find_element(By.XPATH, 'div[@class="chat__input-container"]')
        input_el = chat_input_container_el.find_element(By.XPATH, './/textarea')
        button_el = chat_input_container_el.find_element(By.XPATH, './/button')

        input_el.send_keys(text_message)
        button_el.click()
        sleep(0.5)  # wait for api chat message creating

    @classmethod
    def _change_users(cls, first_user: UserInfo,
                      second_user: UserInfo,
                      ) -> None:
        old_user = cls.cur_user
        new_user: UserInfo = first_user
        if old_user == first_user:
            new_user = second_user
        cls._close_cur_chat()
        cls._login(new_user)
        cls._search_interlocutor(old_user.id)
        cls._switch_to_chat_by_sidebar(old_user.full_name)

    @classmethod
    def _close_cur_chat(cls) -> None:
        cls.cur_chat_el.find_element(By.XPATH, './/div[@class="chat__back-link"]').click()

    @classmethod
    def _test_positive_history(cls, expected_history: list[str]) -> None:
        text_messages_els = cls.cur_chat_el.find_elements(By.XPATH, './/div[@class="chat__message__text"]')
        for i, text_message_el in enumerate(text_messages_els):
            assert text_message_el.text == expected_history[i]
