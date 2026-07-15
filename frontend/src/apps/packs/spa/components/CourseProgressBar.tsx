import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../../shared/services/api";
import { Sparkles, Calendar, Plus, RefreshCw, AlertCircle, CheckCircle2, Ticket, CheckSquare } from "lucide-react";

interface Course {
  id: string;
  customer_id: string;
  course_name: string;
  total_sessions: number;
  used_sessions: number;
  expiry_date: string | null;
  status: string;
  created_at: string;
}

export default function CourseProgressBar() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("8e8f7c53-214c-446e-a1bd-1b6dd27a7444"); // Seed customer
  const [searchId, setSearchId] = useState("8e8f7c53-214c-446e-a1bd-1b6dd27a7444");
  const [error, setError] = useState<string | null>(null);

  // Buy New Course Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [courseName, setCourseName] = useState("Liệu trình Trẻ hóa da HIFU 5 buổi");
  const [totalSessions, setTotalSessions] = useState(5);
  const [expiryDays, setExpiryDays] = useState(90);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async (targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get(`/api/v1/spa/courses?customer_id=${targetId}`);
      const list = Array.isArray(res.data?.courses) ? res.data.courses : Array.isArray(res.data) ? res.data : [];
      setCourses(list);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách liệu trình");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(searchId);
  }, [searchId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(customerId);
  };

  const handleUseSession = async (courseId: string) => {
    try {
      await apiService.post(`/api/v1/spa/courses/use/${courseId}`);
      fetchCourses(searchId);
    } catch (err: any) {
      alert(err.message || "Lỗi sử dụng buổi liệu trình");
    }
  };

  const handleBuyCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      await apiService.post("/api/v1/spa/courses", {
        customer_id: searchId,
        course_name: courseName,
        total_sessions: totalSessions,
        expiry_date: expiryDate.toISOString().split("T")[0]
      });

      setShowAddForm(false);
      fetchCourses(searchId);
    } catch (err: any) {
      alert(err.message || "Lỗi đăng ký liệu trình mới");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 border-b border-[#334155] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Ticket size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Theo Dõi Liệu Trình (Course)</h3>
            <p className="text-xs text-slate-500">Quản lý thẻ liệu trình trả trước & số buổi còn lại</p>
          </div>
        </div>
        {courses.length > 0 && (
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 py-1 px-2.5 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-400 text-[11px] font-bold rounded-lg transition-colors">
            <Plus size={12} /> Mua liệu trình
          </button>
        )}
      </div>

      {/* Customer search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input type="text" value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="Nhập ID Khách Hàng..."
          className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
        <button type="submit" className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] text-pink-400 font-semibold text-xs rounded-lg transition-colors">
          Tra cứu
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-8">
          Đang tải thẻ liệu trình...
        </div>
      ) : courses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-[#334155] rounded-xl p-8 text-center">
          <Ticket size={36} className="mb-2 opacity-30" />
          <p className="text-sm">Chưa có liệu trình nào</p>
          <p className="text-xs mt-1 text-slate-600">Khách hàng chưa sở hữu thẻ liệu trình trả trước nào</p>
          <button onClick={() => setShowAddForm(true)} className="mt-4 px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-400 text-xs font-bold rounded-lg transition-colors">
            Mua liệu trình đầu tiên
          </button>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {courses.map((course) => {
            const used = course.used_sessions;
            const total = course.total_sessions;
            const remaining = total - used;
            const pct = (used / total) * 100;
            const isExpired = course.status.toLowerCase() === "expired" || remaining <= 0;

            return (
              <motion.div key={course.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#0f172a]/60 border border-[#334155] rounded-xl hover:border-[#475569] transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{course.course_name}</h4>
                    {course.expiry_date && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> Hạn dùng: {course.expiry_date}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isExpired ? "bg-slate-500/10 text-slate-500" : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {isExpired ? "Hết hạn" : "Đang chạy"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative pt-1 mb-3">
                  <div className="flex mb-1 items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold">Tiến độ sử dụng</span>
                    <span className="text-pink-400 font-bold">{used}/{total} buổi ({Math.round(pct)}%)</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-[#0f172a] border border-[#334155]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#334155]/60 mt-3">
                  <span className="text-[10px] text-slate-500 font-medium">Còn lại: <strong className="text-slate-300 font-bold">{remaining} buổi</strong></span>
                  <button onClick={() => handleUseSession(course.id)} disabled={isExpired}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isExpired ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed" :
                      "bg-pink-600/10 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-500/20"
                    }`}>
                    <CheckSquare size={13} /> Dùng 1 Buổi
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Buy Course Modal Dialog */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <h4 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Ticket size={18} className="text-pink-400" /> Bán Thẻ Liệu Trình Cho Khách Hàng
              </h4>
              <form onSubmit={handleBuyCourse} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">ID Khách Hàng</label>
                  <input type="text" value={searchId} readOnly
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-500 cursor-not-allowed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Tên Gói Liệu Trình</label>
                  <select value={courseName} onChange={e => {
                    setCourseName(e.target.value);
                    if (e.target.value.includes("10 buổi")) setTotalSessions(10);
                    else if (e.target.value.includes("5 buổi")) setTotalSessions(5);
                    else setTotalSessions(3);
                  }}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500">
                    <option value="Liệu trình Trẻ hóa da HIFU 5 buổi">Liệu trình Trẻ hóa da HIFU 5 buổi</option>
                    <option value="Liệu trình Chăm sóc da chuyên sâu 10 buổi">Liệu trình Chăm sóc da chuyên sâu 10 buổi</option>
                    <option value="Gói Trị mụn Acne Clear 3 buổi">Gói Trị mụn Acne Clear 3 buổi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Số Buổi Liệu Trình</label>
                  <input type="number" value={totalSessions} onChange={e => setTotalSessions(parseInt(e.target.value) || 1)} min="1" max="100"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Thời Hạn Sử Dụng (Ngày)</label>
                  <input type="number" value={expiryDays} onChange={e => setExpiryDays(parseInt(e.target.value) || 30)} min="1"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-slate-400 text-xs font-semibold transition-colors">
                    Hủy bỏ
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-lg shadow-pink-600/10">
                    {submitting ? "Đang lưu..." : "Xác Nhận Bán"}
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
