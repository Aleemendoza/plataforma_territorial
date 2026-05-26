FROM python:3.12-slim
WORKDIR /app
ENV PYTHONPATH=/app/packages/common-py:/app/services/alert-engine
COPY services/alert-engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY packages/common-py /app/packages/common-py
COPY services/alert-engine /app/services/alert-engine
WORKDIR /app/services/alert-engine
CMD ["python", "-m", "app.main"]
