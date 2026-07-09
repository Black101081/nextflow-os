# Nextflow OS – Experience Strategy Overview

**Document ID:** 20_EXPERIENCE_STRATEGY_OVERVIEW  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Strategy / Product Leadership  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Sales & Enablement, Deployment & Support  
**Prerequisite Documents:** 10_PRODUCT_OVERVIEW, 13_FIRST_WEDGE_CAPABILITY_SLICE, 15_PRODUCT_PACK_SUMMARY_AND_DECISION_LOG

## 1. Mục tiêu tài liệu

Tài liệu này mở đầu **Pack 03 – Experience & UX** và xác định chiến lược trải nghiệm tổng thể cho Nextflow OS. Nếu Pack 02 đã khóa bản chất sản phẩm, capability map, engine boundaries, first wedge slice và capability roadmap, thì tài liệu này trả lời câu hỏi tiếp theo có tính quyết định tới adoption và product-market fit thật sự:

> **Các capability của Nextflow OS phải được phân phối thành trải nghiệm như thế nào để từng nhóm người dùng có thể hiểu, dùng, tin và vận hành hệ thống một cách tự nhiên hơn so với cách làm cũ?**

Experience Strategy không chỉ là chuyện UI đẹp hay màn hình gọn. Với một SME Business OS, chiến lược trải nghiệm là nơi sản phẩm được chuyển hóa thành hành vi vận hành thực tế. Nếu chiến lược này sai, dù product architecture có đúng đến đâu, người dùng vẫn sẽ quay về chat, spreadsheet, nhắn miệng và xử lý ngoài hệ thống.

Tài liệu này phải khóa tám thứ:
1. Vai trò của UX trong Nextflow OS là gì.  
2. Tại sao Nextflow OS bắt buộc phải là **multi-surface experience system**.  
3. Mỗi surface tồn tại để phục vụ loại outcome nào.  
4. Những persona trung tâm nào phải được phục vụ trước.  
5. Trải nghiệm launch-critical của wedge đầu tiên phải xoay quanh kịch bản nào.  
6. Các nguyên tắc UX không được vi phạm trong toàn bộ hệ thống.  
7. Ranh giới giữa experience concerns và business-truth concerns.  
8. Các pack UX tiếp theo phải đi sâu theo logic nào.

## 2. Vai trò của Experience Strategy trong Nextflow OS

Đối với nhiều sản phẩm SaaS, UX có thể được xem là lớp trình bày phía trên logic hệ thống. Nhưng với Nextflow OS, điều đó chưa đủ. UX ở đây phải được xem là **cơ chế phân phối operating model**. Nói cách khác, sản phẩm không chỉ cần “màn hình dễ dùng”; nó cần những trải nghiệm khiến doanh nghiệp chuyển từ cách làm hỗn loạn sang cách làm có cấu trúc mà không thấy bị ép buộc quá mạnh hoặc quá khó học.

Experience Strategy trong Nextflow OS có bốn vai trò lớn:

### 2.1 Biến capability thành hành vi vận hành thật

Capability chỉ tạo ra giá trị khi người dùng có thể thực hiện công việc hằng ngày qua những surface phù hợp, hiểu đúng trạng thái, biết bước tiếp theo và nhận được phản hồi đủ rõ để tin vào hệ thống.

### 2.2 Giảm friction khi chuyển từ cách làm cũ sang cách làm mới

SME thường không chuyển đổi theo kiểu bài bản như enterprise. Họ chuyển dần, vá dần, vừa chạy vừa học. Vì vậy UX phải làm cho sự chuyển đổi đó bớt đau và bớt rối, chứ không thể đòi người dùng hiểu ngay toàn bộ product model.

### 2.3 Tạo đúng mức control cho đúng persona

Owner cần nhìn toàn cục. Ops manager cần điều phối. Branch supervisor cần nhìn queue và ngoại lệ. Operator cần thấy việc phải làm. Customer có thể chỉ cần trạng thái hoặc yêu cầu đơn giản. Partner có thể cần rollout visibility. Nếu mọi persona cùng nhìn một bề mặt giống nhau, sản phẩm sẽ thất bại.

### 2.4 Bảo vệ business truth bằng design discipline

