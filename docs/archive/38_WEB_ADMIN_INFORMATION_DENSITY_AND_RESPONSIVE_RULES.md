# Nextflow OS – Web Admin Information Density and Responsive Rules

**Document ID:** 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Frontend UX Engineering / Product Management  
**Dependent Packs:** Frontend Delivery, Design System, Engineering Implementation, QA & Support, Program Delivery  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **bộ rules chính thức cho information density, hierarchy preservation và responsive behavior của Web Admin** trong Pack 03 của Nextflow OS. Nếu Web Admin Experience Strategy đã chốt bản chất của Web Admin là control surface, Information Architecture đã chốt cấu trúc điều hướng, Screen Taxonomy đã chốt các family màn hình, Wireframe Blueprints đã chốt bố cục nền, Decision Input Patterns đã chốt grammar của forms và approvals, còn UX Governance đã chốt cơ chế giữ coherence, thì tài liệu này xử lý một lớp rủi ro rất dễ làm Web Admin drift khi đi vào build thật:

> **Khi lượng thông tin trên Web Admin tăng lên, khi nhiều queues, tables, summaries, side panels, filters, statuses, histories và decision inputs cùng tồn tại, hệ thống phải giữ mật độ thông tin như thế nào và co giãn theo viewport ra sao để vẫn duy trì clarity, triage quality, decision confidence và control-surface integrity?**

Web Admin của một SME Business OS gần như chắc chắn sẽ chịu lực kéo về phía “nhồi thêm chút nữa cũng được” theo thời gian. Mỗi queue muốn thêm vài cột, mỗi review screen muốn thêm chút history, mỗi manager muốn thấy thêm metadata, mỗi implementation muốn tránh mở screen phụ nên dồn thêm context vào cùng một màn. Nếu không có rules density rõ, product sẽ drift dần thành dashboard clutter, table dump hoặc decision surface quá nặng. Khi đó người dùng nhìn thấy nhiều hơn, nhưng hiểu ít hơn.

Tài liệu này vì vậy không nhằm ép Web Admin phải tối giản một cách giả tạo. Mục tiêu của nó là xác định **mức độ giàu thông tin hợp lý cho một control surface**, đồng thời chốt các quy tắc co giãn responsive để không làm rơi hierarchy, state truth, action proximity hoặc reviewability khi viewport thay đổi.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của information density rules trong Pack 03.  
2. Khác biệt giữa density tốt và clutter.  
3. Các nguyên lý hierarchy cho Web Admin.  
4. Các lớp thông tin chính trên control surface.  
5. Rules cho tables, lists, queue views và review workspaces.  
6. Rules cho summary zones, side panels, detail regions và supporting context.  
7. Rules cho filters, chips, tabs, counts và secondary controls.  
8. Responsive rules theo các nhóm viewport thực dụng.  
9. Rules cho collapse, progressive disclosure và priority preservation.  
10. Rules cho state visibility, action proximity và decision context khi co layout.  
11. Những anti-pattern density và responsive nghiêm trọng phải tránh.  
12. Cách review density/responsive trong governance loop.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Information density trong ngữ cảnh Web Admin là gì

Trong Nextflow OS, information density không nên được hiểu đơn giản là “nhiều hay ít thông tin”. Nó là **mật độ hữu ích của thông tin trong một bối cảnh điều hành cụ thể**. Một screen có thể chứa khá nhiều thông tin mà vẫn tốt nếu hierarchy rõ, grouping đúng, signals nổi đúng chỗ và phần lớn dữ liệu có ích cho câu hỏi vận hành hiện tại. Ngược lại, một screen nhìn không quá đầy nhưng vẫn tệ nếu thứ quan trọng bị chìm, các khối không có trọng lượng rõ hoặc người dùng phải scan quá xa để ghép ngữ cảnh.

