from enum import StrEnum

__all__ = (
    'EndpointName',
    'Url',
)


class EndpointName(StrEnum):
    MAIN = 'main'
    LOGIN = 'login'


class Url(StrEnum):
    MAIN = '/'
    LOGIN = '/login'
