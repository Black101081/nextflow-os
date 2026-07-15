import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, X, Search, Scan, Flame, ShieldCheck, Zap, Bot, CheckCircle, Package, CreditCard, ChevronRight, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [aiTriage, setAiTriage] = useState<'analyzing' | 'voucher' | 'product' | 'id_card' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'ai' | 'blockchain' | 'zalo' }[]>([]);

  const showToast = (message: string, type: 'success' | 'ai' | 'blockchain' | 'zalo') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    // get cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // default to back camera if available
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    }).catch(err => {
      console.error("Lỗi lấy danh sách camera", err);
    });

    return () => {
      stopScan();
    };
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const startScan = async () => {
    if (!selectedCamera) return;
    setIsScanning(true);
    setScanResult(null);
    setAiTriage(null);
    
    scannerRef.current = new Html5Qrcode("reader");
    
    try {
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // success
          triggerHaptic();
          setScanResult(decodedText);
          stopScan();
          processAiTriage(decodedText);
        },
        (_errorMessage) => {
          // parse error, ignore
        }
      );
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const processAiTriage = (text: string) => {
    setAiTriage('analyzing');
    showToast('Neural Network đang giải mã Data Node...', 'ai');
    setTimeout(() => {
      // Mock logic: classify based on length or prefix
      if (text.startsWith('VC-') || text.length === 10) setAiTriage('voucher');
      else if (text.startsWith('PR-') || text.length === 13) setAiTriage('product');
      else setAiTriage('id_card');
    }, 2000);
  };

  const stopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        setIsScanning(false);
      }).catch(err => console.error(err));
    }
  };

  const handleProcessSmartContract = () => {
    setIsProcessing(true);
    setTimeout(() => {
      triggerHaptic();
      showToast('Thực thi Smart Contract. Trạng thái: BURNED 🔥', 'blockchain');
      setTimeout(() => {
        setIsProcessing(false);
        setScanResult(null);
        setAiTriage(null);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="bg-[#05080F] min-h-[calc(100vh-60px)] flex flex-col relative font-['Outfit'] text-slate-300">
      
      {/* Toast System */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`backdrop-blur-xl border px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${
                t.type === 'ai' ? 'bg-purple-900/60 border-purple-500/50 text-purple-100' : 
                t.type === 'blockchain' ? 'bg-orange-900/60 border-orange-500/50 text-orange-100' : 
                t.type === 'zalo' ? 'bg-blue-900/60 border-blue-500/50 text-blue-100' : 
                'bg-emerald-900/60 border-emerald-500/50 text-emerald-100'
              }`}
            >
              {t.type === 'ai' && <Bot size={20} className="text-purple-400 shrink-0" />}
              {t.type === 'blockchain' && <Flame size={20} className="text-orange-400 shrink-0" />}
              {t.type === 'zalo' && <Zap size={20} className="text-blue-400 shrink-0" />}
              {t.type === 'success' && <CheckCircle size={20} className="text-emerald-400 shrink-0" />}
              <span className="text-xs font-bold leading-relaxed">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-[#05080F] to-transparent">
        <div>
          <h2 className="text-2xl font-black text-white m-0 tracking-widest uppercase flex items-center gap-2">
            <Scan size={24} className="text-purple-500" /> AR HUD
          </h2>
          <p className="text-[10px] text-purple-400/70 font-black tracking-widest mt-1 uppercase">Object Recognition Matrix</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 z-10 pb-32">
        
        {/* State: Idle / Camera Selection */}
        {!isScanning && !scanResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-[50px] opacity-20 rounded-full"></div>
              <div className="w-40 h-40 bg-purple-900/20 border border-purple-500/30 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(168,85,247,0.15)_inset]">
                <QrCode size={64} className="text-purple-400 opacity-80" />
                <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-[spin_10s_linear_infinite]"></div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Sẵn sàng nhận diện</h3>
              <p className="text-sm text-slate-400 max-w-[250px] mx-auto">Chỉa Camera vào Mã vạch, QR Code, Voucher hoặc Căn cước công dân.</p>
            </div>

            <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-xl">
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 flex items-center gap-2">
                <Camera size={12} /> Nguồn thấu kính (Camera)
              </label>
              <div className="relative">
                <select 
                  value={selectedCamera} 
                  onChange={e => setSelectedCamera(e.target.value)}
                  className="w-full bg-[#05080F] border border-slate-700 text-white rounded-xl py-3 px-4 text-sm appearance-none outline-none focus:border-purple-500 transition-colors"
                >
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={16} className="text-slate-500 rotate-90" />
                </div>
              </div>
            </div>
            
            <button 
              onClick={startScan} 
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 border border-purple-400/50 hover:scale-[1.02]"
            >
              <Search size={18} /> Khởi động Ống ngắm
            </button>
          </motion.div>
        )}

        {/* State: AR Scanning Viewport */}
        <div className={`relative flex-1 ${isScanning ? 'block' : 'none'}`}>
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-black shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <div id="reader" className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full border-none"></div>
          </div>
          
          {/* Overlay AR Elements */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Corner brackets */}
              <div className="absolute top-[20%] left-[10%] w-12 h-12 border-t-[4px] border-l-[4px] border-purple-500 rounded-tl-xl shadow-[0_0_15px_#a855f7]"></div>
              <div className="absolute top-[20%] right-[10%] w-12 h-12 border-t-[4px] border-r-[4px] border-purple-500 rounded-tr-xl shadow-[0_0_15px_#a855f7]"></div>
              <div className="absolute bottom-[20%] left-[10%] w-12 h-12 border-b-[4px] border-l-[4px] border-purple-500 rounded-bl-xl shadow-[0_0_15px_#a855f7]"></div>
              <div className="absolute bottom-[20%] right-[10%] w-12 h-12 border-b-[4px] border-r-[4px] border-purple-500 rounded-br-xl shadow-[0_0_15px_#a855f7]"></div>
              
              {/* Scan line */}
              <motion.div 
                className="absolute left-[10%] right-[10%] h-[2px] bg-purple-400 shadow-[0_0_20px_5px_rgba(168,85,247,0.8)]"
                animate={{ top: ['20%', '80%', '20%'] }}
                transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
              />

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {/* Text */}
              <div className="absolute bottom-[10%] left-0 right-0 text-center">
                <span className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-500/30 text-[10px] text-purple-400 font-black tracking-[3px] uppercase">
                  ANALYZING FIELD DATA...
                </span>
              </div>
            </div>
          )}

          {isScanning && (
            <button 
              onClick={stopScan} 
              className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 border border-rose-500/50 hover:bg-rose-500 hover:text-white transition-colors z-30 shadow-[0_0_15px_rgba(244,63,94,0.3)] pointer-events-auto"
            >
              <X size={24} />
            </button>
          )}
        </div>

      </div>

      {/* Holographic Result Bottom Sheet */}
      <AnimatePresence>
        {scanResult && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-[#0A101A]/95 backdrop-blur-3xl border-t border-purple-500/30 p-6 rounded-t-3xl z-50 shadow-[0_-20px_60px_rgba(168,85,247,0.15)]"
          >
            {/* Hologram Card */}
            <div className="bg-gradient-to-b from-purple-900/20 to-[#05080F] border border-purple-500/30 rounded-2xl p-5 mb-6 relative overflow-hidden shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]">
              {/* Glow Blob */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/30 blur-[40px] rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="text-[10px] font-black text-purple-400 tracking-widest uppercase mb-1">Raw Node Data</div>
                  <div className="text-lg text-white font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-slate-800 break-all">{scanResult}</div>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 shrink-0">
                  <QrCode size={20} className="text-purple-400" />
                </div>
              </div>

              {/* AI Triage Section */}
              <div className="border-t border-slate-800 pt-4 relative z-10">
                <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                  <Bot size={12} className="text-purple-400" /> Neural Network Output
                </div>

                {aiTriage === 'analyzing' && (
                  <div className="flex items-center gap-3 text-purple-400 text-sm font-bold bg-purple-900/20 p-3 rounded-xl border border-purple-500/20">
                    <Loader2 size={16} className="animate-spin" /> 
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, yoyo: Infinity }}>
                      Đang phân loại chuỗi dữ liệu...
                    </motion.span>
                  </div>
                )}

                {aiTriage === 'voucher' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400"><CreditCard size={20} /></div>
                    <div>
                      <div className="text-orange-400 font-bold text-sm">Voucher Giảm 20% Hợp Lệ</div>
                      <div className="text-slate-400 text-xs mt-0.5">Mã chưa sử dụng. Có thể áp dụng ngay.</div>
                    </div>
                  </motion.div>
                )}

                {aiTriage === 'product' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><Package size={20} /></div>
                    <div>
                      <div className="text-blue-400 font-bold text-sm">Sản phẩm Kho KiotViet</div>
                      <div className="text-slate-400 text-xs mt-0.5">Tồn kho: 45 đơn vị • Vị trí: Kệ A2</div>
                    </div>
                  </motion.div>
                )}

                {aiTriage === 'id_card' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400"><ShieldCheck size={20} /></div>
                    <div>
                      <div className="text-emerald-400 font-bold text-sm">ID Card Khách Hàng</div>
                      <div className="text-slate-400 text-xs mt-0.5">Đã xác thực định danh KYC. Hạng thẻ: Gold.</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={() => { setScanResult(null); setAiTriage(null); }} 
                disabled={isProcessing}
                className="w-14 h-14 rounded-2xl bg-[#05080F] border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors shrink-0 disabled:opacity-50"
              >
                <X size={20} />
              </button>
              
              <button 
                onClick={handleProcessSmartContract}
                disabled={aiTriage === 'analyzing' || isProcessing}
                className={`flex-1 rounded-2xl flex items-center justify-center gap-2 font-black tracking-widest uppercase transition-all overflow-hidden relative ${
                  (aiTriage === 'analyzing' || isProcessing) 
                    ? 'bg-[#05080F] border border-slate-800 text-slate-600' 
                    : aiTriage === 'voucher' 
                    ? 'bg-orange-500 hover:bg-orange-600 border border-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                    : aiTriage === 'product'
                    ? 'bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                    : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isProcessing && (
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                {isProcessing ? <Loader2 size={20} className="animate-spin relative z-10" /> : <ChevronRight size={20} className="relative z-10" />}
                <span className="relative z-10">
                  {isProcessing ? 'BURN S.CONTRACT...' : 'XỬ LÝ DỮ LIỆU'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
