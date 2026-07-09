# Nextflow OS – Persona-Based Landing and Default Views

**Document ID:** 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Strategy / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Frontend Delivery, Design System, QA & Support, Deployment & Support  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 25_FIRST_WEDGE_USER_FLOWS, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY

## 1. Mục tiêu tài liệu

Tài liệu này xác định **chiến lược landing và default views theo persona** cho Nextflow OS trong Pack 03. Nếu Experience Strategy đã chốt các surfaces và vai trò của chúng, Information Architecture đã chốt cấu trúc điều hướng, User Flows đã chốt các hành trình launch-critical, còn UX Guardrails đã chốt bộ luật nền của tương tác, thì tài liệu này đi vào một câu hỏi cực kỳ thực tế nhưng ảnh hưởng rất mạnh đến adoption:

> **Khi từng persona mở Nextflow OS lần đầu trong ngày hoặc quay lại hệ thống trong một khoảnh khắc công việc cụ thể, họ nên được đưa vào màn hình nào, thấy nhóm thông tin nào trước, nhận các tín hiệu ưu tiên nào trước, và có các đường đi mặc định nào để bắt đầu công việc với ít ma sát nhất?**

Landing và default views không phải là chi tiết nhỏ của UI. Trong một SME Business OS, chúng là nơi sản phẩm thể hiện rằng nó **hiểu vai trò người dùng, hiểu việc của họ, và biết giúp họ bắt đầu đúng việc ngay từ những giây đầu tiên**. Nếu landing sai, người dùng phải tự “dịch” hệ thống sang công việc của mình. Khi đó dù flows phía sau có tốt, cảm nhận ban đầu vẫn là hệ thống rối, xa cách hoặc bắt người dùng tự thích nghi quá nhiều.

Tài liệu này phải khóa mười một thứ:
1. Vai trò của landing/default-view strategy trong Nextflow OS.  
2. Những persona nào cần landing behavior riêng.  
3. Surface nào có thể và nên cá nhân hóa default views ở phase đầu.  
4. Các nguyên tắc chung để quyết định landing view.  
5. Default landing cho decision personas.  
6. Default landing cho coordination personas.  
7. Default landing cho execution personas.  
8. Default landing cho admin/onboarding personas ở các ngữ cảnh cần thiết.  
9. Cách xử lý cross-persona, multi-role và context switching.  
10. Những anti-pattern về landing/default views phải tránh.  
11. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Landing/default-view strategy trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, landing/default-view strategy là cách hệ thống quyết định **điểm vào mặc định** và **góc nhìn mặc định** cho người dùng theo vai trò, surface và mục tiêu công việc phổ biến nhất của họ. Nó không chỉ là vấn đề routing sau khi đăng nhập. Nó là sự kết hợp của:
- persona understanding;  
- job-to-be-done prioritization;  
- workload expectations;  
- state visibility;  
- và flow entry efficiency.

Một default view tốt không cố cho người dùng thấy “mọi thứ”. Nó cho họ thấy **đúng thứ họ cần thấy đầu tiên** để bắt đầu công việc mà không cần suy nghĩ quá nhiều về cấu trúc hệ thống.

Điều này đặc biệt quan trọng trong bối cảnh SME vì người dùng thường không dành thời gian để học sản phẩm một cách bài bản. Họ đánh giá sản phẩm qua câu hỏi rất thực dụng: “mở ra thì tôi biết làm gì chưa?”. Landing strategy tốt chính là cách trả lời câu hỏi đó ngay lập tức.

## 3. Persona-landing thesis cho Pack 03

Persona-landing thesis của Pack 03 có thể phát biểu như sau:

> **Mỗi persona trong Nextflow OS phải được đưa vào hệ thống qua default view gần nhất với công việc họ cần bắt đầu, sao cho họ nhìn thấy đúng mức control, đúng mức urgency và đúng đường hành động đầu tiên mà không cần tự dựng lại bản đồ hệ thống trong đầu.**

Từ thesis này, tám nguyên lý nền được suy ra:

1. Landing phải ưu tiên **first useful action**, không ưu tiên phô diễn feature breadth.  
2. Default view phải phản ánh **vai trò thực tế**, không chỉ quyền hệ thống.  
3. Người dùng nên thấy **tín hiệu ưu tiên** trước khi thấy thông tin đầy đủ.  
4. Surface nào phục vụ vai trò nào thì landing của surface đó phải bám vai trò ấy, không được “đồng phục hóa” vô lý.  
5. Default views nên làm rõ **work ownership, pending decisions và blocked work** ở mức phù hợp.  
6. Người dùng multi-role có thể cần paths linh hoạt, nhưng phase đầu vẫn nên có **một primary landing** rõ.  
7. Landing strategy phải bám wedge đầu tiên, không bị future-scope personas làm loãng.  
8. Default views không được giấu những tín hiệu đau nhất của vận hành chỉ để giao diện nhìn gọn hơn.

## 4. Persona groups cần landing strategy riêng

Để tránh over-customization quá sớm, phase đầu nên gom personas thành năm groups đủ thực dụng cho landing behavior.

1. **Decision personas** – founder, owner, COO, area manager.  
2. **Coordination personas** – operations manager, back office lead, branch supervisor thiên điều phối.  
3. **Execution personas** – frontline operator, branch staff, field/floor-like users.  
4. **Admin / onboarding personas** – tenant admin, setup user, pilot support user.  
5. **Hybrid personas** – người vừa điều phối vừa tác nghiệp trong doanh nghiệp nhỏ.

Mỗi group nên có landing strategy riêng, nhưng không nhất thiết phải có UI hoàn toàn khác nhau. Mục tiêu là điều chỉnh **điểm vào và default emphasis**, không phải fork toàn bộ product.

## 5. Khi nào nên cá nhân hóa default views, khi nào không

Một rủi ro lớn của persona-based landing là over-personalization quá sớm. Vì vậy phase đầu cần các nguyên tắc rõ.

## 5.1 Nên cá nhân hóa khi

- vai trò có câu hỏi mở đầu ngày làm việc khác nhau rõ rệt;  
- surface phục vụ persona đó thường xuyên;  
- default emphasis khác nhau sẽ làm giảm rõ rệt số bước đi tới first useful action;  
- hoặc product cần thể hiện ngay distinction giữa control và execution.

## 5.2 Không nên cá nhân hóa quá sâu khi

- khác biệt chỉ là cosmetic;  
- logic cá nhân hóa đòi quá nhiều setting sớm;  
- volume personas còn nhỏ và chưa rõ pattern;  
- hoặc hệ thống chưa có data/context đủ tin cậy để chọn view tốt hơn người dùng.

## 5.3 Nguyên tắc launch-phase

Ở launch slice, nên ưu tiên **ít biến thể nhưng đúng biến thể**, thay vì cố làm “dashboard riêng cho mọi người”. Một số landing đủ mạnh thường tốt hơn nhiều landing nửa vời.

## 6. Decision persona landing strategy

## 6.1 Người dùng điển hình

- Founder / Owner  
- COO / Head of Operations  
- Area manager trong mô hình nhiều branch/site

## 6.2 Câu hỏi đầu tiên họ thường có

- Hệ vận hành hôm nay đang khỏe hay không?  
- Branch nào đang nóng?  
- Có approvals nào đang chặn flow?  
- Có backlog, blocked hoặc overdue nào cần chú ý ngay không?

## 6.3 Surface chính

- Web Admin.

## 6.4 Default landing đề xuất

**Operations Overview / Executive Control Overview** là default landing chính thức cho decision personas.

Đây phải là một overview screen có khả năng trả lời nhanh các câu hỏi trên qua:
- open items / items by major state;  
- pending approvals;  
- blocked / overdue signals;  
- branch hotspot indicators;  
- và drill-down entry points rõ.

## 6.5 Default emphasis

- Pattern-level visibility trước.  
- Signals cần quyết định trước.  
- Ability to drill to branch, queue hoặc approval context sau đó.

## 6.6 Những gì không nên là default

- Không nên land họ vào raw record list.  
- Không nên land họ vào setup/import/admin pages.  
- Không nên land họ vào mobile-style task lists thiên execution.

## 6.7 Outcome mong muốn

