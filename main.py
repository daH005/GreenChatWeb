from flask import (  # pip install flask
    Flask,
    render_template,
)
from werkzeug.exceptions import HTTPException
from http import HTTPMethod

from web.config import (
    DEBUG,
    HOST,
    PORT,
)
from web.endpoints import EndpointName, Url, TemplateName

app: Flask = Flask(__name__)


@app.errorhandler(HTTPException)
def handle_exception(exception: HTTPException) -> str:
    return render_template(TemplateName.ERROR, status=exception.code)


@app.route(Url.REG, endpoint=EndpointName.REG, methods=[HTTPMethod.GET])
def reg() -> str:
    return render_template(TemplateName.REG)


@app.route(Url.LOGIN, endpoint=EndpointName.LOGIN, methods=[HTTPMethod.GET])
def login() -> str:
    return render_template(TemplateName.LOGIN)


@app.route(Url.MAIN, endpoint=EndpointName.MAIN, methods=[HTTPMethod.GET])
def main() -> str:
    return render_template(TemplateName.MAIN)


if __name__ == '__main__':
    app.run(HOST, PORT, debug=DEBUG)
