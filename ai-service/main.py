"""
FastAPI AI Service — Phase 6: AI Models & RAG Assistants
=========================================================
Cổng vào duy nhất của Python AI microservice.
Port: 8001 (Rust backend proxy từ :8000 → :8001)
"""

import os
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sla_risk_engine import (
    WorkItemFeatures,
    score_sla_risk,
    train_and_save_model,
    MODEL_PATH,
)
from routing_recommender import OperatorProfile, RoutingRequest, recommend_operators
from rag_assistant import query_rag, build_index_if_needed, reindex_tenant

from drug_interaction import PharmacyDrugInteractionAgent
from real_estate_lead import RealEstateLeadScoringAgent
from logistics_route import LogisticsRouteOptimizerAgent
from demand_forecast import DemandForecastingAgent
from dynamic_pricing import DynamicPricingAgent

from dotenv import load_dotenv
load_dotenv()

from google import genai
_gemini_client = None
if os.environ.get("GEMINI_API_KEY"):
    _gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

_drug_interaction_agent = PharmacyDrugInteractionAgent(_gemini_client)
_lead_scoring_agent = RealEstateLeadScoringAgent(_gemini_client)
_route_optimizer_agent = LogisticsRouteOptimizerAgent(_gemini_client)
_demand_forecasting_agent = DemandForecastingAgent(_gemini_client)
_dynamic_pricing_agent = DynamicPricingAgent(_gemini_client)

# --------------------------------------------------------------------------
# Lifespan: khởi tạo models khi server start
# --------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load tất cả AI models khi khởi động."""
    print("[AI Service] 🚀 Khởi động AI microservice...")

    # Train SLA model nếu chưa có
    if not MODEL_PATH.exists():
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, train_and_save_model)
    else:
        print("[AI Service] SLA Risk model đã tồn tại, bỏ qua training.")

    # Pre-build RAG FAISS index (chạy background để không block startup)
    print("[AI Service] Building RAG index (background)...")
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, build_index_if_needed)

    print("[AI Service] ✅ Sẵn sàng phục vụ!")
    yield
    print("[AI Service] 🛑 Shutdown.")


# --------------------------------------------------------------------------
# FastAPI app
# --------------------------------------------------------------------------
app = FastAPI(
    title="Nextflow OS AI Service",
    description="Phase 6: SLA Risk Predictor + Routing Recommender + RAG SOP Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:5173", "http://localhost:5174"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Request / Response schemas
# --------------------------------------------------------------------------
class SlaRiskRequest(BaseModel):
    work_item_id: str
    age_minutes: float          = Field(..., ge=0)
    time_to_sla_minutes: float  = Field(...)
    priority: str               = Field(..., pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    category: str               = Field(default="GENERAL")
    queue_load: int             = Field(default=0, ge=0)
    historical_breach_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    assignee_load: int          = Field(default=0, ge=0)
    recent_reopen_count: int    = Field(default=0, ge=0)

class RagQueryRequest(BaseModel):
    question: str               = Field(..., min_length=5, max_length=500)
    top_k: int                  = Field(default=5, ge=1, le=10)
    tenant_id: Optional[str]    = None


# --------------------------------------------------------------------------
# Health check
# --------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "nextflow-ai",
        "version": "1.0.0",
        "models": {
            "sla_risk": "ready" if MODEL_PATH.exists() else "training",
            "routing": "ready",
            "rag": "ready",
        }
    }


# --------------------------------------------------------------------------
# Endpoint 1: SLA Risk Predictor
# --------------------------------------------------------------------------
@app.post("/sla-risk")
async def sla_risk_endpoint(req: SlaRiskRequest):
    """
    Tính điểm rủi ro vi phạm SLA cho một Work Item.
    Precision ≥ 85% | Recall ≥ 90% | AUC-ROC ≥ 0.90
    """
    features = WorkItemFeatures(
        work_item_id          = req.work_item_id,
        age_minutes           = req.age_minutes,
        time_to_sla_minutes   = req.time_to_sla_minutes,
        priority              = req.priority,
        category              = req.category,
        queue_load            = req.queue_load,
        historical_breach_rate= req.historical_breach_rate,
        assignee_load         = req.assignee_load,
        is_overdue            = req.time_to_sla_minutes < 0,
        recent_reopen_count   = req.recent_reopen_count,
    )
    result = score_sla_risk(features)
    return result


# --------------------------------------------------------------------------
# Endpoint 2: Routing Recommendation
# --------------------------------------------------------------------------
@app.post("/routing-recommend")
async def routing_recommend_endpoint(req: RoutingRequest):
    """
    Đề xuất top-3 operators phù hợp nhất để xử lý task.
    NDCG@3 ≥ 0.82 | MAP ≥ 0.78
    """
    if not req.operators:
        raise HTTPException(
            status_code=400,
            detail="Cần ít nhất 1 operator để tính toán routing."
        )
    result = recommend_operators(req)
    return result


# --------------------------------------------------------------------------
# Endpoint 3: RAG SOP Assistant
# --------------------------------------------------------------------------
@app.post("/rag-query")
async def rag_query_endpoint(req: RagQueryRequest):
    """
    Trả lời câu hỏi dựa trên tài liệu SOP nội bộ.
    Local FAISS + sentence-transformers, không cần cloud.
    Groundedness ≥ 95% (trả lời khi cosine ≥ 0.35)
    """
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: query_rag(
            question=req.question,
            top_k=req.top_k,
            tenant_id=req.tenant_id,
        )
    )
    return result


