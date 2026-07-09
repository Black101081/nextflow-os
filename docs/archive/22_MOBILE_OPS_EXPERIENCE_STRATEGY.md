# Nextflow OS – Mobile Ops Experience Strategy

**Document ID:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Strategy / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Design System, Deployment & Support  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 13_FIRST_WEDGE_CAPABILITY_SLICE, 12_ENGINE_BOUNDARY_SPECIFICATION

## 1. Mục tiêu tài liệu

Tài liệu này xác định **chiến lược trải nghiệm riêng cho Mobile Ops / PWA**, surface ưu tiên số 2 nhưng có vai trò sống còn đối với adoption thật của Nextflow OS trong wedge đầu tiên. Nếu Web Admin là control surface trung tâm cho decision và coordination personas, thì Mobile Ops là nơi operating model được kiểm chứng trong thực tế hằng ngày: người xử lý việc có thật sự mở hệ thống lên không, họ có biết phải làm gì ngay không, họ có cập nhật trạng thái đúng cách không, và họ có cảm thấy sản phẩm giúp công việc trôi hơn thay vì cản trở hơn không.

Nói ngắn gọn:

> **Mobile Ops phải biến Nextflow OS từ một hệ thống “quản lý được nhìn từ phía quản lý” thành một hệ thống “được dùng thật bởi người đang làm việc”.**

Đây là tài liệu cực kỳ quan trọng vì rất nhiều sản phẩm vận hành thất bại không phải do thiếu dashboard, mà vì execution surface quá nặng, quá chậm, quá nhiều field, quá giống web admin thu nhỏ, hoặc quá mơ hồ trong bối cảnh thao tác nhanh. Khi điều đó xảy ra, người quản lý có thể thích sản phẩm nhưng frontline sẽ né sản phẩm, và operating model sẽ gãy ở mắt xích quan trọng nhất.

Tài liệu này phải khóa chín thứ:
1. Vai trò chính thức của Mobile Ops trong product system.  
2. Personas nào Mobile Ops phục vụ trước.  
3. Outcomes trải nghiệm bắt buộc mà Mobile Ops phải tạo ra.  
4. Các vùng trải nghiệm cốt lõi của Mobile Ops.  
5. Interaction model cho task execution và quick updates.  
6. Cách Mobile Ops biểu đạt state, urgency, exceptions và evidence.  
7. Những gì Mobile Ops tuyệt đối không được trở thành.  
8. Ranh giới giữa execution UX và business-truth ownership.  
9. Các tài liệu UX tiếp theo cần đi sâu từ baseline này.

## 2. Vai trò chính thức của Mobile Ops

Trong Nextflow OS, Mobile Ops / PWA là **execution surface**. Đây là bề mặt phục vụ cho những người không ngồi lâu trước bàn làm việc, không muốn bơi trong dashboard dày đặc, và cần hoàn thành hành động nhanh trong ngữ cảnh đang bận, đang di chuyển hoặc đang ở điểm vận hành thực tế.

Có thể hiểu vai trò của Mobile Ops qua bốn lớp.

### 2.1 Task surface

Mobile Ops là nơi người dùng thấy ngay việc nào thuộc về mình hoặc đội mình. Nó phải tạo cảm giác “đây là thứ tôi cần làm bây giờ”, không phải “đây là một phần nhỏ của hệ thống lớn mà tôi phải học”.

### 2.2 Action surface

Đây là nơi người dùng cập nhật tiến trình, xác nhận thao tác, thêm note, thêm evidence hoặc báo ngoại lệ. Vì vậy trọng tâm của Mobile Ops không phải là đọc nhiều, mà là **hành động đúng với ma sát thấp**.

### 2.3 Context-light surface

Mobile Ops phải cho người dùng đủ ngữ cảnh để hành động đúng, nhưng không nên ép họ xem toàn bộ complexity của record, policy và history trừ khi thực sự cần. Nó phải chọn lọc thông tin để giúp người dùng ra thao tác đúng trong vài giây.

### 2.4 Discipline surface

Dù gọn và nhanh, Mobile Ops vẫn phải kéo hành vi tác nghiệp vào trong hệ thống có cấu trúc. Nghĩa là nó không chỉ nhanh; nó phải nhanh theo cách giúp record, status, evidence, exceptions và approvals được ghi nhận đúng thay vì chảy ra ngoài chat.

