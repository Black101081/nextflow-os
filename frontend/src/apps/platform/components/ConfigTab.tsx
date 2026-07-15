import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, BookOpen, Zap } from 'lucide-react';

interface ConfigTabProps {
  configQuota: any;
  setConfigQuota: (c: any) => void;
  storageQuotaGb: number;
  setStorageQuotaGb: (v: number) => void;
  rateLimitPerMin: number;
  setRateLimitPerMin: (v: number) => void;
  enableAiAssist: boolean;
  setEnableAiAssist: (v: boolean) => void;
  enableOmniChat: boolean;
  setEnableOmniChat: (v: boolean) => void;
  alertThresholdPct: number;
  setAlertThresholdPct: (v: number) => void;
  savingConfig: boolean;
  saveConfig: () => void;
  templates: any[];
}

export default function ConfigTab({
  configQuota, setConfigQuota,
  storageQuotaGb, setStorageQuotaGb,
  rateLimitPerMin, setRateLimitPerMin,
  enableAiAssist, setEnableAiAssist,
  enableOmniChat, setEnableOmniChat,
  alertThresholdPct, setAlertThresholdPct,
  savingConfig, saveConfig, templates
}: ConfigTabProps) {

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* Config Limits Form */}
      <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} color="var(--color-warning)" /> Cấu hình Tham số Vận hành (Control Panel)
        </h3>

        {/* Automation Feature */}
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '13px' }}>
              <Zap size={14} /> TỰ ĐỘNG NÂNG CẤP TÀI NGUYÊN (AUTO-SCALING)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Tự động tăng thêm 20% giới hạn nếu đạt 90% (tính thêm phí).</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
            <input type="checkbox" checked={configQuota.auto_backup} onChange={e => setConfigQuota({ ...configQuota, auto_backup: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
            <span onClick={() => setConfigQuota({ ...configQuota, auto_backup: !configQuota.auto_backup })} style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: configQuota.auto_backup ? '#fbbf24' : '#334155', transition: '.4s', borderRadius: '34px' }}>
              <span style={{ position: 'absolute', content: '""', height: '20px', width: '20px', left: configQuota.auto_backup ? '24px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>GÓI STANDARD CO-LIMITS</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN NHÂN VIÊN ({configQuota.standard_user_limit})</label>
                <input type="range" min="5" max="50" value={configQuota.standard_user_limit} onChange={e => setConfigQuota({ ...configQuota, standard_user_limit: parseInt(e.target.value) })} style={{ accentColor: 'var(--color-secondary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN TÁC VỤ / THÁNG ({configQuota.standard_task_limit})</label>
                <input type="range" min="500" max="5000" step="100" value={configQuota.standard_task_limit} onChange={e => setConfigQuota({ ...configQuota, standard_task_limit: parseInt(e.target.value) })} style={{ accentColor: 'var(--color-secondary)' }} />
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>GÓI ENTERPRISE CO-LIMITS</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN NHÂN VIÊN ({configQuota.enterprise_user_limit})</label>
                <input type="range" min="50" max="500" step="10" value={configQuota.enterprise_user_limit} onChange={e => setConfigQuota({ ...configQuota, enterprise_user_limit: parseInt(e.target.value) })} style={{ accentColor: '#c084fc' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN TÁC VỤ / THÁNG ({configQuota.enterprise_task_limit})</label>
                <input type="range" min="5000" max="100000" step="1000" value={configQuota.enterprise_task_limit} onChange={e => setConfigQuota({ ...configQuota, enterprise_task_limit: parseInt(e.target.value) })} style={{ accentColor: '#c084fc' }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>THAM SỐ BLOCKCHAIN & BẢO MẬT</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CHU KỲ ANCHORING LÊN U2U (PHÚT)</label>
                <input type="number" className="input-premium" value={configQuota.blockchain_anchoring_interval_minutes} onChange={e => setConfigQuota({ ...configQuota, blockchain_anchoring_interval_minutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input type="checkbox" id="auto-backup" checked={configQuota.auto_backup} onChange={e => setConfigQuota({ ...configQuota, auto_backup: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                <label htmlFor="auto-backup" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Tự động Backup dữ liệu CSDL hàng ngày</label>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>GIỚI HẠN & ĐO LƯỜNG NGHIỆP VỤ (SME)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HẠN MỨC LƯU TRỮ (GB): {storageQuotaGb} GB</label>
                  <input type="range" min="1" max="100" value={storageQuotaGb} onChange={e => setStorageQuotaGb(parseInt(e.target.value))} style={{ accentColor: '#fbbf24' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RATE LIMIT (REQS/MIN): {rateLimitPerMin} reqs</label>
                  <input type="range" min="10" max="1000" step="10" value={rateLimitPerMin} onChange={e => setRateLimitPerMin(parseInt(e.target.value))} style={{ accentColor: '#fbbf24' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NGƯỠNG CẢNH BÁO TỶ LỆ LỖI (%): {alertThresholdPct}%</label>
                  <input type="range" min="1" max="20" value={alertThresholdPct} onChange={e => setAlertThresholdPct(parseInt(e.target.value))} style={{ accentColor: '#fbbf24' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="enable-ai-assist" checked={enableAiAssist} onChange={e => setEnableAiAssist(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#fbbf24' }} />
                    <label htmlFor="enable-ai-assist" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Kích hoạt AI Assistants & RAG</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="enable-omni-chat" checked={enableOmniChat} onChange={e => setEnableOmniChat(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#fbbf24' }} />
                    <label htmlFor="enable-omni-chat" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Kích hoạt Omni-channel Chat</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <button 
          onClick={saveConfig}
          style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: savingConfig ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}
          disabled={savingConfig}
        >
          {savingConfig ? 'Đang lưu...' : 'Lưu Cấu hình Platform'}
        </button>
      </div>

      {/* Template Packs list */}
      <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--color-primary)" /> Mẫu Giải pháp Khả dụng (Templates)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {templates.map((t: any) => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.border='1px solid rgba(99, 102, 241, 0.5)'} onMouseOut={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.05)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{t.name}</span>
                <span style={{ fontSize: '11px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>{t.industry}</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.description}</p>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                <span>ID: <code>{t.id}</code></span>
                <span>Version: 1.0.0</span>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
              Không tìm thấy Template ngành hàng nào.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
