# Nextflow OS – Engine Boundary Specification

**Document ID:** 12_ENGINE_BOUNDARY_SPECIFICATION  
**Pack:** 02 — Product & Capability  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Architecture / Domain Design / Engineering Leadership  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Integration & Data, Experience & UX  
**Prerequisite Documents:** 10_PRODUCT_OVERVIEW, 11_CAPABILITY_MAP, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG

## 1. Mục tiêu tài liệu

Tài liệu này xác định **boundary chính thức ở cấp engine** cho Nextflow OS. Nếu Product Overview trả lời sản phẩm gồm những lớp nào, và Capability Map trả lời sản phẩm có những năng lực nào, thì Engine Boundary Specification trả lời câu hỏi khó nhất ở giữa product design và system design: **năng lực nào phải trở thành engine riêng, năng lực nào chỉ nên là shared support service, đâu là business truth, đâu là orchestration logic, đâu là policy/metadata logic, và đâu chỉ là experience/view concern**.

Đây là tài liệu cực quan trọng vì rất nhiều sản phẩm chết ở giai đoạn scale không phải do thiếu tính năng, mà do boundary được dựng sai ngay từ đầu. Khi boundary sai, năm vấn đề gần như chắc chắn xảy ra:
- nghiệp vụ bị trùng lặp ở nhiều nơi;
- workflow nuốt mất business truth;
- UI tự mang logic nghiệp vụ;
- integration phải nối vào quá nhiều điểm rời rạc;
- và mọi yêu cầu mới đều kéo sản phẩm sang custom spaghetti.

Tài liệu này tồn tại để ngăn điều đó. Nó không thay thế Architecture Deep Dive hay ADR kỹ thuật chi tiết, nhưng nó là baseline bắt buộc để engineering, product và UX dùng cùng một sơ đồ về “sự thật của hệ thống”.

## 2. Boundary trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, “engine boundary” không chỉ là ranh giới service hay repo. Nó là ranh giới của **business responsibility**. Một boundary đúng phải cho phép đội ngũ trả lời rõ:
- engine này giữ chân lý nghiệp vụ nào;
- engine này được quyền thay đổi trạng thái nào;
- engine này nhận input gì và phát ra output gì;
- engine này phụ thuộc vào engine khác bằng loại hợp đồng nào;
- và engine này không nên làm những việc gì.

Boundary tốt giúp sản phẩm vừa phát triển được theo capability, vừa tránh tình trạng “mọi thứ gọi mọi thứ”. Boundary xấu tạo ra một hệ thống nhìn bên ngoài có vẻ linh hoạt, nhưng bên trong không có ownership thực sự.

## 3. Nguyên tắc thiết kế boundary

Engine boundaries của Nextflow OS phải tuân theo mười nguyên tắc sau.

### 3.1 Business truth phải có chủ sở hữu rõ

Mỗi loại record quan trọng, mỗi lifecycle quan trọng và mỗi invariant quan trọng phải có một engine giữ. Không được để record sống rải rác ở UI, workflow, reporting layer và integration jobs cùng lúc.

### 3.2 Workflow không được trở thành business core

Workflow orchestration rất quan trọng, nhưng nó chỉ được quyền điều phối tiến trình và activation logic. Nó không được trở thành nơi duy nhất biết record thực sự là gì, trạng thái hợp lệ là gì, hay rule cốt lõi nằm ở đâu.

### 3.3 Policy không được hard-code khắp nơi

Các rule như threshold, approval conditions, assignment conditions, visibility rules hoặc override guards không được rải thành if/else trong từng màn hình hoặc từng flow riêng lẻ. Chúng phải có một nơi neo logic đủ rõ.

### 3.4 Metadata được mở nhưng trong biên an toàn

Tenant config và template config phải đủ mạnh để verticalize. Tuy nhiên, metadata không được có quyền phá invariants của engines lõi.

### 3.5 Surface không giữ chân lý riêng

