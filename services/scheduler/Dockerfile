FROM python:3.12-slim
WORKDIR /app
COPY services/scheduler/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY services/scheduler /app/services/scheduler
WORKDIR /app/services/scheduler
CMD ["python", "-m", "app.main"]

