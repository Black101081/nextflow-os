# Nextflow OS – Web Admin Experience Strategy

**Document ID:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Strategy / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Design System, Sales & Enablement, Deployment & Support  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 13_FIRST_WEDGE_CAPABILITY_SLICE, 12_ENGINE_BOUNDARY_SPECIFICATION, 15_PRODUCT_PACK_SUMMARY_AND_DECISION_LOG

## 1. Mục tiêu tài liệu

Tài liệu này xác định **chiến lược trải nghiệm riêng cho Web Admin**, surface quan trọng nhất trong wedge đầu tiên của Nextflow OS. Nếu Experience Strategy Overview trả lời tại sao sản phẩm phải là multi-surface experience system và vì sao Web Admin là priority surface số 1, thì tài liệu này đi tiếp một bước thực dụng hơn:

> **Web Admin của Nextflow OS phải được thiết kế như thế nào để decision personas và coordination personas có thể nhìn thấy sự thật vận hành, kiểm soát flow, xử lý ngoại lệ, ra quyết định đúng lúc và tin rằng hệ thống này thực sự giúp doanh nghiệp chạy có trật tự hơn?**

Web Admin không phải chỉ là “trang admin” của hệ thống. Trong Nextflow OS, nó là **control surface trung tâm**. Đây là nơi những người có trách nhiệm điều hành nhìn thấy operational truth, nơi approvals được đưa ra, nơi backlog được triage, nơi branch-level deviations lộ ra, nơi migration/import issues được soi lại, và nơi niềm tin của người mua vào sản phẩm thường hình thành hoặc sụp đổ.

Tài liệu này phải khóa chín thứ:
1. Vai trò chính thức của Web Admin trong product system.  
2. Personas nào Web Admin phục vụ và không phục vụ trực tiếp.  
3. Các outcomes trải nghiệm bắt buộc Web Admin phải tạo ra ở wedge đầu tiên.  
4. Các vùng trải nghiệm cốt lõi của Web Admin.  
5. Interaction model tổng quát cho các flow quản lý và điều phối.  
6. Cách Web Admin thể hiện state, exceptions, approvals và traceability.  
7. Những gì Web Admin tuyệt đối không được trở thành.  
8. Ranh giới giữa Web Admin views và business-truth ownership.  
9. Các tài liệu UX tiếp theo cần đi sâu từ baseline này.

## 2. Vai trò chính thức của Web Admin

Trong Nextflow OS, Web Admin là **surface của control, coordination và governance**. Nó không phải surface dành cho tác nghiệp nhanh hằng phút của frontline; nhiệm vụ đó thuộc về Mobile Ops/PWA. Web Admin cũng không phải external portal; nó là bề mặt nội bộ nơi doanh nghiệp điều hành các flow vận hành một cách có kỷ luật hơn.

Có thể hiểu Web Admin qua bốn vai trò lớn.

### 2.1 Control center

Web Admin là nơi người điều hành nhìn toàn cảnh hệ thống: open items, branch backlog, pending approvals, blocked states, overdue work và trend signals cơ bản. Nếu Web Admin không tạo ra khả năng nhìn toàn cảnh đủ tốt, giá trị cốt lõi của Nextflow OS như một SME Business OS sẽ bị suy yếu ngay.

### 2.2 Decision surface

Đây là nơi diễn ra các quyết định có hậu quả vận hành: approve, reject, override, reassign, escalate, unblock hoặc review một record có vấn đề. Vì vậy Web Admin phải làm rõ hệ quả của hành động, chứ không được là một tập button mơ hồ.

### 2.3 Coordination surface

Ops manager và back office lead dùng Web Admin để điều phối công việc giữa teams, branches, queues và priorities. Điều này có nghĩa là surface phải hỗ trợ triage, filtering, grouping, queue visibility và action pathways rõ ràng.

### 2.4 Trust surface

