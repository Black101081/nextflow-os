# Nextflow OS – Pack 08 AI Governance, Risk and Guardrails

**Document ID:** 124_PACK08_AI_GOVERNANCE_RISK_AND_GUARDRAILS  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Governance & Risk / Data & Intelligence / Security  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Overview (120), 08 Use Cases (121), 08 Feature Layer (122), 08 Model & Logic (123)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **AI Governance, Risk and Guardrails** cho Pack 08 – khung quản trị cho tất cả các capabilities intelligence, recommendations và assistants trong Nextflow OS.

Mục tiêu:
- phân loại **risk levels** cho AI use cases (low/medium/high) dựa trên impact & degree of automation;  
- định nghĩa **guardrails bắt buộc** cho từng lớp logic (rules, scoring, pattern mining, RAG/LLM); [code_file:509]  
- mô tả **approval & review process** cho AI use cases, nhất là với flows Tier 3–4 (Pack 06–91); [code_file:451]  
- định nghĩa **monitoring, incidents & rollback** cho AI outputs;  
- đảm bảo AI layer tôn trọng data policies (104) & governance core (Pack 06). [code_file:482]

## 2. Thesis về AI governance trong Nextflow OS

Thesis:

> **AI trong Nextflow OS phải là "công dân hạng hai" trong governance: nó không được tạo ra luật riêng. Mọi recommendations & assistants phải tôn trọng risk, data, access và trách nhiệm đã được định nghĩa cho workflows cốt lõi, và phải có đường dây chịu trách nhiệm rõ ràng khi gây ra hoặc góp phần gây ra sự cố.**

Nguyên lý:

1. **Human accountability** – người dùng và teams chịu trách nhiệm cuối cùng cho quyết định, không đổ lỗi cho "AI".  
2. **Proportional governance** – kiểm soát mạnh hơn cho AI use cases có impact lớn, automation cao; kiểm soát nhẹ hơn cho guidance low-risk.  
3. **Transparency & explainability** – users được biết khi nào AI tham gia và có thể truy vết "vì sao".  
4. **Least privilege & minimization** – AI components chỉ access data cần thiết; không có "super AI" bypass controls.  
5. **Continuous monitoring & improvement** – AI outputs được giám sát, có feedback & học hỏi; governance không phải one-off.

## 3. Phân loại AI use case risk level

Dựa trên doc 121, chúng ta phân loại risk theo hai trục: business impact & degree of automation. [code_file:507]

### 3.1 Low-risk

Đặc điểm:
- Chỉ cung cấp **gợi ý, summary, hoặc sắp xếp view**;  
- không tự động thực thi actions;  
- sai sót gây ảnh hưởng nhỏ, dễ sửa;  
- ví dụ:  
  - D1 Internal SOP & Runbook Assistant;  
  - C2 QBR draft;  
  - một số aspects của A3 Exception Assistant (suggesting steps), nếu không auto-act.

Guardrails cơ bản là đủ.

### 3.2 Medium-risk

Đặc điểm:
- Ảnh hưởng tới **ưu tiên, resource allocation hoặc attention**;  
- output dùng để ra quyết định về work nhưng vẫn phải confirm;  
- ví dụ:  
  - A1 SLA Risk & Work Prioritization (thay đổi thứ tự);  
  - A2 Queue Load & Staffing Advisor;  
  - B1 Integration Health & Risk Assistant;  
  - C1 Customer Health Score & Driver Insights;  
  - E1 Automation Opportunity Finder.

Cần guardrails rõ & monitoring.

### 3.3 High-risk

Đặc điểm:
- Có thể dẫn tới **thay đổi trực tiếp workflows critical** (Tier 3–4) hoặc automation gần như tự động;  
- liên quan financial flows, compliance, hoặc actions irreversible;  
- ví dụ:  
  - bất kỳ logic nào auto-approve/auto-reject critical transactions;  
  - auto-adjust mapping/integration configs không review;  
  - customer-facing knowledge assistant làm claims nhạy cảm.

Các use case high-risk phải được xem xét riêng, có thể bị hoãn nếu chưa đủ governance.

## 4. Guardrails theo lớp logic

### 4.1 Rules & Heuristics

- Rules là explicit, nên dễ govern hơn, nhưng vẫn có thể gây hại nếu sai.  
- Guardrails:  
  - rules affecting Tier 3–4 flows hoặc SLA commitments phải được review & approve (SecGov + Product/Ops); [code_file:451]  
  - thay đổi rules liên quan quyết định critical đi qua change governance Pack 06–93;  
  - rules phải được document (inputs, conditions, actions) và versioned (105). [code_file:494]

### 4.2 Scoring & Ranking Models

- Guardrails:  
  - models high-impact phải có mô tả: mục tiêu, features chính, training data window;  
  - maintain feature importance / reason codes để explain scores;  
  - limit auto-action: scores dùng cho ranking/gợi ý, không auto-act trên flows Tier 3–4 trừ khi có cơ chế approval rõ;  
  - periodic evaluation: calibration, bias checks nếu dùng cho customer-facing/treatment decisions.

### 4.3 Pattern Mining & Similarity

- Guardrails:  
  - pattern mining outputs không auto-act;  
  - suggestions phải được labeled là "pattern-based" (không đảm bảo đúng tuyệt đối);  
  - avoid lộ data cross-tenant trong similar cases – chỉ surface patterns aggregated/anonymized; [code_file:482]  
  - manual review của các pattern quan trọng trước khi đưa vào product.

### 4.4 RAG & LLM Assistants

