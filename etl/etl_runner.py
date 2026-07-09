"""
etl_runner.py — NextFlow OS ETL Pipeline Runner
Phase 5: Data Pipeline, CDC & Analytics Lakehouse

Đọc change_events từ nf_analytics.change_events (được ghi bởi PostgreSQL CDC triggers),
chạy Data Quality checks, sau đó upsert dữ liệu vào fact_work_item_lifecycle.
Chạy liên tục mỗi 5 phút như một background service trong Docker.
"""
import os
import time
import logging
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

from data_quality import run_batch_quality_checks

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("etl_runner")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5435/nextflow_db")
BATCH_SIZE   = int(os.getenv("ETL_BATCH_SIZE", "500"))
INTERVAL_SEC = int(os.getenv("ETL_INTERVAL_SECONDS", "300"))  # 5 phút


def get_connection():
    """Tạo kết nối PostgreSQL."""
    return psycopg2.connect(DATABASE_URL)


def compute_handling_time(started_at, completed_at) -> int:
    """Tính handling time giây, đảm bảo >= 0 (DQ_003)."""
    if started_at and completed_at:
        delta = (completed_at - started_at).total_seconds()
        return max(0, int(delta))
    return 0


def compute_queue_wait_time(created_at, started_at) -> int:
    """Tính queue wait time giây."""
    if created_at and started_at:
        delta = (started_at - created_at).total_seconds()
        return max(0, int(delta))
    return 0


def is_sla_violated(due_at, completed_at) -> bool:
    """Xác định vi phạm SLA."""
    if not due_at:
        return False
    check_time = completed_at if completed_at else datetime.now(timezone.utc)
    # Ensure timezone-aware comparison
    if check_time.tzinfo is None:
        check_time = check_time.replace(tzinfo=timezone.utc)
    if due_at.tzinfo is None:
        due_at = due_at.replace(tzinfo=timezone.utc)
    return check_time > due_at


def process_batch(conn, events: list[dict]) -> tuple[int, int]:
    """
    Xử lý một batch change_events:
    1. Chạy Data Quality checks
    2. Transform & upsert vào fact_work_item_lifecycle
    3. Đánh dấu event là processed
    Trả về (records_processed, records_failed)
    """
    if not events:
        return 0, 0

    # Chỉ lấy payload data từ events
    payloads = []
    event_ids = []
    for ev in events:
        event_ids.append(ev["event_id"])
        payload = ev["payload"]
        payloads.append(payload)

    valid_records, rejected_records = run_batch_quality_checks(payloads, conn)

    records_processed = 0
    records_failed = len(rejected_records)

    with conn.cursor() as cur:
        for record in valid_records:
            try:
                record_data = record.get("record_data", {})
                
                started_at = record.get("started_at") or record_data.get("started_at")
                completed_at = record.get("completed_at") or record_data.get("completed_at")
                created_at = record.get("created_at") or record_data.get("created_at")
                due_at = record.get("due_at") or record_data.get("due_at")

                handling_time = compute_handling_time(started_at, completed_at)
                queue_wait_time = compute_queue_wait_time(created_at, started_at)
                sla_violated = is_sla_violated(due_at, completed_at)
                
                status = record.get("status") or record_data.get("status") or "UNASSIGNED"
                is_completed = status in ("COMPLETED", "DONE")

                # Chuyển đổi priority CRITICAL -> CRITICAL (giữ nguyên nếu valid)
                priority = str(record.get("priority") or record_data.get("priority") or "MEDIUM").upper()
                if priority not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
                    priority = "MEDIUM"
                
                title = record.get("title") or record_data.get("title") or "Dynamic Entity Record"
                category = record.get("category") or record_data.get("category") or "GENERAL"
                source = record.get("source") or record_data.get("source") or "MANUAL"
                creator_id = record.get("creator_id") or record_data.get("creator_id")
                assignee_id = record.get("assignee_id") or record_data.get("assignee_id")
                queue_id = record.get("queue_id") or record_data.get("queue_id")


                cur.execute("""
                    INSERT INTO nf_analytics.fact_work_item_lifecycle (
                        work_item_id, tenant_id, title, category, priority, source,
                        current_status, creator_id, current_assignee_id, current_queue_id,
                        created_at, due_at, started_at, completed_at,
                        handling_time_seconds, queue_wait_time_seconds,
                        is_completed, is_sla_violated, version, last_synced_at
                    ) VALUES (
                        %(id)s, %(tenant_id)s, %(title)s, %(category)s, %(priority)s, %(source)s,
                        %(status)s, %(creator_id)s, %(assignee_id)s, %(queue_id)s,
                        %(created_at)s, %(due_at)s, %(started_at)s, %(completed_at)s,
                        %(handling_time)s, %(queue_wait_time)s,
                        %(is_completed)s, %(is_sla_violated)s, %(version)s, CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (work_item_id, tenant_id) DO UPDATE SET
                        current_status          = EXCLUDED.current_status,
                        current_assignee_id     = EXCLUDED.current_assignee_id,
                        current_queue_id        = EXCLUDED.current_queue_id,
                        completed_at            = EXCLUDED.completed_at,
                        handling_time_seconds   = EXCLUDED.handling_time_seconds,
                        is_completed            = EXCLUDED.is_completed,
                        is_sla_violated         = EXCLUDED.is_sla_violated,
                        version                 = EXCLUDED.version,
                        last_synced_at          = CURRENT_TIMESTAMP
                """, {
                    "id":               record.get("id") or record.get("work_item_id"),
                    "tenant_id":        record.get("tenant_id"),
                    "title":            title,
                    "category":         category,
                    "priority":         priority,
                    "source":           source,
                    "status":           status,
                    "creator_id":       creator_id,
                    "assignee_id":      assignee_id,
                    "queue_id":         queue_id,
                    "created_at":       created_at,
                    "due_at":           due_at,
                    "started_at":       started_at,
                    "completed_at":     completed_at,
                    "handling_time":    handling_time,
                    "queue_wait_time":  queue_wait_time,
                    "is_completed":     is_completed,
                    "is_sla_violated":  sla_violated,
                    "version":          record.get("version", 1),
                })
                records_processed += 1

            except Exception as e:
                logger.error("❌ Upsert thất bại cho work_item_id=%s: %s", record.get("id"), e)
                records_failed += 1

        # Đánh dấu toàn bộ events trong batch là processed
        if event_ids:
            cur.execute("""
                UPDATE nf_analytics.change_events
                SET processed = TRUE, processed_at = CURRENT_TIMESTAMP
                WHERE event_id = ANY(%s)
            """, (event_ids,))

    conn.commit()
    return records_processed, records_failed


