# Nextflow OS – Pack 09: Ecosystem and Marketplace Execution Prompts Library

**Document ID:** 148_PACK09_ECOSYSTEM_AND_MARKETPLACE_EXECUTION_PROMPTS_LIBRARY  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Platform / Partnerships  
**Related docs:** 140–147 Pack09

---

## Prompt 1: Thiết kế asset metadata schema

```
Tôi cần thiết kế metadata schema cho một asset trên marketplace của Nextflow OS.

Thông tin:
- Asset type: [connector / dashboard_pack / intelligence_pack / automation_bundle / app]
- Publisher type: [first_party / partner / private]
- Use case chính: [mô tả]

Hãy đề xuất:
1. Danh sách fields metadata bắt buộc
2. Các fields optional nên có để tăng discoverability và trust
3. Search filters / facets nên hỗ trợ trong catalog
4. Compatibility information cần lưu
```

## Prompt 2: Review một listing trước khi publish

```
Hãy review listing asset sau đây cho marketplace Nextflow OS.

[Dán metadata / mô tả listing vào đây]

Kiểm tra:
1. Metadata đã đầy đủ chưa?
2. Có claims nào gây hiểu lầm không?
3. Permissions/data access có được mô tả rõ không?
4. Có thiếu support / compatibility / deprecation information không?
5. Có nên approve, approve with conditions, hay reject?
```

## Prompt 3: Thiết kế marketplace install flow

```
Tôi cần thiết kế install flow cho một asset trong Nextflow OS marketplace.

Asset:
- Name: [tên]
- Type: [loại]
- Permissions required: [liệt kê]
- Dependencies: [liệt kê]
- Configuration needed: [liệt kê]

Hãy đề xuất:
1. Các bước trong install flow
2. Thông tin nào cần hiển thị ở từng bước
3. Warning/guardrails nào nên có
4. Khi nào nên cho phép rollback hoặc disable thay vì uninstall
```

## Prompt 4: Thiết kế partner tier framework

```
Tôi cần thiết kế partner tiers cho ecosystem của Nextflow OS.

Mục tiêu:
- Có lộ trình từ đối tác đăng ký cơ bản đến đối tác chiến lược
- Gắn quyền publish / featured placement / co-sell với chất lượng vận hành

Hãy đề xuất:
1. 3–4 tiers hợp lý
2. Điều kiện để vào mỗi tier
3. Quyền lợi và trách nhiệm của từng tier
4. Các chỉ số nên review mỗi quý để lên/xuống tier
```

## Prompt 5: Viết review checklist cho asset AI-powered

```
Tôi cần một checklist review cho asset có dùng AI trên marketplace Nextflow OS.

Asset loại: [intelligence_pack / assistant / QBR copilot / ...]

Hãy đề xuất checklist gồm:
1. Metadata & UX checks
2. AI disclosure requirements
3. Governance / kill switch / monitoring checks
4. Privacy & data access checks
5. Conditions để approve listing
```