- Guardrails:  
  - RAG chỉ truy cập corpus được phép (SOPs, docs phù hợp);  
  - responses luôn có citations/link tới nguồn;  
  - không dùng LLM để truy cập trực tiếp database các record sensitive;  
  - filters để tránh content không phù hợp;  
  - chỉ gợi ý/draft, không auto-act;  
  - logging prompts/outputs cho audit và cải thiện.

## 5. Approval & review process cho AI use cases

### 5.1 Khi nào cần review chính thức?

Use case cần review chính thức khi:
- risk level medium hoặc high;  
- chạm vào flows Tier 3–4; [code_file:451]  
- ảnh hưởng tới customer-facing metrics/reports;  
- liên quan PII hoặc data nhạy cảm theo chính sách 104. [code_file:482]

### 5.2 Quy trình review (high-level)

1. **Proposal** (Product/Data):  
   - mô tả use case theo template 121 (value, inputs, outputs, risk, guardrails). [code_file:507]  
2. **Risk assessment** (Governance & Risk):  
   - gán risk level;  
   - xác định controls cần (explainability, monitoring, approvals).  
3. **Design review** (Data/Engineering + Product + SecGov):  
   - kiểm tra data sources, features, model/logic pattern (123), UX & copy (125). [code_file:509]  
4. **Pilot plan**:  
   - chọn wedges/tenants pilot;  
   - xác định metrics of success & thời gian.  
5. **Approval**:  
   - cho phép triển khai pilot;  
   - định nghĩa conditions để move từ pilot → GA hoặc rollback.

### 5.3 Document & accountability

- Mỗi use case được approve phải có **AI Use Case Record**:  
  - goal & description;  
  - owners;  
  - risk level;  
  - data & features used;  
  - model/logic pattern;  
  - guardrails;  
  - pilot plan & results.

## 6. Monitoring & incidents cho AI

### 6.1 Monitoring

AI outputs cần được monitor theo nhiều chiều:
- **Performance metrics** – SLA breach rate, incident rate, adoption, time saved…  
- **Quality metrics** – error rate, complaint rate, override rate (users không đồng ý);  
- **Fairness & bias** (nếu applicable) – treatment khác nhau giữa segments/tenants.  

Ứng với mỗi use case, metrics of success đã định trong 121 phải được track. [code_file:507]

### 6.2 AI-related incidents

Một AI-related incident có thể là:
- AI recommendation dẫn tới quyết định sai gây impact đáng kể;  
- AI assistant trả lời sai lệch về policies/terms, gây hiểu nhầm với khách;  
- LLM/RAG reveal data không nên reveal (cross-tenant, sensitive);  
- model drift gây degrade chất lượng nghiêm trọng.

Incident flow:
- classify như **security/data incident** nếu liên quan leakage; hoặc **quality/operations incident** nếu chỉ ảnh hưởng decision quality;  
- follow Pack 06–92 incident playbook: detection, containment, resolution, communication, learning. [code_file:452]  

### 6.3 Rollback & kill switches

- Mỗi AI use case nên có **kill switch**:  
  - disable model outputs (revert to rules hoặc tắt feature);  
  - tạm thời hide recommendations;  
  - fallback to baseline behavior.  
- Rollback plan phải được định nghĩa trong AI Use Case Record.

## 7. User control & transparency

### 7.1 Transparency cho người dùng

- UI nên cho biết khi nào suggestion đến từ AI vs rules & static logic;  
- cung cấp **"Why am I seeing this?"** – tóm tắt high-level factors:  
  - vd "Item này ưu tiên cao vì gần SLA và loại X thường xử lý lâu";  
- với RAG/assistants, hiển thị citations & nguồn.

### 7.2 User control

- Người dùng phải có thể:  
  - bỏ qua suggestions;  
  - undo actions được recommended (khi possible);  
  - gửi feedback (helpful/not helpful, why).  
- Không ép user phải chấp nhận suggestions;  
- không design dark patterns (vd gợi ý một cách mà nhìn như mandatory).

## 8. Data & access controls cho AI components

- AI components chỉ access:  
  - feature tables/views được phép; [code_file:508]  
  - không truy cập trực tiếp raw PII trừ khi đã justified & approved; [code_file:482]  
- Cross-tenant access strictly forbidden cho AI serving SMEs – mọi inference phải within tenant boundaries. [code_file:451][code_file:482]  
- Logging access patterns giống như các component khác;  
- Data used for training/evaluation phải comply với retention policies & anonymization khi cần.

## 9. Liên kết với Packs 06 & 07

- Pack 06:  
  - risk tiers (91) dùng để xác định use cases high-risk; [code_file:451]  
  - change management (93) áp dụng cho deployment/thay đổi AI logic; [code_file:453]  
  - incidents (92) xử lý AI-related incidents. [code_file:452]  

- Pack 07:  
  - data & analytics governance (104) áp dụng cho data AI dùng; [code_file:482]  
  - operations/versioning (105) là baseline cho versioning models & AI logic. [code_file:494]

## 10. Điều kiện hoàn thành của tài liệu

AI Governance, Risk and Guardrails được xem là đạt yêu cầu khi:
- mọi AI use case Pack 08 có thể được gán risk level rõ và guardrails tương ứng; [code_file:507]  
- có quy trình review & approval cụ thể cho use cases medium/high risk;  
- monitoring & incident handling cho AI được gắn vào Pack 06; [code_file:452]  
- AI components tuân thủ data policies Pack 07; [code_file:482]  
- và team Product/Data/Governance có thể sử dụng tài liệu này để nói chuyện rõ ràng với SMEs về việc AI được dùng & bảo vệ như thế nào trong Nextflow OS.
