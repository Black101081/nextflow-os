import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, QrCode, Search, Filter } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';

export default function BillingDashboard() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [auth.tenantId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInvoices(auth);
      setInvoices(data.invoices || []);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          Quản Lý Dòng Tiền & VietQR
        </h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1d29] border border-[#242936] rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:border-emerald-500/50 transition-all cursor-pointer">
            <Filter className="w-4 h-4" /> Lọc hóa đơn
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer">
            <QrCode className="w-4 h-4" /> Tạo Hóa Đơn Mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#12141c] border border-[#242936] rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/10"></div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Tổng Doanh Thu Đã Thu</div>
          <div className="text-3xl font-bold text-white mb-1">{formatVND(totalRevenue)}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="font-bold">Doanh thu đã nhận</span>
          </div>
        </div>
        
        <div className="bg-[#12141c] border border-[#242936] rounded-xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/10"></div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Công Nợ & Chờ Thanh Toán</div>
          <div className="text-3xl font-bold text-white mb-1">{formatVND(pendingRevenue)}</div>
          <div className="text-xs text-rose-400 flex items-center gap-1">
            Cần thu hồi sớm
          </div>
        </div>

        <div className="bg-[#12141c] border border-[#242936] rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/10"></div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Tỉ Lệ Chuyển Đổi VietQR</div>
          <div className="text-3xl font-bold text-white mb-1">N/A</div>
          <div className="text-xs text-amber-400 flex items-center gap-1">
            Đang cập nhật...
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-[#12141c] border border-[#242936] rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#242936] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1a1d29]/30">
          <h2 className="text-lg font-semibold text-slate-200">Giao dịch Gần đây</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Tìm mã hóa đơn, tên khách..." 
              className="w-full bg-[#0b0c10] border border-[#242936] text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1d29]/50 border-b border-[#242936]">
                <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã Hóa Đơn</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nội dung VietQR</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Số Tiền</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng Thái</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242936]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Chưa có dữ liệu thanh toán.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1a1d29]/40 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="text-sm font-medium text-slate-200 font-mono">{inv.id.substring(0, 8).toUpperCase()}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(inv.created_at).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm text-slate-300 font-mono bg-[#0b0c10] px-2 py-1 rounded inline-block border border-[#242936]">
                        {inv.transfer_content || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm font-bold text-white">{formatVND(inv.amount)}</div>
                    </td>
                    <td className="py-4 px-5">
                      {inv.status === 'PAID' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã Thanh Toán
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" /> Chờ Khách Quét
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {inv.status !== 'PAID' && inv.payment_link_url ? (
                        <button 
                          onClick={() => window.open(inv.payment_link_url, '_blank')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20 cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" /> Hiển thị Mã QR
                        </button>
                      ) : inv.status === 'PAID' ? (
                        <span className="text-xs text-slate-500">Đã lưu Blockchain</span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
