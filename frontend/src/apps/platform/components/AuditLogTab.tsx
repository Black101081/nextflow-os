import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, RefreshCw, Filter, ShieldCheck, AlertTriangle, User, Settings, Trash2, Database, Layers } from 'lucide-react';
import { apiService } from '../../../shared/services/api';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actor_type: 'PLATFORM_ADMIN' | 'TENANT_LEADER' | 'STAFF' | 'SYSTEM';
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ip: string;
  details: string;
}

const ACTOR_COLORS: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  PLATFORM_ADMIN: { color: '#818cf8', bg: 'rgba(99,102,241,0.1)', icon: <Layers size={12} /> },
  TENANT_LEADER:  { color: '#34d399', bg: 'rgba(16,185,129,0.1)', icon: <User size={12} /> },
  STAFF:          { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', icon: <User size={12} /> },
  SYSTEM:         { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Settings size={12} /> },
};

const STATUS_CONFIG = {
  SUCCESS: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', label: 'OK' },
  FAILURE: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', label: 'FAIL' },
  WARNING: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', label: 'WARN' },
};

// Local seed data if API is unavailable
const SEED_EVENTS: AuditEvent[] = [
  { id: 'AUD-001', timestamp: new Date(Date.now() - 60000).toISOString(), actor: 'admin@nextflow.io', actor_type: 'PLATFORM_ADMIN', action: 'TENANT_CREATED', resource: 'tenant/salon_beauty_x', status: 'SUCCESS', ip: '14.169.254.1', details: 'Created new tenant "Salon Beauty X" with Standard plan' },
  { id: 'AUD-002', timestamp: new Date(Date.now() - 180000).toISOString(), actor: 'leader@kiotviet.vn', actor_type: 'TENANT_LEADER', action: 'CONFIG_UPDATED', resource: 'config/auto_scaling', status: 'SUCCESS', ip: '27.72.103.5', details: 'Auto-scaling enabled; min_workers=2, max_workers=8' },
  { id: 'AUD-003', timestamp: new Date(Date.now() - 320000).toISOString(), actor: 'SYSTEM', actor_type: 'SYSTEM', action: 'BLOCKCHAIN_ANCHORED', resource: 'chain/u2u', status: 'SUCCESS', ip: 'internal', details: 'Daily summary anchored to U2U block #4082904' },
  { id: 'AUD-004', timestamp: new Date(Date.now() - 500000).toISOString(), actor: 'staff01@spa.vn', actor_type: 'STAFF', action: 'LOGIN_FAILED', resource: 'auth/login', status: 'FAILURE', ip: '1.52.190.8', details: 'Invalid OTP: 3 consecutive failed attempts. Account locked 10 mins.' },
  { id: 'AUD-005', timestamp: new Date(Date.now() - 720000).toISOString(), actor: 'admin@nextflow.io', actor_type: 'PLATFORM_ADMIN', action: 'TENANT_SUSPENDED', resource: 'tenant/demo_expired', status: 'WARNING', ip: '14.169.254.1', details: 'Tenant suspended due to expired trial period. Data retained 30 days.' },
  { id: 'AUD-006', timestamp: new Date(Date.now() - 900000).toISOString(), actor: 'SYSTEM', actor_type: 'SYSTEM', action: 'WEBHOOK_TRIGGERED', resource: 'webhook/task.completed', status: 'SUCCESS', ip: 'internal', details: '↗ POST https://partner.vn/hook responded 200 OK in 142ms' },
  { id: 'AUD-007', timestamp: new Date(Date.now() - 1200000).toISOString(), actor: 'leader@pharmacy.vn', actor_type: 'TENANT_LEADER', action: 'ENTITY_DELETED', resource: 'entity/KhachHang_v1', status: 'WARNING', ip: '118.68.42.19', details: 'Entity schema v1 deleted. 42 records migrated to v2.' },
  { id: 'AUD-008', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'admin@nextflow.io', actor_type: 'PLATFORM_ADMIN', action: 'QUOTA_UPDATED', resource: 'config/quota', status: 'SUCCESS', ip: '14.169.254.1', details: 'Standard plan: user_limit 10→20, task_limit 1000→2000' },
];

