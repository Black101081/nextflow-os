# Nextflow OS – Web Admin Wireframe Blueprints

**Document ID:** 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Architecture / Product Management  
**Dependent Packs:** Engineering Implementation, Frontend Delivery, Design System, QA & Support, Sales & Enablement  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **wireframe blueprints cấp chiến lược cho Web Admin** của Nextflow OS. Nếu các tài liệu trước đã khóa vai trò của Web Admin như control surface, IA/navigation model, screen taxonomy, launch-critical user flows, state grammar, interaction guardrails và persona-based landing strategy, thì tài liệu này hạ xuống một lớp cụ thể hơn nhưng vẫn ở cấp blueprint thay vì pixel-perfect UI:

> **Mỗi screen family ưu tiên của Web Admin nên được bố trí theo cấu trúc khối nào, vùng nào phải xuất hiện trước, vùng nào là bắt buộc, thứ tự hierarchy nên ra sao, và các actions / signals / context / history phải được phân bố như thế nào để các wireframes chi tiết sau này không đi chệch hướng?**

Wireframe blueprint không nhằm đóng thiết kế cuối. Nó nhằm đóng **cấu trúc quyết định** của từng loại màn hình: người dùng nhìn gì trước, thao tác ở đâu, ngữ cảnh nằm cạnh hành động nào, blocked/approval/history xuất hiện tại vị trí nào, và layout nên phục vụ operational clarity thế nào. Nếu không có blueprint ở mức này, đội thiết kế và frontend rất dễ tạo ra nhiều wireframe đúng cục bộ nhưng sai hệ thống.

Tài liệu này phải khóa mười một thứ:
1. Vai trò của wireframe blueprints trong Pack 03.  
2. Những screen families nào của Web Admin cần blueprint ngay ở phase đầu.  
3. Cấu trúc blueprint cho Overview screens.  
4. Cấu trúc blueprint cho Queue / Worklist screens.  
5. Cấu trúc blueprint cho Record Detail screens.  
6. Cấu trúc blueprint cho Approval / Decision screens.  
7. Cấu trúc blueprint cho Exception / Recovery screens.  
8. Cấu trúc blueprint cho Setup / Import / Support screens ở mức cần thiết.  
9. Nguyên tắc bố trí state, actions, history, filters, side panels và feedback zones.  
10. Những anti-pattern layout phải tránh.  
11. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vai trò của wireframe blueprints trong Nextflow OS

Trong Nextflow OS, wireframe blueprints không phải “wireframe nháp”. Chúng là **khung bố cục có chủ đích** để các team cùng hiểu Web Admin sẽ nói chuyện với người dùng bằng cấu trúc nào. Chúng giúp bảo vệ ba thứ:
- **Hierarchy** – cái gì phải nổi trước.  
- **Context integrity** – ngữ cảnh nào phải nằm gần hành động nào.  
- **Operational coherence** – các screen families khác nhau phải cùng nói một ngôn ngữ điều hành.

Blueprints đặc biệt quan trọng với Web Admin vì đây là surface dễ bị kéo theo nhiều hướng: dashboarding, table-heavy admin, form-heavy setup, audit-heavy review hoặc patchwork từ các feature requests. Nếu không khóa bố cục ở cấp nguyên tắc, control surface sẽ mất xương sống.

## 3. Blueprint thesis cho Web Admin

Blueprint thesis của tài liệu này có thể phát biểu như sau:

> **Mọi wireframe của Web Admin phải làm rõ một operational question chính, đặt state và urgency đủ nổi, cho phép drill-down tự nhiên, và giữ decision context đủ gần hành động để người dùng không phải tự ghép thông tin trong đầu.**

Từ thesis này, tám nguyên lý blueprint được suy ra:

1. Layout phải được dẫn dắt bởi **operational question**, không bởi component availability.  
2. Mỗi screen cần có **primary zone** và **supporting zones** rõ ràng.  
3. State, urgency và ownership cues phải ở vùng scan đầu.  
4. Actions có hậu quả phải nằm gần ngữ cảnh quyết định.  
5. History và traceability phải đủ gần để tạo trust nhưng không lấn action.  
6. Filters và grouping controls phải hỗ trợ triage, không tạo cognitive tax thừa.  
7. Side panels, drawers hoặc sub-sections phải có vai trò rõ, không được là nơi nhét phần “còn lại”.  
8. Web Admin wireframes phải tối ưu cho control clarity, không mô phỏng mobile execution patterns.

## 4. Scope blueprint cho phase đầu

Không phải mọi screen family cần blueprint sâu ngang nhau trong giai đoạn đầu. Tài liệu này ưu tiên các families theo logic launch slice.

### Tier A – Blueprint bắt buộc sâu
- Overview Screens.  
- Queue and Worklist Screens.  
- Record Detail Screens.  
- Approval and Decision Screens.

### Tier B – Blueprint quan trọng ở mức support
- Exception and Recovery Screens.  
- Traceability and History views embedded in core screens.  
- Import / Validation review screens.

### Tier C – Blueprint mỏng hơn ở phase đầu
- Setup / Configuration admin views.  
- Utility support views có tần suất thấp.

## 5. Blueprint grammar dùng chung cho mọi Web Admin screens

Trước khi đi vào từng family, tài liệu này khóa một grammar bố cục dùng chung.

## 5.1 Top frame

Mỗi screen nên có một top frame tương đối nhất quán gồm:
- screen title hoặc view title rõ;  
- context subtitle khi cần, ví dụ branch scope, queue scope hoặc approval bucket;  
- key state / urgency / count cues ở mức phù hợp;  
- và các actions cấp màn hình nếu có.

Top frame không nên bị biến thành banner lớn trang trí. Nó phải là vùng orientation đầu tiên.

## 5.2 Primary workspace

Đây là vùng trả lời operational question chính của screen. Với dashboard là summary signals; với worklist là danh sách triage; với detail là object understanding; với approval là decision context.

## 5.3 Supporting context zone

Đây là vùng chứa context phụ nhưng cần thiết như filters, summaries, recent history, related tasks, evidence snippets hoặc branch metadata. Nó không nên cướp vai primary workspace.

## 5.4 Action zone

Nếu một screen có action quan trọng, vùng hành động phải được nhìn thấy đủ sớm và phải nằm gần ngữ cảnh liên quan. Không nên buộc người dùng đọc hết trang mới thấy action chính.

## 5.5 Outcome / feedback surface

Một số screens cần vùng phản hồi hoặc transition cues đủ rõ để người dùng hiểu sau action item sẽ đi đâu. Điều này đặc biệt quan trọng với approvals, recovery và reassignment actions.

## 6. Overview Screen blueprints

Overview Screens là điểm vào của decision personas và đôi khi là lớp quét đầu của coordination personas. Blueprint của family này phải tối ưu cho orientation và prioritization.

## 6.1 Operational question chính

- Hệ vận hành đang khỏe hay có vấn đề ở đâu?  
- Cái gì cần chú ý trước?  
- Tôi nên drill vào vùng nào tiếp theo?

## 6.2 Blueprint cấu trúc cấp cao

### Zone A – Header / control bar
- View title: Operations Overview hoặc biến thể tương ứng.  
- Scope indicator: tenant-wide, branch cluster hoặc time context nếu có.  
- Lightweight actions: refresh, switch scope, saved view access nếu phase đầu có.

### Zone B – Priority signals strip
- Pending approvals.  
- Blocked items.  
- Overdue items.  
- High-risk / needs-attention counts.  
- Các cards/tiles ở đây phải click-through được vào views sâu hơn.

### Zone C – Operational health summary
- Items by major state.  
- Open work concentration.  
- Branch hotspots.  
- Summary modules phải ưu tiên scan và drill, không ưu tiên chart art.

### Zone D – Hotspot drill-down area
- Branch/site slices.  
- Queue pressure slices.  
- Approval pressure slices.  
- Đây là nơi người dùng thấy “nơi nào nóng nhất” thay vì chỉ “có bao nhiêu”.

