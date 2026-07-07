# Nextflow OS – Pilot Enablement Demo Script Library

**Document ID:** 44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / GTM Enablement / Product Design  
**Dependent Packs:** Sales Enablement, Pilot Delivery, Customer Onboarding, Frontend Delivery, QA & Support  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES

## 1. Mục tiêu tài liệu

Tài liệu này xác định **thư viện demo scripts chính thức cho sales, pilot enablement, onboarding và internal walkthroughs** của Nextflow OS trong Pack 03. Nếu tài liệu 37 đã khóa demo paths và storyboards theo persona ở level cấu trúc câu chuyện, tài liệu 40 đã khóa copy system và UX writing grammar, tài liệu 41 đã khóa release-readiness scenarios, còn tài liệu 43 đã khóa authority-sensitive semantics, thì tài liệu này đi xuống lớp thực thi rất cụ thể:

> **Khi một người cần đứng trước khách hàng, người dùng pilot, team onboarding, leadership nội bộ hoặc cross-functional stakeholders để demo Nextflow OS, họ phải nói gì theo thứ tự nào, nhấn điểm nào, tránh điểm nào, bridge giữa Web Admin và Mobile Ops ở khoảnh khắc nào, và xử lý các câu chuyện authority, interruption, recovery ra sao để demo vừa đúng product truth vừa đủ thuyết phục?**

Một storyboard tốt chưa tự động tạo ra một demo script dùng được. Trong thực tế, rất nhiều demo bị lệch không phải vì product story sai, mà vì người trình bày:
- mở sai entry point;  
- nói quá nhiều về màn hình thay vì công việc;  
- bỏ qua state movement;  
- không bridge giữa web và mobile đúng lúc;  
- sa vào feature laundry list;  
- hoặc xử lý những câu hỏi về blocked/authority/offline moments theo kiểu ngẫu hứng.

Tài liệu này vì vậy là **lớp chuyển hóa từ narrative architecture sang script operations**. Nó giúp những người không phải product designer vẫn có thể kể đúng câu chuyện sản phẩm, theo đúng role-fit, đúng flow spine và đúng ngôn ngữ của Pack 03.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của demo script library trong Pack 03.  
2. Khác biệt giữa storyboard, demo path và demo script.  
3. Các loại script chính thức cần tồn tại.  
4. Cấu trúc chuẩn của một demo script.  
5. Scripts cho sales demo ngắn.  
6. Scripts cho pilot walkthrough.  
7. Scripts cho onboarding demo theo persona.  
8. Scripts cho internal alignment và leadership review.  
9. Script blocks cho authority, interruption và recovery moments.  
10. Rules cho transitions, bridges và timeboxing.  
11. Những anti-pattern demo scripting nghiêm trọng phải tránh.  
12. Cách maintain thư viện script trong governance loop.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Storyboard, demo path và demo script khác nhau thế nào

Trong Pack 03, ba lớp này có liên hệ gần nhưng không giống nhau.

## 2.1 Storyboard

Storyboard là **khung kể chuyện theo persona**. Nó xác định opening situation, role lens, work entry, critical movement, bridge logic và outcome. Storyboard trả lời “câu chuyện sản phẩm nên được kể như thế nào cho người xem này”.

## 2.2 Demo path

Demo path là **đường đi qua product surfaces và flow moments** để câu chuyện đó hiện lên rõ. Nó trả lời “nên đi qua những màn hình và những state moments nào, theo thứ tự nào”.

## 2.3 Demo script

Demo script là **bản lời thoại và điều phối thực thi** của người trình bày. Nó trả lời:
- nên nói câu nào trước;  
- khi chuyển màn nên dùng bridge wording gì;  
- chỗ nào dừng 3 giây để người xem hiểu;  
- chỗ nào không nên đào sâu;  
- và nếu có câu hỏi chen ngang thì nên neo lại câu chuyện chính ra sao.

Nếu storyboard là kiến trúc, demo path là tuyến đường, thì demo script là **cách lái xe thật ngoài đường**. Một sản phẩm có storyboard tốt nhưng script yếu vẫn rất dễ bị demo lệch thành tour màn hình hoặc màn biểu diễn tính năng rời rạc.

## 3. Demo-script thesis cho Pack 03

Demo-script thesis của tài liệu này có thể phát biểu như sau:

> **Mỗi demo script của Nextflow OS phải giúp người trình bày kể một câu chuyện công việc có nhịp, có role-fit, có state movement và có outcome rõ, đồng thời giữ trung thành với product reality; nếu script chỉ làm người trình bày nói trôi chảy hơn nhưng lại làm mờ operational truth, script đó là sai.**

Từ thesis này, mười nguyên lý scripting được suy ra:

1. Script phải ưu tiên **work narrative over screen narration**.  
2. Script phải giúp người trình bày giữ wedge-first focus.  
3. Script phải chỉ rõ câu mở, câu bridge và câu chốt của từng đoạn.  
4. Web Admin và Mobile Ops phải được nối thành một câu chuyện chung, không demo như hai app độc lập.  
5. Authority, blocked, interruption và recovery moments phải được nói đúng mức: không né, không dramatize.  
6. Script phải đủ cụ thể để người không thuộc team product vẫn dùng được.  
7. Script phải đủ linh hoạt để rút ngắn hoặc kéo dài theo thời lượng khác nhau mà không vỡ spine.  
8. Ngôn ngữ trong script phải bám copy system của Pack 03.  
9. Demo script phải giữ người xem trên trục value và movement, không lạc vào chi tiết kỹ thuật không cần thiết.  
10. Script library phải sống như một asset vận hành, không phải tài liệu tham khảo bị bỏ quên.

## 4. Các loại script chính thức cần tồn tại

Pack 03 nên có tối thiểu sáu loại demo script chính thức:

1. **Sales short-form scripts** – 5 đến 7 phút, thiên về value clarity.  
2. **Sales standard scripts** – 10 đến 15 phút, có bridge giữa Web Admin và Mobile Ops.  
3. **Pilot walkthrough scripts** – 15 đến 25 phút, cụ thể hơn theo use case và có recovery branches.  
4. **Onboarding scripts** – theo persona, tập trung vào daily start và common actions.  
5. **Internal alignment scripts** – cho Product, Design, Frontend, QA, Leadership review.  
6. **Appendix scripts** – cho authority, offline/interruption, import-fix, exception handling hoặc responsive review moments.

Không phải mọi buổi demo đều cần tất cả, nhưng thư viện phải tồn tại để người trình bày không phải tự chế câu chuyện từ đầu mỗi lần.

## 5. Cấu trúc chuẩn của một demo script

Mỗi script nên theo một format đủ kỷ luật để dùng lặp lại.

## 5.1 Script metadata

1. Script ID.  
2. Audience type.  
3. Primary persona lens.  
4. Surfaces involved.  
5. Related storyboard(s).  
6. Expected duration.  
7. Required demo environment/data assumptions.  
8. Optional branches.

## 5.2 Script blocks

Mỗi script nên có các block sau:
- **Opening line** – câu vào chuyện.  
- **Context anchor** – chuyện gì đang xảy ra trong công việc.  
- **Role lens** – ai đang dùng hệ thống và vì sao.  
- **Surface framing** – đang ở Web Admin hay Mobile Ops và tại sao.  
- **Walkthrough beats** – các đoạn chuyển động chính.  
- **Bridge lines** – câu nối giữa surfaces hoặc roles.  
- **Outcome line** – chốt giá trị của đoạn.  
- **Do-not-over-explain notes** – chỗ nên dừng đúng mức.  
- **Fallback phrasing** – câu quay lại trục chính nếu bị hỏi lan man.

## 5.3 Timing rules

- Một beat thường không nên kéo quá lâu nếu chưa tạo state movement hoặc value reveal.  
- Sau mỗi chuyển động chính, nên có một câu chốt ngắn trước khi sang màn tiếp.  
- Nếu một script có branch authority hoặc interruption, branch đó nên được timebox rõ thay vì nuốt hết demo chính.

## 6. Script family 1 – Sales short-form scripts

## 6.1 Mục tiêu

Sales short-form scripts phải làm người xem hiểu rất nhanh sản phẩm giúp công việc chạy rõ hơn và nhanh hơn ở đâu. Đây không phải nơi để kể mọi edge case.

## 6.2 Cấu trúc khuyến nghị

1. Mở bằng một pressure point vận hành.  
2. Cho thấy entry point của persona chính.  
3. Đi qua một movement quan trọng trên Web Admin hoặc Mobile Ops.  
4. Bridge đúng một lần sang surface còn lại nếu cần.  
5. Chốt bằng operational outcome, không chốt bằng danh sách tính năng.

