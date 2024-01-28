from enum import StrEnum

__all__ = (
    'EndpointName',
    'Url',
    'TemplateName',
)


class EndpointName(StrEnum):
    MAIN = 'main'
    REG = 'reg'
    LOGIN = 'login'


class Url(StrEnum):
    MAIN = '/'
    REG = '/reg'
    LOGIN = '/login'


class TemplateName:  # Enum вызывает ошибку...
    MAIN = 'main.html'
    REG = 'reg.html'
    LOGIN = 'login.html'
    ERROR = 'error.html'
