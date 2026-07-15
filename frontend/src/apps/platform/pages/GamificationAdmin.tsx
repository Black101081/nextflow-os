import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../shared/services/api';
import { Trophy, Star, Award, Gift, ShieldCheck, Users, Link as LinkIcon, Cpu } from 'lucide-react';

interface LeaderEntry {
  user_id: string; first_name: string; last_name: string; role: string;
  total_points: number; current_tier: string;
}

const tierConfig: Record<string, { color: string; bg: string; icon: string; glow: string }> = {
  'Bronze': { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)', icon: '🥉', glow: 'rgba(205, 127, 50, 0.5)' },
  'Silver': { color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.1)', icon: '🥈', glow: 'rgba(226, 232, 240, 0.5)' },
  'Gold': { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: '🥇', glow: 'rgba(251, 191, 36, 0.5)' },
  'Diamond': { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', icon: '💎', glow: 'rgba(56, 189, 248, 0.5)' },
};

const mockBadges = [
  { name: 'Star Employee', points: 100, tier: 'Silver', desc: 'Hoàn thành >20 task trong 1 tuần' },
  { name: 'SLA Flawless', points: 200, tier: 'Gold', desc: '0 vi phạm SLA trong 30 ngày' },
  { name: 'AI Whisperer', points: 50, tier: 'Bronze', desc: 'Sử dụng AI Assistant >50 lần' },
  { name: 'Speed Demon', points: 150, tier: 'Gold', desc: 'Avg handling time < 5 phút' },
  { name: 'Blockchain Hero', points: 300, tier: 'Diamond', desc: 'Xác thực >100 giao dịch on-chain' },
];

export default function GamificationAdmin() {
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardUserId, setAwardUserId] = useState('');
  const [awardPoints, setAwardPoints] = useState(50);
  const [awardReason, setAwardReason] = useState('');
  
  // Animation States
  const [isMinting, setIsMinting] = useState(false);
  const [notification, setNotification] = useState<{message: string, txHash?: string} | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await apiService.getPlatformLeaderboard();
      // MOCK: Ensure we have at least 3 for podium
      const lb = data.leaderboard || [];
      setLeaderboard(lb);
    } catch {
      setLeaderboard([]);
    }
    finally { setLoading(false); }
  };

  const handleAward = async () => {
    if (!awardUserId || !awardReason) return;
    setIsMinting(true);
    
    // Simulate Blockchain Minting Delay (1.5s)
    setTimeout(async () => {
      try {
        await apiService.awardGamificationPoints({
          user_id: awardUserId,
          points_change: awardPoints,
          reason: awardReason,
        });
        
        const anchorRes = await apiService.anchorData(
          { token: localStorage.getItem('token') }, 
          { data: `AWARD_${awardUserId}_${awardPoints}`, context: "GAMIFICATION_ADMIN" }
        );
        
        setNotification({
          message: `SUCCESS! +${awardPoints} POINTS AWARDED`,
          txHash: `${anchorRes.tx_hash.substring(0, 10)}...${anchorRes.tx_hash.substring(anchorRes.tx_hash.length - 6)}`
        });
        setAwardUserId('');
        setAwardReason('');
        loadLeaderboard();
      } catch {
        setNotification({ message: 'FAILED TO MINT POINTS' });
      }
      setIsMinting(false);
      setTimeout(() => setNotification(null), 4000);
    }, 1500);
  };

  const totalPointsIssued = leaderboard.reduce((s, l) => s + l.total_points, 0);
  const activeGamifiers = leaderboard.filter(l => l.total_points > 0).length;

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  // Podium Helper
  const getPodiumStyle = (index: number) => {
    if (index === 0) return { height: '160px', color: '#fbbf24', bg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.2) 0%, rgba(15, 23, 42, 0) 100%)', label: '1ST' };
    if (index === 1) return { height: '120px', color: '#e2e8f0', bg: 'linear-gradient(180deg, rgba(226, 232, 240, 0.2) 0%, rgba(15, 23, 42, 0) 100%)', label: '2ND' };
    if (index === 2) return { height: '90px', color: '#cd7f32', bg: 'linear-gradient(180deg, rgba(205, 127, 50, 0.2) 0%, rgba(15, 23, 42, 0) 100%)', label: '3RD' };
    return { height: '0', color: '', bg: '', label: '' };
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif', perspective: '1000px' }}>
      
      {/* Arcade Notification Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '2px solid #10b981', color: '#fff', padding: '16px 32px', borderRadius: '16px', zIndex: 9999, fontWeight: 800, boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)', textAlign: 'center', backdropFilter: 'blur(10px)' }}
          >
            <div style={{ fontSize: '18px', color: '#34d399', letterSpacing: '2px' }}>{notification.message}</div>
            {notification.txHash && (
              <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <LinkIcon size={12} /> ON-CHAIN HASH: {notification.txHash}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🎮 ARCADE ADMIN & FORGE
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0', fontWeight: 500 }}>
            Hệ thống Gamification, Quản lý Điểm thưởng, và Xếp hạng On-Chain.
          </p>
        </div>
      </div>

      {/* Arcade Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.1)' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', borderRadius: '14px', padding: '14px' }}><Star size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#fcd34d', fontWeight: 800 }}>TOTAL POINTS MINTED</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{totalPointsIssued.toLocaleString()}</div></div>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.1)' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '14px', padding: '14px' }}><Users size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 800 }}>ACTIVE PLAYERS</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{activeGamifiers}</div></div>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.1)' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderRadius: '14px', padding: '14px' }}><Award size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#d8b4fe', fontWeight: 800 }}>BADGE DESIGNS</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{mockBadges.length}</div></div>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.1)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '14px', padding: '14px' }}><ShieldCheck size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 800 }}>SMART CONTRACTS</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>ACTIVE</div></div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Hall of Fame - Leaderboard */}
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 40px 0', fontSize: '20px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', letterSpacing: '2px' }}>
            <Trophy size={24} color="#fbbf24" /> HALL OF FAME
          </h3>

          {/* Top 3 Podium */}
          {!loading && top3.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', height: '240px', marginBottom: '40px' }}>
              {/* Re-order for visual: 2nd, 1st, 3rd */}
              {[top3[1], top3[0], top3[2]].map((entry, idx) => {
                if (!entry) return null;
                const visualIndex = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                const style = getPodiumStyle(visualIndex);
                const tier = tierConfig[entry.current_tier] || tierConfig['Bronze'];
                
                return (
                  <motion.div 
                    key={entry.user_id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '100%', opacity: 1 }}
                    transition={{ duration: 0.8, delay: visualIndex * 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '12px', zIndex: 2 }}>
                      <div style={{ fontSize: '32px', filter: `drop-shadow(0 0 10px ${style.color})`, marginBottom: '8px' }}>{tier.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>{entry.first_name}</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: style.color }}>{entry.total_points}</div>
                    </div>
                    {/* The Block */}
                    <div style={{ 
                      width: '100%', height: style.height, background: style.bg, 
                      borderTop: `2px solid ${style.color}`, borderLeft: `1px solid ${style.color}40`, borderRight: `1px solid ${style.color}40`,
                      borderRadius: '8px 8px 0 0', position: 'relative', display: 'flex', justifyContent: 'center', paddingTop: '16px'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: `${style.color}80` }}>{style.label}</div>
                      {/* Spotlight Effect */}
                      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: `radial-gradient(circle, ${style.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* The Rest of Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {others.map((entry, idx) => {
              const tier = tierConfig[entry.current_tier] || tierConfig['Bronze'];
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  key={entry.user_id} 
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}
                  whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', scale: 1.01 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#64748b', width: '30px' }}>#{idx + 4}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>{entry.first_name} {entry.last_name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{entry.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', textShadow: '0 0 10px rgba(251, 191, 36, 0.3)' }}>{entry.total_points.toLocaleString()} pts</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: tier.bg, color: tier.color, border: `1px solid ${tier.color}30` }}>
                      {tier.icon} {entry.current_tier}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Panel (Award + Badges) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* MINT REWARD CORE */}
          <div style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)' }} />
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={20} color="#34d399" /> MINT REWARD ON-CHAIN
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select className="input-premium" value={awardUserId} onChange={e => setAwardUserId(e.target.value)} style={{ fontSize: '14px', padding: '14px', background: 'rgba(15,23,42,0.8)' }} disabled={isMinting}>
                <option value="">— Select Target Player —</option>
                {leaderboard.map(l => (
                  <option key={l.user_id} value={l.user_id}>{l.first_name} {l.last_name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input className="input-premium" type="number" value={awardPoints} onChange={e => setAwardPoints(Number(e.target.value))} min={1} style={{ width: '120px', fontSize: '16px', fontWeight: 800, color: '#fbbf24', textAlign: 'center', background: 'rgba(15,23,42,0.8)' }} disabled={isMinting} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8' }}>XP POINTS</span>
              </div>
              <input className="input-premium" placeholder="Rationale for Reward..." value={awardReason} onChange={e => setAwardReason(e.target.value)} style={{ fontSize: '14px', padding: '14px', background: 'rgba(15,23,42,0.8)' }} disabled={isMinting} />
              
              <motion.button 
                whileHover={!isMinting && awardUserId && awardReason ? { scale: 1.02, boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' } : {}}
                whileTap={!isMinting && awardUserId && awardReason ? { scale: 0.98 } : {}}
                onClick={handleAward} 
                disabled={!awardUserId || !awardReason || isMinting}
                style={{
                  marginTop: '8px', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '15px', cursor: (awardUserId && awardReason && !isMinting) ? 'pointer' : 'not-allowed',
                  background: isMinting ? '#1e293b' : (awardUserId && awardReason ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#1e293b'),
                  color: isMinting ? '#475569' : (awardUserId && awardReason ? '#fff' : '#475569'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                {isMinting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Cpu size={18} />
                  </motion.div>
                ) : (
                  <Gift size={18} />
                )}
                {isMinting ? 'MINTING TO BLOCKCHAIN...' : 'AUTHORIZE & MINT'}
              </motion.button>
            </div>
          </div>

          {/* 3D BADGE FORGE */}
          <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} color="#c084fc" /> BADGE FORGE (DESIGNS)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {mockBadges.map((badge, i) => {
                const t = tierConfig[badge.tier] || tierConfig['Bronze'];
                return (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5, zIndex: 10, boxShadow: `0 20px 40px ${t.glow}` }}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '16px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', 
                      borderRadius: '16px', border: `1px solid ${t.color}40`,
                      transformStyle: 'preserve-3d', transition: 'all 0.1s ease-out', cursor: 'pointer'
                    }}
                  >
                    <div style={{ transform: 'translateZ(20px)' }}>
                      <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '15px', marginBottom: '4px' }}>{badge.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{badge.desc}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', transform: 'translateZ(30px)' }}>
                      <span style={{ fontWeight: 900, color: '#fbbf24', fontSize: '14px', textShadow: '0 0 10px rgba(251,191,36,0.3)' }}>+{badge.points} XP</span>
                      <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '12px', background: t.bg, color: t.color, fontWeight: 800, border: `1px solid ${t.color}50` }}>
                        {t.icon} {badge.tier}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
