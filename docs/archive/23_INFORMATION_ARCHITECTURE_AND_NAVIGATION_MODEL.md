# Nextflow OS – Information Architecture and Navigation Model

**Document ID:** 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Architecture / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Design System, Sales & Enablement, Deployment & Support  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 13_FIRST_WEDGE_CAPABILITY_SLICE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **mô hình Information Architecture (IA) và Navigation tổng thể** cho Nextflow OS trong Pack 03. Nếu Experience Strategy Overview đã chốt rằng Nextflow OS là một **multi-surface experience system**, Web Admin Experience Strategy đã chốt logic của **control surface**, và Mobile Ops Experience Strategy đã chốt logic của **execution surface**, thì tài liệu này trả lời câu hỏi tiếp theo ở cấp cấu trúc trải nghiệm:

> **Người dùng sẽ đi qua toàn bộ hệ thống theo cách nào, các vùng thông tin được tổ chức ra sao, đâu là entry points chính, đâu là các layers điều hướng, và làm sao để các surfaces khác nhau vừa có logic riêng vừa vẫn tạo thành một product experience thống nhất?**

IA và navigation không phải là chuyện đặt menu. Với Nextflow OS, IA là **bản đồ nhận thức của operating model**. Nếu IA sai, người dùng sẽ không hiểu hệ thống đang giúp họ điều gì, không biết nên bắt đầu ở đâu, không nhìn ra sự khác biệt giữa record truth, work handling, approvals hay exceptions, và cuối cùng sẽ quay lại cách làm cũ. Ngược lại, nếu IA đúng, người dùng có thể hiểu sản phẩm nhanh hơn rất nhiều, ngay cả khi phía dưới là một hệ capability khá phức tạp.

Tài liệu này phải khóa mười thứ:
1. Vai trò của IA trong Nextflow OS.  
2. Nguyên tắc tổ chức thông tin xuyên surfaces.  
3. Navigation model cấp cao cho Web Admin.  
4. Navigation model cấp cao cho Mobile Ops.  
5. Mối quan hệ giữa cross-surface consistency và surface-specific optimization.  
6. Cách cấu trúc điều hướng phải phản ánh product truths đã chốt ở Pack 02.  
7. Entry-point strategy cho wedge đầu tiên.  
8. Rules về labeling, grouping và hierarchy.  
9. Những anti-pattern IA/navigation phải tránh.  
10. Các tài liệu UX tiếp theo cần đi sâu từ baseline này.

## 2. Vai trò của IA trong Nextflow OS

Trong một SME Business OS, IA không thể chỉ được xem là lớp kỹ thuật của menu tree. Nó là cách sản phẩm dạy người dùng nhìn doanh nghiệp qua hệ thống. Nói cách khác, IA là nơi product model và mental model của người dùng gặp nhau.

Có năm vai trò chiến lược của IA trong Nextflow OS.

### 2.1 Giảm khoảng cách giữa capability complexity và user understanding

Phía dưới Nextflow OS có nhiều layers, engines, states, records, policies và flows. Người dùng không nên phải hiểu cấu trúc nội bộ đó mới dùng được hệ thống. IA tốt sẽ dịch complexity thành những vùng thông tin và entry points dễ hiểu hơn.

### 2.2 Tạo orientation trong một hệ thống nhiều surface

Vì Nextflow OS là multi-surface, người dùng có thể chạm sản phẩm qua web, mobile, về sau là portals. IA phải tạo cảm giác rằng đây là cùng một hệ thống, nhưng mỗi surface có một vai trò khác nhau. Điều này đòi hỏi consistency ở concept level, không phải copy y nguyên navigation giữa các surfaces.

### 2.3 Làm rõ distinction giữa control, execution và self-service

Một trong những rủi ro lớn của sản phẩm là mọi thứ bị trộn vào nhau. IA phải giúp người dùng thấy rõ đâu là nơi điều hành, đâu là nơi thực thi, đâu là nơi external self-service, đâu là nơi rollout/delivery. Nếu distinction này mờ, toàn bộ experience strategy sẽ suy yếu.

