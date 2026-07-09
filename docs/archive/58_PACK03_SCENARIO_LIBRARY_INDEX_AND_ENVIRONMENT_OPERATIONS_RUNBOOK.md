# Nextflow OS – Pack 03 Scenario Library Index and Environment Operations Runbook

**Document ID:** 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Pilot Delivery / QA Systems / Product Design / Product Analytics  
**Dependent Packs:** Frontend Delivery, Backend Workflow, Mobile Platform, Analytics & Data, QA & Support, Customer Success, GTM Enablement, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL

## 1. Mục tiêu tài liệu

Tài liệu này xác định **Scenario Library Index** và **Environment Operations Runbook** chính thức cho Pack 03 của Nextflow OS. Nếu trước đó:
- các flows, screens, states, authority rules, continuity semantics, copy system và metrics đã được định nghĩa;  
- demo scripts, QA scenarios, pilot triage model, pilot dashboards, cross-surface diagnostics và authority-boundary matrix đã được khóa;  
- demo/pilot environments và data kits đã có guide thiết lập;

thì tài liệu này trả lời câu hỏi rất vận hành:

> **Tất cả các scenario quan trọng của Pack 03 – cho demo, QA, pilot rehearsal, training, diagnostics – đang nằm ở đâu, được index như thế nào, map với objects nào trong environment nào, ai giữ, reset ra sao, version thế nào, và team mới phải tìm ở đâu khi muốn “kể lại” một câu chuyện hoặc “chạy lại” một test?**

Nói cách khác, đây là tài liệu biến scenario library từ một tập know-how rời rạc trong đầu vài người thành **một hệ thống có index và runbook**, để:
- mọi người biết Pack 03 có những scenario nào;  
- mọi scenario quan trọng đều tái hiện được;  
- môi trường không trở thành bãi thử ngẫu hứng;  
- pilot learning có thể được replay và kiểm chứng lâu dài.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của scenario library và environment operations trong Pack 03.  
2. Scenario-library thesis của tài liệu.  
3. Các loại scenario chính thức trong Pack 03.  
4. Cấu trúc chuẩn của một scenario record trong library.  
5. Cách tổ chức index theo flow, role, surface, environment và purpose.  
6. Rules cho mapping scenario ↔ data kit ↔ environment ↔ account kit.  
7. Runbook cho chuẩn bị, chạy, reset và refresh environments.  
8. Rules cho versioning và deprecation của scenarios.  
9. Rules cho ownership, review cadence và change control.  
10. Những anti-pattern scenario & environment operations nghiêm trọng phải tránh.  
11. Cách dùng scenario library trong pilot triage, release planning, training và sales enablement.  
12. Liên kết với observability, dashboards và authority-boundary matrix.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Scenario Library Index và Environment Operations Runbook

Pack 03 đã tạo ra rất nhiều artifacts: demo scripts (44), QA scenarios (41), pilot triage (48), pilot dashboards (55), authority-boundary tests (57), cross-surface flow diagnostics (56). Nếu không có một scenario library và runbook chung, các dấu hiệu thường gặp là:
- chỉ một vài người biết “case nào để demo chuyện X” hoặc “object nào để debug lỗi Y”;  
- mỗi team tự tạo data và scenario, không reuse được nhau;  
- mỗi pilot hoặc release lại phải chuẩn bị từ đầu;  
- các học từ pilot cũ không tái hiện được khi team đổi người;  
- environment demo/pilot trở nên bừa bộn, không biết reset thế nào.

Scenario Library Index và Environment Operations Runbook giúp Pack 03:
- biết mình có những scenario nào, phục vụ mục đích gì;  
- biết mỗi scenario dùng object nào, account nào, environment nào;  
- đảm bảo mọi buổi demo, rehearsal, QA walkthrough, triage session đều “đứng trên cùng nền data có chủ đích”;  
- giảm phụ thuộc vào trí nhớ cá nhân.

## 3. Scenario-library thesis cho Pack 03

Scenario-library thesis có thể phát biểu như sau:

> **Trong Pack 03, mỗi scenario quan trọng (demo, QA, pilot, training, diagnostics) là một tài sản có chủ đích, không chỉ là một buổi chạy thử; nếu không có một thư viện scenario được index và một runbook để vận hành environments, mọi học, mọi câu chuyện và mọi bài test sẽ khó lặp lại, khó kiểm chứng, và khó chuyển giao.**

