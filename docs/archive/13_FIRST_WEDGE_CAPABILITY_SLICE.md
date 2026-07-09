# Nextflow OS – First Wedge Capability Slice

**Document ID:** 13_FIRST_WEDGE_CAPABILITY_SLICE  
**Pack:** 02 — Product & Capability  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Domain Design / Engineering Planning  
**Dependent Packs:** Experience & UX, Architecture & Core Design, Engineering Implementation, Sales & Enablement, Deployment & Support  
**Prerequisite Documents:** 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 10_PRODUCT_OVERVIEW, 11_CAPABILITY_MAP, 12_ENGINE_BOUNDARY_SPECIFICATION

## 1. Mục tiêu tài liệu

Tài liệu này cắt ra **lát capability đầu tiên phải build thật** cho Nextflow OS để thắng wedge mở màn đã chốt: **Retail / phân phối nhẹ**. Nếu Product Overview xác định sản phẩm ở cấp cấu trúc, Capability Map xác định toàn bộ năng lực sản phẩm, và Engine Boundary Specification xác định trách nhiệm logic của từng engine, thì tài liệu này trả lời câu hỏi thực thi nhất của Pack 02: **chính xác thì giai đoạn đầu phải build đến đâu là đủ để bán được, demo được, go-live được và tạo được lợi ích rõ ràng cho khách hàng retail/distribution nhẹ mà không sa vào feature sprawl**.

Đây không phải roadmap tổng thể của toàn sản phẩm. Đây là tài liệu xác định **minimum viable but commercially credible capability slice**. Tức là lát nhỏ nhất nhưng vẫn đủ mạnh để:
- kể được câu chuyện giá trị thuyết phục;
- hỗ trợ demo theo business scenario;
- vào triển khai với biên scope tương đối rõ;
- và tạo nền để mở rộng sang wedge tiếp theo mà không phá shared core.

Nói cách khác, tài liệu này phải giải quyết mâu thuẫn kinh điển của giai đoạn đầu: **làm quá ít thì không tạo được giá trị, làm quá nhiều thì chết vì dàn trải**.

## 2. Định nghĩa “first wedge capability slice”

Trong ngữ cảnh Nextflow OS, first wedge capability slice không phải là “bản MVP kỹ thuật càng mỏng càng tốt”. Nếu MVP quá mỏng, sản phẩm sẽ chỉ trình diễn được bề mặt mà không đủ chất để vận hành. Với sản phẩm SME Business OS, lát đầu tiên phải đồng thời thỏa bốn điều kiện:

1. **Đủ thật để vận hành một flow kinh doanh quan trọng**.  
2. **Đủ rõ để tạo operational visibility cho người quản lý**.  
3. **Đủ an toàn để không gãy ngay khi gặp approvals, exceptions hoặc dữ liệu cũ**.  
4. **Đủ có cấu trúc để các phase sau có thể mở rộng thay vì đập đi làm lại**.

Vì vậy, capability slice đầu tiên phải được xác định theo logic **value slice**, không phải logic **screen slice**. Nghĩa là không hỏi “cần làm bao nhiêu màn hình”, mà hỏi “cần bao nhiêu năng lực phối hợp với nhau để một tình huống vận hành đầu tiên thật sự chạy được”.

## 3. Tình huống kinh doanh trung tâm của wedge đầu tiên

Wedge đầu tiên của Nextflow OS là Retail / phân phối nhẹ. Tuy nhiên, “retail / distribution” là một không gian quá rộng nếu không chọn một business scenario đủ cụ thể. Vì vậy lát đầu tiên phải xoay quanh một tình huống trung tâm:

> **Quản lý và kiểm soát luồng xử lý đơn hàng / yêu cầu vận hành có ngoại lệ, có phê duyệt và có nhu cầu nhìn trạng thái theo chi nhánh hoặc điểm vận hành**.

Cách diễn đạt này cố ý rộng vừa đủ để dùng cho nhiều biến thể của retail/distribution nhẹ, nhưng đủ cụ thể để chốt capability. Nó không giới hạn Nextflow OS vào một POS replacement hay inventory suite. Thay vào đó, nó tập trung vào phần pain rõ nhất và phù hợp nhất với định vị SME Business OS:
- flow có nhiều bước xử lý;  
- nhiều vai trò tham gia;  
- có ngoại lệ;  
- có approvals;  
- có nhu cầu kiểm soát theo branch/site;  
- và hiện trạng thường đang bị phân mảnh giữa chat, spreadsheet và thói quen xử lý thủ công.

