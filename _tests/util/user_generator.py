from time import time
from typing import Self
from dataclasses import dataclass

__all__ = (
    'User',
)


@dataclass
class User:

    email: str
    first_name: str
    last_name: str = 'GreenChat'
    id: int = 0

    @classmethod
    def new(cls) -> Self:
        now = str(int(time()))
        ob = cls(email=cls._make_email(now),
                 first_name=cls._make_first_name(now),
                 )
        return ob

    @classmethod
    def _make_first_name(cls, identity: str) -> str:
        return 'User' + identity

    @classmethod
    def _make_email(cls, identity: str) -> str:
        return 'user_email' + identity + '@mail.ru'

    @property
    def full_name(self) -> str:
        return self.first_name + ' ' + self.last_name
