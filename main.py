from flask import (  # pip install flask
    Flask,
    request,
    render_template,
    redirect,
    url_for,
    Response,
)
from http import HTTPMethod

from config import (
    HOST,
    PORT,
    HTTP_URL,
    WEBSOCKET_URL,
)
from db.models import User
from db.json_ import JSONKey
from endpoints import EndpointName, Url
from templates import TemplateName

app: Flask = Flask(__name__)


@app.route(Url.LOGIN, endpoint=EndpointName.LOGIN, methods=[HTTPMethod.GET, HTTPMethod.POST])
def login() -> str | Response:
    """При GET-методе выдаёт страницу авторизации,
    при POST - авторизует пользователя. Если авторизующие данные не верны,
    то снова перенаправляет на страницу.
    """
    if request.method == HTTPMethod.POST:
        try:
            username: str = request.form[JSONKey.USERNAME]
            password: str = request.form[JSONKey.PASSWORD]
            auth_user: User = User.auth_by_username_and_password(username=username, password=password)
        except (KeyError, PermissionError):
            return redirect(url_for(endpoint=EndpointName.LOGIN))
        redirect_ = redirect(url_for(endpoint=EndpointName.CHAT))
        redirect_.set_cookie(JSONKey.AUTH_TOKEN, auth_user.auth_token)
        return redirect_
    return render_template(TemplateName.LOGIN)


@app.route(Url.CHAT, endpoint=EndpointName.CHAT, methods=[HTTPMethod.GET])
def chat() -> str | Response:
    """Страница мессенджера. При каждом обращении проверят авторизацию
    по данным из cookie.
    """
    try:
        auth_token: str = request.cookies[JSONKey.AUTH_TOKEN]
        auth_user: User = User.auth_by_token(auth_token=auth_token)
    except (KeyError, PermissionError):
        return redirect(url_for(endpoint=EndpointName.LOGIN))
    return render_template(TemplateName.CHAT,
                           user=auth_user,
                           auth_token_cookie_key=JSONKey.AUTH_TOKEN,
                           http_url=HTTP_URL,
                           websocket_url=WEBSOCKET_URL,
                           )


if __name__ == '__main__':
    app.run(HOST, PORT, debug=True)
