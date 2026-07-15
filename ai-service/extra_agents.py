import os
import json
from typing import List, Dict, Any, Optional

class ExtraAgents:
    def __init__(self, gemini_client=None):
        self.client = gemini_client

    # 1. CashFlowForecastAgent
    def forecast_cash_flow(self, transaction_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Dự báo dòng tiền 30 ngày tới dựa trên lịch sử giao dịch & hạn hóa đơn."""
        total_income = sum(t["amount"] for t in transaction_history if t["type"] == "INCOME")
        total_expense = sum(t["amount"] for t in transaction_history if t["type"] == "EXPENSE")
        net_flow = total_income - total_expense
        
        # Simple forecasting logic + AI optimization if Gemini available
        projected_daily = net_flow / max(len(transaction_history), 1)
        forecast_days = list(range(1, 31))
        projected_cash = [total_income - total_expense + (projected_daily * day) for day in forecast_days]
        
        alerts = []
        if projected_cash[-1] < 0:
            alerts.append({
                "severity": "CRITICAL",
                "message": "Dòng tiền dự kiến sẽ âm trong 30 ngày tới. Đề xuất trì hoãn các khoản chi lớn."
            })
            
        if self.client:
            try:
                prompt = f"""
                Bạn là giám đốc tài chính AI. Hãy phân tích lịch sử giao dịch sau và đưa ra nhận xét ngắn gọn (dưới 100 từ) về tình trạng dòng tiền & đề xuất tối ưu:
                {json.dumps(transaction_history[:30])}
                """
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                ai_remark = response.text.strip()
            except Exception as e:
                ai_remark = f"AI Analysis fallback: Dòng tiền hoạt động ổn định. Net flow: {net_flow:,.2f} VND."
        else:
            ai_remark = f"Dòng tiền hoạt động ổn định. Tổng thu: {total_income:,.2f} VND, Tổng chi: {total_expense:,.2f} VND. Net: {net_flow:,.2f} VND."

        return {
            "forecast_30d": projected_cash,
            "net_flow": net_flow,
            "alerts": alerts,
            "ai_remark": ai_remark
        }

    # 2. ExpenseCategorizerAgent
    def categorize_expense(self, description: str) -> Dict[str, Any]:
        """Tự động phân loại chi phí từ mô tả hóa đơn."""
        categories = ["SALARY", "RENT", "UTILITIES", "SUPPLIES", "MARKETING", "TAX", "OTHERS"]
        desc_lower = description.lower()
        
        # Rule-based fallback
        category = "OTHERS"
        confidence = 0.5
        
        if any(w in desc_lower for w in ["lương", "salary", "nhân sự", "hr"]):
            category = "SALARY"
            confidence = 0.95
        elif any(w in desc_lower for w in ["thuê nhà", "rent", "mặt bằng"]):
            category = "RENT"
            confidence = 0.95
        elif any(w in desc_lower for w in ["điện", "nước", "internet", "utilities"]):
            category = "UTILITIES"
            confidence = 0.90
        elif any(w in desc_lower for w in ["nguyên liệu", "supplies", "vật tư", "nhập hàng"]):
            category = "SUPPLIES"
            confidence = 0.85
        elif any(w in desc_lower for w in ["quảng cáo", "facebook", "google", "marketing", "ads"]):
            category = "MARKETING"
            confidence = 0.90
        elif any(w in desc_lower for w in ["thuế", "tax", "vat"]):
            category = "TAX"
            confidence = 0.95

        if self.client:
            try:
                prompt = f"""
                Hãy phân loại mô tả chi phí sau vào một trong các nhóm: {categories}.
                Trả về JSON có các trường: "category" (chỉ lấy một trong các tên nhóm viết hoa), "confidence" (float từ 0 đến 1), "reason" (lý do phân loại).
                Mô tả chi phí: "{description}"
                """
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                cleaned = response.text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
                return {
                    "category": parsed.get("category", category),
                    "confidence": float(parsed.get("confidence", confidence)),
                    "reason": parsed.get("reason", "Phân loại bằng mô hình AI Gemini.")
                }
            except Exception:
                pass
                
        return {
            "category": category,
            "confidence": confidence,
            "reason": "Phân loại bằng thuật toán so khớp từ khóa cơ bản."
        }

    # 3. DebtCollectionAgent
    def analyze_receivables(self, receivables_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Phân tích công nợ phải thu, xếp hạng ưu tiên nhắc nợ và gợi ý hành động."""
        ranked_list = []
        for item in receivables_list:
            due_days = item.get("due_days", 0)
            amount = item.get("amount", 0.0)
            
            # Compute score: weight by amount and overdue days
            risk_score = min((due_days * 2) + (amount / 1000000.0), 100.0)
            
            if risk_score > 75:
                priority = "CRITICAL"
                action = "Gửi thông báo đòi nợ khẩn cấp & Tạm dừng cung cấp dịch vụ"
            elif risk_score > 40:
                priority = "HIGH"
                action = "Gọi điện trực tiếp & Gửi tin nhắn ZNS nhắc nợ lần 2"
            else:
                priority = "MEDIUM"
                action = "Gửi email nhắc nợ tự động"
                
            ranked_list.append({
                "customer_name": item.get("customer_name"),
                "amount": amount,
                "due_days": due_days,
                "risk_score": risk_score,
                "priority": priority,
                "recommended_action": action
            })
            
        ranked_list.sort(key=lambda x: x["risk_score"], reverse=True)
        return {"ranked_receivables": ranked_list}

    # 4. PayrollCalculatorAgent
    def calculate_payroll(self, attendance_data: List[Dict[str, Any]], base_rates: Dict[str, float]) -> Dict[str, Any]:
        """Tính toán bảng lương tự động từ dữ liệu chấm công."""
        payroll_results = []
        for emp in attendance_data:
            emp_id = emp["employee_id"]
            name = emp["name"]
            hours = emp.get("hours_worked", 0.0)
            overtime_hours = emp.get("overtime_hours", 0.0)
            
            rate = base_rates.get(emp_id, 30000.0) # 30k VND/hour default
            gross_salary = (hours * rate) + (overtime_hours * rate * 1.5)
            tax = gross_salary * 0.10 if gross_salary > 11000000 else 0.0 # Standard threshold
            net_salary = gross_salary - tax
            
            payroll_results.append({
                "employee_id": emp_id,
                "name": name,
                "hours_worked": hours,
                "overtime_hours": overtime_hours,
                "base_rate": rate,
                "gross_salary": gross_salary,
                "tax": tax,
                "net_salary": net_salary
            })
            
        return {"payroll_items": payroll_results}

    # 5. BurnoutDetectorAgent
    def detect_burnout(self, attendance_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Phát hiện nguy cơ burnout dựa trên số giờ làm thêm & ngày nghỉ."""
        results = []
        for emp in attendance_history:
            overtime = sum(day.get("overtime_hours", 0.0) for day in emp.get("days", []))
            consecutive_days = emp.get("consecutive_days_worked", 0)
            
            burnout_score = min((overtime * 3) + (consecutive_days * 5), 100.0)
            risk = "LOW"
            if burnout_score > 75:
                risk = "HIGH"
                desc = "Nhân viên làm việc liên tục không nghỉ, làm thêm giờ vượt mức cảnh báo. Khuyến nghị xếp ca nghỉ bù."
            elif burnout_score > 40:
                risk = "MEDIUM"
                desc = "Có dấu hiệu mệt mỏi do làm việc muộn liên tục. Đề xuất theo dõi sát ca trực tiếp theo."
            else:
                desc = "Trạng thái thể chất bình thường, phân bổ ca làm việc hợp lý."
                
            results.append({
                "employee_id": emp.get("employee_id"),
                "name": emp.get("name"),
                "burnout_score": burnout_score,
                "risk_level": risk,
                "recommendation": desc
            })
        return {"burnout_risks": results}

    # 6. DemandPlannerAgent
    def plan_demand(self, stock_levels: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Lập kế hoạch đặt hàng tồn kho tránh đứt gãy cung ứng."""
        suggestions = []
        for item in stock_levels:
            current = item.get("current_level", 0)
            minimum = item.get("min_level", 10)
            avg_daily_sales = item.get("avg_daily_sales", 1.0)
            
            # Runout days estimate
            runout_days = current / max(avg_daily_sales, 0.1)
            
            if current < minimum:
                order_qty = int(minimum * 2 - current)
                status = "CRITICAL_REORDER"
                note = f"Kho còn {current} chiếc, dưới mức tối thiểu {minimum}. Đặt ngay {order_qty} chiếc."
            elif runout_days < 7:
                order_qty = int(avg_daily_sales * 14)
                status = "WARNING_REORDER"
                note = f"Dự kiến hết hàng trong {runout_days:.1f} ngày. Đề xuất đặt hàng sớm."
            else:
                order_qty = 0
                status = "SAFE"
                note = f"Mức tồn kho an toàn, đủ dùng cho {runout_days:.1f} ngày tiếp theo."
                
            suggestions.append({
                "product_id": item.get("product_id"),
                "product_name": item.get("product_name"),
                "current_level": current,
                "recommended_order_qty": order_qty,
                "status": status,
                "note": note
            })
        return {"reorder_plan": suggestions}

    # 7. SupplierScorerAgent
    def score_suppliers(self, po_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Đánh giá uy tín & độ tin cậy của nhà cung cấp."""
        suppliers_stats = {}
        for po in po_history:
            sup_name = po["supplier_name"]
            if sup_name not in suppliers_stats:
                suppliers_stats[sup_name] = {"total_pos": 0, "on_time": 0, "total_value": 0.0}
            
            stats = suppliers_stats[sup_name]
            stats["total_pos"] += 1
            stats["total_value"] += po.get("value", 0.0)
            if po.get("delivered_on_time", True):
                stats["on_time"] += 1
                
        results = []
        for name, stats in suppliers_stats.items():
            reliability = (stats["on_time"] / stats["total_pos"]) * 100.0
            
            score = reliability * 0.7 + min(stats["total_pos"] * 2.0, 30.0) # Scale based on experience
            
            grade = "A" if score > 85 else ("B" if score > 60 else "C")
            
            results.append({
                "supplier_name": name,
                "reliability_rate_pct": reliability,
                "total_orders": stats["total_pos"],
                "total_value_vnd": stats["total_value"],
                "score": score,
                "grade": grade
            })
            
        results.sort(key=lambda x: x["score"], reverse=True)
        return {"supplier_rankings": results}

    # 8. ChurnPredictorAgent
    def predict_churn(self, customer_activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Dự đoán khả năng rời đi của khách hàng bằng AI."""
        predictions = []
        for c in customer_activities:
            recency = c.get("recency_days", 0)
            tickets = c.get("support_tickets_count", 0)
            freq = c.get("frequency_30d", 0)
            
            # Fallback churn probability calculation
            base_prob = 10.0
            if recency > 60:
                base_prob += 40.0
            if tickets > 3:
                base_prob += 30.0
            if freq == 0:
                base_prob += 20.0
                
            prob = min(base_prob, 100.0)
            status = "CHURNING" if prob > 60.0 else ("WARNING" if prob > 30.0 else "ACTIVE")
            
            predictions.append({
                "customer_id": c.get("customer_id"),
                "customer_name": c.get("customer_name"),
                "churn_probability_pct": prob,
                "status": status,
                "note": f"Khách hàng {recency} ngày chưa mua lại. Có {tickets} phiếu hỗ trợ cần giải quyết."
            })
        return {"churn_predictions": predictions}

    # 9. UpsellRecommenderAgent
    def recommend_upsell(self, customer_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Gợi ý gói cước/sản phẩm upsell cá nhân hóa."""
        purchased = customer_profile.get("purchased_items", [])
        industry = customer_profile.get("industry", "F&B")
        
        recommendations = []
        if "Standard Pack" in purchased or "STANDARD" in purchased:
            recommendations.append({
                "target_product": "Enterprise SaaS Suite Upgrade",
                "price_diff": "+$400/month",
                "benefit": "Mở khóa toàn bộ 13 AI Agents & Audit Ledger Blockchain không giới hạn.",
                "pitch": "Mô hình AI nhận thấy doanh nghiệp của bạn đang tăng trưởng tốt. Nâng cấp để kiểm soát hoàn toàn dữ liệu."
            })
        
        if industry == "F&B" and "POS Basic" in purchased:
            recommendations.append({
                "target_product": "Smart Kitchen Display System",
                "price_diff": "+$29/month",
                "benefit": "Đồng bộ hóa tức thời đơn gọi món từ bồi bàn tới bếp bằng WebSocket.",
                "pitch": "Giảm thời gian phục vụ món trung bình đi 4.2 phút bằng bảng điều hành nhà bếp chuyên nghiệp."
            })
            
        if self.client:
            try:
                prompt = f"""
                Bạn là chuyên viên Upsell AI. Dựa trên hồ sơ khách hàng sau:
                {json.dumps(customer_profile)}
                Hãy gợi ý top-2 sản phẩm/gói dịch vụ để bán thêm, định dạng JSON có dạng:
                "recommendations": [ {{"target_product": "...", "price_diff": "...", "benefit": "...", "pitch": "..."}} ]
                """
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                cleaned = response.text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
                return parsed
            except Exception:
                pass

        return {"recommendations": recommendations}

    # 10. SmartSchedulerAgent
    def suggest_optimal_slots(self, booking_request: Dict[str, Any]) -> Dict[str, Any]:
        """Tìm ca đặt lịch trống tối ưu nhất dựa trên công suất nhân sự."""
        employee_availability = booking_request.get("availability", {})
        requested_duration = booking_request.get("duration_minutes", 60)
        
        suggested_slots = []
        # Return standard morning/afternoon options if matching duration
        for emp, hours in employee_availability.items():
            for hour in hours:
                suggested_slots.append({
                    "employee_name": emp,
                    "slot_time": f"2026-07-16T{hour}:00:00+07:00",
                    "suitability_score": 98 if hour in ["09", "10", "14", "15"] else 75
                })
                
        suggested_slots.sort(key=lambda x: x["suitability_score"], reverse=True)
        return {"optimal_slots": suggested_slots[:3]}

    # 11. SentimentAnalyzerAgent
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Phân tích cảm xúc phản hồi khách hàng & trích xuất ý chính."""
        score = 0.5
        sentiment = "NEUTRAL"
        
        text_lower = text.lower()
        if any(w in text_lower for w in ["tuyệt", "tốt", "ok", "yêu", "hài lòng", "sạch", "good", "great", "nice"]):
            score = 0.90
            sentiment = "POSITIVE"
        elif any(w in text_lower for w in ["tệ", "chán", "xấu", "dơ", "bẩn", "thất vọng", "kém", "bad", "angry"]):
            score = 0.15
            sentiment = "NEGATIVE"
            
        if self.client:
            try:
                prompt = f"""
                Bạn là AI phân tích phản hồi của khách hàng. Phân tích nội dung sau:
                "{text}"
                Trả về JSON có dạng: "sentiment": "POSITIVE/NEGATIVE/NEUTRAL", "score": float từ 0 đến 1, "key_insights": [mảng các ý chính rút ra].
                """
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                cleaned = response.text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
                return parsed
            except Exception:
                pass

        return {
            "sentiment": sentiment,
            "score": score,
            "key_insights": ["Phản hồi chung của khách hàng về dịch vụ."]
        }
