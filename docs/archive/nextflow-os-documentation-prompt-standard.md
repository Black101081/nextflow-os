# Nextflow OS – Documentation Prompt Standard

## 1. Quy tắc chốt

Trong documentation stack của Nextflow OS, **mỗi tài liệu phải kết thúc bằng một phần prompt chi tiết cho AI** để AI có thể đọc đúng tài liệu đó và thực hiện công việc liên quan ngay lập tức. [cite:257][cite:293][cite:294] Phần prompt này không phải nội dung bổ sung tùy chọn, mà phải được coi là một phần bắt buộc của cấu trúc tài liệu chuẩn. [cite:117][cite:172]

Điều này có nghĩa là tài liệu không chỉ dùng để con người đọc, mà còn là **hợp đồng thực thi** cho AI coder, AI analyst, AI reviewer, AI QA hoặc AI operations agent. [cite:293][cite:295] Khi một tài liệu đã đủ tốt để người đọc hiểu nhưng chưa đủ rõ để AI thực hiện việc tiếp theo, tài liệu đó vẫn chưa hoàn thành theo chuẩn của Nextflow OS. [cite:172][cite:257]

## 2. Vì sao quy tắc này quan trọng

Cách làm này giúp loại bỏ việc phải quay lại viết prompt riêng sau khi tài liệu đã hoàn thành. [cite:294] Nó cũng giúp documentation trở thành một hệ thống thực thi liên tục: người đọc hiểu tài liệu, còn AI nhận ngay ngữ cảnh, nhiệm vụ, ràng buộc, output format và acceptance criteria để làm việc tiếp. [cite:257][cite:293]

Với một sản phẩm lớn như Nextflow OS, đây là cách giảm mạnh thất thoát ngữ cảnh giữa các vai trò: product, architect, coder, QA, support và partner delivery. [cite:117][cite:172] Nó cũng phù hợp với mục tiêu xây một bộ tài liệu production-grade, có thể dùng trực tiếp để sinh implementation, test pack, review pack hoặc rollout checklist. [cite:117][cite:295]

## 3. Quy tắc áp dụng cho toàn bộ documentation stack

Quy tắc này phải áp dụng cho **mọi nhóm tài liệu**, không chỉ tài liệu kỹ thuật. [cite:257][cite:293] Cụ thể:

- Tài liệu chiến lược có prompt cho AI research/strategy agent.
- Tài liệu sản phẩm có prompt cho product/spec agent.
- Tài liệu UX có prompt cho design/frontend agent.
- Tài liệu kiến trúc có prompt cho architect/backend agent.
- Tài liệu implementation có prompt cho coder/AG.
- Tài liệu QA có prompt cho QA/review agent.
- Tài liệu vận hành có prompt cho DevOps/SRE/support agent.
- Tài liệu thương mại có prompt cho sales/presales/partner enablement agent. [cite:257][cite:294]

Nói cách khác, **mỗi tài liệu phải tự mang theo “bước tiếp theo có thể thi hành được”**. [cite:293] Đây là điểm khác biệt giữa documentation chỉ để lưu trữ tri thức và documentation được thiết kế để kích hoạt thực thi. [cite:172]

## 4. Vị trí và cấu trúc bắt buộc

Phần prompt phải nằm **ở cuối tài liệu**, không tách ra file riêng, để tránh phân mảnh và tránh thất lạc ngữ cảnh. [cite:293] Cách này cũng phù hợp với yêu cầu của anh là “prompt ở cuối file luôn cho đỡ lằng nhằng”. [cite:293]

Mỗi tài liệu chuẩn nên có cấu trúc như sau:

1. **Header metadata** – document ID, pack, version, status, owner.
2. **Main body** – nội dung chính dành cho người đọc.
3. **Execution prompt section** – phần prompt cho AI ở cuối file. [cite:257][cite:293]

## 5. Tên section chuẩn

Để toàn bộ repo tài liệu thống nhất, phần cuối nên dùng một trong các heading chuẩn sau:

- `## AI Execution Prompt`
- `## AG Execution Prompt`
- `## AI Implementation Prompt`
- `## AI Review Prompt`

Khuyến nghị tốt nhất cho Nextflow OS là dùng thống nhất **`## AG Execution Prompt`** cho prompt thực thi chính. [cite:257] Với các tài liệu cần nhiều loại AI hơn, có thể dùng thêm:

- `## QA Review Prompt`
- `## Security Review Prompt`
- `## Operations Prompt`

Tuy nhiên, tài liệu nào cũng phải có ít nhất **một prompt chính** ở cuối. [cite:293][cite:294]

## 6. Nội dung bắt buộc của prompt

Một prompt ở cuối tài liệu không nên viết chung chung kiểu “hãy thực hiện theo tài liệu trên”. [cite:172] Nó phải đủ cấu trúc để AI làm việc ổn định và ít hiểu sai. [cite:276]

Mỗi prompt nên có các phần bắt buộc sau:

- **Role** – AI đang đóng vai trò gì.
- **Context** – tài liệu này thuộc sản phẩm nào, pack nào, phạm vi nào.
- **Objective** – mục tiêu phải đạt.
- **Inputs** – AI được phép dùng những gì.
- **Tasks** – danh sách công việc cụ thể.
- **Constraints** – điều cấm, giới hạn, nguyên tắc kiến trúc, nguyên tắc chất lượng.
- **Output format** – AI phải xuất ra gì, theo định dạng nào.
- **Acceptance criteria** – thế nào là hoàn thành đúng.
- **Non-goals** – điều không được làm lan ra ngoài phạm vi. [cite:257][cite:276][cite:295]

