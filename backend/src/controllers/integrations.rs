use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Serialize, Deserialize, Clone)]
pub struct IntegrationApp {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub icon_url: String,
    pub fields_required: Vec<String>,
}

// Mock danh sách các ứng dụng có sẵn trên Marketplace
fn get_available_apps() -> Vec<IntegrationApp> {
    vec![
        IntegrationApp {
            id: "zalo_zns".to_string(),
            name: "Zalo ZNS".to_string(),
            description: "Gửi tin nhắn chăm sóc khách hàng tự động qua Zalo OA.".to_string(),
            category: "CRM".to_string(),
            icon_url: "MessageCircle".to_string(), // Tạm dùng tên icon Lucide
            fields_required: vec!["access_token".to_string()],
        },
        IntegrationApp {
            id: "kiotviet".to_string(),
            name: "KiotViet".to_string(),
            description: "Đồng bộ đơn hàng, khách hàng, sản phẩm 2 chiều.".to_string(),
            category: "POS".to_string(),
            icon_url: "ShoppingBag".to_string(),
            fields_required: vec!["client_id".to_string(), "client_secret".to_string(), "retailer_code".to_string()],
        },
        IntegrationApp {
            id: "vietqr".to_string(),
            name: "VietQR".to_string(),
            description: "Tự động sinh mã QR thanh toán động cho từng đơn hàng.".to_string(),
            category: "Payment".to_string(),
            icon_url: "QrCode".to_string(),
            fields_required: vec!["client_id".to_string(), "api_key".to_string()],
        },
        IntegrationApp {
            id: "ghtk".to_string(),
            name: "Giao Hàng Tiết Kiệm".to_string(),
            description: "Tự động đẩy đơn giao hàng và cập nhật hành trình.".to_string(),
            category: "Shipping".to_string(),
            icon_url: "Truck".to_string(),
            fields_required: vec!["api_token".to_string()],
        },
        IntegrationApp {
            id: "haravan".to_string(),
            name: "Haravan".to_string(),
            description: "Tích hợp đồng bộ dữ liệu e-commerce Haravan.".to_string(),
            category: "Ecommerce".to_string(),
            icon_url: "Store".to_string(),
            fields_required: vec!["access_token".to_string()],
        },
        IntegrationApp {
            id: "misa_amis".to_string(),
            name: "MISA AMIS".to_string(),
            description: "Đồng bộ hóa dữ liệu kế toán nội bộ và tự động xuất hóa đơn điện tử chuẩn thông tư 78.".to_string(),
            category: "ERP & Accounting".to_string(),
            icon_url: "FileSpreadsheet".to_string(),
            fields_required: vec!["api_key".to_string(), "app_id".to_string()],
        }
    ]
}

// GET /api/v1/integrations/available
pub async fn get_available_integrations(
    State(_state): State<AppState>,
    _tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let apps = get_available_apps();
    Ok(Json(json!({ "data": apps })))
}

// GET /api/v1/tenants/integrations
pub async fn get_tenant_integrations(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query!(
        r#"
        SELECT connector_name, status, created_at, updated_at
        FROM nf_core.connector_configurations
        WHERE tenant_id = $1
        "#,
        tenant.tenant_id
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    let mut installed = vec![];
    for row in rows {
        installed.push(json!({
            "connector_name": row.connector_name,
            "status": row.status,
            "created_at": row.created_at,
            "updated_at": row.updated_at
        }));
    }

    Ok(Json(json!({
        "tenant_id": tenant.tenant_id,
        "installed": installed
    })))
}

#[derive(Deserialize)]
pub struct InstallIntegrationPayload {
    pub credentials: Value,
}

// POST /api/v1/tenants/integrations/:connector_name
pub async fn install_tenant_integration(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(connector_name): Path<String>,
    Json(payload): Json<InstallIntegrationPayload>,
) -> Result<impl IntoResponse, Response> {
    let apps = get_available_apps();
    if !apps.iter().any(|a| a.id == connector_name) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Ứng dụng không hỗ trợ." })),
        ).into_response());
    }

    // Mã hoá credentials. Trong thực tế cần dùng hàm mã hoá an toàn (AES-GCM).
    // Tạm thời chuyển thành string và lưu vào cột encrypted_credentials (simulated encryption).
    let credentials_str = serde_json::to_string(&payload.credentials).unwrap_or_default();
    let simulated_encrypted = format!("ENCRYPTED_{}", base64::encode(&credentials_str));

    let result = sqlx::query!(
        r#"
        INSERT INTO nf_core.connector_configurations (tenant_id, connector_name, status, encrypted_credentials)
        VALUES ($1, $2, 'ACTIVE', $3)
        ON CONFLICT (tenant_id, connector_name) 
        DO UPDATE SET encrypted_credentials = EXCLUDED.encrypted_credentials, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
        RETURNING id
        "#,
        tenant.tenant_id,
        connector_name,
        simulated_encrypted
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    Ok(Json(json!({
        "message": format!("Cài đặt {} thành công", connector_name),
        "connector_id": result.id
    })))
}
