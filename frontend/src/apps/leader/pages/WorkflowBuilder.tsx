import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeChange, EdgeChange, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Save, Wand2, Loader2, GitBranch, MessageCircle, Globe, Settings, X, BrainCircuit, ShieldCheck, ChevronRight, Play } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import TriggerNode from '../components/workflow/TriggerNode';
import ConditionNode from '../components/workflow/ConditionNode';
import ZaloActionNode from '../components/workflow/ZaloActionNode';
import HttpActionNode from '../components/workflow/HttpActionNode';
import AiAgentNode from '../components/workflow/AiAgentNode';
import SmartContractNode from '../components/workflow/SmartContractNode';

const nodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  zaloNode: ZaloActionNode,
  httpNode: HttpActionNode,
  aiAgentNode: AiAgentNode,
  smartContractNode: SmartContractNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'triggerNode', position: { x: 50, y: 300 }, data: { label: 'Khách hàng lên đơn' } }
];

function WorkflowBuilderInternal() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [workflowName, setWorkflowName] = useState('My Automation Rule');
  const [triggerEvent] = useState('ORDER_CREATED');
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error' | 'generating' | 'testing'; message: string }>({ type: 'idle', message: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [showLogsConsole, setShowLogsConsole] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'trace' | 'sandbox' | 'agent'>('trace');
  const [sandboxTemplate, setSandboxTemplate] = useState('spa_complaint');
  const [sandboxPayload, setSandboxPayload] = useState(JSON.stringify({
    customer: "Nguyễn Văn A",
    phone: "0984.556.782",
    incident: "Trễ liệu trình spa 45 phút",
    vip_tier: "GOLD",
    claimed_points: 150
  }, null, 2));
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Add animated edge style with glow
      const animatedEdge = {
        ...params,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #8b5cf6)' }
      };
      setEdges((eds) => addEdge(animatedEdge, eds));
    },
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
          setSelectedNode(updatedNode); 
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleSave = async () => {
    setStatus({ type: 'saving', message: 'Đang lưu quy trình...' });
    try {
      // Chuyển đổi React Flow sang N8N format
      const n8nNodes = nodes.map(node => {
        let n8nType = 'unknown';
        switch (node.type) {
          case 'triggerNode': n8nType = 'n8n-nodes-base.trigger'; break;
          case 'conditionNode': n8nType = 'n8n-nodes-base.if'; break;
          case 'httpNode': n8nType = 'n8n-nodes-base.httpRequest'; break;
          case 'zaloNode': n8nType = 'nextflow.zaloZNS'; break;
          case 'aiAgentNode': n8nType = 'nextflow.aiPredict'; break;
          case 'smartContractNode': n8nType = 'nextflow.blockchainAnchor'; break;
        }
        return {
          id: node.id,
          name: node.id, // N8N uses names for connections, so we use ID as unique name
          type: n8nType,
          typeVersion: 1.0,
          position: [node.position.x, node.position.y],
          parameters: { ...node.data }
        };
      });

      const connections: Record<string, any> = {};
      edges.forEach(edge => {
        if (!connections[edge.source]) {
          connections[edge.source] = { main: [] };
        }
        
        const mainArray = connections[edge.source].main;
        
        let portIndex = 0;
        if (edge.sourceHandle === 'false-port' || edge.sourceHandle === 'false') {
          portIndex = 1;
        }

        while (mainArray.length <= portIndex) {
          mainArray.push([]);
        }

        mainArray[portIndex].push({
          node: edge.target,
          type: 'main',
          index: 0
        });
      });

      const payload = {
        name: workflowName || 'Untitled Workflow',
        trigger_event: triggerEvent,
        dag_json: { 
          nodes: n8nNodes, 
          connections 
        }
      };

      await apiService.createWorkflow(auth, payload);
      
      setStatus({ type: 'success', message: 'Lưu N8N Workflow thành công!' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Lỗi khi lưu Workflow.' });
    }
  };

  // --- DRAG AND DROP TO SPAWN NODES ---
  const onDragStart = (event: React.DragEvent, nodeType: string, defaultLabel: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label: defaultLabel }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeDataStr = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeDataStr || !reactFlowInstance || !reactFlowBounds) return;

      const { type, label } = JSON.parse(nodeDataStr);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNodeId = (nodes.length + 1).toString() + Date.now().toString();
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes]
  );

  // --- AI GENERATOR WITH STAGGERED REVEAL ---
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setStatus({ type: 'generating', message: 'AI đang biên dịch sơ đồ mạch...' });
    
    // 1. Clear current canvas
    setNodes([]);
    setEdges([]);

    try {
      const payload = { prompt: aiPrompt };
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/generate-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.apiKey}`,
          'X-Tenant-ID': auth.tenantId,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      
      const targetNodes = data.nodes || [];
      const targetEdges = data.edges || [];

      // 3. Staggered reveal
      let i = 0;
      const interval = setInterval(() => {
        if (i < targetNodes.length) {
          setNodes(nds => [...nds, targetNodes[i]]);
        } else if (i < targetNodes.length + targetEdges.length) {
          setEdges(eds => [...eds, targetEdges[i - targetNodes.length]]);
        } else {
          clearInterval(interval);
          setStatus({ type: 'success', message: data.message || 'Mạch liên kết hoàn tất!' });
          setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
        }
        i++;
      }, 400);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Lỗi khi gọi AI Generator' });
    }
  };

  // --- DYNAMIC FLOW SANDBOX TEMPLATE ---
  const handleTemplateChange = (tpl: string) => {
    setSandboxTemplate(tpl);
    let payload = {};
    if (tpl === 'spa_complaint') {
      payload = {
        customer: "Nguyễn Văn A",
        phone: "0984.556.782",
        incident: "Trễ liệu trình spa 45 phút",
        vip_tier: "GOLD",
        claimed_points: 150
      };
    } else if (tpl === 'fnb_order') {
      payload = {
        customer: "Trần Thị B",
        phone: "0912.334.455",
        action: "ORDER_CONFIRM",
        items: [
          { name: "Cà phê Muối", qty: 2, price: 45000 }
        ],
        pos_store_id: "POS-KV-889"
      };
    } else if (tpl === 'blockchain_delay') {
      payload = {
        tx_hash: "0x5d9b1c9f...f4e8",
        action: "AUDIT_RETRY",
        wallet: "0xU2U...f4A9",
        status: "TX_PENDING",
        block_delta: 45
      };
    }
    setSandboxPayload(JSON.stringify(payload, null, 2));
  };

  const agentLogs: Record<string, Array<{ time: string; sender: string; color: string; msg: string }>> = {
    spa_complaint: [
      { time: "10:00:01", sender: "Triage Agent", color: "text-purple-400", msg: "Phát hiện khiếu nại dị ứng/trễ liệu trình từ Zalo OA. Khởi động quy trình phân loại." },
      { time: "10:00:02", sender: "Risk Manager Agent", color: "text-red-400", msg: "Khách hàng GOLD hạng ưu tiên. Đã kiểm tra lịch sử 0 vi phạm. Phê duyệt hạn mức đền bù tối đa: 150 NFTk." },
      { time: "10:00:03", sender: "Loyalty Tokenomics Agent", color: "text-emerald-400", msg: "Ký giao dịch mint +150 NFTk lên U2U Network. Giao dịch thành công. TxHash: 0x9f5c...12b4" },
      { time: "10:00:04", sender: "POS Sync Agent", color: "text-blue-400", msg: "Đồng bộ hóa ghi nhận hoàn tiền đối soát lên KiotViet POS." }
    ],
    fnb_order: [
      { time: "11:12:00", sender: "Triage Agent", color: "text-purple-400", msg: "Khách hàng đặt món thành công trên Zalo OA. Khởi chạy luồng chốt đơn tự động." },
      { time: "11:12:01", sender: "POS Sync Agent", color: "text-blue-400", msg: "Đẩy đơn hàng sang POS KiotViet. Kho hàng kiểm tra: ĐỦ nguyên liệu. Trạng thái: CONFIRMED." },
      { time: "11:12:02", sender: "Loyalty Tokenomics Agent", color: "text-emerald-400", msg: "Tích lũy 5% Cashback: +4,500 NFTk đã được phân bổ cho khách hàng." }
    ],
    blockchain_delay: [
      { time: "14:05:10", sender: "Risk Manager Agent", color: "text-red-400", msg: "Cảnh báo: Phát hiện độ trễ xác thực giao dịch đền bù 45 blocks. Bắt đầu audit." },
      { time: "14:05:11", sender: "Loyalty Tokenomics Agent", color: "text-emerald-400", msg: "Giao dịch bị nghẽn gas. Tiến hành gửi lại giao dịch thay thế với Gas Price cao hơn (+20%)." },
      { time: "14:05:12", sender: "Triage Agent", color: "text-purple-400", msg: "Giao dịch thay thế thành công. Đã gửi Zalo ZNS thông báo xin lỗi độ trễ tới khách hàng." }
    ]
  };

  // --- TEST RUN SIMULATION ---
  const handleTestRun = () => {
    setStatus({ type: 'testing', message: 'Đang giả lập dòng chảy dữ liệu...' });
    setExecutionLogs([]);
    setShowLogsConsole(true);
    
    // Simulate fast flow: edges light up quickly one by one
    setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, stroke: '#64748b', filter: 'none' }, animated: false })));
    
    let step = 0;
    
    let logs: string[] = [];
    if (sandboxTemplate === 'spa_complaint') {
      logs = [
        "10:00:01 - 🟢 [Trigger] Nhận sự kiện khiếu nại trễ liệu trình Spa.",
        "10:00:02 - 🧠 [AI Agent] Phân tích hội thoại. Phân loại: TRỄ_SLA (Độ tin cậy 99%).",
        "10:00:03 - 🔀 [Condition] SLA > 30 phút? -> Đúng. Chuyển sang nhánh bồi thường.",
        "10:00:04 - ⛓️ [Smart Contract] Gọi Smart Contract U2U đền bù: +150 NFTk. TxHash: 0x9f5c...",
        "10:00:05 - 💬 [Zalo ZNS] Đã gửi thông báo bồi hoàn tới Zalo số 0984.556.782.",
        "10:00:06 - 🎉 [System] Luồng chạy thành công 100%!"
      ];
    } else if (sandboxTemplate === 'fnb_order') {
      logs = [
        "11:12:00 - 🟢 [Trigger] Zalo OA Webhook: Nhận tin nhắn đặt món từ Trần Thị B.",
        "11:12:01 - 🧠 [AI Agent] Nhận diện món đặt: 'Cà phê Muối x2'.",
        "11:12:02 - 🔗 [POS Link] Đẩy đơn KiotViet POS: Khởi tạo đơn hàng nháp.",
        "11:12:03 - 💬 [Zalo ZNS] Gửi bill thanh toán QR qua Zalo OA.",
        "11:12:04 - 🎉 [System] Nhận đơn F&B thành công!"
      ];
    } else {
      logs = [
        "14:05:10 - 🟢 [Trigger] U2U Event: Phát hiện block trễ đền bù.",
        "14:05:11 - 🧠 [AI Agent] Chẩn đoán: Nghẽn mạng U2U Network.",
        "14:05:12 - ⛓️ [Smart Contract] Gửi lại transaction với phí Gas cao hơn.",
        "14:05:13 - 🎉 [System] Audit hoàn tất. Mạng U2U đã thông suốt."
      ];
    }

    const testInterval = setInterval(() => {
      if (step === 0) {
        setEdges(eds => eds.map(e => e.id === 'e1-2' ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 4, filter: 'drop-shadow(0 0 10px #fbbf24)' } } : e));
        setExecutionLogs(prev => [...prev, logs[0]]);
      } else if (step === 1) {
        setEdges(eds => eds.map(e => {
          if (e.id === 'e1-2') return { ...e, animated: false, style: { stroke: '#34d399', strokeWidth: 3, filter: 'none' } };
          if (e.id === 'e2-3') return { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 4, filter: 'drop-shadow(0 0 10px #fbbf24)' } };
          return e;
        }));
        setExecutionLogs(prev => [...prev, logs[1]]);
      } else if (step === 2) {
        setEdges(eds => eds.map(e => {
          if (e.id === 'e2-3') return { ...e, animated: false, style: { stroke: '#34d399', strokeWidth: 3, filter: 'none' } };
          if (e.id === 'e3-4' || e.id === 'e3-5') return { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 4, filter: 'drop-shadow(0 0 10px #fbbf24)' } };
          return e;
        }));
        setExecutionLogs(prev => [...prev, logs[2] || '', logs[3] || '']);
      } else if (step === 3) {
        setEdges(eds => eds.map(e => ({ ...e, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #8b5cf6)' } })));
        setExecutionLogs(prev => [...prev, logs[4] || '', logs[5] || '']);
        setStatus({ type: 'idle', message: '' });
        clearInterval(testInterval);
      }
      step++;
    }, 800);
  };

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-[#0a0f1c] text-slate-200 font-['Outfit']">
      
      {/* 1. FULL SCREEN CANVAS */}
      <div className="absolute inset-0 z-0" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          {/* Cyberpunk Grid Background */}
          <Background gap={40} size={1} color="#1e293b" style={{ backgroundColor: '#050a15' }} />
          
          <Controls style={{ background: 'rgba(30,41,59,0.8)', fill: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', backdropFilter: 'blur(10px)' }} />
          
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'triggerNode': return '#fbbf24';
                case 'conditionNode': return '#f43f5e';
                case 'aiAgentNode': return '#a855f7';
                case 'smartContractNode': return '#f97316';
                default: return '#38bdf8';
              }
            }}
            nodeStrokeWidth={3}
            zoomable pannable
            style={{ 
              background: 'rgba(15,23,42,0.8)', 
              backdropFilter: 'blur(10px)', 
              borderRadius: '16px', 
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          />
        </ReactFlow>

        {/* Laser Grid Scanner Effect */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute left-0 w-full h-1 bg-indigo-500/30 blur-[2px] pointer-events-none z-0"
        />
      </div>

      {/* 2. AI COMMAND SPOTLIGHT (Top Center) */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl flex flex-col items-center gap-2"
      >
        <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-indigo-500/50 rounded-2xl p-2.5 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex gap-3 items-center w-full relative overflow-hidden">
          {/* Animated glow border */}
          <div className="absolute inset-0 border-2 border-transparent rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)' }}></div>
          
          <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 shrink-0">
            {status.type === 'generating' ? <Loader2 size={24} className="animate-spin" /> : <Wand2 size={24} />}
          </div>
          <input
            type="text"
            placeholder="AI Prompt: Tạo luồng xử lý tự động..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
            className="flex-1 bg-transparent border-none text-white text-lg font-bold tracking-wide outline-none placeholder:text-slate-600 px-2 min-w-0"
            disabled={status.type === 'generating' || status.type === 'testing'}
          />
          <button 
            onClick={handleGenerateAI}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0"
          >
            GENERATE
          </button>
        </div>
        
        {/* Status Indicator */}
        <AnimatePresence>
          {status.message && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`text-sm font-bold py-1.5 px-6 rounded-full border shadow-lg backdrop-blur-md uppercase tracking-widest
                ${status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                  status.type === 'testing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  status.type === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 
                  'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
            >
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. FLOATING NODE PALETTE (Left Side) */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: isPaletteOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-28 left-6 z-10 w-[280px] bottom-6 flex flex-col"
      >
        <div className="flex-1 bg-[#0f172a]/90 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
          
          <button 
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="absolute top-1/2 -right-4 -translate-y-1/2 bg-indigo-600 text-white p-1 rounded-full border border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-20 hover:scale-110 transition-transform"
          >
            <ChevronRight size={16} className={`transform transition-transform ${isPaletteOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="p-5 border-b border-indigo-500/20 flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg"><Network className="text-indigo-400" size={20} /></div>
            <h2 className="font-black text-white tracking-widest uppercase text-sm">Components</h2>
          </div>

          <div className="p-5 flex-1 overflow-y-auto hide-scrollbar space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Logic / Routing</h3>
              <div className="space-y-3">
                <div 
                  draggable 
                  onDragStart={(e) => onDragStart(e, 'conditionNode', 'IF / ELSE')}
                  className="w-full flex items-center gap-3 p-3 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-slate-700 hover:border-amber-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400"><GitBranch size={16} /></div>
                  <span className="font-bold text-sm text-slate-300 group-hover:text-amber-400 transition-colors">Condition (If/Else)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Action Output</h3>
              <div className="space-y-3">
                <div 
                  draggable onDragStart={(e) => onDragStart(e, 'zaloNode', 'Gửi Zalo ZNS')}
                  className="w-full flex items-center gap-3 p-3 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-slate-700 hover:border-blue-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><MessageCircle size={16} /></div>
                  <span className="font-bold text-sm text-slate-300 group-hover:text-blue-400 transition-colors">Gửi Zalo ZNS</span>
                </div>
                <div 
                  draggable onDragStart={(e) => onDragStart(e, 'httpNode', 'HTTP Webhook')}
                  className="w-full flex items-center gap-3 p-3 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-slate-700 hover:border-emerald-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Globe size={16} /></div>
                  <span className="font-bold text-sm text-slate-300 group-hover:text-emerald-400 transition-colors">HTTP Webhook</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                Superpowers <div className="px-2 py-0.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[9px] rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]">PRO</div>
              </h3>
              <div className="space-y-3">
                <div 
                  draggable onDragStart={(e) => onDragStart(e, 'aiAgentNode', 'AI Phân tích')}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-br from-[#1e293b]/50 to-[#1e293b]/50 hover:from-purple-900/40 hover:to-indigo-900/40 border border-slate-700 hover:border-purple-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><BrainCircuit size={16} /></div>
                  <span className="font-bold text-sm text-slate-300 group-hover:text-purple-300 transition-colors">AI Agent Core</span>
                </div>
                <div 
                  draggable onDragStart={(e) => onDragStart(e, 'smartContractNode', 'Smart Contract')}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-br from-[#1e293b]/50 to-[#1e293b]/50 hover:from-orange-900/40 hover:to-amber-900/40 border border-slate-700 hover:border-orange-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400"><ShieldCheck size={16} /></div>
                  <span className="font-bold text-sm text-slate-300 group-hover:text-orange-300 transition-colors">Web3 Contract</span>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-slate-500 italic mt-4">Kéo thẻ và thả vào lưới</p>
          </div>

          <div className="p-5 border-t border-indigo-500/20 bg-[#050a15]/80 space-y-3">
            <button
              onClick={handleTestRun}
              disabled={status.type === 'testing'}
              className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Play size={18} fill="currentColor" /> TEST RUN
            </button>
            <button
              onClick={handleSave}
              disabled={status.type === 'saving'}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] tracking-widest uppercase"
            >
              {status.type === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
              DEPLOY
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4. FLOATING PROPERTIES PANEL (Right Side) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            className="absolute top-28 right-6 z-10 w-[340px] bottom-6 flex flex-col bg-[#0f172a]/95 backdrop-blur-2xl border border-indigo-500/40 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden"
          >
            <div className="p-5 border-b border-indigo-500/20 flex items-center justify-between bg-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm tracking-widest uppercase">Node Config</h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">{selectedNode.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6 hide-scrollbar">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Display Label</label>
                <input 
                  type="text" 
                  className="w-full bg-[#050a15] border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors"
                  value={selectedNode.data.label as string || ''}
                  onChange={e => handleUpdateNodeData('label', e.target.value)}
                />
              </div>

              {selectedNode.type === 'conditionNode' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-amber-400 uppercase tracking-widest">JS Expression</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#050a15] border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-400 font-mono focus:border-amber-500 outline-none transition-colors"
                    value={selectedNode.data.expression as string || ''}
                    onChange={e => handleUpdateNodeData('expression', e.target.value)}
                    placeholder="order.amount > 100000"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">Biểu thức trả về True/False để quyết định nhánh tiếp theo.</p>
                </div>
              )}

              {selectedNode.type === 'aiAgentNode' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-purple-400 uppercase tracking-widest">System Prompt (Intent)</label>
                  <textarea 
                    className="w-full bg-[#050a15] border border-slate-700 rounded-xl px-4 py-3 text-sm text-purple-300 font-mono focus:border-purple-500 outline-none min-h-[120px] transition-colors"
                    value={selectedNode.data.systemPrompt as string || ''}
                    onChange={e => handleUpdateNodeData('systemPrompt', e.target.value)}
                    placeholder="Ví dụ: Đọc nội dung sau và phân loại xem khách hàng đang tức giận hay hài lòng."
                  />
                </div>
              )}

              {selectedNode.type === 'smartContractNode' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Contract Address (U2U)</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#050a15] border border-slate-700 rounded-xl px-4 py-3 text-sm text-orange-400 font-mono focus:border-orange-500 outline-none mb-4 transition-colors"
                    value={selectedNode.data.contractAddress as string || ''}
                    onChange={e => handleUpdateNodeData('contractAddress', e.target.value)}
                    placeholder="0x..."
                  />
                  <label className="text-[11px] font-black text-orange-400 uppercase tracking-widest block">Method Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#050a15] border border-slate-700 rounded-xl px-4 py-3 text-sm text-orange-400 font-mono focus:border-orange-500 outline-none transition-colors"
                    value={selectedNode.data.methodName as string || ''}
                    onChange={e => handleUpdateNodeData('methodName', e.target.value)}
                    placeholder="mintToken"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Execution Console (N8N Trace Logger) */}
      <AnimatePresence>
        {showLogsConsole && (
          <motion.div 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-[#0a0f1c]/95 border border-indigo-500/30 rounded-2xl z-[100] shadow-[0_-10px_40px_rgba(99,102,241,0.15)] flex flex-col h-[320px]"
          >
            {/* Header with Tabs */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 bg-[#121829]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Play size={14} className="text-emerald-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Console Monitor</span>
                </div>
                
                {/* Tab buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveConsoleTab('trace')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${activeConsoleTab === 'trace' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-white/5'}`}
                  >
                    Trace Logs
                  </button>
                  <button 
                    onClick={() => setActiveConsoleTab('sandbox')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${activeConsoleTab === 'sandbox' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-white/5'}`}
                  >
                    Flow Sandbox
                  </button>
                  <button 
                    onClick={() => setActiveConsoleTab('agent')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${activeConsoleTab === 'agent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-white/5'}`}
                  >
                    Multi-Agent Audit
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowLogsConsole(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Content Area based on activeConsoleTab */}
            <div className="flex-1 overflow-y-auto p-5 bg-black/60 font-mono text-xs hide-scrollbar">
              
              {/* Tab 1: Trace Logs */}
              {activeConsoleTab === 'trace' && (
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {executionLogs.length === 0 ? (
                    <div className="text-slate-500 italic">Đang chờ sự kiện trigger... Hãy chọn Flow Sandbox để đẩy tin test hoặc chạy Test Run.</div>
                  ) : (
                    executionLogs.map((log, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        key={index} 
                        className="text-slate-300 leading-relaxed"
                      >
                        {log}
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Flow Sandbox Event Simulator */}
              {activeConsoleTab === 'sandbox' && (
                <div className="grid grid-cols-3 gap-6 h-full text-slate-300">
                  <div className="col-span-1 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Chọn mẫu sự kiện</label>
                      <select 
                        value={sandboxTemplate}
                        onChange={e => handleTemplateChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold outline-none text-white focus:border-indigo-500"
                      >
                        <option value="spa_complaint">Spa: Khiếu nại trễ SLA</option>
                        <option value="fnb_order">F&B: Khách đặt món</option>
                        <option value="blockchain_delay">U2U Chain: Độ trễ giao dịch</option>
                      </select>
                    </div>

                    <button
                      onClick={handleTestRun}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <Play size={12} fill="currentColor" /> Trigger Sandbox
                    </button>
                  </div>
                  
                  <div className="col-span-2 flex flex-col h-full">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Payload JSON</label>
                    <textarea
                      value={sandboxPayload}
                      onChange={e => setSandboxPayload(e.target.value)}
                      className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 outline-none resize-none focus:border-indigo-500/30"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Multi-Agent Communication */}
              {activeConsoleTab === 'agent' && (
                <div className="space-y-3 max-h-[240px] overflow-y-auto">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Trạng thái: 4 AI Agents đang giám sát môi trường</div>
                  {(agentLogs[sandboxTemplate] || []).map((log, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-lg"
                    >
                      <span className="text-slate-500 font-mono text-[10px] shrink-0 pt-0.5">{log.time}</span>
                      <span className={`font-bold text-[10px] uppercase shrink-0 min-w-[130px] ${log.color}`}>
                        [{log.sender}]
                      </span>
                      <span className="text-slate-300 leading-relaxed text-[11px]">{log.msg}</span>
                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Wrap with ReactFlowProvider to use hooks inside (for drag/drop coordinate calculation)
export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInternal />
    </ReactFlowProvider>
  );
}
