# Nextflow OS – Pack 07 Governed Self-Service Analytics Model

**Document ID:** 103_PACK07_GOVERNED_SELF_SERVICE_ANALYTICS_MODEL  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Analytics / Governance & Risk / Product  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Overview (100), 07 Data Model (101), 07 KPIs & Dashboards (102)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Governed Self-Service Analytics Model** cho Pack 07 – cách Nextflow cho phép SMEs và nội bộ **tự khám phá, phân tích và xây dashboard/report** dựa trên dữ liệu Nextflow, nhưng vẫn trong **guardrails về data, risk và governance**.

Mục tiêu:
- định nghĩa các **loại người dùng analytics** (SME vs nội bộ; ops vs leader vs analyst);  
- định nghĩa các **datasets** (subject areas) mà self-service có thể dùng và mức độ nhạy cảm;  
- mô tả **quyền & vai trò** trong self-service (viewer, explorer, publisher, curator);  
- mô tả **quy trình publishing & review** cho dashboards quan trọng;  
- kết nối self-service với Pack 06 (risk tiers, data governance, incidents & changes).

## 2. Thesis về self-service analytics cho SMEs

Thesis có thể phát biểu như sau:

> **SMEs cần tự trả lời nhiều câu hỏi chi tiết về business, nhưng không có đội data lớn. Nextflow phải cho họ tự "kéo số" và tạo views phù hợp, mà không phải chờ ticket. Đồng thời, chúng ta phải giữ guardrails để họ không nhìn/xiên data nhầm (vi phạm quyền, hiểu sai số). Governed self-service là điểm cân bằng giữa chủ động và an toàn.**

Nguyên lý:

1. **Empower, không over-control** – mặc định người dùng có thể tự phân tích trong phạm vi dữ liệu của họ, trừ khi có lý do rõ để hạn chế.  
2. **Datasets chuẩn, không raw lung tung** – self-service dựa trên views/datasets được thiết kế từ schema 101, không trực tiếp truy cập raw tables.  
3. **Role-based** – ai thấy được dữ liệu gì phụ thuộc vào role & tenant; khách chỉ thấy dữ liệu của mình.  
4. **Publishing có review** – ai cũng có thể tạo dashboard cho riêng mình; nhưng dashboards chia sẻ rộng hoặc dùng cho quyết định lớn cần review & certify.  
5. **Logging & lineage** – queries & dashboards quan trọng phải có lineage rõ: dùng dataset nào, metric nào, ai tạo.  
6. **Alignment với governance** – self-service phải tuân theo data policies Pack 06 (access, privacy, retention, risk tiers).

## 3. Các loại người dùng analytics

Chúng ta phân loại theo hai trục: **SME vs nội bộ** và **level analytics**.

### 3.1 Người dùng phía SMEs

1. **SME Ops User**  
   - primary: sử dụng dashboards chuẩn (102) để vận hành;  
   - self-service: filter, drill-down, tạo saved views đơn giản.  

2. **SME Power User / Analyst nhẹ**  
   - thường là admin hoặc người thích làm số;  
   - ngoài dashboards chuẩn, có thể:  
     - dùng vài datasets chuẩn để tự build charts;  
     - lưu & chia sẻ dashboards trong tenant;  
     - xuất dữ liệu (trong giới hạn).  

3. **SME Leadership**  
   - chủ yếu sử dụng dashboards & reports chuẩn;  
   - có thể filter & view theo segment/region nội bộ.

### 3.2 Người dùng nội bộ Nextflow

1. **Internal Ops & Support**  
   - dùng dashboards chuẩn;  
   - có thể chạy ad-hoc queries trên datasets operations.  

2. **Customer Success (CSM)**  
   - dùng dashboards "Customer Health & Portfolio";  
   - build views kết hợp nhiều tenants trong portfolio;  
   - chuẩn bị reports định kỳ cho khách.  

