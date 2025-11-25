from os import environ
from dotenv import load_dotenv
from typing import Final
from pathlib import Path

__all__ = (
    'BASE_DIR',
    'DEBUG',
    'HOST',
    'PORT',
    'SSL_CERTFILE',
    'SSL_KEYFILE',
)

load_dotenv()

BASE_DIR: Path = Path(__file__).resolve().parent  # '.../web'

DEBUG: Final[bool] = False if environ['DEBUG'].lower() == 'false' else bool(environ['DEBUG'])

HOST: Final[str] = environ['HOST']
PORT: Final[int] = int(environ['PORT'])

SSL_CERTFILE: Final[Path] = Path(environ['SSL_CERTFILE'])
SSL_KEYFILE: Final[Path] = Path(environ['SSL_KEYFILE'])