### Zone E – Recent notable movements hoặc exception highlights
- Mục này nên mỏng, chỉ đủ để tạo cảm giác hệ thống sống.  
- Không nên biến overview thành event log wall.

## 6.3 Layout rules

- Priority signals phải nằm cao hơn generic summaries.  
- Các counts chỉ nên xuất hiện nếu có đường đi rõ tới queue/detail liên quan.  
- Branch hotspot modules nên đủ nhỏ để scan nhanh, đủ rõ để so sánh được.

## 6.4 Không được làm gì

- Không nhồi quá nhiều biểu đồ.  
- Không xếp mọi metric ngang hàng.  
- Không đặt approval/blocked/overdue ở dưới quá sâu.  
- Không biến overview thành trang báo cáo đọc thụ động.

## 7. Queue and Worklist Screen blueprints

Đây là family vận hành hằng ngày của coordination personas. Blueprint phải phục vụ triage hơn là display data.

## 7.1 Operational question chính

- Cái gì đang chờ xử lý?  
- Cái gì quan trọng nhất?  
- Item nào cần vào detail, approval hoặc recovery ngay?

## 7.2 Blueprint cấu trúc cấp cao

### Zone A – Header / queue identity
- Queue title hoặc saved-view name.  
- Scope context: branch, owner, queue type hoặc needs-attention context.  
- Count summary ngắn: total, blocked, overdue, approval-needed ở mức phù hợp.

### Zone B – Filter and grouping bar
- Branch filter.  
- Status filter.  
- Owner filter.  
- Needs-attention / blocked / overdue quick toggles.  
- Saved views entry nếu phase đầu có.

### Zone C – Worklist primary pane
- Danh sách items scanable.  
- Mỗi row/card phải cho thấy: item identity, dominant state, urgency cue, owner, branch cue, approval/blocked signal nếu có.  
- Interaction mục tiêu là chọn đúng item nhanh chứ không đọc toàn bộ chi tiết ngay trên list.

### Zone D – Inline triage helpers
- Group headers, priority buckets, overdue ribbons hoặc queue-specific summary cues.  
- Có thể dùng để giảm việc mở item không cần thiết.

### Zone E – Secondary detail preview hoặc side panel tùy pattern
- Dùng khi cần preview item ngắn mà chưa rời worklist hoàn toàn.  
- Chỉ nên dùng nếu giúp coordination thực sự, không làm layout rối.

## 7.3 Layout rules

- Filters phải ở gần worklist, không chôn trong hidden settings.  
- Worklist phải chiếm phần lớn không gian chính.  
- Dominant state, owner và urgency phải scan được nhanh.  
- Nếu có side panel preview, nó phải hỗ trợ chứ không lấn mục đích triage.

## 7.4 Không được làm gì

- Không biến worklist thành raw table dump.  
- Không ẩn blocked/overdue cues quá sâu.  
- Không đặt quá nhiều bulk controls nếu chúng không thuộc launch needs.  
- Không làm người dùng mất filter context khi vào và quay ra detail.

## 8. Record Detail Screen blueprints

Record Detail là nơi object truth và operational context gặp nhau. Blueprint của family này phải vừa giúp hiểu item vừa giúp quyết định đúng.

## 8.1 Operational question chính

- Item này là gì?  
- Nó đang ở đâu trong flow?  
- Có context nào quan trọng để tôi hành động?  
- Tôi có thể hoặc nên làm gì tiếp theo?

## 8.2 Blueprint cấu trúc cấp cao

### Zone A – Identity and state header
- Record title / ID / primary identifier.  
- Dominant record state.  
- Supporting work / approval / exception cues khi quan trọng.  
- Branch/site context.  
- Owner/assignee context.

### Zone B – Key facts summary
- Các facts chính nhất để hiểu item nhanh.  
- Có thể gồm timestamps quan trọng, category, request type hoặc high-signal metadata.  
- Chỉ giữ những gì phục vụ quyết định hoặc coordination.

### Zone C – Primary action / decision bar
- Approve / reject / request info / reassign / mark recovery actions tùy context.  
- Không phải lúc nào cũng hiện mọi action; actions phải theo state và role.  
- Action bar nên ở gần top half của screen nếu action là trọng tâm.