Vì vậy tài liệu này dùng distinction sau:
- **Rich density** là nhiều thông tin nhưng có cấu trúc, có thứ tự ưu tiên và giúp quyết định tốt hơn.  
- **Clutter density** là nhiều thông tin nhưng làm tăng scanning cost, tăng memory burden và làm mờ action path.

Control surface của Web Admin đương nhiên cần giàu thông tin hơn Mobile Ops. Nhưng “giàu thông tin” không đồng nghĩa với “mọi thứ cùng hiện ngang nhau”. Giá trị của Web Admin nằm ở chỗ nó cho phép người dùng **đi từ nhận biết tới quyết định**, không phải chỉ cho phép họ nhìn thấy thật nhiều dữ liệu.

## 3. Density thesis cho Web Admin

Density thesis của tài liệu này có thể phát biểu như sau:

> **Web Admin phải hiển thị đủ thông tin để người dùng triage, review và quyết định đúng mà không phải rời ngữ cảnh quá nhiều; nhưng mọi đơn vị thông tin thêm vào màn hình đều phải chứng minh rằng nó cải thiện nhận biết, quyết định hoặc traceability tốt hơn chi phí scan, chi phí hiểu và chi phí co giãn responsive mà nó tạo ra.**

Từ thesis này, mười nguyên lý được suy ra:

1. Control surface phải ưu tiên **decision-supporting density** hơn display abundance.  
2. Mọi screen phải có một **câu hỏi vận hành chính** quyết định hierarchy của thông tin.  
3. Thông tin primary, secondary và tertiary phải được tách rõ về vị trí, trọng lượng và hành vi co giãn.  
4. State, urgency và blockers phải sống ở lớp scan đầu.  
5. Supporting context chỉ nên hiện gần mức đủ để tránh nhảy màn hình không cần thiết.  
6. Responsive behavior phải bảo toàn meaning trước khi bảo toàn bố cục.  
7. Khi co layout, hệ thống phải giữ priority order, không chỉ thu nhỏ mọi thứ đồng loạt.  
8. Tables, filters và side panels phải được dùng như công cụ điều hành, không phải kho chứa dữ liệu.  
9. Progressive disclosure phải giúp giảm tải nhận thức, không phải giấu đi phần quan trọng.  
10. Density decisions phải được review như quyết định sản phẩm, không chỉ là quyết định visual arrangement.

## 4. Các lớp thông tin chính trên Web Admin

Để review density có ngôn ngữ chung, Pack 03 nên phân loại các lớp thông tin chính như sau:

1. **Primary operational signals** – state chính, urgency, blockers, ownership, approval need, overdue condition.  
2. **Primary decision context** – facts cốt lõi cần để triage hoặc ra quyết định.  
3. **Action context** – actions hiện có, outcome expectations, permission cues, consequence previews.  
4. **Supporting evidence and history** – notes gần đây, prior decisions, attachments, trace snippets, related facts.  
5. **Secondary metadata** – IDs, timestamps, source fields, auxiliary references, less-frequent attributes.  
6. **Administrative chrome** – tabs, filters, counts, breadcrumbs, utilities, export or settings controls.

Các lớp này không nên cạnh tranh trọng lượng như nhau. Sai lầm phổ biến nhất của admin UI là để administrative chrome và secondary metadata ăn mất sự chú ý lẽ ra phải dành cho primary operational signals.

## 5. Hierarchy model cho control surface

## 5.1 Câu hỏi vận hành chính phải quyết định bố cục

Mỗi Web Admin screen nên có một operational question rõ, ví dụ:
- điều gì cần tôi chú ý trước;  
- item này có nên được approve;  
- queue này đang nghẽn ở đâu;  
- dữ liệu nào đang lỗi và sửa thế nào;  
- ai nên sở hữu item này tiếp theo.

Khi câu hỏi chính đã rõ, hierarchy của screen phải phản ánh nó. Nếu một phần tử không giúp trả lời câu hỏi đó trực tiếp hoặc gián tiếp, nó nên bị giảm trọng lượng, trì hoãn hoặc chuyển sang layer phụ.

## 5.2 Primary-first scan order

