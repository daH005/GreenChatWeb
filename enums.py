from enum import StrEnum

__all__ = (
    'Url',
    'TemplateNames',
)


class Url(StrEnum):
    MAIN = '/'
    LOGIN = '/login'


class TemplateNames:
    MAIN = 'main.html'
    LOGIN = 'login.html'
    ERROR = 'error.html'
