from os import environ
from dotenv import load_dotenv  # pip install python-dotenv
from typing import Final

__all__ = (
    'DEBUG',
    'HOST',
    'PORT',
)

load_dotenv()

DEBUG: Final[bool] = False if environ['DEBUG'].lower() == 'false' else bool(environ['DEBUG'])

HOST: Final[str] = environ['HOST']
PORT: Final[int] = int(environ['PORT'])
