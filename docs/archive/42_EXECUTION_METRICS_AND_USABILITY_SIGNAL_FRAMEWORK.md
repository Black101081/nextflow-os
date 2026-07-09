# Nextflow OS – Execution Metrics and Usability Signal Framework

**Document ID:** 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Product Design / Analytics / Operations Excellence  
**Dependent Packs:** Analytics & Data, Frontend Delivery, QA & Support, Pilot Delivery, Program Delivery, Reliability & Observability  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **framework chính thức cho execution metrics và usability signals** của Pack 03 trong Nextflow OS. Nếu các tài liệu trước đã khóa strategy, flows, state grammar, screen taxonomy, component behavior, admin input patterns, density rules, continuity patterns, copy system và release-readiness UX QA scenarios, thì tài liệu này xử lý câu hỏi tiếp theo ở lớp đo lường sau build, sau pilot và trong vận hành thật:

> **Khi Pack 03 bắt đầu được dùng thật, team sẽ đo cái gì để biết trải nghiệm đang giúp công việc chạy tốt hơn, chỗ nào đang ma sát, states nào đang gây hiểu sai, flows nào đang rơi người dùng, interruption nào đang phá trust, và thay đổi UX nào thực sự làm product mạnh lên thay vì chỉ trông hợp lý trên giấy?**

Một pack UX trưởng thành không thể chỉ dựa vào review cảm tính, demo feedback hoặc một vài bug reports rời rạc để hiểu chất lượng dùng thật. Khi product bước vào pilot hoặc vận hành thật, team cần một lớp quan sát định lượng và bán định lượng đủ chặt để trả lời ba nhóm câu hỏi lớn:
- **adoption quality** – người dùng có thật sự dùng đúng flow trong hệ thống hay vẫn quay về workaround ngoài luồng;  
- **execution efficiency** – công việc có đi nhanh hơn, rõ hơn, ít nghẽn hơn hay không;  
- **experience trust** – người dùng có tin vào state, outcome, retry và evidence semantics hay không.

Tài liệu này không nhằm biến Pack 03 thành một hệ analytics nặng nề hoặc vanity-dashboard. Mục tiêu là xác định một **bộ tín hiệu đủ sắc và đủ thực dụng** để Product, Design, QA, Ops và Leadership cùng nhìn đúng một operational reality sau release. Framework này phải đủ gần product semantics để giúp cải tiến UX, không chỉ phục vụ reporting bề mặt.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của metrics và usability signals trong Pack 03.  
2. Khác biệt giữa vanity metrics, operational metrics và UX signals.  
3. Metrics thesis cho Pack 03.  
4. Các nhóm tín hiệu chính thức phải theo dõi.  
5. Metrics cho Web Admin control quality.  
6. Metrics cho Mobile Ops execution quality.  
7. Metrics cho states, recovery, retry và continuity trust.  
8. Metrics cho cross-surface coherence và flow completion.  
9. Metrics cho pilot learning và adoption risk.  
10. Rules cho interpretation, segmentation và baselining.  
11. Những anti-pattern đo lường nghiêm trọng phải tránh.  
12. Cách dùng framework này trong governance loop và release planning.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần framework đo execution quality

Trong Nextflow OS, Pack 03 không chỉ thiết kế các màn hình. Nó thiết kế cách con người nhìn thấy công việc, vào việc, ra quyết định, xử lý ngoại lệ và quay lại quỹ đạo. Điều đó có nghĩa là chất lượng của Pack 03 không thể được đánh giá chỉ bằng:
- số feature đã ship;  
- số tickets đã đóng;  
- hoặc số user đăng nhập.

Một hệ thống có thể có login activity tốt nhưng execution quality kém. User có thể vẫn mở app, nhưng:
- mất nhiều thời gian hơn mức cần thiết để triage;  
- submit nhiều lần vì không tin action đã ghi nhận;  
- bỏ evidence giữa chừng;  
- request help bằng chat ngoài hệ thống;  
- hoặc bị kẹt ở pending/blocked states mà team không nhìn thấy rõ.

Vì vậy Pack 03 cần một framework đo đủ sâu để phản ánh **behavioral truth**, nhưng cũng đủ gần nghĩa vận hành để không biến thành kho event metrics vô nghĩa.