Người dùng Web Admin không nên cần quét toàn màn hình mới biết tình hình chính. Mỗi screen nên cho phép scan theo thứ tự gần như sau:
1. Screen role / queue role.  
2. State, urgency, blockers hoặc counts nổi bật.  
3. Primary workspace hoặc list/detail focus.  
4. Actions hoặc decision zone.  
5. Supporting context.  
6. Deeper history hoặc metadata phụ.

## 5.3 Secondary information phải phục vụ, không lấn át

History, audit clues, metadata, filters phức tạp và tiện ích phụ đều có giá trị trong control surface. Tuy nhiên chúng chỉ tốt khi được đặt đúng trọng lượng. Nếu các vùng này đẩy action zone xuống thấp, làm split attention hoặc làm queue/list khó scan thì hierarchy đã hỏng.

## 6. Rules cho queue views, tables và list-heavy screens

Queue views và table-like screens là nơi density drift xảy ra nhanh nhất.

## 6.1 Vai trò

- Cho phép triage nhanh.  
- Làm lộ priority clusters.  
- Hỗ trợ tìm và chọn item đúng.  
- Giữ work movement visible.

## 6.2 Density rules

1. Mọi cột hoặc field hiển thị mặc định phải chứng minh giá trị triage.  
2. State, urgency, owner và next-critical cue phải nằm trong vùng scan đầu hoặc cột ưu tiên cao.  
3. Không dùng quá nhiều cột hẹp chỉ để “tiết kiệm không gian” nếu điều đó làm text khó đọc và tăng scan noise.  
4. Bulk data visibility không được làm chìm item-level decision cues.  
5. Nếu queue cần nhiều metadata, hãy tách một phần sang detail preview hoặc side panel thay vì dồn hết lên dòng list.

## 6.3 Column priority rules

- **Tier 1 columns**: item identity, dominant state, urgency/blocker, owner hoặc required next actor.  
- **Tier 2 columns**: category, location/team, due timing, approval/request type, key progress cue.  
- **Tier 3 columns**: deeper metadata, source info, created-by, auxiliary refs, lower-frequency attributes.

Khi responsive pressure tăng, Tier 3 phải bị hy sinh trước, sau đó đến một phần Tier 2. Tier 1 gần như không được biến mất khỏi mặc định nếu screen còn phải dùng được như queue điều hành.

## 6.4 Row density rules

- Một row phải ưu tiên đọc được và phân biệt được item, không nên bị nén đến mức mọi item nhìn thành dải chữ giống nhau.  
- Multi-line cells chỉ nên dùng khi chúng tăng hiểu biết triage rõ rệt.  
- Status badges, counts và icons trong row không nên tạo “noise strip” làm mất trọng tâm đọc.

## 7. Rules cho review workspaces và detail-heavy screens

Review workspaces thường kết hợp summary, decision context, side evidence và action zones, nên rất dễ thành màn hình nặng.

## 7.1 Layout principle

Review workspace nên xoay quanh một **decision spine** gồm:
- item identity và current state,  
- lý do cần review,  
- facts quan trọng,  
- supporting evidence gần đủ,  
- decision actions và outcome cues.

## 7.2 Density rules

1. Decision summary phải ở phần trên hoặc vùng nhìn đầu tiên.  
2. Primary facts phải gần action zone hơn history xa.  
3. Supporting panels nên đủ gần để đọc bổ sung, nhưng không được lấn primary workspace thành màn hình hai trung tâm cạnh tranh nhau.  
4. Nếu history dài, nên preview đoạn gần nhất hoặc đoạn có liên quan thay vì dump full trace mặc định.  
5. Form inputs phục vụ decision phải nằm trong luồng logic, không bị đẩy tách ra như một khối không liên quan.

## 7.3 Side-panel rules

