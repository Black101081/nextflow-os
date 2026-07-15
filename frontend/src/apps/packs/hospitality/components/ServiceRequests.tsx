import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { RefreshCw, Plus, Bell, CheckCircle, ListTodo, AlertCircle } from "lucide-react";

interface ServiceRequest {
    id: string;
    booking_id?: string;
    request_type: string;
    requested_at: string;
    fulfilled_at?: string;
    status: string;
    charge: number;
    notes?: string;
}

interface Booking {
    id: string;
    guest_name: string;
}

export default function ServiceRequests() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState("");
    const [requestType, setRequestType] = useState("ExtraTowel");
    const [charge, setCharge] = useState(50000);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [reqsRes, bksRes] = await Promise.all([
                apiService.get("/api/v1/hosp/service-requests"),
                apiService.get("/api/v1/hosp/bookings"),
            ]);
            setRequests(Array.isArray(reqsRes.data) ? reqsRes.data : []);
            // Filter only active/un-checked-out bookings for request creation
            const bks = Array.isArray(bksRes.data) ? bksRes.data : [];
            setBookings(bks.filter((b: any) => b.status === "CheckedIn" || b.status === "Confirmed"));
        } catch (e: any) {
            setError("Lỗi tải yêu cầu dịch vụ: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/hosp/service-requests", {
                booking_id: selectedBooking || undefined,
                request_type: requestType,
                charge: Number(charge),
                notes: notes || undefined,
            });
            setShowAddForm(false);
            setNotes("");
            fetchData();
        } catch (err: any) {
            alert("Lỗi thêm yêu cầu: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteRequest = async (id: string) => {
        try {
            await apiService.put(`/api/v1/hosp/service-requests/${id}/status`, { status: "Fulfilled" });
            fetchData();
        } catch (err: any) {
            alert("Lỗi cập nhật yêu cầu: " + err.message);
        }
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
    };

    const getBookingName = (bookingId?: string) => {
        if (!bookingId) return "Khách lẻ (Không đặt trước)";
        const b = bookings.find(x => x.id === bookingId);
        return b ? b.guest_name : "Khách hàng lưu trú";
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155]/60 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Yêu Cầu Dịch Vụ & Phòng Buồng</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Theo dõi phục vụ phòng, giặt là, ăn sáng & cộng tiền hóa đơn</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg"
                    >
                        <Plus size={14} /> Ghi nhận dịch vụ
                    </button>
                    <button 
                        onClick={fetchData}
                        className="p-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-all border border-[#334155]"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Add Request Form */}
            {showAddForm && (
                <form onSubmit={handleCreateRequest} className="mb-6 bg-[#0f172a]/60 border border-[#334155]/80 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="col-span-full font-bold text-white text-xs uppercase tracking-wider mb-1">Ghi nhận dịch vụ phòng mới</h3>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Chọn khách hàng lưu trú</label>
                        <select value={selectedBooking} onChange={e => setSelectedBooking(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs">
                            <option value="">-- Chọn khách đặt phòng --</option>
                            {bookings.map(b => (
                                <option key={b.id} value={b.id}>{b.guest_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Loại dịch vụ</label>
                        <select value={requestType} onChange={e => setRequestType(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs">
                            <option value="ExtraTowel">Phục vụ khăn / gối phụ</option>
                            <option value="Breakfast">Phần ăn sáng tại phòng</option>
                            <option value="Laundry">Dịch vụ giặt là</option>
                            <option value="Taxi">Đặt xe Taxi / Tour</option>
                            <option value="MiniBar">Đồ uống Mini Bar</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phí dịch vụ</label>
                        <input type="number" value={charge} onChange={e => setCharge(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Ghi chú dịch vụ</label>
                        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu cụ thể của khách..." className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-[#334155]">Hủy</button>
                        <button type="submit" disabled={submitting} className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-2 px-4 rounded-xl text-xs transition-colors">{submitting ? "Đang lưu..." : "Xác nhận dịch vụ"}</button>
                    </div>
                </form>
            )}

            {/* Requests Table */}
            {loading && requests.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-xs text-center py-6">{error}</p>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <ListTodo size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có yêu cầu dịch vụ nào</p>
                    <p className="text-xs mt-1">Các yêu cầu giặt là, dọn dẹp, đồ uống sẽ xuất hiện tại đây</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#334155] text-slate-400 font-bold">
                                <th className="pb-3">Khách hàng / Booking</th>
                                <th className="pb-3">Dịch vụ yêu cầu</th>
                                <th className="pb-3">Phí dịch vụ</th>
                                <th className="pb-3">Thời gian ghi nhận</th>
                                <th className="pb-3">Trạng thái</th>
                                <th className="pb-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/40">
                            {requests.map(request => (
                                <tr key={request.id} className="text-slate-300 hover:bg-[#334155]/10 transition-colors">
                                    <td className="py-4 font-bold text-slate-200">{getBookingName(request.booking_id)}</td>
                                    <td className="py-4">
                                        <p className="font-extrabold text-white text-[13px]">{request.request_type}</p>
                                        {request.notes && <p className="text-[10px] text-slate-400 mt-1 italic">{request.notes}</p>}
                                    </td>
                                    <td className="py-4 font-black text-slate-100">{formatPrice(request.charge)}</td>
                                    <td className="py-4 font-medium text-slate-400">
                                        {new Date(request.requested_at).toLocaleTimeString()} ({new Date(request.requested_at).toLocaleDateString()})
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                                            request.status === "Fulfilled" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        }`}>
                                            {request.status === "Fulfilled" ? "Đã thực hiện" : "Đang chờ"}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        {request.status !== "Fulfilled" && (
                                            <button 
                                                onClick={() => handleCompleteRequest(request.id)}
                                                className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all shadow-md flex items-center gap-1 ml-auto"
                                            >
                                                <CheckCircle size={10} /> Đã phục vụ xong
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
