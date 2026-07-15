import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../../shared/services/api';
import { Zap, Activity, Globe, Box, Workflow, Network, ServerCrash, Clock, ShieldCheck } from 'lucide-react';

export default function WebhookMonitor() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPlatformWebhookStats();
      setConnectors(data.connectors || []);
      setNodes(data.nodes || []);
      setRecentEvents(data.recent_events || []);
    } catch {
      setConnectors([]);
      setNodes([]);
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => s === 'CONNECTED' ? '#34d399' : (s === 'ERROR' ? '#ef4444' : '#fbbf24');

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #2dd4bf 0%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Network size={28} color="#2dd4bf" /> Webhook & DAG Topology
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0' }}>
            Giám sát mạng lưới API, lưu lượng Webhook và quá trình xử lý DAG Workflow theo thời gian thực.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>CORE ENGINE ONLINE</span>
          </div>
        </div>
      </div>

      {/* TOPOLOGY GRAPH VISUALIZER */}
      <div style={{ background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: '24px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', height: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Background Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />

        {/* Core Node */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <motion.div animate={{ boxShadow: ['0 0 20px rgba(45, 212, 191, 0.4)', '0 0 60px rgba(45, 212, 191, 0.8)', '0 0 20px rgba(45, 212, 191, 0.4)'] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '2px solid #2dd4bf', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Workflow size={32} color="#2dd4bf" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#99f6e4', letterSpacing: '0.05em' }}>NEXTFLOW OS</span>
          </motion.div>
        </div>

        {/* Endpoint Nodes & Connections */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Haravan to Core */}
          <path d="M 250 180 Q 400 180 650 180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
          <motion.circle cx="0" cy="0" r="4" fill="#60a5fa" filter="drop-shadow(0 0 5px #60a5fa)">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 250 180 Q 400 180 650 180" />
          </motion.circle>

          {/* KiotViet to Core */}
          <path d="M 350 80 Q 500 130 650 180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
          <motion.circle cx="0" cy="0" r="4" fill="#a855f7" filter="drop-shadow(0 0 5px #a855f7)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 350 80 Q 500 130 650 180" />
          </motion.circle>

          {/* Zalo to Core */}
          <path d="M 350 280 Q 500 230 650 180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
          <motion.circle cx="0" cy="0" r="4" fill="#34d399" filter="drop-shadow(0 0 5px #34d399)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 350 280 Q 500 230 650 180" />
          </motion.circle>

          {/* Core to Blockchain */}
          <path d="M 650 180 Q 800 180 1000 180" fill="none" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="3" />
          <motion.circle cx="0" cy="0" r="5" fill="#fcd34d" filter="drop-shadow(0 0 8px #fcd34d)">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 650 180 Q 800 180 1000 180" />
          </motion.circle>
        </svg>

        {/* Nodes UI */}
        <div style={{ position: 'absolute', top: '150px', left: '120px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #3b82f6', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
            <Globe size={18} color="#60a5fa" /> <span style={{ fontSize: '13px', fontWeight: 700, color: '#bfdbfe' }}>Haravan Webhook</span>
          </div>
        </div>

        <div style={{ position: 'absolute', top: '50px', left: '200px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #a855f7', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
            <Box size={18} color="#c084fc" /> <span style={{ fontSize: '13px', fontWeight: 700, color: '#e9d5ff' }}>KiotViet Push</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '50px', left: '200px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #10b981', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
            <Activity size={18} color="#34d399" /> <span style={{ fontSize: '13px', fontWeight: 700, color: '#a7f3d0' }}>Zalo OA Event</span>
          </div>
        </div>

        <div style={{ position: 'absolute', top: '150px', right: '150px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #f59e0b', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}>
            <ShieldCheck size={18} color="#fbbf24" /> <span style={{ fontSize: '13px', fontWeight: 700, color: '#fde68a' }}>U2U Blockchain</span>
          </div>
        </div>
      </div>

      {/* Connector Cards Grid */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Globe size={18} color="#38bdf8" /> ACTIVE ENDPOINTS
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {connectors.map((c, idx) => {
          const isError = c.status !== 'active';
          return (
            <motion.div 
              key={idx} whileHover={{ y: -5 }} 
              style={{ 
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
                border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.3)'}`, 
                borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)',
                boxShadow: isError ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              {/* Status indicator */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(isError ? 'ERROR' : 'CONNECTED'), boxShadow: `0 0 8px ${statusColor(isError ? 'ERROR' : 'CONNECTED')}` }} />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', color: statusColor(isError ? 'ERROR' : 'CONNECTED') }}>
                  {isError ? 'ERR_CONN' : 'ONLINE'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '14px', border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)'}` }}>
                  <Globe size={24} color={isError ? '#ef4444' : '#38bdf8'} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>{c.tenant_name}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>PING LATENCY</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: c.response_time_ms > 0 ? '#34d399' : '#ef4444' }}>
                    {c.response_time_ms > 0 ? `${c.response_time_ms} ms` : 'TIMEOUT'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>PAYLOADS 24H</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>{c.events_today}</div>
                </div>
              </div>

              {c.blockchain_verified_events > 0 && (
                <div style={{ marginTop: '16px', fontSize: '11px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.1)', padding: '8px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  <ShieldCheck size={14} /> {c.blockchain_verified_events} transactions anchored to chain
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* DAG Nodes */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} color="#fbbf24" /> DAG Engine execution map
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {nodes.length > 0 ? nodes.map((node, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.05em',
                    background: node.type === 'webhook' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: node.type === 'webhook' ? '#d8b4fe' : '#cbd5e1', border: `1px solid ${node.type === 'webhook' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.1)'}`
                  }}>
                    {node.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{node.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} /> {node.throughput}</span>
                  <span style={{ color: '#ef4444' }}>Err: {node.error_rate}</span>
                </div>
              </div>
            )) : <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No active nodes detected.</div>}
          </div>
        </div>

        {/* Event Logs */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#3b82f6" /> Webhook Firehose
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentEvents.length > 0 ? recentEvents.map((ev, i) => {
              const isOk = ev.status === 200 || ev.status === 201;
              return (
                <motion.div 
                  key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${isOk ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.2)'}`, borderRadius: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}><Clock size={12} /> {ev.time}</span>
                    <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '13px' }}>{ev.connector}</span>
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{ev.event}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{ev.latency}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, padding: '2px 10px', borderRadius: '6px', fontFamily: 'monospace',
                      background: isOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isOk ? '#6ee7b7' : '#fca5a5', border: `1px solid ${isOk ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      {isOk ? 'HTTP 200' : `HTTP ${ev.status}`}
                    </span>
                  </div>
                </motion.div>
              );
            }) : <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No events flowing.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
