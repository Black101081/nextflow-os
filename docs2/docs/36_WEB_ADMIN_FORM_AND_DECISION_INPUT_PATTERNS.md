# Nextflow OS – Web Admin Form and Decision Input Patterns

**Document ID:** 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Product Management / Frontend UX Engineering  
**Dependent Packs:** Engineering Implementation, Frontend Delivery, Design System, QA & Support, Deployment & Support  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **các pattern chính thức cho forms, decision inputs, corrections và admin-side input behaviors** trên Web Admin của Nextflow OS trong Pack 03. Nếu Mobile-side input patterns đã được khóa ở tài liệu 29, Web Admin wireframe blueprints đã được khóa ở tài liệu 31, còn messaging và governance đã được khóa ở tài liệu 33 và 34, thì tài liệu này đi vào một lớp rất quan trọng còn lại của control surface:

> **Khi người dùng Web Admin cần phê duyệt, từ chối, override, request more info, reassign, sửa dữ liệu lỗi, xử lý import validation, hoặc nhập các thông tin điều hành có hậu quả vận hành rõ, họ phải được dẫn qua những form và decision-input patterns nào để quyết định đúng, nhanh và có trace đủ mạnh?**

Web Admin không nên bị đối xử như một nơi “có màn hình lớn nên cứ làm form dài”. Trong một SME Business OS, các inputs trên Web Admin thường có hậu quả cao hơn mobile execution inputs: chúng có thể đổi ownership, mở hoặc chặn flow, xác nhận ngoại lệ, sửa dữ liệu nền, hoặc ảnh hưởng trực tiếp đến approval / routing / traceability. Vì vậy pattern cho Web Admin phải đồng thời bảo vệ bốn thứ:
- **decision quality** – người dùng có đủ context để quyết định đúng;  
- **input discipline** – hệ thống chỉ hỏi đúng những gì cần cho truth và trace;  
- **operational outcome clarity** – sau input, item đi đâu phải rõ;  
- **reviewability** – về sau người khác nhìn lại vẫn hiểu chuyện gì đã xảy ra và vì sao.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của Web Admin form và decision-input patterns trong Pack 03.  
2. Phân loại các input moments chính thức của Web Admin.  
3. Pattern cho approval decisions.  
4. Pattern cho reject / override / request-more-info decisions.  
5. Pattern cho reassignment và routing inputs.  
6. Pattern cho correction forms và validation repair flows.  
7. Pattern cho import-review và import-fix inputs.  
8. Rules cho field hierarchy, sectioning, contextual summaries và side-context.  
9. Rules cho confirmations, outcome previews và post-submit feedback.  
10. Rules cho validation, save behavior, draft safety và recovery behavior.  
11. Những anti-pattern form và decision-input nghiêm trọng phải tránh.  
12. Cách review những patterns này trong governance loop.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vai trò của Web Admin form và decision-input patterns

Trong Nextflow OS, forms và decision inputs trên Web Admin không phải chỉ là chỗ “nhập dữ liệu”. Chúng là **các cơ chế điều hành có cấu trúc** giúp control surface biến quan sát và phán đoán của con người thành các transitions có meaning trong hệ thống.

Điều này làm Web Admin input patterns khác Mobile Ops input patterns ở một số điểm nền:
- chúng thường có nhiều context hơn trước khi hành động;  
- chúng hay liên quan đến authority hoặc policy boundaries;  
- chúng có xác suất tạo trace có giá trị review cao hơn;  
- chúng thường tác động tới nhiều người hoặc nhiều bước sau đó, không chỉ một item update đơn lẻ.

Vì vậy tài liệu này không khuyến khích “form-heavy admin UX”, nhưng cũng không theo triết lý “mọi thứ phải ultra-light” như mobile. Web Admin cần một grammar input khác: **giàu context hơn mobile, nhưng vẫn phải chống lại dump-form thinking**.

## 3. Decision-input thesis cho Web Admin

Decision-input thesis của tài liệu này có thể phát biểu như sau:

> **Mọi form hoặc decision input trên Web Admin phải đưa người dùng tới một quyết định hoặc một correction có hậu quả rõ với lượng context vừa đủ, field burden có kỷ luật, validation dễ hiểu, và outcome traceable; nếu input yêu cầu quá nhiều mà vẫn không làm quyết định tốt hơn hoặc recovery rõ hơn, pattern đó là sai hướng.**

