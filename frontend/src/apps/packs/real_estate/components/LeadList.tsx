import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Plus, RefreshCw, UserCheck, Flame, Cpu, Phone, Mail, Inbox } from "lucide-react";

interface Lead {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    budget: number;
    preferred_area?: string;
    property_type?: string;
    urgency: string;
    source?: string;
    ai_score: number;
    status: string;
    last_contacted?: string;
    notes?: string;
}

export default function LeadList() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLeadForScore, setSelectedLeadForScore] = useState<Lead | null>(null);
    const [scoringResult, setScoringResult] = useState<any>(null);
    const [scoringLoading, setScoringLoading] = useState(false);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [budget, setBudget] = useState(3000000000);
    const [preferredArea, setPreferredArea] = useState("Đống Đa");
    const [propertyType, setPropertyType] = useState("CanHo");
    const [urgency, setUrgency] = useState("Warm");
    const [source, setSource] = useState("Website");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchLeads = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/re/leads");
            setLeads(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            setError("Lỗi tải danh sách nhu cầu: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleScoreLead = async (lead: Lead) => {
        setSelectedLeadForScore(lead);
        setScoringLoading(true);
        setScoringResult(null);
        try {
            const urgencyLower = (lead.urgency || "medium").toLowerCase();
            const interactionCount = lead.notes ? 4 : 2;
            const res = await apiService.post("/api/v1/ai/real-estate/lead-score", {
                budget_vnd: lead.budget,
                interaction_count: interactionCount,
                source: lead.source || "website",
                property_type: lead.property_type,
                urgency: urgencyLower
            });
            setScoringResult(res.data);
        } catch (err) {
            console.error("Lỗi chấm điểm Lead:", err);
        } finally {
            setScoringLoading(false);
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/re/leads", {
                name,
                phone,
                email: email || undefined,
                budget: Number(budget),
                preferred_area: preferredArea,
                property_type: propertyType,
                urgency,
                source,
                notes: notes || undefined,
            });
            setName("");
            setPhone("");
            setEmail("");
            setNotes("");
            setShowAddForm(false);
            fetchLeads();
        } catch (err: any) {
            alert("Lỗi thêm khách hàng: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (p: number) => {
        if (p >= 1_000_000_000) {
            return `${(p / 1_000_000_000).toFixed(2)} tỷ`;
        }
        return `${(p / 1_000_000).toFixed(0)} triệu`;
    };

    const getUrgencyBadge = (urg: string) => {
        switch (urg) {
            case "Hot": return "bg-red-500/10 text-red-400 border border-red-500/20";
            case "Warm": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            default: return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155]/60 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Nhu Cầu Khách Mua (Leads)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Khách hàng quan tâm, phân loại độ nóng & chấm điểm AI match sản phẩm</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg"
                    >
                        <Plus size={14} /> Khách Mua Mới
                    </button>
                    <button 
                        onClick={fetchLeads}
                        className="p-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-all border border-[#334155]"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Add Lead Form */}
            {showAddForm && (
                <form onSubmit={handleCreateLead} className="mb-6 bg-[#0f172a]/60 border border-[#334155]/80 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="col-span-full font-bold text-white text-xs uppercase tracking-wider mb-1">Ghi nhận nhu cầu khách mua mới</h3>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Họ tên khách hàng</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Nguyễn Thị B" className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Số điện thoại</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="090..." className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Ngân sách tối đa (VND)</label>
                        <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Khu vực ưa thích</label>
                        <input type="text" value={preferredArea} onChange={e => setPreferredArea(e.target.value)} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Loại bất động sản quan tâm</label>
                        <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs">
                            <option value="CanHo">Căn hộ chung cư</option>
                            <option value="NhaPho">Nhà phố thương mại</option>
                            <option value="DatNen">Đất nền dự án</option>
                            <option value="BietThu">Biệt thự liền kề</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Độ cấp thiết</label>
                        <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs">
                            <option value="Hot">Rất Gấp (Hot)</option>
                            <option value="Warm">Đang tìm hiểu (Warm)</option>
                            <option value="Cold">Xem tham khảo (Cold)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Nguồn lead</label>
                        <input type="text" value={source} onChange={e => setSource(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Ghi chú nhu cầu chi tiết</label>
                        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu cụ thể: số phòng ngủ, tầng cao, hướng ban công..." className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-[#334155]">Hủy</button>
                        <button type="submit" disabled={submitting} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors">{submitting ? "Đang lưu..." : "Xác nhận ghi nhận"}</button>
                    </div>
                </form>
            )}

            {/* Leads Table */}
            {loading && leads.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-xs text-center py-6">{error}</p>
            ) : leads.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Inbox size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có nhu cầu khách mua nào</p>
                    <p className="text-xs mt-1">Đăng ký khách hàng để bắt đầu theo dõi deal và chấm điểm AI matching</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#334155] text-slate-400 font-bold">
                                <th className="pb-3">Khách hàng</th>
                                <th className="pb-3">Nhu cầu & Vị trí</th>
                                <th className="pb-3">Ngân sách</th>
                                <th className="pb-3">Độ cấp thiết</th>
                                <th className="pb-3">Nguồn</th>
                                <th className="pb-3 text-right">Chấm điểm AI match</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/40">
                            {leads.map(lead => (
                                <tr key={lead.id} className="text-slate-300 hover:bg-[#334155]/10 transition-colors">
                                    <td className="py-4">
                                        <p className="font-extrabold text-slate-200 text-sm">{lead.name}</p>
                                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 mt-1 font-medium">
                                            {lead.phone && <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>}
                                            {lead.email && <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="font-semibold text-slate-200">
                                            {lead.property_type === "CanHo" ? "Căn hộ" : lead.property_type === "NhaPho" ? "Nhà phố" : "Đất nền"} tại {lead.preferred_area}
                                        </div>
                                        {lead.notes && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{lead.notes}</p>}
                                    </td>
                                    <td className="py-4 font-black text-white">{formatPrice(lead.budget)}</td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1 w-fit ${getUrgencyBadge(lead.urgency)}`}>
                                            <Flame size={10} />
                                            {lead.urgency === "Hot" ? "Gấp" : lead.urgency === "Warm" ? "Trung bình" : "Tham khảo"}
                                        </span>
                                    </td>
                                    <td className="py-4 text-slate-400 font-bold">{lead.source}</td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 bg-[#0f172a]/80 h-2 rounded-full overflow-hidden border border-[#334155]/40 shrink-0">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${lead.ai_score}%` }}></div>
                                            </div>
                                            <button 
                                                onClick={() => handleScoreLead(lead)}
                                                className="font-black text-purple-400 text-xs flex items-center gap-0.5 shrink-0 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded border border-purple-500/20 transition-all cursor-pointer"
                                                title="Click để xem phân tích chi tiết từ AI Agent"
                                            >
                                                <Cpu size={12} /> {lead.ai_score}%
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AI Lead Scoring Modal */}
            {selectedLeadForScore && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2">
                                    <Cpu size={18} className="text-purple-400" />
                                    Phân tích AI Lead: {selectedLeadForScore.name}
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">Chấm điểm & phân khúc khách hàng tiềm năng</p>
                            </div>
                            <button 
                                onClick={() => setSelectedLeadForScore(null)}
                                className="text-slate-400 hover:text-white text-xs font-bold bg-[#0f172a] hover:bg-[#1e293b] w-6 h-6 rounded-full flex items-center justify-center transition-colors border border-[#334155]"
                            >
                                ✕
                            </button>
                        </div>

                        {scoringLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <RefreshCw size={24} className="animate-spin text-purple-500" />
                            </div>
                        ) : scoringResult ? (
                            <div className="space-y-4">
                                <div className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium">ĐIỂM TIỀM NĂNG</p>
                                        <p className="text-3xl font-black text-purple-400 mt-1">{scoringResult.score}<span className="text-xs text-slate-500">/100</span></p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        scoringResult.classification === "HOT" ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" :
                                        scoringResult.classification === "WARM" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                        "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    }`}>
                                        Lead {scoringResult.classification}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hành động khuyến nghị:</h4>
                                    <p className="bg-purple-950/20 border border-purple-500/20 text-purple-300 p-3 rounded-lg leading-relaxed font-semibold">
                                        {scoringResult.recommended_action}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chi tiết tiêu chí đánh giá:</h4>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="bg-[#0f172a]/30 p-2 rounded border border-[#334155]/30">
                                            <span className="text-slate-400 block">Ngân sách (25%):</span>
                                            <span className="font-bold text-slate-200 mt-0.5 block">{scoringResult.breakdown.budget_score.toFixed(1)} / 25.0</span>
                                        </div>
                                        <div className="bg-[#0f172a]/30 p-2 rounded border border-[#334155]/30">
                                            <span className="text-slate-400 block">Tương tác (25%):</span>
                                            <span className="font-bold text-slate-200 mt-0.5 block">{scoringResult.breakdown.interaction_score.toFixed(1)} / 25.0</span>
                                        </div>
                                        <div className="bg-[#0f172a]/30 p-2 rounded border border-[#334155]/30">
                                            <span className="text-slate-400 block">Nguồn dẫn (20%):</span>
                                            <span className="font-bold text-slate-200 mt-0.5 block">{scoringResult.breakdown.source_score.toFixed(1)} / 20.0</span>
                                        </div>
                                        <div className="bg-[#0f172a]/30 p-2 rounded border border-[#334155]/30">
                                            <span className="text-slate-400 block">Độ cấp thiết (15%):</span>
                                            <span className="font-bold text-slate-200 mt-0.5 block">{scoringResult.breakdown.urgency_score.toFixed(1)} / 15.0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-400 text-xs py-4 text-center">Không thể lấy kết quả phân tích AI.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
