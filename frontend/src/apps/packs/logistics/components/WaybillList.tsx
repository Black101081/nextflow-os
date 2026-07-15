import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Truck, Plus, CheckCircle, RefreshCw, AlertCircle, Calendar, Route, MapPin, Clock } from "lucide-react";

interface Waybill {
  id: string;
  tracking_code: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  cod_amount: number;
  weight: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function WaybillList() {
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);

  // Form states
  const [trackingCode, setTrackingCode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [codAmount, setCodAmount] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const fetchWaybills = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/log/waybills");
      setWaybills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaybills();
  }, []);

  const handleOptimizeRoute = async () => {
    if (waybills.length === 0) return;
    setOptimizing(true);
    try {
      const stops = waybills.map((wb) => ({
        id: wb.id,
        address: wb.receiver_address || "Quận 1",
        recipient_name: wb.receiver_name
      }));
      const res = await apiService.post("/api/v1/ai/logistics/route-optimize", { stops });
      setOptimizedResult(res.data);
    } catch (err) {
      console.error("Lỗi tối ưu lộ trình:", err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!trackingCode || !receiverName || !receiverPhone || !receiverAddress) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      await apiService.post("/api/v1/log/waybills", {
        tracking_code: trackingCode,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_address: receiverAddress,
        cod_amount: parseFloat(codAmount) || 0,
        weight: parseFloat(weight) || 0,
        notes: notes
      });

      // Reset form
      setTrackingCode("");
      setReceiverName("");
      setReceiverPhone("");
      setReceiverAddress("");
      setCodAmount("");
      setWeight("");
      setNotes("");
      setShowAddForm(false);
      fetchWaybills();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo vận đơn.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Truck size={18} className="text-red-400" />
          Danh sách Vận đơn
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchWaybills} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
            <Plus size={14} />
            Tạo vận đơn
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Tạo Vận Đơn Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã vận đơn *</label>
              <input type="text" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="VD: VN123456" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên người nhận *</label>
              <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="VD: Nguyễn Văn A" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số điện thoại *</label>
              <input type="text" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} placeholder="VD: 0987654321" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Địa chỉ nhận hàng *</label>
              <input type="text" value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số tiền COD (VND)</label>
              <input type="number" value={codAmount} onChange={e => setCodAmount(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Khối lượng (kg)</label>
              <input type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Ghi chú</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú giao hàng..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all">Lưu Vận Đơn</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-red-500" />
        </div>
      ) : waybills.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <Truck size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có vận đơn nào được tạo</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Mã Vận Đơn</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Người Nhận</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Địa Chỉ</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tiền COD</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Khối Lượng</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody>
              {waybills.map(wb => (
                <tr key={wb.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-red-400">{wb.tracking_code}</td>
                  <td className="px-4 py-3 text-xs text-slate-200">
                    <p className="font-semibold">{wb.receiver_name}</p>
                    <p className="text-[10px] text-slate-500">{wb.receiver_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate" title={wb.receiver_address}>{wb.receiver_address}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-200">{wb.cod_amount.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{wb.weight} kg</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      wb.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" :
                      wb.status === "Shipping" ? "bg-blue-500/20 text-blue-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {wb.status === "Received" ? "Mới nhận" : wb.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(wb.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {waybills.length > 0 && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                <Route size={16} className="text-red-400" />
                Tối ưu hóa Lộ trình Giao hàng (AI Agent)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">Sử dụng AI giải thuật TSP để tối ưu hóa quãng đường di chuyển đi qua {waybills.length} địa chỉ đơn hàng.</p>
            </div>
            <button 
              onClick={handleOptimizeRoute} 
              disabled={optimizing}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={optimizing ? "animate-spin" : ""} />
              {optimizing ? "Đang tính toán..." : "Tối ưu lộ trình"}
            </button>
          </div>

          {optimizedResult && (
            <div className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#1e293b]/40 border border-[#334155]/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Tổng quãng đường</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{optimizedResult.total_distance_km} km</p>
                  </div>
                </div>
                <div className="bg-[#1e293b]/40 border border-[#334155]/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Thời gian ước tính</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{optimizedResult.estimated_duration_mins} phút</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thứ tự giao hàng gợi ý:</h5>
                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#1e293b]/30 p-2.5 rounded-lg border border-[#334155]/20">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-[10px]">0</span>
                    <span className="font-semibold text-slate-300">Kho hàng Quận 1 (Depot)</span>
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">({optimizedResult.depot_coords.lat.toFixed(4)}, {optimizedResult.depot_coords.lon.toFixed(4)})</span>
                  </div>
                  {optimizedResult.optimized_stops.map((stop: any) => (
                    <div key={stop.id} className="flex items-center gap-2 text-xs text-slate-200 bg-[#1e293b]/30 p-2.5 rounded-lg border border-[#334155]/20">
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">{stop.route_sequence}</span>
                      <span className="font-semibold text-red-400">{stop.recipient_name}:</span>
                      <span className="truncate max-w-[200px]">{stop.address}</span>
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">({stop.coords.lat.toFixed(4)}, {stop.coords.lon.toFixed(4)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