Người mua sản phẩm, đặc biệt là founder/owner/COO, thường quyết định có tin hệ thống hay không sau khi nhìn Web Admin. Nếu họ thấy trạng thái mơ hồ, history khó hiểu, approvals thiếu ngữ cảnh hoặc dashboard chỉ mang tính trang trí, niềm tin sẽ giảm rất nhanh.

## 3. Web Admin phục vụ ai

Web Admin không phục vụ tất cả mọi người theo cùng một cách. Nó ưu tiên hai persona families và hỗ trợ một persona thứ ba ở mức chọn lọc.

## 3.1 Persona family A – Decision personas

### Bao gồm
- Founder / Owner  
- COO / Head of Operations  
- Area manager hoặc branch director ở tổ chức nhiều điểm vận hành

### Họ đến Web Admin để làm gì
- Đọc sức khỏe vận hành.  
- Thấy bottlenecks hoặc branch deviations.  
- Xử lý approvals quan trọng.  
- Kiểm tra rủi ro, chậm trễ hoặc ngoại lệ.  
- Xem hệ thống có đang giúp vận hành tốt lên hay không.

### Họ không cần gì
Họ không cần trải nghiệm quá chi tiết theo kiểu từng thao tác nhỏ của operator. Nếu Web Admin ép decision personas đi quá sâu vào noise hàng ngày, surface sẽ trở nên mệt và mất giá trị điều hành.

## 3.2 Persona family B – Coordination personas

### Bao gồm
- Operations manager  
- Back office lead  
- Branch supervisor ở vai trò thiên điều phối

### Họ đến Web Admin để làm gì
- Triage backlog.  
- Điều hướng queue.  
- Xử lý exceptions.  
- Chuyển owner hoặc gán lại việc.  
- Kiểm tra record detail và history.  
- Đẩy flow đi tiếp khi bị kẹt.

### Đây là nhóm sử dụng Web Admin sâu nhất
Họ là power users thực tế của surface này. Nếu Web Admin không làm tốt cho coordination personas, hệ thống sẽ nhanh chóng bị đẩy về chat, spreadsheet và “gọi người xử lý bằng tay”.

## 3.3 Persona family C – Selective admin / configuration users

### Bao gồm
- Tenant admin  
- Internal setup users  
- Người phụ trách import hoặc data onboarding ở giai đoạn đầu

### Họ dùng Web Admin cho gì
- Setup căn bản.  
- Import dữ liệu.  
- Kiểm tra validation errors.  
- Làm các thao tác hỗ trợ go-live hoặc vận hành ban đầu.

### Mức độ ưu tiên
Đây là persona quan trọng, nhưng không nên để các nhu cầu cấu hình của họ nuốt mất logic điều hành trung tâm của Web Admin.

## 4. Web Admin không phục vụ trực tiếp ai

Web Admin không nên được thiết kế như surface mặc định cho:
- frontline operator cần thao tác nhanh từng phút;  
- khách hàng cuối cần self-service;  
- partner cần rollout visibility;  
- hay mọi vai trò chỉ vì “đã có sẵn web app”.

Điều này không có nghĩa họ không bao giờ dùng Web Admin. Nhưng nếu thiết kế mặc định của surface này cố thỏa mãn tất cả, nó sẽ trở nên quá nặng, quá rộng và mơ hồ về chức năng.

## 5. Experience thesis riêng cho Web Admin

Experience thesis cho Web Admin có thể phát biểu như sau:

> **Web Admin phải làm cho người điều hành thấy rõ doanh nghiệp đang ở đâu trong flow vận hành, điều gì đang lệch chuẩn, việc gì cần quyết định ngay, và hành động nào sẽ kéo hệ thống trở lại quỹ đạo.**

Từ thesis này, năm yêu cầu cốt lõi được suy ra:

1. Web Admin phải ưu tiên **operational visibility** trước decorative dashboarding.  
2. Web Admin phải ưu tiên **decision clarity** trước action abundance.  
3. Web Admin phải ưu tiên **triage and flow movement** trước record browsing thuần túy.  
4. Web Admin phải ưu tiên **traceability and explanation** trước UI tối giản một cách giả tạo.  
5. Web Admin phải ưu tiên **role-aware density** thay vì ép mọi người vào cùng một mức thông tin.

## 6. Các outcomes bắt buộc của Web Admin trong wedge đầu tiên

Ở wedge retail / light distribution đầu tiên, Web Admin phải đạt ít nhất sáu outcomes trải nghiệm. Nếu thiếu một trong sáu outcome này, surface chưa đủ mạnh để hỗ trợ launch slice.

## 6.1 Outcome 1 – Nhìn được sức khỏe vận hành trong 30–60 giây

Khi decision hoặc coordination persona mở Web Admin, họ phải nhanh chóng trả lời được:
- hiện có bao nhiêu items đang mở;  
- trạng thái phân bổ ra sao;  
- approvals nào đang chờ;  
- chi nhánh nào đang nóng;  
- items nào blocked hoặc overdue;  
- và cần vào đâu trước.

Đây là test quan trọng nhất của dashboard strategy.

## 6.2 Outcome 2 – Triage backlog mà không cần “suy luận thủ công” quá nhiều

Người điều phối phải có khả năng lọc, nhóm, sắp xếp và nhận diện priority items với effort thấp. Họ không nên phải mở hàng chục record chỉ để biết thứ gì đang quan trọng nhất.

## 6.3 Outcome 3 – Ra quyết định có ngữ cảnh

Khi approve, reject, override hoặc reassign, người dùng phải thấy đủ ngữ cảnh: record là gì, nó thuộc branch nào, đang ở trạng thái nào, có history gì liên quan, rule/policy nào đang được kích hoạt, và quyết định này có thể dẫn đến điều gì.

## 6.4 Outcome 4 – Drill down từ overview sang detail một cách tự nhiên

Một Web Admin tốt phải cho phép chuyển mượt từ summary view sang queue view, từ queue view sang record detail, từ record detail sang history/evidence/approval context, rồi quay lại mà không mất phương hướng.

## 6.5 Outcome 5 – Nhìn và xử lý ngoại lệ như first-class experience

Blocked items, waiting states, approvals, policy violations hoặc thiếu dữ liệu không được bị giấu như edge cases. Chúng phải có chỗ đứng rõ trong UX vì đây là nơi sản phẩm tạo control value lớn nhất.

## 6.6 Outcome 6 – Tạo niềm tin nhờ traceability

Web Admin phải giúp người dùng trả lời được các câu hỏi như:
- ai đã đổi trạng thái;  
- khi nào đổi;  
- vì sao bị từ chối;  
- override bởi ai;  
- item này đã đi qua những bước nào;  
- và hiện tại vì sao nó đang đứng ở đây.

Nếu không trả lời được những câu hỏi này, hệ thống sẽ không tạo được trust đủ lớn để thay thế cách làm cũ.

## 7. Mô hình trải nghiệm cốt lõi của Web Admin

Web Admin nên được tổ chức quanh năm vùng trải nghiệm chính. Đây không chỉ là gợi ý IA; đây là cấu trúc chiến lược của surface.

## 7.1 Overview layer

### Vai trò
Đây là lớp trả lời câu hỏi: “Hệ vận hành hiện đang khỏe hay đang có vấn đề ở đâu?” Nó là điểm vào chính của decision persona và là lớp quét đầu tiên của coordination persona.

### Nội dung nên có
- Open items summary.  
- Items by status.  
- Pending approvals.  
- Overdue / blocked signals.  
- Branch or site hotspot indicators.  
- Quick-entry points sang nơi cần xử lý sâu hơn.

### Điều không nên làm
- Không nên biến overview thành nơi nhồi quá nhiều biểu đồ trang trí.  
- Không nên buộc người dùng đọc dashboard như một báo cáo BI dài dòng.  
- Không nên hiển thị metrics không gắn với hành động tiếp theo.

