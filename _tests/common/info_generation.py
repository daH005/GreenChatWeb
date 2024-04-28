from __future__ import annotations
from typing import NamedTuple, Final
from pathlib import Path

from web.config import BASE_DIR

__all__ = (
    'NewUserInfo',
)


class UserNumCounting:
    FILE_PATH: Final[Path] = BASE_DIR.joinpath('./_tests/common/count')

    @classmethod
    def get(cls) -> int:
        try:
            with open(cls.FILE_PATH, 'r') as f:
                return int(f.read())
        except FileNotFoundError:
            cls.set(0)
            return 0

    @classmethod
    def set(cls, count: int) -> None:
        with open(cls.FILE_PATH, 'w') as f:
            f.write(str(count))


class NewUserInfo(NamedTuple):
    id: int
    email: str
    first_name: str
    last_name: str = 'Шевелёв'
    code: str = '9999'

    @classmethod
    def new_and_count(cls) -> NewUserInfo:
        count: int = UserNumCounting.get()
        ob = cls(id=count,
                 email=cls._make_email(count),
                 first_name=cls._make_first_name(count),
                 )
        UserNumCounting.set(count + 1)
        return ob

    @classmethod
    def _make_first_name(cls, count: int) -> str:
        return 'Данил' + str(count)

    @classmethod
    def _make_email(cls, count: int) -> str:
        return 'testEmail' + str(count) + '@mail.ru'


if __name__ == '__main__':
    print(NewUserInfo.new_and_count())
