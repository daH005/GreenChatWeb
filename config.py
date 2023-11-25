from os import environ
from dotenv import load_dotenv  # pip install python-dotenv
from typing import Final

__all__ = (
    'DEBUG',
    'HOST',
    'PORT',
)

load_dotenv()
# Флаг для режима тестирования.
DEBUG: Final[bool] = False if environ['DEBUG'].lower() == 'false' else bool(environ['DEBUG'])
# Хост, на котором работает сайт.
HOST: Final[str] = environ['HOST']
# Порт для подключения к сайту.
PORT: Final[int] = int(environ['PORT'])
