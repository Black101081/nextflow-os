# Nextflow OS – Mobile Ops Component Behavior Rules

**Document ID:** 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Mobile UX Systems / Frontend UX Engineering  
**Dependent Packs:** Engineering Implementation, Frontend Delivery, Design System, QA & Support, Deployment & Support  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **bộ rules chính thức cho behavior của các component cốt lõi trên Mobile Ops / PWA** trong Pack 03 của Nextflow OS. Nếu Mobile Ops Experience Strategy đã chốt Mobile Ops là execution surface, Mobile Ops Screen Taxonomy đã chốt các screen families chính thức, Data Entry and Evidence Capture Patterns đã chốt grammar nhập liệu, Mobile Ops Wireframe Blueprints đã chốt cấu trúc screen ở cấp blueprint, Empty States / Errors / Recovery Messages đã chốt logic messaging, còn UX Review and Governance đã chốt cơ chế giữ coherence, thì tài liệu này đi xuống lớp vận hành tinh hơn nhưng rất quyết định cảm nhận dùng thật:

> **Các component thường xuyên nhất của Mobile Ops phải hành xử như thế nào — khi nào hiện, khi nào ẩn, mang trọng lượng gì, phản hồi ra sao, đổi trạng thái thế nào, giữ context đến đâu, và phối hợp với nhau theo luật nào — để execution surface nhanh, rõ, ít lỗi và nhất quán trong mọi flow launch-critical?**

Nếu wireframe blueprints trả lời “các khối lớn nằm ở đâu”, thì component behavior rules trả lời “các khối nhỏ sống như thế nào”. Đây là lớp rất quan trọng vì nhiều mobile products không hỏng ở level screen layout mà hỏng ở level vi hành vi: button states không rõ, sheets mở đóng vô kỷ luật, status cards nói mơ hồ, input components làm mất dữ liệu, empty cards trông giống loading cards, confirm behaviors thiếu outcome specificity hoặc quick-update controls đổi nghĩa giữa các screens. Khi đó product nhìn có vẻ ổn trong mockups nhưng dùng thật lại mỏi và thiếu trust.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của component behavior rules trong Mobile Ops.  
2. Những component families cốt lõi phải có rules riêng.  
3. Rules cho workload cards / list items.  
4. Rules cho state chips / status labels / urgency cues.  
5. Rules cho sticky bottom actions và action groups.  
6. Rules cho quick-update blocks, selectors và confirmation controls.  
7. Rules cho note / evidence / exception entry components.  
8. Rules cho bottom sheets, overlays và lightweight modals.  
9. Rules cho inline messages, banners, toasts và post-action confirmations.  
10. Rules cho loading, disabled, empty và retry states ở level component.  
11. Rules cho context preservation, return-to-work behaviors và interruption resilience ở mức component.  
12. Những anti-pattern component behavior nghiêm trọng phải tránh.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vai trò của component behavior rules trong Mobile Ops

Trong Nextflow OS, component behavior rules không chỉ là design-system notes. Chúng là **luật vận hành của execution surface ở cấp micro-interaction**. Nếu screen taxonomy giúp team biết loại màn hình nào được phép tồn tại, và wireframe blueprints giúp team biết các vùng nào nên nằm ở đâu, thì component rules giúp team đảm bảo các phần tử tương tác hành xử theo một ngôn ngữ thống nhất.

Component behavior rules đặc biệt quan trọng trên mobile vì:
- người dùng thao tác nhanh và ít kiên nhẫn;  
- mọi micro-friction tích lũy rất nhanh;  
- sai lệch nhỏ giữa các component có thể làm người dùng mất orientation;  
- và execution surface phải tạo trust không chỉ bằng bố cục mà bằng phản hồi tức thời của từng control nhỏ.

Pack 03 cần component rules đủ cụ thể để frontend không phải tự suy ra semantics từ screenshot, nhưng cũng đủ chiến lược để không sa vào mô tả pixel-level design system chưa cần thiết ở giai đoạn này.

## 3. Component-behavior thesis cho Mobile Ops

Component-behavior thesis của tài liệu này có thể phát biểu như sau:

> **Mỗi component trong Mobile Ops phải làm giảm ma sát thực thi, làm rõ trạng thái hiện tại, dẫn người dùng tới bước kế tiếp gần nhất và bảo vệ nhịp công việc khỏi những gián đoạn không cần thiết; nếu một component làm tăng suy nghĩ, tăng thao tác, tăng mơ hồ hoặc tăng rủi ro mất context, nó đang đi ngược bản chất của execution surface.**

Từ thesis này, mười nguyên lý behavior được suy ra:

1. Component behavior phải ưu tiên **speed-to-comprehension** trước visual novelty.  
2. Components phải mang **semantics nhất quán** xuyên screens cùng family.  
3. Trạng thái của component phải rõ: normal, focused, selected, pending, success, error, disabled, unavailable.  
4. Component phải giữ **action consequence** gần với hành vi kích hoạt nó.  
5. Components tần suất cao phải cực nhẹ, học nhanh và khó dùng sai.  
6. Components có rủi ro cao phải làm lộ hậu quả trước hoặc ngay khi commit.  
7. Components phục vụ exception, note và evidence phải đủ gần flow chính để cạnh tranh được với chat fallback.  
8. Overlay-based components chỉ hợp lệ khi giảm bước và giữ context tốt hơn full-screen alternatives.  
9. Loading, retry và stale states phải được coi là một phần behavior thật chứ không phải edge polish.  
10. Component rules của Mobile Ops phải luôn phục vụ execution spine: **Workload → Action → Update / Note / Exception → Outcome → Return to Work**.

## 4. Các component families cốt lõi của Mobile Ops

Pack 03 nên phân loại các component families cốt lõi của Mobile Ops như sau:

1. **Workload cards and list items**  
2. **State chips, status labels and urgency cues**  
3. **Primary actions, sticky action bars and action groups**  
4. **Quick-update selectors and confirmation controls**  
5. **Short input fields, note blocks and structured prompts**  
6. **Evidence capture triggers and attachment previews**  
7. **Exception / help reason pickers and routing cues**  
8. **Bottom sheets, drawers and lightweight overlays**  
9. **Inline messages, banners, toasts and outcome confirmations**  
10. **Loading, empty, disabled and retry component states**

Mỗi family cần rules riêng vì tần suất dùng, hậu quả vận hành và mức độ chú ý của người dùng khác nhau rất mạnh.

## 5. Rules cho Workload cards và list items

Workload cards hoặc list items là thành phần chạm nhiều nhất trong execution surface vì chúng là cửa vào của công việc.

## 5.1 Vai trò

- Cho phép scan nhanh.  
- Làm lộ item identity vừa đủ.  
- Làm lộ dominant state, urgency và next-step hint.  
- Tạo entry rõ sang Task Action screen.

## 5.2 Behavior rules

1. Mỗi card/list item phải có **một tap target chính rõ ràng** để vào item action.  
2. Dominant state phải nhìn thấy mà không cần mở item.  
3. Urgency cues như overdue hoặc needs attention phải nổi hơn metadata phụ.  
4. Next-step hint, nếu có, phải ngắn và thực dụng, không mơ hồ.  
5. Một item không nên đòi quá nhiều actions inline trên list; list chủ yếu để scan và enter, không phải để xử lý hết mọi thứ.

## 5.3 Expanded behaviors có điều kiện

- Swipe actions chỉ nên cân nhắc nếu cực ổn định về semantics và không tạo risk accidental triggers.  
- Long-press behaviors không nên là nơi ẩn core actions ở phase đầu.  
- Inline quick actions chỉ nên dùng cho một vài updates thật nhẹ nếu chứng minh được adoption value.

## 5.4 Không được làm gì

- Không biến card thành detail page thu nhỏ.  
- Không đặt quá nhiều badges ngang hàng.  
- Không dùng visual density để thay cho hierarchy.  
- Không làm cả card lẫn nút phụ cạnh tranh cùng là entry chính.

## 6. Rules cho state chips, status labels và urgency cues

Các component này mang semantics trọng yếu của Mobile Ops. Chúng không được chỉ là decoration.

## 6.1 Vai trò

- Cho biết item đang ở đâu.  
- Cho biết điều gì đang chặn hoặc thúc ép user.  
- Hỗ trợ scan nhanh trong workload và action contexts.

