use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use regex::Regex;

/// Các loại Nút (Node) có thể có trong một Workflow
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum NodeType {
    /// Bắt đầu quy trình (VD: "Khi một hóa đơn được tạo")
    Trigger { event_name: String },
    
    /// Rẽ nhánh điều kiện (VD: "Nếu tổng tiền > 10.000")
    Condition { field: String, operator: String, value: Value },
    
    /// Cập nhật dữ liệu vào một trường JSONB
    UpdateData { field: String, value: Value },
    
    /// Các khối AI / Trí tuệ nhân tạo (Built-in Magic Node)
    AiPredict { model: String, prompt_template: String },
    
    /// Các khối Blockchain (Built-in Magic Node)
    BlockchainAnchor { data_payload: Value },
    
    /// Webhook đẩy dữ liệu ra hệ thống ngoài
    WebhookCall { url: String, method: String },
    
    /// Gửi tin nhắn Zalo ZNS
    ZaloZNSNode { phone_number: String, template_id: String, template_data: Value },
}

/// Một Nút trong Đồ thị Workflow
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkflowNode {
    pub id: String,
    pub name: String,
    #[serde(flatten)]
    pub node_type: NodeType,
}

/// Giao tiếp giữa 2 Nút (Cạnh của đồ thị)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkflowEdge {
    pub source_id: String,
    pub target_id: String,
    /// Dùng cho các nút Condition để quyết định nhánh True / False
    pub condition_outcome: Option<bool>,
}

/// Định nghĩa toàn bộ một Workflow (Đồ thị DAG)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkflowDag {
    pub workflow_id: uuid::Uuid,
    pub nodes: Vec<WorkflowNode>,
    pub edges: Vec<WorkflowEdge>,
}

/// Kết quả trả về của một Node bất kỳ
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NodeResult {
    pub status: String,
    pub data: Option<Value>,
    pub error_code: Option<String>,
    pub message: Option<String>,
}

/// Ngữ cảnh chạy của một Workflow, chứa dữ liệu thay đổi qua từng Node
#[derive(Debug, Default)]
pub struct ExecutionContext {
    pub variables: HashMap<String, Value>,
}

impl ExecutionContext {
    /// Lấy giá trị biến theo đường dẫn (Ví dụ: "payload.patient_name")
    pub fn get_value_by_path(&self, path: &str) -> Option<Value> {
        let parts: Vec<&str> = path.split('.').collect();
        if parts.is_empty() { return None; }
        
        let mut current_val = self.variables.get(parts[0])?;
        for part in &parts[1..] {
            if let Some(obj) = current_val.as_object() {
                current_val = obj.get(*part)?;
            } else {
                return None;
            }
        }
        Some(current_val.clone())
    }

    /// Nội suy biến: Thay thế `${{ key.path }}` bằng giá trị thực
    pub fn interpolate_string(&self, template: &str) -> String {
        static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
        let re = RE.get_or_init(|| Regex::new(r"\$\{\{\s*([^}]+)\s*\}\}").unwrap());
        re.replace_all(template, |caps: &regex::Captures| {
            let path = caps.get(1).unwrap().as_str().trim();
            match self.get_value_by_path(path) {
                Some(Value::String(s)) => s,
                Some(v) => v.to_string(),
                None => format!("${{{}}}", path), // Giữ nguyên nếu không tìm thấy
            }
        }).to_string()
    }
}

/// Cỗ máy chạy Workflow chính
pub struct WorkflowRunner {
    pub dag: WorkflowDag,
}

impl WorkflowRunner {
    pub fn new(dag: WorkflowDag) -> Self {
        Self { dag }
    }

    /// Khởi chạy Workflow từ Nút Trigger
    pub async fn execute(&self, initial_payload: Value) -> Result<ExecutionContext, String> {
        let mut context = ExecutionContext::default();
        context.variables.insert("payload".to_string(), initial_payload);

        // Tìm Nút bắt đầu (Trigger Node)
        let trigger_node = self.dag.nodes.iter().find(|n| matches!(n.node_type, NodeType::Trigger { .. }));
        
        let mut current_node_id = match trigger_node {
            Some(n) => n.id.clone(),
            None => return Err("Workflow không có Trigger Node!".to_string()),
        };

        // Vòng lặp duyệt Đồ thị có hướng (DAG Execution Loop)
        loop {
            let node = self.dag.nodes.iter().find(|n| n.id == current_node_id)
                .ok_or_else(|| format!("Lỗi đồ thị: Không tìm thấy node {}", current_node_id))?;

            // 1. Thực thi Node hiện tại
            let outcome = self.execute_node(node, &mut context).await?;

            // 2. Tìm Node tiếp theo dựa trên kết quả (Edges)
            let next_edge = self.dag.edges.iter().find(|e| {
                e.source_id == current_node_id && (e.condition_outcome.is_none() || e.condition_outcome == outcome)
            });

            match next_edge {
                Some(edge) => current_node_id = edge.target_id.clone(),
                None => break, // Không còn nút nào tiếp theo -> Kết thúc quy trình
            }
        }

        Ok(context)
    }

