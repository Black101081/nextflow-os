# Nextflow OS – Capability Map

**Document ID:** 11_CAPABILITY_MAP  
**Pack:** 02 — Product & Capability  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Platform Architecture / Domain Design  
**Dependent Packs:** Engine Boundary Specification, Experience & UX, Architecture & Core Design, Engineering Implementation, Sales & Enablement  
**Prerequisite Documents:** 10_PRODUCT_OVERVIEW, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG

## 1. Mục tiêu tài liệu

Tài liệu này xác định **bản đồ capability chính thức** của Nextflow OS. Nếu Product Overview mô tả sản phẩm như một product system gồm nhiều lớp, thì Capability Map trả lời câu hỏi quan trọng hơn ở cấp thiết kế sản phẩm: **cụ thể sản phẩm có những capability nào, capability nào là lõi, capability nào phục vụ wedge đầu tiên, capability nào là lớp hỗ trợ, và capability nào nên để phase sau**.

Đây là tài liệu trung tâm để tránh hai sai lầm rất phổ biến:
- biến sản phẩm thành một danh sách feature rời rạc;  
- hoặc chia sản phẩm theo ngành/quy trình cụ thể quá sớm, khiến shared core bị phá vỡ.

Capability Map phải giúp mọi team nhìn sản phẩm bằng cùng một ngôn ngữ. Product dùng nó để chốt roadmap. UX dùng nó để biết màn hình nào là biểu hiện của capability nào. Architecture dùng nó để chốt service boundaries. Engineering dùng nó để ưu tiên build order. Sales dùng nó để biết nên kể câu chuyện giá trị ở capability nào thay vì đọc feature list.

## 2. Capability trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, capability không phải là một nút menu, một màn hình, hay một tập endpoint đơn lẻ. Capability là một **năng lực sản phẩm có ý nghĩa nghiệp vụ**, đủ lớn để tạo outcome, nhưng đủ cụ thể để thiết kế boundary, ownership và roadmap.

Một capability tốt phải thỏa bốn điều:
1. Giải quyết một loại vấn đề nghiệp vụ rõ ràng.  
2. Có thể phục vụ nhiều template hoặc nhiều vertical pack khác nhau.  
3. Có thể được hiện thực hóa qua nhiều surface mà vẫn giữ một business truth thống nhất.  
4. Có thể phát triển theo phase mà không làm gãy logic tổng thể của sản phẩm.

Ví dụ, “Order Control” là một capability tốt. Nhưng “màn hình đơn hàng cho retail” chưa phải capability; đó là một biểu hiện cụ thể của capability trên một wedge và một surface nhất định.

## 3. Nguyên tắc tổ chức capability

Capability Map của Nextflow OS phải tuân theo bảy nguyên tắc.

### 3.1 Tổ chức theo năng lực nghiệp vụ, không theo ngành

Sản phẩm không được chia thành “module cho retail”, “module cho spa”, “module cho phân phối” như các khối sản phẩm độc lập. Cách đúng là định nghĩa capability dùng chung, rồi dùng template/pack để biểu hiện capability đó theo từng bối cảnh ngành.

### 3.2 Capability đi trước feature

Feature chỉ nên được định nghĩa sau khi capability đã rõ. Nếu đi ngược lại, roadmap sẽ nhanh chóng biến thành một backlog lặt vặt theo yêu cầu khách hàng riêng lẻ.

### 3.3 Capability phải map được với wedge

Mọi capability trong giai đoạn đầu phải trả lời được: nó giúp wedge đầu tiên thắng nhanh hơn như thế nào. Nếu không có liên hệ rõ, capability đó nên bị hạ ưu tiên.

### 3.4 Capability phải map được với outcome

Capability tồn tại không phải để “cho đủ hệ thống”, mà để tạo outcome như: vào vận hành nhanh hơn, kiểm soát tốt hơn, giảm ngoại lệ, nhìn rõ trạng thái, migrate an toàn hơn, hoặc mở rộng quy trình bớt hỗn loạn hơn.

### 3.5 Capability phải có đường đi tới engine boundary

Capability Map không phải tài liệu kỹ thuật, nhưng nó phải đủ cấu trúc để tài liệu Engine Boundary Specification có thể kế thừa. Một capability không thể mơ hồ đến mức không biết đâu là business truth, đâu là orchestration, đâu là policy, đâu là view layer.

