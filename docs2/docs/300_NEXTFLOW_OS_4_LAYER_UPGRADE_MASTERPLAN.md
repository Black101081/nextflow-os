# Nextflow OS — 4-Layer Upgrade Masterplan

**Document ID:** 300_NEXTFLOW_OS_4_LAYER_UPGRADE_MASTERPLAN  
**Version:** 1.0  
**Status:** PLANNING  
**Date:** 2026-07-15  
**Primary Owner:** AI Agent Antigravity / Founder Office  
**Scope:** Toàn bộ 4 tầng: Platform Admin (8081), SME Leader (8082), Staff Workspace (8083), Customer Portal (8084)

---

## 1. Executive Summary

### 1.1 Vấn đề hiện tại

Hệ thống NextFlow OS hiện có **4 tầng** đã chạy nhưng đều ở mức **MVP cơ bản**:

| Tầng | Port | Pages hiện có | Vấn đề |
|---|---|---|---|
| **Platform Admin** | 8081 | 10 pages | Quản lý tenant cơ bản, thiếu hệ thống provisioning tự động, thiếu revenue analytics, thiếu security center |
| **SME Leader** | 8082 | 24 pages | Dashboard tĩnh, Pack Operations chỉ hiển thị queue stats, thiếu Financial Management, HR Module, CRM nâng cao |
| **Staff Workspace** | 8083 | 3 pages | Chỉ có Command Center + Chat + Checkin, thiếu Work Item Processing, Task Board, Knowledge Base, Mobile-first UX |
| **Customer Portal** | 8084 | 1 page (3 tabs) | Tracking + AI Chat + Home, thiếu Self-service, Booking, Payment, Loyalty Program, Feedback |

**Kết luận:** Với trạng thái hiện tại, KHÔNG THỂ vận hành một SME thực tế. Thiếu hoàn toàn: Quản lý tài chính, Quản lý nhân sự, CRM chuyên sâu, Inventory Management, POS/Bán hàng, Báo cáo thuế, và hàng loạt nghiệp vụ core khác.

### 1.2 Tầm nhìn nâng cấp

Chuyển NextFlow OS từ **"demo platform"** thành **"production-grade SME Operations OS"** bằng cách:

1. **Mỗi tầng phải có đủ chức năng để vận hành SME thật** — không thiếu bất kỳ nghiệp vụ nào
2. **AI không chỉ là proxy** — AI phải tham gia vào mọi quyết định nghiệp vụ
3. **Blockchain không chỉ anchor hash** — Blockchain phải audit toàn bộ critical transactions
4. **Automation Workflow không chỉ N8N-style builder** — phải auto-trigger dựa trên business events thật

---

## 2. Kiến trúc tổng thể sau nâng cấp

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: PLATFORM ADMIN (8081)                    │
│  Tenant Lifecycle • Revenue Analytics • Security Center • AI Governance  │
│  Infrastructure Monitoring • Marketplace Curation • Partner Management   │
├──────────────────────────────────────────────────────────────────────────┤
│                        LAYER 2: SME LEADER (8082)                        │
│  Executive Dashboard • Financial Management • HR & Payroll               │
│  CRM & Sales Pipeline • Inventory & Procurement • Pack Operations        │
│  Workflow Automation • Analytics & BI • Integration Hub                   │
├──────────────────────────────────────────────────────────────────────────┤
│                        LAYER 3: STAFF WORKSPACE (8083)                   │
│  Smart Task Board • Work Item Processing • Knowledge Base                │
│  Field Operations • Time Tracking • Collaboration Hub                    │
│  AI Copilot • Mobile-first PWA • Offline Sync                            │
├──────────────────────────────────────────────────────────────────────────┤
│                        LAYER 4: CUSTOMER PORTAL (8084)                   │
│  Self-Service Hub • Online Booking • Payment Gateway                     │
│  Loyalty & NFT Rewards • Order Tracking • Feedback & Review              │
│  AI Chatbot • Knowledge Base • Brand-customizable                        │
├──────────────────────────────────────────────────────────────────────────┤
│                      CROSS-CUTTING INFRASTRUCTURE                        │
│  ┌────────────┐ ┌────────────────┐ ┌───────────────┐ ┌──────────────┐  │
│  │ Blockchain │ │ AI Intelligence│ │  Automation    │ │  Event Bus   │  │
│  │ Trust Layer│ │ Hub (Gemini)   │ │  Engine        │ │  (WebSocket) │  │
│  └────────────┘ └────────────────┘ └───────────────┘ └──────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. LAYER 1: PLATFORM ADMIN (Port 8081) — Chi tiết nâng cấp

### 3.1 Hiện trạng (AS-IS)

**10 pages đang có:**
- `PlatformAdmin.tsx` — Quản lý tenant (CRUD), health check, config, webhooks, audit log
- `EcosystemPublisher.tsx` — Publish packs to marketplace
- `ObservabilityDashboard.tsx` — Metrics cơ bản
- `BillingOverview.tsx` — Billing overview
- `UserManagement.tsx` — Quản lý users
- `AuditLog.tsx` — Log audit
- `WebhookMonitor.tsx` — Webhook stats
- `AiUsageDashboard.tsx` — AI usage metrics
- `GamificationAdmin.tsx` — Gamification config
- `BlockchainExplorer.tsx` — Blockchain ledger viewer

**Backend APIs hiện có:**
- `/api/v1/platform/tenants` — CRUD tenants
- `/api/v1/platform/observability` — Health metrics
- `/api/v1/platform/users` — User list
- `/api/v1/platform/billing/invoices` — Billing
- `/api/v1/platform/audit-logs` — Audit logs
- `/api/v1/platform/webhook-stats` — Webhook stats
- `/api/v1/platform/ai-usage` — AI usage
- `/api/v1/platform/blockchain/ledger` — Blockchain ledger

### 3.2 GAP Analysis

| Chức năng | Trạng thái | Mức độ |
|---|---|---|
| Tenant Provisioning tự động | ❌ Chưa có | CRITICAL |
| Tenant Health Scoring (AI) | ❌ Chưa có | HIGH |
| Revenue Analytics Dashboard | ⚠️ Chỉ có billing overview | HIGH |
| Security Center (Threat Detection) | ❌ Chưa có | CRITICAL |
| SLA Enforcement Dashboard (Global) | ❌ Chưa có | HIGH |
| Marketplace Review & Curation Pipeline | ⚠️ Có submit, chưa có review flow | MEDIUM |
| Partner Management Console | ❌ Chưa có | MEDIUM |
| Infrastructure Cost Analytics | ❌ Chưa có | MEDIUM |
| AI Model Registry & Governance | ⚠️ Có AI usage, chưa có governance | HIGH |
| Multi-region Tenant Routing | ❌ Chưa có | LOW |
| Compliance & GDPR Center | ❌ Chưa có | HIGH |
| Feature Flag Management | ❌ Chưa có | MEDIUM |

### 3.3 Modules cần xây mới

#### 3.3.1 Tenant Lifecycle Manager (TLM)

**Mục đích:** Tự động hóa toàn bộ lifecycle của một tenant từ sign-up → onboarding → active → scale → churn prevention.

