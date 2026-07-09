# Nextflow OS – Pack 03 Copy QA and Semantic Regression Checklist

**Document ID:** 54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Writing / QA Systems / Product Management  
**Dependent Packs:** Frontend Delivery, QA & Support, Analytics & Data, GTM Enablement, Pilot Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **checklist chính thức cho Copy QA và Semantic Regression** trong Pack 03 của Nextflow OS. Nếu tài liệu 40 đã khóa copy system và UX writing guidelines, tài liệu 47 đã khóa terminology register và microcopy inventory, tài liệu 43 và 50 đã khóa authority semantics và role-permission mapping, tài liệu 46 và 53 đã khóa continuity và reconciliation patterns, còn tài liệu 52 đã khóa release change impact review, thì tài liệu này trả lời câu hỏi:

> **Trước mỗi release hoặc pilot quan trọng, team phải rà những gì về từ ngữ, label, message, state wording, authority phrasing, continuity copy, recovery messages và semantic distinctions để đảm bảo rằng không có regression “về nghĩa” nào đã len vào – ngay cả khi các test kỹ thuật đều pass?**

Trong thực tế, nhiều lỗi sản phẩm không phải là bug kỹ thuật mà là **regression về semantics**:
- state label đổi nghĩa;  
- authority message gây hiểu sai trách nhiệm;  
- continuity wording hứa nhiều hơn technical truth;  
- validation message đổ lỗi sai cho user;  
- recovery path phrasing khiến người dùng nghĩ họ phải làm lại nhiều hơn cần thiết;  
- metrics và dashboards được đọc sai vì từ ngữ không còn khớp semantics.

Tài liệu này tồn tại để tạo một **lớp kiểm tra cuối cùng cho ngôn ngữ và nghĩa** – song song với QA kỹ thuật – tập trung vào những vùng mà Pack 03 đã coi là “semantic load cao”.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của Copy QA và Semantic Regression checklist trong Pack 03.  
2. Semantic-regression thesis của tài liệu.  
3. Các vùng semantics có risk cao cần được QA trước release.  
4. Cấu trúc checklist theo state, action, authority, continuity, validation, recovery và observability wording.  
5. Rules để so sánh UI copy với terminology register và copy system.  
6. Rules để so sánh authority/permission UX với role-permission matrix.  
7. Rules để so sánh continuity copy với technical handshake và reconciliation patterns.  
8. Rules để so sánh errors/warnings/recovery messages với empty-state và error messaging guidelines.  
9. Rules để kiểm tra semantic alignment với QA scenarios, metrics, event taxonomy và demo scripts.  
10. Rules cho ownership và workflow của Copy QA trong sprint và trước release.  
11. Những anti-pattern copy QA và semantic regression nghiêm trọng phải tránh.  
12. Cách dùng checklist này trong pilot hardening và release impact reviews.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Copy QA và Semantic Regression checklist

Pack 03 đã đầu tư mạnh vào việc định nghĩa từ ngữ và semantics: state grammar, authority semantics, continuity semantics, copy system, terminology register, metrics framework, observability, role-permission mapping. Khi sản phẩm tiến hóa qua nhiều sprint và pilot, risk không chỉ nằm ở bug kỹ thuật, mà còn ở việc **ngôn ngữ bị mòn, bị lệch hoặc bị vá cục bộ**.

Ví dụ điển hình:
- một state term “Pending Approval” được đổi thành “Awaiting Review” ở một màn, trong khi các nơi khác vẫn dùng term cũ;  
- một continuity message “Đã lưu trên thiết bị” bị tái dùng ở chỗ lẽ ra cần “Đang chờ đồng bộ”;  
- một authority message “Không đủ quyền” bị dùng cho cả policy-blocked lẫn role-restricted;  
- một validation error đổ lỗi cho user trong khi lỗi thuộc về hệ thống;  
- một recovery prompt “Thử lại” được dùng cho case không có retry path thực.

Không có Copy QA checklist, những regression này rất dễ lọt qua vì “trông vẫn ổn” và không làm test chức năng fail, nhưng chúng từ từ phá grammar và trust của Pack 03. Checklist này là để bắt những lỗi đó trước khi ship.