## 7.2 Work and queue layer

### Vai trò
Đây là lớp người điều phối dùng để triage và đẩy flow đi tiếp. Nó là trung tâm vận hành hàng ngày của coordination persona.

### Nội dung nên có
- Queue lists.  
- Filters theo branch, status, owner, overdue, approval-needed, blocked.  
- Grouping hợp lý.  
- Quick actions an toàn.  
- Clear backlog prioritization cues.

### Điều không nên làm
- Không chỉ là một table dài vô tận.  
- Không ẩn các state quan trọng sau quá nhiều click.  
- Không buộc người dùng nhớ logic filter phức tạp không hiển thị rõ.

## 7.3 Record detail layer

### Vai trò
Đây là lớp giúp người dùng hiểu một item cụ thể đủ sâu để quyết định đúng hoặc phối hợp đúng.

### Nội dung nên có
- Record identity rõ ràng.  
- Status và step hiện tại.  
- Branch/site context.  
- Ownership / assignee context.  
- Key details / line items / notes / references.  
- Related work items.  
- History / audit / evidence / approvals liên quan.

### Điều không nên làm
- Không nhồi mọi field có thể có vào cùng một trang.  
- Không làm record detail thành form kỹ thuật khó đọc.  
- Không để decision actions tách rời khỏi context khiến người dùng phải nhớ trong đầu.

## 7.4 Approval and exception layer

### Vai trò
Đây là lớp chuyên cho các quyết định ngoài happy path: approve, reject, override, review missing info, xử lý blocked states, escalations hoặc out-of-policy actions.

### Nội dung nên có
- Approval inbox hoặc approval queue.  
- Exception indicators rõ ràng.  
- Decision reasons / policy cues.  
- Reject / request-more-info / override pathways rõ.  
- Audit trail ngay gần vùng quyết định.

### Điều không nên làm
- Không trình bày approvals như một notification list vô nghĩa.  
- Không ép người dùng phải rời khỏi ngữ cảnh quá nhiều để hiểu mình đang duyệt cái gì.  
- Không che đi hậu quả của hành động.

## 7.5 Setup, import and operational admin layer

### Vai trò
Đây là lớp hỗ trợ onboarding, data intake và setup mức cần thiết. Nó quan trọng cho go-live, nhưng không nên thống trị bề mặt điều hành chính.

### Nội dung nên có
- Import entrypoints.  
- Mapping assistance cơ bản.  
- Validation error review.  
- Tenant-safe setup entrypoints phù hợp phase hiện tại.

### Điều không nên làm
- Không để setup UI tràn vào mọi nơi trong Web Admin.  
- Không hy sinh clarity của vận hành hằng ngày để chiều vài use case admin hiếm gặp.

## 8. Navigation strategy cho Web Admin

Navigation của Web Admin phải phục vụ flow điều hành, không phải phô diễn sơ đồ module nội bộ.

## 8.1 Principle 1 – Outcome-based entry points

Người dùng nên vào Web Admin qua những entry points gắn với outcome như: Overview, Work Queues, Approvals, Records, Imports. Đây dễ hiểu hơn việc ép họ hiểu ngay taxonomy kỹ thuật của hệ thống.

## 8.2 Principle 2 – Shallow top-level navigation, deeper contextual navigation

Tầng navigation đầu nên gọn. Sự phức tạp nên được mở dần khi người dùng đi sâu vào queue, record hoặc approval context. Điều này giúp surface bớt áp lực nhận thức ở lần nhìn đầu.

## 8.3 Principle 3 – Always preserve orientation

Người dùng phải luôn biết mình đang ở layer nào, đang nhìn branch nào, đang lọc theo gì, và nếu quay lại thì sẽ về đâu. Mất phương hướng là nguyên nhân lớn khiến admin surfaces bị xem là “rối”.

