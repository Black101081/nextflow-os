# Nextflow OS — UI/UX Design Audit & Additional Missing Modules

**Document ID:** 301_UIUX_DESIGN_AUDIT_AND_MISSING_MODULES  
**Version:** 1.0  
**Status:** PLANNING  
**Date:** 2026-07-15  
**Prerequisite:** 300_NEXTFLOW_OS_4_LAYER_UPGRADE_MASTERPLAN  

---

## 1. UI/UX Design Audit — Đánh giá hiện trạng thiết kế

### 1.1 Tổng điểm UI/UX theo tầng

| Tầng | Điểm Design (1-10) | Đánh giá tổng quát |
|---|---|---|
| **Layer 1: Platform Admin** | 7/10 | Khá tốt. Có sidebar collapsible, tab navigation, glassmorphism, dark theme nhất quán |
| **Layer 2: SME Leader** | 5/10 | Trung bình. Sidebar Tailwind hardcoded, thiếu nhóm navigation, thiếu breadcrumb, thiếu sub-navigation cho modules phức tạp |
| **Layer 3: Staff Workspace** | 3/10 | **RẤT TỆ.** Inline styles, layout đơn giản, sidebar chỉ 5 links, không có design system consistency, brand logo "SS" generic |
| **Layer 4: Customer Portal** | 4/10 | **TỆ.** Single page + 3 tabs, không có proper navigation, không responsive tốt, không mobile-first |

### 1.2 Chi tiết vấn đề UI/UX từng tầng

---

#### Layer 2: SME Leader Dashboard (8082) — Vấn đề Design

**Vấn đề cấu trúc navigation:**
```
HIỆN TẠI (FLAT — KHÔNG CÓ NHÓM):
├── Bảng điều khiển
├── Pack Operations Hub
├── KiotViet Kanban
├── Analytics & Báo cáo
├── Chợ ứng dụng
├── Thanh toán & Gói cước
├── Cấu hình Tích hợp
├── Omni-Channel Chat
├── Tự động hóa
├── Gamification & KPI
├── Quản lý Thực thể
├── Admin Dashboard
```

**Vấn đề:**
1. **Không có navigation groups** — Tất cả 12 items nằm trong 1 danh sách phẳng. Khi thêm Finance, HR, Inventory, CRM sẽ lên 20+ items → chaos
2. **Không có breadcrumb** — User không biết mình đang ở đâu trong hierarchy
3. **Không có sub-navigation** — Pack pages (spa, fnb, etc.) không có sub-menu riêng
4. **Sidebar dùng Tailwind hardcoded** thay vì CSS custom properties
5. **Thiếu notification bell** trong header
6. **Thiếu search global** (Cmd+K pattern)
7. **Thiếu user avatar + dropdown** trong header
8. **Không responsive** — Sidebar không collapse trên tablet

**NÊN SỬA THÀNH (GROUPED NAVIGATION):**
```
📊 TỔNG QUAN
├── Dashboard
├── Analytics & BI

💰 TÀI CHÍNH
├── Tổng quan Tài chính
├── Sổ quỹ
├── Công nợ phải thu
├── Công nợ phải trả
├── Hóa đơn
├── Báo cáo tài chính

👥 NHÂN SỰ
├── Nhân viên
├── Chấm công
├── Nghỉ phép
├── Bảng lương
├── Sơ đồ tổ chức

📦 KHO & MUA HÀNG
├── Tồn kho
├── Nhập xuất kho
├── Đặt hàng NCC
├── Nhà cung cấp

🎯 KINH DOANH
├── Pipeline bán hàng
├── Khách hàng 360°
├── Chiến dịch Marketing
├── Lead Capture

🏭 VẬN HÀNH NGÀNH
├── Pack Operations Hub
├── [Dynamic: Pack-specific pages]

🤖 TỰ ĐỘNG HÓA
├── Automation Workflows
├── Workflow Builder
├── Integration Hub

📱 GIAO TIẾP
├── Omni-Channel Chat
├── Notification Center

⚙️ HỆ THỐNG
├── Chợ ứng dụng
├── Entity Builder
├── Thanh toán & Gói cước
├── Admin Dashboard
```

---

#### Layer 3: Staff Workspace (8083) — Vấn đề Design NGHIÊM TRỌNG

**Vấn đề code:**
```tsx
// HIỆN TẠI — Dùng inline styles (ANTI-PATTERN cực kỳ tệ!)
<div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', 
  display: 'flex', alignItems: 'center', gap: '12px' }}>
  <div className="brand-logo" style={{ width: '32px', height: '32px', 
    fontSize: '14px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>SS</div>
```