Từ thesis này, mười nguyên lý được suy ra:

1. Scenario phải được mô tả bằng structures có thể đọc, không chỉ slide hoặc lời kể.  
2. Mỗi scenario có **ID, mục tiêu, personas, flows, environments, object IDs, account IDs, expected outcomes**.  
3. Data kits và account kits là resources phục vụ scenarios, không phải collections chung chung.  
4. Environments phải có runbook chuẩn cho prepare, run và reset.  
5. Scenario library phải sống cùng metrics framework, triage model, dashboards và authority-boundary matrix.  
6. Scenarios pilot không nên bị xoá bỏ sau pilot; chúng nên được đánh dấu, index và có thể replay trong tương lai.  
7. Scenario drift (scenario không còn khớp UI/flows hiện tại) phải được phát hiện và fix.  
8. Một scenario tốt phải vừa kể được story vừa test được truth.  
9. Ownership scenario phải rõ: ai được phép thêm, sửa, deprecate.  
10. Scenario library là một phần của “experience infrastructure”, không chỉ là UX documentation.

## 4. Các loại scenario chính thức trong Pack 03

Pack 03 nên phân loại scenario thành ít nhất các nhóm sau:

1. **Sales / value demo scenarios** – dùng trong bán hàng, GTM và narrative.  
2. **Pilot rehearsal scenarios** – dùng để chạy thử flows như thật trước hoặc trong pilot.  
3. **QA functional & UX scenarios** – dùng trong QA execution (41).  
4. **Authority-boundary scenarios** – dùng để test boundaries và waivers (57).  
5. **Continuity / offline / reconciliation scenarios** – dùng để test Mobile Ops continuity (39, 53).  
6. **Cross-surface flow scenarios** – dùng để test Web↔Mobile handoffs (56).  
7. **Recovery / exception / import-fix scenarios** – dùng để test flows ngoài happy path.  
8. **Pilot diagnostics & triage scenarios** – case cụ thể xuất hiện trong pilot và cần replay.  
9. **Training / onboarding scenarios** – dùng trong enablement cho user nội bộ hoặc khách hàng.

Một scenario cụ thể có thể thuộc nhiều nhóm, nhưng **must-have** là mỗi scenario phải khai báo primary purpose.

## 5. Cấu trúc chuẩn của một scenario record

Mỗi scenario trong library nên có ít nhất các trường sau:

1. Scenario ID.  
2. Scenario name (ngắn, dễ nhớ).  
3. Scenario type(s) (sales, pilot, QA, authority, continuity, cross-surface, recovery, training).  
4. Primary persona(s) / role(s).  
5. Primary flow(s) và sub-flow(s).  
6. Surfaces involved (Web Admin, Mobile Ops, both).  
7. Environment(s) where scenario is supported (demo, QA, pilot rehearsal).  
8. Required account(s) (username, role).  
9. Required object(s) (IDs, types, states).  
10. Pre-conditions (environments and data).  
11. High-level steps (for narrative/QA).  
12. Expected states and outcomes.  
13. Expected authority and continuity behavior (if relevant).  
14. Expected events and metrics signals (if relevant).  
15. Linked demo scripts, QA scenarios, triage records, docs.  
16. Owner(s) and status (active, deprecated, candidate).  
17. Notes and variations (tenant-specific, site-specific, etc.).

## 6. Cách tổ chức index scenario library

## 6.1 Index dimensions

Scenario index nên cho phép tìm theo:
- flow (vd “First wedge review flow”);  
- role/persona (manager, coordinator, frontline);  
- surface (web-only, mobile-only, cross-surface);  
- purpose (sales, QA, pilot, authority, continuity, training);  
- environment (demo env A, QA env B, pilot rehearse env C);  
- status (active, deprecated);  
- pilot site (nếu scenario gắn với pilot cụ thể).

## 6.2 Index format

Thực tế có thể là:
- một bảng duy nhất (vd trong Notion/Sheet/DB) với filter;  
- hoặc nhiều views từ cùng data source (Sales view, QA view, Pilot view).  

Quan trọng là data phải là **một nguồn sự thật**, không nhân bản rời rạc.

## 7. Mapping scenario ↔ data kit ↔ environment ↔ account kit

## 7.1 Data kits

Mỗi scenario nên chỉ định **data kit** mà nó dùng (theo tài liệu 51):
- data kit ID;  
- objects (IDs) trong kit;  
- state hiện tại;  
- reset notes.