## 8.4 Principle 4 – Context should travel with the user

Khi người dùng drill down từ dashboard sang queue rồi vào record detail, các context quan trọng như branch, filter, approval-needed hoặc blocked-state nên được giữ lại hợp lý. Điều này giúp tránh cảm giác “mở trang mới hoàn toàn và mất luồng suy nghĩ”.

## 9. Information hierarchy của Web Admin

Web Admin phải được thiết kế với hierarchy mạnh, nếu không mọi thứ sẽ có cảm giác quan trọng như nhau và người điều hành sẽ mệt rất nhanh.

## 9.1 Tầng 1 – Health and urgency

Thông tin cấp đầu phải trả lời:
- cái gì cần chú ý ngay;  
- cái gì quá hạn;  
- cái gì đang chặn luồng;  
- cái gì cần quyết định.

## 9.2 Tầng 2 – Flow context

Sau khi thấy tín hiệu khẩn, người dùng cần hiểu bối cảnh: branch nào, owner nào, loại record nào, trạng thái nào, đang kẹt ở bước nào.

## 9.3 Tầng 3 – Actionable detail

Khi vào item cụ thể, người dùng cần đủ dữ liệu để quyết định hoặc thao tác. Đây là nơi record details, related tasks, evidence, approvals, notes và audit context xuất hiện.

## 9.4 Tầng 4 – Deep traceability

Các thông tin như full history, lower-frequency metadata hoặc cấu hình phụ nên có sẵn nhưng không được chen lấn các lớp trên. Chúng phục vụ trust và investigation, không phải quấy rối mọi màn hình.

## 10. State strategy trong Web Admin

Vì Nextflow OS là operating system, state representation là phần sống còn của Web Admin.

## 10.1 Mọi item phải có current state rõ ràng

Người dùng phải luôn thấy item đang ở trạng thái gì, không phải tự suy ra từ màu hoặc icon mơ hồ. Labels, status semantics và placement phải nhất quán.

## 10.2 Web Admin phải phân biệt record state và work state

Đây là chỗ UX phải tôn trọng Product Pack. Một record có thể ở trạng thái business-level nhất định, trong khi work item liên quan có thể ở trạng thái queue/assignment khác. Web Admin không được trộn hai lớp này thành một trạng thái nhập nhằng.

## 10.3 State changes phải đi kèm reasoning khi cần

Khi state đổi vì approval, rejection, override, missing info hoặc policy trigger, Web Admin nên làm lộ đủ reasoning hoặc trace để người dùng không thấy hệ thống đang “tự làm gì đó không rõ”.

## 10.4 Exception states phải nổi bật hơn normal states

Happy path thường không cần quá nhiều trợ giúp. Những trạng thái blocked, waiting, needs-review, pending-approval, out-of-policy mới là nơi người điều hành cần được dẫn dắt mạnh nhất.

## 11. Approval experience strategy

Approval là capability tạo giá trị rất mạnh ở launch slice, nên Web Admin phải xem approval như một experience domain riêng chứ không phải vài modal rời rạc.

## 11.1 Approval phải có inbox logic rõ

Người duyệt cần một nơi biết chính xác:
- cái gì đang chờ mình;  
- vì sao chờ;  
- mức ưu tiên là gì;  
- nếu không xử lý thì flow nào bị chặn.

## 11.2 Approval action phải gắn với context đầy đủ

Người dùng không nên approve dựa trên một dòng text ngắn ngủi. Họ phải thấy record summary, trạng thái hiện tại, branch context, ngưỡng/policy liên quan, lịch sử gần nhất và lý do yêu cầu duyệt.

## 11.3 Reject, override, request-more-info phải được làm nghiêm túc

Nhiều hệ thống chỉ làm nút Approve. Nhưng operational discipline đến từ việc từ chối, yêu cầu bổ sung hoặc override có reasoning cũng được mô hình hóa rõ ràng và có trace.

