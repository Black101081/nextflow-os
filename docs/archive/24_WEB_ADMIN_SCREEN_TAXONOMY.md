# Nextflow OS – Web Admin Screen Taxonomy

**Document ID:** 24_WEB_ADMIN_SCREEN_TAXONOMY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Architecture / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Design System, Frontend Delivery, Sales & Enablement  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 13_FIRST_WEDGE_CAPABILITY_SLICE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **taxonomy chính thức của các loại màn hình trong Web Admin** cho Nextflow OS. Nếu Web Admin Experience Strategy đã chốt Web Admin là control, coordination và governance surface; còn Information Architecture and Navigation Model đã chốt các zones lớn như Overview, Work/Queues, Records, Approvals/Exceptions và Setup/Import/Admin; thì tài liệu này đi thêm một bước rất quan trọng:

> **Cụ thể Web Admin sẽ bao gồm những loại màn hình nào, mỗi loại tồn tại để trả lời câu hỏi điều hành nào, mức ưu tiên của từng loại ra sao, và mối quan hệ giữa các loại màn hình này phải được tổ chức như thế nào để tạo thành một control surface nhất quán?**

Taxonomy màn hình không phải chỉ là danh sách page names. Nó là cách ép đội ngũ thiết kế và engineering nhìn Web Admin như một hệ bề mặt có cấu trúc, thay vì một tập màn hình phát sinh ngẫu hứng theo từng feature request. Nếu không có taxonomy rõ, Web Admin rất dễ bị phình thành hỗn hợp của dashboard, tables, forms, detail pages, popups và settings screens không có hierarchy chung.

Tài liệu này phải khóa chín thứ:
1. Screen taxonomy là gì trong ngữ cảnh Nextflow OS.  
2. Các families màn hình chính thức của Web Admin.  
3. Vai trò và câu hỏi mà từng family phải trả lời.  
4. Mối quan hệ giữa screen families và launch-critical wedge slice.  
5. Mức ưu tiên của từng family ở phase đầu.  
6. Cách các màn hình liên kết thành operational journeys.  
7. Quy tắc phân biệt list screens, detail screens, decision screens, admin screens và support screens.  
8. Những anti-pattern về page sprawl phải tránh.  
9. Các tài liệu UX tiếp theo nên đào sâu từ taxonomy này.

## 2. Screen taxonomy trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, screen taxonomy không phải là sitemap kỹ thuật thuần túy và cũng không phải menu tree. Nó là **hệ phân loại các loại màn hình theo vai trò điều hành**. Một taxonomy tốt giúp trả lời:
- người dùng mở loại màn hình này để làm gì;  
- màn hình này thuộc giai đoạn nào của operational journey;  
- nó tiêu thụ context gì;  
- nó dẫn tới những loại hành động nào;  
- và nó không nên ôm những trách nhiệm nào.

Taxonomy này đặc biệt quan trọng với Web Admin vì Web Admin chứa nhiều kiểu tương tác khác nhau: xem tổng quan, triage backlog, xem chi tiết record, duyệt ngoại lệ, xử lý import, xem history, điều chỉnh một số setup. Nếu không phân loại rõ, mỗi team sẽ vô thức tối ưu cục bộ cho màn hình mình đang làm, và cuối cùng surface sẽ mất coherence.

## 3. Taxonomy thesis cho Web Admin

Taxonomy thesis của Web Admin có thể phát biểu như sau:

> **Mỗi màn hình trong Web Admin phải tồn tại để phục vụ một loại câu hỏi điều hành rõ ràng, và các loại màn hình phải phối hợp với nhau theo chuỗi overview → queue → detail → decision → resolution, thay vì xuất hiện như những trang rời rạc theo module.**

Từ thesis này, sáu nguyên lý được suy ra:

1. Screen types phải được định nghĩa theo **operational role**, không theo component library convenience.  
2. Web Admin nên có số lượng **screen families ít nhưng rõ**, thay vì quá nhiều page types chồng lấn.  
3. Mọi screen family phải gắn với một **job-to-be-done** cụ thể.  
4. Mọi high-impact actions phải diễn ra trên screens có **đủ decision context**.  
5. Setup/import screens phải được tách vai trò rõ với daily control screens.  
6. Launch slice phải đầu tư sâu vào những screen families phục vụ control và coordination trước khi mở rộng vào supporting families.

## 4. Các screen families chính thức của Web Admin

Web Admin của Nextflow OS nên được tổ chức quanh tám screen families chính thức. Tám families này không đồng nghĩa với tám menu items; chúng là tám loại bề mặt UX có vai trò khác nhau.

1. **Overview Screens**  
2. **Queue and Worklist Screens**  
3. **Record Detail Screens**  
4. **Approval and Decision Screens**  
5. **Exception and Recovery Screens**  
6. **Operational Support Screens**  
7. **Configuration and Setup Screens**  
8. **Traceability and History Screens**

Các families này map khá chặt với các zones IA đã chốt, nhưng taxonomy này chi tiết hơn ở cấp loại màn hình và mục đích sử dụng.

## 5. Family 1 – Overview Screens

## 5.1 Vai trò

Overview Screens là các màn hình giúp decision personas và coordination personas trả lời câu hỏi: **toàn bộ vận hành đang ở trạng thái nào, cái gì cần chú ý ngay, và tôi nên đi sâu vào đâu trước?**

## 5.2 Jobs-to-be-done chính

- Xem operational health ở mức cao.  
- Nhìn tín hiệu backlog, approvals, overdue, blocked items.  
- Soi hotspot theo branch/site hoặc theo flow.  
- Chọn đường đi tiếp theo vào queue, approvals hoặc record investigations.

## 5.3 Đặc điểm nhận diện

- High-level summary.  
- Strong hierarchy.  
- Click-through paths tới các views sâu hơn.  
- Tập trung vào orientation và prioritization, không ôm detail actions quá nặng.

## 5.4 Những gì không nên xảy ra ở đây

- Không biến overview thành BI report dày đặc.  
- Không biến overview thành nơi chỉnh sửa record sâu.  
- Không làm overview chỉ để trang trí mà không dẫn tới hành động.

## 5.5 Ví dụ màn hình cùng family

- Main operations dashboard.  
- Branch hotspot overview.  
- Approval pressure overview.  
- Daily control summary.

## 5.6 Ưu tiên roadmap

**Launch-critical.** Đây là family quyết định ấn tượng đầu tiên của decision personas và là cửa vào điều hành quan trọng nhất ở wedge đầu.

## 6. Family 2 – Queue and Worklist Screens

## 6.1 Vai trò

Queue and Worklist Screens là nơi coordination personas triage backlog, phân loại vấn đề, theo dõi workload và đẩy flow đi tiếp. Đây là family trung tâm của daily operations trên Web Admin.

## 6.2 Jobs-to-be-done chính

- Xem danh sách items cần xử lý.  
- Lọc theo branch, owner, status, blocked, overdue, approval-needed.  
- Sắp xếp và nhận diện priority work.  
- Mở item cần xem sâu.  
- Thực hiện quick actions phù hợp nếu đủ an toàn.

## 6.3 Đặc điểm nhận diện

- Data-dense nhưng phải có hierarchy.  
- Filtering và grouping rõ.  
- Cues mạnh về urgency và exceptions.  
- Liên kết mạnh sang detail/approval contexts.

## 6.4 Những gì không nên xảy ra ở đây

- Không chỉ là table vô tận không có prioritization logic.  
- Không đòi người dùng mở nhiều item mới biết cái gì quan trọng.  
- Không gói quá nhiều config controls vào worklists.

## 6.5 Ví dụ màn hình cùng family

- All active work queue.  
- Pending branch queue.  
- Overdue items worklist.  
- Needs-attention queue.  
- Owner-specific or team-specific worklist.

