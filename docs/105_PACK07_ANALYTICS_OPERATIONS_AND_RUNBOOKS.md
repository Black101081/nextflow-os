# Nextflow OS – Pack 07 Analytics Operations and Runbooks

**Document ID:** 105_PACK07_ANALYTICS_OPERATIONS_AND_RUNBOOKS  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  

## 1. Analytics operations model

Analytics được vận hành như một **product**: có owners, SLA, incidents, và change management.

- **Analytics Owner**: chịu trách nhiệm toàn bộ layer analytics (schema, dashboards, quality).  
- **Data Engineers**: vận hành pipelines, monitoring, on-call.  
- **Data Stewards**: quản lý policy và chất lượng ở domain level.  

## 2. Monitoring & alerting

- Pipeline freshness: alert nếu refresh trễ hơn SLA.  
- Quality checks: tự động check null/duplicate sau mỗi refresh.  
- Dashboard errors: alert nếu query timeout hoặc error rate > 1%.  

## 3. Incident runbook

1. Phát hiện: alert tự động hoặc user báo.  
2. Đánh giá impact: dashboard nào bị ảnh hưởng, users nào liên quan.  
3. Khắc phục nhanh: rollback, fallback data hoặc ẩn dashboard bị lỗi.  
4. RCA & fix: tìm nguyên nhân, vá pipeline, test.  
5. Post-mortem & update runbook.  

## 4. Change management

- Mọi thay đổi schema / logic chính đều cần review và thông báo trước.  
- Breaking changes: thay đổi grain, rename cột key → phải có migration plan.  
