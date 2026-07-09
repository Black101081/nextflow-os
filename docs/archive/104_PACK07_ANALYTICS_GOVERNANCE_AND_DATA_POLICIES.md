# Nextflow OS – Pack 07 Analytics Governance and Data Policies

**Document ID:** 104_PACK07_ANALYTICS_GOVERNANCE_AND_DATA_POLICIES  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Governance & Risk / Data & Analytics / Security  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Overview (100), 07 Data Model (101), 07 Self-Service (103)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Analytics Governance and Data Policies** cho Pack 07 – các nguyên tắc & chính sách điều chỉnh cách dữ liệu từ Nextflow OS được thu thập, lưu trữ, truy cập và chia sẻ cho mục đích analytics & reporting (internal + customer-facing).

Mục tiêu:
- đảm bảo mọi hoạt động analytics tuân theo **data governance** (access, privacy, retention, sharing) đã được thiết lập ở Packs 02 & 06;  
- xác định **ai được xem dữ liệu gì** trong analytics layer, dựa trên roles, tenants, risk tiers;  
- định nghĩa các **chính sách retention & minimization** cho dữ liệu analytics;  
- đặt khung cho việc **chia sẻ dữ liệu & insights** với khách SMEs và đối tác bên ngoài một cách an toàn.

## 2. Thesis về analytics governance trong Nextflow OS

Thesis có thể phát biểu như sau:

> **Analytics là "bản sao" của dữ liệu vận hành, nhưng không thể trở thành "lỗ hổng" cho privacy & risk. Nextflow phải đảm bảo mọi insights, dashboards và exports đều tôn trọng boundaries về tenant, vai trò, dữ liệu nhạy cảm và risk tiers – đồng thời không làm tê liệt khả năng phân tích.**

Nguyên lý:

1. **Same guardrails, different surface** – analytics phải tôn trọng các guardrails auth, tenant isolation, risk tiers giống runtime, dù là layer khác.  
2. **Data minimization** – analytics chỉ giữ & expose những dữ liệu thực sự cần cho reporting/insights, hạn chế field nhạy cảm không cần thiết.  
3. **Role & tenant-aware** – quyền xem data analytics dựa trên role (Pack 03–06) và tenant, tương tự runtime.  
4. **Risk-tier-aware** – flows Tier 3–4 (91) có policies chặt hơn trong analytics (masking, aggregation, access hạn chế).  
5. **Transparency** – có thể giải thích rõ cho SMEs và nội bộ: dữ liệu nào được dùng cho analytics, trong bao lâu, để làm gì.  
6. **Auditability** – mọi truy cập & exports dữ liệu nhạy cảm phải có dấu vết.

## 3. Phạm vi data analytics

Analytics layer gồm:
- dữ liệu trong data warehouse/lakehouse theo schema 101 (facts/dims); [code_file:479]  
- dashboards & reports (internal & customer-facing); [code_file:480]  
- self-service datasets & queries (doc 103). [code_file:481]

Phạm vi policies ở đây **không** thay thế chính sách data core của Pack 02 (PII, encryption, etc.), mà **mở rộng** sang layer analytics.

## 4. Phân loại dữ liệu theo độ nhạy

Chúng ta phân loại dữ liệu analytics thành các nhóm chính:

1. **Operational Data (Low/Medium Sensitivity)**  
   - work items (id, trạng thái, SLA metrics…);  
   - queue, work types;  
   - exceptions (không chứa PII nội dung);  
   - integration health metrics (error rates, latency…).

2. **Customer & User Data (PII/Medium-High Sensitivity)**  
   - thông tin nhận diện khách & users (id, email, tên…);  
   - metadata business của khách (industry, size…).

3. **Financial & Transactional Data (High Sensitivity)**  
   - payments, invoices, orders có giá trị tiền;  
   - bất kỳ dữ liệu nào liên quan financial flows của SME.

4. **Security & Access Data (High Sensitivity)**  
   - logs liên quan auth, permissions, access attempts;  
   - mappings user ↔ quyền, roles nhạy cảm.

5. **Risk & Governance Data**  
   - incidents, change logs, risk tiers;  
   - post-incident reviews;  
   - đôi khi chứa thông tin nhạy cảm nếu gắn với khách cụ thể.

Mỗi nhóm có **policies khác nhau** về access, retention và sharing.

## 5. Access model: ai được xem dữ liệu gì?

### 5.1 Khách SMEs

- **SME Ops & Leadership**  
  - truy cập dashboards & datasets liên quan **tenant của họ**: Work & SLA, Exceptions, Integrations, Adoption; [code_file:479][code_file:480][code_file:481]  
  - không truy cập dữ liệu tenants khác;  
  - không truy cập logs security & risk internal.  

- **SME Power User/Analyst**  
  - truy cập các **self-service datasets** được gắn nhãn "Public within tenant"; [code_file:481]  
  - có thể export aggregates; export raw rows phải hạn chế fields nhạy cảm và có limit volume.

### 5.2 Nội bộ Nextflow

- **Internal Ops & Support**  
  - truy cập operations datasets (Work & SLA, Exceptions, Integrations, Incidents & Changes) across tenants, nhưng:  
    - tuân role-based filters (chỉ tenants họ support);  
    - fields nhạy cảm (identity, content) bị masked/ẩn nếu không cần.  

