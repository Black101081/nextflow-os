# Nextflow OS – Pack 09: Marketplace Operations and SLA

**Document ID:** 145_PACK09_MARKETPLACE_OPERATIONS_AND_SLA  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform Ops / Partnerships / Support  
**Related docs:** 144 UX & Policies, 146 Review Checklist

---

## 1. Mục tiêu

Định nghĩa cách vận hành marketplace như một capability sản phẩm có SLA, review queue và incident handling rõ ràng.

## 2. Operational responsibilities

| Function | Owner |
|----------|-------|
| Listing review queue | Marketplace Ops |
| Security review coordination | Security / Platform |
| Partner communication | Partnerships |
| Incident triage | Support / On-call |
| Deprecation management | Product + Platform |

## 3. Suggested SLAs

| Loại việc | SLA mục tiêu |
|-----------|-------------|
| Initial listing response | 3 business days |
| Simple update review | 2 business days |
| Security issue acknowledgement | 24 hours |
| Critical asset takedown | < 4 hours |
| Partner incident first response | 4 business hours |

## 4. Incident handling

- Nếu asset gây outage hoặc security risk: disable/takedown ngay.
- Notify affected customers nếu asset đang installed và bị critical issue.
- Post-mortem bắt buộc cho incidents severity high trở lên.

## 5. Deprecation process

1. Announce deprecation với timeline rõ ràng.
2. Cung cấp migration path hoặc replacement asset nếu có.
3. Mark listing as deprecated trong catalog.
4. Sau deadline, disable new installs; sau grace period có thể remove.

## 6. Metrics để vận hành marketplace

- Time to approve listings
- Update review lead time
- % listings pass review first time
- Install count / uninstall rate
- Active assets by tenant
- Incident count by asset / partner