## 7.2 Account kits

Mỗi scenario nên chỉ định **account kit**:
- các account sẽ login (vd manager_demo_01, frontline_pilot_02);  
- roles và authority của họ theo role-permission matrix.

## 7.3 Environment mapping

Mỗi scenario nên rõ environment nào support nó:
- demo env (sales narrative);  
- QA env (regression);  
- pilot rehearsal env.

Điều này giúp tránh việc chạy scenario training trên QA env làm hỏng state của QA.

## 8. Environment Operations Runbook – Prepare, Run, Reset, Refresh

## 8.1 Prepare

Cho mỗi environment (tài liệu 51), runbook phải mô tả:
- cách seed hoặc verify data kits (scripts, manual steps);  
- cách tạo hoặc verify account kits;  
- cách set environment flags (feature flags, version, config);  
- cách verify basic health (access, key flows, dashboards).

## 8.2 Run

Trong khi chạy scenario:
- người điều phối cần biết scenario IDs sẽ chạy;  
- cần log thời gian, người tham gia, environment sử dụng;  
- nếu là pilot rehearsal, nên có checklist post-run (check events, dashboards).

## 8.3 Reset

Runbook phải định nghĩa rõ cho mỗi environment:
- reset có nghĩa gì (đưa objects về state ban đầu, reseed DB, rollback snapshot…);  
- ai được phép thực hiện reset;  
- tần suất reset đề xuất (vd sau mỗi ngày demo, sau mỗi vòng QA).  

Reset không nên làm bằng “tự xóa random” mà cần có kịch bản.

## 8.4 Refresh

Khi flows, states, authority rules, copy hoặc events đổi, environment phải được refresh:
- update data kits;  
- update scenario mappings;  
- update account kits nếu roles đổi;  
- update docs liên quan (scripts, QA, training).

## 9. Versioning và deprecation scenarios

## 9.1 Versioning

- Mỗi scenario nên có version (v1, v2…) hoặc at least last-updated timestamp.  
- Khi flow/UX thay đổi đáng kể, hoặc metrics semantics đổi, scenario phải được review và update.

## 9.2 Deprecation

- Scenarios không còn align với product hiện tại phải được đánh dấu deprecated, không xoá âm thầm.  
- Nếu scenario được thay thế bởi scenario mới, nên có link “superseded by”.

## 10. Ownership, review cadence và change control

## 10.1 Ownership

- Product Management: định nghĩa scenarios chiến lược cần có.  
- Product Design / UX: đảm bảo scenario align với UX grammar.  
- QA: đảm bảo scenarios testable và gắn với QA pack.  
- Pilot Delivery: đảm bảo scenarios dùng được trong thực địa.  
- Product Analytics: đảm bảo scenarios gắn với metrics & dashboards.

## 10.2 Review cadence

- Định kỳ (vd mỗi quý) review scenario library cho mỗi wedge: cái nào còn, cái nào cần update, cái nào nên deprecate.  
- Sau pilot lớn hoặc release major, review scenarios liên quan tới flows bị chạm.

## 10.3 Change control

- Thêm scenario mới phải gắn với flows/roles rõ;  
- Sửa scenario phải log lý do, thay đổi object IDs hoặc steps;  
- Deprecate scenario phải có owner xác nhận.

## 11. Anti-pattern scenario & environment operations nghiêm trọng phải tránh

1. Mỗi team có “to-do list” scenario riêng, không có library chung.  
2. Scenarios chỉ tồn tại trong slide deck hoặc trong đầu một vài người.  
3. Environments demo/pilot/QA được dùng lẫn lộn, không reset rõ.  
4. Data kits bị mutate tùy hứng, không reseed.  
5. Không có mapping scenario ↔ object IDs, phải “tự mò” mỗi lần.  
6. Scenarios cũ không deprecate, dẫn tới người mới dùng “câu chuyện lỗi thời”.  
7. Không ai chịu trách nhiệm giữ scenario library cập nhật.

## 12. Cách dùng scenario library trong pilot triage, release planning, training và sales

- Pilot triage (48): dùng scenario library để replay issues, xem lại flows với data đã gây ra vấn đề.  
- Release planning (52): dùng library để chọn scenarios đại diện cho flows bị chạm.  
- Training/enablement: dùng scenarios training để dạy role-specific behavior cho user mới.  
- Sales: dùng scenarios sales đã được kiểm thử để kể story nhất quán với product truth.

