# Nextflow OS – Pack 07 Data Domain Model and Analytics Schema

**Document ID:** 101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  

## Cross-pack references

- Xem **000** để hiểu các thuật ngữ fact, dim, grain, feature layer.  
- Xem **100** để hiểu nguyên tắc thiết kế analytics tổng thể.  

## 1. Data domain model

Nextflow OS định nghĩa các domain entity chính:

- **Tenant / Account** – tổ chức và thực thể con.  
- **Work Item** – ticket, case, invoice, request, incident…  
- **Workflow / SLA** – chuỗi trạng thái và thời gian chỉ tiêu.  
- **Integration / Event** – sự kiện từ các hệ thống bên ngoài.  
- **Customer / User** – đối tượng sử dụng và được phục vụ.  

## 2. Analytics schema (fact & dim tables)

### Fact tables chính

| Table | Grain | Mô tả |
|-------|-------|--------|
| `fact_ticket_day` | 1 ticket × 1 ngày | Trạng thái, SLA, agent mỗi ngày |
| `fact_interaction` | 1 tương tác (call, email, chat) | Loại, duration, outcome |
| `fact_invoice` | 1 invoice | Amount, aging, status, payment |
| `fact_customer_month` | 1 customer × 1 tháng | Health proxy metrics, usage |
| `fact_incident` | 1 incident | Severity, impact, duration, root cause |

### Dimension tables chính

| Table | Mô tả |
|-------|--------|
| `dim_customer` | Tenant, account, industry, tier, region |
| `dim_date` | Date, week, month, quarter, year |
| `dim_product` | Sản phẩm, loại, version |
| `dim_channel` | Kênh giao tiếp (email, phone, chat...) |
| `dim_user` | Agent, CS rep, manager |

## 3. Data freshness & quality expectations

- Core facts: refresh mỗi 1 giờ hoặc real-time (nếu SLA-sensitive).  
- Monthly snapshots: refresh hàng ngày sau EOD.  
- Quality SLA: null rate < 1% cho các trường key; duplicate rate = 0.  

## 4. Liên kết với Pack 08

- Feature layer của Pack 08 dựa trực tiếp trên các fact & dim tables này.  
- Mọi model và scoring logic nên reuse schema chuẩn, không tạo silo data riêng.  
