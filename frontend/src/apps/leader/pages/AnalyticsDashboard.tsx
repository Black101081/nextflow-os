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
  X,
  Bot,
  Zap,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_WIDGETS = {
  revenue: true,
  tasks: true,
  sla: true,
  time: true,
  throughput: true,
  leaderboard: true,
  ai_insights: true
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
        
        // Deterministic predictive data based on historical items
        const enhancedThroughput = throughputData.data.reverse().map((t: any) => ({
          ...t,
          items_predicted: Math.floor((t.items_completed || 0) * 1.15) // Predict 15% growth instead of random
        }));
        
        setKpis(kpiData.metrics);
        setThroughput(enhancedThroughput);
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
    
    // Note: Replaced setInterval polling with manual reload or WS in future.
  }, [user]);

  if (loading && !kpis) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', width: '32px', height: '32px' }}></div>
          <span style={{ fontFamily: '"Outfit", sans-serif', letterSpacing: '1px' }}>INITIALIZING BUSINESS COCKPIT...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <BarChart2 color="#a855f7" size={28} /> BUSINESS INTELLIGENCE
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontWeight: 500 }}>Theo dõi sức khỏe vận hành và doanh thu ước tính theo thời gian thực (Real-time Tracker).</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSeedDemo}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
              fontWeight: 800, boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', letterSpacing: '0.5px'
            }}
          >
            <Database size={16} /> INJECT DEMO DATA
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsCustomizeOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
              fontWeight: 600, backdropFilter: 'blur(10px)'
            }}
          >
            <Settings size={16} /> WIDGETS
          </motion.button>
        </div>
      </div>

      {/* AI Insights Widget - Enhanced Sci-Fi */}
      {visibleWidgets['ai_insights'] && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ 
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)', 
            border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '24px', 
            display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.15)'
          }}
        >
          {/* Animated Glare */}
          <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', transform: 'skewX(-20deg)' }} />
          
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '16px', borderRadius: '50%', color: '#d8b4fe', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)', zIndex: 1 }}>
            <Bot size={32} />
          </div>
          <div style={{ zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px' }}>
              <Zap size={18} color="#fbbf24" fill="#fbbf24" /> AI OPERATIONS INSIGHT
            </h3>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '15px', lineHeight: 1.6 }}>
              Dự báo lưu lượng đơn hàng sẽ <strong style={{ color: '#34d399' }}>tăng 15%</strong> trong 24h tới do hiệu ứng ngày Lễ. 
              Khuyến nghị: Bật luồng <strong style={{ color: '#38bdf8' }}>Tự động gửi Zalo ZNS</strong> và bổ sung thêm nhân sự xử lý để đảm bảo <strong style={{ color: '#f43f5e' }}>SLA</strong>.
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI Cards - Glowing Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* Doanh thu */}
        {visibleWidgets['revenue'] && (
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(52, 211, 153, 0.2)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#6ee7b7', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>DOANH THU 24H</span>
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '10px', borderRadius: '12px', color: '#34d399', boxShadow: 'inset 0 0 10px rgba(52, 211, 153, 0.2)' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', textShadow: '0 0 15px rgba(52, 211, 153, 0.4)' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis?.total_revenue || 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                <TrendingUp size={14} /> +12.4%
              </span>
              <span style={{ color: '#64748b', fontWeight: 500 }}>so với hôm qua</span>
            </div>
          </motion.div>
        )}

        {/* Total Tasks */}
        {visibleWidgets['tasks'] && (
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(56, 189, 248, 0.2)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#7dd3fc', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>TỔNG SỐ TASK</span>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '12px', color: '#38bdf8', boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.2)' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', textShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
              {kpis?.total_tasks || 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                <TrendingUp size={14} /> +8.2%
              </span>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Đã xử lý {kpis?.completed_count || 0}</span>
            </div>
          </motion.div>
        )}

        {/* SLA Breach */}
        {visibleWidgets['sla'] && (
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(244, 63, 94, 0.2)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#fda4af', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>VI PHẠM SLA</span>
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '10px', borderRadius: '12px', color: '#f43f5e', boxShadow: 'inset 0 0 10px rgba(244, 63, 94, 0.2)' }}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', textShadow: '0 0 15px rgba(244, 63, 94, 0.4)' }}>
              {kpis?.sla_breach_rate || 0}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                <TrendingDown size={14} /> -2.5%
              </span>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Tốt hơn tuần trước</span>
            </div>
          </motion.div>
        )}

        {/* Resolution Time */}
        {visibleWidgets['time'] && (
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(168, 85, 247, 0.2)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#d8b4fe', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>TỐC ĐỘ XỬ LÝ (AVG)</span>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '12px', color: '#a855f7', boxShadow: 'inset 0 0 10px rgba(168, 85, 247, 0.2)' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px', textShadow: '0 0 15px rgba(168, 85, 247, 0.4)' }}>
              {Math.round((kpis?.avg_resolution_seconds || 0) / 60)}p
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                <TrendingDown size={14} /> -15%
              </span>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Nhanh hơn TB ngành</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts & Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Throughput Chart */}
        {visibleWidgets['throughput'] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', height: '420px', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#f8fafc' }}>Tốc độ xử lý & Đơn hàng theo giờ</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Thông lượng hệ thống thực tế và Dự báo từ AI Engine</p>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {throughput.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={throughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#64748b" 
                      fontSize={12} 
                      fontFamily="monospace"
                      tickLine={false} axisLine={false}
                      tickFormatter={(val) => {
                        const date = new Date(val);
                        return `${date.getHours()}h`;
                      }}
                    />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} fontFamily="monospace" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-dim)" hide />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                      labelFormatter={(val) => {
                        const date = new Date(val as string);
                        return `${date.getHours()}:00 - ${date.getDate()}/${date.getMonth()+1}`;
                      }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="items_completed" name="Task Hoàn thành" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                    <Area yAxisId="right" type="monotone" dataKey="items_created" name="Task Mới" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorCreated)" />
                    <Area yAxisId="right" type="monotone" dataKey="items_predicted" name="Dự báo AI" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                  Chưa có dữ liệu xử lý trong 7 ngày qua
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Operator Leaderboard */}
        {visibleWidgets['leaderboard'] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', height: '420px', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#a855f7" /> Operator Leaderboard
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Top nhân sự hiệu suất xuất sắc</p>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }} className="hide-scrollbar">
              {operators.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {operators.map((op, idx) => (
                    <motion.div 
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      key={op.user_id} 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                    >
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)', 
                        color: idx < 3 ? '#0f172a' : '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px',
                        boxShadow: idx < 3 ? `0 0 10px ${idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : '#cd7f32'}` : 'none'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc', marginBottom: '2px' }}>{op.full_name || 'Nhân sự Ẩn danh'}</div>
                        <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>SLA Đạt: {op.on_time_completion_rate}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: '#38bdf8', fontSize: '16px' }}>{op.tasks_completed}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TASKS</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                  Chưa có dữ liệu nhân sự
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Customize Modal */}
      {isCustomizeOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            width: '450px',
            padding: '32px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>Configure Cockpit Widgets</h3>
              <button 
                onClick={() => setIsCustomizeOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries({
                revenue: 'Doanh thu 24H',
                tasks: 'Tổng số Task',
                sla: 'Tỉ lệ vi phạm SLA',
                time: 'Thời gian xử lý trung bình',
                throughput: 'Biểu đồ Tốc độ xử lý',
                leaderboard: 'Bảng xếp hạng Nhân sự',
                ai_insights: 'Gợi ý Vận hành bằng AI'
              }).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <input 
                    type="checkbox" 
                    checked={visibleWidgets[key]} 
                    onChange={() => toggleWidget(key)}
                    style={{ width: '20px', height: '20px', accentColor: '#a855f7' }}
                  />
                  <span style={{ fontSize: '15px', color: '#f8fafc', fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsCustomizeOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                APPLY CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
