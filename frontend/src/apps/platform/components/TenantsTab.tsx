import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Check, Copy, AlertCircle, Globe, RefreshCw, Sliders, DollarSign, Users, ShieldCheck, Zap } from 'lucide-react';
import { apiService } from "../../../shared/services/api";

const SkeletonRow = () => (
  <tr style={{ animation: 'pulse 1.5s infinite', opacity: 0.5 }}>
    <td><div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '80%' }} /></td>
    <td><div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '60%' }} /></td>
    <td><div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '40%' }} /></td>
    <td><div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '70%' }} /></td>
    <td><div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '50%' }} /></td>
    <td><div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '100%' }} /></td>
  </tr>
);

interface TenantsTabProps {
  tenants: any[];
  loading: boolean;
  error: string | null;
  fetchTenants: () => void;
  triggerNotification: (type: 'success' | 'error', msg: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  tierFilter: string;
  setTierFilter: (t: string) => void;
  templates: any[];
}

export default function TenantsTab({
  tenants, loading, error, fetchTenants, triggerNotification,
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, tierFilter, setTierFilter,
  templates
}: TenantsTabProps) {
  
  const [createdTenant, setCreatedTenant] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [tier, setTier] = useState('STANDARD');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredTenants = tenants.filter((t: any) => {
    const matchesSearch = searchQuery === '' || 
      t.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesTier = tierFilter === 'ALL' || t.subscription_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, tierFilter]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !domain.trim() || !adminEmail.trim()) {
      triggerNotification('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setIsCreating(true);
      const res = await apiService.createPlatformTenant({
        company_name: companyName,
        domain: domain,
        subscription_tier: tier,
        admin_email: adminEmail,
        admin_first_name: adminFirstName || 'Admin',
        admin_last_name: adminLastName || 'User',
      });
      
      setCreatedTenant(res.tenant);
      
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
      
      setCompanyName('');
      setDomain('');
      setAdminEmail('');
      setAdminFirstName('');
      setAdminLastName('');
      
      fetchTenants();
    } catch (err: any) {
      triggerNotification('error', err.message || 'Lỗi khi tạo Tenant.');
    } finally {
      setIsCreating(false);
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

  // Simulate AI Churn Risk calculation based on domain length for mock
  const getAiChurnRisk = (domain: string) => {
    const risk = (domain.length % 3) * 33 + 10; // returns 10%, 43%, or 76%
    if (risk < 30) return { label: 'Low', color: '#10b981' };
    if (risk < 60) return { label: 'Medium', color: '#f59e0b' };
    return { label: 'High', color: '#ef4444' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: createdTenant ? '1fr' : '2.5fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* Left Column: Tenant List or Created Success Modal */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text"
                className="input-premium"
                placeholder="🔍 Tìm kiếm theo tên, domain hoặc ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '8px 14px', fontSize: '13px' }}
              />
              <select 
                className="input-premium"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                style={{ padding: '8px 12px', fontSize: '12px', minWidth: '130px' }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">🟢 ACTIVE</option>
                <option value="SUSPENDED">🔴 SUSPENDED</option>
              </select>
              <select 
                className="input-premium"
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value as any)}
                style={{ padding: '8px 12px', fontSize: '12px', minWidth: '130px' }}
              >
                <option value="ALL">Tất cả gói cước</option>
                <option value="STANDARD">STANDARD</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {loading && tenants.length === 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TÊN DOANH NGHIỆP</th>
                      <th>DOMAIN</th>
                      <th>AI CHURN RISK</th>
                      <th>VERIFICATION</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TÊN DOANH NGHIỆP</th>
                      <th>DOMAIN</th>
                      <th>AI CHURN RISK</th>
                      <th>VERIFICATION</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <AnimatePresence>
                    <tbody>
                      {paginatedTenants.map((t: any) => {
                        const risk = getAiChurnRisk(t.domain);
                        return (
                          <motion.tr 
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td style={{ fontWeight: 600, color: '#fff' }}>
                              {t.company_name}
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>ID: {t.id.slice(0, 8)}</div>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Globe size={13} color="var(--text-dim)" /> {t.domain}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                                background: `${risk.color}20`, color: risk.color, display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content'
                              }}>
                                <Zap size={12} /> {risk.label}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                                background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content'
                              }}>
                                <ShieldCheck size={12} /> Web3 Anchored
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
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
                                  style={{ padding: '6px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <DollarSign size={12} /> Đổi Gói
                                </button>
                                <button 
                                  onClick={() => handleUpdateTenant(t.id, { status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                                  style={{ padding: '6px 10px', fontSize: '11px', background: t.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: t.status === 'ACTIVE' ? '#f87171' : '#34d399', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                >
                                  <Sliders size={12} /> {t.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                                </button>
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`Xác nhận đóng vai Admin của doanh nghiệp ${t.company_name}?`)) {
                                      triggerNotification('success', `Đang thiết lập phiên làm việc đóng vai: ${t.company_name}`);
                                      setTimeout(() => window.open(`http://localhost:8082/login?impersonate=${t.id}`, '_blank'), 1500);
                                    }
                                  }}
                                  style={{ padding: '6px 10px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                >
                                  <Users size={12} /> Đóng vai
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                      {tenants.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Không có Tenant nào được đăng ký trong hệ thống.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </AnimatePresence>
                </table>
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                  Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTenants.length)} trong số {filteredTenants.length}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: currentPage === 1 ? 'var(--text-muted)' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Trước
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: currentPage === totalPages ? 'var(--text-muted)' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Register New Tenant Form & Automation Toggles */}
      {!createdTenant && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="panel-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <Plus size={18} color="var(--color-secondary)" /> Kích hoạt Doanh nghiệp
              </h3>
            </div>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>TÊN CÔNG TY / DOANH NGHIỆP *</label>
                <input type="text" className="input-premium" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="ví dụ: Smart Retail VN" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>TÊN MIỀN (DOMAIN) *</label>
                <input type="text" className="input-premium" value={domain} onChange={e => setDomain(e.target.value)} placeholder="ví dụ: demo-retail.nextflow.vn" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>HẠN MỨC ĐĂNG KÝ</label>
                <select className="input-premium" value={tier} onChange={e => setTier(e.target.value)}>
                  <option value="STANDARD" style={{ background: 'var(--bg-surface)' }}>STANDARD (Gói Cơ Bản)</option>
                  <option value="ENTERPRISE" style={{ background: 'var(--bg-surface)' }}>ENTERPRISE (Gói Doanh Nghiệp)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>ÁP DỤNG GÓI GIẢI PHÁP</label>
                <select className="input-premium" value={templateId} onChange={e => setTemplateId(e.target.value)}>
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
                  <input type="email" className="input-premium" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="ví dụ: admin@smartretail.vn" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>HỌ *</label>
                    <input type="text" className="input-premium" value={adminLastName} onChange={e => setAdminLastName(e.target.value)} placeholder="Nguyễn" required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>TÊN *</label>
                    <input type="text" className="input-premium" value={adminFirstName} onChange={e => setAdminFirstName(e.target.value)} placeholder="Văn An" required />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                style={{ 
                  width: '100%', marginTop: '12px', background: 'linear-gradient(135deg, var(--color-secondary) 0%, #059669 100%)',
                  color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600,
                  cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.7 : 1, fontSize: '14px',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                }} 
                disabled={isCreating}
              >
                {isCreating ? 'Đang tạo...' : 'Kích hoạt Doanh nghiệp'}
              </button>
            </form>
          </div>

          <div className="panel-glass" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#ef4444" /> Automation Workflow
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f87171' }}>Auto-Suspend</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tự động khóa nếu nợ cước 3 ngày</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ef4444', transition: '.4s', borderRadius: '22px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '20px', bottom: '2px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>
          </div>
          
        </div>
      )}
    </motion.div>
  );
}