## 11.4 Approval decisions phải tạo cảm giác an toàn

Trước khi người dùng quyết định, UI phải làm rõ hậu quả ở mức hợp lý: tiếp tục flow, trả lại, chặn tiếp, ghi audit, hoặc tạo next action tương ứng. Điều này giảm cảm giác “bấm đại rồi xem sao”.

## 12. Exception-handling experience strategy

Nếu Web Admin làm tốt happy path nhưng kém ở exceptions, sản phẩm sẽ không tạo control value thực sự.

## 12.1 Exceptions phải được nhìn thấy như một lớp riêng

Blocked items, missing info, out-of-policy actions, overdue cases hoặc escalations phải có lối vào rõ trong Web Admin. Không nên để chúng chìm trong danh sách items thường.

## 12.2 Exception views phải ưu tiên “what is wrong” và “what can be done next”

Người dùng không cần một trang chỉ thông báo “có vấn đề”. Họ cần biết vấn đề là gì, ảnh hưởng tới cái gì, đang chờ ai, và next safe action là gì.

## 12.3 Exception actions nên giảm branching vô nghĩa

Nếu một ngoại lệ cần sáu nơi khác nhau để xử lý, người dùng sẽ quay lại chat. Web Admin phải gom các actions hợp lý vào cùng bối cảnh.

## 13. Traceability strategy

Traceability là nền của trust trong Web Admin.

## 13.1 Mọi quyết định quan trọng phải xem lại được

Approve, reject, override, reassignment, status changes và dữ liệu evidence phải có cách truy lại hợp lý từ record detail hoặc history sections.

## 13.2 History phải đọc được như câu chuyện, không phải log kỹ thuật thô

Người dùng điều hành không cần raw system events khó hiểu. Họ cần một operational narrative đủ rõ: chuyện gì xảy ra, theo thứ tự nào, do ai, với kết quả gì.

## 13.3 Audit context nên ở gần nơi ra quyết định

Không nên giấu toàn bộ traceability ở một tab xa xôi không ai mở. Những phần history hoặc lý do gần nhất có liên quan trực tiếp đến quyết định hiện tại nên xuất hiện gần action zone.

## 14. Search, filtering và triage strategy

Web Admin mà không mạnh về triage thì sẽ thất bại như một control surface.

## 14.1 Filtering phải bám câu hỏi thực tế của người điều hành

Các bộ lọc quan trọng nên bám những câu hỏi như:
- cái gì đang chờ duyệt;  
- cái gì bị chậm;  
- branch nào đang kẹt;  
- ai đang giữ nhiều việc;  
- item nào thiếu thông tin;  
- item nào ngoài policy.

## 14.2 Saved views hoặc quick views rất đáng ưu tiên

Coordination personas thường lặp lại cùng một kiểu kiểm tra mỗi ngày. Nếu có quick views hợp lý, Web Admin sẽ giảm đáng kể ma sát sử dụng.

## 14.3 Search không thay thế cấu trúc tốt

Search mạnh là hữu ích, nhưng không được trở thành cái cớ để bỏ qua IA, filters hoặc queue views đúng nghĩa. Một surface điều hành tốt phải giúp người dùng “nhìn đúng nhóm vấn đề”, không chỉ “tìm một item cụ thể”.

## 15. Ranh giới với business truth

Web Admin là một surface mạnh, nhưng nó vẫn chỉ là surface.

## 15.1 Web Admin được quyền làm gì

- Trình bày dashboard và read models.  
- Cung cấp queue views và record views.  
- Cho phép người dùng kích hoạt domain actions qua contracts phù hợp.  
- Hiển thị history, evidence, approvals và context theo cách dễ hiểu hơn.  
- Cung cấp local validation để giảm lỗi thao tác.

## 15.2 Web Admin không được làm gì