Từ thesis này, mười nguyên lý được suy ra:

1. Web Admin input phải ưu tiên **decision clarity over field volume**.  
2. Mọi decision quan trọng phải có context summary gần vùng hành động.  
3. Free text chỉ nên được yêu cầu khi nó tăng meaning, accountability hoặc recovery value thật.  
4. Rejection, override và request-more-info phải có reasoning structure đủ mạnh nhưng không thành essay burden.  
5. Correction forms phải chỉ tập trung vào những gì cần sửa hoặc cần bổ sung.  
6. Import/validation repair phải nhóm vấn đề theo loại lỗi, không để user chìm trong raw rows.  
7. Post-submit outcome phải nói item hoặc data đi đâu tiếp theo.  
8. Validation không được xóa công nhập liệu hoặc làm user đoán field nào sai.  
9. Web patterns có thể sâu hơn mobile nhưng không được drift thành bureaucratic admin UX.  
10. Decision inputs phải để lại trace đọc được như narrative ngắn, không chỉ như dấu vết kỹ thuật.

## 4. Phân loại input moments chính thức trên Web Admin

Để tránh mỗi team hình dung Web Admin input theo cách khác nhau, Pack 03 nên phân loại các input moments chính thức như sau:

1. **Approval decision moments** – approve / allow / accept.  
2. **Negative or divergent decision moments** – reject / override / request more info / send back.  
3. **Routing and ownership moments** – assign / reassign / move to queue / handoff.  
4. **Correction and remediation moments** – fix invalid data, add missing fields, reopen correction.  
5. **Import and validation management moments** – review import errors, patch validation gaps, retry subsets.  
6. **Administrative setup inputs** – low-priority configuration inputs needed for readiness or launch slice support.  
7. **Trace-enriching notes or rationale moments** – short explanations attached to decisions or recoveries.

Mỗi loại này cần pattern riêng vì mức authority, mức risk, mức context và mức tần suất hoàn toàn khác nhau.

## 5. Pattern family 1 – Approval decision patterns

## 5.1 Khi nào dùng

Pattern này dùng khi user có thẩm quyền cần ra quyết định cho một item đang chờ approval hoặc đang bị treo bởi authority step.

## 5.2 Mục tiêu

- Cung cấp đủ context để approve đúng.  
- Làm rõ vì sao approval được yêu cầu.  
- Cho biết item sẽ đi đâu nếu được approve.  
- Tối thiểu hóa burden không cần thiết nếu decision là straightforward.

## 5.3 Pattern shape ưu tiên

- Decision header rõ với item identity và approval reason.  
- Context summary ở gần top: state hiện tại, requester, branch/site, key facts.  
- Supporting evidence hoặc note snippets gần decision area.  
- Decision actions rõ: Approve, Request More Info, Reject hoặc các biến thể phù hợp.  
- Outcome cue gần action zone.

## 5.4 Khi không nên dùng pattern này

Không nên dùng approval pattern cho những actions low-risk mà thực chất chỉ là update nhẹ, vì điều đó làm hệ thống quan liêu hóa các thao tác không cần authority thật.

## 5.5 Luật thiết kế

1. Approval reason phải hiện trước chi tiết dài.  
2. Action buttons không được tách xa ngữ cảnh đến mức user phải nhớ bằng đầu.  
3. Nếu approval không cần reasoning bắt buộc, không nên ép nhập note chỉ để “có vẻ kiểm soát hơn”.  
4. Nếu approval làm item đổi queue/owner/state, UI phải preview điều đó ngắn gọn.

## 6. Pattern family 2 – Reject, override và request-more-info patterns

Đây là family quan trọng hơn approval thông thường vì nó tạo nhánh khác khỏi happy path và thường đòi accountability mạnh hơn.

## 6.1 Khi nào dùng

- Reject item.  
- Override rule hoặc hành vi chuẩn.  
- Request more info hoặc send back for clarification.  
- Thực hiện quyết định ngoài flow bình thường nhưng vẫn trong authority cho phép.

## 6.2 Mục tiêu

- Làm rõ user đang chọn nhánh gì.  
- Thu được reasoning đủ dùng cho downstream recovery hoặc audit review.  
- Làm rõ hậu quả của nhánh đó.  
- Không biến user thành người viết báo cáo dài dòng trừ khi thật sự cần.

## 6.3 Pattern shape ưu tiên