## 3. Semantic-regression thesis cho Pack 03

Semantic-regression thesis có thể phát biểu như sau:

> **Trong Pack 03, copy và semantics không phải lớp trang trí mà là một phần của logic sản phẩm; mọi release không chỉ phải pass QA kỹ thuật mà còn phải pass một vòng kiểm tra rằng state terms, action labels, authority phrases, continuity cues, validation/recovery messages và observability wording vẫn align với grammar nền. Nếu không, hệ thống sẽ “hoạt động đúng” nhưng nói sai.**

Từ thesis này, mười nguyên lý được suy ra:

1. Copy QA phải ưu tiên **meaning correctness over style polish** trong bối cảnh release readiness.  
2. Regression có thể xảy ra cả khi “chưa ai sửa copy cố ý” – do component reuse, fallback defaults hoặc dev strings.  
3. Preferred terms và avoided variants trong register là baseline, không phải suggestion.  
4. Authority và continuity wording phải map tới technical/policy truth như đã định nghĩa.  
5. Validation và recovery messages phải phản ánh đúng path khả dụng.  
6. Demo scripts và training materials phải nói cùng ngôn ngữ với product UI.  
7. Metrics labels và dashboard text phải khớp semantics của events và flows.  
8. Copy QA nên được gắn vào QA scenarios, không xem như check “ngoài lề”.  
9. Ownership copy và semantics không thể phó thác cho “người cuối cùng commit UI”.  
10. Khi có nghi ngờ, ưu tiên coherence và clarity so với việc giữ một phrasing cũ nhưng không còn đúng.

## 4. Các vùng semantics có risk cao

Checklist Pack 03 nên tập trung trước hết vào các vùng semantic-load cao sau:

1. **State and status labels** – mọi từ diễn tả trạng thái.  
2. **Primary action labels** – các nút hành động có hậu quả nghiệp vụ.  
3. **Authority and restriction messages** – các message khi user bị chặn.  
4. **Continuity, pending, retry và offline copy** – mọi từ diễn tả sync, upload, saved, pending.  
5. **Validation, warning và error messages** – đặc biệt cho launch-critical flows.  
6. **Recovery and retry prompts** – mọi nơi hệ thống đề xuất bước tiếp theo.  
7. **Import-fix, grouped correction và return-for-more-info messages**.  
8. **Empty states, landing copy và orientation text**.  
9. **Metrics labels, dashboard dimensions và pilot-signal summaries**.  
10. **Demo script phrasing vs in-product copy** cho các moment quan trọng.

## 5. Cấu trúc checklist tổng thể

Tài liệu này đề xuất một cấu trúc checklist theo bảy nhóm lớn:

1. State and status semantics.  
2. Action and outcome semantics.  
3. Authority and role/permission semantics.  
4. Continuity and reconciliation semantics.  
5. Validation, warning, error and recovery semantics.  
6. Observability, metrics and dashboard semantics.  
7. Demo, training and support semantics.

Mỗi nhóm có một set câu hỏi “YES/NO + ghi chú” để dùng trong các buổi pre-release QA hoặc release-impact review.

## 6. Checklist nhóm State and Status Semantics

Các câu hỏi chính:

1. Mọi state label trong release này có nằm trong **state grammar đã định nghĩa** không?  
2. Có label state nào mới xuất hiện mà không có entry trong terminology register không?  
3. Có nơi nào dùng synonyms khác nhau cho cùng một state (Pending Approval vs Awaiting Review) không?  
4. Có state nào đổi nghĩa (ví dụ trước là “pending backend decision”, giờ lại dùng cho “pending local validation”) không?  
5. Mọi screens hiển thị state (queue, detail, summary, mobile) có dùng cùng term cho cùng semantics không?  
6. State transitions hiển thị cho user có khớp với transitions đã định trong tài liệu 26 không?  
7. Any state that appears in dashboards/filters/search có label khớp semantics sản phẩm không?

Nếu câu trả lời “Không” ở bất kỳ mục nào, release phải: 
- hoặc update UI copy cho khớp,  
- hoặc update register/state grammar và các nơi liên quan nếu quyết định đổi semantics.

