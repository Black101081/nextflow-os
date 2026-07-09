# Nextflow OS – Pack 08 Intelligence Use Cases and Patterns for SMEs

**Document ID:** 121_PACK08_INTELLIGENCE_USE_CASES_AND_PATTERNS_FOR_SMES  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Data & Intelligence / Ops  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Overview (120)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Intelligence Use Cases and Patterns for SMEs** – catalog các use case intelligence & assistants mà Nextflow OS nên hỗ trợ cho SMEs, cùng với pattern kỹ thuật & guardrails tương ứng.

Mục tiêu:
- chọn và mô tả **use case ưu tiên** cho lớp Intelligence (Pack 08), bắt đầu từ các tình huống vận hành & ops;  
- chuẩn hoá cách mô tả use case (value, inputs, outputs, pattern, risk level, guardrails);  
- tạo bridge giữa Product/Ops (nói về nhu cầu business) và Data/Engineering (nói về patterns & implementation).

## 2. Khung mô tả một intelligence use case

Mỗi use case trong catalog sẽ được mô tả theo cấu trúc:

- **Name** – tên ngắn, dễ hiểu.  
- **Primary Roles** – roles sẽ sử dụng (SME Ops, SME Lead, CSM, Internal Ops, Product…).  
- **Value Hypothesis** – giá trị business cụ thể (giảm backlog, tăng SLA, giảm lỗi…).  
- **Inputs & Signals** – dữ liệu & metrics sử dụng (từ Pack 07).  
- **Core Outputs** – dạng gợi ý/assistant (score, ranking, recommendation list, summary…).  
- **Interaction Pattern** – người dùng tương tác ra sao (inline hint, side panel, dashboard tile, chatbot…).  
- **Technical Pattern** – rules, scoring, pattern mining, RAG, LLM assistant…  
- **Risk Level** – low/medium/high – dựa trên impact & degree of automation.  
- **Guardrails** – human-in-the-loop, explainability, approvals, limits.  
- **Metrics of Success** – cách đo lường hiệu quả của use case.

## 3. Nhóm A – Work Prioritization & Ops Intelligence

Nhóm này ưu tiên **ops & work orchestration** – sát Pack 04 & 07, value rõ ràng.

### A1. SLA Risk & Work Prioritization Assistant

- **Primary Roles:** SME Ops, SME queue leads, Internal Ops.  
- **Value Hypothesis:** giảm SLA breach rate, giảm số việc “forgotten” trong queue, giúp team tập trung vào việc quan trọng nhất mỗi ngày.

- **Inputs & Signals:**  
  - từ `fact_work_item`: SLA target, due time, current state, queue, priority, assigned user; [code_file:479]  
  - từ `fact_sla_snapshot_daily`: SLA hit/breach trends theo queue/tenant; [code_file:479]  
  - từ `dim_queue`, `dim_work_type`, `dim_tenant`, `dim_user` – context wedge/tenant/user; [code_file:479]  
  - business configs (SLA profile, priority rules) từ Pack 04.

- **Core Outputs:**  
  - một **score SLA risk** cho mỗi work item (vd 0–1);  
  - một **sorted list** cho mỗi queue/user: “Top X items nên xử lý trước”;  
  - cảnh báo “queue Y sẽ có Z items breach trong N giờ nếu không hành động”.

- **Interaction Pattern:**  
  - inline trong queue view: cột “SLA risk” + sort default;  
  - banner “Today’s Priority” cho SME Ops;  
  - optional: side panel assistant “Show me items at highest risk today”.

- **Technical Pattern:**  
  - giai đoạn 1: rules đơn giản (thời gian còn lại đến SLA, trạng thái hiện tại, priority cấp sẵn);  
  - giai đoạn 2: scoring model sử dụng features từ history (cycle time, patterns breach) để dự đoán probability breach.  

- **Risk Level:** Medium – gợi ý ưu tiên, không auto-move hay auto-complete; human vẫn decide xử lý cái gì.  

- **Guardrails:**  
  - không auto-assign/tự động thay đổi SLA;  
  - hiển thị rationale đơn giản (vd “Còn 30 phút đến SLA, type X thường mất 45 phút”);  
  - cho phép user filter by risk vs other criteria;  
  - monitoring: xem việc dùng assistant có giảm SLA breach không.

- **Metrics of Success:**  
  - giảm % SLA breach;  
  - tăng % items xử lý trước khi SLA gần hết;  
  - adoption: % queues/users sử dụng sort theo SLA risk.

### A2. Queue Load & Staffing Advisor

- **Primary Roles:** SME Ops leads, Internal Ops.  
- **Value Hypothesis:** giúp phân bổ người hợp lý theo queue/time, giảm quá tải cục bộ.

