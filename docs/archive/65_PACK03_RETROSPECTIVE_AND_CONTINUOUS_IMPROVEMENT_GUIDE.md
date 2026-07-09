# Nextflow OS – Pack 03 Retrospective and Continuous Improvement Guide

**Document ID:** 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Pilot Delivery / QA & Support / Product Analytics / Customer Success  
**Dependent Packs:** Program Delivery, Frontend Delivery, Backend Workflow, Mobile Platform, Analytics & Data, GTM Enablement  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY, 63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE, 64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY

## 1. Mục tiêu tài liệu

Tài liệu này là **Retrospective and Continuous Improvement Guide** cho Pack 03 của Nextflow OS. Sau khi Pack 03 đã có:
- chiến lược và flows rõ (20–22, 25–27);  
- metrics, event taxonomy, dashboards và triage model (42, 48, 49, 55);  
- scenario library, environments, support guide, field playbook, training deck, FAQ (58–64);  
- post-pilot synthesis & decision log template (60);

thì tài liệu này trả lời câu hỏi:

> **Làm sao để sau mỗi vòng pilot hoặc release, Pack 03 không chỉ “giải quyết issue và ship tiếp”, mà thực sự có một vòng retro + cải tiến liên tục: nhìn lại signals, scenarios, decisions, support patterns, training, authority & continuity semantics – rồi chốt ra được những điều cần giữ, cần bỏ, cần làm khác trong vòng tiếp theo?**

Tài liệu này định nghĩa cách tổ chức **các buổi retrospective Pack 03 (theo pilot, theo release, theo quý)** và cách gắn chúng vào continuous improvement loop.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của retrospectives và continuous improvement trong Pack 03.  
2. Retrospective thesis của tài liệu.  
3. Các loại retro nên có (pilot retro, release retro, quarterly/pack-level retro).  
4. Cấu trúc cuộc họp retro chuẩn cho Pack 03.  
5. Cách sử dụng inputs: triage model, post-pilot docs, dashboards, scenario library, support logs, feedback.  
6. Cách định nghĩa “learning themes” và “improvement items”.  
7. Cách phân loại item: quick wins, structural changes, hypotheses mới, experiments.  
8. Rules cho việc ghi log quyết định và update các docs Pack 03.  
9. Ownership và cadence của các loại retro.  
10. Những anti-pattern retro cần tránh.  
11. Liên kết retro với roadmap, GTM và authority/continuity governance.  
12. Cách đo hiệu quả của continuous improvement (CI) trong Pack 03.  
13. Các tài liệu/artefact tiếp theo nên sinh ra từ baseline này.

## 2. Vì sao Pack 03 cần Retrospective & Continuous Improvement Guide

Pack 03 chạm rất nhiều lớp: UX, copy, authority, continuity, Mobile Ops, Web Admin, metrics, support, training. Mỗi pilot và release sẽ tạo ra một lượng lớn dữ liệu và feedback:
- tickets support, các cuộc gọi, chat;  
- signals từ dashboards;  
- post-pilot syntheses và decision logs;  
- notes trong scenario library;  
- training feedback và FAQ.

Không có guide này, dễ xảy ra:
- mỗi team tự làm “retro nội bộ” mà thiếu bức tranh chung;  
- một số issues và learning bị lặp lại qua nhiều pilot vì không được chốt và khắc vào system;  
- decision logs (60) không được xem lại khi planning;  
- metrics cải thiện hay xấu đi nhưng không được đọc cùng với bối cảnh.

Tài liệu này đưa ra một cách thống nhất để **nhìn lại, học và điều chỉnh** Pack 03, tránh vừa làm vừa quên.

## 3. Retrospective thesis cho Pack 03

Retrospective thesis có thể phát biểu như sau:

> **Trong Pack 03, mỗi pilot và mỗi release là một cycle học – không chỉ là một mốc giao hàng. Retrospective không phải là chỗ để kể lại mọi thứ đã làm, mà là nơi nhìn lại flows, signals, scenarios và decisions cùng nhau, để chốt điều gì giữ, bỏ, đổi và thử mới. Nếu không có retro có cấu trúc, Pack 03 dễ bị mắc kẹt trong “chữa cháy” mà không nâng dần chất lượng trải nghiệm và vận hành.**

Từ thesis này, mười nguyên lý được suy ra:

