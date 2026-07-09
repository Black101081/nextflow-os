# NextFlow OS - Architecture Specification

## 1. Zero-Trust Gateway & Subdomains
Hệ thống sử dụng Nginx làm Reserve Proxy/API Gateway để phân luồng request theo port (hoặc subdomain/Header), tách biệt hoàn toàn ranh giới giữa các vai trò.

- **Port 8081 / `platform`**: Layer 1 - Nền tảng quản trị của NextFlow Team (Platform Admin). Cấp phát, cấu hình các Tenant (SME) và thu phí Subscription.
- **Port 8082 / `leader`**: Layer 2 - Giao diện dành cho Chủ doanh nghiệp (SME Leader). 
  - Tại đây, Owner tự thiết kế các quy trình vận hành và cấu trúc dữ liệu theo mô hình **No-Code**.
  - Không có các chức năng vận hành trực tiếp, chỉ có màn hình Builder (Workflow Builder, Entity Builder).
- **Port 8083 / `staff`**: Layer 3 - Giao diện dành cho nhân sự của SME (Staff Workspace).
  - Không gian làm việc thuần túy để thực thi nhiệm vụ, tiếp nhận task, cập nhật trạng thái. 
  - Chỉ hiển thị các Entity Record và Task do Leader quy định.
  - Không có quyền chỉnh sửa cấu trúc (Schema).
- **Port 8084 / `customer`**: Layer 4 - Cổng cho khách hàng của SME (ví dụ: Tra cứu đơn hàng, Webhook external).

## 2. Core Engines (Backend)
- **Dynamic Entity Engine**: Quản lý Data Schema động dưới dạng JSON. Các Entity Definition được lưu trong bảng `entity_definitions`, và các Record được lưu trong `entity_records` dưới định dạng `data_json`.
- **Workflow Engine (DAG)**: Quản lý luồng xử lý. Mỗi quy trình được thiết kế dưới dạng sơ đồ Nodes & Edges (Directed Acyclic Graph).
- **Policy & Authority Engine**: Kiểm soát luồng phân quyền và phê duyệt giữa các phòng ban.

## 3. Frontend Architecture
- 1 repository React (Vite) duy nhất, nhưng được chia ra thành nhiều entrypoints (`leader.html`, `staff.html`, v.v.) và được cấu hình qua Vite Rollup.
- Sử dụng `@xyflow/react` cho các màn hình thiết kế quy trình kéo thả.
- **Strict Boundary**: Frontend không được trộn lẫn (mix) các UI components hoặc layout của Leader vào Staff và ngược lại. Khái niệm "Dashboard dùng chung" không tồn tại. Mọi data mock đều bị cấm.
