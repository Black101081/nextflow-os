FROM python:3.12-slim

WORKDIR /app

# Cài đặt dependencies hệ thống (libpq cho psycopg2)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Mặc định: chạy ETL runner liên tục
CMD ["python", "etl_runner.py"]