## 4. Outcome phải tạo ra ở phase đầu

Capability slice đầu tiên không nên được xét bằng tiêu chí “đã có bao nhiêu chức năng”. Nó nên được xét bằng **outcomes bắt buộc**. Nếu không tạo được các outcomes sau, slice đầu tiên chưa đủ mạnh.

### 4.1 Outcome 1 – Một flow xử lý chính chạy được end-to-end

Khách hàng phải có khả năng đưa ít nhất một luồng công việc chính vào hệ thống từ lúc tạo record đến lúc hoàn tất hoặc đóng. Điều này bao gồm tạo record, theo dõi trạng thái, giao việc, xử lý từng bước, duyệt ngoại lệ và kết thúc flow.

### 4.2 Outcome 2 – Người quản lý nhìn thấy sự thật vận hành tốt hơn cách cũ

Owner, head of ops hoặc branch supervisor phải nhìn rõ:
- cái gì đang chờ xử lý;  
- cái gì bị chậm;  
- cái gì đang chờ duyệt;  
- chi nhánh/điểm nào đang có vấn đề;  
- và ngoại lệ đang nằm ở đâu.

Nếu không có control visibility đủ mạnh, sản phẩm sẽ dễ bị nhìn như “một chỗ nhập dữ liệu mới” thay vì một operating system.

### 4.3 Outcome 3 – Đội vận hành xử lý công việc ít hỗn loạn hơn

Frontline, back office hoặc vận hành chi nhánh phải có nơi nhận việc, cập nhật trạng thái, đính kèm bằng chứng hoặc ghi chú theo cách có cấu trúc hơn. Hệ thống không nhất thiết loại bỏ mọi chat ngay từ đầu, nhưng nó phải giảm được mức phụ thuộc vào chat và trí nhớ con người.

### 4.4 Outcome 4 – Ngoại lệ và phê duyệt được kéo vào trong hệ thống

Phần tạo giá trị lớn nhất thường không nằm ở happy path, mà nằm ở ngoại lệ: giảm giá, đổi trạng thái ngoài chuẩn, yêu cầu override, thông tin thiếu, xử lý chậm hoặc chuyển cấp. Slice đầu tiên phải kéo được các ngoại lệ quan trọng vào hệ thống.

### 4.5 Outcome 5 – Có đường nhập dữ liệu và bắt đầu an toàn

Doanh nghiệp SME hiếm khi bắt đầu từ dữ liệu sạch hoàn toàn. Slice đầu tiên phải hỗ trợ ít nhất một con đường import dữ liệu cơ bản, gắn context theo branch/site, và tạo mức tin cậy đủ để khách hàng thử dùng thật.

## 5. Persona nào phải được phục vụ ở lát đầu tiên

Không phải tất cả personas đều phải được phục vụ sâu như nhau ở phase đầu. Lát capability đầu tiên phải ưu tiên ba nhóm người dùng trung tâm.

### 5.1 Persona A – Founder / Owner / COO

Đây là người muốn nhìn toàn cục, biết cái gì đang tắc, chi nhánh nào đang kém, ngoại lệ nào đang tăng, và liệu hệ thống có thực sự tạo ra trật tự hơn không. Với persona này, giá trị chính đến từ dashboard, approval visibility và branch-level oversight.

### 5.2 Persona B – Operations Manager / Back Office Lead

Đây là người cần điều hành flow hằng ngày. Họ cần record list, queue, assignment, phê duyệt, exception handling, tracking và báo cáo vận hành cơ bản.

### 5.3 Persona C – Branch Supervisor / Frontline Operator

Đây là người nhận việc và cập nhật việc. Họ không cần toàn bộ hệ thống; họ cần một task-centered experience đơn giản, rõ việc, rõ trạng thái và thao tác nhanh.

Nếu một capability không giúp ít nhất một trong ba persona này đạt outcome rõ hơn ở wedge đầu tiên, capability đó nên bị hạ ưu tiên.

## 6. Phạm vi nghiệp vụ của slice đầu tiên

Để không lan man, slice đầu tiên phải được chốt quanh một phạm vi nghiệp vụ tương đối rõ.

### 6.1 In-scope nghiệp vụ