- Side panels hữu ích khi chứa evidence, recent notes, linked entities hoặc trace snippets.  
- Chúng không nên trở thành “bãi chứa mọi thứ chưa biết để đâu”.  
- Nếu side panel mang thông tin quá thiết yếu cho quyết định, có thể hierarchy hiện tại đang sai vì decision context chính lại đang bị xếp vào vùng phụ.

## 8. Rules cho summary zones, stat clusters và top-of-screen signals

## 8.1 Khi nào nên dùng

Summary zones hợp lệ khi người dùng cần định hướng nhanh, phân biệt clusters hoặc thấy volume / severity / readiness patterns trước khi đi vào chi tiết.

## 8.2 Rules

1. Summary zones phải trả lời một câu hỏi điều hành thực, không chỉ để “đẹp như dashboard”.  
2. Số lượng cards/stat blocks nên đủ ít để hierarchy rõ.  
3. Mỗi stat hoặc count nên có đường dẫn hợp lý sang vùng công việc liên quan.  
4. Không nên đặt summary blocks quá nặng nếu phần lớn user action thực chất diễn ra ở queue/detail bên dưới.

## 8.3 Anti-clutter rule

Khi summary zone bắt đầu chứa quá nhiều nhỏ lẻ như mini KPIs, micro legends, duplicated counts hoặc phụ đề dài, screen đã trượt khỏi control clarity và vào dashboard clutter.

## 9. Rules cho filters, chips, tabs, counts và control chrome

Administrative chrome rất dễ tăng dần theo thời gian và ăn mất không gian tư duy.

## 9.1 Filter rules

1. Chỉ giữ các filters mặc định phục vụ segmentation thật sự dùng thường xuyên.  
2. Filters chính nên nổi hơn advanced filters.  
3. Current filter state phải nhìn thấy rõ để người dùng không quên mình đang nhìn phạm vi nào.  
4. Reset / clear logic phải rõ và gần enough để tránh trạng thái “lọc xong quên”.

## 9.2 Chip and tab rules

1. Tabs chỉ nên đại diện cho work modes, status families hoặc structural separations có meaning.  
2. Chips không nên đồng thời gánh vai status, filter, category và navigation theo cách lẫn lộn.  
3. Counts cạnh tabs hoặc filters phải hỗ trợ quyết định, không phải chỉ là số trang trí.

## 9.3 Secondary controls

- Export, refresh, settings, column management hoặc utility actions nên được đặt sao cho accessible nhưng không cạnh tranh với primary work actions.  
- Không để utility controls lên cùng visual level với approve, assign, resolve hoặc review actions.

## 10. Responsive model theo viewport thực dụng

Tài liệu này không khóa pixel design system chi tiết, nhưng nên chốt các nhóm viewport thực dụng để review behavior nhất quán.

## 10.1 Viewport nhóm A – Wide desktop workspace

Đây là layout có đủ không gian để giữ queue, summary và side context đồng tồn tại ở mức hợp lý. Đây là baseline tốt nhất cho complex review workspaces.

## 10.2 Viewport nhóm B – Standard laptop / medium desktop

Không gian ngang bắt đầu có áp lực rõ hơn. Nhiều screens vẫn nên giữ được cấu trúc hai vùng, nhưng side context hoặc Tier 3 metadata có thể cần giảm hoặc collapse.

## 10.3 Viewport nhóm C – Narrow laptop / compact browser width

Đây là vùng nguy hiểm nhất cho Web Admin vì screen vẫn bị dùng như desktop nhưng không gian ngang không còn rộng. Responsive rules ở đây phải bảo toàn hierarchy bằng cách bỏ, gom hoặc chuyển lớp thông tin chứ không chỉ ép co mọi cột và mọi panel cùng lúc.

## 10.4 Viewport nhóm D – Tablet landscape / constrained admin usage

Không phải bối cảnh chính cho Web Admin phức tạp, nhưng một số screens có thể vẫn được mở ở đây. Hệ thống nên ưu tiên task review nhẹ, lookup và limited coordination hơn full-density admin work nếu không gian không đủ.

## 11. Responsive rules theo loại màn hình

