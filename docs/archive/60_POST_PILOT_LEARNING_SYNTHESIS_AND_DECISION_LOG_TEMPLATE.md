# Nextflow OS – Post-Pilot Learning Synthesis and Decision Log Template

**Document ID:** 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Pilot Delivery / Product Analytics / Customer Success  
**Dependent Packs:** Program Delivery, Analytics & Data, Frontend Delivery, Backend Workflow, QA & Support, GTM Enablement  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS

## 1. Mục tiêu tài liệu

Tài liệu này cung cấp **template chính thức để tổng hợp học sau mỗi pilot (Post-Pilot Learning Synthesis) và log các quyết định quan trọng (Decision Log)** liên quan tới Pack 03 của Nextflow OS. Nếu:
- tài liệu 03, 04, 07 đã khóa market & strategy hypothesis;  
- tài liệu 20–22, 25–27 đã khóa experience & flow strategy;  
- tài liệu 42, 48, 49, 55 đã khóa metrics framework, pilot triage model, event taxonomy và pilot dashboards;  
- tài liệu 51, 58, 59 đã khóa demo/pilot environments, scenario library và field playbook;  
- tài liệu 52 đã khóa release change impact review;

thì tài liệu này trả lời câu hỏi:

> **Sau mỗi pilot (dù nhỏ hay lớn), làm sao để chúng ta không chỉ “thấy nhiều chuyện” mà thật sự tổng hợp lại được: điều gì đã được xác nhận, điều gì bị bác bỏ, điều gì còn chưa rõ, chúng ta quyết định làm gì tiếp, trên flow nào, cho role nào, trong release nào – và tất cả những quyết định đó được lưu ở đâu để không mất theo thời gian và nhân sự?**

Tài liệu này không thêm hypothesis mới, mà tạo **khung thu hoạch và quyết định** dựa trên mọi thứ Pack 03 đã chuẩn bị ở layer strategy, UX, metrics và pilot.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của post-pilot synthesis và decision log trong Pack 03.  
2. Post-pilot thesis của tài liệu.  
3. Cấu trúc tổng quan của một post-pilot synthesis.  
4. Các khối nội dung cần có: context, signals, findings, learning themes, decisions, risks, next steps.  
5. Mapping giữa signals (dashboards, feedback, scenarios) và learning.  
6. Cách phân loại learning: xác nhận, bác bỏ, chưa quyết, cần thêm thử nghiệm.  
7. Cách log quyết định: mức độ, phạm vi, timeline, owner, rationale.  
8. Liên kết decision log với traceability, role-permission, authority, continuity và copy semantics.  
9. Rules cho phiên bản hóa, chia sẻ và lưu trữ các bản post-pilot.  
10. Rules cho ownership và cadence của post-pilot reviews.  
11. Những anti-pattern post-pilot nghiêm trọng phải tránh.  
12. Cách dùng template này trong planning cho wedge tiếp theo và GTM.  
13. Các tài liệu UX/strategy tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Post-Pilot Learning Synthesis và Decision Log

Pilot là nơi sản phẩm chạm thị trường thật: các flows, states, authority rules, continuity, copy, dashboards, triage – tất cả đều được thử nghiệm trong điều kiện không hoàn hảo. Điều nguy hiểm không phải là **pilot phát hiện vấn đề**, mà là **pilot phát hiện vấn đề nhưng học thu được bị rơi rớt**, hoặc:
- chỉ sống trong slide của một buổi recap;  
- chỉ tồn tại trong trí nhớ của một vài người;  
- không được dịch thành quyết định cụ thể;  
- không được nối với flows, roles, metrics và docs Pack 03.

Không có template post-pilot rõ, các buổi tổng kết rất dễ trở thành:
- danh sách dài “việc cần làm” không ưu tiên;  
- hoặc vài bullet high-level như “người dùng cần training thêm” mà không có gốc rễ vào flows/roles cụ thể.

Tài liệu này tồn tại để biến mỗi pilot thành **một vòng học có cấu trúc**, với đầu ra rõ ràng và tái sử dụng được cho các pilot sau, các release sau hoặc các wedge tiếp theo.

## 3. Post-pilot thesis cho Pack 03

Post-pilot thesis có thể phát biểu như sau:

> **Một pilot chỉ thực sự trọn vẹn khi học thu được từ nó được tổng hợp lại, gắn với flows, roles, signals và decisions cụ thể – và được lưu trữ theo cách mà squad sau, pilot sau và wedge sau có thể nhìn lại và sử dụng.**

Từ thesis này, mười nguyên lý được suy ra:

