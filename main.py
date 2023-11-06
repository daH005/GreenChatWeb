from flask import (  # pip install flask
    Flask,
    render_template,
)
from http import HTTPMethod

from config import (
    HOST,
    PORT,
)
from endpoints import EndpointName, Url
from templates import TemplateName

app: Flask = Flask(__name__)


@app.route(Url.LOGIN, endpoint=EndpointName.LOGIN, methods=[HTTPMethod.GET])
def login() -> str:
    """Страница авторизации."""
    return render_template(TemplateName.LOGIN)


@app.route(Url.MAIN, endpoint=EndpointName.MAIN, methods=[HTTPMethod.GET])
def main() -> str:
    """Страница мессенджера."""
    return render_template(TemplateName.MAIN)


if __name__ == '__main__':
    app.run(HOST, PORT, debug=True)
