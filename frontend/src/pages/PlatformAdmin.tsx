import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Layers, 
  Plus, 
  Check, 
  Copy, 
  AlertCircle, 
  Globe, 
  RefreshCw,
  LogOut,
  Sliders,
  DollarSign
} from 'lucide-react';

interface Tenant {
  id: string;
  company_name: string;
  domain: string;
  status: string;
  subscription_tier: string;
  created_at: string;
}

interface PlatformAdminProps {
  adminKey: string;
  onLogout: () => void;
}

export default function PlatformAdmin({ adminKey, onLogout }: PlatformAdminProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Tenant Form
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [tier, setTier] = useState('STANDARD');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');

  // Created Tenant result modal/view
  const [createdTenant, setCreatedTenant] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlatformTenants(adminKey);
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Tenant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [adminKey]);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !domain.trim() || !adminEmail.trim()) {
      triggerNotification('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.createPlatformTenant(adminKey, {
        company_name: companyName,
        domain: domain,
        subscription_tier: tier,
        admin_email: adminEmail,
        admin_first_name: adminFirstName || 'Admin',
        admin_last_name: adminLastName || 'User',
      });
      
      setCreatedTenant(res.tenant);
      triggerNotification('success', 'Đăng ký doanh nghiệp mới thành công!');
      
      // Clear form
      setCompanyName('');
      setDomain('');
      setAdminEmail('');
      setAdminFirstName('');
      setAdminLastName('');
      
      // Reload list
      fetchTenants();
    } catch (err: any) {
      triggerNotification('error', err.message || 'Lỗi khi tạo Tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async (id: string, payload: { status?: string; subscription_tier?: string }) => {
    try {
      await apiService.updatePlatformTenant(adminKey, id, payload);
      triggerNotification('success', 'Cập nhật thông tin Tenant thành công.');
      fetchTenants();
    } catch (err: any) {
      triggerNotification('error', err.message || 'Lỗi khi cập nhật Tenant.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo" style={{ width: '40px', height: '40px', fontSize: '18px' }}>NF</div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Nextflow Platform Control Center</h1>
            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>System Operator Shell</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {notification && (
            <div style={{
              backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${notification.type === 'success' ? 'var(--color-secondary)' : 'var(--color-accent)'}`,
              color: notification.type === 'success' ? 'var(--color-secondary)' : 'var(--color-accent)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={14} /> {notification.message}
            </div>
          )}
          
          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: createdTenant ? '1fr' : '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Main Section: Created Tenant Modal OR Tenants List */}
        <div>
          {createdTenant ? (
            <div className="panel" style={{ border: '2px solid var(--color-secondary)', background: 'rgba(16, 185, 129, 0.05)', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--color-secondary)', color: '#000', borderRadius: '50%', padding: '6px' }}>
                  <Check size={24} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Đăng ký Doanh nghiệp Mới Thành công!</h3>
              </div>

              <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                Tenant mới đã được khởi tạo trong hệ thống. Hãy ghi lại khóa xác thực API và tài khoản quản trị mặc định dưới đây. **Vì lý do bảo mật, khóa này sẽ không hiển thị lại.**
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>THÔNG TIN DOANH NGHIỆP</span>
                  <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                    <div><strong>Tên công ty:</strong> {createdTenant.company_name}</div>
                    <div><strong>Domain:</strong> {createdTenant.domain}</div>
                    <div><strong>Gói cước:</strong> <span className="badge badge-low" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>{createdTenant.subscription_tier}</span></div>
                    <div><strong>ID:</strong> <code style={{ fontSize: '12px', color: 'var(--color-primary)' }}>{createdTenant.id}</code></div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>TÀI KHOẢN ADMIN MẶC ĐỊNH</span>
                  <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                    <div><strong>Email:</strong> {createdTenant.default_admin.email}</div>
                    <div><strong>Mật khẩu:</strong> <code>{createdTenant.default_admin.password}</code></div>
                    <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '6px' }}>* Yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OPERATIONAL API KEY (X-NEXTFLOW-API-KEY)</span>
                  <code style={{ fontSize: '14px', color: '#fff', wordBreak: 'break-all' }}>{createdTenant.api_key}</code>
                </div>
                <button onClick={() => copyToClipboard(createdTenant.api_key)} className="btn btn-secondary" style={{ padding: '8px 16px', gap: '6px' }}>
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />} {copiedKey ? 'Đã sao chép' : 'Sao chép khóa'}
                </button>
              </div>

              <button onClick={() => setCreatedTenant(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Quay lại quản lý danh sách
              </button>
            </div>
          ) : (
            <div className="panel">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--color-primary)" /> Danh sách Doanh nghiệp (Tenants)
                </h3>
                <button onClick={fetchTenants} className="btn btn-secondary" style={{ padding: '6px 12px', gap: '6px' }}>
                  <RefreshCw size={14} /> Tải lại
                </button>
              </div>

              {error && (
                <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {loading && tenants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Đang tải danh sách...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>TÊN DOANH NGHIỆP</th>
                        <th style={{ padding: '12px' }}>DOMAIN</th>
                        <th style={{ padding: '12px' }}>TÀI KHOẢN (API KEY)</th>
                        <th style={{ padding: '12px' }}>HẠN MỨC (TIER)</th>
                        <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s' }} className="table-row-hover">
                          <td style={{ padding: '12px', fontWeight: 600 }}>{t.company_name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Globe size={12} /> {t.domain}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <code style={{ fontSize: '11px', color: 'var(--color-primary)' }}>{t.id.slice(0, 8)}...</code>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${t.subscription_tier === 'ENTERPRISE' ? 'badge-medium' : 'badge-low'}`} style={{ fontSize: '10px' }}>
                              {t.subscription_tier}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${t.status === 'ACTIVE' ? 'badge-completed' : 'badge-high'}`} style={{ fontSize: '10px' }}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleUpdateTenant(t.id, { subscription_tier: t.subscription_tier === 'ENTERPRISE' ? 'STANDARD' : 'ENTERPRISE' })}
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
                            >
                              <DollarSign size={10} /> Đổi Gói
                            </button>
                            <button 
                              onClick={() => handleUpdateTenant(t.id, { status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                              className="btn" 
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '11px', 
                                background: t.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: t.status === 'ACTIVE' ? '#f87171' : 'var(--color-secondary)',
                                border: 'none',
                                gap: '4px'
                              }}
                            >
                              <Sliders size={10} /> {t.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                            Không có Tenant nào được đăng ký trong hệ thống.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Register New Tenant Form (Only shown when not displaying created tenant) */}
        {!createdTenant && (
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>
              <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="var(--color-secondary)" /> Tạo Doanh nghiệp Mới
              </h3>
            </div>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>TÊN CÔNG TY / DOANH NGHIỆP *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="ví dụ: Bách Hóa Xanh"
                  required
                />
              </div>

              <div className="form-group">
                <label>TÊN MIỀN (DOMAIN) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="ví dụ: bachhoaxanh.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>HẠN MỨC ĐĂNG KÝ (SUBSCRIPTION TIER)</label>
                <select 
                  className="form-input" 
                  value={tier}
                  onChange={e => setTier(e.target.value)}
                >
                  <option value="STANDARD">STANDARD (Gói Cơ Bản)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Gói Doanh Nghiệp)</option>
                </select>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>THÔNG TIN ADMIN DOANH NGHIỆP</span>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label>EMAIL QUẢN TRỊ *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="ví dụ: admin@bachhoaxanh.com"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>HỌ *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={adminLastName}
                      onChange={e => setAdminLastName(e.target.value)}
                      placeholder="Nguyễn"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>TÊN *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={adminFirstName}
                      onChange={e => setAdminFirstName(e.target.value)}
                      placeholder="Văn An"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                {loading ? 'Đang tạo...' : 'Kích hoạt Doanh nghiệp'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
