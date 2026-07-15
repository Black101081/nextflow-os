import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, Server, Clock, AlertTriangle, RefreshCw, Activity, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ReferenceDot } from 'recharts';

export default function ObservabilityDashboard() {
  const [observabilityData, setObservabilityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radarScanning, setRadarScanning] = useState(true);

  const fetchObservability = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlatformObservability();
      setObservabilityData(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu giám sát hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservability();
    const interval = setInterval(fetchObservability, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mock API trend data for the Recharts graph
  const trendData = [
    { name: '00:00', requests: 420, errors: 2 },
    { name: '04:00', requests: 280, errors: 1 },
    { name: '08:00', requests: 980, errors: 4 },
    { name: '12:00', requests: 1450, errors: 12 },
    { name: '15:30', requests: 4200, errors: 150, isAnomaly: true }, // Spike!
    { name: '16:00', requests: 1210, errors: 8 },
    { name: '20:00', requests: 1850, errors: 15 },
    { name: '24:00', requests: 1100, errors: 3 },
  ];

  return (
    <div style={{ padding: '32px', color: '#f1f5f9', maxWidth: '1300px', margin: '0 auto', fontFamily: '"Outfit", sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #e0e7ff 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={32} color="#818cf8" /> Observability Command Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0' }}>
            Hệ thống Radar 3D giám sát sức khỏe toàn cầu: Tải máy chủ, băng thông API và trạng thái vệ tinh Doanh nghiệp (SME Nodes).
          </p>
        </div>
        <button 
          onClick={fetchObservability}
          disabled={loading}
          style={{ 
            padding: '10px 20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.4)', 
            borderRadius: '12px', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', 
            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.3)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.1)'}
        >
          <RefreshCw size={16} className={loading ? 'spin-animation' : ''} /> {loading ? 'Scanning...' : 'Ping Servers'}
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '14px', fontWeight: 500 }}>
          <AlertTriangle size={20} /> {error}
        </motion.div>
      )}

      {observabilityData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top Row: Cyberpunk Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            
            <motion.div 
              className="metrics-card" 
              style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CPU LOAD (CLUSTER-1)</span>
                <Cpu size={20} color="#c084fc" />
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {observabilityData.system.cpu_usage}<span style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '6px' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${observabilityData.system.cpu_usage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #c084fc, #e879f9)', borderRadius: '4px', boxShadow: '0 0 10px #c084fc' }} 
                />
              </div>
              {/* Pulse effect if CPU > 80% */}
              {observabilityData.system.cpu_usage > 80 && (
                <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(168, 85, 247, 0.2)', pointerEvents: 'none' }} />
              )}
            </motion.div>

            <motion.div 
              className="metrics-card" 
              style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(56, 189, 248, 0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>MEMORY USAGE</span>
                <Server size={20} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {observabilityData.system.ram_usage}<span style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '6px' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${observabilityData.system.ram_usage}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #7dd3fc)', borderRadius: '4px', boxShadow: '0 0 10px #38bdf8' }} 
                />
              </div>
            </motion.div>

            <motion.div 
              className="metrics-card" 
              style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>DISK STATUS</span>
                <HardDrive size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {observabilityData.system.disk_usage}<span style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '6px' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${observabilityData.system.disk_usage}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '4px', boxShadow: '0 0 10px #10b981' }} 
                />
              </div>
            </motion.div>

            <motion.div 
              className="metrics-card" 
              style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(251, 191, 36, 0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>SERVER UPTIME</span>
                <Clock size={20} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {observabilityData.system.uptime_hours}<span style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '6px' }}>hrs</span>
              </div>
              <div style={{ fontSize: '13px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '10px', height: '10px', background: '#34d399', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #34d399' }}></motion.span>
                Network Stable
              </div>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
            {/* Middle Row: AI Anomaly Traffic Graph */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={20} color="#fbbf24" /> Lưu lượng Toàn Nền tảng (Platform Traffic)
                </h3>
                <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} /> AI Anomaly Detected
                </span>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
                    <Area type="monotone" dataKey="requests" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" name="API Traffic" />
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorErrors)" name="Exceptions" />
                    
                    {/* AI Anomaly Highlight */}
                    <ReferenceLine x="15:30" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'DDoS / Spike Detected', fill: '#ef4444', fontSize: 11, fontWeight: 700 }} />
                    <ReferenceDot x="15:30" y={4200} r={6} fill="#ef4444" stroke="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar View (Node Network) */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="#10b981" /> Live Node Radar (Tenants)
              </h3>
              
              <div style={{ width: '100%', height: '320px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Radar Grid Circles */}
                <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.3)' }} />
                  </div>
                </div>
                
                {/* Crosshairs */}
                <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(56, 189, 248, 0.1)' }} />
                <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(56, 189, 248, 0.1)' }} />

                {/* Radar Scanning Sweep Line */}
                {radarScanning && (
                  <motion.div 
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    style={{ position: 'absolute', width: '50%', height: '50%', background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0) 0%, rgba(56, 189, 248, 0.2) 60%, rgba(56, 189, 248, 0.6) 100%)', clipPath: 'polygon(100% 100%, 100% 0, 0 0)', top: 0, right: '50%', transformOrigin: 'bottom right' }}
                  />
                )}

                {/* Central Core */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 10px #38bdf8', '0 0 30px #38bdf8', '0 0 10px #38bdf8'] }} transition={{ repeat: Infinity, duration: 2 }}
                  style={{ position: 'absolute', width: '40px', height: '40px', background: 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)', borderRadius: '50%', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Server size={20} color="#fff" />
                </motion.div>

                {/* SME Tenant Nodes */}
                {observabilityData.tenants.map((tenant: any, index: number) => {
                  const isError = tenant.error_count > 0 || tenant.health_status === 'CRITICAL';
                  const isWarning = tenant.health_status === 'WARNING';
                  const color = isError ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
                  const glow = isError ? '0 0 15px #ef4444' : isWarning ? '0 0 15px #f59e0b' : '0 0 10px #10b981';
                  
                  // Calculate pseudo-random position on orbit
                  const angle = (index * (360 / observabilityData.tenants.length)) * (Math.PI / 180);
                  const radius = 80 + (index % 3) * 30; // 80, 110, 140
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={tenant.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      style={{
                        position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20
                      }}
                    >
                      <motion.div 
                        animate={isError ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}
                        style={{ width: '16px', height: '16px', background: color, borderRadius: '50%', boxShadow: glow, cursor: 'pointer', position: 'relative' }}
                        title={`${tenant.company_name} - ${tenant.error_count} errors`}
                      >
                        {isError && (
                          <div style={{ position: 'absolute', top: -4, right: -4, background: '#fff', borderRadius: '50%', width: 8, height: 8 }} />
                        )}
                      </motion.div>
                      <span style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '6px', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', border: `1px solid ${color}40` }}>
                        {tenant.company_name.split(' ')[0]} {/* Short name */}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}><span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></span> Khỏe mạnh</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}><span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }}></span> Cảnh báo</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}><span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span> Lỗi / Ngoại lệ</div>
              </div>
            </div>
          </div>
          
        </div>
      )}
      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
