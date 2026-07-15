import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { RefreshCw, Plus, Landmark, DollarSign, CheckCircle2, ChevronRight, Inbox } from "lucide-react";

interface Deal {
    id: string;
    lead_id?: string;
    listing_id?: string;
    stage: string;
    commission: number;
    legal_milestones: { step: string; done: boolean }[];
    created_at: string;
}

interface Lead {
    id: string;
    name: string;
}

interface Listing {
    id: string;
    address: string;
}

export default function DealPipeline() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedLead, setSelectedLead] = useState("");
    const [selectedListing, setSelectedListing] = useState("");
    const [stage, setStage] = useState("Viewed");
    const [commission, setCommission] = useState(50000000);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [dlsRes, ldsRes, lstsRes] = await Promise.all([
                apiService.get("/api/v1/re/deals"),
                apiService.get("/api/v1/re/leads"),
                apiService.get("/api/v1/re/listings"),
            ]);
            setDeals(Array.isArray(dlsRes.data) ? dlsRes.data : []);
            setLeads(Array.isArray(ldsRes.data) ? ldsRes.data : []);
            setListings(Array.isArray(lstsRes.data) ? lstsRes.data : []);
        } catch (e: any) {
            setError("Lỗi tải deal pipeline: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/re/deals", {
                lead_id: selectedLead || undefined,
                listing_id: selectedListing || undefined,
                stage,
                commission: Number(commission),
            });
            setShowAddForm(false);
            fetchData();
        } catch (err: any) {
            alert("Lỗi tạo giao dịch: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStage = async (id: string, newStage: string) => {
        try {
            await apiService.put(`/api/v1/re/deals/${id}/stage`, { stage: newStage });
            fetchData();
        } catch (err: any) {
            alert("Lỗi cập nhật giai đoạn: " + err.message);
        }
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
    };

    const getLeadName = (leadId?: string) => {
        if (!leadId) return "Khách vãng lai";
        const l = leads.find(x => x.id === leadId);
        return l ? l.name : "Khách hàng mua";
    };

    const getListingAddress = (listingId?: string) => {
        if (!listingId) return "Nhà đất tự do";
        const l = listings.find(x => x.id === listingId);
        return l ? l.address : "Sản phẩm môi giới";
    };

    const getStageBadge = (stg: string) => {
        switch (stg) {
            case "Viewed": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            case "DepositPaid": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            case "ContractSigned": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
            case "Won": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            default: return "bg-red-500/10 text-red-400 border border-red-500/20";
        }
    };

    const translateStage = (stg: string) => {
        switch (stg) {
            case "Viewed": return "Khách xem nhà";
            case "DepositPaid": return "Đã nhận cọc";
            case "ContractSigned": return "Ký hợp đồng";
            case "Won": return "Thành công (Won)";
            default: return "Hủy / Thất bại";
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155]/60 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Deal Pipeline & Quy Trình Pháp Lý</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Theo dõi dòng giao dịch, tiến độ công chứng, đặt cọc & hoa hồng môi giới</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg"
                    >
                        <Plus size={14} /> Mở Deal Mới
                    </button>
                    <button 
                        onClick={fetchData}
                        className="p-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-all border border-[#334155]"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Add Deal Form */}
            {showAddForm && (
                <form onSubmit={handleCreateDeal} className="mb-6 bg-[#0f172a]/60 border border-[#334155]/80 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="col-span-full font-bold text-white text-xs uppercase tracking-wider mb-1">Mở hồ sơ giao dịch mới</h3>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Chọn khách hàng mua</label>
                        <select value={selectedLead} onChange={e => setSelectedLead(e.target.value)} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs">
                            <option value="">-- Chọn khách mua --</option>
                            {leads.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Chọn sản phẩm ký gửi</label>
                        <select value={selectedListing} onChange={e => setSelectedListing(e.target.value)} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs">
                            <option value="">-- Chọn nhà đất ký gửi --</option>
                            {listings.map(l => (
                                <option key={l.id} value={l.id}>{l.address}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Dự kiến hoa hồng (VND)</label>
                        <input type="number" value={commission} onChange={e => setCommission(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Giai đoạn ban đầu</label>
                        <select value={stage} onChange={e => setStage(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs">
                            <option value="Viewed">Khách xem nhà</option>
                            <option value="DepositPaid">Đã nhận cọc</option>
                            <option value="ContractSigned">Ký hợp đồng</option>
                        </select>
                    </div>
                    <div className="col-span-full flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-[#334155]">Hủy</button>
                        <button type="submit" disabled={submitting} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors">{submitting ? "Đang mở..." : "Khởi tạo deal"}</button>
                    </div>
                </form>
            )}

            {/* Deal List */}
            {loading && deals.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-xs text-center py-6">{error}</p>
            ) : deals.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Inbox size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có deal giao dịch nào</p>
                    <p className="text-xs mt-1">Các giao dịch ký gửi nhà đất sẽ xuất hiện tại đây</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {deals.map(deal => (
                        <div key={deal.id} className="border border-[#334155]/60 hover:border-purple-500/40 bg-[#0f172a]/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${getStageBadge(deal.stage)}`}>
                                        {translateStage(deal.stage)}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">Giao dịch mở ngày: {new Date(deal.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-sm font-extrabold text-slate-200">
                                    Khách mua: <span className="text-white">{getLeadName(deal.lead_id)}</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                    🎯 {getListingAddress(deal.listing_id)}
                                </p>
                                <p className="text-xs text-purple-400 font-black flex items-center gap-1">
                                    <DollarSign size={12} /> Dự kiến hoa hồng: {formatPrice(deal.commission)}
                                </p>
                            </div>

                            {/* Legal Milestones Checklist */}
                            <div className="bg-[#1e293b]/40 rounded-xl p-3 border border-[#334155]/40 min-w-[280px]">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Landmark size={12} className="text-slate-500" /> Tiến độ pháp lý bắt buộc</h4>
                                <div className="space-y-1.5 text-[10px] font-semibold">
                                    {deal.legal_milestones?.map((milestone, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                milestone.done ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-600 bg-slate-800 text-slate-500"
                                            }`}>
                                                {milestone.done ? "✓" : ""}
                                            </div>
                                            <span className={milestone.done ? "text-emerald-400 line-through" : "text-slate-300"}>{milestone.step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stage Transitions Quick Action */}
                            <div className="flex flex-col gap-2 shrink-0 md:text-right">
                                <label className="block text-[9px] font-black text-slate-500 uppercase">Cập nhật nhanh giai đoạn</label>
                                <div className="flex items-center gap-1.5">
                                    <select 
                                        value={deal.stage} 
                                        onChange={e => handleUpdateStage(deal.id, e.target.value)} 
                                        className="bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-300 outline-none focus:border-purple-500 transition-colors"
                                    >
                                        <option value="Viewed">Khách xem nhà</option>
                                        <option value="DepositPaid">Đã nhận cọc</option>
                                        <option value="ContractSigned">Ký hợp đồng</option>
                                        <option value="Won">Thành công (Won)</option>
                                        <option value="Lost">Hủy / Thất bại</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