**Danh sách vấn đề nghiêm trọng:**

1. **Inline styles tràn lan** — `SmeStaffLayout.tsx` sử dụng inline styles thay vì CSS classes/design tokens. Đây là anti-pattern nghiêm trọng nhất
2. **Embedded `<style>` tag** — CSS nằm trong JSX thay vì file CSS riêng biệt
3. **Brand logo "SS"** — Generic, không nhất quán với "NX" ở Leader, không thể brand cho tenant
4. **Chỉ có 5 sidebar links** — Quá ít cho một workspace vận hành hàng ngày
5. **Bottom navigation chỉ 4 items** (mobile) — Thiếu POS, Schedule, Notifications
6. **Không có header bar** — Thiếu search, notifications, user profile
7. **Không có dark/light mode toggle** — Staff có thể làm việc ban ngày
8. **CSS custom properties không nhất quán** — Dùng `var(--bg-color)` và `var(--surface-color)` nhưng không defined trong `:root`
9. **Không có loading skeleton** — Content flash khi load
10. **Không có empty states** — Khi không có data, hiển thị blank
11. **Typography không nhất quán** — Font size, weight hardcoded khắp nơi
12. **Không có toast notifications** — Success/error feedback thiếu

**MẪU NAVIGATION MỚI CHO STAFF (Mobile-first):**
```
BOTTOM NAV (Mobile — 5 tabs max):
├── 🏠 Home (Task Board)
├── 🛒 POS
├── 📋 Tasks
├── 💬 Chat
├── 👤 Tôi (Profile/KPI/Notifications)

SIDEBAR (Desktop):
📋 CÔNG VIỆC
├── Task Board
├── Hộp thư công việc (Command Center)

🛒 BÁN HÀNG
├── POS / Bán hàng nhanh
├── Tra cứu khách hàng

📅 LỊCH TRÌNH
├── Ca làm việc
├── Check-in

📚 KIẾN THỨC
├── SOP & Hướng dẫn
├── Báo cáo cuối ca

📱 TIỆN ÍCH
├── Quét QR
├── Chat
├── Thành tích & KPI
├── Thông báo
```

---

#### Layer 4: Customer Portal (8084) — Vấn đề Design

**Vấn đề cấu trúc:**
```tsx
// HIỆN TẠI — 1 page duy nhất, 3 tabs
<Route path="/customer" element={<CustomerPortal />} />
// Không có routing, không có separate pages
```

**Danh sách vấn đề:**

1. **Single-page + tabs** — Toàn bộ portal nằm trong 1 component `CustomerPortal.tsx`. Không scalable
2. **Không có authentication** — Customer không cần đăng nhập (API routes không có auth middleware)
3. **Tab navigation flat** — 3 tabs (Home, Track, AI Chat) không đủ cho 10+ features
4. **Không có proper routing** — Tất cả tabs dùng state, không có URL paths riêng
5. **Không responsive tốt** — Thiếu mobile-first breakpoints
6. **Thiếu brand customization** — Không thể thay đổi logo/màu theo từng tenant
7. **Không PWA** — Không thể "Add to Home Screen"
8. **Không có loading states** — Data flash
9. **Không có offline support** — Mất mạng = trắng trang

**KIẾN TRÚC MỚI CHO CUSTOMER PORTAL:**
```
ROUTING MỚI (Multi-page):
/customer                    → Landing / Home
/customer/login              → Login / Register (Phone OTP)
/customer/account            → Profile & Settings
/customer/catalog            → Product/Service Catalog
/customer/booking            → Online Booking
/customer/orders             → Order History
/customer/tracking/:id       → Real-time Tracking
/customer/loyalty            → Loyalty & Rewards
/customer/feedback           → Feedback & Reviews
/customer/help               → Help Center & FAQ
/customer/chat               → AI Chat

BOTTOM NAV (Mobile):
├── 🏠 Home
├── 📦 Đơn hàng
├── 📅 Đặt lịch
├── 🎁 Ưu đãi
├── 👤 Tài khoản
```

---

## 2. Modules THIẾU bổ sung (ngoài doc 300)

Sau khi nghiên cứu thêm các nền tảng quản lý SME hàng đầu (Odoo, NetSuite, Dynamics 365, KiotViet, Sapo), phát hiện thêm các module còn thiếu:

