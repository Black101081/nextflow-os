# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set NODE_ENV production để Vite build tối ưu
ENV NODE_ENV=production
ENV VITE_DOCKER=true
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copy tệp cấu hình nginx tùy biến để hỗ trợ React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy kết quả build vào thư mục của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