Web Admin, Mobile Ops, Customer Portal hay Partner Portal chỉ là bề mặt tiêu thụ và biểu đạt product capabilities. Chúng có thể có view models và interaction logic, nhưng không được trở thành nơi định nghĩa sự thật nghiệp vụ.

### 3.6 Integration là lớp kết nối, không phải nơi thay thế core

Connectors, sync jobs và migration flows chỉ nên trao đổi với core qua các contract rõ ràng. Không được để integration jobs tự cập nhật dữ liệu bừa bãi mà bỏ qua lifecycle và policy checks của engines lõi.

### 3.7 Read models và write models phải được phân vai rõ

Một số trải nghiệm cần read model tối ưu cho dashboard hoặc mobile task lists. Tuy nhiên, read models không được trở thành nơi người ta update nghiệp vụ trực tiếp theo cách phá write truth.

### 3.8 Engine tách ra khi responsibility đủ mạnh, không tách chỉ vì “nghe microservice hơn”

Không phải capability nào cũng phải thành service riêng ngay. Boundary được xác định bởi business ownership, lifecycle complexity, change rate và coupling risk; không phải bởi thói quen chia nhỏ kỹ thuật.

### 3.9 Shared core trước, vertical forks sau cùng

Khi một yêu cầu wedge/vertical xuất hiện, phản xạ đầu tiên phải là kiểm tra nó thuộc engine lõi nào hoặc metadata/policy layer nào. Chỉ khi không thể khái quát hóa một cách lành mạnh mới xem xét extension đặc thù.

### 3.10 Mọi boundary phải có explicit non-goals

Một engine boundary tốt phải nói rõ không chỉ “engine này làm gì”, mà cả “engine này không làm gì”. Chính phần non-goals ngăn scope creep và boundary erosion.

## 4. Sơ đồ engine cấp cao

Ở cấp hiện tại, Nextflow OS nên được tổ chức quanh 9 engine/engine-like zones chính và một số shared support services đi kèm.

### Engine / domain zones chính

1. **Tenant & Identity Engine**  
2. **Party & Context Engine**  
3. **Operational Record Engine**  
4. **Work Orchestration Engine**  
5. **Approval & Policy Engine**  
6. **Experience Delivery Layer**  
7. **Integration & Migration Engine**  
8. **Insight & Control Engine**  
9. **Pack & Configuration Engine**

### Shared support services đi kèm

- Notification Service  
- Audit/Event Trail Service  
- File/Object Reference Service  
- Search/Index Service  
- Background Job / Scheduler Support  
- Observability and Telemetry Support

Điều rất quan trọng là: không phải tất cả “zones” này phải là microservice tách vật lý ở ngày đầu. Nhưng về **trách nhiệm logic**, chúng phải được tách rõ ngay từ đầu.

## 5. Tenant & Identity Engine

Đây là engine nền giữ các khái niệm về tenant, người dùng, vai trò, scope truy cập và cài đặt nền liên quan đến danh tính và quyền hạn.

### 5.1 Trách nhiệm chính

- Tenant lifecycle: create, activate, suspend, plan association, environment-level settings.  
- User identity và account linkage.  
- Role model nền.  
- Team / group membership cơ bản.  
- Access scope theo tenant, branch, team hoặc role domain.  
- Identity-related security primitives.  
- Context bootstrap cho các surfaces khác.

### 5.2 Business truth mà engine này giữ

- Một user là ai trong tenant nào.  
- Một actor được phép nhìn/chạm vào những phạm vi nào.  
- Team/role/scope relationships ở cấp nền.  
- Tenant có trạng thái nền nào và có những cài đặt căn bản nào.

### 5.3 Những gì engine này không nên làm

- Không giữ lifecycle của orders, bookings, work items hoặc approvals.  
- Không quyết định nghiệp vụ approval theo domain.  
- Không quản lý template-specific business settings sâu.  
- Không trở thành CRM/party directory tổng quát.

### 5.4 Lý do phải là engine riêng

