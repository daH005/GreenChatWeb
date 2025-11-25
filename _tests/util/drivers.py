from selenium.webdriver import Firefox, FirefoxOptions, FirefoxService
from typing import Final
from pathlib import Path
import os

__all__ = (
    'new_driver',
)

_PROFILE_PATH: Final[Path] = Path(__file__).resolve().parent.joinpath('test_profile')


def new_driver() -> Firefox:
    return Firefox(options=_make_options())


def _make_options() -> FirefoxOptions:
    options = FirefoxOptions()
    options.add_argument('--profile')
    options.add_argument(str(_PROFILE_PATH))
    options.add_argument('--start-maximized')
    options.add_argument('--ignore-certificate-errors')
    return options
