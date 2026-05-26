FROM python:3.12-slim
WORKDIR /app
ENV PYTHONPATH=/app/packages/common-py:/app/services/geo-service
COPY services/geo-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY packages/common-py /app/packages/common-py
COPY services/geo-service /app/services/geo-service
WORKDIR /app/services/geo-service
CMD ["python", "-m", "app.main"]
