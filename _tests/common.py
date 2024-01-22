from selenium.webdriver.remote.webdriver import WebDriver, BaseOptions
from selenium.webdriver.common.service import Service
from selenium.webdriver import Chrome, ChromeService, ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType
from typing import Callable, Final

from web.config import HOST, PORT

__all__ = (
    'WEBSITE_URL',
    'driver',
)

WEBSITE_URL: Final[str] = f'http://{HOST}:{PORT}'


def _make_driver(webdriver_factory: Callable,
                 options_factory: Callable,
                 service_factory: Callable,
                 driver_manager_factory: Callable,
                 **driver_manager_kwargs,
                 ) -> WebDriver:
    options: BaseOptions = options_factory()

    path: str = driver_manager_factory(**driver_manager_kwargs).install()
    service: Service = service_factory(executable_path=path)

    driver_: WebDriver = webdriver_factory(options=options, service=service)
    return driver_


_chromium_driver: Chrome = _make_driver(
    webdriver_factory=Chrome,
    options_factory=ChromeOptions,
    service_factory=ChromeService,
    driver_manager_factory=ChromeDriverManager,
    chrome_type=ChromeType.CHROMIUM
)

driver = _chromium_driver
