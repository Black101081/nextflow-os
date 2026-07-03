use sqlx::PgPool;
use chrono::Utc;
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct SlaScanResult {
    pub checked_count: usize,
    pub breached_count: usize,
    pub reassigned_count: usize,
}

pub async fn monitor_sla_breaches(pool: &PgPool) -> Result<SlaScanResult, sqlx::Error> {
    // 1. Lấy danh sách tất cả các task chưa hoàn thành
    let select_query = r#"
        SELECT 
            w.id, w.tenant_id, w.title, w.status, w.priority, w.due_at, w.started_at, w.queue_id,
            q.sla_target_seconds
        FROM nf_core.work_items w
        LEFT JOIN nf_core.queues q ON w.queue_id = q.id
        WHERE w.status NOT IN ('COMPLETED', 'CANCELLED')
    "#;

    let rows = sqlx::query(select_query)
        .fetch_all(pool)
        .await?;

    let mut checked_count = 0;
    let mut breached_count = 0;
    let mut reassigned_count = 0;

    let now = Utc::now();

    for row in rows {
        checked_count += 1;
        let id: Uuid = sqlx::Row::get(&row, "id");
        let tenant_id: Uuid = sqlx::Row::get(&row, "tenant_id");
        let status: String = sqlx::Row::get(&row, "status");
        let due_at: Option<chrono::DateTime<Utc>> = sqlx::Row::get(&row, "due_at");
        let started_at: Option<chrono::DateTime<Utc>> = sqlx::Row::get(&row, "started_at");
        let _queue_id: Option<String> = sqlx::Row::get(&row, "queue_id");
        let sla_target_seconds: Option<i32> = sqlx::Row::get(&row, "sla_target_seconds");

        // Kịch bản A: Task trễ hạn hoàn thành (SLA Breach)
        if let Some(due) = due_at {
            if due < now {
                breached_count += 1;

                // Tự động chuyển tiếp sang hàng đợi khẩn cấp "q_escalation_queue" và nâng độ ưu tiên lên HIGH
                // Đầu tiên, đảm bảo hàng đợi q_escalation_queue tồn tại
                sqlx::query(
                    r#"
                        INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds)
                        VALUES ('q_escalation_queue', $1, 'Hàng đợi Khẩn cấp Escalation', 'GENERAL', 'FIFO', 1800)
                        ON CONFLICT (id) DO NOTHING
                    "#
                )
                .bind(tenant_id)
                .execute(pool)
                .await?;

                // Định tuyến task sang hàng đợi khẩn cấp và nâng priority
                sqlx::query(
                    r#"
                        UPDATE nf_core.work_items
                        SET queue_id = 'q_escalation_queue', priority = 'HIGH', version = version + 1
                        WHERE id = $1
                    "#
                )
                .bind(id)
                .execute(pool)
                .await?;
                
                continue; // Bỏ qua check thu hồi nếu đã escalate
            }
        }

        // Kịch bản B: Operator nhận việc quá hạn định (Operator Hold Timeout)
        if status == "IN_PROGRESS" {
            if let (Some(start), Some(target_sec)) = (started_at, sla_target_seconds) {
                let elapsed = (now - start).num_seconds();
                if elapsed > target_sec as i64 {
                    reassigned_count += 1;

                    // Thu hồi quyền gán (UNASSIGNED), gán assignee = null, started_at = null
                    sqlx::query(
                        r#"
                            UPDATE nf_core.work_items
                            SET status = 'UNASSIGNED', assignee_id = NULL, started_at = NULL, version = version + 1
                            WHERE id = $1
                        "#
                    )
                    .bind(id)
                    .execute(pool)
                    .await?;
                }
            }
        }
    }

    Ok(SlaScanResult {
        checked_count,
        breached_count,
        reassigned_count,
    })
}
