# Base image
FROM python:3.10-slim
WORKDIR /app
COPY ./app.py /app
RUN pip install fastapi Pillow uvicorn tritonclient[all] qdrant_client torchvision
COPY . .
EXPOSE 5000
WORKDIR /app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]