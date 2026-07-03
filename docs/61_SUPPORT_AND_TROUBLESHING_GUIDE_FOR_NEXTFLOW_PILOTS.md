# Nextflow OS – Support and Troubleshooting Guide for Nextflow Pilots

**Document ID:** 61_SUPPORT_AND_TROUBLESHING_GUIDE_FOR_NEXTFLOW_PILOTS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** QA & Support / Customer Success / Pilot Delivery / Product Management  
**Dependent Packs:** Frontend Delivery, Mobile Platform, Backend Workflow, Analytics & Data, Identity & Access, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE

## 1. Mục tiêu tài liệu

Tài liệu này là **Support and Troubleshooting Guide** cho các pilot Nextflow OS liên quan tới Pack 03. Nếu Pack 03 đã định nghĩa chiến lược trải nghiệm, flows, authority, continuity, observability, dashboards, scenario library, field playbook và post-pilot synthesis, thì tài liệu này trả lời câu hỏi vận hành rất cụ thể:

> **Khi người dùng trong pilot gặp sự cố – không thấy nhiệm vụ, không gửi được dữ liệu, bị chặn quyền, thấy khác nhau giữa Web và Mobile, hoặc nói “app làm mất dữ liệu” – đội support và Customer Success nên hỏi gì, xem ở đâu, làm gì, escalates cho ai, và log gì để vừa giải quyết được vấn đề cho khách, vừa mang về learning cho Pack 03?**

Tài liệu này không thay thế các runbook kỹ thuật chi tiết, nhưng nó là **first-line và second-line playbook** cho support/CS/Pilot Delivery khi xử lý ticket liên quan đến trải nghiệm Pack 03.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của support & troubleshooting guide trong bối cảnh pilot Pack 03.  
2. Support-and-troubleshooting thesis của tài liệu.  
3. Các loại vấn đề thường gặp trong pilot Pack 03.  
4. Cấu trúc chuẩn của một ticket/issue Pack 03.  
5. Checklist câu hỏi phải hỏi khi nhận issue.  
6. Quy tắc tra cứu nhanh trong UI, dashboards, logs và scenario library.  
7. Playbook xử lý cho các nhóm vấn đề chính: visibility/state, authority/permission, continuity/offline/sync, cross-surface, copy/semantics, performance/stability.  
8. Rules cho escalation lên Product/Engineering.  
9. Rules cho logging issue vào pilot triage model và decision log.  
10. Những anti-pattern support/thông tin phản hồi phải tránh.  
11. Cách dùng tài liệu này trong đào tạo support/CS trước pilot.  
12. Liên kết với field playbook, pilot dashboards và authority/continuity docs.  
13. Các tài liệu tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Support and Troubleshooting Guide riêng cho pilot

Pilot là giai đoạn:
- user chưa quen flows và semantics mới;  
- product còn thay đổi nhanh;  
- metrics và observability cần được “tập đọc” cùng team;  
- mọi lỗi/quẩn quanh/cảm giác khó hiểu đều là vàng để học.

Nếu không có guide này, dễ xảy ra các pattern xấu:
- support trả lời theo cảm tính, không nhất quán giữa tickets;  
- CS/Pilot Delivery phải “hỏi riêng” PM/engineer từng lần;  
- issues không được log đúng cách vào triage model, mất dấu khi làm post-pilot;  
- team không tận dụng được dashboards, logs và scenario library đã dựng.

Tài liệu này đảm bảo rằng:
- mọi người xử lý ticket dựa trên cùng một logic;  
- mỗi issue khó đều trở thành input cho triage và learning;  
- khách hàng cảm nhận được sự nhất quán và chuyên nghiệp trong pilot.

## 3. Support-and-troubleshooting thesis cho Pack 03

Thesis có thể phát biểu như sau:

> **Trong pilot Pack 03, mỗi ticket support không chỉ là việc “dập lửa” mà là một cơ hội quan trọng để hiểu hệ thống thực sự vận hành như thế nào trong đời thực; nếu support không biết hỏi đúng câu hỏi, không tra cứu đúng chỗ và không log learning, thì Pack 03 sẽ mất đi phần lớn giá trị của pilot.**

