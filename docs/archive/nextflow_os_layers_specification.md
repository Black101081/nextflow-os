# BẢNG ĐẶC TẢ KIẾN TRÚC 4 TẦNG NEXTFLOW OS (CHI TIẾT VÀ CHUYÊN SÂU)

Để hệ thống **Nextflow OS (SME Business OS)** vận hành đúng chuẩn một hệ thống SaaS Multi-tenant cấp độ doanh nghiệp, kiến trúc hệ thống được chia làm 4 Tầng (Layers). Tài liệu này đặc tả chi tiết đến từng Module, Component, và loại Dữ liệu (Data) thuộc về mỗi tầng.

---

## 1. TẦNG PLATFORM ADMIN (Tầng Quản Trị Của Nextflow Team)

Tầng này là trung tâm điều khiển (Control Plane) của toàn bộ hệ thống phần mềm SaaS. Chỉ có đội ngũ sáng lập, kỹ sư hệ thống, và nhân viên hỗ trợ của Nextflow mới có quyền truy cập.

*   **Định danh URL:** `admin.nextflow.vn` hoặc `platform.nextflow.vn`
*   **Database Schema tương tác:** `nf_platform`, `nf_global_billing`, `nf_ecosystem` (Không chứa cột `tenant_id`).

### Các Component & Module chi tiết:
1.  **Tenant Provisioning Engine:**
    *   Hệ thống khởi tạo tự động (Auto-provisioning) khi có 1 SME mới đăng ký.
    *   Cấp phát `tenant_id`, tạo không gian dữ liệu cách ly (RLS - Row Level Security).
    *   Quản lý trạng thái Tenant: Active, Suspended, Churned (Khóa tài khoản khi không đóng tiền).
2.  **Global Subscription & Billing (SaaS Revenue):**
    *   Quản lý các gói cước (Pricing Plans): Free, Pro, Enterprise.
    *   Tích hợp cổng thanh toán (Stripe/Paddle) để tự động thu tiền hàng tháng của các SME.
    *   Dashboard báo cáo MRR (Monthly Recurring Revenue), Churn rate.
3.  **Marketplace Publisher (Ecosystem Hub):**
    *   Nơi các Developer của chúng ta đóng gói các cấu hình, UI form, API thành các **"Solution Packs"** (VD: Retail Pack, Booking Pack, E-learning Pack).
    *   Quét mã độc, kiểm duyệt chất lượng trước khi bấm "Publish" để hiển thị ra chợ cho SME mua.
4.  **Global AI Core & LLM Gateway:**
    *   Quản lý API Keys kết nối đến OpenAI, Anthropic, Gemini.
    *   Quản lý Prompt Engineering chung của hệ thống (Meta-prompts).
    *   Hệ thống RAG Router: Điều hướng câu hỏi của SME vào đúng Vector Database của SME đó. (AI engine thì dùng chung, nhưng Data thì tách biệt).
5.  **Global Observability & Telemetry:**
    *   Hệ thống Monitor (Prometheus, Grafana, Datadog).
    *   Xem log lỗi toàn hệ thống (API 500 errors, Database slow queries).
    *   Quản lý giới hạn tài nguyên (Rate Limiting) để tránh một SME "spam" làm sập hệ thống chung.

---

## 2. TẦNG TENANT ADMIN (Tầng Quản Trị Của Chủ Doanh Nghiệp SME)

Đây là "Buồng lái điều hành" (Executive Dashboard & Settings) dành riêng cho Giám đốc / Chủ doanh nghiệp. Nó tách biệt hoàn toàn khỏi không gian làm việc của nhân sự vận hành.

*   **Định danh URL:** `dashboard.[ten-cong-ty].nextflow.vn` hoặc `[ten-cong-ty].nextflow.vn/admin`
*   **Database Schema tương tác:** Bất cứ dữ liệu nào sinh ra ở đây đều **BẮT BUỘC** gắn kèm `tenant_id = X`.

### Các Component & Module chi tiết:
1.  **SME App Store / Integration Hub:**
    *   Chợ ứng dụng dành cho SME. Nơi chủ doanh nghiệp lướt và bấm **[Cài đặt]** các Solution Packs.
    *   Nơi nhập các thông tin nhạy cảm của doanh nghiệp: API Key VNPay, Token Giao Hàng Nhanh, Zalo OA Token, Facebook Page Token.
2.  **IAM (Identity & Access Management) - Quản trị Nhân sự:**
    *   Mời nhân viên tham gia hệ thống (gửi email invite).
    *   Cấu hình RBAC (Role-Based Access Control): Thiết lập quyền cho nhóm Sales, nhóm Kho, nhóm Kế toán. Quyết định ai được thấy màn hình nào ở Tầng 3.
3.  **Tenant Knowledge Base (Dạy AI của công ty):**
    *   Giao diện để tải lên (Upload) các file PDF, Word, URL nội bộ: Sổ tay nhân viên, kịch bản chốt sale, chính sách trả hàng.
    *   Dữ liệu này sẽ được Embed thành Vector và chỉ phục vụ riêng cho Chatbot nội bộ của công ty này.
