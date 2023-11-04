from os import environ
from dotenv import load_dotenv  # pip install python-dotenv
from typing import Final
from datetime import timedelta

__all__ = (
    'HOST',
    'PORT',
    'HTTP_URL',
    'WEBSOCKET_URL',
    'COOKIE_AUTH_TOKEN_MAX_AGE',
)

load_dotenv()
HOST: Final[str] = environ.get('HOST', 'localhost')
PORT: Final[int] = int(environ.get('PORT', 82))
HTTP_URL: Final[str] = environ.get('HTTP_URL')
WEBSOCKET_URL: Final[str] = environ.get('WEBSOCKET_URL')
COOKIE_AUTH_TOKEN_MAX_AGE: Final[timedelta] = timedelta(days=60)

if __name__ == '__main__':
    print(HTTP_URL, WEBSOCKET_URL)