export default function AuditLogTab() {
  const [events, setEvents] = useState<AuditEvent[]>(SEED_EVENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('nf_access_token');
      const res = await fetch('/api/v1/platform/audit-log?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setEvents(data.events || SEED_EVENTS);
    } catch {
      // Keep seed data if API is unavailable — do NOT show error (dev mode)
      setEvents(SEED_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs, refreshCount]);

  const filtered = events.filter(ev => {
    const matchSearch = !searchQuery || 
      ev.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchActor = actorFilter === 'ALL' || ev.actor_type === actorFilter;
    const matchStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    return matchSearch && matchActor && matchStatus;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filterBtnStyle = (active: boolean, color?: string) => ({
    padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: active ? `1px solid ${color || 'rgba(99,102,241,0.6)'}` : '1px solid rgba(255,255,255,0.08)',
    background: active ? (color ? `${color}22` : 'rgba(99,102,241,0.15)') : 'rgba(255,255,255,0.03)',
    color: active ? (color || '#818cf8') : '#64748b',
    transition: 'all 0.15s',
  } as React.CSSProperties);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ScrollText size={22} color="#6366f1" /> Nhật ký Kiểm toán (Audit Log)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Toàn bộ hoạt động của Admin, Leader, Staff và hệ thống đều được ghi lại bất biến.
          </p>
        </div>
        <button
          onClick={() => setRefreshCount(c => c + 1)}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Tổng sự kiện', value: events.length, color: '#818cf8' },
          { label: 'Thành công', value: events.filter(e => e.status === 'SUCCESS').length, color: '#34d399' },
          { label: 'Cảnh báo', value: events.filter(e => e.status === 'WARNING').length, color: '#fbbf24' },
          { label: 'Thất bại', value: events.filter(e => e.status === 'FAILURE').length, color: '#f87171' },
        ].map(stat => (
          <div key={stat.label} className="panel-glass" style={{ padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo actor, action, resource..."
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {/* Actor filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'PLATFORM_ADMIN', 'TENANT_LEADER', 'STAFF', 'SYSTEM'].map(f => (
            <button key={f} onClick={() => setActorFilter(f)} style={filterBtnStyle(actorFilter === f)}>
              {f === 'ALL' ? 'Tất cả' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['ALL', 'SUCCESS', 'WARNING', 'FAILURE'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={filterBtnStyle(statusFilter === f, f === 'SUCCESS' ? '#34d399' : f === 'FAILURE' ? '#f87171' : f === 'WARNING' ? '#fbbf24' : undefined)}>
              {f === 'ALL' ? 'Tất cả' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="panel-glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '160px 1fr 130px 90px 80px', gap: '12px' }}>
          {['Thời gian', 'Actor / Action', 'Resource', 'IP', 'Status'].map(h => (
            <div key={h} style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>

        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '13px' }}>
              Không tìm thấy sự kiện nào khớp với bộ lọc.
            </div>
          ) : (
            filtered.map((ev, i) => {
              const actorCfg = ACTOR_COLORS[ev.actor_type];
              const statusCfg = STATUS_CONFIG[ev.status];
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '160px 1fr 130px 90px 80px', gap: '12px',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    alignItems: 'start',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    {formatTime(ev.timestamp)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, background: actorCfg.bg, color: actorCfg.color, border: `1px solid ${actorCfg.color}33` }}>
                        {actorCfg.icon} {ev.actor_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>{ev.actor}</div>
                    <div style={{ fontSize: '12px', color: '#818cf8', marginTop: '2px', fontWeight: 700 }}>{ev.action}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>{ev.details}</div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8', wordBreak: 'break-all' }}>
                    <code style={{ fontSize: '11px', color: '#60a5fa' }}>{ev.resource}</code>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{ev.ip}</div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}33`, whiteSpace: 'nowrap', alignSelf: 'start' }}>
                    {ev.status === 'SUCCESS' ? <ShieldCheck size={11} /> : ev.status === 'FAILURE' ? <AlertTriangle size={11} /> : <AlertTriangle size={11} />}
                    {statusCfg.label}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