Identity và tenant discipline là nền sống còn của một SME Business OS multi-tenant. Nếu trộn chúng vào bất kỳ engine nghiệp vụ nào, hệ thống sẽ khó mở rộng, khó audit và khó thiết kế trải nghiệm đúng vai trò.

## 6. Party & Context Engine

Đây là engine giữ ngữ cảnh vận hành: khách hàng, liên hệ, nhà cung cấp, chi nhánh, site, team ownership context, resource context hoặc các thực thể xung quanh mà flow vận hành bám vào.

### 6.1 Trách nhiệm chính

- Party/account/contact structures.  
- Branch/site/location registry.  
- Ownership context links.  
- Resource/asset context ở mức nền dùng chung.  
- Quan hệ giữa actors và operating contexts.  
- Lookup context cho operational records và workflows.

### 6.2 Business truth mà engine này giữ

- “Ai / cái gì / ở đâu” là ngữ cảnh của một flow.  
- Một branch/site được định nghĩa ra sao.  
- Một record thuộc về party, location, team hay resource nào.  
- Cấu trúc ngữ cảnh nền để các engines khác tham chiếu.

### 6.3 Những gì engine này không nên làm

- Không giữ transactional lifecycle.  
- Không tự điều phối task queues.  
- Không giữ rules approval/override.  
- Không là reporting engine.  
- Không là vertical-specific master data dump.

### 6.4 Vì sao engine này cần tách khỏi Operational Record Engine

Ngữ cảnh và transaction luôn đi cùng nhau nhưng không đồng nhất. Nếu trộn toàn bộ party/branch/site/resource vào transactional engine, các vertical khác nhau sẽ kéo record engine nở theo hàng loạt context concerns không cần thiết.

## 7. Operational Record Engine

Đây là một trong hai engine lõi nhất của Nextflow OS. Nó giữ **business truth của các records vận hành trung tâm** mà doanh nghiệp thực sự quan tâm và theo dõi.

### 7.1 Trách nhiệm chính

- Định nghĩa các record types vận hành cốt lõi.  
- Quản lý record creation/update theo domain semantics.  
- Giữ lifecycle hợp lệ của từng loại record.  
- Gắn line items, details, attachments references, evidence links, associated data.  
- Gắn status history và transitions ở cấp truth.  
- Bảo đảm invariants của record tồn tại và được kiểm tra đúng chỗ.

### 7.2 Business truth mà engine này giữ

- Một operational record là gì.  
- Record đó có các trạng thái nào hợp lệ.  
- Những transition nào hợp lệ hoặc không hợp lệ.  
- Các domain actions nào được phép diễn ra trên record.  
- Các liên hệ chính giữa record và party/location/owner contexts.

### 7.3 Những gì engine này không nên làm

- Không tự điều phối queue và assignment phức tạp toàn cục.  
- Không thay thế workflow engine.  
- Không giữ tất cả policy thresholds như logic cứng bên trong mọi nơi.  
- Không render dashboard hoặc manage delivery surfaces.  
- Không làm ETL/migration orchestration.

### 7.4 Boundary rule cực quan trọng

Bất kỳ cập nhật nào làm thay đổi sự thật nghiệp vụ của record đều phải đi qua engine này hoặc qua contract do engine này sở hữu. Không được cho UI, import jobs hay workflow runtime cập nhật tùy tiện mà bỏ qua invariants.

### 7.5 Vì sao đây là core engine

Nếu không có Operational Record Engine đúng nghĩa, Nextflow OS sẽ chỉ là workflow shell hoặc dashboard shell. Record truth là nơi sản phẩm trở thành business system.

## 8. Work Orchestration Engine

Đây là engine điều phối công việc, tasks, queues, assignments, escalations và flow progression ở cấp tiến trình vận hành.

### 8.1 Trách nhiệm chính

- Tạo/đóng/cập nhật work items và tasks.  
- Gán việc, phân phối queue, handoff, reassignment.  
- Điều phối flow progression dựa trên events và policy outcomes.  
- Quản lý escalations, exception routes và deadline-driven next actions.  
- Tổ chức work views cho operator/supervisor layers.

