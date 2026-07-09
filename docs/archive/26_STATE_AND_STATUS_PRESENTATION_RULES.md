# Nextflow OS – State and Status Presentation Rules

**Document ID:** 26_STATE_AND_STATUS_PRESENTATION_RULES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Systems / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Frontend Delivery, Design System, QA & Support  
**Prerequisite Documents:** 12_ENGINE_BOUNDARY_SPECIFICATION, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 25_FIRST_WEDGE_USER_FLOWS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **các quy tắc chính thức về cách biểu đạt state và status** trong Nextflow OS cho Pack 03. Nếu First Wedge User Flows đã chốt các operational journeys chính của wedge đầu tiên, thì tài liệu này đi vào một lớp nền còn quan trọng hơn ở cấp trải nghiệm:

> **Người dùng phải nhìn thấy trạng thái của item, của work, của approval và của ngoại lệ như thế nào để họ luôn hiểu hệ thống đang ở đâu, việc gì đang chờ, ai đang giữ bước tiếp theo, và hậu quả của hành động vừa thực hiện là gì?**

Đây là tài liệu có tính nền tảng rất cao vì trong một SME Business OS, phần lớn sự rối loạn không đến từ thiếu tính năng mà đến từ **trạng thái mơ hồ**. Khi người dùng không hiểu một item đang “được tạo”, “đang xử lý”, “đang chờ duyệt”, “đang bị chặn”, “đã hoàn tất” hay “đã đóng” theo nghĩa nào, họ sẽ quay lại hỏi nhau ngoài hệ thống. Khi đó UI có thể đẹp, flow có thể tồn tại, nhưng product vẫn không tạo ra control value thật.

Tài liệu này phải khóa mười một thứ:
1. State là gì và status là gì trong ngữ cảnh Nextflow OS.  
2. Các lớp trạng thái nào cần được phân biệt rõ.  
3. Những quy tắc biểu đạt dùng chung xuyên Web Admin và Mobile Ops.  
4. Cách hiển thị record state, work state, approval state và exception state.  
5. Quy tắc cho blocked, waiting, overdue, escalated và completed cues.  
6. Quy tắc phản hồi sau actions làm đổi trạng thái.  
7. Quy tắc ngôn ngữ và nhãn hiển thị.  
8. Quy tắc visual semantics ở mức chiến lược, không đi sâu pixel.  
9. Những anti-pattern nghiêm trọng về state presentation phải tránh.  
10. Các dependencies giữa UX state presentation và business-truth ownership.  
11. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. State và status trong ngữ cảnh Nextflow OS

Trong tài liệu này, cần phân biệt hai khái niệm gần nhau nhưng không giống nhau.

### 2.1 State

**State** là tình trạng có nghĩa nghiệp vụ hoặc có nghĩa điều hành của một thực thể trong hệ thống. Nó phản ánh item đang ở đâu trong vòng đời, trong work handling, trong approval path hoặc trong exception path.

### 2.2 Status presentation

**Status presentation** là cách state đó được biểu đạt ra trải nghiệm người dùng qua labels, badges, helper text, emphasis, grouping, signals, action prompts hoặc post-action feedback.

### 2.3 Vì sao phải tách hai lớp này

Nếu không tách rõ, team rất dễ rơi vào hai lỗi lớn:
- UI tự invent ra “status” không map về business truth hoặc work truth;  
- hoặc ngược lại, business state quá kỹ thuật được đẩy nguyên xi ra cho người dùng đọc dù họ không hiểu.

Nextflow OS cần một lớp dịch có kỷ luật: state truth nằm ở product core, còn status presentation là cách UX làm cho truth đó trở nên dễ hiểu, có tính hành động và nhất quán.

## 3. State-presentation thesis cho Nextflow OS

State-presentation thesis có thể phát biểu như sau:

> **Trong Nextflow OS, mọi item phải luôn trả lời được bốn câu hỏi ở mức phù hợp vai trò: nó đang ở đâu, vì sao đang ở đó, ai đang giữ bước tiếp theo, và tôi có thể hoặc không thể làm gì tiếp theo.**