### 3.6 Capability phải có tier ưu tiên

Không phải mọi capability đều quan trọng như nhau. Mỗi capability phải được gắn tier để biết đâu là:
- Launch-critical.  
- Launch-supporting.  
- Phase-next.  
- Strategic-later.

### 3.7 Capability phải có shared-core discipline

Nếu một capability chỉ có ý nghĩa cho một ngành cực hẹp và không có khả năng khái quát, nó không nên nằm trong capability core ở giai đoạn này. Những khác biệt quá hẹp nên đi vào pack, template hoặc policy layer trước khi trở thành capability chính thức.

## 4. Bản đồ capability cấp cao

Capability Map của Nextflow OS được tổ chức thành 8 capability domains lớn. Mỗi domain bao gồm một hoặc nhiều capability cụ thể. Các domain này không phải là verticals; chúng là các vùng năng lực của một SME Business OS.

1. **Identity, Tenant, and Governance**  
2. **Relationship and Context Management**  
3. **Work and Process Orchestration**  
4. **Transaction and Operational Records**  
5. **Control, Approval, and Policy Enforcement**  
6. **Experience, Communication, and Portal Delivery**  
7. **Integration, Migration, and Data Exchange**  
8. **Insight, Reporting, and Intelligence**

Nhìn ở cấp cao, 8 domains này tạo thành cấu trúc logic cho sản phẩm:
- domain 1 tạo nền;  
- domains 2–5 tạo business truth và operating discipline;  
- domain 6 phân phối trải nghiệm;  
- domain 7 bảo đảm safe adoption và coexistence;  
- domain 8 biến dữ liệu thành control và insight.

## 5. Domain 1 – Identity, Tenant, and Governance

Đây là domain nền, không trực tiếp tạo wedge value một mình, nhưng là điều kiện để toàn bộ hệ thống giữ được multi-tenant discipline, phân quyền, audit và configurability.

### 5.1 Tenant Management

**Mục đích**  
Tạo, quản lý và cô lập tenant; định nghĩa plan context, region context, branding context và các cài đặt tenant-wide.

**Giá trị sản phẩm**  
Cho phép Nextflow OS vận hành như một nền tảng thật, không phải một deployment tách rời cho từng khách hàng.

**Vai trò đối với roadmap**  
Launch-critical ở cấp platform, dù không phải capability để bán trực tiếp trong demo.

### 5.2 User, Role, and Access Scope

**Mục đích**  
Quản lý user identities, roles, teams, branch scope, assignment scope và các quyền truy cập cơ bản/động.

**Outcome tạo ra**
- Người đúng thấy đúng việc.  
- Có thể phân biệt owner, manager, back office, operator, partner, customer.  
- Tạo nền cho Web Admin, Mobile Ops, Customer Portal và Partner Portal.

### 5.3 Audit and Activity Trail

**Mục đích**  
Ghi nhận thay đổi quan trọng, activity logs, approval trail, operational actions và sự kiện đủ để truy vết.

**Ý nghĩa**  
Đây là capability nền để doanh nghiệp cảm thấy hệ thống “có kỷ luật”, đặc biệt quan trọng khi thay thế quy trình ngoài luồng hoặc hệ cũ thiếu traceability.

### 5.4 Configuration Registry

**Mục đích**  
Quản lý các thiết lập tenant-wide, registry của packs, flags, labels, conventions và metadata attachments ở mức nền.

**Lưu ý**  
Capability này không được trở thành “chỗ nhét mọi thứ”. Nó là registry có cấu trúc, không phải dumping ground.

## 6. Domain 2 – Relationship and Context Management

Domain này định nghĩa ngữ cảnh kinh doanh mà các flow vận hành xoay quanh. Nó không chỉ là CRM theo nghĩa bán hàng; nó là lớp bối cảnh giúp các transaction, workflows và tasks biết chúng đang phục vụ ai, ở đâu, thuộc team nào, thuộc branch nào, và gắn với đối tượng nào.

### 6.1 Party and Account Context

**Mục đích**  
Quản lý các thực thể quan hệ như doanh nghiệp khách hàng, cá nhân liên hệ, nhà cung cấp, đối tác hoặc actor khác mà flow vận hành cần biết đến.

