# Nextflow OS – Capability Roadmap and Phases

**Document ID:** 14_CAPABILITY_ROADMAP_AND_PHASES  
**Pack:** 02 — Product & Capability  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Platform Strategy / Engineering Planning  
**Dependent Packs:** Experience & UX, Architecture & Core Design, Engineering Implementation, Sales & Enablement, Deployment & Support  
**Prerequisite Documents:** 10_PRODUCT_OVERVIEW, 11_CAPABILITY_MAP, 12_ENGINE_BOUNDARY_SPECIFICATION, 13_FIRST_WEDGE_CAPABILITY_SLICE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **lộ trình capability theo phase** cho Nextflow OS sau khi đã chốt lát capability đầu tiên của wedge mở màn. Nếu First Wedge Capability Slice trả lời “build cái gì đầu tiên để vào thị trường được”, thì Capability Roadmap and Phases trả lời câu hỏi rộng hơn nhưng vẫn mang tính thực thi: **sau lát đầu tiên, sản phẩm sẽ mở rộng theo thứ tự nào, capability nào phải đi trước capability nào, ranh giới giữa Phase 1 – Phase 2 – Phase 3 là gì, và làm sao để roadmap vẫn giữ được shared-core discipline thay vì trượt sang feature accumulation**.

Đây không phải là một roadmap ngày-tháng cứng. Nó là một **roadmap logic** và **roadmap ưu tiên**. Mục đích của tài liệu là bảo đảm rằng các quyết định build về sau không chạy theo khách hàng lớn tiếng nhất, team đông nhất hay demo ngắn hạn nhất, mà bám vào một trình tự năng lực có chủ đích.

Tài liệu này phải khóa bảy thứ:
1. Phase 0/1 thực chất là gì trong ngữ cảnh Nextflow OS.  
2. Phase 2 cần mở rộng capability theo hướng nào để retail/distribution trở nên mạnh thật hơn.  
3. Phase 3 cần chuẩn bị những gì để hỗ trợ wedge tiếp theo mà không vỡ shared core.  
4. Capability nào là launch-critical, growth-critical, expansion-critical, strategic-later.  
5. Dependency logic giữa các capabilities.  
6. Những gì không nên chen vào roadmap quá sớm.  
7. Cách roadmap phải phục vụ đồng thời product, GTM, UX, implementation và partner readiness.

## 2. Tại sao cần roadmap theo capability thay vì theo feature

Một SME Business OS không nên được quản lý bằng backlog tính năng rời rạc. Nếu roadmap đi theo feature tickets, sản phẩm sẽ rất nhanh rơi vào ba bẫy:
- thêm nhiều thứ nhìn có vẻ tiến bộ nhưng không tạo ra năng lực hoàn chỉnh;  
- phá shared core vì chiều ý từng deal;  
- và tạo ra quá nhiều bề mặt UI trước khi lõi nghiệp vụ đủ chắc.

Roadmap theo capability giúp Nextflow OS giữ logic đúng hơn:
- mỗi bước mở rộng tạo ra một năng lực sản phẩm rõ ràng;  
- các teams hiểu vì sao một nhóm features đi cùng nhau;  
- kiến trúc và UX có thể phát triển song song trên một bản đồ ổn định hơn;  
- sales và implementation có thể kể câu chuyện nâng cấp thực tế hơn.

Nói cách khác, capability roadmap là cách biến chiến lược “shared core + template packs + wedge-first” thành chuỗi quyết định build có thể kiểm soát được.

## 3. Khung phase tổng thể

Capability roadmap của Nextflow OS nên được chia thành 5 phase logic.

### Phase 0 – Strategic Baseline and Product Shape

Đây là phase đã được khóa phần lớn trong Pack 01 và phần đầu Pack 02. Phase này không tạo sản phẩm launchable, nhưng nó tạo nền để biết sản phẩm là gì, wedge đầu tiên là gì, capability map ra sao và engine boundaries nằm ở đâu.

