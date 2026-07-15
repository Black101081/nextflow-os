import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../../shared/services/api';
import { Brain, ShieldCheck, Activity, Zap, DollarSign, Server, Network } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AiUsageDashboard() {
  const [aiHealth, setAiHealth] = useState<any>(null);
  const [usageByEndpoint, setUsageByEndpoint] = useState<any[]>([]);
  const [modelDistribution, setModelDistribution] = useState<any[]>([]);
  const [decisionLog, setDecisionLog] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const health = await apiService.getAiHealth();
      setAiHealth(health);
    } catch { setAiHealth({ status: 'UNKNOWN' }); }

    try {
      const data = await apiService.getPlatformAiUsage();
      
      const colors = ['#a855f7', '#38bdf8', '#34d399', '#facc15', '#fb923c', '#f87171'];
      const endpoints = (data.usage_by_endpoint || []).map((e: any, i: number) => ({ ...e, color: colors[i % colors.length] }));
      const models = (data.model_distribution || []).map((m: any, i: number) => ({ ...m, color: colors[i % colors.length] }));
      
      const enrichedDecisions = (data.recent_decisions || []).map((d: any) => ({
        ...d,
        confidence: d.confidence_score !== undefined ? d.confidence_score : 90, // Fallback if backend doesn't provide
        tx_hash: d.tx_hash || null
      }));

      setUsageByEndpoint(endpoints);
      setModelDistribution(models);
      setDecisionLog(enrichedDecisions);
    } catch (error) {
      console.error('Failed to load AI usage:', error);
    }
  };

  const totalCalls = usageByEndpoint.reduce((s, e) => s + e.calls, 0);
  const estCostPerCall = 0.003; // $0.003 per call average
  const estimatedCost = (totalCalls * estCostPerCall).toFixed(2);
  const decisionsAnchored = decisionLog.filter(d => d.tx_hash).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={28} color="#a855f7" /> AI Intelligence Core
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0' }}>
            Hệ thống lõi giám sát mức độ tiêu thụ Token, Health Endpoint và nhật ký quyết định tự động của AI.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>AI ENGINE: SYNCED</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(168, 85, 247, 0.2)' }}><Zap size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#d8b4fe', fontWeight: 800, letterSpacing: '0.05em' }}>TOTAL API TOKENS</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{totalCalls.toLocaleString()}</div></div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at right, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' }} />
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.2)' }}><DollarSign size={24} /></div>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 800, letterSpacing: '0.05em' }}>EST. BURN RATE (24H)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399', textShadow: '0 0 10px rgba(52,211,153,0.5)' }}>${estimatedCost}</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.2)' }}><Server size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#7dd3fc', fontWeight: 800, letterSpacing: '0.05em' }}>CLUSTER HEALTH</div><div style={{ fontSize: '24px', fontWeight: 900, color: aiHealth?.status === 'ok' ? '#34d399' : '#fbbf24' }}>{aiHealth?.status?.toUpperCase() || 'UNKNOWN'}</div></div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(99, 102, 241, 0.2)' }}><ShieldCheck size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 800, letterSpacing: '0.05em' }}>ON-CHAIN VERIFIED</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{decisionsAnchored} / {decisionLog.length}</div></div>
        </motion.div>
      </div>

      {/* Endpoint Energy Cells Grid */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Network size={18} color="#a855f7" /> AI ENDPOINT ENERGY CELLS
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {usageByEndpoint.map((ep, i) => (
          <motion.div 
            key={i} whileHover={{ scale: 1.02 }}
            style={{ 
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)', 
              border: `1px solid rgba(52, 211, 153, 0.3)`, borderRadius: '16px', padding: '16px', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{ep.endpoint}</div>
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={10} color="#34d399" /> Ping: {ep.avg_latency}ms
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', border: '2px solid rgba(52, 211, 153, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(52, 211, 153, 0.3)' }}>
              <Zap size={14} color="#34d399" />
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Token Burn AreaChart */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#a855f7" /> Token Burn Rate (24h)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageByEndpoint} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="endpoint" stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <ChartTooltip 
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 0 20px rgba(168,85,247,0.2)' }} 
                  itemStyle={{ color: '#d8b4fe' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Neural Model Distribution */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} color="#38bdf8" /> Neural Model Allocation
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {modelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }} iconType="circle" />
                <ChartTooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 0 20px rgba(56,189,248,0.2)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Decision Log Matrix */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10b981" /> AI Autonomous Decisions
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>TIMESTAMP</th>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>TENANT DOMAIN</th>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>AI DIRECTIVE</th>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>RATIONALE (LOGIC)</th>
              <th style={{ padding: '16px 12px', fontWeight: 600, width: '150px' }}>CONFIDENCE LEVEL</th>
              <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'right' }}>ON-CHAIN HASH</th>
            </tr>
          </thead>
          <tbody>
            {decisionLog.map((d, i) => (
              <motion.tr 
                key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <td style={{ padding: '16px 12px', color: '#64748b', fontFamily: 'monospace' }}>{new Date(d.timestamp).toLocaleTimeString()}</td>
                <td style={{ padding: '16px 12px', color: '#e2e8f0', fontWeight: 600 }}>{d.tenant_name}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.05em',
                    background: d.type === 'AUTO_PAYOUT' ? 'rgba(16, 185, 129, 0.15)' : (d.type === 'ESCALATE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
                    color: d.type === 'AUTO_PAYOUT' ? '#34d399' : (d.type === 'ESCALATE' ? '#f87171' : '#60a5fa'),
                    border: `1px solid ${d.type === 'AUTO_PAYOUT' ? 'rgba(16, 185, 129, 0.3)' : (d.type === 'ESCALATE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)')}`
                  }}>
                    {d.type}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <code style={{ fontSize: '12px', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    {d.rationale?.slice(0, 40)}...
                  </code>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${d.confidence}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ height: '100%', background: '#a855f7', boxShadow: '0 0 10px #a855f7' }} 
                      />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#d8b4fe' }}>{d.confidence}%</span>
                  </div>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  {d.tx_hash ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <ShieldCheck size={14} color="#34d399" />
                      <code style={{ fontSize: '11px', color: '#a7f3d0' }}>{d.tx_hash}</code>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Pending Anchor...</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