Từ thesis này, tám nguyên lý được suy ra:

1. Biểu đạt trạng thái phải ưu tiên **clarity over compression**.  
2. Cùng một state truth có thể được diễn đạt với độ sâu khác nhau trên web và mobile, nhưng **semantics phải giữ nguyên**.  
3. Người dùng phải phân biệt được **record state** với **work state** khi điều đó quan trọng cho quyết định.  
4. Approval, blocked, waiting và overdue không được bị pha loãng vào generic “in progress”.  
5. Sau mọi action quan trọng, hệ thống phải làm rõ **status outcome** ngay.  
6. Status labels phải hỗ trợ hành động, không chỉ mô tả mơ hồ.  
7. Visual cues không được là nguồn duy nhất của meaning; luôn cần text semantics đủ rõ.  
8. UX không được dùng status presentation để che hoặc bù cho business-boundary mơ hồ.

## 4. Bốn lớp trạng thái phải được phân biệt rõ

Đây là quyết định nền quan trọng nhất của tài liệu.

## 4.1 Record state

Record state trả lời câu hỏi: **item này đang ở đâu trong vòng đời nghiệp vụ hoặc vòng đời đối tượng chính?** Ví dụ ở mức logic, một record có thể ở trạng thái mới tạo, đang xử lý, đã hoàn tất, đã đóng, hoặc bị hủy tùy scope phase.

### Khi nào phải hiển thị record state
- Khi người dùng đang xem record detail.  
- Khi decision persona cần hiểu business position của item.  
- Khi cần phân biệt item-level truth với task-level handling.

### Không nên làm gì
Không nên để record state bị nhầm với việc “ai đang làm nó” hoặc “có pending approval không”, vì đó có thể là các lớp trạng thái khác.

## 4.2 Work state

Work state trả lời câu hỏi: **việc cần xử lý trên item này hiện đang được nắm giữ và vận hành như thế nào?** Nó có thể liên quan đến assignment, in-progress handling, waiting handoff, unassigned workload hoặc pending team action.

### Khi nào phải hiển thị work state
- Trong queues và worklists.  
- Trên Mobile Ops ở My Work / Team Work.  
- Trong các ngữ cảnh coordination nơi ai đang giữ việc quan trọng hơn business state tổng quát.

### Không nên làm gì
Không nên biến work state thành “bản sao” của record state nếu điều đó làm mất visibility về queue handling thực tế.

## 4.3 Approval state

Approval state trả lời câu hỏi: **item này có đang chờ quyết định hay không, đang chờ ai, và quyết định nào đang treo flow?**

### Khi nào phải hiển thị approval state
- Trong approval inboxes.  
- Trong record detail khi approval đang ảnh hưởng flow.  
- Trong mobile nếu user cần biết item đang chờ duyệt chứ không phải chờ mình.

### Không nên làm gì
Không nên giấu approval state bên trong notes hoặc history. Nếu approval là blocker của flow, nó phải lộ ra như một tình trạng riêng.

## 4.4 Exception state

Exception state trả lời câu hỏi: **item này có đang rơi khỏi happy path không, vì lý do gì, và điều gì cần xảy ra để quay lại quỹ đạo?**

### Khi nào phải hiển thị exception state
- Khi item blocked, missing info, out-of-policy, escalated, overdue theo logic xử lý.  
- Khi coordination persona đang điều tra ngoại lệ.  
- Khi execution persona cần biết vì sao mình không thể tiếp tục.

### Không nên làm gì
Không nên nhốt exception state trong generic warning icon mà không có wording đủ rõ.

## 5. Quy tắc presentation dùng chung xuyên surfaces

Dù Web Admin và Mobile Ops khác nhau mạnh về density, chúng phải chia sẻ một bộ luật biểu đạt trạng thái nền.

## 5.1 Quy tắc 1 – Text always carries meaning