## 6.6 Ưu tiên roadmap

**Launch-critical.** Nếu family này yếu, Web Admin sẽ không làm được vai trò coordination surface.

## 7. Family 3 – Record Detail Screens

## 7.1 Vai trò

Record Detail Screens giúp người dùng hiểu một item cụ thể đủ sâu để ra quyết định hoặc điều phối chính xác. Đây là nơi business object trở nên thật và có ngữ cảnh.

## 7.2 Jobs-to-be-done chính

- Hiểu item là gì.  
- Xem trạng thái hiện tại và bối cảnh branch/owner.  
- Xem line items/details, notes, references, evidence.  
- Xem related work hoặc approval context.  
- Kích hoạt các domain actions hợp lệ từ một nơi có đủ ngữ cảnh.

## 7.3 Đặc điểm nhận diện

- Object-centric.  
- Context-rich.  
- Có hierarchy giữa summary, key facts, actions, supporting detail và history.  
- Là cầu nối giữa list-level triage và action-level decision.

## 7.4 Những gì không nên xảy ra ở đây

- Không nhồi mọi field có thể có vào một form dài.  
- Không để actions tách rời khỏi context.  
- Không làm detail screen thành technical data dump.

## 7.5 Ví dụ màn hình cùng family

- Operational record detail.  
- Record with related tasks view.  
- Branch-context record page.  
- Record plus current approval status view.

## 7.6 Ưu tiên roadmap

**Launch-critical.** Wedge đầu tiên cần detail screens đủ mạnh để approvals, exceptions và traceability có chỗ bám.

## 8. Family 4 – Approval and Decision Screens

## 8.1 Vai trò

Approval and Decision Screens là nơi người dùng thực hiện các quyết định có hậu quả vận hành: approve, reject, override, request more information, confirm branch-sensitive actions hoặc quyết định các tình huống ngoài chuẩn.

## 8.2 Jobs-to-be-done chính

- Xem những gì đang chờ quyết định.  
- Hiểu lý do cần quyết định.  
- Soi policy-relevant context.  
- Thực hiện decision với reasoning rõ.  
- Đưa flow quay lại tiến trình đúng.

## 8.3 Đặc điểm nhận diện

- Decision-centric.  
- Context-loaded nhưng phải tập trung.  
- Action consequences rõ.  
- Lý do, policy cues, history gần và next-state implications dễ thấy.

## 8.4 Những gì không nên xảy ra ở đây

- Không trình bày approvals như inbox chỉ có tiêu đề.  
- Không bắt người duyệt nhảy qua quá nhiều trang mới hiểu mình đang quyết định gì.  
- Không giấu reject/override reasoning khỏi action flow.

## 8.5 Ví dụ màn hình cùng family

- Approval inbox.  
- Approval detail page.  
- Override decision page.  
- Review-required decision screen.

## 8.6 Ưu tiên roadmap

**Launch-critical.** Đây là family rất quan trọng vì launch slice đã chốt exceptions và approvals là thành phần trung tâm của giá trị.

## 9. Family 5 – Exception and Recovery Screens

## 9.1 Vai trò

Exception and Recovery Screens xử lý những trạng thái không đi theo happy path: blocked, missing info, out-of-policy, failed validation, waiting on dependency hoặc escalated situations.

## 9.2 Jobs-to-be-done chính

- Nhìn rõ cái gì đang lệch chuẩn.  
- Biết tại sao nó lệch.  
- Biết ai cần hành động tiếp theo.  
- Kéo item quay lại quỹ đạo hoặc đẩy đúng escalation path.

## 9.3 Đặc điểm nhận diện

- Problem-first presentation.  
- Actionability cao.  
- Phân biệt rõ issue signal và recovery actions.  
- Liên kết mạnh với record context, policy context và traceability.

## 9.4 Những gì không nên xảy ra ở đây