**Giá trị**  
Đảm bảo các records và tasks không tồn tại trôi nổi, mà luôn bám vào một business party context cụ thể.

### 6.2 Location, Branch, and Site Context

**Mục đích**  
Biểu diễn chi nhánh, điểm vận hành, kho, site dịch vụ hoặc các địa điểm có ý nghĩa nghiệp vụ.

**Tầm quan trọng**  
Đây là capability then chốt cho wedge retail/distribution và multi-branch operations, đồng thời quan trọng với service chains và field operations.

### 6.3 Team and Ownership Context

**Mục đích**  
Quản lý ai chịu trách nhiệm, team nào sở hữu flow, group nào nhận queue, và cấu trúc ownership của công việc.

**Tác động**  
Nó giúp work orchestration và control layer không trở thành “hệ vô chủ”.

### 6.4 Asset / Resource Context

**Mục đích**  
Biểu diễn các đối tượng vận hành như tài sản, phòng, phương tiện, slot, bàn, resource hoặc đối tượng gắn với lịch và thực thi.

**Vai trò roadmap**  
Launch-supporting cho wedge dịch vụ theo lịch; phase-next cho một số vertical khác; strategic-later nếu mở sang field asset-heavy flows.

## 7. Domain 3 – Work and Process Orchestration

Đây là domain giúp công việc “chạy” được trong hệ thống. Nếu domain 2 cung cấp ngữ cảnh, thì domain 3 điều phối tiến trình, assignments, states, queues và handoffs.

### 7.1 Task and Work Item Management

**Mục đích**  
Tạo và quản lý các work items, action items, follow-ups, sub-tasks hoặc operational units mà người dùng cần xử lý.

**Outcome**
- Công việc được hiện thực hóa thành thứ có thể giao, theo dõi, đóng và kiểm soát.  
- Mobile Ops có thứ để hiển thị ngoài hiện trường.  
- Web Admin có backlog và queues để kiểm soát.

### 7.2 State and Lifecycle Orchestration

**Mục đích**  
Định nghĩa và điều phối vòng đời của các flow hoặc records: từ tạo mới, chờ xử lý, đang xử lý, chờ duyệt, hoàn tất, hủy, ngoại lệ, escalated.

**Giá trị**  
Đây là capability trung tâm của structured operations. Không có lifecycle discipline, hệ thống chỉ là nơi lưu trạng thái thủ công.

### 7.3 Assignment and Queue Management

**Mục đích**  
Quản lý ai nhận việc, việc nào vào queue nào, cách phân phối theo rule, branch, shift, team hoặc owner.

**Giá trị**  
Đây là capability thiết yếu cho tốc độ xử lý và giảm hỗn loạn trong các flow nhiều người tham gia.

### 7.4 Scheduling and Time-slot Coordination

**Mục đích**  
Xử lý logic lịch, slot, thời gian, appointment, dispatch time hoặc các yếu tố liên quan tới điều phối theo thời gian.

**Vai trò roadmap**  
Launch-supporting nếu gắn với wedge dịch vụ theo lịch; phase-next cho wedge retail/distribution; strategic-later khi mở rộng sang field service phức tạp hơn.

### 7.5 Exception and Escalation Handling

**Mục đích**  
Biểu diễn các tình huống ngoại lệ, quá hạn, blocked, failed handoff, missing info hoặc cần chuyển cấp.

**Tầm quan trọng**  
Nhiều hệ thống chỉ mô hình hóa happy path. Nextflow OS muốn tạo operational clarity thì phải có capability xử lý exception như first-class citizen.

## 8. Domain 4 – Transaction and Operational Records

Đây là domain giữ các records cốt lõi mà doanh nghiệp quan tâm. Nó là phần gần nhất với “business truth” trong nhiều flow. Tên domain này cố ý rộng để không khóa sản phẩm vào một loại giao dịch duy nhất.

### 8.1 Operational Record Management

**Mục đích**  
Quản lý các record vận hành trung tâm của từng flow: request, order-like item, service case, booking-like entity, execution record hoặc tương đương.

**Lý do đặt tên rộng**  
Nextflow OS cần một abstraction đủ dùng chung cho nhiều wedge mà không trói mọi thứ vào từ “order” hoặc “booking”.

### 8.2 Transaction Lifecycle Control

