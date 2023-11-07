from os import environ
from dotenv import load_dotenv  # pip install python-dotenv
from typing import Final

__all__ = (
    'HOST',
    'PORT',
)

load_dotenv()
HOST: Final[str] = environ.get('HOST', 'localhost')
PORT: Final[int] = int(environ.get('PORT', 82))
