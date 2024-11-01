FROM python:3.11

RUN useradd -m user

WORKDIR /home/user/web
COPY ./requirements.txt .

RUN pip3 install -r requirements.txt

RUN apt update
RUN apt install -y nodejs=18.19.0+dfsg-6~deb12u2 npm=9.2.0~ds1-1
RUN npm install -g -y typescript

USER user
COPY --chown=user:user . .
RUN tsc -p ./ts

CMD ["python3", "main.py"]
