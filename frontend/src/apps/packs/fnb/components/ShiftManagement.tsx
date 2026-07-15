import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Calendar, UserPlus, RefreshCw, AlertCircle, FileText, CheckCircle2, Users } from "lucide-react";

interface Shift {
    id: string;
    shift_date: string;
    shift_type: string;
    planned_staff: string[];
    actual_staff: string[];
    notes: string | null;
    status: string;
}

export default function ShiftManagement() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [shiftDate, setShiftDate] = useState("2026-07-15");
    const [shiftType, setShiftType] = useState("Morning");
    const [plannedStaff, setPlannedStaff] = useState<string>(["SME_OPS", "FIELD_WORKER"].join(", "));
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchShifts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/fb/shifts");
            const list = Array.isArray(res.data) ? res.data : [];
            setShifts(list);
        } catch (err: any) {
            setError(err.message || "Không thể tải lịch ca làm việc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleCreateShift = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const staffList = plannedStaff.split(",").map(s => s.trim()).filter(s => s.length > 0);
            await apiService.post("/api/v1/fb/shifts", {
                shift_date: shiftDate,
                shift_type: shiftType,
                planned_staff: staffList,
                notes: notes || null
            });
            setShowAddForm(false);
            setNotes("");
            await fetchShifts();
        } catch (err: any) {
            alert(`Lỗi tạo lịch ca: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Lịch phân ca Nhân viên</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Sắp ca và đối chiếu đội ngũ thực tế phục vụ khách hàng</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    >
                        <UserPlus size={14} />
                        Phân ca mới
                    </button>
                    <button onClick={fetchShifts} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateShift} className="bg-[#0f172a]/60 border border-[#334155] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ngày làm việc</label>
                        <input 
                            type="date" 
                            value={shiftDate} 
                            onChange={(e) => setShiftDate(e.target.value)} 
                            required
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500 transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ca trực</label>
                        <select 
                            value={shiftType} 
                            onChange={(e) => setShiftType(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500 transition-colors text-sm"
                        >
                            <option value="Morning">Ca Sáng (06:00 - 14:00)</option>
                            <option value="Afternoon">Ca Chiều (14:00 - 22:00)</option>
                            <option value="Evening">Ca Tối (22:00 - 06:00)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nhân viên chỉ định (phân tách bằng dấu phẩy)</label>
                        <input 
                            type="text" 
                            value={plannedStaff} 
                            onChange={(e) => setPlannedStaff(e.target.value)} 
                            required
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500 transition-colors text-sm"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ghi chú bàn giao ca</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            rows={2}
                            placeholder="VD: Kiểm đếm tiền mặt quầy thu ngân lúc bàn giao ca..."
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500 transition-colors text-sm"
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                        <button 
                            type="button" 
                            onClick={() => setShowAddForm(false)}
                            className="bg-[#334155] hover:bg-[#475569] text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-lg"
                        >
                            {submitting ? "Đang lưu..." : "Xác nhận tạo"}
                        </button>
                    </div>
                </form>
            )}

            {loading && shifts.length === 0 ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-4">
                    <AlertCircle className="text-red-400 mx-auto mb-1" size={24} />
                    <p className="text-red-400 text-xs">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shifts.map(shift => (
                        <div key={shift.id} className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all group shadow-md">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-slate-300 bg-[#1e293b] px-3 py-1 rounded-lg border border-[#334155]/40">{shift.shift_date}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        shift.status === "Scheduled" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}>{shift.status}</span>
                                </div>
                                <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-400 transition-colors">Ca trực: {shift.shift_type}</h3>
                                
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Users size={12} className="text-slate-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kế hoạch ca trực:</p>
                                            <p className="text-xs text-slate-300 mt-0.5 font-medium">{shift.planned_staff.join(", ")}</p>
                                        </div>
                                    </div>
                                    {shift.notes && (
                                        <div className="flex items-start gap-2">
                                            <FileText size={12} className="text-slate-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nội dung bàn giao:</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{shift.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {shifts.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500 text-xs">
                            Không có ca trực nào được phân bổ hôm nay
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
