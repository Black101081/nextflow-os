"""
Pharmacy & Healthcare – Drug Interaction AI Agent
=================================================
Lookup and analysis of dangerous drug-drug interactions.
"""

import os
import json
from typing import List, Dict, Any, Optional

# Database of real, common drug-drug interactions
DRUG_INTERACTION_DB = [
    {
        "drugs": {"aspirin", "warfarin"},
        "severity": "MAJOR",
        "description": "Tăng nguy cơ xuất huyết nghiêm trọng. Cả hai thuốc đều làm giảm khả năng đông máu."
    },
    {
        "drugs": {"sildenafil", "nitroglycerin"},
        "severity": "CONTRAINDICATED",
        "description": "Chống chỉ định tuyệt đối. Gây hạ huyết áp đột ngột và đe dọa tính mạng."
    },
    {
        "drugs": {"ibuprofen", "aspirin"},
        "severity": "MODERATE",
        "description": "Làm tăng nguy cơ loét và chảy máu dạ dày. Ibuprofen cũng có thể làm giảm tác dụng bảo vệ tim mạch của Aspirin liều thấp."
    },
    {
        "drugs": {"simvastatin", "amiodarone"},
        "severity": "MAJOR",
        "description": "Tăng nguy cơ tiêu cơ vân (nhiễm độc cơ vân) do Amiodarone làm tăng nồng độ Simvastatin trong máu."
    },
    {
        "drugs": {"clopidogrel", "omeprazole"},
        "severity": "MODERATE",
        "description": "Omeprazole làm giảm hoạt tính và hiệu quả ngăn ngừa huyết khối của Clopidogrel."
    },
    {
        "drugs": {"spironolactone", "lisinopril"},
        "severity": "MAJOR",
        "description": "Nguy cơ tăng kali máu nghiêm trọng, có thể dẫn đến rối loạn nhịp tim nguy hiểm."
    },
    {
        "drugs": {"amoxicillin", "methotrexate"},
        "severity": "MODERATE",
        "description": "Amoxicillin làm giảm thải trừ Methotrexate qua thận, làm tăng độc tính của Methotrexate."
    }
]

class PharmacyDrugInteractionAgent:
    def __init__(self, gemini_client = None):
        self.client = gemini_client

    def lookup_local_interactions(self, medicines: List[str]) -> List[Dict[str, Any]]:
        found = []
        normalized_meds = {m.strip().lower() for m in medicines}
        
        # Check all pairs
        for interaction in DRUG_INTERACTION_DB:
            # Check if both drugs are in normalized_meds
            if interaction["drugs"].issubset(normalized_meds):
                found.append({
                    "severity": interaction["severity"],
                    "drugs": list(interaction["drugs"]),
                    "description": interaction["description"]
                })
        return found

    async def check(self, prescription_id: str, medicines: List[Dict[str, Any]]) -> Dict[str, Any]:
        med_names = [m.get("name", "") for m in medicines if m.get("name")]
        warnings = self.lookup_local_interactions(med_names)
        
        ai_assessment = ""
        is_safe = len(warnings) == 0
        
        # Call Gemini if client is active
        if self.client:
            try:
                meds_str = ", ".join([f"{m.get('name')} ({m.get('dosage', 'N/A')})" for m in medicines])
                prompt = f"""
                Bạn là dược sĩ lâm sàng AI. Hãy phân tích các thuốc sau trong đơn thuốc:
                {meds_str}
                
                Nêu rõ các tương tác thuốc nguy hiểm (nếu có), mức độ nghiêm trọng và khuyến cáo cho bác sĩ.
                Trả lời ngắn gọn, trực diện, bằng tiếng Việt.
                """
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                ai_assessment = response.text.strip()
            except Exception as e:
                print(f"[Drug Interaction Agent] Gemini error: {e}")
                ai_assessment = "Không thể kết nối AI Cloud để phân tích sâu hơn. Đang dùng cảnh báo từ cơ sở dữ liệu nội bộ."

        # If no AI response, compile local descriptions
        if not ai_assessment:
            if warnings:
                ai_assessment = "Phát hiện tương tác thuốc nguy hiểm trong đơn thuốc:\n" + "\n".join([f"- [{w['severity']}] {w['description']}" for w in warnings])
            else:
                ai_assessment = "Đơn thuốc an toàn. Không phát hiện tương tác nguy hiểm trong cơ sở dữ liệu."

        return {
            "prescription_id": prescription_id,
            "safe": is_safe,
            "warnings": [w["description"] for w in warnings],
            "ai_assessment": ai_assessment,
            "requires_pharmacist_review": not is_safe or any(w["severity"] in ["MAJOR", "CONTRAINDICATED"] for w in warnings)
        }
