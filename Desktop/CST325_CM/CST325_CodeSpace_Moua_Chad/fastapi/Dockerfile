FROM python:3.12.8

WORKDIR /fastapi

COPY ./requirements.txt /fastapi/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /fastapi/requirements.txt

COPY ./api /fastapi/api

COPY .env /fastapi/.env

EXPOSE 8000

CMD ["uvicorn", "main:app", "--port", "8000"]