1. Retro phải dựa trên **facts** (metrics, tickets, decisions) và **stories** (feedback, anecdotes).  
2. Retro không phải chỉ là “chúng ta đã làm tốt/chưa tốt”, mà là “chúng ta đã học gì, quyết gì, kết quả ra sao”.  
3. Mỗi retro nên kết thúc với một số ít **improvement items rõ ràng** – không phải danh sách task khổng lồ.  
4. Retro phải kết nối với decision log (60) và roadmap, không tồn tại riêng lẻ.  
5. Retro tốt phải an toàn: mọi người có thể nói thật về vấn đề mà không sợ đổ lỗi.  
6. Retro phải nhìn cross-team (Product, CS, Support, Eng, Field) chứ không chỉ trong một silo.  
7. Retro nên dùng chung ngôn ngữ Pack 03 (flows, roles, states, authority, continuity).  
8. Continuous improvement là sự tích luỹ nhiều thay đổi nhỏ, không chỉ những initiative lớn.  
9. Không phải mọi vấn đề đều được giải ngay, nhưng mọi vấn đề quan trọng đều phải có **tình trạng**: giải, theo dõi, hay chấp nhận.  
10. Retro không phải buổi duy nhất để học – nhưng là nơi chốt lại học và biến thành hành động.

## 4. Các loại retrospective trong Pack 03

Pack 03 nên có ba loại retro chính:

1. **Pilot Retrospective** – sau mỗi pilot hoặc phase pilot.  
2. **Release Retrospective** – sau mỗi release có chạm Pack 03 (đặc biệt nếu nhiều change).  
3. **Quarterly / Pack-Level Retrospective** – mỗi quý hoặc nửa năm, nhìn lại toàn bộ Pack 03.

### 4.1 Pilot Retrospective

- Tập trung vào một pilot cụ thể (site, cohort, thời gian).  
- Sử dụng trực tiếp post-pilot synthesis (60) làm input chính.  
- Mục tiêu: chốt học từ pilot đó, điều chỉnh cho pilot tiếp hoặc rollout.

### 4.2 Release Retrospective

- Tập trung vào một version/release.  
- Dựa trên change impact review (52), metrics trước/sau, triage issues.  
- Mục tiêu: xem các thay đổi Pack 03 đã gây impact gì và có gì cần sửa nhanh.

### 4.3 Quarterly / Pack-Level Retrospective

- Nhìn từ trên cao: nhiều pilot, nhiều release.  
- Sử dụng tổng hợp decision logs, metrics dài hạn (42), trends trong support/feedback.  
- Mục tiêu: điều chỉnh chiến lược cho wedge, trải nghiệm, authority, continuity, enablement.

## 5. Cấu trúc cuộc họp retro chuẩn cho Pack 03

Một buổi retro (90–120 phút) nên có cấu trúc chính sau:

1. Mở đầu & mục tiêu (5–10’).  
2. Recap bối cảnh (10’).  
3. Signals & dữ liệu (20–30’).  
4. Learning themes & findings (20–30’).  
5. Decisions & improvement items (20–30’).  
6. Check-in về process & cách làm việc (10–15’).  
7. Kết thúc & next steps (5–10’).

### 5.1 Mở đầu & mục tiêu

- Nhắc mục tiêu của buổi retro: học gì, quyết gì.  
- Nhắc nguyên tắc an toàn, không đổ lỗi cá nhân.

### 5.2 Recap bối cảnh

- Dùng 1–2 slide từ post-pilot synthesis (pilot retro) hoặc change-impact review (release retro) để nhắc: bối cảnh, mục tiêu ban đầu, scope.

### 5.3 Signals & dữ liệu

- Product Analytics trình bày các **signals chính**:  
  - từ dashboards (55);  
  - từ triage model (48);  
  - từ support logs;  
  - từ training feedback và FAQ.  
- Nhấn mạnh trend, không chỉ số liệu raw.

### 5.4 Learning themes & findings

- Dùng Top Learning Themes từ post-pilot docs (60) hoặc tổng hợp theo quý.  
- Cho mỗi theme, nêu:  
  - evidence;  
  - flows/roles liên quan;  
  - implications.

### 5.5 Decisions & improvement items

- Xem lại decisions đã log từ pilot/release; status hiện tại.  
- Thảo luận và chốt **improvement items mới**:  
  - Product/UX;  
  - Authority/continuity;  
  - Metrics/dashboards;  
  - Support/training;  
  - Process/collaboration.  
- Mỗi item cần: owner, timeline dự kiến, liên kết doc (flows, scenarios, matrix...).

### 5.6 Check-in về process & cách làm việc

- 5–10’ để hỏi:  
  - “Điều gì trong cách chúng ta làm việc đã giúp?”,  
  - “Điều gì làm việc khó hơn?”  
- Chốt 1–2 thay đổi nhỏ cho cách phối hợp (vd quy ước issue intake, cách dùng scenario library...).

