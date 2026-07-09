# Kế hoạch Sản xuất Nextflow OS – Phase 1: First Wedge Core Service

**Document ID:** 003_OS_PRODUCTION_PHASE_1_IMPLEMENTATION_PLAN  
**Pack:** 00 — Global System Framework & Glossaries  
**Version:** 1.0  
**Status:** Approved  
**Primary Owner:** Lead Product Engineer / AI Agent Antigravity  
**Dependent Packs:** 02 Core Platform & Data, 04 Orchestration & Work Management, 05 Integration & Extensibility  

---

Kế hoạch này mô tả chi tiết phương án kỹ thuật để bắt đầu lập trình và sản xuất **Lát cắt Năng lực Đầu tiên (First Wedge Capability Slice)** của Nextflow OS theo tiêu chuẩn sản xuất phần mềm cao nhất: **Không dùng dữ liệu giả (Zero-Mock), Kiểm thử hướng phát triển (TDD), và Cách ly dữ liệu tuyệt đối (Tenant Isolation)**.

---

## 1. Lựa chọn Công nghệ (Production Tech Stack)

Để thực thi đúng các đặc tả SDK, Connectors và API đã viết trong tài liệu thiết kế, chúng tôi lựa chọn bộ công nghệ sau:

* **Backend Engine:** Node.js (TypeScript) + Express.
  * *Lý do:* Phù hợp nhất để viết các Web SDK và xử lý Iframe Handshake thời gian thực (TypeScript/React).
* **Database Engine:** PostgreSQL (Phiên bản 15+).
  * *Lý do:* Hỗ trợ chuẩn ACID, kiểu dữ liệu JSONB mạnh mẽ để lưu trữ cấu hình bán cấu trúc của Work Items và Connectors.
* **ORM / Query Builder:** `node-postgres` (pg pool) kết hợp Raw SQL Queries.
  * *Lý do:* Đảm bảo kiểm soát tuyệt đối hiệu năng SQL và đánh chỉ mục (indexes), không bị che giấu bởi các thư viện ORM phức tạp.
* **Testing Framework:** Jest + Supertest (Dành cho Unit & Integration Testing).
* **Containerization:** Docker & Docker Compose (Dành cho việc chạy PostgreSQL thật cục bộ).

---

## 2. Cấu trúc Thư mục Codebase đề xuất

Chúng tôi sẽ khởi tạo cấu trúc thư mục tiêu chuẩn doanh nghiệp cho phần Backend Core:

```text
nextflow-os/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình kết nối Database, Keys
│   │   ├── controllers/     # Logic xử lý HTTP Requests
│   │   ├── middleware/      # Auth & Tenant Isolation Checkers
│   │   ├── routes/          # Khai báo các API Endpoints
│   │   ├── services/        # Lõi logic (Routing, SLA engine)
│   │   └── app.ts           # Điểm khởi đầu ứng dụng (App entry point)
│   ├── tests/               # Bộ Integration Tests cho các APIs
│   │   ├── integration/
│   │   └── setup.ts
│   ├── database/
│   │   ├── migrations/      # Các file SQL khởi tạo cấu trúc bảng
│   │   └── seeds/           # Các script nạp dữ liệu nghiệp vụ thật
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docker-compose.yml       # Khởi động PostgreSQL container local
└── README.md
```

---

## 3. Các bước thực hiện chi tiết (Phase 1)

### Bước 1: Thiết lập hạ tầng và Database Local
* Khởi tạo file [docker-compose.yml](file:///C:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/docker-compose.yml) để dựng container PostgreSQL.
* Viết file migrations SQL đầu tiên để dựng schema `nf_core` (dựa trên [Doc 16](file:///C:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/docs/16_PACK02_CORE_DATABASE_SCHEMA_AND_DDL.md)).

### Bước 2: Cài đặt và cấu hình Node.js TypeScript Backend
* Tạo `package.json`, cài đặt các dependencies (`express`, `pg`, `bcrypt`, `dotenv`, `typescript`, `jest`).
* Cài đặt file kết nối db pool hỗ trợ tự động kết nối lại khi rớt mạng.

### Bước 3: Viết Integration Tests trước (TDD)
* Viết các bộ kiểm thử cho 2 luồng nghiệp vụ cốt lõi:
  1. **Luồng Xác thực & Tenant Isolation:** Đảm bảo request không có Header hợp lệ sẽ bị chặn.
  2. **Luồng CRUD Work Items:** Tạo, Claim, và Complete một nhiệm vụ thực tế trong DB.

### Bước 4: Lập trình Logic APIs & Middleware
* Viết middleware `tenantIsolation.ts` để tự động lọc và kiểm soát `tenant_id`.
* Lập trình các controller xử lý Work Items, Queues và Users.
* Chạy kiểm thử tự động, tối ưu hóa code cho đến khi **100% tests Passed**.

---

## 4. Kế hoạch Kiểm tra & Nghiệm thu (Verification Plan)

### Kiểm thử Tự động (Automated Testing)
Chúng tôi sẽ chạy bộ test tự động bằng lệnh:
```bash
npm run test
```
* **Tiêu chí nghiệm thu:**
  * 100% các bài test của luồng API (CRUD Work items, Routing logic, SLA breaches, Tenant Isolation) phải vượt qua.
  * Điểm Test Coverage đạt trên 85% dòng code.

### Kiểm thử Thủ công (Manual Verification)
* Chạy trực tiếp các lệnh `curl` gửi HTTP request có payload thực tế đến server localhost để kiểm tra phản hồi JSON và mã lỗi HTTP.
* Quét trực tiếp cơ sở dữ liệu PostgreSQL cục bộ để xác nhận dữ liệu đã được ghi thật và mã hóa mật khẩu/credentials đúng chuẩn.
