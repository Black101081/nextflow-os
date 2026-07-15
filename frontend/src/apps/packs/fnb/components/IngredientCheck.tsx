import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { ShieldCheck, Plus, RefreshCw, AlertCircle, FileSpreadsheet, CheckCircle2 } from "lucide-react";

interface CheckItem {
    name: string;
    condition: string;
    expiry_date: string;
    passed: boolean;
}

interface IngredientCheck {
    id: string;
    check_date: string;
    items: CheckItem[];
    issues: string | null;
    status: string;
}

export default function IngredientCheck() {
    const [checks, setChecks] = useState<IngredientCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [checkDate, setCheckDate] = useState("2026-07-15");
    const [issues, setIssues] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Hardcode checklist items template for easy input
    const [beefPassed, setBeefPassed] = useState(true);
    const [noodlePassed, setNoodlePassed] = useState(true);
    const [eggPassed, setEggPassed] = useState(true);

    const fetchChecks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/fb/ingredient-checks");
            const list = Array.isArray(res.data) ? res.data : [];
            setChecks(list);
        } catch (err: any) {
            setError(err.message || "Không thể tải báo cáo kiểm định");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChecks();
    }, []);

    const handleCreateCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const itemsPayload = [
                { name: "Thịt Bò Kobe", condition: beefPassed ? "Tốt (Lạnh sâu)" : "Biến đổi màu nhẹ", expiry_date: "2026-07-20", passed: beefPassed },
                { name: "Bánh Phở", condition: noodlePassed ? "Tươi mới" : "Chua nhẹ", expiry_date: "2026-07-16", passed: noodlePassed },
                { name: "Kem Trứng", condition: eggPassed ? "Thơm ngậy" : "Hơi lỏng", expiry_date: "2026-07-17", passed: eggPassed }
            ];

            await apiService.post("/api/v1/fb/ingredient-checks", {
                check_date: checkDate,
                items: itemsPayload,
                issues: issues || null,
                status: "Completed"
            });

            setShowAddForm(false);
            setIssues("");
            await fetchChecks();
        } catch (err: any) {
            alert(`Lỗi lưu báo cáo kiểm định: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Kiểm định Nguyên liệu (QA/QC)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Nhật ký kiểm soát độ tươi ngon và hạn sử dụng thực phẩm hàng ngày</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    >
                        <Plus size={14} />
                        Thêm biên bản kiểm tra
                    </button>
                    <button onClick={fetchChecks} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateCheck} className="bg-[#0f172a]/60 border border-[#334155] rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ngày kiểm tra</label>
                            <input 
                                type="date" 
                                value={checkDate} 
                                onChange={(e) => setCheckDate(e.target.value)} 
                                required
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hạng mục kiểm tra định kỳ</h3>
                        
                        <div className="flex items-center justify-between bg-[#1e293b]/40 p-3 rounded-xl border border-[#334155]/20">
                            <div>
                                <h4 className="text-xs font-bold text-slate-200">Thịt Bò Kobe (Kho lạnh)</h4>
                                <p className="text-[10px] text-slate-500">Mục tiêu: Đảm bảo độ đỏ tươi, không biến màu, lạnh sâu &le; 4 độ</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setBeefPassed(true)} className={`px-3 py-1 rounded text-xs font-bold ${beefPassed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-500 border border-transparent"}`}>Đạt</button>
                                <button type="button" onClick={() => setBeefPassed(false)} className={`px-3 py-1 rounded text-xs font-bold ${!beefPassed ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-slate-800 text-slate-500 border border-transparent"}`}>Không Đạt</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-[#1e293b]/40 p-3 rounded-xl border border-[#334155]/20">
                            <div>
                                <h4 className="text-xs font-bold text-slate-200">Bánh Phở (Kho khô)</h4>
                                <p className="text-[10px] text-slate-500">Mục tiêu: Bánh phở mềm dẻo, không mùi chua, đóng gói kín</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setNoodlePassed(true)} className={`px-3 py-1 rounded text-xs font-bold ${noodlePassed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-500 border border-transparent"}`}>Đạt</button>
                                <button type="button" onClick={() => setNoodlePassed(false)} className={`px-3 py-1 rounded text-xs font-bold ${!noodlePassed ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-slate-800 text-slate-500 border border-transparent"}`}>Không Đạt</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-[#1e293b]/40 p-3 rounded-xl border border-[#334155]/20">
                            <div>
                                <h4 className="text-xs font-bold text-slate-200">Kem Trứng (Nguyên liệu pha chế)</h4>
                                <p className="text-[10px] text-slate-500">Mục tiêu: Thơm ngậy, màu vàng tươi, đánh bông xốp đạt chuẩn</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setEggPassed(true)} className={`px-3 py-1 rounded text-xs font-bold ${eggPassed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-500 border border-transparent"}`}>Đạt</button>
                                <button type="button" onClick={() => setEggPassed(false)} className={`px-3 py-1 rounded text-xs font-bold ${!eggPassed ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-slate-800 text-slate-500 border border-transparent"}`}>Không Đạt</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sự cố phát hiện / Đề xuất xử lý</label>
                        <textarea 
                            value={issues} 
                            onChange={(e) => setIssues(e.target.value)} 
                            rows={2}
                            placeholder="Ghi rõ thông tin nếu phát hiện nguyên liệu cận date cần xử lý hủy bỏ..."
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500 transition-colors text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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
                            {submitting ? "Đang lưu..." : "Lưu biên bản kiểm định"}
                        </button>
                    </div>
                </form>
            )}

            {loading && checks.length === 0 ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
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
                                <th className="pb-3 font-semibold">Ngày Kiểm định</th>
                                <th className="pb-3 font-semibold">Trạng thái nguyên liệu</th>
                                <th className="pb-3 font-semibold">Sự cố ghi nhận</th>
                                <th className="pb-3 font-semibold">Trạng thái biên bản</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/40">
                            {checks.map(check => (
                                <tr key={check.id} className="text-slate-300 hover:bg-[#334155]/10">
                                    <td className="py-3 font-bold text-slate-200">{check.check_date}</td>
                                    <td className="py-3 max-w-[320px]">
                                        <div className="flex flex-wrap gap-1.5">
                                            {check.items.map((item, idx) => (
                                                <span key={idx} className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                    item.passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                    {item.name}: {item.passed ? "Đạt" : "Hỏng"}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 text-slate-400 truncate max-w-[200px]">{check.issues || "Không có sự cố"}</td>
                                    <td className="py-3">
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold text-[9px]">
                                            {check.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {checks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-slate-500">Chưa có biên bản kiểm định nguyên liệu nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
