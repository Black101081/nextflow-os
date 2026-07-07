import React, { useState } from 'react';
import { Webhook, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function IntegrationHub() {
  const [endpoints, setEndpoints] = useState([
    { id: '1', url: 'https://hook.make.com/xyz123', events: ['WORK_ITEM_COMPLETED', 'INVOICE_PAID'], is_active: true }
  ]);
  const [newUrl, setNewUrl] = useState('');
  
  const handleAdd = () => {
    if (!newUrl) return;
    setEndpoints([...endpoints, { id: Date.now().toString(), url: newUrl, events: ['*'], is_active: true }]);
    setNewUrl('');
  };

  return (
    <div style={{ padding: '24px', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Webhook size={28} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Webhooks & Integrations</h2>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
        Tích hợp NextFlow OS với các ứng dụng bên ngoài (Zalo, Telegram, Kế toán, Zapier). Khi có sự kiện xảy ra, hệ thống sẽ tự động bắn dữ liệu qua Webhook tới các địa chỉ dưới đây.
      </p>

      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Thêm Webhook mới</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="https://your-domain.com/webhook"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
          />
          <button onClick={handleAdd} style={{ padding: '0 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Plus size={16} /> Thêm
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Các Webhook đang hoạt động</h3>
        {endpoints.map(ep => (
          <div key={ep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{ep.url}</span>
                {ep.is_active && <CheckCircle size={14} color="#10b981" />}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px' }}>
                {ep.events.map(ev => (
                  <span key={ev} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px' }}>{ev}</span>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setEndpoints(endpoints.filter(e => e.id !== ep.id))}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
