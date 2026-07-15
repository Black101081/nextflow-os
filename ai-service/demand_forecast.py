"""
Retail & F&B – Demand Forecasting AI Agent
===========================================
Time-series moving average and exponential smoothing forecast for restock optimization.
"""

from typing import List, Dict, Any

class DemandForecastingAgent:
    def __init__(self, gemini_client = None):
        self.client = gemini_client

    def forecast(self, historical_sales: List[float], horizon: int = 7) -> Dict[str, Any]:
        """
        Tính toán dự báo nhu cầu bán hàng cho chuỗi ngày tiếp theo.
        """
        if not historical_sales:
            return {"forecast": [], "confidence_interval": [], "recommendation": "Không có dữ liệu lịch sử để dự báo."}

        n = len(historical_sales)
        
        # 1. Simple Moving Average (SMA) / Exponential Smoothing (α=0.3)
        alpha = 0.3
        forecast_values = []
        
        # Initial level is the average of historical sales
        level = sum(historical_sales) / n
        
        for t in range(horizon):
            # Exp smoothing calculation: L_t = alpha * Y_t + (1-alpha) * L_{t-1}
            # For future steps where Y_t is unknown, we use the forecast value L_{t-1}
            forecast_val = level
            forecast_values.append(round(forecast_val, 2))
            
        # 2. Confidence Interval (95% CI based on Standard Deviation)
        mean_sales = sum(historical_sales) / n
        variance = sum((x - mean_sales) ** 2 for x in historical_sales) / max(n - 1, 1)
        std_dev = variance ** 0.5
        
        confidence_intervals = []
        for f in forecast_values:
            margin = 1.96 * std_dev
            confidence_intervals.append({
                "lower": round(max(f - margin, 0.0), 2),
                "upper": round(f + margin, 2)
            })

        # 3. Recommendations
        total_forecasted = sum(forecast_values)
        if total_forecasted > mean_sales * horizon * 1.2:
            recommendation = f"Nhu cầu dự kiến tăng cao đột biến ({total_forecasted:.1f} đơn vị). Khuyến nghị tăng lượng nhập kho thêm 20%."
        elif total_forecasted < mean_sales * horizon * 0.8:
            recommendation = f"Nhu cầu dự kiến giảm sâu. Khuyến nghị xả hàng hoặc chạy chương trình khuyến mãi giảm tồn kho."
        else:
            recommendation = f"Nhu cầu ổn định. Khuyến nghị duy trì mức tồn kho an toàn tiêu chuẩn ({mean_sales * 1.5:.1f} đơn vị)."

        return {
            "forecast": forecast_values,
            "confidence_intervals": confidence_intervals,
            "mean_historical": round(mean_sales, 2),
            "std_deviation": round(std_dev, 2),
            "recommendation": recommendation
        }