### Phase 1 – First Wedge Launch Slice

Đây là phase tạo ra lát capability đầu tiên đủ để bán, demo, pilot và go-live ở mức đầu cho retail / light distribution. Phase này tập trung vào order/request-like operational flow, branch-aware control, approvals, queues, dashboards và import onboarding cơ bản.

### Phase 2 – Wedge Deepening and Operational Strength

Đây là phase củng cố wedge đầu tiên để sản phẩm bớt giống pilot solution và tiến gần hơn tới một operating system thật cho retail/distribution nhẹ. Phase này đào sâu control, visibility, branch operations, exception handling, reporting và rollout discipline.

### Phase 3 – Cross-Wedge Extension and Template Expansion

Đây là phase bắt đầu mở khả năng dùng shared core cho wedge thứ hai và các scenario mở rộng, mà không phá boundary của wedge đầu tiên. Phase này thiên về reuse, template maturity, scheduling/resource contexts, portal growth và stronger integration patterns.

### Phase 4 – Strategic Platform Maturity

Đây là phase không còn chỉ nói về một wedge hay một demo launch nữa. Nó nói về ecosystem readiness, partner delivery maturity, advanced intelligence, stronger policy systems, deeper observability, and broader multi-tenant product governance.

## 4. Mục tiêu sản phẩm của từng phase

Capability roadmap chỉ có ý nghĩa nếu mỗi phase có mục tiêu sản phẩm rõ ràng.

## 4.1 Mục tiêu của Phase 1

Tạo ra một hệ thống đủ thật để một doanh nghiệp retail/distribution nhẹ có thể đưa một flow xử lý chính vào vận hành, nhìn được trạng thái, quản lý được approvals và bắt đầu thay thế hỗn loạn hiện tại bằng một lớp vận hành có cấu trúc.

## 4.2 Mục tiêu của Phase 2

Biến Phase 1 từ “launch slice” thành “operationally credible product”. Nghĩa là không chỉ vào được flow đầu tiên, mà còn tăng độ chắc về queue handling, branch oversight, reporting, migration confidence, exception discipline và daily usability.

## 4.3 Mục tiêu của Phase 3

Mở sản phẩm sang các scenario rộng hơn và wedge tiếp theo theo cách tận dụng shared core. Đây là phase để chứng minh rằng cấu trúc product-system của Nextflow OS là đúng, chứ không chỉ là cách tạm thời để thắng wedge đầu tiên.

## 4.4 Mục tiêu của Phase 4

Tăng maturity của nền tảng để có thể scale delivery, partner motion, governance, advanced insights và product operations mà không đánh mất tốc độ hoặc tính nhất quán.

## 5. Phase 1 – First Wedge Launch Slice

Phase 1 đã được mô tả ở tài liệu First Wedge Capability Slice, nhưng ở đây cần khóa lại nó như điểm xuất phát chính thức của roadmap.

### 5.1 Objective

Giành quyền tồn tại trên thị trường bằng một flow đủ thật cho retail/distribution nhẹ, xoay quanh branch-aware operational record handling, queues, approvals, dashboards và import onboarding cơ bản.

### 5.2 Capability groups chính

#### A. Platform and access basics
- Tenant setup cơ bản.  
- User/role/access scope thực dụng.  
- Branch-aware visibility.  
- Audit trail cho actions quan trọng.

#### B. Context and operating structure
- Branch/site context.  
- Party/account context mức cơ bản.  
- Ownership/team context tối thiểu.

#### C. Core operational flow
- Operational record type đầu tiên.  
- Record lifecycle control.  
- Task generation or task association.  
- Queue and assignment basics.  
- Status history and traceability.

#### D. Exception and control
- Approval flow cơ bản.  
- Policy thresholds cơ bản.  
- Overdue / blocked visibility.  
- Override logging.

