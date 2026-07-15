import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { User, Flame, Box, Wallet, ShieldCheck, Search, Gift, Loader2, CheckCircle, X } from 'lucide-react';
import { apiService } from '../../../shared/services/api';

interface HomeTabProps {
  walletConnected: boolean;
  nftBalance: number;
  handleConnectWallet: () => void;
  setActiveTab: (tab: 'home' | 'tracking' | 'chat') => void;
  setZnsToast: (toast: {show: boolean, msg: string}) => void;
  setNftBalance: React.Dispatch<React.SetStateAction<number>>;
  branding: { brandName: string; brandLogo: string; primaryColor: string; themeMode: string };
  setBranding: React.Dispatch<React.SetStateAction<{ brandName: string; brandLogo: string; primaryColor: string; themeMode: string }>>;
}

export default function HomeTab({ 
  walletConnected, 
  nftBalance, 
  handleConnectWallet, 
  setActiveTab,
  setZnsToast,
  setNftBalance,
  branding,
  setBranding
}: HomeTabProps) {

  const applyTheme = (themeName: 'indigo' | 'cyberpunk' | 'gold') => {
    let newBranding = {
      brandName: 'NextFlow Spa & Health',
      brandLogo: '🌸',
      primaryColor: 'indigo',
      themeMode: 'dark'
    };
    if (themeName === 'cyberpunk') {
      newBranding = {
        brandName: 'Cyber Spa OS',
        brandLogo: '⚡',
        primaryColor: 'rose',
        themeMode: 'cyberpunk'
      };
    } else if (themeName === 'gold') {
      newBranding = {
        brandName: 'Royal Health Club',
        brandLogo: '👑',
        primaryColor: 'amber',
        themeMode: 'dark'
      };
    }
    localStorage.setItem('tenant_branding_theme', JSON.stringify(newBranding));
    setBranding(newBranding);
    window.dispatchEvent(new Event('storage'));
  };

  // Redeem Voucher State
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(100);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Swap State
  const [swapTarget, setSwapTarget] = useState<'KVP' | 'ZAL' | 'U2U'>('KVP');
  const [swapAmount, setSwapAmount] = useState<number>(100);

  // 3D Card Interaction
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Claim Reward State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimStep, setClaimStep] = useState(0); // 0: Idle, 1: Connecting, 2: Signing, 3: Success
  
  const handleClaim = () => {
    if (!walletConnected) {
      setZnsToast({ show: true, msg: 'Vui lòng kết nối Ví Web3 trước khi nhận quà!' });
      return;
    }
    setIsClaimModalOpen(true);
    setClaimStep(1); // Connecting Node
    
    setTimeout(() => setClaimStep(2), 1500); // Signing Contract
    setTimeout(() => {
      setClaimStep(3); // Success
      setNftBalance(prev => prev + 100);
    }, 3500);
  };

  const handleRedeem = async () => {
    if (nftBalance < redeemPoints) {
      setRedeemError("Số dư điểm Cashback không đủ để thực hiện đổi thưởng.");
      return;
    }
    setIsRedeeming(true);
    setRedeemError(null);

    const pushU2uEvent = (event: any) => {
      const events = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
      events.unshift({
        timestamp: new Date().toISOString(),
        block: Math.floor(4082000 + Math.random() * 10000),
        ...event
      });
      localStorage.setItem('u2u_chain_events', JSON.stringify(events.slice(0, 50)));
    };

    try {
      const auth = { token: localStorage.getItem('token') };
      const res = await apiService.redeemVoucher(auth, redeemPoints);
      setNftBalance(res.data.remaining_points);
      setRedeemedCode(res.data.voucher_code);

      const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      pushU2uEvent({
        type: 'VoucherRedeemed',
        recipient: '0xU2U...f4A9',
        details: `Đổi thưởng Voucher KiotViet POS: -${redeemPoints} NFTk`,
        txHash: `0x${suffix}8a9f...3c2e`
      });
    } catch (err: any) {
      console.error(err);
      setNftBalance(prev => prev - redeemPoints);
      const suffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `KVP-50K-${suffix}`;
      setRedeemedCode(code);

      pushU2uEvent({
        type: 'VoucherRedeemed',
        recipient: '0xU2U...f4A9',
        details: `Đổi thưởng Voucher KiotViet POS: -${redeemPoints} NFTk`,
        txHash: `0x${suffix.substring(0, 6)}8a9f...3c2e`
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black m-0 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>{branding.brandLogo}</span>
            <span>{branding.brandName}</span>
          </h1>
          <div className="text-[13px] text-slate-400 font-medium">Welcome back, Valued Customer</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
          <User size={20} className="text-white" />
        </div>
      </div>

      {/* 3D NFT Card Interactive */}
      <div className="perspective-[1000px]">
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-[220px] flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden preserve-3d cursor-grab active:cursor-grabbing"
        >
          {/* Holo Effect Overlay */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
          />
          
          <div className="flex justify-between items-start translate-z-[30px] relative z-10">
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-widest font-semibold mb-1">Hạng Thành Viên</div>
              <div className="text-xl font-black text-amber-300 flex items-center gap-1.5 drop-shadow-[0_0_10px_rgba(252,211,77,0.5)]">
                <Flame size={20} /> GOLD TIER
              </div>
            </div>
            <Box size={24} className="text-white/50" />
          </div>

          <div className="translate-z-[40px] flex justify-between items-end relative z-10">
            <div>
              <div className="text-[11px] text-slate-400 mb-1 font-semibold">Số dư NFTk (Cashback)</div>
              <div className="text-4xl font-black text-white flex items-end gap-2 leading-none">
                {nftBalance} <span className="text-base text-sky-400 pb-1">NFTk</span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleClaim(); }}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-[0_4px_15px_rgba(56,189,248,0.4)] transition-all active:scale-95"
            >
              Claim Daily
            </button>
          </div>
        </motion.div>
      </div>

      {/* Wallet Connection */}
      {!walletConnected ? (
        <button 
          onClick={handleConnectWallet}
          className="w-full py-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-sky-500/20 transition-all active:scale-[0.98]"
        >
          <Wallet size={18} /> Kết nối Web3 Wallet nhận Cashback
        </button>
      ) : (
        <div className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
          <ShieldCheck size={18} /> Wallet Linked: 0xU2U...f4A9
        </div>
      )}

      {/* Theme Customizer Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <span className="text-base">🎨</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Giao diện Portal (Branding Themes)</div>
            <div className="text-[10px] text-slate-400">Chọn phong cách thương hiệu bạn thích nhất</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Classic Theme */}
          <button 
            onClick={() => applyTheme('indigo')}
            className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              branding.primaryColor === 'indigo' 
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                : 'bg-black/25 border-white/5 text-slate-400 hover:border-white/10'
            }`}
          >
            <span className="text-lg">🌸</span>
            <span>Classic Spa</span>
          </button>

          {/* Cyberpunk Theme */}
          <button 
            onClick={() => applyTheme('cyberpunk')}
            className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              branding.themeMode === 'cyberpunk' 
                ? 'bg-rose-600/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]' 
                : 'bg-black/25 border-white/5 text-slate-400 hover:border-white/10'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span>Cyber Spa</span>
          </button>

          {/* Royal Gold Theme */}
          <button 
            onClick={() => applyTheme('gold')}
            className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              branding.primaryColor === 'amber' && branding.themeMode === 'dark'
                ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                : 'bg-black/25 border-white/5 text-slate-400 hover:border-white/10'
            }`}
          >
            <span className="text-lg">👑</span>
            <span>Royal Club</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveTab('tracking')} 
          className="bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Search size={24} />
          </div>
          <div className="text-sm font-semibold text-slate-200">Tra Đơn Hàng</div>
        </div>
        <div 
          onClick={() => {
            setRedeemedCode(null);
            setRedeemError(null);
            setIsRedeemModalOpen(true);
          }}
          className="bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Gift size={24} />
          </div>
          <div className="text-sm font-semibold text-slate-200">Đổi Thưởng</div>
        </div>
      </div>

      {/* Web3 Claim Modal */}
      <AnimatePresence>
        {isClaimModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-5"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <h3 className="m-0 mb-6 text-lg font-bold text-white">Claim Daily Reward</h3>
                
                <div className="flex flex-col gap-4 text-left">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                    {claimStep === 1 ? <Loader2 size={20} className="animate-spin text-sky-400" /> : <CheckCircle size={20} className="text-emerald-400" />}
                    <span className={`text-sm font-medium ${claimStep >= 1 ? 'text-white' : 'text-slate-500'}`}>Kết nối U2U Network</span>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                    {claimStep < 2 ? <div className="w-5 h-5 rounded-full border-2 border-white/10"></div> : claimStep === 2 ? <Loader2 size={20} className="animate-spin text-purple-400" /> : <CheckCircle size={20} className="text-emerald-400" />}
                    <span className={`text-sm font-medium ${claimStep >= 2 ? 'text-white' : 'text-slate-500'}`}>Ký Smart Contract (Wallet)</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                    {claimStep < 3 ? <div className="w-5 h-5 rounded-full border-2 border-white/10"></div> : <CheckCircle size={20} className="text-emerald-400" />}
                    <span className={`text-sm ${claimStep === 3 ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'}`}>+100 NFTk Đã được Mint!</span>
                  </div>
                </div>

                {claimStep === 3 && (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setIsClaimModalOpen(false)}
                    className="mt-6 w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-[15px] shadow-[0_5px_20px_rgba(56,189,248,0.4)] transition-all"
                  >
                    Tuyệt vời!
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web3 Redeem Modal */}
      <AnimatePresence>
        {isRedeemModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-5"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 relative">
                <button 
                  onClick={() => setIsRedeemModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
                <h3 className="m-0 mb-4 text-lg font-bold text-white text-center">Web3 Loyalty Swap Market</h3>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center mb-6">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Số dư ví của bạn</div>
                  <div className="text-2xl font-black text-amber-400">{nftBalance} NFTk</div>
                </div>

                {!redeemedCode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Đổi sang Tài sản (Swap To)</label>
                      <select 
                        value={swapTarget}
                        onChange={e => setSwapTarget(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none"
                      >
                        <option value="KVP" className="bg-slate-900">KVP (KiotViet Voucher Point - Tỷ lệ 1.5)</option>
                        <option value="ZAL" className="bg-slate-900">ZAL (Zalo Voucher Coin - Tỷ lệ 0.8)</option>
                        <option value="U2U" className="bg-slate-900">U2U (Native Token - Tỷ lệ 0.02)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Số lượng NFTk Swap</label>
                      <input 
                        type="number"
                        value={swapAmount}
                        onChange={e => setSwapAmount(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none"
                      />
                    </div>

                    {/* Output calculation */}
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Giá trị nhận được (Est.):</span>
                        <span className="font-bold text-white">
                          {(swapAmount * (swapTarget === 'KVP' ? 1.5 : swapTarget === 'ZAL' ? 0.8 : 0.02)).toLocaleString()} {swapTarget}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Sự sai lệch (Slippage):</span>
                        <span className="font-bold text-slate-300">0.5%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Phí mạng (Gas fee):</span>
                        {localStorage.getItem('gas_relayer_sponsor') === 'true' ? (
                          <span className="font-bold text-emerald-400">Tài trợ 100% (Free) 🎉</span>
                        ) : (
                          <span className="font-bold text-slate-300">0.002 U2U</span>
                        )}
                      </div>
                    </div>

                    {redeemError && (
                      <p className="text-xs font-semibold text-rose-400 mt-2 text-center">{redeemError}</p>
                    )}

                    <button
                      onClick={async () => {
                        if (nftBalance < swapAmount) {
                          setRedeemError("Số dư điểm Cashback không đủ để thực hiện Swap.");
                          return;
                        }
                        setIsRedeeming(true);
                        setRedeemError(null);
                        
                        setTimeout(() => {
                          const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                          const tx = `0x${suffix}8a9f...3c2e`;
                          setRedeemedCode(`SWAP-SUCCESS-${suffix}`);
                          setNftBalance(prev => prev - swapAmount);

                          // log events
                          const events = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
                          events.unshift({
                            timestamp: new Date().toISOString(),
                            block: Math.floor(4082000 + Math.random() * 10000),
                            type: 'VoucherRedeemed',
                            recipient: '0xU2U...f4A9',
                            details: `Swap thành công: -${swapAmount} NFTk -> +${(swapAmount * (swapTarget === 'KVP' ? 1.5 : swapTarget === 'ZAL' ? 0.8 : 0.02)).toLocaleString()} ${swapTarget}`,
                            txHash: tx
                          });
                          localStorage.setItem('u2u_chain_events', JSON.stringify(events.slice(0, 50)));
                          window.dispatchEvent(new Event('storage'));
                          setIsRedeeming(false);
                        }, 1200);
                      }}
                      disabled={isRedeeming || nftBalance < swapAmount}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-40"
                    >
                      {isRedeeming ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Xác nhận Swap & Ký giao dịch"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={24} />
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">Giao dịch Swap hoàn thành!</p>
                    <div className="p-4 bg-black/50 rounded-2xl border border-white/5 font-mono text-xs tracking-wide font-black text-white select-all">
                      {redeemedCode}
                    </div>
                    <p className="text-xs text-slate-400">Mã chứng nhận giao dịch Swap thành công. Đã cập nhật số dư ví.</p>
                    <button
                      onClick={() => setIsRedeemModalOpen(false)}
                      className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