3. **Product Managers**  
   - phân tích adoption & impact của features;  
   - chạy phân đoạn, cohort analysis;  
   - cộng tác với Data team cho câu hỏi phức tạp.  

4. **Data & Analytics Team**  
   - owners schema, datasets, metrics definitions;  
   - có full access internal datasets;  
   - quản lý certifications & governance.  

5. **Governance & Risk / Security**  
   - xem datasets & dashboards về risk, incidents, access;  
   - review data usage & compliance.

## 4. Datasets self-service: subject areas và nhạy cảm

Dựa trên schema 101, chúng ta định nghĩa **subject area datasets** cho self-service, thay vì expose toàn bộ tables.

Ví dụ subject areas:

1. **Work & SLA**  
   - nguồn: `fact_work_item`, `fact_work_item_event`, `dim_time`, `dim_queue`, `dim_work_type`. [code_file:479]  
   - dùng để phân tích workloads, SLA, cycle times.  

2. **Exceptions**  
   - nguồn: `fact_exception`, `dim_exception_type`, `dim_queue`, `dim_integration`. [code_file:479]  
   - dùng để lý giải patterns lỗi và ưu tiên cải tiến.

3. **Integrations**  
   - nguồn: `fact_integration_call`, `fact_integration_daily_health`, `dim_integration`. [code_file:479]  
   - dùng để phân tích health & usage integrations.

4. **Incidents & Changes** (internal)  
   - nguồn: `fact_incident`, `fact_change_deployment`, `dim_incident_type`, `dim_change_level`, `dim_risk_tier`. [code_file:451][code_file:452][code_file:453][code_file:479]  
   - dùng cho ops & governance analytics.

5. **Adoption & Feature Usage**  
   - nguồn: `fact_feature_usage`, `fact_tenant_adoption_snapshot`, `dim_feature`, `dim_tenant`. [code_file:479]  
   - dùng cho Product & CS.

6. **Customer Health** (per tenant)  
   - kết hợp Work & SLA, Exceptions, Integrations, Adoption;  
   - dùng cho CSM & SME leadership.

Cho mỗi dataset, chúng ta gắn **nhãn nhạy cảm** (vd Public within tenant, Internal only, Restricted) và quy định ai được truy cập.

## 5. Roles & permissions trong self-service

### 5.1 Roles logic

Các roles logic cho self-service (có thể map vào hệ role/permission Pack 03 – doc 50):

1. **Viewer**  
   - truy cập dashboards chuẩn & reports;  
   - có thể filter, drill-down;  
   - không tạo/publish dashboard mới.

2. **Explorer**  
   - truy cập datasets self-service đã được phép;  
   - tạo charts/dashboards cho bản thân hoặc team nhỏ;  
   - share trong phạm vi hẹp (tenant hoặc team nội bộ).  

3. **Publisher**  
   - ngoài abilities của Explorer;  
   - có thể **đề xuất publish** dashboard tới audience rộng (vd toàn tenant hoặc nhiều tenants nội bộ).  

4. **Curator / Data Steward**  
   - thường là người trong Data team hoặc được chỉ định;  
   - review & approve dashboards cho "certified" status;  
   - quản lý datasets & metrics definitions.

### 5.2 Mapping roles theo nhóm người dùng

- SME Ops: Viewer (đa số), một số là Explorer.  
- SME Power User: Explorer + có thể là Publisher (trong tenant).  
- SME Leadership: Viewer.  
- Internal Ops/Support: Viewer + Explorer trên ops datasets.  
- CSM: Viewer + Explorer trên customer health datasets.  
- Product: Explorer, một số là Publisher.  
- Data & Analytics: Curator + Publisher.  
- Governance & Risk: Viewer trên datasets risk; có thể có quyền Curator cho dashboards liên quan compliance.

## 6. Quy trình tạo, review & publish dashboards

### 6.1 Tạo dashboards cá nhân / team

- Bất kỳ **Explorer** nào có thể:  
  - chọn dataset được phép (vd Work & SLA, Exceptions);  
  - tạo charts & dashboards;  
  - lưu vào không gian cá nhân/team.  