#### E. Experience surfaces
- Web Admin control surface.  
- Mobile Ops / PWA execution surface mức tối thiểu.  
- Notifications cơ bản theo action.

#### F. Data onboarding
- Import templates.  
- Mapping cơ bản.  
- Validation errors.  
- Import result summary.

#### G. Insight basics
- Dashboard overview.  
- Status distribution.  
- Pending approvals.  
- Branch-level backlog.  
- Overdue / blocked items.

### 5.3 Điều kiện ra khỏi Phase 1

Phase 1 chỉ nên được coi là hoàn tất khi thỏa các điều kiện sau:
- Một flow retail/distribution đầu tiên chạy end-to-end.  
- Manager nhìn được control dashboard có giá trị.  
- Branch supervisor/operator có execution surface dùng được.  
- Approval và exception không còn chạy hoàn toàn ngoài hệ thống.  
- Import/onboarding có thể hỗ trợ pilot go-live ở mức chấp nhận được.

### 5.4 Những gì chưa cố làm sâu ở Phase 1

- inventory depth phức tạp;  
- customer portal rộng;  
- partner delivery tooling đầy đủ;  
- generalized rule engine;  
- AI insights sâu;  
- scheduling/resource-heavy scenarios.

## 6. Phase 2 – Wedge Deepening and Operational Strength

Đây là phase quan trọng nhất sau launch slice. Nếu bỏ qua phase này và nhảy ngay sang wedge thứ hai hoặc hàng loạt tính năng mới, Nextflow OS sẽ mãi ở tình trạng “demo tốt nhưng product chưa đủ chắc”.

## 6.1 Mục tiêu chiến lược của Phase 2

Phase 2 phải làm cho retail/distribution nhẹ trở thành một wedge thật sự mạnh về vận hành, chứ không chỉ là một vertical mở cửa. Sản phẩm phải bắt đầu cho thấy nó xử lý tốt hơn các tình huống đời thường như multi-branch visibility, routing discipline, repeatable rollout, branch performance tracking, deeper exception management và migration confidence.

## 6.2 Capability themes chính của Phase 2

### Theme A – Stronger branch operations

- Branch-level dashboards sâu hơn.  
- Better queue partitioning theo branch/team.  
- Cross-branch visibility cho manager.  
- Branch-specific thresholds hoặc operating windows ở mức cơ bản.  
- More explicit branch ownership and escalation views.

### Theme B – Stronger work discipline

- Better reassignment flows.  
- Queue balancing logic cơ bản.  
- More explicit blocked / waiting / needs-info states.  
- Better overdue handling and SLA-style alerts.  
- Exception categorization có cấu trúc hơn.

### Theme C – Stronger record richness

- Line items/details đủ giàu hơn cho retail/distribution use cases.  
- Better evidence capture.  
- More explicit record relations hoặc references.  
- Better history readability và audit surfaces.

### Theme D – Stronger control and approval system

- Multi-step approvals ở những scenario thật sự cần.  
- Better override reasoning and review.  
- Rule presets theo pack/tenant.  
- Better policy explainability cho managers.

### Theme E – Stronger insight and reporting

- Operational exports tốt hơn.  
- Bottleneck and exception reports.  
- Branch comparison views.  
- Trend views cho workload và approvals.  
- Better daily operating summaries.

### Theme F – Stronger onboarding and migration confidence

- Better import iteration flows.  
- Reconciliation basics.  
- Dry-run oriented migration support.  
- Clearer error surfacing.  
- Better field-mapping ergonomics.

### Theme G – Stronger template maturity

- Retail/distribution starter pack rõ hơn.  
- Pack-specific defaults tốt hơn.  
- Better template install flows.  
- Better safe configuration boundaries.

## 6.3 Phase 2 không nên bị kéo đi đâu

