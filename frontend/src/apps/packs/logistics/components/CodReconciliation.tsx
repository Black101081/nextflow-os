import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { CheckCircle2, RefreshCw, AlertCircle, Calendar, ShieldCheck, DollarSign } from "lucide-react";

interface Reconciliation {
  id: string;
  driver_id: string;
  recon_date: string;
  total_orders: number;
  success_orders: number;
  expected_cash: number;
  actual_cash: number;
  discrepancy: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function CodReconciliation() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [driverId, setDriverId] = useState("");
  const [reconDate, setReconDate] = useState("");
  const [totalOrders, setTotalOrders] = useState("");
  const [successOrders, setSuccessOrders] = useState("");
  const [expectedCash, setExpectedCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const fetchReconciliations = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/log/cod-reconciliations");
      setReconciliations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!driverId || !reconDate || !totalOrders || !expectedCash || !actualCash) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      await apiService.post("/api/v1/log/cod-reconciliations", {
        driver_id: driverId,
        recon_date: reconDate,
        total_orders: parseInt(totalOrders) || 0,
        success_orders: parseInt(successOrders) || 0,
        expected_cash: parseFloat(expectedCash) || 0,
        actual_cash: parseFloat(actualCash) || 0,
        notes: notes
      });

      // Reset form
      setDriverId("");
      setReconDate("");
      setTotalOrders("");
      setSuccessOrders("");
      setExpectedCash("");
      setActualCash("");
      setNotes("");
      setShowAddForm(false);
      fetchReconciliations();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo đối soát.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiService.put(`/api/v1/log/cod-reconciliations/${id}/status`, {
        status: "Approved"
      });
      fetchReconciliations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          Đối soát COD Tài xế
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchReconciliations} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
            <ShieldCheck size={14} />
            Tạo đợt đối soát
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Tạo Đợt Đối Soát Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã tài xế (UUID) *</label>
              <input type="text" value={driverId} onChange={e => setDriverId(e.target.value)} placeholder="Nhập UUID tài xế" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
              <button type="button" onClick={() => setDriverId("8f3b2a1a-4c54-4b01-90e6-d701748f0851")} className="text-[10px] text-slate-500 text-left hover:text-slate-300">Sử dụng tài xế test mặc định</button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày đối soát *</label>
              <input type="date" value={reconDate} onChange={e => setReconDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tổng số đơn hàng *</label>
              <input type="number" value={totalOrders} onChange={e => setTotalOrders(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số đơn thành công</label>
              <input type="number" value={successOrders} onChange={e => setSuccessOrders(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tiền COD kỳ vọng (VND) *</label>
              <input type="number" value={expectedCash} onChange={e => setExpectedCash(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tiền COD thực nhận (VND) *</label>
              <input type="number" value={actualCash} onChange={e => setActualCash(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Ghi chú đối soát</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú đợt đối soát này..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Lưu Đối Soát</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-emerald-500" />
        </div>
      ) : reconciliations.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <ShieldCheck size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có đợt đối soát nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tài Xế (Driver)</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Ngày Đối Soát</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Đơn hàng (Thành công/Tổng)</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">COD Kỳ Vọng</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Thực Nhận</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Lệch (Discrepancy)</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map(recon => (
                <tr key={recon.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-300 font-mono truncate max-w-[120px]" title={recon.driver_id}>{recon.driver_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-200">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-500" />
                      {new Date(recon.recon_date).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">{recon.success_orders} / {recon.total_orders}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-200">{recon.expected_cash.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-200">{recon.actual_cash.toLocaleString()}đ</td>
                  <td className={`px-4 py-3 text-xs font-bold ${
                    recon.discrepancy < 0 ? "text-red-400" :
                    recon.discrepancy > 0 ? "text-emerald-400" : "text-slate-400"
                  }`}>
                    {recon.discrepancy > 0 ? "+" : ""}{recon.discrepancy.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      recon.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {recon.status === "Pending" ? "Chờ duyệt" : "Đã duyệt"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {recon.status === "Pending" && (
                      <button onClick={() => handleApprove(recon.id)} className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold transition-all text-[10px]">
                        Phê duyệt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
