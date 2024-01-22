from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver import Chrome, ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType
from typing import Callable

__all__ = (
    'chromium_driver',
)


def _make_driver(webdriver_factory: Callable,
                 service_factory: Callable,
                 driver_manager_factory: Callable,
                 **driver_manager_kwargs,
                 ) -> WebDriver:
    path: str = driver_manager_factory(**driver_manager_kwargs).install()
    driver: WebDriver = webdriver_factory(service=service_factory(executable_path=path))
    return driver


chromium_driver: Chrome = _make_driver(
    webdriver_factory=Chrome,
    service_factory=ChromeService,
    driver_manager_factory=ChromeDriverManager,
    chrome_type=ChromeType.CHROMIUM
)