Từ thesis này, mười nguyên lý được suy ra:

1. Mọi issue nên được xem là **câu hỏi về flow + state + role + continuity + authority** chứ không chỉ là “lỗi app”.  
2. Support/CS phải sử dụng chung **ngôn ngữ và semantics** với product/UX (terms, states, messages).  
3. Dashboards, logs và scenario library là công cụ hỗ trợ chuẩn, không phải chỉ cho team analytics.  
4. Escalation phải có tiêu chí rõ: khi nào cần lôi Product/Engineering vào, khi nào xử lý ở frontline.  
5. Mọi issue pilot quan trọng phải được nối vào triage model và post-pilot decision log.  
6. Không có câu trả lời “đó là lỗi người dùng” nếu chưa xem lại flows, copy, authority và training.  
7. Support không được “hướng dẫn workaround” đi chệch khỏi design trừ khi có sự đồng ý và log rõ (tạm thời).  
8. Mỗi lần giải quyết vấn đề nên để lại notes đủ để người khác đọc hiểu lại.  
9. Training support/CS cho Pack 03 phải dựa trên Guide này, không chỉ product tour.  
10. Hỗ trợ tốt trong pilot là một phần quan trọng của trải nghiệm khách hàng, không chỉ là backend function.

## 4. Các loại vấn đề thường gặp trong pilot Pack 03

Tài liệu phân loại issue thành các nhóm chính:

1. **Visibility / state issues** – user không thấy nhiệm vụ, thấy trạng thái “sai”, hoặc Web/Mobile hiển thị khác nhau.  
2. **Authority / permission issues** – user bị chặn, không thấy/không bấm được nút, hoặc bị nhầm lẫn giữa “không quyền” và “thiếu điều kiện/policy”.  
3. **Continuity / offline / sync issues (Mobile Ops)** – dữ liệu không gửi, pending lâu, retry liên tục, ảnh lỗi.  
4. **Cross-surface handoff issues** – Web nghĩ một kiểu, Mobile nghĩ một kiểu về cùng một case.  
5. **Copy / semantics / comprehension issues** – người dùng hiểu sai vì wording, labels, messages.  
6. **Performance / stability issues** – app chậm, treo, crash, đặc biệt trong bối cảnh flows Pack 03.

## 5. Cấu trúc chuẩn của một ticket/issue Pack 03

Khi ghi nhận issue, support nên thu thập ít nhất:

1. Pilot name / site / tenant.  
2. User role (manager, coordinator, frontline, admin, v.v.).  
3. Surface (Web Admin, Mobile Ops, both).  
4. Flow / task type (nếu biết).  
5. Object ID hoặc thông tin cho phép tìm (nhiệm vụ/case mã gì, thời gian, v.v.).  
6. Mô tả ngắn của user bằng lời họ.  
7. Screenshot nếu có (đặc biệt là trạng thái và message).  
8. Thời gian xảy ra và trạng thái mạng (WiFi/4G, offline).  
9. Tần suất (một lần, lặp lại, nhiều người gặp).  
10. Category sơ bộ (visibility, authority, continuity, cross-surface, copy, performance).

## 6. Checklist câu hỏi khi nhận issue

Khi nhận một issue, support nên hỏi:

1. Bạn đang dùng Web hay Mobile (hay cả hai)?  
2. Vai trò của bạn trong hệ thống là gì (nếu họ biết)?  
3. Bạn đang làm trên nhiệm vụ/case nào (mã, tên, loại)?  
4. Bạn thấy trạng thái gì trên màn hình (vd “đã lưu trên thiết bị”, “đang chờ đồng bộ”, “không đủ quyền”)?  
5. Lúc đó bạn đang có mạng không (WiFi/4G, hay offline)?  
6. Bạn đã thử làm lại hay thử lại (retry) chưa, kết quả thế nào?  
7. Trên Web (nếu có) họ thấy gì tương ứng với nhiệm vụ đó?  
8. Vấn đề này xảy ra nhiều lần hay chỉ một lần?

