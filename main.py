from flask import (
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
from web.enums import Url, TemplateNames

app: Flask = Flask(__name__)


@app.errorhandler(HTTPException)
def handle_exception(exception: HTTPException) -> str:
    return render_template(TemplateNames.ERROR, status=exception.code)


@app.route(Url.LOGIN, methods=[HTTPMethod.GET])
def login() -> str:
    return render_template(TemplateNames.LOGIN)


@app.route(Url.MAIN, methods=[HTTPMethod.GET])
def main() -> str:
    return render_template(TemplateNames.MAIN)


if __name__ == '__main__':
    app.run(HOST, PORT, debug=DEBUG)
