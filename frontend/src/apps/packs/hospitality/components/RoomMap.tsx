import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Plus, RefreshCw, Key, Shield, HelpCircle, AlertCircle } from "lucide-react";

interface Room {
    id: string;
    room_number: string;
    room_type: string;
    floor: number;
    status: string;
    smart_lock_code: string;
    amenities: string[];
    base_price: number;
}

export default function RoomMap() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [roomNumber, setRoomNumber] = useState("");
    const [roomType, setRoomType] = useState("Standard");
    const [floor, setFloor] = useState(1);
    const [smartLock, setSmartLock] = useState("");
    const [amenities, setAmenities] = useState("Wifi, TV, MiniBar");
    const [basePrice, setBasePrice] = useState(500000);
    const [submitting, setSubmitting] = useState(false);

    // Booking states
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [totalAmount, setTotalAmount] = useState(1000000);
    const [paidAmount, setPaidAmount] = useState(500000);
    const [notes, setNotes] = useState("");

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/hosp/rooms");
            setRooms(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            setError("Lỗi tải sơ đồ phòng: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomNumber.trim()) return;
        setSubmitting(true);
        try {
            const amenitiesList = amenities.split(",").map(a => a.trim()).filter(Boolean);
            await apiService.post("/api/v1/hosp/rooms", {
                room_number: roomNumber,
                room_type: roomType,
                floor: Number(floor),
                smart_lock_code: smartLock || `LOCK${roomNumber}`,
                amenities: amenitiesList,
                base_price: Number(basePrice),
            });
            setRoomNumber("");
            setShowAddForm(false);
            fetchRooms();
        } catch (err: any) {
            alert("Lỗi thêm phòng: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom || !guestName) return;
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/hosp/bookings", {
                room_id: selectedRoom.id,
                guest_name: guestName,
                guest_phone: guestPhone,
                guest_email: guestEmail || undefined,
                check_in: new Date(checkIn).toISOString(),
                check_out: new Date(checkOut).toISOString(),
                total_amount: Number(totalAmount),
                paid_amount: Number(paidAmount),
                notes: notes || undefined,
            });
            setGuestName("");
            setGuestPhone("");
            setGuestEmail("");
            setSelectedRoom(null);
            fetchRooms();
        } catch (err: any) {
            alert("Lỗi đặt phòng: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
    };

    // Auto-calculate total amount based on room base price and nights
    useEffect(() => {
        if (checkIn && checkOut && selectedRoom) {
            const start = new Date(checkIn).getTime();
            const end = new Date(checkOut).getTime();
            const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            const calculated = selectedRoom.base_price * nights;
            setTotalAmount(calculated);
            setPaidAmount(calculated);
        }
    }, [checkIn, checkOut, selectedRoom]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available": return "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60";
            case "Booked": return "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60";
            case "Occupied": return "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60";
            default: return "border-red-500/30 bg-red-500/5 hover:border-red-500/60";
        }
    };

    const getBadgeClass = (status: string) => {
        switch (status) {
            case "Available": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            case "Booked": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            case "Occupied": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            default: return "bg-red-500/10 text-red-400 border border-red-500/20";
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155]/60 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Sơ Đồ Phòng</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Trạng thái phòng thực tế & mã khóa thông minh</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg"
                    >
                        <Plus size={14} /> Thêm Phòng
                    </button>
                    <button 
                        onClick={fetchRooms}
                        className="p-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-all border border-[#334155]"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Add Room Form */}
            {showAddForm && (
                <form onSubmit={handleAddRoom} className="mb-6 bg-[#0f172a]/60 border border-[#334155]/80 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="col-span-full font-bold text-white text-xs uppercase tracking-wider mb-1">Cấu hình phòng mới</h3>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Số phòng / Tên phòng</label>
                        <input type="text" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required placeholder="VD: 101, Villa A..." className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Loại phòng</label>
                        <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs">
                            <option value="Standard">Standard</option>
                            <option value="Deluxe">Deluxe</option>
                            <option value="Suite">Suite</option>
                            <option value="Family">Family</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Tầng</label>
                        <input type="number" value={floor} onChange={e => setFloor(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Mã Smart Lock (Tự sinh nếu bỏ trống)</label>
                        <input type="text" value={smartLock} onChange={e => setSmartLock(e.target.value)} placeholder="VD: LOCK101" className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Tiện ích (phân tách bằng dấu phẩy)</label>
                        <input type="text" value={amenities} onChange={e => setAmenities(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Giá cơ bản / Đêm</label>
                        <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-[#334155]">Hủy</button>
                        <button type="submit" disabled={submitting} className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-2 px-4 rounded-xl text-xs transition-colors">{submitting ? "Đang lưu..." : "Xác nhận tạo"}</button>
                    </div>
                </form>
            )}

            {/* Room Map Grid */}
            {loading && rooms.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-xs text-center py-6">{error}</p>
            ) : rooms.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <HelpCircle size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có phòng nào được thiết lập</p>
                    <p className="text-xs mt-1">Vui lòng click "Thêm Phòng" ở góc trên bên phải</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {rooms.map(room => (
                        <div key={room.id} className={`border rounded-2xl p-4 flex flex-col justify-between transition-all group ${getStatusColor(room.status)}`}>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black text-slate-400 bg-[#0f172a]/80 px-2 py-1 rounded-lg border border-[#334155]/40">Tầng {room.floor}</span>
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${getBadgeClass(room.status)}`}>{room.status}</span>
                                </div>
                                <h3 className="text-base font-extrabold text-white group-hover:text-lime-400 transition-colors">Phòng {room.room_number}</h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{room.room_type}</p>
                                
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                        <Key size={12} className="text-lime-400" />
                                        <span className="font-mono font-bold">{room.smart_lock_code}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-normal flex flex-wrap gap-1">
                                        {room.amenities?.map((am, idx) => (
                                            <span key={idx} className="bg-[#1e293b]/80 border border-[#334155]/60 px-1.5 py-0.5 rounded text-slate-400">{am}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-[#334155]/40 flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{formatPrice(room.base_price)}</span>
                                {room.status === "Available" && (
                                    <button 
                                        onClick={() => {
                                            setSelectedRoom(room);
                                            setCheckIn(new Date().toISOString().slice(0, 16));
                                            const tm = new Date();
                                            tm.setDate(tm.getDate() + 1);
                                            setCheckOut(tm.toISOString().slice(0, 16));
                                        }}
                                        className="bg-lime-500/10 hover:bg-lime-500 text-lime-400 hover:text-slate-900 border border-lime-500/20 font-bold px-3 py-1 rounded-xl text-[10px] transition-all"
                                    >
                                        Đặt Phòng
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Booking Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateBooking} className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
                            <h3 className="font-extrabold text-white text-sm">Đặt phòng nhanh: Phòng {selectedRoom.room_number}</h3>
                            <button type="button" onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Tên khách hàng</label>
                                <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="VD: Nguyễn Văn A" className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Số điện thoại</label>
                                <input type="text" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required placeholder="0912..." className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email</label>
                                <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="guest@example.com" className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Check In</label>
                                <input type="datetime-local" value={checkIn} onChange={e => setCheckIn(e.target.value)} required className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Check Out</label>
                                <input type="datetime-local" value={checkOut} onChange={e => setCheckOut(e.target.value)} required className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Tổng cộng (đã nhân đêm)</label>
                                <input type="number" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} required className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Số tiền thanh toán trước</label>
                                <input type="number" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} required className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Ghi chú</label>
                                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu đặc biệt..." className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-lime-500 text-xs" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setSelectedRoom(null)} className="bg-[#0f172a] hover:bg-[#1e293b] text-slate-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs border border-[#334155] transition-colors">Hủy</button>
                            <button type="submit" disabled={submitting} className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold py-2 px-4 rounded-xl text-xs transition-colors">{submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
