# Nextflow OS – Product Overview

**Document ID:** 10_PRODUCT_OVERVIEW  
**Pack:** 02 — Product & Capability  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Platform Architecture  
**Dependent Packs:** Experience & UX, Architecture & Core Design, Engineering Implementation, Sales & Enablement  
**Prerequisite Pack:** 01 — Strategy & Positioning

## 1. Mục tiêu tài liệu

Tài liệu này chuyển Nextflow OS từ mức chiến lược sang mức **định nghĩa sản phẩm**. Nếu Pack 01 trả lời sản phẩm là gì trong mắt thị trường, bán cho ai và nên vào thị trường bằng cách nào, thì Product Overview trả lời một câu hỏi thực tế hơn: **bản thân sản phẩm gồm những lớp nào, được tổ chức ra sao, phục vụ những kiểu công việc nào, và các phần đó kết nối với nhau như thế nào để tạo thành một SME Business OS có thể build, triển khai và bán được**.

Đây là tài liệu gốc của Pack 02. Nó không đi vào boundary quá sâu của từng capability engine, cũng chưa đặc tả data model, API hay workflow chi tiết. Vai trò của nó là tạo một bức tranh sản phẩm đủ rõ để các tài liệu tiếp theo như Capability Map, Engine Boundary Specification, Experience Delivery Strategy, Architecture Overview và Implementation Guides có thể đi sâu mà không mâu thuẫn nhau.

Nói ngắn gọn, tài liệu này phải khóa năm thứ:
1. Nextflow OS thực sự là **loại sản phẩm nào** ở cấp cấu trúc.  
2. Sản phẩm được chia thành **những lớp nào**.  
3. Mỗi lớp giải quyết **nhóm vấn đề nào**.  
4. Các lớp đó kết hợp với nhau thành **một operating system cho SME** như thế nào.  
5. Từ đó, đội product, design, engineering, sales và delivery cần hiểu sản phẩm bằng cùng một bản đồ khái niệm nào.

## 2. Tuyên bố sản phẩm ở cấp cấu trúc

Nextflow OS là một **SME Business OS** được thiết kế để tạo ra một lớp vận hành doanh nghiệp có cấu trúc, trên đó các doanh nghiệp vừa và nhỏ có thể:
- chuẩn hóa các flow cốt lõi,
- nhìn thấy trạng thái vận hành,
- kiểm soát approval và exceptions,
- tổ chức dữ liệu nghiệp vụ nhất quán hơn,
- triển khai theo template thay vì custom sâu,
- và thay thế dần các mắt xích vận hành cũ bằng một hệ thống có shared core.

Về mặt cấu trúc, Nextflow OS không phải là một ứng dụng đơn nhất. Nó là một **product system** gồm nhiều lớp, nhiều bề mặt và nhiều thành phần tái sử dụng được, kết hợp với nhau thành một nền tảng vận hành có thể verticalize mà không phá shared core.

Điều cực kỳ quan trọng là: Nextflow OS không được hiểu như “một chỗ để chứa thật nhiều feature”. Nó phải được hiểu như **một hệ tổ chức capability**. Tức là giá trị của sản phẩm không đến từ danh sách menu, mà đến từ việc các phần của hệ thống cùng nhau tạo ra một operating model nhất quán cho doanh nghiệp SME.

## 3. Product thesis của Nextflow OS

Product thesis của Nextflow OS có thể phát biểu như sau:

> SME không cần thêm một công cụ rời rạc. SME cần một lớp vận hành có cấu trúc, có thể triển khai nhanh, có thể nhìn thấy kết quả sớm, có thể mở rộng dần, và có thể thay thế hệ thống cũ từng phần mà không gây gián đoạn quá lớn.

Từ product thesis này, ba nguyên lý sản phẩm được rút ra:

### 3.1 Ready-to-run before over-customizable

Nextflow OS phải ưu tiên khả năng vào vận hành nhanh bằng template, defaults, playbook và role-specific surfaces trước khi tối ưu cho độ mở vô hạn. Một sản phẩm quá “mở” nhưng không vào được thực tế nhanh sẽ thất bại với SME.

