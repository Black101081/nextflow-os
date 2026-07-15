import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Webhook, Plus, Trash2, ToggleLeft, ToggleRight, Copy, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

interface WebhookDef {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

const EVENT_TYPES = [
  'task.completed',
  'task.sla_violated',
  'tenant.created',
  'tenant.suspended',
  'invoice.paid',
  'invoice.overdue',
  'nft.minted',
  'nft.burned',
  'workflow.triggered',
  'chat.escalated',
];

const generateSecret = () => `whsec_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;

const STORAGE_KEY = 'platform_webhooks';

const loadWebhooks = (): WebhookDef[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveWebhooks = (webhooks: WebhookDef[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
};

export default function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<WebhookDef[]>(loadWebhooks);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>(['task.completed']);
  const [newSecret, setNewSecret] = useState(generateSecret());
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addWebhook = () => {
    if (!newUrl.trim() || !newUrl.startsWith('http')) return;
    setSubmitting(true);
    setTimeout(() => {
      const created: WebhookDef = {
        id: `wh_${Date.now()}`,
        url: newUrl.trim(),
        events: newEvents,
        secret: newSecret,
        active: true,
        createdAt: new Date().toISOString(),
      };
      const updated = [created, ...webhooks];
      setWebhooks(updated);
      saveWebhooks(updated);
      setIsAdding(false);
      setNewUrl('');
      setNewEvents(['task.completed']);
      setNewSecret(generateSecret());
      setSubmitting(false);
    }, 600);
  };

  const toggleActive = (id: string) => {
    const updated = webhooks.map(w => w.id === id ? { ...w, active: !w.active } : w);
    setWebhooks(updated);
    saveWebhooks(updated);
  };

  const deleteWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    saveWebhooks(updated);
  };

  const copySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEvent = (event: string) => {
    setNewEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Webhook size={22} color="#6366f1" /> Quản lý Webhooks
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Gửi thông báo realtime về sự kiện hệ thống đến các endpoint bên ngoài.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-glow)', border: '1px solid rgba(99,102,241,0.4)', color: '#fff', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s' }}
        >
          <Plus size={16} /> Thêm Webhook
        </button>
      </div>

      {/* Add Webhook Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="panel-glass"
            style={{ border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#818cf8' }}>
              Tạo Webhook mới
            </h3>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                ENDPOINT URL *
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                SỰ KIỆN ĐĂNG KÝ
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EVENT_TYPES.map(ev => (
                  <button
                    key={ev}
                    onClick={() => toggleEvent(ev)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: newEvents.includes(ev) ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                      border: newEvents.includes(ev) ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      color: newEvents.includes(ev) ? '#818cf8' : '#64748b',
                    }}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                WEBHOOK SECRET (HMAC-SHA256)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', fontSize: '12px', wordBreak: 'break-all' }}>
                  {newSecret}
                </code>
                <button onClick={() => setNewSecret(generateSecret())} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>
                  Tạo mới
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsAdding(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Huỷ
              </button>
              <button
                onClick={addWebhook}
                disabled={submitting || !newUrl.trim() || newEvents.length === 0}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {submitting ? 'Đang lưu...' : 'Tạo Webhook'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569', fontSize: '14px' }}>
          <Webhook size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Chưa có Webhook nào được cấu hình.</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#334155' }}>Nhấn "Thêm Webhook" để bắt đầu.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {webhooks.map(wh => (
            <motion.div
              key={wh.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="panel-glass"
              style={{ border: wh.active ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: 700,
                      background: wh.active ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.1)',
                      color: wh.active ? '#34d399' : '#64748b',
                      border: `1px solid ${wh.active ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
                      {wh.active ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{new Date(wh.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <code style={{ fontSize: '13px', color: '#c7d2fe', wordBreak: 'break-all' }}>{wh.url}</code>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                  <button onClick={() => toggleActive(wh.id)} title={wh.active ? 'Tắt' : 'Bật'} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: wh.active ? '#34d399' : '#64748b' }}>
                    {wh.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => deleteWebhook(wh.id)} title="Xóa" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#f87171' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {wh.events.map(ev => (
                  <span key={ev} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {ev}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                <ShieldAlert size={14} color="#f59e0b" />
                <code style={{ flex: 1, fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {wh.secret}
                </code>
                <button onClick={() => copySecret(wh.id, wh.secret)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedId === wh.id ? '#34d399' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                  {copiedId === wh.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copiedId === wh.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