## 7. Tra cứu nhanh: UI, dashboards, logs, scenario library

### 7.1 UI & admin tools

- Dùng Web Admin để tra case/task theo ID và xem state, owner, history (nếu có).  
- Dùng admin console (43, 50) để kiểm tra role và permissions của user.

### 7.2 Dashboards

- Dùng Pilot Signal Dashboards (55) để xem:  
  - có spike error / retry / restricted action quanh thời gian issue không;  
  - có handoff delay hoặc sync problems không.  

### 7.3 Logs & events

- Dùng event taxonomy (49) và tools tương ứng (nếu support có access) để tra events cho object ID / user ID / time window.  
- Đặc biệt xem các event: restricted_action_encountered, local_persist_success, sync_confirmed, retry_exhausted, attachment_upload_failed, state_transition.

### 7.4 Scenario library

- Kiểm tra xem issue có match 1 scenario sẵn có trong library (58) không.  
- Nếu có, dùng scenario đó để replay và kiểm tra.

## 8. Playbook xử lý cho các nhóm vấn đề chính

### 8.1 Visibility / state issues

**Ví dụ issue:** “Tôi không thấy nhiệm vụ A”, “Trên mobile ghi đã xong nhưng web bảo chưa có gì”.

**Bước xử lý:**
1. Thu thập object ID và screenshots.  
2. Tra Web Admin xem case/task tồn tại không, ở trạng thái nào.  
3. Tra dashboards xem có sync lag hoặc errors không.  
4. Nếu Mobile nói “đã lưu trên thiết bị / đang chờ đồng bộ”: hướng dẫn user làm theo playbook Mobile (59) và kiểm tra lại sau khi thiết bị có mạng tốt.  
5. Nếu Mobile nói “đã xác nhận từ máy chủ” nhưng Web không thấy: escalates tới Product/Eng, cung cấp event trace và thời gian.

### 8.2 Authority / permission issues

**Ví dụ issue:** “Tôi không bấm được nút duyệt”, “Hệ thống bảo tôi không có quyền nhưng tôi là trưởng nhóm”.

**Bước xử lý:**
1. Hỏi rõ message hiển thị (“không đủ quyền”, “thiếu dữ liệu”, “không ở trạng thái phù hợp”, v.v.).  
2. Kiểm tra role & permission của user trong admin console.  
3. Kiểm tra state của object – action có hợp lệ trong state đó không.  
4. Xem authority-boundary matrix (57) cho boundary tương ứng.  
5. Nếu đúng là user không có quyền theo design: giải thích boundary, xem có waiver hoặc escalation path.  
6. Nếu copy/messaging gây hiểu sai (policy-blocked hiển thị như role-blocked): log issue cho copy/UX và vào triage.

### 8.3 Continuity / offline / sync issues

**Ví dụ issue:** “App làm mất dữ liệu”, “Thử lại hoài không được”, “Ảnh không lên”.

**Bước xử lý:**
1. Hỏi rõ user thấy trạng thái gì (đã lưu, chờ đồng bộ, thử lại).  
2. Xem playbook 59 và hướng dẫn user theo do/don't.  
3. Tra dashboards continuity để xem retry_exhausted, attachment failures quanh thời gian đó.  
4. Tra events cho object ID nếu có.  
5. Nếu xác nhận local data đã mất: escalates khẩn cấp tới Product/Eng; log severity và context.  
6. Nếu chỉ là pending sync: hướng dẫn theo playbook và theo dõi.

### 8.4 Cross-surface handoff issues

**Ví dụ issue:** “Web đã trả lại nhiệm vụ nhưng Mobile không nhận được”, “Mobile gửi xong mà Web không update state”.

