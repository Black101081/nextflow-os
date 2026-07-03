# Nextflow OS – Pack 03 Terminology Register and Microcopy Inventory

**Document ID:** 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Writing / Product Management  
**Dependent Packs:** Frontend Delivery, QA & Support, Analytics & Data, GTM Enablement, Onboarding & Pilot Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES

## 1. Mục tiêu tài liệu

Tài liệu này xác định **register thuật ngữ chính thức và microcopy inventory nền** cho toàn Pack 03 của Nextflow OS. Nếu tài liệu 40 đã khóa writing thesis và copy system rules, tài liệu 43 đã khóa authority semantics, tài liệu 46 đã khóa continuity handshake notes, còn tài liệu 45 đã khóa traceability structure, thì tài liệu này chuyển toàn bộ những quyết định ngôn ngữ đó thành một **nguồn điều hành cụ thể, tra cứu được và govern được**:

> **Trong Pack 03, từ nào là preferred term, từ nào phải tránh, mỗi term mang nghĩa gì, dùng ở đâu, không dùng ở đâu, message families nào đang tồn tại, action verbs nào được chuẩn hóa, continuity phrases nào chỉ được dùng ở đúng milestone nào, và các microcopy blocks quan trọng đang sống ở screen families nào?**

Trong thực tế, copy system chỉ thật sự có sức mạnh khi nó được cụ thể hóa thành một register và inventory có thể dùng hàng ngày. Nếu không, team rất dễ rơi vào tình trạng:
- nguyên tắc viết thì đúng nhưng mỗi squad vẫn gọi một thứ khác nhau;  
- preferred terms tồn tại trên slide nhưng không map vào UI thực;  
- avoided variants không được kiểm soát nên semantic drift xảy ra dần dần;  
- QA không có baseline đủ cụ thể để review wording;  
- sales, onboarding và support dùng từ khác product UI;  
- frontend phải tự quyết định labels ở các chỗ còn trống.

Tài liệu này vì vậy là lớp **operationalization** của ngôn ngữ sản phẩm trong Pack 03. Nó không chỉ nói “nên viết thế nào”, mà còn nói “cụ thể đang dùng bộ từ nào, ở đâu, với constraints nào, và phải kiểm soát drift ra sao”.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của terminology register và microcopy inventory trong Pack 03.  
2. Terminology thesis của tài liệu.  
3. Cấu trúc chuẩn của terminology register.  
4. Cấu trúc chuẩn của microcopy inventory.  
5. Các families thuật ngữ chính thức phải được quản lý.  
6. Các message families chính thức phải được inventory.  
7. Rules cho preferred terms, avoided variants và semantic definitions.  
8. Rules cho state, action, authority, continuity, validation và recovery wording inventories.  
9. Rules cho linkage với QA, metrics, traceability và demo scripts.  
10. Rules cho ownership, update workflow và versioning.  
11. Những anti-pattern ngôn ngữ và inventory nghiêm trọng phải tránh.  
12. Cách dùng register này trong governance, release review và pilot hardening.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần terminology register và microcopy inventory

Pack 03 đã đi đủ sâu để không thể chỉ dựa vào “nhớ trong đầu” hoặc “xem lại file cũ” mỗi khi cần đặt tên, sửa label, thêm state, viết error, thêm authority message hoặc review continuity wording. Product lúc này đã có:
- nhiều screen families;  
- nhiều state distinctions;  
- nhiều action verbs có hậu quả khác nhau;  
- authority branches và escalation cues;  
- continuity semantics nhiều lớp;  
- demo scripts, QA scenarios và measurement signals cùng phụ thuộc vào nghĩa của từ.

Nếu không có terminology register và inventory, drift sẽ xuất hiện rất nhanh theo ba hướng:
- **synonym drift** – cùng một nghĩa nhưng mỗi nơi dùng một từ;  
- **meaning drift** – cùng một từ nhưng mỗi nơi hiểu một nghĩa;  
- **scope drift** – một term đúng ở surface này nhưng bị tái dùng sai ở surface khác hoặc sai milestone kỹ thuật.

Tài liệu này tồn tại để giảm ba loại drift đó bằng một baseline ngôn ngữ có thể vận hành thật.