- Tạo và theo dõi operational records dạng order-like / request-like.  
- Gắn branch/site context cho records.  
- Phân công xử lý theo queue hoặc assignee.  
- Cập nhật trạng thái record và trạng thái công việc.  
- Xử lý approval cho một số ngoại lệ hoặc quyết định quan trọng.  
- Theo dõi backlog, pending approvals, overdue items, branch performance cơ bản.  
- Hỗ trợ import dữ liệu ban đầu ở mức đủ dùng.  
- Ghi lịch sử thay đổi và hiển thị history đủ tin cậy.

### 6.2 Out-of-scope nghiệp vụ ở phase đầu

- Accounting sâu hoặc sổ cái tài chính đầy đủ.  
- POS replacement toàn diện.  
- Inventory management quá sâu với tất cả biến thể kho phức tạp.  
- Procurement suite đầy đủ.  
- CRM bán hàng rộng.  
- Advanced forecasting.  
- Marketplace hoặc ecosystem partner motion hoàn chỉnh.  
- AI copilot sâu cho mọi role.

Việc chốt out-of-scope này rất quan trọng. Nó bảo vệ lát đầu tiên khỏi việc bị kéo sang một “mini ERP” không đáy.

## 7. Capability domains nào nằm trong slice đầu tiên

Từ Capability Map, slice đầu tiên của wedge retail/distribution phải lấy một phần đủ sâu từ các domains sau.

## 7.1 Domain 1 – Identity, Tenant, and Governance

### Phần bắt buộc
- Tenant setup cơ bản.  
- User creation và role assignment ở mức thực dụng.  
- Branch-aware access scope.  
- Audit trail cho actions quan trọng.

### Lý do cần có
Không có phân quyền và scope đúng, sản phẩm sẽ không thể phản ánh đúng cấu trúc owner – ops – branch supervisor – operator. Không có audit trail, approvals và overrides sẽ thiếu độ tin cậy.

### Mức độ sâu cần đạt
Không cần policy security quá phức tạp ở phase đầu, nhưng phải đủ để:
- người quản lý thấy dữ liệu toàn cục;  
- branch chỉ thấy phần liên quan;  
- actions quan trọng có thể truy vết được.

## 7.2 Domain 2 – Relationship and Context Management

### Phần bắt buộc
- Party/account context ở mức cơ bản.  
- Branch/site/location context.  
- Ownership/team context tối thiểu cho queues và assignments.

### Lý do cần có
Retail/distribution nhẹ gần như luôn có logic theo chi nhánh, điểm vận hành hoặc khu vực xử lý. Nếu không có context đúng, mọi dashboard và approval sẽ trở nên mù hoặc quá phẳng.

### Mức độ sâu cần đạt
Không cần biến domain này thành CRM đầy đủ. Cần đủ để records, tasks, queues, approvals và dashboards đều có ngữ cảnh đúng.

## 7.3 Domain 3 – Work and Process Orchestration

### Phần bắt buộc
- Task and work item management.  
- State/lifecycle orchestration ở mức flow chính.  
- Assignment and queue management.  
- Exception and escalation handling cơ bản.

### Lý do cần có
Đây là phần biến hệ thống từ nơi lưu record thành nơi công việc thật sự chạy. Không có domain này, Nextflow OS sẽ không tạo cảm giác “điều hành vận hành”, chỉ tạo cảm giác “quản lý dữ liệu”.

### Mức độ sâu cần đạt
Phải đủ để biểu diễn ít nhất:
- new / in progress / pending approval / blocked / done / cancelled;  
- queue theo branch hoặc team;  
- reassignment cơ bản;  
- escalation hoặc overdue flag cơ bản.

## 7.4 Domain 4 – Transaction and Operational Records

### Phần bắt buộc
- Operational record type đầu tiên dạng order-like / request-like.  
- Transaction lifecycle control.  
- Line items/details ở mức thực dụng.  
- Status history.  
- Attachments/evidence ở mức đủ dùng nếu có mobile hoặc proof capture.

### Lý do cần có
Đây là business truth của slice đầu tiên. Nếu record không đủ mạnh, mọi thứ phía trên như workflow, dashboard, approval và import đều chỉ là lớp bề mặt.

### Mức độ sâu cần đạt
Record model phải đủ để:
- thể hiện đối tượng cần xử lý;  
- gắn branch/site, owner và trạng thái;  
- lưu các chi tiết quan trọng;  
- và chịu được audit/history.

