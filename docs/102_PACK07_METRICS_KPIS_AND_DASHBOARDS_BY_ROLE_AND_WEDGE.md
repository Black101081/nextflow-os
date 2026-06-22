# Nextflow OS – Pack 07 Metrics, KPIs and Dashboards by Role and Wedge

**Document ID:** 102_PACK07_METRICS_KPIS_AND_DASHBOARDS_BY_ROLE_AND_WEDGE  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  

## Cross-pack references

- Xem **000** để hiểu phân biệt metric vs KPI vs insight.  
- Xem **101** để biết các fact/dim tables chứa dữ liệu cho từng KPI.  

## 1. Wedge CS / Customer Success

**KPIs chính:**

- First Response Time (FRT)  
- Average Resolution Time (ART)  
- SLA Hit Rate (%)  
- CSAT Score  
- Backlog size  
- Escalation Rate  
- Customer Health Score (xem Pack 08 – C1 cho version intelligence)  

**Dashboards đề xuất:**

- CS Daily Ops: backlog, SLA risk hôm nay, tickets đến hạn.  
- CS Weekly Review: trend SLA hit rate, CSAT, escalations.  
- CS Manager: so sánh hiệu suất agents, ưu tiên queue.  

## 2. Wedge Operations / Back-office

**KPIs chính:**

- Work item throughput (items/ngày)  
- Queue length & aging  
- Exception rate (%)  
- Automation rate (%)  
- Processing time (mean, p95)  
- SLA breach rate  

**Dashboards đề xuất:**

- Ops Realtime: queue snapshot, in-flight, sắp breach.  
- Ops Weekly: throughput trend, automation impact, exceptions.  

## 3. Wedge Finance / Billing / AR

**KPIs chính:**

- Invoice aging (0–30, 31–60, 60+ days)  
- Collection rate (%)  
- Days Sales Outstanding (DSO)  
- Exception / dispute rate  

**Dashboards đề xuất:**

- AR Aging Dashboard: phân phối hóa đơn theo tuổi nợ.  
- Finance Weekly: collection trend, DSO.  

## 4. Leadership / Executive

**KPIs chính:**

- Cross-wedge SLA performance  
- CSAT & NPS  
- Revenue at risk (từ AR)  
- Incident frequency & severity  

**Dashboards đề xuất:**

- Executive Scorecard: 1 trang tóm tắt toàn bộ wedges.  
- Monthly Business Review: trends 3–6 tháng, benchmarks, cải tiến.  