## 3. Mobile Ops phục vụ ai

Mobile Ops không phải surface cho tất cả người dùng. Nó tập trung trước tiên vào execution personas và một phần coordination personas ở ngữ cảnh nhanh.

## 3.1 Persona family A – Execution personas

### Bao gồm
- Frontline operator  
- Branch staff  
- Warehouse or floor staff ở các use case phù hợp  
- Service/field-like users nếu wedge mở rộng sau này

### Họ đến Mobile Ops để làm gì
- Xem việc được giao.  
- Biết việc nào urgent.  
- Mở item và cập nhật nhanh.  
- Ghi note hoặc bằng chứng.  
- Đánh dấu xong/chưa xong/chờ xử lý.  
- Báo ngoại lệ hoặc xin duyệt khi cần.

### Họ không muốn gì
- Không muốn phải học quá nhiều navigation.  
- Không muốn điền quá nhiều form.  
- Không muốn nhìn những thông tin không liên quan trực tiếp tới việc đang làm.  
- Không muốn chờ lâu để update một thay đổi nhỏ.

## 3.2 Persona family B – Mobile coordination moments

### Bao gồm
- Branch supervisor  
- Team lead  
- Người điều phối cần xử lý nhanh trong lúc đang di chuyển hoặc không ngồi trước desktop

### Họ đến Mobile Ops để làm gì
- Xem team workload nhanh.  
- Kiểm tra item gấp.  
- Chuyển/nhắc/đánh dấu lại một số việc.  
- Duyệt hoặc xác nhận những hành động nhẹ nếu flow cho phép.

### Giới hạn
Mobile Ops có thể hỗ trợ một phần coordination nhẹ, nhưng không nên cố thay Web Admin trong các tình huống triage sâu, reporting dày, import, configuration hay phân tích nhiều chiều.

## 4. Mobile Ops không phục vụ trực tiếp ai

Mobile Ops không nên được thiết kế như surface chính cho:
- founder/owner cần control dashboard toàn cục;  
- back office power users cần triage backlog sâu;  
- partner làm rollout;  
- customer self-service;  
- hoặc team setup/import cần xử lý dữ liệu phức tạp.

Nếu cố ép tất cả các hành vi đó vào mobile, surface sẽ mất tính gọn và mất bản sắc execution.

## 5. Experience thesis riêng cho Mobile Ops

Experience thesis cho Mobile Ops có thể phát biểu như sau:

> **Mobile Ops phải giúp người đang làm việc biết ngay điều gì cần làm, hành động nhanh với ít suy nghĩ không cần thiết, và ghi lại trạng thái công việc theo cách đủ có cấu trúc để hệ thống giữ được operational truth.**

Từ thesis này, năm yêu cầu cốt lõi được suy ra:

1. Mobile Ops phải ưu tiên **speed-to-action** trước information breadth.  
2. Mobile Ops phải ưu tiên **clarity of next step** trước menu richness.  
3. Mobile Ops phải ưu tiên **task completion confidence** trước admin flexibility.  
4. Mobile Ops phải ưu tiên **minimum sufficient context** trước detail overload.  
5. Mobile Ops phải ưu tiên **structured execution** trước free-form note-taking đơn thuần.

## 6. Outcomes bắt buộc của Mobile Ops trong wedge đầu tiên

Ở wedge retail / light distribution, Mobile Ops phải đạt ít nhất sáu outcomes trải nghiệm. Nếu thiếu những outcomes này, launch slice sẽ thiếu sức sống ở tầng execution.

## 6.1 Outcome 1 – Biết ngay việc gì cần làm

Khi người dùng mở Mobile Ops, họ phải thấy ngay:
- việc nào được giao cho mình;  
- việc nào thuộc team mình nếu vai trò cho phép;  
- mức độ urgent;  
- item nào đang chờ hành động;  
- và item nào có vấn đề đặc biệt.

Không nên để người dùng vào mobile app rồi vẫn phải tự lần mò xem “bắt đầu ở đâu”.

## 6.2 Outcome 2 – Cập nhật tiến trình trong vài thao tác