## 3. Terminology thesis cho Pack 03

Terminology thesis của tài liệu này có thể phát biểu như sau:

> **Mọi thuật ngữ và microcopy quan trọng trong Pack 03 phải có một nghĩa chuẩn, phạm vi dùng chuẩn, biến thể cần tránh và vị trí quản trị rõ ràng; nếu ngôn ngữ sản phẩm không được quản trị ở mức term và message block, semantic coherence của toàn pack sẽ suy yếu dần ngay cả khi từng màn hình riêng lẻ trông vẫn ổn.**

Từ thesis này, mười nguyên lý được suy ra:

1. Register phải ưu tiên **semantic integrity over naming convenience**.  
2. Preferred term phải có definition đủ rõ để người khác không tự diễn giải lại.  
3. Avoided variants cần được ghi rõ, không chỉ ngầm hiểu.  
4. Message inventory phải bám screen families, state families và flow moments thật.  
5. Một microcopy block quan trọng nên có chủ sở hữu và lịch sử thay đổi.  
6. Continuity wording phải map tới technical truth milestones.  
7. Authority wording phải map tới boundary types thật.  
8. Register phải hỗ trợ cả UI, QA, analytics, demos, onboarding và support.  
9. Inventory phải giúp phát hiện gaps và drift, không chỉ ghi lại cái đã tồn tại.  
10. Khi team thêm term mới, phải chứng minh vì sao term cũ không đủ.

## 4. Register và inventory khác nhau thế nào

## 4.1 Terminology register

Terminology register là **danh mục các terms và phrase families quan trọng có semantic weight** trong Pack 03. Nó trả lời:
- term chuẩn là gì;  
- term đó nghĩa là gì;  
- dùng ở đâu;  
- tránh những biến thể nào;  
- liên quan tới state, action, authority hoặc continuity semantics nào.

## 4.2 Microcopy inventory

Microcopy inventory là **danh mục các blocks câu chữ thực tế hoặc message templates có vai trò vận hành** trong UI. Nó trả lời:
- block này xuất hiện ở screen family nào;  
- dùng trong moment nào;  
- thuộc message family nào;  
- đang có variants nào theo state, authority hoặc continuity;  
- owner là ai;  
- cần review khi nào.

## 4.3 Vì sao cần cả hai

Register mà không có inventory thì team biết “nên dùng từ gì” nhưng không biết từ đó đang được triển khai ở đâu. Inventory mà không có register thì team thấy nhiều câu chữ nhưng không biết semantic backbone đằng sau là gì. Pack 03 cần cả hai để vừa quản lý nghĩa vừa quản lý hiện thân của nghĩa trong sản phẩm.

## 5. Cấu trúc chuẩn của terminology register

Mỗi row trong terminology register nên có ít nhất các trường sau:

1. Term ID.  
2. Preferred term.  
3. Part/type, ví dụ state label, action verb, system message phrase, authority phrase, continuity phrase, object noun.  
4. Meaning definition.  
5. Usage scope.  
6. Non-usage scope hoặc constraints.  
7. Avoided variants.  
8. Related terms / adjacent distinctions.  
9. Surface applicability, ví dụ Web Admin, Mobile Ops hoặc cả hai.  
10. Related flow(s) hoặc screen families.  
11. Technical or policy dependency nếu có.  
12. QA or review notes.  
13. Owner.  
14. Status, ví dụ active, deprecated, under review.  
15. Version / last reviewed date.

Cấu trúc này giúp team không chỉ tra nghĩa mà còn biết khi nào một term có ràng buộc đặc biệt, nhất là với authority và continuity semantics.

## 6. Cấu trúc chuẩn của microcopy inventory

Mỗi row trong microcopy inventory nên có ít nhất các trường sau:

1. Copy Block ID.  
2. Message or label type, ví dụ button label, state label, helper text, empty state, validation, warning, recovery message, confirmation, pending-sync cue, authority cue.  
3. Surface.  
4. Screen family hoặc component family.  
5. Trigger moment hoặc usage moment.  
6. Default wording / template intent.  
7. Variant conditions.  
8. Related terminology family.  
9. Related state / authority / continuity semantics.  
10. Related QA scenario or metric signal if relevant.  
11. Owner.  
12. Localization or length constraints nếu có.  
13. Status.  
14. Version / last reviewed date.

