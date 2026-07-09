# Implementation Plan: SME Operational Reports & Health Dashboard

This plan outlines the design and implementation of detailed operational reports, health monitoring metrics, and platform configuration parameters for individual SMEs (Tenants) within the Platform Admin workspace ([PlatformAdmin.tsx](file:///c:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/frontend/src/apps/platform/pages/PlatformAdmin.tsx)).

---

## 1. Requirements & Features

### A. SME Operational Reports & Health Modal/Drawer
Clicking on a Tenant row in the "Giám sát & Sức khỏe (Health)" tab will open an interactive, glassmorphic modal containing:
1. **Performance Trend Chart**: A Recharts `AreaChart` visualizing the tenant's API request volume vs. error rate over the last 24 hours.
2. **Resource Footprint**:
   - Database Connection Pool (active/idle count).
   - Storage utilization (e.g., `1.4 GB / 10 GB` standard storage limit).
   - Redis cache efficiency (hits/misses).
3. **Ledger & Audit Status**:
   - EVM Blockchain Anchor: Total anchored blocks, last transaction hash on U2U network, and status verification.
   - Latest task exceptions logs.

### B. Extended Platform Config Parameters (SME Controls)
Enhance the "Cấu hình Nền tảng (Config)" tab to allow configuring:
1. **Quota & Rate Limits**:
   - Max file storage quota (GB) per subscription tier.
   - Global rate limit (requests/min) per tenant.
2. **Feature Access Toggles**:
   - Enable/Disable AI Assistants & RAG.
   - Enable/Disable Omni-channel Chat.
   - Enable/Disable custom app publisher capabilities.
3. **Threshold Alerts**:
   - Error rate alert threshold (e.g., warning if error rate > 5%).
   - Automatic Tenant quarantine/suspension toggle if security threats are detected.

---

## 2. Proposed Changes

### Frontend Component

#### [MODIFY] [PlatformAdmin.tsx](file:///c:/Users/Black/Downloads/NextFlow%20OS/nextflow-os/frontend/src/apps/platform/pages/PlatformAdmin.tsx)
- Add state to track selected tenant for detailed reports: `selectedTenantForReport: Tenant | null`.
- Add state for new platform configuration parameters:
  - `storageQuotaGb`
  - `rateLimitPerMin`
  - `enableAiAssist`
  - `enableOmniChat`
  - `alertThresholdPct`
- Build a slide-out drawer/modal `.modal-glass` displaying the detailed charts, database metrics, and U2U blockchain transaction state.
- Update UI rendering for the `health` tab to support active row clicking and row highlights.
- Update UI rendering for the `config` tab to present the new form fields in a premium 2-column layout.

---

## 3. Verification Plan

### Automated Tests
- Vite compilation: Run `docker compose up -d --build frontend` to verify that there are no syntax or type errors in `PlatformAdmin.tsx` and related components.

### Manual Verification
- Access the platform admin portal: `http://localhost:8081/platform/admin` or `http://platform.localhost:8081/platform/admin`.
- Navigate to the **Health** tab:
  - Click on a Tenant row and confirm the slide-out drawer opens.
  - Verify that the Recharts AreaChart loads and correctly plots the tenant-specific metrics.
  - Review blockchain audit tx hashes and resource meters.
- Navigate to the **Config** tab:
  - Modify parameters (such as storage limit, rate limit, feature toggles) and click "Lưu Cấu hình Platform".
  - Verify that a success notification is shown and parameters are saved reactive in local state.