**Pages cần tạo:**
- `TenantProvisioningWizard.tsx` — Wizard tạo tenant mới với auto-schema, auto-seeding
- `TenantHealthDashboard.tsx` — AI Health Score cho mỗi tenant (usage, churn risk, growth potential)
- `TenantMigrationCenter.tsx` — Công cụ migrate data từ hệ thống cũ (Excel, KiotViet, Sapo)

**API Endpoints cần tạo:**
```
POST /api/v1/platform/tenants/provision          — Auto-provision tenant (create schema + seed + activate)
GET  /api/v1/platform/tenants/:id/health-score    — AI-computed health score
POST /api/v1/platform/tenants/:id/migrate         — Import data from external system
GET  /api/v1/platform/tenants/:id/usage-analytics  — Usage metrics per tenant
POST /api/v1/platform/tenants/:id/suspend          — Suspend with grace period
POST /api/v1/platform/tenants/:id/offboard         — Full offboarding + data export
```

**Database Schema cần thêm:**
```sql
CREATE TABLE nf_core.tenant_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id),
    score DECIMAL(5,2) NOT NULL,          -- 0-100
    churn_risk VARCHAR(10),               -- LOW/MEDIUM/HIGH/CRITICAL
    usage_score DECIMAL(5,2),
    engagement_score DECIMAL(5,2),
    growth_velocity DECIMAL(5,2),
    ai_recommendation TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    model_version VARCHAR(20)
);

CREATE TABLE nf_core.tenant_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_system VARCHAR(50),            -- 'kiotviet', 'sapo', 'excel', 'custom'
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING/RUNNING/COMPLETED/FAILED
    total_records INT DEFAULT 0,
    imported_records INT DEFAULT 0,
    error_log JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `TenantHealthScoringAgent` — Phân tích usage patterns, login frequency, feature adoption, support tickets → tính health score
- `ChurnPredictionAgent` — Predict tenant sắp rời bỏ → tự động trigger retention workflow
- `UsageRecommendationAgent` — Gợi ý tính năng chưa dùng, packs chưa cài

**Blockchain Integration:**
- Mỗi lần tenant thay đổi trạng thái (activate, suspend, tier upgrade) → ghi blockchain ledger
- Export bản sao dữ liệu tenant → hash blockchain để chứng minh integrity

**Automation Workflow:**
```yaml
workflow: tenant_onboarding_automation
trigger: event.tenant.created
nodes:
  - id: create_schema
    type: action
    action: provision_database_schema
  - id: seed_demo
    type: action
    action: seed_demo_data
    depends_on: create_schema
  - id: send_welcome
    type: action
    action: send_welcome_email_zns
    depends_on: seed_demo
  - id: schedule_followup
    type: action
    action: schedule_7day_checkin_call
    depends_on: send_welcome
  - id: ai_health_baseline
    type: action
    action: compute_initial_health_score
    depends_on: seed_demo
```

---

#### 3.3.2 Security Center

**Mục đích:** Giám sát bảo mật toàn hệ thống, phát hiện đe dọa, quản lý incidents.

**Pages cần tạo:**
- `SecurityDashboard.tsx` — Threat overview, active incidents, risk heatmap
- `AccessControlCenter.tsx` — IP whitelisting, 2FA enforcement, session management
- `ComplianceReportGenerator.tsx` — GDPR/PDPA compliance reports

**API Endpoints:**
```
GET  /api/v1/platform/security/threats         — Active threat list
GET  /api/v1/platform/security/access-logs      — Access logs with anomaly flags
POST /api/v1/platform/security/ip-whitelist      — Manage IP whitelist
GET  /api/v1/platform/security/compliance-report — Generate compliance report
POST /api/v1/platform/security/2fa/enforce       — Enforce 2FA for a tenant
```

**Database Schema:**
```sql
CREATE TABLE nf_core.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    event_type VARCHAR(50),        -- 'BRUTE_FORCE', 'SUSPICIOUS_LOGIN', 'DATA_EXPORT', 'API_ABUSE'
    severity VARCHAR(10),          -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    source_ip INET,
    user_agent TEXT,
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_core.ip_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    ip_range CIDR NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `ThreatDetectionAgent` — Phân tích access patterns, phát hiện brute force, credential stuffing, API abuse
- `AnomalyDetectionAgent` — Baseline user behavior → alert khi có deviation bất thường

**Blockchain Integration:**
- Mọi security event severity HIGH/CRITICAL → anchor blockchain (bất biến, không thể xóa evidence)
- Admin actions (suspend, delete tenant, export data) → blockchain audit trail

---

#### 3.3.3 Revenue Analytics Console

**Pages cần tạo:**
- `RevenueAnalytics.tsx` — MRR, ARR, churn rate, LTV, CAC, cohort analysis
- `SubscriptionManager.tsx` — Quản lý gói dịch vụ, upsell/downsell tracking

**API Endpoints:**
```
GET /api/v1/platform/revenue/mrr           — Monthly Recurring Revenue
GET /api/v1/platform/revenue/cohorts       — Cohort retention analysis
GET /api/v1/platform/revenue/ltv           — Customer Lifetime Value
GET /api/v1/platform/revenue/forecasts     — AI revenue forecasting
```

---

#### 3.3.4 Feature Flag & Experiment Center

**Pages cần tạo:**
- `FeatureFlagManager.tsx` — Toggle features per tenant/tier/percentage rollout

**API Endpoints:**
```
GET  /api/v1/platform/feature-flags           — List all flags
POST /api/v1/platform/feature-flags           — Create flag
PUT  /api/v1/platform/feature-flags/:id       — Update flag rules
GET  /api/v1/platform/feature-flags/evaluate   — Evaluate flags for a tenant
```

---

### 3.4 Tổng kết Layer 1 sau nâng cấp

| Category | Pages hiện có | Pages mới | Tổng |
|---|---|---|---|
| Tenant Management | 1 | 3 | 4 |
| Security | 0 | 3 | 3 |
| Revenue & Billing | 1 | 2 | 3 |
| Observability | 1 | 0 | 1 |
| AI Governance | 1 | 1 | 2 |
| Ecosystem | 1 | 0 | 1 |
| Blockchain | 1 | 0 | 1 |
| Feature Flags | 0 | 1 | 1 |
| Gamification | 1 | 0 | 1 |
| **Total** | **10** | **+10** | **20** |

---

## 4. LAYER 2: SME LEADER DASHBOARD (Port 8082) — Chi tiết nâng cấp

### 4.1 Hiện trạng (AS-IS)

**24 pages đang có:**
- `ExecutiveDashboard.tsx` — KPI overview (doanh thu, SLA, AI insights)
- `PackOperationsHub.tsx` — 12 vertical pack console
- `AutomationWorkflows.tsx` — Workflow list + management
- `WorkflowBuilder.tsx` — Visual workflow builder (N8N-style)
- `IntegrationHub.tsx` — Connect external services
- `OmniChannelChat.tsx` — Multi-channel chat
- `AppStore.tsx` — Install packs
- `BillingDashboard.tsx` — Billing cho tenant
- `AnalyticsDashboard.tsx` — SLA compliance, queue throughput
- `EntityBuilder.tsx` — No-code entity builder
- `TenantAdminDashboard.tsx` — Tenant settings
- `KiotVietKanban.tsx` — KiotViet connector view
- 12x Pack Pages (SpaPackPage, FnbPackPage, etc.) — Chuyên biệt cho từng ngành

