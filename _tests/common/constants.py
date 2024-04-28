from typing import Final
from enum import StrEnum

from web.config import HOST, PORT
from web.endpoints import Url

__all__ = (
    'WEBSITE_URL',
    'FullUrl',
)

host: str = HOST.replace('0.0.0.0', 'localhost')
WEBSITE_URL: Final[str] = f'http://{host}:{PORT}'


class FullUrl(StrEnum):
    MAIN = WEBSITE_URL + Url.MAIN
    LOGIN = WEBSITE_URL + Url.LOGIN
