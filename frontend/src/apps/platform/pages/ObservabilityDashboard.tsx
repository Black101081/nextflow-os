import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Server, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ObservabilityDashboard() {
  const [observabilityData, setObservabilityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchObservability, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mock API trend data for the Recharts graph
  const trendData = [
    { name: '00:00', requests: 420, errors: 2 },
    { name: '04:00', requests: 280, errors: 1 },
    { name: '08:00', requests: 980, errors: 4 },
    { name: '12:00', requests: 1450, errors: 12 },
    { name: '16:00', requests: 1210, errors: 8 },
    { name: '20:00', requests: 1850, errors: 15 },
    { name: '24:00', requests: 1100, errors: 3 },
  ];

  return (
    <div style={{ padding: '32px', color: '#f1f5f9', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Outfit", sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Giám sát Hiệu năng Hệ thống (Observability)
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>
            Xem thời gian thực hiệu suất phần cứng Server, lượng yêu cầu API và tình trạng lỗi phát sinh của từng Doanh nghiệp (Tenant).
          </p>
        </div>
        <button 
          onClick={fetchObservability}
          disabled={loading}
          style={{ 
            padding: '8px 16px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid #334155', 
            borderRadius: '8px', 
            color: '#fff', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '13px',
            fontWeight: 500,
            opacity: loading ? 0.7 : 1
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {observabilityData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top Row: System Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="metrics-card" style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPU LOAD</span>
                <Cpu size={18} color="var(--color-accent)" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{observabilityData.system.cpu_usage}%</div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${observabilityData.system.cpu_usage}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '3px', boxShadow: '0 0 8px var(--color-accent)' }}></div>
              </div>
            </div>

            <div className="metrics-card" style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RAM USAGE</span>
                <Server size={18} color="var(--color-accent)" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{observabilityData.system.ram_usage}%</div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${observabilityData.system.ram_usage}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '3px', boxShadow: '0 0 8px var(--color-accent)' }}></div>
              </div>
            </div>

            <div className="metrics-card" style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DISK STATUS</span>
                <HardDrive size={18} color="#a855f7" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{observabilityData.system.disk_usage}%</div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${observabilityData.system.disk_usage}%`, height: '100%', background: '#a855f7', borderRadius: '3px', boxShadow: '0 0 8px #a855f7' }}></div>
              </div>
            </div>

            <div className="metrics-card" style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SERVER UPTIME</span>
                <Clock size={18} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{observabilityData.system.uptime_hours} hrs</div>
              <div style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                Online & Stable
              </div>
            </div>
          </div>

          {/* Middle Row: Recharts Global Traffic Analysis */}
          <div style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Biểu đồ Lưu lượng Platform Requests (24h qua)</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="requests" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" name="API Requests" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row: Active Tenants Health & Workload Table */}
          <div style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Chi tiết hiệu năng từng Doanh nghiệp (Multi-Tenant Health)</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '16px 12px', fontWeight: 600 }}>TÊN DOANH NGHIỆP</th>
                    <th style={{ padding: '16px 12px', fontWeight: 600 }}>DOMAIN</th>
                    <th style={{ padding: '16px 12px', fontWeight: 600 }}>HẠN MỨC (TIER)</th>
                    <th style={{ padding: '16px 12px', fontWeight: 600 }}>TỔNG CÔNG VIỆC</th>
                    <th style={{ padding: '16px 12px', fontWeight: 600 }}>NGOẠI LỆ / LỖI</th>
                    <th style={{ padding: '16px 12px', fontWeight: 600 }}>ĐÁNH GIÁ SỨC KHỎE</th>
                  </tr>
                </thead>
                <tbody>
                  {observabilityData.tenants.map((tenant: any) => (
                    <tr key={tenant.id} className="tenant-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: '#fff' }}>{tenant.company_name}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-dim)' }}>{tenant.domain}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: tenant.subscription_tier === 'ENTERPRISE' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: tenant.subscription_tier === 'ENTERPRISE' ? '#c084fc' : '#60a5fa'
                        }}>
                          {tenant.subscription_tier}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: '#fff' }}>
                        {tenant.task_count} tác vụ
                      </td>
                      <td style={{ padding: '16px 12px', color: tenant.error_count > 0 ? '#ef4444' : 'var(--text-dim)', fontWeight: tenant.error_count > 0 ? 600 : 400 }}>
                        {tenant.error_count} lỗi phát sinh
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '16px',
                          background: tenant.health_status === 'HEALTHY' ? 'rgba(34, 197, 94, 0.1)' : tenant.health_status === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: tenant.health_status === 'HEALTHY' ? 'var(--color-accent)' : tenant.health_status === 'WARNING' ? '#fbbf24' : '#f87171',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: tenant.health_status === 'HEALTHY' ? 'var(--color-accent)' : tenant.health_status === 'WARNING' ? '#fbbf24' : '#ef4444',
                            display: 'inline-block',
                            boxShadow: `0 0 6px ${tenant.health_status === 'HEALTHY' ? 'var(--color-accent)' : tenant.health_status === 'WARNING' ? '#fbbf24' : '#ef4444'}`
                          }}></span>
                          {tenant.health_status === 'HEALTHY' ? 'AN TOÀN' : tenant.health_status === 'WARNING' ? 'CẢNH BÁO' : 'NGUY HIỂM'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .metrics-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-accent) !important;
        }
        .tenant-row:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}