Mọi trạng thái quan trọng phải có text label rõ, không phụ thuộc hoàn toàn vào màu, icon hoặc vị trí. Điều này quan trọng cho khả năng hiểu nhanh, accessibility và cross-surface consistency.

## 5.2 Quy tắc 2 – One dominant state per context

Trong mỗi context chính, nên có một trạng thái nổi bật nhất giúp người dùng định hướng. Ví dụ trong queue, work state hoặc exception state có thể là dominant; trong detail view, record state có thể là dominant; trong approval inbox, approval state là dominant.

## 5.3 Quy tắc 3 – Supporting states may co-exist, but hierarchy must be clear

Một item có thể đồng thời có record state, work state và approval state. Nhưng UI phải làm rõ cái nào là lớp chính trong ngữ cảnh hiện tại, cái nào là lớp bổ trợ.

## 5.4 Quy tắc 4 – Same meaning, same language family

Nếu item đang blocked trên web, mobile không nên đổi thành một khái niệm khác như paused hoặc delayed nếu semantics không giống nhau. Nhất quán ở level khái niệm quan trọng hơn sự đa dạng ngôn từ.

## 5.5 Quy tắc 5 – State changes must be acknowledged explicitly

Sau một hành động như approve, reassign, mark blocked hoặc complete, hệ thống phải cho người dùng thấy outcome đủ rõ bằng confirmation text, queue movement, refreshed label hoặc transition hint.

## 6. Ngôn ngữ trạng thái ưu tiên cho launch slice

Tài liệu này chưa khóa final dictionary tuyệt đối, nhưng cần chốt nguyên tắc ngôn ngữ cho phase đầu.

## 6.1 Ưu tiên từ ngắn, hành động được, không kỹ thuật

Các từ như New, Assigned, In Progress, Waiting, Blocked, Pending Approval, Overdue, Completed, Rejected, Needs Info thường dễ hiểu hơn các label kỹ thuật hoặc quá enterprise.

## 6.2 Ưu tiên một từ điển lõi nhỏ nhưng mạnh

Launch slice nên dùng một bộ từ vựng trạng thái tương đối gọn để người dùng học nhanh. Nếu phase đầu đã có quá nhiều biến thể gần nghĩa, người dùng sẽ nhầm lẫn.

## 6.3 Tránh labels mơ hồ

Các từ như Active, Open, Processing, Handled, Managed, Under Review chỉ nên dùng nếu nghĩa của chúng thật rõ trong context. Nếu không, chúng thường quá rộng và làm người dùng phải đoán.

## 6.4 Dùng helper text khi label ngắn chưa đủ

Không phải lúc nào label cũng mang đủ meaning. Trong các tình huống approval hoặc exception, helper text ngắn như “Waiting for manager approval” hoặc “Blocked: missing branch confirmation” có thể cần thiết để tăng clarity.

## 7. Quy tắc cho record state presentation

## 7.1 Record state phải xuất hiện ổn định ở những nơi object-centric

Trong Record Detail, record state nên được đặt ở vị trí có trọng lượng cao và nhất quán để người dùng luôn biết item đang ở đâu trong vòng đời chính.

## 7.2 Record state không nên bị thay bằng action verbs

“Approve now” hay “Needs review” có thể là action cues, nhưng không nên thay thế record state nếu record truth thực sự là một thứ khác. Cần tách sự thật trạng thái với lời kêu gọi hành động.

## 7.3 Record state trong lists phải đủ scanable

Trong queue/list screens, record state nên hiện diện ở mức súc tích để người điều phối có thể quét nhanh mà không mở từng item.

## 7.4 Record state trong mobile có thể nhẹ hơn nhưng không mất meaning

Trên Mobile Ops, record state có thể không phải thông tin to nhất, nhưng nếu nó ảnh hưởng đến action của user thì phải vẫn nhìn thấy được.

## 8. Quy tắc cho work state presentation

## 8.1 Work state là ngôn ngữ chính của queues

Trong queues và workload views, người dùng chủ yếu muốn biết việc nào đang chờ, ai đang giữ, cái gì đang tiến triển và cái gì bị kẹt. Vì vậy work state phải là lớp ngôn ngữ chính.