Trong lúc đào sâu wedge đầu tiên, Phase 2 rất dễ bị hút vào các yêu cầu hấp dẫn nhưng sai nhịp. Những thứ không nên trở thành trung tâm của Phase 2 gồm:
- ERP breadth như accounting hoặc procurement suite đầy đủ;  
- AI showcase features thiếu dữ liệu tốt;  
- partner marketplace;  
- customer-facing portal rộng nếu chưa gắn chặt với wedge value;  
- full custom vertical branches.

## 6.4 Điều kiện ra khỏi Phase 2

Phase 2 nên được coi là đạt khi:
- retail/distribution use case không còn chỉ “có thể chạy”, mà “chạy chắc hơn, rõ hơn, quản được hơn”;  
- branch operations đủ rõ để tạo khác biệt trong demo và pilot;  
- reporting, approvals và exception handling đạt mức người quản lý tin dùng hằng ngày;  
- onboarding/migration không còn là điểm yếu rõ rệt khi triển khai khách hàng thứ hai/thứ ba.

## 7. Phase 3 – Cross-Wedge Extension and Template Expansion

Khi wedge đầu tiên đủ chắc, Nextflow OS mới nên đẩy mạnh sang wedge thứ hai và các flow mở rộng. Phase 3 không được hiểu là “bắt đầu sản phẩm mới”. Nó là bước chứng minh shared core thực sự tái sử dụng được.

## 7.1 Mục tiêu chiến lược của Phase 3

- Mở rộng sang wedge thứ hai: dịch vụ theo lịch / chuỗi dịch vụ nhỏ.  
- Tăng độ trưởng thành của template system.  
- Mở thêm surfaces hoặc contexts cần thiết cho scheduling/resource-driven operations.  
- Tăng chiều sâu integration patterns và reuse across scenarios.

## 7.2 Capability themes chính của Phase 3

### Theme A – Scheduling and resource coordination

- Scheduling/time-slot coordination.  
- Resource or slot context.  
- Appointment/service execution flows.  
- Operator timelines hoặc service calendars ở mức thực dụng.

### Theme B – Portal expansion

- Customer self-service portal ở những flow có giá trị thật.  
- Status tracking cho external users.  
- Request creation / booking initiation ở mức phù hợp wedge thứ hai.

### Theme C – Template generalization without losing realism

- Vertical packs rõ hơn cho service chains.  
- Shared flows giữa retail-like và service-like scenarios.  
- Better pack composition, presets và rollout discipline.

### Theme D – Stronger integration patterns

- Connector lifecycle tốt hơn.  
- Better sync management.  
- More reusable migration contracts across wedges.  
- Structured coexistence patterns với hệ cũ hoặc hệ phụ trợ.

### Theme E – Extended insight layer

- Cross-scenario reporting views.  
- Stronger operational health insights.  
- Better management rollups across flows or branches.

## 7.3 Nguy cơ lớn của Phase 3

Nguy cơ lớn nhất là mở sang wedge thứ hai bằng cách xây thêm một đống “module theo ngành” tách rời. Điều đó sẽ phá logic capability-based architecture. Phase 3 chỉ được coi là thành công nếu wedge thứ hai dùng lại shared core, engines, control logic và delivery model đã có.

## 7.4 Điều kiện ra khỏi Phase 3

Phase 3 nên được coi là đạt khi:
- wedge thứ hai có thể vào thị trường bằng shared core chứ không bằng custom silo;  
- template delivery model chín hơn rõ rệt;  
- cross-wedge reuse bắt đầu thấy rõ ở product, UX và implementation assets;  
- integration và onboarding patterns bắt đầu có tính lặp lại hơn giữa các deployments.

## 8. Phase 4 – Strategic Platform Maturity

Phase 4 là nơi Nextflow OS bắt đầu trưởng thành như một platform có khả năng scale delivery và vận hành nội bộ tốt hơn.

## 8.1 Mục tiêu chiến lược của Phase 4