## 7. Checklist nhóm Action and Outcome Semantics

1. Primary actions (Approve, Reject, Complete, Reassign, Upload, Retry, Restore, v.v.) có dùng đúng **verb families** trong register không?  
2. Có action label nào reuse ở hai nơi nhưng mang nghĩa khác nhau (ví dụ “Hoàn tất” dùng cho cả “kết thúc task” và “lưu nháp”) không?  
3. Outcome messages sau khi action xong (Completed, Sent for Review, Returned for Info, Evidence Added) có khớp với outcome semantics đã định không?  
4. Có nơi nào action và outcome dùng hai từ khác nhau cho cùng một việc, dễ gây nhầm (ví dụ action “Gửi duyệt” nhưng outcome là “Đã hoàn tất”) không?  
5. Các actions có side-effects authority/continuity (Reassign, Escalate, Override) có message thể hiện được các side-effects đó không?  
6. Button labels trên Mobile Ops có phân biệt rõ “Lưu cục bộ” vs “Gửi lên” vs “Hoàn tất” không?

## 8. Checklist nhóm Authority and Role/Permission Semantics

1. Các message khi user bị chặn (không thấy nút, nút disabled, hoặc lỗi khi bấm) có phân biệt rõ **thiếu quyền (role)** vs **chưa đủ authority threshold** vs **blocked by policy/prerequisite** không?  
2. Mọi trường hợp “view-only” có copy hoặc context nhắc được rằng user này vẫn có trách nhiệm hiểu/giám sát nhưng không commit quyết định không?  
3. Mọi escalation path (Yêu cầu duyệt, Gửi cấp trên, Gửi phối hợp) có messaging consistent với role-permission matrix không?  
4. Có message nào đổ lỗi cho “bạn không có quyền” trong khi thực ra là state/item đang không ở điều kiện đúng không?  
5. Các labels về owner, assigned to, waiting for (đang chờ ai) có thể hiện đúng accountability theo thiết kế không?  
6. Trên Mobile Ops, mọi chỗ user có thể update nhưng không thể confirm outcome cuối cùng, copy có phân biệt rõ “bạn đã ghi nhận” vs “hệ thống đã hoàn tất” không?

## 9. Checklist nhóm Continuity and Reconciliation Semantics

1. Mọi continuity phrases như “Đã lưu trên thiết bị”, “Đang chờ đồng bộ”, “Đang tải lên”, “Thử lại”, “Đã xác nhận từ máy chủ” có được dùng đúng milestone semantics từ tài liệu 46 và 53 không?  
2. Có nơi nào gọi local capture là “Hoàn tất” hoặc “Đã gửi” không?  
3. Có message nào dùng từ “Đã tải lên” khi attachment mới chỉ vào queue hoặc mới bắt đầu upload không?  
4. Khi sync fail hoặc retry exhaustion, copy có nói rõ trạng thái thật (hệ thống đã dừng thử lại, bản nháp vẫn còn) không?  
5. Khi backend reject muộn, message có giải thích được rằng outcome đã thay đổi so với điều user kỳ vọng trước đó không?  
6. Các flows reconciliation (partial success, conflict, stale view) có dùng đúng message family từ register không?  
7. Trên Mobile Ops, user có bao giờ bị “trả về màn hình completed” trong khi state server mới là rejected không?

## 10. Checklist nhóm Validation, Warning, Error and Recovery Semantics

1. Validation messages có nói đúng nguyên nhân lỗi không (thiếu dữ liệu, sai định dạng, thiếu evidence, conflict với state) hay chỉ chung chung “Đã xảy ra lỗi”?  
2. Warning messages có phân biệt rõ risk type: destructive action, stale data, authority threshold, policy mismatch, hay chỉ dùng một khung warning chung?  
3. Recovery prompts (Thử lại, Thử lại sau, Chỉnh sửa và gửi lại, Gửi hỗ trợ) có align với thực tế hệ thống cho phép không?  
4. Có message nào khuyến khích user “Nhập lại từ đầu” trong khi product vẫn còn payload/draft có thể dùng lại không?  
5. Empty states có dùng vocabulary phù hợp với copy system, không hứa sai về features không tồn tại?  
6. Import-fix và grouped correction messages có phân biệt rõ “bản ghi đã sửa” vs “vẫn còn lỗi” vs “sẵn sàng một phần” không?