### 3.2 Structured business truth before pure automation

Automation rất quan trọng, nhưng automation không phải gốc. Gốc là business truth: records, status, policy, approvals, assignments, ownership, activity trail và reporting logic. Workflow chỉ có ý nghĩa khi chạy trên một nền business truth có cấu trúc.

### 3.3 Shared core before vertical fragmentation

Vertical experience là bắt buộc để time-to-value cao. Nhưng nếu verticalization được tạo bằng cách tách thành nhiều sản phẩm riêng hoặc custom code riêng, lợi thế platform sẽ biến mất. Vì vậy mọi verticalization phải bám vào shared core, capability layers và template packs.

## 4. Bản chất của sản phẩm

Để product team và engineering team không hiểu lệch, Nextflow OS nên được mô tả đồng thời theo bốn góc nhìn.

### 4.1 Nextflow OS là một business operating layer

Đây là lớp giúp doanh nghiệp tổ chức cách công việc đi qua các trạng thái, vai trò, phê duyệt, ngoại lệ và dashboard điều hành. Nó ngồi ở giữa nhu cầu vận hành thực tế của doanh nghiệp và các hệ thống phần mềm rời rạc đang tồn tại.

### 4.2 Nextflow OS là một template-driven product system

Khách hàng không nên phải xây mọi thứ từ đầu. Họ nên bước vào sản phẩm qua các solution template, vertical pack và scenario pack đã được đóng gói sẵn ở mức đủ dùng để tạo giá trị nhanh.

### 4.3 Nextflow OS là một configurable platform có guardrails

Sản phẩm phải cho phép tenant tùy biến, nhưng tùy biến trong biên an toàn. Điều này có nghĩa là metadata, policy, forms, roles, workflow definitions và pack composition phải mở vừa đủ để phục vụ nhiều tình huống, nhưng không được mở đến mức phá business core.

### 4.4 Nextflow OS là một multi-surface experience system

Giá trị của Nextflow OS không nằm hết trong một web dashboard. Nó được phân phối qua nhiều bề mặt:
- Web Admin cho quản trị và điều hành.
- Mobile Ops / PWA cho tác nghiệp nhanh.
- Customer Portal cho self-service.
- Partner Portal cho rollout và ecosystem.

Chỉ khi nhìn đủ cả bốn góc này, người đọc mới hiểu đúng bản chất của sản phẩm.

## 5. Các lớp chính của sản phẩm

Nextflow OS nên được mô tả ở cấp cao bằng bảy lớp chính. Bảy lớp này không nhất thiết map 1:1 với microservices hay repo, nhưng chúng là khung tư duy bắt buộc để sản phẩm không bị hiểu sai.

## 5.1 Layer 1 – Shared Core Platform

Đây là lớp nền dùng chung cho toàn bộ hệ thống. Nó không trực tiếp giải một use case ngành cụ thể, nhưng nó quyết định sản phẩm có scale được và có giữ được tính thống nhất không.

### Vai trò

- Quản lý tenant và môi trường tenant.  
- Identity, authentication, authorization cơ bản.  
- User, role, team, scope.  
- Audit nền.  
- Notification nền.  
- File/object references.  
- Configuration management.  
- Basic observability hooks.  
- Core registries cho metadata, packs, policies hoặc connectors.

### Tại sao lớp này quan trọng

Nếu Shared Core yếu, mỗi wedge hoặc mỗi vertical sẽ tự sinh ra cách làm riêng và sản phẩm nhanh chóng trượt thành tập hợp module rời rạc. Shared Core là lý do Nextflow OS có thể là “OS” thay vì chỉ là nhiều app đặt cạnh nhau.

### Những thứ không nên nhét vào lớp này

- Logic nghiệp vụ riêng của từng flow.  
- Workflow domain-specific.  
- Template logic quá cụ thể theo ngành.  
- Business calculations nên thuộc engines hoặc policy layer.

## 5.2 Layer 2 – Capability Engines

Đây là lớp quan trọng nhất để giữ business truth. Capability Engines là nơi định nghĩa các vùng năng lực nghiệp vụ lớn, nơi các record, state, invariant, ownership và domain actions được giữ một cách có cấu trúc.