- Partner delivery maturity.  
- Advanced governance and operations.  
- Stronger telemetry and release confidence.  
- More capable insight/intelligence layer.  
- Better productized template and ecosystem management.

## 8.2 Capability themes chính của Phase 4

### Theme A – Partner enablement and delivery operations
- Partner portal sâu hơn.  
- Tenant provisioning and rollout oversight.  
- Delivery workspaces.  
- Implementation asset reuse.

### Theme B – Advanced control and policy systems
- More mature policy modeling.  
- Better audit explainability.  
- Governance tools for complex tenants.  
- Safer change management around pack/policy rollout.

### Theme C – Intelligence and recommendations
- Better management summaries.  
- AI assistance trên dữ liệu có cấu trúc tốt hơn.  
- Recommendation patterns cho bottlenecks, approvals hoặc next actions.

### Theme D – Product operations maturity
- Better observability surfaces.  
- Better support tooling.  
- Better release diagnostics.  
- Internal product operations capabilities.

## 8.3 Điều không nên nhầm về Phase 4

Phase 4 không phải lý do để trì hoãn discipline ở các phase trước. Những thứ như boundary clarity, shared core và basic observability phải bắt đầu sớm, dù maturity đầy đủ chỉ đến ở phase sau.

## 9. Capability tiering theo roadmap

Để roadmap không bị mơ hồ, mỗi capability lớn cần được gắn tier theo logic thời điểm đầu tư.

## 9.1 Launch-critical

Các capability bắt buộc phải có ở Phase 1:
- Tenant setup and access basics.  
- Branch/site context.  
- Operational record type đầu tiên.  
- Record lifecycle control.  
- Task/queue basics.  
- Approval basics.  
- Dashboard control basics.  
- Import/mapping basics.  
- Web Admin.  
- Mobile execution basics.

## 9.2 Growth-critical

Các capability nên được đầu tư mạnh ở Phase 2:
- Better queue discipline.  
- Better exception management.  
- Better branch visibility.  
- Better reporting and exports.  
- Stronger migration confidence.  
- Better pack maturity.  
- Better approval depth.

## 9.3 Expansion-critical

Các capability mở đường cho Phase 3:
- Scheduling and resource contexts.  
- Customer portal growth.  
- Better connector lifecycle.  
- Cross-wedge templates.  
- Cross-scenario insights.

## 9.4 Strategic-later

Các capability nên được đầu tư có chọn lọc ở Phase 4 trở đi:
- Partner ecosystem tooling sâu.  
- Advanced intelligence/recommendations.  
- More generalized governance systems.  
- Broader ecosystem orchestration.

## 10. Dependency logic giữa các phases

Roadmap capability chỉ đúng khi dependency logic rõ ràng.

### 10.1 Dependency A – Control depends on truth

Không thể có dashboard/control mạnh nếu Operational Record Engine, Work Orchestration Engine và approval semantics còn mỏng hoặc sai boundary.

### 10.2 Dependency B – Wedge expansion depends on wedge depth

Không nên mở mạnh sang scheduling/service-chain scenarios nếu retail/distribution phase đầu còn yếu ở branch ops, approvals, reporting và onboarding.

### 10.3 Dependency C – Templates depend on engine clarity

Template maturity không thể đến từ việc copy UI. Nó phụ thuộc vào capability engines và policy/config boundaries đủ rõ.

### 10.4 Dependency D – Partner motion depends on delivery discipline

Không nên scale partner delivery nếu onboarding, pack install, migration readiness và implementation playbooks còn hỗn loạn.

### 10.5 Dependency E – Intelligence depends on structured data

AI và advanced insight chỉ có giá trị khi truth, lifecycle, history, approvals và operational metrics đã đủ cấu trúc.

## 11. Roadmap guardrails

Để bảo vệ roadmap khỏi bị kéo lệch, mọi yêu cầu mới nên đi qua các guardrails sau.

