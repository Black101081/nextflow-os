# Nextflow OS – Phase 3: Vertical Pack Implementation Plan

**Document ID:** 201_PHASE3_VERTICAL_PACK_IMPLEMENTATION_PLAN  
**Pack:** 10 — Vertical Industry Packs  
**Version:** 1.0  
**Status:** ACTIVE — Phase 3 Execution  
**Date:** 2026-07-15  
**Primary Owner:** AI Agent Antigravity  
**Dependent Docs:** 200_VERTICAL_PACKS_FEATURE_ANALYSIS, 14_CAPABILITY_ROADMAP_AND_PHASES  

---

## 1. Mục tiêu Phase 3

Phase 3 có mục tiêu: **Biến hệ thống template đơn thuần thành các Vertical Pack chạy thật**, với đầy đủ entities, workflows, SLAs và tích hợp thực tế cho từng ngành. Không còn placeholder, không còn mock data.

### 1.1 Định nghĩa "Done" của Phase 3

Một Vertical Pack được coi là DONE khi:
- [ ] Entities được định nghĩa trong DB schema thật (PostgreSQL)
- [ ] API CRUD đầy đủ cho entities
- [ ] Ít nhất 2 Automation Workflows chạy thật (không phải mock)
- [ ] SLA Engine enforce được ít nhất 1 policy/pack
- [ ] UI hiển thị được data thật từ pack
- [ ] Docs đặc tả chi tiết được viết và approve

---

## 2. Thứ tự ưu tiên triển khai

Ưu tiên theo: Độ phức tạp thấp → High Revenue Potential → Market Demand.

| STT | Pack | Độ phức tạp | Revenue Potential | Ưu tiên |
|---|---|---|---|---|
| 1 | Spa & Clinic | Thấp | Cao | **P1 - First** |
| 2 | Auto Repair & Garage | Thấp | Cao | **P1 - First** |
| 3 | F&B Standard | Trung bình | Rất cao | **P2** |
| 4 | Edu & Training | Trung bình | Cao | **P2** |
| 5 | Hospitality | Trung bình | Cao | **P2** |
| 6 | Retail Pro | Cao | Rất cao | **P3** |
| 7 | Logistics & Delivery | Cao | Cao | **P3** |
| 8 | Real Estate Agency | Trung bình | Cao | **P3** |
| 9 | Pharmacy & Healthcare | Cao (compliance) | Trung bình | **P4** |
| 10 | Contractor & Interior | Cao | Trung bình | **P4** |
| 11 | Professional Services | Thấp | Trung bình | **P4** |
| 12 | Micro-Manufacturing | Cao | Trung bình | **P4** |

---

## 3. Chi tiết kỹ thuật cho từng Pack

### 3.1 Spa & Clinic — Technical Spec

**Backend changes cần thiết:**

```sql
-- Migration mới: spa_pack_entities
CREATE TABLE IF NOT EXISTS nf_tenant.spa_skin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id),
    customer_id UUID NOT NULL,
    skin_type VARCHAR(50),
    issues TEXT[],
    current_treatment VARCHAR(200),
    history JSONB DEFAULT '[]',
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.spa_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id),
    customer_id UUID NOT NULL,
    service VARCHAR(200),
    scheduled_at TIMESTAMPTZ,
    technician_id UUID,
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.spa_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id),
    customer_id UUID NOT NULL,
    course_name VARCHAR(200),
    total_sessions INT,
    used_sessions INT DEFAULT 0,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints cần xây:**
```
GET    /api/v1/spa/bookings          - Danh sách lịch hẹn
POST   /api/v1/spa/bookings          - Tạo lịch hẹn mới
PUT    /api/v1/spa/bookings/:id      - Cập nhật trạng thái
GET    /api/v1/spa/skin-profiles/:customerId  - Hồ sơ da của khách
POST   /api/v1/spa/skin-profiles     - Tạo/Cập nhật hồ sơ da
GET    /api/v1/spa/courses           - Danh sách liệu trình
POST   /api/v1/spa/courses/use/:id   - Sử dụng 1 buổi liệu trình
```

**Frontend Components cần tạo:**
- `SpaBookingCalendar.tsx` — Calendar view lịch hẹn theo kỹ thuật viên
- `SkinProfileCard.tsx` — Hiển thị hồ sơ da với before/after photos
- `CourseProgressBar.tsx` — Tiến độ liệu trình còn lại
- `SpaReminderWorkflow.tsx` — Cấu hình workflow nhắc lịch

**Automation Workflow (N8N-style trong DB):**
```json
{
  "name": "Booking Auto Reminder",
  "trigger": {"type": "scheduler", "offsetHours": -24, "field": "scheduled_at"},
  "nodes": [
    {
      "id": "check_confirmed",
      "type": "Condition",
      "condition": "booking.status == 'Confirmed'",
      "next_pass": ["send_zalo_reminder"],
      "next_fail": []
    },
    {
      "id": "send_zalo_reminder",
      "type": "ZaloZNS",
      "template_id": "spa_booking_remind",
      "recipient": "{{customer.phone}}",
      "data": {"service": "{{booking.service}}", "time": "{{booking.scheduled_at}}"},
      "next": ["set_4h_check"]
    },
    {
      "id": "set_4h_check",
      "type": "Delay",
      "hours": 20,
      "next": ["call_if_no_confirm"]
    },
    {
      "id": "call_if_no_confirm",
      "type": "CreateWorkItem",
      "queue": "Telesale & Đặt lịch",
      "title": "Gọi xác nhận lịch hẹn",
      "priority": 1,
      "next": []
    }
  ]
}
```

---

### 3.2 Auto Repair & Garage — Technical Spec

**Backend changes cần thiết:**

```sql
CREATE TABLE IF NOT EXISTS nf_tenant.auto_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    owner_customer_id UUID,
    current_mileage INT,
    last_service_date DATE,
    next_service_date DATE,
    next_service_mileage INT,
    UNIQUE(tenant_id, license_plate)
);

