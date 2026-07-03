# Nextflow OS – Master Production Roadmap

**Document ID:** 004_OS_MASTER_PRODUCTION_ROADMAP  
**Pack:** 00 — Global System Framework & Glossaries  
**Version:** 1.0  
**Status:** Approved  
**Primary Owner:** Lead Product Engineer / AI Agent Antigravity  
**Dependent Packs:** All Packs (Lộ trình phát triển tổng thể cho toàn bộ dự án)  

---

## 1. Mục tiêu tài liệu

Tài liệu này xác định **Lộ trình Sản xuất Tổng thể (Master Production Roadmap)** cho Nextflow OS đi từ những bước đầu tiên đến khi vận hành go-live chính thức. Bản lộ trình này giúp:
* Hệ thống hóa quá trình lập trình sản phẩm thành **8 Phases tuần tự**, liên kết trực tiếp với đặc tả kỹ thuật của 10 Packs tài liệu thiết kế.
* Xác định rõ ràng sản phẩm đầu ra (Deliverables) cho từng giai đoạn để lập trình viên và AI Agent bám sát thực hiện.
* Định nghĩa các **Chốt kiểm định chất lượng (QA Verification Gates)** bắt buộc để nghiệm thu từng giai đoạn một cách khách quan, không lỗi, không mock.
* Cung cấp một khung thời gian logic giúp theo dõi tiến độ sản xuất tổng thể của hệ điều hành.

---

## 2. Bản đồ Lộ trình 8 Giai đoạn Sản xuất (8-Phase Master Roadmap)

```mermaid
gantt
    title Lộ trình Sản xuất Nextflow OS (Master Production Roadmap)
    dateFormat  YYYY-MM-DD
    section Core Infrastructure
    Phase 1: Core Backend & DB (XONG)     :done,    p1, 2026-07-01, 2026-07-03
    Phase 2: Web Admin UI (Frontend)      :active,  p2, 2026-07-04, 2026-07-15
    Phase 3: Mobile Ops & Offline Sync    :         p3, after p2, 20d
    section Integration & Data
    Phase 4: API Gateway & Connectors     :         p4, after p3, 15d
    Phase 5: Data Pipelines & Lakehouse   :         p5, after p4, 15d
    section Intelligence & Marketplace
    Phase 6: AI Models & RAG Assistants   :         p6, after p5, 20d
    Phase 7: Developer SDK & Marketplace :         p7, after p6, 15d
    section Launch & Ops
    Phase 8: Security & DevOps (Go-Live)  :         p8, after p7, 10d
```

---

## 3. Chi tiết các Phases và QA Gates

