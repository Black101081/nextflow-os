# Nextflow OS – Pack 08: AI Governance and Risk Management

**Document ID:** 124_PACK08_AI_GOVERNANCE_AND_RISK_MANAGEMENT  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Legal / Data & Intelligence  
**Related docs:** 120 Overview, 129 AI Use Case Record Template

---

## 1. Mục tiêu

Đảm bảo mọi use case AI/ML trên Nextflow OS được deploy và vận hành theo cách:
- Minh bạch với user và customer.
- Có kiểm soát rủi ro rõ ràng.
- Compliant với regulatory requirements (GDPR, AI Act, v.v.).
- Có thể tắt nhanh khi cần (kill switch).

## 2. Risk Level Framework

| Level | Định nghĩa | Ví dụ | Yêu cầu |
|-------|-----------|-------|----------|
| **Low** | Output chỉ là thông tin/gợi ý, không ảnh hưởng trực tiếp đến hành động quan trọng | SLA alert, priority badge | Self-approve by team lead |
| **Medium** | Output ảnh hưởng đến workflow hoặc hành động có thể đảo ngược | Churn score, routing suggestion | Product + Data sign-off |
| **High** | Output ảnh hưởng đến quyết định quan trọng, khó đảo ngược | SLA policy change, auto-billing action | AI Review Board |
| **Critical** | Output ảnh hưởng đến compliance, tài chính lớn, hoặc PII sensitive | Credit risk, regulatory report | AI Review Board + Legal + exec sign-off |

## 3. AI Review Board

- **Thành viên:** Head of Product, Head of Data, Legal Counsel, Security Lead, Engineering Lead.
- **Họp:** Khi có use case High/Critical cần review, tối thiểu 1 lần/quý.
- **Output:** Approve / Approve with conditions / Reject với lý do rõ ràng.
- **Lưu trữ:** Biên bản review trong AI Use Case Record (xem 129).

## 4. Guardrails bắt buộc

### 4.1 Cho mọi use case
- Có AI Use Case Record (129) trước khi deploy.
- Output AI phải được labeled rõ trong UI ("AI-generated", "AI-suggested").
- User luôn có thể override/dismiss mọi recommendation.
- Không auto-action trên dữ liệu tài chính hoặc PII mà không có human-in-the-loop.

### 4.2 Cho use case Medium+
- Định nghĩa rõ kill switch và người có quyền kích hoạt.
- Monitoring dashboard với alert khi output distribution lệch.
- Feedback loop để user báo cáo prediction sai.

### 4.3 Cho use case High/Critical
- Phải qua AI Review Board trước khi deploy production.
- Penetration test và adversarial input testing.
- Data lineage rõ ràng (dữ liệu training từ đâu, cập nhật khi nào).
- Định kỳ audit 6 tháng/lần.

## 5. Kill Switch Protocol

1. Ai có thể kích hoạt: Engineering Lead, Head of Data, hoặc on-call senior.
2. Cách kích hoạt: feature flag trong config → disable model/rule trong vòng <5 phút.
3. Fallback: khi kill switch active, UI hiển thị placeholder thay vì prediction (không crash).
4. Post-mortem: bắt buộc trong vòng 48h sau khi kill switch được dùng.

## 6. Data Privacy & Compliance

- Không dùng PII của customer trong training data trừ khi có consent rõ ràng và được ghi vào AI Use Case Record.
- Dữ liệu training phải được anonymized/pseudonymized ở mức tối thiểu.
- Right to explanation: nếu customer hỏi tại sao bị đánh giá rủi ro cao, system phải có khả năng giải thích (SHAP, rule breakdown).
- Data retention cho training data: theo policy chung của tenant, không quá 24 tháng mặc định.

## 7. Checklist trước khi deploy use case AI mới

- [ ] AI Use Case Record (129) hoàn chỉnh và được approve
- [ ] Risk level được xác định và review tương ứng
- [ ] Kill switch được test
- [ ] Monitoring dashboard setup
- [ ] UI labels "AI-generated" / "AI-suggested" đã có
- [ ] Feedback mechanism đã có
- [ ] Legal review (nếu Medium+)
- [ ] AI Review Board sign-off (nếu High/Critical)