Một thay đổi phổ biến như nhận việc, bắt đầu xử lý, đánh dấu hoàn tất, thêm ghi chú hoặc báo chờ thông tin phải thực hiện được nhanh. Nếu một thao tác ngắn biến thành một mini-form nhiều bước, người dùng sẽ bỏ qua hệ thống.

## 6.3 Outcome 3 – Hiểu đủ để hành động đúng

Người dùng không cần mọi chi tiết, nhưng cần đủ ngữ cảnh như: item này là gì, thuộc branch/site nào, trạng thái hiện tại là gì, việc mình cần làm là gì, có deadline/urgency không, và có vướng ngoại lệ không.

## 6.4 Outcome 4 – Báo ngoại lệ mà không rời flow

Khi gặp vấn đề như thiếu hàng, thiếu thông tin, chờ xác nhận, cần duyệt hoặc không thể tiếp tục, người dùng phải có cách đánh dấu ngoại lệ rõ ràng trong flow hiện tại thay vì bỏ app ra chat riêng.

## 6.5 Outcome 5 – Ghi evidence hoặc note đủ nhanh để làm thật

Nếu sản phẩm yêu cầu evidence, ảnh, xác nhận, note hay comment, việc đó phải đủ nhẹ để người dùng sẵn sàng làm trong thực tế. Nếu evidence capture nặng hoặc rối, data quality sẽ giảm rất nhanh.

## 6.6 Outcome 6 – Cảm thấy app giúp mình, không làm phiền mình

Đây là outcome khó đo nhưng cực quan trọng. Mobile Ops phải tạo cảm giác “việc của tôi rõ hơn, nhanh hơn, ít nhầm hơn”, chứ không tạo cảm giác “thêm một app để báo cáo cho quản lý”.

## 7. Mô hình trải nghiệm cốt lõi của Mobile Ops

Mobile Ops nên được tổ chức quanh bốn vùng trải nghiệm chính. Đây là cấu trúc chiến lược, không chỉ là screen grouping.

## 7.1 My Work / Team Work layer

### Vai trò
Đây là điểm vào chính của Mobile Ops. Nó trả lời câu hỏi: “Hôm nay tôi hoặc đội tôi cần làm gì?”

### Nội dung nên có
- My tasks.  
- Team tasks nếu role phù hợp.  
- Urgent items.  
- Waiting or blocked markers ở mức dễ hiểu.  
- Basic grouping theo today / overdue / pending / in-progress hoặc logic tương tự.

### Điều không nên làm
- Không hiển thị quá nhiều tabs và sub-tabs khó nhớ.  
- Không bắt người dùng tự dựng priority từ danh sách phẳng dài.  
- Không nhồi thông tin quản trị sâu không liên quan đến execution.

## 7.2 Task / Item action layer

### Vai trò
Đây là nơi người dùng mở một item cụ thể để hành động. Nó phải là trung tâm của speed and clarity.

### Nội dung nên có
- Tên/định danh item rõ.  
- Trạng thái hiện tại.  
- Điều gì cần làm tiếp.  
- Các quick actions phù hợp.  
- Notes / evidence entrypoints.  
- Minimal context cần thiết để tránh thao tác sai.

### Điều không nên làm
- Không biến nó thành record detail web thu nhỏ.  
- Không bắt cuộn dài để tìm action quan trọng.  
- Không đưa quá nhiều options ngang hàng khiến người dùng chần chừ.

## 7.3 Update / Evidence / Exception layer

### Vai trò
Đây là lớp ghi nhận hành động thực tế: update status, add note, add proof, mark blocked, request approval, needs-info hoặc tương tự.

### Nội dung nên có
- Quick status actions.  
- Short note flows.  
- Evidence capture entry.  
- Exception flags.  
- Confirmation states rõ ràng sau khi submit.

### Điều không nên làm
- Không yêu cầu quá nhiều typing nếu có thể chọn nhanh.  
- Không đặt người dùng vào flow modal chồng chéo khó thoát.  
- Không bắt upload bằng chứng theo cách làm gián đoạn thao tác chính quá mạnh.

## 7.4 Light status context layer

### Vai trò
Đây là lớp giúp người dùng biết item đang ở đâu trong flow mà không cần đi sâu vào full history.

