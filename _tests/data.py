from config import PORT
from urls import Url

__all__ = (
    'Params',
    'SetForTest',
)


class Params:

    class FullUrls:

        BASE = f'https://localhost:{PORT}'
        MAIN = BASE + Url.MAIN
        LOGIN = BASE + Url.LOGIN

    class Xpaths:

        LOGIN_EMAIL = '//input[@id="js-email"]'
        LOGIN_EMAIL_CODE = '//input[@id="js-email-code"]'
        LOGIN_BUTTON = '//button[@id="js-button"]'

        MAIN_USER_ID = '//span[@id="js-user-id"]'

        MAIN_SETTINGS_OPEN = '//div[@id="js-user-settings-open"]'
        MAIN_SETTINGS_FIRST_NAME = '//input[@id="js-user-settings-first-name"]'
        MAIN_SETTINGS_LAST_NAME = '//input[@id="js-user-settings-last-name"]'
        MAIN_SETTINGS_SAVE = '//button[@id="js-user-settings-save"]'

        MAIN_SEARCH_INPUT = '//input[@id="js-search-input"]'
        MAIN_SEARCH_BUTTON = '//button[@id="js-search-button"]'

        MAIN_CHAT_LINK_TEMP = '//div[@id="js-all-chats-links"]//div[@class="chat-link__chat-name"][text()="{}"]'
        MAIN_CUR_CHAT = '//div[@class="chat" and not(@class="chat--hidden")]'
        MAIN_CUR_CHAT_INPUT_CONTAINER = 'div[@class="chat__input-container"]'
        MAIN_CUR_CHAT_TEXTAREA = './/textarea'
        MAIN_CUR_CHAT_SEND_BUTTON = './/button[@class="chat__send js-click-by-press-enter-button"]'
        MAIN_CUR_CHAT_EACH_CHAT_MESSAGE_TEXT = './/div[@class="chat__message__text"]'
        MAIN_CUR_CHAT_BACK_LINK = './/div[@class="chat__back-link"]'

    MAX_ATTEMPTS = 200
    LOADING_TEXT = 'загрузка...'
    EMAIL_CODE = 9999
    USERS_COUNT = 3
    CHANGE_MARK = '---'


class SetForTest:

    HISTORIES = [
            [
                'Hello!',
                'My name is Danil.',
                'How are u?',
                Params.CHANGE_MARK,
                'Im fine',
                Params.CHANGE_MARK,
                'Ok, goodbye!',
            ],
            [
                '1',
                '2',
                '3',
                '4',
                '5',
                Params.CHANGE_MARK,
                'stop it!!!',
                Params.CHANGE_MARK,
                'Ok, goodbye!',
            ],
            [
                'Hello!',
                Params.CHANGE_MARK,
                'Hi!',
                'How are u?',
                Params.CHANGE_MARK,
                'Batman!',
            ]
        ]
