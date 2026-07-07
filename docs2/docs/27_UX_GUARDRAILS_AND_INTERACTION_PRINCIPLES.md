# Nextflow OS – UX Guardrails and Interaction Principles

**Document ID:** 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Systems / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Frontend Delivery, Design System, QA & Support, Sales & Enablement  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES

## 1. Mục tiêu tài liệu

Tài liệu này xác định **bộ guardrails UX và interaction principles chính thức** cho Nextflow OS trong Pack 03. Nếu các tài liệu trước đã lần lượt khóa experience strategy, surface roles, IA/navigation, screen taxonomy, user flows và state grammar, thì tài liệu này đóng vai trò như **bộ luật nền** để mọi quyết định thiết kế và mọi hành vi giao diện về sau không bị lệch khỏi product baseline.

Nói ngắn gọn:

> **Nếu các tài liệu trước trả lời “chúng ta phải thiết kế cái gì”, thì tài liệu này trả lời “chúng ta được phép thiết kế theo cách nào, và không được phép thiết kế theo cách nào”.**

Đây là tài liệu đặc biệt quan trọng vì nhiều sản phẩm không hỏng ở level strategy, mà hỏng ở level tích lũy các quyết định UI/interaction nhỏ nhưng đi sai hướng. Mỗi quyết định riêng lẻ có thể trông hợp lý, nhưng cộng lại sẽ dần biến control surface thành dashboard trình diễn, biến execution surface thành web admin thu nhỏ, làm mờ state semantics, làm approval mất context, hoặc đẩy ngoại lệ ra ngoài chat. Guardrails tồn tại để chặn chính xác kiểu trôi dạt đó.

Tài liệu này phải khóa mười hai thứ:
1. UX guardrails là gì trong ngữ cảnh Nextflow OS.  
2. Vai trò của interaction principles trong một SME Business OS.  
3. Các guardrails nền xuyên mọi surfaces.  
4. Các guardrails riêng cho Web Admin.  
5. Các guardrails riêng cho Mobile Ops.  
6. Các interaction principles cho flows, actions, confirmations, errors và recovery.  
7. Các nguyên tắc về density, hierarchy, defaults, wording và feedback.  
8. Các nguyên tắc về exception-first usability.  
9. Những anti-pattern UX nghiêm trọng phải tránh.  
10. Cách dùng guardrails trong design review, product review và frontend review.  
11. Những gì guardrails được phép linh hoạt và những gì là non-negotiable.  
12. Các tài liệu UX tiếp theo nên kế thừa guardrails này như thế nào.

## 2. UX guardrails trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, UX guardrails không phải checklist thẩm mỹ và cũng không chỉ là best practices chung chung. Chúng là **những ranh giới thiết kế có chủ đích** giúp mọi team giữ được bản chất của sản phẩm khi đi từ chiến lược xuống màn hình, component, flow và tương tác thật.

Guardrails đặc biệt cần thiết vì Nextflow OS có đồng thời nhiều lực kéo khác nhau:
- lực kéo muốn làm web admin mạnh hơn để bán/demo dễ hơn;  
- lực kéo muốn làm mobile nhiều hơn để frontline thích dùng;  
- lực kéo muốn nhồi thêm settings để xử lý khác biệt khách hàng;  
- lực kéo muốn thêm status hoặc shortcuts để vá logic chưa rõ;  
- và lực kéo muốn làm cho UI “đẹp hơn” dù có thể làm giảm control clarity.

Nếu không có guardrails, mỗi quyết định đều có thể được biện minh cục bộ. Nhưng ở level hệ thống, sản phẩm sẽ mất coherence. Vì vậy guardrails là công cụ để bảo vệ **identity của Nextflow OS như một SME Business OS**.

## 3. Guardrail thesis cho Pack 03

Guardrail thesis của Pack 03 có thể phát biểu như sau:

> **Mọi quyết định UX trong Nextflow OS phải làm tăng operational clarity, flow discipline và role-appropriate usability; nếu một quyết định làm giảm ba thứ này, nó không được chấp nhận dù có vẻ tiện, đẹp hoặc nhanh để build.**

Từ thesis này, chín nguyên lý nền được suy ra:

1. UX phải phục vụ **operating model**, không phải chỉ phục vụ visual polish.  
2. Mỗi surface phải tối ưu cho **role và context riêng**, không bị ép đồng nhất.  
3. State, action, ownership và exception phải luôn rõ hơn trước.  
4. Flows phải ưu tiên **giảm hỗn loạn ngoài hệ thống**, không tạo thêm lý do để người dùng quay lại chat/spreadsheet.  
5. UI không được che mờ boundaries giữa business truth, work truth và approval truth.  
6. Defaults tốt có giá trị hơn flexibility vô hạn ở phase đầu.  
7. Control surfaces phải tối ưu cho **triage và quyết định**, execution surfaces phải tối ưu cho **hoàn thành hành động nhanh**.  
8. Ngoại lệ phải được đối xử như first-class operational realities.  
9. Mọi convenience UX phải bị kiểm tra ngược với long-term product coherence.

## 4. Guardrails nền xuyên mọi surfaces

Đây là các luật áp dụng cho toàn bộ Pack 03, bất kể đang thiết kế Web Admin, Mobile Ops hay các surfaces sau này.

## 4.1 Guardrail A – Operational clarity first

Mọi màn hình, flow hoặc component phải làm người dùng hiểu rõ hơn ít nhất một trong các câu hỏi sau:
- việc gì đang xảy ra;  
- cái gì đang chờ;  
- tôi nên làm gì tiếp theo;  
- nếu không đi tiếp được thì vì sao.

Nếu một thiết kế làm UI trông tinh gọn hơn nhưng khiến người dùng khó trả lời các câu hỏi trên hơn, đó là sai hướng.

## 4.2 Guardrail B – Role-fit over universality

Không có giao diện “một kiểu cho tất cả”. Một trải nghiệm tốt cho founder/ops manager có thể quá nặng với frontline operator. Một trải nghiệm tốt cho mobile execution có thể quá nông với web coordination. Mọi thiết kế phải tự chứng minh nó phù hợp vai trò nào.

## 4.3 Guardrail C – Flow momentum matters

Người dùng phải có cảm giác flow đi tới được. Họ không nên liên tục mắc kẹt ở các bước phụ, confirmations thừa, menus vòng vo hoặc trạng thái không rõ. Từng micro-interaction phải hỗ trợ flow momentum thay vì phá nhịp.

## 4.4 Guardrail D – State truth must stay legible

Dù thiết kế có tối giản đến đâu, product vẫn phải giữ được khả năng làm lộ state truth ở mức phù hợp. Không được hy sinh state clarity chỉ để có giao diện “sạch” hơn.

## 4.5 Guardrail E – Exceptions are not secondary

Nếu một flow chỉ mượt ở happy path mà gần như bỏ mặc blocked, missing info, approval-needed, overdue hoặc escalation moments, UX đó chưa đủ tốt cho Nextflow OS.

## 4.6 Guardrail F – Feedback must reduce anxiety

Người dùng của operating systems thường lo nhất ở hai điểm: “hệ thống đã ghi nhận chưa?” và “giờ item đi đâu rồi?”. Mọi feedback quan trọng phải giảm đúng hai nỗi lo này.

## 4.7 Guardrail G – Surface logic must remain distinct

Web Admin không được dần dần hành xử như mobile, và Mobile Ops không được dần dần hành xử như web admin. Sự khác biệt không phải lỗi; đó là một phần chiến lược sản phẩm.

## 4.8 Guardrail H – No hidden product logic in UI

Nếu một interaction chỉ có nghĩa vì frontend biết một logic mà engines hoặc contracts không sở hữu rõ ràng, đó là tín hiệu nguy hiểm. UI không được trở thành nơi chứa logic ẩn để “làm cho chạy được”.

