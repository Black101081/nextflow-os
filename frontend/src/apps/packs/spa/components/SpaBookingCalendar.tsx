import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../../shared/services/api";
import { Calendar as CalendarIcon, Clock, User, Plus, RefreshCw, AlertCircle, CheckCircle2, UserCheck } from "lucide-react";

interface Booking {
  id: string;
  customer_id: string;
  service: string;
  scheduled_at: string;
  technician_id: string | null;
  status: string;
  notes: string | null;
}

export default function SpaBookingCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerId, setCustomerId] = useState("8e8f7c53-214c-446e-a1bd-1b6dd27a7444"); // Seed customer
  const [service, setService] = useState("Chăm sóc da chuyên sâu Collagen");
  const [scheduledAt, setScheduledAt] = useState("2026-07-20T14:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get("/api/v1/spa/bookings");
      const list = Array.isArray(res.data?.bookings) ? res.data.bookings : Array.isArray(res.data) ? res.data : [];
      setBookings(list);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedDate = new Date(scheduledAt).toISOString();
      await apiService.post("/api/v1/spa/bookings", {
        customer_id: customerId,
        service,
        scheduled_at: formattedDate,
        notes: notes || null
      });
      setShowAddForm(false);
      setNotes("");
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Lỗi tạo lịch hẹn");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Lịch Hẹn Spa & Clinic</h3>
            <p className="text-xs text-slate-500">Đặt & theo dõi lịch điều trị của khách hàng</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBookings} className="p-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-pink-600/20">
            <Plus size={14} /> Thêm Lịch Hẹn
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 text-xs">
          Đang tải lịch hẹn...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#334155] rounded-xl text-slate-500">
          <Clock size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Chưa có lịch hẹn nào</p>
          <p className="text-xs mt-1 text-slate-600">Ấn "Thêm Lịch Hẹn" để lên lịch cho khách hàng</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {bookings.map((booking) => {
            const date = new Date(booking.scheduled_at);
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#0f172a]/60 border border-[#334155] rounded-xl flex items-center justify-between gap-4 hover:border-[#475569] transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium truncate">{booking.service}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {date.toLocaleDateString("vi-VN")} {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {booking.technician_id && (
                      <span className="flex items-center gap-1 text-pink-400/80">
                        <UserCheck size={12} />
                        KTV: {booking.technician_id.substring(0, 8)}
                      </span>
                    )}
                  </div>
                  {booking.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1.5 line-clamp-1">Ghi chú: {booking.notes}</p>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 shrink-0 text-right">
                  <span className="block font-semibold text-slate-300">Khách hàng</span>
                  <span className="text-[9px] font-mono">{booking.customer_id.substring(0, 8)}...</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Booking Modal Dialog */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <h4 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <CalendarIcon size={18} className="text-pink-400" /> Tạo Lịch Hẹn Spa Mới
              </h4>
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">ID Khách Hàng</label>
                  <input type="text" value={customerId} onChange={e => setCustomerId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Dịch Vụ Điều Trị</label>
                  <select value={service} onChange={e => setService(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500">
                    <option value="Chăm sóc da chuyên sâu Collagen">Chăm sóc da chuyên sâu Collagen</option>
                    <option value="Trị mụn y khoa Acne Clear">Trị mụn y khoa Acne Clear</option>
                    <option value="Trẻ hóa nâng cơ HIFU">Trẻ hóa nâng cơ HIFU</option>
                    <option value="Triệt lông laser Diode">Triệt lông laser Diode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Thời Gian Hẹn</label>
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Ghi Chú</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu đặc biệt của khách hàng..."
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 h-16 resize-none focus:outline-none focus:border-pink-500" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-slate-400 text-xs font-semibold transition-colors">
                    Hủy bỏ
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-lg shadow-pink-600/10">
                    {submitting ? "Đang lưu..." : "Xác Nhận Đặt"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