### 11.1 Guardrail 1 – Có làm mạnh hơn wedge hiện tại không?

Nếu không giúp wedge hiện tại thắng hoặc mở đúng phase kế tiếp, yêu cầu đó nên hạ ưu tiên.

### 11.2 Guardrail 2 – Có tăng năng lực sản phẩm hay chỉ thêm bề mặt?

Một feature nhìn đẹp nhưng không tăng capability depth hoặc product leverage nên bị xem xét kỹ.

### 11.3 Guardrail 3 – Có tôn trọng shared core không?

Nếu yêu cầu này đòi hard-code theo một vertical hoặc một khách hàng, roadmap phải phản ứng rất thận trọng.

### 11.4 Guardrail 4 – Có làm boundary mờ hơn không?

Nếu một yêu cầu cần chèn logic vào UI, dashboard read model hoặc import job thay vì qua engines đúng chỗ, đó là tín hiệu cảnh báo.

### 11.5 Guardrail 5 – Có tạo burden implementation quá lớn so với giá trị không?

Một capability rất hay nhưng cost-to-serve, rollout cost hoặc support complexity quá lớn có thể không phù hợp phase hiện tại.

### 11.6 Guardrail 6 – Có giúp roadmap thương mại kể câu chuyện rõ hơn không?

Roadmap không phải chỉ cho engineering. Nó còn phải giúp sales, presales và implementation kể được con đường từ starter deal đến expansion deal.

## 12. Những gì không nên chen vào quá sớm

Roadmap của Nextflow OS nên chủ động chống lại những cám dỗ sau ở giai đoạn đầu và giữa.

- Big-bang ERP breadth.  
- Full custom per-customer modules.  
- AI-first demos khi operational truth chưa mạnh.  
- Portal sprawl trước khi core flows đủ chắc.  
- Quá nhiều advanced settings làm Pack/Config Engine thành bãi rác.  
- Partner ecosystem scale quá sớm khi delivery model chưa ổn định.

## 13. Cách roadmap phải phục vụ các functions khác nhau

## 13.1 Với Product

Roadmap capability tạo logic ưu tiên rõ: không build theo tiếng ồn, build theo năng lực cần thiết để tăng xác suất thắng wedge và mở rộng hợp lý.

## 13.2 Với UX

UX không phải chạy theo mọi feature request. UX phải bám từng phase để biết surface nào cần sâu hơn: Web Admin và Mobile Ops ở Phase 1–2; Portal growth chủ yếu ở Phase 3.

## 13.3 Với Engineering

Engineering dùng roadmap này để sắp thứ tự investment vào engines, support services, read models và deployment maturity.

## 13.4 Với Sales and Enablement

Sales có câu chuyện rõ: hiện tại sản phẩm giải gì, phase kế tiếp mở rộng gì, và vì sao đó là con đường nâng cấp hợp lý thay vì lời hứa mơ hồ.

## 13.5 Với Deployment and Support

Delivery và support dùng roadmap để biết capability nào đã đủ chín để triển khai lặp lại, capability nào mới ở mức pilot, capability nào chưa nên bán quá mạnh.

## 14. Phase-by-phase summary table

| Phase | Mục tiêu chính | Trọng tâm capability | Điều chưa nên dẫn dắt |
|---|---|---|---|
| Phase 0 | Khóa chiến lược và cấu trúc sản phẩm | Vision, wedge, capability map, engine boundaries | Bắt đầu build dàn trải |
| Phase 1 | Vào thị trường bằng launch slice retail/distribution | Records, queues, approvals, dashboards, import, Web Admin, Mobile Ops | Breadth kiểu mini ERP |
| Phase 2 | Làm wedge đầu tiên đủ chắc để vận hành thật | Branch ops, exception discipline, reporting, migration confidence, template maturity | Nhảy quá sớm sang quá nhiều vertical |
| Phase 3 | Mở sang wedge thứ hai bằng shared core | Scheduling, portal growth, cross-wedge templates, stronger integrations | Xây module silo theo ngành |
| Phase 4 | Tăng maturity nền tảng và delivery scale | Partner readiness, advanced governance, intelligence, product ops maturity | Dùng phase sau để biện minh cho thiếu kỷ luật hiện tại |