Trong 30–60 giây đầu, decision persona phải biết mình nên nhìn sâu vào đâu trước mà không cần tự đi vòng qua nhiều menu.

## 7. Coordination persona landing strategy

## 7.1 Người dùng điển hình

- Operations manager  
- Back office lead  
- Branch supervisor ở chế độ coordination

## 7.2 Câu hỏi đầu tiên họ thường có

- Cái gì đang chờ xử lý ngay?  
- Backlog đang kẹt ở đâu?  
- Branch nào đang cần follow-up?  
- Ai đang giữ quá nhiều việc?  
- Có item nào blocked hoặc pending approval không?

## 7.3 Surface chính

- Web Admin là chính.  
- Mobile chỉ đóng vai trò phụ trong một số quick checks.

## 7.4 Default landing đề xuất

**Primary Work Queue / Needs Attention Worklist** là default landing chính thức cho coordination personas.

Default view này nên ưu tiên:
- items needing action;  
- blocked / overdue / approval-needed filters sẵn;  
- branch-aware grouping;  
- owner visibility;  
- và quick paths vào detail, approval hoặc recovery screens.

## 7.5 Default emphasis

- Queue clarity trước.  
- Work ownership trước.  
- Exceptions và approvals đủ nổi.  
- Tốc độ triage cao hơn dashboard breadth.

## 7.6 Những gì không nên là default

- Không nên land họ vào executive summary quá tổng quát nếu từ đó vẫn phải click nhiều bước mới tới backlog.  
- Không nên land họ vào record detail của một item ngẫu nhiên.  
- Không nên land họ vào config/settings.

## 7.7 Outcome mong muốn

Trong vài giây đầu, coordination persona phải thấy backlog nào cần triage và có đường ngắn nhất đi tới item quan trọng nhất.

## 8. Execution persona landing strategy

## 8.1 Người dùng điển hình

- Frontline operator  
- Branch staff  
- Floor / field-like user ở use case phù hợp

## 8.2 Câu hỏi đầu tiên họ thường có

- Tôi phải làm gì bây giờ?  
- Việc nào gấp?  
- Có item nào đang chờ tôi không?  
- Tôi có thể hoàn tất nhanh việc tiếp theo ở đâu?

## 8.3 Surface chính

- Mobile Ops / PWA.

## 8.4 Default landing đề xuất

**My Work** là default landing chính thức cho execution personas.

Trong My Work, default grouping nên ưu tiên một logic cực rõ, ví dụ theo:
- Needs Action Now;  
- In Progress;  
- Waiting / Blocked (nếu cần hiển thị cho user thấy rõ vì sao chưa xong);  
- Overdue / Urgent cues nếu có.

## 8.5 Default emphasis

- Next action trước.  
- Urgency trước.  
- Item identity ngắn gọn nhưng đủ.  
- Đường vào Task Action phải rất gần.

## 8.6 Những gì không nên là default

- Không nên land execution persona vào team-wide overview quá dày.  
- Không nên land họ vào history hoặc status-heavy pages.  
- Không nên land họ vào navigation hubs phải tự chọn hướng đi.

## 8.7 Outcome mong muốn

Execution persona phải mở app ra và biết ngay item nào nên chạm đầu tiên, với gần như không cần điều hướng phụ.

## 9. Admin / onboarding persona landing strategy

## 9.1 Người dùng điển hình

- Tenant admin  
- Setup / rollout support user  
- Pilot onboarding helper

## 9.2 Câu hỏi đầu tiên họ thường có

- Tenant đã sẵn sàng đến đâu?  
- Import có lỗi gì?  
- Còn bước setup nào chưa xong?  
- Có validation issues nào đang chặn go-live?

## 9.3 Surface chính

- Web Admin.

## 9.4 Default landing đề xuất

**Onboarding / Import Status View** hoặc **Readiness Support View** là default landing phù hợp trong những phiên làm việc thiên setup/onboarding.

Tuy nhiên, đây không nên là default vĩnh viễn cho mọi admin users trong mọi ngữ cảnh. Sau go-live, nhiều admin users có thể cần quay về operational views phù hợp hơn.

