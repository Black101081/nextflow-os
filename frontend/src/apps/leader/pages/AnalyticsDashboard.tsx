import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Settings,
  X
} from 'lucide-react';

const DEFAULT_WIDGETS = {
  revenue: true,
  tasks: true,
  sla: true,
  time: true,
  throughput: true,
  leaderboard: true
};

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [throughput, setThroughput] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  
  // Widget Visibility State
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(DEFAULT_WIDGETS);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    // Load config from localStorage
    const saved = localStorage.getItem('sme_dashboard_widgets');
    if (saved) {
      try {
        setVisibleWidgets(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleWidget = (key: string) => {
    const nextState = { ...visibleWidgets, [key]: !visibleWidgets[key] };
    setVisibleWidgets(nextState);
    localStorage.setItem('sme_dashboard_widgets', JSON.stringify(nextState));
  };

  const handleSeedDemo = async () => {
    if (!window.confirm("Bạn có muốn nạp dữ liệu mẫu (đơn hàng, chat, KPI) vào Workspace để dùng thử hệ thống không? Dữ liệu cũ sẽ được dọn dẹp.")) return;
    try {
      const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
      await apiService.seedDemoData(auth);
      alert("Nạp dữ liệu mẫu thành công! Hệ thống đang tải lại...");
      window.location.reload();
    } catch (err: any) {
      alert("Lỗi nạp dữ liệu: " + err.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [kpiData, throughputData, operatorData] = await Promise.all([
          apiService.getTenantKpis(user),
          apiService.getQueueThroughput(user),
          apiService.getOperatorPerformance(user)
        ]);
        
        setKpis(kpiData.metrics);
        setThroughput(throughputData.data.reverse()); // Reverse to show chronological order
        setOperators(operatorData.data);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadData();
    }
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading && !kpis) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', width: '32px', height: '32px' }}></div>
          <span>Đang tổng hợp dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 color="var(--color-primary)" /> Báo cáo Hiệu suất (Dynamic)
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Theo dõi sức khỏe vận hành và doanh thu ước tính theo thời gian thực.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleSeedDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            Nạp dữ liệu mẫu (Demo Seed)
          </button>
          <button 
            onClick={() => setIsCustomizeOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#222',
              border: '1px solid #444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Settings size={16} /> Tùy chỉnh Widget
          </button>
        </div>
      </div>

      {/* Action Items (Công việc khẩn cấp) */}
      <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertTriangle color="var(--color-accent)" size={20} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Công việc khẩn cấp cần xử lý ngay</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>3 Đơn hàng trễ hạn giao (GHTK)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Quá hạn SLA 2 giờ - Chi nhánh Cầu Giấy</div>
            </div>
            <button onClick={() => alert('Đang chuyển hướng xử lý...')} style={{ background: 'var(--color-accent)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xử lý</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>2 Yêu cầu hoàn tiền cần phê duyệt</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tổng tiền: 1.560.000đ - Chờ sếp duyệt</div>
            </div>
            <button onClick={() => alert('Đang chuyển hướng xử lý...')} style={{ background: 'var(--color-warning)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xem duyệt</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Kết nối Zalo ZNS bị gián đoạn</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Lỗi xác thực Access Token từ Zalo OA</div>
            </div>
            <button onClick={() => alert('Đang chuyển hướng xử lý...')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Cấu hình</button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        
        {/* Doanh thu */}
        {visibleWidgets['revenue'] && (
          <div className="panel-glass dashboard-kpi-card-green" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(10, 12, 16, 0.7) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>DOANH THU 24H</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '8px', color: 'var(--color-secondary)' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis?.total_revenue || 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-secondary)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                <TrendingUp size={12} /> +12.4%
              </span>
              <span style={{ color: 'var(--text-dim)' }}>so với hôm qua</span>
            </div>
          </div>
        )}

        {/* Total Tasks */}
        {visibleWidgets['tasks'] && (
          <div className="panel-glass dashboard-kpi-card-indigo" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(10, 12, 16, 0.7) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>TỔNG SỐ TASK</span>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)' }}>
                <CheckCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {kpis?.total_tasks || 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                <TrendingUp size={12} /> +8.2%
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Đã hoàn thành {kpis?.completed_count || 0} task</span>
            </div>
          </div>
        )}

        {/* SLA Breach */}
        {visibleWidgets['sla'] && (
          <div className="panel-glass dashboard-kpi-card-rose" style={{ background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(10, 12, 16, 0.7) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>TỈ LỆ VI PHẠM SLA</span>
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '8px', borderRadius: '8px', color: 'var(--color-accent)' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {kpis?.sla_breach_rate || 0}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-accent)', background: 'rgba(244, 63, 94, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                <TrendingDown size={12} /> -2.5%
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Cải thiện tốt hơn</span>
            </div>
          </div>
        )}

        {/* Resolution Time */}
        {visibleWidgets['time'] && (
          <div className="panel-glass dashboard-kpi-card-purple" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(10, 12, 16, 0.7) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>THỜI GIAN XỬ LÝ (AVG)</span>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {Math.round((kpis?.avg_resolution_seconds || 0) / 60)} phút
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                <TrendingDown size={12} /> -15%
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Thời gian xử lý trung bình</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts & Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Throughput Chart */}
        {visibleWidgets['throughput'] && (
          <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>Tốc độ xử lý theo giờ (Throughput)</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Số lượng Work Items hoàn thành theo từng múi giờ</p>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {throughput.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={throughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="var(--text-dim)" 
                      fontSize={11} 
                      tickFormatter={(val) => {
                        const date = new Date(val);
                        return `${date.getHours()}h`;
                      }}
                    />
                    <YAxis stroke="var(--text-dim)" fontSize={11} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#12141c', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                      labelFormatter={(val) => {
                        const date = new Date(val as string);
                        return `${date.getHours()}:00 - ${date.getDate()}/${date.getMonth()+1}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="items_completed" 
                      name="Task Hoàn thành" 
                      stroke="var(--color-primary)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCompleted)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-dim)' }}>
                  Chưa có dữ liệu xử lý trong 7 ngày qua
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operator Leaderboard */}
        {visibleWidgets['leaderboard'] && (
          <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> Bảng xếp hạng Nhân sự
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Top nhân viên có hiệu suất xử lý tốt nhất</p>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {operators.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {operators.map((op, idx) => (
                    <div key={op.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? 'var(--color-secondary)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.1)', color: idx < 3 ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{op.full_name || 'Nhân sự Ẩn danh'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>SLA: {op.on_time_completion_rate}% đúng hạn</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{op.tasks_completed}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tasks</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-dim)' }}>
                  Chưa có dữ liệu nhân sự
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customize Modal */}
      {isCustomizeOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            width: '400px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Tùy chỉnh Dashboard</h3>
              <button 
                onClick={() => setIsCustomizeOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries({
                revenue: 'Doanh thu 24H',
                tasks: 'Tổng số Task',
                sla: 'Tỉ lệ vi phạm SLA',
                time: 'Thời gian xử lý trung bình',
                throughput: 'Biểu đồ Tốc độ xử lý',
                leaderboard: 'Bảng xếp hạng Nhân sự'
              }).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={visibleWidgets[key]} 
                    onChange={() => toggleWidget(key)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '15px', color: '#fff' }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsCustomizeOpen(false)}
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Premium KPI Card Hover & Glow States */
        .dashboard-kpi-card-green,
        .dashboard-kpi-card-indigo,
        .dashboard-kpi-card-rose,
        .dashboard-kpi-card-purple {
          transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .dashboard-kpi-card-green:hover {
          transform: translateY(-3px);
          border-color: rgba(16, 185, 129, 0.3) !important;
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.1) !important;
        }
        
        .dashboard-kpi-card-indigo:hover {
          transform: translateY(-3px);
          border-color: rgba(99, 102, 241, 0.3) !important;
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.1) !important;
        }
        
        .dashboard-kpi-card-rose:hover {
          transform: translateY(-3px);
          border-color: rgba(244, 63, 94, 0.3) !important;
          box-shadow: 0 12px 30px rgba(244, 63, 94, 0.1) !important;
        }
        
        .dashboard-kpi-card-purple:hover {
          transform: translateY(-3px);
          border-color: rgba(168, 85, 247, 0.3) !important;
          box-shadow: 0 12px 30px rgba(168, 85, 247, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
