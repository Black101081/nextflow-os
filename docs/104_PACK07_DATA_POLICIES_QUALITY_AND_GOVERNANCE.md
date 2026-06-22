# Nextflow OS – Pack 07 Data Policies, Quality and Governance

**Document ID:** 104_PACK07_DATA_POLICIES_QUALITY_AND_GOVERNANCE  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  

## 1. Data classes

| Class | Ví dụ | Handling |
|-------|---------|----------|
| Public | Aggregate KPIs | Không hạn chế |
| Internal | Ticket details, agent metrics | Internal only |
| Confidential | Customer PII, financials | Encrypted, access log |
| Restricted | Legal, HR, security data | Need-to-know + approval |

## 2. Data quality framework

- **Completeness**: tỷ lệ null < 1% cho key fields.  
- **Accuracy**: reconcile với source mỗi tuần.  
- **Timeliness**: refresh đúng SLA (1h, 24h… tùy table).  
- **Consistency**: càc fact tables phải cho kết quả nhất quán khi join.  

## 3. Data stewardship

- Mỗi domain (CS, Ops, Finance…) có một **Data Steward** chịu trách nhiệm chất lượng và policy.  
- Steward review hàng tháng: quality metrics, access logs, incidents.  

## 4. Liên kết với Pack 06 & 08

- Data incidents follow Pack 06 incident playbook.  
- Pack 08 models phải kên khai rõ các data classes nào họ sử dụng (trong AI Use Case Record 129).  