## 9.5 Default emphasis

- Bước nào còn mở.  
- Validation / import errors cần xử lý.  
- Readiness checklist.  
- Entry points sang correction flows.

## 9.6 Những gì không nên là default

- Không nên buộc admin/onboarding users luôn land vào same operational queue nếu session của họ đang thiên setup.  
- Cũng không nên để setup views lấn sang các personas không cần chúng.

## 9.7 Outcome mong muốn

Người hỗ trợ rollout phải thấy rõ tenant đang vướng chỗ nào và bắt đầu xử lý từ đâu mà không phải tự dò trong cấu trúc rộng của web admin.

## 10. Hybrid persona landing strategy

## 10.1 Người dùng điển hình

Trong SMEs nhỏ, một người có thể vừa điều phối vừa trực tiếp xử lý việc. Ví dụ branch supervisor hoặc owner-operator có thể vừa xem backlog vừa tự làm item.

## 10.2 Rủi ro

Nếu hệ thống không xử lý hybrid roles tốt, người dùng sẽ bị kéo qua lại giữa một overview quá cao và một task list quá thấp mà không có default path hợp lý.

## 10.3 Default landing đề xuất

Phase đầu nên chọn **một primary landing theo dominant role**, không cố làm màn hình lai quá phức tạp. Ví dụ:
- nếu người đó chủ yếu điều phối, default vẫn là Work Queue trên Web Admin;  
- nếu người đó thường xuyên cầm việc trực tiếp tại điểm vận hành, default trên mobile vẫn là My Work.

## 10.4 Hỗ trợ chuyển ngữ cảnh

Hybrid persona nên có:
- entry points rõ để nhảy sang view phụ;  
- recent-context memory hợp lý;  
- và labels đủ rõ để biết mình đang ở mode nào.

## 10.5 Outcome mong muốn

Người dùng hybrid không cần một sản phẩm riêng, nhưng cần ít ma sát khi chuyển giữa control moment và execution moment.

## 11. Default grouping strategy theo persona

Không chỉ landing screen, mà cách nhóm nội dung mặc định trên chính screen đó cũng rất quan trọng.

## 11.1 Decision personas

Default grouping nên thiên về:
- overall health;  
- approvals;  
- blocked / overdue signals;  
- branch hotspots.

## 11.2 Coordination personas

Default grouping nên thiên về:
- needs attention first;  
- branch / queue / owner slices;  
- approval-needed;  
- blocked / overdue work.

## 11.3 Execution personas

Default grouping nên thiên về:
- what I must do now;  
- what is in progress;  
- what is waiting or blocked;  
- what is urgent.

## 11.4 Admin / onboarding personas

Default grouping nên thiên về:
- readiness steps;  
- import status;  
- validation failures;  
- unresolved setup blockers.

## 12. Default filters và saved views ở phase đầu

## 12.1 Nên có default filters đủ mạnh

Default views chỉ thực sự hữu ích khi đi cùng default filters hợp lý. Ví dụ coordination persona có thể mở thẳng vào “Needs Attention”, execution persona mở vào “My Work”, decision persona mở vào “Operational Health”.

## 12.2 Saved views có giá trị lớn cho coordination personas

Với operations managers hoặc back office leads, saved views hoặc quick views rất hữu ích vì họ thường lặp lại cùng một kiểu triage mỗi ngày.

## 12.3 Không nên mở tùy biến vô hạn quá sớm

Phase đầu nên có một số default/saved patterns curated tốt hơn là cho mọi người tự xây dashboard phức tạp ngay từ đầu.

## 13. Time-based và state-based default emphasis

Landing strategy không chỉ phụ thuộc persona, mà còn phụ thuộc nhịp công việc.

## 13.1 Morning-start logic

Ở đầu ngày hoặc đầu ca, user thường cần thấy queue / workload / hotspots tổng quát hơn.

## 13.2 Mid-flow return logic

Khi user quay lại giữa ngày, useful default có thể là những items đang active, waiting for them hoặc recently touched contexts.

## 13.3 Exception-heavy logic

Khi hệ thống phát hiện blocked, pending approval hoặc overdue concentration cao, default emphasis có thể ưu tiên vùng cần attention hơn là overview thông thường, miễn không làm mất orientation.

