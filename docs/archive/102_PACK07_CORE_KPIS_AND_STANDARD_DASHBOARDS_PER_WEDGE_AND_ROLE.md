# Nextflow OS – Pack 07 Core KPIs and Standard Dashboards per Wedge and Role

**Document ID:** 102_PACK07_CORE_KPIS_AND_STANDARD_DASHBOARDS_PER_WEDGE_AND_ROLE  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Analytics / Product / Operations  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Overview (100), 07 Data Model (101)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Core KPIs and Standard Dashboards per Wedge and Role** cho Pack 07 – tức là bộ số và views "chuẩn" mà Nextflow cung cấp cho SMEs và nội bộ để vận hành và ra quyết định.

Mục tiêu:
- chọn một bộ **KPIs cốt lõi** dựa trên schema analytics (101) và semantics Packs 02–06;  
- thiết kế **standard dashboards** cho các nhóm chính (SME Ops, SME Leadership, internal Ops, CS, Product, Governance);  
- đảm bảo mọi người nhìn **cùng một bộ số** cho cùng một câu hỏi, giảm tranh luận về số liệu.

## 2. Nguyên tắc lựa chọn KPIs & dashboards

1. **Ít nhưng quan trọng** – mỗi role nên có một số dashboard chính, không hơn 3–5, mỗi dashboard tập trung 5–10 KPIs quan trọng.  
2. **Gắn với hành động** – mỗi KPI phải dẫn tới câu hỏi "Nếu số này xấu/đẹp, chúng ta làm gì khác đi?".  
3. **Dựa trên semantics chuẩn** – sử dụng schema fact/dim trong doc 101, không "tự chế" metrics.  
4. **Wedge-aware** – KPIs có thể giống nhau across wedges, nhưng filter & context theo wedge/industry.  
5. **Role-based** – cùng dữ liệu nhưng views khác nhau theo role (Ops vs Leadership vs CS vs Product).  
6. **Multi-tenant** – dashboards phải hỗ trợ filter theo tenant, segment, region khi hợp lý.

## 3. Nhóm role & loại dashboard chính

Chúng ta tập trung vào 5 nhóm role chính:

1. **SME Operations (khách)** – người vận hành công việc hàng ngày tại SME.  
2. **SME Leadership (khách)** – chủ/giám đốc, muốn hiểu tổng thể performance & trends.  
3. **Internal Ops & Support (Nextflow)** – vận hành platform & hỗ trợ khách.  
4. **Customer Success (Nextflow)** – chăm sóc khách, reviews định kỳ.  
5. **Product & Governance (Nextflow)** – quyết định roadmap & policies.

Mỗi nhóm có 1–2 dashboards chuẩn.

## 4. Dashboards cho SME Operations

### 4.1 "Work & SLA Today" Dashboard

**Mục tiêu:** giúp SME Ops biết hôm nay phải tập trung vào đâu.

**KPl chính:**
- Tổng số work items mở theo queue/work type.  
- Số work items **gần SLA** (due trong X giờ) và **đã breach**.  
- Số exceptions mở theo type (vd `DataMismatch`, `ExternalUnreachable`).  
- Backlog trend trong 7 ngày gần nhất.  
- Automation vs manual: % work xử lý bởi automation.

**Views đề xuất:**
- Bảng queue-level với: open, due soon, overdue, exceptions, automation %.  
- Biểu đồ cột SLA breach theo work type.  
- Biểu đồ line backlog 7 ngày.

### 4.2 "Queue & Team Performance" Dashboard

**Mục tiêu:** giúp lead của SME Ops phân phối công việc & tối ưu team.

**KPIs:**
- SLA hit rate theo queue/team.  
- Average cycle time theo work type.  
- Work items per user (load) theo ngày/tuần.  
- Exceptions per 100 work items theo queue.  
- Reopen/rework rate.

**Views:**
- Heatmap SLA hit vs queue.  
- Leaderboard users theo completed work & SLA adherence.  
- Biểu đồ rework rate theo work type.

## 5. Dashboards cho SME Leadership

### 5.1 "Business Health" Dashboard

**Mục tiêu:** giúp leadership SME hiểu hệ thống đang hỗ trợ business ra sao.

**KPIs:**
- SLA hit % tổng thể theo tuần/tháng.  
- Overall backlog trend.  
- Automation coverage (% work tự động).  
- Integration health summary (errors cao bất thường).  
- Incidents count & impact (nếu có) trong kỳ.

**Views:**
- Biểu đồ line SLA hit & backlog over time.  
- Pie/bar automation vs manual.  
- Card summary incidents lớn & status.

### 5.2 "Value & Adoption" Dashboard

**Mục tiêu:** đo giá trị & adoption của Nextflow tại SME.

**KPIs:**
- Active users / total users theo tuần/tháng.  
- Number of features/module được dùng.  
- Integration enabled & usage.  
- Automation adoption index (from fact_tenant_adoption_snapshot).  
- SLA improvement vs baseline (trước khi dùng Nextflow, nếu có baseline init).

**Views:**
- Trend active users & features used.  
- Tiles: số integrations, automation index.  
- Chart cải thiện SLA theo thời gian.

## 6. Dashboards cho Internal Ops & Support (Nextflow)