### 8.2 Business truth mà engine này giữ

- Công việc nào đang mở.  
- Việc nào thuộc queue nào.  
- Ai đang là assignee/owner hiện tại ở cấp xử lý.  
- Next-step progression của tiến trình.  
- Tình trạng blocked/escalated/awaiting-action ở cấp công việc.

### 8.3 Những gì engine này không nên làm

- Không định nghĩa bản chất record vận hành cốt lõi.  
- Không sở hữu party/branch master context.  
- Không hard-code approval thresholds.  
- Không là nơi gốc của reporting truth dài hạn.  
- Không được phép sửa record invariants mà không qua Operational Record Engine.

### 8.4 Quan hệ với Operational Record Engine

Operational Record Engine giữ sự thật của record; Work Orchestration Engine giữ sự thật của tiến trình xử lý và assignment quanh record đó. Hai engine này liên quan chặt chẽ nhưng không được nhập làm một khối mù. Đây là điểm boundary khó nhất nhưng quan trọng nhất trong toàn bộ sản phẩm.

## 9. Approval & Policy Engine

Đây là engine giữ logic approval, thresholds, override rules, assignment rules và policy evaluation đủ tổng quát để không phải hard-code khắp nơi.

### 9.1 Trách nhiệm chính

- Định nghĩa approval models.  
- Đánh giá policy conditions.  
- Tính toán rule outcomes cho approvals, thresholds, escalations hoặc guardrails.  
- Ghi nhận approval decisions, rejection reasons, override reasons.  
- Cung cấp policy/predicate services cho record và orchestration engines.

### 9.2 Business truth mà engine này giữ

- Khi nào một action cần phê duyệt.  
- Ai đủ thẩm quyền duyệt hoặc override.  
- Rule nào áp dụng theo tenant/branch/template context.  
- Quyết định approval có ý nghĩa gì đối với flow.

### 9.3 Những gì engine này không nên làm

- Không là engine sở hữu record lifecycle toàn phần.  
- Không là queue manager tổng quát.  
- Không render UI-specific forms.  
- Không chứa metadata lung tung không liên quan policy.  
- Không thay cho Pack & Configuration Engine trong việc lưu template composition.

### 9.4 Tại sao không nhét policy vào từng engine khác

Nếu approval/policy logic bị nhét rải rác vào record engine, workflow engine, UI forms và imports, sản phẩm sẽ rất khó audit và cực khó sửa khi thay đổi policy theo tenant. Approval & Policy Engine tạo điểm neo cho operational discipline.

## 10. Pack & Configuration Engine

Đây là engine giúp Nextflow OS verticalize và template hóa mà không phá shared core. Nó là nơi neo logic về pack composition, template installation, defaults, configurable forms/labels/flags, và các bindings giữa pack với capabilities/surfaces/policies.

### 10.1 Trách nhiệm chính

- Registry của solution packs và template packs.  
- Installation/uninstallation/activation state của packs theo tenant.  
- Template defaults và bindings.  
- Form/field/display configuration trong biên an toàn.  
- Pack-specific options, naming layers, labels, enumerations.  
- Mapping giữa pack và experience surfaces/policy presets.

### 10.2 Business truth mà engine này giữ

- Tenant nào đang dùng pack nào.  
- Pack đó kích hoạt cấu hình và preset gì.  
- Những thành phần nào có thể tùy chỉnh mà không phá core.  
- Template delivery state của tenant.

### 10.3 Những gì engine này không nên làm

- Không sở hữu operational lifecycle.  
- Không giữ assignment truth hoặc queue truth.  
- Không lưu mọi tenant setting vô tổ chức.  
- Không là bãi đáp của mọi “khác biệt khách hàng”.

### 10.4 Tại sao engine này phải tồn tại riêng

Vì Nextflow OS sống bằng shared core + template delivery. Nếu pack/configuration logic không có boundary riêng, sự khác biệt theo tenant sẽ chảy vào UI hard-code, workflow hacks hoặc custom branches rất nhanh.

