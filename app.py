from flask import Flask

app: Flask = Flask(__name__)


@app.route('/', methods=['GET'])
def home() -> str:
    return 'Hello World!'


@app.route('/about_us', methods=['GET'])
def about_us() -> str:
    return 'We are programmers!'


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=80,
        debug=True,
    )
