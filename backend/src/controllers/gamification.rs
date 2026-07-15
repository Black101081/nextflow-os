use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Serialize)]
pub struct LeaderboardEntry {
    pub user_id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub role: String,
    pub total_points: i32,
    pub current_tier: String,
}

#[derive(Debug, Serialize)]
pub struct PointTransaction {
    pub id: Uuid,
    pub points_change: i32,
    pub reason: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserPointsInfo {
    pub total_points: i32,
    pub current_tier: String,
    pub transactions: Vec<PointTransaction>,
}

#[derive(Debug, Deserialize)]
pub struct AwardRequest {
    pub user_id: Uuid,
    pub work_item_id: Option<Uuid>,
    pub points_change: i32,
    pub reason: String,
}

pub async fn get_leaderboard(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT u.id, u.first_name, u.last_name, u.role, 
               COALESCE(p.total_points, 0) as total_points, 
               COALESCE(p.current_tier, 'Bronze') as current_tier
        FROM nf_core.users u
        LEFT JOIN nf_core.user_points p ON u.id = p.user_id
        WHERE u.tenant_id = $1 AND u.is_active = true
        ORDER BY total_points DESC
        LIMIT 50
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Gamification] Error fetching leaderboard: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let mut leaderboard = Vec::new();
    for row in rows {
        leaderboard.push(LeaderboardEntry {
            user_id: row.get("id"),
            first_name: row.get("first_name"),
            last_name: row.get("last_name"),
            role: row.get("role"),
            total_points: row.get("total_points"),
            current_tier: row.get("current_tier"),
        });
    }

    (StatusCode::OK, Json(leaderboard)).into_response()
}

