from flask import Flask

app: Flask = Flask(__name__)


@app.route('/', methods=['GET'])
def home() -> str:
    return 'Hello World!'


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=80,
        debug=True,
    )