- Không coi exceptions như edge-case nhỏ ẩn trong detail pages.  
- Không tách recovery actions khỏi nguyên nhân gây vấn đề.  
- Không buộc người dùng tự ghép nhiều nguồn thông tin mới hiểu item đang kẹt vì sao.

## 9.5 Ví dụ màn hình cùng family

- Blocked items recovery queue.  
- Missing information resolution page.  
- Policy violation review screen.  
- Escalated cases workbench.

## 9.6 Ưu tiên roadmap

**Launch-critical đến high supporting.** Trong wedge đầu, ít nhất một số exception/recovery patterns phải được đầu tư mạnh. Family này có thể bắt đầu nhỏ hơn approval screens nhưng không được bỏ qua.

## 10. Family 6 – Operational Support Screens

## 10.1 Vai trò

Operational Support Screens hỗ trợ các nhu cầu vận hành phụ nhưng cần thiết cho go-live và sử dụng hằng ngày, đặc biệt quanh import, error review, onboarding support hoặc operational helper processes.

## 10.2 Jobs-to-be-done chính

- Bắt đầu dữ liệu.  
- Kiểm tra validation issues.  
- Review import results.  
- Quan sát một số trạng thái hỗ trợ vận hành không thuộc core control views.

## 10.3 Đặc điểm nhận diện

- Utility-oriented.  
- Tập trung vào completion của một support task cụ thể.  
- Ít “chiến lược điều hành” hơn so với overview/queue/decision screens.

## 10.4 Những gì không nên xảy ra ở đây

- Không để support screens chiếm vai trò trung tâm của Web Admin.  
- Không để utility workflows phá consistency chung của surface.  
- Không biến các bước hiếm gặp thành top-level dominant experiences.

## 10.5 Ví dụ màn hình cùng family

- Import result summary.  
- Validation error review screen.  
- Bulk correction helper view.  
- Operational checklist helper page.

## 10.6 Ưu tiên roadmap

**Launch-supporting.** Cần có để onboarding thật và pilot thật diễn ra được, nhưng không nên dẫn dắt toàn bộ chiến lược Web Admin.

## 11. Family 7 – Configuration and Setup Screens

## 11.1 Vai trò

Configuration and Setup Screens hỗ trợ tenant-safe setup, một số cài đặt phù hợp phase hiện tại, pack-linked setup entrypoints hoặc user/admin configuration tối thiểu.

## 11.2 Jobs-to-be-done chính

- Setup vai trò hoặc context nền cần thiết.  
- Kích hoạt hoặc rà một số cấu hình tenant-safe.  
- Chỉnh một số defaults hoặc labels trong guardrails cho phép.  
- Hỗ trợ readiness của launch slice.

## 11.3 Đặc điểm nhận diện

- Admin-oriented.  
- Frequency thấp hơn daily work screens.  
- Cần rõ nhưng không được lấn át operational core.

## 11.4 Những gì không nên xảy ra ở đây

- Không biến mọi khác biệt khách hàng thành settings screen mới.  
- Không lôi config vào top-level path của phần lớn user journeys.  
- Không để setup screens lái taxonomy chung của Web Admin.

## 11.5 Ví dụ màn hình cùng family

- Basic tenant setup page.  
- Role/branch assignment admin screen.  
- Pack-linked configuration entrypoint.  
- Safe defaults setup view.

## 11.6 Ưu tiên roadmap

**Supportive / selective in launch.** Family này cần hiện diện, nhưng phải cực kỳ kỷ luật để không phá focus của launch slice.

## 12. Family 8 – Traceability and History Screens

## 12.1 Vai trò

Traceability and History Screens giúp người dùng điều tra những gì đã xảy ra, tại sao đã xảy ra và ai đã thực hiện hành động gì. Đây là family xây trust và hỗ trợ các quyết định hồi cứu.

## 12.2 Jobs-to-be-done chính