## 13.4 Launch-phase constraint

Tuy nhiên ở phase đầu, không nên over-engineer dynamic landing quá thông minh. Tốt hơn là chọn static defaults tốt cộng một số context-preserving behaviors đơn giản.

## 14. Cross-surface continuity trong landing behavior

## 14.1 Cùng persona, khác surface, cùng logic khởi đầu

Decision persona trên Web Admin và execution persona trên Mobile Ops có landing khác nhau, nhưng cả hai đều phải cảm thấy hệ thống đang đưa họ tới **việc nên bắt đầu trước tiên** theo đúng vai trò.

## 14.2 Continuity của concepts

Nếu coordination persona thấy “Needs Attention” trên web, mobile quick check của họ cũng không nên gọi đó bằng một ngôn ngữ hoàn toàn lạ nếu cùng nói về cùng loại urgency.

## 14.3 Continuity của state emphasis

Dù views khác nhau, blocked / pending approval / overdue / urgent phải vẫn là các tín hiệu nhất quán giữa surfaces.

## 15. Anti-patterns nghiêm trọng phải tránh

## 15.1 Một homepage cho tất cả

Một landing chung cho mọi persona thường nghe có vẻ đơn giản nhưng sẽ làm product bỏ lỡ cơ hội lớn nhất để cho người dùng cảm giác “hệ thống hiểu việc của tôi”.

## 15.2 Landing như brochure

Nếu màn hình đầu tiên chỉ nhằm trưng bày dashboard đẹp hoặc nhiều module thay vì dẫn tới first useful action, adoption sẽ giảm.

## 15.3 Settings-driven personalization too early

Bắt khách hàng hoặc admin cấu hình quá nhiều để có default view tốt là đảo ngược trách nhiệm của sản phẩm.

## 15.4 Random last-page return without role logic

Chỉ nhớ trang cuối người dùng mở có thể hữu ích trong vài trường hợp, nhưng nếu dùng như chiến lược chính sẽ làm mất vai trò của persona-based landing và dễ gây lạc context.

## 15.5 Hiding pain to look clean

Nếu default views cố giấu blocked items, overdue work hoặc approvals đang chờ chỉ để UI nhìn gọn hơn, sản phẩm sẽ yếu đi đúng ở nơi tạo control value.

## 15.6 Hybrid-role confusion

Khi không làm rõ persona đang ở control moment hay execution moment, users đa vai trò sẽ thấy sản phẩm “nửa này nửa kia” và khó hình thành thói quen dùng ổn định.

## 16. Governance rules cho landing/default-view decisions

Mọi quyết định về landing và default views trong Pack 03 nên đi qua các câu hỏi sau:

1. **Persona này mở hệ thống ra để trả lời câu hỏi gì đầu tiên?**  
2. **View đề xuất có đưa họ tới first useful action nhanh hơn không?**  
3. **Default emphasis có làm rõ urgency, ownership hoặc decisions cần thiết không?**  
4. **View này có đúng với vai trò của surface không?**  
5. **Có đang over-customize so với giá trị thật đem lại không?**  
6. **Có đang giấu những operational pains quan trọng chỉ để giao diện gọn hơn không?**  
7. **Hybrid users có cách chuyển context đủ rõ không?**  
8. **Giải pháp này có bám wedge đầu tiên thay vì tương lai xa không?**

## 17. Mapping landing strategy với launch-critical flows

## 17.1 Flow A / B – Intake và queue assignment

Coordination personas nên land vào work queues đủ mạnh để vào intake/assignment flows rất nhanh.

## 17.2 Flow C – Operator execution

Execution personas nên land vào My Work để vào action flow gần như ngay lập tức.

## 17.3 Flow D – Approval decision

Decision personas nên land vào overview có pending-approval emphasis đủ mạnh hoặc vào approval-heavy default view nếu role của họ chủ yếu xử lý approvals.

## 17.4 Flow E – Exception recovery

Coordination personas nên thấy blocked / needs-attention slices đủ nổi trong default views để recovery không bị chìm.

## 17.5 Flow G – Onboarding / import

