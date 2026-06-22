# Nextflow OS – Pack 09: Extension Model and Runtime

**Document ID:** 141_PACK09_EXTENSION_MODEL_AND_RUNTIME  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform / Architecture  
**Related docs:** 140 Overview, 142 Catalog Model, 145 Ops & SLA

---

## 1. Mục tiêu

Định nghĩa cách assets/extensions chạy trên Nextflow OS mà không làm vỡ core platform.

## 2. Extension model

Một extension có thể mở rộng ở các lớp sau:
- **UI extension** – thêm dashboard widget, side panel, custom page.
- **Workflow extension** – thêm trigger, action, automation template.
- **Data extension** – thêm connector, ingestion flow, derived datasets.
- **Intelligence extension** – thêm scoring logic, recommendation pack, assistant prompt pack.

## 3. Runtime principles

1. **Isolation** – extension không được access vượt phạm vi tenant và permission được cấp.
2. **Versioned contracts** – mọi APIs/hooks phải versioned để tránh breaking changes.
3. **Permission-aware** – extension chỉ thấy dữ liệu mà user/tenant có quyền thấy.
4. **Observability** – extension phải emit logs, metrics, health signals.
5. **Graceful failure** – extension lỗi không được kéo sập core workflow.

## 4. Hooks and surfaces

| Surface | Ví dụ hook |
|---------|------------|
| UI | account_sidebar_tab, dashboard_widget, command_palette_action |
| Workflow | on_ticket_created, on_sla_breach, on_invoice_overdue |
| Data | connector_sync_job, dataset_transform, feature_enrichment |
| Intelligence | score_provider, recommendation_provider, assistant_skill |

## 5. Packaging model

Mỗi extension/asset nên có:
- Manifest (`asset.yaml` hoặc tương đương)
- Metadata (name, version, owner, permissions, dependencies)
- Runtime package (code/config/templates)
- Review artifacts (security, privacy, compatibility)

## 6. Dependency rules

- Asset có thể phụ thuộc vào core platform capabilities và assets khác, nhưng dependency graph phải rõ ràng.
- Không cho phép circular dependencies.
- Dependency version ranges phải explicit.

## 7. Safe execution model

- Long-running jobs phải có timeout.
- Network egress phải được kiểm soát theo policy.
- Secrets phải dùng secret manager, không hard-code trong asset package.
- Extension execution cần audit trail cho actions quan trọng.