UX đúng không chỉ làm dễ dùng hơn; nó còn giúp hạn chế việc người dùng và team nội bộ lén đẩy logic vào nơi sai. Khi surface được thiết kế đúng, business actions đi qua contracts đúng, trạng thái được hiển thị minh bạch và override được biểu đạt rõ, hệ thống sẽ ít bị kéo sang “xử lý tắt” hơn.

## 3. Product experience thesis

Experience thesis của Nextflow OS có thể phát biểu như sau:

> **Một SME Business OS chỉ được chấp nhận nếu nó phân phối đúng loại trải nghiệm cho đúng vai trò, ở đúng bối cảnh công việc, với đúng mức độ phức tạp — đủ mạnh để tạo control, nhưng đủ đơn giản để được dùng thật mỗi ngày.**

Từ thesis này, bốn kết luận UX được suy ra:

1. Trải nghiệm phải được tổ chức theo **vai trò và ngữ cảnh công việc**, không theo sơ đồ module nội bộ của đội sản phẩm.  
2. Hệ thống phải là **multi-surface**, vì không một surface nào có thể phục vụ đồng thời điều hành sâu và tác nghiệp nhanh.  
3. UX phải ưu tiên **flow clarity, state clarity, action clarity và exception clarity**, chứ không chỉ tối ưu thẩm mỹ hoặc density của giao diện.  
4. Một trải nghiệm tốt trong Nextflow OS phải làm cho người dùng thấy “tôi biết mình đang ở đâu, việc gì đang chờ, tôi được phép làm gì tiếp theo, và nếu lệch chuẩn thì hệ thống phản hồi thế nào”.

## 4. Tại sao Nextflow OS bắt buộc là multi-surface experience system

Một sai lầm lớn trong các sản phẩm quản trị là cố ép tất cả người dùng vào cùng một kiểu trải nghiệm, thường là một web dashboard phức tạp. Với Nextflow OS, điều này đặc biệt nguy hiểm vì sản phẩm phục vụ cả control needs lẫn execution needs.

### 4.1 Lý do thứ nhất – Người điều hành và người tác nghiệp có nhu cầu hoàn toàn khác nhau

- Founder/COO muốn nhìn pattern, backlog, branch performance, approvals và risk signals.  
- Ops manager muốn điều phối, lọc, xử lý ngoại lệ và đẩy flow đi tiếp.  
- Branch supervisor muốn thấy queue, pending items và việc đội mình đang giữ.  
- Operator chỉ muốn biết hôm nay mình phải làm gì, ưu tiên gì, update như thế nào, có cần chụp bằng chứng hay xin duyệt gì không.

Một surface duy nhất thường sẽ quá nặng với operator hoặc quá nông với manager.

### 4.2 Lý do thứ hai – Ngữ cảnh sử dụng thay đổi rất mạnh

Người dùng của Nextflow OS không phải lúc nào cũng ngồi bàn làm việc. Có người thao tác tại chi nhánh, tại quầy, tại kho, ngoài hiện trường hoặc đang di chuyển. Có người chỉ có vài chục giây để cập nhật trạng thái. Có người cần dành 30 phút để rà backlog hoặc approvals. Điều này đòi hỏi bề mặt trải nghiệm khác nhau, với density và interaction model khác nhau.

### 4.3 Lý do thứ ba – Sản phẩm cần tách control surface và execution surface

Control surface tập trung vào visibility, filters, exceptions, decisions và governance. Execution surface tập trung vào nhận việc, cập nhật việc, hoàn thành việc. Nếu hai thứ này bị trộn quá mạnh, UI sẽ vừa rối vừa không chuyên cho ai cả.

### 4.4 Lý do thứ tư – Multi-surface là điều kiện để template-driven delivery thực sự hiệu quả

Khi Nextflow OS đóng gói solution packs, hệ thống không chỉ đóng gói data models hoặc workflows, mà còn đóng gói cách các personas trải nghiệm flow đó trên các surfaces phù hợp. Điều này làm time-to-value cao hơn và giảm nhu cầu “thiết kế lại toàn bộ UI cho từng khách hàng”.

## 5. Bốn surfaces chính của Nextflow OS

Từ Product Pack, Nextflow OS đã chốt bốn surfaces lớn. Experience Strategy của Pack 03 phải xem đây là những bề mặt chính thức của hệ thống.

## 5.1 Web Admin

### Vai trò
Web Admin là **control center** của hệ thống. Đây là nơi phục vụ các personas như founder, owner, COO, operations manager, back office lead, admin và đôi khi branch manager ở mức quản lý.

