# Nextflow OS – Onboarding Checklist for Internal Teams Using Scenario Library

**Document ID:** 62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Pilot Delivery / QA Systems / Customer Success / Sales Enablement  
**Dependent Packs:** Frontend Delivery, Backend Workflow, Mobile Platform, Analytics & Data, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS

## 1. Mục tiêu tài liệu

Tài liệu này cung cấp **onboarding checklist cho các team nội bộ** (Product, QA, Pilot Delivery, CS, Sales, Analytics…) khi bắt đầu sử dụng **Scenario Library và các assets đi kèm** của Pack 03: demo scripts, QA scenarios, pilot dashboards, support guide, field playbook, post-pilot template. Mục tiêu là để mọi team:

- hiểu **Scenario Library là gì, không phải gì**;  
- biết **tìm gì, ở đâu**;  
- biết **cách chạy một scenario “đúng chuẩn”**;  
- biết **cách dùng scenarios, environments, dashboards, support guide** trong công việc hàng ngày (demo, QA, pilot, training, triage).

Template này không đi sâu định nghĩa lại toàn bộ library, mà đưa ra **checklist từng bước** cho team mới trong 2–4 tuần đầu khi “onboard” vào Pack 03 Scenario System.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của onboarding checklist này trong Pack 03.  
2. Onboarding thesis của tài liệu.  
3. Danh sách các nhóm nội bộ chính và nhu cầu của họ với Scenario Library.  
4. Checklist cơ bản chung cho mọi nhóm (foundation).  
5. Checklist bổ sung cho Product / Design / UX.  
6. Checklist bổ sung cho QA / Engineering.  
7. Checklist bổ sung cho Pilot Delivery / CS / Support.  
8. Checklist bổ sung cho Sales / Enablement.  
9. Checklist về việc dùng dashboards, field playbook và support guide cùng scenarios.  
10. Rules cho việc yêu cầu thêm mới hoặc chỉnh sửa scenario.  
11. Những anti-pattern sử dụng Scenario Library phải tránh.  
12. Cách dùng checklist này trong onboarding cá nhân và onboarding team.  
13. Các tài liệu tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Onboarding thesis cho Pack 03 Scenario Library

Onboarding thesis có thể phát biểu như sau:

> **Scenario Library của Pack 03 chỉ thật sự có giá trị khi mọi team nội bộ biết cách tìm, dùng, và cập nhật nó như một “hạ tầng trải nghiệm” chung; nếu mỗi team tự tạo case, tự kể story, tự debug theo trí nhớ riêng, thì mọi đầu tư vào flows, metrics, dashboards, playbook và post-pilot docs sẽ bị phân mảnh.**

Từ thesis này, mười nguyên lý được suy ra:

1. Onboarding không chỉ là “biết library tồn tại”, mà phải là **biết dùng được** cho công việc hằng ngày.  
2. Mọi team nên bắt đầu từ một **set scenario chung** trước khi thêm case riêng.  
3. Scenarios phải được xem là **nguồn sự thật sống** cho cách hệ thống vận hành, không chỉ là data demo.  
4. Environments phải được dùng theo runbook (51, 58), không “test thử bừa” trên bất kỳ env nào.  
5. Dashboards và triage docs là phần của trải nghiệm scenario, không chỉ là công cụ cho analytics.  
6. Field playbook (59) và Support guide (61) là “cặp song song” với scenario library cho enablement.  
7. Mọi yêu cầu thêm/sửa scenario phải qua luồng quản trị nhẹ nhưng rõ.  
8. Onboarding cần có người “dẫn tour” và checklist, không để mỗi cá nhân tự mò.  
9. Sau onboarding, team nên có tối thiểu một buổi **scenario walkthrough** chung.  
10. Scenario library là hạ tầng dài hạn – mọi quyết định về flows, copy, metrics nên quay lại liên kết với nó.

## 3. Các nhóm nội bộ chính và nhu cầu với Scenario Library

### 3.1 Product / Design / UX

- Cần dùng scenarios để kiểm tra nhanh flows, states, copy, authority.  
- Cần kịch bản chung khi giải thích sản phẩm cho stakeholders nội bộ.  
- Cần liên kết scenarios với wireframes, component matrix, copy guidelines.

