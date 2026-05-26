FROM python:3.12-slim
WORKDIR /app
ENV PYTHONPATH=/app/packages/common-py:/app/services/ingestion-service
COPY services/ingestion-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY packages/common-py /app/packages/common-py
COPY services/ingestion-service /app/services/ingestion-service
WORKDIR /app/services/ingestion-service
CMD ["python", "-m", "app.main"]