## 7. Prompt template chuẩn

Dưới đây là template chuẩn nên dùng ở cuối mỗi tài liệu:

```md
## AG Execution Prompt

You are acting as a senior [role].

### Context
- Product: Nextflow OS
- Document: [document name]
- Pack: [pack name]
- Objective: [what this document is trying to achieve]
- Scope: [in-scope items]
- Out of scope: [non-goals]

### Inputs
- Use this document as the primary source of truth.
- Use related documents only if explicitly referenced.
- Do not invent requirements that contradict this document.

### Tasks
1. [Task 1]
2. [Task 2]
3. [Task 3]

### Constraints
- Preserve the architecture and terminology defined in this document.
- Do not output mockups, placeholders, stubs, or vague outlines.
- Produce production-grade artifacts only.
- Flag ambiguities explicitly instead of guessing hidden business logic.

### Output Format
- Return [artifact types].
- Use Markdown / JSON / SQL / OpenAPI / code as required.
- Structure the output so it can be handed directly to implementation or review.

### Acceptance Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
```

Template này có thể tái sử dụng cho mọi nhóm tài liệu, chỉ cần đổi role, task, output format và acceptance criteria. [cite:257][cite:276]

## 8. Prompt theo từng nhóm tài liệu

### 8.1 Strategy & Positioning

Prompt cuối tài liệu nên yêu cầu AI:
- tổng hợp market insight,
- kiểm tra logic định vị,
- so sánh với competitor shape,
- đề xuất refinement cho ICP, wedge hoặc pricing hypothesis. [cite:200]

### 8.2 Product & Capability

Prompt nên yêu cầu AI:
- chuẩn hóa capability boundary,
- tạo feature matrix,
- kiểm tra dependency giữa engines,
- sinh acceptance checklist ở mức sản phẩm. [cite:170]

### 8.3 Experience & UX

Prompt nên yêu cầu AI:
- tạo screen map,
- sinh wireframe low-fi,
- viết UI spec chi tiết,
- kiểm tra consistency giữa flows và role-based access. [cite:117]

### 8.4 Architecture & Core Design

Prompt nên yêu cầu AI:
- sinh service contracts,
- kiểm tra boundary,
- đề xuất ADR,
- kiểm tra tính nhất quán giữa workflow, domain model và policy layer. [cite:170]

### 8.5 Engineering Implementation

Prompt nên yêu cầu AI:
- sinh code scaffolding,
- viết API/DB/event spec,
- tạo test skeleton,
- xuất implementation plan theo module. [cite:276]

### 8.6 Integration & Data

Prompt nên yêu cầu AI:
- sinh mapping tables,
- viết connector contract,
- tạo migration checklist,
- sinh reconciliation logic hoặc import validation logic. [cite:174]

### 8.7 Quality, Security & Compliance

Prompt nên yêu cầu AI:
- tạo test case library,
- chạy requirement-to-test traceability,
- sinh threat model,
- viết release acceptance checklist. [cite:117]

### 8.8 Deployment, Operations & Support

Prompt nên yêu cầu AI:
- viết runbook,
- sinh dashboard/alert list,
- chuẩn hóa incident response,
- tạo troubleshooting matrix. [cite:172]

### 8.9 Sales, Enablement & Delivery

Prompt nên yêu cầu AI:
- viết demo script,
- chuẩn hóa sales narrative,
- tạo proposal outline,
- sinh onboarding checklist cho partner hoặc customer success. [cite:200]

## 9. Một tài liệu có thể có nhiều prompt không

Có thể, nhưng phải có trật tự. [cite:293] Một tài liệu có thể có:
- **1 prompt chính** ở cuối file, bắt buộc;
- **1–2 prompt phụ** nếu thật sự cần, ví dụ QA Review Prompt hoặc Security Review Prompt. [cite:293]

Không nên biến cuối tài liệu thành một “rừng prompt”. [cite:172] Nếu cần quá nhiều prompt khác nhau, đó thường là dấu hiệu tài liệu đang ôm quá nhiều mục tiêu và nên được tách thành nhiều file nhỏ hơn. [cite:117]

## 10. Quy tắc chất lượng cho prompt

Prompt ở cuối tài liệu chỉ được coi là đạt chuẩn khi thỏa cả 6 điều sau:

1. **Bám đúng phạm vi tài liệu**.
2. **Đủ chi tiết để AI thực thi mà không cần hỏi lại quá nhiều**. [cite:173][cite:257]
3. **Có ràng buộc chất lượng rõ ràng**. [cite:172]
4. **Không mâu thuẫn với phần nội dung chính của tài liệu**.
5. **Có output format kiểm chứng được**. [cite:276]
6. **Có acceptance criteria rõ ràng**. [cite:276]

## 11. Quyết định chốt cho documentation stack

Từ thời điểm này, mọi tài liệu mới trong documentation stack của Nextflow OS nên tuân theo quy tắc sau:

> **Mỗi tài liệu phải khép lại bằng một AG Execution Prompt chi tiết, đủ để một AI phù hợp có thể đọc tài liệu đó và thực hiện ngay công việc tiếp theo ở mức production-grade.** [cite:257][cite:293][cite:294]

Quy tắc này nên được ghi vào standards chung của repo tài liệu và được áp dụng nhất quán cho mọi pack. [cite:117][cite:293] Đây là cách biến documentation stack của Nextflow OS thành một hệ thống vừa để đọc, vừa để thi hành, vừa để mở rộng bằng AI mà không cần viết lại prompt từ đầu cho từng lần sử dụng. [cite:172][cite:295]