## 11. Integration & Migration Engine

Đây là engine phục vụ safe adoption, legacy replacement và coexistence với hệ thống bên ngoài. Nó không chỉ là một tập connector; nó là một năng lực sản phẩm có cấu trúc.

### 11.1 Trách nhiệm chính

- Import pipelines.  
- Mapping and transformation workflows.  
- Migration session/workspace management.  
- Connector lifecycle states.  
- Sync orchestration ở mức tích hợp.  
- Validation and reconciliation jobs.  
- Cutover support flows, dry-run records, import reports.

### 11.2 Business truth mà engine này giữ

- Một migration/import session là gì.  
- Mapping nào đang áp dụng.  
- Dataset nào đã được ingest/validated/failed/reconciled.  
- Kết quả reconciliation và readiness của cutover từng batch.

### 11.3 Những gì engine này không nên làm

- Không bypass invariants của Operational Record Engine.  
- Không trở thành nơi người ta chỉnh dữ liệu nghiệp vụ trực tiếp.  
- Không hard-code cả business logic của các record types.  
- Không là reporting layer dài hạn thay thế Insight Engine.

### 11.4 Boundary rule quan trọng

Integration & Migration Engine có quyền chuẩn bị, kiểm tra, map và gửi lệnh tạo/cập nhật thông qua contracts hợp lệ; nhưng không được “chọc trực tiếp” vào truth stores của engines lõi theo cách bỏ qua policy và lifecycle checks.

## 12. Insight & Control Engine

Đây là engine đọc từ nhiều nguồn truth để tạo dashboards, control views, backlog visibility, bottleneck insight, reporting extracts và về sau là intelligence layer.

### 12.1 Trách nhiệm chính

- Operational dashboards.  
- Queue and SLA visibility.  
- Cross-engine reporting views.  
- Aggregated control views.  
- Bottleneck and exception insight.  
- Export-ready and management-ready data projections.  
- Intelligence-ready derived views.

### 12.2 Business truth mà engine này giữ

Insight Engine không nên là write truth của nghiệp vụ cốt lõi. Nó giữ **derived truth** và **read-optimized truth** phục vụ quan sát, điều hành và phân tích.

### 12.3 Những gì engine này không nên làm

- Không sở hữu record lifecycle gốc.  
- Không sở hữu approval decision gốc.  
- Không thay thế orchestration.  
- Không nhận update nghiệp vụ trực tiếp từ UI như một shortcut.

### 12.4 Vì sao phải tách khỏi operational engines

Nếu dashboard/reporting logic bị nhét vào record/workflow engines, hệ thống sẽ khó mở rộng đọc, khó tối ưu query và dễ làm write path phình lên không cần thiết. Insight & Control cần được xem là consumer có cấu trúc của truth, không phải nơi phát minh sự thật riêng.

## 13. Experience Delivery Layer

Đây là layer, không nhất thiết là “engine” theo nghĩa business core. Tuy nhiên boundary của nó phải cực kỳ rõ vì rất nhiều hệ thống thất bại khi UI layers dần trở thành business layer không chính thức.

### 13.1 Trách nhiệm chính

- Web Admin views và workflows của người quản trị/vận hành.  
- Mobile Ops interactions và task-driven experiences.  
- Customer Portal journeys.  
- Partner Portal journeys.  
- View models, interaction rules, validation trước submit, navigation state, form experience.

### 13.2 Những gì layer này được phép giữ

- UI state.  
- Draft interaction state.  
- Client-friendly derived views.  
- Local validation phục vụ usability.  
- Session-oriented presentation logic.

### 13.3 Những gì layer này không được giữ

- Không là source of truth cho operational records.  
- Không định nghĩa transitions hợp lệ của business record theo kiểu riêng.  
- Không cất approval logic cốt lõi chỉ ở frontend.  
- Không giữ policy semantics chỉ tồn tại ở một surface.

