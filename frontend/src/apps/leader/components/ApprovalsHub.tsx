import { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  CheckCircle, XCircle, Clock, ShieldCheck, AlertCircle, Bot, 
  AlertTriangle, Settings, Zap, User, Calendar, X, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApprovalsHub() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  
  // Automation Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSimulatingRule, setIsSimulatingRule] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWorkItems(auth);
      const list = Array.isArray(data) ? data : Array.isArray(data?.work_items) ? data.work_items : [];
      // Enhanced data mapping for HR/Approvals simulation
      const activeTasks = await Promise.all(list.filter((t: any) => t.status !== 'COMPLETED').map(async (t: any, index: number) => {
        // Deterministic HR & AI Data
        const riskScore = t.priority === 'HIGH' ? 85 : 15 + index * 10;
        const riskLevel = riskScore > 70 ? 'CAO' : riskScore > 40 ? 'TRUNG BÌNH' : 'THẤP';
        
        let burnoutRisk = 0;
        try {
            burnoutRisk = await apiService.analyzeBurnout({ token: localStorage.getItem('token') }, `EMP_${index}_${t.id}`);
        } catch (e) {
            console.error(e);
        }
        const autoSuggest = burnoutRisk > 60 || riskScore < 30 ? 'APPROVE' : riskScore > 70 ? 'REJECT' : 'MANUAL';

        // Deterministic Type
        const type = index % 2 === 0 ? 'LEAVE_REQUEST' : 'EXPENSE_CLAIM';
        const amount = type === 'EXPENSE_CLAIM' ? (index + 1) * 500000 : null;

        return { ...t, riskScore, riskLevel, burnoutRisk, autoSuggest, type, amount, employeeName: `Nhân viên ${index + 1}` };
      }));
      setTasks(activeTasks);
    } catch (err) {
      console.error("Error loading tasks for approval:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAction = async (taskId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const status = action === 'APPROVE' ? 'COMPLETED' : 'UNASSIGNED';
      
      const anchorRes = await apiService.anchorData(auth, { data: `APPROVAL_${taskId}_${action}`, context: "HR_APPROVAL" });
      const txHash = anchorRes.tx_hash;
      
      await apiService.updateWorkItemStatus(auth, taskId, status);
      
      setMessage({
        text: action === 'APPROVE' 
          ? `Đã phê duyệt! Blockchain TxHash: ${txHash.slice(0, 16)}...`
          : 'Đã từ chối yêu cầu thành công.',
        type: 'success'
      });
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setTimeout(() => setMessage({ text: '', type: null }), 6000);
    } catch (err: any) {
      setMessage({
        text: "Thao tác thất bại: " + err.message,
        type: 'error'
      });
    }
  };

  const saveAutomationRule = () => {
    setIsSimulatingRule(true);
    setTimeout(() => {
      setIsSimulatingRule(false);
      setIsRuleModalOpen(false);
      alert('Đã thiết lập Quy tắc Tự động Duyệt thành công!');
    }, 1500);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <CheckCircle className="w-6 h-6 text-indigo-400" />
          </div>
          Employee Performance & HR Approvals
        </h1>
        <button 
          onClick={() => setIsRuleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1d29] hover:bg-[#242936] text-white border border-[#334155] rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer"
        >
          <Settings className="w-4 h-4" /> Cấu hình Tự động Duyệt
        </button>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 backdrop-blur-md ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* AI Burnout Risk & Performance Insight */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-amber-500/10 to-[#0a0c10] border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md shadow-[0_0_40px_rgba(245,158,11,0.05)]"
      >
        <div className="p-3 rounded-full bg-amber-500/20 text-amber-500">
          <Bot size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} /> AI Performance & Burnout Insight
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Hệ thống AI phát hiện <strong>Nhân viên 3</strong> đã làm thêm giờ 4 ngày liên tiếp, <strong>rủi ro kiệt sức (Burnout Risk) đạt 85%</strong>. Sức khoẻ tâm lý của team đang ở mức trung bình. Đề xuất tự động <strong>Duyệt NGAY</strong> đơn xin nghỉ phép của nhân viên này để đảm bảo duy trì năng suất dài hạn.
          </p>
          <div className="flex gap-4">
            <div className="px-3 py-1.5 bg-black/40 border border-amber-500/20 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div> Burnout High: 2
            </div>
            <div className="px-3 py-1.5 bg-black/40 border border-emerald-500/20 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> AI Auto-Suggested: 4
            </div>
          </div>
        </div>
      </motion.div>

      {/* Requests Grid (Glassmorphism Cards) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">Danh sách Yêu cầu chờ duyệt</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-[#12141c]/50 rounded-2xl border border-[#242936]">
            Không có yêu cầu phê duyệt nào đang chờ xử lý.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tasks.map((t: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={t.id} 
                className="bg-[#12141c]/80 backdrop-blur-xl border border-[#242936] hover:border-indigo-500/40 rounded-xl p-5 relative overflow-hidden group transition-all"
              >
                {/* AI Suggestion Highlight */}
                {t.autoSuggest === 'APPROVE' && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider rounded-bl-lg border-b border-l border-emerald-500/30 flex items-center gap-1">
                    <Bot size={10} /> AI ĐỀ XUẤT DUYỆT
                  </div>
                )}
                {t.autoSuggest === 'REJECT' && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black tracking-wider rounded-bl-lg border-b border-l border-rose-500/30 flex items-center gap-1">
                    <Bot size={10} /> AI CẢNH BÁO
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{t.employeeName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.type === 'LEAVE_REQUEST' ? 'Xin Nghỉ Phép' : 'Xin Tạm Ứng Chi Tiêu'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                      <Clock size={12} /> {new Date(t.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="mb-5 bg-[#0a0c10] p-3 rounded-lg border border-[#242936]">
                  <div className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
                    {t.type === 'LEAVE_REQUEST' ? <Calendar size={14} className="text-indigo-400" /> : <DollarSign size={14} className="text-emerald-400" />}
                    {t.title}
                  </div>
                  {t.type === 'EXPENSE_CLAIM' && (
                    <div className="text-lg font-black text-emerald-400 mt-2">{formatVND(t.amount)}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 border-t border-slate-800/50 pt-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Rủi ro Quy định (Fraud/Risk)</div>
                    <div className={`text-sm font-bold flex items-center gap-1 ${t.riskLevel === 'CAO' ? 'text-rose-500' : t.riskLevel === 'TRUNG BÌNH' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {t.riskLevel === 'CAO' ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />} {t.riskScore}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Rủi ro Kiệt sức (Burnout)</div>
                    <div className={`text-sm font-bold flex items-center gap-1 ${t.burnoutRisk > 70 ? 'text-rose-500' : t.burnoutRisk > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      <AlertCircle size={14} /> {t.burnoutRisk}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(t.id, 'APPROVE')}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={16} /> Duyệt (Lưu Blockchain)
                  </button>
                  <button
                    onClick={() => handleAction(t.id, 'REJECT')}
                    className="flex-1 py-2.5 rounded-lg bg-transparent hover:bg-rose-500/10 text-rose-400 font-bold text-sm border border-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={16} /> Từ chối
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Approve Rules Modal */}
      <AnimatePresence>
        {isRuleModalOpen && (
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
                  <Zap className="text-indigo-400" /> Quy tắc Tự động Duyệt (Auto-Approve)
                </h3>
                <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                  <X />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Thiết lập các điều kiện để hệ thống AI tự động thay mặt Sếp phê duyệt yêu cầu, lưu vết trên Blockchain, nhằm giảm tải công việc hàng ngày.
                </p>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-emerald-500 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
                    <div>
                      <div className="font-bold text-emerald-400 text-sm">Duyệt Nghỉ Phép Tự Động</div>
                      <div className="text-xs text-slate-400 mt-0.5">Nếu số ngày nghỉ &lt;= 2 VÀ AI Burnout Risk &gt; 60%.</div>
                    </div>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-emerald-500 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
                    <div>
                      <div className="font-bold text-emerald-400 text-sm">Duyệt Chi Tiêu Dưới Định Mức</div>
                      <div className="text-xs text-slate-400 mt-0.5">Nếu số tiền &lt; 1.000.000đ VÀ AI Fraud Risk &lt; 20%.</div>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button 
                    onClick={() => setIsRuleModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={saveAutomationRule}
                    disabled={isSimulatingRule}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSimulatingRule ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} /> Lưu Quy Tắc
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
