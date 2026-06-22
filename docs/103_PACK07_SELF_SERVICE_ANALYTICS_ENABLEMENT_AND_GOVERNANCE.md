# Nextflow OS – Pack 07 Self-Service Analytics Enablement and Governance

**Document ID:** 103_PACK07_SELF_SERVICE_ANALYTICS_ENABLEMENT_AND_GOVERNANCE  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  

## 1. Mục tiêu

Giúp tenants tự khám phá dữ liệu mà không phá vỡ governance: ai được dùng dataset nào, khi nào dùng dashboard chuẩn, khi nào tự phân tích.

## 2. Mô hình self-service

- **Layer 1 – Dashboards chuẩn**: mọi users đếu thấy, không cần SQL.  
- **Layer 2 – Curated explorer**: các team lead/analyst có thể drill-down và tạo views tùy chỉnh trong certified datasets.  
- **Layer 3 – Advanced analytics**: BI/Data roles có thể dùng SQL/Python/notebooks trực tiếp trên raw tables có governed access.  

## 3. Access control model

- Datasets được gán **sensitivity tier** (Public / Internal / Confidential / Restricted).  
- Roles trong tenant có access tương ứng với tier.  
- Certified datasets được mark rõ để phân biệt với ad-hoc tables.  

## 4. Governance guard-rails

- Mọi dashboard public được review định kỳ bởi Data Steward.  
- Ad-hoc queries trên Restricted data cần approval.  
- Audit log cho mọi truy vấn nhạy cảm.  
