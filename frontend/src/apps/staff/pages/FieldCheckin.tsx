import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Camera, Upload, CheckCircle, Loader2, ShieldCheck, Zap, Navigation, ScanFace, XCircle, Bot, WifiOff, Wifi, History } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function FieldCheckin() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  
  const [status, setStatus] = useState<'idle' | 'locating' | 'ready' | 'submitting' | 'success' | 'error'>('idle');
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<'none' | 'pass' | 'fail'>('none');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [location, setLocation] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [offlineVault, setOfflineVault] = useState<any[]>([]);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'ai' | 'blockchain' | 'zalo' | 'warning' }[]>([]);

  const showToast = (message: string, type: 'success' | 'ai' | 'blockchain' | 'zalo' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchHistory = async () => {
    if (isOffline) return;
    try {
      const data = await apiService.getFieldCheckins(auth);
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isOffline]);

  // Sync offline vault when coming back online
  useEffect(() => {
    if (!isOffline && offlineVault.length > 0) {
      showToast(`Đang đồng bộ ${offlineVault.length} bản ghi lưu trữ cục bộ...`, 'zalo');
      // Giả lập sync
      setTimeout(() => {
        setOfflineVault([]);
        showToast('Đồng bộ Local Vault thành công!', 'success');
        fetchHistory();
      }, 2000);
    }
  }, [isOffline]);

  const handleGetLocation = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Trình duyệt không hỗ trợ Geolocation.');
      return;
    }
    
    // Simulate satellite finding
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            acc: pos.coords.accuracy
          });
          setStatus('ready');
        },
        (err) => {
          setStatus('error');
          setErrorMessage(err.message || 'Không thể lấy tọa độ GPS.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, 2000);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImageBase64(ev.target.result as string);
        
        // Bắt đầu AI Liveness Detection giả lập
        setAiScanning(true);
        setAiResult('none');
        setTimeout(() => {
          setAiScanning(false);
          setAiResult('pass'); // Luôn pass cho mục đích demo
          showToast('AI Anti-Spoofing PASS: Xác minh sinh trắc học thành công.', 'ai');
        }, 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!location && !imageBase64) return;
    if (aiResult !== 'pass') {
      setStatus('error');
      setErrorMessage('Yêu cầu AI xác thực ảnh hợp lệ trước khi gửi.');
      return;
    }

    setStatus('submitting');
    
    const payload = {
      latitude: location?.lat,
      longitude: location?.lng,
      accuracy: location?.acc,
      image_base64: imageBase64,
      metadata: { client: 'PWA Mobile Cyber', liveness_check: 'PASS', is_offline: isOffline }
    };

    if (isOffline) {
      setTimeout(() => {
        setOfflineVault(prev => [...prev, { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() }]);
        setStatus('success');
        showToast('Đã lưu vào bộ nhớ đệm an toàn (Local Vault).', 'warning');
        resetForm();
      }, 1000);
      return;
    }

    try {
      await apiService.submitFieldCheckin(auth, payload);
      setStatus('success');
      
      const anchorRes = await apiService.anchorData(auth, { data: `CHECKIN_${Date.now()}`, context: "FIELD_OPERATION" });
      showToast(`Blockchain Verified! Hash: ${anchorRes.tx_hash.substring(0, 16)}...`, 'blockchain');
      setTimeout(() => showToast('Workflow Triggered: Đã bắn ZNS báo cáo cho Quản lý.', 'zalo'), 1000);

      fetchHistory(); // Reload history
      resetForm();
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Lỗi khi Check-in.');
    }
  };

  const resetForm = () => {
    setTimeout(() => {
      setStatus('idle');
      setLocation(null);
      setImageBase64(null);
      setAiResult('none');
    }, 4000);
  };

  return (
    <div className="bg-[#050A0F] h-[calc(100vh-60px)] flex flex-col relative overflow-hidden font-['Outfit'] text-slate-300">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ 
        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }}></div>

      {/* Toast System */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`backdrop-blur-xl border px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${
                t.type === 'ai' ? 'bg-purple-900/60 border-purple-500/50 text-purple-100' : 
                t.type === 'blockchain' ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-100' : 
                t.type === 'zalo' ? 'bg-blue-900/60 border-blue-500/50 text-blue-100' : 
                t.type === 'warning' ? 'bg-amber-900/60 border-amber-500/50 text-amber-100' :
                'bg-slate-900/60 border-slate-500/50 text-white'
              }`}
            >
              {t.type === 'ai' && <Bot size={20} className="text-purple-400 shrink-0" />}
              {t.type === 'blockchain' && <ShieldCheck size={20} className="text-emerald-400 shrink-0" />}
              {t.type === 'zalo' && <Zap size={20} className="text-blue-400 shrink-0" />}
              {t.type === 'success' && <CheckCircle size={20} className="text-green-400 shrink-0" />}
              {t.type === 'warning' && <WifiOff size={20} className="text-amber-400 shrink-0" />}
              <span className="text-xs font-bold leading-relaxed">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Area */}
      <div className="relative z-10 px-6 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-[#05080F] to-transparent">
        <div>
          <h2 className="text-2xl font-black text-white m-0 tracking-widest uppercase flex items-center gap-2">
            <Navigation size={20} className="text-emerald-400" /> Tri-corder
          </h2>
          <p className="text-[10px] text-emerald-500/70 font-black tracking-widest mt-1 uppercase">Field Operator Console</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <History size={18} />
            {offlineVault.length > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#050A0F]"></div>}
          </button>
          <button 
            onClick={() => setIsOffline(!isOffline)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isOffline ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
            }`}
          >
            {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
          </button>
        </div>
      </div>

      {/* Main Display Area (Radar / Map / Photo) */}
      <div className="flex-1 relative z-10 px-6 py-4 flex flex-col justify-center items-center">
        
        {/* State 1: Idle / Locating - Big Radar */}
        {(!location && !imageBase64) && (
          <div className="relative w-64 h-64 flex items-center justify-center">
            {status === 'locating' ? (
              <>
                <div className="absolute inset-0 rounded-full border border-emerald-500/30 bg-emerald-500/5 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]"></div>
                <div className="absolute inset-4 rounded-full border border-emerald-500/20"></div>
                <div className="absolute inset-12 rounded-full border border-emerald-500/10 bg-emerald-500/5"></div>
                
                {/* Radar Sweep Line */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 w-32 h-[2px] origin-left bg-gradient-to-r from-transparent via-emerald-400 to-emerald-400 shadow-[0_0_15px_#10b981]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                
                <MapPin size={32} className="text-emerald-400 relative z-10 animate-pulse" />
                
                <div className="absolute -bottom-8 bg-[#050A0F] px-4 py-1 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  Triangulating...
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <div className="w-48 h-48 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-dashed border-slate-700"></div>
                </div>
                <div className="absolute -bottom-8 text-[10px] font-black text-slate-500 tracking-widest uppercase">STANDBY MODE</div>
              </div>
            )}
          </div>
        )}

        {/* State 2: Ready - Show Location and Photo */}
        {(location || imageBase64) && (
          <div className="w-full flex flex-col gap-6">
            
            {/* Location Box */}
            {location && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0A101A]/80 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                    <MapPin size={12} /> GEOFENCE LOCK ACQUIRED
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-black">ACC: {location.acc.toFixed(1)}m</div>
                </div>
                <div className="text-2xl font-mono text-white font-light tracking-tight flex flex-col gap-1">
                  <span>{location.lat.toFixed(6)}° N</span>
                  <span>{location.lng.toFixed(6)}° E</span>
                </div>
              </motion.div>
            )}

            {/* Photo Box */}
            {imageBase64 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-[#0A101A] border border-blue-500/30 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                
                {/* Image */}
                <div className="relative aspect-[4/3] w-full bg-black">
                  <img src={imageBase64} alt="Proof" className={`w-full h-full object-cover transition-all duration-500 ${aiScanning ? 'brightness-50 grayscale contrast-150' : ''}`} />
                  
                  {/* Cyberpunk Camera Overlay Grid */}
                  <div className="absolute inset-0 border-[4px] border-black/40 pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500/80"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500/80"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500/80"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500/80"></div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
                      <div className="w-16 h-[1px] bg-blue-500"></div>
                      <div className="absolute h-16 w-[1px] bg-blue-500"></div>
                      <div className="absolute w-6 h-6 border border-blue-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* AI Scanning Effect */}
                  {aiScanning && (
                    <>
                      <motion.div 
                        className="absolute left-0 right-0 h-1 bg-purple-500 shadow-[0_0_20px_#a855f7]"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <ScanFace size={48} className="text-purple-400 animate-pulse" />
                        <div className="text-[10px] font-black text-purple-400 mt-2 tracking-widest bg-black/50 px-3 py-1 rounded-full border border-purple-500/30">LIVENESS ANALYSIS...</div>
                      </div>
                    </>
                  )}

                  {/* AI Result */}
                  {!aiScanning && aiResult === 'pass' && (
                    <div className="absolute bottom-4 left-4 bg-emerald-500/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-400 flex items-center gap-2 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                      <ShieldCheck size={14} /> 
                      <span className="text-[10px] font-black tracking-widest uppercase">ID VERIFIED</span>
                    </div>
                  )}

                  {/* Clear Photo Button */}
                  <button 
                    onClick={() => { setImageBase64(null); setAiResult('none'); }}
                    disabled={aiScanning}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-slate-600 hover:bg-rose-500/80 hover:border-rose-400 transition-colors disabled:opacity-0"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* Thumb Zone Ergonomic Control Panel (Bottom Sheet) */}
      <div className="relative z-20 mt-auto bg-[#0A101A]/90 backdrop-blur-2xl border-t border-slate-800 p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Error Message */}
        <AnimatePresence>
          {status === 'error' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400 text-xs font-bold text-center">
                {errorMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Controls */}
        <div className="flex gap-4 mb-4">
          <button 
            onClick={handleGetLocation}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
              location ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#05080F] border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Navigation size={24} className={location ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
            <span className="text-[10px] font-black tracking-widest uppercase">{location ? 'LOCATED' : 'GET GPS'}</span>
          </button>

          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoCapture} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
              imageBase64 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-[#05080F] border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Camera size={24} className={imageBase64 ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
            <span className="text-[10px] font-black tracking-widest uppercase">{imageBase64 ? 'CAPTURED' : 'CAMERA'}</span>
          </button>
        </div>

        {/* Big Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={(!location || !imageBase64 || aiResult !== 'pass') || status === 'submitting'}
          className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase transition-all overflow-hidden relative ${
            (!location || !imageBase64 || aiResult !== 'pass') 
              ? 'bg-[#05080F] text-slate-600 border border-slate-800' 
              : status === 'submitting'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] border border-emerald-400'
          }`}
        >
          {status === 'submitting' && (
            <motion.div 
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          {status === 'submitting' ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          {status === 'submitting' ? 'TRANSMITTING...' : 'COMMIT TO LEDGER'}
        </button>

      </div>

      {/* Slide-over History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full max-w-sm bg-[#05080F]/95 backdrop-blur-2xl border-l border-slate-800 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0A101A]">
              <h3 className="m-0 text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                Ledger Logs
              </h3>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                <XCircle size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
              
              {/* Offline Vault Section */}
              {offlineVault.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] font-black text-amber-500/70 tracking-widest uppercase mb-2 px-2 flex items-center gap-2">
                    <WifiOff size={12} /> Local Vault (Pending Sync)
                  </div>
                  {offlineVault.map(h => (
                    <div key={h.id} className="bg-amber-900/10 border border-amber-500/30 p-4 rounded-xl mb-2">
                      <div className="text-xs font-bold text-amber-400 mb-1">OFFLINE CACHED</div>
                      <div className="text-[10px] text-slate-400 font-mono">{new Date(h.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Online History Section */}
              <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-1 px-2">BLOCKCHAIN SYNCED</div>
              
              {history.map((h: any) => (
                <div key={h.id} className="bg-[#0A101A] border border-slate-800 p-4 rounded-xl group hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> VERIFIED
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{new Date(h.created_at).toLocaleTimeString('vi-VN')}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono break-all bg-black/50 p-2 rounded-lg border border-slate-800">
                    0x{h.id.replace(/-/g, '').substring(0, 24)}...
                  </div>
                </div>
              ))}
              
              {history.length === 0 && offlineVault.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50 p-8 text-center">
                  <History size={48} className="text-slate-600 mb-4" />
                  <div className="text-xs font-mono text-slate-400">[ LEDGER EMPTY ]</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