### Mục tiêu trải nghiệm
- Nhìn được tình trạng vận hành tổng thể.  
- Quản lý records, queues, approvals và exceptions.  
- Theo dõi branch/site performance ở mức phù hợp.  
- Thực hiện các thao tác quản trị, import, cấu hình và review cần độ tập trung cao.

### Loại hành vi chính
- Xem dashboard và summary views.  
- Duyệt/từ chối/override.  
- Lọc backlog và pending items.  
- Mở record detail và audit/history.  
- Import dữ liệu hoặc rà lỗi dữ liệu cơ bản.  
- Theo dõi overdue, blocked, waiting states.

### Nguyên tắc thiết kế
- Ưu tiên clarity hơn visual novelty.  
- Dùng information hierarchy mạnh.  
- Cho phép filter và triage tốt.  
- Làm rõ actions có hậu quả nghiệp vụ.  
- Không biến Web Admin thành bảng điều khiển kỹ thuật nội bộ khó học.

## 5.2 Mobile Ops / PWA

### Vai trò
Mobile Ops / PWA là **execution surface** cho branch supervisor, frontline operator, field staff hoặc người dùng có hành vi tác nghiệp nhanh. Đây không phải Web Admin thu nhỏ; nó là surface có logic riêng.

### Mục tiêu trải nghiệm
- Giúp người dùng biết ngay việc gì cần làm.  
- Cho phép cập nhật trạng thái nhanh.  
- Hỗ trợ note, evidence, check-style actions hoặc request-for-approval tối thiểu.  
- Giảm ma sát khi đang ở bối cảnh bận, di chuyển hoặc ít thời gian.

### Loại hành vi chính
- Xem my tasks / team tasks.  
- Mở item cần xử lý.  
- Cập nhật trạng thái.  
- Thêm ghi chú, bằng chứng, xác nhận.  
- Đánh dấu ngoại lệ hoặc đẩy escalation đơn giản.  
- Xem những việc ưu tiên trong ngày/ca.

### Nguyên tắc thiết kế
- One-handed, low-friction, fast-completion.  
- Tối đa hóa action clarity.  
- Giảm số bước không cần thiết.  
- Hiển thị ít nhưng đúng.  
- Không ép người dùng đọc nhiều hoặc nhớ nhiều.

## 5.3 Customer Portal

### Vai trò
Customer Portal là **external-facing service surface**. Nó chưa phải launch-critical trong wedge đầu tiên, nhưng vẫn là một surface chính thức của product system về dài hạn.

### Mục tiêu trải nghiệm
- Cho phép self-service ở những scenario phù hợp.  
- Giảm gánh nặng vận hành nội bộ.  
- Tạo cảm giác minh bạch và chuyên nghiệp hơn cho khách hàng cuối hoặc đối tác ngoài.

### Loại hành vi chính
- Tạo yêu cầu hoặc theo dõi yêu cầu.  
- Xem trạng thái hoặc lịch.  
- Cung cấp thông tin bổ sung.  
- Nhận xác nhận hoặc thông báo.  
- Về sau có thể bao gồm booking, document access hoặc simple payment steps tùy wedge.

### Nguyên tắc thiết kế
- Clarity and trust first.  
- Không phơi lộ complexity nội bộ.  
- Tối ưu cho self-service chứ không copy logic của back office.  
- Hiển thị vừa đủ để khách hàng hiểu trạng thái của mình.

## 5.4 Partner Portal

### Vai trò
Partner Portal là **delivery and ecosystem surface** cho implementer, partner hoặc đội rollout. Nó không phải launch-critical của wedge đầu, nhưng là một phần có chủ đích trong experience system dài hạn.

### Mục tiêu trải nghiệm
- Hỗ trợ provisioning, template install, migration oversight, rollout tracking và support visibility.  
- Biến delivery model thành một trải nghiệm có cấu trúc, thay vì một chuỗi thao tác rời trong nội bộ.

### Loại hành vi chính
- Theo dõi tenant setup.  
- Xem trạng thái import/migration.  
- Kích hoạt hoặc gắn packs.  
- Theo dõi readiness checklist.  
- Quan sát support/release issues ở mức phù hợp vai trò.