### 5.7 Kết thúc & next steps

- Tóm tắt 3–5 điểm chính và items quan trọng.  
- Nhắc lại nơi lưu notes và cách theo dõi items.  
- Nếu cần, lên lịch retro tiếp theo.

## 6. Cách sử dụng inputs trong retro

### 6.1 Triage model và support logs

- Dùng triage model (48) để xem phân bố issue theo loại, severity, flows, roles.  
- Dùng Support Guide (61) để tìm patterns: issue nào xuất hiện nhiều, câu hỏi nào lặp lại.

### 6.2 Post-pilot docs và decision logs

- Dùng post-pilot synthesis & decision log (60) để tránh phải “nhớ lại bằng miệng”.  
- Kiểm tra: quyết định nào đã thực hiện, quyết định nào chưa, và kết quả ra sao.

### 6.3 Dashboards và metrics

- Dùng dashboards (55) để hỗ trợ các themes:  
  - completion/time-to-complete;  
  - authority friction;  
  - continuity & retry;  
  - errors/validation;  
  - change impact.  
- So sánh trước/sau release hoặc giữa các pilot.

### 6.4 Scenario library và training

- Dùng Scenario Library (58) để gắn learning với scenarios cụ thể.  
- Xem lại training deck/FAQ (63, 64) khi theme liên quan đến hiểu sai hoặc thiếu enablement.

## 7. Định nghĩa learning themes và improvement items

### 7.1 Learning themes

- Là nhóm các observation có cùng gốc, ví dụ:  
  - “Field users vẫn chưa tin vào trạng thái ‘đã lưu trên thiết bị’”;  
  - “Authority boundaries giữa role A và B chưa rõ”;  
  - “Cross-surface handoff Web→Mobile cho flow X hay bị tắc”;  
  - “Scenario library chưa được dùng đều giữa các team”.  
- Mỗi theme nên đi kèm: evidence (metrics + examples), flows/roles liên quan, severity.

### 7.2 Improvement items

- Là các việc cụ thể trả lời: “Chúng ta sẽ làm gì với theme này?”  
- Phân loại:  
  - quick win;  
  - structural change (cần design/engineering);  
  - training/enablement update;  
  - hypothesis mới cần experiment.

## 8. Phân loại item & liên kết với roadmap/experiments

- **Quick wins** – có thể làm trong 1–2 sprint mà không cần redesign lớn (vd chỉnh copy, thêm FAQ, tinh chỉnh dashboard).  
- **Structural changes** – cần đi qua design/eng cycle (flow mới, pattern mới).  
- **Training updates** – cập nhật training deck, playbook, FAQ cho rõ hơn.  
- **Experiments** – thử waivers, thay đổi nhỏ về authority/UX với cohort nhỏ.

Mỗi item nên được link tới:
- backlog/roadmap entry;  
- docs Pack 03 liên quan (flows, metrics, authority, scenario);  
- decision log ID.

## 9. Ownership và cadence retro

- **Pilot retro** – chủ trì bởi Product + Pilot Delivery; diễn ra trong vòng 1–2 tuần sau khi pilot kết thúc (hoặc phase).  
- **Release retro** – chủ trì bởi Product + Engineering; diễn ra trong vòng 1–2 sprint sau release.  
- **Quarterly retro** – chủ trì bởi Product + Program/Leadership; diễn ra theo quý hoặc nửa năm.

Thành phần tham gia nên gồm đại diện: Product, Design/UX, Engineering, QA, Analytics, CS, Support, Pilot Delivery; khi phù hợp, có thể mời 1–2 đại diện khách hàng (hoặc dùng feedback ghi sẵn).

## 10. Anti-pattern retro cần tránh

1. Biến retro thành buổi “kể lại” tất cả hoạt động, không chốt học hoặc quyết định.  
2. Tập trung vào đổ lỗi cá nhân hoặc đội khác.  
3. Không dùng dữ liệu, chỉ dựa vào cảm giác.  
4. Log quá nhiều action item nhỏ không ai theo dõi.  
5. Không liên kết retro với decision log, roadmap hoặc docs Pack 03.  
6. Không ghi chép/không lưu trữ notes, khiến vòng sau không ai nhớ.  
7. Không quay lại xem retro cũ khi lên kế hoạch mới.

## 11. Liên kết retro với roadmap, GTM và governance

- Roadmap Product nên sử dụng learning và decisions từ retro để ưu tiên.  
- GTM/Enablement nên dùng retro để điều chỉnh messaging, training, tài liệu.  
- Authority/continuity governance (50, 57, 53) nên được điều chỉnh dựa trên patterns trong retro (vd waivers dùng quá nhiều ở đâu, boundary nào chưa rõ).  
- Post-pilot synthesis (60) và retro giúp cập nhật Strategy Pack (03, 04, 07) khi hypothesis thị trường thay đổi.