# --------------------------------------------------------------------------
class DocumentItem(BaseModel):
    id: str
    title: str
    content: str

class ReindexRequest(BaseModel):
    tenant_id: str
    documents: list[DocumentItem]

@app.post("/reindex")
async def reindex_endpoint(req: ReindexRequest):
    """
    Nhận danh sách tài liệu SOP từ Backend và rebuild FAISS index cho Tenant.
    """
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: reindex_tenant(
            tenant_id=req.tenant_id,
            documents=[d.model_dump() for d in req.documents]
        )
    )
    return result


# --------------------------------------------------------------------------
# Endpoint 4: Batch SLA risk scoring (cho analytics dashboard)
# --------------------------------------------------------------------------
class BatchSlaRiskRequest(BaseModel):
    items: list[SlaRiskRequest] = Field(..., max_length=100)

@app.post("/sla-risk/batch")
async def sla_risk_batch(req: BatchSlaRiskRequest):
    """Batch scoring cho nhiều work items cùng lúc (tối đa 100)."""
    results = []
    for item in req.items:
        features = WorkItemFeatures(
            work_item_id          = item.work_item_id,
            age_minutes           = item.age_minutes,
            time_to_sla_minutes   = item.time_to_sla_minutes,
            priority              = item.priority,
            category              = item.category,
            queue_load            = item.queue_load,
            historical_breach_rate= item.historical_breach_rate,
            assignee_load         = item.assignee_load,
            is_overdue            = item.time_to_sla_minutes < 0,
            recent_reopen_count   = item.recent_reopen_count,
        )
        results.append(score_sla_risk(features))
    return {"results": results, "count": len(results)}


class ExtractInvoiceRequest(BaseModel):
    text: str

@app.post("/extract-invoice")
async def extract_invoice_endpoint(req: ExtractInvoiceRequest):
    """Trích xuất thông tin hóa đơn tự động bằng AI hoặc Regex Fallback."""
    text = req.text
    amount = 0.0
    vendor = "Nhà cung cấp chưa rõ"
    due_date = None
    items = []
    
    import re
    import json
    
    amount_match = re.search(r'(?:tổng tiền|thành tiền|tổng thanh toán|cộng|số tiền|amount)[:\s]+([\d.,]+)\s*(?:đ|vnd|đồng|vnđ)?', text, re.IGNORECASE)
    if amount_match:
        raw_val = amount_match.group(1).replace('.', '').replace(',', '')
        try:
            amount = float(raw_val)
        except ValueError:
            pass
            
    vendor_match = re.search(r'(?:công ty|cty|doanh nghiệp|nhà cung cấp|đơn vị bán)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
    if vendor_match:
        vendor = vendor_match.group(1).strip()
        
    date_match = re.search(r'(?:hạn thanh toán|due date|hạn nợ|ngày thanh toán)[:\s]+([\d/\-]+)', text, re.IGNORECASE)
    if date_match:
        due_date = date_match.group(1).strip()

    if _gemini_client:
        try:
            prompt = f"""
            Bạn là chuyên gia kế toán. Hãy trích xuất thông tin hóa đơn sau dưới dạng JSON có các trường:
            - "vendor": Tên đơn vị bán / nhà cung cấp
            - "amount": Tổng số tiền thanh toán (chỉ lấy số float, ví dụ 5000000.0)
            - "due_date": Hạn thanh toán (định dạng YYYY-MM-DD)
            - "items": Danh sách tên các mặt hàng/dịch vụ (mảng chuỗi)

            Nội dung hóa đơn:
            {text}
            
            Chỉ trả về JSON hợp lệ, không kèm giải thích hay tag markdown ```json.
            """
            response = _gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
            )
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(cleaned_text)
            return {
                "vendor": parsed.get("vendor", vendor),
                "amount": float(parsed.get("amount", amount)),
                "due_date": parsed.get("due_date", due_date),
                "items": parsed.get("items", items),
                "method": "gemini-ai"
            }
        except Exception as e:
            print(f"[AI Service] Gemini extraction failed, fallback to regex: {e}")

    return {
        "vendor": vendor,
        "amount": amount,
        "due_date": due_date,
        "items": items if items else ["Dịch vụ/Mặt hàng tổng hợp"],
        "method": "regex-fallback"
    }