## 7.5 Domain 5 – Control, Approval, and Policy Enforcement

### Phần bắt buộc
- Approval flow management cho một tập ngoại lệ rõ.  
- Policy evaluation cơ bản.  
- Override control ở các hành động nhạy cảm.  
- SLA/threshold ở mức cảnh báo hoặc overdue.

### Lý do cần có
Nếu phase đầu chỉ làm happy path, khách hàng sẽ không thấy khác biệt đủ lớn so với cách quản lý thủ công. Approval và exception control là nơi sản phẩm bắt đầu tạo operational discipline thật sự.

### Mức độ sâu cần đạt
Không cần rule engine tổng quát quá sớm. Cần đủ để mô hình hóa:
- ai được duyệt;  
- trường hợp nào phải duyệt;  
- khi từ chối hoặc override thì hệ thống ghi gì;  
- cái gì bị coi là ngoại lệ hoặc quá ngưỡng.

## 7.6 Domain 6 – Experience, Communication, and Portal Delivery

### Phần bắt buộc
- Web Admin cho manager/back office.  
- Mobile Ops hoặc PWA task experience tối thiểu cho supervisor/operator.  
- Notification cơ bản cho approvals, assignments, overdue hoặc status changes.

### Lý do cần có
Nếu tất cả chỉ tồn tại trong một web dashboard nặng, frontline adoption sẽ yếu. Nếu chỉ có mobile mà không có control views, người quản lý sẽ không tin hệ thống đủ mạnh. Slice đầu tiên cần ít nhất hai surface có vai trò khác nhau: control surface và execution surface.

### Mức độ sâu cần đạt
Customer Portal và Partner Portal chưa cần ưu tiên sâu ở lát đầu tiên của retail/distribution, trừ khi có một use case rất cụ thể biện minh cho chúng.

## 7.7 Domain 7 – Integration, Migration, and Data Exchange

### Phần bắt buộc
- Import and data intake.  
- Data mapping cơ bản.  
- Validation cơ bản.  
- Migration workspace mức tối thiểu nếu có import theo batch.

### Lý do cần có
Nhiều SME retail/distribution đang sống với spreadsheet, file thủ công hoặc hệ cũ không đồng nhất. Nếu không có con đường nhập dữ liệu đủ tin cậy, phase đầu sẽ khó chuyển từ demo sang sử dụng thật.

### Mức độ sâu cần đạt
Không cần connector ecosystem rộng ở phase đầu. Nhưng import phải đủ thật để không biến go-live thành công việc copy/paste không kiểm soát.

## 7.8 Domain 8 – Insight, Reporting, and Intelligence

### Phần bắt buộc
- Operational dashboarding.  
- Pending approvals view.  
- Backlog / overdue / blocked view.  
- Branch-level visibility cơ bản.  
- Export/report cơ bản cho ops và founder.

### Lý do cần có
Đây là phần khiến founder hoặc head of ops thấy rằng Nextflow OS tạo ra control thật, chứ không chỉ là một hệ ghi chép.

### Mức độ sâu cần đạt
Không cần advanced BI hoặc AI insight ở phase đầu. Nhưng dashboard phải cho thấy trạng thái sống của hệ thống đủ rõ trong 30 giây đầu demo.

## 8. Capability stack tối thiểu của lát đầu tiên

Để lát đầu tiên chạy được, các capability sau cần hiện diện như một stack phối hợp chặt chẽ.

### 8.1 Capability A – Branch-aware operational records

Hệ thống phải cho phép tạo và quản lý record gắn với branch/site, owner và trạng thái. Đây là nền của mọi thứ khác.

### 8.2 Capability B – Queue-based work handling

Records phải kéo theo hoặc liên kết được với work items/queues để đội vận hành biết việc gì cần làm tiếp.

### 8.3 Capability C – Controlled state transitions

Không thể cho phép trạng thái bị đổi tùy ý như trên spreadsheet. Transition phải có ngữ nghĩa và có kiểm soát.

### 8.4 Capability D – Exception and approval capture

Các trường hợp vượt ngưỡng hoặc đi ngoài chuẩn phải được đẩy vào approval/exception flow thay vì ra ngoài chat.

### 8.5 Capability E – Operator execution surface

Phải có bề mặt đủ gọn cho người xử lý việc hằng ngày, ít nhất ở mức task list, open items, update status và add note/evidence.

