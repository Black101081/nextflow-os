"""
data_quality.py — Data Quality Assertions for NextFlow OS ETL Pipeline
Implements DQ_001 to DQ_004 as defined in doc 108_PACK07_DATA_PIPELINE_ETL_AND_INGESTION_SPEC
"""
import logging
from typing import Optional
import uuid

logger = logging.getLogger("etl.data_quality")


class DataQualityError(Exception):
    """Lỗi nghiêm trọng khi Data Quality check thất bại — ngắt pipeline."""
    pass


def validate_record(record: dict) -> tuple[bool, Optional[str]]:
    """
    Chạy toàn bộ Data Quality assertions trên một bản ghi thô từ change_events.
    Trả về (is_valid, error_reason).
    """
    # DQ_001: Completeness — work_item_id và tenant_id không được NULL/empty
    work_item_id = record.get("id") or record.get("work_item_id")
    tenant_id = record.get("tenant_id")

    if not work_item_id or str(work_item_id).strip() == "":
        return False, "DQ_001: work_item_id là NULL hoặc rỗng."

    if not tenant_id or str(tenant_id).strip() == "":
        return False, "DQ_001: tenant_id là NULL hoặc rỗng."

    # DQ_001: Validate UUID format
    try:
        uuid.UUID(str(work_item_id))
        uuid.UUID(str(tenant_id))
    except ValueError:
        return False, f"DQ_001: work_item_id hoặc tenant_id không đúng định dạng UUID."

    # DQ_003: Validity — handling_time_seconds không được âm
    # (Tính từ payload nếu có started_at và completed_at)
    started_at = record.get("started_at")
    completed_at = record.get("completed_at")
    if started_at and completed_at:
        try:
            from datetime import datetime
            # Bỏ qua timezone suffix nếu cần
            if isinstance(started_at, str):
                started_at = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            if isinstance(completed_at, str):
                completed_at = datetime.fromisoformat(completed_at.replace("Z", "+00:00"))
            handling_time = (completed_at - started_at).total_seconds()
            if handling_time < 0:
                logger.warning(
                    "DQ_003: handling_time âm cho work_item_id=%s — thiết lập về 0.", work_item_id
                )
                record["handling_time_override"] = 0  # Sẽ được xử lý ở ETL transform
        except Exception as e:
            logger.warning("DQ_003: Không parse được timestamp: %s", e)

    # DQ_002: Uniqueness — được xử lý ở DB level qua UPSERT ON CONFLICT
    # DQ_004: Consistency — được kiểm tra ở ETL khi query dim_tenant

    return True, None


def run_batch_quality_checks(records: list[dict], conn) -> tuple[list[dict], list[dict]]:
    """
    Chạy quality checks trên toàn bộ batch records.
    Trả về (valid_records, rejected_records).
    """
    valid = []
    rejected = []

    # Lấy danh sách tenant_id hợp lệ từ dim_tenant (DQ_004)
    with conn.cursor() as cur:
        cur.execute("SELECT tenant_id FROM nf_analytics.dim_tenant")
        valid_tenant_ids = {str(row[0]) for row in cur.fetchall()}

    for record in records:
        is_valid, error = validate_record(record)
        if not is_valid:
            logger.warning("❌ Record rejected: %s — Reason: %s", record.get("id"), error)
            rejected.append({"record": record, "error": error})
            continue

        # DQ_004: Consistency — tenant phải tồn tại trong dim_tenant
        tenant_id = str(record.get("tenant_id", ""))
        if tenant_id not in valid_tenant_ids:
            msg = f"DQ_004: tenant_id={tenant_id} không tồn tại trong dim_tenant."
            logger.warning("❌ Record rejected: %s — %s", record.get("id"), msg)
            rejected.append({"record": record, "error": msg})
            continue

        valid.append(record)

    logger.info("✅ Batch quality check: %d valid, %d rejected", len(valid), len(rejected))
    return valid, rejected
