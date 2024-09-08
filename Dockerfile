FROM python:3.11

COPY ./* /web
WORKDIR /web

RUN apt update
RUN pip3 install -r requirements.txt

ENV PYTHONPATH=/web

CMD ["python3", "main.py"]
