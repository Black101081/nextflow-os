import { useState, useEffect, useCallback } from 'react';
import { Database, Save, CheckCircle, Code, Wand2, Loader2, Type, Hash, Calendar, ToggleLeft, Plus, X, GripVertical, Network } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ReactFlow, Background, MarkerType, useNodesState, useEdgesState } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

// Types for our Visual Fields
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'array';

interface VisualField {
  id: string;
  name: string;
  title: string;
  type: FieldType;
  required: boolean;
}

export default function EntityBuilder() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  
  const [systemName, setSystemName] = useState('khach_hang_bds');
  const [displayName, setDisplayName] = useState('Khách hàng BĐS');
  
  const [visualFields, setVisualFields] = useState<VisualField[]>([
    { id: '1', name: 'ho_ten', title: 'Họ và tên', type: 'string', required: true }
  ]);
  
  const [schemaJson, setSchemaJson] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error' | 'generating'; message: string }>({ type: 'idle', message: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [viewMode, setViewMode] = useState<'graph' | 'json'>('graph');

  // React Flow State for Graph Preview
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Automatically sync visual fields to JSON Schema & Graph
  useEffect(() => {
    // 1. Update JSON Schema
    const properties: Record<string, any> = {};
    const required: string[] = [];

    visualFields.forEach(f => {
      properties[f.name] = {
        type: f.type === 'date' ? 'string' : f.type,
        title: f.title
      };
      if (f.type === 'date') {
        properties[f.name].format = 'date-time';
      }
      if (f.required) required.push(f.name);
    });

    const newSchema = {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };

    setSchemaJson(JSON.stringify(newSchema, null, 2));

    // 2. Update Graph Nodes & Edges
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Center Node (Entity)
    newNodes.push({
      id: 'entity-root',
      type: 'default',
      position: { x: 250, y: 300 },
      data: { label: <div className="font-bold text-white uppercase tracking-widest">{displayName || 'Entity'}</div> },
      style: { background: 'rgba(99,102,241,0.2)', border: '2px solid #6366f1', borderRadius: '12px', color: '#fff', padding: '15px', boxShadow: '0 0 20px rgba(99,102,241,0.4)', textShadow: '0 0 10px rgba(255,255,255,0.5)' }
    });

    // Field Nodes
    const radius = 250;
    const angleStep = Math.PI / Math.max(visualFields.length - 1, 1);
    let startAngle = Math.PI; // start from left (180 deg) to right (0 deg) over the top, wait, let's distribute evenly around right half

    visualFields.forEach((field, index) => {
      // Calculate position in a semi-circle to the right
      const angle = -Math.PI/2 + (Math.PI / Math.max(visualFields.length - 1, 1)) * index;
      const x = 250 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;

      let color = '#3b82f6'; // default blue
      if (field.type === 'number') color = '#f97316';
      if (field.type === 'date') color = '#a855f7';
      if (field.type === 'boolean') color = '#10b981';

      newNodes.push({
        id: `field-${field.id}`,
        type: 'default',
        position: { x, y },
        data: { 
          label: (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold">{field.title}</span>
              <span className="text-[9px] opacity-70 font-mono">{field.name}</span>
            </div>
          )
        },
        style: { background: `rgba(0,0,0,0.5)`, border: `1px solid ${color}`, borderRadius: '8px', color: color, padding: '10px' }
      });

      newEdges.push({
        id: `edge-${field.id}`,
        source: 'entity-root',
        target: `field-${field.id}`,
        animated: true,
        style: { stroke: color, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: color },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);

  }, [visualFields, displayName, setNodes, setEdges]);

  const handleSave = async () => {
    setStatus({ type: 'saving', message: 'Đang lưu cấu trúc dữ liệu lên Cloud...' });
    try {
      const parsedSchema = JSON.parse(schemaJson);

      const payload = {
        name: displayName,
        system_name: systemName,
        description: 'Được tạo bởi AI Entity Builder',
        schema_json: parsedSchema
      };

      await apiService.createEntity(auth, payload);
      setStatus({ type: 'success', message: 'Triển khai Entity thành công!' });
      
      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Lỗi khi lưu JSON Schema.' });
    }
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    setStatus({ type: 'generating', message: 'AI đang phân tích và thiết kế Schema...' });
    
    // Clear current fields
    setVisualFields([]);
    setDisplayName('Đang khởi tạo...');
    setSystemName('generating...');

    // Simulate AI Generation with Typing/Staggered Effect
    const targetSystemName = 've_may_bay';
    const targetDisplayName = 'Vé Máy Bay';
    const targetFields: VisualField[] = [
      { id: '1', name: 'ma_ve', title: 'Mã chuyến bay', type: 'string', required: true },
      { id: '2', name: 'hanh_khach', title: 'Tên hành khách', type: 'string', required: true },
      { id: '3', name: 'ngay_bay', title: 'Ngày khởi hành', type: 'date', required: true },
      { id: '4', name: 'gia_ve', title: 'Giá vé (VNĐ)', type: 'number', required: false },
      { id: '5', name: 'da_thanh_toan', title: 'Đã thanh toán?', type: 'boolean', required: true }
    ];

    setTimeout(() => {
      setDisplayName(targetDisplayName);
      setSystemName(targetSystemName);
      
      let step = 0;
      const interval = setInterval(() => {
        if (step < targetFields.length) {
          setVisualFields(prev => [...prev, targetFields[step]]);
          step++;
        } else {
          clearInterval(interval);
          setStatus({ type: 'success', message: 'Cấu trúc dữ liệu đã được tổng hợp thành công!' });
          setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
        }
      }, 500); // 500ms delay per field for typing effect
    }, 1000);
  };

  const addField = () => {
    const newId = Date.now().toString();
    setVisualFields([...visualFields, { id: newId, name: 'new_field', title: 'Trường mới', type: 'string', required: false }]);
  };

  const removeField = (id: string) => {
    setVisualFields(visualFields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: keyof VisualField, value: any) => {
    setVisualFields(visualFields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const getTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'string': return <Type size={14} className="text-blue-400" />;
      case 'number': return <Hash size={14} className="text-orange-400" />;
      case 'date': return <Calendar size={14} className="text-purple-400" />;
      case 'boolean': return <ToggleLeft size={14} className="text-emerald-400" />;
      default: return <Code size={14} className="text-slate-400" />;
    }
  };

  const getTypeBg = (type: FieldType) => {
    switch (type) {
      case 'string': return 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60';
      case 'number': return 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60';
      case 'date': return 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60';
      case 'boolean': return 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60';
      default: return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="h-[calc(100vh-60px)] p-6 bg-[#0B0C10] text-slate-200 overflow-hidden flex flex-col gap-6 font-['Outfit']">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-wider uppercase">
            <Database className="text-indigo-500" size={28} />
            Data Constructor
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Lõi kiến trúc thông tin - Định hình cấu trúc dữ liệu No-Code.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-[#12141C] border border-[#334155] rounded-xl p-1">
            <button 
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'graph' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Network size={16} /> Schema Graph
            </button>
            <button 
              onClick={() => setViewMode('json')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'json' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Code size={16} /> Raw JSON
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={status.type === 'saving' || status.type === 'generating'}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-black tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] uppercase"
          >
            {status.type === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
            COMPILE
          </button>
        </div>
      </div>

      {status.message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`py-2.5 px-5 rounded-xl border text-sm font-bold w-full flex items-center gap-2 tracking-widest uppercase shadow-lg ${status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : status.type === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}
        >
          {status.type === 'success' ? <CheckCircle size={18} /> : <Wand2 size={18} className={status.type === 'generating' ? 'animate-pulse' : ''} />}
          {status.message}
        </motion.div>
      )}

      {/* MAIN CONTENT - DUAL PANE */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* LEFT PANE: VISUAL BUILDER */}
        <div className="w-[50%] flex flex-col gap-6 overflow-y-auto hide-scrollbar pr-2 pb-10">
          
          {/* AI Generator Bar */}
          <div className="bg-[#12141C]/80 backdrop-blur-xl border border-indigo-500/30 p-5 rounded-3xl shadow-[0_10px_40px_rgba(99,102,241,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <h3 className="text-[11px] font-black text-indigo-400 flex items-center gap-2 mb-3 uppercase tracking-widest relative z-10">
              <Wand2 size={16} /> AI Data Architect
            </h3>
            <div className="flex gap-3 relative z-10">
              <input 
                type="text" 
                className="flex-1 bg-black/60 border border-[#334155] rounded-2xl px-5 py-3 text-white focus:border-indigo-500 outline-none placeholder:text-slate-600 transition-colors font-bold"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
                placeholder="Ví dụ: Tạo bảng Quản lý Hợp đồng Thuê Nhà..."
                disabled={status.type === 'generating'}
              />
              <button 
                onClick={handleGenerateAI}
                disabled={status.type === 'generating'}
                className="px-6 py-3 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/50 text-white rounded-2xl font-black tracking-widest transition-all flex items-center gap-2 uppercase shadow-inner"
              >
                {status.type === 'generating' ? <Loader2 size={18} className="animate-spin text-indigo-400" /> : 'BUILD'}
              </button>
            </div>
          </div>

          {/* Meta Data */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Name (Display)</label>
              <input
                type="text"
                className="w-full bg-[#12141C] border border-[#334155] rounded-2xl px-5 py-3 text-white focus:border-indigo-500 outline-none font-black text-lg transition-colors"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Identifier (DB Table)</label>
              <input
                type="text"
                className="w-full bg-[#12141C] border border-[#334155] rounded-2xl px-5 py-3 text-indigo-400 focus:border-indigo-500 outline-none font-mono text-sm transition-colors"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
              />
            </div>
          </div>

          {/* Fields List */}
          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Data Structure (Fields)</h3>
              <button onClick={addField} className="flex items-center gap-2 text-xs font-black bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(99,102,241,0.2)] uppercase tracking-wider">
                <Plus size={16} /> Add Field
              </button>
            </div>
            
            <Reorder.Group axis="y" values={visualFields} onReorder={setVisualFields} className="space-y-3">
              <AnimatePresence>
                {visualFields.map((field) => (
                  <Reorder.Item 
                    key={field.id} 
                    value={field}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${getTypeBg(field.type)} bg-opacity-20 backdrop-blur-md cursor-grab active:cursor-grabbing transition-colors`}
                  >
                    <div className="text-slate-500 px-1 hover:text-white transition-colors">
                      <GripVertical size={16} />
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 shadow-inner">
                      {getTypeIcon(field.type)}
                    </div>
                    
                    <input 
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-white font-bold placeholder:text-slate-600"
                      value={field.title}
                      onChange={e => updateField(field.id, 'title', e.target.value)}
                      placeholder="Tên hiển thị..."
                    />

                    <input 
                      type="text"
                      className="w-32 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-slate-300 outline-none font-mono focus:border-indigo-500/50 transition-colors"
                      value={field.name}
                      onChange={e => updateField(field.id, 'name', e.target.value)}
                      placeholder="field_key"
                    />

                    <select
                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-colors"
                      value={field.type}
                      onChange={e => updateField(field.id, 'type', e.target.value as FieldType)}
                    >
                      <option value="string">STRING</option>
                      <option value="number">NUMBER</option>
                      <option value="date">DATE</option>
                      <option value="boolean">BOOLEAN</option>
                    </select>

                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 cursor-pointer pl-3 border-l border-white/10 uppercase tracking-widest hover:text-white transition-colors">
                      <input 
                        type="checkbox" 
                        className="accent-indigo-500 w-4 h-4 rounded"
                        checked={field.required}
                        onChange={e => updateField(field.id, 'required', e.target.checked)}
                      />
                      Req
                    </label>

                    <button 
                      onClick={() => removeField(field.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all ml-1"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        </div>

        {/* RIGHT PANE: PREVIEW */}
        <div className="w-[50%] bg-[#050A15] border border-[#1E293B] rounded-3xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 opacity-50 z-10"></div>
          
          <div className="flex-1 relative">
            {viewMode === 'graph' ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#1e293b" gap={20} size={1} />
              </ReactFlow>
            ) : (
              <div className="absolute inset-0 p-6 overflow-y-auto">
                <pre className="text-sm leading-relaxed font-mono text-[#a8c7fa]">
                  {schemaJson}
                </pre>
              </div>
            )}

            {/* Glowing orb in the background for extra sci-fi feel */}
            {viewMode === 'graph' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