### 4.2 GAP Analysis — Các module THIẾU HOÀN TOÀN

| Module | Trạng thái | Mức độ quan trọng | Giải thích |
|---|---|---|---|
| **Financial Management** | ❌ KHÔNG CÓ | CRITICAL | SME không thể vận hành mà không có: Thu chi, Sổ quỹ, Công nợ, Báo cáo tài chính |
| **HR & Payroll** | ❌ KHÔNG CÓ | CRITICAL | Quản lý nhân sự, chấm công, tính lương, hợp đồng lao động |
| **Inventory & Procurement** | ❌ KHÔNG CÓ | CRITICAL | Quản lý tồn kho, đặt hàng nhà cung cấp, nhập xuất kho |
| **CRM & Sales Pipeline** | ⚠️ CƠ BẢN | HIGH | Chỉ có list customers + AI segment, thiếu pipeline, deals, follow-up |
| **POS / Bán hàng** | ❌ KHÔNG CÓ | CRITICAL | Thiếu giao diện bán hàng, receipt, promotion, loyalty |
| **Document Management** | ❌ KHÔNG CÓ | HIGH | Thiếu quản lý tài liệu, hợp đồng, template |
| **Calendar & Scheduling** | ❌ KHÔNG CÓ | HIGH | Thiếu lịch làm việc, lịch hẹn, resource booking |
| **Project Management** | ❌ KHÔNG CÓ | HIGH | Thiếu quản lý dự án, milestones, Gantt chart |
| **Reporting & Tax** | ❌ KHÔNG CÓ | CRITICAL | Thiếu báo cáo thuế, BCTC, xuất hóa đơn điện tử |
| **Asset Management** | ❌ KHÔNG CÓ | MEDIUM | Thiếu quản lý tài sản cố định, khấu hao |
| **Smart Notifications** | ⚠️ CƠ BẢN | HIGH | Chỉ có WebSocket push, thiếu notification center, rules, scheduling |
| **Role-based Dashboards** | ⚠️ CƠ BẢN | HIGH | Chỉ có 1 dashboard chung, chưa personalize theo role |

### 4.3 Modules cần xây mới — CHI TIẾT

#### 4.3.1 Financial Management Module (Quản lý Tài chính)

**Đây là module quan trọng nhất mà hệ thống đang thiếu.** Không có SME nào có thể vận hành mà không có quản lý tài chính.

**Pages cần tạo:**

1. **`FinancialDashboard.tsx`** — Tổng quan tài chính
   - Revenue today / week / month / YTD
   - Cash flow chart (30 ngày)
   - Accounts Receivable / Payable summary
   - P&L statement mini
   - AI: Cash flow forecasting 30 ngày

2. **`CashBookManager.tsx`** — Sổ quỹ tiền mặt + ngân hàng
   - Ghi thu / ghi chi
   - Tồn quỹ realtime
   - Reconciliation với bank statement
   - Multi-account: Tiền mặt, VCB, MB, Momo, etc.

3. **`AccountsReceivable.tsx`** — Công nợ phải thu
   - Danh sách khách hàng nợ
   - Aging report (0-30, 31-60, 61-90, 90+)
   - Auto-send nhắc nợ qua Zalo ZNS
   - AI: Predict khả năng thu hồi

4. **`AccountsPayable.tsx`** — Công nợ phải trả
   - Danh sách nhà cung cấp cần trả
   - Payment schedule
   - Auto-approve thanh toán dưới threshold

5. **`InvoiceCenter.tsx`** — Quản lý hóa đơn
   - Tạo hóa đơn bán hàng
   - Hóa đơn điện tử (e-invoice VN format)
   - Template customizable
   - Auto-generate từ Work Items hoàn thành

6. **`FinancialReports.tsx`** — Báo cáo tài chính
   - Báo cáo Thu Chi theo kỳ
   - Bảng Cân đối kế toán (mini)
   - Báo cáo Lợi nhuận gộp
   - Xuất Excel/PDF

**Database Schema:**
```sql
-- Schema: nf_finance
CREATE SCHEMA IF NOT EXISTS nf_finance;

CREATE TABLE nf_finance.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,            -- 'Tiền mặt', 'VCB xxx', 'Momo'
    account_type VARCHAR(20) NOT NULL,     -- 'CASH', 'BANK', 'E_WALLET'
    balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'VND',
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_finance.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    account_id UUID NOT NULL REFERENCES nf_finance.accounts(id),
    transaction_type VARCHAR(10) NOT NULL, -- 'INCOME', 'EXPENSE', 'TRANSFER'
    category VARCHAR(50),                  -- 'SALES', 'SALARY', 'RENT', 'UTILITIES', 'SUPPLIES'
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),            -- 'INVOICE', 'PAYROLL', 'WORK_ITEM', 'MANUAL'
    reference_id UUID,
    counterpart_name VARCHAR(200),         -- Tên khách hàng / NCC
    payment_method VARCHAR(30),            -- 'CASH', 'BANK_TRANSFER', 'VIETQR', 'MOMO', 'CRYPTO'
    receipt_url TEXT,                       -- Ảnh chứng từ
    blockchain_hash VARCHAR(100),          -- Hash trên blockchain
    approved_by UUID,
    created_by UUID,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_finance.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    invoice_number VARCHAR(30) NOT NULL,   -- Auto-generated: INV-2026-0001
    invoice_type VARCHAR(10) NOT NULL,     -- 'SALES', 'PURCHASE'
    customer_id UUID,
    supplier_id UUID,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 10.0,    -- VAT 10%
    tax_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',    -- DRAFT/SENT/PAID/OVERDUE/CANCELLED
    due_date DATE,
    paid_at TIMESTAMPTZ,
    items JSONB NOT NULL,                  -- [{name, qty, unit_price, amount}]
    notes TEXT,
    blockchain_hash VARCHAR(100),
    e_invoice_id VARCHAR(50),              -- Mã hóa đơn điện tử
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_finance.receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_id UUID,
    invoice_id UUID REFERENCES nf_finance.invoices(id),
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining DECIMAL(15,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING/PARTIAL/PAID/OVERDUE/WRITTEN_OFF
    last_reminder_at TIMESTAMPTZ,
    reminder_count INT DEFAULT 0,
    ai_collection_probability DECIMAL(5,2), -- AI dự đoán khả năng thu
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_finance.payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    supplier_name VARCHAR(200) NOT NULL,
    supplier_id UUID,
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining DECIMAL(15,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(10) DEFAULT 'NORMAL', -- LOW/NORMAL/HIGH/URGENT
    auto_approve BOOLEAN DEFAULT FALSE,     -- Tự động duyệt nếu dưới threshold
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```
# Accounts
GET  /api/v1/finance/accounts              — List accounts with balances
POST /api/v1/finance/accounts              — Create account
PUT  /api/v1/finance/accounts/:id          — Update account

# Transactions
GET  /api/v1/finance/transactions          — List with filters (date range, category, type)
POST /api/v1/finance/transactions          — Create transaction
GET  /api/v1/finance/transactions/summary  — Summary by category/period

# Invoices
GET  /api/v1/finance/invoices              — List invoices
POST /api/v1/finance/invoices              — Create invoice
PUT  /api/v1/finance/invoices/:id/status   — Update status (SENT, PAID, etc.)
GET  /api/v1/finance/invoices/:id/pdf      — Generate PDF

