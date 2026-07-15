import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../shared/services/api';
import { ShieldCheck, RefreshCw, Terminal, Cpu, Database, Activity, Code, Clock } from 'lucide-react';

interface AuditEvent {
  id: string; timestamp: string; tenant: string; user: string; action: string;
  resource: string; details: string; tx_hash?: string;
}

export default function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'CDC' | 'AI'>('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [liveMode, setLiveMode] = useState(true); // Default to ON for demo
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPlatformAuditLogs();
      setEvents(data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll effect when liveMode is on and new events arrive
  useEffect(() => {
    if (liveMode && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, liveMode]);

  const filtered = events.filter(e => {
    const source = e.user === 'AI Agent' ? 'AI' : 'CDC';
    const matchSource = sourceFilter === 'ALL' || source === sourceFilter;
    const matchAction = actionFilter === 'ALL' || e.action === actionFilter;
    return matchSource && matchAction;
  });

  const uniqueActions = [...new Set(events.map(e => e.action))];

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['ID,Thời Gian,Nguồn,Người Dùng,Hành Động,Tài Nguyên,Chi Tiết,Tx Hash\n'];
    const csvData = filtered.map(e => {
      const source = e.user === 'AI Agent' ? 'AI' : 'CDC';
      const details = `"${(e.details || '').replace(/"/g, '""')}"`;
      return `${e.id},${e.timestamp},${source},${e.user},${e.action},${e.resource},${details},${e.tx_hash || ''}`;
    }).join('\n');
    const blob = new Blob([headers + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'platform_audit_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={28} color="#ef4444" /> Cybernetic Audit Stream
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0' }}>
            Dòng dữ liệu không gian mạng: Ghi nhận CDC Events & AI Decisions, neo bất biến trên U2U Blockchain.
          </p>
        </div>
        
        {/* Live Stream Toggle */}
        <button
          onClick={() => setLiveMode(!liveMode)}
          style={{
            padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            border: liveMode ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(148, 163, 184, 0.3)',
            background: liveMode ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.2) 100%)' : 'rgba(30, 41, 59, 0.6)',
            color: liveMode ? '#34d399' : '#94a3b8',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: liveMode ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
            transition: 'all 0.3s'
          }}
        >
          {liveMode && <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />}
          {!liveMode && <Activity size={16} />}
          {liveMode ? 'LIVE STREAM ON' : 'STREAM PAUSED'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em' }}>TOTAL EVENTS</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginTop: '8px' }}>{events.length}</div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <motion.div animate={{ opacity: [0, 0.1, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(59, 130, 246, 0.4), transparent)' }} />
          <Database size={20} color="#3b82f6" style={{ margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 800, letterSpacing: '0.05em' }}>CDC AUTO-CAPTURED</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#3b82f6', marginTop: '4px' }}>{events.filter(e => e.user !== 'AI Agent').length}</div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <motion.div animate={{ opacity: [0, 0.1, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(168, 85, 247, 0.4), transparent)' }} />
          <Cpu size={20} color="#a855f7" style={{ margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '11px', color: '#d8b4fe', fontWeight: 800, letterSpacing: '0.05em' }}>AI DECISIONS</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>{events.filter(e => e.user === 'AI Agent').length}</div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <ShieldCheck size={20} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 800, letterSpacing: '0.05em' }}>BLOCKCHAIN SECURED</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>{events.filter(e => e.tx_hash).length}</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={sourceFilter} 
            onChange={e => setSourceFilter(e.target.value as any)} 
            style={{ fontSize: '13px', padding: '10px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', cursor: 'pointer', minWidth: '160px' }}
          >
            <option value="ALL">ALL DATA STREAMS</option>
            <option value="CDC">📡 CDC DB-Events</option>
            <option value="AI">🤖 AI Operations</option>
          </select>
          <select 
            value={actionFilter} 
            onChange={e => setActionFilter(e.target.value)} 
            style={{ fontSize: '13px', padding: '10px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', cursor: 'pointer', minWidth: '160px' }}
          >
            <option value="ALL">ALL COMMANDS</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Showing {filtered.length} / {events.length}</span>
        </div>
        <button 
          onClick={handleExportCSV}
          style={{ padding: '10px 20px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
          <Code size={14} /> EXPORT CSV
        </button>
      </div>

      {/* Cybernetic Timeline Stream */}
      <div 
        ref={scrollRef}
        style={{ 
          background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', 
          padding: '32px', backdropFilter: 'blur(20px)', height: '600px', overflowY: 'auto', position: 'relative' 
        }}
      >
        {/* Main glowing track line */}
        <div style={{ position: 'absolute', top: '32px', bottom: '32px', left: '46px', width: '2px', background: 'rgba(255,255,255,0.05)' }}>
          {liveMode && (
            <motion.div 
              initial={{ top: '-10%', height: '10%' }}
              animate={{ top: '110%' }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{ position: 'absolute', width: '100%', background: 'linear-gradient(to bottom, transparent, #38bdf8, transparent)', boxShadow: '0 0 15px #38bdf8' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <AnimatePresence>
            {filtered.map((event, idx) => {
              const isAI = event.user === 'AI Agent';
              const isDelete = event.action === 'DELETE';
              const isCreate = event.action === 'CREATE';
              
              const nodeColor = isAI ? '#c084fc' : (isDelete ? '#ef4444' : (isCreate ? '#34d399' : '#38bdf8'));
              const nodeShadow = isAI ? 'rgba(192, 132, 252, 0.6)' : (isDelete ? 'rgba(239, 68, 68, 0.6)' : (isCreate ? 'rgba(52, 211, 153, 0.6)' : 'rgba(56, 189, 248, 0.6)'));

              return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    display: 'flex', gap: '24px', padding: '20px 0',
                    borderBottom: idx < filtered.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none',
                    alignItems: 'flex-start',
                    position: 'relative'
                  }}
                  className="timeline-row"
                >
                  {/* Energy Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '30px', zIndex: 2, paddingTop: '4px' }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: nodeColor,
                      boxShadow: `0 0 15px ${nodeShadow}, inset 0 0 5px #fff`,
                      border: '2px solid rgba(15, 23, 42, 1)'
                    }} />
                  </div>

                  {/* Content Terminal */}
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }} className="log-content">
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
                        <Clock size={12} /> {event.timestamp}
                      </span>
                      
                      <span style={{
                        fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                        background: isAI ? 'linear-gradient(90deg, rgba(168,85,247,0.2), transparent)' : 'linear-gradient(90deg, rgba(56,189,248,0.2), transparent)',
                        color: isAI ? '#d8b4fe' : '#7dd3fc',
                        borderLeft: `2px solid ${isAI ? '#a855f7' : '#38bdf8'}`, letterSpacing: '0.05em'
                      }}>
                        {isAI ? '🤖 AI DECISION' : '📡 CDC SENSOR'}
                      </span>
                      
                      <span style={{
                        fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace',
                        background: isDelete ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: isDelete ? '#fca5a5' : '#cbd5e1', border: `1px solid ${isDelete ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'}`
                      }}>
                        {'>'} {event.action}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: 500, lineHeight: 1.5 }}>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{event.user}</span> executed action on <span style={{ color: '#34d399', fontFamily: 'monospace' }}>{event.resource}</span>: 
                      <span style={{ color: '#cbd5e1' }}> {event.details}</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Database size={12} /> Tenant Target: <span style={{ color: '#94a3b8' }}>{event.tenant}</span>
                    </div>

                    {event.tx_hash && (
                      <div className="tx-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', transition: 'all 0.3s' }}>
                        <ShieldCheck size={14} color="#34d399" />
                        <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 600 }}>CHAIN_HASH:</span>
                        <code style={{ fontSize: '12px', color: '#a7f3d0', fontFamily: 'monospace' }}>{event.tx_hash}</code>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        /* Custom scrollbar for timeline */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.4);
        }

        .timeline-row:hover .log-content {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(56, 189, 248, 0.3) !important;
        }

        .tx-container:hover {
          background: rgba(16, 185, 129, 0.2) !important;
          border-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }
        .tx-container:hover code {
          color: #fff !important;
          text-shadow: 0 0 8px #34d399;
        }
      `}</style>
    </div>
  );
}