**Mục đích**  
Đảm bảo mỗi record vận hành có lifecycle hợp lệ, có transition logic, có ownership và có liên hệ với approvals, tasks, exceptions và reporting.

### 8.3 Line Items, Components, and Associated Details

**Mục đích**  
Hỗ trợ cấu trúc record nhiều phần như items, services, notes, attachments, charges, evidence, references.

**Tác dụng**  
Giúp record đủ giàu để vận hành thật, nhưng vẫn thuộc về business truth chứ không chỉ là text note.

### 8.4 Evidence, Attachments, and Proof Capture

**Mục đích**  
Gắn hình ảnh, tài liệu, chữ ký, chứng từ, bằng chứng giao việc hoặc chứng cứ thao tác vào records và work items.

**Vai trò roadmap**  
Launch-supporting với Mobile Ops; rất quan trọng cho field-heavy scenarios và legacy-replacement trust building.

### 8.5 Status Visibility and Record History

**Mục đích**  
Hiển thị lịch sử, thay đổi trạng thái, ai đã làm gì, record đang nằm ở đâu trong tiến trình.

**Kết quả**  
Tạo ra sự minh bạch mà SME thường thiếu khi chạy qua chat, gọi điện và spreadsheet.

## 9. Domain 5 – Control, Approval, and Policy Enforcement

Đây là domain khiến Nextflow OS trở thành hệ điều hành vận hành có kỷ luật, chứ không chỉ là nơi chạy task. Domain này gắn chặt với management control, policy discipline và operational governance.

### 9.1 Approval Flow Management

**Mục đích**  
Mô hình hóa, điều phối và ghi nhận các bước duyệt, từ chối, gửi lại, escalated approval hoặc multi-step approval.

**Giá trị**  
Đây là capability rất mạnh trong wedge retail/distribution vì ngoại lệ thường không nằm ở luồng bình thường mà nằm ở giảm giá, thay đổi, override hoặc quyết định ngoài chuẩn.

### 9.2 Policy Rule Evaluation

**Mục đích**  
Đánh giá các rule như threshold, eligibility, branch-specific rules, assignment rules, time rules, exceptions hoặc escalation rules.

**Ý nghĩa kiến trúc**  
Capability này không đồng nghĩa với một rule engine phức tạp ngay từ đầu, nhưng nó phải tồn tại như tư duy sản phẩm để tránh hard-code khắp nơi.

### 9.3 SLA, Threshold, and Guardrail Control

**Mục đích**  
Theo dõi deadline, SLA, ngưỡng xử lý, breach warnings, escalation triggers.

**Outcome**  
Giúp management không chỉ thấy “có việc”, mà còn thấy “việc có đang chệch chuẩn không”.

### 9.4 Exception Authorization and Override Control

**Mục đích**  
Biểu diễn ai được quyền override, override trong trường hợp nào, có cần ghi lý do không, và override có tạo audit trail hay không.

**Tại sao capability này quan trọng**  
Trong SME thực tế, ngoại lệ luôn có. Nếu không mô hình hóa override đúng, người dùng sẽ quay về xử lý ngoài hệ thống.

## 10. Domain 6 – Experience, Communication, and Portal Delivery

Domain này là nơi các capability được hiện thân ra cho từng actor. Nó không nên bị hiểu chỉ là “UI”. Nó là năng lực phân phối sản phẩm đúng chỗ, đúng lúc, đúng vai trò.

### 10.1 Web Admin Operating Views

**Mục đích**  
Tạo các views phục vụ owner, manager, admin và back office: dashboards, record lists, approval centers, reports, settings và control surfaces.

### 10.2 Mobile Ops Task Experience

**Mục đích**  
Tạo trải nghiệm tác nghiệp nhanh trên mobile/PWA: today list, assigned tasks, updates, check-in/out, proof capture, exception flagging.

**Vai trò roadmap**  
Launch-supporting cho wedge retail/distribution; rất mạnh cho wedge service chains; launch-critical trong các scenario hiện trường rõ nét.

### 10.3 Customer Self-service Portal

**Mục đích**  
Cho phép khách hàng tạo yêu cầu, theo dõi trạng thái, xem lịch, thanh toán, tải chứng từ hoặc tương tác với flow ở vai trò self-service.

