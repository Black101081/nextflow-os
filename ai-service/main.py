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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
