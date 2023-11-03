from os import environ
from dotenv import load_dotenv  # pip install python-dotenv
from typing import Final

__all__ = (
    'HOST',
    'PORT',
    'HTTP_URL',
    'WEBSOCKET_URL',
)

load_dotenv()
HOST: Final[str] = environ.get('HOST', 'localhost')
PORT: Final[int] = int(environ.get('PORT', 82))
HTTP_URL: Final[str] = environ.get('HTTP_URL')
WEBSOCKET_URL: Final[str] = environ.get('WEBSOCKET_URL')

if __name__ == '__main__':
    print(HTTP_URL, WEBSOCKET_URL)
