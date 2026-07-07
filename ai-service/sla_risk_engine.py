"""
SLA Risk Engine — Phase 6: AI Models & RAG Assistants
=======================================================
Mô hình phân loại rủi ro vi phạm SLA (Binary Classification).
- Layer 1: Rules & Heuristics (tức thì, no training needed)
- Layer 2: Logistic Regression trained on synthetic feature data
- Targets: Precision ≥ 85%, Recall ≥ 90%, AUC-ROC ≥ 0.90
"""

import os
import pickle
import numpy as np
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

try:
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.metrics import precision_score, recall_score, roc_auc_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

MODEL_PATH = Path(__file__).parent / "model" / "sla_risk_model.pkl"

# --------------------------------------------------------------------------
# Feature schema (Doc 122: feat_work_item_snapshot)
# --------------------------------------------------------------------------
@dataclass
class WorkItemFeatures:
    work_item_id: str
    age_minutes: float            # thời gian từ created_at tới now
    time_to_sla_minutes: float    # thời gian còn lại tới due_at (âm = overdue)
    priority: str                 # LOW / MEDIUM / HIGH / CRITICAL
    category: str                 # OPERATIONS / FINANCE / HR / GENERAL
    queue_load: int               # số tasks đang open trong cùng queue
    historical_breach_rate: float # SLA breach rate lịch sử của category này
    assignee_load: int            # số tasks đang assigned cho operator này
    is_overdue: bool              # time_to_sla_minutes < 0
    recent_reopen_count: int      # số lần reopen trong 7 ngày gần

PRIORITY_MAP = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
CATEGORY_MAP = {"GENERAL": 0, "OPERATIONS": 1, "FINANCE": 2, "HR": 3}

def _to_feature_vector(f: WorkItemFeatures) -> np.ndarray:
    """Chuyển WorkItemFeatures thành vector số học."""
    priority_enc = PRIORITY_MAP.get(f.priority.upper(), 1)
    category_enc = CATEGORY_MAP.get(f.category.upper(), 0)
    time_to_sla_clipped = max(f.time_to_sla_minutes, -999)
    return np.array([
        f.age_minutes,
        time_to_sla_clipped,
        float(f.is_overdue),
        priority_enc,
        category_enc,
        f.queue_load,
        f.historical_breach_rate,
        f.assignee_load,
        f.recent_reopen_count,
    ], dtype=np.float64)


# --------------------------------------------------------------------------
# Layer 1: Rules & Heuristics Engine (Doc 123 §6.2)
# --------------------------------------------------------------------------
def rules_based_score(f: WorkItemFeatures) -> Optional[float]:
    """
    Trả về score cố định nếu rules hard trigger, else None (→ ML layer).
    Theo nguyên tắc: explainable-first cho high-risk items.
    """
    if f.is_overdue:
        return 1.0  # đã vi phạm SLA → risk = max
    
    priority_level = PRIORITY_MAP.get(f.priority.upper(), 1)
    
    # CRITICAL item và còn < 15 phút
    if priority_level >= 3 and f.time_to_sla_minutes < 15:
        return 0.97

    # HIGH priority, breach rate cao, còn < 30 phút
    if priority_level >= 2 and f.historical_breach_rate > 0.4 and f.time_to_sla_minutes < 30:
        return 0.92

    # Queue quá tải nghiêm trọng (> 20 items) + deadline gần
    if f.queue_load > 20 and f.time_to_sla_minutes < 60:
        return 0.88

    # Đã reopen nhiều lần → có pattern lặp lại
    if f.recent_reopen_count >= 3:
        return 0.82

    return None  # không kích hoạt rules → chuyển sang ML layer


# --------------------------------------------------------------------------
# Layer 2: Synthetic Data Generator + Logistic Regression
# --------------------------------------------------------------------------
def _generate_synthetic_training_data(n: int = 60_000, seed: int = 42):
    """
    Sinh dữ liệu huấn luyện tổng hợp theo phân phối hợp lý.
    Nhãn được xác định bằng business logic thực tế.
    """
    rng = np.random.default_rng(seed)
    
    age = rng.uniform(0, 480, n)                     # 0–8 giờ (phút)
    time_to_sla = rng.uniform(-120, 480, n)           # -2h tới +8h (phút)
    is_overdue = (time_to_sla < 0).astype(float)
    priority = rng.integers(0, 4, n)                  # 0=LOW..3=CRITICAL
    category = rng.integers(0, 4, n)
    queue_load = rng.integers(0, 30, n)
    breach_rate = rng.beta(2, 5, n)                   # phân phối lệch phải [0,1]
    assignee_load = rng.integers(0, 15, n)
    reopen = rng.integers(0, 5, n)

    X = np.stack([age, time_to_sla, is_overdue, priority, category,
                  queue_load, breach_rate, assignee_load, reopen], axis=1)

    # Business logic nhãn: vi phạm SLA khi...
    sla_risk = (
        is_overdue.astype(bool) |
        ((time_to_sla < 30) & (priority >= 2)) |
        ((breach_rate > 0.45) & (time_to_sla < 90)) |
        ((queue_load > 18) & (time_to_sla < 60)) |
        (reopen >= 3)
    )

    # Thêm noise nhỏ (5%) để model không overfit
    flip_mask = rng.random(n) < 0.05
    y = sla_risk ^ flip_mask

    return X, y.astype(int)