## 3. Metrics thesis cho Pack 03

Metrics thesis của tài liệu này có thể phát biểu như sau:

> **Pack 03 chỉ thực sự thành công khi các tín hiệu đo lường cho thấy người dùng đang hiểu đúng state, hoàn thành đúng flow, phục hồi tốt khi có gián đoạn và ít phải dựa vào workaround ngoài hệ thống hơn; nếu metrics chỉ cho thấy activity tăng mà không cho thấy clarity, throughput, trust và recovery quality được cải thiện, thì UX chưa thực sự tốt lên.**

Từ thesis này, mười nguyên lý đo lường được suy ra:

1. Metrics phải ưu tiên **behavioral evidence over dashboard vanity**.  
2. Đo lường phải bám launch-critical flows và persona responsibilities.  
3. Một metric đơn lẻ hiếm khi đủ; cần đọc theo signal clusters.  
4. State-related UX phải được đo qua transitions, dwell, retries và reversals chứ không chỉ counts tĩnh.  
5. Mobile continuity quality phải được đo riêng vì failure modes rất khác web control quality.  
6. Cross-surface coherence cần cả event signals lẫn scenario validation, không chỉ một phía.  
7. Metrics phải đủ phân tầng để phân biệt adoption thấp vì ít nhu cầu với adoption thấp vì UX kém.  
8. Không nên tối ưu metrics khiến product trông nhanh hơn nhưng làm sai hoặc làm mù semantics.  
9. Pilot learning phải đi qua interpretation framework, không nhảy thẳng từ anecdote sang roadmap change.  
10. Mọi UX metrics quan trọng phải map được ngược về flow, screen family, state family hoặc component behavior đã được định nghĩa trong Pack 03.

## 4. Phân loại metrics trong Pack 03

Để tránh nói chung chung về “số liệu”, Pack 03 nên phân biệt rõ ba lớp chính:

## 4.1 Vanity metrics

Đây là các con số có thể nghe đẹp nhưng ít giá trị UX nếu đứng một mình, ví dụ raw session count, raw screen views, tổng số clicks hoặc thời gian online tổng cộng. Chúng có thể hữu ích làm bối cảnh, nhưng không nên được dùng để kết luận trải nghiệm đã tốt hay chưa.

## 4.2 Operational metrics

Đây là các số liệu phản ánh movement công việc trong hệ thống, ví dụ time to assignment, approval turnaround time, blocked dwell time, completion latency, correction throughput hoặc import repair cycle time. Chúng gần sản phẩm hơn và giúp thấy chất lượng vận hành.

## 4.3 UX usability signals

Đây là các tín hiệu phản ánh user effort, clarity, trust hoặc recovery quality, ví dụ repeated taps, retry frequency, abandonment after pending state, evidence attach drop-off, request-more-info loops, error-to-recovery conversion, draft restore usage hoặc queue backtracking. Đây là lớp rất quan trọng vì nó giúp đọc nguyên nhân, không chỉ đọc outcome.

## 5. Signal families chính thức của Pack 03

Pack 03 nên theo dõi tối thiểu chín signal families chính thức:

1. **Adoption and route-choice signals**  
2. **Entry and orientation signals**  
3. **Web Admin control-quality signals**  
4. **Mobile execution-quality signals**  
5. **State and transition signals**  
6. **Recovery and retry signals**  
7. **Continuity and interruption signals**  
8. **Cross-surface coherence signals**  
9. **Pilot learning and governance signals**

Mỗi signal family cần có một mục tiêu diễn giải rõ. Không nên chỉ gom thật nhiều event rồi hy vọng dashboard tự nói lên sự thật.

## 6. Adoption and route-choice signals

## 6.1 Mục tiêu

Đo xem user đang thực sự đi theo flows hệ thống mong đợi hay đang lách ra ngoài, bỏ dở hoặc chọn nhánh ít lý tưởng vì UX yếu.

## 6.2 Các tín hiệu gợi ý