### 2.4 Biến trạng thái và ngoại lệ thành first-class information objects

Trong hệ vận hành, record không phải thứ duy nhất quan trọng. States, approvals, blocked items, overdue items, exceptions và queues cũng là “objects” mà người dùng muốn đi tới. IA phải phản ánh điều đó thay vì chỉ xoay quanh master menu theo loại module.

### 2.5 Hỗ trợ tốc độ điều hướng theo job-to-be-done

Người dùng của Nextflow OS mở sản phẩm để làm việc cụ thể: xem cái gì đang kẹt, duyệt cái gì đang chờ, xử lý việc được giao, tìm một record có vấn đề, xác nhận một update. IA tốt phải giúp con đường tới các jobs này ngắn, rõ và lặp lại được.

## 3. IA thesis của Nextflow OS

IA thesis cho Nextflow OS có thể phát biểu như sau:

> **Information Architecture của Nextflow OS phải được tổ chức quanh work, state, decisions và outcomes — chứ không phải quanh sự thuận tiện nội bộ của hệ thống hay sơ đồ module kỹ thuật.**

Từ thesis này, sáu nguyên lý IA được suy ra:

1. IA phải ưu tiên **job-oriented entry points** hơn là capability-internal naming.  
2. IA phải giúp người dùng di chuyển tự nhiên giữa **overview → queue → item → action → result**.  
3. IA phải phản ánh rõ distinction giữa **record context** và **work context**.  
4. IA phải làm cho **approvals và exceptions** dễ đi tới như các khu vực hạng nhất, không phải chỗ phụ.  
5. IA phải cho phép **surface specialization**, nhưng vẫn duy trì **conceptual continuity** xuyên hệ thống.  
6. IA phải hỗ trợ wedge đầu tiên trước, không dàn trải sớm sang tất cả future scenarios.

## 4. Các lớp IA của product system

Ở cấp tổng thể, IA của Nextflow OS nên được hiểu theo bốn lớp lớn. Bốn lớp này không phải menu items, mà là bốn tầng của logic tổ chức thông tin.

## 4.1 Layer 1 – Surface layer

Đây là lớp cao nhất, trả lời câu hỏi người dùng đang ở **Web Admin**, **Mobile Ops**, **Customer Portal** hay **Partner Portal**. Đây là lớp phân biệt ngữ cảnh trải nghiệm chính.

## 4.2 Layer 2 – Functional zones

Trong mỗi surface, người dùng đi vào các zones lớn như:
- Overview / Dashboard,  
- Work / Queues,  
- Records / Details,  
- Approvals / Exceptions,  
- Setup / Import / Admin,  
- hoặc My Work / Action Views trên mobile.

Functional zones là lớp cấu trúc quan trọng nhất ở level IA thực tế.

## 4.3 Layer 3 – Workflow context

Trong từng zone, người dùng cần biết mình đang ở context nào: branch nào, status nào, queue nào, owner nào, item nào, hay approval bucket nào. Đây là lớp contextual navigation và filtering.

## 4.4 Layer 4 – Action context

Lớp sâu nhất là nơi một người dùng cụ thể đứng trước một record, work item, approval hoặc exception và chuẩn bị hành động. Tại đây, IA phải chuyển tiếp mượt sang interaction design và decision context.

## 5. Nguyên tắc IA xuyên surfaces

Dù mỗi surface có logic riêng, Pack 03 phải giữ một tập nguyên tắc IA dùng chung để sản phẩm không bị rời rạc.

## 5.1 Same concepts, different emphasis

Nếu khái niệm trong hệ thống là record, queue, approval, blocked, overdue, branch, assignee, history, thì các surfaces khác nhau nên dùng cùng các khái niệm này ở mức logic. Tuy nhiên mức độ hiển thị và độ sâu của chúng có thể khác nhau theo bối cảnh.

## 5.2 Surface-specific navigation, shared conceptual model