# Receivables & Payables
GET  /api/v1/finance/receivables           — List with aging
POST /api/v1/finance/receivables/:id/remind — Send reminder via ZNS
GET  /api/v1/finance/payables              — List payables
POST /api/v1/finance/payables/:id/approve  — Approve payment

# Reports
GET  /api/v1/finance/reports/pnl           — Profit & Loss statement
GET  /api/v1/finance/reports/cashflow      — Cash flow report
GET  /api/v1/finance/reports/tax-summary   — Tax summary for filing
GET  /api/v1/finance/reports/forecast      — AI cash flow forecast
```

**AI Integration:**
- `CashFlowForecastAgent` — Dự đoán cash flow 30/60/90 ngày dựa trên lịch sử thu chi + seasonal patterns
- `DebtCollectionPriorityAgent` — Xếp hạng ưu tiên thu nợ theo probability of collection
- `ExpenseAnomalyDetector` — Phát hiện chi tiêu bất thường (vd: giao dịch đêm, số tiền lạ)
- `AutoCategorizeAgent` — Tự động phân loại giao dịch (SALARY, RENT, UTILITIES...) từ mô tả

**Blockchain Integration:**
- Mọi invoice status=PAID → anchor blockchain (chống sửa hóa đơn sau khi thanh toán)
- Mọi giao dịch > threshold (vd: 10M VND) → anchor blockchain
- Báo cáo tài chính hàng tháng → hash blockchain (integrity verification)

**Automation Workflow:**
```yaml
workflow: invoice_overdue_automation
trigger: cron.daily_9am
condition: invoices WHERE status='SENT' AND due_date < today()
nodes:
  - id: mark_overdue
    type: action
    action: update_invoice_status
    params: {status: 'OVERDUE'}
  - id: send_reminder
    type: action
    action: send_zns_reminder
    template: 'invoice_overdue_reminder'
    depends_on: mark_overdue
  - id: create_task
    type: condition
    condition: reminder_count >= 3
    true_branch: escalate_to_leader
    false_branch: increment_reminder_count
```

---

#### 4.3.2 HR & Payroll Module (Quản lý Nhân sự & Lương)

**Pages cần tạo:**

1. **`EmployeeDirectory.tsx`** — Danh bạ nhân viên
   - Profile: Ảnh, thông tin cá nhân, phòng ban, chức vụ
   - Hợp đồng lao động (loại, thời hạn, mức lương)
   - Lịch sử công tác
   - Performance review history

2. **`AttendanceManager.tsx`** — Quản lý chấm công
   - Calendar view: Ngày công, nghỉ phép, đi trễ
   - Integration với Field Checkin (GPS)
   - Tổng hợp công tháng
   - AI: Phát hiện pattern đi trễ/vắng mặt bất thường

3. **`LeaveManager.tsx`** — Quản lý nghỉ phép
   - Đơn xin nghỉ + approval flow
   - Tồn phép (annual, sick, personal)
   - Calendar overlay

4. **`PayrollProcessor.tsx`** — Tính lương
   - Bảng lương hàng tháng
   - Công thức: Lương cơ bản + Phụ cấp + KPI bonus - Khấu trừ (BHXH, thuế TNCN)
   - AI: Gợi ý mức thưởng dựa trên performance metrics
   - Auto-generate phiếu lương PDF

5. **`OrgChart.tsx`** — Sơ đồ tổ chức
   - Org chart interactive
   - Phòng ban, cấp bậc, reporting line

**Database Schema:**
```sql
CREATE SCHEMA IF NOT EXISTS nf_hr;

CREATE TABLE nf_hr.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES nf_core.users(id),
    employee_code VARCHAR(20),
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(200),
    date_of_birth DATE,
    id_number VARCHAR(20),               -- CCCD/CMND
    department VARCHAR(100),
    position VARCHAR(100),
    manager_id UUID REFERENCES nf_hr.employees(id),
    employment_type VARCHAR(20),          -- FULL_TIME, PART_TIME, CONTRACT, INTERN
    start_date DATE NOT NULL,
    end_date DATE,
    base_salary DECIMAL(15,2),
    allowances JSONB DEFAULT '{}',        -- {lunch: 500000, transport: 300000}
    bank_account VARCHAR(30),
    bank_name VARCHAR(100),
    tax_code VARCHAR(20),
    social_insurance_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, ON_LEAVE, TERMINATED
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_hr.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES nf_hr.employees(id),
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    check_in_location JSONB,             -- {lat, lng, address}
    check_out_location JSONB,
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PRESENT', -- PRESENT, ABSENT, LATE, HALF_DAY, LEAVE
    source VARCHAR(20),                   -- 'FIELD_CHECKIN', 'QR_SCAN', 'MANUAL', 'BIOMETRIC'
    notes TEXT,
    UNIQUE(tenant_id, employee_id, date)
);

CREATE TABLE nf_hr.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES nf_hr.employees(id),
    leave_type VARCHAR(20) NOT NULL,      -- ANNUAL, SICK, PERSONAL, MATERNITY, UNPAID
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_hr.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period VARCHAR(7) NOT NULL,           -- '2026-07'
    status VARCHAR(20) DEFAULT 'DRAFT',   -- DRAFT, PROCESSING, APPROVED, PAID
    total_gross DECIMAL(15,2),
    total_deductions DECIMAL(15,2),
    total_net DECIMAL(15,2),
    employee_count INT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_hr.payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES nf_hr.payroll_runs(id),
    employee_id UUID NOT NULL REFERENCES nf_hr.employees(id),
    work_days DECIMAL(4,1),
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    base_salary DECIMAL(15,2),
    allowances DECIMAL(15,2) DEFAULT 0,
    kpi_bonus DECIMAL(15,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2),
    social_insurance DECIMAL(15,2) DEFAULT 0,
    health_insurance DECIMAL(15,2) DEFAULT 0,
    personal_income_tax DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2),
    calculation_details JSONB,            -- Full breakdown for audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `PayrollCalculationAgent` — Tự động tính lương dựa trên: ngày công, overtime, KPI, BHXH, thuế TNCN
- `BurnoutDetectionAgent` — Phân tích overtime patterns + leave patterns → cảnh báo burnout risk
- `PerformanceInsightAgent` — Tổng hợp KPI data từ work items, gamification → gợi ý performance rating

**Blockchain Integration:**
- Bảng lương mỗi kỳ sau khi approved → anchor blockchain (chống sửa lương retroactive)
- Hợp đồng lao động hash → blockchain (chứng minh tính nguyên vẹn)

---

#### 4.3.3 Inventory & Procurement Module (Quản lý Kho & Mua hàng)

**Pages cần tạo:**

1. **`InventoryDashboard.tsx`** — Tổng quan tồn kho
   - Stock levels by category
   - Low stock alerts
   - Stock value
   - AI: Reorder point recommendations

2. **`StockManager.tsx`** — Quản lý nhập xuất kho
   - Phiếu nhập kho (từ NCC)
   - Phiếu xuất kho (cho sản xuất / bán hàng)
   - Chuyển kho (multi-location)
   - Kiểm kê (stocktake)

3. **`PurchaseOrders.tsx`** — Đặt hàng nhà cung cấp
   - Tạo PO
   - Approval flow (theo threshold)
   - Theo dõi delivery
   - Supplier scoring (AI)