- Xem lịch sử trạng thái.  
- Xem ai đã approve/reject/override.  
- Xem bằng chứng, notes và progression theo thời gian.  
- Hỗ trợ audit-style review hoặc điều tra operational dispute.

## 12.3 Đặc điểm nhận diện

- Narrative-oriented.  
- Time-sequenced.  
- Liên kết chặt với record và decision contexts.  
- Không nhất thiết luôn là page độc lập; có thể xuất hiện như một sub-surface rõ nghĩa trong detail/decision flows.

## 12.4 Những gì không nên xảy ra ở đây

- Không chỉ đưa raw event logs khó hiểu.  
- Không giấu traceability quá sâu khiến lúc cần thì không ai tìm thấy.  
- Không làm history tách rời khỏi record hoặc decision context.

## 12.5 Ví dụ màn hình cùng family

- Record timeline view.  
- Approval history panel.  
- Audit narrative screen.  
- Change history explorer.

## 12.6 Ưu tiên roadmap

**Launch-supporting nhưng rất quan trọng cho trust.** Có thể triển khai ở mức tối thiểu trước, nhưng phải đủ hữu ích để người dùng tin hệ thống.

## 13. Mối quan hệ giữa các screen families

Taxonomy chỉ hữu ích nếu các families không đứng một mình mà kết nối thành hành trình điều hành có logic.

## 13.1 Từ Overview sang Queue

Overview Screens tạo orientation và chỉ ra nơi cần chú ý; Queue and Worklist Screens là nơi người dùng đi tiếp để xử lý nhóm vấn đề đó ở mức cụ thể hơn.

## 13.2 Từ Queue sang Detail

Queue Screens giúp chọn item; Record Detail Screens giúp hiểu item đó đầy đủ hơn trước khi hành động hoặc quyết định.

## 13.3 Từ Detail sang Decision hoặc Recovery

Khi gặp approval need hoặc exception state, Record Detail dẫn sang Approval and Decision Screens hoặc Exception and Recovery Screens tương ứng.

## 13.4 Từ Decision/Recovery quay lại Flow
n
Sau khi người dùng approve, reject, override hoặc recovery thành công, hành trình nên quay item trở lại queue phù hợp hoặc trạng thái mới được phản ánh rõ ở overview và detail contexts.

## 13.5 Support và Setup như side systems, không phải core spine

Operational Support Screens, Configuration and Setup Screens, Traceability Screens phải tích hợp chặt nhưng không nên biến thành “xương sống” chính của navigation. Xương sống của Web Admin vẫn là Overview → Work → Record → Decision/Recovery.

## 14. Screen priority model cho launch slice

Không phải mọi screen family cần đầu tư ngang nhau ở wedge đầu tiên. Taxonomy phải giúp ưu tiên rõ.

## 14.1 Tier A – Launch-critical families

- Overview Screens  
- Queue and Worklist Screens  
- Record Detail Screens  
- Approval and Decision Screens

Đây là bốn families mà nếu yếu, Web Admin sẽ không còn là control surface đúng nghĩa.

## 14.2 Tier B – High-supporting families

- Exception and Recovery Screens  
- Traceability and History Screens

Hai families này tạo khác biệt rất lớn về control quality và trust, nên không thể bỏ, dù có thể bắt đầu ở phạm vi hẹp hơn Tier A.

## 14.3 Tier C – Launch-supporting utility families

- Operational Support Screens  
- Configuration and Setup Screens

Cần có để launch thật và go-live thật, nhưng phải kỷ luật về độ sâu để tránh chiếm sức của control spine.

## 15. Screen-type rules để tránh trùng lặp

Đây là phần quan trọng để taxonomy không biến thành danh sách vô dụng.

## 15.1 Một list screen không nên cố làm detail screen

Nếu một worklist cần quá nhiều thông tin chi tiết để quyết định, nên có đường mở sang detail screen, thay vì phình list screen đến mức không thể scan được.

## 15.2 Một detail screen không nên cố làm dashboard screen