### Zone D – Core detail body
- Nội dung chính của record: details, line items, notes tóm lược, linked evidence summary, related work.  
- Có thể chia sections rõ thay vì một form dài.

### Zone E – Related operational context
- Related tasks hoặc current work handling.  
- Pending approval snapshot.  
- Exception marker nếu có.  
- Người điều phối phải hiểu item đang “sống” thế nào trong flow hiện tại.

### Zone F – Traceability / history region
- Recent timeline, key decision history hoặc history tab/section có meaning.  
- Phải đủ gần để tạo trust nhưng không cướp vai core detail body.

## 8.3 Layout rules

- Identity + state phải đứng trên mọi thứ khác.  
- Action bar phải không bị tách khỏi context khiến người dùng quyết định “mù”.  
- History nên xuất hiện như support evidence chứ không đè lên hiện tại.  
- Sections phải hỗ trợ đọc theo tầng: summary → core detail → support detail → history.

## 8.4 Không được làm gì

- Không biến detail page thành technical data dump.  
- Không nhồi mọi field editable vào cùng một view nếu không phục vụ launch flows.  
- Không để actions quan trọng ở cuối trang sau một khối nội dung dài.  
- Không tách approval context ra xa action đến mức người dùng phải nhớ bằng đầu.

## 9. Approval and Decision Screen blueprints

Family này là nơi decisions có hậu quả được thực hiện. Layout phải làm rõ lý do quyết định và outcome của quyết định.

## 9.1 Operational question chính

- Tôi đang được yêu cầu quyết định điều gì?  
- Vì sao?  
- Nếu tôi chọn A hoặc B thì item đi đâu?  
- Tôi có đủ context để quyết định chưa?

## 9.2 Blueprint cấu trúc cấp cao

### Zone A – Approval header
- Approval title / item identity.  
- Pending approval cue nổi.  
- Priority / age / branch context nếu quan trọng.  
- Approval reason headline.

### Zone B – Decision context summary
- Record summary ngắn.  
- Current state.  
- Relevant branch/site.  
- Owner / requester.  
- Key facts khiến approval cần thiết.

### Zone C – Policy / threshold / exception cue area
- Nếu approval liên quan ngưỡng, ngoại lệ hoặc lệch chuẩn, vùng này phải nêu đủ để hiểu vì sao cần quyết định.  
- Không cần phơi toàn bộ rule engine, nhưng phải đủ meaning.

### Zone D – Reasoning / supporting information
- Notes liên quan.  
- Evidence snapshots.  
- Recent history hoặc prior actions có liên quan trực tiếp.

### Zone E – Decision action zone
- Approve.  
- Reject.  
- Request more info.  
- Override nếu quyền cho phép.  
- Nếu cần reasoning input, input phải nằm rất gần action selected.

### Zone F – Outcome expectation cue
- Khu vực mô tả ngắn item sẽ đi đâu nếu quyết định được ghi nhận.  
- Đây là vùng giúp giảm anxiety và tăng trust.

## 9.3 Layout rules

- Approval reason phải hiện trước raw data.  
- Decision action zone không được xuất hiện trước khi có tối thiểu context.  
- Related history phải gần enough để dùng được khi cần, nhưng không chiếm nửa màn hình mặc định.  
- Nếu reasoning input bắt buộc, nó phải được gắn rõ với action cụ thể.

## 9.4 Không được làm gì

- Không làm approval screen như inbox detail trống thông tin.  
- Không bắt nhảy qua quá nhiều tabs để hiểu context.  
- Không dùng confirm modal như nơi duy nhất giải thích hậu quả.  
- Không để approve/reject buttons tách khỏi reasoning semantics.

## 10. Exception and Recovery Screen blueprints

Family này phục vụ những lúc flow gãy khỏi happy path. Layout phải ưu tiên problem clarity và recovery path.

## 10.1 Operational question chính

- Item đang kẹt ở đâu và vì sao?  
- Cần ai hoặc cần gì để kéo nó về flow?  
- Tôi có thể làm recovery action nào ngay lúc này?

