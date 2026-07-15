import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Plus, RefreshCw, Home, MapPin, Tag, ShieldCheck, HelpCircle } from "lucide-react";

interface Listing {
    id: string;
    address: string;
    district?: string;
    city?: string;
    type?: string;
    price: number;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    legal_status?: string;
    status: string;
    virtual_tour_url?: string;
    description?: string;
}

export default function ListingList() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [address, setAddress] = useState("");
    const [district, setDistrict] = useState("Đống Đa");
    const [city, setCity] = useState("Hà Nội");
    const [typeField, setTypeField] = useState("CanHo");
    const [price, setPrice] = useState(3000000000);
    const [area, setArea] = useState(70);
    const [bedrooms, setBedrooms] = useState(2);
    const [bathrooms, setBathrooms] = useState(2);
    const [legalStatus, setLegalStatus] = useState("Sổ hồng riêng");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/re/listings");
            setListings(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            setError("Lỗi tải danh sách bất động sản: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) return;
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/re/listings", {
                address,
                district,
                city,
                type: typeField,
                price: Number(price),
                area: Number(area),
                bedrooms: Number(bedrooms),
                bathrooms: Number(bathrooms),
                legal_status: legalStatus,
                description: description || undefined,
            });
            setAddress("");
            setDescription("");
            setShowAddForm(false);
            fetchListings();
        } catch (err: any) {
            alert("Lỗi tạo tin đăng: " + err.message);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available": return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
            case "Sold": return "border-purple-500/20 bg-purple-500/5 text-purple-400";
            default: return "border-slate-500/20 bg-slate-500/5 text-slate-400";
        }
    };

    const translateType = (type?: string) => {
        switch (type) {
            case "CanHo": return "Căn hộ chung cư";
            case "NhaPho": return "Nhà phố";
            case "DatNen": return "Đất nền";
            default: return "Biệt thự";
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155]/60 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Giỏ Hàng Bất Động Sản</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Kho hàng căn hộ, nhà đất, tình trạng pháp lý & giá bán lẻ</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg"
                    >
                        <Plus size={14} /> Ký Gửi Mới
                    </button>
                    <button 
                        onClick={fetchListings}
                        className="p-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-all border border-[#334155]"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Add Listing Form */}
            {showAddForm && (
                <form onSubmit={handleCreateListing} className="mb-6 bg-[#0f172a]/60 border border-[#334155]/80 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="col-span-full font-bold text-white text-xs uppercase tracking-wider mb-1">Đăng ký sản phẩm ký gửi mới</h3>
                    <div className="col-span-full">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Địa chỉ chính xác</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} required placeholder="VD: 123 Đường Láng, Láng Thượng..." className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Quận / Huyện</label>
                        <input type="text" value={district} onChange={e => setDistrict(e.target.value)} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Thành phố</label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Loại hình</label>
                        <select value={typeField} onChange={e => setTypeField(e.target.value)} className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs">
                            <option value="CanHo">Căn hộ</option>
                            <option value="NhaPho">Nhà phố</option>
                            <option value="DatNen">Đất nền</option>
                            <option value="BietThu">Biệt thự</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Giá yêu cầu (VND)</label>
                        <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Diện tích (m2)</label>
                        <input type="number" value={area} onChange={e => setArea(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phòng ngủ</label>
                        <input type="number" value={bedrooms} onChange={e => setBedrooms(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phòng vệ sinh</label>
                        <input type="number" value={bathrooms} onChange={e => setBathrooms(Number(e.target.value))} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Trạng thái pháp lý</label>
                        <input type="text" value={legalStatus} onChange={e => setLegalStatus(e.target.value)} required className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Mô tả chi tiết</label>
                        <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Chi tiết về thiết kế, nội thất, hướng nhà..." className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-purple-500 transition-colors text-xs" />
                    </div>
                    <div className="col-span-full flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-[#334155]">Hủy</button>
                        <button type="submit" disabled={submitting} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors">{submitting ? "Đang lưu..." : "Xác nhận đăng"}</button>
                    </div>
                </form>
            )}

            {/* Listings Grid */}
            {loading && listings.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-xs text-center py-6">{error}</p>
            ) : listings.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <HelpCircle size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có tin bất động sản nào</p>
                    <p className="text-xs mt-1">Vui lòng click "Ký Gửi Mới" để tạo sản phẩm đầu tiên</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                        <div key={listing.id} className="border border-[#334155]/60 hover:border-purple-500/60 bg-[#0f172a]/40 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
                            <div>
                                {/* Premium Card Graphic Cover */}
                                <div className="h-32 w-full bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center relative border-b border-[#334155]/40">
                                    <Home size={36} className="text-purple-400/40 group-hover:scale-110 transition-transform duration-300" />
                                    <span className={`absolute top-3 right-3 text-[9px] font-black border px-2 py-0.5 rounded-full ${getStatusColor(listing.status)}`}>
                                        {listing.status === "Available" ? "Đang chào bán" : "Đã bán / Đóng"}
                                    </span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{translateType(listing.type)}</span>
                                        <h3 className="text-sm font-extrabold text-white group-hover:text-purple-400 transition-colors mt-2 line-clamp-2">{listing.address}</h3>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {listing.district}, {listing.city}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 bg-[#1e293b]/40 rounded-xl p-2 text-center text-[10px] border border-[#334155]/40 font-bold">
                                        <div>
                                            <p className="text-slate-500">Diện tích</p>
                                            <p className="text-slate-200 mt-0.5">{listing.area} m²</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">P.Ngủ</p>
                                            <p className="text-slate-200 mt-0.5">{listing.bedrooms ?? 0} PN</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">P.Tắm</p>
                                            <p className="text-slate-200 mt-0.5">{listing.bathrooms ?? 0} WC</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                                        <ShieldCheck size={12} className="text-emerald-400" />
                                        <span>Pháp lý: {listing.legal_status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-[#334155]/40 bg-[#1e293b]/20 flex items-center justify-between">
                                <span className="text-sm font-black text-purple-400 flex items-center gap-1"><Tag size={12} /> {formatPrice(listing.price)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