## 11. Checklist nhóm Observability, Metrics and Dashboard Semantics

1. Labels của metrics, dimensions và filters trên dashboards có khớp với state terms, action terms và flow semantics đã định không?  
2. Có metric nào vẫn dùng tên cũ dù semantics đã đổi (ví dụ “Completion rate” nhưng giờ đếm local-save) không?  
3. Các dashboard cho pilot signal review có dùng từ ngữ consistent với triage model (issue type, system level) không?  
4. Events hoặc logs surface cho QA/Support có message text nhất quán với UI không, hay dùng các từ nội bộ khác hẳn?  
5. Khi show trust/continuity metrics, labels có giải thích được đó là “retry exhaustion”, “backend rejection rate”, “conflict frequency” chứ không phải generic “error” không?

## 12. Checklist nhóm Demo, Training and Support Semantics

1. Demo scripts (tài liệu 44) có dùng những term, phrases và outcomes khớp với UI trong build hiện tại không?  
2. Training materials và onboarding docs có cập nhật khi state terms, authority semantics hoặc continuity phrases đổi không?  
3. Support macros hoặc canned responses có dùng vocabulary trong register hay sử dụng ngôn ngữ riêng?  
4. Có mâu thuẫn nào giữa cách sales nói trong demo và cách UI nói trong sản phẩm thật không?  
5. Pilot communications (guides cho người dùng pilot) có align vocabulary với product UI không?

## 13. Rules cho workflow Copy QA trong sprint và trước release

## 13.1 Trong sprint

- Mọi ticket có thay đổi UI hoặc semantics phải gắn tag Copy/UX để được review.  
- UX Writing hoặc Product Design review strings mới so với copy system và register.  
- Khi semantics mới xuất hiện, designer/writer phải cập nhật register trước khi merge.

## 13.2 Trước release

- Chạy checklist này trên những flows/screen families chạm trong release.  
- Cross-check với change impact review records (tài liệu 52) để tìm các change semantic-significant.  
- Log mọi semantic regression found như bug, không chỉ “note nhẹ”.

## 13.3 Sau pilot

- Dùng pilot feedback liên quan đến “hiểu sai”, “khó hiểu”, “không tin tưởng” để cập nhật lại copy hoặc register khi cần.  
- Nếu feedback chỉ ra drift, thêm câu hỏi vào checklist để tránh lặp lại.

## 14. Ownership cho Copy QA và Semantic Regression

- UX Writing / Product Design chịu trách nhiệm chính về semantic integrity của UI copy.  
- Product Management chịu trách nhiệm đảm bảo semantics align với product truth và roadmap.  
- QA chịu trách nhiệm chạy checklist và log regressions.  
- Sales Enablement / Training / Support chịu trách nhiệm align docs, scripts, macros với product vocabulary.  
- Engineering có trách nhiệm không “chế string” mới mà không qua review.

## 15. Anti-pattern Copy QA và Semantic Regression nghiêm trọng phải tránh

1. Xem copy như “make-up layer”, chỉ kiểm tra lỗi chính tả, không kiểm tra meaning.  
2. Cho phép mỗi squad tự đặt từ cho tiện, không qua register.  
3. Dùng generic error/warning/retry messages cho mọi trường hợp.  
4. Dùng cùng phrase “Bạn không có quyền” cho mọi loại block (role, authority, policy, state).  
5. Kể một câu chuyện trong demo khác hẳn thuật ngữ trong sản phẩm.  
6. Đổi state label mà không update metrics labels và docs.  
7. Không có ai “chịu trách nhiệm cuối cùng” cho coherence ngôn ngữ.

## 16. Cách dùng checklist này trong pilot hardening và release impact review

- Trong pilot hardening, dùng checklist để rà những chỗ feedback về trust/understanding để xem có regression ngôn ngữ không.  
- Trong release impact review (tài liệu 52), dùng checklist như phần bắt buộc cho các change chạm copy/semantics.  
- Sau mỗi đợt pilot, cập nhật checklist với các câu hỏi mới sinh ra từ học thực tế.