### 8.6 Capability F – Manager control surface

Phải có bề mặt để người quản lý nhìn queue health, approvals, overdue items, branch comparisons và status overview.

### 8.7 Capability G – Initial data onboarding

Phải có cách đưa dữ liệu khởi đầu vào hệ thống và kiểm tra dữ liệu đó đủ để dùng cho flow đầu tiên.

## 9. Core business scenario của slice đầu tiên

Để Product, UX, Engineering và Sales cùng nói một ngôn ngữ, slice đầu tiên nên được xoay quanh một business scenario chuẩn.

### Scenario: “Order / request đi qua nhiều bước xử lý và có ngoại lệ cần phê duyệt”

#### Bước 1 – Tạo record
Một record mới được tạo cho một đơn/yêu cầu, gắn branch/site, party context, các chi tiết chính và người phụ trách ban đầu.

#### Bước 2 – Vào queue xử lý
Record hoặc công việc liên quan đi vào queue của team hoặc chi nhánh phù hợp.

#### Bước 3 – Nhân viên hoặc supervisor cập nhật tiến trình
Người xử lý nhận việc, cập nhật trạng thái, thêm ghi chú hoặc bằng chứng nếu cần.

#### Bước 4 – Gặp ngoại lệ
Nếu có trường hợp vượt policy hoặc nằm ngoài chuẩn, hệ thống tạo approval requirement hoặc escalation path.

#### Bước 5 – Quản lý duyệt hoặc từ chối
Manager xem pending approvals, duyệt/từ chối/ghi lý do/override theo quyền.

#### Bước 6 – Flow tiếp tục hoặc bị chặn
Nếu được duyệt, flow tiếp tục; nếu bị từ chối hoặc thiếu dữ liệu, record/task chuyển sang trạng thái phù hợp.

#### Bước 7 – Kết thúc và ghi nhận lịch sử
Khi hoàn tất, record giữ history, outcome và xuất hiện đúng trong dashboards/reporting.

Đây là scenario chuẩn vì nó chạm đủ business truth, task orchestration, approvals, branch context và control visibility mà không đòi quá nhiều module ngoài phạm vi.

## 10. Surface strategy của slice đầu tiên

Slice đầu tiên không nên cố làm đủ mọi surface. Nó nên có cấu trúc bề mặt tối thiểu nhưng mạnh.

## 10.1 Web Admin – Surface số 1

### Vai trò
- Control center cho founder, ops manager, back office, branch supervisor.  
- Nơi xem record lists, dashboards, approvals, overdue items, settings cơ bản và import workflows.

### Phải có
- Dashboard overview.  
- Record list / filters.  
- Record detail view.  
- Approval inbox.  
- Queue / backlog view.  
- Import entrypoint cơ bản.  
- Branch/site filters.

### Không cần quá sớm
- Advanced report builder.  
- Quá nhiều customization UI.  
- Deep admin center cho mọi thứ nhỏ lẻ.

## 10.2 Mobile Ops / PWA – Surface số 2

### Vai trò
- Nơi operator hoặc supervisor thực thi việc hằng ngày.  
- Tối ưu cho tốc độ và tính rõ ràng, không phải cho cấu hình sâu.

### Phải có
- My tasks / team tasks.  
- Open items needing action.  
- Quick status update.  
- Note / evidence capture cơ bản.  
- Exception flag hoặc request approval trigger nếu có.

### Không cần quá sớm
- Mirror toàn bộ web admin.  
- Analytics sâu.  
- Setup/config surfaces.

## 10.3 Customer Portal – chưa phải trọng tâm của slice đầu tiên

Ở wedge retail/distribution đầu tiên, customer portal có thể hữu ích về sau nhưng chưa bắt buộc để thắng use case đầu. Nếu cố thêm quá sớm, scope sẽ loãng.

## 10.4 Partner Portal – để phase sau

Partner Portal chỉ nên được nghĩ như phần mở rộng của delivery model, không phải thành phần launch-critical của lát capability đầu tiên.

## 11. Boundary implications cho slice đầu tiên

Capability slice đầu tiên chỉ an toàn nếu tuân thủ boundary đã chốt ở tài liệu Engine Boundary Specification.

### 11.1 Operational Record Engine phải giữ truth của flow chính

Record type đầu tiên, lifecycle, line items/details, history và domain actions phải nằm trong Operational Record Engine.