### 3.2 QA / Engineering

- Cần scenarios đã chuẩn hóa để test regression, cross-surface, authority, continuity.  
- Cần mapping scenario ↔ data ↔ env ↔ account để debug.  
- Cần dùng scenarios khi tái hiện issues từ pilot.

### 3.3 Pilot Delivery / CS / Support

- Cần scenarios để tập dượt trước pilot, training khách, support thực tế.  
- Cần liên kết scenarios với field playbook và support guide.  
- Cần case điển hình để giải thích cho khách hàng và escalates.

### 3.4 Sales / Enablement

- Cần scenarios cho demo nhất quán với product truth.  
- Cần mapping giữa demo scripts và scenarios trong library.  
- Cần hiểu giới hạn env và flows đang “ready” cho sales.

## 4. Checklist nền tảng chung cho mọi nhóm

Mọi thành viên mới nên hoàn thành các bước sau trong 1–2 tuần đầu.

### 4.1 Hiểu bức tranh tổng thể

- Đọc lướt Experience Strategy (20–22) và First Wedge Flows (25).  
- Đọc mô tả Scenario Library và Runbook (58).  
- Xem overview deck (nếu có) về cách Pack 03 dùng scenarios trong demo, QA, pilot.

### 4.2 Truy cập Scenario Library

- Xác nhận nơi lưu chính thức của Scenario Library (Notion, Sheet, DB…).  
- Học cách filter theo flow, role, surface, purpose, environment, status.  
- Mở ít nhất 3 scenario đại diện (sales, QA, cross-surface) và đọc full record.

### 4.3 Nắm khái niệm data kit / account kit / environment

- Đọc đoạn mapping scenario ↔ data kit ↔ env ↔ account trong 58 và 51.  
- Biết environment nào dùng cho demo, QA, pilot rehearsal.  
- Biết cách tìm thông tin account demo/pilot trong docs.

### 4.4 Chạy ít nhất một scenario end-to-end

- Được hướng dẫn chọn một scenario “starter” (do owner đề xuất).  
- Đăng nhập bằng account ghi trong scenario.  
- Thực hiện các bước trong scenario, ghi lại phản hồi/câu hỏi.  
- Thử nhìn signals liên quan trong dashboards nếu có.

## 5. Checklist bổ sung cho Product / Design / UX

### 5.1 Liên kết scenarios với flows và UX docs

- Đọc các scenario gắn với flows mà team đang phụ trách.  
- Đối chiếu steps trong scenario với user flow diagrams / wireframes.  
- Check state labels, actions, messages có align copy system và state grammar không.

### 5.2 Dùng scenarios trong design review

- Chọn 2–3 scenarios tiêu biểu làm “golden path” cho review.  
- Khi review UI hoặc copy mới, luôn hỏi: **“Scenario X sẽ hiển thị ra sao sau thay đổi này?”**  
- Ghi chú ở scenario record nếu semantics hoặc steps đã đổi.

### 5.3 Góp ý và yêu cầu thêm/sửa scenario

- Khi phát hiện thiếu scenario cho một flow quan trọng, tạo request với: mục tiêu, flow, roles, env cần.  
- Khi sửa flows, update scenario mappings tương ứng.

## 6. Checklist bổ sung cho QA / Engineering

### 6.1 Dùng scenarios cho regression và cross-surface testing

- Xác định danh sách scenarios “must-run” cho mỗi release (từ 41, 52, 58).  
- Đảm bảo mỗi scenario có env/data/accounts sẵn sàng trước test.  
- Khi test cross-surface, dùng scenarios cross-surface được định nghĩa trong 56.

### 6.2 Dùng scenarios khi debug issues

- Khi nhận ticket pilot, map issue đó vào scenario hiện có hoặc tạo scenario mới nếu cần.  
- Dùng object IDs từ scenario để tra events/logs (49) và cross-surface timelines.  
- Sau khi fix, rerun scenario đó như regression.

### 6.3 Góp phần giữ env sạch

- Tuân thủ runbook prepare/run/reset env (51, 58).  
- Không “phá” data kit hoặc account kit để test ad-hoc – nếu cần, tạo env riêng.

## 7. Checklist bổ sung cho Pilot Delivery / CS / Support