- **CSM**  
  - truy cập Customer Health datasets cho tenants trong portfolio; [code_file:480][code_file:481]  
  - không truy cập security logs sâu nếu không cần.  

- **Product & Data**  
  - truy cập hầu hết aggregated datasets để phân tích usage & performance;  
  - raw sensitive data chỉ khi cần, với controls & approvals.  

- **Governance & Security**  
  - truy cập risk/governance datasets (incidents, changes, access logs);  
  - có thể truy cập detailed logs khi điều tra.

## 6. Policies về data minimization & masking

### 6.1 Data minimization trong warehouse

- Chỉ replicate vào warehouse những fields cần cho analytics;  
- Với PII (tên, email, địa chỉ,…), sử dụng **identifiers thay thế** (`user_key`, `tenant_key`) và giữ PII trong dim tables với access control chặt. [code_file:479]  
- Đối với dữ liệu nội dung (vd notes, descriptions), chỉ giữ nếu thực sự cần cho analytics; cân nhắc tokenize/anonymize.

### 6.2 Masking trong dashboards & self-service

- Datasets self-service cho SMEs **không nên** expose PII của users khác ngoài những gì họ đã thấy trong UI runtime;  
- Datasets internal nên mask/bỏ các fields nhạy cảm nếu không cần;  
- Dashboards Certified không nên hiển thị PII thô trừ khi có lý do rõ và audience hạn chế.

## 7. Policies về retention

- Retention analytics không nhất thiết giống retention operational, nhưng phải **phù hợp** với yêu cầu pháp lý & nhu cầu business.

Gợi ý khung:
- Operational facts (work, SLA, exceptions, integrations, incidents, changes): giữ 24–36 tháng để phân tích xu hướng.  
- Detailed logs (feature usage events): có thể giữ ngắn hơn (12–18 tháng) và aggregate dài hạn.  
- Security/access logs analytics: theo yêu cầu pháp lý (vd 12–24 tháng), có thể aggregate sau.  

Retention chi tiết cần được Governance & Legal điều chỉnh theo thị trường và khách hàng.

## 8. Policies về sharing & exports

### 8.1 Sharing nội bộ

- Dashboards Certified có thể share rộng nội bộ tùy dataset (ops/product/governance).  
- Exports CSV/excel từ dashboards:  
  - giới hạn rows;  
  - log ai export, khi nào, dataset nào.  
- Truyền dữ liệu analytics sang systems nội bộ khác phải:  
  - dùng connectors được approve;  
  - tôn trọng policies data minimization.

### 8.2 Sharing với SMEs

- Nextflow cung cấp dashboards & reports **trực tiếp trong sản phẩm** (Pack 03), hạn chế gửi file chứa data nhạy cảm qua email nếu không cần.  
- Khi khách yêu cầu exports lớn (vd RAW logs):  
  - cần quy trình approval;  
  - cân nhắc data minimization & anonymization;  
  - log và, nếu cần, record trong governance docs.  

### 8.3 Sharing với bên thứ ba

- Bất kỳ sharing dữ liệu analytics với đối tác bên ngoài (vd tư vấn, nhà cung cấp khác) phải:  
  - được legal/commercial approve;  
  - dùng datasets đã anonymize/mask nếu có thể;  
  - tuân theo hợp đồng data processing.

## 9. Incidents liên quan analytics data

Incidents liên quan analytics (vd leak trong reports, dashboard hiển thị sai dữ liệu tenant khác) phải được xử lý như **security/data incidents**:

- Phân loại theo doc 92 (type: security/data, severity). [code_file:452]  
- Containment:  
  - revoke access;  
  - unpublish dashboards;  
  - rotate creds/tokens của tools analytics nếu cần.  
- Resolution:  
  - sửa dataset/permissions;  
  - review logs để xác định phạm vi ảnh hưởng.  
- Communication:  
  - thông báo SMEs bị ảnh hưởng theo model 95; [code_file:455]  
- Learning:  
  - update policies & tooling (permissions, masking, audit).

## 10. Liên kết với self-service model (103)

Policies ở đây hỗ trợ và hạn chế các freedoms trong doc 103:

- Datasets self-service phải được gán nhãn sensitivity và chỉ accessible theo roles định nghĩa. [code_file:481]  
- Explorers/Publishers không được tạo dashboards Certified chứa data ngoài policies (PII không mask, cross-tenant data, security logs).  
- Curator/Data Steward có trách nhiệm review dashboards đề xuất publish theo các policies này.

## 11. Tooling & thực thi

Để policies khả thi, cần:
- Tầng permissions trong analytics tools align với roles Pack 03 & 06;  
- Views/datasets được định nghĩa rõ và gắn tag sensitivity;  
- Có logging chi tiết cho access, queries, exports;  
- Có periodic review (monthly/quarterly) của Governance & Data team về usage, incidents, compliance.

## 12. Điều kiện hoàn thành của tài liệu

Analytics Governance and Data Policies được xem là đạt yêu cầu khi:
- roles & datasets đã được phân loại rõ về access;  
- self-service & dashboards chuẩn vận hành trong guardrails này;  
- incidents liên quan analytics data ít và được xử lý theo playbook;  
- và Nextflow có thể giải thích rõ cho SMEs cách dữ liệu analytics của họ được bảo vệ và sử dụng.
