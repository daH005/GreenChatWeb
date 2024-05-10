from __future__ import annotations
from typing import Final
from pathlib import Path
from dataclasses import dataclass

from web.config import BASE_DIR

__all__ = (
    'UserInfo',
)


class UserNumCounting:
    FILE_PATH: Final[Path] = BASE_DIR.joinpath('./_tests/common/count')

    cur: int

    @classmethod
    def update(cls) -> None:
        try:
            with open(cls.FILE_PATH, 'r') as f:
                cls.cur = int(f.read())
        except FileNotFoundError:
            cls.set(0)
            cls.cur = 0

    @classmethod
    def increment(cls) -> None:
        cls.set(cls.cur + 1)

    @classmethod
    def set(cls, count: int) -> None:
        with open(cls.FILE_PATH, 'w') as f:
            f.write(str(count))
        cls.cur = count


UserNumCounting.update()


@dataclass
class UserInfo:
    email: str
    first_name: str
    last_name: str = 'Шевелёв'
    id: int = 0

    @classmethod
    def new(cls) -> UserInfo:
        ob = cls(email=cls._make_email(),
                 first_name=cls._make_first_name(),
                 )
        UserNumCounting.increment()
        return ob

    @classmethod
    def _make_first_name(cls) -> str:
        return 'Данил' + str(UserNumCounting.cur)

    @classmethod
    def _make_email(cls) -> str:
        return 'testEmail' + str(UserNumCounting.cur) + '@mail.ru'

    @property
    def full_name(self) -> str:
        return self.first_name + ' ' + self.last_name


if __name__ == '__main__':
    print(UserInfo.new())
    print(UserInfo.new())
    print(UserInfo.new())
