FROM python:3.11

RUN useradd -m user

WORKDIR /home/user/web
COPY ./requirements.txt .

RUN pip3 install -r requirements.txt

RUN apt update
RUN apt install -y nodejs npm
RUN npm install -g -y typescript

USER user
COPY --chown=user:user . .
RUN tsc -p ./ts

CMD ["python3", "main.py"]