## 6.3 Script example frame

- “Đây là cách một manager biết ngay chỗ nào đang nghẽn.”  
- “Từ đây họ vào đúng queue thay vì phải chase thủ công.”  
- “Khi cần quyết định, context và action nằm rất gần nhau.”  
- “Và khi frontline nhận lại việc, họ thấy ngay bước tiếp theo trên mobile.”

## 6.4 Không nên làm gì

- Không đi sâu import-fix, authority nuances hoặc offline branches trừ khi đó là trọng tâm bán hàng thật.  
- Không để Web Admin landing biến thành dashboard tour.  
- Không cố chứng minh breadth bằng thật nhiều màn hình.

## 7. Script family 2 – Sales standard scripts

## 7.1 Mục tiêu

Sales standard scripts nên cho thấy hệ thống đầy đủ hơn một chút: control surface và execution surface nối nhau như thế nào, state movement ra sao, và vì sao sản phẩm không chỉ là một lớp UI đẹp.

## 7.2 Cấu trúc khuyến nghị

- Persona 1 mở đầu, thường là owner hoặc manager.  
- Show triage hoặc decision moment trên Web Admin.  
- Bridge sang frontline hoặc execution moment trên Mobile Ops.  
- Chạm nhẹ một blocked hoặc exception moment.  
- Chốt bằng system coherence và operational movement.

## 7.3 Script notes

Người trình bày nên có sẵn hai phiên bản của cùng script: bản 10 phút và bản 15 phút. Bản dài hơn có thể thêm một recovery branch hoặc import/onboarding đoạn ngắn, nhưng không nên thay spine cốt lõi.

## 8. Script family 3 – Pilot walkthrough scripts

## 8.1 Mục tiêu

Pilot walkthrough scripts phải trung thực hơn, cụ thể hơn và gần use case thật hơn sales scripts. Đây là nơi người xem bắt đầu đánh giá không chỉ “trông hợp lý” mà còn “có sống được trong thực tế của họ không”.

## 8.2 Cấu trúc khuyến nghị

1. Mở bằng use case gần pilot scope.  
2. Đi qua entry point thật của persona đó.  
3. Chạy flow chính.  
4. Chạy ít nhất một branch blocked/recovery hoặc authority/escalation nếu liên quan.  
5. Chạy một bridge cross-surface rõ.  
6. Chốt bằng what changes in day-to-day operations.

## 8.3 Script rules

- Không oversell bằng happy path quá sạch.  
- Không dựng một edge case hiếm thành trục chính nếu use case pilot không xoay quanh nó.  
- Nếu nói về offline/interruption, phải nói đúng semantics như copy system và continuity baseline đã chốt.

## 9. Script family 4 – Onboarding scripts theo persona

## 9.1 Mục tiêu

Onboarding scripts không nhằm bán sản phẩm. Chúng nhằm giúp user mới biết “mỗi ngày tôi vào đâu, thấy gì, làm gì đầu tiên, và khi vướng thì nên nhìn đâu”.

## 9.2 Owner / Ops Lead onboarding script

Phải tập trung vào landing, priority zones, queue entry, blocked clusters và cách quay từ summary vào can thiệp có chủ đích.

## 9.3 Manager / Coordinator onboarding script

Phải tập trung vào review queues, context reading, decision actions, request-more-info flow, reassignment flow và trace after decision.

## 9.4 Frontline onboarding script

Phải tập trung vào workload, dominant action, quick update, note/evidence, help/exception path và return-to-work logic.

## 9.5 Admin support / import onboarding script

Phải tập trung vào import summary, grouped issues, correction logic, retry behavior và readiness visibility.

## 9.6 Script rule chung

Onboarding scripts nên nói ngắn hơn sales scripts, cụ thể hơn sales scripts và thực dụng hơn rất nhiều. Trọng tâm là orientation và repeatable daily behavior, không phải “wow factor”.

## 10. Script family 5 – Internal alignment và leadership review scripts

## 10.1 Mục tiêu

Internal scripts phải giúp product, design, frontend, QA, support hoặc leadership cùng nhìn ra cùng một product truth. Chúng không cần “bán”, nhưng phải cực rõ về flow, state movement, authority boundaries, continuity risks hoặc density choices.

## 10.2 Loại script nội bộ nên có

