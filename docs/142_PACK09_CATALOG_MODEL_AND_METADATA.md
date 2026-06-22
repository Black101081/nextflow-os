# Nextflow OS – Pack 09: Catalog Model and Metadata

**Document ID:** 142_PACK09_CATALOG_MODEL_AND_METADATA  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform / Product  
**Related docs:** 141 Runtime, 144 Marketplace UX, 146 Review Checklist

---

## 1. Mục tiêu

Định nghĩa metadata model cho mọi asset được niêm yết trong catalog/marketplace.

## 2. Asset metadata schema

| Field | Bắt buộc | Mô tả |
|-------|---------|-------|
| asset_id | Yes | ID duy nhất |
| name | Yes | Tên hiển thị |
| slug | Yes | URL-friendly id |
| version | Yes | Semantic version |
| owner | Yes | Team hoặc partner sở hữu |
| publisher_type | Yes | first_party / partner / private |
| asset_type | Yes | connector / dashboard_pack / intelligence_pack / automation_bundle / app |
| short_description | Yes | Mô tả ngắn ≤ 160 ký tự |
| long_description | Yes | Mô tả chi tiết |
| icons/screenshots | Optional | Ảnh minh hoạ |
| categories | Yes | Ví dụ: CS, Finance, Ops |
| tags | Optional | Search keywords |
| pricing_model | Optional | free / paid / contact_sales |
| supported_regions | Optional | APAC, US, EU... |
| supported_tenants | Optional | public / allowlist / private |
| permissions_required | Yes | Những quyền asset cần |
| dependencies | Optional | Core/version/other assets |
| support_contact | Yes | Email hoặc URL support |
| docs_url | Optional | Link docs |
| changelog_url | Optional | Link changelog |
| review_status | Yes | draft / under_review / approved / rejected / deprecated |

## 3. Search and discovery fields

Catalog nên hỗ trợ filter theo:
- Asset type
- Category / wedge
- Industry
- Role/persona
- Publisher type
- Free/paid
- Compatibility version

## 4. Compatibility metadata

Mỗi asset phải khai báo:
- Minimum platform version
- Maximum tested platform version (nếu có)
- Required capabilities (analytics, intelligence, connector framework...)
- Optional integrations

## 5. Trust metadata

Để tăng confidence cho users, listing nên có:
- Verified badge (first-party / reviewed partner)
- Last updated date
- Install count
- Rating/review summary (giai đoạn sau)
- Security review status
- Data access summary