## 6.2 Behavior rules

1. Text luôn là nguồn nghĩa chính; màu và icon chỉ hỗ trợ.  
2. Cùng semantics phải dùng cùng wording family xuyên app.  
3. Một context nên có một dominant state cue rõ nhất; cues còn lại là phụ trợ.  
4. Overdue hoặc urgent có thể là overlay/severity cue hơn là thay thế state chính.  
5. Blocked, Waiting, Pending Approval và In Progress không được map vào cùng một visual treatment nếu semantics khác nhau đáng kể.

## 6.3 Placement rules

- Trên workload cards, dominant state nên nằm trong vùng scan đầu cùng identity.  
- Trên Task Action, state chính nên nằm gần header hoặc action summary.  
- Exception reasons nên đi kèm helper text ngắn nếu label một mình chưa đủ.

## 6.4 Không được làm gì

- Không rely hoàn toàn vào màu.  
- Không đổi wording giữa screens chỉ vì copy style.  
- Không biến state chips thành navigation chips trừ khi semantics thật rõ.  
- Không dùng một chip generic như Active cho nhiều tình huống khác nghĩa.

## 7. Rules cho primary actions, sticky action bars và action groups

Primary actions là phần quyết định execution momentum. Nếu chúng yếu hoặc rối, Mobile Ops sẽ thất bại ngay ở lõi.

## 7.1 Vai trò

- Làm nổi bước chính cần làm ngay.  
- Giữ action nằm gần tay người dùng.  
- Tạo cảm giác item có thể được tiến tiếp thật sự.

## 7.2 Behavior rules cho primary action

1. Mỗi screen trạng thái chính nên có **một primary action nổi bật nhất**.  
2. Label của primary action phải là động từ có hậu quả rõ, ví dụ Complete, Confirm, Request Help, Send for Approval.  
3. Nếu action phụ tồn tại, nó phải ít nổi hơn và rõ vai phụ.  
4. Khi primary action bị disabled, hệ thống phải giải thích vì sao ở gần action enough.  
5. Sau khi tap primary action, UI phải phản hồi ngay rằng thao tác đang diễn ra, đã hoàn tất hay bị chặn.

## 7.3 Sticky bottom action bar rules

1. Chỉ dùng sticky bar khi action frequency hoặc screen depth đủ cao để justify nó.  
2. Sticky bar không nên chứa quá nhiều hơn hai actions có trọng lượng lớn.  
3. Nếu scrolling khiến context thay đổi, sticky action vẫn phải giữ nghĩa rõ chứ không nên làm user quên mình đang action trên item nào.  
4. Sticky action area phải không che mất nội dung critical hoặc message quan trọng.

## 7.4 Action group rules

- Các actions destructive hoặc escalation-heavy phải được tách khỏi safe/high-frequency actions.  
- Overflow menus chỉ nên chứa low-frequency hoặc advanced actions, không nên nuốt primary operational actions.  
- Nếu group actions thay đổi theo state, transitions phải đủ dễ hiểu để user không tưởng app bị đổi vô cớ.

## 8. Rules cho quick-update selectors và confirmation controls

Đây là family tạo ra phần lớn structured updates ở Mobile Ops và phải cực mượt.

## 8.1 Vai trò

- Giúp user ghi nhận state changes nhẹ nhanh nhất có thể.  
- Giảm typing.  
- Giữ flow gần action context.

## 8.2 Selector rules

1. Ưu tiên reason presets, segmented choices hoặc concise options trước free text.  
2. Option labels phải gắn với real work meaning, không phải internal codes.  
3. Nếu chọn một option làm xuất hiện field bổ sung, điều đó phải có logic rõ và không bất ngờ.  
4. Selector state phải rõ selected / not selected / required / invalid.

## 8.3 Confirmation control rules

1. Confirm buttons phải nói outcome tốt hơn Save/Submit nếu action thật sự có hậu quả rõ.  
2. Nếu action reversible hoặc low-risk, avoid modal confirm thừa.  
3. Nếu action high-impact, confirmation phải làm rõ item sẽ đi đâu hoặc chờ ai.  
4. Sau confirm, kết quả phải xuất hiện gần control đã khởi phát hành động đó.

## 8.4 Không được làm gì