### 2.1 Layer 2 — SME Leader: Modules bổ sung

#### A. Contract Management (Quản lý Hợp đồng)

**Vì sao cần:** SME ký hợp đồng với khách hàng, nhà cung cấp, nhân viên, đối tác. Thiếu quản lý hợp đồng = mất kiểm soát pháp lý.

**Page: `ContractManager.tsx`**
- Danh sách hợp đồng (active, expired, draft)
- Tạo hợp đồng từ template
- Alert trước khi hết hạn (30 ngày, 7 ngày)
- E-signature (digital signature)
- Lưu trữ file scan
- Blockchain: Hash hợp đồng → immutable proof

**Database Schema:**
```sql
CREATE TABLE nf_core.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_number VARCHAR(30) NOT NULL,
    contract_type VARCHAR(30) NOT NULL,      -- 'CUSTOMER', 'SUPPLIER', 'EMPLOYMENT', 'PARTNERSHIP', 'LEASE'
    title VARCHAR(300) NOT NULL,
    counterpart_name VARCHAR(200),
    counterpart_id UUID,                      -- customer_id hoặc supplier_id hoặc employee_id
    value DECIMAL(15,2),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_notice_days INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'DRAFT',       -- DRAFT/ACTIVE/EXPIRED/TERMINATED/RENEWED
    terms TEXT,
    attachments JSONB DEFAULT '[]',           -- [{file_url, file_name, uploaded_at}]
    signed_by_us UUID,
    signed_by_counterpart VARCHAR(200),
    digital_signature_hash VARCHAR(100),
    blockchain_hash VARCHAR(100),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Automation Workflow:**
```yaml
workflow: contract_expiry_reminder
trigger: cron.daily_8am
condition: contracts WHERE end_date BETWEEN today() AND today() + interval '30 days' AND reminder_sent = false
nodes:
  - id: send_alert
    type: action
    action: send_notification
    channel: [websocket, email]
    message: "Hợp đồng #{contract_number} sẽ hết hạn trong #{days_left} ngày"
  - id: create_task
    type: action
    action: create_work_item
    queue: 'Gia hạn Hợp đồng'
```

---

#### B. Asset Management (Quản lý Tài sản)

**Vì sao cần:** SME có tài sản cố định (máy móc, xe, máy tính, bàn ghế...). Cần theo dõi giá trị, khấu hao, bảo trì.

**Page: `AssetManager.tsx`**
- Danh sách tài sản (tên, mã, vị trí, giá trị, trạng thái)
- QR code cho mỗi tài sản (scan = xem chi tiết)
- Lịch sử bảo trì
- Tính khấu hao tự động
- AI: Predictive maintenance (dự đoán hỏng hóc)

**Database Schema:**
```sql
CREATE TABLE nf_core.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    asset_code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),                -- 'EQUIPMENT', 'VEHICLE', 'IT', 'FURNITURE', 'PROPERTY'
    location VARCHAR(200),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    depreciation_method VARCHAR(20),     -- 'STRAIGHT_LINE', 'DECLINING_BALANCE'
    useful_life_years INT,
    monthly_depreciation DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'IN_USE', -- IN_USE, MAINTENANCE, RETIRED, DISPOSED
    assigned_to UUID,                    -- employee_id
    serial_number VARCHAR(100),
    warranty_expiry DATE,
    qr_code VARCHAR(100),
    image_url TEXT,
    maintenance_log JSONB DEFAULT '[]',
    last_maintenance_at TIMESTAMPTZ,
    next_maintenance_at TIMESTAMPTZ,
    blockchain_hash VARCHAR(100),        -- Anchor khi dispose/transfer
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### C. Project Management (Quản lý Dự án — cho Contractor, Professional Services)

**Vì sao cần:** Đặc biệt quan trọng cho các pack Contractor, Professional Services, Manufacturing. Thiếu quản lý dự án = thiếu khả năng track progress, milestones, budget.

**Pages cần tạo:**
1. **`ProjectDashboard.tsx`** — Overview tất cả projects
2. **`ProjectDetail.tsx`** — Timeline/Gantt, milestones, tasks, budget vs actual
3. **`ProjectTimesheet.tsx`** — Time tracking theo project/phase