### 7.1 Chuẩn bị trước pilot

- Chọn bộ scenarios sẽ dùng cho pilot rehearsal (từ 58).  
- Liên kết mỗi scenario với field playbook (59) và support guide (61).  
- Đảm bảo env và accounts cho pilot rehearsal được chuẩn bị theo runbook.

### 7.2 Trong pilot

- Khi training, dùng scenarios training để minh hoạ flows.  
- Khi nhận feedback, cố gắng gắn nó vào scenario cụ thể.  
- Khi có issue, dùng Support Guide (61) để intake và tra cứu, và, nếu có, xem scenario tương ứng.

### 7.3 Sau pilot

- Dùng scenarios + post-pilot template (60) để replay các case đáng chú ý.  
- Cập nhật scenario records nếu flows hoặc messaging thay đổi sau quyết định.

## 8. Checklist bổ sung cho Sales / Enablement

### 8.1 Chọn đúng scenarios demo

- Làm quen với danh sách “Sales / Value Demo Scenarios” trong library (58).  
- Xác nhận scenarios nào đang **ready** cho demo production-like, scenarios nào chỉ dùng nội bộ.  
- Dùng demo scripts (44) gắn liền với scenarios cụ thể.

### 8.2 Giữ story align với product truth

- Khi update storytelling, luôn kiểm tra lại scenarios tương ứng để không hứa quá khả năng hiện tại.  
- Nếu cần kể story mới, yêu cầu thêm scenario trước, không demo bằng “case tự tạo” lẻ loi.

### 8.3 Feedback từ khách hàng

- Ghi nhận câu hỏi/feedback của khách theo scenario họ vừa thấy.  
- Chuyển lại cho Product/CS để đi vào triage và post-pilot docs nếu relevant.

## 9. Checklist dùng dashboards, field playbook và support guide cùng scenarios

- Cho mỗi scenario quan trọng, xác định trước **metrics & dashboards** sẽ dùng để đọc signals (từ 42, 55).  
- Với scenarios Mobile Ops offline/continuity, luôn liên kết với field playbook (59) để training user.  
- Với scenarios dễ gây ticket, liên kết với support guide (61) để frontline support biết “hỏi gì, xem gì, làm gì”.  
- Khi chạy rehearsal, sau khi chạy scenario nên dành vài phút xem dashboards và rút ra 1–2 learning.

## 10. Rules cho yêu cầu thêm mới hoặc chỉnh sửa scenario

- Mọi yêu cầu thêm/sửa scenario nên đi qua một **form hoặc template nhẹ** gồm: mục tiêu, flow, roles, surfaces, env, data/account cần, mối liên hệ với docs khác.  
- Product/Pilot Delivery là gatekeeper cho việc chấp nhận và ưu tiên hoá requests.  
- Khi scenario được thêm/sửa, phải update: library index, data/account mapping, env runbook nếu cần.  
- Deprecate scenarios cũ theo quy tắc trong 58, không xóa “âm thầm”.

## 11. Anti-pattern sử dụng Scenario Library phải tránh

1. Mỗi team tự tạo case demo/test riêng, không đăng ký vào library.  
2. Dùng env/acc/data tuỳ tiện cho demo, QA, pilot – không theo mapping.  
3. Update flows hoặc copy mà không xem scenario nào bị ảnh hưởng.  
4. Demo feature chưa sẵn sàng bằng “hack” env hoặc data không có trong library.  
5. Không deprecate scenario cũ, để người mới dùng nhầm.  
6. Không có ai chịu trách nhiệm duy trì library và onboading.  
7. Onboarding mới chỉ là “gửi link” mà không có walkthrough hoặc checklist.

## 12. Cách dùng checklist này trong onboarding cá nhân và team

### 12.1 Onboarding cá nhân

- Mỗi người mới trong các team liên quan nên có bản checklist cá nhân (copy từ đây).  
- Trong 2–4 tuần đầu, họ nên tick dần các mục đã hoàn thành.  
- Manager/buddy có thể review lại checklist sau thời gian đó.

### 12.2 Onboarding team

- Khi một team mới được “kéo vào” Pack 03 (vd Sales team mới), nên có session walkthrough dùng checklist này làm khung.  
- Cả team cùng chạy một số scenarios, xem dashboards, đọc playbook/support guide.  
- Ghi lại các câu hỏi chung để cập nhật FAQ hoặc docs tiếp theo.