## 11.1 Queue screens

- Trên viewport rộng, có thể giữ filters chính, queue list đầy đủ và lightweight preview cùng lúc nếu hierarchy còn rõ.  
- Khi hẹp hơn, preview nên collapse hoặc chuyển thành drawer/secondary view trước khi Tier 1 cột bị hy sinh.  
- Tier 3 metadata nên rời khỏi mặc định sớm.  
- Filter rows dài nên gom hoặc ẩn vào advanced controls thay vì chiếm hai tầng cao đầu màn quá nhiều.

## 11.2 Review/detail screens

- Khi viewport co lại, supporting side panel nên collapse trước nếu phần chính vẫn cần chỗ cho decision summary và actions.  
- Outcome-critical actions và state summary phải luôn còn gần nhau.  
- Nếu decision input bị đẩy quá xa context vì responsive stacking, layout đó không đạt yêu cầu.

## 11.3 Dashboard-like landing screens

- Summary blocks nên giảm số cột và tăng chiều dọc trước khi mất meaning.  
- Priority lists phải giữ visible mà không bị đẩy quá sâu dưới fold bởi các cards summary quá to.  
- Nếu landing trở thành chỉ toàn cards mà không dẫn vào workspace rõ, responsive implementation đang lệch mục tiêu.

## 12. Collapse và progressive disclosure rules

## 12.1 Collapse phải theo priority, không theo tiện code

Cái gì secondary phải collapse trước. Cái gì primary phải giữ lâu hơn. Không được collapse phần quan trọng chỉ vì nó “khó responsive” hơn.

## 12.2 Progressive disclosure dùng cho gì

- Advanced filters.  
- Deep metadata.  
- Full audit history.  
- Rarely used utilities.  
- Supplemental evidence beyond the first useful layer.

## 12.3 Progressive disclosure không dùng cho gì

- Dominant state.  
- Blockers.  
- Current owner nếu là yếu tố triage cốt lõi.  
- Decision consequence cues.  
- Primary actions.

## 12.4 Disclosure cues phải có meaning

Nếu một vùng bị thu gọn, người dùng nên hiểu vùng đó chứa loại thông tin gì và mở ra để làm gì. “More” chung chung quá mức thường là dấu hiệu chưa tổ chức được nội dung đúng.

## 13. Rules cho state visibility và action proximity khi co layout

## 13.1 State truth phải sống sót qua responsive changes

Một trong những thất bại lớn nhất của responsive admin UX là khi co width xong thì status, blockers hoặc urgency cues bị đẩy xuống dưới, rút ngắn quá mức hoặc lẫn với metadata phụ. Điều này không được chấp nhận trong Pack 03.

## 13.2 Action proximity phải được bảo vệ

Nếu approve/reject/reassign/resolve actions bị đẩy quá xa summary hoặc ngữ cảnh lý do khi viewport co lại, decision quality sẽ giảm. Responsive behavior phải giữ relationship giữa context và action, kể cả khi phải hy sinh vùng phụ.

## 13.3 Counts và labels không được mất nghĩa

Khi responsive co mạnh, đừng chỉ hiển thị icon hoặc số mà mất hẳn label giải thích. Control surface cần comprehension rõ hơn là tiết kiệm vài ký tự.

## 14. Rules cho whitespace, chunking và visual breathing room

## 14.1 Whitespace không phải xa xỉ

Trong admin UX, whitespace là công cụ tạo hierarchy và giúp mắt phân biệt clusters thông tin. Ép quá chặt có thể tăng density về lượng nhưng giảm density hữu ích.

## 14.2 Chunking theo logic công việc

Các nhóm nội dung nên được chia theo câu hỏi hoặc quyết định, không theo tiện implementation. Một chunk tốt giúp người dùng xử lý từng phần có meaning thay vì nhìn một bức tường dữ liệu.

## 14.3 Đừng dùng separator để vá hierarchy yếu

