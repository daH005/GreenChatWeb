FROM python:3.11

COPY ./ /web
WORKDIR /web

RUN apt update
RUN pip3 install -r requirements.txt

RUN apt install -y nodejs=18.19.0+dfsg-6~deb12u2 npm=9.2.0~ds1-1
RUN npm install -g -y typescript
RUN tsc -p ./ts

ENV PYTHONPATH=/web

CMD ["python3", "main.py"]