4.  **Business Rules & SOP Builder:**
    *   Thiết lập quy tắc kinh doanh: Ví dụ "Đơn hàng > 50 triệu phải qua Giám đốc duyệt mới được xuất kho".
    *   Thiết lập thuế (VAT), loại tiền tệ (VND/USD).
5.  **Tenant Billing (Quản lý chi phí phần mềm):**
    *   Xem hóa đơn hàng tháng phải trả cho Nextflow OS.
    *   Quản lý thẻ tín dụng/phương thức thanh toán.
6.  **Executive Dashboard:**
    *   Biểu đồ BI (Business Intelligence) tổng quan: Lợi nhuận tháng, Tốc độ xoay vòng vốn, Hiệu suất nhân sự. (Dữ liệu tổng hợp mức độ cao).

---

## 3. TẦNG TENANT STAFF (Tầng Vận Hành Của Nhân Viên SME)

Đây là không gian làm việc hàng ngày của nhân viên (Operations Workspace). Giao diện ở đây chú trọng vào tốc độ nhập liệu (Data entry), tối giản, và "dọn sẵn" việc cho nhân viên.

*   **Định danh URL:** `workspace.[ten-cong-ty].nextflow.vn` hoặc truy cập qua App Mobile/Desktop.
*   **Database Schema tương tác:** Chỉ đọc/ghi các record có `tenant_id = X` và chỉ được truy cập các module được SME Admin cấp quyền.

### Các Component & Module chi tiết:
1.  **Task & Work Item Inbox:**
    *   Hàng đợi công việc (Queue). Ví dụ nhân viên Sales vào sẽ thấy: "5 tin nhắn Zalo chưa trả lời", "3 đơn hàng cần gọi điện chốt".
    *   Cơ chế Claim (nhận việc) và Complete (hoàn thành).
2.  **Core Operational Apps (Các App vận hành tùy theo Pack đã cài):**
    *   **Order App:** Màn hình tạo đơn hàng, nhập thông tin khách, chọn sản phẩm, tính tiền.
    *   **Inventory App:** Màn hình quét mã vạch kiểm kho, tạo phiếu xuất/nhập kho.
    *   **Booking App:** Màn hình xem lịch cắt tóc/làm đẹp của các thợ, đổi giờ hẹn.
    *   **CRM App:** Hồ sơ chi tiết của khách hàng (lịch sử mua hàng, công nợ).
3.  **SME AI Copilot (Trợ lý AI nội bộ):**
    *   Khung Chat (Chatbot) nằm ở góc màn hình.
    *   Nhân viên có thể hỏi: *"Quy định đổi trả hàng bị lỗi do nhà sản xuất là bao nhiêu ngày?"* -> AI sẽ lấy dữ liệu từ Tenant Knowledge Base (đã được Chủ SME up lên ở Tầng 2) để trả lời chính xác theo đúng luật của công ty.
4.  **Notifications & Alerts:**
    *   Chuông báo: "Kho hàng chi nhánh A đã hết mã SP01", "Có đơn hàng mới từ Web".

---

## 4. TẦNG END-USER (Tầng Tương Tác Khách Hàng Cuối)

Tầng này cung cấp các tiện ích Self-service cho người tiêu dùng. Dữ liệu từ tầng này sẽ chảy thẳng vào Tầng 3 (để nhân viên xử lý) và báo cáo lên Tầng 2 (cho giám đốc xem).

*   **Định danh URL:** `[ten-cong-ty].nextflow.vn` (Portal mặc định) hoặc SME trỏ Tên miền riêng (Custom Domain - VD: `datlich.spahoa.com`).
*   **Database Schema tương tác:** Thông qua các API công khai (Public APIs) hoặc API có bảo mật nhẹ, ghi dữ liệu vào Tenant X.

### Các Component & Module chi tiết:
1.  **Customer Web Portal / Storefront:**
    *   **Booking Portal:** Trang web cho phép khách hàng tự xem khung giờ trống của nhân viên và đặt lịch (Thẩm mỹ viện, Phòng khám).
    *   **Mini-Ecommerce:** Trang web giỏ hàng nhỏ để khách tự mua đồ.
2.  **Order Tracking System:**
    *   Trang web để khách hàng nhập Mã Đơn Hàng (VD: DH1029) và số điện thoại để xem trạng thái vận chuyển (Đang đóng gói, Đang giao).
3.  **Customer-facing AI Chatbot (Tùy chọn):**
    *   Một Widget chat nhúng trên Website/Fanpage của doanh nghiệp.
    *   Trả lời tự động các câu hỏi thường gặp của khách hàng: "Shop mở cửa tới mấy giờ?", "Có freeship không?" (Dựa trên tài liệu public của SME).
    *   Có tính năng tự động chuyển cho nhân viên (Hand-off to human) đẩy vào Inbox ở Tầng 3 nếu AI không trả lời được.