## 8.2 Work state phải gắn với ownership cues

Một work state như Assigned hoặc Waiting chỉ hữu ích trọn vẹn khi người dùng có thể biết đang assigned cho ai hoặc đang waiting on ai ở mức phù hợp.

## 8.3 Unassigned là trạng thái hạng nhất

Trong operating systems, “chưa có ai giữ việc” là một signal rất quan trọng. Unassigned không được bị giấu trong một trường phụ khó thấy.

## 8.4 In-progress phải có meaning rõ

Không nên để In Progress trở thành nơi gom mọi thứ chưa xong. Khi cần, phải có thêm cues phân biệt đang xử lý bình thường, đang chờ ngoại lực hay đang mắc approval.

## 9. Quy tắc cho approval state presentation

## 9.1 Pending Approval phải là label mạnh

Khi approval đang chặn flow, trạng thái này phải nổi bật đủ để người dùng hiểu ngay vì sao item chưa đi tiếp.

## 9.2 Approval state phải chỉ ra direction of waiting

Nếu item đang chờ duyệt, người dùng nên hiểu chờ manager, chờ supervisor hay chờ một role có quyền phù hợp, tùy mức chi tiết cho phép.

## 9.3 Approved / Rejected / Override must leave a narrative trace

Sau quyết định, không chỉ label mới quan trọng mà còn cần dấu vết đủ để người dùng biết chuyện gì vừa xảy ra và vì sao nếu cần review.

## 9.4 Mobile chỉ cần mức đủ hành động

Trên mobile, approval state có thể được giản lược thành cues như “Waiting for approval” hoặc “Approval requested”, miễn semantics không bị lệch với web.

## 10. Quy tắc cho exception state presentation

## 10.1 Blocked phải khác Waiting

Blocked ngụ ý item không thể tiến tiếp nếu không giải quyết một trở ngại. Waiting có thể chỉ là đang chờ bước tiếp theo hoặc phụ thuộc nào đó. Không được dùng lẫn hai từ này nếu product logic phân biệt.

## 10.2 Needs Info phải rõ hơn generic warning

Khi item thiếu thông tin, người dùng nên thấy rõ đây là thiếu thông tin chứ không phải lỗi chung chung. Điều này giúp recovery action rõ hơn.

## 10.3 Overdue là cue thời gian, không luôn là state chính

Overdue có thể là một overlay hoặc signal xuyên nhiều trạng thái, chứ không nhất thiết thay thế record/work/approval state. UX phải tách được điều này.

## 10.4 Escalated phải cho thấy gravity tăng lên

Khi item bị escalated, status presentation phải cho người dùng cảm giác đây là mức can thiệp cao hơn, không chỉ là một biến thể nhẹ của in-progress.

## 10.5 Exception text nên trả lời “vì sao” ở mức ngắn

Ví dụ như “Blocked: missing stock confirmation” hoặc “Waiting: branch callback pending” tốt hơn nhiều so với chỉ ghi Blocked hoặc Waiting một cách trần trụi.

## 11. Quy tắc cho completed, closed, cancelled cues

## 11.1 Completed và Closed không nên dùng lẫn nếu semantics khác

Nếu product model phân biệt “đã xong bước xử lý” với “đã đóng vòng đời record”, UI cũng phải phản ánh distinction đó. Nếu phase đầu chưa cần tách, tốt hơn là dùng từ điển nhỏ và nhất quán hơn là nhiều từ gần nghĩa.

## 11.2 Completion phải tạo cảm giác kết thúc rõ

Sau khi người dùng hoàn tất việc, item nên đổi cue đủ rõ qua label, placement hoặc biến mất khỏi active queue tương ứng. Cảm giác completion rất quan trọng cho adoption.

## 11.3 Cancelled hoặc Rejected cần mang đúng sắc thái hậu quả

Các trạng thái kết thúc tiêu cực hoặc dừng luồng không nên bị biểu đạt nhẹ tay như một update bình thường. Người dùng phải thấy chúng khác về outcome.

