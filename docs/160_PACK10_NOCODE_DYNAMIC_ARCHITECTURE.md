# Nextflow OS – No-code Dynamic Architecture & Workflow Engine

**Document ID:** 160_PACK10_NOCODE_DYNAMIC_ARCHITECTURE  
**Pack:** 10 — No-code & Workflow Engine  
**Version:** 2.0 (The Meta-Architecture)  
**Status:** Active Core  
**Primary Owner:** Platform Architecture / Lead AI Agent  
**Prerequisite Documents:** All previous packs are superseded by this architecture for business logic.

---

## 1. Tầm Nhìn Kiến Trúc Mới (The Paradigm Shift)

Nextflow OS đã vượt qua giới hạn của một phần mềm SaaS quản lý công việc thông thường (Hardcoded Business Logic) để trở thành một **Nền tảng No-code/Low-code chuyên biệt cho SME**.

Để phục vụ hàng ngàn SME với hàng vạn nghiệp vụ "dị" khác nhau mà không cần Lập trình viên phải sửa code, kiến trúc hệ thống áp dụng triết lý **Meta-Architecture (Kiến trúc định hướng bằng Dữ liệu và Schema)**.

Kiến trúc mới được xây dựng trên 3 trụ cột:
1. **Dynamic Schema Database (PostgreSQL JSONB):** Lưu trữ mọi thứ theo dạng Thực thể động (Entities).
2. **Rust Workflow DAG Engine:** "Trái tim" vận hành, nơi các luồng nghiệp vụ do SME kéo thả được thực thi ngầm tự động với tốc độ <5ms.
3. **Schema-Driven UI:** Giao diện Frontend (React) tự động biến hình (render) thành các Form nhập liệu dựa trên JSON Schema tải từ server.

---

## 2. Core 1: Dynamic Entities Data Model (Schema `nf_meta`)

Toàn bộ các bảng nghiệp vụ tĩnh như `work_items` bị loại bỏ. Chúng được thay thế bởi cấu trúc EAV kết hợp JSONB.

### A. Định nghĩa Thực thể (Entity Definition)
Bảng `nf_meta.entities`: Quản lý các loại dữ liệu của SME.
Ví dụ: SME A định nghĩa 1 Entity tên là `Hồ sơ Khám Bệnh`.

### B. Cấu trúc Schema (Entity Schemas)
Bảng `nf_meta.entity_schemas`: Lưu trữ `JSON Schema` chuẩn của W3C.
Ví dụ: Entity `Hồ sơ Khám Bệnh` có schema yêu cầu bắt buộc trường `Tên bệnh nhân` (Type: String) và `Huyết áp` (Type: Number).

### C. Dữ liệu thực (Entity Records)
Bảng `nf_meta.entity_records`: Chứa dữ liệu thực tế do người dùng nhập. Tất cả nén vào cột `data JSONB`.
Mọi tìm kiếm và truy vấn được tối ưu bằng **GIN Indexes** trên PostgreSQL, đảm bảo hiệu năng đọc không thua kém bảng Relational tĩnh.

---

## 3. Core 2: Rust Workflow DAG Engine

Đây là cỗ máy tự động hóa, đọc các File định nghĩa Workflow (JSON DAG) của SME và chạy theo đồ thị có hướng (Directed Acyclic Graph).

### A. Các loại Nodes trong Workflow
- **Triggers (Kích hoạt):** Webhook Event, Timer (Định kỳ), Entity Created (Khi có 1 bệnh án được tạo).
- **Conditions (Điều kiện):** Rẽ nhánh luồng (Ví dụ: Trạng thái == "Đã thanh toán").
- **Actions (Hành động):** Cập nhật dữ liệu, Gửi Email, Sinh Hóa đơn.
- **Magic Nodes (Built-in Tech):**
  - **AI Nodes:** Phân loại tự động (Auto-Triage), Khuyên dùng (Recommendation), RAG Search.
  - **Blockchain Nodes:** Đóng băng hợp đồng (Anchor Hash), Kích hoạt Smart Contract giải ngân (Auto-payout).

### B. Cơ chế thực thi (Execution Runtime)
Được code 100% bằng Rust (`backend/src/services/workflow_engine`). Engine tải DAG từ Database, duyệt qua các Node theo đồ thị, giải quyết dữ liệu đầu vào/đầu ra giữa các Node bằng cơ chế biến nội bộ (State Context).

---

## 4. Core 3: Schema-Driven UI (Frontend)

React Frontend không còn chứa mã nguồn của các Màn hình Nghiệp vụ nữa.
- Ứng dụng Frontend (React) chứa một "Universal Renderer" (Trình biên dịch giao diện).
- Khi người dùng vào màn hình "Tạo Hồ Sơ Mới", Frontend gọi API: `GET /api/v1/meta/entities/ho_so/schema`
- Server trả về `JSON Schema`.
- React dùng thư viện (vd: `react-jsonschema-form`) để tự động vẽ ra giao diện nhập liệu.
- Mọi Validate như "Tên không được bỏ trống", "Tuổi phải là số" được tự động áp dụng bằng chuẩn JSON Schema mà không cần viết 1 dòng code IF/ELSE nào ở Frontend.

---

## 5. Tích hợp AI và Blockchain cho SME (Zero-Config)

Với kiến trúc này, SME không cần biết AI hay Blockchain là gì.
Họ chỉ việc chọn một **Template Giao Diện** (vd: Template Nha Khoa), Template này sẽ tự động:
1. Đẩy 1 bộ `JSON Schema` Bệnh án vào Database.
2. Đẩy 1 luồng `Workflow DAG` vào Rust Engine. (Trong luồng này đã cắm sẵn cục AI Đọc Bệnh Án).
3. Người dùng lập tức có app chạy được với Trí tuệ nhân tạo tích hợp sẵn.

> [!TIP]
> Việc xây dựng các "Template Pack" chính là chiến lược Go-To-Market cực kỳ sắc bén. Đội ngũ triển khai chỉ cần thiết kế JSON Schema và Workflow, sau đó bán cho hàng ngàn SME dưới dạng "Cài đặt 1 click".
