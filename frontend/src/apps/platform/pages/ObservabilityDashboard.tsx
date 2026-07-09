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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPU LOAD</span>
                <Cpu size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{observabilityData.system.cpu_usage}%</div>
              <div style={{ width: '100%', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${observabilityData.system.cpu_usage}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RAM USAGE</span>
                <Server size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{observabilityData.system.ram_usage}%</div>
              <div style={{ width: '100%', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${observabilityData.system.ram_usage}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DISK STATUS</span>
                <HardDrive size={18} color="#a855f7" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{observabilityData.system.disk_usage}%</div>
              <div style={{ width: '100%', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${observabilityData.system.disk_usage}%`, height: '100%', background: '#a855f7', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SERVER UPTIME</span>
                <Clock size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{observabilityData.system.uptime_hours} hrs</div>
              <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                System is healthy & online
              </div>
            </div>
          </div>

          {/* Middle Row: Recharts Global Traffic Analysis */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700 }}>Biểu đồ Lưu lượng Platform Requests (24h qua)</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" name="API Requests" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row: Active Tenants Health & Workload Table */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700 }}>Chi tiết hiệu năng từng Doanh nghiệp (Multi-Tenant Health)</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
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
                    <tr key={tenant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: '#fff' }}>{tenant.company_name}</td>
                      <td style={{ padding: '16px 12px', color: '#94a3b8' }}>{tenant.domain}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600,
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
                      <td style={{ padding: '16px 12px', color: tenant.error_count > 0 ? '#ef4444' : '#94a3b8' }}>
                        {tenant.error_count} lỗi phát sinh
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '16px',
                          background: tenant.health_status === 'HEALTHY' ? 'rgba(16, 185, 129, 0.15)' : tenant.health_status === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: tenant.health_status === 'HEALTHY' ? '#34d399' : tenant.health_status === 'WARNING' ? '#fbbf24' : '#f87171',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: tenant.health_status === 'HEALTHY' ? '#10b981' : tenant.health_status === 'WARNING' ? '#f59e0b' : '#ef4444',
                            display: 'inline-block' 
                          }}></span>
                          {tenant.health_status === 'HEALTHY' ? 'AN TOÀN (Healthy)' : tenant.health_status === 'WARNING' ? 'CẢNH BÁO (Warning)' : 'NGUY HIỂM (Critical)'}
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
    </div>
  );
}
