from selenium.webdriver.remote.webdriver import WebDriver, BaseOptions
from selenium.webdriver.common.service import Service
from selenium.webdriver import Chrome, ChromeService, ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType
from typing import Callable, Final
from enum import StrEnum

from web.config import HOST, PORT
from web.endpoints import Url

__all__ = (
    'WEBSITE_URL',
    'FullUrl',
    'driver',
)

host: str = HOST.replace('0.0.0.0', 'localhost')
WEBSITE_URL: Final[str] = f'http://{host}:{PORT}'


class FullUrl(StrEnum):
    MAIN = WEBSITE_URL + Url.MAIN
    REG = WEBSITE_URL + Url.REG
    LOGIN = WEBSITE_URL + Url.LOGIN


def _make_driver(webdriver_factory: Callable,
                 options_factory: Callable,
                 service_factory: Callable,
                 webdriver_manager_factory: Callable,
                 **webdriver_manager_kwargs,
                 ) -> WebDriver:
    options: BaseOptions = options_factory()

    path: str = webdriver_manager_factory(**webdriver_manager_kwargs).install()
    service: Service = service_factory(executable_path=path)

    driver_: WebDriver = webdriver_factory(options=options, service=service)
    return driver_


def _make_chrome_options() -> ChromeOptions:
    options: ChromeOptions = ChromeOptions()
    options.add_argument('--remote-debugging-port=9222')  # ToDo: check on windows
    return options


_chromium_driver: Chrome = _make_driver(
    webdriver_factory=Chrome,
    options_factory=_make_chrome_options,
    service_factory=ChromeService,
    webdriver_manager_factory=ChromeDriverManager,
    chrome_type=ChromeType.CHROMIUM,
)

driver = _chromium_driver