**Database Schema:**
```sql
CREATE TABLE nf_core.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    project_code VARCHAR(30) NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    customer_id UUID,
    customer_name VARCHAR(200),
    project_type VARCHAR(30),            -- 'CONSTRUCTION', 'CONSULTING', 'DEVELOPMENT', 'SERVICE'
    status VARCHAR(20) DEFAULT 'PLANNING', -- PLANNING/IN_PROGRESS/ON_HOLD/COMPLETED/CANCELLED
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    manager_id UUID,
    team_members JSONB DEFAULT '[]',     -- [{employee_id, role}]
    milestones JSONB DEFAULT '[]',       -- [{name, target_date, status, actual_date}]
    contract_id UUID REFERENCES nf_core.contracts(id),
    blockchain_hash VARCHAR(100),        -- Anchor milestones completion
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_core.project_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES nf_core.projects(id),
    employee_id UUID NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(4,1) NOT NULL,
    task_description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2),
    amount DECIMAL(15,2),
    approved_by UUID,
    status VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT/SUBMITTED/APPROVED/REJECTED
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AI Integration:**
- `ProjectCompletionPredictor` — Dựa trên progress hiện tại + remaining tasks → dự đoán ngày hoàn thành thực tế
- `BudgetOverrunDetector` — Phát hiện sớm project sắp vượt budget → alert

---

#### D. E-commerce & Multi-channel Sales (Bán hàng đa kênh)

**Vì sao cần:** SME Việt Nam bán hàng trên nhiều kênh: Shopee, Lazada, TikTok Shop, Facebook, Website. Cần đồng bộ tồn kho, đơn hàng.

**Page: `MultiChannelSales.tsx`**
- Kết nối sàn TMĐT (Shopee, Lazada, TikTok Shop)
- Đồng bộ tồn kho realtime
- Dashboard đơn hàng đa kênh
- AI: Gợi ý kênh tối ưu, pricing theo kênh

**Database Schema:**
```sql
CREATE TABLE nf_core.sales_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    channel_type VARCHAR(30) NOT NULL,    -- 'SHOPEE', 'LAZADA', 'TIKTOK', 'FACEBOOK', 'WEBSITE', 'WALK_IN', 'ZALO'
    channel_name VARCHAR(100),
    api_key_encrypted TEXT,
    shop_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sync_inventory BOOLEAN DEFAULT TRUE,
    sync_orders BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_core.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    channel_id UUID REFERENCES nf_core.sales_channels(id),
    channel_type VARCHAR(30),
    channel_order_id VARCHAR(100),        -- ID trên sàn TMĐT
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(15,2),
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2),
    payment_method VARCHAR(30),
    payment_status VARCHAR(20),           -- PENDING/PAID/COD/REFUNDED
    fulfillment_status VARCHAR(20),       -- PENDING/PROCESSING/SHIPPED/DELIVERED/RETURNED
    tracking_number VARCHAR(100),
    shipping_provider VARCHAR(50),        -- 'GHN', 'GHTK', 'J&T', 'VIETTEL_POST'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### E. Expense Claims & Petty Cash (Chi phí & Tạm ứng)

**Vì sao cần:** Nhân viên cần kê khai chi phí công tác, tiếp khách, mua vật tư → cần quy trình approval.

**Page: `ExpenseClaims.tsx`**
- Nhân viên tạo phiếu chi
- Chụp ảnh hoá đơn (receipt photo)
- Approval flow (Leader approve)
- Auto-categorize bằng AI (OCR + NLP)
- Sync vào sổ quỹ tự động