## 10.2 Blueprint cấu trúc cấp cao

### Zone A – Problem header
- Exception title hoặc item identity.  
- Dominant exception state: blocked, missing info, overdue escalation, out-of-policy, etc.  
- Severity cue rõ.  
- Branch / owner / queue context.

### Zone B – What-is-wrong summary
- Vấn đề là gì.  
- Nó chặn bước nào.  
- Nó được đánh dấu bởi ai hoặc phát hiện khi nào nếu liên quan.

### Zone C – Recovery options zone
- Reassign.  
- Request more info.  
- Send for approval.  
- Unblock.  
- Return to work.  
- Escalate.  
- Không phải mọi action cùng lúc; phải theo state và role.

### Zone D – Supporting context
- Record snapshot.  
- Related notes / evidence / history gần nhất.  
- Dependency information đủ ngắn.

### Zone E – Outcome / next-owner cue
- Sau recovery action, item sẽ sang queue nào hoặc chờ ai.  
- Đây là phần cực quan trọng để recovery không cảm giác “bấm đại”.

## 10.3 Layout rules

- Problem statement phải đứng trước recovery action.  
- Recovery action phải gần enough để người dùng không mất nhịp.  
- Severity + blockage + next-step phải tạo thành một tam giác thông tin rõ.  
- Không làm ngoại lệ chìm trong generic detail screen nếu nó đã là operational focus riêng.

## 10.4 Không được làm gì

- Không chỉ hiển thị warning chung chung.  
- Không tách reason khỏi recovery path.  
- Không bắt người dùng tự mò queue nào sẽ nhận item sau recovery.  
- Không biến recovery thành multi-page saga nếu phase đầu chưa cần.

## 11. Traceability and History blueprint patterns

Dù taxonomy coi đây có thể là family riêng hoặc embedded sub-surface, phase đầu nên ưu tiên các blueprint patterns nhúng trong core screens.

## 11.1 Operational question chính

- Chuyện gì đã xảy ra với item này?  
- Ai đã làm gì?  
- Khi nào?  
- Vì sao tôi nên tin trạng thái hiện tại?

## 11.2 Blueprint cấu trúc cấp cao

### Pattern A – Embedded recent history panel
- Dùng trong record detail hoặc approval screens.  
- Hiển thị một đoạn recent timeline đủ để quyết định hiện tại có context.

### Pattern B – Expandable full history view
- Dùng khi user cần đào sâu hơn.  
- Không nên là thứ chiếm ưu thế mặc định ở mọi screens.

### Pattern C – Decision-linked history snippets
- Cho approvals, overrides, reassignments hoặc exception markings.  
- Hiển thị đúng mẩu lịch sử liên quan ngay gần action zone.

## 11.3 Layout rules

- History phải đọc được như narrative, không như raw log.  
- Entry quan trọng phải ưu tiên actor, action, time và effect.  
- Không làm timeline dài chiếm hết không gian core task.

## 12. Import / Validation Support Screen blueprints

Family này thuộc Tier B trong launch slice vì cần cho pilot và onboarding thật.

## 12.1 Operational question chính

- Import đang ở đâu?  
- Có bao nhiêu dòng lỗi?  
- Lỗi gì đang chặn?  
- Tôi sửa xong thì dữ liệu đi đâu?

## 12.2 Blueprint cấu trúc cấp cao

### Zone A – Import run header
- Import name / source / time.  
- Overall result summary.  
- Valid vs invalid counts.

### Zone B – Error summary strip
- Missing required fields.  
- Branch mapping issues.  
- Validation failures by category.  
- Retry-ready items.

### Zone C – Error review work area
- Danh sách errors có grouping hợp lý.  
- Row-level correction entry nếu scope phase đầu phù hợp.  
- Hoặc entry vào correction flows rõ ràng.

### Zone D – Resolution / next-step bar
- Retry import.  
- Accept valid subset.  
- Export errors / re-upload path nếu needed.  
- Next data destination cues.

## 12.3 Layout rules

