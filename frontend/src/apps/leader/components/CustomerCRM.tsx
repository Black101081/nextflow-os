import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  Users, Bot, ArrowUpRight, ArrowDownRight, Activity, 
  Wallet, ShieldCheck, Zap, X, ChevronRight, RefreshCw
} from 'lucide-react';

interface Customer {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  total_spent: number;
  order_count: number;
  last_order_date: string | null;
  segment: string;
  created_at: string;
  // Mock AI & Blockchain fields for Demo
  ai_health_score?: number;
  web3_wallet_balance?: number;
}

export default function CustomerCRM() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSegmenting, setIsSegmenting] = useState(false);
  
  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showZnsModal, setShowZnsModal] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Customer[] = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error("[CRM] Error loading customers:", e);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchCustomers();
  }, [token]);
 
  const runAiSegmentation = async () => {
    try {
      setIsSegmenting(true);
      const res = await fetch('/api/v1/customers/segment', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchCustomers();
      }
    } catch (e) {
      console.error("[CRM] Error running AI segmentation:", e);
    } finally {
      setIsSegmenting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 50) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'VIP': return <ArrowUpRight size={14} className="text-emerald-400" />;
      case 'CHURNING': return <ArrowDownRight size={14} className="text-rose-400" />;
      case 'REGULAR': return <Activity size={14} className="text-amber-400" />;
      default: return <Users size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            AI-Driven CRM & Web3 Loyalty
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Quản trị vòng đời khách hàng đa điểm chạm (Blockchain Anchored)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowZnsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1d29] border border-[#242936] text-white rounded-lg hover:bg-[#242936] transition-all text-sm font-semibold shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" fill="currentColor" /> Workflow Automation
          </button>
          <button 
            onClick={runAiSegmentation} 
            disabled={isSegmenting || loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg transition-all text-sm font-semibold shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50"
          >
            {isSegmenting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Đang phân tích...</>
            ) : (
              <><Bot className="w-4 h-4" /> Auto Segment (AI)</>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#12141c]/80 backdrop-blur-md border border-[#242936] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
          <div className="text-sm font-medium text-slate-400 mb-1">Tổng Khách Hàng</div>
          <div className="text-3xl font-bold text-white">{customers.length}</div>
        </div>
        <div className="bg-[#12141c]/80 backdrop-blur-md border border-[#242936] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
          <div className="text-sm font-medium text-emerald-400 mb-1">Khách Hàng VIP</div>
          <div className="text-3xl font-bold text-white">{customers.filter(c => c.segment === 'VIP').length}</div>
        </div>
        <div className="bg-[#12141c]/80 backdrop-blur-md border border-[#242936] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/20"></div>
          <div className="text-sm font-medium text-rose-400 mb-1">Nguy cơ Churning</div>
          <div className="text-3xl font-bold text-white">{customers.filter(c => c.segment === 'CHURNING').length}</div>
        </div>
        <div className="bg-[#12141c]/80 backdrop-blur-md border border-[#242936] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20"></div>
          <div className="text-sm font-medium text-purple-400 mb-1">Tổng Web3 Tokens</div>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-400" />
            {customers.reduce((acc, curr) => acc + (curr.web3_wallet_balance || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 bg-[#12141c]/80 backdrop-blur-md border border-[#242936] rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1d29]/80 border-b border-[#242936] text-xs uppercase text-slate-400 font-semibold tracking-wider">
                <th className="p-4 whitespace-nowrap">Khách Hàng</th>
                <th className="p-4 whitespace-nowrap">Web3 Loyalty</th>
                <th className="p-4 whitespace-nowrap">Tổng Chi Tiêu</th>
                <th className="p-4 whitespace-nowrap">Phân Khúc</th>
                <th className="p-4 whitespace-nowrap">AI Health Score</th>
                <th className="p-4 whitespace-nowrap text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242936]/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                    Đang tải dữ liệu khách hàng đa nền tảng...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">Chưa có dữ liệu.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1a1d29]/50 transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                          {c.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{c.full_name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            {c.phone_number || c.email || 'N/A'}
                            <span title="Data consent anchored on U2U"><ShieldCheck className="w-3 h-3 text-emerald-500 ml-1" /></span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                          <Wallet className="w-4 h-4" /> {c.web3_wallet_balance?.toLocaleString()} SME
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">U2U Mainnet ✓</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-200">{formatCurrency(c.total_spent)}</div>
                      <div className="text-xs text-slate-500">{c.order_count} đơn hàng</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {getSegmentIcon(c.segment)}
                        <span className={c.segment === 'VIP' ? 'text-emerald-400' : c.segment === 'CHURNING' ? 'text-rose-400' : 'text-slate-300'}>
                          {c.segment}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#0b0c10] rounded-full overflow-hidden w-24 border border-[#242936]">
                          <div 
                            className={`h-full rounded-full ${c.ai_health_score && c.ai_health_score >= 80 ? 'bg-emerald-500' : c.ai_health_score && c.ai_health_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${c.ai_health_score}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getHealthColor(c.ai_health_score || 0)}`}>
                          {c.ai_health_score}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI 360 Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12141c] border border-[#242936] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#242936] flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
                  {selectedCustomer.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCustomer.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Data Privacy Consent Anchored to U2U Blockchain
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-slate-400 hover:text-white bg-[#1a1d29] rounded-lg hover:bg-[#242936] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Web3 & Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#1a1d29] rounded-xl border border-[#242936]">
                  <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Web3 Loyalty Wallet</div>
                  <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    {selectedCustomer.web3_wallet_balance?.toLocaleString()} SME
                  </div>
                  <div className="text-xs text-emerald-500 mt-2 font-mono">0x7a...9F2B (Verified)</div>
                </div>
                <div className="p-4 bg-[#1a1d29] rounded-xl border border-[#242936]">
                  <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Tổng Giá Trị LTV</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(selectedCustomer.total_spent)}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Dựa trên {selectedCustomer.order_count} đơn hàng</div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-24 h-24 text-indigo-500" />
                </div>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Next Best Action</h4>
                </div>
                <div className="space-y-3 relative z-10">
                  {selectedCustomer.segment === 'VIP' ? (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Khách hàng đang ở trạng thái <strong className="text-emerald-400">cực kỳ trung thành (Health: {selectedCustomer.ai_health_score}%)</strong>. 
                      Hành vi mua sắm tập trung vào cuối tuần. 
                      <br/><br/>
                      💡 <strong className="text-white">Hành động:</strong> Gửi Zalo ZNS mời tham gia Event Tri ân VIP, tặng thêm 500 Web3 Loyalty Token để tăng tương tác.
                    </p>
                  ) : selectedCustomer.segment === 'CHURNING' ? (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Cảnh báo: Khách hàng có <strong className="text-rose-400">dấu hiệu rời bỏ (Health: {selectedCustomer.ai_health_score}%)</strong>.
                      Đã 45 ngày chưa quay lại mua hàng.
                      <br/><br/>
                      💡 <strong className="text-white">Hành động:</strong> Kích hoạt Workflow tự động gửi SMS tặng Voucher 20% "We Miss You". Tạo Task cho Telesale gọi điện.
                    </p>
                  ) : (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Khách hàng vãng lai, sức mua ổn định <strong className="text-amber-400">(Health: {selectedCustomer.ai_health_score}%)</strong>.
                      <br/><br/>
                      💡 <strong className="text-white">Hành động:</strong> Gửi chiến dịch ZNS giới thiệu bộ sưu tập mới vào ngày mai (khung giờ 10:00 AM).
                    </p>
                  )}
                </div>
                <div className="mt-5 relative z-10">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-semibold">
                    <Zap className="w-4 h-4" fill="currentColor" /> Kích hoạt Kịch bản AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow ZNS Modal */}
      {showZnsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12141c] border border-[#242936] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 border-b border-[#242936] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" fill="currentColor" /> Workflow Automation
              </h3>
              <button onClick={() => setShowZnsModal(false)} className="p-1.5 text-slate-400 hover:text-white bg-[#1a1d29] rounded-lg hover:bg-[#242936] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-[#1a1d29] border border-amber-500/20 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Save Churning Customers</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Nếu KH thuộc nhóm CHURNING → Gửi ZNS Voucher 20% → Tạo Task Telesale</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#1a1d29] border border-[#242936] rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">VIP Reward Minting</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Nếu KH thăng hạng VIP → Mint 500 SME Token trên Blockchain → Bắn ZNS chúc mừng</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowZnsModal(false)} className="px-4 py-2 bg-[#1a1d29] text-white rounded-lg hover:bg-[#242936] text-sm font-semibold">Đóng</button>
                <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-semibold">Tới Trình Kéo Thả (Builder)</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