### Capability Engine là gì

Một capability engine không phải một “màn hình”, cũng không phải một “module menu”. Nó là một vùng năng lực nghiệp vụ tái sử dụng được, có thể phục vụ nhiều template và nhiều vertical pack khác nhau.

Ví dụ, thay vì nghĩ “module cho spa”, “module cho bán lẻ”, “module cho phân phối”, Nextflow OS phải nghĩ theo kiểu:
- Order / transaction handling.  
- Booking / scheduling.  
- Service execution / task execution.  
- Approval and control.  
- Customer / relationship context.  
- Asset / branch / location context.  
- Reporting / operational insight context.

### Vai trò của Capability Engines

- Giữ các record cốt lõi.  
- Giữ lifecycle của record.  
- Giữ business actions hợp lệ.  
- Tạo source of truth cho dashboards và workflows.  
- Cung cấp nền cho template packs, portals và automation.

### Quy tắc cực quan trọng

Capability Engines phải giữ **business invariants**. Điều này có nghĩa là những sự thật nghiệp vụ cốt lõi không được đẩy hết ra ngoài workflow builder hoặc UI logic. Nếu logic cốt lõi sống ở bên ngoài engine, sản phẩm sẽ gãy khi có nhiều vertical hơn.

## 5.3 Layer 3 – Workflow Orchestration Layer

Đây là lớp điều phối quy trình. Nó không thay thế capability engines; nó đứng trên capability engines để mô tả “cách công việc chạy”, “ai làm gì khi nào”, “trạng thái chuyển tiếp ra sao”, và “ngoại lệ được đẩy đi đâu”.

### Vai trò

- Điều phối trạng thái qua các bước.  
- Kích hoạt actions theo event hoặc rules.  
- Gắn owner, queue, assignee, escalations.  
- Tổ chức approvals và handoffs.  
- Kết nối nhiều capability flows thành một business scenario hoàn chỉnh.

### Tại sao không được để lớp này nuốt hết hệ thống

Một sai lầm phổ biến là để workflow graph trở thành nơi chứa toàn bộ chân lý nghiệp vụ. Khi đó mọi flow đều chạy được “trên bề mặt”, nhưng hệ thống không còn một lõi nhất quán để mở rộng, kiểm soát, audit hoặc migrate. Ở Nextflow OS, orchestration rất quan trọng, nhưng chỉ là **lớp điều phối**, không phải **lớp định nghĩa bản thể nghiệp vụ**.

## 5.4 Layer 4 – Policy and Metadata Layer

Đây là lớp cho phép Nextflow OS vừa dùng chung một lõi, vừa biến đổi theo tenant, theo wedge hoặc theo vertical pack trong biên an toàn.

### Vai trò

- Tùy biến fields và forms.  
- Tùy biến visibility và editability.  
- Tùy biến policy approvals, thresholds, assignments, SLAs.  
- Tùy biến labeling, enumerations, local conventions.  
- Gắn template-specific configuration mà không sửa business core.

### Tại sao lớp này là chìa khóa kinh tế sản phẩm

Nếu thiếu policy/metadata layer đủ tốt, mọi yêu cầu khác biệt của khách hàng sẽ bị đẩy thành custom code. Khi đó shared core mất ý nghĩa. Ngược lại, nếu lớp này đủ mạnh, Nextflow OS có thể phục vụ nhiều tình huống mà vẫn giữ codebase sạch hơn.

### Guardrail

Lớp này phải cho phép “tùy biến trong biên an toàn”, chứ không cho phép phá vỡ core lifecycle hoặc invariant của capability engines.

## 5.5 Layer 5 – Experience Surfaces

Đây là lớp người dùng chạm vào. Nhưng experience surfaces không phải chỉ là “frontend”. Chúng là các bề mặt sản phẩm được tối ưu theo vai trò, ngữ cảnh và outcome.

### Các bề mặt chính

#### Web Admin
- Dành cho owner, manager, admin, back office.  
- Tối ưu cho cấu hình, dashboard, reports, control, approvals, setup, management views.

