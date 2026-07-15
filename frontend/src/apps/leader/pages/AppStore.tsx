import React, { useState, useEffect } from 'react';
import { apiService, type AuthConfig } from '../../../shared/services/api';
import { Package, ShoppingCart, Coffee, CheckCircle, ChevronRight, Loader2, Sparkles, GraduationCap, Building, Briefcase, HardHat, Wrench, Truck, Factory, HeartPulse, Bed, X } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TemplateQueue {
  name: string;
  description: string;
  priority: number;
  color: string;
  icon: string;
}

interface TemplateSop {
  title: string;
  content: string;
}

interface EcosystemTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  queues: TemplateQueue[];
  sops: TemplateSop[];
  entities?: any[];
  workflows?: any[];
  connectors?: any[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AppStore: React.FC = () => {
  const [templates, setTemplates] = useState<EcosystemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EcosystemTemplate | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { user } = useAuth();
  
  const auth: AuthConfig = {
    tenantId: user?.tenant_id || '',
    apiKey: user?.api_key || ''
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.listEcosystemTemplates(auth);
      setTemplates(res);
    } catch (err) {
      console.error('Error fetching ecosystem templates', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (templateId: string, templateName: string) => {
    const skipConfirm = window.location.search.includes('skip_confirm=true');
    if (!skipConfirm && !window.confirm(`Bạn có chắc chắn muốn cài đặt gói [${templateName}]? Thao tác này sẽ tạo tự động Queues, SLA và tri thức AI cho toàn bộ Workspace của bạn.`)) return;

    setInstallingId(templateId);
    setInstallSuccess(null);
    try {
      if (templateId === 'tpl_spa_clinic') {
        await apiService.installVerticalPack(auth, templateId);
      } else {
        await apiService.installEcosystemTemplate(auth, templateId);
      }
      setInstallSuccess(templateId);
      setTimeout(() => setInstallSuccess(null), 5000);
    } catch (err: any) {
      alert(`Lỗi cài đặt: ${err.message}`);
    } finally {
      setInstallingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fnb': return <Coffee size={24} className="text-amber-400" />;
      case 'retail': return <ShoppingCart size={24} className="text-emerald-400" />;
      case 'spa': return <Sparkles size={24} className="text-pink-400" />;
      case 'education': return <GraduationCap size={24} className="text-blue-400" />;
      case 'real_estate': return <Building size={24} className="text-cyan-400" />;
      case 'services': return <Briefcase size={24} className="text-indigo-400" />;
      case 'construction': return <HardHat size={24} className="text-orange-400" />;
      case 'automotive': return <Wrench size={24} className="text-gray-400" />;
      case 'logistics': return <Truck size={24} className="text-yellow-400" />;
      case 'manufacturing': return <Factory size={24} className="text-purple-400" />;
      case 'healthcare': return <HeartPulse size={24} className="text-red-400" />;
      case 'hospitality': return <Bed size={24} className="text-teal-400" />;
      default: return <Package size={24} className="text-indigo-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fnb': return '245, 158, 11'; // amber-500
      case 'retail': return '16, 185, 129'; // emerald-500
      case 'spa': return '236, 72, 153'; // pink-500
      case 'education': return '59, 130, 246'; // blue-500
      case 'real_estate': return '6, 182, 212'; // cyan-500
      case 'services': return '99, 102, 241'; // indigo-500
      case 'construction': return '249, 115, 22'; // orange-500
      case 'automotive': return '156, 163, 175'; // gray-400
      case 'logistics': return '234, 179, 8'; // yellow-500
      case 'manufacturing': return '168, 85, 247'; // purple-500
      case 'healthcare': return '239, 68, 68'; // red-500
      case 'hospitality': return '20, 184, 166'; // teal-500
      default: return '99, 102, 241'; // indigo-500
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderCard = (template: EcosystemTemplate) => {
    const isInstalling = installingId === template.id;
    const isSuccess = installSuccess === template.id;
    const catColor = getCategoryColor(template.category);

    return (
      <div
        key={template.id}
        className="app-store-card"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header Section */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `rgba(${catColor}, 0.1)`,
            border: `1px solid rgba(${catColor}, 0.2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getCategoryIcon(template.category)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>{template.name}</h3>
            <span style={{ 
              display: 'inline-block',
              padding: '2px 8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: 'var(--color-accent)', 
              borderRadius: 12, 
              fontSize: 11, 
              fontWeight: 700,
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {template.category} MODULE
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ margin: '0 0 20px 0', color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>{template.description}</p>
          
          {/* Highlights */}
          <div style={{ marginTop: 'auto' }}>
            <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 12 }}>Bao gồm (Tự động sinh):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                <CheckCircle size={16} className="text-emerald-400" />
                <span><strong>{template.queues?.length || 0}</strong> Queues Phân luồng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                <CheckCircle size={16} className="text-emerald-400" />
                <span><strong>{template.entities?.length || 0}</strong> Dynamic Entities</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                <CheckCircle size={16} className="text-emerald-400" />
                <span><strong>{template.workflows?.length || 0}</strong> N8N-style Workflows</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                <CheckCircle size={16} className="text-emerald-400" />
                <span><strong>{template.sops?.length || 0}</strong> SOP AI-RAG chuẩn mực</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Quy tắc SLA & Báo cáo Tự động</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div style={{ padding: '20px 24px', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              setSelectedTemplate(template);
              setIsDetailsOpen(true);
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.2s',
              textAlign: 'center',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            Xem Gói
          </button>

          <button
            onClick={() => handleInstall(template.id, template.name)}
            disabled={isInstalling || isSuccess}
            style={{
              flex: 2,
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              background: isSuccess ? '#10b981' : isInstalling ? '#64748b' : 'var(--color-accent)',
              color: '#fff',
              cursor: (isInstalling || isSuccess) ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: (isInstalling || isSuccess) ? 'none' : '0 4px 14px 0 rgba(34, 197, 94, 0.2)',
            }}
            onMouseOver={(e) => { if(!isInstalling && !isSuccess) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
          >
            {isInstalling && <Loader2 size={16} className="animate-spin" />}
            {isSuccess && <CheckCircle size={16} />}
            {isInstalling ? 'Đang chạy...' : isSuccess ? 'Thành công!' : 'Install'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px 40px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', background: 'transparent' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 24,
        padding: '48px',
        color: 'white',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(34, 197, 94, 0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: 100, width: 250, height: 250, background: 'rgba(34, 197, 94, 0.08)', borderRadius: '50%', filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <span style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-accent)',
            marginBottom: 16,
            letterSpacing: '0.05em',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>NEXTFLOW ECOSYSTEM</span>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Hệ sinh thái Template 1-Click
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Biến không gian làm việc trống rỗng thành hệ thống vận hành chuyên nghiệp chỉ với một cú click chuột. Các quy trình (SOP), luồng việc (Queues), và SLA đã được cấu hình sẵn cho ngành nghề của bạn.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Đang tải hệ sinh thái...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>Module Ngành nghề</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>Các giải pháp đóng gói sẵn cho từng lĩnh vực kinh doanh.</p>
            </div>
            <div style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              Xem tất cả <ChevronRight size={16} />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: 24 
          }}>
            {templates.map(renderCard)}
            {templates.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                Không tìm thấy Template nào.
              </div>
            )}
          </div>
        </>
      )}
      <style>{`
        .app-store-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-accent) !important;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), 0 0 15px rgba(34, 197, 94, 0.1) !important;
        }
      `}</style>

      {/* Visual Details Modal */}
      {isDetailsOpen && selectedTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 32,
            position: 'relative',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif'
          }}>
            <button 
              onClick={() => setIsDetailsOpen(false)}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 12px 0' }}>
              Cấu trúc gói: {selectedTemplate.name}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Dưới đây là chi tiết các thành phần tự động hóa sẽ được khởi tạo trong Workspace của bạn:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Queues Section */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 13, textTransform: 'uppercase', tracking: '0.05em', color: '#10b981', fontWeight: 700 }}>
                  1. Luồng Việc (Queues) & SLA
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedTemplate.queues?.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{q.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>SLA Priority: {q.priority} giờ</span>
                    </div>
                  ))}
                  {(!selectedTemplate.queues || selectedTemplate.queues.length === 0) && (
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Không có hàng chờ cấu hình sẵn.</span>
                  )}
                </div>
              </div>

              {/* Workflows Section */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 13, textTransform: 'uppercase', tracking: '0.05em', color: '#8b5cf6', fontWeight: 700 }}>
                  2. Automation Workflows (N8N Nodes)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    Mô hình sơ đồ khối tự động hóa quy trình:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, background: '#0a0f1d', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>TRIGGER</div>
                    <span style={{ color: '#475569', fontSize: 12 }}>→</span>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#c084fc' }}>AI ASSISTANT</div>
                    <span style={{ color: '#475569', fontSize: 12 }}>→</span>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>CONDITION</div>
                    <span style={{ color: '#475569', fontSize: 12 }}>→</span>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#f87171' }}>SMART CONTRACT</div>
                    <span style={{ color: '#475569', fontSize: 12 }}>→</span>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#34d399' }}>ZALO ZNS</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Entities Section */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 13, textTransform: 'uppercase', tracking: '0.05em', color: '#ec4899', fontWeight: 700 }}>
                  3. Cơ sở dữ liệu mở rộng (Dynamic Entities)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedTemplate.entities?.map((e, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{e.name || e.label || `Entity #${idx + 1}`}</span>
                      <span style={{ color: '#ec4899', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Database Created</span>
                    </div>
                  ))}
                  {(!selectedTemplate.entities || selectedTemplate.entities.length === 0) && (
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>
                      Kế thừa cấu trúc CSDL cốt lõi (Khách hàng, Lịch hẹn, Giao dịch).
                    </div>
                  )}
                </div>
              </div>

            </div>

            <button
              onClick={() => {
                setIsDetailsOpen(false);
                handleInstall(selectedTemplate.id, selectedTemplate.name);
              }}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--color-accent)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                marginTop: 28,
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
            >
              Cài đặt Gói Này Ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppStore;
