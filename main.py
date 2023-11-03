from flask import (  # pip install flask
    Flask,
    request,
    render_template,
    redirect,
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

app: Flask = Flask(__name__)


@app.route('/login', methods=[HTTPMethod.GET, HTTPMethod.POST])
def login() -> str | Response:
    if request.method == HTTPMethod.POST:
        try:
            email: str = request.form[JSONKey.EMAIL]
            password: str = request.form[JSONKey.PASSWORD]
            User.auth(email=email, password=password)
        except (KeyError, PermissionError):
            return redirect('login')
        redirect_ = redirect('/')
        redirect_.set_cookie(JSONKey.EMAIL, email)
        redirect_.set_cookie(JSONKey.PASSWORD, password)
        return redirect_
    return render_template('login.html')


@app.route('/', methods=[HTTPMethod.GET])
def chat() -> str | Response:
    try:
        email: str = request.cookies[JSONKey.EMAIL]
        password: str = request.cookies[JSONKey.PASSWORD]
        auth_user: User = User.auth(email=email, password=password)
    except (KeyError, PermissionError):
        return redirect('/login')
    return render_template('chat.html', user=auth_user, http_url=HTTP_URL, websocket_url=WEBSOCKET_URL)


if __name__ == '__main__':
    app.run(HOST, PORT, debug=True)