- Strategy-to-screen walkthrough.  
- Flow walkthrough by persona.  
- Cross-surface coherence walkthrough.  
- Authority-sensitive path walkthrough.  
- Interruption and continuity walkthrough.  
- Release-readiness script based on QA scenarios.

## 10.3 Script rule chung

Internal scripts nên có nhiều reviewer notes hơn, ít marketing wording hơn và có checkpoint cues để dừng lại tranh luận đúng chỗ. Đây là công cụ alignment, không chỉ là script trình bày.

## 11. Script blocks cho authority moments

Authority-sensitive demo moments cần được viết script riêng vì nếu nói hời hợt rất dễ làm người xem tưởng hệ thống hoặc quá khóa, hoặc quá tùy tiện.

## 11.1 Opening phrasing

- “Ở điểm này, không phải ai nhìn thấy item cũng có cùng quyền quyết định.”  
- “Hệ thống phân biệt giữa thấy được context và được phép commit outcome.”  
- “Nếu action vượt authority, flow không chết ở đây mà chuyển sang path escalate phù hợp.”

## 11.2 What to show

- Action bị khóa hoặc không khả dụng theo logic có chủ đích.  
- Explanation đủ rõ.  
- Escalation hoặc next-best action.  
- Trace hoặc next owner clarity sau khi escalate.

## 11.3 What not to do

- Không nói kiểu “ở đây hệ thống không cho làm” mà không giải thích nghĩa.  
- Không né authority logic nếu người xem hỏi đúng chỗ.  
- Không biến authority branch thành security lecture quá dài nếu demo chính là operational flow.

## 12. Script blocks cho interruption và recovery moments

## 12.1 Khi nào nên dùng

Dùng trong pilot demo, onboarding nâng cao, internal review hoặc sales situations mà reliability/trust là mối quan tâm lớn.

## 12.2 Opening phrasing

- “Ngoài hiện trường, điều quan trọng không phải chỉ là bấm được, mà là không mất công khi bị gián đoạn.”  
- “Ở đây hệ thống phân biệt rõ giữa đã giữ local, đang chờ sync và đã xác nhận hoàn tất.”  
- “Nếu evidence chưa lên xong, người dùng không bị đặt vào vùng mơ hồ.”

## 12.3 What to show

- Pending state rõ.  
- Draft được giữ.  
- Retry gắn đúng action.  
- Return-to-context logic.  
- Outcome wording không fake success.

## 12.4 What not to do

- Không trình bày interruption như một edge-case kỹ thuật vô thưởng vô phạt.  
- Không dùng happy wording cho pending states.  
- Không làm người xem hiểu rằng offline story đã full offline nếu baseline không nói vậy.

## 13. Script blocks cho blocked, exception và recovery flows

## 13.1 Mục tiêu

Những đoạn này giúp người xem hiểu sản phẩm không chỉ xử lý happy path mà còn giữ được operational truth khi công việc lệch nhịp.

## 13.2 Script pattern

1. Nói rõ cái gì đang chặn.  
2. Cho thấy state hoặc message cue.  
3. Chỉ ra next step hoặc owner tiếp theo.  
4. Nếu có bridge, cho thấy recovery loop qua surface khác hoặc role khác.  
5. Chốt bằng việc flow quay lại quỹ đạo ra sao.

## 13.3 Script caution

Một blocked/recovery branch nên đủ thật để tăng trust, nhưng không nên dài đến mức phá spine demo chính trừ khi đó là mục tiêu của buổi walkthrough.

## 14. Bridge rules giữa Web Admin và Mobile Ops

## 14.1 Bridge line principles

Bridge line tốt phải trả lời ngắn gọn hai điều:
- vì sao chúng ta đang đổi surface;  
- và điều gì vừa thay đổi trong công việc khiến surface kia giờ trở nên đúng vai trò hơn.

## 14.2 Bridge templates

- “Từ góc nhìn quản lý, quyết định được đưa ra ở đây; bây giờ chuyển sang mobile để thấy người thực hiện nhìn thấy gì tiếp theo.”  
- “Frontline vừa gửi ngoại lệ; chuyển sang web để thấy coordinator xử lý nó như một phần của control flow.”  
- “Yêu cầu bổ sung thông tin vừa được gửi đi; giờ xem người ở tuyến đầu nhận lại việc này như thế nào.”

## 14.3 Bridge errors phải tránh

