from os import environ
from dotenv import load_dotenv  # pip install python-dotenv
from typing import Final
from pathlib import Path

__all__ = (
    'BASE_DIR',
    'DEBUG',
    'HOST',
    'PORT',
    'CHROMEDRIVER_PATH',
)

load_dotenv()

BASE_DIR: Path = Path(__file__).resolve().parent  # '.../web'

DEBUG: Final[bool] = False if environ['DEBUG'].lower() == 'false' else bool(environ['DEBUG'])

HOST: Final[str] = environ['HOST']
PORT: Final[int] = int(environ['PORT'])

CHROMEDRIVER_PATH: Final[str | None] = environ.get('CHROMEDRIVER_PATH')
