import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../../shared/services/api";
import { Wrench, CheckSquare, RefreshCw, AlertCircle, FileText, CheckCircle2, ChevronRight, DollarSign } from "lucide-react";

interface RepairOrder {
  id: string;
  vehicle_id: string;
  check_in_time: string;
  symptoms: string;
  diagnosis_items: Array<{
    name: string;
    status: string;
    cost_estimate: number;
  }>;
  total_estimate: string | number;
  customer_approved: boolean;
  technician_id: string | null;
  status: string;
  completed_at: string | null;
}

export default function RepairQuoteCard({ vehicleId, diagnosisItems }: { vehicleId: string | null; diagnosisItems: any[] }) {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Order State
  const [symptoms, setSymptoms] = useState("Vô lăng bị rung lắc nhẹ khi đi tốc độ cao");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get(`/api/v1/garage/repair-orders`);
      const list: RepairOrder[] = Array.isArray(res.data?.orders) ? res.data.orders : Array.isArray(res.data) ? res.data : [];
      setOrders(list.filter(o => o.vehicle_id === vehicleId));
    } catch (err: any) {
      setError(err.message || "Lỗi tải phiếu sửa chữa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [vehicleId]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    setSubmitting(true);
    try {
      const activeDiagnosis = diagnosisItems.map(item => ({
        name: item.name,
        status: item.status,
        cost_estimate: item.status !== "Good" ? item.cost_estimate : 0
      }));

      await apiService.post("/api/v1/garage/repair-orders", {
        vehicle_id: vehicleId,
        symptoms,
        diagnosis_items: activeDiagnosis
      });
      fetchOrders();
      setSymptoms("");
    } catch (err: any) {
      alert(err.message || "Lỗi tạo phiếu chẩn đoán");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiService.post(`/api/v1/garage/repair-orders/${id}/approve`);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Lỗi duyệt báo giá");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiService.post(`/api/v1/garage/repair-orders/${id}/complete`);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Lỗi hoàn tất sửa chữa");
    }
  };

  const getStepStyle = (orderStatus: string, step: string) => {
    const sequence = ["received", "diagnosed", "approved", "completed"];
    const currentIdx = sequence.indexOf(orderStatus.toLowerCase());
    const stepIdx = sequence.indexOf(step.toLowerCase());
    if (stepIdx < currentIdx) return "text-teal-400 font-semibold";
    if (stepIdx === currentIdx) return "text-teal-400 font-extrabold scale-[1.03]";
    return "text-slate-500";
  };

  if (!vehicleId) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl h-full flex flex-col items-center justify-center text-slate-500 text-center">
        <Wrench size={36} className="mb-2 opacity-30 animate-bounce" />
        <p className="text-sm font-semibold">Tra cứu biển số xe trước</p>
        <p className="text-xs mt-1 text-slate-600 font-medium">Bảng báo giá & Lệnh sửa chữa sẽ tự động mở sau khi nhận dạng phương tiện</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 border-b border-[#334155] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Báo Giá & Hợp Đồng Sửa Chữa</h3>
            <p className="text-xs text-slate-500">Chi tiết tình trạng, báo giá phụ tùng & phê duyệt</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
        {/* Create new Repair Order */}
        <form onSubmit={handleCreateOrder} className="bg-[#0f172a]/40 border border-[#334155] rounded-xl p-3.5 mb-5 space-y-3">
          <h4 className="text-[10px] text-teal-400 font-bold uppercase">Lập Lệnh Chẩn Đoán Mới</h4>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Triệu chứng/Yêu cầu từ Khách hàng</label>
            <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/10">
            {submitting ? "Đang tạo..." : "Lập Phiếu Tiếp Nhận"}
          </button>
        </form>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-8">
            Đang tải danh sách lệnh sửa chữa...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-[#334155] rounded-xl text-slate-500">
            <Wrench size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Chưa có lệnh sửa chữa cho xe này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const estNum = typeof order.total_estimate === "string" ? parseFloat(order.total_estimate) : order.total_estimate;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#0f172a]/60 border border-[#334155] rounded-xl space-y-3 hover:border-[#475569] transition-all">
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Mã lệnh:</span>
                      <span className="text-xs font-mono font-bold text-slate-300">{order.id.substring(0, 8)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Ước tính phí:</span>
                      <span className="text-sm font-bold text-teal-400">{(estNum || 0).toLocaleString("vi-VN")} VNĐ</span>
                    </div>
                  </div>

                  {/* Diagnosed Items list */}
                  <div className="space-y-1 bg-[#0f172a] rounded-lg p-2.5 border border-[#334155]/60 text-[11px] text-slate-400">
                    <span className="text-[9px] text-slate-500 block font-bold mb-1">CHI TIẾT CHẨN ĐOÁN:</span>
                    {(() => {
                      const rawItems = typeof order.diagnosis_items === "string" ? JSON.parse(order.diagnosis_items) : Array.isArray(order.diagnosis_items) ? order.diagnosis_items : [];
                      const activeList = rawItems.filter((d: any) => d.status !== "Good");
                      if (activeList.length === 0) {
                        return <p className="text-slate-500 italic">Không phát hiện hỏng hóc lớn</p>;
                      }
                      return activeList.map((d: any, i: number) => {
                        const name = d.name || d.item || "Lỗi chưa xác định";
                        const status = d.status || "Repair";
                        const costVal = d.cost_estimate ?? d.cost ?? 0;
                        return (
                          <div key={i} className="flex justify-between">
                            <span>• {name} ({status})</span>
                            <span className="text-slate-300">{(costVal || 0).toLocaleString("vi-VN")} VNĐ</span>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Flow Steps */}
                  <div className="flex items-center justify-between text-[9px] border-y border-[#334155]/40 py-2">
                    <span className={getStepStyle(order.status, "received")}>1. Tiếp nhận</span>
                    <ChevronRight size={10} className="text-slate-700" />
                    <span className={getStepStyle(order.status, "diagnosed")}>2. Chẩn đoán</span>
                    <ChevronRight size={10} className="text-slate-700" />
                    <span className={getStepStyle(order.status, "approved")}>3. Duyệt giá</span>
                    <ChevronRight size={10} className="text-slate-700" />
                    <span className={getStepStyle(order.status, "completed")}>4. Hoàn tất</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-500">Trạng thái: <strong className="text-teal-400 font-bold uppercase">{order.status}</strong></span>
                    <div className="flex gap-1">
                      {order.status.toLowerCase() === "diagnosed" && (
                        <button onClick={() => handleApprove(order.id)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1">
                          <CheckCircle2 size={12} /> Duyệt Báo Giá
                        </button>
                      )}
                      {order.status.toLowerCase() === "approved" && (
                        <button onClick={() => handleComplete(order.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1">
                          <CheckSquare size={12} /> Hoàn Thành
                        </button>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
