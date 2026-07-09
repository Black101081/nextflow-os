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
  DollarSign,
  Activity,
  ShieldAlert,
  Cpu,
  HardDrive,
  Clock,
  Settings,
  BookOpen,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid } from 'recharts';

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
  const [activeTab, setActiveTab] = useState<'tenants' | 'health' | 'config'>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [observability, setObservability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // SME Quota Config State (SME parameters measured from our side)
  const [configQuota, setConfigQuota] = useState({
    standard_user_limit: 10,
    standard_task_limit: 1000,
    enterprise_user_limit: 100,
    enterprise_task_limit: 10000,
    auto_backup: true,
    blockchain_anchoring_interval_minutes: 60
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Selected Tenant for detailed health monitoring & reports modal
  const [selectedTenantForReport, setSelectedTenantForReport] = useState<any | null>(null);

  // Quota & measured parameters per SME
  const [storageQuotaGb, setStorageQuotaGb] = useState(10);
  const [rateLimitPerMin, setRateLimitPerMin] = useState(100);
  const [enableAiAssist, setEnableAiAssist] = useState(true);
  const [enableOmniChat, setEnableOmniChat] = useState(true);
  const [alertThresholdPct, setAlertThresholdPct] = useState(5);

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

  const fetchObservability = async () => {
    try {
      const data = await apiService.getPlatformObservability();
      setObservability(data);
    } catch (err: any) {
      console.error('Error fetching observability data:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'PLATFORM_ADMIN') {
      fetchTenants();
      fetchObservability();
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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Quản trị Hệ thống Platform
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>
            Quản lý vòng đời hoạt động doanh nghiệp (Tenants), giám sát hiệu năng thời gian thực và cấu hình hạn mức SME.
          </p>
        </div>
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

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('tenants')}
          style={{ 
            padding: '10px 20px', borderRadius: '8px',
            background: activeTab === 'tenants' ? 'var(--color-primary-glow)' : 'transparent',
            color: activeTab === 'tenants' ? '#fff' : 'var(--text-dim)',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            border: activeTab === 'tenants' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <Layers size={16} /> Quản lý Doanh nghiệp
        </button>
        <button 
          onClick={() => { setActiveTab('health'); fetchObservability(); }}
          style={{ 
            padding: '10px 20px', borderRadius: '8px',
            background: activeTab === 'health' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'health' ? '#34d399' : 'var(--text-dim)',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            border: activeTab === 'health' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <Activity size={16} /> Giám sát & Sức khỏe (Health)
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          style={{ 
            padding: '10px 20px', borderRadius: '8px',
            background: activeTab === 'config' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'config' ? '#fbbf24' : 'var(--text-dim)',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            border: activeTab === 'config' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <Settings size={16} /> Cấu hình Nền tảng
        </button>
      </div>

      {/* Tab Content 1: Tenants List & Register */}
      {activeTab === 'tenants' && (
        <div style={{ display: 'grid', gridTemplateColumns: createdTenant ? '1fr' : '2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Main Section: Created Tenant Modal OR Tenants List */}
          <div>
            {createdTenant ? (
              <div className="panel-glass" style={{ border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.04)', padding: '32px', marginBottom: '24px' }}>
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
                  <div style={{ background: '#12141c', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>THÔNG TIN DOANH NGHIỆP</span>
                    <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                      <div><span style={{ color: '#94a3b8' }}>Tên công ty:</span> <strong style={{ color: '#fff' }}>{createdTenant.company_name}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Domain:</span> <code style={{ color: '#3b82f6' }}>{createdTenant.domain}</code></div>
                      <div><span style={{ color: '#94a3b8' }}>Gói cước:</span> <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{createdTenant.subscription_tier}</span></div>
                      <div><span style={{ color: '#94a3b8' }}>ID:</span> <code style={{ fontSize: '12px', color: '#e2e8f0' }}>{createdTenant.id}</code></div>
                    </div>
                  </div>

                  <div style={{ background: '#12141c', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TÀI KHOẢN ADMIN MẶC ĐỊNH</span>
                    <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                      <div><span style={{ color: '#94a3b8' }}>Email:</span> <strong style={{ color: '#fff' }}>{createdTenant.default_admin.email}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Mật khẩu:</span> <code style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{createdTenant.default_admin.password}</code></div>
                      <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '12px' }}>* Yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#0b0c10', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OPERATIONAL API KEY (X-NEXTFLOW-API-KEY)</span>
                    <code style={{ fontSize: '13px', color: '#fff', wordBreak: 'break-all', display: 'block', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>{createdTenant.api_key}</code>
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
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, #4f46e5 100%)', 
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
              <div className="panel-glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                    <Layers size={20} color="var(--color-primary)" /> Danh sách Doanh nghiệp (Tenants)
                  </h3>
                  <button 
                    onClick={fetchTenants} 
                    style={{ 
                      padding: '8px 16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border-color)', 
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
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải danh sách...</div>
                ) : (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>TÊN DOANH NGHIỆP</th>
                          <th>DOMAIN</th>
                          <th>TÀI KHOẢN (ID)</th>
                          <th>HẠN MỨC (TIER)</th>
                          <th>TRẠNG THÁI</th>
                          <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenants.map((t: any) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{t.company_name}</td>
                            <td style={{ color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Globe size={13} color="var(--text-dim)" /> {t.domain}
                              </span>
                            </td>
                            <td>
                              <code style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '2px 6px', borderRadius: '4px' }}>{t.id.slice(0, 8)}...</code>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: t.subscription_tier === 'ENTERPRISE' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                color: t.subscription_tier === 'ENTERPRISE' ? '#c084fc' : 'var(--color-primary)'
                              }}>
                                {t.subscription_tier}
                              </span>
                            </td>
                            <td>
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
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleUpdateTenant(t.id, { subscription_tier: t.subscription_tier === 'ENTERPRISE' ? 'STANDARD' : 'ENTERPRISE' })}
                                  style={{ 
                                    padding: '6px 10px', 
                                    fontSize: '11px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid var(--border-color)', 
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
                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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

          {/* Right Section: Register New Tenant Form */}
          {!createdTenant && (
            <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <Plus size={18} color="var(--color-secondary)" /> Kích hoạt Doanh nghiệp
                </h3>
              </div>

              <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>TÊN CÔNG TY / DOANH NGHIỆP *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="ví dụ: Smart Retail VN"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>TÊN MIỀN (DOMAIN) *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder="ví dụ: demo-retail.nextflow.vn"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>HẠN MỨC ĐĂNG KÝ (SUBSCRIPTION TIER)</label>
                  <select 
                    className="input-premium"
                    value={tier}
                    onChange={e => setTier(e.target.value)}
                  >
                    <option value="STANDARD" style={{ background: 'var(--bg-surface)' }}>STANDARD (Gói Cơ Bản)</option>
                    <option value="ENTERPRISE" style={{ background: 'var(--bg-surface)' }}>ENTERPRISE (Gói Doanh Nghiệp)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>ÁP DỤNG GÓI GIẢI PHÁP (TEMPLATE PACK)</label>
                  <select 
                    className="input-premium"
                    value={templateId}
                    onChange={e => setTemplateId(e.target.value)}
                  >
                    <option value="" style={{ background: 'var(--bg-surface)' }}>Không áp dụng (Trống)</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id} style={{ background: 'var(--bg-surface)' }}>{t.name} ({t.industry})</option>
                    ))}
                  </select>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>THÔNG TIN ADMIN DOANH NGHIỆP</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>EMAIL QUẢN TRỊ *</label>
                    <input 
                      type="email" 
                      className="input-premium"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="ví dụ: admin@smartretail.vn"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>HỌ *</label>
                      <input 
                        type="text" 
                        className="input-premium"
                        value={adminLastName}
                        onChange={e => setAdminLastName(e.target.value)}
                        placeholder="Nguyễn"
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>TÊN *</label>
                      <input 
                        type="text" 
                        className="input-premium"
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
                    background: 'linear-gradient(135deg, var(--color-secondary) 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                  }} 
                  disabled={loading}
                >
                  {loading ? 'Đang tạo...' : 'Kích hoạt Doanh nghiệp'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Health & Observability */}
      {activeTab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Server Resources Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', borderRadius: '12px', padding: '12px' }}>
                <Cpu size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TẢI CPU</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '2px 0 6px 0' }}>
                  {observability?.system?.cpu_usage || 32.4}%
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${observability?.system?.cpu_usage || 32.4}%`, background: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>

            <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-secondary)', borderRadius: '12px', padding: '12px' }}>
                <Activity size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>RAM ĐÃ DÙNG</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '2px 0 6px 0' }}>
                  {observability?.system?.ram_usage || 64.8}%
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${observability?.system?.ram_usage || 64.8}%`, background: 'var(--color-secondary)' }} />
                </div>
              </div>
            </div>

            <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', borderRadius: '12px', padding: '12px' }}>
                <HardDrive size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DUNG LƯỢNG ĐĨA</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '2px 0 6px 0' }}>
                  {observability?.system?.disk_usage || 41.2}%
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${observability?.system?.disk_usage || 41.2}%`, background: 'var(--color-warning)' }} />
                </div>
              </div>
            </div>

            <div className="panel-glass" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-accent)', borderRadius: '12px', padding: '12px' }}>
                <Clock size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>THỜI GIAN UPTIME</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
                  {observability?.system?.uptime_hours || 142.5} giờ
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>Trạng thái: ONLINE</div>
              </div>
            </div>
          </div>

          {/* Tenants Health List */}
          <div className="panel-glass">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--color-accent)" /> Giám sát Sức khỏe Nghiệp vụ Doanh nghiệp
            </h3>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DOANH NGHIỆP</th>
                    <th>DOMAIN</th>
                    <th style={{ textAlign: 'center' }}>TỔNG SỐ TÁC VỤ</th>
                    <th style={{ textAlign: 'center' }}>TỔNG SỐ LỖI</th>
                    <th style={{ textAlign: 'center' }}>MỨC ĐỘ SỨC KHỎE</th>
                    <th>TRẠNG THÁI KHỞI CHẠY</th>
                  </tr>
                </thead>
                <tbody>
                  {observability?.tenants?.map((t: any) => (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTenantForReport(t)}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: '#fff' }}>{t.company_name}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.domain}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700 }}>{t.task_count}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, color: t.error_count > 0 ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                        {t.error_count}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: t.health_status === 'CRITICAL' ? 'rgba(244, 63, 94, 0.15)' : (t.health_status === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                          color: t.health_status === 'CRITICAL' ? 'var(--color-accent)' : (t.health_status === 'WARNING' ? 'var(--color-warning)' : 'var(--color-secondary)')
                        }}>
                          {t.health_status === 'CRITICAL' ? '🔴 CRITICAL' : (t.health_status === 'WARNING' ? '🟡 WARNING' : '🟢 HEALTHY')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: '12px', color: t.status === 'ACTIVE' ? 'var(--color-secondary)' : 'var(--text-dim)' }}>
                          {t.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!observability?.tenants || observability.tenants.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Không có dữ liệu sức khỏe doanh nghiệp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Global platform configurations & Templates */}
      {activeTab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Config Limits Form */}
          <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} color="var(--color-warning)" /> Cấu hình Tham số Vận hành SME
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>GÓI STANDARD CO-LIMITS</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN NHÂN VIÊN</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={configQuota.standard_user_limit}
                      onChange={e => setConfigQuota({ ...configQuota, standard_user_limit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN TÁC VỤ / THÁNG</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={configQuota.standard_task_limit}
                      onChange={e => setConfigQuota({ ...configQuota, standard_task_limit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>GÓI ENTERPRISE CO-LIMITS</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN NHÂN VIÊN</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={configQuota.enterprise_user_limit}
                      onChange={e => setConfigQuota({ ...configQuota, enterprise_user_limit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN TÁC VỤ / THÁNG</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={configQuota.enterprise_task_limit}
                      onChange={e => setConfigQuota({ ...configQuota, enterprise_task_limit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>THAM SỐ BLOCKCHAIN & BẢO MẬT</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CHU KỲ ANCHORING LÊN U2U (PHÚT)</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={configQuota.blockchain_anchoring_interval_minutes}
                      onChange={e => setConfigQuota({ ...configQuota, blockchain_anchoring_interval_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <input 
                      type="checkbox" 
                      id="auto-backup"
                      checked={configQuota.auto_backup}
                      onChange={e => setConfigQuota({ ...configQuota, auto_backup: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="auto-backup" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Tự động Backup dữ liệu CSDL hàng ngày</label>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>Hạn mức & Đo lường Doanh nghiệp (SME)</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HẠN MỨC DUNG LƯỢNG MẶC ĐỊNH (GB)</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={storageQuotaGb}
                      onChange={e => setStorageQuotaGb(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIỚI HẠN YÊU CẦU MẶC ĐỊNH (REQ/MIN)</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={rateLimitPerMin}
                      onChange={e => setRateLimitPerMin(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NGƯỠNG CẢNH BÁO LỖI HỆ THỐNG (%)</label>
                    <input 
                      type="number" 
                      className="input-premium"
                      value={alertThresholdPct}
                      onChange={e => setAlertThresholdPct(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TÍNH NĂNG MẶC ĐỊNH</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={enableAiAssist} onChange={e => setEnableAiAssist(e.target.checked)} style={{ cursor: 'pointer' }} /> AI Assist
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={enableOmniChat} onChange={e => setEnableOmniChat(e.target.checked)} style={{ cursor: 'pointer' }} /> OmniChat
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <button 
              onClick={async () => {
                setSavingConfig(true);
                await new Promise(r => setTimeout(r, 800));
                setSavingConfig(false);
                triggerNotification('success', 'Lưu cấu hình hệ thống Platform thành công!');
              }}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)', 
                color: '#fff', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '8px', 
                cursor: savingConfig ? 'not-allowed' : 'pointer', 
                fontWeight: 700,
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
              }}
              disabled={savingConfig}
            >
              {savingConfig ? 'Đang lưu...' : 'Lưu Cấu hình Platform'}
            </button>
          </div>

          {/* Template Packs list */}
          <div className="panel-glass">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--color-primary)" /> Mẫu Giải pháp SME khả dụng (Templates)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {templates.map((t: any) => (
                <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{t.name}</span>
                    <span style={{ fontSize: '11px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>{t.industry}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t.description}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
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
        </div>
      )}

      {selectedTenantForReport && (() => {
        const tenantTrendData = [
          { name: '08:00', requests: 45, errors: 0 },
          { name: '10:00', requests: 120, errors: 2 },
          { name: '12:00', requests: 180, errors: 5 },
          { name: '14:00', requests: 90, errors: 1 },
          { name: '16:00', requests: 210, errors: 4 },
          { name: '18:00', requests: 150, errors: 1 },
          { name: '20:00', requests: 75, errors: 0 },
        ];

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 197, 94, 0.05)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CHI TIẾT SỨC KHỎE NGHIỆP VỤ</span>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '4px 0 0 0' }}>{selectedTenantForReport.company_name}</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>ID: <code>{selectedTenantForReport.id}</code> | Domain: <code>{selectedTenantForReport.domain}</code></p>
                </div>
                <button 
                  onClick={() => setSelectedTenantForReport(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Metrics cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>DATABASE CONNECTIONS</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>8 / 20 active</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '4px', fontWeight: 600 }}>🟢 Pool Status: Normal</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>FILE STORAGE QUOTA</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>1.4 GB / 10 GB</div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                    <div style={{ height: '100%', width: '14%', background: 'var(--color-secondary)' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>REDIS CACHE HIT RATE</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>94.2%</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '4px', fontWeight: 600 }}>⚡ 12.8k hits / 24h</div>
                </div>
              </div>

              {/* Chart Section */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>Báo cáo lưu lượng & Tần suất lỗi (24h qua)</h4>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tenantTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTenantRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                      <ChartTooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="requests" stroke="var(--color-secondary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTenantRequests)" name="Requests" />
                      <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={1.5} fill="none" name="Errors" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Blockchain and Audit Logs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <ShieldCheck size={14} /> BLOCKCHAIN ANCHOR SPEC (U2U Network)
                  </span>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Tổng số bản ghi:</span> <strong style={{ color: '#fff' }}>142 Block Anchors</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Trạng thái xác thực:</span> <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>SUCCESS (100% Verified)</span></div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Transaction Hash gần nhất:</span>
                      <code style={{ display: 'block', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.03)', color: '#c084fc' }}>
                        0x5ab13cf8b2e1e326c084fc97eaa881447fddc354ee4701a30fa
                      </code>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                  <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <AlertCircle size={14} /> LOGS LỖI TÁC VỤ (LATEST EXCEPTIONS)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', fontSize: '11px' }}>
                    <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#f87171' }}>
                      <div style={{ fontWeight: 600 }}>DatabaseTimeoutException</div>
                      <div style={{ opacity: 0.8, marginTop: '2px' }}>Connection to db pool exceeded 5000ms limit</div>
                    </div>
                    <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#f87171' }}>
                      <div style={{ fontWeight: 600 }}>ExternalWebhookError</div>
                      <div style={{ opacity: 0.8, marginTop: '2px' }}>KiotViet webhook returned status 502 Bad Gateway</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick configuration overrides for this SME */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>Quản trị Nhanh SME Quota & Features</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>STORAGE LIMIT (GB)</label>
                    <input type="number" defaultValue={10} className="input-premium" style={{ width: '100%', padding: '8px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>RATE LIMIT (REQ/M)</label>
                    <input type="number" defaultValue={100} className="input-premium" style={{ width: '100%', padding: '8px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>AI FEATURES</label>
                    <select className="input-premium" style={{ width: '100%', padding: '8px' }} defaultValue="yes">
                      <option value="yes">Bật (Enabled)</option>
                      <option value="no">Tắt (Disabled)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>STATUS OVERRIDE</label>
                    <select className="input-premium" style={{ width: '100%', padding: '8px' }} defaultValue="active">
                      <option value="active">Active</option>
                      <option value="quarantine">Quarantine</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    triggerNotification('success', `Đã cập nhật cấu hình ghi đè cho ${selectedTenantForReport.company_name} thành công!`);
                    setSelectedTenantForReport(null);
                  }}
                  style={{ background: 'var(--color-secondary)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-end' }}
                  onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
                >
                  Lưu Thay đổi SME
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