### Nội dung nên có
- Current status.  
- Simple progression sense.  
- Nếu blocked thì blocked vì gì.  
- Nếu chờ duyệt thì chờ ai hoặc chờ loại quyết định nào ở mức tối thiểu.  
- Nếu overdue thì overdue như thế nào.

### Điều không nên làm
- Không biến mobile thành audit explorer.  
- Không hiển thị quá nhiều history events khiến thông tin chính bị loãng.

## 8. Interaction model cho Mobile Ops

Mobile Ops phải được thiết kế quanh **micro-interactions có giá trị nghiệp vụ**. Người dùng không mở surface này để khám phá hệ thống; họ mở nó để hoàn tất việc.

## 8.1 Principle 1 – Open fast, act fast, exit clean

Người dùng nên có thể mở app, thấy item cần làm, hoàn tất thao tác và rời app trong thời gian rất ngắn nếu cần. Interaction model phải tôn trọng nhịp làm việc thực địa.

## 8.2 Principle 2 – One primary action per moment

Ở mỗi màn hình hoặc mỗi trạng thái, nên có một hành động chính nổi bật hơn rõ. Điều này giảm chần chừ và giảm lỗi thao tác.

## 8.3 Principle 3 – Secondary detail should stay secondary

Các chi tiết bổ sung nên có sẵn nhưng không lấn át action zone. Nếu mọi thứ đều lớn như nhau, người dùng sẽ không biết điều gì quan trọng nhất.

## 8.4 Principle 4 – System feedback must be immediate

Sau mỗi update, app phải phản hồi rõ: đã ghi nhận chưa, trạng thái mới là gì, có gì tiếp theo không. Mobile UX thiếu feedback rõ sẽ tạo cảm giác “bấm rồi mà không biết có ăn hay không”.

## 8.5 Principle 5 – Exception reporting should be native to the flow

Người dùng không nên phải rời khỏi thao tác chính để báo ngoại lệ. Nếu một item bị thiếu info hoặc cần duyệt, flow đó phải được nhúng tự nhiên trong cùng bối cảnh.

## 9. Information hierarchy của Mobile Ops

Hierarchy trong mobile phải mạnh hơn web vì màn hình nhỏ và attention span ngắn hơn.

## 9.1 Tầng 1 – Immediate action signal

Thông tin cấp đầu phải trả lời:
- tôi cần làm gì ngay;  
- việc nào khẩn;  
- việc nào đang chờ tôi;  
- và có gì ngăn tôi hoàn tất không.

## 9.2 Tầng 2 – Minimal task context

Sau tín hiệu hành động, người dùng cần biết item là gì, ở đâu, trạng thái nào, có lưu ý gì quan trọng.

## 9.3 Tầng 3 – Supporting detail

Notes gần nhất, bằng chứng đã có, lịch sử ngắn gọn hoặc context bổ sung chỉ nên xuất hiện khi giúp người dùng tránh lỗi hoặc hiểu ngoại lệ.

## 9.4 Tầng 4 – Rare detail

Thông tin sâu hơn có thể tồn tại nhưng không được chen lên trước những gì phục vụ completion.

## 10. State strategy trong Mobile Ops

State representation trong mobile phải cực kỳ rõ, ngắn và có tính hành động.

## 10.1 Current state phải luôn nhìn thấy được

Người dùng không nên phải lục qua nhiều vùng để biết item hiện đang ở đâu trong flow.

## 10.2 Mobile Ops phải phân biệt “tình trạng item” và “việc tôi cần làm”

Đây là điểm UX quan trọng. Một item có thể ở trạng thái pending approval, nhưng việc của tôi là bổ sung thông tin hoặc chờ. Mobile phải làm rõ điều này, không trộn tất cả thành một label chung chung.

## 10.3 Urgency phải nổi bật hơn metadata

Nếu item gấp, blocked hoặc overdue, những tín hiệu này phải được làm nổi hơn các chi tiết phụ như mã dài, timestamps nhỏ lẻ hoặc dữ liệu ít liên quan.

## 10.4 State changes phải tạo ra cảm giác tiến triển

Khi người dùng cập nhật xong, app nên làm rõ item đã chuyển sang đâu hoặc biến khỏi queue hiện tại như thế nào. Điều này tạo cảm giác hoàn thành và tăng niềm tin rằng thao tác vừa rồi có ý nghĩa.