def log_pipeline_run(conn, records_processed: int, records_failed: int,
                     execution_time_ms: int, error_msg: str = None):
    """Ghi nhận mỗi lần ETL chạy vào fact_integration_runs."""
    status = "SUCCESS" if records_failed == 0 else (
        "PARTIAL_SUCCESS" if records_processed > 0 else "FAILED"
    )
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO nf_analytics.fact_integration_runs
                (connector_id, run_type, status, records_processed, records_failed,
                 execution_time_ms, started_at, error_message)
            VALUES ('ETL_PIPELINE', 'BATCH_EXPORT', %s, %s, %s, %s, CURRENT_TIMESTAMP, %s)
        """, (status, records_processed, records_failed, execution_time_ms, error_msg))
    conn.commit()


def run_etl_cycle():
    """Một chu kỳ ETL đầy đủ: đọc events → transform → upsert → log."""
    start_time = time.time()
    logger.info("🚀 ETL cycle bắt đầu lúc %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    total_processed = 0
    total_failed = 0
    error_msg = None

    try:
        conn = get_connection()
        psycopg2.extras.register_uuid()

        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT event_id, table_name, operation, record_id, tenant_id, payload
                FROM nf_analytics.change_events
                WHERE processed = FALSE
                ORDER BY created_at ASC
                LIMIT %s
            """, (BATCH_SIZE,))
            events = cur.fetchall()

        if not events:
            logger.info("ℹ️  Không có sự kiện mới cần xử lý.")
        else:
            logger.info("📦 Đọc %d change events cần xử lý.", len(events))
            processed, failed = process_batch(conn, [dict(e) for e in events])
            total_processed += processed
            total_failed += failed
            logger.info("✅ Batch hoàn thành: %d processed, %d failed.", processed, failed)

        elapsed_ms = int((time.time() - start_time) * 1000)
        log_pipeline_run(conn, total_processed, total_failed, elapsed_ms, error_msg)
        conn.close()

    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)
        logger.error("❌ ETL cycle lỗi: %s", e)
        try:
            conn = get_connection()
            log_pipeline_run(conn, total_processed, total_failed, elapsed_ms, error_msg)
            conn.close()
        except Exception:
            pass

    elapsed = time.time() - start_time
    logger.info("⏱️  ETL cycle hoàn thành trong %.2f giây.\n", elapsed)


def main():
    logger.info("=" * 60)
    logger.info("  NextFlow OS — ETL Pipeline Runner v1.0")
    logger.info("  Interval: mỗi %d giây (%d phút)", INTERVAL_SEC, INTERVAL_SEC // 60)
    logger.info("=" * 60)

    # Chạy ngay lần đầu khi khởi động
    run_etl_cycle()

    # Sau đó lặp theo interval
    while True:
        logger.info("💤 Nghỉ %d giây...", INTERVAL_SEC)
        time.sleep(INTERVAL_SEC)
        run_etl_cycle()


if __name__ == "__main__":
    main()
