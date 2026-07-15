import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { DollarSign, Plus, RefreshCw, AlertCircle, Calendar, CreditCard, CheckCircle2 } from "lucide-react";

interface Student {
    id: string;
    name: string;
}

interface Payment {
    id: string;
    student_id: string;
    amount: number;
    due_date: string;
    paid_date: string | null;
    paid_amount: number | null;
    method: string | null;
    status: string;
    note: string | null;
}

export default function PaymentTracker() {
    const [students, setStudents] = useState<Student[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [amount, setAmount] = useState(2500000);
    const [dueDate, setDueDate] = useState("2026-08-01");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentsRes, paymentsRes] = await Promise.all([
                apiService.get("/api/v1/edu/students"),
                apiService.get("/api/v1/edu/payments")
            ]);
            
            const stds = Array.isArray(studentsRes.data) ? studentsRes.data : [];
            const pays = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

            setStudents(stds);
            setPayments(pays);
            if (stds.length > 0) {
                setStudentId(stds[0].id);
            }
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách học phí");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/edu/payments", {
                student_id: studentId,
                amount: Number(amount),
                due_date: dueDate,
                note: note || null
            });
            setShowAddForm(false);
            setNote("");
            await fetchData();
        } catch (err: any) {
            alert(`Lỗi tạo phiếu thu: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPayment = async (paymentId: string, fullAmount: number) => {
        // Simple mock trigger to resolve a payment to paid
        try {
            await apiService.post("/api/v1/edu/payments", {
                student_id: payments.find(p => p.id === paymentId)!.student_id,
                amount: fullAmount,
                due_date: payments.find(p => p.id === paymentId)!.due_date,
                paid_date: new Date().toISOString().split('T')[0],
                paid_amount: fullAmount,
                method: "Chuyển khoản",
                status: "Paid",
                note: "Đã xác nhận thanh toán qua ngân hàng"
            });
            await fetchData();
        } catch (err: any) {
            alert(`Lỗi xác nhận đóng học phí: ${err.message}`);
        }
    };

    const getStudentName = (id: string) => {
        const std = students.find(s => s.id === id);
        return std ? std.name : "Học viên ẩn danh";
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#334155]/60 pb-4 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Theo dõi Học phí & Thanh toán</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Báo cáo lịch nợ học phí, lập phiếu thu và đối chiếu các giao dịch đã đóng</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                        <Plus size={14} />
                        Lập phiếu báo phí mới
                    </button>
                    <button onClick={fetchData} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreatePayment} className="bg-[#0f172a]/60 border border-[#334155] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Học viên nhận báo phí</label>
                        <select 
                            value={studentId} 
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                        >
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Số tiền phí thông báo (VNĐ)</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(Number(e.target.value))} 
                            required
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hạn thanh toán</label>
                        <input 
                            type="date" 
                            value={dueDate} 
                            onChange={(e) => setDueDate(e.target.value)} 
                            required
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mô tả / Ghi chú</label>
                        <input 
                            type="text" 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            placeholder="VD: Học phí khóa IELTS Kids tháng 8/2026..."
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                        <button 
                            type="button" 
                            onClick={() => setShowAddForm(false)}
                            className="bg-[#334155] hover:bg-[#475569] text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-lg"
                        >
                            {submitting ? "Đang tạo..." : "Xác nhận báo phí"}
                        </button>
                    </div>
                </form>
            )}

            {loading && payments.length === 0 ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-4">
                    <AlertCircle className="text-red-400 mx-auto mb-1" size={24} />
                    <p className="text-red-400 text-xs">{error}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#334155] text-slate-400">
                                <th className="pb-3 font-semibold">Tên Học viên</th>
                                <th className="pb-3 font-semibold">Số tiền</th>
                                <th className="pb-3 font-semibold">Hạn đóng phí</th>
                                <th className="pb-3 font-semibold">Trạng thái đóng phí</th>
                                <th className="pb-3 font-semibold">Thông tin thanh toán</th>
                                <th className="pb-3 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/40">
                            {payments.map(payment => (
                                <tr key={payment.id} className="text-slate-300 hover:bg-[#334155]/10">
                                    <td className="py-3 font-extrabold text-slate-200">{getStudentName(payment.student_id)}</td>
                                    <td className="py-3 font-black text-slate-100">{formatPrice(payment.amount)}</td>
                                    <td className="py-3 text-slate-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} className="text-slate-500" />
                                            {payment.due_date}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                            payment.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            "bg-red-500/10 text-red-400 border border-red-500/20"
                                        }`}>
                                            {payment.status === "Paid" ? "Đã đóng" : "Chưa đóng"}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-400 max-w-[200px] truncate">
                                        {payment.status === "Paid" ? (
                                            <span className="flex items-center gap-1">
                                                <CreditCard size={12} className="text-slate-500" />
                                                {payment.method}: {formatPrice(payment.paid_amount || payment.amount)} ({payment.paid_date})
                                            </span>
                                        ) : (
                                            <span>{payment.note || "Nợ phí tự động chuyển sang tháng mới"}</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right">
                                        {payment.status !== "Paid" && (
                                            <button 
                                                onClick={() => handleConfirmPayment(payment.id, payment.amount)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors shadow-md"
                                            >
                                                Xác nhận đóng học phí
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-slate-500">Chưa có giao dịch thu phí nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