## 11. Exception-handling strategy trong Mobile Ops

Ngoại lệ trong execution layer phải được đối xử nghiêm túc, nhưng theo cách nhẹ và trực quan.

## 11.1 Exceptions phải được báo bằng ngôn ngữ hành động

Thay vì phơi ra các cấu trúc policy phức tạp, Mobile Ops nên biểu đạt theo kiểu:
- cần duyệt;  
- thiếu thông tin;  
- không thể tiếp tục;  
- cần xác nhận thêm;  
- chờ phản hồi.

Ngôn ngữ phải giúp người dùng biết nên làm gì tiếp theo.

## 11.2 Exception actions phải ngắn

Một flow báo blocked hoặc request approval không nên dài gần bằng xử lý item chính. Nếu quá nặng, người dùng sẽ bỏ qua hoặc xử lý ngoài hệ thống.

## 11.3 Mobile Ops phải tránh over-explaining policy

Người thực thi cần biết hành động tiếp theo, không cần đọc policy như manager. App nên tóm đủ lý do, nhưng không bắt người dùng tiêu hóa cấu trúc rule phức tạp trên màn hình nhỏ.

## 12. Evidence và note strategy

Evidence và note là phần vừa quan trọng vừa dễ gây ma sát nhất trong execution UX.

## 12.1 Chỉ yêu cầu evidence khi nó thực sự có giá trị

Nếu mọi hành động đều đòi proof mà không rõ lý do, người dùng sẽ coi đó là gánh nặng báo cáo.

## 12.2 Evidence capture phải nhẹ

Nếu cần ảnh, file hoặc xác nhận, luồng thêm evidence phải trực tiếp, ít bước và gắn sát với task đang làm.

## 12.3 Notes nên có cấu trúc vừa đủ

Free text hoàn toàn giúp nhanh nhưng khó dùng lại; cấu trúc quá chặt thì khó nhập. Mobile Ops nên ưu tiên short structured notes hoặc prompts đủ nhẹ khi cần.

## 12.4 Evidence và note phải phục vụ flow sau đó

Người dùng sẽ chấp nhận ghi nhận nhiều hơn nếu họ thấy note/proof giúp approval nhanh hơn, giúp tránh bị hỏi lại hoặc giúp manager hiểu tình trạng đúng hơn.

## 13. Offline, latency và device reality

Vì Mobile Ops sống trong bối cảnh thực tế, experience strategy phải thừa nhận device reality thay vì giả định điều kiện hoàn hảo.

## 13.1 App phải chịu được attention fragmentation

Người dùng có thể đang bận, bị gián đoạn, mở app rất ngắn rồi thoát. Vì vậy flow phải resume được dễ và không phụ thuộc vào trí nhớ dài.

## 13.2 Latency tolerance phải được xử lý bằng feedback tốt

Ngay cả khi chưa làm offline sâu, app vẫn phải cho feedback loading, success, retry hoặc pending states đủ rõ để người dùng không tưởng là thao tác đã mất.

## 13.3 PWA logic phải ưu tiên access và speed

Nếu triển khai qua PWA, experience phải ưu tiên mở nhanh, đăng nhập thuận tiện, điều hướng gọn và không tạo cảm giác như “một web admin nhét vào điện thoại”.

## 14. Search, filtering và workload strategy cho Mobile Ops

Mobile không nên cố có full search/filter breadth như web, nhưng vẫn phải hỗ trợ workload navigation đủ tốt.

## 14.1 Default views phải mạnh

Mobile thành công nhờ default views tốt hơn là nhờ bộ lọc quá giàu. Người dùng nên mở app ra và thấy đúng những gì quan trọng nhất theo vai trò.

## 14.2 Filters phải cực ít nhưng cực hữu ích

Ví dụ phù hợp có thể là: my items, team items, urgent, blocked, waiting, overdue. Những filter dài và nested sẽ phá mobile usability.

## 14.3 Search nên thiên về item retrieval, không thay thế flow design

Nếu người dùng thường xuyên phải search để tìm việc mình nên làm, có nghĩa là lớp workload/default prioritization đang yếu.