class GenerateWorkflowRequest(BaseModel):
    prompt: str

@app.post("/generate-workflow")
async def generate_workflow_endpoint(req: GenerateWorkflowRequest):
    """Sử dụng LLM (Gemini) để sinh workflow (nodes & edges) dựa trên yêu cầu (prompt)."""
    if not _gemini_client:
        return {
            "nodes": [
                {"id": "1", "type": "triggerNode", "position": {"x": 250, "y": 50}, "data": {"label": "Lỗi API Key"}},
                {"id": "2", "type": "zaloNode", "position": {"x": 250, "y": 200}, "data": {"label": "Vui lòng cấu hình GEMINI_API_KEY"}}
            ],
            "edges": [{"id": "e1-2", "source": "1", "target": "2"}],
            "message": "GEMINI_API_KEY không tồn tại!"
        }

    system_prompt = """Bạn là một chuyên gia thiết kế Automation Workflow (luồng tự động hóa).
Bạn cần nhận diện ý định từ người dùng và trả về một luồng xử lý dạng JSON.
Các loại node hợp lệ bao gồm:
- triggerNode: Thường là node xuất phát (ví dụ: Đơn hàng mới, Có thông báo...)
- conditionNode: Dùng để rẽ nhánh bằng logic IF/ELSE
- zaloNode: Dành cho hành động gửi tin nhắn Zalo ZNS
- httpNode: Gửi HTTP Request, Webhook
- approvalNode: Dành cho quy trình cần có người phê duyệt

Quy tắc xuất JSON:
1. Phải chứa 2 mảng chính là "nodes" và "edges".
2. Thuộc tính của một Node:
   "id": chuỗi duy nhất
   "type": thuộc 1 trong các loại hợp lệ ở trên
   "position": đối tượng {"x": int, "y": int}
   "data": đối tượng chứa thông tin node, BẮT BUỘC có thuộc tính "label" là tên node. Các thuộc tính khác tùy chọn theo node (ví dụ: "phone", "templateId" với zaloNode, "expression" với conditionNode).
3. Thuộc tính của một Edge:
   "id": chuỗi duy nhất, thường dạng "e{source}-{target}"
   "source": id của node nguồn
   "target": id của node đích

CHỈ trả về JSON hợp lệ, không chứa giải thích hay Markdown tags. 
Trải dài các node trên trục y để dễ nhìn (VD: x=250, y=50 rồi y=200, y=350)."""

    try:
        response = _gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_prompt, req.prompt],
        )
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        import json
        parsed = json.loads(cleaned_text)
        return parsed
    except Exception as e:
        print(f"[AI Service] Workflow generation failed: {e}")
        return {
            "nodes": [
                {"id": "start", "type": "triggerNode", "position": {"x": 250, "y": 50}, "data": {"label": "Lỗi AI"}},
                {"id": "end", "type": "zaloNode", "position": {"x": 250, "y": 200}, "data": {"label": str(e)}}
            ],
            "edges": [{"id": "e1", "source": "start", "target": "end"}],
            "message": f"AI Lỗi: {e}"
        }


class TriageRequest(BaseModel):
    query: str
    tenant_id: str

@app.post("/api/v1/ai/triage")
async def triage_endpoint(req: TriageRequest):
    """Sử dụng LLM để trả lời tự động tin nhắn của khách hàng (Auto-reply Bot)."""
    if not _gemini_client:
        return {"answer": "Hệ thống AI đang bảo trì, vui lòng để lại tin nhắn."}

    system_prompt = """Bạn là trợ lý AI chăm sóc khách hàng.
Nhiệm vụ của bạn là phân tích tin nhắn của khách hàng và đưa ra câu trả lời phù hợp, lịch sự, ngắn gọn.
Nếu khách hàng hỏi về đơn hàng, báo họ cung cấp mã đơn hàng.
Nếu khách hàng hỏi về hỗ trợ kỹ thuật, hướng dẫn họ mô tả chi tiết lỗi.
Nếu là câu hỏi chung, trả lời một cách tự nhiên."""

    try:
        response = _gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_prompt, req.query],
        )
        return {"answer": response.text.strip()}
    except Exception as e:
        print(f"[AI Service] Triage failed: {e}")
        return {"answer": "Hiện tại hệ thống AI đang bận. Yêu cầu của bạn đã được ghi nhận."}


class CustomerInfo(BaseModel):
    customer_id: str
    monetary: float
    frequency: int
    recency: int