- Chọn decision path trước.  
- Hiển thị reasoning prompt phù hợp với path đã chọn.  
- Ưu tiên reason presets hoặc categories trước free text khi phù hợp.  
- Hiển thị short consequence preview: item returns to queue, waiting for more info, rejected and closed, escalated, etc.

## 6.4 Luật thiết kế

1. Reject và override không nên chia sẻ cùng một wording mơ hồ như Update Decision.  
2. Reasoning structure phải phản ánh gravity của action; override thường cần rationale mạnh hơn approval thông thường.  
3. Request more info nên nói rõ đang yêu cầu ai và item sẽ chờ ở đâu.  
4. Confirmation, nếu có, phải lặp lại outcome chứ không chỉ hỏi “Are you sure?”.

## 6.5 Khi không nên dùng

Không nên buộc reject/override đi qua multi-page wizard chỉ để thu thêm dữ liệu “cho chắc” nếu các fields đó không ảnh hưởng outcome hoặc traceability thực tế.

## 7. Pattern family 3 – Routing, assignment và reassignment patterns

## 7.1 Khi nào dùng

Pattern này dùng khi coordinator hoặc manager cần đổi ownership, queue, team scope hoặc route tiếp theo của item.

## 7.2 Mục tiêu

- Làm rõ item đang ở đâu.  
- Cho user chọn đích mới đúng nhất với ít bước.  
- Làm rõ ai sẽ thấy item tiếp theo.  
- Tránh nhầm lẫn giữa record state và ownership move.

## 7.3 Pattern shape ưu tiên

- Short current-state summary.  
- Current owner / queue snapshot.  
- New owner / queue selector rõ.  
- Optional reason field nếu move có giá trị trace hoặc nếu policy yêu cầu.  
- Outcome preview: moves to X queue, assigned to Y, removed from current workload, etc.

## 7.4 Luật thiết kế

1. Reassignment UI phải luôn cho thấy current owner trước new owner.  
2. Nếu queue move làm đổi visibility hoặc priority, điều đó phải được nói rõ.  
3. Nếu reassignment hay routing là high-frequency, pattern phải rất ngắn.  
4. Nếu move phức tạp hơn mức vài trường ngắn, nên xem lại model hoặc flow thay vì thêm form dài.

## 8. Pattern family 4 – Correction và validation-repair patterns

## 8.1 Khi nào dùng

Pattern này dùng khi user cần sửa dữ liệu lỗi, bổ sung missing info hoặc khôi phục một bước bị chặn do validation / incompleteness.

## 8.2 Mục tiêu

- Chỉ bắt user sửa đúng thứ đang sai.  
- Giữ nguyên phần đã đúng.  
- Nói rõ lỗi nào đang chặn.  
- Giúp item quay lại flow với ít confusion nhất.

## 8.3 Pattern shape ưu tiên

- Error summary ngắn ở trên.  
- Section hoặc field highlights cho đúng vùng có vấn đề.  
- Inline validation gần field.  
- Nếu có nhiều lỗi, nhóm theo loại thay vì bắt người dùng tự dò từng field ngẫu nhiên.  
- Outcome cue sau save/retry.

## 8.4 Luật thiết kế

1. Correction form không nên render lại toàn bộ object nếu chỉ vài fields đang sai.  
2. Người dùng phải hiểu field nào là blocker và field nào chỉ là optional improvement.  
3. Retry sau correction phải nói hệ thống sẽ làm gì: revalidate, return to queue, continue approval, etc.  
4. Không xóa dữ liệu hợp lệ trước đó chỉ vì một field còn lỗi.

## 9. Pattern family 5 – Import review và import-fix patterns

## 9.1 Khi nào dùng

Pattern này dùng trong onboarding hoặc admin-support contexts khi import gặp validation problems và cần review/correction trước khi usable data đi vào system.

## 9.2 Mục tiêu

- Giúp user hiểu scale của vấn đề.  
- Ưu tiên loại lỗi trước từng row cụ thể.  
- Rút ngắn đường đi tới repair actions.  
- Giảm cảm giác đây là một spreadsheet editor bất đắc dĩ.

## 9.3 Pattern shape ưu tiên

- Import run summary ở trên.  
- Error categories nổi rõ.  
- Resolution workspace theo nhóm lỗi hoặc theo subset hữu ích.  
- Short repair forms hoặc mapped correction actions.  
- Retry / accept-valid / export-errors actions rõ ràng.

## 9.4 Luật thiết kế

