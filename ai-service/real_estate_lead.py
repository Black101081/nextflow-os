"""
Real Estate – Lead Scoring AI Agent
==================================
Score and classify real estate leads based on budget, interaction, source and urgency.
"""

from typing import Dict, Any, Optional

class RealEstateLeadScoringAgent:
    def __init__(self, gemini_client = None):
        self.client = gemini_client

    def score(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Tính điểm Lead Score (0 - 100) dựa trên thông tin lead thật.
        """
        budget_vnd = float(lead_data.get("budget_vnd", 0))
        interaction_count = int(lead_data.get("interaction_count", 0))
        source = lead_data.get("source", "unknown").lower()
        property_type = lead_data.get("property_type", "").strip()
        response_urgency = lead_data.get("urgency", "medium").lower()

        score = 0
        
        # 1. Budget Score (max 25)
        if budget_vnd >= 5_000_000_000: # > 5 billion
            score += 25
        elif budget_vnd >= 2_000_000_000: # 2 - 5 billion
            score += 20
        elif budget_vnd >= 1_000_000_000: # 1 - 2 billion
            score += 15
        elif budget_vnd > 0:
            score += 5

        # 2. Interaction Score (max 25)
        score += min(interaction_count * 5, 25)

        # 3. Source Score (max 20)
        if source in ["referral", "direct"]:
            score += 20
        elif source in ["website", "search_ad"]:
            score += 15
        elif source in ["facebook", "social"]:
            score += 10
        else:
            score += 5

        # 4. Property Type Specifity (max 15)
        if property_type:
            score += 15

        # 5. Urgency Score (max 15)
        if response_urgency == "high":
            score += 15
        elif response_urgency == "medium":
            score += 10
        else:
            score += 5

        # Cap score
        score = min(max(score, 0), 100)

        # Classification
        if score >= 80:
            classification = "HOT"
            action = "Liên hệ ngay lập tức trong vòng 15 phút. Lead có ngân sách lớn và nhu cầu rất cao."
        elif score >= 50:
            classification = "WARM"
            action = "Liên hệ trong ngày. Đưa vào kịch bản chăm sóc qua Zalo/Email."
        else:
            classification = "COLD"
            action = "Đưa vào luồng gửi tin tự động (nurturing sequence) hàng tuần."

        return {
            "score": score,
            "classification": classification,
            "recommended_action": action,
            "breakdown": {
                "budget_score": min(budget_vnd / 200_000_000, 25.0) if budget_vnd < 5_000_000_000 else 25.0,
                "interaction_score": min(interaction_count * 5, 25),
                "source_score": 20 if source in ["referral", "direct"] else 10,
                "urgency_score": 15 if response_urgency == "high" else 10
            }
        }
