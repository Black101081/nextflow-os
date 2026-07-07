FROM python:3.10-slim

WORKDIR /app

# Install system libraries required by faiss-cpu and other packages
RUN apt-get update && apt-get install -y \
    libgomp1 \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies list
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the SentenceTransformer model during build to make it offline-friendly
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"

# Copy the rest of the application
COPY . .

EXPOSE 8001

CMD ["python", "main.py"]