### 13.4 Boundary rule

Mọi action write có ý nghĩa nghiệp vụ phải gọi vào đúng engine/contract tương ứng. Experience Delivery chỉ trình bày, hỗ trợ thao tác và tối ưu trải nghiệm; nó không được âm thầm tái định nghĩa domain.

## 14. Shared support services

Một số phần không cần thành business engine riêng nhưng phải tồn tại như shared support services có hợp đồng rõ.

## 14.1 Notification Service

Dùng để gửi thông báo, nhắc việc, xác nhận, escalation alerts qua nhiều kênh. Service này không quyết định nghiệp vụ; nó nhận intent từ engines khác.

## 14.2 Audit/Event Trail Service

Lưu trail dùng chung cho các sự kiện quan trọng. Service này không thay thế domain event stores của từng engine, nhưng cung cấp mặt phẳng truy vết nhất quán.

## 14.3 File/Object Reference Service

Quản lý references tới files, media, attachments, proofs. Quyền sở hữu business meaning của file vẫn thuộc engine dùng file đó.

## 14.4 Search/Index Service

Tạo khả năng tìm kiếm và index read-oriented. Search không nên là write truth.

## 14.5 Background Job / Scheduler Support

Phục vụ jobs nền, retries, sync scheduling, cleanup flows hoặc deferred actions. Business ownership của mỗi job vẫn thuộc engine gọi nó.

## 14.6 Observability and Telemetry Support

Cung cấp logs, traces, metrics, health signals. Đây là năng lực nền cho vận hành hệ thống chứ không phải domain engine.

## 15. Bản đồ tương tác giữa các engines

Để tránh coupling mù, các engines của Nextflow OS nên tương tác theo logic sau.

### 15.1 Tenant & Identity Engine

- Cấp identity, role, scope cho các engines khác.  
- Không gọi ngược để nhúng logic nghiệp vụ từ record/workflow vào identity core.

### 15.2 Party & Context Engine

- Được Operational Record Engine và Work Orchestration Engine tham chiếu để gắn context.  
- Không nên phụ thuộc sâu ngược lại vào lifecycle của từng record.

### 15.3 Operational Record Engine

- Tiêu thụ identity/context/policy information.  
- Phát events cho Work Orchestration, Insight, Audit, Notification và Integration flows.  
- Nhận valid commands từ UI hoặc migration contracts.

### 15.4 Work Orchestration Engine

- Tiêu thụ record events, policy outcomes, identity scopes.  
- Phát work-state events cho Insight, Notification, Mobile Ops read models.

### 15.5 Approval & Policy Engine

- Được gọi bởi Record Engine và Work Orchestration Engine để quyết định gate/threshold/eligibility outcomes.  
- Không nên là nơi tự tạo flow operational toàn phần.

### 15.6 Pack & Configuration Engine

- Cung cấp pack presets, form config, safe metadata và template bindings cho Experience Layer, Policy Engine và đôi khi Record Engine.  
- Không nên điều khiển trực tiếp lifecycle logic lõi.

### 15.7 Integration & Migration Engine

- Đọc cấu hình, mapping, context và contracts; sau đó gửi commands hợp lệ tới Record Engine hoặc related engines.  
- Phát reconciliation/result events cho Insight và Audit.

### 15.8 Insight & Control Engine

- Chủ yếu nhận data/events từ các engines khác để tạo read models và dashboards.  
- Không phát lệnh update nghiệp vụ trực tiếp như con đường tắt.

## 16. Những boundary khó nhất cần chốt rõ

## 16.1 Record Engine và Work Orchestration Engine

Đây là boundary quan trọng nhất.

**Operational Record Engine** giữ:
- record types,
- lifecycle truth,
- allowed domain actions,
- record invariants,
- status truth ở cấp business object.

**Work Orchestration Engine** giữ:
- tasks,
- queues,
- assignments,
- escalations,
- next-step progression,
- operator-facing work state.

