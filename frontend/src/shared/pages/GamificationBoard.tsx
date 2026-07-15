import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Sparkles, Flame, ShieldCheck, Gift, Bot, ChevronRight, Loader2, ArrowUpRight, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PointTransaction {
  id: string;
  points_change: number;
  reason: string;
  created_at: string;
  tx_hash?: string;
}

interface UserPointsInfo {
  total_points: number;
  current_tier: string;
  transactions: PointTransaction[];
}

interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  total_points: number;
  current_tier: string;
}

const GamificationBoard: React.FC = () => {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  
  const [pointsInfo, setPointsInfo] = useState<UserPointsInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isMinting, setIsMinting] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'ai' | 'blockchain' | 'zalo' }[]>([]);

  const showToast = (message: string, type: 'success' | 'ai' | 'blockchain' | 'zalo') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ptsRes, lbRes] = await Promise.all([
        apiService.getMyPoints(auth),
        apiService.getLeaderboard(auth)
      ]);
      setPointsInfo(ptsRes);
      setLeaderboard(lbRes);
    } catch (err) {
      console.error('Gamification fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'Platinum': return { color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)', bg: 'rgba(192, 132, 252, 0.1)', shadow: '0 0 15px rgba(192, 132, 252, 0.3)' };
      case 'Gold': return { color: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)', bg: 'rgba(251, 191, 36, 0.1)', shadow: '0 0 15px rgba(251, 191, 36, 0.3)' };
      case 'Silver': return { color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)', bg: 'rgba(148, 163, 184, 0.1)', shadow: '0 0 15px rgba(148, 163, 184, 0.3)' };
      default: return { color: '#fb923c', border: 'rgba(251, 146, 60, 0.4)', bg: 'rgba(251, 146, 60, 0.1)', shadow: '0 0 15px rgba(251, 146, 60, 0.3)' };
    }
  };

  const handleMintReward = (itemId: number, price: number, name: string) => {
    if (pointsInfo && pointsInfo.total_points < price) {
      showToast('Không đủ Số dư Token để Đổi Quà', 'zalo'); // use zalo color for error here
      return;
    }
    
    setIsMinting(itemId);
    showToast(`Đang kết nối Web3 Wallet để Mua: ${name}...`, 'blockchain');
    
    setTimeout(async () => {
      try {
        const anchorRes = await apiService.anchorData({ token: localStorage.getItem('token') }, { data: `BUY_${itemId}_${price}`, context: "GAMIFICATION_REWARD" });
        showToast(`Ký Smart Contract thành công! Đã trừ ${price} Token.`, 'success');
        setIsMinting(null);
        // Giả lập trừ điểm cục bộ cho UI
        if (pointsInfo) {
          setPointsInfo({
            ...pointsInfo,
            total_points: pointsInfo.total_points - price,
            transactions: [
              {
                id: Date.now().toString(),
                points_change: -price,
                reason: `Đổi quà: ${name}`,
                created_at: new Date().toISOString(),
                tx_hash: anchorRes.tx_hash
              },
              ...pointsInfo.transactions
            ]
          });
        }
      } catch (err) {
        showToast('Lỗi khi ký Smart Contract', 'error');
        setIsMinting(null);
      }
    }, 1500);
  };

  const getAiInsight = () => {
    const pts = pointsInfo?.total_points || 0;
    if (pts < 500) return "Cố lên! Bạn đang ở nhóm khởi động. Hoàn thành 3 đơn Upsell hôm nay để nhận thêm 150 Token và thăng hạng nhé!";
    if (pts < 1000) return "Sắp đạt mốc Silver! Chuỗi điểm danh đúng giờ của bạn đang rất tốt. Hãy giữ vững phong độ này thêm 2 ngày.";
    return "Bạn đang nằm trong Top Tier! Bí quyết giữ vững ngôi vương là chốt các Hợp đồng lớn. Hãy gọi cho 2 khách hàng VIP hôm nay.";
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 size={48} className="animate-spin text-indigo-500" />
    </div>
  );

  const myTierConfig = getTierConfig(pointsInfo?.current_tier || 'Bronze');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Toast System */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
              style={{
                background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)',
                border: `1px solid ${t.type === 'ai' ? '#a855f7' : t.type === 'blockchain' ? '#f59e0b' : t.type === 'zalo' ? '#ef4444' : '#10b981'}`,
                padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', color: '#fff', maxWidth: '350px'
              }}
            >
              {t.type === 'ai' && <Bot size={20} className="text-purple-400" />}
              {t.type === 'blockchain' && <Flame size={20} className="text-amber-400" />}
              {t.type === 'zalo' && <ShieldCheck size={20} className="text-red-400" />}
              {t.type === 'success' && <CheckCircle size={20} className="text-emerald-400" />}
              <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}>
          <Trophy size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>Gamification & Web3</h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Bảng Vàng Thi Đua & Cửa Hàng NFT Quà Tặng</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Wallet & Rank Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', borderRadius: '24px', padding: '24px', border: `1px solid ${myTierConfig.border}`, boxShadow: myTierConfig.shadow, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: myTierConfig.bg, filter: 'blur(50px)', borderRadius: '50%' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color={myTierConfig.color} /> Ví NF Token
            </h3>
            <span style={{ padding: '6px 12px', background: myTierConfig.bg, color: myTierConfig.color, borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', border: `1px solid ${myTierConfig.border}` }}>
              Rank {pointsInfo?.current_tier || 'Bronze'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <div style={{ fontSize: '56px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>
              {pointsInfo?.total_points || 0}
            </div>
            <div style={{ color: myTierConfig.color, fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>NFTk</div>
          </div>
          
          <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Sparkles size={14} className="text-amber-400" /> Web3 Wallet Connected: 0xU2U...f4A9
          </div>
        </motion.div>

        {/* AI Performance Coach */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} className="text-purple-400" /> AI Coach Insight
          </h3>
          
          <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '16px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.05, transform: 'translate(20%, 20%)' }}>
              <TrendingUp size={120} />
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: 1.6, fontWeight: 500, zIndex: 10 }}>
              "{getAiInsight()}"
            </div>
            
            <div style={{ marginTop: 'auto', zIndex: 10 }}>
              <button style={{ width: '100%', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)' }}
              >
                Nhận Nhiệm vụ Nhanh <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} className="text-emerald-400" /> Smart Contract Log
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }} className="custom-scrollbar">
            {pointsInfo?.transactions.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>Chưa có giao dịch Mint/Burn Token nào.</div>
            ) : (
              pointsInfo?.transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{tx.reason}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>
                      {tx.tx_hash ? `${tx.tx_hash.substring(0, 14)}...` : new Date(tx.created_at).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: tx.points_change >= 0 ? '#10b981' : '#f43f5e' }}>
                    {tx.points_change > 0 ? '+' : ''}{tx.points_change}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* NFT Reward Shop */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: '10%', width: '300px', height: '300px', background: 'rgba(147, 51, 234, 0.1)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gift size={22} className="text-pink-400" /> NFT Reward Shop (Redeem)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { id: 1, name: 'Highlands Coffee 50K', price: 500, img: '☕', desc: 'Voucher E-Gift Code' },
            { id: 2, name: 'Card Điện thoại 100K', price: 1000, img: '📱', desc: 'Mã thẻ nạp trực tiếp' },
            { id: 3, name: 'Half-day Off Paid', price: 5000, img: '🏖️', desc: 'Nghỉ nửa ngày có lương' },
            { id: 4, name: 'Áo thun NextFlow', price: 3000, img: '👕', desc: 'Phiên bản giới hạn' }
          ].map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + idx * 0.1 }}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
              className="reward-card"
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(236, 72, 153, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))' }}>{item.img}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{item.name}</div>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '20px' }}>{item.desc}</div>
              
              <button 
                onClick={() => handleMintReward(item.id, item.price, item.name)}
                disabled={isMinting !== null}
                style={{ marginTop: 'auto', width: '100%', padding: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: isMinting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { if(!isMinting) e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)' }}
                onMouseOut={(e) => { if(!isMinting) e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)' }}
              >
                {isMinting === item.id ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} />}
                {isMinting === item.id ? 'Minting NFT...' : `${item.price} NFTk`}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Global E-Sports Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <Trophy size={20} className="text-amber-400" />
          <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 700 }}>Global Leaderboard (Top 50)</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Rank</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Operator</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Role</th>
                <th style={{ padding: '16px 32px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Net Worth (NFTk)</th>
                <th style={{ padding: '16px 32px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Tier</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang nạp dữ liệu từ chuỗi khối...</td>
                </tr>
              ) : (
                leaderboard.map((u, idx) => {
                  const tCfg = getTierConfig(u.current_tier);
                  const isTop3 = idx < 3;
                  return (
                    <motion.tr 
                      key={u.user_id} 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + idx * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', 
                          background: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : idx === 1 ? 'rgba(148, 163, 184, 0.2)' : idx === 2 ? 'rgba(251, 146, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                          color: idx === 0 ? '#fcd34d' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#fdba74' : '#94a3b8',
                          border: `1px solid ${idx === 0 ? 'rgba(245, 158, 11, 0.5)' : idx === 1 ? 'rgba(148, 163, 184, 0.5)' : idx === 2 ? 'rgba(251, 146, 60, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isTop3 ? `0 0 15px ${idx === 0 ? 'rgba(245,158,11,0.3)' : idx===1 ? 'rgba(148,163,184,0.3)' : 'rgba(251,146,60,0.3)'}` : 'none'
                        }}>
                          {idx + 1}
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {(u.first_name?.[0] || '') + (u.last_name?.[0] || 'U')}
                          </div>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '15px' }}>{u.first_name} {u.last_name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <span style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>{u.total_points}</span>
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                        <span style={{ padding: '6px 16px', background: tCfg.bg, color: tCfg.color, border: `1px solid ${tCfg.border}`, borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {u.current_tier}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default GamificationBoard;