CREATE TABLE IF NOT EXISTS nf_tenant.auto_repair_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID REFERENCES nf_tenant.auto_vehicles(id),
    check_in_time TIMESTAMPTZ,
    symptoms TEXT,
    diagnosis_items JSONB DEFAULT '[]',
    total_estimate DECIMAL(15,2),
    customer_approved BOOLEAN DEFAULT FALSE,
    technician_id UUID,
    status VARCHAR(50) DEFAULT 'Received',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints cần xây:**
```
GET    /api/v1/garage/vehicles              - Tra cứu xe theo biển số
POST   /api/v1/garage/vehicles              - Đăng ký xe mới
GET    /api/v1/garage/repair-orders         - Danh sách phiếu sửa chữa
POST   /api/v1/garage/repair-orders         - Tạo phiếu tiếp nhận mới
PUT    /api/v1/garage/repair-orders/:id/approve  - Khách duyệt báo giá
PUT    /api/v1/garage/repair-orders/:id/complete - Hoàn thành sửa chữa
```

**Frontend Components:**
- `VehicleSearchBar.tsx` — Tìm kiếm xe theo biển số
- `DiagnosisChecklist.tsx` — Danh sách 20 hạng mục kiểm tra
- `RepairQuoteCard.tsx` — Báo giá với approval button
- `MaintenanceScheduleView.tsx` — Lịch bảo dưỡng định kỳ

---

### 3.3 F&B Standard — Technical Spec

**Backend changes cần thiết:**

```sql
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    table_number VARCHAR(20),
    items JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'Received',
    served_by UUID,
    total_amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.fnb_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    shift_date DATE,
    shift_type VARCHAR(20), -- Morning, Afternoon, Evening
    planned_staff JSONB DEFAULT '[]',
    actual_staff JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.fnb_ingredient_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    check_date DATE,
    items JSONB DEFAULT '[]',
    checked_by UUID,
    issues TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
);
```

**Automation Workflows:**
1. Daily Shift Reminder — T-2h: Zalo nhắc từng nhân viên
2. Ingredient Alert — khi inventory < threshold: Create purchase Work Item
3. Bad Review Handler — Webhook từ Google/Baemin → Tạo CSKH case
4. COGS Report — 23:00 hàng ngày: AI tổng hợp → Email Owner

---

## 4. Database Migration Strategy

### 4.1 Nguyên tắc Migration
- Mỗi Pack có schema prefix riêng (spa_, auto_, fnb_, edu_...) trong namespace `nf_tenant`
- Không động vào bảng nf_core.* (shared core tables)
- Migration files đặt tại: `backend/migrations/YYYYMMDD_HHMMSS_pack_name.sql`

### 4.2 Migration Template
```sql
-- Migration: YYYYMMDD_HHMMSS_spa_pack_tables
-- Author: AI Agent Antigravity
-- Description: Create Spa & Clinic Pack tables

BEGIN;

-- Enable RLS
ALTER TABLE nf_tenant.spa_skin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON nf_tenant.spa_skin_profiles
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Create indexes
CREATE INDEX idx_spa_bookings_tenant_date ON nf_tenant.spa_bookings(tenant_id, scheduled_at);
CREATE INDEX idx_spa_bookings_customer ON nf_tenant.spa_bookings(tenant_id, customer_id);

COMMIT;
```

---

## 5. Frontend Architecture cho Vertical Packs

### 5.1 Pack Module Structure
```
frontend/src/apps/packs/
├── spa/
│   ├── index.tsx              -- Pack entry point
│   ├── components/
│   │   ├── SpaBookingCalendar.tsx
│   │   ├── SkinProfileCard.tsx
│   │   └── CourseProgressBar.tsx
│   ├── pages/
│   │   ├── SpaBookingsPage.tsx
│   │   └── SpaCustomersPage.tsx
│   └── api/
│       └── spa.api.ts         -- API calls cho Spa Pack
├── auto/
│   ├── ...
├── fnb/
│   ├── ...
```