1. Synthesis phải dựa trên cả **data** (dashboards, logs, metrics) và **story** (feedback, anecdote, shadowing), không thiên lệch một phía.  
2. Learning phải được gắn với context cụ thể: pilot site nào, cohort nào, flow nào, role nào, thời gian nào.  
3. Không phân biệt “lớn” hay “nhỏ” – mọi pilot đều xứng đáng có một bản ghi học, chỉ khác nhau về độ sâu.  
4. Decision phải rõ 5W1H (what, why, who, when, where, how) – và gắn với Pack 03 docs/flows.  
5. Không phải mọi issue phải được giải ngay; một số có thể được xếp vào backlog có rationale rõ.  
6. Một số hypothesis ban đầu có thể bị bác bỏ – log điều này là thành công, không phải thất bại.  
7. Synthesis phải tách rõ “chúng ta đã học gì” và “chúng ta sẽ làm gì”.  
8. Decision log phải sống cùng traceability matrix và change impact review.  
9. Post-pilot docs phải dễ tìm, dễ đọc và đủ nhẹ để teams actual đọc lại.  
10. Mỗi pilot nên dẫn tới ít nhất một quyết định chiến lược cho pack, không chỉ tactical fixes.

## 4. Cấu trúc tổng quan của một Post-Pilot Learning Synthesis

Template đề xuất cấu trúc chính sau cho mỗi pilot (hoặc phase của pilot):

1. Pilot Summary & Context.  
2. Key Questions and Hypotheses.  
3. Signals Reviewed (Dashboards, Scenarios, Feedback).  
4. Top Learning Themes.  
5. Flow-by-Flow and Role-by-Role Findings.  
6. Authority, Continuity, and Copy/Semantics Findings.  
7. Operational & Organizational Findings.  
8. Decisions and Actions.  
9. Open Questions and Next Experiments.  
10. Links and References.

Các phần có thể rút gọn hoặc mở rộng tuỳ quy mô pilot, nhưng nên giữ cấu trúc này để cross-pilot đọc được.

## 5. Phần 1 – Pilot Summary & Context

Các trường tối thiểu:
- Pilot name / ID.  
- Wedge / capabilities in focus.  
- Sites / tenants involved.  
- Time window.  
- Participant roles (manager, coordinator, frontline, admin, v.v.).  
- Scope (flows included / excluded).  
- Version / release(s) used.  
- Feature flags or waiver configurations (nếu có).  
- Primary success criteria (qualitative & quantitative) khi bắt đầu.

## 6. Phần 2 – Key Questions and Hypotheses

Liệt kê ngắn gọn:
- Câu hỏi chính của pilot (ví dụ: “Mobile offline có đủ để loại bỏ giấy?”, “Authority model hiện tại có quá chặt không?”).  
- Hypotheses tương ứng (vd: “Nếu cung cấp continuity và sync rõ ràng, frontline sẽ tin hệ thống và không cần ghi tay”).  
- Mapping tới các doc chiến lược (03, 04, 07, 20–22, 25–27).

## 7. Phần 3 – Signals Reviewed (Dashboards, Scenarios, Feedback)

### 7.1 Dashboards & metrics

- Liệt kê dashboards chính đã sử dụng (từ tài liệu 55): execution, authority friction, continuity, error semantics, change-impact.  
- Chỉ rõ metrics chính được xem (completion rate, time-to-complete, retry_exhausted, restricted_action rate, v.v.).

### 7.2 Scenarios

- Liệt kê các scenario từ library (58) đã chạy trong pilot hoặc rehearsal.  
- Đặc biệt note các scenarios cross-surface, authority, continuity, recovery.

### 7.3 Feedback & qualitatives

- Tóm tắt nguồn feedback: interview, khảo sát, hỗ trợ, shadowing.  
- Đánh dấu feedback nào gắn với flows/scenarios cụ thể.

## 8. Phần 4 – Top Learning Themes

Ở đây rút ra 3–7 **theme lớn**, ví dụ:
- Flow usability & comprehension.  
- Authority & responsibility clarity.  
- Continuity & trust in Mobile Ops.  
- Error handling & recovery.  
- Cross-surface handoffs.  
- Training & enablement gaps.

Mỗi theme nên có:
- 1–2 câu summary.  
- 2–3 bullet evidence snippets (metrics + quotes).  
- 1–2 implications chính.

## 9. Phần 5 – Flow-by-Flow and Role-by-Role Findings

### 9.1 Per flow

Cho mỗi flow chính trong phạm vi pilot, template đề xuất:
- What worked well (theo metrics và feedback).  
- Where users slowed or dropped (theo dashboards và logs).  
- Specific issues spotted (UX, authority, continuity, copy).  
- Link tới scenarios test flow đó.

