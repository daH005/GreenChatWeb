from enum import StrEnum

__all__ = (
    'EndpointName',
    'Url',
)


class EndpointName(StrEnum):
    CHAT = 'chat'
    LOGIN = 'login'


class Url(StrEnum):
    CHAT = '/'
    LOGIN = '/login'
