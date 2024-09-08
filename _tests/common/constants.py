from typing import Final
from enum import StrEnum

from config import HOST, PORT
from urls import Url

__all__ = (
    'WEBSITE_URL',
    'FullUrl',
    'EMAIL_CODE',
)

host: str = HOST.replace('0.0.0.0', 'localhost')
WEBSITE_URL: Final[str] = f'https://{host}:{PORT}'
EMAIL_CODE: Final[int] = 9999


class FullUrl(StrEnum):
    MAIN = WEBSITE_URL + Url.MAIN
    LOGIN = WEBSITE_URL + Url.LOGIN
