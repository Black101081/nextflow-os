import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { ShoppingBag, Clock, CheckCircle, Package, ArrowRight, Zap, MapPin, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  data: {
    Code: string;
    StatusName: string;
    Total: number;
    CustomerName?: string;
    PurchaseDate?: string;
    BranchName?: string;
  };
}

export default function KiotVietKanban() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  
  // Wallet Balance simulation state
  const [walletBalance, setWalletBalance] = useState(2450000);
  const [addedAmount, setAddedAmount] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [user?.tenant_id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
      const response = await apiService.getEntityRecords(auth, 'kiotviet_order');
      setOrders(Array.isArray(response) ? response : response.records || []);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng KiotViet:", error);
      // Fallback cho UI demo nếu chưa có dữ liệu thật
      setOrders([
        { id: "1", data: { Code: "DH001", StatusName: "Phiếu tạm", Total: 150000, CustomerName: "Nguyễn Văn A" } },
        { id: "2", data: { Code: "DH002", StatusName: "Đang giao dịch", Total: 350000, CustomerName: "Trần Thị B" } },
        { id: "3", data: { Code: "DH003", StatusName: "Hoàn thành", Total: 1200000, CustomerName: "Lê C" } },
        { id: "4", data: { Code: "DH004", StatusName: "Phiếu tạm", Total: 550000, CustomerName: "Vũ Đình K" } },
        { id: "5", data: { Code: "DH005", StatusName: "Đang giao dịch", Total: 850000, CustomerName: "Phạm Minh H" } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'Phiếu tạm', title: 'Đơn Nháp (Tạm)', icon: Clock, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', shadow: 'rgba(251, 191, 36, 0.3)' },
    { id: 'Đang giao dịch', title: 'Đang Xử Lý', icon: Package, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', shadow: 'rgba(56, 189, 248, 0.3)' },
    { id: 'Hoàn thành', title: 'Hoàn Thành', icon: CheckCircle, color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', shadow: 'rgba(52, 211, 153, 0.3)' }
  ];

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedOrderId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Hide the default drag image slightly
    e.dataTransfer.setDragImage(e.target as Element, 20, 20);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedOrderId) return;
    
    setOrders(prev => {
      const order = prev.find(o => o.id === draggedOrderId);
      if (order && order.data.StatusName !== newStatus) {
        // Trigger specific logic for target statuses
        if (newStatus === 'Hoàn thành') {
          // Simulate adding money to wallet
          setAddedAmount(order.data.Total);
          setWalletBalance(b => b + order.data.Total);
          setTimeout(() => setAddedAmount(null), 3000);
        }
        
        return prev.map(o => o.id === draggedOrderId ? { ...o, data: { ...o.data, StatusName: newStatus } } : o);
      }
      return prev;
    });
    setDraggedOrderId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 font-['Outfit']">
      
      {/* Simulation Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide" style={{ textTransform: 'uppercase' }}>
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            KiotViet Logistics Kanban
          </h2>
          <p className="text-slate-400 mt-1 font-medium text-sm">Kéo thả để điều phối đơn hàng và cập nhật hệ thống tự động.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* Wallet Balance Mockup */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-slate-900/80 border border-emerald-500/30 px-4 py-2 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-emerald-500 text-xs font-bold tracking-widest">WALLET:</span>
              <span className="text-emerald-400 text-lg font-black">{formatVND(walletBalance)}</span>
            </div>
            <AnimatePresence>
              {addedAmount && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -30, scale: 1.1 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="absolute right-0 text-emerald-300 font-black text-sm drop-shadow-[0_0_8px_#10b981]"
                >
                  +{formatVND(addedAmount)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              REALTIME SYNC
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map((col) => {
          const columnOrders = orders.filter(o => o.data.StatusName === col.id);
          const ColIcon = col.icon;
          
          return (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative"
              style={{ boxShadow: `inset 0 20px 40px -20px ${col.bg}` }}
            >
              {/* Glow accent */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${col.color}, transparent)` }} />

              {/* Column Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: col.bg, color: col.color, boxShadow: `0 0 15px ${col.shadow}` }}>
                    <ColIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-lg tracking-wide">{col.title}</h3>
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-black" style={{ background: col.bg, color: col.color }}>
                  {columnOrders.length}
                </div>
              </div>
              
              {/* Column Body - Droppable Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40 custom-scrollbar relative">
                <AnimatePresence>
                  {columnOrders.map((order) => {
                    const isDragging = draggedOrderId === order.id;
                    const isProcessing = order.data.StatusName === 'Đang giao dịch';
                    const isCompleted = order.data.StatusName === 'Hoàn thành';

                    return (
                      <motion.div 
                        layout
                        layoutId={order.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, order.id)}
                        onDragEnd={() => setDraggedOrderId(null)}
                        key={order.id}
                        className={`bg-[#121827] border rounded-xl cursor-grab active:cursor-grabbing group overflow-hidden ${isDragging ? 'opacity-50 scale-95' : ''}`}
                        style={{ 
                          borderColor: isCompleted ? 'rgba(52, 211, 153, 0.4)' : isProcessing ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 191, 36, 0.3)',
                          boxShadow: isCompleted ? '0 10px 25px rgba(52, 211, 153, 0.15)' : isProcessing ? '0 10px 25px rgba(56, 189, 248, 0.15)' : '0 10px 25px rgba(0,0,0,0.2)'
                        }}
                      >
                        {/* Glow indicator bar inside card */}
                        <div className="h-1 w-full" style={{ background: isCompleted ? '#34d399' : isProcessing ? '#38bdf8' : '#fbbf24' }} />

                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-black text-white font-mono bg-white/10 px-2.5 py-1 rounded-md tracking-wider">
                              {order.data.Code}
                            </span>
                            <span className="text-base font-black" style={{ color: isCompleted ? '#34d399' : '#fff' }}>
                              {formatVND(order.data.Total)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-inner" style={{ background: `linear-gradient(135deg, ${col.color} 0%, rgba(0,0,0,0.5) 100%)` }}>
                              {order.data.CustomerName ? order.data.CustomerName.split(' ').pop()?.substring(0, 2).toUpperCase() : 'KL'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-100">
                                {order.data.CustomerName || 'Khách lẻ'}
                              </div>
                              <div className="text-xs font-medium text-slate-500 mt-0.5">
                                SĐT: 0984.***.{order.id}82
                              </div>
                            </div>
                          </div>

                          {/* Operational Badges (SLA, Shipping, Payment) */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border" style={{ 
                              background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                              color: isCompleted ? '#10b981' : '#f43f5e',
                              borderColor: isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'
                            }}>
                              {isCompleted ? 'SLA: Đạt (Tốt)' : 'SLA: Còn 45m'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                              {order.data.Total > 500000 ? 'GHTK Hỏa Tốc' : 'Giao Hàng Nhanh'}
                            </span>
                          </div>

                          {/* Interactive Dispatch Simulation when Processing */}
                          {isProcessing && (
                            <div className="mt-2 mb-4 bg-slate-900 rounded-lg p-3 border border-slate-800">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2">
                                <span className="flex items-center gap-1"><MapPin size={10} /> Kho</span>
                                <span className="flex items-center gap-1">Khách <MapPin size={10} /></span>
                              </div>
                              {/* The animated road */}
                              <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  animate={{ x: ['-100%', '300%'] }} 
                                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                  className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" 
                                />
                              </div>
                              <div className="mt-2 flex justify-center text-[#38bdf8]">
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                  <Truck size={14} />
                                </motion.div>
                              </div>
                            </div>
                          )}

                          <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-2">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              {order.data.BranchName || 'Hệ thống AI Hub'}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {columnOrders.length === 0 && (
                  <div className="absolute inset-0 m-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl text-slate-500 bg-slate-900/30">
                    <Package className="w-10 h-10 mb-2 opacity-50" />
                    <span className="font-bold text-sm tracking-wide">DROP ORDER HERE</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
