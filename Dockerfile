FROM python:3.11

RUN useradd -m user

WORKDIR /home/user/web

RUN apt update \
    && apt install -y --no-install-recommends nodejs npm \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g -y --no-cache typescript

COPY ./requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

USER user

COPY --chown=user:user ./static/js ./static/js
COPY --chown=user:user ./ts ./ts
RUN tsc -p ./ts

COPY --chown=user:user . .

CMD ["python3", "main.py"]
