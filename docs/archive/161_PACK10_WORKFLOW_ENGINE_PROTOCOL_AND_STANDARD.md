# Nextflow OS – Workflow Engine Protocol & Integration Standard

**Document ID:** 161_PACK10_WORKFLOW_ENGINE_PROTOCOL_AND_STANDARD  
**Pack:** 10 — No-code & Workflow Engine  
**Version:** 1.0 (Core Engine Standard)  
**Status:** Active  

Tài liệu này định nghĩa Bộ Tiêu Chuẩn Giao Tiếp (Protocol) cho Rust Workflow Engine. Mọi Module nội bộ (AI, Blockchain) hoặc Ứng dụng bên thứ 3 (Zalo, OpenAI) muốn tham gia vào luồng quy trình của Nextflow OS đều **bắt buộc** phải tuân thủ chuẩn Đầu vào (Input) và Đầu ra (Output) này.

---

## 1. Cấu Trúc Ngữ Cảnh Chạy (Execution Context)

Mỗi lần Workflow được kích hoạt, Engine sẽ sinh ra một `ExecutionContext`. Đây là bộ nhớ đệm (State) luân chuyển qua tất cả các Node. Nó tuân thủ chuẩn JSON.

```json
{
  "variables": {
    "payload": {
      "patient_name": "Nguyen Van A",
      "symptoms": "Đau đầu, chóng mặt"
    },
    "node_1_ai_triage": {
      "severity": "High",
      "recommended_department": "Neurology"
    }
  }
}
```

- Tất cả dữ liệu đầu vào (từ Webhook/Form) được đặt trong biến gốc: `payload`.
- Kết quả trả về của một Node bất kỳ sẽ được tự động lưu vào biến có tên: `node_<node_id>`.

---

## 2. Tiêu Chuẩn Nội Suy Biến (Variable Interpolation)

Các Node không sử dụng dữ liệu tĩnh (hardcoded). Để lấy dữ liệu từ `ExecutionContext`, các tham số của Node sử dụng cú pháp Mustache (kẹp trong dấu `${{ }}`).

**Ví dụ cấu hình Node Gửi Email:**
- Tiêu đề Email: `Cảnh báo bệnh nhân ${{ payload.patient_name }} có rủi ro ${{ node_1_ai_triage.severity }}`

Trình Phân Tích Cú Pháp (Interpolator) của Rust Engine sẽ có trách nhiệm quét chuỗi này và thay thế bằng dữ liệu thực trước khi Node được kích hoạt.

---

## 3. Tiêu Chuẩn Cho Các Magic Node (Node Interface Contract)

Khi lập trình viên viết một Node mới (Ví dụ: `AiPredict`), hàm xử lý của Node đó phải nhận vào Input và trả ra Output theo định dạng chung sau đây.

### A. Định dạng Trả về Thành công (Success Output)
Node phải trả về một Struct (hoặc JSON Value) đại diện cho kết quả. Rust Engine sẽ tự động gán kết quả này vào `ExecutionContext`.
```json
{
  "status": "success",
  "data": {
    "ai_reasoning": "...",
    "score": 0.95
  }
}
```

### B. Định dạng Báo Lỗi (Error Output)
Nếu Node xử lý thất bại (VD: OpenAI mất kết nối), Node phải quăng lỗi theo định dạng chuẩn:
```json
{
  "status": "error",
  "error_code": "EXTERNAL_API_TIMEOUT",
  "message": "Không thể kết nối đến máy chủ OpenAI sau 3 lần thử lại."
}
```
**Quy tắc bắt lỗi (Error Boundary):**
Engine khi nhận được trạng thái `error` sẽ dừng Workflow ngay lập tức và lưu trạng thái thất bại vào `nf_meta.entity_records`, hoặc rẽ luồng sang một Node "Error Handler" nếu có cấu hình.

---

## 4. Tiêu Chuẩn Trình Đánh Giá Điều Kiện (Condition Evaluator)

Khối rẽ nhánh (`NodeType::Condition`) phải sử dụng các Toán tử (Operators) chuẩn mực sau đây:

1. `==` (Bằng)
2. `!=` (Khác)
3. `>` (Lớn hơn)
4. `<` (Nhỏ hơn)
5. `contains` (Chứa chuỗi hoặc phần tử mảng)

**Ví dụ định nghĩa Node:**
```json
{
  "id": "node_2",
  "type": "Condition",
  "field": "${{ node_1_ai_triage.severity }}",
  "operator": "==",
  "value": "High"
}
```
Nếu thỏa mãn, Engine sẽ đi theo con đường (Edge) có `condition_outcome: true`. Nếu không, đi theo `condition_outcome: false`.

---

## 5. Các Mức Độ Tự Động Hóa (Tương lai)

Tài liệu này xác nhận nguyên tắc "Tuần tự trước - Song song sau".
- **V1 (Hiện tại):** Engine chạy Tuần tự (Sequential). Tại một thời điểm chỉ có 1 Node được kích hoạt, tránh tình trạng 2 Node AI cùng ghi đè một dữ liệu (Race condition).
- **V2 (Kế hoạch):** Engine sẽ hỗ trợ thẻ `"parallel_group": "group_A"` trên Node để báo hiệu cho Rust sử dụng Async/Tokio chạy song song đa luồng.