- **Inputs & Signals:**  
  - `fact_work_item` & `fact_sla_snapshot_daily`: open items, inflow/outflow per queue/time; [code_file:479]  
  - user workload: work items per user, handle time;  
  - time-of-day & day-of-week patterns;  
  - dim_queue, dim_user.

- **Core Outputs:**  
  - forecast queue load (vd “Queue A sẽ lên tới 150 items vào 11h hôm nay”);  
  - đề xuất staffing (vd “Cần thêm 2 người vào queue A từ 9–12h”);  
  - alerts khi load vượt ngưỡng.

- **Interaction Pattern:**  
  - tiles trên Ops dashboard;  
  - notifications/emails sáng cho Ops leads;  
  - side panel assistant: “Suggest staffing plan today”.

- **Technical Pattern:**  
  - giai đoạn 1: moving average + simple thresholds;  
  - giai đoạn 2: time series forecasting đơn giản (ARIMA, Prophet, v.v.) cho inflow & xử lý.

- **Risk Level:** Low/Medium – chỉ gợi ý, humans decide staffing.  

- **Guardrails:**  
  - luôn cho xem raw numbers & assumptions;  
  - không tự động reassign tasks hoặc thay đổi shifts;  
  - monitor: sai số forecast vs thực tế, feedback từ Ops.

- **Metrics of Success:**  
  - giảm thời gian queue quá tải;  
  - giảm SLA breach do under-staffing;  
  - satisfaction của Ops leads về tính hữu ích.

### A3. Exception Pattern & Runbook Assistant

- **Primary Roles:** SME Ops, Internal Ops/Support.  
- **Value Hypothesis:** giảm thời gian xử lý exceptions, giảm rework và escalations.

- **Inputs & Signals:**  
  - `fact_exception`: types, frequency, resolution_type, resolution_time; [code_file:479]  
  - `fact_integration_call`: error codes, categories; [code_file:479]  
  - incident & change logs (liên quan mapping/logic); [code_file:479]  
  - knowledge base: SOPs/exceptions, runbooks (Pack 04–05–06 docs).

- **Core Outputs:**  
  - khi user mở một exception, assistant hiển thị:  
    - lý do phổ biến;  
    - steps thường dùng để fix;  
    - gợi ý link tới runbook;  
  - dashboard pattern: exceptions by type/root cause candidates.

- **Interaction Pattern:**  
  - inline panel trong exception detail;  
  - “What should I try?” assistant button;  
  - suggestions trong exception dashboards.

- **Technical Pattern:**  
  - pattern mining (frequent combinations);  
  - similarity search (trên historical exceptions & resolutions);  
  - RAG trên runbooks/SOPs để trả lời chi tiết.

- **Risk Level:** Low/Medium – advice, không tự động sửa data hoặc mapping production.  

- **Guardrails:**  
  - rõ ràng rằng đây là gợi ý, user chịu trách nhiệm confirm;  
  - không cho assistant auto-thực thi changes high-risk;  
  - logs suggestions và outcomes để cải thiện.

- **Metrics of Success:**  
  - giảm time-to-resolution cho exceptions;  
  - giảm escalations;  
  - adoption của assistant trong xử lý exceptions.

## 4. Nhóm B – Integration & Data Quality Intelligence

### B1. Integration Health & Risk Assistant

- **Primary Roles:** SME Ops, Internal Integration/Ops, CSM.  
- **Value Hypothesis:** phát hiện sớm integrations rủi ro, giảm incidents & data issues.

- **Inputs & Signals:**  
  - `fact_integration_call`, `fact_integration_daily_health`: error rates, latency, timeouts; [code_file:479]  
  - `fact_exception`: exceptions liên quan integration; [code_file:479]  
  - `dim_integration` + `dim_risk_tier`: tier 3–4 critical integrations. [code_file:479][code_file:451]

- **Core Outputs:**  
  - risk score per integration (per tenant/wedge);  
  - alerts “Integration X có error rate tăng đột biến, có thể ảnh hưởng flows Y”;  
  - suggestion: thêm retries, adjust timeouts, xem mapping.

- **Interaction Pattern:**  
  - tiles trên Integration Health dashboards;  
  - alerts/notifications tới Ops/CSM;  
  - assistant view: “Which integrations are risky this week?”.

- **Technical Pattern:**  
  - threshold-based alerts + trending;  
  - anomaly detection đơn giản trên time series error/latency;  
  - scoring theo risk tier & impacted flows.

- **Risk Level:** Medium – warning layer; decisions & changes vẫn human-controlled.  

- **Guardrails:**  
  - không auto-disable integrations trừ khi có policies cụ thể;  
  - ensure context rich: show history, impacted queues/flows;  
  - monitor false positives/negatives.

- **Metrics of Success:**  
  - giảm incidents liên quan integrations;  
  - giảm time-to-detection;  
  - feedback từ Ops/CSM.