Web Admin có thể có top-level navigation và filters giàu hơn. Mobile Ops có thể có entrypoints ít hơn và views gọn hơn. Nhưng người dùng không nên cảm thấy mobile và web đang nói hai ngôn ngữ sản phẩm khác nhau.

## 5.3 Navigation must follow work momentum

Điều hướng nên đi theo nhịp tự nhiên của người dùng: từ tín hiệu → danh sách việc → item cụ thể → hành động → xác nhận / trạng thái mới. Nếu điều hướng phá nhịp này, người dùng sẽ thấy hệ thống “đúng nhưng khó dùng”.

## 5.4 High-friction destinations must be obvious

Những nơi quan trọng như pending approvals, blocked items, overdue work, import errors hoặc urgent workload không được bị chôn sâu trong menu. Nếu thứ gây đau nhất lại khó đi tới nhất, IA đã sai.

## 5.5 Configuration should not dominate operational navigation

Setup, config và admin là cần thiết, nhưng IA không nên để các nhu cầu ít tần suất này chiếm quá nhiều không gian nhận thức của phần lớn người dùng hằng ngày.

## 6. Navigation model tổng thể cho Web Admin

Dựa trên Web Admin Experience Strategy, navigation của Web Admin nên xoay quanh năm entry zones lớn. Đây là model cấp chiến lược, chưa phải menu cuối cùng theo pixel.

## 6.1 Zone 1 – Overview

### Câu hỏi mà zone này trả lời
- Hệ vận hành hiện tại đang khỏe hay đang có vấn đề?  
- Cái gì cần chú ý ngay?  
- Branch nào đang nóng?  
- Approval nào đang chặn flow?

### Vai trò IA
Overview là **orientation layer** và **decision-entry layer**. Nó không nên là nơi người dùng ở lâu nhất, nhưng là nơi họ định hướng trước khi đi sâu hơn.

### Entry paths nên có
- Sang pending approvals.  
- Sang blocked/overdue items.  
- Sang branch hotspot views.  
- Sang queue/detail views tương ứng.

## 6.2 Zone 2 – Work / Queues

### Câu hỏi mà zone này trả lời
- Hôm nay backlog đang ở đâu?  
- Team nào/branch nào đang giữ nhiều việc?  
- Việc nào cần triage?  
- Việc nào cần reassignment hoặc follow-up?

### Vai trò IA
Đây là **daily operating zone** của coordination personas. Nó là nơi điều phối flow chứ không chỉ xem dữ liệu.

### Entry paths nên có
- Từ overview vào filtered queue.  
- Từ queue vào record detail.  
- Từ queue vào quick approval/exception context nếu phù hợp.  
- Từ queue sang related branch or owner slices.

## 6.3 Zone 3 – Records

### Câu hỏi mà zone này trả lời
- Item này là gì?  
- Nó đang ở trạng thái nào?  
- Có details, evidence, notes, history và related work gì?  
- Tôi có thể làm gì tiếp theo trên item này?

### Vai trò IA
Đây là **object understanding zone**. Nó không chỉ để đọc record, mà để hiểu đầy đủ một item trước khi ra quyết định hoặc hành động.

### Entry paths nên có
- Từ queue hoặc approval vào record detail.  
- Từ record sang related work/history/evidence.  
- Từ record sang actions phù hợp theo state.

## 6.4 Zone 4 – Approvals / Exceptions

### Câu hỏi mà zone này trả lời
- Cái gì đang chờ duyệt?  
- Cái gì out-of-policy?  
- Cái gì blocked hoặc thiếu thông tin?  
- Ai cần quyết định gì ngay?

### Vai trò IA
Đây là **decision and recovery zone**. Nó là nơi đặc biệt quan trọng với wedge đầu tiên vì nhiều giá trị của sản phẩm nằm ở ngoại lệ và approvals.

### Entry paths nên có
- Từ overview vào approval inbox.  
- Từ record detail vào exception resolution flow.  
- Từ approval item sang record context và history liên quan.

## 6.5 Zone 5 – Setup / Import / Admin

### Câu hỏi mà zone này trả lời
- Làm sao bắt đầu dữ liệu?  
- Có lỗi import gì?  
- Tenant có cấu hình nền nào đang dùng?  
- Có bước onboarding/admin nào đang chờ?