## 4.9 Guardrail I – Launch-scope discipline

Mọi thiết kế phải bám wedge đầu tiên. Nếu một ý tưởng UX hay nhưng đòi nhiều capability ngoài phase hiện tại, nó nên bị trì hoãn thay vì kéo product ra khỏi launch logic.

## 5. Interaction principles nền

Các guardrails ở trên định nghĩa ranh giới. Phần này định nghĩa **phong cách hành vi tương tác** bên trong ranh giới đó.

## 5.1 Principle 1 – Show the next best action

Hầu hết người dùng không cần thấy tất cả mọi thứ có thể làm; họ cần thấy điều nên làm tiếp theo. Interaction tốt phải làm nổi hành động chính ở đúng thời điểm.

## 5.2 Principle 2 – Keep high-frequency actions light

Những hành động xảy ra nhiều như mở item, nhận việc, cập nhật trạng thái, thêm note ngắn, assign lại, approve hoặc mark blocked phải được tối ưu số bước và tải nhận thức.

## 5.3 Principle 3 – Keep high-impact actions contextual

Những hành động có hậu quả lớn như approve, reject, override, close, cancel, escalate hoặc bulk update phải đi kèm ngữ cảnh đủ rõ trước khi người dùng xác nhận.

## 5.4 Principle 4 – Design for scan before detail

Người dùng điều hành thường quét trước rồi mới đi sâu. Information hierarchy và interaction paths phải hỗ trợ việc scan nhanh để chọn đúng điểm đào sâu.

## 5.5 Principle 5 – Make recovery visible

Khi có lỗi, blocked state hoặc thiếu thông tin, UX không chỉ nên báo vấn đề mà phải làm rõ đường hồi phục gần nhất.

## 5.6 Principle 6 – Confirm meaningfully, not mechanically

Không phải hành động nào cũng cần modal xác nhận. Nhưng khi đã xác nhận, nội dung xác nhận phải giúp người dùng hiểu hậu quả, không chỉ cản tay một cách hình thức.

## 5.7 Principle 7 – Preserve orientation during depth changes

Khi người dùng đi từ overview sang queue, từ queue sang detail, từ detail sang approval, rồi quay lại, hệ thống phải giúp họ giữ orientation và context.

## 5.8 Principle 8 – Reduce memory burden

UI không nên buộc người dùng nhớ quá nhiều trạng thái, bước trước đó, ai đang giữ item hay item đi đâu sau action. Product phải mang phần trí nhớ này thay cho người dùng.

## 6. Guardrails riêng cho Web Admin

Web Admin là control surface nên phải chịu các luật riêng ngoài bộ nền.

## 6.1 Web Guardrail 1 – Triage before decoration

Dashboard, list hoặc detail trên web phải phục vụ triage, drill-down và decision-making trước khi phục vụ tính thẩm mỹ hoặc “cảm giác cao cấp”.

## 6.2 Web Guardrail 2 – Every summary must lead somewhere actionable

Nếu một metric, card hoặc signal không có đường dẫn hợp lý tới nơi người dùng có thể xử lý vấn đề đó, nó là yếu tố trang trí nhiều hơn công cụ điều hành.

## 6.3 Web Guardrail 3 – Lists are operating instruments, not raw dumps

Worklists không được chỉ là bảng dữ liệu dài. Chúng phải hỗ trợ grouping, prioritization, scanning cues và movement into action.

## 6.4 Web Guardrail 4 – Decision screens must carry decision context

Approval, override, reject hoặc recovery quyết định không được xuất hiện như những actions trơ trọi. Chúng phải đi cùng record summary, reasoning cues, recent history và likely consequence.

## 6.5 Web Guardrail 5 – Setup must stay in its lane

Config, import và setup là quan trọng, nhưng không được lấn át control spine của Web Admin. Nếu một thiết kế mới làm cấu hình chiếm quá nhiều chỗ trong top-level experience, đó là dấu hiệu trượt hướng.

## 6.6 Web Guardrail 6 – Dense does not mean chaotic