#### Mobile Ops / PWA
- Dành cho operator, frontline, supervisor, field staff.  
- Tối ưu cho task list, today view, check-in/out, quick updates, scan, capture, status changes.

#### Customer Portal
- Dành cho self-service, booking, status tracking, documents, payments, communication.  
- Tối ưu cho clarity và giảm tải vận hành nội bộ.

#### Partner Portal
- Dành cho rollout, template install, migration workspace, integration setup, tenant provisioning, support oversight.

### Vì sao lớp này là một phần của Product Overview

Bởi vì Nextflow OS không thể được hiểu đúng nếu bị rút gọn thành “một web app”. Cấu trúc bề mặt trải nghiệm là một phần của cấu trúc sản phẩm, không phải phần trang trí phía sau.

## 5.6 Layer 6 – Integration and Data Exchange Layer

Nextflow OS được định vị mạnh theo hướng integration-ready và safe adoption. Vì vậy tích hợp không thể bị coi là “phần làm sau”. Nó là một lớp sản phẩm bắt buộc.

### Vai trò

- Inbound imports.  
- Outbound exports.  
- Connectors tới hệ thống cũ hoặc hệ thống bổ trợ.  
- Webhooks, event subscriptions, sync jobs.  
- Data mapping, validation, reconciliation.

### Vai trò chiến lược

Lớp này là điều kiện bắt buộc để phục vụ ICP legacy replacement. Nếu integration/data layer yếu, mọi lời hứa về safe migration, phased rollout hoặc coexistence với hệ cũ đều chỉ là marketing.

## 5.7 Layer 7 – Control, Insight, and Intelligence Layer

Đây là lớp giúp Nextflow OS trở thành “OS” thay vì chỉ là nơi lưu record và chạy flow.

### Vai trò

- Dashboards vận hành.  
- Backlog và SLA visibility.  
- Management reporting.  
- Alerting, exception views, queue health.  
- AI insights, copilots, recommendations theo giai đoạn trưởng thành.

### Ý nghĩa sản phẩm

Nhiều khách hàng không mua phần mềm chỉ để “có chỗ nhập liệu tốt hơn”. Họ mua vì muốn thấy điều gì đang xảy ra trong doanh nghiệp. Control và insight layer là nơi biến dữ liệu và workflow thành góc nhìn điều hành.

## 6. Cách các lớp kết hợp thành một SME Business OS

Để hiểu sản phẩm như một chỉnh thể, cần hình dung quan hệ giữa các lớp như sau:

- Shared Core Platform cung cấp nền tảng dùng chung.  
- Capability Engines giữ business truth.  
- Workflow Orchestration điều phối luồng công việc.  
- Policy & Metadata làm cho hệ thống thích ứng được theo tenant/vertical.  
- Experience Surfaces phân phối giá trị theo vai trò.  
- Integration & Data Exchange giúp coexist và migrate.  
- Control, Insight & Intelligence biến hệ thống thành công cụ điều hành.

Nếu một trong bảy lớp này vắng mặt hoặc quá yếu, sản phẩm sẽ nghiêng lệch:
- thiếu core thì thành module chắp vá,
- thiếu engines thì thành workflow shell,
- thiếu orchestration thì thành data system tĩnh,
- thiếu policy/metadata thì thành custom factory,
- thiếu surfaces phù hợp thì thành tool khó dùng,
- thiếu integration thì thành hệ cô lập,
- thiếu control/insight thì thành record machine không tạo giá trị điều hành.

## 7. Bản đồ vấn đề mà sản phẩm giải quyết

Nextflow OS không nên được mô tả chỉ bằng tính năng. Nó nên được mô tả bằng problem clusters.

## 7.1 Problem Cluster A – Operational fragmentation

Doanh nghiệp SME thường chạy công việc qua nhiều công cụ rời rạc, nhiều bước thủ công và nhiều sự phối hợp dựa vào chat hoặc trí nhớ. Nextflow OS giải bài toán này bằng structured records, workflows, assignments, approvals và surfaces theo vai trò.

## 7.2 Problem Cluster B – Lack of operational visibility