Detail screens nên xoay quanh một object hoặc một item cụ thể. Nếu nhồi quá nhiều tổng quan hệ thống vào đó, hierarchy sẽ vỡ.

## 15.3 Một decision screen phải có decision context rõ hơn detail screen thường

Không thể giả định detail screen nào cũng đủ cho approvals. Các decision screens cần có framing, consequences và reasoning affordances rõ hơn.

## 15.4 Exception screen phải nêu rõ problem state trước action set

Nếu không làm rõ item đang kẹt vì sao, recovery actions sẽ thiếu định hướng và dễ sai.

## 15.5 Support/config screens phải bị giới hạn phạm vi

Khi một màn hình utility bắt đầu ôm quá nhiều job khác nhau, đó là tín hiệu nên tách hoặc tái thiết kế.

## 16. Anti-patterns về screen sprawl phải tránh

## 16.1 Mỗi feature một page mới

Khi mọi yêu cầu mới đều sinh thêm page riêng mà không map vào family nào, Web Admin sẽ nhanh chóng thành mê cung.

## 16.2 Same screen, many jobs

Một màn hình cố làm dashboard, list, detail, approval và config cùng lúc sẽ không làm tốt bất kỳ vai trò nào.

## 16.3 Modal-driven pseudo-screens everywhere

Lạm dụng modal để né quyết định taxonomy sẽ khiến interaction khó theo dõi và mất orientation.

## 16.4 Settings gravity

Nhiều sản phẩm vô thức kéo mọi khác biệt vào settings screens. Đây là con đường nhanh nhất biến Web Admin thành dumping ground.

## 16.5 Report clones as navigation substitute

Tạo nhiều report-like pages na ná nhau chỉ để bù cho IA yếu sẽ làm taxonomy phình mà không tạo clarity.

## 17. Mapping taxonomy với launch-critical scenario

Launch slice của wedge đầu tiên xoay quanh **order/request processing with branch-aware control, exceptions, and approvals**. Taxonomy phải hỗ trợ trực tiếp scenario đó.

### Giai đoạn 1 – Nhìn sức khỏe flow
- Overview Screens cho founder/ops manager thấy backlog, pending approvals, blocked items, branch hotspots.

### Giai đoạn 2 – Triage backlog
- Queue and Worklist Screens cho coordination persona lọc, nhóm và chọn items cần xử lý.

### Giai đoạn 3 – Hiểu item cụ thể
- Record Detail Screens cho người điều phối thấy context, status, ownership, details và related work.

### Giai đoạn 4 – Xử lý approvals hoặc exceptions
- Approval and Decision Screens hoặc Exception and Recovery Screens phục vụ quyết định ngoài happy path.

### Giai đoạn 5 – Tạo trust và review lại
- Traceability and History Screens hỗ trợ nhìn lại luồng xử lý, ai đã làm gì và vì sao.

### Giai đoạn 6 – Onboarding và vận hành hỗ trợ
- Operational Support Screens và Configuration/Setup Screens hỗ trợ nhập dữ liệu, sửa lỗi validation và chuẩn bị tenant readiness.

## 18. Governance rules cho screen taxonomy

Mọi đề xuất màn hình mới trong Web Admin nên đi qua các câu hỏi governance sau:

1. **Màn hình này thuộc screen family nào?**  
2. **Nó trả lời câu hỏi điều hành nào?**  
3. **Nó phục vụ persona nào?**  
4. **Nó nằm ở bước nào của operational journey?**  
5. **Nó có thực sự cần page riêng hay chỉ là sub-state của một family hiện có?**  
6. **Nó có đang trùng vai trò với screen khác không?**  
7. **Nó có làm xương sống Overview → Work → Record → Decision/Recovery rõ hơn hay mờ hơn?**  
8. **Nó có đang vô tình kéo config/support concerns vào core control spine không?**