### Vai trò IA
Đây là **operational support zone**, không phải daily core zone của đa số users. Nó cần rõ nhưng không nên áp đảo bốn zones còn lại.

### Entry paths nên có
- Từ onboarding flows.  
- Từ validation/error states.  
- Từ admin-only contexts.  
- Không nên là default landing của hầu hết personas.

## 7. Navigation model tổng thể cho Mobile Ops

Dựa trên Mobile Ops Experience Strategy, navigation của Mobile Ops phải ngắn hơn, ít nhánh hơn và hướng hành động hơn.

## 7.1 Zone 1 – My Work / Team Work

### Câu hỏi mà zone này trả lời
- Tôi phải làm gì ngay bây giờ?  
- Việc nào urgent?  
- Việc nào đang chờ tôi hoặc đội tôi?

### Vai trò IA
Đây là **primary landing zone**. Nếu người dùng không hiểu phải làm gì khi vào zone này, mobile IA xem như thất bại.

## 7.2 Zone 2 – Item Action

### Câu hỏi mà zone này trả lời
- Item này là gì?  
- Việc tiếp theo là gì?  
- Tôi có thể làm hành động chính nào ngay lúc này?

### Vai trò IA
Đây là **core execution zone**. Nó phải đưa người dùng từ hiểu ngắn gọn sang hành động rất nhanh.

## 7.3 Zone 3 – Update / Evidence / Exception

### Câu hỏi mà zone này trả lời
- Tôi muốn cập nhật gì?  
- Tôi cần thêm note hoặc bằng chứng gì?  
- Tôi có đang bị chặn hoặc cần báo ngoại lệ không?

### Vai trò IA
Đây là **structured-action zone**. Nó giúp execution không rơi về chat hoặc ghi nhớ thủ công.

## 7.4 Zone 4 – Light Status Context

### Câu hỏi mà zone này trả lời
- Item đang ở đâu trong flow?  
- Có vấn đề gì đang chặn không?  
- Tôi đang chờ gì hoặc ai đang chờ tôi?

### Vai trò IA
Đây là **confidence zone**. Nó không phải nơi điều tra sâu, mà là nơi giúp người dùng yên tâm rằng mình hiểu đủ trước khi hành động.

## 8. Entry-point strategy cho wedge đầu tiên

Wedge đầu tiên là retail / light distribution với core scenario là **order/request processing with branch-aware control, exceptions, and approvals**. Vì vậy entry-point strategy phải hỗ trợ chính xác nhịp đó.

## 8.1 Entry points ưu tiên trên Web Admin

Ở wedge đầu tiên, các entry points chính nên là:
- Overview.  
- Work Queues.  
- Approvals.  
- Records.  
- Imports (chủ yếu cho admin/onboarding contexts).

Lý do là vì đây là năm cánh cửa trực tiếp nhất dẫn tới các jobs-to-be-done quan trọng của decision và coordination personas.

## 8.2 Entry points ưu tiên trên Mobile Ops

Ở wedge đầu tiên, các entry points chính nên là:
- My Work.  
- Team Work (khi role phù hợp).  
- Urgent / Needs Action.  
- Item Action.  
- Quick Update / Exception flows.

Lý do là vì mobile users không đến để duyệt menu; họ đến để nhìn workload và hoàn tất hành động.

## 8.3 Progressive disclosure theo maturity

Ở phase đầu, entry points nên ít nhưng mạnh. Khi sản phẩm chín hơn, có thể mở thêm shortcuts, saved views hoặc persona-specific landing patterns. Nhưng ở launch slice, ít đầu mối và rõ mục đích quan trọng hơn sự đầy đủ bề mặt.

## 9. Labeling strategy

Labeling là phần dễ bị xem nhẹ nhưng lại ảnh hưởng trực tiếp đến IA quality. Một hệ thống phức tạp nhưng dùng ngôn ngữ đúng có thể học nhanh hơn nhiều so với một hệ thống logic tốt nhưng label mơ hồ.