def train_and_save_model():
    """Huấn luyện mô hình và lưu vào file pickle."""
    if not SKLEARN_AVAILABLE:
        print("[SLA Risk] scikit-learn không khả dụng, dùng rules-only mode.")
        return

    print("[SLA Risk] Đang sinh dữ liệu tổng hợp...")
    X, y = _generate_synthetic_training_data(60_000)

    # Temporal split: 70% train, 15% val, 15% test
    n = len(X)
    train_end = int(n * 0.70)
    val_end   = int(n * 0.85)

    X_train, y_train = X[:train_end], y[:train_end]
    X_test,  y_test  = X[val_end:],  y[val_end:]

    print("[SLA Risk] Đang huấn luyện Logistic Regression...")
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(
            class_weight="balanced",   # xử lý imbalanced data
            C=1.0,
            max_iter=1000,
            solver="lbfgs",
        ))
    ])
    model.fit(X_train, y_train)

    # Đánh giá trên holdout test set
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.40).astype(int)  # threshold thấp → tăng recall

    precision = precision_score(y_test, y_pred, zero_division=0)
    recall    = recall_score(y_test, y_pred, zero_division=0)
    auc       = roc_auc_score(y_test, y_prob)

    print(f"[SLA Risk] Holdout Test — Precision: {precision:.3f} | Recall: {recall:.3f} | AUC-ROC: {auc:.3f}")
    assert precision >= 0.85, f"Precision {precision:.3f} < 0.85!"
    assert recall    >= 0.90, f"Recall {recall:.3f} < 0.90!"
    assert auc       >= 0.90, f"AUC-ROC {auc:.3f} < 0.90!"
    print("[SLA Risk] ✅ Tất cả metrics đạt ngưỡng!")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"model": model, "threshold": 0.40}, f)
    print(f"[SLA Risk] Model lưu tại: {MODEL_PATH}")
    return model


def load_model():
    """Tải model đã train từ disk, train mới nếu chưa có."""
    if MODEL_PATH.exists() and SKLEARN_AVAILABLE:
        with open(MODEL_PATH, "rb") as f:
            data = pickle.load(f)
        return data["model"], data["threshold"]
    else:
        train_and_save_model()
        if MODEL_PATH.exists():
            return load_model()
    return None, 0.40


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------
_model_cache = None
_threshold_cache = 0.40

def _get_model():
    global _model_cache, _threshold_cache
    if _model_cache is None:
        _model_cache, _threshold_cache = load_model()
    return _model_cache, _threshold_cache


def score_sla_risk(features: WorkItemFeatures) -> dict:
    """
    Tính điểm rủi ro SLA cho một Work Item.
    Returns: {
        "risk_score": 0.0–1.0,
        "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "triggered_by": "RULES" | "ML" | "RULES_OVERDUE",
        "explanation": str,
        "recommendation": str
    }
    """
    # Layer 1: Rules
    rules_score = rules_based_score(features)
    if rules_score is not None:
        triggered_by = "RULES_OVERDUE" if features.is_overdue else "RULES"
        score = rules_score
    else:
        # Layer 2: ML model
        model, threshold = _get_model()
        if model is not None and SKLEARN_AVAILABLE:
            vec = _to_feature_vector(features).reshape(1, -1)
            prob = model.predict_proba(vec)[0, 1]
            score = float(prob)
            triggered_by = "ML"
        else:
            # Fallback nếu không có sklearn: heuristic đơn giản
            score = _heuristic_fallback_score(features)
            triggered_by = "HEURISTIC_FALLBACK"

    # Map score → level
    if score >= 0.85:
        level = "CRITICAL"
    elif score >= 0.65:
        level = "HIGH"
    elif score >= 0.40:
        level = "MEDIUM"
    else:
        level = "LOW"

    explanation = _generate_explanation(features, score, triggered_by)
    recommendation = _generate_recommendation(features, level)

    return {
        "work_item_id": features.work_item_id,
        "risk_score": round(score, 4),
        "risk_level": level,
        "triggered_by": triggered_by,
        "explanation": explanation,
        "recommendation": recommendation,
        "features_used": {
            "age_minutes": features.age_minutes,
            "time_to_sla_minutes": features.time_to_sla_minutes,
            "is_overdue": features.is_overdue,
            "priority": features.priority,
            "queue_load": features.queue_load,
            "historical_breach_rate": features.historical_breach_rate,
        }
    }


def _heuristic_fallback_score(f: WorkItemFeatures) -> float:
    """Fallback khi không có scikit-learn."""
    score = 0.1
    if f.time_to_sla_minutes < 60:
        score += 0.3
    if f.time_to_sla_minutes < 30:
        score += 0.3
    if f.priority.upper() in ("HIGH", "CRITICAL"):
        score += 0.2
    score += f.historical_breach_rate * 0.2
    return min(score, 0.99)


def _generate_explanation(f: WorkItemFeatures, score: float, triggered_by: str) -> str:
    parts = []
    if f.is_overdue:
        parts.append("Task đã quá hạn SLA")
    elif f.time_to_sla_minutes < 30:
        parts.append(f"Còn {f.time_to_sla_minutes:.0f} phút tới deadline SLA")
    if f.historical_breach_rate > 0.3:
        parts.append(f"Tỉ lệ vi phạm lịch sử của category này là {f.historical_breach_rate*100:.0f}%")
    if f.queue_load > 15:
        parts.append(f"Hàng đợi đang tải cao ({f.queue_load} tasks)")
    if not parts:
        parts.append(f"Rủi ro tính từ {triggered_by} (score {score:.2f})")
    return "; ".join(parts) + "."


def _generate_recommendation(f: WorkItemFeatures, level: str) -> str:
    if level == "CRITICAL":
        return "Escalate ngay lập tức. Gán cho operator có kinh nghiệm cao nhất và ưu tiên tối đa."
    elif level == "HIGH":
        return "Claim và xử lý trong vòng 15 phút. Kiểm tra lại deadline với supervisor."
    elif level == "MEDIUM":
        return "Ưu tiên xử lý trong ca hiện tại. Theo dõi sát tiến trình."
    else:
        return "Xử lý theo lịch thông thường."