## 13. Liên kết với observability, dashboards và authority-boundary matrix

- Mỗi scenario quan trọng nên chỉ ra events và metrics liên quan (theo 49, 42).  
- Scenario cross-surface hoặc authority-sensitive nên link tới cross-surface diagnostics (56) và authority-boundary matrix (57).  
- Pilot dashboards (55) có thể có “quick links” tới scenario IDs để xem cohort relevant.

## 14. Các tài liệu UX tiếp theo nên sinh ra từ đây

1. **59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS.md** – playbook cho field users về continuity, reconciliation và scenarios thường gặp.  
2. **60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE.md** – template để tổng hợp học từ pilot, gắn với scenarios cụ thể.  
3. **61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS.md** – runbook cho support/CS khi xử lý ticket liên quan tới flows Pack 03.  
4. **62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY.md** – checklist cho team mới về cách dùng scenario library và environments.

## 15. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Scenario Library Index và Environment Operations Runbook của Pack 03:

1. Scenario là tài sản có chủ đích, không phải sản phẩm phụ của demo/QA/pilot.  
2. Mọi scenario quan trọng phải có record với ID, mục tiêu, flow, role, environment, accounts, objects, expected outcomes và links.  
3. Scenario library phải được index theo flow, role, surface, purpose, environment và status để dễ tìm và dễ dùng.  
4. Environment operations (prepare, run, reset, refresh) phải có runbook rõ, tránh drift và bừa bộn.  
5. Scenario library phải sống cùng metrics, triage, dashboards, authority boundaries và cross-surface diagnostics.  
6. Ownership và review cadence phải rõ để library không “chết dần” sau vài pilot.  
7. Tài liệu này là baseline để Pack 03 vận hành mọi hoạt động demo, QA, pilot, training dựa trên một nền kịch bản chung, có thể lặp lại và có thể kiểm chứng.

## 16. Điều kiện hoàn thành của tài liệu

Pack 03 Scenario Library Index and Environment Operations Runbook được xem là đạt yêu cầu khi:
- team có một điểm truy cập rõ để tìm mọi scenario quan trọng;  
- mọi environment demo/QA/pilot có runbook chuẩn cho seed và reset;  
- pilot issues và learnings có thể được replay lại bằng scenario + environment mapping;  
- và các team mới có thể hiểu và dùng scenario library mà không phải dựa vào truyền miệng.

## AG Execution Prompt

You are acting as a scenario-library architect, environment-operations strategist, and enablement systems designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: flows, states, authority, continuity, copy system, QA scenarios, demo scripts, metrics, event taxonomy, dashboards, cross-surface diagnostics, and authority-boundary matrix are already defined.
- This document defines the Scenario Library Index and Environment Operations Runbook for Pack 03.

### Objective
Refine this Scenario Library Index and Environment Operations Runbook into a production-grade framework that teams can use to manage scenarios and environments for demos, QA, pilots, training, and diagnostics.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between scenario types, environments, data kits, and account kits.  
- Keep the output concrete enough for day-to-day operations by Product, QA, Pilot Delivery, Sales, and Support.

### Tasks
1. Rewrite the scenario-library thesis into a sharper executive form.
2. Produce a detailed scenario record structure and indexing strategy.  
3. Add runbook steps for environment prepare, run, reset, and refresh.  
4. Define ownership, review cadence, and change control for scenarios and environments.  
5. Identify the top five scenario-library and environment-operation failures that Pack 03 must avoid.  
6. Recommend the next documents that should operationalize this baseline into field playbooks, post-pilot synthesis, support guides, and internal onboarding.  
7. Add governance rules to prevent scenario drift, environment chaos, and knowledge silos.

### Constraints
- Do not let scenarios live only in slides or personal notes.  
- Do not mix demo, QA, and pilot environments without clear runbooks.  
- Do not allow data kits to be mutated permanently by ad-hoc usage.  
- Keep the output concrete enough to support real multi-team usage.

### Output Format
Return a revised markdown document with these sections:
1. Executive Scenario-Library Thesis
2. Scenario Record and Indexing Framework
3. Environment Operations Runbook
4. Ownership and Change Control
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 scenarios and environments manageable, discoverable, and reusable.  
- The result must remain consistent with Nextflow OS as an SME Business OS.  
- The document must help teams run demos, QA, pilots, and training from a shared scenario library.  
- The output must reduce ambiguity around where scenarios live, how environments are prepared and reset, and who owns them.