Nhiều doanh nghiệp không biết chính xác công việc đang kẹt ở đâu, ngoại lệ nằm ở đâu, ai đang giữ bước tiếp theo hoặc trạng thái thật của một flow là gì. Nextflow OS giải bài toán này bằng dashboards, queues, control views và lifecycle-based operations.

## 7.3 Problem Cluster C – Difficult scaling of processes

Khi doanh nghiệp có thêm chi nhánh, người dùng, khối lượng giao dịch hoặc quy trình mới, cách làm thủ công và stack rời rạc thường gãy rất nhanh. Nextflow OS giải bài toán này bằng shared core, template packs, policy layer và branch-aware operations.

## 7.4 Problem Cluster D – Legacy inertia

Doanh nghiệp biết hệ thống cũ đang cản tăng trưởng nhưng không dám đổi vì sợ migrate và gián đoạn. Nextflow OS giải bài toán này bằng phased rollout, integration, migration workspace, dual-run support patterns và replacement-by-flow logic.

## 7.5 Problem Cluster E – Weak business-system discipline

Nhiều SME thiếu một “business operating discipline” ở cấp hệ thống: record ownership mơ hồ, approvals ngoài luồng, audit trail thiếu, policy không rõ. Nextflow OS giải bài toán này bằng engines, policy layer, audit logic và control surfaces.

## 8. Các kiểu outcome mà sản phẩm phải tạo ra

Product Overview không chỉ trả lời sản phẩm có gì, mà còn phải khóa loại outcome nào sản phẩm buộc phải tạo ra.

### 8.1 Outcome loại 1 – Fast operational start

Một khách hàng mới phải có khả năng bắt đầu từ một scenario đủ cụ thể mà không mất hàng tháng để thiết kế lại toàn bộ hệ thống.

### 8.2 Outcome loại 2 – Better control with less chaos

Người quản lý phải nhìn được công việc, approvals, status và ngoại lệ rõ hơn so với cách chạy rời rạc trước đó.

### 8.3 Outcome loại 3 – Safer process scaling

Khi thêm branch, thêm role, thêm flow hoặc thêm volume, hệ thống phải chịu mở rộng tốt hơn cách làm thủ công và point-tool cũ.

### 8.4 Outcome loại 4 – Practical pathway from old to new

Khách hàng legacy phải cảm thấy có một đường chuyển đổi thực tế: không cần “đập đi xây lại”, mà có thể thay dần, migrate dần và kiểm soát rủi ro tốt hơn.

### 8.5 Outcome loại 5 – Foundation for intelligence

Khi dữ liệu, workflow và policy đã có cấu trúc, sản phẩm mới có nền đúng để đưa AI Copilot, alerts, recommendations hoặc advanced analytics vào mà không trở thành lớp AI tô màu trên dữ liệu hỗn loạn.

## 9. Những gì Product Overview cố tình chưa khóa

Để tránh tài liệu này ôm quá sâu, các phần sau chưa bị khóa chi tiết ở đây mà sẽ được xử lý ở tài liệu tiếp theo:

- danh sách chính thức của từng capability engine;  
- boundary và trách nhiệm cụ thể của từng engine;  
- data model chi tiết;  
- event model chi tiết;  
- route map và screen map chi tiết;  
- pricing-to-capability mapping chi tiết;  
- launch-critical versus later-phase features ở mức cụ thể.

Việc chưa khóa ở đây là chủ ý. Product Overview phải đủ rõ để định hướng, nhưng chưa đi xuống mức khiến các tài liệu chuyên biệt sau mất vai trò.

## 10. Hệ quả bắt buộc cho các pack sau

### 10.1 Với Pack Experience & UX

UX không được thiết kế như một dashboard chung cho tất cả. Nó phải bám cấu trúc đa surface và đa vai trò của sản phẩm.

### 10.2 Với Pack Architecture & Core Design

Kiến trúc phải phản ánh đúng bảy lớp của sản phẩm, đặc biệt phải phân biệt rất rõ core business truth, orchestration, policy/metadata và integration.

### 10.3 Với Pack Engineering Implementation