    /// Thực thi Logic nghiệp vụ của từng loại Nút (Node)
    async fn execute_node(&self, node: &WorkflowNode, context: &mut ExecutionContext) -> Result<Option<bool>, String> {
        match &node.node_type {
            NodeType::Trigger { event_name } => {
                println!("[Workflow] Triggered by event: {}", event_name);
                Ok(None)
            }
            NodeType::Condition { field, operator, value } => {
                // 1. Nội suy biến
                let actual_field_val = context.interpolate_string(field);
                let actual_compare_val = if let Value::String(s) = value {
                    context.interpolate_string(s)
                } else {
                    value.to_string()
                };

                println!("[Workflow] Evaluating Condition: '{}' {} '{}'", actual_field_val, operator, actual_compare_val);
                
                // 2. Logic so sánh thực tế
                let outcome = match operator.as_str() {
                    "==" => actual_field_val == actual_compare_val,
                    "!=" => actual_field_val != actual_compare_val,
                    ">" => {
                        let a: f64 = actual_field_val.parse().unwrap_or(0.0);
                        let b: f64 = actual_compare_val.parse().unwrap_or(0.0);
                        a > b
                    },
                    "<" => {
                        let a: f64 = actual_field_val.parse().unwrap_or(0.0);
                        let b: f64 = actual_compare_val.parse().unwrap_or(0.0);
                        a < b
                    },
                    "contains" => actual_field_val.contains(&actual_compare_val),
                    _ => false,
                };
                
                Ok(Some(outcome)) 
            }
            NodeType::UpdateData { field, value } => {
                let actual_val = if let Value::String(s) = value {
                    Value::String(context.interpolate_string(s))
                } else {
                    value.clone()
                };
                println!("[Workflow] Action: Updating field '{}' to {}", field, actual_val);
                context.variables.insert(field.clone(), actual_val);
                Ok(None)
            }
            NodeType::AiPredict { model, prompt_template } => {
                let actual_prompt = context.interpolate_string(prompt_template);
                println!("[Workflow] Magic AI Node: Running model {} with prompt: {}", model, actual_prompt);
                
                // Simulate AI Auto-Triage extraction from unstructured text
                let priority_pred = if actual_prompt.to_lowercase().contains("khẩn cấp") || actual_prompt.to_lowercase().contains("urgent") {
                    "HIGH"
                } else {
                    "NORMAL"
                };

                let category_pred = if actual_prompt.to_lowercase().contains("hoá đơn") || actual_prompt.to_lowercase().contains("vat") || actual_prompt.to_lowercase().contains("thanh toán") {
                    "FINANCE"
                } else {
                    "OPERATIONS"
                };

                let ai_result = serde_json::json!({
                    "predicted_priority": priority_pred,
                    "predicted_category": category_pred,
                    "confidence_score": 0.92,
                    "model_used": model,
                    "rationale": format!("Extracted from prompt text using model {}", model)
                });

                // Lưu kết quả theo ID của Node vào context
                let res_key = format!("node_{}", node.id);
                context.variables.insert(res_key, ai_result);
                
                println!("[Workflow] AI Result: Priority={}, Category={}", priority_pred, category_pred);
                Ok(None)
            }
            NodeType::BlockchainAnchor { data_payload: _ } => {
                println!("[Workflow] Magic Blockchain Node: Anchoring data...");
                // Calculate a mock hash of the current payload
                let hash = crate::services::blockchain::compute_invoice_data_hash(
                    uuid::Uuid::new_v4(), // Mock ID for now
                    100.0,
                    "USD",
                    "COMPLETED"
                );
                let tx_hash = crate::services::blockchain::anchor_data_on_chain(&hash).await;
                
                let res_key = format!("node_{}", node.id);
                context.variables.insert(res_key, Value::String(tx_hash));
                Ok(None)
            }
            NodeType::WebhookCall { url, method } => {
                let actual_url = context.interpolate_string(url);
                println!("[Workflow] Action: Calling external Webhook {} {}", method, actual_url);
                Ok(None)
            }
            NodeType::ZaloZNSNode { phone_number, template_id, template_data } => {
                let actual_phone = context.interpolate_string(phone_number);
                let actual_template = context.interpolate_string(template_id);
                println!("[Workflow] Action: Sending Zalo ZNS to {}, template: {}", actual_phone, actual_template);
                Ok(None)
            }
        }
    }
}

/// Helper function to trigger a workflow based on an event
pub async fn trigger_workflow_for_event(
    pool: &sqlx::PgPool,
    tenant_id: uuid::Uuid,
    event_name: &str,
    payload: Value,
) -> Result<(), String> {
    // Tìm cấu hình Workflow từ DB
    let query = r#"
        SELECT dag_json 
        FROM nf_meta.workflow_definitions 
        WHERE tenant_id = $1 AND trigger_event = $2 AND is_active = true
        LIMIT 1
    "#;

    use sqlx::Row;
    let row = sqlx::query(query)
        .bind(tenant_id)
        .bind(event_name)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("DB Error: {}", e))?;

    if let Some(r) = row {
        let dag_json: Value = r.get("dag_json");
        let dag: WorkflowDag = serde_json::from_value(dag_json)
            .map_err(|e| format!("Invalid DAG JSON: {}", e))?;

        println!("[Workflow Engine] Found active workflow for event '{}'. Triggering...", event_name);
        
        let runner = WorkflowRunner::new(dag);
        // Trong hệ thống thực tế, ta nên đẩy cái này vào background task (VD: tokio::spawn)
        // Ở đây chạy await luôn để demo.
        match runner.execute(payload).await {
            Ok(context) => {
                println!("[Workflow Engine] Workflow completed successfully. Context: {:?}", context.variables.keys());
            }
            Err(e) => {
                println!("[Workflow Engine] Workflow failed: {}", e);
            }
        }
    } else {
        println!("[Workflow Engine] No active workflow found for event '{}'", event_name);
    }

    Ok(())
}

