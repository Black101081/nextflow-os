import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Coffee, Plus, ShoppingCart, RefreshCw, Clipboard, CreditCard, ChevronRight, Check } from "lucide-react";

interface MenuItem {
    id: string;
    name: string;
    category: string | null;
    price: number;
    image_url: string | null;
}

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    table_number: string | null;
    source: string;
    items: OrderItem[];
    status: string;
    total_amount: number;
    notes: string | null;
    created_at: string;
}

export default function OrderManagement() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cart state
    const [cart, setCart] = useState<Record<string, number>>({});
    const [tableNumber, setTableNumber] = useState("Bàn 5");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [menuRes, ordersRes] = await Promise.all([
                apiService.get("/api/v1/fb/menu-items"),
                apiService.get("/api/v1/fb/orders")
            ]);
            
            const mItems = Array.isArray(menuRes.data) ? menuRes.data : [];
            const ords = Array.isArray(ordersRes.data) ? ordersRes.data : [];
            
            setMenuItems(mItems);
            setOrders(ords);
        } catch (err: any) {
            setError(err.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addToCart = (itemId: string) => {
        setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const next = { ...prev };
            if (next[itemId] <= 1) {
                delete next[itemId];
            } else {
                next[itemId]--;
            }
            return next;
        });
    };

    const getCartTotal = () => {
        return Object.entries(cart).reduce((total, [id, qty]) => {
            const item = menuItems.find(m => m.id === id);
            return total + (item ? item.price * qty : 0);
        }, 0);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const total = getCartTotal();
        if (total === 0) return alert("Giỏ hàng của bạn đang trống!");

        setSubmitting(true);
        try {
            const itemsPayload = Object.entries(cart).map(([id, qty]) => {
                const item = menuItems.find(m => m.id === id)!;
                return {
                    name: item.name,
                    price: item.price,
                    quantity: qty
                };
            });

            await apiService.post("/api/v1/fb/orders", {
                table_number: tableNumber,
                source: "Table",
                items: itemsPayload,
                total_amount: total,
                notes: notes || null
            });

            setCart({});
            setNotes("");
            await fetchData();
        } catch (err: any) {
            alert(`Lỗi tạo đơn: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left section: Menu selector (7 cols) */}
            <div className="xl:col-span-7 flex flex-col gap-6">
                <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Coffee className="text-emerald-400" size={18} />
                            <h2 className="text-lg font-bold text-white">Thực đơn nhà hàng</h2>
                        </div>
                        <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-[#334155] text-slate-400 hover:text-slate-200">
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    {loading && menuItems.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-sm text-center py-4">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                            {menuItems.map(item => (
                                <div key={item.id} className="bg-[#0f172a]/60 border border-[#334155]/40 rounded-xl p-3 flex gap-3 hover:border-emerald-500/40 transition-all group">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                            F&B
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                                            <span className="text-[10px] text-slate-500 bg-[#1e293b] px-2 py-0.5 rounded-full mt-1 inline-block">{item.category || "Chung"}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-black text-emerald-400">{formatPrice(item.price)}</span>
                                            <button 
                                                onClick={() => addToCart(item.id)}
                                                className="p-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Live orders log list */}
                <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Clipboard className="text-indigo-400" size={18} />
                        <h2 className="text-lg font-bold text-white">Đơn hàng mới tạo</h2>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                        {orders.slice(0, 10).map(order => (
                            <div key={order.id} className="bg-[#0f172a]/40 border border-[#334155]/30 rounded-xl p-3.5 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-200">{order.table_number || "Mang về"}</span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                            order.status === "Received" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                            order.status === "Processing" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                            order.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            "bg-red-500/10 text-red-400 border border-red-500/20"
                                        }`}>{order.status}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 max-w-[280px] truncate">
                                        {Array.isArray(order.items) ? order.items.map((i: any) => `${i.name} x${i.quantity}`).join(", ") : ""}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-slate-300">{formatPrice(order.total_amount)}</span>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <p className="text-slate-500 text-xs text-center py-6">Chưa có đơn hàng nào hôm nay</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right section: Cart and Check-out (5 cols) */}
            <div className="xl:col-span-5">
                <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl sticky top-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ShoppingCart className="text-emerald-400" size={18} />
                        <h2 className="text-lg font-bold text-white">Giỏ hàng thanh toán</h2>
                    </div>

                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Số Bàn / Tên Khách</label>
                            <input 
                                type="text" 
                                value={tableNumber} 
                                onChange={(e) => setTableNumber(e.target.value)} 
                                required
                                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 transition-colors text-sm"
                            />
                        </div>

                        {/* Cart items list */}
                        <div className="border-t border-b border-[#334155]/60 py-4 max-h-[250px] overflow-y-auto space-y-3">
                            {Object.entries(cart).map(([id, qty]) => {
                                const item = menuItems.find(m => m.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex items-center justify-between text-sm">
                                        <div className="flex-1 min-w-0 pr-3">
                                            <p className="font-bold text-slate-300 truncate">{item.name}</p>
                                            <p className="text-[10px] text-slate-500">{formatPrice(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                type="button" 
                                                onClick={() => removeFromCart(id)}
                                                className="w-6 h-6 rounded bg-[#334155] hover:bg-[#475569] flex items-center justify-center text-slate-300 font-bold transition-colors"
                                            >-</button>
                                            <span className="font-bold text-slate-200 w-4 text-center text-xs">{qty}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => addToCart(id)}
                                                className="w-6 h-6 rounded bg-[#334155] hover:bg-[#475569] flex items-center justify-center text-slate-300 font-bold transition-colors"
                                            >+</button>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(cart).length === 0 && (
                                <p className="text-slate-500 text-xs text-center py-6">Chọn món ăn từ thực đơn bên trái</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ghi chú nhà bếp</label>
                            <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)} 
                                rows={2}
                                placeholder="VD: ít cay, nhiều hành, mang nước trước..."
                                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-emerald-500 transition-colors text-sm"
                            />
                        </div>

                        {/* Summary prices */}
                        <div className="bg-[#0f172a]/40 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(getCartTotal())}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Phí dịch vụ:</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#334155]/40">
                                <span>Tổng cộng:</span>
                                <span className="text-emerald-400">{formatPrice(getCartTotal())}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || Object.keys(cart).length === 0}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#1e293b] disabled:text-slate-600 disabled:border-transparent text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                        >
                            <CreditCard size={16} />
                            {submitting ? "Đang gửi đơn..." : "Gửi đơn xuống bếp &rarr;"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
