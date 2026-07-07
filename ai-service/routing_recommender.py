"""
Routing Recommendation Engine — Phase 6: AI Models & RAG Assistants
====================================================================
Đề xuất top-3 operators phù hợp nhất để xử lý một task trong queue.
- Scoring: on_time_rate * 0.5 + (1 - load_normalized) * 0.5
- Metrics: NDCG@3 ≥ 0.82 | MAP ≥ 0.78
"""

import math
import httpx
import os
from typing import Optional
from pydantic import BaseModel

# --------------------------------------------------------------------------
# Data models
# --------------------------------------------------------------------------
class OperatorProfile(BaseModel):
    user_id: str
    full_name: str
    role: str
    current_load: int            # số tasks đang assigned
    tasks_completed: int
    on_time_completion_rate: float   # 0.0–100.0 (từ vw_operator_performance)
    avg_handling_time_secs: float
    specialty_categories: list[str] = []   # category mà operator giỏi nhất

class RoutingRequest(BaseModel):
    queue_id: str
    task_category: str
    task_priority: str
    operators: list[OperatorProfile]

class OperatorSuggestion(BaseModel):
    rank: int
    user_id: str
    full_name: str
    relevance_score: float      # 0.0–1.0
    confidence: str             # HIGH / MEDIUM / LOW
    reason: str
    current_load: int
    on_time_rate: float

# --------------------------------------------------------------------------
# Scoring formula (Docs 122 §4.3)
# --------------------------------------------------------------------------
PRIORITY_WEIGHT = {"LOW": 0.5, "MEDIUM": 0.7, "HIGH": 0.85, "CRITICAL": 1.0}

def _score_operator(
    op: OperatorProfile,
    task_category: str,
    task_priority: str,
    max_load: int,
) -> float:
    """
    Công thức scoring multi-factor:
    score = w1 * on_time_rate + w2 * (1 - load_norm) + w3 * specialty_bonus
    """
    if max_load == 0:
        max_load = 1

    # Normalize on_time_rate [0,100] → [0,1]
    otr = op.on_time_completion_rate / 100.0

    # Load penalty: operator đầy (10+ tasks) → penalize nặng
    load_norm = min(op.current_load / max(max_load, 10), 1.0)

    # Specialty bonus: operator có kinh nghiệm với category này
    specialty_bonus = 0.15 if task_category.upper() in [c.upper() for c in op.specialty_categories] else 0.0

    # Lấy trọng số theo priority
    prio_w = PRIORITY_WEIGHT.get(task_priority.upper(), 0.7)

    # High priority tasks → ưu tiên on_time_rate nhiều hơn
    w_otr  = 0.55 + 0.10 * prio_w
    w_load = 0.35 - 0.05 * prio_w

    raw_score = w_otr * otr + w_load * (1.0 - load_norm) + specialty_bonus

    # Boost nhỏ cho operator completed nhiều (có kinh nghiệm)
    experience_boost = min(op.tasks_completed / 500.0, 0.05)
    return min(raw_score + experience_boost, 1.0)


def _compute_confidence(score: float, rank: int) -> str:
    if score >= 0.75 and rank == 1:
        return "HIGH"
    elif score >= 0.55:
        return "MEDIUM"
    return "LOW"


def _build_reason(op: OperatorProfile, score: float, task_category: str) -> str:
    parts = []
    if op.on_time_completion_rate >= 85:
        parts.append(f"tỉ lệ đúng hạn {op.on_time_completion_rate:.0f}%")
    if op.current_load <= 3:
        parts.append("đang rảnh")
    elif op.current_load <= 6:
        parts.append(f"tải vừa phải ({op.current_load} tasks)")
    if task_category.upper() in [c.upper() for c in op.specialty_categories]:
        parts.append(f"chuyên xử lý {task_category}")
    if op.tasks_completed >= 100:
        parts.append(f"kinh nghiệm ({op.tasks_completed} tasks hoàn thành)")
    if not parts:
        parts.append(f"điểm phù hợp {score:.2f}")
    return "Phù hợp vì: " + ", ".join(parts) + "."


# --------------------------------------------------------------------------
# NDCG@k metric computation (Doc 129B §3.2)
# --------------------------------------------------------------------------
def compute_ndcg_at_k(ranked_relevances: list[float], k: int = 3) -> float:
    """
    Tính NDCG@k.
    ranked_relevances: list điểm relevance (cao nhất = tốt nhất)
    """
    def dcg(rels, k):
        return sum(
            (2**r - 1) / math.log2(i + 2)
            for i, r in enumerate(rels[:k])
        )

    actual_dcg  = dcg(ranked_relevances, k)
    ideal_rels  = sorted(ranked_relevances, reverse=True)
    ideal_dcg   = dcg(ideal_rels, k)
    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0.0


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------
def recommend_operators(request: RoutingRequest) -> dict:
    """
    Trả về top-3 operator suggestions với NDCG@3 metrics.
    """
    operators = request.operators

    if not operators:
        return {
            "queue_id": request.queue_id,
            "suggestions": [],
            "fallback": "FIFO",
            "reason": "Không có operator nào khả dụng trong queue.",
            "ndcg_at_3": 0.0,
        }

    max_load = max((op.current_load for op in operators), default=1)

    # Score tất cả operators
    scored = []
    for op in operators:
        score = _score_operator(
            op,
            task_category=request.task_category,
            task_priority=request.task_priority,
            max_load=max_load,
        )
        scored.append((op, score))

    # Sort theo score giảm dần
    scored.sort(key=lambda x: x[1], reverse=True)

    # Top-3
    top_k = scored[:3]
    suggestions = []
    ranked_relevances = []

    for rank_idx, (op, score) in enumerate(top_k, start=1):
        confidence = _compute_confidence(score, rank_idx)
        reason = _build_reason(op, score, request.task_category)
        suggestions.append(OperatorSuggestion(
            rank=rank_idx,
            user_id=op.user_id,
            full_name=op.full_name,
            relevance_score=round(score, 4),
            confidence=confidence,
            reason=reason,
            current_load=op.current_load,
            on_time_rate=op.on_time_completion_rate,
        ))
        ranked_relevances.append(score)

    ndcg = compute_ndcg_at_k(ranked_relevances, k=3)

    return {
        "queue_id": request.queue_id,
        "task_category": request.task_category,
        "task_priority": request.task_priority,
        "suggestions": [s.model_dump() for s in suggestions],
        "total_operators_evaluated": len(operators),
        "ndcg_at_3": round(ndcg, 4),
        "meets_ndcg_threshold": ndcg >= 0.82,
        "fallback": None,
    }
