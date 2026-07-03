# --- Stage 1: Builder ---
FROM rust:1.82-slim-bookworm AS builder

WORKDIR /app

# Cài đặt công cụ và thư viện cần thiết
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy mã nguồn
COPY . .

# Build dự án ở chế độ Release
# Lưu ý: Ta đổi target directory để tránh xung đột với cấu hình target local của Windows
RUN cargo build --release --target-dir /app/target

# --- Stage 2: Runner ---
FROM debian:bookworm-slim AS runner

WORKDIR /app

# Cài đặt thư viện SSL cần thiết cho runtime
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary từ builder
COPY --from=builder /app/target/release/nextflow-core-backend /app/nextflow-core-backend

# Copy tệp môi trường .env (nếu có) hoặc dùng ENV trong docker-compose
EXPOSE 8000

CMD ["./nextflow-core-backend"]