Nếu không trả lời được rõ, màn hình đó chưa nên được thêm vào taxonomy.

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **25_FIRST_WEDGE_USER_FLOWS.md** – các luồng người dùng launch-critical xuyên các screen families.  
2. **26_STATE_AND_STATUS_PRESENTATION_RULES.md** – quy tắc biểu đạt trạng thái, blocked, overdue, waiting, approval-required.  
3. **27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES.md** – guardrails tổng quát cho Pack 03.  
4. **28_MOBILE_OPS_SCREEN_TAXONOMY.md** – taxonomy màn hình của Mobile Ops.  
5. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – patterns cho input, notes, proof và exception capture.  
6. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – landing patterns và default views theo persona.  
7. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – blueprint ở mức wireframe cho các screen families ưu tiên.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Web Admin taxonomy:

1. Web Admin được tổ chức thành **8 screen families chính thức**.  
2. Taxonomy phải phản ánh **operational role** của màn hình, không phải chỉ tên module hay page tree.  
3. Xương sống của Web Admin là **Overview → Queue/Worklist → Record Detail → Approval/Decision or Recovery**.  
4. Overview, Queue/Worklist, Record Detail và Approval/Decision là các families **launch-critical**.  
5. Exception/Recovery và Traceability/History là **high-supporting** cho trust và control quality.  
6. Support và Setup families phải hiện diện nhưng không được nuốt control spine.  
7. Mọi màn hình mới phải map vào taxonomy này trước khi đi vào thiết kế sâu hoặc build.

## 21. Điều kiện hoàn thành của tài liệu

Web Admin Screen Taxonomy được xem là đạt yêu cầu khi:
- đội UX, Product và Engineering có cùng từ điển về các loại màn hình của Web Admin;  
- mỗi screen family đã có vai trò, job-to-be-done và mức ưu tiên rõ;  
- có thể bắt đầu viết user flows và wireframe blueprints mà không tranh luận lại page types;  
- và screen sprawl về sau có thể được kiểm soát qua taxonomy này.

## AG Execution Prompt

You are acting as a senior UX architect, admin-surface systematizer, and operational experience taxonomy designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Web Admin is the primary launch-critical control surface.
- This document defines the official screen taxonomy for Web Admin.

### Objective
Refine this Web Admin Screen Taxonomy into a production-grade screen-system baseline that can guide UX decomposition, page planning, wireframe planning, frontend route planning, and launch-scope prioritization.

### Inputs
- Use this document plus Web Admin Experience Strategy, Information Architecture and Navigation Model, and the First Wedge Capability Slice as the primary source of truth.
- Preserve the control-surface logic and wedge-first launch focus.
- Keep the output useful for real downstream UX and frontend planning, not generic page categorization.

### Tasks
1. Rewrite the taxonomy thesis into a sharper executive form.
2. Produce a screen-family register with purpose, primary persona, key jobs-to-be-done, and priority tier.
3. Add a screen-relationship map showing how families connect through operational journeys.
4. Define rules for when a new page deserves its own screen versus belonging inside an existing family.
5. Identify the top five screen-sprawl risks that would weaken Web Admin.
6. Recommend the next documents that should operationalize this taxonomy into flows, wireframes, and route structures.
7. Add governance rules to prevent ad hoc page creation.

### Constraints
- Do not turn Web Admin into a module-index mega admin.  
- Do not let setup/config screens dominate the taxonomy.  
- Do not blur the distinction between overview, queue, detail, decision, and recovery screens.  
- Do not create page families that reflect internal engineering structure instead of operational UX roles.  
- Keep the output concrete enough for implementation planning.

### Output Format
Return a revised markdown document with these sections:
1. Executive Taxonomy Thesis
2. Screen Family Register
3. Screen Relationship Map
4. New-Screen Decision Rules
5. Screen-Sprawl Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the Web Admin screen system explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design and build Web Admin without ad hoc page sprawl.
- The output must reduce ambiguity between page types, route structures, and operational jobs-to-be-done.