- Tỷ lệ người dùng đi từ entry point chuẩn vào flow chính.  
- Tỷ lệ item được xử lý qua in-system path thay vì bị đình lại quá lâu.  
- Tỷ lệ exception được raise qua hệ thống thay vì bị xử lý ngoài luồng rồi mới nhập lại.  
- Tỷ lệ evidence được attach trong flow thay vì missing rồi bổ sung muộn.  
- Tỷ lệ users quay lại cùng screen mà không tiến state trong nhiều phiên liên tiếp.

## 6.3 Cách diễn giải

Adoption thấp không tự động có nghĩa UX tệ; có thể do scope pilot, seasonality hoặc nhu cầu nghiệp vụ thấp. Nhưng nếu adoption thấp đi kèm abandonment cao ở cùng một flow hoặc reliance cao vào correction/retry, đó là tín hiệu mạnh rằng flow chưa đủ mạnh.

## 7. Entry and orientation signals

## 7.1 Mục tiêu

Đo xem người dùng vào hệ thống có hiểu nơi bắt đầu và có đi đúng hướng đủ nhanh hay không.

## 7.2 Các tín hiệu gợi ý

- Time to first meaningful action sau khi vào landing hoặc workload.  
- Tỷ lệ back-and-forth giữa landing và queue/list trước action đầu tiên.  
- Tỷ lệ users mở nhiều item rồi đóng lại liên tiếp trước khi commit action nào.  
- Tỷ lệ filter changes liên tiếp trước khi chọn được item đầu tiên.  
- Tỷ lệ drop-off ngay sau entry point.

## 7.3 Cách diễn giải

Nếu time to first meaningful action cao nhưng outcome accuracy cũng cao, có thể flow chỉ đòi hỏi review kỹ. Nhưng nếu time cao đi cùng backtracking, filter thrash hoặc item open-close loops, đó thường là tín hiệu orientation hoặc hierarchy yếu.

## 8. Web Admin control-quality signals

## 8.1 Mục tiêu

Đo xem Web Admin có thật sự giúp triage, decision và coordination tốt hơn hay không.

## 8.2 Các tín hiệu gợi ý cho queue quality

- Time from queue entry to item selection.  
- Số filter adjustments trước item selection đầu tiên.  
- Tỷ lệ resort / re-filter nhiều lần trong cùng session.  
- Tỷ lệ mở item rồi quay lại ngay mà không action.  
- Distribution của dwell time theo queue type và state cluster.

## 8.3 Các tín hiệu gợi ý cho decision quality

- Approval turnaround time.  
- Request-more-info rate theo decision type.  
- Reject / override frequency theo category.  
- Decision reversal hoặc reopen rate sau approve/reject.  
- Tỷ lệ item cần correction lại sau decision đã được đưa ra.

## 8.4 Các tín hiệu gợi ý cho routing quality

- Reassignment frequency per item.  
- Multi-hop routing rate.  
- Time from reassignment to next meaningful action.  
- Queue bounce rate giữa các queues gần nhau.  
- Tỷ lệ item quay về cùng owner / queue sau move gần nhất.

## 8.5 Cách diễn giải

Approval nhanh hơn không phải lúc nào cũng tốt hơn nếu reject loops hoặc corrections sau đó tăng mạnh. Tương tự, số lần reassign cao có thể phản ánh workload phức tạp thật, nhưng cũng có thể là dấu hiệu routing UI hoặc ownership clarity chưa tốt.

## 9. Mobile execution-quality signals

## 9.1 Mục tiêu

Đo xem Mobile Ops có thực sự giúp user vào việc nhanh, cập nhật gọn và quay lại công việc tiếp theo với ít ma sát không.

## 9.2 Các tín hiệu gợi ý

- Time from workload entry to item open.  
- Time from item open to primary action.  
- Completion rate của quick-update paths.  
- Note attach rate trong các flows liên quan.  
- Evidence attach completion rate.  
- Exception submission rate so với expected operational cases.  
- Return-to-work time sau action success hoặc pending capture.

## 9.3 Interaction-friction signals

- Repeated tap frequency trên primary action.  
- Action cancel rate sau khi mở sheet/modal nhẹ.  
- Keyboard-triggered abandonment rate cho note-heavy moments.  
- Quick update path exit rate trước confirm.  
- Số lần user đổi reason options liên tiếp trước submit.

## 9.4 Cách diễn giải

