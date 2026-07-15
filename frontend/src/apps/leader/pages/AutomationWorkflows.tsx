import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { Network, Plus, Play, Pause, Activity, Clock, Settings, Search, Trash2, ShieldAlert, Gauge, Zap, Settings2, Save, Loader2, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AutomationWorkflows() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'sla' | 'web3'>('list');

  // SLA Staking Pool State
  const [stakingBalance, setStakingBalance] = useState(50000);
  const [stakeAmount, setStakeAmount] = useState(10000);
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [violationRate, setViolationRate] = useState(1.2); 
  const [isStakingAction, setIsStakingAction] = useState(false);
  const [stakingLogs, setStakingLogs] = useState<string[]>([
    '🔒 SLA Pool deployed. Total locked: 50,000 NFTk.'
  ]);

  const handleStake = () => {
    if (stakeAmount <= 0) return;
    setIsStakingAction(true);
    setTimeout(() => {
      setStakingBalance(prev => prev + stakeAmount);
      setStakingLogs(prev => [`➕ Staking Action: Locked +${stakeAmount.toLocaleString()} NFTk. Block #${Math.floor(912850 + Math.random() * 500)}`, ...prev]);
      setIsStakingAction(false);
    }, 1000);
  };

  const handleWithdraw = () => {
    if (withdrawAmount <= 0 || withdrawAmount > stakingBalance) return;
    setIsStakingAction(true);
    setTimeout(() => {
      setStakingBalance(prev => prev - withdrawAmount);
      setStakingLogs(prev => [`➖ Staking Action: Unlocked -${withdrawAmount.toLocaleString()} NFTk. Block #${Math.floor(912850 + Math.random() * 500)}`, ...prev]);
      setIsStakingAction(false);
    }, 1000);
  };

  const netApy = Math.max(10 - violationRate * 1.5, 0);
  const estYield = (stakingBalance * netApy) / 100;

  const penaltyCurve = Array.from({ length: 11 }, (_, i) => {
    const rate = i * 1.0;
    const apyVal = Math.max(10 - rate * 1.5, 0);
    return { name: `${rate}%`, APY: Number(apyVal.toFixed(2)) };
  });
  
  // SLA configuration state
  const [slaTime, setSlaTime] = useState(30);
  const [warningPct, setWarningPct] = useState(80);
  const [criticalPct, setCriticalPct] = useState(100);
  const [zaloAlertGroup, setZaloAlertGroup] = useState(true);
  const [autoCompensationAmount, setAutoCompensationAmount] = useState(150);
  const [isSavingSla, setIsSavingSla] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Web3 Metrics Mock Data
  const gasData = [
    { name: 'Mon', gasPrice: 20.4, latency: 1.2 },
    { name: 'Tue', gasPrice: 22.1, latency: 1.5 },
    { name: 'Wed', gasPrice: 35.8, latency: 2.8 },
    { name: 'Thu', gasPrice: 19.5, latency: 1.1 },
    { name: 'Fri', gasPrice: 24.2, latency: 1.4 },
    { name: 'Sat', gasPrice: 18.9, latency: 0.9 },
    { name: 'Sun', gasPrice: 21.3, latency: 1.0 },
  ];

  useEffect(() => {
    fetchWorkflows();
  }, [auth]);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getWorkflows(auth);
      setWorkflows(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await apiService.toggleWorkflow(auth, id, !currentStatus);
      setWorkflows(workflows.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSla = () => {
    setIsSavingSla(true);
    setTimeout(() => {
      setIsSavingSla(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3500);
    }, 1200);
  };

  return (
    <div className="p-8 font-['Outfit'] space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-[#1e293b] to-[#0f172a] p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Tự Động Hóa KiotViet & Zalo
          </h1>
          <p className="text-slate-400 mt-2">Quản lý các quy trình Automation Workflows (N8N Style) cho doanh nghiệp.</p>
        </div>
        <button 
          onClick={() => navigate('/leader/workflows/builder')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105"
        >
          <Plus size={20} /> Tạo Workflow Mới
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-4 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'list' 
              ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
              : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
          }`}
        >
          <Network size={16} /> Quy Trình Tự Động
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'sla' 
              ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
              : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert size={16} /> Cấu Hình SLA & Cảnh Báo
        </button>
        <button
          onClick={() => setActiveTab('web3')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'web3' 
              ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
              : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
          }`}
        >
          <Gauge size={16} /> Hiệu Năng Web3 & Gas Auditor
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0f172a]/50">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm quy trình..." 
                className="w-full bg-[#1e293b] text-white border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"><Settings size={18} /></button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Đang tải danh sách...</div>
          ) : workflows.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Network size={48} className="text-slate-600 mb-2" />
              <p className="text-xl font-bold text-slate-300">Chưa có Workflow nào</p>
              <p>Bấm nút "Tạo Workflow Mới" để bắt đầu xây dựng quy trình tự động đầu tiên.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold w-1/3">Tên Quy Trình</th>
                  <th className="p-4 font-semibold">Sự kiện kích hoạt (Trigger)</th>
                  <th className="p-4 font-semibold text-center">Trạng thái</th>
                  <th className="p-4 font-semibold">Cập nhật lúc</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-[#334155]/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${wf.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          <Network size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{wf.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {wf.id.split('-')[0]}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-sm font-mono">
                        {wf.trigger_event}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggle(wf.id, wf.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1e293b] ${
                          wf.is_active ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          wf.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <p className="text-xs mt-1 text-slate-400">
                        {wf.is_active ? 'Active' : 'Paused'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock size={14} />
                        {new Date(wf.updated_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-800 hover:bg-indigo-500/20 rounded-lg transition-all" title="Xem chi tiết">
                        <Activity size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/20 rounded-lg transition-all" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: SLA & Alert Settings */}
      {activeTab === 'sla' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-2 space-y-6">
            {/* Card 1: SLA Time Settings */}
            <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                <Clock className="text-indigo-400" size={24} />
                <div>
                  <h3 className="font-bold text-lg text-slate-200">Hạn Mức Thời Gian SLA</h3>
                  <p className="text-xs text-slate-400">Cấu hình thời gian chuẩn cho quy trình xử lý đơn hàng/dịch vụ.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">Thời gian SLA Chuẩn (phút)</label>
                  <span className="text-indigo-400 font-mono font-bold text-lg bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">{slaTime} phút</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  value={slaTime} 
                  onChange={e => setSlaTime(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-amber-400">
                      <span>Cảnh Báo Sớm (Warning)</span>
                      <span>{warningPct}% ({Math.round(slaTime * warningPct / 100)}p)</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="95" 
                      value={warningPct} 
                      onChange={e => setWarningPct(Number(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-red-400">
                      <span>Nguy Cấp (Critical)</span>
                      <span>{criticalPct}% ({Math.round(slaTime * criticalPct / 100)}p)</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="150" 
                      value={criticalPct} 
                      onChange={e => setCriticalPct(Number(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Zalo OA Notification Integration */}
            <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                <Network className="text-blue-400" size={24} />
                <div>
                  <h3 className="font-bold text-lg text-slate-200">Kênh Cảnh Báo Zalo OA Group</h3>
                  <p className="text-xs text-slate-400">Liên kết tự động đẩy tin báo động nhóm khi phát hiện nguy cơ trễ SLA.</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#0f172a]/50 p-4 rounded-xl border border-slate-700/50">
                <div>
                  <p className="font-bold text-slate-200 text-sm">Gửi tin cảnh báo cho Quản Trị Viên</p>
                  <p className="text-xs text-slate-500 mt-1">Sử dụng Zalo ZNS Template để push báo động SLA breaches.</p>
                </div>
                <button 
                  onClick={() => setZaloAlertGroup(!zaloAlertGroup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${zaloAlertGroup ? 'bg-indigo-600' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${zaloAlertGroup ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Card 3: Smart Contract Automatic Compensation */}
            <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-full min-h-[300px]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                  <Zap className="text-orange-400" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-slate-200">Bồi Thường Ví Web3</h3>
                    <p className="text-xs text-slate-400">Hạn mức bồi thường Token tự động phát hành.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-300 block">Số lượng Token bồi hoàn (NFTk)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={autoCompensationAmount}
                      onChange={e => setAutoCompensationAmount(Number(e.target.value))}
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-orange-400 focus:outline-none focus:border-orange-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">NFTk</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Khi Triage Agent phân loại trạng thái trễ và bồi hoàn, Smart Contract trên U2U Network sẽ giải ngân tự động lượng Token này vào Ví đã liên kết của khách hàng.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveSla}
                disabled={isSavingSla}
                className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                {isSavingSla ? (
                  <>
                    <Clock size={16} className="animate-spin" /> Đang lưu cấu hình...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Lưu Cấu Hình SLA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Web3 Performance & Gas Auditor */}
      {activeTab === 'web3' && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Widget Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1e293b]/70 border border-slate-700 p-4 rounded-xl shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Gas Price</span>
              <span className="text-2xl font-black text-emerald-400 mt-2 block font-mono">21.4 Gwei</span>
            </div>
            <div className="bg-[#1e293b]/70 border border-slate-700 p-4 rounded-xl shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tx Success Rate</span>
              <span className="text-2xl font-black text-indigo-400 mt-2 block font-mono">99.98%</span>
            </div>
            <div className="bg-[#1e293b]/70 border border-slate-700 p-4 rounded-xl shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Block Propagation</span>
              <span className="text-2xl font-black text-amber-400 mt-2 block font-mono">1.2s</span>
            </div>
            <div className="bg-[#1e293b]/70 border border-slate-700 p-4 rounded-xl shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contract Status</span>
              <span className="text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg mt-3 inline-block">ACTIVE (0xU2U_Loyalty)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Gas Consumption Trend */}
            <div className="bg-[#1e293b] border border-slate-700 p-5 rounded-2xl shadow-xl space-y-4">
              <div>
                <h4 className="font-bold text-slate-200">U2U Network Gas Price (Gwei)</h4>
                <p className="text-xs text-slate-500">Mức biến động giá Gas thực hiện Smart Contract 7 ngày gần nhất.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gasData}>
                    <defs>
                      <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="gasPrice" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#gasGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Latency Trend */}
            <div className="bg-[#1e293b] border border-slate-700 p-5 rounded-2xl shadow-xl space-y-4">
              <div>
                <h4 className="font-bold text-slate-200">Transaction Execution Latency (seconds)</h4>
                <p className="text-xs text-slate-500">Độ trễ trung bình của khối bồi hoàn/mint token.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gasData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="latency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* SLA Staking Pool Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Staking Pool Stats & Controls */}
            <div className="lg:col-span-2 bg-[#1e293b] border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                <Network className="text-indigo-400" size={24} />
                <div>
                  <h4 className="font-bold text-slate-200">SLA Staking Pledge Pool</h4>
                  <p className="text-xs text-slate-400">Ký quỹ bảo chứng chất lượng dịch vụ SLA và nhận APY tối ưu.</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">LOCKED CAPITAL</span>
                  <span className="text-xl font-black text-white font-mono mt-1 block">{stakingBalance.toLocaleString()} NFTk</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">NET YIELD (APY)</span>
                  <span className="text-xl font-black text-indigo-400 font-mono mt-1 block">{netApy.toFixed(2)}% APY</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">EST. ANNUAL YIELD</span>
                  <span className="text-xl font-black text-amber-400 font-mono mt-1 block">{estYield.toLocaleString()} NFTk</span>
                </div>
              </div>

              {/* Slider Tỷ lệ vi phạm */}
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mô phỏng tỷ lệ vi phạm SLA thực tế</span>
                  <span className="text-xs font-black text-rose-400 font-mono">{violationRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="8" 
                  step="0.1" 
                  value={violationRate} 
                  onChange={e => setViolationRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500 leading-normal italic">
                  *APY cơ sở là 10.00%. Tỷ lệ APY thực nhận sẽ giảm trừ 1.5% cho mỗi 1.0% vi phạm SLA của doanh nghiệp.
                </p>
              </div>

              {/* Stake & Withdraw Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stake thêm Token</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={stakeAmount}
                      onChange={e => setStakeAmount(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white rounded-lg focus:outline-none w-full"
                    />
                    <button
                      onClick={handleStake}
                      disabled={isStakingAction}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-4 rounded-lg flex items-center gap-1.5"
                    >
                      {isStakingAction ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Lock
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rút bớt Token</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white rounded-lg focus:outline-none w-full"
                    />
                    <button
                      onClick={handleWithdraw}
                      disabled={isStakingAction}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs px-4 rounded-lg flex items-center gap-1.5"
                    >
                      {isStakingAction ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Unlock
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Penalty Yield Profile & Ledger */}
            <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-200 mb-2">APY Drop Profile Curve</h4>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={penaltyCurve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={9} stroke="#64748b" />
                      <YAxis fontSize={9} stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: 10 }} />
                      <Area type="monotone" dataKey="APY" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Staking Ledger */}
              <div className="flex-1 overflow-y-auto bg-slate-900/50 border border-slate-800 rounded-xl p-3 h-24 font-mono text-[10px] text-slate-400 space-y-1.5 hide-scrollbar mt-4">
                {stakingLogs.map((log, i) => (
                  <div key={i} className={log.includes('➕') ? 'text-emerald-400' : log.includes('➖') ? 'text-rose-400' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert toast notification */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-emerald-500/30 text-emerald-400 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn">
          <Zap className="text-emerald-400 animate-bounce" size={20} />
          <div>
            <p className="font-bold text-sm">Cấu hình SLA đã lưu!</p>
            <p className="text-xs text-slate-400">Các tham số bồi hoàn & cảnh báo đã được áp dụng toàn hệ thống.</p>
          </div>
        </div>
      )}
    </div>
  );
}