### Nguyên tắc thiết kế
- Operational clarity hơn là marketing polish.  
- Làm lộ rõ checklist, trạng thái, blockers và next step.  
- Không để partner phải đi tìm thông tin qua nhiều công cụ ngoài hệ thống.

## 6. Persona model cho Experience Strategy

Experience Strategy của Nextflow OS phải dựa trên personas đã chốt ở Pack 01, nhưng diễn giải lại chúng theo logic dùng sản phẩm. Ở cấp UX, điều quan trọng không chỉ là họ là ai, mà là họ cần **nhìn thấy gì, quyết định gì, thao tác gì và trong ngữ cảnh nào**.

## 6.1 Decision persona

### Ai thuộc nhóm này
- Founder / Owner  
- COO / Head of Operations  
- Branch director hoặc area manager ở doanh nghiệp có nhiều điểm vận hành

### Họ cần gì từ trải nghiệm
- Nhìn được health của hệ vận hành.  
- Biết nghẽn nằm ở đâu.  
- Biết branch nào lệch chuẩn.  
- Biết approvals nào đang chặn luồng.  
- Biết hệ thống có thực sự giúp công ty chạy trật tự hơn không.

### Surface chính
- Web Admin.  
- Về sau có thể có executive mobile summary nhẹ, nhưng chưa phải launch priority.

## 6.2 Coordination persona

### Ai thuộc nhóm này
- Operations manager  
- Back office lead  
- Branch supervisor ở vai trò thiên điều phối hơn tác nghiệp

### Họ cần gì từ trải nghiệm
- Triage backlog.  
- Giao việc hoặc đổi owner.  
- Xử lý ngoại lệ.  
- Theo dõi approvals.  
- Biết item nào blocked, overdue hoặc thiếu thông tin.

### Surface chính
- Web Admin là chính.  
- Mobile Ops có thể bổ trợ trong một số tình huống nhanh.

## 6.3 Execution persona

### Ai thuộc nhóm này
- Frontline operator  
- Branch staff  
- Field or service staff nếu có

### Họ cần gì từ trải nghiệm
- Thấy việc cần làm ngay.  
- Ít phải suy nghĩ xem bước tiếp theo là gì.  
- Có thể cập nhật nhanh, rõ, ít lỗi.  
- Có chỗ thêm bằng chứng hoặc note khi thật sự cần.

### Surface chính
- Mobile Ops / PWA.  
- Trong một số use case có thể dùng Web nhẹ, nhưng không nên là mặc định.

## 6.4 External persona

### Ai thuộc nhóm này
- Khách hàng cuối  
- Người gửi yêu cầu  
- Đối tác ngoài hệ thống

### Họ cần gì từ trải nghiệm
- Trạng thái minh bạch.  
- Thao tác self-service đơn giản.  
- Cảm giác quy trình có trật tự, không phải “đã nhận, để kiểm tra lại”.

### Surface chính
- Customer Portal khi phase phù hợp.

## 6.5 Delivery persona

### Ai thuộc nhóm này
- Implementer  
- Partner  
- Internal rollout specialist

### Họ cần gì từ trải nghiệm
- Biết tenant đang ở đâu trong hành trình setup.  
- Biết dữ liệu nào còn lỗi.  
- Biết pack nào đã cài.  
- Biết go-live blockers là gì.

### Surface chính
- Partner Portal ở phase đủ trưởng thành.

## 7. Trải nghiệm launch-critical của wedge đầu tiên

Pack 02 đã khóa rất rõ launch slice đầu tiên là **order/request processing with branch-aware control, exceptions, and approvals** cho retail / light distribution. Vì vậy Experience Strategy phải bắt đầu từ scenario này, không được đi lạc sang những flows đẹp nhưng không quyết định thắng thua.

## 7.1 Experience outcome bắt buộc cho decision persona

Decision persona phải có thể mở Web Admin và trong thời gian ngắn nắm được:
- tổng số open items;  
- items theo trạng thái;  
- pending approvals;  
- overdue hoặc blocked items;  
- branch hoặc site nào đang là điểm nóng;  
- và có thể drill down vào nơi bất thường đủ nhanh.

Nếu họ không thấy được “sự thật vận hành sống” trong 30–60 giây đầu, launch slice chưa đủ mạnh về control.

## 7.2 Experience outcome bắt buộc cho coordination persona