### B2. Mapping & Field Suggestion Assistant

- **Primary Roles:** Integration Owner, SME Admin/IT, Internal Integration team.  
- **Value Hypothesis:** giảm lỗi mapping, tăng tốc triển khai/điều chỉnh integrations.

- **Inputs & Signals:**  
  - mapping configs (Pack 05 docs 82/86);  
  - historical integration data: fields thường đi cùng nhau, mismatches; [code_file:479]  
  - exceptions/mapping errors. [code_file:479]

- **Core Outputs:**  
  - gợi ý mapping fields mới;  
  - cảnh báo mapping không nhất quán;  
  - recommendations cho default values/transformations.

- **Interaction Pattern:**  
  - inline trong integration config UI;  
  - "suggest mapping" button khi thiết lập;  
  - assistant panel khi xử lý mapping-related exceptions.

- **Technical Pattern:**  
  - pattern mining trên field co-occurrence;  
  - heuristic suggestion dựa trên tên/kiểu field;  
  - optional: LLM assist cho lời giải thích mapping.

- **Risk Level:** Medium/High – sự cố mapping có thể gây data issues; recommendations cần review.  

- **Guardrails:**  
  - không auto-apply mapping changes;  
  - require explicit review/approval;  
  - maintain change history & rollback.

- **Metrics of Success:**  
  - giảm mapping-related exceptions;  
  - giảm thời gian setup/adjust integrations.

## 5. Nhóm C – Customer Health & CS Intelligence

### C1. Customer Health Score & Driver Insights

- **Primary Roles:** CSM, Product, SME Leadership.  
- **Value Hypothesis:** giúp CSM ưu tiên khách, biết vì sao khách “đỏ/vàng” và hành động kịp.

- **Inputs & Signals:**  
  - `fact_tenant_adoption_snapshot`: active users, features used, automation usage index, incidents, SLA breach; [code_file:479]  
  - `fact_feature_usage`: feature-level usage; [code_file:479]  
  - incident & ticket data; [code_file:479]  
  - segment/industry từ `dim_tenant`.

- **Core Outputs:**  
  - health score per tenant (0–100 hoặc green/amber/red);  
  - top drivers: adoption thấp, incidents cao, SLA issues;  
  - recommended actions: training, integration review, process redesign.

- **Interaction Pattern:**  
  - Customer Health dashboards; [code_file:480]  
  - side panel trong CSM workspace;  
  - suggestions checklist cho QBR.

- **Technical Pattern:**  
  - giai đoạn 1: scoring rules với weights defined;  
  - giai đoạn 2: model học weights từ outcomes (renewal, expansion, churn proxies) nếu có.

- **Risk Level:** Low/Medium – score nội bộ, không auto-churn hay auto-offer.  

- **Guardrails:**  
  - explain drivers;  
  - avoid dùng health score như “số tuyệt đối”;  
  - monitor correlation với outcomes; tránh bias.

- **Metrics of Success:**  
  - CSM sử dụng health score trong ưu tiên & QBR;  
  - cải thiện retention/expansion nếu có data.

### C2. CS Assistant for QBR Preparation

- **Primary Roles:** CSM.  
- **Value Hypothesis:** giảm thời gian chuẩn bị QBR, chuẩn hoá message và focus.

- **Inputs & Signals:**  
  - KPIs từ dashboards Pack 07 (SLA, backlog, automation, integration health, incidents, adoption). [code_file:480]  
  - notes/tickets chính;  
  - health score & drivers (C1).

- **Core Outputs:**  
  - draft QBR summary cho một tenant (1–2 trang): achievements, issues, trends;  
  - suggested agenda & focus areas;  
  - list recommendations actionable.

- **Interaction Pattern:**  
  - "Generate QBR draft" button trong CSM workspace;  
  - editable document với sections & citations tới dashboards.

- **Technical Pattern:**  
  - templated summarization + LLM trợ lực;  
  - grounding vào KPIs & events;  
  - citations tới charts & metrics.

- **Risk Level:** Low – output được review & chỉnh trước khi gửi khách.  

- **Guardrails:**  
  - highlight rõ "draft";  
  - ensure không bịa số – chỉ dùng metrics đã có;  
  - CSM luôn review trước.

- **Metrics of Success:**  
  - giảm thời gian chuẩn bị QBR;  
  - feedback CSM về chất lượng drafts.

## 6. Nhóm D – Knowledge & SOP Assistant (RAG)

### D1. Internal SOP & Runbook Assistant

- **Primary Roles:** Internal Ops, Support, CSM, Integration team.  
- **Value Hypothesis:** giảm thời gian tìm SOP/runbook, tăng độ nhất quán khi xử lý.

- **Inputs & Signals:**  
  - corpus: SOPs, runbooks, policies, product docs (Packs 02–07 docs, playbooks);  
  - context signals: loại work, loại exception, loại incident, role người dùng.

