import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, QrCode, Search, Filter, ShieldCheck, AlertTriangle, Zap, TrendingUp, Send, X, Bot } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Mock cashflow data for the chart
const cashflowData = [
  { day: 'T2', income: 15000000, outcome: 5000000, predicted: 16000000 },
  { day: 'T3', income: 18000000, outcome: 6000000, predicted: 17000000 },
  { day: 'T4', income: 12000000, outcome: 8000000, predicted: 14000000 },
  { day: 'T5', income: 25000000, outcome: 4000000, predicted: 22000000 },
  { day: 'T6', income: 22000000, outcome: 9000000, predicted: 24000000 },
  { day: 'T7', income: 30000000, outcome: 12000000, predicted: 28000000 },
  { day: 'CN', income: 35000000, outcome: 15000000, predicted: 32000000 },
];

export default function BillingDashboard() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ZNS Modal State
  const [isZnsModalOpen, setIsZnsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSimulatingZns, setIsSimulatingZns] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [auth.tenantId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInvoices(auth);
      // Enhance invoices with AI Mock fields
      const enhanced = await Promise.all((data.invoices || []).map(async (inv: any) => {
        // Deterministic prediction based on amount
        const payProb = inv.status === 'PAID' ? 100 : Math.min(95, 40 + (inv.amount % 55));
        let txHash = null;
        if (inv.status === 'PAID') {
          try {
            const anchor = await apiService.anchorData(auth, { data: `INVOICE_PAID_${inv.id}`, context: 'BILLING' });
            txHash = anchor.tx_hash;
          } catch (e) {
            console.error(e);
          }
        }
        return {
          ...inv,
          paymentProbability: payProb,
          aiFlag: inv.amount > 5000000 && inv.status === 'UNPAID' ? 'Anomalous High Value' : null,
          txHash
        };
      }));
      setInvoices(enhanced);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const triggerZnsRemind = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsZnsModalOpen(true);
  };

  const executeZnsRemind = () => {
    setIsSimulatingZns(true);
    setTimeout(() => {
      setIsSimulatingZns(false);
      setIsZnsModalOpen(false);
      alert('Đã gửi cấu hình luồng nhắc nợ ZNS tự động thành công!');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
        Lỗi tải dữ liệu: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          Quản Lý Dòng Tiền & VietQR
        </h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer">
            <Filter className="w-4 h-4" /> Lọc hóa đơn
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer">
            <QrCode className="w-4 h-4" /> Tạo Hóa Đơn Mới
          </button>
        </div>
      </div>

      {/* AI Insight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 to-[#0a0c10] border border-indigo-500/30 rounded-xl p-4 flex items-start gap-4 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.05)]"
      >
        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-1">
            <Zap size={14} className="text-amber-400" /> AI Cashflow Predictor
          </h3>
          <p className="text-slate-300 text-sm">
            Hệ thống AI phân tích chu kỳ thanh toán cho thấy bạn có khả năng thu hồi <strong>85% công nợ</strong> (khoảng {formatVND(pendingRevenue * 0.85)}) trong 7 ngày tới. Có 1 hoá đơn giá trị cao có nguy cơ chậm thanh toán. Đề xuất: <strong>Bật tự động nhắc nợ ZNS.</strong>
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#12141c]/80 backdrop-blur-xl border border-[#242936] hover:border-emerald-500/50 rounded-2xl p-6 relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Doanh Thu Thực Thu</div>
          <div className="text-4xl font-black text-white mb-2 tracking-tight">{formatVND(totalRevenue)}</div>
          <div className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md inline-flex items-center gap-1">
            <TrendingUp size={12} /> +24% so với tháng trước
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#12141c]/80 backdrop-blur-xl border border-[#242936] hover:border-rose-500/50 rounded-2xl p-6 relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Công Nợ Tồn Đọng</div>
          <div className="text-4xl font-black text-white mb-2 tracking-tight">{formatVND(pendingRevenue)}</div>
          <div className="text-xs font-semibold px-2 py-1 bg-rose-500/10 text-rose-400 rounded-md inline-flex items-center gap-1">
            <AlertTriangle size={12} /> Rủi ro cao: {invoices.filter(i => i.aiFlag).length} Hóa đơn
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#12141c]/80 backdrop-blur-xl border border-[#242936] hover:border-indigo-500/50 rounded-2xl p-6 relative overflow-hidden group transition-all flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all"></div>
          <div>
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Blockchain Sync</div>
            <div className="text-2xl font-bold text-white mb-1">U2U Network</div>
            <div className="text-xs text-indigo-400 font-mono mt-1 break-all">
              Contract: 0x9f3C...8b2A
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-[#242936] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-full"></div>
            </div>
            <div className="text-xs text-slate-500 mt-2 text-right">100% Đồng bộ</div>
          </div>
        </motion.div>
      </div>

      {/* Cashflow Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#12141c]/60 backdrop-blur-md border border-[#242936] rounded-2xl p-6 h-[400px] flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Phân Tích Dòng Tiền & Dự Báo (Cashflow)</h2>
            <p className="text-sm text-slate-400">Xu hướng thu chi 7 ngày qua và dự báo AI cho tuần tới</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Thu vào
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div> Chi ra
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div> AI Dự báo
            </div>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutcome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242936" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val / 1000000}Tr`}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(val: any) => formatVND(val as number)}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="outcome" stroke="#f43f5e" strokeWidth={3} fill="url(#colorOutcome)" />
              <Area type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorPredicted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Invoices List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#12141c]/60 backdrop-blur-md border border-[#242936] rounded-2xl overflow-hidden flex flex-col shadow-xl"
      >
        <div className="p-5 border-b border-[#242936] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1a1d29]/50">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            Hồ Sơ Thanh Toán
            <span className="text-xs font-normal text-slate-400 bg-[#242936] px-2 py-1 rounded-full">{invoices.length} Hoá đơn</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Tìm mã hóa đơn, tên khách..." 
              className="w-full bg-[#0a0c10] border border-[#334155] text-sm text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f1219] border-b border-[#242936]">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Hóa Đơn & Ngày</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Nội dung VietQR</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Giá Trị</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng Thái & AI Score</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Blockchain / Automation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242936]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <QrCode className="w-8 h-8 opacity-20" />
                      Chưa có dữ liệu thanh toán.
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={inv.id} 
                    className="hover:bg-[#1a1d29]/60 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-200 font-mono tracking-wider">{inv.id.substring(0, 8).toUpperCase()}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(inv.created_at).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-300 font-mono bg-[#0a0c10] px-3 py-1.5 rounded-lg border border-[#242936] shadow-inner">
                        {inv.transfer_content || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[15px] font-black text-white">{formatVND(inv.amount)}</div>
                      {inv.aiFlag && (
                        <div className="text-[10px] text-amber-500 mt-1 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" /> {inv.aiFlag}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        {inv.status === 'PAID' ? (
                          <div className="inline-flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                            <CheckCircle className="w-4 h-4" /> Đã Thanh Toán
                          </div>
                        ) : (
                          <div className="inline-flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                            <Clock className="w-4 h-4" /> Chờ Thanh Toán
                          </div>
                        )}
                        {/* AI Payment Probability */}
                        {inv.status !== 'PAID' && (
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] text-slate-400 font-semibold w-16">Tỉ lệ trả: {inv.paymentProbability}%</div>
                            <div className="flex-1 h-1.5 bg-[#242936] rounded-full overflow-hidden w-24">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500" 
                                style={{ width: `${inv.paymentProbability}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {inv.status !== 'PAID' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => window.open(inv.payment_link_url, '_blank')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" /> QR
                          </button>
                          <button 
                            onClick={() => triggerZnsRemind(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)] cursor-pointer"
                          >
                            <Send className="w-4 h-4" /> Zalo ZNS Remind
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Blockchain Verified
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Tx: {inv.txHash ? `${inv.txHash.substring(0, 10)}...${inv.txHash.substring(inv.txHash.length - 6)}` : 'N/A'}
                          </span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ZNS Automation Workflow Modal */}
      <AnimatePresence>
        {isZnsModalOpen && selectedInvoice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#12141c] border border-indigo-500/30 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="text-indigo-400" /> Cấu hình Zalo ZNS Nhắc nợ
                </h3>
                <button onClick={() => setIsZnsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-1">Mã hóa đơn</div>
                  <div className="font-mono text-white font-bold">{selectedInvoice.id.substring(0, 8).toUpperCase()}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-2">Mẫu tin nhắn ZNS (Template)</div>
                  <div className="bg-[#0a0c10] p-3 rounded-lg border border-slate-800 text-sm text-slate-300 font-mono">
                    "Kính gửi Quý khách, hoá đơn {selectedInvoice.id.substring(0, 8).toUpperCase()} trị giá {formatVND(selectedInvoice.amount)} vẫn chưa được thanh toán. Quý khách vui lòng quét mã QR đính kèm để hoàn tất giao dịch. Xin cảm ơn!"
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-indigo-500 bg-black text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                    <div>
                      <div className="font-bold text-indigo-300 text-sm">Tự động gửi lại (Workflow Automation)</div>
                      <div className="text-xs text-indigo-400/70 mt-0.5">Tự động gửi mỗi 24h nếu hoá đơn vẫn ở trạng thái UNPAID. Tối đa 3 lần.</div>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    onClick={() => setIsZnsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={executeZnsRemind}
                    disabled={isSimulatingZns}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSimulatingZns ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang cấu hình...
                      </>
                    ) : (
                      <>
                        <Zap size={16} /> Lưu kịch bản & Gửi ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
