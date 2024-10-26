from selenium.webdriver import Chrome, ChromeService, ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType
import os

__all__ = (
    'new_chrome_driver',
)


def new_chrome_driver() -> Chrome:
    options: ChromeOptions = _make_chrome_options()

    chrome_type: str = ChromeType.GOOGLE
    if os.name == 'posix':
        chrome_type = ChromeType.CHROMIUM
    path: str = ChromeDriverManager(chrome_type=chrome_type).install()
    service: ChromeService = ChromeService(executable_path=path)

    return Chrome(options=options, service=service)


def _make_chrome_options() -> ChromeOptions:
    options: ChromeOptions = ChromeOptions()
    if os.name == 'posix':
        options.add_argument('--remote-debugging-port=9222')
    options.add_argument('--window-size=1600,1000')
    options.add_argument('--ignore-certificate-errors')
    return options