- Chuyển surface không có lý do.  
- Chuyển chỉ vì muốn khoe thêm màn hình.  
- Chuyển mà không nhắc state hoặc ownership vừa đổi.

## 15. Timeboxing rules theo độ dài demo

## 15.1 Demo 5–7 phút

- Một persona chính.  
- Một spine duy nhất.  
- Tối đa một bridge.  
- Không quá một branch blocked hoặc authority moment.

## 15.2 Demo 10–15 phút

- Hai persona liên kết logic.  
- Một bridge rõ giữa Web Admin và Mobile Ops.  
- Một branch blocked/authority hoặc interruption ngắn.  
- Một outcome chốt ở level hệ thống.

## 15.3 Demo 20–30 phút

- Có thể thêm onboarding/import hoặc deeper recovery loop.  
- Có thể thêm authority branch và continuity branch, nhưng phải neo rõ đâu là main spine và đâu là appendix.  
- Cần script notes chặt hơn để tránh lan man.

## 16. Fallback lines và question-handling anchors

Để script dùng được ngoài đời thật, mỗi script nên có các câu neo lại mạch chính khi bị chen ngang.

## 16.1 Ví dụ fallback lines

- “Em sẽ quay lại phần đó ngay sau khi cho anh/chị thấy item này đi đâu tiếp theo.”  
- “Điểm quan trọng ở đây không phải màn hình này có bao nhiêu trường, mà là quyết định được đưa ra đủ context và có trace.”  
- “Mình đang xem nhánh chuẩn trước, lát nữa em sẽ mở nhánh blocked/recovery vì nó liên quan trực tiếp tới câu hỏi đó.”

## 16.2 Rule

Fallback lines không nên nghe như né câu hỏi. Chúng nên giữ trục chính của câu chuyện và cho người nghe cảm giác câu hỏi sẽ được xử lý ở đúng thời điểm logic hơn.

## 17. Anti-pattern demo scripting nghiêm trọng phải tránh

## 17.1 Script as feature recital

Nếu script chỉ là danh sách tính năng nối đuôi nhau, người xem sẽ không hiểu operational movement của sản phẩm.

## 17.2 Screen-by-screen narration

Kể “đây là màn hình A, đây là màn hình B” mà thiếu problem spine là cách nhanh nhất làm demo mất meaning.

## 17.3 Over-polished unreality

Một script chỉ toàn happy path sạch bóng, không chạm blocked/authority/recovery khi những thứ đó thật sự quan trọng, sẽ làm pilot trust yếu đi.

## 17.4 Improvised terminology drift

Nếu người trình bày dùng từ khác copy system, state semantics có thể bị méo ngay trong demo.

## 17.5 Surface-switch chaos

Nhảy qua lại giữa Web Admin và Mobile Ops không theo bridge logic sẽ làm người xem thấy hai app rời rạc.

## 17.6 No time discipline

Không timebox từng beat sẽ khiến script dễ trượt sang vùng chi tiết không tăng hiểu biết.

## 17.7 Authority/offline handwaving

Né hoặc nói mơ hồ về permission, escalation, pending sync hoặc retry moments khi người xem quan tâm là cách tự làm yếu trust của product.

## 18. Governance và maintenance rules cho script library

## 18.1 Khi nào phải cập nhật script

Script library nên được cập nhật khi:
- storyboard baseline đổi;  
- copy system đổi semantic trọng yếu;  
- flow launch-critical đổi;  
- authority paths đổi;  
- interruption/recovery semantics đổi;  
- pilot feedback cho thấy demo hiện tại gây hiểu sai.

## 18.2 Review questions

1. Script này còn trung thành với product truth không.  
2. Cách dùng từ có còn khớp copy system không.  
3. Bridges có còn đúng với current flows không.  
4. Beat nào đang quá dài hoặc quá nhiều chi tiết.  
5. Script này phục vụ audience nào tốt nhất.  
6. Có chỗ nào đang vô tình oversell hoặc underspecify không.

## 18.3 Ownership model

