import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Save, CheckCircle, Wand2, Loader2, GitBranch, MessageCircle, Globe, Settings, X } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';

import TriggerNode from '../components/workflow/TriggerNode';
import ConditionNode from '../components/workflow/ConditionNode';
import ZaloActionNode from '../components/workflow/ZaloActionNode';
import HttpActionNode from '../components/workflow/HttpActionNode';

const nodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  zaloNode: ZaloActionNode,
  httpNode: HttpActionNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'triggerNode', position: { x: 50, y: 150 }, data: { label: 'Khách hàng lên đơn' } }
];

export default function WorkflowBuilder() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  
  const [workflowName, setWorkflowName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('ORDER_CREATED');
  
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error' | 'generating'; message: string }>({ type: 'idle', message: '' });
  const [aiPrompt, setAiPrompt] = useState('');

  const loadTemplate = (type: 'zalo' | 'webhook') => {
    if (type === 'zalo') {
      setWorkflowName('Gửi Zalo ZNS khi có Đơn hàng');
      setTriggerEvent('ORDER_CREATED');
      setNodes([
        { id: '1', type: 'triggerNode', position: { x: 100, y: 50 }, data: { label: 'Đơn hàng được tạo (KiotViet)' } },
        { id: '2', type: 'zaloNode', position: { x: 100, y: 200 }, data: { phone: '0984556782', templateId: 'tpl_order_confirm', text: 'Cảm ơn anh/chị đã đặt hàng!' } }
      ]);
      setEdges([
        { id: 'e1-2', source: '1', target: '2' }
      ]);
    } else {
      setWorkflowName('Webhook cảnh báo Trễ Hạn SLA');
      setTriggerEvent('ORDER_STATUS_CHANGED');
      setNodes([
        { id: '1', type: 'triggerNode', position: { x: 100, y: 50 }, data: { label: 'Đơn hàng Trễ Hạn (SLA Breach)' } },
        { id: '2', type: 'conditionNode', position: { x: 100, y: 200 }, data: { expression: 'Total > 1000000' } },
        { id: '3', type: 'httpNode', position: { x: 100, y: 350 }, data: { url: 'https://api.crm.sme/webhook', method: 'POST' } }
      ]);
      setEdges([
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
      ]);
    }
  };
  
  // Properties Panel State
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const handleUpdateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = {
            ...node,
            data: { ...node.data, [key]: value },
          };
          setSelectedNode(updatedNode); // Update local selected node
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleSave = async () => {
    setStatus({ type: 'saving', message: 'Đang lưu quy trình...' });
    try {
      const payload = {
        name: workflowName || 'Untitled Workflow',
        trigger_event: triggerEvent,
        dag_json: { nodes, edges }
      };

      await apiService.createWorkflow(auth, payload);
      
      setStatus({ type: 'success', message: 'Lưu Workflow thành công!' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Lỗi khi lưu Workflow.' });
    }
  };

  const addNode = (type: string, label: string) => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode: Node = {
      id: newNodeId,
      type,
      position: { x: 300 + Math.random() * 50, y: 150 + Math.random() * 50 },
      data: { label }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setStatus({ type: 'generating', message: 'Đang dùng AI để sinh sơ đồ...' });
    try {
      const result = await apiService.generateWorkflowAI(auth, aiPrompt);
      if (result.nodes && result.edges) {
        setNodes(result.nodes);
        setEdges(result.edges);
        setStatus({ type: 'success', message: 'Sinh quy trình bằng AI thành công!' });
      } else {
        throw new Error('Dữ liệu AI trả về không hợp lệ');
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Lỗi khi sinh quy trình bằng AI.' });
    }
    setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px' }}>
      
      {/* Sidebar: Toolbar */}
      <div className="panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>Node Palette</h2>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Logic</h3>
          <button onClick={() => addNode('conditionNode', 'IF / ELSE')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            <GitBranch size={16} color="#f59e0b" /> Condition (IF/ELSE)
          </button>
          
          <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '16px', marginBottom: '4px' }}>Actions</h3>
          <button onClick={() => addNode('zaloNode', 'Gửi Zalo ZNS')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            <MessageCircle size={16} color="#0068ff" /> Zalo ZNS
          </button>
          <button onClick={() => addNode('approvalNode', 'Yêu cầu Phê Duyệt')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            <CheckCircle size={16} color="#10b981" /> Node Phê Duyệt
          </button>
          <button onClick={() => addNode('httpNode', 'HTTP Webhook')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            <Globe size={16} color="#8b5cf6" /> HTTP Request
          </button>
          <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '16px', marginBottom: '4px' }}>Mẫu nhanh (Presets)</h3>
          <button 
            onClick={() => loadTemplate('zalo')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', width: '100%', textAlign: 'left' }}
          >
            Mẫu Zalo ZNS Đơn Mới
          </button>
          <button 
            onClick={() => loadTemplate('webhook')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontSize: '12px', width: '100%', textAlign: 'left', marginTop: '8px' }}
          >
            Mẫu Webhook Trễ SLA
          </button>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tên Workflow</label>
            <input 
              type="text" 
              className="form-input" 
              value={workflowName} 
              onChange={e => setWorkflowName(e.target.value)} 
              placeholder="VD: Cảm ơn khách hàng" 
              style={{ fontSize: '13px', padding: '8px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sự kiện kích hoạt (Trigger)</label>
            <select 
              className="form-input" 
              value={triggerEvent} 
              onChange={e => setTriggerEvent(e.target.value)}
              style={{ fontSize: '13px', padding: '8px', background: '#0f172a' }}
            >
              <option value="ORDER_CREATED">Khi có Đơn hàng mới</option>
              <option value="ORDER_STATUS_CHANGED">Khi Đơn hàng đổi trạng thái</option>
              <option value="PAYMENT_RECEIVED">Khi nhận được Thanh toán</option>
              <option value="SCHEDULED">Theo lịch trình (Cron)</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={status.type === 'saving'}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {status.type === 'saving' ? <Loader2 size={16} className="spinner-icon" /> : <Save size={16} />} 
            {status.type === 'saving' ? ' Đang lưu...' : ' Lưu Workflow'}
          </button>

          {status.message && (
            <div style={{ 
              marginTop: '12px', fontSize: '12px', padding: '8px', borderRadius: '4px', textAlign: 'center',
              background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: status.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              {status.message}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* AI Generator Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center', background: '#1e293b' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Wand2 size={18} color="#8b5cf6" />
            <input
              type="text"
              placeholder="Bạn muốn tự động hoá việc gì? (VD: Gửi Zalo ZNS khi đơn hàng có giá trị > 1 triệu đồng...)"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }}
              disabled={status.type === 'generating'}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            onClick={handleGenerateAI}
            disabled={status.type === 'generating'}
          >
            {status.type === 'generating' ? <Loader2 size={16} className="spinner-icon" /> : <Wand2 size={16} />}
            Tạo bằng AI
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: '#0b0c10' }}
        >
          <Controls style={{ background: '#1e293b', fill: '#fff', border: 'none' }} />
          <MiniMap style={{ background: '#1e293b' }} maskColor="rgba(0,0,0,0.5)" nodeColor="#3b82f6" />
          <Background gap={16} size={1} color="rgba(255,255,255,0.05)" />
        </ReactFlow>

        {/* Properties Panel (Overlay on right side of canvas) */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '320px',
            background: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Cấu hình Node</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tên hiển thị</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={selectedNode.data.label as string || ''}
                  onChange={e => handleUpdateNodeData('label', e.target.value)}
                  style={{ fontSize: '13px', padding: '8px' }}
                />
              </div>

              {selectedNode.type === 'conditionNode' && (
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biểu thức điều kiện (JS eval)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedNode.data.expression as string || ''}
                    onChange={e => handleUpdateNodeData('expression', e.target.value)}
                    placeholder="VD: order.amount > 100000"
                    style={{ fontSize: '13px', padding: '8px', fontFamily: 'monospace' }}
                  />
                  <small style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Kết quả trả về True/False để điều hướng nhánh.
                  </small>
                </div>
              )}

              {selectedNode.type === 'zaloNode' && (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zalo Template ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedNode.data.templateId as string || ''}
                      onChange={e => handleUpdateNodeData('templateId', e.target.value)}
                      placeholder="VD: 123456"
                      style={{ fontSize: '13px', padding: '8px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biến truyền vào (JSON)</label>
                    <textarea 
                      className="form-input" 
                      value={selectedNode.data.templateData as string || ''}
                      onChange={e => handleUpdateNodeData('templateData', e.target.value)}
                      placeholder='{"customer_name": "{{order.customer}}", "amount": "{{order.amount}}"}'
                      style={{ fontSize: '13px', padding: '8px', minHeight: '80px', fontFamily: 'monospace' }}
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'httpNode' && (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Method & URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="form-input" 
                        value={selectedNode.data.method as string || 'POST'}
                        onChange={e => handleUpdateNodeData('method', e.target.value)}
                        style={{ fontSize: '13px', padding: '8px', width: '80px' }}
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                      </select>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={selectedNode.data.url as string || ''}
                        onChange={e => handleUpdateNodeData('url', e.target.value)}
                        placeholder="https://api.example.com/..."
                        style={{ fontSize: '13px', padding: '8px', flex: 1 }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payload (JSON)</label>
                    <textarea 
                      className="form-input" 
                      value={selectedNode.data.payload as string || ''}
                      onChange={e => handleUpdateNodeData('payload', e.target.value)}
                      placeholder='{"id": "{{order.id}}"}'
                      style={{ fontSize: '13px', padding: '8px', minHeight: '80px', fontFamily: 'monospace' }}
                    />
                  </div>
                </>
              )}

            </div>
          </div>
        )}
        </div>
      </div>

      <style>{`
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Override React Flow Controls styling for dark mode */
        .react-flow__controls-button {
          background-color: #334155 !important;
          border-bottom-color: #1e293b !important;
        }
        .react-flow__controls-button svg {
          fill: #f8fafc !important;
        }
        .react-flow__controls-button:hover {
          background-color: #475569 !important;
        }
      `}</style>
    </div>
  );
}