### 10.4 Partner Delivery Portal

**Mục đích**  
Hỗ trợ provisioning, template install, rollout oversight, integration setup, migration workspace access và support visibility cho partner hoặc implementer.

### 10.5 Notification and Communication Surfaces

**Mục đích**  
Phân phối alerts, updates, reminders, confirmations, escalations hoặc request-for-action tới đúng actor.

**Lưu ý**  
Capability này phải gắn với workflow và policy, không được biến thành hệ nhắn tin rời.

## 11. Domain 7 – Integration, Migration, and Data Exchange

Đây là domain bảo đảm Nextflow OS có thể sống trong môi trường doanh nghiệp thật, nơi hệ thống cũ, file cũ và luồng dữ liệu ngoài luôn tồn tại.

### 11.1 Import and Data Intake

**Mục đích**  
Nhận dữ liệu từ spreadsheet, CSV, file import, manual mapping hoặc các data sources cơ bản khác.

### 11.2 Data Mapping and Transformation

**Mục đích**  
Biến dữ liệu nguồn thành mô hình chuẩn của Nextflow OS, kiểm tra field alignment, value translation, required-field completeness và transformation logic cơ bản.

### 11.3 Connector and Sync Management

**Mục đích**  
Quản lý các kết nối ra/vào với hệ thống khác, sync jobs, webhook subscriptions hoặc connector states.

### 11.4 Migration Workspace

**Mục đích**  
Cung cấp một nơi có cấu trúc để chuẩn bị migration, dry-run, validate, import theo batch và theo dõi tiến trình thay dữ liệu/hệ cũ.

### 11.5 Reconciliation and Validation

**Mục đích**  
Đối chiếu dữ liệu, phát hiện lệch, xác thực tính đúng và hỗ trợ mô hình dual-run hoặc phased cutover.

**Tầm quan trọng**  
Đây là capability then chốt để lời hứa “safe adoption” có cơ sở thực thi.

## 12. Domain 8 – Insight, Reporting, and Intelligence

Đây là domain biến dữ liệu và workflow thành khả năng nhìn, hiểu và hành động ở cấp điều hành.

### 12.1 Operational Dashboarding

**Mục đích**  
Hiển thị trạng thái hiện tại của work queues, transaction flow, approvals, SLA risks, branch performance và progress visibility.

### 12.2 Reporting and Export Views

**Mục đích**  
Cho phép người dùng tạo và dùng các báo cáo quản lý, đối soát, audit-oriented exports hoặc operational summaries.

### 12.3 Health, Bottleneck, and Exception Insight

**Mục đích**  
Phân tích nơi nghẽn, nơi trễ, nơi lỗi lặp lại, patterns ngoại lệ hoặc các tín hiệu cho thấy vận hành đang mất kiểm soát.

### 12.4 AI Assistance and Recommendation Layer

**Mục đích**  
Cung cấp khả năng hỏi đáp, gợi ý hành động, tóm tắt trạng thái hoặc hỗ trợ ra quyết định trên nền dữ liệu có cấu trúc.

**Vai trò roadmap**  
Strategic-later hoặc late launch-supporting, không nên là thứ che lấp phần business operating core.

## 13. Phân tầng ưu tiên capability

Không phải capability nào cũng được build sâu như nhau trong giai đoạn đầu. Capability Map phải chỉ ra mức ưu tiên chiến lược.

## 13.1 Launch-critical capabilities

Đây là các capability mà nếu thiếu, Nextflow OS không thể thắng wedge đầu tiên theo cách đã chốt.

- Tenant Management  
- User, Role, and Access Scope  
- Location, Branch, and Site Context  
- Task and Work Item Management  
- State and Lifecycle Orchestration  
- Operational Record Management  
- Transaction Lifecycle Control  
- Approval Flow Management  
- Policy Rule Evaluation ở mức cơ bản  
- Web Admin Operating Views  
- Import and Data Intake  
- Data Mapping and Transformation ở mức đủ dùng  
- Operational Dashboarding  
- Status Visibility and Record History

## 13.2 Launch-supporting capabilities

Đây là những capability không nhất thiết phải hoàn hảo ở ngày đầu, nhưng cần tồn tại để sản phẩm dùng được thật và tạo khác biệt rõ hơn.