- Không sở hữu record lifecycle semantics.  
- Không tự giữ approval rules hoặc thresholds.  
- Không tự quyết queue truth như source of truth riêng.  
- Không cập nhật read model như một đường tắt thay cho domain writes.  
- Không phát minh business transitions chỉ tồn tại ở frontend.

## 15.3 Hệ quả cho thiết kế và frontend

Mỗi khi một màn hình Web Admin cần action mới, câu hỏi đầu tiên phải là: action này gọi vào engine/contract nào? Nếu câu trả lời không rõ, vấn đề chưa nằm ở thiết kế giao diện mà nằm ở boundary chưa rõ.

## 16. Những gì Web Admin tuyệt đối không được trở thành

## 16.1 Không phải mini ERP cockpit

Nếu cố biến Web Admin thành nơi chứa mọi nhu cầu doanh nghiệp, surface sẽ phình to và mất tính điều hành sắc nét.

## 16.2 Không phải BI dashboard chỉ để trình diễn

Những chart đẹp nhưng không dẫn tới hành động hoặc không phản ánh live operational concerns sẽ làm giảm giá trị thực của surface.

## 16.3 Không phải form builder trá hình

Nếu quá nhiều effort bị kéo vào cấu hình, fields và admin settings sớm, lõi điều hành sẽ bị chìm.

## 16.4 Không phải Mobile Ops bản phóng to

Web Admin phải thiên về control, không phải chỉ copy các thao tác thực thi của operator lên màn hình lớn hơn.

## 16.5 Không phải nơi vá lỗi boundary sản phẩm

Khi product/core thiếu rõ, team rất dễ “giải quyết tạm trên web admin”. Đây là anti-pattern nguy hiểm và cần bị chặn ngay từ design review.

## 17. Rủi ro UX lớn nhất của Web Admin

## 17.1 Rủi ro 1 – Too much, too flat

Mọi thứ đều hiện ra cùng lúc, không có hierarchy rõ, khiến người dùng không biết nên nhìn đâu trước.

## 17.2 Rủi ro 2 – Strong tables, weak decisions

Có danh sách và filters nhưng thiếu decision context, khiến approvals và overrides trở nên mù thông tin.

## 17.3 Rủi ro 3 – Dashboard that cannot drill

Overview đẹp nhưng không dẫn người dùng vào nơi có thể xử lý vấn đề thật, biến dashboard thành poster chứ không phải tool.

## 17.4 Rủi ro 4 – History exists but trust does not

Có log nhưng khó đọc, khó liên hệ với quyết định hiện tại, nên người dùng vẫn phải hỏi nhau ngoài hệ thống.

## 17.5 Rủi ro 5 – Admin concerns dominate operator value chain

Nếu import/setup/config screens chiếm quá nhiều ưu tiên, Web Admin sẽ đánh mất bản chất control surface của launch slice.

## 18. Design governance rules cho Web Admin

Mọi thiết kế liên quan Web Admin trong Pack 03 nên tuân theo các rules sau:

1. **Mỗi màn hình phải phục vụ một operational question rõ ràng.**  
2. **Mỗi summary metric nên có đường đi tới nơi xử lý được vấn đề đó.**  
3. **Mỗi action quan trọng phải có context và hậu quả đủ rõ.**  
4. **State và exception phải được biểu đạt nhất quán xuyên các views.**  
5. **Coordination personas là nhóm test chính cho usability của Web Admin.**  
6. **Không thêm complexity mới chỉ để phản chiếu cấu trúc backend.**  
7. **Mọi write action phải map về business contract rõ ràng.**  
8. **Thiết kế mới phải chứng minh rằng nó làm control rõ hơn hoặc flow chạy tốt hơn.**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **22_MOBILE_OPS_EXPERIENCE_STRATEGY.md** – chiến lược cho execution surface.  
2. **23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL.md** – IA tổng thể và navigation model xuyên surfaces.  
3. **24_WEB_ADMIN_SCREEN_TAXONOMY.md** – taxonomy màn hình của Web Admin.  
4. **25_FIRST_WEDGE_USER_FLOWS.md** – các luồng người dùng launch-critical cho wedge đầu tiên.  
5. **26_STATE_AND_STATUS_PRESENTATION_RULES.md** – quy tắc biểu đạt state, exception, approval, blocked, overdue.  
6. **27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES.md** – bộ guardrails và interaction laws của Pack 03.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền cho Web Admin như sau:

1. Web Admin là **control, coordination và governance surface** trung tâm của Nextflow OS.  
2. Web Admin phục vụ chủ yếu decision personas và coordination personas.  
3. Sáu outcomes launch-critical của Web Admin gồm: operational visibility, backlog triage, contextual decisions, smooth drill-down, exception handling và traceability.  
4. Web Admin phải được tổ chức quanh năm vùng trải nghiệm: Overview, Work/Queue, Record Detail, Approval/Exception, Setup/Import/Admin.  
5. State clarity, decision clarity, hierarchy mạnh và traceability dễ hiểu là các nguyên tắc không được vi phạm.  
6. Web Admin không được sở hữu business truth hoặc trở thành nơi vá các vấn đề boundary của core product.  
7. Pack 03 phải tiếp tục đào sâu Mobile Ops, IA/navigation, screen taxonomy và user flows từ baseline này.

## 21. Điều kiện hoàn thành của tài liệu

Web Admin Experience Strategy được xem là đạt yêu cầu khi:
- team UX, Product và Engineering cùng hiểu Web Admin tồn tại để giải loại câu hỏi điều hành nào;  
- các vùng trải nghiệm chính đã rõ đủ để đi vào IA và screen taxonomy;  
- các decision flows, approval flows và exception flows có định hướng thiết kế thống nhất;  
- và không còn nhầm lẫn lớn giữa Web Admin như control surface với Mobile Ops như execution surface.

## AG Execution Prompt

You are acting as a senior product UX strategist, admin-surface architect, and operations-control experience designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: multi-surface experience system, Web Admin as the primary launch-critical control surface, Mobile Ops as the execution surface.
- This document defines the strategy for Web Admin specifically.

### Objective
Refine this Web Admin Experience Strategy into a production-grade admin-surface design baseline that can guide IA, screen design, interaction design, frontend planning, and scenario design for the first wedge.

### Inputs
- Use this document plus Experience Strategy Overview, First Wedge Capability Slice, Engine Boundary Specification, and the Product Pack Summary as the primary source of truth.
- Preserve the wedge-first scope and the distinction between control surface and execution surface.
- Keep the output operational and product-aligned, not generic admin-UI advice.

### Tasks
1. Rewrite the Web Admin thesis and outcome model into a sharper executive form.
2. Produce a surface responsibility matrix for Web Admin by persona and job-to-be-done.
3. Add a view-layer map for Overview, Queue, Record Detail, Approval/Exception, and Setup/Import areas.
4. Create a decision-context model showing what users must see before high-impact actions.
5. Define the top five design failures that would make Web Admin weak as a control surface.
6. Recommend the next documents that should operationalize this strategy into IA, screen taxonomy, and user flows.
7. Add governance rules to prevent Web Admin from becoming a dumping ground for product ambiguity.

### Constraints
- Do not turn Web Admin into a generic mega-admin.  
- Do not mirror Mobile Ops behaviors as the main design strategy.  
- Do not let UI own business truth or hidden transitions.  
- Do not optimize for decorative dashboarding over operational control.  
- Keep the output concrete enough for downstream design execution.

### Output Format
Return a revised markdown document with these sections:
1. Executive Web Admin Thesis
2. Persona and Responsibility Matrix
3. View-Layer Strategy
4. Decision Context Model
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Web Admin strategy explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design Web Admin as a true control surface.
- The output must reduce the risk of flat dashboards, weak triage, missing context, and UI-owned logic.