**Bước xử lý:**
1. Thu thập object ID, role và surfaces liên quan.  
2. Dùng cross-surface diagnostics blueprint (56) để xem timeline milestones: assign, sync, open, complete, review, exception, clarification.  
3. Tra dashboards/trace để xác định handoff bị tắc ở bước nào.  
4. Nếu là vấn đề environment hoặc config: phối hợp với Pilot Delivery/Eng để fix.  
5. Log lại vào triage với loại handoff (Web→Mobile, Mobile→Web, v.v.).

### 8.5 Copy / semantics / comprehension issues

**Ví dụ issue:** “Tôi tưởng bấm nút này là lưu nháp nhưng hóa ra là gửi duyệt”, “Label này dễ hiểu lầm”.

**Bước xử lý:**
1. Ghi lại nguyên văn người dùng nói và message/label cụ thể.  
2. Kiểm tra terminology register và copy guidelines (40, 47).  
3. Nếu copy đi lệch guidelines hoặc không align với semantics: log vào semantic regression checklist (54) và triage.  
4. Nếu copy đúng nhưng training chưa đủ: ghi nhận vào post-pilot synthesis (60) như learning về enablement.

### 8.6 Performance / stability issues

- Thu thập device, OS, version app, thời gian, network.  
- Hỏi user đang làm flow gì, với object nào.  
- Tra logs/monitoring nếu support có access, hoặc escalates SRE/Eng.  
- Đánh dấu rõ đây là issue performance để không lẫn với semantics.

## 9. Rules cho escalation lên Product/Engineering

Support nên escalates khi:
- nghi ngờ mất dữ liệu;  
- mismatch giữa “đã xác nhận từ máy chủ” trên mobile và thiếu record trên backend;  
- mismatch cross-surface repeatable;  
- lỗi liên quan tới authority boundaries/waivers;  
- lỗi gây ảnh hưởng diện rộng tới pilot.

Escalation packet nên có:
- mô tả issue + impact;  
- ticket fields đầy đủ (phần 5);  
- link tới dashboards/views và events;  
- step-by-step nếu có thể reproduce;  
- mức độ ưu tiên + đề xuất thời gian phản hồi.

## 10. Logging issue vào pilot triage model và decision log

- Những issue quan trọng phải được gắn vào triage model (48): loại issue, severity, scope, impacted flows/roles.  
- Mỗi đợt post-pilot synthesis (60) phải có phần tổng hợp các issue và cách xử lý.  
- Những issue dẫn đến quyết định thay đổi product/UX phải đi vào Decision Log (60).

## 11. Anti-pattern support & troubleshooting nghiêm trọng phải tránh

1. Trả lời “chắc là lỗi mạng” mà không hỏi thêm hoặc tra cứu.  
2. Hướng dẫn workaround đi ngược hoàn toàn với design mà không log.  
3. Đổ lỗi cho “người dùng không biết dùng” trước khi xem lại copy/flows/training.  
4. Không thu thập đủ thông tin (ID, thời gian, trạng thái, mạng).  
5. Không sử dụng dashboards, logs hoặc scenario library đã có.  
6. Không log issue vào triage hoặc post-pilot docs.  
7. Không chia sẻ pattern lặp lại cho Product/Engineering.

## 12. Cách dùng tài liệu này trong đào tạo support/CS trước pilot

- Dùng tài liệu này làm khung cho buổi training support/CS về Pack 03.  
- Chạy qua các ví dụ issue cho từng nhóm và thực hành “hỏi gì, xem gì, làm gì”.  
- Kết hợp với scenario library (58) để cho support/CS tự trải nghiệm flows và lỗi giả lập.  
- Đảm bảo mọi người hiểu link giữa support → triage → post-pilot learning.

## 13. Liên kết với field playbook, dashboards và authority/continuity docs

- Field playbook (59) cho user; guide này là “mặt kia” dành cho support.  
- Pilot dashboards (55) là công cụ không thể thiếu khi đọc signals quanh một issue.  
- Authority docs (43, 50, 57) và continuity docs (39, 46, 53) là reference khi issue chạm boundary hoặc offline.

