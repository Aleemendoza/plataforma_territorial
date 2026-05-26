FROM python:3.12-slim
WORKDIR /app
ENV PYTHONPATH=/app/packages/common-py:/app/services/api-gateway
COPY services/api-gateway/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY packages/common-py /app/packages/common-py
COPY services/api-gateway /app/services/api-gateway
WORKDIR /app/services/api-gateway
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