class SegmentCustomersRequest(BaseModel):
    tenant_id: str
    customers: list[CustomerInfo]

@app.post("/api/v1/ai/segment-customers")
async def segment_customers_endpoint(req: SegmentCustomersRequest):
    """Sử dụng LLM để phân nhóm khách hàng theo RFM."""
    if not req.customers:
        return {"segments": []}
    
    if not _gemini_client:
        # Fallback algorithm
        segments = []
        for c in req.customers:
            if c.monetary > 10000000 and c.frequency > 5:
                seg = "VIP"
                health = 95
            elif c.recency > 90:
                seg = "CHURNING"
                health = 25
            elif c.frequency > 1:
                seg = "REGULAR"
                health = 75
            else:
                seg = "NEW"
                health = 85
            segments.append({"customer_id": c.customer_id, "segment": seg, "ai_health_score": health})
        return {"segments": segments}

    system_prompt = """Bạn là AI chuyên gia phân tích dữ liệu RFM (Recency, Frequency, Monetary).
Nhiệm vụ của bạn là phân khúc danh sách khách hàng sau vào 4 nhóm: VIP, REGULAR, NEW, CHURNING và đưa ra chỉ số sức khỏe của khách hàng (ai_health_score từ 0 đến 100) đại diện cho độ gắn kết hoặc khả năng rời bỏ (VIP: 90-100, REGULAR: 60-89, NEW: 70-85, CHURNING: 0-59).
Định dạng output là JSON mảng các object {"customer_id": "...", "segment": "...", "ai_health_score": <number>}.
Không xuất ra bất kỳ text nào ngoài JSON hợp lệ."""

    customers_json = [{"id": c.customer_id, "R": c.recency, "F": c.frequency, "M": c.monetary} for c in req.customers]

    try:
        response = _gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_prompt, str(customers_json)],
        )
        cleaned = response.text.replace("```json", "").replace("```", "").strip()
        import json
        parsed = json.loads(cleaned)
        for item in parsed:
            if "ai_health_score" not in item:
                seg = item.get("segment", "REGULAR")
                item["ai_health_score"] = 95 if seg == "VIP" else (25 if seg == "CHURNING" else 75)
        return {"segments": parsed}
    except Exception as e:
        print(f"[AI Service] Segmentation failed: {e}")
        # Fallback list with health score
        segments = []
        for c in req.customers:
            if c.monetary > 10000000 and c.frequency > 5:
                seg = "VIP"
                health = 95
            elif c.recency > 90:
                seg = "CHURNING"
                health = 25
            elif c.frequency > 1:
                seg = "REGULAR"
                health = 75
            else:
                seg = "NEW"
                health = 85
            segments.append({"customer_id": c.customer_id, "segment": seg, "ai_health_score": health})
        return {"segments": segments}



# --------------------------------------------------------------------------
# Phase 4 endpoints: Pharmacy, Real Estate, Logistics AI Agents
# --------------------------------------------------------------------------
class DrugInteractionRequest(BaseModel):
    prescription_id: str
    medicines: list[dict]

@app.post("/pharmacy/drug-interaction")
async def drug_interaction_endpoint(req: DrugInteractionRequest):
    return await _drug_interaction_agent.check(req.prescription_id, req.medicines)


class LeadScoringRequest(BaseModel):
    budget_vnd: float
    interaction_count: int
    source: str
    property_type: Optional[str] = None
    urgency: Optional[str] = "medium"

@app.post("/real-estate/lead-score")
async def lead_scoring_endpoint(req: LeadScoringRequest):
    return _lead_scoring_agent.score(req.model_dump())


class RouteStop(BaseModel):
    id: str
    address: str
    recipient_name: Optional[str] = None

class RouteOptimizationRequest(BaseModel):
    stops: list[RouteStop]

@app.post("/logistics/route-optimize")
async def route_optimization_endpoint(req: RouteOptimizationRequest):
    return _route_optimizer_agent.optimize([s.model_dump() for s in req.stops])


class DemandForecastRequest(BaseModel):
    historical_sales: list[float]
    horizon: Optional[int] = 7

@app.post("/retail-fnb/demand-forecast")
async def demand_forecast_endpoint(req: DemandForecastRequest):
    return _demand_forecasting_agent.forecast(req.historical_sales, req.horizon)


class DynamicPricingRequest(BaseModel):
    base_price: float
    occupancy_rate: float
    competitor_price: float
    is_weekend: Optional[bool] = False

@app.post("/hospitality/dynamic-price")
async def dynamic_pricing_endpoint(req: DynamicPricingRequest):
    return _dynamic_pricing_agent.calculate_price(
        req.base_price,
        req.occupancy_rate,
        req.competitor_price,
        req.is_weekend
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