### 9.2 Per role/persona

Cho mỗi role:
- Họ có hiểu trách nhiệm và boundary của mình không?  
- Họ có dùng flows đúng như dự kiến không (theo signals)?  
- Họ gặp friction chủ yếu ở đâu?  
- Training và playbooks (vd tài liệu 59) có đủ không?

## 10. Phần 6 – Authority, Continuity, and Copy/Semantics Findings

### 10.1 Authority

- Summary authority friction từ dashboards (restricted_action, escalation, policy-blocked, overrides).  
- Cases tiêu biểu từ authority-boundary scenarios (57).  
- Learning: boundary nào đang đúng, boundary nào cần điều chỉnh, boundary nào gây hiểu lầm.

### 10.2 Continuity & Mobile Ops

- Summary continuity metrics: retries, retry_exhausted, time-to-sync, attachment failures.  
- Cases tiêu biểu từ reconciliation scenarios (53) và feedback field users (59).  
- Learning: offline patterns và playbook có đủ chưa, users có tin “đã lưu / đã gửi” không.

### 10.3 Copy & semantics

- Những chỗ user hiểu sai vì wording (từ pilot triage và QA).  
- Term/state nào bị đọc khác nhau giữa Web/Mobile hoặc giữa users.  
- Learning: cần update copy system/register hay training.

## 11. Phần 7 – Operational & Organizational Findings

- Triển khai: onboarding, training, support – cái gì hoạt động tốt, cái gì cần cải thiện.  
- Process của chính đội nội bộ (pilot ops, support) – nơi nào bottleneck, nơi nào chưa dùng metrics triage đúng sức.  
- Sự phối hợp giữa Product, CS, Field Enablement, Engineering trong thời gian pilot.

## 12. Phần 8 – Decisions and Actions

Đây là phần quan trọng nhất và là “Decision Log”. Template đề xuất chia thành:

### 12.1 Decisions by category

- Product & UX changes (flows, screens, states, copy).  
- Authority & access-control changes.  
- Continuity & Mobile Ops behavior changes.  
- Metrics & dashboard changes.  
- Training & enablement changes.  
- Commercial / GTM decisions (extend pilot, scale, reposition, v.v.).

### 12.2 Decision record fields

Cho mỗi decision:
- Decision ID.  
- Short description.  
- Category.  
- Rationale (1–3 câu, linking to learning).  
- Impact scope (flows, screens, roles).  
- Linked docs (traceability rows, role-permission matrix, change-impact review, scenarios).  
- Owner.  
- Target release or timeline.  
- Status (planned, in-progress, done).  
- Notes (risks, dependencies).

## 13. Phần 9 – Open Questions and Next Experiments

Không phải mọi điều đều phải được quyết trong một pilot. Template nên tạo chỗ cho:
- các câu hỏi còn mở;  
- các hypothesis cần thử thêm;  
- ý tưởng experiment nhỏ trong pilot tiếp theo hoặc trong sandbox.

Mỗi open question nên có:
- description;  
- why it matters;  
- possible experiment;  
- owner.

## 14. Phần 10 – Links and References

Liệt kê:
- links tới dashboards views chính đã dùng;  
- links tới docs Pack 03 liên quan (flows, copy, authority, continuity);  
- links tới scenario IDs trong library (58) được sử dụng;  
- links tới tickets/issues quan trọng mở ra từ pilot.

## 15. Rules cho versioning, chia sẻ và lưu trữ post-pilot docs

- Mỗi pilot (hoặc phase) nên có ít nhất một bản post-pilot synthesis theo template này.  
- File nên được lưu trong hệ thống central (vd folder Pack 03 / Pilots / Pilot_X).  
- Version hoá khi cập nhật sau follow-up.  
- Chia sẻ tới Product, Design, Engineering, CS, Leadership liên quan.  
- Tóm tắt 1–2 trang có thể được dùng cho executive review, nhưng bản chi tiết vẫn là nguồn sự thật.

## 16. Ownership và cadence cho post-pilot reviews

- Product Management và Pilot Delivery đồng sở hữu nội dung post-pilot.  
- Product Analytics chịu trách nhiệm phần signals & metrics.  
- Customer Success chịu trách nhiệm phần client/stakeholder feedback.  
- Review cadence: mỗi pilot hoặc phase kết thúc.  
- Có thể có một “Pilot Council” hoặc forum tương đương để review và ratify các decisions.

## 17. Anti-pattern post-pilot nghiêm trọng phải tránh