Nếu screen cần quá nhiều đường kẻ, hộp, mini card hoặc divider dày đặc để “tách thứ”, rất có thể cấu trúc thông tin nền chưa tốt.

## 15. Mapping density rules với screen families

## 15.1 Landing and monitoring screens

Ưu tiên orientation, priority signals và entry paths. Không để summary zones chiếm hết sự chú ý mà thiếu đường sang actionable workspace.

## 15.2 Queue and triage screens

Ưu tiên scan speed, status clarity, segmentation và selective detail. Đây là nơi cột mặc định và filter discipline đặc biệt quan trọng.

## 15.3 Review and approval screens

Ưu tiên decision summary, state truth, outcome preview và supporting evidence đúng mức. Đây là nơi side-context discipline quan trọng nhất.

## 15.4 Correction and import-fix screens

Ưu tiên error grouping, repair focus và retry clarity. Không để screen giống spreadsheet hoặc full-object editor nếu câu hỏi chính chỉ là sửa blockers.

## 16. Anti-pattern density và responsive nghiêm trọng phải tránh

## 16.1 Dashboard clutter disguised as control visibility

Nhiều cards, nhiều mini numbers và nhiều legends không làm control surface mạnh hơn nếu chúng không dẫn tới can thiệp tốt hơn.

## 16.2 Table dump

Nhồi thêm cột để “khỏi phải mở chi tiết” thường chỉ đổi chỗ cho cognitive load chứ không giảm nó.

## 16.3 Equal-weight layout

Khi summary, list, filters, metadata, history và actions đều nhìn có trọng lượng ngang nhau, user sẽ không biết nhìn đâu trước.

## 16.4 Responsive shrink without reprioritization

Thu nhỏ font, co cột và ép panel mà không tái ưu tiên nội dung là responsive failure điển hình.

## 16.5 Side-panel addiction

Đẩy mọi thứ sang side panel có thể trông gọn lúc đầu, nhưng dễ tạo màn hình hai trung tâm hoặc ba trung tâm cạnh tranh nhau.

## 16.6 Filter bar sprawl

Một hàng filter kéo dài vô tận, chồng hai ba dòng từ đầu màn là cách nhanh nhất làm mất tập trung khỏi công việc thật.

## 16.7 State buried below metadata

Nếu blocked, overdue hoặc pending approval bị chìm dưới IDs, timestamps hoặc tags phụ, hierarchy đã sai nghiêm trọng.

## 17. Governance rules cho mọi quyết định density / responsive mới

Mọi thay đổi mới nên đi qua các câu hỏi sau:

1. **Operational question chính của screen là gì?**  
2. **Thông tin nào thật sự cần cho scan đầu?**  
3. **Mỗi field/cột/panel thêm vào giúp triage, quyết định hay traceability ra sao?**  
4. **Nếu viewport hẹp hơn, cái gì sẽ biến mất hoặc collapse trước?**  
5. **State, urgency, blockers và action context có còn sống đủ rõ sau responsive changes không?**  
6. **Có đang dùng side panel hoặc filter bar để che dấu cấu trúc thông tin yếu không?**  
7. **Layout này có làm queue/review screen drift thành dashboard clutter hoặc table dump không?**  
8. **Người dùng có còn quyết định đúng nhanh hơn nhờ screen này không?**

## 18. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho offline weakness, interruption-heavy usage và recovery continuity trên Mobile Ops.  
2. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing guidelines xuyên Pack 03.  
3. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness UX QA scenarios theo persona, flow và state transitions.  
4. **42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK.md** – framework đo friction, completion quality, review speed và adoption signals.  
5. **43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES.md** – rules riêng cho permission, authority boundaries và escalation UX nếu phase sau cần đào sâu.  
6. **44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY.md** – thư viện demo scripts rút gọn từ storyboards chính thức.  
7. **45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX.md** – ma trận traceability giữa component rules, screen families và launch-critical flows.

## 19. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Web Admin information density và responsive behavior:

1. Web Admin cần một **bộ rules density và responsive chính thức**, không để implementation tự quyết theo từng màn hình.  
2. Density tốt được định nghĩa bằng khả năng hỗ trợ triage, decision và traceability, không bằng số lượng dữ liệu hiển thị.  
3. Primary operational signals, decision context, action context, supporting evidence, secondary metadata và administrative chrome phải có trọng lượng khác nhau rõ ràng.  
4. Tables, queues, review workspaces, summary zones, side panels, filters và tabs phải được quản trị như công cụ điều hành chứ không phải nơi tích lũy thông tin.  
5. Responsive behavior phải bảo toàn meaning và hierarchy trước khi bảo toàn bố cục hay số lượng phần tử.  
6. Tiered priority cho columns, panels và disclosures là bắt buộc để tránh responsive shrink failure.  
7. Tài liệu này là baseline để design, frontend, QA và product review cùng một ngôn ngữ khi đánh giá density và clarity của Web Admin.

## 20. Điều kiện hoàn thành của tài liệu

Web Admin Information Density and Responsive Rules được xem là đạt yêu cầu khi:
- các screen families chính của Web Admin có logic density và responsive rõ ràng;  
- team UX, Frontend, QA và Product có cùng tiêu chí để đánh giá clutter, hierarchy loss và responsive drift;  
- implementation có thể co giãn giữa các viewport thực dụng mà vẫn giữ state truth, action proximity và triage quality;  
- và Web Admin được bảo vệ khỏi dashboard clutter, table dump và equal-weight layout drift khi sản phẩm trưởng thành thêm.

## AG Execution Prompt

You are acting as a senior UX systems designer, admin-information architect, and responsive control-surface strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Web Admin is the control surface, with IA, screen taxonomy, state grammar, wireframe blueprints, governance, decision-input patterns, and demo storyboards already defined.
- This document defines the density and responsive rules for Web Admin.

### Objective
Refine this Web Admin Information Density and Responsive Rules document into a production-grade density baseline that can guide queue design, review workspaces, tables, summary zones, side panels, filters, responsive implementation, and UX QA reviews without letting Web Admin drift into clutter or table-dump behavior.

### Inputs
- Use this document plus Web Admin Experience Strategy, IA, Screen Taxonomy, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, Persona-Based Landing, Web Admin Wireframe Blueprints, UX Governance, Decision Input Patterns, and Storyboards as the primary source of truth.
- Preserve the control-surface role and wedge-first launch focus.
- Keep the output concrete enough for implementation-oriented design and review.

### Tasks
1. Rewrite the density thesis into a sharper executive form.
2. Produce a density framework covering information layers, hierarchy tiers, and default-vs-collapsible content classes.
3. Add practical rules for queue views, tables, review workspaces, summary zones, side panels, filters, tabs, and supporting metadata.
4. Define responsive rules across practical viewport groups, including collapse priorities and action/state preservation requirements.
5. Identify the top five density/responsive failures that would weaken control-surface clarity or decision quality.
6. Recommend the next documents that should operationalize this baseline into offline patterns, copy systems, QA scenarios, and traceability matrices.
7. Add governance rules to prevent dashboard clutter, equal-weight layouts, table dumps, and responsive shrink failures.

### Constraints
- Do not confuse more visible information with better control.  
- Do not let responsive behavior hide or weaken state truth and action context.  
- Do not let filters, chrome, or side panels compete with primary work zones.  
- Do not allow lower-priority metadata to crowd out triage-critical signals.  
- Keep the output concrete enough for downstream implementation reviews.

### Output Format
Return a revised markdown document with these sections:
1. Executive Density Thesis
2. Information Layer Framework
3. Usage Rules by Screen Family
4. Responsive Rules
5. Density Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Web Admin density and responsive behavior explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams build Web Admin screens with stronger hierarchy, better scanability, and safer responsive adaptations.
- The output must reduce ambiguity around what information should stay primary, what can collapse, and how queue/review screens should behave under viewport pressure.