pub async fn get_my_points(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let user_id = match tenant.user_id {
        Some(uid) => uid,
        None => {
            let user_query = r#"
                SELECT id FROM nf_core.users WHERE tenant_id = $1 ORDER BY created_at ASC LIMIT 1
            "#;
            match sqlx::query_scalar(user_query)
                .bind(tenant.tenant_id)
                .fetch_optional(&state.pool)
                .await
            {
                Ok(Some(id)) => id,
                _ => {
                    return (StatusCode::OK, Json(UserPointsInfo {
                        total_points: 0,
                        current_tier: "Bronze".to_string(),
                        transactions: vec![],
                    })).into_response();
                }
            }
        }
    };

    let points_row = sqlx::query(r#"
        SELECT total_points, current_tier FROM nf_core.user_points WHERE user_id = $1
    "#).bind(user_id).fetch_optional(&state.pool).await.unwrap_or(None);

    let (total_points, current_tier) = match points_row {
        Some(row) => (row.get("total_points"), row.get("current_tier")),
        None => (0, "Bronze".to_string()),
    };

    let tx_rows = sqlx::query(r#"
        SELECT id, points_change, reason, created_at FROM nf_core.point_transactions 
        WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20
    "#).bind(user_id).fetch_all(&state.pool).await.unwrap_or(vec![]);

    let mut transactions = Vec::new();
    for row in tx_rows {
        transactions.push(PointTransaction {
            id: row.get("id"),
            points_change: row.get("points_change"),
            reason: row.get("reason"),
            created_at: row.get("created_at"),
        });
    }

    (StatusCode::OK, Json(UserPointsInfo {
        total_points,
        current_tier,
        transactions,
    })).into_response()
}

pub async fn award_points(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<AwardRequest>,
) -> Response {
    match award_points_internal(&state.pool, tenant.tenant_id, payload.user_id, payload.work_item_id, payload.points_change, &payload.reason).await {
        Ok((new_total, new_tier)) => {
            (StatusCode::OK, Json(json!({
                "status": "success",
                "new_total": new_total,
                "new_tier": new_tier
            }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        }
    }
}

pub async fn award_points_internal(
    pool: &sqlx::PgPool,
    tenant_id: Uuid,
    user_id: Uuid,
    work_item_id: Option<Uuid>,
    points_change: i32,
    reason: &str,
) -> Result<(i32, String), Box<dyn std::error::Error>> {
    let mut tx = pool.begin().await?;

    // 1. Insert transaction
    let tx_insert = r#"
        INSERT INTO nf_core.point_transactions (tenant_id, user_id, work_item_id, points_change, reason)
        VALUES ($1, $2, $3, $4, $5)
    "#;
    if let Err(e) = sqlx::query(tx_insert)
        .bind(tenant_id)
        .bind(user_id)
        .bind(work_item_id)
        .bind(points_change)
        .bind(reason)
        .execute(&mut *tx)
        .await
    {
        return Err(Box::new(e));
    }

    // 2. Update total points
    let points_update = r#"
        INSERT INTO nf_core.user_points (tenant_id, user_id, total_points, current_tier)
        VALUES ($1, $2, $3, 'Bronze')
        ON CONFLICT (user_id) DO UPDATE 
        SET total_points = nf_core.user_points.total_points + EXCLUDED.total_points,
            last_updated = CURRENT_TIMESTAMP
        RETURNING total_points
    "#;
    let new_total: i32 = match sqlx::query_scalar(points_update)
        .bind(tenant_id)
        .bind(user_id)
        .bind(points_change)
        .fetch_one(&mut *tx)
        .await
    {
        Ok(val) => val,
        Err(e) => return Err(Box::new(e)),
    };

    // 3. Determine new tier
    let new_tier = if new_total >= 500 {
        "Platinum"
    } else if new_total >= 200 {
        "Gold"
    } else if new_total >= 50 {
        "Silver"
    } else {
        "Bronze"
    };

    // Update tier if changed
    let _ = sqlx::query("UPDATE nf_core.user_points SET current_tier = $1 WHERE user_id = $2")
        .bind(new_tier)
        .bind(user_id)
        .execute(&mut *tx)
        .await;

    tx.commit().await?;

    // Blockchain: Tokenized Gamification
    let payload_to_anchor = json!({
        "event": "TOKENIZED_GAMIFICATION_AWARD",
        "tenant_id": tenant_id.to_string(),
        "user_id": user_id.to_string(),
        "points_awarded": points_change,
        "new_total": new_total,
        "reason": reason,
        "timestamp": Utc::now().to_rfc3339()
    });
    
    let hash = crate::services::blockchain::compute_data_hash(&payload_to_anchor);
    let tx_hash = crate::services::blockchain::anchor_data_on_chain(pool, tenant_id, &hash, &payload_to_anchor).await;
    println!("[Tokenized Gamification] Minted {} tokens for user {}. Blockchain Tx: {:?}", points_change, user_id, tx_hash);

    Ok((new_total, new_tier.to_string()))
}

#[derive(Debug, Deserialize)]
pub struct RedeemRequest {
    pub points_amount: i32,
}

pub async fn redeem_voucher(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<RedeemRequest>,
) -> Response {
    if payload.points_amount < 100 {
        return (StatusCode::BAD_REQUEST, Json(json!({ "error": "Số điểm cần đổi phải tối thiểu là 100." }))).into_response();
    }

    let user_id = match tenant.user_id {
        Some(uid) => uid,
        None => {
            let user_query = r#"
                SELECT id FROM nf_core.users WHERE tenant_id = $1 ORDER BY created_at ASC LIMIT 1
            "#;
            match sqlx::query_scalar(user_query)
                .bind(tenant.tenant_id)
                .fetch_optional(&state.pool)
                .await
            {
                Ok(Some(id)) => id,
                _ => {
                    return (StatusCode::BAD_REQUEST, Json(json!({ "error": "Không tìm thấy tài khoản người dùng." }))).into_response();
                }
            }
        }
    };

    let points_row = sqlx::query(r#"
        SELECT total_points FROM nf_core.user_points WHERE user_id = $1
    "#).bind(user_id).fetch_optional(&state.pool).await.unwrap_or(None);

    let total_points = match points_row {
        Some(row) => row.get::<i32, _>("total_points"),
        None => 0,
    };

    if total_points < payload.points_amount {
        return (StatusCode::BAD_REQUEST, Json(json!({ "error": format!("Không đủ điểm đổi thưởng. Số điểm hiện tại: {}", total_points) }))).into_response();
    }

    let voucher_suffix = Uuid::new_v4().simple().to_string()[..8].to_uppercase();
    let voucher_code = format!("KVP-50K-{}", voucher_suffix);

    let _ = award_points_internal(
        &state.pool,
        tenant.tenant_id,
        user_id,
        None,
        -payload.points_amount,
        &format!("Đổi thưởng Voucher KiotViet {}", voucher_code)
    ).await;

    let response = json!({
        "status": "success",
        "message": format!("Đã đổi thành công {} điểm lấy Voucher KiotViet!", payload.points_amount),
        "data": {
            "voucher_code": voucher_code,
            "points_redeemed": payload.points_amount,
            "remaining_points": total_points - payload.points_amount
        }
    });

    (StatusCode::OK, Json(response)).into_response()
}