### 5.2 Shared Pack Components (tái sử dụng)
- `PackQueueView.tsx` — Hiển thị queue theo pack
- `PackWorkflowEditor.tsx` — Cấu hình workflow N8N-style
- `PackEntityForm.tsx` — Form CRUD cho entity của pack
- `PackSLAIndicator.tsx` — Hiển thị SLA countdown
- `PackKPIDashboard.tsx` — KPI cards theo pack

---

## 6. Testing Strategy cho Phase 3

### 6.1 Unit Tests (Rust)
```rust
// backend/src/tests/pack_spa_test.rs
#[tokio::test]
async fn test_create_spa_booking() {
    // Given: Valid tenant + customer
    // When: POST /api/v1/spa/bookings
    // Then: Booking created, SLA timer started, Zalo workflow queued
}

#[tokio::test]
async fn test_spa_course_deduction() {
    // Given: Course with 10 sessions
    // When: POST /api/v1/spa/courses/use/:id
    // Then: usedSessions += 1, if usedSessions >= totalSessions → status = Expired
}
```

### 6.2 Integration Tests
- Workflow execution end-to-end
- Zalo ZNS delivery confirmation
- SLA breach trigger verification
- Multi-tenant data isolation check

### 6.3 Load Tests
- 100 concurrent bookings/minute → < 200ms P99
- Queue display refresh < 500ms với 1000 items

---

## 7. Lộ trình thực thi chi tiết

### Sprint 1 (Phase 3.1) — Tuần 1-2
- [ ] DB migration cho Spa & Auto Repair tables
- [ ] Backend API CRUD cho Spa Pack (8 endpoints)
- [ ] Backend API CRUD cho Auto Repair Pack (6 endpoints)
- [ ] Unit tests đạt 100% (tối thiểu happy path + error cases)

### Sprint 2 (Phase 3.2) — Tuần 3-4
- [ ] Frontend UI cho Spa Pack (4 components + 2 pages)
- [ ] Frontend UI cho Auto Repair (3 components + 2 pages)
- [ ] Automation Workflow: Spa Booking Reminder (chạy thật)
- [ ] Automation Workflow: Auto Maintenance Reminder (chạy thật)

### Sprint 3 (Phase 3.3) — Tuần 5-6
- [ ] DB migration + API cho F&B Pack
- [ ] DB migration + API cho Edu Pack
- [ ] Frontend UI cho F&B (Kitchen Display + Shift Management)
- [ ] Frontend UI cho Edu (Student List + Grade Entry)

### Sprint 4 (Phase 3.4) — Tuần 7-8
- [ ] Hospitality Pack (Booking + Housekeeping + Smart Lock)
- [ ] Real Estate Pack (Lead + Listing + Deal)
- [ ] End-to-end integration tests cho 6 packs đầu tiên

### Sprint 5 (Phase 3.5) — Tuần 9-12
- [ ] Logistics Pack (Waybill + COD Reconciliation + AI Route)
- [ ] Pharmacy Pack (Prescription + AI Drug Interaction Check)
- [ ] Contractor Pack (Project + Daily Log + Material Request)
- [ ] Professional Services Pack (Client + Contract + Tax Filing)
- [ ] Micro-Manufacturing Pack (Work Order + BOM + QC)
- [ ] Full regression test toàn bộ 12 packs

---

## 8. Acceptance Criteria Phase 3

### 8.1 Technical Gates
- [ ] 0 mock data trong production code
- [ ] Test coverage ≥ 85% cho pack business logic
- [ ] P99 response time < 300ms cho tất cả pack APIs
- [ ] Multi-tenant isolation verified (automated security test)

### 8.2 Product Gates
- [ ] Mỗi pack có ít nhất 1 workflow chạy thật end-to-end
- [ ] SLA engine enforce được cho tất cả 12 packs
- [ ] Customer Portal hiển thị data đúng theo pack của tenant
- [ ] Mobile app hỗ trợ tác nghiệp tại hiện trường cho 6 packs ưu tiên

### 8.3 Documentation Gates
- [ ] 200_VERTICAL_PACKS_FEATURE_ANALYSIS.md — APPROVED
- [ ] 201_PHASE3_VERTICAL_PACK_IMPLEMENTATION_PLAN.md — APPROVED
- [ ] 202_PHASE3_DATABASE_SCHEMA_ALL_PACKS.md — WRITTEN
- [ ] 203_PHASE3_API_REFERENCE_ALL_PACKS.md — WRITTEN
- [ ] 002_OS_PRODUCTION_RULES_AND_DEVELOPMENT_LOG.md — UPDATED