### 11.2 Work Orchestration Engine phải giữ task/queue truth

Queue, assignment, overdue, blocked, reassignment và progression ở cấp work phải thuộc engine orchestration, không được phân tán ở UI hoặc dashboard queries.

### 11.3 Approval & Policy Engine phải được dùng thật

Dù phase đầu chỉ cần mức cơ bản, approvals và thresholds vẫn phải được neo vào engine policy, thay vì hard-code riêng từng màn hình.

### 11.4 Pack & Configuration Engine phải hỗ trợ template đầu tiên

Ngay cả slice đầu tiên cũng phải được đóng gói theo tư duy pack/preset, không nên làm một flow hard-code riêng cho một khách hàng mẫu.

### 11.5 Insight & Control Engine phải là derived layer

Dashboard và queue visibility có thể đọc từ multiple engines, nhưng không được tự trở thành write truth shortcut.

## 12. Launch-critical feature families trong slice đầu tiên

Dưới đây là các họ tính năng nên được coi là launch-critical, nhưng phải luôn được hiểu là biểu hiện của capabilities chứ không phải trung tâm tư duy sản phẩm.

### 12.1 Record lifecycle family
- Create / edit / view record.  
- Record status transitions.  
- Record history.  
- Context attachments.

### 12.2 Task and queue family
- Task generation or association.  
- Queue list.  
- My work / team work.  
- Reassignment cơ bản.  
- Overdue markers.

### 12.3 Approval family
- Approval required state.  
- Approval inbox.  
- Approve / reject / comment.  
- Override logging.

### 12.4 Control dashboard family
- Total open items.  
- Items by status.  
- Items by branch.  
- Pending approvals.  
- Overdue or blocked items.

### 12.5 Data onboarding family
- Import template.  
- Mapping field cơ bản.  
- Validation errors.  
- Import result summary.

### 12.6 Operator execution family
- Quick updates.  
- Notes.  
- Proof or attachment capture cơ bản.  
- Today/open workload view.

## 13. Điều gì chưa cần trong slice đầu tiên

Để bảo vệ focus, các phần sau **chưa cần** hoặc chỉ nên làm ở mức tượng trưng nếu phục vụ demo:

- advanced custom report builder;  
- generalized workflow builder cho end-user;  
- connector marketplace;  
- complex scheduling engine;  
- deep customer self-service flows;  
- advanced AI copilots;  
- fully generic rule engine;  
- multi-vertical abstractions vượt quá wedge đầu tiên.

Không phải vì các phần này không quan trọng, mà vì chúng không nên dẫn dắt launch slice trước khi flow đầu tiên đã thắng được trong thực tế.

## 14. Chỉ số thành công của slice đầu tiên

Slice đầu tiên nên được đánh giá bằng các chỉ số outcome-oriented thay vì vanity metrics.

### 14.1 Adoption metrics
- Số người dùng xử lý việc qua hệ thống.  
- Tỷ lệ work items được cập nhật đúng quy trình.  
- Tỷ lệ approvals diễn ra trong hệ thống thay vì ngoài hệ thống.

### 14.2 Control metrics
- Số lượng items có trạng thái rõ.  
- Tỷ lệ overdue nhìn thấy được.  
- Thời gian trung bình từ tạo record đến xử lý xong ở flow đầu tiên.

### 14.3 Migration/onboarding metrics
- Tỷ lệ import thành công.  
- Tỷ lệ records có branch/context hợp lệ.  
- Số lỗi validation lớn trong lần onboarding đầu.

### 14.4 Commercial metrics
- Demo-to-pilot conversion.  
- Pilot-to-go-live conversion.  
- Time-to-first-value.  
- Số lượng yêu cầu custom nằm ngoài guardrails.

## 15. Rủi ro lớn nhất của slice đầu tiên

### 15.1 Rủi ro 1 – Xây quá giống mini ERP

Nếu ôm quá nhiều financials, inventory depth hoặc module breadth, slice đầu tiên sẽ chậm, đắt và loãng định vị.

### 15.2 Rủi ro 2 – Xây quá giống workflow demo

Nếu có tasks và statuses nhưng record truth, approvals và branch control quá yếu, khách hàng sẽ thấy đây chỉ là một tool điều phối đẹp hơn chứ chưa phải Business OS.

### 15.3 Rủi ro 3 – Thiếu control surface cho manager