Completion rate thấp không đủ để kết luận ngay. Nếu completion thấp đi cùng evidence failure, note burden cao hoặc repeated taps nhiều, khả năng lớn là friction nằm ở component behavior hoặc continuity semantics chứ không chỉ ở nhu cầu nghiệp vụ.

## 10. State and transition signals

## 10.1 Mục tiêu

Đo xem state model của Pack 03 đang vận hành rõ hay đang tạo hiểu sai, loop không cần thiết hoặc nghẽn kéo dài.

## 10.2 Các tín hiệu gợi ý

- Dwell time theo từng state family.  
- Transition completion rate từ state này sang state tiếp theo.  
- Tỷ lệ quay lại state trước đó trong thời gian ngắn.  
- Pending-to-resolved time.  
- Blocked-to-recovered rate.  
- Overdue persistence rate.  
- Pending approval aging distribution.

## 10.3 State ambiguity proxies

- Tỷ lệ users mở lại cùng item nhiều lần mà không có transition.  
- Tỷ lệ request-more-info loops vượt ngưỡng kỳ vọng.  
- Tỷ lệ actions bị hủy hoặc đảo ngược ngay sau khi commit.  
- Tỷ lệ support questions hoặc pilot feedback bám vào cùng một state family.

## 11. Recovery and retry signals

## 11.1 Mục tiêu

Đo xem khi có lỗi, blocked hoặc mismatch, hệ thống có giúp user quay lại flow tốt hay không.

## 11.2 Các tín hiệu gợi ý

- Error-to-recovery conversion rate.  
- Retry success rate sau lỗi submit hoặc upload.  
- Abandonment rate sau validation error.  
- Correction completion rate cho admin-side repair flows.  
- Time from recovery prompt to resumed flow progress.  
- Tỷ lệ user bỏ flow sau request-more-info hoặc stale-state message.

## 11.3 Cách diễn giải

Nhiều errors không nhất thiết tệ bằng recovery tệ. Một hệ thống có lỗi nhưng recovery nhanh, rõ và tỷ lệ resume cao vẫn khỏe hơn một hệ thống lỗi ít hơn nhưng user bỏ dở nhiều khi đã lỗi.

## 12. Continuity and interruption signals

## 12.1 Mục tiêu

Đo xem Mobile Ops có giữ trust và continuity tốt trong điều kiện mạng yếu hoặc gián đoạn thật hay không.

## 12.2 Các tín hiệu gợi ý

- Pending sync frequency.  
- Pending sync resolution time.  
- Draft restore rate.  
- Draft loss reports hoặc proxy abandonment after interruption.  
- Evidence upload retry rate.  
- Evidence upload eventual success rate.  
- Return-after-background resume success rate.  
- Repeated tap after pending signal frequency.  
- Local-capture-to-server-confirm delta distribution.

## 12.3 Trust-risk signals

- Tỷ lệ user rời item ngay sau pending mà không quay lại xác minh.  
- Tỷ lệ support escalations về “đã gửi chưa” hoặc “ảnh đã lên chưa”.  
- Tỷ lệ duplicate actions gần nhau về thời gian sau một pending moment.  
- Tỷ lệ attachments bị thay lại vì không chắc lần đầu đã lưu chưa.

## 13. Cross-surface coherence signals

## 13.1 Mục tiêu

Đo xem Web Admin và Mobile Ops có thực sự nối với nhau thành một hệ thống hay user đang phải tự ghép logic giữa hai surfaces.

## 13.2 Các tín hiệu gợi ý

- Time from mobile exception raise to web review open.  
- Time from web request-more-info to mobile next action.  
- Tỷ lệ item bị “đứng giữa hai surface” quá lâu không có owner action.  
- Cross-surface state mismatch findings từ QA/pilot.  
- Tỷ lệ transitions mà surface sau không tạo action tiếp theo như kỳ vọng.

## 13.3 Diễn giải

Cross-surface problems thường không lộ ra qua một metric duy nhất. Chúng cần được đọc bằng cách kết hợp event timing, state progression gaps, pilot anecdotes và QA scenario findings.

## 14. Pilot learning and governance signals

## 14.1 Mục tiêu