Một record có thể tồn tại mà chưa có task mới. Một task có thể thay đổi mà không đổi bản chất record. Chính điều này chứng minh hai engines nên tách logic, dù phối hợp chặt.

## 16.2 Policy Engine và Pack & Configuration Engine

Boundary này cũng rất dễ mờ.

**Approval & Policy Engine** giữ logic quyết định: điều kiện, thresholds, eligibility, override semantics.  
**Pack & Configuration Engine** giữ cấu hình và presets: forms, labels, enabled flows, pack defaults, tenant-safe settings.

Cấu hình có thể ảnh hưởng policy, nhưng không được khiến policy biến thành một đống metadata không còn semantics. Ngược lại, policy không được giữ tất cả cấu hình hiển thị/template chỉ vì “nó có liên quan”.

## 16.3 Experience Layer và all business engines

Boundary này phải nghiêm ngặt. UI có thể có smart interactions, nhưng không được có business truth riêng. Nếu một transition chỉ tồn tại trong mobile app mà server/domain không biết, đó là lỗi boundary.

## 16.4 Insight Engine và operational writes

Dashboards thường tạo cám dỗ làm shortcut: “bấm nút trong dashboard để sửa thẳng”. Điều này chỉ được chấp nhận nếu dashboard action gọi về đúng business engine contract; tuyệt đối không update read models như write truth.

## 17. Boundary decisions cho wedge đầu tiên

Wedge đầu tiên là Retail / phân phối nhẹ. Vì vậy boundary decisions phải ưu tiên khả năng thắng wedge này mà vẫn giữ shared core.

### 17.1 Những engines launch-critical ở wedge đầu

- Tenant & Identity Engine  
- Party & Context Engine, đặc biệt branch/site context  
- Operational Record Engine  
- Work Orchestration Engine  
- Approval & Policy Engine ở mức đủ dùng  
- Pack & Configuration Engine ở mức đủ cài pack và preset  
- Integration & Migration Engine ở mức import/mapping cơ bản  
- Insight & Control Engine ở mức dashboard vận hành cốt lõi

### 17.2 Những phần có thể giữ gọn ở phase đầu

- Resource context sâu  
- Scheduling complexity cao  
- Customer Portal rộng  
- Partner Portal đầy đủ  
- AI/Intelligence layer sâu

### 17.3 Hệ quả cho implementation order

Không nên build dashboard và workflow demo quá sớm nếu chưa có boundary đúng cho Operational Record và Approval/Policy. Wedge đầu sẽ nhìn rất “chạy được” ở bề mặt, nhưng về sau product sẽ gãy khi thêm tenant rules, approvals và migration.

## 18. Các anti-pattern boundary phải tránh

### 18.1 UI-owned business logic

Khi frontend tự định nghĩa transitions, validations nghiệp vụ hoặc approval conditions mà server/domain không giữ lại đầy đủ.

### 18.2 Workflow-everything syndrome

Khi mọi business meaning bị đẩy vào flow builder, dẫn đến records chỉ còn là cái vỏ dữ liệu không có domain semantics.

### 18.3 Metadata dumping

Khi Pack/Config Engine trở thành nơi nhét mọi cấu hình không có cấu trúc, khiến hệ thống không còn biết đâu là form tweak, đâu là policy, đâu là domain extension.

### 18.4 Integration bypass

Khi import/sync jobs viết thẳng vào database hoặc truth stores mà không đi qua domain contracts.

### 18.5 Reporting-as-truth

Khi dashboard aggregates hoặc exports trở thành nơi người ta tin hơn domain truth và bắt đầu sửa vận hành bằng read stores.

### 18.6 Engine-per-screen disease

Khi vì UI có nhiều màn hình mà engineering vô thức tách thành quá nhiều services nhỏ theo trang, phá hỏng khả năng giữ business ownership.

## 19. Signals để biết một boundary đang bị xói mòn