- Audit and Activity Trail  
- Team and Ownership Context  
- Assignment and Queue Management  
- Exception and Escalation Handling  
- Evidence, Attachments, and Proof Capture  
- SLA, Threshold, and Guardrail Control  
- Mobile Ops Task Experience  
- Notification and Communication Surfaces  
- Migration Workspace  
- Reconciliation and Validation  
- Reporting and Export Views

## 13.3 Phase-next capabilities

Những capability này quan trọng nhưng chưa cần đầu tư mạnh ngay nếu chưa phục vụ trực tiếp wedge đầu tiên.

- Scheduling and Time-slot Coordination  
- Customer Self-service Portal  
- Partner Delivery Portal  
- Asset / Resource Context  
- Connector and Sync Management ở mức sâu hơn  
- Health, Bottleneck, and Exception Insight nâng cao

## 13.4 Strategic-later capabilities

Đây là các capability có giá trị dài hạn nhưng không nên dẫn roadmap giai đoạn đầu.

- AI Assistance and Recommendation Layer  
- Advanced multi-step policy systems  
- Deep ecosystem partner tooling  
- Highly specialized vertical-only operational abstractions

## 14. Capability-to-wedge mapping

Capability Map chỉ có ý nghĩa nếu nó gắn với wedge strategy.

## 14.1 Retail / phân phối nhẹ

Các capability trọng yếu nhất:
- Location, Branch, and Site Context  
- Operational Record Management  
- Transaction Lifecycle Control  
- Task and Work Item Management  
- Approval Flow Management  
- Policy Rule Evaluation  
- Operational Dashboarding  
- Import and Data Intake  
- Status Visibility and Record History

Các capability tạo khác biệt mạnh:
- Assignment and Queue Management  
- Exception and Escalation Handling  
- Reconciliation and Validation  
- Mobile Ops Task Experience cho supervisor/frontline updates

## 14.2 Dịch vụ theo lịch / chuỗi dịch vụ nhỏ

Các capability trọng yếu nhất:
- Scheduling and Time-slot Coordination  
- Party and Account Context  
- Asset / Resource Context  
- Task and Work Item Management  
- State and Lifecycle Orchestration  
- Mobile Ops Task Experience  
- Customer Self-service Portal  
- Operational Dashboarding

## 14.3 Legacy replacement motion

Các capability trọng yếu nhất:
- Import and Data Intake  
- Data Mapping and Transformation  
- Migration Workspace  
- Reconciliation and Validation  
- Audit and Activity Trail  
- Reporting and Export Views  
- Status Visibility and Record History

## 15. Capability-to-surface mapping

Capability không tồn tại trong chân không; nó được thể hiện qua các bề mặt trải nghiệm khác nhau.

### 15.1 Web Admin phụ thuộc mạnh vào
- User, Role, and Access Scope  
- Task and Work Item Management  
- Operational Record Management  
- Approval Flow Management  
- Operational Dashboarding  
- Reporting and Export Views  
- Policy Rule Evaluation  
- Configuration Registry

### 15.2 Mobile Ops phụ thuộc mạnh vào
- Task and Work Item Management  
- Assignment and Queue Management  
- State and Lifecycle Orchestration  
- Evidence, Attachments, and Proof Capture  
- Notification and Communication Surfaces  
- Status Visibility and Record History

### 15.3 Customer Portal phụ thuộc mạnh vào
- Party and Account Context  
- Customer Self-service Portal  
- Scheduling and Time-slot Coordination  
- Status Visibility and Record History  
- Notification and Communication Surfaces

### 15.4 Partner Portal phụ thuộc mạnh vào
- Tenant Management  
- Configuration Registry  
- Migration Workspace  
- Connector and Sync Management  
- Reconciliation and Validation  
- Partner Delivery Portal

## 16. Những capability tuyệt đối không nên hiểu sai

### 16.1 Approval không chỉ là một button “approve/reject”

Approval là một capability control gồm state transition, ownership, threshold, audit, exception path và sometimes override logic. Nếu hiểu nhỏ đi, design và implementation sẽ quá yếu.

### 16.2 Dashboard không chỉ là biểu đồ

Operational Dashboarding là capability điều hành. Nó phải cho thấy queue health, bottlenecks, SLA risks, exceptions và operational truth; không chỉ là chart để đẹp.