Inventory này không nhất thiết phải chứa mọi câu final string ở level engineering resource file trong giai đoạn đầu, nhưng nó phải đủ để quản trị các blocks có semantic importance.

## 7. Các families thuật ngữ chính thức phải được quản lý

Pack 03 nên quản lý ít nhất chín families thuật ngữ sau:

1. **Work-object nouns** – task, request, case, queue item, evidence, attachment, draft, exception.  
2. **State and status terms** – blocked, waiting, pending approval, in review, overdue, completed, returned for more info, rejected.  
3. **Action verb families** – approve, reject, request info, reassign, complete, retry, restore, upload, capture.  
4. **Authority and policy phrases** – higher approval required, view only, escalation needed, waiting for another role, unavailable until condition met.  
5. **Continuity and sync phrases** – saved on this device, waiting to sync, upload in progress, retry needed, server confirmed, draft restored.  
6. **Validation and correction phrases** – required field missing, invalid format, correct and retry, review before continuing.  
7. **Recovery and exception phrases** – try again, request help, reopen draft, continue later, recover progress.  
8. **Orientation and navigation cues** – workload, review queue, summary, recent work, attention needed, ready to review.  
9. **Outcome and confirmation phrases** – completed, sent for review, reassigned, returned for more info, evidence added, update recorded.

Không phải mọi family đều có cùng độ sâu ngay từ đầu, nhưng tất cả đều cần có baseline owner và structure.

## 8. Các message families chính thức phải được inventory

Về mặt microcopy blocks, Pack 03 nên inventory tối thiểu các families sau:

1. Entry/landing orientation copy.  
2. Queue and workload labels.  
3. Primary and secondary action labels.  
4. State chips, badges và status lines.  
5. Empty states.  
6. Inline validation messages.  
7. Warnings và authority explanations.  
8. Recovery and retry prompts.  
9. Pending / sync / upload / continuity cues.  
10. Confirmation messages.  
11. Request-more-info / reject / override messaging.  
12. Evidence capture prompts.  
13. Draft preservation / restore messages.  
14. Import-fix and grouped correction prompts.

Những families này là nơi semantic drift thường xảy ra nhanh nhất, nên inventory hóa chúng là ưu tiên cao.

## 9. Rules cho preferred terms và avoided variants

## 9.1 Preferred term phải thắng ở level hệ thống

Khi một preferred term đã được phê duyệt, nó phải là lựa chọn mặc định cho mọi copy mới cùng nghĩa, trừ khi có constraint rõ ràng như length, regulatory nuance hoặc technical truth khác.

## 9.2 Avoided variants phải được ghi rõ lý do

Không chỉ ghi một danh sách từ cấm. Register nên giải thích vì sao chúng bị tránh, ví dụ:
- quá generic;  
- mâu thuẫn với term khác;  
- nghe như milestone kỹ thuật sai;  
- gây lẫn authority với policy;  
- hoặc không phù hợp surface.

## 9.3 Adjacent distinctions phải hiện rõ

Các term gần nhau nhưng khác nghĩa như pending approval và in review, saved locally và synced, reject và return for more info, blocked và waiting phải được đặt cạnh nhau trong register để team không vô tình đồng hóa chúng.

## 10. Rules cho state và action terminology

## 10.1 State terms

State terms phải map về state grammar của Pack 03 và không được phát minh thêm nghĩa mơ hồ. Nếu term chỉ dùng cho một domain hoặc một flow family, register phải ghi rõ scope đó.

## 10.2 Action verbs

Action verbs phải phản ánh outcome semantics tốt hơn là thao tác UI. Register nên giữ rõ verb families nào là mặc định, verb nào là alias bị tránh và verb nào chỉ dùng trong authority-sensitive contexts.

## 10.3 Outcome phrases

Một số actions cần outcome phrase riêng sau commit, ví dụ reassigned, sent for review hoặc waiting to sync. Outcome phrases nên được quản trị song song với action verbs để tránh action và confirmation nói hai thứ khác nhau.

## 11. Rules cho authority terminology

## 11.1 Boundary-aware wording

