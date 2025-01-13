from typing import Self
from dataclasses import dataclass

from _tests.util.user_num_counter import UserNumCounter

__all__ = (
    'User',
)


@dataclass
class User:

    email: str
    first_name: str
    last_name: str = 'Шевелёв'
    id: int = 0

    _counter: UserNumCounter = UserNumCounter()

    @classmethod
    def new(cls) -> Self:
        ob = cls(email=cls._make_email(),
                 first_name=cls._make_first_name(),
                 )
        cls._counter.increase()
        return ob

    @classmethod
    def _make_first_name(cls) -> str:
        return 'Данил' + str(cls._counter.cur)

    @classmethod
    def _make_email(cls) -> str:
        return 'testEmail' + str(cls._counter.cur) + '@mail.ru'

    @property
    def full_name(self) -> str:
        return self.first_name + ' ' + self.last_name