### 16.3 Migration không chỉ là import CSV

Legacy replacement chỉ có ý nghĩa nếu migration gồm mapping, validation, dry-run, staged rollout, reconciliation và trust-building assets.

### 16.4 Template không phải capability core

Template là cơ chế delivery và productization. Capability mới là logic năng lực nền. Nhầm hai thứ này với nhau sẽ làm sản phẩm lệch nghiêm trọng.

## 17. Rủi ro nếu Capability Map bị hiểu sai

Nếu Capability Map bị hiểu sai, năm rủi ro lớn nhất là:

1. Roadmap bị kéo theo feature requests rời rạc thay vì năng lực sản phẩm.  
2. Team architecture dựng boundary theo UI/menu thay vì theo business capability.  
3. Team UX thiết kế màn hình mà không bám business truth phía dưới.  
4. Sales kể sản phẩm bằng feature list và vertical buzzwords thay vì operating outcomes.  
5. Shared core bị xói mòn vì mọi khác biệt của khách hàng đều bị biến thành “module mới”.

## 18. Quyết định chốt của tài liệu

Tài liệu này chốt các điểm sau:

1. Nextflow OS được tổ chức thành **8 capability domains**.  
2. Capability là đơn vị thiết kế sản phẩm quan trọng hơn feature list hoặc menu structure.  
3. Capability phải được tổ chức theo **năng lực nghiệp vụ dùng chung**, không theo ngành.  
4. Các capability phải được gắn tier ưu tiên: launch-critical, launch-supporting, phase-next, strategic-later.  
5. Wedge đầu tiên quyết định capability nào cần đầu tư sâu trước.  
6. Capability Map là baseline để sang tài liệu Engine Boundary Specification, Capability Roadmap và Surface Strategy.

## 19. Điều kiện hoàn thành của tài liệu

Capability Map được coi là đạt yêu cầu khi:
- các capability domains đủ rõ để các team downstream dùng chung;  
- có thể nhìn thấy rõ đâu là launch-critical cho wedge đầu tiên;  
- không còn nhầm lẫn lớn giữa capability, feature, template và surface;  
- Product & Architecture có thể đi tiếp sang boundary/spec mà không phải quay lại tranh luận về cách phân mảnh sản phẩm.

## AG Execution Prompt

You are acting as a senior product architect, domain model strategist, and capability-mapping analyst.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Strategic baseline: shared core, template-driven delivery, wedge-first GTM, web-first and mobile-assisted surfaces.
- This document defines the official capability map for Pack 02.

### Objective
Refine this Capability Map into a production-grade capability architecture document that can be used by product, UX, architecture, engineering, and GTM teams as a shared map of the product.

### Inputs
- Use this document, Product Overview, and the Strategy decision baseline as the primary source of truth.
- Preserve the logic that capabilities are cross-vertical business abilities, not per-industry modules.
- Keep the output useful for downstream design and implementation, not just conceptual discussion.

### Tasks
1. Rewrite the capability domains into a cleaner structured taxonomy.
2. Produce a capability register with purpose, owner, priority tier, wedge relevance, and likely downstream surface expression.
3. Add a capability dependency map showing which capabilities rely on which others.
4. Produce a launch-critical capability slice for the first wedge with minimum viable depth notes.
5. Identify which capabilities most likely deserve separate engine boundaries versus shared support services.
6. Highlight the top capability-overlap risks that could create messy implementation boundaries.
7. Recommend how this map should constrain the next document: Engine Boundary Specification.

### Constraints
- Do not reduce the map into a shallow list of features.
- Do not reorganize capabilities by industry-specific modules.
- Do not blur the distinction between capability, template, and surface.
- Keep the output operational enough for real roadmap and boundary decisions.

### Output Format
Return a revised markdown document with these sections:
1. Executive Capability Thesis
2. Capability Domain Taxonomy
3. Capability Register
4. Capability Dependency Map
5. First-Wedge Launch Slice
6. Boundary Signals
7. Overlap Risks
8. Downstream Constraints
9. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the capability structure of Nextflow OS easier to operationalize.
- The capability map must remain consistent with Nextflow OS as an SME Business OS.
- The map must be detailed enough to guide the next engine-boundary and roadmap documents.
- The result must reduce ambiguity between domains, capabilities, templates, and surfaces.