## 9.1 Ưu tiên ngôn ngữ theo công việc

Labels nên bám các khái niệm mà người dùng dùng trong thực tế như Work, Queue, Approval, Blocked, Waiting, Overdue, My Tasks, Team Tasks, Records, Imports. Không nên ưu tiên các thuật ngữ kỹ thuật nội bộ như orchestration layer, engine, domain object registry, workflow artifact nếu chúng không giúp người dùng.

## 9.2 Nhất quán giữa surfaces ở level concept

Nếu web dùng “Approvals” còn mobile dùng “Requests to Decide” cho cùng một khái niệm cốt lõi, người dùng sẽ mất continuity. Có thể điều chỉnh ngắn gọn theo form factor, nhưng không nên đổi concept tùy hứng.

## 9.3 Tránh label quá tổng quát

Những từ như “Management”, “Operations”, “Control”, “Tasks” đôi khi quá rộng nếu dùng không có ngữ cảnh. IA nên dùng labels đủ cụ thể để người dùng đoán được thứ họ sẽ thấy bên trong.

## 9.4 Labels phải hỗ trợ action orientation

Ví dụ, “Pending Approvals” tốt hơn “Review Center” nếu mục tiêu là làm rõ ngay việc đang chờ quyết định. Label tốt phải gợi hành động hoặc gợi ý trạng thái rõ.

## 10. Grouping strategy

Grouping trong IA của Nextflow OS nên phản ánh nhịp vận hành chứ không chỉ phản ánh quan hệ dữ liệu.

## 10.1 Group by job-to-be-done before group by entity type

Ở nhiều nơi, người dùng muốn thấy “cái gì cần xử lý” hơn là “tất cả bản ghi cùng loại”. Vì vậy queues, pending approvals, blocked items và urgent work nên được coi là các group tự nhiên, ngang hàng với entity views.

## 10.2 Group by state when action urgency matters

Khi trọng tâm là xử lý flow, grouping theo state như pending, in progress, blocked, overdue, approval-needed thường hữu ích hơn grouping cứng theo loại record.

## 10.3 Group by branch or owner when coordination matters

Trong wedge đầu tiên, branch-aware control rất quan trọng. Vì vậy IA phải chừa chỗ cho grouping theo branch/site, owner/team hoặc assignment slices khi người điều phối cần nhìn vận hành theo cấu trúc tổ chức.

## 10.4 Do not over-group early

Quá nhiều grouping levels sẽ làm người dùng phải suy nghĩ trước khi làm việc. IA launch slice nên ưu tiên một số groupings cực hữu ích thay vì mở vô hạn.

## 11. Breadcrumbs, back paths và orientation model

Một hệ thống nhiều tầng thông tin cần orientation model tốt để tránh cảm giác lạc đường.

## 11.1 Breadcrumbs nên phản ánh context, không chỉ page tree

Trong Web Admin, breadcrumbs hoặc equivalent orientation aids nên giúp người dùng hiểu không chỉ mình đang ở trang nào, mà còn đang ở branch nào, filtered queue nào, approval bucket nào hoặc record nào.

## 11.2 Back paths phải an toàn

Khi người dùng đi từ overview sang filtered queue rồi vào item detail, thao tác quay lại nên đưa họ về đúng danh sách/cấu hình ngữ cảnh trước đó nếu có thể. Mất context khi quay lại là một lỗi UX nặng trong control systems.

## 11.3 Cross-links nên hỗ trợ tư duy điều tra

Từ item detail, người dùng có thể cần nhảy sang related approval, queue context hoặc history. IA nên hỗ trợ các nhảy ngữ cảnh hợp lý này mà không buộc quay lên top-level menu mỗi lần.

## 12. Search trong IA tổng thể

Search là một thành phần quan trọng nhưng không được thay IA.

## 12.1 Search để retrieval, không phải thay cấu trúc

Search rất mạnh khi người dùng biết mình đang tìm item nào. Nhưng khi người dùng cần hiểu “cái gì đang sai” hoặc “việc nào cần ưu tiên”, queues, views và dashboards vẫn là kiến trúc chính.