Đo xem pilot feedback đang phản ánh noise ngắn hạn hay đang chỉ ra patterns đủ mạnh để cần governance action.

## 14.2 Các tín hiệu gợi ý

- Số findings lặp lại theo cùng flow hoặc state family.  
- Số feedback items map được vào cùng một scenario hoặc same component family.  
- Số waiver-related issues vẫn còn active sau pilot rounds.  
- Số severity 1 hoặc 2 findings tái xuất hiện sau fix.  
- Tỷ lệ pilot feedback dẫn tới update baseline so với patch local.

## 14.3 Cách diễn giải

Một feedback đơn lẻ chưa chắc đại diện cho pattern. Nhưng khi nhiều tín hiệu từ metrics, QA scenarios và pilot observation cùng chỉ vào một flow hoặc state family, đó là dấu hiệu rõ rằng governance cần can thiệp ở cấp hệ thống chứ không chỉ vá cục bộ.

## 15. Metric register structure nên có

Để framework vận hành được, Pack 03 nên có hoặc sinh ra một metric register tối thiểu cho mỗi metric/signal quan trọng với các trường sau:

1. Metric name.  
2. Signal family.  
3. Persona(s) liên quan.  
4. Surface(s) liên quan.  
5. Related flow(s).  
6. Definition.  
7. Event or data source.  
8. Calculation logic.  
9. Segmentation rules.  
10. Interpretation notes.  
11. Expected healthy range hoặc baseline reference.  
12. Common false-positive risks.  
13. Related UX decisions or governance owners.

Không có register này, team rất dễ rơi vào tình trạng cùng một metric nhưng mỗi bên hiểu một kiểu khác nhau.

## 16. Segmentation và baseline rules

## 16.1 Persona segmentation

Metrics nên được đọc theo persona hoặc role group khi có thể. Một signal tốt cho manager chưa chắc tốt cho frontline, và ngược lại.

## 16.2 Surface segmentation

Không nên trộn mobile continuity metrics với web control metrics thành một con số chung vô nghĩa. Hai surfaces có role khác nhau nên phải được đọc vừa riêng vừa trong các bridge moments.

## 16.3 State segmentation

Blocked, Waiting, Pending Approval, Overdue, In Progress hoặc equivalent families nên được phân tích riêng khi có thể. Gộp mọi state lại sẽ che mất nguồn gốc ma sát.

## 16.4 Pilot cohort vs steady-state cohort

Giai đoạn pilot thường có nhiều noise do onboarding và novelty. Vì vậy team nên tách cohort pilot mới, pilot đã quen và steady-state users nếu đủ dữ liệu để tránh hiểu sai xu hướng.

## 16.5 Baseline before optimization

Đừng tối ưu một metric trước khi có baseline đủ tin cậy. Nhiều thay đổi UX nhìn có vẻ cải thiện nhưng thực ra chỉ chuyển ma sát từ bước này sang bước khác.

## 17. Interpretation rules và metric reading discipline

## 17.1 Đọc theo cụm tín hiệu

Không nên quyết định chỉ dựa vào một metric đơn lẻ. Ví dụ, approval time giảm có thể tốt, nhưng nếu request-more-info loops và reversals tăng thì quality có thể đang xấu đi.

## 17.2 Kết hợp định lượng và định tính

Metrics nên được đọc cùng QA findings, pilot interviews, support tickets và observed walkthroughs. Pack 03 là hệ thống trải nghiệm vận hành, nên numbers một mình thường không đủ để hiểu đúng nguyên nhân.

## 17.3 Tôn trọng bối cảnh nghiệp vụ

Một số queues, states hoặc flows bản chất chậm hơn hoặc phức tạp hơn. Healthy range phải luôn được diễn giải trong context chứ không áp đồng loạt một chuẩn duy nhất.

## 17.4 Không tối ưu để “trông đẹp”

Nếu team cố ép time-to-action xuống bằng cách rút bớt context cần thiết khiến decision quality giảm, đó là tối ưu sai. Metrics phải phục vụ product truth, không phải che product truth.

## 18. Dashboard layers nên có

Framework này không yêu cầu một mega-dashboard duy nhất. Tốt hơn là có các lớp nhìn khác nhau theo nhu cầu.

## 18.1 Leadership layer

