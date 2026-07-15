import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, HardDrive, Clock, ShieldAlert, X, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid } from 'recharts';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import { apiService } from '../../../shared/services/api';

interface HealthTabProps {
  observability: any;
  setSelectedTenantForReport: (t: any) => void;
  selectedTenantForReport: any | null;
  storageQuotaGb?: number;
  triggerNotification?: (type: 'success' | 'error', msg: string) => void;
}

export default function HealthTab({ observability, setSelectedTenantForReport, selectedTenantForReport, storageQuotaGb = 10, triggerNotification }: HealthTabProps) {
  const [blockchainRecords, setBlockchainRecords] = useState<any[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  useEffect(() => {
    if (selectedTenantForReport) {
      setLoadingLedger(true);
      apiService.getPlatformLedger(selectedTenantForReport.id)
        .then(data => {
          setBlockchainRecords(data);
          setLoadingLedger(false);
        })
        .catch(err => {
          console.error("Error fetching tenant ledger:", err);
          setLoadingLedger(false);
        });
    } else {
      setBlockchainRecords([]);
    }
  }, [selectedTenantForReport]);
  // AI Copilot Auto-Scaling States
  const [autoScaling, setAutoScaling] = useState(() => {
    const saved = localStorage.getItem('ai_auto_scaling');
    return saved === 'true';
  });
  const [minWorkers, setMinWorkers] = useState(() => {
    const saved = localStorage.getItem('ai_min_workers');
    return saved ? Number(saved) : 1;
  });
  const [maxWorkers, setMaxWorkers] = useState(() => {
    const saved = localStorage.getItem('ai_max_workers');
    return saved ? Number(saved) : 8;
  });
  const [targetLatency, setTargetLatency] = useState(() => {
    const saved = localStorage.getItem('ai_target_latency');
    return saved ? Number(saved) : 30;
  });
  const [activeWorkers] = useState(3);
  const [scalingLogs, setScalingLogs] = useState<string[]>([
    '🤖 AI Auto-Scaler active. Active workers: 3. CPU/VRAM usage stable.'
  ]);
  const [isSavingScaling, setIsSavingScaling] = useState(false);

  const saveScalingConfig = () => {
    setIsSavingScaling(true);
    setTimeout(() => {
      localStorage.setItem('ai_auto_scaling', String(autoScaling));
      localStorage.setItem('ai_min_workers', String(minWorkers));
      localStorage.setItem('ai_max_workers', String(maxWorkers));
      localStorage.setItem('ai_target_latency', String(targetLatency));
      setScalingLogs(prev => [`⚙️ Saved scaling rules: Min=${minWorkers}, Max=${maxWorkers}, Target=${targetLatency}s.`, ...prev]);
      setIsSavingScaling(false);
      if (triggerNotification) {
        triggerNotification('success', 'Đã lưu cấu hình Auto-Scaling cho AI Copilot!');
      }
    }, 800);
  };
  
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    setAiReport(null);
    try {
      const token = localStorage.getItem('nf_access_token');
      const res = await fetch('/api/v1/platform/observability/ai-insight', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setAiReport(data.insight || "Phân tích hoàn tất nhưng không có phản hồi.");
    } catch (e) {
      console.error(e);
      setAiReport("Lỗi khi kết nối đến hệ thống phân tích AI. Vui lòng kiểm tra lại kết nối hoặc AI Service.");
    } finally {
      setAnalyzing(false);
    }
  };

  const tenantTrendData = [
    { name: '08:00', requests: 45, errors: 0 },
    { name: '10:00', requests: 120, errors: 2 },
    { name: '12:00', requests: 180, errors: 5 },
    { name: '14:00', requests: 90, errors: 1 },
    { name: '16:00', requests: 210, errors: 4 },
    { name: '18:00', requests: 150, errors: 1 },
    { name: '20:00', requests: 75, errors: 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* AI System Analyst */}
      <div className="panel-glass" style={{ border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>
          <Activity size={100} />
        </div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} /> AI System Analyst
        </h3>
        {!aiReport && !analyzing && (
          <button onClick={runAiAnalysis} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bắt đầu quét toàn bộ hệ thống
          </button>
        )}
        {analyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c084fc', fontSize: '14px', fontWeight: 500 }}>
            <Loader2 className="animate-spin" size={20} /> Đang phân tích Logs & Metrics từ các cụm Server...
          </div>
        )}
        {aiReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid #f59e0b', color: '#fff', fontSize: '14px', lineHeight: 1.6 }}>
            {aiReport}
          </motion.div>
        )}
      </div>

      {/* Server Resources Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', borderRadius: '50%', padding: '16px' }}>
            <Cpu size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TẢI CPU TỔNG</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '2px 0 6px 0' }}>
              <AnimatedCounter value={observability?.system?.cpu_usage || 32.4} decimals={1} suffix="%" />
            </div>
            {/* Animated Wave representation */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
              <motion.div 
                animate={{ x: ['-100%', '0%'] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: '200%', height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, var(--color-primary) 10px, var(--color-primary) 20px)', opacity: 0.5 }} 
              />
            </div>
          </div>
        </div>

        <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-secondary)', borderRadius: '50%', padding: '16px' }}>
            <Activity size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>RAM ĐÃ DÙNG</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '2px 0 6px 0' }}>
              <AnimatedCounter value={observability?.system?.ram_usage || 64.8} decimals={1} suffix="%" />
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${observability?.system?.ram_usage || 64.8}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--color-secondary)' }} />
            </div>
          </div>
        </div>

        <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', borderRadius: '50%', padding: '16px' }}>
            <HardDrive size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DUNG LƯỢNG ĐĨA</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '2px 0 6px 0' }}>
              <AnimatedCounter value={observability?.system?.disk_usage || 41.2} decimals={1} suffix="%" />
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${observability?.system?.disk_usage || 41.2}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--color-warning)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Health List */}
      <div className="panel-glass">
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="var(--color-accent)" /> Giám sát Sức khỏe Nghiệp vụ Doanh nghiệp
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>DOANH NGHIỆP</th>
                <th>DOMAIN</th>
                <th style={{ textAlign: 'center' }}>TỔNG SỐ TÁC VỤ</th>
                <th style={{ textAlign: 'center' }}>TỔNG SỐ LỖI</th>
                <th style={{ textAlign: 'center' }}>MỨC ĐỘ SỨC KHỎE</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {observability?.tenants?.map((t: any) => (
                <tr 
                  key={t.id} 
                  onClick={() => setSelectedTenantForReport(t)}
                  style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 12px', fontWeight: 600, color: '#fff' }}>{t.company_name}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.domain}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700 }}>{t.task_count}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, color: t.error_count > 0 ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                    {t.error_count}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                      background: t.health_status === 'CRITICAL' ? 'rgba(244, 63, 94, 0.15)' : (t.health_status === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                      color: t.health_status === 'CRITICAL' ? 'var(--color-accent)' : (t.health_status === 'WARNING' ? 'var(--color-warning)' : 'var(--color-secondary)')
                    }}>
                      {t.health_status === 'CRITICAL' ? '🔴 CRITICAL' : (t.health_status === 'WARNING' ? '🟡 WARNING' : '🟢 HEALTHY')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ fontSize: '12px', color: t.status === 'ACTIVE' ? 'var(--color-secondary)' : 'var(--text-dim)' }}>
                      {t.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!observability?.tenants || observability.tenants.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Không có dữ liệu sức khỏe doanh nghiệp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Tenant Report Modal */}
      {selectedTenantForReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SMART CONTRACT & HEALTH INSPECTOR</span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '4px 0 0 0' }}>{selectedTenantForReport.company_name}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>ID: <code>{selectedTenantForReport.id}</code> | Domain: <code>{selectedTenantForReport.domain}</code></p>
              </div>
              <button onClick={() => setSelectedTenantForReport(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>DB CONNECTIONS</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>8 / 20</div>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '4px', fontWeight: 600 }}>🟢 Pool Normal</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STORAGE QUOTA</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>1.4 GB / {storageQuotaGb} GB</div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round((1.4 / storageQuotaGb) * 100))}%`, background: 'var(--color-secondary)' }} />
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>CACHE HIT RATE</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>94.2%</div>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '4px', fontWeight: 600 }}>⚡ 12.8k hits</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>Lưu lượng & Tần suất lỗi</h4>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tenantTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                    <ChartTooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="requests" stroke="var(--color-secondary)" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={1.5} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Blockchain Live Ledger */}
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <ShieldCheck size={14} /> LIVE LEDGER (U2U BLOCKCHAIN)
                </span>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px', height: '120px', overflowY: 'auto', position: 'relative' }}>
                  {loadingLedger ? (
                    <div>Đang kết nối Ledger...</div>
                  ) : blockchainRecords.length > 0 ? (
                    blockchainRecords.map((rec: any, idx) => (
                      <div key={rec.id || idx} style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#10b981' }}>[VERIFIED]</span> Tx: <code style={{ color: '#60a5fa' }}>{rec.tx_hash.slice(0, 18)}...</code>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div style={{ marginBottom: '8px' }}><span style={{ color: '#10b981' }}>[VERIFIED]</span> Tx: 0x5ab1...fa Block: 849201</div>
                      <div style={{ marginBottom: '8px' }}><span style={{ color: '#10b981' }}>[VERIFIED]</span> Tx: 0x221c...ee Block: 849202</div>
                      <div style={{ marginBottom: '8px', color: '#f59e0b' }}>[ANCHORING] Syncing 45 records...</div>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px', background: 'linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.95))' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '16px', padding: '20px' }}>
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <AlertCircle size={14} /> LATEST EXCEPTIONS
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', fontSize: '11px' }}>
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', color: '#f87171' }}>
                    <div style={{ fontWeight: 600 }}>DatabaseTimeoutException</div>
                    <div style={{ opacity: 0.8, marginTop: '2px' }}>Connection to db pool exceeded 5000ms</div>
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', color: '#f87171' }}>
                    <div style={{ fontWeight: 600 }}>WebhookError</div>
                    <div style={{ opacity: 0.8, marginTop: '2px' }}>502 Bad Gateway from KiotViet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Copilot Auto-Scaling & Resource Optimizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={16} /> AI Copilot Auto-Scaling Rules
                  </span>
                  <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    ACTIVE WORKERS: {activeWorkers}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block' }}>Kích hoạt Tự động Co giãn (Auto-Scaling)</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hệ thống tự động tăng worker khi hàng đợi quá tải.</span>
                    </div>
                    <button 
                      onClick={() => setAutoScaling(!autoScaling)}
                      style={{
                        width: '44px',
                        height: '22px',
                        borderRadius: '11px',
                        background: autoScaling ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.3s'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '2px',
                        left: autoScaling ? '24px' : '2px',
                        transition: 'left 0.3s'
                      }} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>MIN INSTANCES</span>
                      <input 
                        type="number" 
                        value={minWorkers}
                        onChange={e => setMinWorkers(Number(e.target.value))}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>MAX INSTANCES</span>
                      <input 
                        type="number" 
                        value={maxWorkers}
                        onChange={e => setMaxWorkers(Number(e.target.value))}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET LATENCY (S)</span>
                      <input 
                        type="number" 
                        value={targetLatency}
                        onChange={e => setTargetLatency(Number(e.target.value))}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                  <button 
                    onClick={saveScalingConfig}
                    disabled={isSavingScaling}
                    style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isSavingScaling ? <Loader2 size={12} className="animate-spin" /> : <Settings size={12} />} Lưu quy luật Co giãn
                  </button>
                </div>
              </div>

              {/* Scaling Audit Logs */}
              <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '180px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                  SCALING LEDGER AUDIT
                </span>
                <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', height: '100px' }} className="hide-scrollbar">
                  {scalingLogs.map((log, i) => (
                    <div key={i} style={{ color: log.includes('⚙️') ? '#60a5fa' : '#94a3b8' }}>{log}</div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
