import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Play, Check, RefreshCw, Clock, ChefHat, AlertCircle } from "lucide-react";

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

export default function KitchenDisplay() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/fb/orders");
            const ords = Array.isArray(res.data) ? res.data : [];
            // Only keep Received (Mới) and Processing (Đang nấu) in kitchen grid
            setOrders(ords.filter((o: any) => o.status === "Received" || o.status === "Processing"));
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách bếp");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        
        // Auto refresh kitchen display every 15 seconds
        const intervalId = setInterval(fetchOrders, 15000);
        // Timer for calculating order wait duration
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(timerId);
        };
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await apiService.put(`/api/v1/fb/orders/${orderId}/status`, { status });
            await fetchOrders();
        } catch (err: any) {
            alert(`Lỗi cập nhật trạng thái: ${err.message}`);
        }
    };

    const getWaitDuration = (createdAtStr: string) => {
        const diffMs = currentTime.getTime() - new Date(createdAtStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return {
            minutes: diffMins,
            seconds: diffSecs,
            label: `${diffMins}p ${diffSecs}s`
        };
    };

    const getSeverityStyles = (mins: number) => {
        if (mins >= 30) {
            return "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse";
        }
        if (mins >= 15) {
            return "bg-amber-500/10 border-amber-500/30 text-amber-400";
        }
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
                        <ChefHat size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Màn hình chuẩn bị (Kitchen Display System)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Thời gian thực tế chuẩn bị món ăn tại quầy bếp</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono bg-[#0f172a] px-3 py-1.5 rounded-lg border border-[#334155]">
                        Cập nhật: {currentTime.toLocaleTimeString()}
                    </span>
                    <button onClick={fetchOrders} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-10">
                    <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 text-slate-500 flex flex-col items-center justify-center gap-2">
                    <ChefHat className="text-slate-700 w-16 h-16" strokeWidth={1} />
                    <p className="font-bold text-sm text-slate-400">Không có đơn hàng nào cần chuẩn bị</p>
                    <p className="text-xs text-slate-600">Đơn hàng mới tạo từ quầy thu ngân sẽ tự động xuất hiện tại đây</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {orders.map(order => {
                        const wait = getWaitDuration(order.created_at);
                        const severityClass = getSeverityStyles(wait.minutes);

                        return (
                            <div 
                                key={order.id} 
                                className={`border rounded-2xl flex flex-col overflow-hidden bg-[#0f172a]/60 shadow-xl transition-all ${
                                    order.status === "Processing" ? "border-indigo-500/40" : "border-[#334155]/60"
                                }`}
                            >
                                {/* Order Header */}
                                <div className="p-4 bg-[#1e293b]/40 border-b border-[#334155]/40 flex items-center justify-between">
                                    <div>
                                        <span className="text-base font-extrabold text-white">{order.table_number || "Mang về"}</span>
                                        <p className="text-[10px] text-slate-500 mt-0.5">ID: #{order.id.slice(0, 8)}</p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold ${severityClass}`}>
                                        <Clock size={12} />
                                        <span>{wait.label}</span>
                                    </div>
                                </div>

                                {/* Order Items list */}
                                <div className="p-4 flex-1 space-y-3 min-h-[120px]">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <div className="flex-1 pr-3">
                                                <p className="text-sm font-bold text-slate-200">{item.name}</p>
                                            </div>
                                            <span className="text-sm font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                    {order.notes && (
                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mt-4">
                                            <p className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">Ghi chú bếp:</p>
                                            <p className="text-xs text-slate-300 mt-1">{order.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                <div className="p-3 bg-[#1e293b]/20 border-t border-[#334155]/30 grid grid-cols-2 gap-3">
                                    {order.status === "Received" ? (
                                        <button 
                                            onClick={() => updateStatus(order.id, "Processing")}
                                            className="col-span-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                        >
                                            <Play size={12} />
                                            Bắt đầu chế biến
                                        </button>
                                    ) : (
                                        <>
                                            <div className="flex items-center text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 justify-center gap-1">
                                                <ChefHat size={12} />
                                                Đang nấu...
                                            </div>
                                            <button 
                                                onClick={() => updateStatus(order.id, "Completed")}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                            >
                                                <Check size={12} />
                                                Hoàn thành
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