4. **`SupplierDirectory.tsx`** — Quản lý nhà cung cấp
   - Profile NCC
   - Lịch sử giao dịch
   - AI: Supplier reliability scoring

**Database Schema:**
```sql
CREATE SCHEMA IF NOT EXISTS nf_inventory;

CREATE TABLE nf_inventory.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    manager_id UUID,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_inventory.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'cái',
    cost_price DECIMAL(15,2),
    sell_price DECIMAL(15,2),
    min_stock INT DEFAULT 0,
    max_stock INT,
    barcode VARCHAR(50),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

CREATE TABLE nf_inventory.stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES nf_inventory.products(id),
    warehouse_id UUID NOT NULL REFERENCES nf_inventory.warehouses(id),
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_counted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, product_id, warehouse_id)
);

CREATE TABLE nf_inventory.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES nf_inventory.products(id),
    warehouse_id UUID NOT NULL,
    movement_type VARCHAR(20) NOT NULL,   -- 'IN', 'OUT', 'TRANSFER', 'ADJUST', 'RETURN'
    quantity INT NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_inventory.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(200),
    address TEXT,
    tax_code VARCHAR(20),
    payment_terms VARCHAR(50),            -- 'COD', 'NET_30', 'NET_60'
    ai_reliability_score DECIMAL(5,2),
    total_orders INT DEFAULT 0,
    avg_delivery_days DECIMAL(5,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_inventory.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    po_number VARCHAR(30) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES nf_inventory.suppliers(id),
    warehouse_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',   -- DRAFT/PENDING_APPROVAL/APPROVED/ORDERED/RECEIVED/CANCELLED
    items JSONB NOT NULL,
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    total DECIMAL(15,2),
    expected_delivery DATE,
    actual_delivery DATE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `DemandForecastAgent` — Dự đoán nhu cầu hàng hóa → tự động suggest PO
- `ReorderPointOptimizer` — Tính min_stock tối ưu dựa trên lead time + demand variance
- `SupplierScoringAgent` — Scoring NCC dựa trên: delivery time, quality, price competitiveness

**Automation Workflow:**
```yaml
workflow: low_stock_auto_reorder
trigger: event.stock_level.below_minimum
nodes:
  - id: check_supplier
    type: action
    action: find_best_supplier
    params: {criteria: [price, reliability, lead_time]}
  - id: create_po
    type: action
    action: create_purchase_order
    depends_on: check_supplier
  - id: notify_leader
    type: action
    action: send_notification
    channel: websocket
    message: "PO #{po_number} tự động tạo cho #{product_name}"
    depends_on: create_po
  - id: approval_gate
    type: condition
    condition: po.total > auto_approve_threshold
    true_branch: require_manual_approval
    false_branch: auto_approve_and_send
```

---

#### 4.3.4 CRM & Sales Pipeline Module (Nâng cấp)

**Pages cần tạo:**

1. **`SalesPipeline.tsx`** — Kanban view cho deals
   - Stages: Lead → Qualified → Proposal → Negotiation → Closed Won/Lost
   - Drag-and-drop
   - AI: Win probability per deal

2. **`CustomerProfile360.tsx`** — 360 degree customer view
   - Lịch sử mua hàng
   - Interactions (chat, email, call)
   - AI: Upsell/cross-sell recommendations
   - NPS score, satisfaction rating
   - Lifetime value (LTV)

3. **`CampaignManager.tsx`** — Quản lý marketing campaigns
   - Tạo campaign (SMS, ZNS, Email)
   - Target audience (AI segmentation)
   - Track performance (open rate, conversion)

4. **`LeadCapture.tsx`** — Lead capture & scoring
   - Web form builder
   - Auto-assign leads (round-robin / AI-based)
   - Lead scoring (AI)

**AI Integration:**
- `LeadScoringAgent` — Score leads dựa trên: demographics, behavior, source, engagement
- `ChurnPredictionAgent` — Predict khách hàng sắp rời → trigger retention campaign
- `UpsellRecommendationAgent` — Gợi ý sản phẩm/dịch vụ phù hợp dựa trên purchase history

---

#### 4.3.5 Calendar & Scheduling Module

**Pages cần tạo:**

1. **`BusinessCalendar.tsx`** — Lịch tổng hợp
   - Resource booking (phòng, bàn, thiết bị)
   - Staff scheduling (ca làm việc)
   - Customer appointments
   - Integration với Google Calendar

2. **`ShiftPlanner.tsx`** — Lên ca làm việc
   - Weekly/monthly planner
   - AI: Gợi ý ca tối ưu dựa trên dự báo khách

---

#### 4.3.6 Smart Notification Center

**Page cần tạo:**

1. **`NotificationCenter.tsx`** — Trung tâm thông báo
   - Notification rules (when to notify, who, via which channel)
   - Notification history
   - Priority levels
   - Channels: In-app, WebSocket, Zalo ZNS, Email, SMS

---

#### 4.3.7 Document Management

**Page cần tạo:**

1. **`DocumentVault.tsx`** — Kho tài liệu
   - Upload/download files
   - Version control
   - Access control per role
   - Categories: Hợp đồng, Hóa đơn, Biên bản, Templates
   - Blockchain: Hash integrity cho documents quan trọng

---

### 4.4 Tổng kết Layer 2 sau nâng cấp

| Category | Pages hiện có | Pages mới | Tổng |
|---|---|---|---|
| Dashboard | 1 | 0 | 1 |
| Financial Management | 0 | 6 | 6 |
| HR & Payroll | 0 | 5 | 5 |
| Inventory & Procurement | 0 | 4 | 4 |
| CRM & Sales | 0 | 4 | 4 |
| Calendar & Scheduling | 0 | 2 | 2 |
| Notifications | 0 | 1 | 1 |
| Documents | 0 | 1 | 1 |
| Pack Operations | 13 | 0 | 13 |
| Workflow & Automation | 2 | 0 | 2 |
| Integration & Ecosystem | 2 | 0 | 2 |
| Analytics & Reports | 1 | 0 | 1 |
| Others (Billing, Chat, etc.) | 5 | 0 | 5 |
| **Total** | **24** | **+23** | **47** |

---

## 5. LAYER 3: STAFF WORKSPACE (Port 8083) — Chi tiết nâng cấp

### 5.1 Hiện trạng (AS-IS)

**3 pages đang có — ĐÂY LÀ TẦNG YẾU NHẤT:**
- `TenantStaffWorkspace.tsx` — Command Center (entities, workflows, AI copilot, blockchain audit)
- `FieldCheckin.tsx` — GPS check-in
- `QRScanner.tsx` — QR code scanner
- Plus: `OmniChannelChat` (shared từ Leader) và `GamificationBoard` (shared)

**Vấn đề cốt lõi:** Staff là người **thực sự vận hành** SME hàng ngày, nhưng tầng này chỉ có một mega-page Command Center. Staff cần UX đơn giản, task-focused, mobile-first — KHÔNG phải Command Center phức tạp.

### 5.2 GAP Analysis

| Chức năng | Trạng thái | Mức độ |
|---|---|---|
| **Task Board (Kanban)** | ❌ Chưa có | CRITICAL |
| **Work Item Processing** | ⚠️ Có trong Command Center nhưng UX phức tạp | CRITICAL |
| **My Schedule / My Calendar** | ❌ Chưa có | HIGH |
| **Time Tracking** | ❌ Chưa có | HIGH |
| **Knowledge Base / SOPs** | ❌ Chưa có | HIGH |
| **Customer Lookup** | ❌ Chưa có | HIGH |
| **Inventory Quick Check** | ❌ Chưa có | MEDIUM |
| **Daily Report / Handover** | ❌ Chưa có | HIGH |
| **Offline Mode** | ❌ Chưa có | HIGH |
| **Notifications Inbox** | ❌ Chưa có | HIGH |
| **Performance / My KPIs** | ⚠️ Có XP/Level, chưa có KPI thật | MEDIUM |
| **POS / Quick Sale** | ❌ Chưa có (cho staff retail/F&B) | CRITICAL |

### 5.3 Modules cần xây mới

#### 5.3.1 Smart Task Board

**Page: `TaskBoard.tsx`**

Kanban board cho staff xử lý work items:
- Columns: To Do → In Progress → Review → Done
- Drag-and-drop
- Timer per task
- Priority badges, SLA countdown
- AI: Auto-suggest next best task (dựa trên priority, skill match, deadline)
- Confetti animation khi hoàn thành task + XP award

**API Endpoints:**
```
GET  /api/v1/staff/my-tasks                — My assigned tasks (filtered by status)
PUT  /api/v1/staff/my-tasks/:id/status     — Move task to next stage
POST /api/v1/staff/my-tasks/:id/time-log   — Log time on task
GET  /api/v1/staff/my-tasks/suggested      — AI-suggested next tasks
```

#### 5.3.2 My Schedule

**Page: `MySchedule.tsx`**

- Lịch cá nhân: Ca làm, tasks, appointments, deadlines
- Sync với work items (auto-block time)
- Shift swap request
- Leave request

#### 5.3.3 Customer Quick Lookup

**Page: `CustomerLookup.tsx`**

- Search khách hàng by name, phone, mã KH
- Quick view: Lịch sử mua, ghi chú, loyalty points
- Quick actions: Tạo work item, gửi ZNS, ghi note

#### 5.3.4 Knowledge Base

**Page: `KnowledgeBase.tsx`**

- SOPs cho từng Pack (Retail: quy trình đổi trả, F&B: quy trình nhận đơn...)
- Searchable
- AI: Ask questions about SOPs → instant answers
- Videos, step-by-step guides

#### 5.3.5 POS / Quick Sale (cho Staff Retail/F&B)

**Page: `PointOfSale.tsx`**

- Giao diện bán hàng nhanh
- Product catalog (grid/list)
- Barcode scan
- Cart + discount + payment
- Receipt print / send via Zalo
- Cash drawer management
- Integration với Inventory (auto deduct stock)

**Database Schema:**
```sql
CREATE TABLE nf_core.pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    register_name VARCHAR(50),
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_transactions INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN',    -- OPEN, CLOSED
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE nf_core.pos_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id UUID REFERENCES nf_core.pos_sessions(id),
    order_number VARCHAR(30) NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(200),
    items JSONB NOT NULL,
    subtotal DECIMAL(15,2),
    discount_total DECIMAL(15,2) DEFAULT 0,
    tax_total DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2),
    payment_method VARCHAR(20),           -- CASH, CARD, VIETQR, MOMO, TRANSFER
    payment_status VARCHAR(20) DEFAULT 'PAID',
    loyalty_points_earned INT DEFAULT 0,
    loyalty_points_used INT DEFAULT 0,
    staff_id UUID,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `QuickSaleRecommender` — Gợi ý upsell items dựa trên current cart + customer history