### PHASE 1: Core Backend & Database Foundation
* **Mục tiêu:** Thiết lập nền móng API và Cơ sở dữ liệu vận hành thời gian thực.
* **Tài liệu đặc tả áp dụng:** Pack 02, Pack 04, [Doc 16](file:///C:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/docs/16_PACK02_CORE_DATABASE_SCHEMA_AND_DDL.md), [Doc 85](file:///C:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/docs/85_PACK05_API_REFERENCE_AND_CONNECTOR_DEVELOPMENT_SPEC.md).
* **Sản phẩm đầu ra (Deliverables):**
  * Docker-compose chạy PostgreSQL database local trên cổng `5435`.
  * Bộ mã SQL Migrations tạo schema `nf_core` hoàn chỉnh.
  * Node.js TypeScript API server chạy các endpoint CRUD Work Items, Queues, Members, và User Sync.
  * Bộ Middleware kiểm soát tenant isolation và API auth.
* **QA Verification Gate (Nghiệm thu):**
  * Chạy thành công migrations tạo cấu trúc bảng vật lý.
  * Vượt qua 100% các bài test integration (`workItem` và `queueAndTenant` test suites) với zero mocks.
* **Trạng thái:** **HOÀN THÀNH (VERIFIED)**.

---

### PHASE 2: Web Admin Console UI
* **Mục tiêu:** Phát triển giao diện web cho Operator và Supervisor để tương tác trực quan với Core API.
* **Tài liệu đặc tả áp dụng:** Pack 03 (Doc 21, 24, 30, 31, 36, 38).
* **Sản phẩm đầu ra (Deliverables):**
  * Dự án React TypeScript (Vite) Frontend.
  * Màn hình Đăng nhập & Lọc Tenant.
  * Dashboard giám sát năng suất (Active tasks, Queue lengths).
  * Giao diện Queue Inbox hiển thị danh sách nhiệm vụ chưa gán và nút "Claim next task".
  * Giao diện Work Item Detail (Side Panel) xử lý đổi trạng thái task và Escalate Exception.
* **QA Verification Gate (Nghiệm thu):**
  * Giao diện phải kết nối và gọi API thật từ Backend Phase 1 (không hardcode mảng dữ liệu).
  * Robot Playwright chạy giả lập hành vi người dùng (End-to-End) trên trình duyệt thành công 100%.
* **Trạng thái:** **ĐANG THỰC HIỆN (ACTIVE)**.

---

### PHASE 3: Mobile Ops & Offline Resilience
* **Mục tiêu:** Xây dựng ứng dụng di động cho nhân viên hiện trường (Field Workers) hoạt động trong môi trường offline.
* **Tài liệu đặc tả áp dụng:** Pack 03 (Doc 22, 28, 29, 32, 35, 39, 53, 59, 150).
* **Sản phẩm đầu ra (Deliverables):**
  * Ứng dụng di động (React Native hoặc Web App PWA) kết nối SQLite cục bộ.
  * Tính năng "Morning Sync" tải cấu hình và danh sách Task trong ngày về máy.
  * Tính năng Offline Logging ghi nhận trạng thái đổi task cục bộ khi mất mạng.
  * Tính năng "Evidence Capture" nén dung lượng ảnh, đính kèm GPS + Timestamp thật và lưu cục bộ.
  * Kênh đồng bộ "Sync Center" đẩy dữ liệu ngoại tuyến lên cloud khi có mạng trở lại.
* **QA Verification Gate (Nghiệm thu):**
  * Kiểm thử giả lập ngắt mạng (Network Throttling/Offline mode) trên thiết bị di động: người dùng vẫn thao tác lưu task và chụp ảnh bình thường.
  * Bật mạng trở lại: dữ liệu tự động đồng bộ và hiển thị chính xác trên Web Admin Phase 2.

---

### PHASE 4: API Gateway & Connectors Integration
* **Mục tiêu:** Hoàn thiện cổng kết nối tích hợp an toàn và xây dựng Connector HubSpot CRM mẫu.
* **Tài liệu đặc tả áp dụng:** Pack 05 (Doc 78, 79, 80, 81, 82, 83, 85).
* **Sản phẩm đầu ra (Deliverables):**
  * Cổng API Security Gateway hỗ trợ OAuth 2.0 Client Credentials Flow (cấp JWT Token).
  * Module HubSpot Connector hoàn chỉnh lắng nghe webhook, map dữ liệu và tự động tạo Task trong Nextflow.
  * Hàng đợi xử lý lỗi tích hợp (Integration Exception Queue) và cơ chế tự động thử lại (Exponential Backoff with Jitter).
* **QA Verification Gate (Nghiệm thu):**
  * Chạy test case gửi webhook HubSpot giả lập và kiểm tra xem Postgres DB có tự động tạo ra một Work Item tương ứng với thông tin deal không.
  * Test case API Gateway chặn token hết hạn hoặc IP không nằm trong whitelist.

---

### PHASE 5: Data Pipeline, CDC & Analytics Lakehouse
* **Mục tiêu:** Xây dựng đường ống dẫn dữ liệu phân tích sang Data Lakehouse.
* **Tài liệu đặc tả áp dụng:** Pack 07 (Doc 101, 106, 107, 108).
* **Sản phẩm đầu ra (Deliverables):**
  * Bộ kết nối Debezium lắng nghe Write-Ahead Log (WAL) của PostgreSQL Core.
  * Apache Airflow DAG thực hiện ETL gom dữ liệu thô sang BigQuery (hoặc Local PostgreSQL Analytics).
  * Các SQL Views tổng hợp SLA compliance rate và queue throughput chạy trực tiếp trên Analytics DB.
* **QA Verification Gate (Nghiệm thu):**
  * Thao tác 100 tasks trên Core DB, chạy pipeline Airflow và kiểm tra xem BigQuery/Analytics DB có ghi nhận đúng 100 bản ghi thay đổi trạng thái không.
  * Chạy chốt kiểm định Data Quality (Great Expectations) báo cáo không có bản ghi nào bị lỗi logic thời gian.

---

### PHASE 6: Advanced Intelligence & RAG Assistants
* **Mục tiêu:** Triển khai các tính năng trí tuệ nhân tạo (AI/ML) hỗ trợ SMEs.
* **Tài liệu đặc tả áp dụng:** Pack 08 (Doc 122, 123, 124, 129B).
* **Sản phẩm đầu ra (Deliverables):**
  * Mô hình máy học phân loại rủi ro vi phạm SLA (SLA Risk Predictor).
  * Mô hình đề xuất phân bổ công việc (Routing Recommendation Engine).
  * Hệ thống RAG SOP Assistant truy xuất tài liệu quy trình doanh nghiệp và trả lời câu hỏi qua Chatbot UI.
* **QA Verification Gate (Nghiệm thu):**
  * Mô hình dự báo SLA đạt Precision $\ge 85\%$ và Recall $\ge 90\%$ trên tập Holdout Test.
  * Chatbot RAG đạt chỉ số Groundedness (không ảo giác) $\ge 95\%$ khi truy vấn tài liệu SOP thật.

---

### PHASE 7: Developer SDK & Extension Sandbox
* **Mục tiêu:** Mở rộng hệ sinh thái cho phép bên thứ ba viết thêm Extensions nhúng vào Nextflow UI.
* **Tài liệu đặc tả áp dụng:** Pack 09 (Doc 141, 144, 149).
* **Sản phẩm đầu ra (Deliverables):**
  * Sandbox Iframe Security container áp dụng CSP headers nghiêm ngặt.
  * Gói thư viện `@nextflow-os/extension-sdk` quản lý postMessage handshake và BroadcastChannel.
  * Cổng Marketplace Admin Portal để duyệt và tải lên tệp manifest của ứng dụng.
* **QA Verification Gate (Nghiệm thu):**
  * Chạy thử nghiệm Extension mẫu nhúng vào chi tiết Work Item, thay đổi dữ liệu trên Extension và kiểm tra xem UI Nextflow Host có tự động cập nhật đồng bộ thời gian thực không.

---

### PHASE 8: Operations, Security & DevOps (Go-Live)
* **Mục tiêu:** Triển khai sản phẩm lên môi trường Cloud, thiết lập bảo mật và cấu hình giám sát.
* **Tài liệu đặc tả áp dụng:** Pack 06 (Doc 92, 93, 94).
* **Sản phẩm đầu ra (Deliverables):**
  * CI/CD pipeline tự động hóa build/deploy bằng GitHub Actions.
  * Cấu hình HTTPS, SSL/TLS, và Web Application Firewall (WAF).
  * Hệ thống giám sát Prometheus/Grafana ghi nhận lưu lượng API và lỗi hệ thống.
  * Webhook cấu hình gửi cảnh báo lỗi sự cố trực tiếp sang Slack/PagerDuty.
* **QA Verification Gate (Nghiệm thu):**
  * Thực hiện tấn công thử nghiệm bảo mật (Penetration Testing) đạt chứng chỉ không có lỗ hổng nghiêm trọng (Critical/High).
  * Giả lập tắt server backend và kiểm tra xem hệ thống cảnh báo PagerDuty có tự động báo động tới đội ngũ kỹ thuật trong vòng 3 phút không.

---

## 4. Quản trị Tiến trình (Roadmap Governance)

1. **Nguyên tắc đóng Phase:** Một Phase chỉ được đánh dấu là `VERIFIED` (Hoàn thành) trong Nhật ký sản xuất [Doc 002](file:///C:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/docs/002_OS_PRODUCTION_RULES_AND_DEVELOPMENT_LOG.md) khi đã vượt qua toàn bộ các tiêu chí nghiệm thu của QA Verification Gate tương ứng.
2. **Quản lý thay đổi:** Nếu trong quá trình lập trình phát hiện bất kỳ điểm thiếu sót hoặc bất khả thi nào về mặt kỹ thuật, AI Agent phải dừng lại, báo cáo người dùng, cập nhật lại Kế hoạch tổng thể và các tài liệu đặc tả liên quan trước khi tiếp tục viết code.