Authority register phải phân biệt ít nhất ba họ phrase:
- no access / view restricted;  
- view allowed but action restricted;  
- higher approval or escalation required.

## 11.2 Policy blockers không được lẫn vào authority phrases

Nếu một action bị chặn vì thiếu evidence hoặc sai state, phrase đó nên thuộc policy/correction family hơn là authority family. Register phải làm distinction này thật rõ để tránh UI đổ nhầm lý do cho quyền cá nhân.

## 11.3 Next-owner và accountability phrases

Các phrases như waiting for manager review, assigned to coordinator hoặc sent for approval nên được quản trị như một family riêng khi chúng ảnh hưởng orientation và trust.

## 12. Rules cho continuity terminology

## 12.1 Continuity phrases phải map tới technical truth

Mọi phrase như saved on this device, waiting to sync, upload failed hoặc server confirmed phải tham chiếu đúng handshake semantics đã khóa ở tài liệu continuity. Register cần link rõ technical dependency này.

## 12.2 Local vs server distinctions

Register phải làm nổi bật các pairs dễ drift như:
- saved locally vs synced;  
- queued vs in progress;  
- upload confirmed vs record confirmed;  
- retry needed vs retrying.

## 12.3 Scope notes bắt buộc

Một continuity phrase nên ghi rõ:
- dùng cho record hay attachment;  
- dùng ở mobile-only hay cross-surface;  
- có được dùng trong confirmation toast hay chỉ trong detail status line;  
- và có cần user action tiếp theo hay không.

## 13. Rules cho validation, warning và recovery inventories

## 13.1 Validation blocks

Inventory nên tách các validation blocks theo:
- missing required input;  
- invalid format;  
- missing evidence;  
- failed precondition;  
- correction-before-retry.

## 13.2 Warning blocks

Warning blocks nên được gắn với risk type, ví dụ destructive action, stale data, authority threshold, irreversible outcome hoặc temporary state mismatch.

## 13.3 Recovery blocks

Recovery blocks nên chỉ rõ:
- user đang recover từ điều gì;  
- CTA nào là next-best action;  
- phrase nào là generic fallback;  
- phrase nào chỉ dùng khi system còn giữ được user effort.

## 14. Linkage với QA, metrics, traceability và demo scripts

## 14.1 QA linkage

Terminology register và microcopy inventory nên map sang các QA scenarios nơi wording hoặc semantic distinction là pass criteria. Điều này giúp QA review không chỉ dựa trên cảm giác “nghe có ổn không”.

## 14.2 Metrics linkage

Một số message families, nhất là continuity, retry, authority restriction hoặc validation-heavy moments, nên map tới signal families liên quan để team biết wording nào đang có thể ảnh hưởng behavior nào.

## 14.3 Traceability linkage

Register và inventory nên tham chiếu trace IDs hoặc ít nhất screen/component families đã có trong traceability matrix. Nhờ đó một thay đổi thuật ngữ có thể được kéo vào change impact review thay vì bị coi là chỉnh copy đơn giản.

## 14.4 Demo script linkage

Các terms và phrases persona-defining nên link tới demo scripts hoặc script families đang dùng chúng. Điều này giúp sales, onboarding và internal walkthroughs không drift ngôn ngữ khỏi product UI.

## 15. Ownership, update workflow và versioning rules

## 15.1 Ownership model

- UX Writing hoặc Product Design giữ semantic hygiene và preferred terms.  
- Product Management giữ product-truth alignment và approval cho term mới có impact hệ thống.  
- QA dùng register/inventory làm baseline review.  
- Frontend tham chiếu inventory để tránh tự tạo labels mới ngoài chuẩn.  
- Analytics, Support, Sales Enablement và Onboarding nên tham chiếu cùng register cho các flows trọng yếu.

## 15.2 Khi nào phải cập nhật register hoặc inventory

Cần cập nhật khi:
- thêm state mới;  
- thêm action mới;  
- thêm authority branch hoặc escalation path mới;  
- thêm continuity milestone mới;  
- rewrite message family quan trọng;  
- pilot feedback cho thấy user hiểu sai;  
- localization hoặc responsive constraints làm xuất hiện variant mới.

## 15.3 Versioning rules

