import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../shared/services/api';
import { Users, Search, Lock, Unlock, UserCog, Fingerprint, Cpu, Shield, Activity, X } from 'lucide-react';

interface PlatformUser {
  id: string; first_name: string; last_name: string; email: string; role: string;
  tenant_name?: string; tenant_id?: string; is_active?: boolean; created_at?: string;
  ai_risk_score?: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // MFA Overlay State
  const [mfaOverlay, setMfaOverlay] = useState<{ isOpen: boolean; userId: string | null; action: 'LOCK' | 'UNLOCK' | null; status: 'SCANNING' | 'ANCHORING' | 'SUCCESS' }>({ isOpen: false, userId: null, action: null, status: 'SCANNING' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPlatformUsers();
      // Add mock AI risk score if not exists
      const enriched = (data || []).map((u: any) => ({
        ...u,
        ai_risk_score: u.ai_risk_score ?? 0
      }));
      setUsers(enriched);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = search === '' || 
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.tenant_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleActionClick = (id: string, currentStatus: boolean) => {
    setMfaOverlay({ isOpen: true, userId: id, action: currentStatus ? 'LOCK' : 'UNLOCK', status: 'SCANNING' });
    
    // Simulate MFA & Blockchain Process
    setTimeout(() => {
      setMfaOverlay(prev => ({ ...prev, status: 'ANCHORING' }));
      setTimeout(() => {
        setMfaOverlay(prev => ({ ...prev, status: 'SUCCESS' }));
        setTimeout(() => {
          // Actual state update
          setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
          setMfaOverlay(prev => ({ ...prev, isOpen: false }));
        }, 1000);
      }, 1500);
    }, 1500);
  };

  const totalActive = users.filter(u => u.is_active).length;
  const totalLocked = users.filter(u => !u.is_active).length;
  const adminUsers = users.filter(u => u.role === 'SME_ADMIN' || u.role === 'PLATFORM_ADMIN').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif', position: 'relative' }}>
      
      {/* MFA / Blockchain Override Overlay */}
      <AnimatePresence>
        {mfaOverlay.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 1) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '24px', padding: '40px', width: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Shield color="#38bdf8" /> SECURITY OVERRIDE
              </h2>
              
              <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mfaOverlay.status === 'SCANNING' && (
                  <>
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', inset: 0, border: '2px solid rgba(56, 189, 248, 0.5)', borderRadius: '50%' }} />
                    <Fingerprint size={50} color="#38bdf8" />
                  </>
                )}
                {mfaOverlay.status === 'ANCHORING' && (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} style={{ position: 'absolute', inset: 0, border: '2px dashed #a855f7', borderRadius: '50%' }} />
                    <Cpu size={50} color="#a855f7" />
                  </>
                )}
                {mfaOverlay.status === 'SUCCESS' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '20px', borderRadius: '50%', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
                    <Unlock size={50} color="#34d399" />
                  </motion.div>
                )}
              </div>

              <div style={{ fontSize: '15px', fontWeight: 700, color: mfaOverlay.status === 'SUCCESS' ? '#34d399' : '#cbd5e1' }}>
                {mfaOverlay.status === 'SCANNING' && 'Verifying Admin MFA Identity...'}
                {mfaOverlay.status === 'ANCHORING' && 'Anchoring Status to Blockchain...'}
                {mfaOverlay.status === 'SUCCESS' && `User ${mfaOverlay.action === 'LOCK' ? 'Locked' : 'Unlocked'} Successfully!`}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Fingerprint size={28} color="#38bdf8" /> Identity Command Terminal
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0' }}>
          Trạm kiểm soát danh tính tối cao: Quản trị User, phân tích AI Risk Score và kiểm soát quyền hạn bằng MFA & Blockchain.
        </p>
      </div>

      {/* Identity Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.2)' }}><Users size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#7dd3fc', fontWeight: 800, letterSpacing: '0.05em' }}>TOTAL IDENTITIES</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{users.length}</div></div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at right, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' }} />
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.2)' }}><Activity size={24} /></div>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', display: 'inline-block' }} /> ACTIVE
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{totalActive}</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(239, 68, 68, 0.2)' }}><Lock size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#fca5a5', fontWeight: 800, letterSpacing: '0.05em' }}>LOCKED NODES</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{totalLocked}</div></div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(168, 85, 247, 0.2)' }}><UserCog size={24} /></div>
          <div><div style={{ fontSize: '11px', color: '#d8b4fe', fontWeight: 800, letterSpacing: '0.05em' }}>SYSTEM ADMINS</div><div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{adminUsers}</div></div>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            placeholder="Scan Identity by Name, Email or Tenant..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', fontSize: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)} 
          style={{ minWidth: '180px', fontSize: '14px', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">All Roles Matrix</option>
          <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
          <option value="SME_ADMIN">SME_ADMIN</option>
          <option value="SME_OPERATOR">SME_OPERATOR</option>
          <option value="SME_USER">SME_USER</option>
        </select>
      </div>

      {/* Users Matrix Table */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>IDENTITY</th>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>ROLE MATRIX</th>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>TENANT DOMAIN</th>
              <th style={{ padding: '16px 12px', fontWeight: 600, width: '150px' }}>AI RISK SCORE</th>
              <th style={{ padding: '16px 12px', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'right' }}>OVERRIDE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, idx) => {
              const risk = u.ai_risk_score || 0;
              const riskColor = risk > 70 ? '#ef4444' : risk > 40 ? '#f59e0b' : '#10b981';
              
              return (
                <motion.tr 
                  key={u.id} 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{u.first_name} {u.last_name}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Fingerprint size={12} /> {u.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                      background: u.role.includes('ADMIN') ? 'linear-gradient(90deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))' : 'linear-gradient(90deg, rgba(56,189,248,0.2), rgba(56,189,248,0.05))',
                      color: u.role.includes('ADMIN') ? '#d8b4fe' : '#7dd3fc',
                      borderLeft: `2px solid ${u.role.includes('ADMIN') ? '#a855f7' : '#38bdf8'}`,
                      letterSpacing: '0.05em'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                      {u.tenant_name || 'SYSTEM CORE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${risk}%`, background: riskColor, boxShadow: `0 0 10px ${riskColor}` }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: riskColor }}>{risk}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px',
                      color: u.is_active ? '#34d399' : '#f87171' 
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.is_active ? '#34d399' : '#f87171', boxShadow: `0 0 8px ${u.is_active ? '#34d399' : '#f87171'}` }} />
                      {u.is_active ? 'ACTIVE' : 'LOCKED'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleToggleActionClick(u.id, !!u.is_active)}
                      style={{ 
                        padding: '6px 12px', fontSize: '12px', background: u.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        color: u.is_active ? '#fca5a5' : '#6ee7b7', border: `1px solid ${u.is_active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, 
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' 
                      }}
                      onMouseOver={(e) => e.currentTarget.style.boxShadow = `0 0 15px ${u.is_active ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`}
                      onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      {u.is_active ? <><Lock size={14} /> Lock Node</> : <><Unlock size={14} /> Unlock</>}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No identity found in the matrix.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
