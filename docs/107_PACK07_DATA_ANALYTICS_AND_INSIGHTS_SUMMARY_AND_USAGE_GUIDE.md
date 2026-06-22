# Nextflow OS – Pack 07 Data, Analytics and Insights Summary and Usage Guide

**Document ID:** 107_PACK07_DATA_ANALYTICS_AND_INSIGHTS_SUMMARY_AND_USAGE_GUIDE  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  

## Cross-pack references

- Xem **000 Global Glossary and Naming Conventions** để tra cứu thuật ngữ (tenant, wedge, fact, metric, KPI, insight...).  
- Xem **001 OS Master Index and Reading Map** để biết vị trí Pack 07 trong toàn bộ Nextflow OS.  

## 1. Pack 07 nói về điều gì?

Pack 07 định nghĩa lớp Data, Analytics and Insights của Nextflow OS. Nếu Pack 02–04 nói "đây là nền tảng" và Pack 05–06 nói "chúng ta govern & risk thế nào", thì Pack 07 trả lời:

> **Dữ liệu lõi và các phép đo chuẩn của Nextflow OS là gì, chúng được mô hình hoá ra sao, và SMEs nên dùng chúng như thế nào?**

## 2. Các tài liệu chính trong Pack 07

- **100** – Overview & Strategy  
- **101** – Data Domain Model & Analytics Schema  
- **102** – Metrics, KPIs & Dashboards by Role & Wedge  
- **103** – Self-Service Analytics Enablement & Governance  
- **104** – Data Policies, Quality & Governance  
- **105** – Analytics Operations & Runbooks  
- **109** – Analytics Execution Prompts Library  

## 3. Dùng Pack 07 như thế nào?

### Tenant admin / Business owner
- Dùng **100** để hiểu triết lý analytics: data để điều hành wedges theo bộ KPIs chung.  
- Dùng **102** để chọn bộ KPIs và dashboards chuẩn cho vai trò của mình.  
- Dùng **103** để thiết lập self-service: ai được dùng datasets nào.  
- Dùng **109** để biết hỏi gì với assistant/analytics layer.  

### Data/BI
- Dùng **101** để hiểu schema chuẩn.  
- Dùng **104** để biết data class nào nhạy cảm, quality expectations, ai là steward.  
- Dùng **105** để vận hành pipelines và xử lý incidents.  

### Product & Platform
- Dùng **100, 102** để xác định KPIs và dashboards chuẩn khi thiết kế wedges mới.  
- Dùng **101, 105** để triển khai warehouse/lakehouse tương thích OS và chạy ổn định.  

## 4. Illustrative scenario – B2B SaaS CS team dùng Pack 07

- Tenant admin & Head of CS đọc **100** để chọn wedge CS và hiểu triết lý analytics.  
- Dùng **102** để chọn bộ KPIs: response/resolution time, backlog, SLA hit rate, CSAT.  
- Data/BI dùng **101** map dữ liệu từ ticketing tool vào schema chuẩn (facts & dims).  
- Kết hợp **103** để cấu hình self-service: team leads thấy dashboards chuẩn, agents có view cá nhân.  
- Với **105**, định nghĩa cách theo dõi refresh và xử lý khi dashboard chậm/có lỗi.  
- Head of CS dùng **109** trong các buổi review tuần/tháng để hỏi assistant về SLA khu vực nào khém, nguyên nhân, khách nào có tín hiệu xấu.  