- Những dashboards này **không được gắn label "official"** và không dùng trong commitments external.

### 6.2 Đề xuất publish rộng

Khi một dashboard trở nên hữu ích và được dùng rộng trong team/tenant:

1. Owner (Explorer/Publisher) **submit request** để publish cho audience rộng.  
2. Curator/Data team review:  
   - dataset & joins dùng có hợp lệ không;  
   - metrics definitions có align với chuẩn (102) không;  
   - filters & permissions có đúng (tenant, region) không;  
   - visualizations có thể gây hiểu nhầm không.  
3. Nếu ok, dashboard được:  
   - publish tới audience rộng (vd tất cả users tenant hoặc internal);  
   - gắn **badge "Certified"** hoặc "Standard";  
   - thêm vào catalog dashboards chuẩn.

### 6.3 Deprecate hoặc cập nhật dashboards

- Khi metrics definitions thay đổi đáng kể hoặc dataset cũ không còn dùng:  
  - Curator gắn trạng thái **Deprecated**;  
  - cập nhật documentation;  
  - nếu dashboard đã được khách sử dụng, CSM/Ops nên thông báo & đề xuất alternative.

## 7. Logging, lineage & audit

Để align với governance (Pack 06):

- Mọi dashboard Certified phải lưu:  
  - creator, owners;  
  - datasets & metrics used (lineage);  
  - audience;  
  - change history.  
- Queries hoặc extracts dữ liệu nhạy cảm nên được audit:  
  - ai truy cập;  
  - dataset nào;  
  - volume;  
  - mục đích business (nếu cần).  
- Điều này hỗ trợ investigation khi có incident liên quan data/leak/compliance.

## 8. Kết nối self-service với risk tiers & data policies

- Datasets liên quan flows Tier 3–4 (payments, critical orders…) nên có **restrictions mạnh hơn**:  
  - chỉ Viewer cho đa số;  
  - Explorers giới hạn;  
  - không cho export raw records nếu chứa dữ liệu nhạy cảm. [code_file:451]  
- Datasets chứa PII/nhạy cảm phải tuân theo **data policies** (Pack 06 & Pack 02–05): masking, aggregation, minimization.  
- Bất kỳ dashboard nào được dùng cho **SLA reporting hoặc governance** phải dựa trên metrics & definitions chuẩn, không tự định nghĩa.

## 9. Hỗ trợ từ UX & tooling

- Surfaces Pack 03 có thể cung cấp:  
  - "Explore" button từ dashboard chuẩn → leads tới self-service view filtered;  
  - catalog dashboards & datasets với search & filters;  
  - badges (Certified, Team, Personal).  
- Tooling cần:  
  - enforce permissions theo tenant & role;  
  - hỗ trợ review workflow (submit → review → approve → publish);  
  - hiển thị lineage metrics cho dashboard.

## 10. Anti-patterns cần tránh

1. Cho phép truy cập trực tiếp raw tables nhiều tới mức users bị overwhelm và tăng risk.  
2. Không phân biệt dashboards personal vs official – dẫn tới "số loạn".  
3. Không có Curator – mọi dashboard đều được xem ngang nhau.  
4. Lock self-service quá chặt – mọi câu hỏi đều thành data request, mất ý nghĩa self-service.  
5. Không log/audit data usage – khó điều tra khi có incident hoặc misuse.

## 11. Điều kiện hoàn thành của tài liệu

Governed Self-Service Analytics Model được xem là đạt yêu cầu khi:
- SMEs & nội bộ có thể tự tạo views hữu ích mà không cần ticket cho mọi yêu cầu nhỏ;  
- dashboards & reports trọng yếu đi qua quy trình review & certification;  
- data usage tuân theo risk tiers & data policies;  
- và mọi người hiểu rõ sự khác biệt giữa "Personal", "Team" và "Certified" dashboards.
