# NextFlow OS - API Contracts

## 1. Authentication
Các hệ thống giao tiếp thông qua Bearer Token được cấp từ `POST /api/v1/auth/login`. Token mang theo Payload bao gồm `tenant_id` và `role`.

## 2. Meta Entity APIs (Dynamic Schema)
Các APIs phục vụ Entity Builder (dành cho Leader).

- `POST /api/v1/meta/entities`
  - Body: `{ "system_name": string, "display_name": string, "schema_json": object, "description": string }`
  - Chức năng: Tạo cấu trúc đối tượng dữ liệu.

- `GET /api/v1/meta/entities`
  - Query: `tenant_id`
  - Chức năng: Trả về danh sách cấu trúc (Schema) của Tenant hiện hành.

## 3. Entity Record APIs (Dynamic Records)
Các APIs dành cho Staff tương tác với dữ liệu.

- `POST /api/v1/meta/records`
  - Body: `{ "entity_id": uuid, "data_json": object }`
  - Chức năng: Lưu một bản ghi dữ liệu tuân theo Schema.

- `GET /api/v1/meta/records`
  - Query: `entity_id`
  - Chức năng: Liệt kê các bản ghi hiện có cho Entity được chỉ định. Nếu chưa có dữ liệu, trả về mảng rỗng `[]` (Tuyệt đối không trả về dữ liệu mock).

## 4. Workflow APIs
Các APIs cho Workflow Builder (dành cho Leader).

- `POST /api/v1/meta/workflows` (Dự kiến)
  - Body: `{ "system_name": string, "display_name": string, "dag_json": object }`
  - Chức năng: Tạo Quy trình luồng nghiệp vụ.