## 15. Ranh giới với business truth

Mobile Ops là execution surface, không phải domain engine.

## 15.1 Mobile Ops được quyền làm gì

- Hiển thị task/workload views.  
- Hiển thị context tối thiểu để thao tác đúng.  
- Kích hoạt domain actions qua contracts rõ ràng.  
- Ghi local draft state tạm thời phục vụ usability.  
- Cung cấp confirmation, helper text, prompts, lightweight validation.

## 15.2 Mobile Ops không được làm gì

- Không sở hữu record lifecycle semantics.  
- Không sở hữu approval logic cốt lõi.  
- Không tự invent queue truth hoặc assignment truth.  
- Không update read models như write shortcuts.  
- Không tạo hidden transitions chỉ tồn tại ở app.

## 15.3 Hệ quả cho frontend và UX

Mỗi thao tác mobile cần map được về business action rõ. Nếu một interaction trông tiện nhưng không biết nó đi vào contract nào, đó là dấu hiệu boundary đang có vấn đề.

## 16. Những gì Mobile Ops tuyệt đối không được trở thành

## 16.1 Không phải Web Admin thu nhỏ

Đây là anti-pattern lớn nhất. Nếu chỉ copy web sang mobile, app sẽ quá nặng, quá dày thông tin và rất khó dùng trong bối cảnh thực.

## 16.2 Không phải chat app trá hình

Mobile Ops không nên trượt thành nơi chỉ note qua lại mà không cập nhật state hoặc structured action. Nếu không, product sẽ mất operational discipline.

## 16.3 Không phải reporting surface

Manager dashboards sâu, cross-branch analysis hoặc import status không nên trở thành trọng tâm của Mobile Ops.

## 16.4 Không phải form-heavy compliance tool

Nếu mọi update đều biến thành form dài, surface sẽ bị từ chối ngầm bởi frontline users.

## 16.5 Không phải nơi vá thiếu sót của core product

Khi backend chưa rõ, team rất dễ “làm cho xài được tạm trên mobile”. Đây là con đường nhanh nhất dẫn đến hidden logic và adoption decay.

## 17. Rủi ro UX lớn nhất của Mobile Ops

## 17.1 Rủi ro 1 – Too many taps for simple work

Một hành động nhỏ mà cần quá nhiều bước sẽ làm giảm adoption ngay.

## 17.2 Rủi ro 2 – Context too thin to act safely

Nếu chỉ tối giản mà không đủ ngữ cảnh, người dùng sẽ cập nhật sai hoặc sợ cập nhật.

## 17.3 Rủi ro 3 – Context too heavy to act quickly

Ngược lại, quá nhiều chi tiết cũng giết tốc độ và làm mất ý nghĩa execution surface.

## 17.4 Rủi ro 4 – Weak feedback after actions

Người dùng không chắc update đã thành công hay chưa là một nguồn gây distrust rất lớn.

## 17.5 Rủi ro 5 – Exceptions get pushed back to chat

Nếu báo ngoại lệ trong app khó hơn chat, người dùng sẽ quay lại thói quen cũ và structured execution sẽ gãy.

## 18. Design governance rules cho Mobile Ops

Mọi thiết kế Mobile Ops trong Pack 03 nên tuân theo các rules sau:

1. **Mỗi màn hình phải giúp người dùng hoàn thành một hành động thực tế nhanh hơn.**  
2. **Mỗi item phải làm rõ việc cần làm tiếp theo.**  
3. **Một trạng thái quan trọng phải biểu đạt được bằng từ ngữ ngắn, rõ và có hậu quả hành động.**  
4. **Không thêm chi tiết nếu nó không giúp completion, safety hoặc exception handling.**  
5. **Evidence/note flows phải đủ nhẹ để xảy ra trong đời thực.**  
6. **Default workload views quan trọng hơn filter complexity.**  
7. **Mọi action phải map về domain contract rõ ràng.**  
8. **Không mirror Web Admin như chiến lược thiết kế chính.**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên tiếp tục theo chuỗi logic sau:

1. **23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL.md** – IA tổng thể và navigation xuyên surfaces.  
2. **24_WEB_ADMIN_SCREEN_TAXONOMY.md** – taxonomy màn hình Web Admin.  
3. **25_FIRST_WEDGE_USER_FLOWS.md** – flow người dùng launch-critical cho web và mobile.  
4. **26_STATE_AND_STATUS_PRESENTATION_RULES.md** – quy tắc biểu đạt trạng thái, urgency, blocked, approval, waiting, overdue.  
5. **27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES.md** – interaction laws và governance rules xuyên Pack 03.  
6. **28_MOBILE_OPS_SCREEN_TAXONOMY.md** – taxonomy màn hình riêng cho Mobile Ops.  
7. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – pattern nhập liệu nhanh, note, proof và exception capture.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền cho Mobile Ops như sau:

1. Mobile Ops / PWA là **execution surface** trung tâm của Nextflow OS.  
2. Mobile Ops phục vụ chủ yếu execution personas và một phần coordination moments nhẹ.  
3. Sáu outcomes launch-critical của Mobile Ops gồm: biết việc cần làm, cập nhật nhanh, hiểu đủ ngữ cảnh, báo ngoại lệ trong flow, ghi note/evidence đủ nhẹ và tạo cảm giác app giúp công việc.  
4. Mobile Ops phải được tổ chức quanh bốn vùng trải nghiệm: My Work/Team Work, Task/Item Action, Update/Evidence/Exception, Light Status Context.  
5. Mobile Ops phải ưu tiên speed-to-action, next-step clarity, minimum sufficient context và structured execution.  
6. Mobile Ops không được trở thành Web Admin thu nhỏ, chat app trá hình hoặc form-heavy compliance tool.  
7. Execution UX vẫn phải tôn trọng tuyệt đối business-truth ownership ở product core.

## 21. Điều kiện hoàn thành của tài liệu

Mobile Ops Experience Strategy được xem là đạt yêu cầu khi:
- team UX, Product và Engineering cùng hiểu Mobile Ops tồn tại để phục vụ loại hành vi nào;  
- ranh giới giữa execution surface và control surface đã rõ;  
- các vùng trải nghiệm chính đã đủ rõ để đi tiếp vào screen taxonomy và user flows;  
- và các rules về state, urgency, evidence và exception handling đã có định hướng thống nhất.

## AG Execution Prompt

You are acting as a senior mobile product designer, execution-surface strategist, and frontline-operating-model UX architect.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: multi-surface experience system, Web Admin as control surface, Mobile Ops/PWA as launch-critical execution surface.
- This document defines the strategy for Mobile Ops specifically.

### Objective
Refine this Mobile Ops Experience Strategy into a production-grade execution-surface design baseline that can guide mobile/PWA IA, interaction design, task-flow design, evidence capture patterns, and frontend planning for the first wedge.

### Inputs
- Use this document plus Experience Strategy Overview, Web Admin Experience Strategy, First Wedge Capability Slice, and Engine Boundary Specification as the primary source of truth.
- Preserve the wedge-first scope and the distinction between control and execution surfaces.
- Keep the output practical for real frontline adoption, not generic mobile-app advice.

### Tasks
1. Rewrite the Mobile Ops thesis and outcome model into a sharper executive form.
2. Produce a persona-and-job matrix for execution moments and light coordination moments.
3. Add a view-layer map for My Work, Item Action, Update/Evidence/Exception, and Light Status Context.
4. Create a mobile action-context model showing what users must see before quick actions.
5. Define the top five design failures that would kill adoption for Mobile Ops.
6. Recommend the next documents that should operationalize this strategy into flows, screen taxonomy, and entry patterns.
7. Add governance rules that prevent Mobile Ops from becoming a mini web admin.

### Constraints
- Do not mirror Web Admin as the main design approach.  
- Do not overload mobile with deep admin complexity.  
- Do not let mobile UI own hidden business transitions.  
- Do not treat notes/chat-like behavior as a substitute for structured execution.  
- Keep the output concrete enough for downstream design execution.

### Output Format
Return a revised markdown document with these sections:
1. Executive Mobile Ops Thesis
2. Persona and Job Matrix
3. View-Layer Strategy
4. Action Context Model
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Mobile Ops strategy explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design Mobile Ops as a true execution surface.
- The output must reduce the risk of slow flows, overloaded screens, weak feedback, and chat-driven exception handling.
