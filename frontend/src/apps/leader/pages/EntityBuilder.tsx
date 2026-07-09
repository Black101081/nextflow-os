import { useState } from 'react';
import { Database, Save, CheckCircle, Code } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';

export default function EntityBuilder() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  
  const [systemName, setSystemName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [schemaJson, setSchemaJson] = useState('{\n  "type": "object",\n  "properties": {\n    "name": {\n      "type": "string",\n      "title": "Tên đối tượng"\n    }\n  },\n  "required": ["name"]\n}');
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const handleSave = async () => {
    setStatus({ type: 'saving', message: 'Đang lưu schema...' });
    try {
      // Parse to ensure valid JSON
      const parsedSchema = JSON.parse(schemaJson);

      const payload = {
        name: displayName,
        system_name: systemName,
        description: 'Tạo từ Entity Builder',
        schema_json: parsedSchema
      };

      await apiService.createEntity(auth, payload);
      setStatus({ type: 'success', message: 'Lưu Entity thành công!' });
      
      // Reset after success
      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
        setSystemName('');
        setDisplayName('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Lỗi khi lưu JSON Schema. Vui lòng kiểm tra lại cú pháp.' });
    }
  };

  return (
    <div className="panel" style={{ margin: '0 auto', maxWidth: '800px', width: '100%' }}>
      <div className="panel-header">
        <div>
          <h2 className="panel-title" style={{ fontSize: '20px' }}>
            <Database size={20} color="var(--color-primary)" />
            Entity Builder
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Thiết kế Cấu trúc Dữ liệu Động (No-Code Schema)
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={status.type === 'saving'}
          className="btn btn-primary"
        >
          {status.type === 'saving' ? (
            <span style={{ opacity: 0.7 }}>Đang lưu...</span>
          ) : (
            <>
              <Save size={16} /> Lưu Entity
            </>
          )}
        </button>
      </div>

      {status.type === 'success' && (
        <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {status.message}
        </div>
      )}

      {status.type === 'error' && (
        <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="form-group">
          <label>Tên hiển thị (Display Name)</label>
          <input
            type="text"
            className="form-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ví dụ: Đơn Hàng"
          />
        </div>
        <div className="form-group">
          <label>Mã hệ thống (System Name)</label>
          <input
            type="text"
            className="form-input"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="Ví dụ: don_hang"
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code size={14} /> JSON Schema Definitions
        </label>
        <textarea
          className="form-input"
          value={schemaJson}
          onChange={(e) => setSchemaJson(e.target.value)}
          style={{ height: '300px', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.5, background: '#000', color: '#a8c7fa', resize: 'vertical' }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