Implementation order phải phục vụ cấu trúc sản phẩm đã chốt, không được build UI trước nhưng chưa có capability truth, hoặc build workflow trước nhưng chưa có policy and record semantics rõ ràng.

### 10.4 Với Pack Sales & Enablement

Commercial materials không được rơi lại thành feature sheet. Chúng phải kể sản phẩm như một hệ operating layer với template-driven delivery và role-specific outcomes.

## 11. Quyết định chốt của tài liệu

Tài liệu này chốt mười quyết định sản phẩm cấp cao cho Nextflow OS:

1. Nextflow OS là một **product system**, không phải một app đơn.  
2. Sản phẩm được hiểu như một **SME Business OS**, không phải ERP full-suite hay workflow tool.  
3. Giá trị sản phẩm đến từ **hệ capability có cấu trúc**, không phải từ số lượng menu.  
4. Shared Core Platform là lớp bắt buộc để giữ tính thống nhất.  
5. Capability Engines là lớp giữ business truth.  
6. Workflow Orchestration là lớp điều phối, không phải nơi chứa toàn bộ nghiệp vụ.  
7. Policy & Metadata Layer là điều kiện để verticalize mà không custom sâu.  
8. Experience Surfaces là cấu phần của sản phẩm, không phải phần phụ.  
9. Integration & Data Exchange là lớp chiến lược bắt buộc, nhất là cho legacy replacement.  
10. Control, Insight & Intelligence là lớp biến sản phẩm thành công cụ điều hành thực sự.

## 12. Điều kiện hoàn thành của tài liệu

Tài liệu Product Overview được xem là đạt yêu cầu khi:
- các team downstream có thể dùng cùng một sơ đồ khái niệm để nói về sản phẩm;
- không còn sự nhầm lẫn nghiêm trọng giữa core, engines, workflows, templates và portals;
- Pack 02 có thể đi tiếp sang Capability Map và Engine Boundary Specification mà không cần tranh luận lại bản chất sản phẩm;
- sales và product có thể cùng mô tả Nextflow OS bằng một story thống nhất hơn.

## AG Execution Prompt

You are acting as a senior principal product architect, platform strategist, and operating-model designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Strategic baseline: shared core, capability logic, workflow orchestration, template-driven delivery, web-first and mobile-assisted surfaces.
- This document is the first foundational document of Pack 02 and defines the high-level product structure.

### Objective
Refine this Product Overview into a production-grade product architecture narrative that can be used as the common reference for product, UX, engineering, architecture, sales enablement, and implementation planning.

### Inputs
- Use this document and the Pack 01 decision baseline as the primary source of truth.
- Preserve the product identity and the shared-core versus vertical-pack logic.
- Keep the output focused on product structure, not low-level technical specification.

### Tasks
1. Rewrite the product thesis and product-structure explanation into a sharper executive form.
2. Produce a formal product-layer map with responsibilities, inputs, outputs, and non-goals for each layer.
3. Create a problem-cluster-to-product-layer mapping.
4. Add a product-surface-to-persona mapping that clarifies which surface serves which user outcomes.
5. Produce a list of launch-critical versus supporting product layers for the first wedge.
6. Identify the top five risks if teams misunderstand this product structure.
7. Recommend how this overview should constrain the next documents: Capability Map, Engine Boundaries, and Experience Strategy.

### Constraints
- Do not collapse the product into a simple module list.
- Do not redefine the product as ERP, generic workflow automation, or a pure vertical tool.
- Do not move business truth out of capability logic into orchestration-only logic.
- Keep the output useful for real downstream design and implementation work.

### Output Format
Return a revised markdown document with these sections:
1. Executive Product Thesis
2. Product Layer Map
3. Product Surface Map
4. Problem-to-Layer Map
5. Launch-Critical Priorities
6. Misunderstanding Risks
7. Downstream Constraints
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the structure of Nextflow OS easy to understand across teams.
- The output must preserve the strategic identity of the product as an SME Business OS.
- The output must be detailed enough to guide the next Pack 02 documents.
- The output must reduce ambiguity between core platform, engines, workflows, templates, and surfaces.