- `DiscountOptimizer` — Suggest discount level tối ưu để maximize conversion mà vẫn giữ margin

#### 5.3.6 Daily Report / Handover

**Page: `DailyReport.tsx`**

- Staff tự tổng kết công việc cuối ca
- AI auto-generate draft từ tasks completed
- Handover notes cho ca tiếp theo
- Photos & evidence attached

#### 5.3.7 Notifications Inbox

**Page: `NotificationsInbox.tsx`**

- Centralized inbox cho tất cả notifications
- Categories: Tasks, Alerts, Messages, System
- Mark read/unread
- Quick actions from notification

#### 5.3.8 My Performance

**Page: `MyPerformance.tsx`**

- KPI dashboard cá nhân
- Tasks completed / SLA met %
- XP & Level progression
- Leaderboard
- Badges & achievements
- Suggestions for improvement (AI)

### 5.4 Tổng kết Layer 3 sau nâng cấp

| Category | Pages hiện có | Pages mới | Tổng |
|---|---|---|---|
| Command Center / Dashboard | 1 | 0 | 1 |
| Task Board | 0 | 1 | 1 |
| POS / Quick Sale | 0 | 1 | 1 |
| My Schedule | 0 | 1 | 1 |
| Customer Lookup | 0 | 1 | 1 |
| Knowledge Base | 0 | 1 | 1 |
| Daily Report | 0 | 1 | 1 |
| Notifications | 0 | 1 | 1 |
| My Performance | 0 | 1 | 1 |
| Field Checkin | 1 | 0 | 1 |
| QR Scanner | 1 | 0 | 1 |
| Omni Chat (shared) | 1 | 0 | 1 |
| Gamification (shared) | 1 | 0 | 1 |
| **Total** | **5** | **+8** | **13** |

---

## 6. LAYER 4: CUSTOMER PORTAL (Port 8084) — Chi tiết nâng cấp

### 6.1 Hiện trạng (AS-IS)

**1 page (3 tabs) — ĐÂY LÀ TẦNG NHỎ NHẤT:**
- `CustomerPortal.tsx` — HomeTab + TrackingTab + AIChatTab
- Features: Order tracking, AI chat, VietQR payment, Web3 wallet (simulated), ZNS notifications

### 6.2 GAP Analysis

| Chức năng | Trạng thái | Mức độ |
|---|---|---|
| **Self-Service Account** | ❌ Chưa có | CRITICAL |
| **Online Booking / Appointment** | ❌ Chưa có | CRITICAL |
| **Payment Center** | ⚠️ Có VietQR + Crypto nhưng basic | HIGH |
| **Loyalty / Rewards Program** | ⚠️ Có NFT balance mock | HIGH |
| **Product/Service Catalog** | ❌ Chưa có | HIGH |
| **Feedback & Reviews** | ❌ Chưa có | HIGH |
| **Order History** | ❌ Chưa có (chỉ track 1 đơn) | CRITICAL |
| **Self-service FAQ / Help Center** | ❌ Chưa có | MEDIUM |
| **Referral Program** | ❌ Chưa có | MEDIUM |
| **Multi-language** | ❌ Chưa có | MEDIUM |
| **PWA Installable** | ❌ Chưa có | MEDIUM |
| **Push Notifications** | ❌ Chưa có | MEDIUM |

### 6.3 Modules cần xây mới

#### 6.3.1 Customer Account & Profile

**Tab: `AccountTab`** — Hồ sơ cá nhân
- View/Edit thông tin cá nhân
- Đổi mật khẩu
- Linked accounts (Google, Facebook, Zalo)
- Communication preferences
- Data privacy controls (GDPR/PDPA)