## 17. Các tài liệu UX tiếp theo nên sinh ra từ đây

1. **55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS.md** – requirements chi tiết cho dashboards đọc pilot signals dựa trên semantics đã chuẩn hóa.  
2. **56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS.md** – diagnostics cho trải nghiệm khi handoff Web Admin ↔ Mobile Ops.  
3. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – ma trận test cho authority boundaries và waivers.  
4. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – runbook vận hành scenario library và environments.  
5. **59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS.md** – tài liệu enablement giải thích continuity và reconciliation cho người dùng hiện trường.

## 18. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Copy QA và Semantic Regression trong Pack 03:

1. Copy và semantics là một phần của logic sản phẩm, không chỉ là lớp trang trí.  
2. Pack 03 cần một checklist chính thức để rà state terms, action labels, authority phrases, continuity cues, validation/recovery messages, metrics labels và demo/training semantics trước release.  
3. Terminology register, copy system, role-permission matrix, continuity handshake, reconciliation patterns và event taxonomy là baseline để so sánh, không phải tham khảo tùy ý.  
4. QA, Product, Design, Sales Enablement, Training và Support phải cùng share trách nhiệm về semantic integrity.  
5. Semantic regressions phải được log và fix như bug, không chỉ là “vấn đề nhỏ về wording”.  
6. Checklist này là cầu nối giữa tài liệu ngôn ngữ của Pack 03 và vận hành release hàng ngày.

## 19. Điều kiện hoàn thành của tài liệu

Pack 03 Copy QA and Semantic Regression Checklist được xem là đạt yêu cầu khi:
- trước mỗi release quan trọng, team có thể chạy qua checklist này và bắt được các regression semantics chính;  
- copy UI, metrics labels, demo/training scripts và support docs dùng chung ngôn ngữ nhất quán;  
- feedback từ pilot về “hiểu sai” hoặc “không tin” giảm dần qua các vòng;  
- và Pack 03 tiếp tục tiến hóa mà không đánh mất coherence ngôn ngữ đã đầu tư dựng từ đầu.

## AG Execution Prompt

You are acting as a senior UX writing QA lead, semantic-governance steward, and cross-channel language consistency architect.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: copy system, terminology register, authority rules, continuity handshake, reconciliation patterns, QA scenarios, metrics framework, role-permission matrix, event taxonomy, and demo environment setup are already defined.
- This document defines the Copy QA and Semantic Regression checklist for Pack 03.

### Objective
Refine this Copy QA and Semantic Regression Checklist into a production-grade tool that teams can actually run before releases and pilots to catch semantic and copy regressions across UI, metrics, demos, training, and support.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between state, action, authority, continuity, validation/recovery, observability, and enablement semantics.
- Keep the output concrete enough to be used as a checklist in real release cycles.

### Tasks
1. Rewrite the semantic-regression thesis into a sharper executive form.
2. Produce a structured checklist covering state, action, authority, continuity, validation/recovery, metrics, and demo/training semantics.
3. Add workflow guidance for running Copy QA during sprints and before releases.
4. Define ownership and integration with QA, impact review, and pilot triage.
5. Identify the top five semantic-regression failures that this checklist must help prevent.
6. Recommend the next documents that should operationalize this baseline into dashboards, diagnostics, authority-boundary testing, and scenario-library operations.
7. Add governance rules to prevent copy drift, terminology drift, authority-policy confusion, and mismatched metrics/dashboards.

### Constraints
- Do not treat copy as styling only; treat it as semantics.  
- Do not create a checklist so long that teams cannot realistically run it.  
- Do not ignore demo, training, and support language when checking semantics.  
- Keep the output concrete enough to be embedded into QA and release processes.

### Output Format
Return a revised markdown document with these sections:
1. Executive Semantic-Regression Thesis
2. Checklist Structure and Sections
3. Usage Workflow and Ownership
4. Failure Risks
5. Governance Rules
6. Recommended Next Documents
7. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 copy and semantic QA explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams catch and prevent semantic regressions across UI, metrics, demos, training, and support.  
- The output must reduce ambiguity around who owns semantic integrity and how it is checked before releases.