- **Core Outputs:**  
  - câu trả lời natural language cho “Làm sao để xử lý X?”;  
  - checklist các bước;  
  - links tới doc gốc.

- **Interaction Pattern:**  
  - chat/side panel trong admin/ops UI;  
  - inline "Ask assistant" khi mở incident/exception;  
  - search bar nâng cao cho docs.

- **Technical Pattern:**  
  - RAG: indexing docs, retrieval theo context, LLM summarization;  
  - citations & anchors tới docs/PDF sections.

- **Risk Level:** Low/Medium – guidance only, không auto-act.  

- **Guardrails:**  
  - tránh trả lời ngoài phạm vi docs;  
  - luôn kèm links & citations;  
  - logging Q&A cho cải thiện & audit.

- **Metrics of Success:**  
  - giảm thời gian tìm thông tin;  
  - giảm variation trong handling incidents/exceptions;  
  - feedback từ người dùng nội bộ.

### D2. Customer-facing Knowledge Assistant (tương lai)

- Cấu trúc tương tự D1 nhưng audience là SMEs;  
- Risk cao hơn, cần guardrails & review kỹ;  
- có thể vào phase sau của Pack 08.

## 7. Nhóm E – Automation & Process Improvement Recommender

### E1. Automation Opportunity Finder

- **Primary Roles:** Product, Ops, SME Admin/Owner.  
- **Value Hypothesis:** tìm nơi automation có ROI tốt để giảm manual work & lỗi.

- **Inputs & Signals:**  
  - work events: manual steps lặp lại nhiều; [code_file:479]  
  - exceptions & rework patterns; [code_file:479]  
  - automation usage & outcomes (Pack 04, 07, 105). [code_file:494]

- **Core Outputs:**  
  - danh sách "flows/steps candidates" để automation;  
  - ước lượng impact (time saved, SLA improved);  
  - suggestions cho type automation (rules, templates, integration).

- **Interaction Pattern:**  
  - dashboard section "Automation opportunities";  
  - assistant trong config/routing UI khi admin chỉnh rules.

- **Technical Pattern:**  
  - pattern mining trên event logs;  
  - scoring dựa trên frequency, time cost, error rate.

- **Risk Level:** Medium – recommendations dẫn tới changes high-risk nếu implement; phải đi qua change governance Pack 06. [code_file:453]

- **Guardrails:**  
  - không auto-enable automation;  
  - integrate với change lanes C–D khi high-impact;  
  - require Product/Ops review.

- **Metrics of Success:**  
  - số automation được implement từ recommendations;  
  - time saved & SLA improvements (ước lượng).

## 8. Ưu tiên triển khai theo phase

Dựa trên value vs độ rủi ro & phức tạp, gợi ý thứ tự:

- **Phase 1 (Foundational Intelligence)**  
  - A1 – SLA Risk & Work Prioritization Assistant;  
  - B1 – Integration Health & Risk Assistant;  
  - D1 – Internal SOP & Runbook Assistant.

- **Phase 2 (Operations & CS Intelligence)**  
  - A2 – Queue Load & Staffing Advisor;  
  - A3 – Exception Pattern & Runbook Assistant;  
  - C1 – Customer Health Score & Driver Insights.

- **Phase 3 (Productivity & Automation Intelligence)**  
  - C2 – CS Assistant for QBR Preparation;  
  - B2 – Mapping & Field Suggestion Assistant;  
  - E1 – Automation Opportunity Finder;  
  - D2 – Customer-facing Knowledge Assistant (có guardrails cao).

## 9. Điều kiện & guardrails chung cho toàn bộ use case

- Mọi use case phải:  
  - dùng data & metrics được định nghĩa trong Pack 07; [code_file:479][code_file:480]  
  - tuân data policies & access controls Pack 06–07; [code_file:451][code_file:482]  
  - không auto-act trên flows Tier 3–4 nếu không có governance rõ; [code_file:451][code_file:456]  
  - có owner (Product + Data) và metrics of success.

- Use case risk cao phải:  
  - được review/approve bởi Governance & Risk (doc 124 sẽ chi tiết);  
  - có monitoring & rollback;  
  - có playbook incidents riêng.

## 10. Điều kiện hoàn thành của tài liệu

Intelligence Use Cases and Patterns for SMEs được xem là đạt yêu cầu khi:
- Product, Ops, CS có thể chỉ vào một use case và hiểu rõ "nó làm gì, dùng data gì, giúp gì";  
- Data & Engineering có thể map use case sang patterns kỹ thuật cụ thể;  
- Governance & Risk có thể đánh giá risk level và guardrails cần thiết cho mỗi use case;  
- và Pack 08 có một lộ trình ưu tiên rõ (Phase 1–3) để triển khai dần các khả năng intelligence.