- Error categories phải nổi hơn raw rows.  
- Người dùng phải hiểu correction effort ở mức nào trước khi lao vào sửa.  
- Import support screen không nên giống generic spreadsheet editor nếu phase đầu không đòi thế.

## 13. Setup / Configuration support blueprints

Phase đầu chỉ cần blueprint mỏng cho family này để tránh lấn control spine.

## 13.1 Operational question chính

- Có setting nền nào cần hoàn tất để launch slice chạy?  
- Còn readiness blocker nào không?

## 13.2 Blueprint cấu trúc cấp cao

- Header với readiness context.  
- Checklist / sections theo nhóm setup nhỏ.  
- Validation / warning area.  
- Save / continue / review next-step cues.

## 13.3 Layout rules

- Checklist clarity quan trọng hơn field density.  
- Chỉ mở advanced settings khi thật sự cần.  
- Không để setup screens ảnh hưởng grammar của control screens.

## 14. Layout rules cho action bars, side panels và secondary regions

## 14.1 Action bars

- Chỉ chứa actions thật sự có liên quan tới state hiện tại.  
- Primary action phải nổi rõ hơn destructive hoặc low-frequency actions.  
- Nếu action gây state transition quan trọng, outcome cue phải ở gần.

## 14.2 Side panels

- Dùng cho preview, supporting context hoặc quick related info.  
- Không dùng side panel như “bãi chứa” cho mọi thứ không biết đặt đâu.  
- Nếu side panel cần cho quyết định, nội dung của nó phải liên hệ trực tiếp với primary workspace.

## 14.3 Secondary regions

- Không được cạnh tranh trực tiếp với primary zone về visual weight.  
- Chỉ nên chứa supporting detail hoặc drill-down paths.  
- Nếu người dùng có thể bỏ qua secondary region mà vẫn hoàn thành nhiệm vụ chính, đó là dấu hiệu vùng này đúng vai.

## 15. Blueprint rules cho trạng thái và feedback

## 15.1 Dominant state phải ở vùng scan đầu

Ở mọi core screen, state quan trọng nhất trong ngữ cảnh hiện tại phải được nhìn thấy ngay ở top frame hoặc đầu primary workspace.

## 15.2 Approval / blocked / overdue cues phải không bị chìm

Những cues này là trọng tâm control value của Web Admin, nên vị trí và trọng lượng của chúng phải phản ánh điều đó.

## 15.3 Sau action, layout phải hỗ trợ hiểu outcome

Dù feedback là toast, inline banner hay label refresh, blueprint phải chừa chỗ để người dùng hiểu item đã đổi thế nào và đi đâu.

## 16. Anti-patterns layout nghiêm trọng phải tránh

## 16.1 Dashboard-first everywhere

Không phải screen nào cũng cần nhìn như dashboard. Worklists và decision screens cần grammar riêng.

## 16.2 Table as universal answer

Khi mọi vấn đề đều bị ép thành table, product sẽ mất hierarchy, mất context-rich decisions và mất exception clarity.

## 16.3 Detail-page dumping ground

Mọi metadata, mọi action, mọi history, mọi config bị nhét vào detail screen là dấu hiệu taxonomy và blueprint đã gãy.

## 16.4 Context far from action

Nếu người dùng phải cuộn xa hoặc nhớ nhiều chỉ để hiểu action mình sắp bấm, blueprint đó sai.

## 16.5 Hidden outcome design

Nếu sau action layout không cho thấy item đã chuyển đi đâu, control UX sẽ yếu ngay cả khi backend chạy đúng.

## 16.6 Secondary-zone inflation

Khi side panels, tabs phụ hoặc cards phụ mạnh ngang vùng chính, người dùng sẽ mất định hướng về màn hình.

## 17. Governance rules cho mọi wireframe Web Admin mới

Mọi wireframe mới của Web Admin nên đi qua các câu hỏi sau:

1. **Operational question chính của screen này là gì?**  
2. **Primary zone nằm ở đâu và nó có thật sự nổi nhất không?**  
3. **State / urgency / ownership có nằm trong vùng scan đầu không?**  
4. **Action quan trọng có ở gần enough với context không?**  
5. **History / trace có đủ gần để tạo trust mà không lấn action không?**  
6. **Layout này có đúng với screen family taxonomy không?**  
7. **Nó có vô tình kéo setup/admin concerns vào control spine không?**  
8. **Sau action, người dùng có hiểu outcome mà không cần suy đoán không?**

