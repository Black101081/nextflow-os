# Nextflow OS – Pack 07 Data, Analytics and Insights Overview and Strategy

**Document ID:** 100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Data & Analytics / Platform  

## Cross-pack references

- Xem **000 Global Glossary and Naming Conventions** để tra cứu thuật ngữ (tenant, wedge, fact, metric, KPI, insight...).  
- Xem **001 OS Master Index and Reading Map** để biết vị trí Pack 07 trong toàn bộ Nextflow OS.  

## 1. Mục tiêu Pack 07

Pack 07 định nghĩa **lớp Data, Analytics and Insights** của Nextflow OS: cách dữ liệu được mô hình hoá, lưu trữ, đo lường, hiển thị và vận hành để SMEs có thể nhìn thấy, hiểu và cải thiện vận hành.

Nếu Pack 02–04 nói "đây là nền tảng" và Pack 05–06 nói "chúng ta govern & risk thế nào", thì Pack 07 trả lời:

> **Dữ liệu lõi và các phép đo chuẩn của Nextflow OS là gì, chúng được mô hình hoá ra sao, và SMEs nên dùng chúng như thế nào trong dashboards, reviews và cải tiến liên tục?**

## 2. Nguyên tắc thiết kế analytics cho SMEs

- **Simple first**: ưu tiên các KPIs đơn giản, rõ nghĩa, trước khi nghĩ đến mô hình phức tạp.  
- **Actionable**: mọi insight nên dẫn đến action rõ ràng.  
- **Wedge-aware**: mỗi wedge (CS, Ops, Finance…) có bộ KPIs và dashboard riêng.  
- **Governed**: data có owner, quality SLA, và access control rõ ràng.  
- **Evolvable**: analytics mở đầu ở core, sau đó phát triển sang advanced analytics và intelligence (Pack 08).  

## 3. Các wedges và roles chính

- **Operations/Back-office**: throughput, SLA, exception rate, automation rate.  
- **CS / Customer Success**: CSAT, health score, response time, churn signal.  
- **Finance / Billing / AR**: invoice aging, collection rate, revenue trends.  
- **Leadership**: cross-wedge KPIs, trends, benchmarks.  

## 4. Maturity path của Analytics trong Nextflow OS

| Level | Mô tả |
|-------|--------|
| L1 – Descriptive | Dashboards cơ bản, KPIs theo wedge |
| L2 – Diagnostic | Drill-down, root cause, so sánh trends |
| L3 – Self-service | Tenants tự tạo báo cáo, khung governed |
| L4 – Predictive | Forecasting, risk scoring (chuyển sang Pack 08) |

## 5. Liên kết với các packs khác

- Với Pack 06: incidents & risk gắn vào facts và metrics để thấy impact và ưu tiên xử lý.  
- Với Pack 08: feature layer và models sử dụng schema & KPIs từ Pack 07.  
- Với Pack 09: marketplace assets (dashboard packs, analytics extensions) dựa trên schema & KPIs chuẩn của Pack 07.  