Web Admin có thể nhiều thông tin hơn mobile, nhưng density phải đi kèm hierarchy mạnh, spacing có chủ đích và ưu tiên rõ. “Cho hết lên màn hình” không phải là chiến lược control UX.

## 7. Guardrails riêng cho Mobile Ops

Mobile Ops là execution surface nên phải được bảo vệ khỏi những thói quen thiết kế web-centric.

## 7.1 Mobile Guardrail 1 – Action over exploration

Người dùng mobile đến để hoàn tất việc, không phải để khám phá hệ thống. Entry points, navigation và layout phải hướng hành động rõ rệt.

## 7.2 Mobile Guardrail 2 – One dominant action per moment

Mỗi screen trạng thái chính nên có một hành động nổi bật nhất. Nếu quá nhiều hành động ngang hàng, người dùng sẽ chần chừ hoặc làm sai.

## 7.3 Mobile Guardrail 3 – Context must be sufficient, not exhaustive

Mobile phải cho đủ thông tin để hành động an toàn, nhưng không sao chép detail density của web. “Đủ để làm đúng” quan trọng hơn “đầy đủ mọi thứ”.

## 7.4 Mobile Guardrail 4 – Typing is expensive

Mỗi trường text, mỗi bước nhập tay, mỗi thao tác upload hoặc modal chồng thêm đều có giá rất cao trên mobile. Thiết kế phải tôn trọng sự đắt đỏ đó.

## 7.5 Mobile Guardrail 5 – Exception reporting must be lighter than chat temptation

Nếu báo blocked, needs-help hoặc needs-approval trong app khó hơn gửi một tin nhắn, người dùng sẽ chọn tin nhắn. Mobile UX phải thắng được cám dỗ này.

## 7.6 Mobile Guardrail 6 – Completion must feel real

Sau một update hay completion action, người dùng mobile phải thấy ngay hệ thống đã ghi nhận và item không còn nằm “lưng chừng” trong đầu họ nữa.

## 8. Guardrails cho action design

## 8.1 Hành động phải nói bằng động từ có hậu quả rõ

Labels như Approve, Assign, Mark Blocked, Request Info, Complete, Reassign thường tốt hơn các labels mơ hồ như Update, Submit, Process hoặc Continue khi nghĩa chưa rõ.

## 8.2 Hành động chính và phụ phải tách vai

Nếu hành động có rủi ro cao ngang hàng trực quan với hành động an toàn hoặc thường dùng, người dùng dễ nhầm. Visual hierarchy phải phản ánh risk và frequency.

## 8.3 Hành động không khả dụng phải giải thích được

Khi một action bị disable hoặc chưa thể thực hiện, UX nên giúp người dùng biết vì sao: thiếu info, thiếu quyền, sai state hoặc cần bước trước đó.

## 8.4 Hành động bulk phải có guardrails cao hơn

Bulk actions tiết kiệm thời gian nhưng tăng rủi ro mạnh. Chúng phải có scope visibility, selection clarity và outcome preview đủ tốt.

## 9. Guardrails cho confirmation, success và failure states

## 9.1 Chỉ xác nhận khi có rủi ro hoặc khó đảo ngược

Không nên tạo confirm modals cho mọi click chỉ vì thói quen. Nhưng với các actions như reject, override, cancel, bulk changes hoặc reassignment nhạy cảm, confirmation hợp lý có giá trị thật.

## 9.2 Success feedback phải gắn với trạng thái mới

Thay vì chỉ “Success”, feedback nên nói item đã chuyển sang đâu, ai giữ tiếp theo hoặc nó đã rời queue nào. Điều này bám sát tinh thần operating-system UX.

## 9.3 Failure feedback phải gắn với recovery path

Lỗi tốt không chỉ nói “không thành công”, mà còn cho biết cần làm gì tiếp: thêm dữ liệu, refresh context, kiểm tra quyền, quay lại step trước hoặc retry sau.

## 9.4 Đừng làm mất dữ liệu khi lỗi xảy ra