- Không để quick-update component kéo user vào flow dài như form đầy đủ.  
- Không yêu cầu free text cho mọi update.  
- Không dùng radio/segmented controls với labels mơ hồ hoặc gần nghĩa quá mức.  
- Không dùng same confirm wording cho nhiều actions có hậu quả khác nhau.

## 9. Rules cho short input fields, note blocks và structured prompts

## 9.1 Vai trò

- Thu được context ngắn, có ích, không phá nhịp.  
- Hỗ trợ completion, approval, recovery hoặc handoff.  
- Giữ structured truth vừa đủ.

## 9.2 Behavior rules

1. Input fields phải nói rõ đang phục vụ action nào.  
2. Placeholder hoặc helper text nên định hướng kiểu thông tin cần nhập, không chỉ lặp lại label.  
3. Note fields trên mobile nên ưu tiên ngắn và nằm sau selection logic chính nếu có.  
4. Nếu note là optional, UI không nên khiến nó trông như bắt buộc.  
5. Nếu note là required, message và submit state phải làm điều đó cực rõ.

## 9.3 Structured prompt rules

- Dùng prompts khi note free-text thuần túy lặp lại cùng một pattern quá nhiều.  
- Prompt nên thu gọn sự suy nghĩ, không tăng gánh nặng nhập liệu.  
- Không biến mọi note thành questionnaire nhiều dòng.

## 9.4 Không được làm gì

- Không dùng note field như nơi vá thiếu state model.  
- Không bật keyboard quá sớm nếu user còn chưa chọn action/reason.  
- Không xóa nội dung đã gõ khi validation hay network lỗi nếu tránh được.

## 10. Rules cho evidence capture triggers và attachment previews

## 10.1 Vai trò

- Giúp user thêm proof nhanh và đúng ngữ cảnh.  
- Tăng trust cho completion, exceptions hoặc approval cases.  
- Làm rõ evidence đã thực sự gắn với item hay chưa.

## 10.2 Trigger rules

1. Trigger thêm evidence phải ở gần action hoặc exception context liên quan.  
2. Nếu evidence required, requirement phải được nói rõ trước submit.  
3. Trigger label phải nói rõ Add Evidence, Add Photo, Attach Proof hoặc tương đương, tránh generic Add.

## 10.3 Preview rules

1. Sau khi thêm evidence, preview tối thiểu phải cho user biết file/ảnh đã gắn thành công.  
2. Remove / retake / retry controls phải đủ gần preview.  
3. Preview không nên chiếm quá nhiều không gian nếu evidence chỉ đóng vai trò hỗ trợ.  
4. Nếu upload đang pending, trạng thái pending phải hiện rõ và không làm user ngộ nhận là đã xong.

## 10.4 Failure rules

- Upload failure phải giữ ít nhất context và metadata người dùng vừa nhập nếu có thể.  
- Retry hành động upload phải gắn với file/ảnh cụ thể.  
- Không được để user mơ hồ liệu proof đã tới hệ thống hay chưa.

## 11. Rules cho exception/help reason pickers và routing cues

## 11.1 Vai trò

- Giúp user báo ngoại lệ nhanh hơn chat.  
- Cho hệ thống biết recovery path phù hợp.  
- Làm user hiểu item sẽ chờ ai hoặc sang đâu.

## 11.2 Reason picker rules

1. Các reasons phổ biến phải được đặt trước và viết bằng ngôn ngữ thực tế.  
2. Không nên có danh sách quá dài ngay từ đầu nếu có thể nhóm hợp lý.  
3. Nếu chọn một reason sẽ đổi routing, UI nên làm rõ effect đó trước hoặc ngay sau confirm.  
4. Free text chỉ nên là lớp bổ sung sau reason chính, không nên là điểm vào duy nhất.

## 11.3 Routing cue rules

1. Sau khi chọn exception path, user nên thấy item sẽ chờ manager, chờ branch confirmation, quay về queue hay chờ thêm info.  
2. Routing cue nên ngắn, mạnh và gần confirm action.  
3. Nếu user không còn là next owner sau action đó, message hoặc cue phải nói điều này rõ.

## 12. Rules cho bottom sheets, drawers và lightweight overlays