### 6.1 "Platform & Integration Health" Dashboard

**Mục tiêu:** giúp Internal Ops nhìn hệ sức khoẻ kỹ thuật & integration.

**KPIs:**
- Error rate & latency per integration (Tier 3–4 focus).  
- Total `Pending External` work items per integration.  
- Retries exhausted count.  
- Incidents count by type/severity trong 7/30 ngày.  
- Change deployments count & failure rate.

**Views:**
- Table integrations với errors/latency & risk tier.  
- Bar chart incidents by type.  
- Trend change deployments vs incidents.

### 6.2 "Ops Workload & Exceptions" Dashboard

**Mục tiêu:** giúp Ops/Support phân bổ nguồn lực và dọn "rác".

**KPIs:**
- Exceptions open by type & tenant.  
- Time-to-resolution trung bình per exception type.  
- Tickets support per wedge/tenant.  
- Incidents Sev1–2 đang open/closed gần đây.  
- Work items stuck trong states bất thường (vd `Integration Error`, `Reconciliation Required`).

**Views:**
- Heatmap exceptions vs tenants/wedges.  
- List incidents gần đây với trạng thái & owner.  
- Table exception types với TTR.

## 7. Dashboards cho Customer Success (Nextflow)

### 7.1 "Customer Health" Dashboard (per tenant)

**Mục tiêu:** giúp CSM chuẩn bị review với khách.

**KPIs:**
- SLA hit %, backlog trend cho tenant.  
- Active users & features used.  
- Integration health (errors/latency) cho integrations của tenant đó.  
- Incidents affecting tenant (count, severity, duration).  
- Automation usage & exception rate.

**Views:**
- Multi-tab: Work & SLA, Adoption, Integration, Incidents.  
- Cards tóm tắt "green/amber/red" health.

### 7.2 "Portfolio Health" Dashboard (CSM portfolio)

**Mục tiêu:** giúp CSM manage nhiều khách cùng lúc.

**KPIs:**
- Health score per tenant (composite).  
- Tenants at risk (low adoption, high incidents/SLA breach).  
- Feature usage vs plan (premium features).  
- Time since last review.

**Views:**
- Bảng tenants với health scores & flags risk.  
- Filters theo segment, region, CSM.

## 8. Dashboards cho Product & Governance

### 8.1 "Product Performance & Usage" Dashboard

**Mục tiêu:** hỗ trợ Product quyết định roadmap.

**KPIs:**
- Feature usage (top & low usage).  
- Flow completion rates & cycle times per wedge.  
- Exceptions patterns hinting mapping/UX issues.  
- Adoption timeline per feature/wedge.  
- Experiment metrics (nếu chạy A/B, future).

**Views:**
- Bar chart features usage.  
- Sankey/flow view cho flows chính.  
- Exceptions & SLA impact by feature.

### 8.2 "Risk & Governance" Dashboard

**Mục tiêu:** hỗ trợ Governance & Risk theo dõi rủi ro hệ thống.

**KPIs:**
- Integrations & automations by risk tier (counts & usage).  
- Incidents by type/severity & trend; MTTR.  
- Change deployments by level (A–D) & failure rate.  
- BAU review completion (review meetings vs planned).  
- SLA performance vs commitments high-level.

**Views:**
- Risk tier heatmap (integration & automation).  
- Trend incidents & change metrics.  
- Table BAU review logs.

## 9. Liên kết KPIs với schema analytics (101)

Mỗi KPI có thể được tính từ các fact/dim trong doc 101. Ví dụ:

- **SLA hit %**: từ `fact_sla_snapshot_daily` hoặc aggregate `fact_work_item`. [code_file:479]  
- **Automation coverage**: từ `fact_work_item` (source & automation_rule_key) hoặc `fact_tenant_adoption_snapshot`. [code_file:479]  
- **Integration error rate & latency**: từ `fact_integration_call` và `fact_integration_daily_health`. [code_file:479]  
- **Incident count & MTTR**: từ `fact_incident`. [code_file:479]  
- **Change failure rate**: từ `fact_change_deployment`. [code_file:479]  
- **Exceptions & TTR**: từ `fact_exception`. [code_file:479]  
- **Adoption metrics**: từ `fact_feature_usage` & `fact_tenant_adoption_snapshot`. [code_file:479]

Điều này đảm bảo consistency: khi nói về SLA, automation, integration health, incidents, mọi role dùng cùng nguồn dữ liệu.

## 10. Hướng dẫn triển khai dashboards

- Bắt đầu với **một số wedges và tenants pilot**, triển khai các dashboards cơ bản cho SME Ops, Internal Ops, CSM.  
- Thu feedback về usefulness & hành động thực tế mà dashboards gợi ra.  
- Dần dần refine KPIs & views, nhưng **giữ schema & định nghĩa metrics ổn định**.

## 11. Điều kiện hoàn thành của tài liệu

Core KPIs and Standard Dashboards được xem là đạt yêu cầu khi:
- các roles chính có thể trả lời "dashboard chuẩn của tôi là gì";  
- số liệu trên dashboards tương ứng mapping rõ ràng tới schema 101;  
- SMEs & nội bộ sử dụng dashboards này trong BAU, review, incidents & change planning.