Một boundary nên được coi là đang bị xói mòn khi xuất hiện các tín hiệu sau:
- cùng một rule xuất hiện ở record engine, workflow config và frontend;  
- import jobs cần biết quá nhiều chi tiết nội bộ của record tables;  
- dashboard muốn cập nhật trạng thái trực tiếp không qua domain commands;  
- mọi vertical request đều dẫn đến thêm cột/flag/branch logic vào cùng một nơi;  
- team không trả lời được “engine nào là chủ sở hữu của sự thật này”.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định boundary cấp sản phẩm sau:

1. Nextflow OS phải có **Operational Record Engine** và **Work Orchestration Engine** tách logic rõ ràng.  
2. Approval/Policy phải có boundary riêng, không được hard-code phân tán.  
3. Pack/Configuration phải là nơi verticalize an toàn, không phải bãi chứa khác biệt khách hàng.  
4. Experience surfaces không được sở hữu business truth.  
5. Integration/Migration phải đi qua domain contracts, không bypass core invariants.  
6. Insight/Control là read and derived layer, không phải operational write truth.  
7. Shared support services phải tồn tại với trách nhiệm rõ nhưng không thay thế business engines.  
8. Wedge đầu tiên phải được build trên boundary đúng, không được hy sinh kiến trúc trách nhiệm để làm demo nhanh.

## 21. Điều kiện hoàn thành của tài liệu

Engine Boundary Specification được xem là đạt yêu cầu khi:
- product, architecture và engineering cùng chỉ ra được engine nào sở hữu truth nào;  
- UX hiểu rõ phần nào là concern của surface, phần nào là concern của domain;  
- Integration & Data team biết phải nối vào đâu và không được bypass ở đâu;  
- tài liệu Architecture & Core Design có thể đi sâu vào service topology, event contracts và storage strategies mà không phải tranh luận lại business ownership.

## AG Execution Prompt

You are acting as a senior domain-driven design architect, product-platform boundary strategist, and engineering system-design lead.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Strategic model: shared core, capability engines, workflow orchestration, template packs, safe tenant-level configuration, web-first and mobile-assisted delivery.
- This document defines the logical engine boundaries that connect product capability design to system architecture.

### Objective
Refine this Engine Boundary Specification into a production-grade domain-boundary control document that can guide architecture, engineering implementation, integration design, and UX/service contracts.

### Inputs
- Use this document, Product Overview, Capability Map, and the Pack 01 strategy baseline as the primary source of truth.
- Preserve the distinction between business truth, orchestration, policy, metadata/configuration, insight, and surface logic.
- Keep the output oriented toward responsibility design, not just abstract software architecture language.

### Tasks
1. Rewrite the boundary model into a formal domain responsibility map.
2. Produce an engine register listing responsibility, owned truth, allowed writes, consumed inputs, emitted outputs, and non-goals.
3. Produce a coupling and dependency map across engines.
4. Add a boundary-risk matrix identifying where erosion is most likely and how to prevent it.
5. Mark which engines are launch-critical for the first wedge and what minimum viable depth each needs.
6. Recommend which zones may begin in one deployable service and which should be treated as separate architectural seams from day one.
7. Add explicit guidance for the next documents: Architecture Overview and Engineering Implementation Plan.

### Constraints
- Do not collapse record truth into orchestration.
- Do not allow UI layers to become hidden business engines.
- Do not turn configuration into an unbounded custom-code substitute.
- Do not create unnecessary microservice fragmentation without business responsibility reasons.
- Keep the output concrete enough for implementation and review.

### Output Format
Return a revised markdown document with these sections:
1. Executive Boundary Thesis
2. Engine Responsibility Register
3. Coupling and Dependency Map
4. Boundary Risk Matrix
5. First-Wedge Critical Engine Slice
6. Deployability and Architectural Seams
7. Downstream Guidance
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make business ownership boundaries explicit across the product.
- The result must stay fully consistent with Nextflow OS as an SME Business OS.
- The document must help architecture and engineering move forward without ambiguity about core truths and responsibilities.
- The output must reduce the risk of workflow sprawl, UI-owned logic, integration bypass, and template-driven boundary erosion.