## 15. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định roadmap sau cho Nextflow OS:

1. Roadmap phải được quản lý theo **capability phases**, không theo feature accumulation.  
2. Phase 1 tập trung vào **first wedge launch slice** cho retail/distribution nhẹ.  
3. Phase 2 ưu tiên **wedge deepening and operational strength**, không nhảy vội sang breadth.  
4. Phase 3 dùng shared core để mở sang **wedge thứ hai và template expansion**, không tạo module silo mới.  
5. Phase 4 tập trung vào **platform maturity, partner readiness và intelligence**, sau khi core product đã đủ chắc.  
6. Mọi yêu cầu roadmap phải đi qua guardrails về wedge value, shared core, boundary clarity và implementation cost.

## 16. Điều kiện hoàn thành của tài liệu

Capability Roadmap and Phases được xem là đạt yêu cầu khi:
- các teams có cùng một cách hiểu về thứ tự mở rộng capability;  
- Product và Engineering có thể phân biệt rõ launch-critical, growth-critical, expansion-critical và strategic-later;  
- GTM và Delivery có thể kể được lộ trình nâng cấp sản phẩm một cách trung thực;  
- và các tài liệu Experience Strategy, Implementation Plan và Sales Enablement có thể dùng roadmap này làm baseline mà không cần tự diễn giải lại thứ tự phase.

## AG Execution Prompt

You are acting as a senior product roadmap strategist, platform-sequencing architect, and cross-functional planning analyst.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Strategic baseline: shared core, capability engines, wedge-first GTM, template-driven delivery, and retail/light-distribution as the first launch wedge.
- This document defines the capability-phase roadmap that follows the first wedge capability slice.

### Objective
Refine this Capability Roadmap and Phases document into a production-grade sequencing artifact that can guide product planning, engineering prioritization, UX depth decisions, GTM packaging, and deployment readiness over multiple phases.

### Inputs
- Use this document plus Product Overview, Capability Map, Engine Boundary Specification, and First Wedge Capability Slice as the primary source of truth.
- Preserve the wedge-first sequencing logic and the distinction between launch, growth, expansion, and strategic-later capabilities.
- Keep the output practical for planning, not a generic innovation roadmap.

### Tasks
1. Rewrite the phase logic into a sharper roadmap thesis.
2. Produce a capability-phase matrix showing when each major capability should deepen.
3. Add explicit dependency chains and blockers between phases.
4. Produce a phase-readiness checklist for Product, UX, Engineering, GTM, and Delivery.
5. Identify the top roadmap drift risks and create governance guardrails.
6. Mark which capabilities should be sold confidently, sold carefully, or not sold yet at each phase.
7. Recommend how this roadmap should constrain the next documents: Experience Strategy and Engineering Implementation Plan.

### Constraints
- Do not turn the roadmap into a date-based commitment without capability readiness logic.
- Do not let Phase 2 or Phase 3 become excuses for breadth-first expansion.
- Do not collapse wedge expansion into custom module creation.
- Keep the output specific enough for real cross-functional planning.

### Output Format
Return a revised markdown document with these sections:
1. Executive Roadmap Thesis
2. Capability-Phase Matrix
3. Dependency and Blocker Map
4. Phase Readiness Checklist
5. Sales and Delivery Signaling
6. Roadmap Drift Risks and Guardrails
7. Downstream Constraints
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the sequencing logic of Nextflow OS highly explicit.
- The roadmap must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams avoid both premature breadth and underpowered wedge execution.
- The result must be usable by product, engineering, GTM, and delivery teams.