Nên tập trung vào few high-level operational and trust signals như flow completion health, blocked dwell, approval turnaround, interruption fallout, major retry clusters và severity trends.

## 18.2 Product and Design layer

Nên đi sâu hơn vào funnel breaks, repeated taps, queue bounce, copy-risk signals, recovery conversion, evidence drop-off, request-more-info loops và cross-surface handoff lags.

## 18.3 QA and Pilot layer

Nên nhìn rõ scenario-linked metrics, state mismatch clusters, continuity incidents, responsive trouble reports, attachment failures và regression-sensitive signals.

## 19. Anti-pattern đo lường nghiêm trọng phải tránh

## 19.1 Dashboard vanity over behavioral truth

Nếu dashboard trông rất bận rộn nhưng không giúp quyết định UX nào tiếp theo, nó đang thất bại.

## 19.2 Single-metric decisions

Một metric đơn lẻ gần như luôn quá yếu để kết luận chất lượng trải nghiệm trong Pack 03.

## 19.3 Click-count obsession

Nhiều hoặc ít clicks không tự động đồng nghĩa tốt hay xấu. Quan trọng là clarity, effort và outcome.

## 19.4 Speed-only optimization

Nhanh hơn nhưng sai hơn, mù hơn hoặc ít trust hơn không phải cải thiện UX.

## 19.5 No segmentation

Gộp tất cả users, tất cả states và tất cả surfaces vào một tập số chung sẽ che gần hết insights quan trọng.

## 19.6 Metrics without owners

Signal không có owner interpret và owner hành động sẽ nhanh chóng biến thành dashboard decor.

## 19.7 Instrumentation without semantics

Track quá nhiều events nhưng không map về flow/state/component semantics sẽ tạo kho dữ liệu lớn nhưng nghèo giá trị UX.

## 20. Cách dùng framework này trong governance loop

## 20.1 Pre-pilot

Trước pilot, team nên chốt metric register tối thiểu cho các flows wedge đầu, xác định owners và healthy hypotheses ban đầu. Không cần instrument mọi thứ, nhưng phải instrument đủ để không mù sau khi ship.

## 20.2 During pilot

Trong pilot, team nên review signal clusters theo nhịp đều, ví dụ hàng tuần, và đối chiếu với QA scenarios, support issues và demo/onboarding observations. Mục tiêu là phát hiện pattern sớm trước khi drift thành thói quen xấu.

## 20.3 Post-pilot governance

Sau pilot, các tín hiệu lặp lại nên được map vào governance decisions: sửa component, sửa copy, sửa flow, sửa state semantics, sửa density hoặc cập nhật baseline. Không để metrics chỉ đi vào báo cáo retrospective mà không sinh ra product action.

## 20.4 Release planning

Metrics quan trọng nên ảnh hưởng trực tiếp tới ưu tiên release tiếp theo. Ví dụ, nếu retry success thấp nhưng raw completion vẫn ổn, team không nên lầm tưởng mọi thứ đang khỏe; trust debt có thể đang tích lũy âm thầm.

## 21. Governance rules cho mọi metric hoặc signal mới

Mọi metric/signal mới nên đi qua các câu hỏi sau:

1. **Metric này giúp trả lời quyết định UX hay product nào?**  
2. **Nó map với persona, flow, state hoặc component nào?**  
3. **Nó là vanity, operational hay usability signal?**  
4. **Nó có cần segmentation theo role, surface, state hay cohort không?**  
5. **Metric này dễ bị hiểu sai theo cách nào?**  
6. **Metric này có owner đọc và owner hành động không?**  
7. **Nó bổ sung insight mới hay chỉ lặp lại thứ đã biết?**  
8. **Nếu metric xấu đi, team sẽ làm gì khác đi?**

## 22. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES.md** – rules cho authority boundaries, escalation semantics và control-surface accountability.  
2. **44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY.md** – thư viện demo scripts ngắn gắn với storyboards, copy system và pilot talking points.  
3. **45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX.md** – ma trận traceability giữa components, screens, flows, states, copy semantics, metrics và QA coverage.  
4. **46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES.md** – handshake notes giữa UX continuity semantics, metrics instrumentation và implementation semantics.  
5. **47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY.md** – register chi tiết cho thuật ngữ và microcopy inventory.  
6. **48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL.md** – mô hình biến pilot feedback và signal clusters thành governance actions.  
7. **49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY.md** – taxonomy sự kiện quan sát trải nghiệm để analytics và UX nói cùng ngôn ngữ.