Đặc biệt với input, notes, evidence hoặc review actions, hệ thống phải tránh khiến người dùng mất công nhập chỉ vì một lỗi tạm thời hoặc timeout.

## 10. Guardrails cho empty states, loading states và waiting states

## 10.1 Empty states phải giải thích được emptiness

Một màn hình trống nên cho biết là không có item, do filter hiện tại, do chưa có dữ liệu, hay do chưa được giao việc. Trống nhưng không giải thích sẽ gây hoang mang.

## 10.2 Loading states phải giữ cảm giác continuity

Loading nên giúp người dùng hiểu hệ thống đang phản hồi, không khiến họ nghĩ ứng dụng đơ hoặc action đã mất.

## 10.3 Waiting states phải mang direction

Nếu item đang waiting, UX nên cố cho biết đang chờ gì hoặc chờ ai. Waiting vô hướng thường dẫn tới follow-up ngoài hệ thống.

## 11. Guardrails cho wording và microcopy

## 11.1 Nói ngôn ngữ công việc, không nói ngôn ngữ kỹ thuật

Wording nên giúp SME users hiểu bằng tư duy vận hành thực tế, không ép họ học vocabulary nội bộ của đội sản phẩm.

## 11.2 Câu ngắn, nghĩa rõ, tránh “corporate fog”

Những câu như “Your request has been successfully processed” thường kém hữu ích hơn “Assigned to Branch A queue” hoặc “Waiting for manager approval”.

## 11.3 Microcopy phải giúp quyết định, không chỉ giải thích hệ thống

Text tốt không chỉ mô tả; nó giúp người dùng biết nên làm gì hoặc hiểu vì sao mình chưa làm được.

## 12. Guardrails cho hierarchy và density

## 12.1 Quan trọng nhất phải thấy trước tiên

Trạng thái chính, hành động chính, tín hiệu urgency hoặc blocker không được chìm sau metadata phụ, chart phụ hoặc details ít dùng.

## 12.2 Không phải mọi thông tin đều xứng đáng có cùng trọng lượng

Một trong những lỗi phổ biến nhất của admin UX là cho mọi field và mọi badge sức nặng ngang nhau. Hierarchy phải phản ánh giá trị vận hành của thông tin.

## 12.3 Density chỉ tốt khi scan được

Một màn hình dày đặc chỉ có giá trị nếu người dùng vẫn quét được nhanh. Nếu density phá scanability, nó đang làm hại control UX.

## 13. Guardrails cho exception-first usability

## 13.1 Mọi flow quan trọng phải có nhánh blocked rõ

Nếu một item không thể đi tiếp, hệ thống phải có cách biểu đạt và xử lý điều đó ngay trong flow chứ không đẩy ra ngoài.

## 13.2 Missing info phải được thiết kế như scenario thật

Thiếu thông tin không phải edge case hiếm. Với SMEs, đây là tình huống rất thường xuyên. UX phải coi nó là scenario chính đáng.

## 13.3 Approval-needed phải không bị che mờ

Khi item đang chờ quyết định, người tạo hoặc người xử lý tiếp theo phải hiểu ngay mình đang chờ gì và vì sao.

## 13.4 Recovery path phải gần problem state

Người dùng không nên thấy vấn đề ở một nơi rồi phải tự đi tìm nơi khác để sửa. Càng gần problem state, recovery càng có cơ hội được dùng đúng.

## 14. Guardrails cho traceability và trust

## 14.1 Người dùng phải tra được chuyện vừa xảy ra

Đặc biệt với approvals, reassignments, exception marking và completion, history hoặc narrative gần phải đủ rõ để người dùng không cần hỏi miệng.

## 14.2 Traceability phải đọc được

Raw logs không đủ. UX phải giúp history được đọc như một câu chuyện vận hành ngắn gọn nhưng đáng tin.

## 14.3 Trust không đến từ “nhiều dữ liệu”, mà từ “đúng dữ liệu ở đúng chỗ”