#### 6.3.2 Service Catalog & Booking

**Tab: `CatalogTab`** — Catalog sản phẩm/dịch vụ (tuỳ Pack)
- Grid view với search & filter
- Pricing display
- Rating & reviews
- Quick add to cart / book

**Tab: `BookingTab`** — Đặt lịch hẹn online
- Calendar picker (available slots)
- Service selection
- Staff preference (optional)
- Confirmation + QR code
- Cancellation / Reschedule
- Reminder notification trước 24h

**Database Schema:**
```sql
CREATE TABLE nf_core.customer_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_id UUID,
    staff_id UUID,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    notes TEXT,
    source VARCHAR(20) DEFAULT 'PORTAL',
    qr_code VARCHAR(100),
    reminder_sent BOOLEAN DEFAULT FALSE,
    rating INT,
    review_text TEXT,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `SmartSchedulingAgent` — Suggest optimal booking slots (balance staff utilization)
- `NoShowPredictionAgent` — Predict no-show probability → send extra reminders

#### 6.3.3 Order History & Tracking

**Tab: `OrdersTab`** — Lịch sử đơn hàng
- All orders with status
- Re-order feature
- Receipt download
- Dispute/complain

#### 6.3.4 Loyalty & Rewards

**Tab: `LoyaltyTab`** — Chương trình khách hàng thân thiết
- Points balance
- Points history (earned / redeemed)
- Available rewards catalog
- NFT-backed membership tiers (Bronze → Silver → Gold → Platinum)
- Exclusive offers
- Referral code + rewards

**Database Schema:**
```sql
CREATE TABLE nf_core.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200),
    points_balance INT DEFAULT 0,
    total_points_earned INT DEFAULT 0,
    total_points_redeemed INT DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'BRONZE',    -- BRONZE/SILVER/GOLD/PLATINUM
    tier_expiry DATE,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID,
    nft_token_id VARCHAR(100),            -- Blockchain NFT membership token
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_core.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    loyalty_account_id UUID NOT NULL REFERENCES nf_core.loyalty_accounts(id),
    transaction_type VARCHAR(10) NOT NULL, -- 'EARN', 'REDEEM', 'EXPIRE', 'BONUS'
    points INT NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_core.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    reward_type VARCHAR(20),              -- 'DISCOUNT', 'FREE_SERVICE', 'GIFT', 'VOUCHER'
    value DECIMAL(15,2),
    quantity_available INT,
    min_tier VARCHAR(20) DEFAULT 'BRONZE',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Blockchain Integration:**
- Membership tier (Gold, Platinum) = NFT token trên blockchain → chống giả mạo
- Points earned/redeemed → anchor blockchain → customer có thể verify

#### 6.3.5 Feedback & Reviews

**Tab: `FeedbackTab`** — Đánh giá & Phản hồi
- Star rating (1-5) per service/product/order
- Text review
- Photo upload
- SME response (visible to customer)
- AI: Sentiment analysis on reviews → alert SME nếu negative trend

#### 6.3.6 Help Center

**Tab: `HelpTab`** — Trung tâm trợ giúp
- FAQ searchable
- Contact info
- Support ticket creation
- AI chatbot (already exists, enhance with RAG on tenant-specific content)

### 6.4 Tổng kết Layer 4 sau nâng cấp

| Category | Tabs hiện có | Tabs mới | Tổng |
|---|---|---|---|
| Home | 1 | 0 | 1 |
| Order Tracking | 1 | 0 | 1 |
| AI Chat | 1 | 0 | 1 |
| Account & Profile | 0 | 1 | 1 |
| Service Catalog | 0 | 1 | 1 |
| Booking | 0 | 1 | 1 |
| Order History | 0 | 1 | 1 |
| Loyalty & Rewards | 0 | 1 | 1 |
| Feedback & Reviews | 0 | 1 | 1 |
| Help Center | 0 | 1 | 1 |
| **Total** | **3** | **+7** | **10** |

---

## 7. Cross-cutting: AI Intelligence Hub — Nâng cấp toàn diện

### 7.1 Hiện trạng AI Service

**Có:**
- `sla_risk_engine.py` — SLA risk scoring
- `rag_assistant.py` — RAG-based Q&A
- `routing_recommender.py` — Work item routing
- `drug_interaction.py` — Pharmacy drug check
- `real_estate_lead.py` — Lead scoring
- `logistics_route.py` — Route optimization
- `demand_forecast.py` — Demand forecasting
- `dynamic_pricing.py` — Dynamic pricing

**Thiếu:**
- Financial AI agents (cash flow, tax, expense)
- HR AI agents (payroll calc, burnout, performance)
- Inventory AI agents (demand forecast, reorder, supplier scoring)
- CRM AI agents (churn, upsell, lead scoring advanced)
- Customer AI agents (scheduling, no-show, sentiment)
- Cross-pack intelligence (correlate data across modules)

### 7.2 AI Agents cần xây thêm

| Agent | Module | Input | Output |
|---|---|---|---|
| `CashFlowForecastAgent` | Finance | Transaction history | 30-day forecast + alerts |
| `ExpenseCategorizerAgent` | Finance | Transaction description | Category + confidence |
| `DebtCollectionAgent` | Finance | Receivables data | Priority ranking + recommended actions |
| `PayrollCalculatorAgent` | HR | Attendance + config | Gross/net salary breakdown |
| `BurnoutDetectorAgent` | HR | Overtime + leave patterns | Risk score per employee |
| `DemandPlannerAgent` | Inventory | Sales history + seasonality | Reorder suggestions |
| `SupplierScorerAgent` | Inventory | PO history + delivery data | Reliability score |
| `ChurnPredictorAgent` | CRM | Customer activity patterns | Churn probability |
| `UpsellRecommenderAgent` | CRM | Purchase history | Product/service suggestions |
| `SmartSchedulerAgent` | Booking | Availability + demand | Optimal slot suggestions |
| `SentimentAnalyzerAgent` | Feedback | Review text | Sentiment score + insights |
| `TenantHealthScorerAgent` | Platform | Usage metrics | Health score + churn risk |
| `SecurityThreatAgent` | Platform | Access logs | Threat detection + alerts |

---

## 8. Cross-cutting: Blockchain Trust Layer — Nâng cấp toàn diện

### 8.1 Hiện trạng

- `blockchain.rs` service — Anchor hash lên simulated chain
- `blockchain_explorer.rs` — View ledger
- Frontend: `BlockchainExplorer.tsx` + `BlockchainAudit.tsx`

### 8.2 Mở rộng — Blockchain phải audit TOÀN BỘ critical transactions

| Module | Events anchor blockchain |
|---|---|
| **Finance** | Invoice PAID, Transaction > threshold, Monthly financial report |
| **HR** | Payroll approved, Employment contract signed/terminated |
| **Inventory** | Stock adjustment (prevent fraud), High-value PO approved |
| **CRM** | Deal closed (contract value), Customer data export |
| **Booking** | Booking confirmed (dispute prevention) |
| **Loyalty** | Points earned/redeemed (prevent tampering) |
| **Security** | Admin actions (suspend, delete), Data export |
| **Platform** | Tenant status changes, Tier upgrades |

### 8.3 Blockchain Verification Portal

Thêm public verification endpoint cho customers:
```
GET /verify/:hash — Public page verify blockchain hash (no auth required)
```