Coordination persona phải có thể:
- tìm backlog;  
- lọc theo branch, status, owner hoặc priority;  
- mở record detail đủ rõ;  
- xử lý approval/rejection/override;  
- đẩy luồng đi tiếp hoặc chuyển người xử lý;  
- và nhận ra item nào đang thiếu thông tin hoặc vi phạm policy.

Nếu họ vẫn phải dùng chat song song chỉ để biết nên xử lý cái gì trước, UX chưa đạt.

## 7.3 Experience outcome bắt buộc cho execution persona

Execution persona phải có thể:
- mở app/PWA và thấy việc được giao;  
- biết việc nào urgent;  
- cập nhật trạng thái nhanh;  
- thêm note hoặc evidence khi cần;  
- báo ngoại lệ hoặc chờ duyệt bằng flow rõ ràng;  
- và hoàn tất thao tác với cognitive load thấp.

Nếu execution persona phải bơi trong quá nhiều menu hoặc field, hệ thống sẽ bị từ chối ngầm.

## 8. Nguyên tắc UX cốt lõi của Nextflow OS

Những nguyên tắc dưới đây phải được xem là luật nền của toàn bộ Pack 03.

## 8.1 State clarity first

Người dùng phải luôn biết một item đang ở trạng thái gì, điều gì khiến nó ở trạng thái đó, và bước tiếp theo hợp lệ là gì. Trạng thái mơ hồ là nguyên nhân trực tiếp của xử lý ngoài hệ thống.

## 8.2 Action clarity first

Mỗi surface phải làm rõ người dùng có thể làm gì tiếp theo. Các hành động quan trọng không được bị giấu trong UI đến mức người dùng đoán mò hoặc quay lại chat hỏi nhau.

## 8.3 Exception clarity first

Ngoại lệ, blocked states, waiting states, thiếu thông tin và overdue items phải được biểu đạt rõ. Một hệ vận hành chỉ mạnh ở happy path là chưa đủ.

## 8.4 Role-specific density

Không phải mọi người dùng cần mật độ thông tin như nhau. Manager chịu được màn hình dày hơn nếu đổi lại control cao hơn. Operator cần lightweight experience. UX phải tôn trọng sự khác biệt này.

## 8.5 Flow-over-feature navigation

Người dùng nên được dẫn theo flow và outcome, không phải bị bắt hiểu kiến trúc menu nội bộ của đội sản phẩm. Navigation tốt là navigation giúp hoàn thành việc, không phải navigation phô diễn cấu trúc hệ thống.

## 8.6 Trust through traceability

Khi người dùng hỏi “ai đổi trạng thái này?”, “vì sao bị từ chối?”, “ai duyệt cái này?”, hệ thống phải có cách trả lời qua history, audit hoặc reasoning hiển thị được.

## 8.7 Safe defaults over blank flexibility

Template-driven product phải dùng defaults tốt, labels dễ hiểu, filters hữu ích và flows hợp lý sẵn. Bắt SME cấu hình quá nhiều trước khi dùng là một thất bại UX.

## 8.8 Progressive complexity

Người dùng không nên bị đập vào mặt toàn bộ complexity của hệ thống trong ngày đầu. Hệ thống phải mở complexity theo ngữ cảnh, vai trò và mức độ trưởng thành sử dụng.

## 9. Ranh giới giữa UX concerns và business-truth concerns

Đây là phần rất quan trọng để Experience Pack không vô tình phá Product Pack.

## 9.1 UX được quyền sở hữu gì

UX và surfaces được quyền sở hữu:
- information architecture;  
- layout, hierarchy, interaction patterns;  
- visual semantics;  
- empty states và helper states;  
- draft interaction state;  
- local validation phục vụ usability;  
- navigation models;  
- read-optimized presentation views.

## 9.2 UX không được sở hữu gì

UX không được sở hữu như source of truth:
- record lifecycle semantics cốt lõi;  
- approval rules;  
- policy thresholds;  
- domain invariants;  
- queue ownership truth;  
- migration state truth;  
- hoặc bất kỳ business transition nào chỉ tồn tại ở một surface mà engines không biết.

## 9.3 Câu hỏi kiểm tra nhanh

Nếu một flow UX cần thêm trạng thái, rule hoặc hành động, câu hỏi đầu tiên không phải là “vẽ màn hình này thế nào?”, mà là:

- trạng thái này có phải business truth không;  
- nếu có, engine nào sở hữu;  
- nếu không, đây chỉ là presentation state hay temporary interaction state.

Chỉ cần giữ đúng câu hỏi này, Pack 03 sẽ tránh được rất nhiều sai lầm kiến trúc.

## 10. Launch-priority surfaces theo roadmap hiện tại

Dựa trên Product Pack và first wedge slice, Pack 03 phải ưu tiên surfaces theo thứ tự sau.

## 10.1 Priority 1 – Web Admin

Đây là surface quyết định khả năng bán, demo, điều hành và pilot success của wedge đầu tiên. Nó là nơi decision và coordination personas gặp sản phẩm rõ nhất.

## 10.2 Priority 2 – Mobile Ops / PWA

Đây là surface quyết định adoption ở frontline và tính chân thật của operating model. Nếu không có nó, hệ thống sẽ bị kéo mạnh về back-office-only software.

## 10.3 Priority 3 – Customer Portal

Surface này quan trọng ở phase sau hoặc ở một số scenario cụ thể, nhưng chưa phải trọng tâm launch-critical của wedge đầu tiên.

## 10.4 Priority 4 – Partner Portal

Surface này quan trọng cho scale delivery về sau, nhưng chưa nên tiêu tốn quá nhiều thiết kế sâu trong giai đoạn đầu nếu launch slice còn chưa chín.

## 11. Screen strategy cấp cao cho Pack 03

Experience Strategy chưa đi vào từng screen map chi tiết, nhưng cần chốt screen strategy ở cấp cao để các tài liệu sau không đi sai nhịp.

## 11.1 Web Admin nên xoay quanh 5 vùng trải nghiệm

1. **Overview / Dashboard** – nhìn sức khỏe hệ vận hành.  
2. **Work / Queue Views** – nhìn và điều phối backlog.  
3. **Record Detail Views** – xem và thao tác trên item cụ thể.  
4. **Approval / Exception Views** – xử lý việc cần quyết định.  
5. **Setup / Import / Configuration Entry Views** – khởi tạo và vận hành tenant ở mức cần thiết.

## 11.2 Mobile Ops nên xoay quanh 4 vùng trải nghiệm

1. **My Work / Team Work** – việc nào cần làm.  
2. **Task / Item Action View** – vào item và thao tác nhanh.  
3. **Update / Evidence / Exception Actions** – hoàn thành việc, thêm note, báo ngoại lệ.  
4. **Light Status Context** – hiểu nhanh item đang ở đâu trong flow.

## 11.3 Customer Portal nên xoay quanh 3 vùng trải nghiệm

1. **Request or Booking Entry**.  
2. **Status / History View**.  
3. **Simple Follow-up Actions**.

## 11.4 Partner Portal nên xoay quanh 4 vùng trải nghiệm

1. **Tenant Readiness**.  
2. **Pack / Setup State**.  
3. **Migration / Import Progress**.  
4. **Go-live / Support Oversight**.

## 12. Rủi ro UX lớn nhất nếu Experience Strategy đi sai

## 12.1 Rủi ro 1 – Web Admin trở thành tất cả mọi thứ

Nếu đội ngũ đổ mọi nhu cầu vào Web Admin, hệ thống sẽ khó dùng với manager, không usable với operator và làm mờ logic multi-surface.

## 12.2 Rủi ro 2 – Mobile bị làm như bản sao web

Điều này sẽ tạo trải nghiệm nặng, chậm, khó dùng và rất ít adoption ở frontline.

## 12.3 Rủi ro 3 – Đẹp nhưng không rõ state

Một UI nhìn tốt nhưng mơ hồ về status, approvals hoặc next actions sẽ không giúp doanh nghiệp vận hành tốt hơn.

## 12.4 Rủi ro 4 – UX lấn sang domain logic

Nếu UX tự định nghĩa transitions, rules hoặc queue semantics mà engines không sở hữu, hệ thống sẽ nhanh chóng gãy.

## 12.5 Rủi ro 5 – Thiết kế quá nhiều surfaces quá sớm

Nếu chưa chốt chắc Web Admin và Mobile Ops cho wedge đầu mà đã tản sang Customer Portal hoặc Partner Portal quá sâu, UX team sẽ loãng lực và launch slice yếu đi.

## 13. Guardrails cho toàn bộ Pack 03

Mọi quyết định UX về sau nên đi qua các guardrails sau:

1. **Surface này phục vụ persona nào và outcome nào?**  
2. **Nó là control surface hay execution surface?**  
3. **Nó có làm state/action/exception rõ hơn không?**  
4. **Nó có tôn trọng boundary với business truth không?**  
5. **Nó có giảm friction chuyển đổi từ cách làm cũ không?**  
6. **Nó có hỗ trợ launch slice của wedge đầu tiên không?**  
7. **Nó có đòi product phải build quá nhiều capability ngoài phase hiện tại không?**  
8. **Nó có đủ reusable để phù hợp với template-driven product không?**

Nếu một quyết định thiết kế không qua được đa số guardrails này, nên xem lại trước khi đi sâu.

## 14. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền của Pack 03 như sau:

1. UX trong Nextflow OS là **cơ chế phân phối operating model**, không chỉ là lớp giao diện.  
2. Nextflow OS bắt buộc là **multi-surface experience system**.  
3. Bốn surfaces chính thức là Web Admin, Mobile Ops/PWA, Customer Portal và Partner Portal.  
4. Launch-critical surfaces của wedge đầu tiên là **Web Admin** và **Mobile Ops/PWA**.  
5. Experience design phải bám vào personas theo logic decision, coordination, execution, external và delivery.  
6. State clarity, action clarity, exception clarity và role-specific density là các nguyên tắc UX không được vi phạm.  
7. UX không được trở thành nơi sở hữu business truth hoặc domain semantics ẩn.  
8. Pack 03 phải đi tiếp bằng cách đào sâu từng surface và từng scenario launch-critical trước khi mở rộng sâu sang portal phụ.

## 15. Điều kiện hoàn thành của tài liệu

Experience Strategy Overview được xem là đạt yêu cầu khi:
- các teams có cùng một cách hiểu về vai trò của UX trong Nextflow OS;  
- multi-surface model được chấp nhận như một quyết định sản phẩm chứ không chỉ là lựa chọn giao diện;  
- thứ tự ưu tiên surfaces đã rõ;  
- và các tài liệu tiếp theo như Web Admin Experience Strategy, Mobile Ops Experience Strategy, Navigation Model và Screen Taxonomy có thể đi sâu mà không tranh luận lại nền tảng.

## AG Execution Prompt

You are acting as a senior UX strategist, product-experience architect, and multi-surface operating-model designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Product baseline: shared core, capability engines, template-driven delivery, branch-aware launch slice, Web Admin and Mobile Ops as launch-critical surfaces.
- This document opens Pack 03 and defines the overall experience strategy for the product.

### Objective
Refine this Experience Strategy Overview into a production-grade UX strategy baseline that can guide product design, UX systems, frontend planning, and downstream scenario design across all core surfaces.

### Inputs
- Use this document plus Product Overview, First Wedge Capability Slice, and Product Pack Summary and Decision Log as the primary source of truth.
- Preserve the multi-surface model and the wedge-first launch logic.
- Keep the output focused on operational UX strategy, not generic design philosophy.

### Tasks
1. Rewrite the experience thesis and multi-surface rationale into a sharper executive form.
2. Produce a surface-to-persona-to-outcome matrix.
3. Add a launch-priority experience map for the first wedge.
4. Produce a high-level UX concern versus business-truth concern boundary map.
5. Identify the top experience risks that would break adoption or boundary discipline.
6. Recommend the exact next UX documents that should follow this overview.
7. Add design governance rules for keeping Pack 03 aligned with the product baseline.

### Constraints
- Do not reduce the product to a single-surface web app.
- Do not treat Mobile Ops as a mirror of Web Admin.
- Do not let UX own domain truth or hidden business transitions.
- Do not spread design effort too early into lower-priority portals.
- Keep the output actionable for downstream UX planning.

### Output Format
Return a revised markdown document with these sections:
1. Executive Experience Thesis
2. Surface Strategy Matrix
3. First-Wedge Experience Priorities
4. UX Boundary Map
5. Experience Risks
6. Design Governance Rules
7. Recommended Next UX Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the experience strategy of Nextflow OS explicit and usable.
- The UX model must remain fully consistent with Nextflow OS as an SME Business OS.
- The document must help downstream teams prioritize Web Admin and Mobile Ops correctly.
- The result must reduce ambiguity between UX concerns, product capabilities, and domain-truth ownership.