**Database Schema:**
```sql
CREATE TABLE nf_finance.expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    claim_number VARCHAR(30) NOT NULL,
    employee_id UUID NOT NULL,
    employee_name VARCHAR(200),
    category VARCHAR(50),                 -- 'TRAVEL', 'ENTERTAINMENT', 'SUPPLIES', 'TRANSPORT', 'OTHER'
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    receipt_url TEXT,                      -- Photo of receipt
    receipt_ai_data JSONB,                -- AI OCR extracted data
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING/APPROVED/REJECTED/PAID
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### F. Tax & Compliance Center (Thuế & Tuân thủ)

**Vì sao cần:** Đây là yêu cầu pháp lý bắt buộc cho mọi SME Việt Nam.

**Pages cần tạo:**
1. **`TaxDashboard.tsx`** — Tổng quan nghĩa vụ thuế
   - VAT tháng/quý
   - Thuế TNCN nhân viên
   - Thuế TNDN
   - Lịch nộp thuế (deadline calendar)
   - AI: Gợi ý tiết kiệm thuế hợp pháp

2. **`EInvoiceCenter.tsx`** — Hoá đơn điện tử
   - Kết nối nhà cung cấp HĐĐT (VNPT, Viettel, FPT)
   - Xuất HĐĐT từ invoice/POS order
   - Tra cứu HĐĐT đã xuất

**Database Schema:**
```sql
CREATE TABLE nf_finance.tax_filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tax_type VARCHAR(20) NOT NULL,        -- 'VAT', 'PIT', 'CIT'
    period VARCHAR(10) NOT NULL,          -- '2026-Q3' hoặc '2026-07'
    taxable_amount DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'DRAFT',   -- DRAFT/COMPUTED/FILED/PAID
    due_date DATE,
    filed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    filing_reference VARCHAR(100),
    blockchain_hash VARCHAR(100),         -- Anchor bản khai thuế
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nf_finance.e_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    invoice_id UUID REFERENCES nf_finance.invoices(id),
    e_invoice_number VARCHAR(50),         -- Số HĐĐT
    e_invoice_serial VARCHAR(20),         -- Ký hiệu
    provider VARCHAR(30),                 -- 'VNPT', 'VIETTEL', 'FPT'
    xml_data TEXT,                        -- XML theo format thuế VN
    pdf_url TEXT,
    status VARCHAR(20),                   -- ISSUED/REPLACED/CANCELLED
    issued_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.2 Layer 3 — Staff Workspace: Modules bổ sung

#### G. Inventory Quick Check (Tra cứu tồn kho nhanh)

**Page: `InventoryQuickCheck.tsx`**
- Staff scan barcode → xem tồn kho tức thì
- Search by name/SKU
- Quick adjust (nhập nhanh, xuất nhanh)
- Giao diện siêu đơn giản, mobile-optimized

#### H. Expense Quick Submit (Kê khai chi phí nhanh)

**Page: `ExpenseQuickSubmit.tsx`**
- Chụp receipt → AI OCR auto-fill
- Chọn category
- Submit → Auto-route to Leader for approval
- History chi phí đã submit

---

### 2.3 Layer 4 — Customer Portal: Modules bổ sung

#### I. Referral Program (Chương trình giới thiệu)

Integrated into LoyaltyTab:
- Share referral link/code
- Track referrals (who signed up, who purchased)
- Earn bonus points per successful referral

#### J. Subscription Management (Quản lý gói dịch vụ — cho Edu, Gym, Spa)

**Page/Tab: `SubscriptionTab`**
- Xem gói đang dùng (Yoga 1 tháng, PT 10 buổi, etc.)
- Còn lại bao nhiêu buổi
- Gia hạn online
- Freeze/Pause gói

