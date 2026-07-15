import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Package, Clock, CheckCircle, DollarSign, ShieldCheck, MapPin, ScanLine, X } from 'lucide-react';

interface TrackingTabProps {
  trackingId: string;
  setTrackingId: (val: string) => void;
  loading: boolean;
  error: string;
  result: any;
  handleTrackOrder: (id?: string) => void;
  step: number;
  invoice: any;
  paymentTab: 'vietqr' | 'crypto';
  setPaymentTab: (val: 'vietqr' | 'crypto') => void;
  txHash: string;
  setTxHash: (val: string) => void;
  verifying: boolean;
  handleVerifyCrypto: () => void;
}

export default function TrackingTab({
  trackingId, setTrackingId, loading, error, result, handleTrackOrder,
  step, invoice, paymentTab, setPaymentTab, txHash, setTxHash, verifying, handleVerifyCrypto
}: TrackingTabProps) {
  
  const [showScanner, setShowScanner] = useState(false);

  const handleSimulateScan = () => {
    setShowScanner(false);
    setTrackingId('A1B2C3D4-SCAN-OK');
    handleTrackOrder('A1B2C3D4-SCAN-OK');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-5 flex flex-col gap-6">
      
      {/* Search Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold m-0 text-white">Tra cứu & Thanh toán</h2>
          <button 
            onClick={() => setShowScanner(true)}
            className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center cursor-pointer transition-colors hover:bg-pink-500/30 active:scale-95"
          >
            <ScanLine size={18} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleTrackOrder(); }} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={trackingId} 
              onChange={(e) => setTrackingId(e.target.value)} 
              placeholder="Nhập mã vận đơn / dịch vụ..."
              className="w-full py-3.5 pr-4 pl-11 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !trackingId.trim()} 
            className="px-5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 border-none text-white font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Tìm'}
          </button>
        </form>
        {error && <div className="mt-3 text-rose-500 text-sm font-medium">{error}</div>}
      </div>

      {result && (
        <div className="flex flex-col gap-5">
          
          {/* Status Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-base font-bold text-white">{result.title}</div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${step === 1 ? 'text-sky-400 bg-sky-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                {result.status}
              </div>
            </div>
            
            <div className="relative flex justify-between px-2">
              <div className="absolute top-5 left-8 right-8 h-1 bg-white/10 rounded-full z-0 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step === 0 ? '0%' : step === 1 ? '50%' : '100%' }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                />
              </div>
              
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 0 ? 'bg-sky-400 text-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-white/10 text-slate-400'}`}>
                  <Package size={18} strokeWidth={step >= 0 ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] font-semibold ${step >= 0 ? 'text-white' : 'text-slate-500'}`}>Tiếp nhận</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 1 ? 'bg-sky-400 text-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-white/10 text-slate-400'}`}>
                  {step === 1 ? <Loader2 size={18} strokeWidth={2.5} className="animate-spin" /> : <Clock size={18} strokeWidth={step >= 1 ? 2.5 : 2} />}
                </div>
                <span className={`text-[11px] font-semibold ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>Đang xử lý</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 2 ? 'bg-emerald-400 text-slate-900 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-white/10 text-slate-400'}`}>
                  <CheckCircle size={18} strokeWidth={step >= 2 ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] font-semibold ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>Hoàn thành</span>
              </div>
            </div>

            {/* Radar GPS Tracking Map - Show only when IN_PROGRESS */}
            <AnimatePresence>
              {step === 1 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="w-full h-[180px] rounded-2xl bg-slate-900 relative overflow-hidden border border-sky-500/20 shadow-[inset_0_0_40px_rgba(56,189,248,0.1)]">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    
                    {/* Radar Sweep */}
                    <motion.div 
                      animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute top-1/2 left-1/2 -ml-[100px] -mt-[100px] w-[200px] h-[200px] rounded-full border border-sky-500/30"
                    >
                      <div className="w-full h-1/2 absolute top-0 left-0 origin-bottom bg-gradient-to-r from-sky-400/50 to-transparent border-b-2 border-sky-400" />
                    </motion.div>
                    
                    {/* Destination Marker */}
                    <div className="absolute top-[20%] left-[30%] flex flex-col items-center">
                      <MapPin size={24} className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" fill="#10b981" />
                      <span className="text-[10px] font-bold mt-1 text-emerald-400">Bạn</span>
                    </div>

                    {/* Shipper Marker (Moving) */}
                    <motion.div 
                      animate={{ x: [100, 40, -10], y: [100, 30, -5] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-[40%] left-[40%] flex flex-col items-center"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-3 h-3 bg-sky-400 rounded-full shadow-[0_0_15px_#38bdf8]" 
                      />
                      <span className="text-[10px] text-sky-300 mt-1.5 font-bold bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">Shipper</span>
                    </motion.div>
                  </div>
                  <div className="text-center mt-3 text-[13px] text-sky-400 font-bold tracking-wide">
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                      Tài xế đang di chuyển tới địa điểm của bạn...
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Invoice / Hologram Receipt */}
          {invoice && (
            <div className="relative z-10">
              {/* Hologram Overlay if PAID */}
              {invoice.status === 'PAID' && (
                <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 z-[-1] rounded-[20px] animate-[hologramBorder_3s_infinite_linear] bg-[length:200%_auto] opacity-70"></div>
              )}
              
              <div className={`rounded-2xl p-6 backdrop-blur-xl ${invoice.status === 'PAID' ? 'bg-slate-900 border-none shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'bg-white/5 border border-white/10'}`}>
                <h3 className={`m-0 mb-4 text-[15px] flex items-center gap-2 font-bold ${invoice.status === 'PAID' ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {invoice.status === 'PAID' ? <ShieldCheck size={18} /> : <DollarSign size={16} />} 
                  {invoice.status === 'PAID' ? 'Biên lai điện tử Hologram' : 'Thanh toán đơn hàng'}
                </h3>
                
                <div className={`flex justify-between items-center ${invoice.status === 'PAID' ? 'mb-0' : 'mb-6'}`}>
                  <div className={`text-2xl font-black ${invoice.status === 'PAID' ? 'text-white' : 'text-slate-200'}`}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                  </div>
                  
                  {invoice.status === 'PAID' ? (
                    <div className="border-2 border-emerald-500 text-emerald-400 px-2.5 py-1 rounded-md -rotate-6 font-black text-[10px] tracking-widest bg-emerald-500/10 backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      VERIFIED ON CHAIN
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-500 tracking-wide">
                      CHỜ THANH TOÁN
                    </div>
                  )}
                </div>

                {invoice.status !== 'PAID' && (
                  <div>
                    <div className="flex gap-2 mb-5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setPaymentTab('vietqr')} 
                        className={`flex-1 py-2 rounded-lg border-none text-xs font-bold transition-colors ${paymentTab === 'vietqr' ? 'bg-white/10 text-white shadow-sm' : 'bg-transparent text-slate-500'}`}
                      >
                        VietQR
                      </button>
                      <button 
                        onClick={() => setPaymentTab('crypto')} 
                        className={`flex-1 py-2 rounded-lg border-none text-xs font-bold transition-colors ${paymentTab === 'crypto' ? 'bg-sky-500 text-white shadow-sm' : 'bg-transparent text-slate-500'}`}
                      >
                        Web3 Crypto
                      </button>
                    </div>

                    {paymentTab === 'crypto' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                        <div className="text-xs font-medium text-slate-400">Chuyển token (USDT/U2U) tới ví hệ thống:</div>
                        <div className="text-[13px] text-sky-400 bg-sky-500/10 p-3 rounded-xl break-all font-mono border border-sky-500/20">
                          0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input 
                            type="text" 
                            value={txHash} 
                            onChange={e => setTxHash(e.target.value)} 
                            placeholder="Nhập mã TX Hash..." 
                            className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-[13px] font-mono outline-none focus:border-sky-500/50 transition-colors"
                          />
                          <button 
                            onClick={handleVerifyCrypto} 
                            disabled={verifying || !txHash} 
                            className="px-5 rounded-xl bg-sky-500 disabled:bg-slate-700 border-none text-slate-900 font-bold text-[13px] cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            {verifying ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {paymentTab === 'vietqr' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <div className="bg-white p-3 rounded-2xl inline-block mb-3 shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                          <img src={invoice.vietqr_string || 'https://via.placeholder.com/200?text=VietQR'} alt="QR" className="w-[160px] h-[160px] rounded-lg" />
                        </div>
                        <div className="text-xs font-medium text-slate-400">Mở App Ngân hàng quét mã QR để thanh toán</div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[2000] flex flex-col"
          >
            <div className="p-5 flex justify-between items-center relative z-20 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white font-bold tracking-wide">Quét Mã AR</div>
              <button onClick={() => setShowScanner(false)} className="bg-transparent border-none text-white/70 hover:text-white cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              {/* Fake Camera Feed */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&q=80')] bg-center bg-cover opacity-40 blur-sm scale-110"></div>
              <div className="absolute inset-0 bg-black/40"></div>

              {/* AR Viewfinder */}
              <div className="w-[280px] h-[280px] relative z-10">
                {/* 4 Corners */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-pink-500 rounded-tl-xl shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-pink-500 rounded-tr-xl shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-pink-500 rounded-bl-xl shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-pink-500 rounded-br-xl shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                
                {/* Laser Line */}
                <motion.div 
                  animate={{ y: [0, 270, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-0.5 bg-pink-400 absolute top-0 shadow-[0_0_15px_5px_rgba(236,72,153,0.5)]"
                />
              </div>

              <div className="absolute bottom-12 text-center z-10 w-full px-6 flex flex-col items-center">
                <p className="text-white/80 text-sm font-medium mb-6 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Đưa mã vạch/QR vào trong khung ngắm</p>
                <button 
                  onClick={handleSimulateScan} 
                  className="px-8 py-4 rounded-full bg-pink-500 border-none text-white font-bold text-sm cursor-pointer shadow-[0_5px_20px_rgba(236,72,153,0.4)] active:scale-95 transition-all w-full max-w-[300px]"
                >
                  [Mock] Quét Thành công
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes hologramBorder { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      `}</style>
    </motion.div>
  );
}
