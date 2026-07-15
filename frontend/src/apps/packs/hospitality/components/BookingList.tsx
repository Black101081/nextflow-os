import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { RefreshCw, Calendar, CreditCard, Mail, Phone, Inbox, AlertCircle } from "lucide-react";

interface Booking {
    id: string;
    room_id: string;
    guest_name: string;
    guest_email?: string;
    guest_phone?: string;
    check_in: string;
    check_out: string;
    source: string;
    status: string;
    special_requests?: string;
    total_amount: number;
    paid_amount: number;
    notes?: string;
}

export default function BookingList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/hosp/bookings");
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            setError("Lỗi tải danh sách đặt phòng: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await apiService.put(`/api/v1/hosp/bookings/${id}/status`, { status: newStatus });
            fetchBookings();
        } catch (e: any) {
            alert("Lỗi cập nhật trạng thái: " + e.message);
        }
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            case "CheckedIn": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            case "CheckedOut": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            default: return "bg-red-500/10 text-red-400 border border-red-500/20";
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155]/60 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Lịch Sử Đặt Phòng & Trạng Thái Lưu Trú</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Nhận phòng, trả phòng, đối soát công nợ & nguồn booking</p>
                </div>
                <button 
                    onClick={fetchBookings}
                    className="p-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-all border border-[#334155]"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* List Table */}
            {loading && bookings.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-xs text-center py-6">{error}</p>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Inbox size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có lịch đặt phòng nào</p>
                    <p className="text-xs mt-1">Đơn đặt phòng mới sẽ xuất hiện tại đây khi khách hàng đặt phòng</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#334155] text-slate-400 font-bold">
                                <th className="pb-3">Khách hàng</th>
                                <th className="pb-3">Thời gian lưu trú</th>
                                <th className="pb-3">Nguồn</th>
                                <th className="pb-3">Thanh toán</th>
                                <th className="pb-3">Trạng thái</th>
                                <th className="pb-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/40">
                            {bookings.map(booking => (
                                <tr key={booking.id} className="text-slate-300 hover:bg-[#334155]/10 transition-colors">
                                    <td className="py-4">
                                        <p className="font-extrabold text-slate-200 text-sm">{booking.guest_name}</p>
                                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 mt-1 font-medium">
                                            {booking.guest_phone && <span className="flex items-center gap-1"><Phone size={10} /> {booking.guest_phone}</span>}
                                            {booking.guest_email && <span className="flex items-center gap-1"><Mail size={10} /> {booking.guest_email}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <Calendar size={12} className="text-lime-400" />
                                            <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                                            <span className="text-slate-500 font-bold">&rarr;</span>
                                            <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                                        </div>
                                        {booking.special_requests && (
                                            <p className="text-[10px] text-amber-400 mt-1 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 inline-block font-medium">
                                                ★ {booking.special_requests}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <span className="bg-[#1e293b] border border-[#334155]/60 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400">
                                            {booking.source}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-0.5 font-bold">
                                            <span className="text-slate-100 flex items-center gap-1"><CreditCard size={12} className="text-slate-500" /> {formatPrice(booking.total_amount)}</span>
                                            <span className="text-[10px] text-slate-500">Đã trả: {formatPrice(booking.paid_amount)}</span>
                                            {booking.total_amount - booking.paid_amount > 0 && (
                                                <span className="text-[9px] text-red-400">Nợ: {formatPrice(booking.total_amount - booking.paid_amount)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${getStatusBadge(booking.status)}`}>
                                            {booking.status === "Confirmed" ? "Đã xác nhận" :
                                             booking.status === "CheckedIn" ? "Đang lưu trú" :
                                             booking.status === "CheckedOut" ? "Đã trả phòng" :
                                             "Đã hủy"}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                                        {booking.status === "Confirmed" && (
                                            <>
                                                <button 
                                                    onClick={() => updateStatus(booking.id, "CheckedIn")}
                                                    className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-1 px-2.5 rounded-lg text-[10px] transition-all shadow-md"
                                                >
                                                    Nhận Phòng
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(booking.id, "Cancelled")}
                                                    className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 font-bold py-1 px-2.5 rounded-lg text-[10px] transition-all"
                                                >
                                                    Hủy
                                                </button>
                                            </>
                                        )}
                                        {booking.status === "CheckedIn" && (
                                            <button 
                                                onClick={() => updateStatus(booking.id, "CheckedOut")}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition-all shadow-md"
                                            >
                                                Trả Phòng
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
