use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use regex::Regex;
use std::sync::{Arc, OnceLock};
use tokio::sync::RwLock;

/// Định nghĩa một kết nối giữa các node theo chuẩn N8N JSON
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct N8nConnection {
    pub node: String,      // Tên (hoặc ID) của Node đích
    pub r#type: String,    // Loại kết nối (main)
    pub index: usize,      // Vị trí cổng (port)
}

/// Định nghĩa một Nút theo chuẩn N8N JSON
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct N8nNode {
    pub id: String,
    pub name: String,
    pub r#type: String,    // Ví dụ: "n8n-nodes-base.httpRequest"
    #[serde(default)]
    pub type_version: f64,
    #[serde(default)]
    pub position: [f64; 2],
    #[serde(default)]
    pub parameters: Value,
}

/// Định nghĩa toàn bộ Workflow theo chuẩn N8N JSON
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct N8nWorkflow {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub nodes: Vec<N8nNode>,
    #[serde(default)]
    // Map<SourceNodeName, Map<ConnectionType(main), List<List<Connection>>>>
    pub connections: HashMap<String, HashMap<String, Vec<Vec<N8nConnection>>>>,
}

/// Global In-Memory Cache cho Workflow DAGs
static WORKFLOW_REGISTRY: OnceLock<Arc<RwLock<HashMap<String, N8nWorkflow>>>> = OnceLock::new();

pub fn get_workflow_registry() -> Arc<RwLock<HashMap<String, N8nWorkflow>>> {
    WORKFLOW_REGISTRY.get_or_init(|| Arc::new(RwLock::new(HashMap::new()))).clone()
}

/// Lắng nghe tín hiệu từ DB và nạp lại toàn bộ Workflow lên RAM
pub async fn reload_all_workflows(pool: &sqlx::PgPool) -> Result<(), String> {
    println!("[Workflow Engine N8N] Reloading workflows into RAM...");
    let query = r#"
        SELECT tenant_id, trigger_event, dag_json 
        FROM nf_meta.workflow_definitions 
        WHERE is_active = true
    "#;
    
    use sqlx::Row;
    let rows = sqlx::query(query)
        .fetch_all(pool)
        .await
        .map_err(|e| format!("DB Error: {}", e))?;
        
    let mut new_cache = HashMap::new();
    for r in rows {
        let t_id: uuid::Uuid = r.get("tenant_id");
        let ev: String = r.get("trigger_event");
        let dag_json: Value = r.get("dag_json");
        
        // Cố gắng parse JSON thành chuẩn N8N
        if let Ok(dag) = serde_json::from_value::<N8nWorkflow>(dag_json) {
            let key = format!("{}:{}", t_id, ev);
            new_cache.insert(key, dag);
        } else {
            println!("[Workflow Engine N8N] Warning: Could not parse workflow {}:{} to N8N schema. Backward compatibility disabled.", t_id, ev);
        }
    }
    
    let registry = get_workflow_registry();
    let mut cache = registry.write().await;
    *cache = new_cache;
    println!("[Workflow Engine N8N] Successfully loaded {} active workflows to RAM.", cache.len());
    Ok(())
}

/// Ngữ cảnh chạy của một Workflow, chứa dữ liệu thay đổi qua từng Node
#[derive(Debug, Default)]
pub struct ExecutionContext {
    pub variables: HashMap<String, Value>,
}

impl ExecutionContext {
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

    pub fn interpolate_string(&self, template: &str) -> String {
        static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
        let re = RE.get_or_init(|| Regex::new(r"\$\{\{\s*([^}]+)\s*\}\}").unwrap());
        re.replace_all(template, |caps: &regex::Captures| {
            let path = caps.get(1).unwrap().as_str().trim();
            match self.get_value_by_path(path) {
                Some(Value::String(s)) => s,
                Some(v) => v.to_string(),
                None => format!("${{{}}}", path),
            }
        }).to_string()
    }
}

/// Cỗ máy chạy N8N Workflow
pub struct WorkflowRunner {
    pub workflow: N8nWorkflow,
}

impl WorkflowRunner {
    pub fn new(workflow: N8nWorkflow) -> Self {
        Self { workflow }
    }