- Product Design giữ narrative integrity.  
- Product Management giữ wedge-fit và use-case truth.  
- GTM Enablement giữ script usability cho sales/pilot/onboarding teams.  
- QA hoặc Pilot Delivery có thể góp ý khi script đang né các reality moments mà người dùng thật sẽ hỏi.

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX.md** – ma trận traceability giữa components, screen families, flows, states, authority semantics, metrics và QA coverage.  
2. **46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES.md** – handshake notes giữa continuity semantics, copy, instrumentation và implementation.  
3. **47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY.md** – register chi tiết cho thuật ngữ và microcopy inventory xuyên Pack 03.  
4. **48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL.md** – mô hình chuyển pilot feedback thành governance actions có cấu trúc.  
5. **49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY.md** – taxonomy sự kiện observability cho UX, QA và analytics.  
6. **50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING.md** – ma trận nối role/permission backend với expectations ở cấp UX semantics.  
7. **51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE.md** – guide chuẩn bị data, tenants và trạng thái mẫu để chạy demo scripts nhất quán.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho demo script library của Pack 03:

1. Pack 03 cần một **thư viện demo scripts chính thức**, không để mỗi người tự ngẫu hứng từ storyboard hoặc từ UI đang có.  
2. Demo script phải là lớp chuyển hóa từ storyboard và demo path sang lời thoại và điều phối thực thi.  
3. Sales, pilot, onboarding và internal alignment cần các script families riêng nhưng cùng chung semantics và product truth.  
4. Authority, interruption, blocked và recovery moments phải có script blocks riêng để không bị xử lý hời hợt hoặc sai nghĩa.  
5. Bridges giữa Web Admin và Mobile Ops phải có chủ đích và luôn gắn với state hoặc ownership movement.  
6. Script library phải bám copy system, flow spine và governance baseline của Pack 03.  
7. Tài liệu này là baseline để GTM, Product, Design, Pilot và Onboarding teams cùng kể một câu chuyện sản phẩm nhất quán và thực dụng.

## 21. Điều kiện hoàn thành của tài liệu

Pilot Enablement Demo Script Library được xem là đạt yêu cầu khi:
- các persona và audience chính đều có script dùng được ngay;  
- script library đủ cụ thể để người không thuộc core UX team vẫn demo đúng logic sản phẩm;  
- authority, interruption, recovery và cross-surface bridge moments đã có phrasing và handling notes rõ;  
- và các buổi sales, pilot, onboarding, internal walkthrough không còn phụ thuộc quá mạnh vào khả năng improvise cá nhân.

## AG Execution Prompt

You are acting as a senior product storyteller, GTM demo architect, pilot enablement strategist, and cross-surface narrative operations lead.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: storyboards, copy system, QA scenarios, continuity semantics, authority UX rules, and cross-surface flow logic are already defined.
- This document defines the official demo script library for sales, pilot, onboarding, and internal use.

### Objective
Refine this Pilot Enablement Demo Script Library document into a production-grade script baseline that can guide repeatable, trustworthy demos across audiences without breaking Pack 03 product truth or role-fit logic.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between Web Admin and Mobile Ops while presenting them as one operational system.
- Keep the output concrete enough for non-design teams to use in real demos.

### Tasks
1. Rewrite the demo-script thesis into a sharper executive form.
2. Produce a script-library framework covering sales, pilot, onboarding, and internal alignment scripts.
3. Define a standard script format with opening lines, context anchors, role lens, walkthrough beats, bridge lines, outcome lines, do-not-over-explain notes, and fallback phrasing.
4. Add script blocks for authority-sensitive, blocked/recovery, and interruption/continuity moments.
5. Identify the top five scripting failures that would cause demos to misrepresent the product.
6. Recommend the next documents that should operationalize this baseline into traceability matrices, terminology inventories, pilot triage models, event taxonomies, and demo environment setup guides.
7. Add governance rules to prevent feature-recital demos, improvised terminology drift, surface-switch chaos, and over-polished unreality.

### Constraints
- Do not turn scripts into generic feature tours.  
- Do not let demo polish break product truth.  
- Do not separate Web Admin and Mobile Ops into unrelated stories.  
- Do not let authority, recovery, or interruption semantics be hand-waved away.  
- Keep the output concrete enough for downstream sales, pilot, onboarding, and leadership use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Demo-Script Thesis
2. Script Library Framework
3. Standard Script Format
4. Script Blocks by Situation
5. Scripting Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 demo scripting explicit and reusable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams run demos with better role-fit, cleaner transitions, stronger cross-surface coherence, and more trustworthy handling of complex moments.
- The output must reduce ambiguity around what to say, when to bridge, what to skip, and how to keep demos aligned with real product behavior.