## 12. Quy tắc phản hồi sau actions đổi trạng thái

Phần này là cầu nối giữa state semantics và interaction design.

## 12.1 Sau action phải có immediate feedback

Khi người dùng bấm Approve, Mark Blocked, Reassign, Complete hoặc Update Status, hệ thống phải phản hồi ngay rằng thao tác đã được ghi nhận chưa.

## 12.2 Feedback phải nói outcome, không chỉ nói success chung chung

“Saved successfully” thường chưa đủ. Tốt hơn là những phản hồi kiểu “Item moved to Pending Approval”, “Assigned to Branch A Queue”, “Marked Blocked: waiting for manager input” hoặc “Completed and removed from My Work” khi phù hợp.

## 12.3 Nếu action đổi ownership, phải nói rõ ai thấy tiếp theo

Đây là yếu tố cực quan trọng trong operating flows. Người dùng cần hiểu sau thao tác của mình, bước tiếp theo đang thuộc ai hoặc queue nào.

## 12.4 Nếu action không thể hoàn thành, lỗi phải gắn với state logic

Thay vì lỗi chung chung, hệ thống nên cố gắng cho biết vì sao action không thể xảy ra: thiếu thông tin, quyền không đủ, item đã đổi trạng thái, approval đã stale hoặc queue context đã thay đổi.

## 13. Visual semantics ở mức chiến lược

Tài liệu này không đóng chi tiết design system, nhưng cần khóa một số định hướng chiến lược.

## 13.1 Màu chỉ là lớp hỗ trợ

Màu có thể giúp quét nhanh, nhưng không được là nơi duy nhất mang meaning. Text labels và hierarchy vẫn là nguồn nghĩa chính.

## 13.2 Cùng severity family nên có visual family gần nhau

Các trạng thái như Blocked, Overdue, Escalated có thể thuộc cùng một family tín hiệu attention cao, trong khi Completed thuộc family kết thúc tích cực hơn. Điều này giúp sản phẩm có grammar trực quan nhất quán.

## 13.3 Badges, chips, inline labels và banners phải có vai trò khác nhau

- Badge/chip phù hợp cho status ngắn, scanable.  
- Inline helper text phù hợp cho explanatory nuance.  
- Banner hoặc highlighted region phù hợp cho blockers/exceptions cần chú ý mạnh.

Không nên dùng một pattern cho mọi loại trạng thái.

## 13.4 Mobile cần nén semantics nhưng không nén truth

Trên mobile, số lượng labels và mật độ tín hiệu phải ít hơn, nhưng các trạng thái làm thay đổi hành động của user vẫn phải lộ ra rõ ràng.

## 14. Mapping trạng thái với ngữ cảnh màn hình

## 14.1 Overview screens

Overview nên nhấn mạnh signals tổng hợp như pending approvals, blocked items, overdue items, hotspot counts và movement summaries. Đây là nơi trạng thái được nhìn ở level pattern hơn là level item đơn.

## 14.2 Queue / worklist screens

Ở đây, work state và exception cues thường là dominant, còn record state đóng vai trò bổ trợ trừ khi business context đòi hỏi mạnh hơn.

## 14.3 Record detail screens

Record state nên là anchor chính, còn approval state, work state và exception state xuất hiện như contextual layers bao quanh object truth.

## 14.4 Approval / decision screens

Approval state và decision consequence cues là dominant. Record summary, history và exception context đóng vai trò hỗ trợ cho quyết định.

## 14.5 Mobile My Work / Item Action screens

Next-step cues, work state, waiting/blocked signals và completion outcome phải là những tín hiệu mạnh nhất. Record truth vẫn hiện diện nhưng không nên lấn action clarity.

## 15. Anti-patterns nghiêm trọng phải tránh

## 15.1 Một label gánh quá nhiều nghĩa

Ví dụ dùng mỗi “In Progress” cho item đang được xử lý bình thường, item đang chờ duyệt, item đang thiếu thông tin và item đang bị blocked. Đây là nguồn gây rối rất lớn.