## 12.2 Search nên gắn với context khi hợp lý

Search trong Web Admin có thể hoạt động tốt hơn nếu nhận biết context như branch, queue, records hoặc approvals. Tìm kiếm không nên luôn ở trạng thái quá rộng làm tăng noise.

## 12.3 Mobile search nên tối giản

Trên mobile, search nên phục vụ retrieval nhanh khi cần, không nên trở thành cách chính để người dùng tìm việc phải làm.

## 13. Cross-surface continuity model

Một product experience thống nhất không có nghĩa là các surfaces giống nhau. Nó có nghĩa là người dùng cảm nhận được cùng một hệ thống, cùng một logic, cùng một “ngôn ngữ vận hành”.

## 13.1 Continuity ở level concept

Các khái niệm như record, work item, status, approval, blocked, overdue, evidence, branch, assignee phải có meaning ổn định giữa web và mobile.

## 13.2 Continuity ở level state semantics

Nếu một item là pending approval trên web, mobile không nên mô tả nó theo cách khiến người dùng tưởng đây là trạng thái khác hoàn toàn. Ngôn ngữ có thể giản lược, nhưng semantics phải thống nhất.

## 13.3 Continuity ở level action expectation

Người dùng nên dần hiểu rằng có những hành động là “safe quick actions” trên mobile, và những hành động cần “full decision context” trên web admin. IA phải củng cố kỳ vọng này thay vì làm nó mơ hồ.

## 14. IA anti-patterns phải tránh

## 14.1 Module-first mega navigation

Khi menu top-level được tổ chức như một sơ đồ capability nội bộ hoặc một mini ERP tree dài dằng dặc, người dùng sẽ khó học và khó thấy jobs-to-be-done của mình.

## 14.2 Flat dashboard, deep pain

Khi overview chỉ là bề mặt trình diễn, nhưng những vùng gây đau như approvals, blocked items hoặc queue bottlenecks lại chôn sâu bên dưới.

## 14.3 Web-mobile mirror navigation

Khi mobile cố copy nguyên cây điều hướng của web, làm execution surface mất bản sắc và tăng tải nhận thức không cần thiết.

## 14.4 Config-first admin bias

Khi setup/config/import trở nên nổi bật ngang hoặc hơn các vùng điều hành hằng ngày, dù phần lớn personas không sống ở đó.

## 14.5 Entity-only IA

Khi hệ thống chỉ cho người dùng đi theo loại đối tượng như Orders, Requests, Branches, Users mà không hỗ trợ đi theo work, approvals, blocked states hay exceptions.

## 14.6 Hidden context loss

Khi người dùng drill-down rồi quay lại nhưng mất filters, branch context, queue context hoặc orientation, làm gián đoạn tư duy xử lý.

## 15. Guardrails cho mọi quyết định IA/navigation

Mọi quyết định IA và navigation của Pack 03 nên được kiểm qua tám guardrails sau:

1. **Entry point này có gắn với một job-to-be-done thật không?**  
2. **Nó có giúp người dùng hiểu mình nên làm gì tiếp theo không?**  
3. **Nó có phản ánh đúng distinction giữa control và execution không?**  
4. **Nó có làm approvals/exceptions dễ đi tới hơn hay khó đi tới hơn?**  
5. **Nó có bảo toàn context khi drill down và quay lại không?**  
6. **Nó có ưu tiên wedge đầu tiên thay vì mở rộng sớm quá mức không?**  
7. **Nó có dùng ngôn ngữ người dùng hiểu thay vì ngôn ngữ nội bộ đội sản phẩm không?**  
8. **Nó có giúp product cảm giác thống nhất xuyên surfaces mà vẫn đúng vai trò từng surface không?**