1. Không có tài liệu post-pilot – chỉ có một buổi meeting miệng.  
2. Post-pilot chỉ là danh sách bug và feature request, không có learning hoặc decision.  
3. Feedback và signals không được nối với flows, roles, scenarios cụ thể.  
4. Decisions không được log – 6 tháng sau không ai nhớ vì sao đã quyết như vậy.  
5. Không phân biệt được điều gì chính là “không nên làm nữa” (hypothesis bị bác bỏ).  
6. Không ai chịu trách nhiệm cập nhật docs Pack 03 sau pilot.  
7. Mỗi pilot lặp lại cùng một mistake vì không đọc lại post-pilot trước.

## 18. Cách dùng template này trong planning cho wedge tiếp theo và GTM

- Dùng các learning themes và decisions để quyết định wedge tiếp theo cho Nextflow OS.  
- Dùng Decision Log để ưu tiên backlog, tránh thêm feature mà không có rationale.  
- Dùng post-pilot docs như case study nội bộ và external (khi đã anonymize) cho GTM.  
- Dùng open questions để thiết kế research và pilot vòng sau.

## 19. Các tài liệu UX/strategy tiếp theo nên sinh ra từ đây

1. **61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS.md** – runbook chi tiết cho hỗ trợ trong pilot.  
2. **62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY.md** – checklist cho team mới.  
3. **63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE.md** – outline deck training.  
4. **64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY.md** – FAQ cho người dùng hiện trường.  
5. **65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE.md** – guide cho retrospectives liên pack.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Post-Pilot Learning Synthesis and Decision Log của Pack 03:

1. Mỗi pilot (hoặc phase) phải có một bản synthesis và decision log theo khung chuẩn, không chỉ recap miệng.  
2. Synthesis phải dựa trên cả signals (metrics, dashboards, events) và stories (feedback, scenario reenactment).  
3. Learning phải gắn với flows, roles, authority, continuity, copy semantics và scenarios cụ thể.  
4. Decisions phải được log rõ ràng với rationale, scope, owners, timelines và linked docs.  
5. Post-pilot docs phải được lưu trữ, chia sẻ và dùng lại cho planning các pilot, release và wedge tiếp theo.  
6. Tài liệu này là cầu nối giữa pilot operations và strategy-level decisions của Nextflow OS.

## 21. Điều kiện hoàn thành của tài liệu

Post-Pilot Learning Synthesis and Decision Log Template được xem là đạt yêu cầu khi:
- mỗi pilot có một bản ghi học và quyết định dễ tìm, dễ đọc;  
- các teams có thể nhìn lại và hiểu tại sao Pack 03 được điều chỉnh theo cách hiện tại;  
- các pilot sau không lặp lại cùng một mistake vì thiếu memory;  
- và leadership có một nguồn sự thật rõ ràng để đánh giá tiến độ và effectiveness của Pack 03.

## AG Execution Prompt

You are acting as a pilot-learning synthesizer, decision-log architect, and strategy-operations bridge.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: strategy hypotheses, UX/flow design, metrics, event taxonomy, triage model, dashboards, scenario library, and field playbook are already defined.
- This document defines the template for post-pilot learning synthesis and decision logging.

### Objective
Refine this Post-Pilot Learning Synthesis and Decision Log Template into a production-grade tool that teams can actually fill in after pilots to capture learning, decisions, and next steps in a structured, reusable way.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between signals, learning, and decisions.  
- Keep the output concrete enough for real pilots and executive reviews.

### Tasks
1. Rewrite the post-pilot thesis into a sharper executive form.
2. Produce a clear sectioned template with prompts and examples for each part.  
3. Add guidance on ownership, cadence, and versioning.  
4. Define how to link decisions to flows, roles, metrics, and docs.  
5. Identify the top five failure patterns this template should prevent.  
6. Recommend next documents for support, onboarding, training decks, FAQs, and continuous improvement guides.

### Constraints
- Do not let post-pilot docs become mere bug lists.  
- Do not let decisions stay implicit or undocumented.  
- Do not overload the template with theory; keep it fillable under real constraints.  
- Keep the output suitable for both squad-level and leadership-level use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Post-Pilot Thesis
2. Synthesis Template Structure
3. Decision Log Structure and Linking
4. Ownership and Cadence
5. Failure Risks
6. Recommended Next Documents
7. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make post-pilot learning and decision capture explicit and actionable.  
- The result must remain consistent with Nextflow OS as an SME Business OS.  
- The document must help teams turn pilot experience into structured learning and decisions.  
- The output must reduce ambiguity around what to capture after pilots and where to find it later.