## 12. Đo hiệu quả Continuous Improvement

Có thể đánh giá CI của Pack 03 qua:
- giảm dần các dạng issues lặp lại qua nhiều pilot;  
- cải thiện trends metrics (completion, authority friction, retry_exhausted, error rates);  
- tăng mức độ sử dụng Scenario Library, playbook, FAQ, support guide;  
- phản hồi nội bộ tốt hơn về mức độ rõ ràng của docs và quy trình.

## 13. Các artefact và tài liệu tiếp theo

Từ guide này có thể sinh ra:

1. **Retro template slide deck** – bộ slide chuẩn để chạy pilot/release retro.  
2. **Retro notes & action log format** – format nhẹ để ghi chép và theo dõi items.  
3. **CI dashboard view** – view trong dashboards hiện có, tập trung vào signals liên quan CI (issue repeat rate, training coverage, docs usage nếu đo được).  
4. **Pack 03 improvement backlog view** – view trong công cụ quản lý công việc, cho thấy items CI theo theme.  
5. **Cross-pack retro guide** – mở rộng từ Pack 03 cho các pack khác.

## 14. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Retrospective and Continuous Improvement Guide của Pack 03:

1. Mỗi pilot và release của Pack 03 nên có một vòng retro có cấu trúc, không chỉ là recap hoặc bug review.  
2. Retro phải sử dụng đầy đủ inputs: triage model, post-pilot docs, dashboards, scenario library, support patterns, training feedback.  
3. Retro phải sinh ra một số ít improvement items rõ, liên kết với decision log và roadmap.  
4. Continuous improvement là trách nhiệm chung của Product, CS, Support, Engineering, Analytics và Pilot Delivery.  
5. Hiệu quả CI phải được đo qua việc giảm issues lặp lại, cải thiện metrics và tăng sử dụng assets Pack 03.  
6. Tài liệu này là cầu nối giữa các vòng pilot/release và sự phát triển dài hạn của Pack 03.

## 15. Điều kiện hoàn thành của tài liệu

Pack 03 Retrospective and Continuous Improvement Guide được xem là đạt yêu cầu khi:
- mỗi pilot/release có một retro sử dụng cấu trúc này;  
- learning và decisions từ retro được log và dùng lại trong planning;  
- patterns issues được giảm dần theo thời gian;  
- và Pack 03 tiếp tục tiến hoá mà không đánh mất coherence và intent ban đầu.

## AG Execution Prompt

You are acting as a continuous-improvement systems designer, retrospective facilitator, and learning-to-roadmap translator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: strategy, UX, flows, metrics, triage model, dashboards, scenario library, support guide, field playbook, training deck, FAQ, and post-pilot templates are already defined.
- This document defines how to run retrospectives and continuous improvement loops for Pack 03.

### Objective
Refine this Retrospective and Continuous Improvement Guide into a practical, repeatable framework for pilot, release, and quarterly retrospectives that drive concrete improvements and inform the roadmap.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the focus on flows, signals, scenarios, authority, continuity, and enablement.  
- Keep the output concrete enough for teams to adopt without heavy facilitation.

### Tasks
1. Sharpen the retrospective thesis and principles.  
2. Specify agendas and timeboxes for different retro types.  
3. Provide templates/prompts for learning themes and improvement items.  
4. Clarify how to link retro outputs to decision logs, backlogs, and docs.  
5. Identify the top retro/CI failure patterns to avoid.  
6. Recommend supporting artefacts (slide templates, action logs, dashboards) and how to use them.

### Constraints
- Do not turn retros into heavy, theory-laden processes.  
- Do not separate retro discussions from actual data and docs.  
- Do not let retro outputs die in slides; focus on linkage to action.  
- Keep the guide applicable across different pilot and release sizes.

### Output Format
Return a revised markdown document with these sections:
1. Retrospective Thesis and Principles
2. Retro Types and Agendas
3. Inputs and Analysis
4. Learning Themes and Improvement Items
5. Linking to Roadmap and Governance
6. CI Metrics and Failure Patterns
7. Supporting Artefacts

### Acceptance Criteria
- The output must make Pack 03 retrospectives structured, data-informed, and action-oriented.  
- The result must remain consistent with Nextflow OS as an SME Business OS.  
- The document must help teams turn pilots and releases into continuous improvement loops.  
- The output must reduce repeated issues and strengthen Pack 03 over time.