- Mỗi thay đổi semantic lớn nên có revision note.  
- Deprecated terms không nên bị xóa im lặng; nên được đánh dấu và ghi term thay thế.  
- Inventory blocks có risk cao nên có last reviewed date và owner rõ.  
- Không để sheet copy trôi nổi ngoài register thành nguồn sự thật cạnh tranh.

## 16. Coverage gap detection rules

Register và inventory cũng phải giúp tìm ra khoảng trống.

## 16.1 Gaps team nên tìm

- state term đã có trong flow nhưng chưa có definition chuẩn;  
- authority phrase đã xuất hiện nhưng chưa phân loại boundary type;  
- continuity phrase đã dùng nhưng chưa map technical milestone;  
- message family có nhiều variants nhưng chưa rõ preferred template;  
- demo hoặc onboarding đang dùng term không có trong register;  
- QA findings lặp lại quanh một phrase family chưa có owner.

## 16.2 Review cadence

Trước release lớn hoặc trước pilot, team nên rà register/inventory song song với QA scenarios và traceability matrix để phát hiện drift hoặc gaps sớm.

## 17. Cách dùng register này trong governance, release review và pilot hardening

## 17.1 Governance

Register giúp mọi quyết định wording bớt cảm tính và bớt phụ thuộc vào người viết cuối cùng. Nó đặc biệt quan trọng khi có tranh luận về state terms, authority phrases, continuity cues hoặc outcome copy.

## 17.2 Release review

Trong release review, inventory giúp team kiểm tra những message blocks có semantic risk cao đã được update và review đủ chưa, thay vì chỉ rà các màn hình bằng mắt.

## 17.3 Pilot hardening

Trong pilot, feedback về “người dùng hiểu sai chỗ này” nên được map về term family hoặc message family trong register/inventory để biết đang cần fix local hay cần sửa grammar nền.

## 18. Anti-pattern terminology và inventory nghiêm trọng phải tránh

## 18.1 Register without enforcement value

Một register chỉ liệt kê từ đẹp nhưng không nói scope, avoided variants hoặc owner sẽ nhanh chóng mất giá trị.

## 18.2 Inventory as random string dump

Nếu inventory chỉ là bảng chép string không có semantic grouping, team sẽ không dùng được nó cho governance.

## 18.3 Silent synonym drift

Cho phép mỗi squad tự thêm synonym “cho tự nhiên hơn” là cách nhanh nhất làm copy system vỡ coherence.

## 18.4 False-semantic continuity wording

Dùng terms như uploaded, synced hoặc completed sai milestone là anti-pattern trust rất nặng.

## 18.5 Authority-policy confusion

Lẫn phrases thiếu quyền với phrases thiếu điều kiện nghiệp vụ sẽ làm trách nhiệm bị mô tả sai.

## 18.6 No deprecated-term handling

Đổi term nhưng không ghi deprecated mapping sẽ khiến support docs, demo scripts và QA language bị lệch ngầm.

## 18.7 Register by memory

Nếu preferred terms chỉ sống trong đầu một vài người, semantic governance sẽ gãy ngay khi scope tăng hoặc người thay đổi.

## 19. Governance rules cho mọi term hoặc microcopy block mới

Mọi term hoặc block mới nên đi qua các câu hỏi sau:

1. **Nó đang gọi đúng một meaning mới hay đang trùng với meaning đã có?**  
2. **Preferred term hiện tại có thật sự không đủ không?**  
3. **Term này thuộc family nào?**  
4. **Nó dùng ở surface, screen family và flow moment nào?**  
5. **Có avoided variants nào cần ghi rõ ngay từ đầu không?**  
6. **Nếu là continuity hoặc authority wording, technical/policy dependency là gì?**  
7. **QA, metrics, demo scripts hoặc traceability có cần được update cùng không?**  
8. **Owner nào chịu trách nhiệm duy trì term hoặc block này sau khi ship?**