Bottom sheets và overlays rất hợp mobile, nhưng chỉ khi dùng có kỷ luật.

## 12.1 Khi nào nên dùng

- Quick updates ngắn.  
- Reason selection ngắn.  
- Lightweight note/evidence additions.  
- Brief confirmations gần action context.

## 12.2 Behavior rules

1. Sheet phải có title nói rõ hành động đang diễn ra.  
2. Sheet phải có exit path rõ: dismiss, cancel hoặc back semantics nhất quán.  
3. Nếu sheet chứa data entry, keyboard interactions phải không che mất confirm action.  
4. Nếu nội dung dài hơn mức scan nhanh, chuyển sang full-screen pattern hợp lý hơn.  
5. Không nên mở sheet thứ hai chồng lên sheet thứ nhất cho các flows thường xuyên.

## 12.3 Dismissal rules

- Dismiss do chạm nền chỉ nên an toàn khi không làm user mất dữ liệu quan trọng mà không cảnh báo.  
- Nếu có unsaved input đáng kể, dismissal behavior phải cẩn trọng hơn.  
- Sau dismiss, user phải trở lại đúng context trước đó.

## 12.4 Không được làm gì

- Không dùng overlay như nơi giấu complexity lẽ ra nên được giải bằng flow tốt hơn.  
- Không stack quá nhiều overlays.  
- Không khiến cùng một task khi thì mở sheet, khi thì full screen, khi thì modal mà không có logic nhất quán.

## 13. Rules cho inline messages, banners, toasts và post-action confirmations

## 13.1 Vai trò

- Nói outcome.  
- Nói blockers.  
- Nói recovery path.  
- Giữ trust ở những khoảnh khắc nhỏ nhưng nhạy cảm.

## 13.2 Inline message rules

1. Dùng cho field validation, action-level blockers hoặc compact guidance gần nguồn vấn đề.  
2. Message phải đủ cụ thể về thiếu gì hoặc phải làm gì tiếp.  
3. Không nhồi quá nhiều messages inline đồng thời nếu hierarchy không rõ.

## 13.3 Banner rules

1. Dùng cho page-level state concerns như stale state, permission boundary hoặc blocked summary.  
2. Banner phải đủ nổi nhưng không đè chết primary action nếu user vẫn có thể tiến tiếp theo cách khác.  
3. Nếu banner yêu cầu recovery step, CTA trong banner phải thật rõ.

## 13.4 Toast rules

1. Toast chỉ phù hợp cho confirmations ngắn, ít mơ hồ.  
2. Toast không nên là nơi duy nhất giải thích một lỗi nặng hoặc state change phức tạp.  
3. Nếu toast xác nhận action quan trọng, wording phải đủ outcome-specific.

## 13.5 Post-action confirmation rules

1. Với actions high-frequency nhưng hệ quả rõ, confirmation có thể ở dạng inline success region hoặc small outcome view.  
2. User phải biết item đã đổi state gì, đi đâu hoặc chờ ai.  
3. Return-to-work cue nên ở gần confirmation nếu task đã xong hoặc rời tay user.

## 14. Rules cho loading, disabled, empty và retry states ở level component

## 14.1 Loading behavior rules

1. Loading state phải nói rõ đang tải vùng nào hoặc đang gửi hành động nào nếu có thể.  
2. Controls đang pending phải không gợi cảm giác thao tác chưa được ghi nhận.  
3. Loading visuals không nên giống empty state quá mức.

## 14.2 Disabled-state rules

1. Disabled controls chỉ hợp lệ khi có lý do thực sự.  
2. Khi một action quan trọng bị disabled, nên có explanation nearby hoặc reveal on tap/press/help interaction phù hợp.  
3. Không dùng disabled state như cách né xử lý permissions/state logic không rõ.

## 14.3 Empty component-state rules

- Empty sections như no notes yet, no proof attached, no recent updates phải giải thích đủ ngắn gọn.  
- Nếu empty đó có next step hợp lý, component nên gợi action nhẹ.

## 14.4 Retry-state rules

- Retry controls phải gắn với đúng hành động thất bại.  
- Nếu system giữ được input trước đó, component nên nói rõ điều đó.  
- Retry không nên reset cả flow nếu chỉ một thao tác nhỏ bị fail.