## 15.2 Chỉ dùng màu, không dùng chữ

Nếu người dùng phải học hệ màu mới hiểu trạng thái, UX sẽ mong manh, khó truy cập và khó nhất quán giữa surfaces.

## 15.3 UI invents states that backend does not own

Khi frontend thêm những trạng thái nghe có vẻ tiện nhưng không map được vào product truth, hệ thống sẽ tạo ra khoảng cách nguy hiểm giữa what users see và what the system knows.

## 15.4 Status spam

Nếu một item hiển thị quá nhiều badges ngang hàng mà không có hierarchy, người dùng sẽ không biết cái nào quan trọng nhất.

## 15.5 Outcome feedback quá chung chung

Khi người dùng vừa làm action có hậu quả vận hành mà chỉ nhận một toast kiểu “updated”, trust sẽ yếu vì họ không biết item đã thực sự đi đâu.

## 16. Ranh giới giữa UX presentation và business truth

## 16.1 UX được quyền làm gì

UX được quyền:
- chọn cách gọi dễ hiểu cho state presentation miễn semantics đúng;  
- quyết định trạng thái nào dominant trong từng ngữ cảnh màn hình;  
- thêm helper text, severity emphasis, grouping cues và confirmation wording;  
- tóm lược logic phức tạp thành messages ngắn hơn nếu không làm sai meaning.

## 16.2 UX không được làm gì

UX không được:
- phát minh lifecycle truth mới;  
- hợp nhất những states mà business logic cần tách, chỉ vì UI muốn gọn;  
- che giấu transitions quan trọng;  
- đổi semantics giữa web và mobile;  
- hoặc biểu đạt một item như đã hoàn tất khi product truth chưa cho phép.

## 16.3 Câu hỏi boundary bắt buộc

Mỗi khi định thêm một status mới, team phải hỏi:
- đây là business truth, work truth, approval truth hay chỉ là presentation shorthand;  
- ai sở hữu state gốc này;  
- người dùng cần hiểu nó để làm gì;  
- và có thể biểu đạt nó rõ hơn mà không invent meaning mới không.

## 17. Mapping với các flows launch-critical

## 17.1 Flow A – Create and intake

Người dùng phải thấy record đã được tạo chưa, thuộc branch nào và đã vào intake/queue phù hợp hay chưa.

## 17.2 Flow B – Queue assignment

Người dùng phải thấy item unassigned, assigned hay waiting, và đổi owner/queue như thế nào sau mỗi action.

## 17.3 Flow C – Operator execution

Người dùng phải thấy action tiếp theo, blocked/waiting nếu có và completion outcome sau update.

## 17.4 Flow D – Approval decision

Người dùng phải thấy rõ pending approval, approval reason, decision outcome và item quay về flow nào.

## 17.5 Flow E – Exception recovery

Người dùng phải thấy exception type, current blockage và recovery path đang chờ ai.

## 17.6 Flow F – Completion and trace review

Người dùng phải phân biệt item đã complete, đã close hay đang chờ xác nhận cuối nếu flow phase đầu cần distinction này.

## 18. Governance rules cho mọi quyết định state presentation

1. **Mỗi trạng thái hiển thị phải map được về một state truth hoặc shorthand được kiểm soát.**  
2. **Mỗi ngữ cảnh màn hình phải có một dominant state rõ ràng.**  
3. **Mỗi action đổi trạng thái phải có feedback outcome cụ thể.**  
4. **Blocked, Waiting, Pending Approval và Overdue không được nhập nhằng với nhau.**  
5. **Web và Mobile có thể khác độ sâu, nhưng không được khác semantics.**  
6. **Nếu người dùng cần biết ai đang giữ bước tiếp theo, status presentation phải làm lộ điều đó.**  
7. **Không thêm status label mới chỉ để che đi sự mơ hồ của core product.**  
8. **Các trạng thái launch slice phải dùng từ điển nhỏ, học nhanh và lặp lại nhất quán.**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên tiếp tục theo chuỗi logic sau:

1. **27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES.md** – luật nền và guardrails xuyên Pack 03.  
2. **28_MOBILE_OPS_SCREEN_TAXONOMY.md** – taxonomy màn hình Mobile Ops.  
3. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – patterns cho nhập liệu, note, proof và exception capture.  
4. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – landing strategies theo persona.  
5. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho các Web Admin screen families.  
6. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.  
7. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, error states và recovery messaging.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho state presentation:

1. Nextflow OS phải phân biệt rõ **record state, work state, approval state và exception state**.  
2. Status presentation là lớp UX diễn giải state truth, không phải nơi phát minh state truth mới.  
3. Web và Mobile có thể khác về density nhưng phải giữ **semantic consistency**.  
4. Blocked, Waiting, Pending Approval, Overdue, Completed và các cues kết thúc không được nhập nhằng.  
5. Sau mọi action quan trọng, người dùng phải thấy **outcome trạng thái** đủ rõ.  
6. Màu sắc chỉ là lớp hỗ trợ; text semantics và hierarchy mới là nền.  
7. Launch slice phải dùng bộ từ điển trạng thái tương đối nhỏ, rõ và lặp lại nhất quán.  
8. Tài liệu này là baseline để mọi flow, wireframe, component và QA scenario về sau nói cùng một ngôn ngữ trạng thái.

## 21. Điều kiện hoàn thành của tài liệu

State and Status Presentation Rules được xem là đạt yêu cầu khi:
- Product, UX, Engineering và QA có cùng cách hiểu về các lớp trạng thái phải biểu đạt;  
- distinction giữa record/work/approval/exception states không còn mơ hồ ở level trải nghiệm;  
- các flows launch-critical đã có bộ quy tắc status đủ rõ để đi xuống wireframe và component behavior;  
- và design system / frontend có thể triển khai status grammar mà không phải tự phát minh lại semantics.

## AG Execution Prompt

You are acting as a senior UX systems designer, product semantics architect, and state-presentation strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: multi-surface experience system with Web Admin as control surface and Mobile Ops as execution surface.
- The first wedge depends heavily on visibility of record state, work state, approval state, and exception state.
- This document defines how those states should be presented to users.

### Objective
Refine this State and Status Presentation Rules document into a production-grade semantics and UX-status baseline that can guide design systems, screen design, interaction behavior, frontend implementation, and QA scenario validation.

### Inputs
- Use this document plus Engine Boundary Specification, Experience Strategy Overview, Web Admin Experience Strategy, Mobile Ops Experience Strategy, IA/Navigation Model, and First Wedge User Flows as the primary source of truth.
- Preserve the distinction between business truth and UX presentation.
- Keep the output concrete enough for downstream design and implementation.

### Tasks
1. Rewrite the state-presentation thesis into a sharper executive form.
2. Produce a state-type register covering record, work, approval, and exception states.
3. Add a presentation grammar showing dominant versus supporting state cues by screen context.
4. Define a launch-phase status vocabulary policy.
5. Mark the minimum post-action feedback rules required for usability and trust.
6. Identify the top five state-presentation failures that would break adoption or clarity.
7. Recommend the next documents that should operationalize these rules into wireframes, components, and QA scenarios.

### Constraints
- Do not invent new business states inside the UI.  
- Do not collapse distinct meanings such as blocked, waiting, overdue, and pending approval into vague labels.  
- Do not rely on color as the sole meaning carrier.  
- Do not let Web and Mobile drift semantically.  
- Keep the output specific enough for product delivery work.

### Output Format
Return a revised markdown document with these sections:
1. Executive State-Presentation Thesis
2. State-Type Register
3. Presentation Grammar by Context
4. Launch Vocabulary Policy
5. Post-Action Feedback Rules
6. Failure Risks
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make state presentation explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams present state clearly across Web Admin and Mobile Ops.
- The output must reduce ambiguity around status meaning, action outcomes, and cross-surface semantics.
