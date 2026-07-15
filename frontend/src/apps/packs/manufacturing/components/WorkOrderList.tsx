import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Clipboard, Plus, RefreshCw, AlertCircle, Calendar, Play } from "lucide-react";

interface WorkOrder {
  id: string;
  order_ref: string;
  product_name: string;
  target_quantity: number;
  produced_quantity: number;
  defect_quantity: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [productName, setProductName] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/mfg/work-orders");
      setWorkOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!productName || !targetQuantity) {
      setError("Vui lòng điền tên sản phẩm và số lượng mục tiêu.");
      return;
    }

    try {
      await apiService.post("/api/v1/mfg/work-orders", {
        product_name: productName,
        target_quantity: parseInt(targetQuantity) || 0,
        order_ref: orderRef || null,
        notes: notes
      });

      setProductName("");
      setTargetQuantity("");
      setOrderRef("");
      setNotes("");
      setShowAddForm(false);
      fetchWorkOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo lệnh sản xuất.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Clipboard size={18} className="text-violet-400" />
          Lệnh Sản Xuất (Work Orders)
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchWorkOrders} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
            <Plus size={14} />
            Lập lệnh sản xuất
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Lập Lệnh Sản Xuất Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã lệnh (Tùy chọn)</label>
              <input type="text" value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="VD: WO-1004" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên sản phẩm *</label>
              <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="VD: Bàn gỗ sồi" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số lượng mục tiêu *</label>
              <input type="number" value={targetQuantity} onChange={e => setTargetQuantity(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ghi chú yêu cầu</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu kỹ thuật..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all">Tạo Lệnh</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-violet-500" />
        </div>
      ) : workOrders.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <Clipboard size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có lệnh sản xuất nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Mã Lệnh</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Sản Phẩm</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Mục Tiêu</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Hoàn Thành (Đạt/Lỗi)</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tiến Độ</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(wo => {
                const progressPct = Math.min(100, Math.round(((wo.produced_quantity + wo.defect_quantity) / wo.target_quantity) * 100));
                return (
                  <tr key={wo.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-violet-400">{wo.order_ref}</td>
                    <td className="px-4 py-3 text-xs text-slate-200 font-semibold">{wo.product_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-300 font-bold">{wo.target_quantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold">{wo.produced_quantity}</span> / <span className="text-red-400 font-bold">{wo.defect_quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-[#334155]">
                          <div className="bg-violet-500 h-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wo.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" :
                        wo.status === "InQC" ? "bg-cyan-500/20 text-cyan-400" :
                        wo.status === "Running" ? "bg-blue-500/20 text-blue-400" : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {wo.status === "Planned" ? "Lên kế hoạch" : wo.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(wo.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