**Database Schema:**
```sql
CREATE TABLE nf_core.customer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200),
    package_name VARCHAR(200) NOT NULL,
    package_type VARCHAR(30),             -- 'SESSION_BASED', 'TIME_BASED', 'UNLIMITED'
    total_sessions INT,                    -- For SESSION_BASED
    used_sessions INT DEFAULT 0,
    remaining_sessions INT GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',   -- ACTIVE/FROZEN/EXPIRED/CANCELLED
    frozen_at TIMESTAMPTZ,
    frozen_until DATE,
    price DECIMAL(15,2),
    auto_renew BOOLEAN DEFAULT FALSE,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Design System Upgrade — Đề xuất

### 3.1 Vấn đề Design System hiện tại

| Vấn đề | Chi tiết | Mức độ |
|---|---|---|
| **Inline styles** | Staff layout dùng inline styles → không maintain được | CRITICAL |
| **Style tag trong JSX** | `<style>{...}</style>` trong React component | CRITICAL |
| **Tailwind + Vanilla CSS lẫn lộn** | Leader dùng Tailwind classes, Staff dùng CSS variables | HIGH |
| **Không có component library** | Mỗi page tự tạo button, card, table, modal riêng | HIGH |
| **Không có spacing scale** | Padding/margin hardcoded: 12px, 16px, 24px, etc. | MEDIUM |
| **Thiếu responsive breakpoints** | Chỉ có `max-width: 768px`, thiếu tablet, large screen | HIGH |
| **Thiếu animation tokens** | Mỗi component tự define transition | MEDIUM |
| **Brand không nhất quán** | Platform="NX", Leader="NX", Staff="SS", Customer=không có | HIGH |

### 3.2 Design System Upgrade Plan

**Nguyên tắc:**
1. **Single CSS approach** — Quyết định Tailwind HOẶC Vanilla CSS, KHÔNG MIX
2. **Component standardization** — Tạo shared component library: Button, Card, Table, Modal, Badge, Toast, Skeleton, EmptyState
3. **Design tokens nhất quán** — Tất cả 4 tầng dùng cùng design tokens
4. **Responsive-first** — Mobile → Tablet → Desktop
5. **Dark mode default + Light mode option**

**Shared Components cần tạo (`frontend/src/shared/components/ui/`):**
```
ui/
├── Button.tsx           — Primary, Secondary, Outline, Ghost, Danger, Loading state
├── Card.tsx             — Default, Glass, Elevated, Interactive
├── Table.tsx            — Sortable, Filterable, Paginated, Responsive
├── Modal.tsx            — Default, Confirm, Full-screen, Slide-over
├── Toast.tsx            — Success, Error, Warning, Info
├── Badge.tsx            — Status, Count, Icon
├── Input.tsx            — Text, Number, Date, Select, Textarea
├── Skeleton.tsx         — Line, Card, Table, Avatar
├── EmptyState.tsx       — Icon + Title + Description + CTA
├── Avatar.tsx           — Image, Initials, Size variants
├── Tabs.tsx             — Horizontal, Vertical, Underline, Pill
├── Breadcrumb.tsx       — Navigation breadcrumbs
├── Dropdown.tsx         — Menu, Select, Filter
├── SearchBar.tsx        — Global search (Cmd+K)
├── Sidebar.tsx          — Collapsible, Grouped navigation
├── DatePicker.tsx       — Single date, Range, Calendar
├── Charts.tsx           — Area, Bar, Pie, Line (wrapper cho Recharts)
├── KPICard.tsx          — Value + Label + Trend + Sparkline
├── StatusBadge.tsx      — Dynamic color per status
├── FileUpload.tsx       — Drag-drop, Preview, Progress
└── ConfirmDialog.tsx    — Confirm dangerous actions
```

---

## 4. Tổng kết bổ sung — Updated Metrics

### Modules bổ sung (ngoài doc 300)

| # | Module | Tầng | Pages | Tables | Endpoints |
|---|---|---|---|---|---|
| A | Contract Management | L2 | 1 | 1 | 5 |
| B | Asset Management | L2 | 1 | 1 | 5 |
| C | Project Management | L2 | 3 | 2 | 10 |
| D | Multi-channel Sales | L2 | 1 | 2 | 8 |
| E | Expense Claims | L2+L3 | 2 | 1 | 5 |
| F | Tax & Compliance | L2 | 2 | 2 | 6 |
| G | Inventory Quick Check | L3 | 1 | 0 | 3 |
| H | Customer Subscriptions | L4 | 1 | 1 | 5 |
| **Total** | | | **+12** | **+10** | **+47** |

### Updated Grand Total (doc 300 + doc 301)

| Metric | Doc 300 | Doc 301 bổ sung | Grand Total |
|---|---|---|---|
| **New Pages/Tabs** | +48 | +12 | **+60** |
| **New Tables** | 26 | 10 | **36** |
| **New API Endpoints** | ~80 | ~47 | **~127** |
| **New AI Agents** | 13 | 3 | **16** |
| **Shared UI Components** | 0 | 20 | **20** |
| **Design System Overhaul** | No | Yes | **Yes** |

### Final Architecture Summary

| Tầng | Trước | Sau (Final) |
|---|---|---|
| **Layer 1** | 10 pages | 20 pages |
| **Layer 2** | 24 pages | **57 pages** (47 from 300 + 10 new) |
| **Layer 3** | 5 pages | **16 pages** (13 from 300 + 3 new) |
| **Layer 4** | 3 tabs | **11 tabs/pages** (10 from 300 + 1 new) |
| **Total** | 42 | **104** |

---

## 5. Lộ trình bổ sung — Design System Sprint

**Trước khi bắt tay xây modules, PHẢI làm:**

### Sprint 0: Design System Foundation (1 tuần)
- [ ] Quyết định style approach: Pure Vanilla CSS (remove Tailwind mixing)
- [ ] Tạo 20 shared UI components
- [ ] Refactor Staff Layout — loại bỏ inline styles
- [ ] Refactor Customer Portal — multi-page routing
- [ ] Refactor Leader Sidebar — grouped navigation
- [ ] Standardize brand: "NX" logo across all layers
- [ ] Add global search (Cmd+K), notification bell, user avatar dropdown
- [ ] Add breadcrumb navigation

**Sau Sprint 0 mới bắt đầu xây modules theo Phase A-F.**