## 18. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.  
2. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, errors và recovery messaging.  
3. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – checklist review và governance mechanism.  
4. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – component behavior rules cho mobile execution patterns.  
5. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – input patterns riêng cho Web Admin.  
6. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona.  
7. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules về density, responsive states và scanability cho Web Admin.

## 19. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Web Admin wireframe blueprints:

1. Web Admin wireframes phải được thiết kế theo **operational question** và **screen family role**, không theo component convenience.  
2. Overview, Queue/Worklist, Record Detail và Approval/Decision là các blueprints **Tier A bắt buộc sâu**.  
3. Mỗi Web Admin screen phải có **top frame, primary workspace, supporting context zone và action logic** rõ vai trò.  
4. State, urgency, ownership và approval/exception cues phải nằm trong vùng scan đầu của các screens cốt lõi.  
5. Actions có hậu quả vận hành phải luôn ở gần enough với decision context.  
6. History và traceability phải được nhúng đủ gần để tạo trust, nhưng không được nuốt primary task.  
7. Wireframes phase đầu phải bảo vệ control spine của Web Admin và tránh table-dump, dashboard-dump hoặc detail-dump anti-patterns.

## 20. Điều kiện hoàn thành của tài liệu

Web Admin Wireframe Blueprints được xem là đạt yêu cầu khi:
- team UX và Frontend có cùng cấu trúc nền để triển khai các wireframes chi tiết của Web Admin;  
- các screen families launch-critical đã có grammar bố cục đủ rõ;  
- hierarchy giữa state, context, actions và history đã được chốt ở mức blueprint;  
- và downstream wireframes / UI comps có thể được review dựa trên baseline này thay vì preference cá nhân.

## AG Execution Prompt

You are acting as a senior UX architect, enterprise/admin wireframe strategist, and operational screen-structure designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Web Admin is the primary control surface, with screen taxonomy, user flows, state grammar, landing rules, and UX guardrails already defined.
- This document defines the wireframe blueprint baseline for Web Admin.

### Objective
Refine this Web Admin Wireframe Blueprints document into a production-grade blueprint baseline that can guide detailed wireframes, route layouts, component placement, frontend implementation planning, and UX review consistency.

### Inputs
- Use this document plus Web Admin Experience Strategy, IA/Navigation Model, Web Admin Screen Taxonomy, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, and Persona-Based Landing Strategy as the primary source of truth.
- Preserve the control-surface logic and the wedge-first launch focus.
- Keep the output concrete enough for real downstream wireframing and implementation planning.

### Tasks
1. Rewrite the blueprint thesis into a sharper executive form.
2. Produce a screen-family blueprint register with purpose, layout zones, dominant state emphasis, and primary actions.
3. Add a placement policy for headers, filters, lists, detail regions, decision zones, side panels, and history areas.
4. Define blueprint rules for outcome feedback, state visibility, and context-preserving navigation.
5. Identify the top five layout failures that would weaken Web Admin as a control surface.
6. Recommend the next documents that should operationalize these blueprints into mobile blueprints, component rules, and review checklists.
7. Add governance rules to prevent dashboard-dump, table-dump, and detail-dump drift.

### Constraints
- Do not design Web Admin as a decorative BI dashboard.  
- Do not let tables act as the universal solution.  
- Do not separate important actions from decision context.  
- Do not let setup/config logic dominate core control screens.  
- Keep the output concrete enough for implementation-oriented UX work.

### Output Format
Return a revised markdown document with these sections:
1. Executive Blueprint Thesis
2. Screen-Family Blueprint Register
3. Placement Policy
4. State and Outcome Rules
5. Layout Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Web Admin wireframe structure explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams create detailed wireframes without drifting away from control-surface priorities.
- The output must reduce ambiguity around layout hierarchy, action placement, context placement, and feedback visibility.