## 20. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL.md** – mô hình chuyển pilot feedback và signal clusters thành governance actions có cấu trúc.  
2. **49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY.md** – taxonomy sự kiện observability cho UX, QA, analytics và continuity instrumentation.  
3. **50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING.md** – ma trận nối role/permission backend với authority UX semantics và copy implications.  
4. **51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE.md** – guide chuẩn bị dữ liệu, trạng thái mẫu và flows cho demo, QA walkthrough và pilot scripts.  
5. **52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE.md** – template review impact dùng với traceability matrix và terminology register.  
6. **53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS.md** – tài liệu đào sâu reconciliation behavior cho delayed confirm, conflict và stale return cases.  
7. **54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST.md** – checklist chuyên biệt để review semantic regressions trước release.

## 21. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho terminology register và microcopy inventory của Pack 03:

1. Pack 03 cần một **terminology register và microcopy inventory chính thức**, không chỉ dừng ở copy principles tổng quát.  
2. Register và inventory phải cùng tồn tại để quản trị cả nghĩa chuẩn lẫn hiện thân thực tế của nghĩa trong UI.  
3. State terms, action verbs, authority phrases, continuity phrases, validation/recovery messages và outcome wording là các families bắt buộc phải được quản lý.  
4. Preferred terms, avoided variants, usage scope, technical dependencies và ownership phải được ghi rõ ở level term/block.  
5. Register và inventory phải nối được với QA, metrics, traceability, demo scripts và pilot feedback.  
6. Semantic drift là một risk vận hành thật sự và phải được quản trị như một phần của Pack 03 governance.  
7. Tài liệu này là baseline để Product, Design, Frontend, QA, Sales Enablement, Onboarding và Support nói cùng một ngôn ngữ có kỷ luật.

## 22. Điều kiện hoàn thành của tài liệu

Pack 03 Terminology Register and Microcopy Inventory được xem là đạt yêu cầu khi:
- team có một cấu trúc rõ để quản lý preferred terms, avoided variants và message blocks trọng yếu;  
- copy changes không còn bị xem như chỉnh sửa rời rạc thiếu semantic impact review;  
- QA, Product, Design, Frontend và GTM có thể tham chiếu cùng một baseline ngôn ngữ;  
- và Pack 03 có khả năng mở rộng thêm screens, flows và authority/continuity scenarios mà không mất coherence về thuật ngữ.

## AG Execution Prompt

You are acting as a senior UX writing systems architect, terminology-governance lead, and microcopy operations strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: copy system, authority rules, continuity handshake notes, QA scenarios, metrics framework, and traceability matrix are already defined.
- This document defines the official terminology register and microcopy inventory baseline for Pack 03.

### Objective
Refine this Terminology Register and Microcopy Inventory document into a production-grade language-governance baseline that can guide preferred terms, avoided variants, message inventories, semantic review, QA review, and cross-functional language consistency across Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between Web Admin and Mobile Ops while keeping shared semantics aligned.
- Keep the output concrete enough for day-to-day use by design, product, frontend, QA, and enablement teams.

### Tasks
1. Rewrite the terminology thesis into a sharper executive form.
2. Produce a terminology-register and microcopy-inventory framework covering state terms, action verbs, authority phrases, continuity phrases, validation/recovery messages, and outcome wording.
3. Define practical structures, field sets, ownership rules, update rules, and linkage to QA, metrics, traceability, and demo scripts.
4. Add governance rules for preferred terms, avoided variants, technical dependencies, and deprecated-term handling.
5. Identify the top five language-governance failures that would weaken Pack 03 semantic coherence.
6. Recommend the next documents that should operationalize this baseline into pilot triage, event taxonomy, permission mapping, release impact review, and semantic regression checklists.
7. Add guardrails to prevent synonym drift, false-semantic continuity wording, authority-policy confusion, and random-string inventory behavior.

### Constraints
- Do not reduce the register to a shallow glossary.  
- Do not let the inventory become a random string dump.  
- Do not let continuity or authority phrases drift away from technical or policy truth.  
- Do not leave preferred terms or deprecated terms unmanaged.  
- Keep the output concrete enough for downstream governance and delivery use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Terminology Thesis
2. Register and Inventory Framework
3. Usage and Governance Rules
4. Linkage to QA, Metrics, and Traceability
5. Language Governance Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 language governance explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams manage terms, message families, semantic distinctions, and microcopy blocks with more consistency and less drift.
- The output must reduce ambiguity around preferred terms, avoided variants, technical dependencies, ownership, and message-inventory scope.