## 23. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho execution metrics và usability signal framework của Pack 03:

1. Pack 03 cần một **framework chính thức cho execution metrics và usability signals**, không chỉ nhìn activity counts hoặc anecdotal feedback.  
2. Metrics phải phân biệt vanity metrics, operational metrics và UX usability signals.  
3. Adoption, entry, Web Admin control quality, Mobile execution quality, state transitions, recovery, continuity, cross-surface coherence và pilot learning là các signal families chính thức phải theo dõi.  
4. Metrics quan trọng phải được đọc theo cụm tín hiệu, có segmentation phù hợp và map ngược về flows, states, screens hoặc component behaviors.  
5. Mobile continuity trust và Web Admin decision quality là hai vùng phải được đo riêng với semantics phù hợp.  
6. Metric register, interpretation rules và governance ownership là bắt buộc để tránh dashboard vanity.  
7. Tài liệu này là baseline để Product, Design, Analytics, QA, Ops và Leadership cùng đánh giá chất lượng dùng thật của Pack 03 bằng một ngôn ngữ chung.

## 24. Điều kiện hoàn thành của tài liệu

Execution Metrics and Usability Signal Framework được xem là đạt yêu cầu khi:
- các flows wedge đầu có signal coverage đủ để phát hiện friction, trust issues và adoption risks;  
- team Product, Design, QA và Analytics có cùng cách phân biệt vanity metrics với usability signals;  
- signal interpretation có gắn với persona, surface, state, flow và governance action rõ ràng;  
- và dữ liệu sau pilot hoặc release có thể được dùng để cải tiến Pack 03 theo hướng hệ thống thay vì dựa vào cảm giác rời rạc.

## AG Execution Prompt

You are acting as a senior product analytics strategist, UX measurement architect, and operational-experience observability lead.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: strategy, flows, state grammar, input patterns, wireframes, governance, component rules, admin input patterns, density rules, continuity rules, copy system, and UX QA scenarios are already defined.
- This document defines the execution metrics and usability signal framework for Pack 03.

### Objective
Refine this Execution Metrics and Usability Signal Framework document into a production-grade measurement baseline that can guide analytics instrumentation, pilot interpretation, release learning, governance reviews, and UX improvement prioritization across Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between Web Admin and Mobile Ops while keeping cross-surface flow measurement coherent.
- Keep the output concrete enough for real instrumentation and interpretation work.

### Tasks
1. Rewrite the metrics thesis into a sharper executive form.
2. Produce a measurement framework covering adoption, orientation, control quality, execution quality, state transitions, recovery, continuity, cross-surface coherence, and pilot learning.
3. Add practical metrics and signal candidates for Web Admin, Mobile Ops, recovery flows, interruption handling, and decision/reassignment quality.
4. Define register structure, segmentation rules, interpretation discipline, and dashboard layers.
5. Identify the top five measurement failures that would leave Pack 03 blind or misled.
6. Recommend the next documents that should operationalize this baseline into authority UX rules, traceability matrices, microcopy inventories, pilot-feedback triage models, and experience event taxonomies.
7. Add governance rules to prevent vanity dashboards, single-metric decisions, no-owner signals, and instrumentation detached from UX semantics.

### Constraints
- Do not confuse activity with success.  
- Do not let measurement ignore interruption, recovery, or trust.  
- Do not optimize speed metrics at the expense of decision quality or semantic clarity.  
- Do not track events without mapping them to flows, states, screens, or components.  
- Keep the output concrete enough for downstream analytics and governance use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Metrics Thesis
2. Measurement Framework
3. Metric Candidates by Signal Family
4. Interpretation and Segmentation Rules
5. Measurement Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 UX measurement explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams observe adoption quality, execution quality, trust, recovery, continuity, and cross-surface coherence after release.
- The output must reduce ambiguity around what to instrument, how to interpret it, and how to connect signals back to UX decisions.