1. Hãy cho user thấy “bao nhiêu lỗi thuộc loại gì” trước khi bắt họ sửa row-level.  
2. Nếu nhiều rows cùng một issue, pattern nên hỗ trợ xử lý theo problem cluster thay vì row-by-row hoàn toàn.  
3. Outcome sau retry phải nói valid subset đi đâu và invalid subset còn ở đâu.  
4. Không làm import-fix screen trông như generic data table nếu điều đó che mất urgency và resolution logic.

## 10. Pattern family 6 – Administrative setup input patterns

Family này không phải trọng tâm của Pack 03 nhưng vẫn cần baseline để tránh setup drift lấn control spine.

## 10.1 Khi nào dùng

- Tenant readiness fields.  
- Mapping setup nhẹ.  
- Launch-supporting admin information.  
- Settings tối thiểu thuộc wedge đầu.

## 10.2 Mục tiêu

- Hoàn tất cấu hình cần thiết với ít mơ hồ.  
- Chỉ hỏi đúng cái launch slice cần.  
- Giữ readiness visibility rõ.

## 10.3 Luật thiết kế

1. Chia setup theo chunks có nghĩa thay vì trang settings dài vô tận.  
2. Advanced options không nên hiện ngang hàng với launch-critical setup.  
3. Validation nên nói rõ readiness blocker nào còn mở.  
4. Setup patterns không được kéo ngôn ngữ UX của control screens đi lệch hướng.

## 11. Field hierarchy và sectioning rules

## 11.1 Hỏi cái quyết định outcome trước

Field order nên phản ánh logic của quyết định hoặc correction, không phản ánh structure dữ liệu backend. Cái gì ảnh hưởng outcome hoặc unblock flow nhiều nhất nên xuất hiện trước.

## 11.2 Group theo meaning, không group theo schema thuần túy

Các fields thuộc cùng một câu hỏi vận hành nên ở cùng một section. Đừng nhóm fields chỉ vì chúng nằm gần nhau trong database model.

## 11.3 Section headers phải nói ngôn ngữ công việc

Tiêu đề section nên giúp user hiểu tại sao phần đó tồn tại, ví dụ Approval Reason, Current Assignment, Missing Information, Validation Issues, Outcome After Submit.

## 11.4 Section depth phải có kỷ luật

Nếu form phải cần quá nhiều tầng section, rất có thể pattern đang cố xử lý scope quá lớn hoặc đang dump object model lên UI.

## 12. Context summary và side-context rules

## 12.1 Context summary phải đủ gần hành động

Mọi form hoặc decision input có hậu quả vận hành phải có summary ngắn về item hiện tại nằm gần vùng quyết định.

## 12.2 Side-context chỉ nên bổ trợ, không cạnh tranh trọng lượng

Dùng side panel hoặc secondary summary cho evidence, history snippets, prior decisions hoặc related facts khi cần. Nhưng vùng này không được khiến user mất tập trung khỏi quyết định chính.

## 12.3 Trace snippets nên đủ để tránh mở thêm bước phụ

Nếu một recent note, recent reassignment hoặc recent exception marker có ảnh hưởng tới quyết định hiện tại, hãy hiển thị nó gần decision zone thay vì buộc user nhảy sang history view khác.

## 13. Confirmation và outcome-preview rules

## 13.1 Không phải mọi action đều cần modal confirm

Nếu action low-risk hoặc reversible, modal confirm có thể chỉ thêm ma sát. Nhưng nếu action là reject, override, high-impact reassignment hoặc import retry rộng, confirmation có thể hợp lý.

## 13.2 Confirm phải lặp lại hậu quả thật

Một confirmation tốt nên nói item sẽ đi đâu, chờ ai hoặc thay đổi gì. “Are you sure?” một mình quá yếu cho control UX.

## 13.3 Outcome preview nên hiện trước khi commit khi hậu quả không hiển nhiên

Đặc biệt với routing, reassignment, request-more-info hoặc negative decisions, user nên thấy preview ngắn về next owner / next queue / next state.

## 13.4 Sau submit phải có feedback outcome rõ

Hệ thống nên cho user biết decision đã được ghi nhận, item đã đi đâu, còn việc gì mở nữa hay không, và nếu cần thì đưa họ về queue/context phù hợp.

## 14. Validation, save behavior và draft-safety rules

## 14.1 Validation phải gần đúng nguồn lỗi nhất có thể

