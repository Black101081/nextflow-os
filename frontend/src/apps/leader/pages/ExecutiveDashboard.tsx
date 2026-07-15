import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, CheckCircle, Clock, Database, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Brain, ShieldCheck, Flame, Zap, Settings, Check, Loader2, Coins, AlertTriangle, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { AICopilotCard } from '../components/AICopilotCard';
import { apiService } from '../../../shared/services/api';

// Dummy data for charts
const weeklyData = [
  { name: 'Mon', revenue: 4000, tasks: 24, violations: 1, payouts: 50 },
  { name: 'Tue', revenue: 3000, tasks: 13, violations: 0, payouts: 0 },
  { name: 'Wed', revenue: 2000, tasks: 98, violations: 3, payouts: 150 },
  { name: 'Thu', revenue: 2780, tasks: 39, violations: 0, payouts: 0 },
  { name: 'Fri', revenue: 1890, tasks: 48, violations: 2, payouts: 100 },
  { name: 'Sat', revenue: 2390, tasks: 38, violations: 1, payouts: 50 },
  { name: 'Sun', revenue: 3490, tasks: 43, violations: 0, payouts: 0 },
];

export const ExecutiveDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chainEvents, setChainEvents] = useState<any[]>([]);

  // Gas Relayer Policies States
  const [sponsorGas, setSponsorGas] = useState(() => {
    const saved = localStorage.getItem('gas_relayer_sponsor');
    return saved === 'true';
  });
  const [gasCap, setGasCap] = useState(() => {
    const saved = localStorage.getItem('gas_relayer_cap');
    return saved ? Number(saved) : 50;
  });
  const [gasLimitPerMonth, setGasLimitPerMonth] = useState(() => {
    const saved = localStorage.getItem('gas_relayer_monthly_limit');
    return saved ? Number(saved) : 500;
  });
  const [relayerWallet, setRelayerWallet] = useState(() => {
    const saved = localStorage.getItem('gas_relayer_wallet');
    return saved || '0xGasStation_U2U_3a9fB2e947F15C6c29774d812';
  });

  // AI Burnout State
  const [burnoutRisk, setBurnoutRisk] = useState<number | null>(null);
  const [burnoutEmployee, setBurnoutEmployee] = useState('Nguyễn Văn A');
  const [loadingBurnout, setLoadingBurnout] = useState(false);

  // Blockchain Explorer Modal State
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // In-app notification state
  const [gasNotif, setGasNotif] = useState<string | null>(null);
  const showGasNotif = (msg: string) => {
    setGasNotif(msg);
    setTimeout(() => setGasNotif(null), 3000);
  };

  useEffect(() => {
    const checkBurnout = async () => {
      setLoadingBurnout(true);
      try {
        const score = await apiService.analyzeBurnout(
          { token: localStorage.getItem('nf_access_token') }, 
          "employee_nguyen_van_a_worked_60_hours_and_processed_150_tasks"
        );
        setBurnoutRisk(score || 82);
      } catch (err) {
        console.error("Error analyzing burnout", err);
        setBurnoutRisk(82); // Fallback
      } finally {
        setLoadingBurnout(false);
      }
    };
    checkBurnout();
  }, []);

  const saveGasPolicies = () => {
    localStorage.setItem('gas_relayer_sponsor', String(sponsorGas));
    localStorage.setItem('gas_relayer_cap', String(gasCap));
    localStorage.setItem('gas_relayer_monthly_limit', String(gasLimitPerMonth));
    localStorage.setItem('gas_relayer_wallet', relayerWallet);
    window.dispatchEvent(new Event('storage'));
    showGasNotif('Đã lưu cấu hình tài trợ phí Gas thành công! ✅');
  };

  // AI Agent Drag-and-Drop / Triage Collaboration Board
  const [tickets, setTickets] = useState([
    { id: 'TKT-8021', title: 'Khiếu nại trễ ship Zalo OA', customer: 'Nguyễn Văn A', severity: 'High', delay: '45 phút', reward: 50, status: 'queue' },
    { id: 'TKT-8022', title: 'Lỗi đồng bộ KiotViet POS', customer: 'Lê Hoàng B', severity: 'Medium', delay: 'N/A', reward: 20, status: 'queue' },
    { id: 'TKT-8023', title: 'Yêu cầu bồi hoàn quá hạn SLA', customer: 'Phạm Minh C', severity: 'Critical', delay: '90 phút', reward: 150, status: 'queue' },
  ]);

  const [agentLogs, setAgentLogs] = useState<string[]>([
    '🤖 AI Triage Engine initialized. Awaiting incidents...'
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMoveTicket = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setIsProcessing(true);
    let logs: string[] = [];
    if (newStatus === 'triage') {
      logs = [
        `🔍 [Triage Agent] Đang phân tích ticket ${ticketId}: "${ticket.title}"`,
        `💡 [Triage Agent] Phân loại: Sự cố dịch vụ [${ticket.severity}]. Gán nhãn tự động.`
      ];
    } else if (newStatus === 'risk') {
      logs = [
        `🛡️ [Risk Auditor] Đang kiểm tra lịch sử & vi phạm SLA của khách hàng: ${ticket.customer}`,
        `📊 [Risk Auditor] Trễ: ${ticket.delay}. Mức độ nghiêm trọng: ${ticket.severity}.`,
        `✅ [Risk Auditor] Hợp lệ! Đề xuất bồi thường mức: ${ticket.reward} NFTk.`
      ];
    } else if (newStatus === 'loyalty') {
      logs = [
        `💳 [Loyalty Refund] Đang tạo giao dịch bồi hoàn Web3 trên mạng U2U...`,
        `📡 [Loyalty Refund] Khởi chạy ví tài trợ: ${relayerWallet}`,
        `🎉 [Loyalty Refund] SUCCESS! Đã phân phối ${ticket.reward} NFTk cho ${ticket.customer}.`
      ];

      setTimeout(() => {
        const currentEvents = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
        const updated = [
          {
            timestamp: new Date().toISOString(),
            block: Math.floor(4082000 + Math.random() * 10000),
            type: 'SlaCompensationSent',
            recipient: '0xU2U...f4A9',
            details: `Bồi thường SLA sự cố ${ticketId}: +${ticket.reward} NFTk`,
            txHash: `0x${Math.random().toString(36).substring(2, 10).toUpperCase()}8a9f...3c2e`
          },
          ...currentEvents
        ];
        localStorage.setItem('u2u_chain_events', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }, 1000);
    } else {
      logs = [`📥 [Queue] Đã đưa ticket ${ticketId} về hàng đợi.`];
    }

    let delay = 0;
    logs.forEach((log, index) => {
      setTimeout(() => {
        setAgentLogs(prev => [log, ...prev].slice(0, 50));
        if (index === logs.length - 1) {
          setIsProcessing(false);
        }
      }, delay);
      delay += 800;
    });
  };

  useEffect(() => {
    const fetchEvents = () => {
      const stored = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
      if (stored.length === 0) {
        const initial = [
          { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), block: 4082103, type: 'LoyaltyTokenMinted', recipient: '0xU2U...f4A9', details: 'Hoàn tiền mua hàng (Cashback 50%): +500 NFTk', txHash: '0x4f8a...9c3b' },
          { timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), block: 4082042, type: 'WalletLinked', recipient: '0xU2U...f4A9', details: 'Ví Web3 khách hàng được liên kết thành công', txHash: '0x7e2d...4a1f' }
        ];
        localStorage.setItem('u2u_chain_events', JSON.stringify(initial));
        setChainEvents(initial);
      } else {
        setChainEvents(stored);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Lấy dữ liệu analytics v2 từ Backend
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/platform/analytics/daily-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data);
    } catch (error) {
      console.error("Lỗi fetch report, dùng dữ liệu giả lập.", error);
      // Fallback giả lập do DB đang tắt
      setReport({
        success: true,
        report_date: new Date().toISOString().split('T')[0],
        data_hash: "0x8f2d5e7a9b1c345...",
        tx_hash: "0xea3c89b21f3d05a41...",
        insights: "AI: Tổng kết ngày, khối lượng công việc đạt 125 tác vụ, với 2 tác vụ vi phạm SLA. Tỷ lệ tuân thủ SLA: 98.4%. ✅ TỐT: Năng suất nhân sự đang ở mức xuất sắc, đảm bảo chất lượng dịch vụ tốt. Tuy nhiên cần chú ý 2 tác vụ trễ hạn.",
        metrics: {
          total: 125,
          completed: 123,
          sla_violations: 2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const kpis = [
    { label: "Doanh thu hôm nay", value: "85,400,000đ", change: "+12.5%", isUp: true, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Khách hàng mới", value: "342", change: "+5.2%", isUp: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tác vụ hoàn thành", value: report?.metrics?.completed || "0", change: "-1.1%", isUp: false, icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Vi phạm SLA", value: report?.metrics?.sla_violations || "0", change: "-2.4%", isUp: false, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
      
      {/* In-app Gas Notification Toast */}
      <AnimatePresence>
        {gasNotif && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[9999] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] font-semibold flex items-center gap-3"
          >
            <Check className="w-5 h-5" /> {gasNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Báo cáo hợp nhất AI & Blockchain Analytics</p>
        </div>
        <button 
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : 'text-gray-500'}`} />
          <span className="text-sm font-medium">Làm mới dữ liệu</span>
        </button>
      </div>

      {/* AI Burnout Alert Panel */}
      {burnoutRisk && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl backdrop-blur-xl bg-amber-500/10 border border-amber-500/20 shadow-xl flex items-start gap-4"
        >
          <div className="p-3 rounded-full bg-amber-500/20 text-amber-500 shrink-0">
            <Flame size={24} className="animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle size={16} /> Cảnh báo Kiệt sức Nhân sự & Phân bổ Công việc (AI Burnout Alert)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Hệ thống AI phát hiện nhân viên <strong>{burnoutEmployee}</strong> đang có dấu hiệu quá tải công việc với chỉ số <strong>Rủi ro kiệt sức đạt {burnoutRisk}%</strong>. 
              Đề xuất: Điều phối bớt 3 task thuộc hàng đợi sang cho nhân sự khác và xem xét phê duyệt đơn xin nghỉ phép ngày mai của nhân sự này.
            </p>
          </div>
        </motion.div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI Cards */}
        {kpis.map((kpi, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                kpi.isUp ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' 
                         : 'text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400'
              }`}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{kpi.label}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{loading ? '...' : kpi.value}</p>
            </div>
          </motion.div>
        ))}

        {/* AI Copilot Insight Card (Span 3 cols) */}
        {report && (
          <AICopilotCard 
            insightText={report.insights} 
            txHash={report.tx_hash} 
          />
        )}

        {/* Data Source Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-1 rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3">
            <Database className="w-24 h-24 text-white/5 -rotate-12" />
          </div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" /> Nguồn Dữ Liệu
          </h3>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
              <span className="text-sm font-medium">KiotViet POS</span>
              <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            </div>
            <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
              <span className="text-sm font-medium">Zalo OA</span>
              <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            </div>
            <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
              <span className="text-sm font-medium">U2U Chain</span>
              <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-1 md:col-span-2 lg:col-span-3 rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Xu hướng doanh thu (7 ngày)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
                  itemStyle={{ color: '#6366f1', fontWeight: 'bold' }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="col-span-1 rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tác vụ theo ngày</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* SLA & Smart Contract Payouts Trend */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Giám sát Vi phạm SLA & Giải ngân Smart Contract (7 ngày)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }} 
                  itemStyle={{ fontSize: 12, fontWeight: 'bold' }} 
                />
                <Area yAxisId="left" type="monotone" dataKey="violations" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorViolations)" name="Vi phạm SLA" />
                <Area yAxisId="right" type="monotone" dataKey="payouts" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPayouts)" name="Tokens bồi thường" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Interactive Multi-Agent Triage Board & Gas Station */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Triage Board */}
          <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Brain className="text-indigo-500" size={24} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Agent Incident Triage Board</h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">Kéo/chuyển sự cố sang các Agent để xử lý</span>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-4 gap-3">
              {/* Column 1: Queue */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 min-h-[220px]">
                <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-150 dark:border-slate-800 pb-1.5 flex justify-between">
                  <span>Hàng Đợi</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                    {tickets.filter(t => t.status === 'queue').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tickets.filter(t => t.status === 'queue').map(t => (
                    <div key={t.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{t.title}</div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{t.id}</span>
                        <span className="bg-rose-500/10 text-rose-500 font-bold px-1 rounded text-[8px]">{t.severity}</span>
                      </div>
                      <button 
                        onClick={() => handleMoveTicket(t.id, 'triage')}
                        className="w-full py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
                      >
                        Triage Agent
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Triage */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 min-h-[220px]">
                <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-150 dark:border-slate-800 pb-1.5 flex justify-between">
                  <span>Triage AGT</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                    {tickets.filter(t => t.status === 'triage').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tickets.filter(t => t.status === 'triage').map(t => (
                    <div key={t.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Trễ: {t.delay}</div>
                      <button 
                        onClick={() => handleMoveTicket(t.id, 'risk')}
                        className="w-full py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
                      >
                        Risk Auditor
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Risk */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 min-h-[220px]">
                <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-150 dark:border-slate-800 pb-1.5 flex justify-between">
                  <span>Risk Audit</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                    {tickets.filter(t => t.status === 'risk').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tickets.filter(t => t.status === 'risk').map(t => (
                    <div key={t.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{t.title}</div>
                      <div className="text-[10px] text-emerald-500 font-bold">Đề xuất: {t.reward} NFTk</div>
                      <button 
                        onClick={() => handleMoveTicket(t.id, 'loyalty')}
                        className="w-full py-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Zap size={10} /> Disburse
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4: Loyalty (Resolved) */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 min-h-[220px]">
                <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-150 dark:border-slate-800 pb-1.5 flex justify-between">
                  <span>Loyalty</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                    {tickets.filter(t => t.status === 'loyalty').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tickets.filter(t => t.status === 'loyalty').map(t => (
                    <div key={t.id} className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-sm space-y-2 text-center">
                      <div className="text-xs font-bold text-emerald-400 truncate">{t.title}</div>
                      <div className="text-[10px] text-emerald-500/80 font-bold flex items-center justify-center gap-1">
                        <Check size={10} /> Đã bồi hoàn
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Agent Real-time log monitor */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-indigo-500/20 h-32 overflow-y-auto font-mono text-xs text-indigo-400 space-y-1 hide-scrollbar">
              {isProcessing && <div className="text-[10px] text-indigo-500/50 animate-pulse">Agent is thinking...</div>}
              {agentLogs.map((log, index) => (
                <div key={index} className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('ERROR') ? 'text-rose-400 font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Gas Relayer Policies Card */}
          <div className="rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <Coins className="text-indigo-500" size={24} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Web3 Gas Station Policy</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Tài trợ phí Gas (Sponsored Gas)</label>
                    <p className="text-xs text-gray-500">Khách hàng không cần ví có U2U/ETH để thanh toán.</p>
                  </div>
                  <button 
                    onClick={() => setSponsorGas(!sponsorGas)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${sponsorGas ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${sponsorGas ? (document.dir === 'rtl' ? 'left-0.5' : 'right-0.5') : (document.dir === 'rtl' ? 'right-0.5' : 'left-0.5')}`}></div>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Gas Cap tối đa (Gwei)</label>
                  <input 
                    type="number"
                    value={gasCap}
                    onChange={e => setGasCap(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Hạn mức tài trợ tháng (U2U)</label>
                  <input 
                    type="number"
                    value={gasLimitPerMonth}
                    onChange={e => setGasLimitPerMonth(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Địa chỉ Relayer Funding Wallet</label>
                  <input 
                    type="text"
                    value={relayerWallet}
                    onChange={e => setRelayerWallet(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveGasPolicies}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_5px_15px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2"
            >
              <Settings size={16} /> Lưu cấu hình Gas Relayer
            </button>
          </div>
        </div>

        {/* Live U2U Blockchain Event Auditor Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-6 bg-slate-900 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white m-0">Live U2U Chain Event Auditor</h3>
              <p className="text-xs text-slate-400 m-0">Nhật ký sự kiện Smart Contract kiểm toán thời gian thực</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Block #</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Sự kiện</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ ví (Recipient)</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nội dung</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">TxHash</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {chainEvents.map((evt, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-300 font-mono">#{evt.block}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        evt.type === 'SlaCompensationSent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        evt.type === 'LoyaltyTokenMinted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        evt.type === 'VoucherRedeemed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {evt.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300 font-mono">{evt.recipient}</td>
                    <td className="p-4 text-sm text-slate-300 font-medium">{evt.details}</td>
                    <td className="p-4 text-sm text-indigo-400 font-mono select-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(evt);
                        }}
                        className="cursor-pointer hover:underline text-left text-indigo-400 border-none bg-transparent p-0 font-mono"
                      >
                        {evt.txHash}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {chainEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-slate-500 font-medium">Chưa có giao dịch on-chain nào phát sinh.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* U2U Blockchain Tx Details Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 font-mono overflow-hidden z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" /> U2U TX AUDITOR
                </h3>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1 font-mono">Transaction Hash</div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 text-indigo-400 break-all select-all font-mono">
                    {selectedTx.txHash}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1 font-mono">Block Number</div>
                    <div className="text-sm font-semibold text-slate-200">#{selectedTx.block}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1 font-mono">Event Type</div>
                    <div className="text-sm font-semibold text-emerald-400">{selectedTx.type}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1 font-mono">Network</div>
                    <div className="text-sm font-semibold text-purple-400">U2U Mainnet (Simulated)</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1 font-mono">Gas Sponsored</div>
                    <div className="text-sm font-semibold text-amber-400">0.00248 U2U (FREE)</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1 font-mono">Audit Metadata Snapshot</div>
                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 max-h-[160px] overflow-y-auto font-mono text-[11px] text-green-400">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        event_name: selectedTx.type,
                        recipient_address: selectedTx.recipient,
                        payload_details: selectedTx.details,
                        gas_sponsored: true,
                        relayer_address: relayerWallet,
                        timestamp: selectedTx.timestamp
                      }, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setSelectedTx(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close Auditor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExecutiveDashboard;