## 13. Các tài liệu tiếp theo nên sinh ra từ đây

1. **63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE.md** – outline slide training dùng scenarios + playbook.  
2. **64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY.md** – FAQ gửi field users, dựa trên playbook và support patterns.  
3. **65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE.md** – guide cho retro Pack 03, dùng triage + post-pilot + scenario library.  
4. **66_INTERNAL_SUPPORT_PLAYBOOK_FOR_CROSS_PACK_ISSUES.md** – playbook cho issues vượt ra ngoài Pack 03.  
5. **67_PACK03_ENABLEMENT_PORTAL_INFORMATION_ARCHITECTURE.md** – IA cho cổng enablement nội bộ, nơi tất cả assets được tổ chức.

## 14. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Onboarding Checklist for Internal Teams Using Scenario Library của Pack 03:

1. Scenario Library là hạ tầng trải nghiệm chung, mọi team liên quan phải biết cách truy cập và sử dụng.  
2. Onboarding cho team mới phải đi kèm checklist rõ, không chỉ gửi link hoặc nói miệng.  
3. Mỗi nhóm (Product/UX, QA/Eng, Pilot/CS/Support, Sales/Enablement) có checklist riêng bên cạnh phần nền tảng chung.  
4. Scenarios phải được liên kết với data kits, account kits, environments, dashboards, playbooks và support guide.  
5. Yêu cầu thêm/sửa/deprecate scenarios phải có luồng quản trị tối thiểu để library không vỡ cấu trúc.  
6. Tài liệu này là cầu nối giữa thiết kế Scenario Library (58) và việc sử dụng nó trong công việc hằng ngày của các team nội bộ.

## 15. Điều kiện hoàn thành của tài liệu

Onboarding Checklist for Internal Teams Using Scenario Library được xem là đạt yêu cầu khi:
- team mới có thể dùng checklist này để hiểu và dùng Scenario Library trong vòng 2–4 tuần;  
- mọi team liên quan (Product, QA, CS, Sales, Pilot) đều có thói quen bắt đầu từ scenarios chung;  
- các request thêm/sửa scenario được quản trị mà không gây tắc;  
- và Scenario Library trở thành một phần tự nhiên của cách Pack 03 thiết kế, bán, triển khai và hỗ trợ sản phẩm.

## AG Execution Prompt

You are acting as an internal enablement architect, scenario-library adoption lead, and cross-team onboarding designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: flows, UX, copy, metrics, dashboards, scenario library, playbooks, support guide, and post-pilot template are already defined.
- This document defines the onboarding checklist for internal teams using the Scenario Library.

### Objective
Refine this onboarding checklist into a practical, role-aware guide that internal teams can follow in their first 2–4 weeks to become effective users of the Scenario Library and related assets.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the role-based checklists while keeping a shared foundation.  
- Keep the output concrete, checkable, and easy to track for individuals and teams.

### Tasks
1. Rewrite the onboarding thesis into a sharper, motivating form.  
2. Streamline and clarify the shared foundation checklist.  
3. Refine role-specific checklists with clearer outcomes.  
4. Define a simple process for scenario change requests and governance.  
5. Identify the top failure modes this checklist should prevent.  
6. Recommend next enablement assets (training decks, FAQ, portal structure) that build on this.

### Constraints
- Do not assume every team member will read all Pack 03 docs in detail.  
- Do not overload onboarding with theory – focus on practice.  
- Do not allow scenario usage to remain ad-hoc after onboarding.  
- Keep the checklist usable within normal workload.

### Output Format
Return a revised markdown document with these sections:
1. Onboarding Thesis
2. Shared Foundation Checklist
3. Role-Specific Checklists
4. Scenario Change Request Process
5. Failure Modes to Avoid
6. Recommended Follow-On Assets

### Acceptance Criteria
- The output must make Scenario Library adoption structured and realistic.  
- The result must remain consistent with Pack 03 as an experience infrastructure.  
- The document must help new team members become productive with scenarios within 2–4 weeks.  
- The output must reduce ad-hoc scenario creation and fragmented storytelling.
