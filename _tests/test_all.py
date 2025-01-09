from selenium.webdriver.common.by import By
from selenium.webdriver import Chrome
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import WebDriverException
from functools import partial
from itertools import combinations
from typing import Iterator

from _tests.util.drivers import new_chrome_driver
from _tests.util.user_info import UserInfo
from _tests.data import (
    Params,
    SetForTest
)


class TestAll:

    _driver: Chrome = new_chrome_driver()
    _users: list[UserInfo] = []
    _users_pairs_with_histories: list[tuple[UserInfo, UserInfo, list[str]]] = []
    _iter_histories: Iterator[list[str]] = iter(SetForTest.HISTORIES)

    _cur_user: UserInfo
    _cur_chat_el: WebElement

    @classmethod
    def teardown_class(cls) -> None:
        cls._driver.quit()

    @classmethod
    def test_positive_all(cls) -> None:
        cls._test_negative_redirect_to_login_if_is_not_authorized()

        cls._register_all()
        cls._test_positive_redirect_to_main_after_login(cls._users[0])

        cls._make_users_pairs_with_histories()
        cls._make_chats_and_check_histories()

    @classmethod
    def _test_negative_redirect_to_login_if_is_not_authorized(cls) -> None:
        cls._driver.get(Params.FullUrls.MAIN)
        cls._try_to_execute_func(lambda: cls._driver.current_url == Params.FullUrls.LOGIN)

    @classmethod
    def _register_all(cls) -> None:
        for _ in range(Params.USERS_COUNT):
            cls._register_new()

    @classmethod
    def _register_new(cls) -> None:
        user: UserInfo = UserInfo.new()
        cls._users.append(user)
        cls._login(user)  # as registration
        cls._set_full_name()

    @classmethod
    def _login(cls, user: UserInfo) -> None:
        cls._driver.get(Params.FullUrls.LOGIN)

        cls._driver.find_element(By.XPATH, Params.Xpaths.LOGIN_EMAIL).send_keys(user.email)
        cls._driver.find_element(By.XPATH, Params.Xpaths.LOGIN_EMAIL_CODE).send_keys(str(Params.EMAIL_CODE))

        cls._driver.find_element(By.XPATH, Params.Xpaths.LOGIN_BUTTON).click()

        user.id = cls._try_to_execute_func(cls._get_my_id)
        cls._cur_user = user

    @classmethod
    def _get_my_id(cls) -> int:
        id_el_text = cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_USER_ID).text
        if id_el_text == Params.LOADING_TEXT:
            return cls._get_my_id()

        return int(id_el_text)

    @classmethod
    def _set_full_name(cls) -> None:
        cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_SETTINGS_OPEN).click()

        first_name_input_el = cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_SETTINGS_FIRST_NAME)
        first_name_input_el.clear()
        first_name_input_el.send_keys(cls._cur_user.first_name)

        last_name_input_el = cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_SETTINGS_LAST_NAME)
        last_name_input_el.clear()
        last_name_input_el.send_keys(cls._cur_user.last_name)

        cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_SETTINGS_SAVE).click()

    @classmethod
    def _test_positive_redirect_to_main_after_login(cls, user: UserInfo) -> None:
        cls._login(user)
        assert cls._driver.current_url == Params.FullUrls.MAIN

    @classmethod
    def _make_chats_and_check_histories(cls) -> None:
        for first_user, second_user, history in cls._users_pairs_with_histories:
            cls._login(first_user)
            cls._create_new_chat(second_user.id, history[0])

            for cur_text_message in history[1:]:
                if cur_text_message == Params.CHANGE_MARK:
                    cls._change_users(first_user, second_user)
                    continue
                cls._send_message_in_cur_chat(cur_text_message)

            history_without_change_mark = list(filter(lambda x: x != Params.CHANGE_MARK, history.copy()))
            cls._test_positive_history(history_without_change_mark)

    @classmethod
    def _make_users_pairs_with_histories(cls) -> None:
        users_pairs: list[tuple[UserInfo, UserInfo]] = combinations(cls._users, 2)
        cur_history: list[str]
        for pair in users_pairs:
            cur_history = cls._next_history()
            cls._users_pairs_with_histories.append(
                (*pair, cur_history)  # type: ignore
            )

    @classmethod
    def _next_history(cls) -> list[str]:
        try:
            return next(cls._iter_histories)
        except StopIteration:
            cls._iter_histories = iter(SetForTest.HISTORIES)
            return next(cls._iter_histories)

    @classmethod
    def _create_new_chat(cls, interlocutor_id: int,
                         first_text_message: str,
                         ) -> None:
        cls._search_interlocutor(interlocutor_id)
        cls._send_message_in_cur_chat(first_text_message)

    @classmethod
    def _search_interlocutor(cls, interlocutor_id: int) -> None:
        input_el = cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_SEARCH_INPUT)
        input_el.clear()
        input_el.send_keys(str(interlocutor_id))
        cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_SEARCH_BUTTON).click()

        cls._try_to_execute_func(cls._find_cur_chat_el)

    @classmethod
    def _switch_to_chat_by_sidebar(cls, interlocutor_full_name: str) -> None:
        cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_CHAT_LINK_TEMP.format(interlocutor_full_name)).click()
        cls._try_to_execute_func(cls._find_cur_chat_el)

    @classmethod
    def _find_cur_chat_el(cls) -> None:
        cls._cur_chat_el = cls._driver.find_element(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT)

    @classmethod
    def _send_message_in_cur_chat(cls, text_message: str) -> None:
        chat_input_container_el = cls._cur_chat_el.find_element(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT_INPUT_CONTAINER)
        input_el = chat_input_container_el.find_element(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT_TEXTAREA)
        button_el = chat_input_container_el.find_element(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT_SEND_BUTTON)

        input_el.send_keys(text_message)
        button_el.click()

        cls._try_to_execute_func(partial(cls._check_message_creation, text_message=text_message))

    @classmethod
    def _check_message_creation(cls, text_message: str) -> None:
        assert cls._cur_chat_el.find_elements(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT_EACH_CHAT_MESSAGE_TEXT)[-1].text == text_message

    @classmethod
    def _change_users(cls, first_user: UserInfo,
                      second_user: UserInfo,
                      ) -> None:
        old_user = cls._cur_user
        new_user: UserInfo = first_user
        if old_user == first_user:
            new_user = second_user
        cls._close_cur_chat()
        cls._login(new_user)
        cls._search_interlocutor(old_user.id)
        cls._switch_to_chat_by_sidebar(old_user.full_name)

    @classmethod
    def _close_cur_chat(cls) -> None:
        cls._cur_chat_el.find_element(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT_BACK_LINK).click()

    @classmethod
    def _test_positive_history(cls, expected_history: list[str]) -> None:
        text_messages_els = cls._cur_chat_el.find_elements(By.XPATH, Params.Xpaths.MAIN_CUR_CHAT_EACH_CHAT_MESSAGE_TEXT)
        for i, text_message_el in enumerate(text_messages_els):
            assert text_message_el.text == expected_history[i]

    @classmethod
    def _try_to_execute_func(cls, func):
        count: int = Params.MAX_ATTEMPTS
        while count:
            try:
                return func()
            except WebDriverException:
                count -= 1
        raise AssertionError