Inline field validation nên là mặc định cho field-level issues. Page-level summary chỉ nên bổ sung khi có nhiều lỗi hoặc có blocker tổng quát.

## 14.2 Save behavior phải nhất quán với loại action

- Save Draft chỉ nên tồn tại khi có concept draft thực sự.  
- Submit / Approve / Reject / Retry / Reassign nên nói đúng outcome.  
- Không nên dùng Save như từ chung cho mọi hành động có semantics khác nhau.

## 14.3 Draft safety phải đủ cho các form không nhỏ

Nếu form hoặc decision note có độ dài đáng kể, system nên giảm rủi ro mất công nhập liệu do timeout, refresh hoặc validation fail.

## 14.4 Error recovery phải không phá flow

Nếu submit thất bại, user phải còn giữ được context và phần lớn dữ liệu đã nhập, đồng thời hiểu bước retry gần nhất là gì.

## 15. Web vs Mobile input distinction rules

## 15.1 Web có thể sâu hơn vì role khác, không chỉ vì màn hình lớn hơn

Độ sâu của Web Admin input được biện minh bởi trách nhiệm decision và coordination, không chỉ bởi không gian hiển thị rộng.

## 15.2 Đừng sao chép mobile quick patterns sang web một cách mù quáng

Có những lúc web cần nhiều context hơn mobile để quyết định đúng. Sự ngắn gọn cực đoan có thể làm giảm decision quality.

## 15.3 Cũng đừng sao chép web forms sang mobile

Những flows decision/correction nặng trên web chính là thứ mobile cần tránh. Hai surfaces phải giữ role-fit khác nhau nhưng cùng semantics.

## 16. Mapping patterns với launch-critical flows

## 16.1 Flow B – Queue intake and work assignment

Routing, assignment và reassignment patterns là nền trực tiếp cho flow này, đặc biệt ở coordination moments.

## 16.2 Flow D – Manager review and approval decision

Approval, reject, override và request-more-info patterns là trọng tâm của flow này.

## 16.3 Flow E – Exception / blocked / missing-info handling

Correction patterns, request-more-info patterns và routing patterns giúp recovery path có cấu trúc rõ trên Web Admin.

## 16.4 Flow G – Data import and onboarding assist flow

Import review, import-fix và validation-repair patterns là lõi của flow này.

## 17. Anti-patterns nghiêm trọng phải tránh

## 17.1 Form dump from backend schema

Khi UI chỉ phản chiếu cấu trúc dữ liệu thay vì logic công việc, user sẽ thấy form dài mà vẫn không hiểu cần làm gì.

## 17.2 Decision without consequence preview

Nếu user approve, reject hoặc reassign mà không thấy item sẽ đi đâu, control UX sẽ yếu và traceability sẽ khó hiểu.

## 17.3 Mandatory free-text everywhere

Bắt user viết note dài cho mọi decision là một dạng quan liêu UX, không phải accountability thật.

## 17.4 Correction by full-form reset

Bắt sửa một lỗi nhỏ bằng cách lặp lại cả form là anti-pattern phá adoption rất mạnh.

## 17.5 Import as spreadsheet trap

Biến import-fix flow thành trải nghiệm spreadsheet thuần túy sẽ che mất resolution logic và tăng cognitive load không cần thiết.

## 17.6 Same submit verb for different consequences

Nếu Save, Submit hoặc Confirm được dùng lẫn lộn cho các hành động rất khác nhau, user sẽ khó học system outcomes.

## 17.7 Context far from decision

Một form hoặc decision input mà ngữ cảnh quan trọng nằm quá xa action zone sẽ ép user quyết định bằng trí nhớ ngắn hạn, rất rủi ro.

## 18. Governance rules cho mọi Web Admin form / decision pattern mới

Mọi pattern mới nên đi qua các câu hỏi sau:

1. **User đang ra quyết định gì hoặc sửa điều gì?**  
2. **Context tối thiểu nào là cần để làm đúng?**  
3. **Mỗi field có thực sự tác động tới outcome, routing, traceability hoặc recovery không?**  
4. **Có thể thay free text bằng presets, categories hoặc structured prompts ở đâu?**  
5. **User có thấy item/data sẽ đi đâu sau submit không?**  
6. **Validation có chỉ đúng lỗi và giữ lại dữ liệu không?**  
7. **Pattern này có đang dump object model lên UI không?**  
8. **Pattern này có giữ distinction giữa control-surface depth và bureaucratic form gravity không?**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona cho sales, pilot và onboarding.  
2. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules cho density, breakpoints và responsive clarity của Web Admin.  
3. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho interruption-heavy và connectivity-weak mobile usage.  
4. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing guidelines xuyên Pack 03.  
5. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness scenarios cho UX QA theo flow và persona.  
6. **42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK.md** – framework đo execution quality và usability signals.  
7. **43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES.md** – authority UX rules cho Web Admin nếu phase sau cần đào sâu hơn.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Web Admin form và decision-input patterns:

1. Web Admin cần một **bộ pattern riêng cho forms và decision inputs**, không dùng chung logic nhẹ của mobile execution inputs.  
2. Approval, reject/override/request-more-info, routing/reassignment, correction/repair và import-fix là các pattern families chính thức phải được thiết kế có grammar riêng.  
3. Web Admin input phải ưu tiên decision clarity, outcome preview, traceability và recovery quality thay vì field volume.  
4. Context summary phải ở gần action zone đối với mọi decision có hậu quả vận hành.  
5. Free text chỉ nên được yêu cầu khi nó tăng meaning, accountability hoặc repair value thật.  
6. Validation và draft safety là một phần cốt lõi của trust trong control-surface inputs.  
7. Tài liệu này là baseline để frontend, design system, QA và product nói cùng một ngôn ngữ cho admin-side input behaviors.

## 21. Điều kiện hoàn thành của tài liệu

Web Admin Form and Decision Input Patterns được xem là đạt yêu cầu khi:
- team UX, Product, Frontend và QA có cùng grammar cho các input moments cốt lõi của Web Admin;  
- các launch-critical flows đã có patterns đủ rõ để đi từ blueprint sang implementation behavior;  
- control-surface input UX được bảo vệ khỏi form-dump drift và decision-without-context drift;  
- và downstream implementation có thể map các form states, validations, confirmations và outcome flows vào baseline này mà không phải tự phát minh lại semantics.

## AG Execution Prompt

You are acting as a senior UX systems designer, admin-input architect, and decision-flow strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Web Admin is the control surface, with screen taxonomy, user flows, state grammar, messaging rules, governance rules, and wireframe blueprints already defined.
- This document defines the form and decision-input patterns for Web Admin.

### Objective
Refine this Web Admin Form and Decision Input Patterns document into a production-grade input-pattern baseline that can guide approvals, rejections, overrides, requests-for-more-info, routing, corrections, import-fix flows, frontend implementation, QA scenarios, and consistency reviews.

### Inputs
- Use this document plus Web Admin Experience Strategy, Web Admin Screen Taxonomy, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, Data Entry and Evidence Capture Patterns, Web Admin Wireframe Blueprints, Empty States / Errors / Recovery Messages, and UX Governance as the primary source of truth.
- Preserve the control-surface logic and the wedge-first launch focus.
- Keep the output concrete enough for real implementation-oriented UX work.

### Tasks
1. Rewrite the decision-input thesis into a sharper executive form.
2. Produce an input-pattern register covering approval, rejection/override, routing, correction, import-fix, and admin-setup moments.
3. Add rules for field hierarchy, context summaries, side-context, confirmations, outcome previews, and post-submit feedback.
4. Define launch-phase rules for validation, draft safety, retry/recovery behavior, and trace quality.
5. Identify the top five form/decision-pattern failures that would weaken control-surface clarity or trust.
6. Recommend the next documents that should operationalize this baseline into responsive rules, copy systems, QA scenarios, and authority UX rules.
7. Add governance rules to prevent schema-dump forms, essay-burden patterns, and decision-without-context drift.

### Constraints
- Do not let backend schema dictate UX structure.  
- Do not require free text when structured reasoning is enough.  
- Do not allow high-impact decisions without consequence visibility.  
- Do not let correction flows reset or erase user work unnecessarily.  
- Keep the output concrete enough for downstream implementation.

### Output Format
Return a revised markdown document with these sections:
1. Executive Decision-Input Thesis
2. Input-Pattern Register
3. Usage Rules by Pattern Family
4. Validation, Trace, and Recovery Rules
5. Pattern Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Web Admin form and decision-input patterns explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams implement control-surface inputs with better clarity, accountability, and outcome visibility.
- The output must reduce ambiguity around approvals, overrides, corrections, routing decisions, and import repair flows.