Một giao diện nhồi đầy audit metadata nhưng đặt sai chỗ vẫn không tạo trust. Trust đến khi người dùng thấy đúng bằng chứng đúng lúc họ cần quyết định hoặc kiểm tra.

## 15. Anti-patterns UX nghiêm trọng phải tránh

## 15.1 Cosmetic clarity, operational confusion

UI nhìn đẹp, gọn, hiện đại nhưng người dùng không biết item đang ở đâu, chờ ai, hoặc làm gì tiếp theo.

## 15.2 Surface collapse

Web Admin và Mobile Ops dần giống nhau về logic, khiến cả hai cùng làm dở việc của mình.

## 15.3 Feature-led interaction sprawl

Mỗi capability mới kéo theo các interaction patterns mới không cùng grammar, làm hệ thống trở nên rời rạc và khó học.

## 15.4 Generic success / generic error syndrome

Mọi feedback đều na ná nhau, không nói outcome thật, khiến người dùng không tin hệ thống.

## 15.5 Settings gravity and configuration drift

Mọi khác biệt khách hàng hoặc mọi logic chưa rõ bị đẩy vào settings, làm UX mất focus và product mất shape.

## 15.6 Chat fallback by design failure

Thiết kế quá nặng, quá mơ hồ hoặc quá nhiều bước khiến người dùng hợp lý hóa việc quay lại chat để xử lý nhanh hơn.

## 16. Cách dùng guardrails trong review process

## 16.1 Trong design review

Mỗi màn hình, flow hoặc component mới nên được review qua các câu hỏi:
- nó giúp rõ điều gì hơn;  
- nó phục vụ persona nào;  
- nó làm flow nhanh hơn hay chậm hơn;  
- nó có làm state/action/ownership/exception rõ hơn không;  
- và nó có vô tình phá surface logic không.

## 16.2 Trong product review

Khi thêm capability mới, team product nên kiểm tra xem capability đó đòi UX pattern mới thật hay có thể map vào grammar hiện có. Không nên tạo pattern mới chỉ vì capability mới nghe có vẻ khác.

## 16.3 Trong frontend review

Khi implement, team frontend phải kiểm tra:
- interaction có còn đúng hierarchy không;  
- feedback có đủ outcome specificity không;  
- disabled states có giải thích được không;  
- context có bị mất khi drill-down hoặc quay lại không.

## 16.4 Trong QA review

QA không chỉ test chức năng chạy hay không. QA nên test xem người dùng có hiểu sai state, hiểu sai next step hoặc mất orientation không.

## 17. Cái gì linh hoạt và cái gì non-negotiable

## 17.1 Linh hoạt

Những thứ có thể thay đổi theo bối cảnh hoặc học hỏi từ pilot gồm:
- layout chi tiết;  
- mức độ compact của một số views;  
- từ ngữ helper ở các context cụ thể;  
- sequence phụ của vài interactions tần suất thấp.

## 17.2 Non-negotiable

Những thứ không được vi phạm gồm:
- distinction giữa control surface và execution surface;  
- clarity của state/action/ownership/exception;  
- boundary giữa UX presentation và business truth;  
- approval/exception như first-class concerns;  
- feedback outcome rõ sau actions quan trọng.

## 18. Guardrail checklist rút gọn cho team hằng ngày

Đây là phiên bản ngắn để dùng nhanh trong mọi quyết định UX:

1. **Thiết kế này giúp ai làm việc rõ hơn?**  
2. **Nó làm bước tiếp theo rõ hơn không?**  
3. **Nó có giữ đúng vai trò của surface không?**  
4. **Nó có làm state và ownership rõ hơn không?**  
5. **Nó có xử lý được blocked/approval/exception moments không?**  
6. **Nó có giảm chat fallback hay lại làm chat fallback hấp dẫn hơn?**  
7. **Nó có đòi logic UI mà core product chưa sở hữu rõ không?**  
8. **Nó có bám launch slice thay vì trượt sang future scope không?**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên tiếp tục theo chuỗi logic sau:

1. **28_MOBILE_OPS_SCREEN_TAXONOMY.md** – taxonomy màn hình Mobile Ops.  
2. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – patterns cho nhập liệu, note, proof và exception capture.  
3. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – landing strategies và default views theo persona.  
4. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho các Web Admin screen families.  
5. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.  
6. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, error states và recovery messaging.  
7. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – checklist review và governance mechanism cho toàn Pack 03.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Pack 03:

1. Pack 03 phải vận hành theo một bộ **UX guardrails chính thức**, không chỉ theo taste cá nhân của từng designer hoặc từng sprint.  
2. Mọi quyết định UX phải làm tăng operational clarity, flow discipline và role-fit usability.  
3. Web Admin phải tối ưu cho triage, drill-down, decision context và control clarity.  
4. Mobile Ops phải tối ưu cho speed-to-action, low-friction execution và structured update behavior.  
5. Exceptions, approvals, blocked states và recovery paths là first-class UX concerns.  
6. Feedback sau actions phải cụ thể về outcome, không chung chung.  
7. Guardrails này là cơ sở để review mọi flows, screens, components, microcopy và implementation behavior về sau.

## 21. Điều kiện hoàn thành của tài liệu

UX Guardrails and Interaction Principles được xem là đạt yêu cầu khi:
- team Product, UX, Frontend và QA có cùng bộ luật nền để đánh giá chất lượng trải nghiệm;  
- các decisions về screen, flow và component không còn phụ thuộc quá nhiều vào preference cá nhân;  
- những non-negotiables của Pack 03 đã đủ rõ để chặn scope drift;  
- và các tài liệu taxonomy, wireframe, component, messaging về sau có thể kế thừa guardrails này như baseline bắt buộc.

## AG Execution Prompt

You are acting as a senior UX systems strategist, interaction-principles architect, and design-governance designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: multi-surface experience system, Web Admin as control surface, Mobile Ops as execution surface, user flows and state grammar already defined.
- This document defines the official UX guardrails and interaction principles for downstream design and implementation.

### Objective
Refine this UX Guardrails and Interaction Principles document into a production-grade design-governance baseline that can guide screens, flows, components, microcopy, frontend behavior, QA heuristics, and design review decisions.

### Inputs
- Use this document plus Experience Strategy Overview, Web Admin Experience Strategy, Mobile Ops Experience Strategy, IA/Navigation Model, Web Admin Screen Taxonomy, First Wedge User Flows, and State and Status Presentation Rules as the primary source of truth.
- Preserve the control-versus-execution distinction and the wedge-first launch logic.
- Keep the output concrete enough for real design governance and implementation review.

### Tasks
1. Rewrite the guardrail thesis into a sharper executive form.
2. Produce a guardrail register with scope, rationale, and implications for Web Admin and Mobile Ops.
3. Add an interaction-principles model for actions, confirmations, feedback, errors, recovery, and orientation.
4. Define which guardrails are flexible and which are non-negotiable.
5. Identify the top five UX drift risks that would damage Pack 03 coherence.
6. Recommend the next documents that should operationalize these guardrails into screen blueprints, component rules, and review checklists.
7. Add a practical review checklist for design, product, frontend, and QA teams.

### Constraints
- Do not reduce guardrails to generic UX advice.  
- Do not blur the distinction between Web Admin and Mobile Ops roles.  
- Do not allow UI convenience to override product-boundary discipline.  
- Do not ignore exception-heavy operational realities.  
- Keep the output specific enough for downstream execution.

### Output Format
Return a revised markdown document with these sections:
1. Executive Guardrail Thesis
2. Guardrail Register
3. Interaction Principles Model
4. Flexible vs Non-Negotiable Rules
5. Drift Risks
6. Practical Review Checklist
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make UX guardrails explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams review design decisions consistently across Pack 03.
- The output must reduce interaction drift, surface collapse, weak feedback, and exception-blind design.
