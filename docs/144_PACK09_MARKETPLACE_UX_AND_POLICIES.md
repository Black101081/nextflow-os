# Nextflow OS – Pack 09: Marketplace UX and Policies

**Document ID:** 144_PACK09_MARKETPLACE_UX_AND_POLICIES  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Design / Platform  
**Related docs:** 142 Catalog Model, 145 Ops & SLA

---

## 1. UX goals

Marketplace phải giúp user:
- Discover đúng asset theo role/use case.
- Hiểu nhanh asset làm gì, cần quyền gì, có đáng tin không.
- Install/uninstall/configure asset mà không cần support nặng.

## 2. Core marketplace surfaces

| Surface | Mục tiêu |
|---------|----------|
| Home / Browse | Featured assets, categories, trending |
| Search / Filters | Tìm asset theo type/industry/role |
| Listing Detail | Mô tả, screenshots, permissions, reviews, changelog |
| Install Flow | Review permissions, dependencies, config, confirm |
| Manage Installed | Upgrade, disable, uninstall, view health |

## 3. Policy principles

1. Listing phải mô tả đúng chức năng – không oversell hoặc gây hiểu lầm.
2. Permissions phải minh bạch – user biết asset sẽ đọc/ghi gì.
3. AI-powered assets phải disclose AI usage rõ ràng.
4. Paid assets phải công khai pricing model hoặc contact path.
5. Deprecated assets phải có deprecation notice và migration guidance.

## 4. Installation UX

Install flow nên hiển thị:
- Asset name, version, publisher
- Permissions required
- Dependencies
- Data access summary
- Warnings / compatibility notes
- Confirm & rollback guidance

## 5. Uninstall / disable UX

- User phải biết uninstall sẽ ảnh hưởng gì (dashboards biến mất, workflows dừng...).
- Nên có "disable" trước khi "delete" nếu asset đang active trong workflow.
- Cần audit trail cho install/upgrade/uninstall actions.