Admin/onboarding personas trong các phiên setup nên land vào readiness/import views thay vì operational views mặc định của go-live phase.

## 18. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho các screen families ưu tiên của Web Admin.  
2. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.  
3. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, error states và recovery messaging.  
4. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – checklist review và governance mechanism của Pack 03.  
5. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – component behavior rules cho mobile execution patterns.  
6. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – form và decision-input patterns cho web admin.  
7. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona cho sales, pilot và onboarding.

## 19. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho landing/default-view strategy:

1. Nextflow OS phải dùng **persona-based landing strategy**, không dùng một homepage chung cho mọi vai trò.  
2. Decision personas mặc định land vào **Operations Overview / Executive Control Overview** trên Web Admin.  
3. Coordination personas mặc định land vào **Primary Work Queue / Needs Attention Worklist** trên Web Admin.  
4. Execution personas mặc định land vào **My Work** trên Mobile Ops.  
5. Admin/onboarding personas trong session thiên setup có thể mặc định land vào **Onboarding / Import Status / Readiness Views** trên Web Admin.  
6. Hybrid personas nên có một primary landing theo dominant role và có context-switch paths rõ.  
7. Default views phải làm rõ urgency, ownership, approvals và blocked work ở mức phù hợp với từng persona.  
8. Landing strategy phase đầu phải ưu tiên ít biến thể nhưng đúng biến thể, không over-personalize quá sớm.

## 20. Điều kiện hoàn thành của tài liệu

Persona-Based Landing and Default Views được xem là đạt yêu cầu khi:
- team Product, UX, Frontend và QA có cùng logic về điểm vào mặc định cho từng nhóm persona;  
- first useful action cho decision, coordination, execution và onboarding sessions đã đủ rõ;  
- các default groupings và emphasis rules đã đủ để đi xuống wireframes;  
- và launch slice có thể tạo cảm giác “hệ thống hiểu việc của tôi” ngay từ điểm vào đầu tiên.

## AG Execution Prompt

You are acting as a senior UX strategist, persona-experience designer, and default-view architecture specialist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: multi-surface experience system, first-wedge user flows already defined, state grammar and UX guardrails already established.
- This document defines persona-based landing strategy and default views for launch-phase adoption.

### Objective
Refine this Persona-Based Landing and Default Views document into a production-grade baseline that can guide landing logic, role-aware routing, default groupings, default filters, wireframe decisions, and onboarding/adoption behavior for the first wedge.

### Inputs
- Use this document plus Experience Strategy Overview, Web Admin Experience Strategy, Mobile Ops Experience Strategy, IA/Navigation Model, First Wedge User Flows, UX Guardrails, and Mobile Ops Screen Taxonomy as the primary source of truth.
- Preserve the distinction between control and execution surfaces and the wedge-first launch focus.
- Keep the output concrete enough for UX, frontend, and QA implementation planning.

### Tasks
1. Rewrite the persona-landing thesis into a sharper executive form.
2. Produce a persona-to-landing register with primary surface, default landing, primary question, and first useful action.
3. Add a default-grouping and default-filter policy for decision, coordination, execution, admin, and hybrid personas.
4. Define rules for hybrid-role handling, recent-context memory, and safe context switching.
5. Identify the top five landing/default-view failures that would damage adoption or clarity.
6. Recommend the next documents that should operationalize these rules into wireframes, demos, and QA scenarios.
7. Add governance rules to prevent homepage-for-all drift or over-personalization drift.

### Constraints
- Do not create a single generic homepage for all personas.  
- Do not over-engineer personalization beyond the launch scope.  
- Do not hide urgent operational pain just to make default views look cleaner.  
- Do not blur the distinction between control and execution entry points.  
- Keep the output specific enough for downstream implementation.

### Output Format
Return a revised markdown document with these sections:
1. Executive Persona-Landing Thesis
2. Persona-to-Landing Register
3. Default Grouping and Filter Policy
4. Hybrid and Context-Switch Rules
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make landing strategy and default views explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams route each core persona to the right first-useful-action view.
- The output must reduce ambiguity around role-based landing, default emphasis, and context switching.