Customer có thể verify hóa đơn, booking, loyalty points bằng blockchain hash.

---

## 9. Cross-cutting: Automation Engine — Nâng cấp toàn diện

### 9.1 Hiện trạng

- `workflow_engine.rs` — Basic DAG execution
- `AutomationWorkflows.tsx` — List + toggle workflows
- `WorkflowBuilder.tsx` — Visual drag-and-drop builder

### 9.2 Workflows cần thêm (built-in, không cần user tạo)

| # | Workflow | Trigger | Actions |
|---|---|---|---|
| 1 | Invoice Overdue Reminder | Cron daily | Check overdue → Send ZNS → Escalate after 3 reminders |
| 2 | Low Stock Auto-Reorder | Stock below minimum | Find supplier → Create PO → Notify leader |
| 3 | Booking Reminder 24h | 24h before booking | Send ZNS → Send in-app notification |
| 4 | No-Show Follow-up | Booking status = NO_SHOW | Send follow-up ZNS → Offer reschedule |
| 5 | Payroll Auto-Calculate | Monthly trigger (28th) | Pull attendance → Calculate salary → Draft payroll run |
| 6 | New Customer Welcome | Customer first purchase | Send welcome ZNS → Create loyalty account → Award bonus points |
| 7 | Churn Risk Alert | AI detects high churn | Create work item for retention → Notify leader |
| 8 | Daily Report Reminder | End of shift | Prompt staff to submit daily report |
| 9 | SLA Breach Escalation | Work item SLA breached | Escalate to leader → Create alert → Deduct gamification points |
| 10 | Financial Month-End Close | Monthly trigger (last day) | Generate reports → Anchor blockchain → Notify leader |

---

## 10. Database Schema Changes — Tổng hợp

### 10.1 New Schemas

```sql
CREATE SCHEMA IF NOT EXISTS nf_finance;    -- Financial Management
CREATE SCHEMA IF NOT EXISTS nf_hr;          -- HR & Payroll
CREATE SCHEMA IF NOT EXISTS nf_inventory;   -- Inventory & Procurement
```

### 10.2 New Tables Summary

| Schema | Table | Description |
|---|---|---|
| `nf_finance` | `accounts` | Bank/cash accounts |
| `nf_finance` | `transactions` | Income/expense records |
| `nf_finance` | `invoices` | Sales/purchase invoices |
| `nf_finance` | `receivables` | Accounts receivable |
| `nf_finance` | `payables` | Accounts payable |
| `nf_hr` | `employees` | Employee directory |
| `nf_hr` | `attendance_records` | Attendance tracking |
| `nf_hr` | `leave_requests` | Leave management |
| `nf_hr` | `payroll_runs` | Monthly payroll runs |
| `nf_hr` | `payroll_items` | Individual payroll items |
| `nf_inventory` | `warehouses` | Warehouse locations |
| `nf_inventory` | `products` | Product catalog |
| `nf_inventory` | `stock_levels` | Current stock levels |
| `nf_inventory` | `stock_movements` | Stock in/out movements |
| `nf_inventory` | `suppliers` | Supplier directory |
| `nf_inventory` | `purchase_orders` | Purchase orders |
| `nf_core` | `customer_bookings` | Customer appointments |
| `nf_core` | `loyalty_accounts` | Loyalty program accounts |
| `nf_core` | `loyalty_transactions` | Points earned/redeemed |
| `nf_core` | `loyalty_rewards` | Available rewards |
| `nf_core` | `pos_sessions` | POS register sessions |
| `nf_core` | `pos_orders` | POS sales orders |
| `nf_core` | `security_events` | Security incidents |
| `nf_core` | `ip_whitelist` | IP whitelist per tenant |
| `nf_core` | `tenant_health_scores` | AI health scores |
| `nf_core` | `tenant_migrations` | Data migration tracking |

**Total: 26 new tables across 4 schemas**

---

## 11. API Endpoints — Tổng hợp mới

### Endpoints mới cần tạo: ~80 endpoints

| Module | Estimated Endpoints |
|---|---|
| Finance | ~20 |
| HR | ~15 |
| Inventory | ~15 |
| CRM | ~10 |
| Customer Portal | ~10 |
| Platform Security | ~8 |
| Platform Revenue | ~5 |

---

## 12. Tổng kết so sánh Before / After

| Metric | Hiện tại (Before) | Sau nâng cấp (After) | Tăng trưởng |
|---|---|---|---|
| **Layer 1 Pages** | 10 | 20 | +100% |
| **Layer 2 Pages** | 24 | 47 | +96% |
| **Layer 3 Pages** | 5 | 13 | +160% |
| **Layer 4 Tabs** | 3 | 10 | +233% |
| **Total Frontend Pages** | 42 | 90 | +114% |
| **Backend Controllers** | 43 | ~65 | +51% |
| **API Endpoints** | ~120 | ~200 | +67% |
| **Database Tables** | ~40 | ~66 | +65% |
| **AI Agents** | 8 | 21 | +163% |
| **Automation Workflows (built-in)** | 3 | 13 | +333% |
| **Blockchain-anchored events** | 2 types | 15+ types | +650% |

---

## 13. Lộ trình thực hiện (Implementation Phases)

### Phase A: Foundation (2-3 tuần)
- [ ] Database schema migrations (26 tables)
- [ ] Backend controllers cho Finance + HR
- [ ] API endpoints skeleton

### Phase B: Core Business (3-4 tuần)
- [ ] Financial Management UI (6 pages)
- [ ] HR & Payroll UI (5 pages)
- [ ] Inventory & Procurement UI (4 pages)
- [ ] POS for Staff (1 page)
- [ ] Integration tests

### Phase C: Customer Experience (2-3 tuần)
- [ ] Customer Portal upgrade (7 new tabs)
- [ ] Booking system end-to-end
- [ ] Loyalty program end-to-end
- [ ] Feedback & Reviews

### Phase D: Staff Empowerment (2 tuần)
- [ ] Task Board
- [ ] My Schedule, Notifications, Daily Report
- [ ] Knowledge Base
- [ ] My Performance dashboard

### Phase E: Platform Maturity (2 tuần)
- [ ] Security Center
- [ ] Revenue Analytics
- [ ] Tenant Lifecycle Manager
- [ ] Feature Flag Manager

### Phase F: AI & Automation (2-3 tuần)
- [ ] 13 new AI agents
- [ ] 10 built-in automation workflows
- [ ] Blockchain anchoring expansion
- [ ] End-to-end testing

**Total estimated: 13-17 tuần (~3-4 tháng)**

---

## 14. Quy tắc bắt buộc khi triển khai

1. **ZERO MOCK** — Mọi API phải kết nối database thật, không giả lập
2. **LÀM VIỆC CHỖ NÀO CHỈ SỬA CHỖ ĐÓ** — Không ảnh hưởng modules khác
3. **TOP-DOWN** — Bắt đầu từ UI/UX → nếu thiếu API → xây API → nếu thiếu DB → tạo schema
4. **AI EVERYWHERE** — Mỗi module phải có ít nhất 1 AI agent
5. **BLOCKCHAIN AUDIT** — Mọi critical transaction phải anchor blockchain
6. **AUTOMATION FIRST** — Nghiệp vụ lặp lại phải được tự động hóa