## 15. Rules cho context preservation và return-to-work behaviors ở mức component

## 15.1 Item identity persistence

Các component mở rộng như sheet, note block, evidence capture hay exception picker phải luôn giữ đủ item identity để user không nhập nhầm context.

## 15.2 Context-return behavior

Sau dismiss hoặc submit, component phải đưa user quay lại đúng nơi đủ gần trong flow. Nếu user mở quick update từ Task Action, hoàn tất xong không nên bị ném về một nơi quá xa hoặc quá khác logic.

## 15.3 Segment memory and list-position respect

Khi user quay lại workload sau action, system nên cố giữ segment, filter nhẹ và cảm giác vị trí trước đó ở mức hợp lý, đặc biệt cho flows tần suất cao.

## 15.4 Interruption resilience ở level component

Nếu user bị ngắt giữa note nhập dở, evidence đang pending hoặc selection chưa submit, component behaviors nên hạn chế làm mất công sức đó khi có thể.

## 16. Rules cho accessibility và comprehension ở mức behavior

## 16.1 Không phụ thuộc vào màu duy nhất

State cues, validation, success hay error không được dựa hoàn toàn vào màu. Text semantics phải đủ rõ.

## 16.2 Tap targets phải đủ thực dụng

Dù tài liệu này không đi vào pixel, component behaviors phải giả định tap targets đủ dễ bấm trong bối cảnh thao tác nhanh ngoài hiện trường.

## 16.3 Motion và transitions phải phục vụ orientation

Transition của sheet, state change hay post-action confirmation nên giúp user hiểu mình vừa làm gì xong, không phải chỉ để “mượt”.

## 16.4 Copy phải ngắn nhưng quyết định được

Component-level text phải ngắn, nhưng vẫn đủ để user biết action này làm gì và vì sao control đang ở trạng thái hiện tại.

## 17. Anti-pattern component behavior nghiêm trọng phải tránh

## 17.1 Same-looking actions with different consequences

Nếu hai buttons trông như nhau nhưng một cái complete item còn cái kia chỉ lưu note, user sẽ mất trust rất nhanh.

## 17.2 Overlay chaos

Sheet trên modal trên picker trên confirm là con đường nhanh nhất làm user mất orientation.

## 17.3 Hidden disabled logic

Khi action bị disable mà user không hiểu vì sao, component đang làm tăng ma sát mà không giúp quyết định đúng hơn.

## 17.4 Generic toasts for meaningful outcomes

Những câu như Updated hoặc Success quá yếu cho actions làm đổi ownership, state hoặc queue.

## 17.5 Evidence ambiguity

Nếu user không biết ảnh/file đã attach hay chưa, product đã thất bại ở một trust-critical moment.

## 17.6 Note-first over-structuring

Buộc user ghi chú dài trong các actions lẽ ra nên giải bằng presets, selectors hoặc short confirmations là anti-pattern nặng.

## 17.7 Component inconsistency across equivalent moments

Cùng một kiểu quick update mà screen này dùng sheet, screen khác dùng modal, screen khác dùng inline form mà không có lý do rõ sẽ làm learning cost tăng mạnh.

## 18. Governance rules cho mọi component behavior mới trên Mobile Ops

Mọi component behavior mới nên đi qua các câu hỏi sau:

1. **Component này phục vụ execution moment nào?**  
2. **Nó giúp user hiểu nhanh hơn hay bắt nghĩ nhiều hơn?**  
3. **Nó làm rõ state/action/outcome hay làm mơ hồ thêm?**  
4. **Nó có giảm typing, giảm steps hoặc giảm context switching thật không?**  
5. **Nếu nó dùng overlay, overlay đó có thật sự giữ context tốt hơn phương án khác không?**  
6. **Sau khi dùng component này, user có biết item đi đâu tiếp không?**  
7. **Behavior này có nhất quán với components tương đương ở các screens khác không?**  
8. **Nó có đẩy mobile gần hơn tới mini-web-admin drift hoặc form-heavy drift không?**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – patterns riêng cho forms và decision-input trên Web Admin.  
2. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona cho sales, pilot và onboarding.  
3. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules cho density, breakpoints và scanability của Web Admin.  
4. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho interruption-heavy và connectivity-weak mobile usage.  
5. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing guidelines xuyên Pack 03.  
6. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness scenarios cho UX QA theo flow và persona.  
7. **42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK.md** – framework đo execution quality và usability signals cho Mobile Ops.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Mobile Ops component behavior:

1. Mobile Ops cần một **bộ component behavior rules chính thức**, không chỉ dựa vào screenshot hoặc component library chung.  
2. Workload cards, state cues, primary actions, quick-update controls, note/evidence/exception components, overlays và outcome messages là các families bắt buộc phải có rules riêng.  
3. Mỗi component phải phục vụ execution speed, state clarity, outcome visibility và context preservation.  
4. Sticky bottom actions, sheets và quick-update controls phải được dùng có kỷ luật, không được kéo mobile thành form-heavy hoặc overlay-chaos UX.  
5. Component-level loading, disabled, retry và confirmation behaviors là một phần cốt lõi của trust, không phải polish phụ.  
6. Behavior consistency giữa các moments tương đương là bắt buộc để giảm learning cost.  
7. Tài liệu này là baseline để frontend, design system và QA nói cùng một ngôn ngữ behavior cho Mobile Ops.

## 21. Điều kiện hoàn thành của tài liệu

Mobile Ops Component Behavior Rules được xem là đạt yêu cầu khi:
- team UX, Frontend và QA có cùng grammar cho các component behaviors cốt lõi của Mobile Ops;  
- các screens launch-critical đã có mức chi tiết đủ để chuyển từ blueprint sang implementation behavior;  
- execution UX được bảo vệ khỏi inconsistency drift ở level component;  
- và downstream design system / frontend work có thể map các component states và transitions vào các rules trong tài liệu này mà không phải tự phát minh semantics mới.

## AG Execution Prompt

You are acting as a senior mobile UX systems designer, component-behavior architect, and execution-interaction strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops is the execution surface, with taxonomy, user flows, state grammar, input patterns, wireframe blueprints, messaging rules, and governance baseline already defined.
- This document defines the component behavior rules for Mobile Ops.

### Objective
Refine this Mobile Ops Component Behavior Rules document into a production-grade component-behavior baseline that can guide design systems, frontend implementation, QA heuristics, and consistency reviews across all core Mobile Ops flows.

### Inputs
- Use this document plus Mobile Ops Experience Strategy, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, Mobile Ops Screen Taxonomy, Data Entry and Evidence Capture Patterns, Mobile Ops Wireframe Blueprints, Empty States / Errors / Recovery Messages, and UX Governance as the primary source of truth.
- Preserve the execution-surface logic and the wedge-first launch focus.
- Keep the output concrete enough for real component implementation and review.

### Tasks
1. Rewrite the component-behavior thesis into a sharper executive form.
2. Produce a component-family behavior register with purpose, states, triggers, feedback, and failure handling expectations.
3. Add usage rules for workload items, state cues, primary actions, quick-update controls, note/evidence/exception components, overlays, and outcome messaging.
4. Define launch-phase rules for loading, disabled, retry, confirmation, interruption resilience, and context-return behavior.
5. Identify the top five component-behavior failures that would weaken Mobile Ops adoption or trust.
6. Recommend the next documents that should operationalize this baseline into web input patterns, offline resilience, copy systems, and QA scenarios.
7. Add governance rules to prevent overlay chaos, form-heavy drift, and component inconsistency drift.

### Constraints
- Do not let component behavior be inferred from visuals alone.  
- Do not allow the same component type to behave differently in equivalent contexts without strong rationale.  
- Do not let overlays become the hiding place for interaction complexity.  
- Do not separate outcome feedback from the control that triggered it when the user needs trust.  
- Keep the output concrete enough for implementation-oriented component work.

### Output Format
Return a revised markdown document with these sections:
1. Executive Component-Behavior Thesis
2. Component-Family Behavior Register
3. Usage Rules by Component Family
4. State, Failure, and Recovery Rules
5. Behavior Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Mobile Ops component behavior explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams implement Mobile Ops behaviors consistently across screens and flows.
- The output must reduce ambiguity around action behavior, state cues, overlays, confirmations, retries, and context preservation.