## 14. Các tài liệu tiếp theo nên sinh ra từ đây

1. **62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY.md** – checklist cho team nội bộ khi bắt đầu dùng scenario library và support guide.  
2. **63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE.md** – outline bộ slide training cho field users và supervisor.  
3. **64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY.md** – FAQ dựa trên field playbook và support pattern.  
4. **65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE.md** – guide cho các buổi retro Pack 03, sử dụng triage + post-pilot docs.  
5. **66_INTERNAL_SUPPORT_PLAYBOOK_FOR_CROSS_PACK_ISSUES.md** – playbook rộng hơn cho issues cross-pack.

## 15. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Support and Troubleshooting Guide for Nextflow Pilots của Pack 03:

1. Mọi pilot Pack 03 phải có một support/troubleshooting playbook chung, không xử lý issues ad-hoc.  
2. Mỗi issue phải được nhìn như câu hỏi về flow, state, role, authority, continuity, copy chứ không chỉ là “bug”.  
3. Support/CS phải dùng chung ngôn ngữ và semantics với UX và Product.  
4. Dashboards, logs, scenario library, authority/continuity docs phải được dùng như công cụ chuẩn khi điều tra.  
5. Escalation lên Product/Engineering phải có packet đầy đủ và có tiêu chí, gắn vào triage và post-pilot learning.  
6. Tài liệu này là cầu nối giữa hoạt động hỗ trợ hàng ngày trong pilot và các quyết định cải tiến Pack 03.

## 16. Điều kiện hoàn thành của tài liệu

Support and Troubleshooting Guide for Nextflow Pilots được xem là đạt yêu cầu khi:
- support/CS có thể dùng nó để xử lý hầu hết issues Pack 03 gặp trong pilot một cách nhất quán;  
- issues quan trọng được ghi nhận đúng vào triage và post-pilot docs;  
- Product và Engineering nhận được escalations giàu ngữ cảnh, dễ hành động;  
- và khách hàng cảm nhận được rằng pilot được hỗ trợ chuyên nghiệp, có cấu trúc, không “thử nghiệm bừa”.

## AG Execution Prompt

You are acting as a pilot-support playbook designer, troubleshooting workflow architect, and learning capture facilitator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: experience strategy, flows, authority, continuity, observability, dashboards, scenario library, field playbook, and post-pilot template are already defined.
- This document defines the support and troubleshooting guide for Pack 03 pilots.

### Objective
Refine this Support and Troubleshooting Guide into a production-ready playbook that support, CS, and pilot teams can follow to handle issues, escalate appropriately, and feed learning back into Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the categorization of issues and the connection to flows, states, roles, authority, and continuity.  
- Keep the output concrete and step-by-step enough for real-time support use.

### Tasks
1. Rewrite the support-and-troubleshooting thesis into a sharper, operational form.
2. Add checklists, prompts, and example scripts for support conversations.  
3. Define escalation criteria and packets more concretely.  
4. Clarify how to use dashboards, logs, and scenario library during troubleshooting.  
5. Identify the top failure patterns this guide should help prevent.  
6. Recommend follow-on enablement assets and cross-pack support guides.

### Constraints
- Do not overload frontline support with deep technical detail.  
- Do not bypass Pack 03 semantics or training assets when giving guidance.  
- Do not let issues stop at resolution without learning capture.  
- Keep the playbook practical for use during live pilot operations.

### Output Format
Return a revised markdown document with these sections:
1. Operational Thesis
2. Issue Categories and Intake Checklist
3. Troubleshooting Flows by Issue Type
4. Escalation Rules and Packets
5. Using Dashboards, Logs, and Scenarios
6. Failure Patterns to Avoid
7. Recommended Follow-On Assets

### Acceptance Criteria
- The output must make pilot issue handling structured, repeatable, and learning-oriented.  
- The result must remain consistent with Pack 03’s UX, authority, and continuity semantics.  
- The document must be directly usable by support and CS during pilots.  
- The output must help connect day-to-day troubleshooting with Pack 03 improvement.