    /// Khởi chạy Workflow từ Nút Webhook/Trigger đầu tiên
    pub async fn execute(&self, pool: sqlx::PgPool, tenant_id: uuid::Uuid, initial_payload: Value) -> Result<ExecutionContext, String> {
        let mut context = ExecutionContext::default();
        context.variables.insert("payload".to_string(), initial_payload);

        // Tìm Nút bắt đầu (Trigger Node) - chuẩn N8N có thể là n8n-nodes-base.webhook
        let trigger_node = self.workflow.nodes.iter().find(|n| {
            n.r#type.contains("webhook") || n.r#type.contains("trigger")
        });
        
        let mut current_node_name = match trigger_node {
            Some(n) => n.name.clone(),
            None => return Err("N8N Workflow không có Webhook/Trigger Node!".to_string()),
        };

        // Vòng lặp duyệt Đồ thị theo chuẩn n8n
        loop {
            let node = self.workflow.nodes.iter().find(|n| n.name == current_node_name)
                .ok_or_else(|| format!("Lỗi đồ thị: Không tìm thấy node {}", current_node_name))?;

            // 1. Thực thi Node hiện tại
            let outcome_port = self.execute_node(node, &mut context, &pool, tenant_id).await?;

            // 2. Tìm Node tiếp theo thông qua connections dict của n8n
            // Cấu trúc connections: { "Node Tên": { "main": [ [Connection Port 0], [Connection Port 1] ] } }
            if let Some(node_connections) = self.workflow.connections.get(&current_node_name) {
                if let Some(main_connections) = node_connections.get("main") {
                    // Chọn cổng output (outcome_port) tương ứng (default 0)
                    if outcome_port < main_connections.len() {
                        let next_nodes = &main_connections[outcome_port];
                        if !next_nodes.is_empty() {
                            // Chuyển sang node kế tiếp (đơn giản hóa: chỉ lấy node đầu tiên của cổng)
                            current_node_name = next_nodes[0].node.clone();
                            continue;
                        }
                    }
                }
            }
            
            // Không còn node nào tiếp theo
            break;
        }

        Ok(context)
    }

