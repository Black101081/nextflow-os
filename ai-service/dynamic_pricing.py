"""
Hospitality – Dynamic Pricing AI Agent
======================================
Occupancy-based and demand-driven dynamic pricing model for room rates.
"""

from typing import Dict, Any

class DynamicPricingAgent:
    def __init__(self, gemini_client = None):
        self.client = gemini_client

    def calculate_price(self, base_price: float, occupancy_rate: float, competitor_price: float, is_weekend: bool = False) -> Dict[str, Any]:
        """
        Tính toán giá phòng linh hoạt dựa trên occupancy và giá đối thủ cạnh tranh.
        """
        adjusted_price = base_price
        reasons = []

        # 1. Occupancy adjustments
        if occupancy_rate >= 90.0:
            adjusted_price *= 1.35
            reasons.append("Tỷ lệ lấp đầy phòng rất cao (>=90%), tăng giá 35% để tối ưu doanh thu.")
        elif occupancy_rate >= 75.0:
            adjusted_price *= 1.15
            reasons.append("Tỷ lệ lấp đầy phòng cao (>=75%), tăng giá 15% do khan hiếm phòng.")
        elif occupancy_rate <= 30.0:
            adjusted_price *= 0.85
            reasons.append("Tỷ lệ lấp đầy phòng thấp (<=30%), giảm giá 15% để thu hút khách đặt phòng.")
        else:
            reasons.append("Tỷ lệ lấp đầy phòng trung bình, giữ giá cơ bản.")

        # 2. Weekend markup
        if is_weekend:
            adjusted_price *= 1.10
            reasons.append("Phụ thu cuối tuần (Thứ 7 / Chủ Nhật) tăng 10%.")

        # 3. Competitor price matching rule
        price_diff_percent = ((competitor_price - adjusted_price) / adjusted_price) * 100.0
        
        # If competitor is much cheaper, we drop price slightly to stay competitive (but not below 80% of base)
        if price_diff_percent < -15.0:
            min_allowed = base_price * 0.80
            new_price = max(adjusted_price * 0.90, min_allowed)
            if new_price < adjusted_price:
                adjusted_price = new_price
                reasons.append("Giá đối thủ thấp hơn >15%. Điều chỉnh giảm nhẹ 10% để cạnh tranh nhưng đảm bảo biên lợi nhuận tối thiểu.")

        # Round to nearest 1,000 VND
        final_price = round(adjusted_price, -3)

        return {
            "base_price": base_price,
            "suggested_price": final_price,
            "occupancy_rate": occupancy_rate,
            "competitor_price": competitor_price,
            "price_change_percent": round(((final_price - base_price) / base_price) * 100.0, 1),
            "reasons": reasons
        }