Nếu chỉ làm execution surface cho operator mà thiếu dashboard và approval visibility, người mua sẽ không thấy giá trị chiến lược.

### 15.4 Rủi ro 4 – Thiếu con đường import/onboarding

Nếu sản phẩm đẹp nhưng không đưa được dữ liệu khởi đầu vào, demo sẽ không chuyển thành sử dụng thật.

### 15.5 Rủi ro 5 – Hard-code cho một khách hàng mẫu

Nếu slice đầu tiên được làm như dự án riêng trá hình, shared core và pack strategy sẽ hỏng ngay ở ngày đầu.

## 16. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định quan trọng sau cho wedge đầu tiên của Nextflow OS:

1. Lát capability đầu tiên phải xoay quanh **order/request processing with branch-aware control, exceptions, and approvals**.  
2. Slice đầu tiên phải phục vụ rõ ba personas: owner/COO, ops/back office, branch supervisor/operator.  
3. Các domains bắt buộc phải có độ sâu đủ dùng là Identity/Governance, Context, Work Orchestration, Operational Records, Approval/Policy, Experience Delivery, Integration/Migration và Insight/Control.  
4. Web Admin và Mobile Ops/PWA là hai surfaces trọng tâm của slice đầu tiên.  
5. Customer Portal và Partner Portal chưa phải launch-critical trong wedge đầu tiên.  
6. Success của slice đầu tiên phải được đo bằng khả năng vận hành flow thật, tạo visibility thật và onboarding được thật — không chỉ bằng số feature hoàn thành.

## 17. Điều kiện hoàn thành của tài liệu

First Wedge Capability Slice được xem là đạt yêu cầu khi:
- Product, UX, Engineering và Sales cùng chỉ được một business scenario trung tâm;  
- có danh sách rõ capability nào là launch-critical cho retail/distribution;  
- có ranh giới rõ giữa in-scope và out-of-scope;  
- và có thể chuyển tiếp sang tài liệu Experience Strategy, Capability Roadmap và Engineering Implementation Plan mà không cần tranh luận lại “wedge đầu tiên thực sự là gì”.

## AG Execution Prompt

You are acting as a senior product strategy operator, capability-slicing architect, and launch-planning analyst.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- First GTM wedge: retail / light distribution.
- Product baseline: shared core, capability engines, workflow orchestration, template-driven delivery, branch-aware operations, web-first and mobile-assisted surfaces.
- This document defines the minimum viable but commercially credible capability slice for the first wedge.

### Objective
Refine this First Wedge Capability Slice into a production-grade launch-scope document that can guide product prioritization, UX definition, engineering planning, demo design, and pilot delivery.

### Inputs
- Use this document plus Wedge Strategy, Product Overview, Capability Map, and Engine Boundary Specification as the primary source of truth.
- Preserve the wedge-first strategy and the distinction between launch-critical versus later-phase capabilities.
- Keep the output focused on a usable first slice, not a broad roadmap for every possible vertical.

### Tasks
1. Rewrite the first-wedge scope into a sharper launch thesis.
2. Produce a capability register for the wedge slice with priority, rationale, owning engine, and primary persona impact.
3. Produce a business-scenario map showing the end-to-end flow and where each capability participates.
4. Add a launch-readiness checklist covering product, UX, engineering, data onboarding, and demo assets.
5. Identify the top scope-creep risks and create guardrails against them.
6. Mark what is mandatory for pilot go-live versus what is acceptable to defer.
7. Recommend how this slice should constrain the next documents: Experience Strategy and Implementation Plan.

### Constraints
- Do not turn the first slice into a mini-ERP.
- Do not reduce it into a superficial workflow demo.
- Do not remove approvals, exceptions, or control visibility from the core slice.
- Do not drift away from retail/light-distribution branch-aware operations.
- Keep the output specific enough for real launch planning.

### Output Format
Return a revised markdown document with these sections:
1. Executive Launch Thesis
2. Capability Register for First Wedge
3. Scenario-to-Capability Map
4. Launch Readiness Checklist
5. Scope Guardrails
6. Pilot Go-Live Minimums
7. Downstream Constraints
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the first wedge scope highly concrete.
- The slice must remain consistent with Nextflow OS as an SME Business OS.
- The document must help downstream teams avoid both under-building and over-building.
- The result must be usable for product prioritization, demo planning, and pilot rollout preparation.
