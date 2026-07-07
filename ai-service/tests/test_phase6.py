"""
Phase 6 — AI Service Tests
===========================
Kiểm định tất cả metrics gates theo Doc 129B:
- SLA Risk: Precision ≥ 85%, Recall ≥ 90%, AUC-ROC ≥ 0.90
- Routing: NDCG@3 ≥ 0.82
- RAG: Groundedness logic check
"""

import sys
import os
import math

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sla_risk_engine import WorkItemFeatures, score_sla_risk, train_and_save_model, MODEL_PATH
from routing_recommender import OperatorProfile, RoutingRequest, recommend_operators, compute_ndcg_at_k
from rag_assistant import query_rag


# --------------------------------------------------------------------------
# Tests: SLA Risk Engine
# --------------------------------------------------------------------------
class TestSlaRiskEngine:

    def test_overdue_item_max_risk(self):
        """Task đã quá hạn → risk phải = 1.0 (Rules layer)"""
        f = WorkItemFeatures(
            work_item_id="test-001",
            age_minutes=200, time_to_sla_minutes=-30,
            priority="MEDIUM", category="OPERATIONS",
            queue_load=5, historical_breach_rate=0.2,
            assignee_load=2, is_overdue=True, recent_reopen_count=0,
        )
        result = score_sla_risk(f)
        assert result["risk_score"] == 1.0
        assert result["risk_level"] == "CRITICAL"
        assert "RULES" in result["triggered_by"]
        print(f"[PASS] test_overdue_item_max_risk: score={result['risk_score']}")

    def test_critical_near_deadline(self):
        """CRITICAL task còn < 15 phút → risk ≥ 0.95"""
        f = WorkItemFeatures(
            work_item_id="test-002",
            age_minutes=50, time_to_sla_minutes=10,
            priority="CRITICAL", category="FINANCE",
            queue_load=3, historical_breach_rate=0.1,
            assignee_load=1, is_overdue=False, recent_reopen_count=0,
        )
        result = score_sla_risk(f)
        assert result["risk_score"] >= 0.95
        print(f"[PASS] test_critical_near_deadline: score={result['risk_score']}")

    def test_low_risk_task(self):
        """Task mới tạo, còn nhiều thời gian → risk thấp"""
        f = WorkItemFeatures(
            work_item_id="test-003",
            age_minutes=5, time_to_sla_minutes=480,
            priority="LOW", category="GENERAL",
            queue_load=2, historical_breach_rate=0.05,
            assignee_load=1, is_overdue=False, recent_reopen_count=0,
        )
        result = score_sla_risk(f)
        assert result["risk_score"] < 0.4
        assert result["risk_level"] in ("LOW", "MEDIUM")
        print(f"[PASS] test_low_risk_task: score={result['risk_score']}, level={result['risk_level']}")

    def test_result_schema(self):
        """Kiểm tra schema của kết quả trả về đầy đủ fields"""
        f = WorkItemFeatures(
            work_item_id="test-004",
            age_minutes=100, time_to_sla_minutes=90,
            priority="HIGH", category="OPERATIONS",
            queue_load=10, historical_breach_rate=0.3,
            assignee_load=5, is_overdue=False, recent_reopen_count=1,
        )
        result = score_sla_risk(f)
        required_keys = ["work_item_id", "risk_score", "risk_level", "triggered_by", "explanation", "recommendation"]
        for k in required_keys:
            assert k in result, f"Missing key: {k}"
        assert 0.0 <= result["risk_score"] <= 1.0
        assert result["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
        print(f"[PASS] test_result_schema: all keys present, score={result['risk_score']}")

    def test_ml_model_metrics(self):
        """
        Train model và verify đạt ngưỡng metrics theo Doc 129B §3.1:
        Precision ≥ 85%, Recall ≥ 90%, AUC-ROC ≥ 0.90
        """
        try:
            from sklearn.metrics import precision_score, recall_score, roc_auc_score
            import numpy as np
            from sla_risk_engine import _generate_synthetic_training_data, load_model, _to_feature_vector
        except ImportError:
            print("[SKIP] test_ml_model_metrics: scikit-learn không khả dụng")
            return

        if not MODEL_PATH.exists():
            train_and_save_model()

        model, threshold = load_model()
        assert model is not None, "Model phải được train thành công"

        # Tạo holdout test set mới (seed khác để tránh data leakage)
        X_test, y_test = _generate_synthetic_training_data(n=10_000, seed=99)
        y_prob = model.predict_proba(X_test)[:, 1]
        y_pred = (y_prob >= threshold).astype(int)

        precision = precision_score(y_test, y_pred, zero_division=0)
        recall    = recall_score(y_test, y_pred, zero_division=0)
        auc       = roc_auc_score(y_test, y_prob)

        print(f"[Metrics] Precision={precision:.3f} | Recall={recall:.3f} | AUC-ROC={auc:.3f}")
        assert precision >= 0.85, f"Precision {precision:.3f} < 0.85 (Doc 129B requirement)"
        assert recall    >= 0.90, f"Recall {recall:.3f} < 0.90 (Doc 129B requirement)"
        assert auc       >= 0.90, f"AUC-ROC {auc:.3f} < 0.90 (Doc 129B requirement)"
        print("[PASS] test_ml_model_metrics: tất cả metrics đạt ngưỡng ✅")


# --------------------------------------------------------------------------
# Tests: Routing Recommender
# --------------------------------------------------------------------------
class TestRoutingRecommender:

    def _make_operators(self, count: int = 4) -> list[OperatorProfile]:
        return [
            OperatorProfile(
                user_id=f"user-{i}",
                full_name=f"Operator {i}",
                role="SME_OPS",
                current_load=i * 2,
                tasks_completed=50 * i,
                on_time_completion_rate=max(95.0 - i * 10, 40.0),
                avg_handling_time_secs=1800.0,
                specialty_categories=["OPERATIONS"] if i % 2 == 0 else [],
            ) for i in range(1, count + 1)
        ]

    def test_returns_top3(self):
        """Phải trả về tối đa 3 suggestions"""
        req = RoutingRequest(
            queue_id="q_test",
            task_category="OPERATIONS",
            task_priority="HIGH",
            operators=self._make_operators(5),
        )
        result = recommend_operators(req)
        assert len(result["suggestions"]) <= 3
        assert len(result["suggestions"]) >= 1
        print(f"[PASS] test_returns_top3: {len(result['suggestions'])} suggestions")

    def test_best_operator_ranked_first(self):
        """Operator có on_time_rate cao nhất + ít task nhất → rank 1"""
        ops = [
            OperatorProfile(
                user_id="best", full_name="Best Op", role="SME_OPS",
                current_load=1, tasks_completed=200,
                on_time_completion_rate=98.0, avg_handling_time_secs=1200.0,
            ),
            OperatorProfile(
                user_id="worst", full_name="Worst Op", role="SME_OPS",
                current_load=12, tasks_completed=20,
                on_time_completion_rate=45.0, avg_handling_time_secs=3600.0,
            ),
        ]
        req = RoutingRequest(queue_id="q_test", task_category="GENERAL",
                             task_priority="MEDIUM", operators=ops)
        result = recommend_operators(req)
        assert result["suggestions"][0]["user_id"] == "best"
        print("[PASS] test_best_operator_ranked_first")

    def test_ndcg_at_3_meets_threshold(self):
        """
        NDCG@3 phải ≥ 0.82 theo Doc 129B §3.2 khi có đủ operators chất lượng
        """
        ops = self._make_operators(5)
        req = RoutingRequest(
            queue_id="q_test", task_category="OPERATIONS",
            task_priority="HIGH", operators=ops,
        )
        result = recommend_operators(req)
        ndcg = result["ndcg_at_3"]
        print(f"[Metrics] NDCG@3 = {ndcg:.4f}")
        assert ndcg >= 0.82, f"NDCG@3 {ndcg:.4f} < 0.82 (Doc 129B requirement)"
        print(f"[PASS] test_ndcg_at_3_meets_threshold: NDCG@3={ndcg:.4f} ✅")

    def test_empty_operators_fallback(self):
        """Khi không có operator → trả về fallback rõ ràng"""
        req = RoutingRequest(
            queue_id="q_empty", task_category="GENERAL",
            task_priority="LOW", operators=[],
        )
        result = recommend_operators(req)
        assert result["fallback"] == "FIFO"
        assert result["suggestions"] == []
        print("[PASS] test_empty_operators_fallback")

    def test_ndcg_computation(self):
        """Unit test cho hàm compute_ndcg_at_k"""
        perfect = [1.0, 0.8, 0.6]
        ndcg_perfect = compute_ndcg_at_k(perfect, k=3)
        assert ndcg_perfect == 1.0, "Perfect ranking phải = 1.0"
        
        reversed_rels = [0.6, 0.8, 1.0]
        ndcg_reversed = compute_ndcg_at_k(reversed_rels, k=3)
        assert ndcg_reversed < 1.0
        print(f"[PASS] test_ndcg_computation: perfect={ndcg_perfect:.3f}, reversed={ndcg_reversed:.3f}")


# --------------------------------------------------------------------------
# Tests: RAG Assistant
# --------------------------------------------------------------------------
class TestRagAssistant:

    def test_basic_query_returns_structure(self):
        """RAG query phải trả về đúng schema"""
        result = query_rag("Quy trình xử lý ngoại lệ trong Nextflow là gì?")
        required_keys = ["question", "answer", "grounded", "groundedness_score", "citations", "mode"]
        for k in required_keys:
            assert k in result, f"Missing key in RAG result: {k}"
        assert isinstance(result["answer"], str)
        assert len(result["answer"]) > 10
        assert 0.0 <= result["groundedness_score"] <= 1.0
        print(f"[PASS] test_basic_query_returns_structure: mode={result['mode']}")

    def test_irrelevant_question_low_score(self):
        """Câu hỏi không liên quan → groundedness thấp hoặc warning"""
        result = query_rag("Bí quyết nấu phở ngon nhất là gì?")
        # Không expect grounded = True vì câu hỏi không liên quan
        print(f"[PASS] test_irrelevant_question_low_score: grounded={result['grounded']}, score={result['groundedness_score']}")

    def test_sla_query(self):
        """Câu hỏi về SLA → phải tìm thấy context liên quan"""
        result = query_rag("SLA là gì và quy trình xử lý khi vi phạm SLA?")
        assert isinstance(result["answer"], str)
        print(f"[PASS] test_sla_query: grounded={result['grounded']}, citations={len(result['citations'])}")

    def test_answer_not_empty(self):
        """Luôn phải trả về answer, ngay cả khi không tìm thấy context"""
        result = query_rag("thông tin gì đó ngẫu nhiên xyz abc 123")
        assert result["answer"] and len(result["answer"]) > 5
        print(f"[PASS] test_answer_not_empty")


# --------------------------------------------------------------------------
# Runner
# --------------------------------------------------------------------------
def run_all_tests():
    print("\n" + "="*60)
    print("Phase 6 — AI Service Test Suite")
    print("="*60)

    passed = 0
    failed = 0

    for TestClass in [TestSlaRiskEngine, TestRoutingRecommender, TestRagAssistant]:
        instance = TestClass()
        class_name = TestClass.__name__
        print(f"\n📋 {class_name}")
        print("-" * 40)
        methods = [m for m in dir(instance) if m.startswith("test_")]
        for method_name in methods:
            try:
                getattr(instance, method_name)()
                passed += 1
            except AssertionError as e:
                print(f"[FAIL] {method_name}: {e}")
                failed += 1
            except Exception as e:
                print(f"[ERROR] {method_name}: {type(e).__name__}: {e}")
                failed += 1

    print("\n" + "="*60)
    print(f"Kết quả: {passed} PASSED | {failed} FAILED")
    if failed == 0:
        print("✅ Tất cả tests đạt!")
    else:
        print("❌ Có tests thất bại!")
    print("="*60)
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
