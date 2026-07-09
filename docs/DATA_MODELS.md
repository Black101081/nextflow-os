# NextFlow OS - Data Models

Toàn bộ Backend sử dụng PostgreSQL với schema `public`. Mọi Tenant data được chia sẻ trong cùng cơ sở dữ liệu (Multi-Tenant) và phân quyền dựa vào `tenant_id` (Row-Level Security / Application logic).

## 1. Auth & Users
- `users`: Quản lý danh tính
  - `id` (UUID, PK)
  - `tenant_id` (UUID)
  - `email` (String)
  - `password_hash` (String)
  - `role` (Enum: `PLATFORM_ADMIN`, `SME_LEADER`, `TENANT_STAFF`, v.v.)
  - `created_at`, `updated_at`

## 2. Meta Entity (No-Code Schema)
- `entity_definitions`: Khai báo Schema cho dữ liệu động
  - `id` (UUID, PK)
  - `tenant_id` (UUID) - null nếu là system entity
  - `system_name` (String)
  - `display_name` (String)
  - `schema_json` (JSONB) - Chứa JSON Schema (ví dụ: các field cần có, required)
  - `is_system` (Boolean)
  - `created_at`, `updated_at`

- `entity_records`: Các bản ghi dữ liệu tuân theo `entity_definitions`
  - `id` (UUID, PK)
  - `tenant_id` (UUID)
  - `entity_id` (UUID, FK -> `entity_definitions.id`)
  - `data_json` (JSONB) - Chứa payload dữ liệu thực tế
  - `version` (Int)
  - `created_at`, `updated_at`, `created_by`

## 3. Workflow (No-Code Process)
- `workflows`: (Dự kiến) Lưu trữ định nghĩa quy trình DAG.
- `tasks`: (Dự kiến) Các bước (nhiệm vụ) phát sinh từ các Workflow.

Mọi bảng đều phải chứa các trường chuẩn `id` (uuid `uuid_generate_v4()`), `created_at` (timestamptz) và `updated_at`.
Cấm tự động insert dữ liệu giả trong các file `init_schema.sql` (trừ tài khoản root admin mặc định).
