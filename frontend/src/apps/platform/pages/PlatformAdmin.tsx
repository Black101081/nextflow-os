import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { 
  Layers, 
  Plus, 
  Check, 
  Copy, 
  AlertCircle, 
  Globe, 
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface Tenant {
  id: string;
  company_name: string;
  domain: string;
  status: string;
  subscription_tier: string;
  created_at: string;
}

export default function PlatformAdmin() {
  const { user } = useAuth();
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
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  // Created Tenant result modal/view
  const [createdTenant, setCreatedTenant] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlatformTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Tenant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'PLATFORM_ADMIN') {
      fetchTenants();
      apiService.getPlatformTemplates?.().then(setTemplates).catch(console.error);
    }
  }, [user]);

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
      const res = await apiService.createPlatformTenant({
        company_name: companyName,
        domain: domain,
        subscription_tier: tier,
        admin_email: adminEmail,
        admin_first_name: adminFirstName || 'Admin',
        admin_last_name: adminLastName || 'User',
      });
      
      setCreatedTenant(res.tenant);
      
      // Initialize template if selected
      if (templateId) {
        try {
          await apiService.initializeTenantTemplateWithApiKey(res.tenant.id, res.tenant.api_key, templateId);
          triggerNotification('success', 'Đăng ký doanh nghiệp mới và khởi tạo mẫu thành công!');
        } catch (initErr: any) {
          triggerNotification('error', 'Tạo doanh nghiệp thành công nhưng lỗi khi khởi tạo mẫu: ' + initErr.message);
        }
      } else {
        triggerNotification('success', 'Đăng ký doanh nghiệp mới thành công!');
      }
      
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
      await apiService.updatePlatformTenant(id, payload);
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
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quản trị Hệ thống Platform
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>
          Quản lý vòng đời hoạt động doanh nghiệp (Tenants), gia hạn gói dịch vụ và cấu hình mẫu vận hành hệ thống NextFlow OS.
        </p>
      </div>

      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: '10px',
          zIndex: 9999,
          fontWeight: 600,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {notification.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: createdTenant ? '1fr' : '2fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Main Section: Created Tenant Modal OR Tenants List */}
        <div>
          {createdTenant ? (
            <div style={{ border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.04)', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#10b981' }}>Đăng ký Doanh nghiệp Mới Thành công!</h3>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                Tenant mới đã được khởi tạo trong hệ thống. Hãy ghi lại khóa xác thực API và tài khoản quản trị mặc định dưới đây. **Vì lý do bảo mật, khóa này sẽ không hiển thị lại.**
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>THÔNG TIN DOANH NGHIỆP</span>
                  <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                    <div><span style={{ color: '#94a3b8' }}>Tên công ty:</span> <strong style={{ color: '#fff' }}>{createdTenant.company_name}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Domain:</span> <code style={{ color: '#3b82f6' }}>{createdTenant.domain}</code></div>
                    <div><span style={{ color: '#94a3b8' }}>Gói cước:</span> <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{createdTenant.subscription_tier}</span></div>
                    <div><span style={{ color: '#94a3b8' }}>ID:</span> <code style={{ fontSize: '12px', color: '#e2e8f0' }}>{createdTenant.id}</code></div>
                  </div>
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TÀI KHOẢN ADMIN MẶC ĐỊNH</span>
                  <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                    <div><span style={{ color: '#94a3b8' }}>Email:</span> <strong style={{ color: '#fff' }}>{createdTenant.default_admin.email}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Mật khẩu:</span> <code style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{createdTenant.default_admin.password}</code></div>
                    <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '12px' }}>* Yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OPERATIONAL API KEY (X-NEXTFLOW-API-KEY)</span>
                  <code style={{ fontSize: '13px', color: '#fff', wordBreak: 'break-all', display: 'block', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155' }}>{createdTenant.api_key}</code>
                </div>
                <button 
                  onClick={() => copyToClipboard(createdTenant.api_key)} 
                  style={{ 
                    padding: '10px 16px', 
                    background: '#10b981', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />} {copiedKey ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>

              <button 
                onClick={() => setCreatedTenant(null)} 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 600 
                }}
              >
                Quay lại quản lý danh sách
              </button>
            </div>
          ) : (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <Layers size={20} color="#3b82f6" /> Danh sách Doanh nghiệp (Tenants)
                </h3>
                <button 
                  onClick={fetchTenants} 
                  style={{ 
                    padding: '8px 16px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid #334155', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  <RefreshCw size={14} /> Tải lại
                </button>
              </div>

              {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {loading && tenants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải danh sách...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                        <th style={{ padding: '16px 12px', fontWeight: 600 }}>TÊN DOANH NGHIỆP</th>
                        <th style={{ padding: '16px 12px', fontWeight: 600 }}>DOMAIN</th>
                        <th style={{ padding: '16px 12px', fontWeight: 600 }}>TÀI KHOẢN (API KEY)</th>
                        <th style={{ padding: '16px 12px', fontWeight: 600 }}>HẠN MỨC (TIER)</th>
                        <th style={{ padding: '16px 12px', fontWeight: 600 }}>TRẠNG THÁI</th>
                        <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'right' }}>THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((t: any) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '16px 12px', fontWeight: 600, color: '#fff' }}>{t.company_name}</td>
                          <td style={{ padding: '16px 12px', color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Globe size={13} color="#64748b" /> {t.domain}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px' }}>
                            <code style={{ fontSize: '12px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{t.id.slice(0, 8)}...</code>
                          </td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: t.subscription_tier === 'ENTERPRISE' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: t.subscription_tier === 'ENTERPRISE' ? '#c084fc' : '#60a5fa'
                            }}>
                              {t.subscription_tier}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: t.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: t.status === 'ACTIVE' ? '#34d399' : '#f87171'
                            }}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleUpdateTenant(t.id, { subscription_tier: t.subscription_tier === 'ENTERPRISE' ? 'STANDARD' : 'ENTERPRISE' })}
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '11px', 
                                  background: 'rgba(255,255,255,0.05)', 
                                  border: '1px solid #334155', 
                                  borderRadius: '6px', 
                                  color: '#fff', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <DollarSign size={12} /> Đổi Gói
                              </button>
                              <button 
                                onClick={() => handleUpdateTenant(t.id, { status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '11px', 
                                  background: t.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: t.status === 'ACTIVE' ? '#f87171' : '#34d399',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600
                                }}
                              >
                                <Sliders size={12} /> {t.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <Plus size={18} color="#10b981" /> Tạo Doanh nghiệp Mới
              </h3>
            </div>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>TÊN CÔNG TY / DOANH NGHIỆP *</label>
                <input 
                  type="text" 
                  style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="ví dụ: Bách Hóa Xanh"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>TÊN MIỀN (DOMAIN) *</label>
                <input 
                  type="text" 
                  style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="ví dụ: bachhoaxanh.com"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>HẠN MỨC ĐĂNG KÝ (SUBSCRIPTION TIER)</label>
                <select 
                  style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                  value={tier}
                  onChange={e => setTier(e.target.value)}
                >
                  <option value="STANDARD" style={{ background: '#1e293b' }}>STANDARD (Gói Cơ Bản)</option>
                  <option value="ENTERPRISE" style={{ background: '#1e293b' }}>ENTERPRISE (Gói Doanh Nghiệp)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>ÁP DỤNG GÓI GIẢI PHÁP (TEMPLATE PACK)</label>
                <select 
                  style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                >
                  <option value="" style={{ background: '#1e293b' }}>Không áp dụng (Trống)</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id} style={{ background: '#1e293b' }}>{t.name} - {t.industry}</option>
                  ))}
                </select>
              </div>

              <div style={{ borderTop: '1px dashed #334155', paddingTop: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>THÔNG TIN ADMIN DOANH NGHIỆP</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>EMAIL QUẢN TRỊ *</label>
                  <input 
                    type="email" 
                    style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="ví dụ: admin@bachhoaxanh.com"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>HỌ *</label>
                    <input 
                      type="text" 
                      style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                      value={adminLastName}
                      onChange={e => setAdminLastName(e.target.value)}
                      placeholder="Nguyễn"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>TÊN *</label>
                    <input 
                      type="text" 
                      style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }}
                      value={adminFirstName}
                      onChange={e => setAdminFirstName(e.target.value)}
                      placeholder="Văn An"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontSize: '14px'
                }} 
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Kích hoạt Doanh nghiệp'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
