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
