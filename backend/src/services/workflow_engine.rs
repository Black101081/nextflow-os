use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

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

/// Ngữ cảnh chạy của một Workflow, chứa dữ liệu thay đổi qua từng Node
#[derive(Debug, Default)]
pub struct ExecutionContext {
    pub variables: HashMap<String, Value>,
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
                Ok(None) // Trigger không rẽ nhánh
            }
            NodeType::Condition { field, operator, value } => {
                println!("[Workflow] Evaluating Condition: {} {} {}", field, operator, value);
                // Giả lập Logic rẽ nhánh (True/False)
                // Trong thực tế, Engine sẽ parse biến từ context.variables["payload"]
                Ok(Some(true)) 
            }
            NodeType::UpdateData { field, value } => {
                println!("[Workflow] Action: Updating field '{}' to {}", field, value);
                context.variables.insert(field.clone(), value.clone());
                Ok(None)
            }
            NodeType::AiPredict { model, prompt_template } => {
                println!("[Workflow] Magic AI Node: Running model {} with prompt {}", model, prompt_template);
                // Gọi tới Module Intelligence có sẵn của Nextflow
                context.variables.insert("ai_result".to_string(), Value::String("AI Đã duyệt".to_string()));
                Ok(None)
            }
            NodeType::BlockchainAnchor { data_payload: _ } => {
                println!("[Workflow] Magic Blockchain Node: Anchoring data...");
                // Kích hoạt hàm Ký Hash lên mạng U2U Network
                context.variables.insert("tx_hash".to_string(), Value::String("0xABC123...".to_string()));
                Ok(None)
            }
            NodeType::WebhookCall { url, method } => {
                println!("[Workflow] Action: Calling external Webhook {} {}", method, url);
                Ok(None)
            }
        }
    }
}