## 16. Tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **24_WEB_ADMIN_SCREEN_TAXONOMY.md** – taxonomy màn hình chi tiết cho Web Admin.  
2. **25_FIRST_WEDGE_USER_FLOWS.md** – user flows launch-critical xuyên Web Admin và Mobile Ops.  
3. **26_STATE_AND_STATUS_PRESENTATION_RULES.md** – luật biểu đạt trạng thái, blocked, overdue, waiting, approvals.  
4. **27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES.md** – luật nền và guardrails xuyên Pack 03.  
5. **28_MOBILE_OPS_SCREEN_TAXONOMY.md** – taxonomy màn hình chi tiết cho Mobile Ops.  
6. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – patterns nhập liệu, note và evidence capture.  
7. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – landing strategies và default view logic theo persona.

## 17. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định IA/navigation nền như sau:

1. IA của Nextflow OS phải được tổ chức quanh **work, state, decisions và outcomes**, không quanh sơ đồ module kỹ thuật.  
2. Nextflow OS có bốn lớp IA: Surface Layer, Functional Zones, Workflow Context, Action Context.  
3. Web Admin phải xoay quanh năm zones lớn: Overview, Work/Queues, Records, Approvals/Exceptions, Setup/Import/Admin.  
4. Mobile Ops phải xoay quanh bốn zones lớn: My Work/Team Work, Item Action, Update/Evidence/Exception, Light Status Context.  
5. Cross-surface continuity phải được giữ ở level concept và semantics, không bằng cách mirror navigation giữa web và mobile.  
6. Approvals, blocked items, overdue items và exceptions phải là first-class navigation destinations.  
7. Entry-point strategy của wedge đầu tiên phải tối ưu cho retail/light-distribution launch slice thay vì mọi future scenarios cùng lúc.

## 18. Điều kiện hoàn thành của tài liệu

Information Architecture and Navigation Model được xem là đạt yêu cầu khi:
- đội UX, Product và Engineering cùng hiểu cấu trúc điều hướng tổng thể của system;  
- distinction giữa Web Admin navigation và Mobile Ops navigation đã rõ;  
- labeling, grouping và orientation rules đã đủ rõ để đi xuống screen taxonomy;  
- và downstream UX documents có thể kế thừa cùng một IA model mà không tự phát minh lại top-level structure.

## AG Execution Prompt

You are acting as a senior UX architect, information-architecture strategist, and multi-surface navigation designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: multi-surface experience system, Web Admin as primary control surface, Mobile Ops as primary execution surface.
- This document defines the overall IA and navigation model across those surfaces.

### Objective
Refine this Information Architecture and Navigation Model into a production-grade IA baseline that can guide menu design, navigation systems, screen taxonomy, default views, and cross-surface UX coherence for the first wedge and beyond.

### Inputs
- Use this document plus Experience Strategy Overview, Web Admin Experience Strategy, Mobile Ops Experience Strategy, and the First Wedge Capability Slice as the primary source of truth.
- Preserve the distinction between control versus execution surfaces and the wedge-first launch focus.
- Keep the output practical for downstream UX/system design, not generic IA theory.

### Tasks
1. Rewrite the IA thesis and navigation logic into a sharper executive form.
2. Produce a surface-to-zone IA matrix for Web Admin and Mobile Ops.
3. Add a top-level navigation model with primary, secondary, and contextual navigation layers.
4. Create a labeling and grouping policy for launch-phase IA.
5. Identify the top five IA/navigation failures that would damage usability or product clarity.
6. Recommend the next UX documents that should operationalize this IA into screen maps and user flows.
7. Add governance rules to prevent module-first or config-first IA drift.

### Constraints
- Do not organize the product as a mega menu of modules.  
- Do not mirror web navigation onto mobile.  
- Do not hide approvals, exceptions, or blocked work behind deep navigation.  
- Do not let setup/config dominate the IA for daily users.  
- Keep the output specific enough for downstream execution.

### Output Format
Return a revised markdown document with these sections:
1. Executive IA Thesis
2. Surface-to-Zone Matrix
3. Navigation Layer Model
4. Labeling and Grouping Policy
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the IA and navigation model explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams avoid module-first navigation and cross-surface confusion.
- The output must reduce the risk of weak orientation, hidden exceptions, and navigation overload.
