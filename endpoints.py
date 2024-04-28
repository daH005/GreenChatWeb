from enum import StrEnum

__all__ = (
    'EndpointName',
    'Url',
    'TemplateName',
)


class EndpointName(StrEnum):
    MAIN = 'main'
    LOGIN = 'login'


class Url(StrEnum):
    MAIN = '/'
    LOGIN = '/login'


class TemplateName:  # Enum вызывает ошибку...
    MAIN = 'main.html'
    LOGIN = 'login.html'
    ERROR = 'error.html'
