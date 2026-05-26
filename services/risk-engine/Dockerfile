FROM python:3.12-slim
WORKDIR /app
ENV PYTHONPATH=/app/packages/common-py:/app/services/risk-engine
COPY services/risk-engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY packages/common-py /app/packages/common-py
COPY services/risk-engine /app/services/risk-engine
WORKDIR /app/services/risk-engine
CMD ["python", "-m", "app.main"]