    /// Thực thi Logic nghiệp vụ của từng loại Nút (Node) theo type của n8n
    async fn execute_node(&self, node: &N8nNode, context: &mut ExecutionContext, pool: &sqlx::PgPool, tenant_id: uuid::Uuid) -> Result<usize, String> {
        match node.r#type.as_str() {
            "n8n-nodes-base.webhook" | "n8n-nodes-base.trigger" => {
                println!("[Workflow N8N] Triggered node: {}", node.name);
                Ok(0) // Luôn đi tiếp cổng 0
            }
            
            "n8n-nodes-base.if" => {
                // Đọc parameters: { conditions: { string: [{ value1, operation, value2 }] } }
                // Đơn giản hóa quá trình parse:
                let params = &node.parameters;
                let v1 = params.get("value1").and_then(|v| v.as_str()).unwrap_or("");
                let op = params.get("operation").and_then(|v| v.as_str()).unwrap_or("equal");
                let v2 = params.get("value2").and_then(|v| v.as_str()).unwrap_or("");
                
                let actual_v1 = context.interpolate_string(v1);
                let actual_v2 = context.interpolate_string(v2);

                println!("[Workflow N8N] IF Condition: '{}' {} '{}'", actual_v1, op, actual_v2);
                
                let is_true = match op {
                    "equal" | "==" => actual_v1 == actual_v2,
                    "notEqual" | "!=" => actual_v1 != actual_v2,
                    "contains" => actual_v1.contains(&actual_v2),
                    _ => false,
                };
                
                // N8n If Node: cổng 0 là True, cổng 1 là False
                if is_true { Ok(0) } else { Ok(1) }
            }
            
            "n8n-nodes-base.set" => {
                // Đọc parameters
                let field = node.parameters.get("field").and_then(|v| v.as_str()).unwrap_or("unknown_field");
                let value_str = node.parameters.get("value").and_then(|v| v.as_str()).unwrap_or("");
                
                let actual_val = context.interpolate_string(value_str);
                println!("[Workflow N8N] SET Action: Updating field '{}' to {}", field, actual_val);
                
                context.variables.insert(field.to_string(), Value::String(actual_val));
                Ok(0)
            }
            
            "n8n-nodes-base.httpRequest" => {
                let url = node.parameters.get("url").and_then(|v| v.as_str()).unwrap_or("");
                let method = node.parameters.get("method").and_then(|v| v.as_str()).unwrap_or("GET");
                
                let actual_url = context.interpolate_string(url);
                println!("[Workflow N8N] HTTP Action: Calling external {} {}", method, actual_url);
                
                Ok(0)
            }
            
            "nextflow.aiPredict" => {
                let model = node.parameters.get("model").and_then(|v| v.as_str()).unwrap_or("gpt-3.5");
                let prompt = node.parameters.get("prompt").and_then(|v| v.as_str()).unwrap_or("");
                
                let actual_prompt = context.interpolate_string(prompt);
                println!("[Workflow N8N] AI Node: Running model {} with prompt: {}", model, actual_prompt);
                
                // Call real AI service using reqwest
                let client = reqwest::Client::new();
                let res = client.post("http://nextflow-ai-service:8001/predict")
                    .json(&serde_json::json!({
                        "model": model,
                        "prompt": actual_prompt
                    }))
                    .send()
                    .await;
                
                let ai_result = match res {
                    Ok(resp) if resp.status().is_success() => {
                        let json: Value = resp.json().await.unwrap_or_default();
                        json
                    },
                    _ => {
                        serde_json::json!({
                            "error": "AI Service unavailable, using fallback"
                        })
                    }
                };

                let res_key = format!("node_{}", node.id);
                context.variables.insert(res_key, ai_result);
                Ok(0)
            }
            
            "nextflow.blockchainAnchor" => {
                let data_str = node.parameters.get("dataPayload").and_then(|v| v.as_str()).unwrap_or("");
                
                println!("[Workflow N8N] Blockchain Node: Anchoring data...");
                let actual_str = context.interpolate_string(data_str);
                let payload_val = serde_json::from_str(&actual_str).unwrap_or(Value::String(actual_str));
                
                let hash_target = context.get_value_by_path("payload").unwrap_or(payload_val);
                
                let hash = crate::services::blockchain::compute_data_hash(&hash_target);
                let tx_hash = crate::services::blockchain::anchor_data_on_chain(pool, tenant_id, &hash, &hash_target).await;
                
                let res_key = format!("node_{}", node.id);
                context.variables.insert(res_key, Value::String(tx_hash));
                Ok(0)
            }
            
            "nextflow.zaloZNS" => {
                let phone = node.parameters.get("phone").and_then(|v| v.as_str()).unwrap_or("");
                let template = node.parameters.get("templateId").and_then(|v| v.as_str()).unwrap_or("");
                
                let actual_phone = context.interpolate_string(phone);
                let actual_template = context.interpolate_string(template);
                println!("[Workflow N8N] Action: Sending Zalo ZNS to {}, template: {}", actual_phone, actual_template);
                Ok(0)
            }
            
            _ => {
                println!("[Workflow N8N] Unknown Node Type: {}", node.r#type);
                Ok(0)
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
    let key = format!("{}:{}", tenant_id, event_name);
    
    // Đọc từ In-Memory Cache (RAM) thay vì truy vấn DB
    let registry = get_workflow_registry();
    let wf_opt = {
        let cache = registry.read().await;
        cache.get(&key).cloned()
    };

    if let Some(workflow) = wf_opt {
        println!("[Workflow Engine N8N] Found active N8N workflow for event '{}'. Triggering Background Async Task...", event_name);
        
        let runner = WorkflowRunner::new(workflow);
        let pool_clone = pool.clone();
        
        tokio::spawn(async move {
            match runner.execute(pool_clone, tenant_id, payload).await {
                Ok(context) => {
                    println!("[Workflow Engine N8N] Background Workflow completed successfully. Context Keys: {:?}", context.variables.keys());
                }
                Err(e) => {
                    println!("[Workflow Engine N8N] Background Workflow failed: {}", e);
                }
            }
        });
    } else {
        println!("[Workflow Engine N8N] No active workflow found in RAM for event '{}'", event_name);
    }

    Ok(())
}
