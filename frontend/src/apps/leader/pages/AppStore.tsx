import React, { useState, useEffect } from 'react';
import { apiService, type AuthConfig } from '../../../shared/services/api';
import { Package, ShoppingCart, Coffee, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AppStore: React.FC = () => {
  const [templates, setTemplates] = useState<EcosystemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);

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
    if (!window.confirm(`Bạn có chắc chắn muốn cài đặt gói [${templateName}]? Thao tác này sẽ tạo tự động Queues, SLA và tri thức AI cho toàn bộ Workspace của bạn.`)) return;

    setInstallingId(templateId);
    setInstallSuccess(null);
    try {
      await apiService.installEcosystemTemplate(auth, templateId);
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
      case 'fnb': return <Coffee size={24} className="text-orange-500" />;
      case 'retail': return <ShoppingCart size={24} className="text-blue-500" />;
      default: return <Package size={24} className="text-indigo-500" />;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderCard = (template: EcosystemTemplate) => {
    const isInstalling = installingId === template.id;
    const isSuccess = installSuccess === template.id;

    return (
      <div
        key={template.id}
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
        }}
      >
        {/* Header Section */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: template.category === 'fnb' ? '#ffedd5' : '#e0e7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getCategoryIcon(template.category)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{template.name}</h3>
            <span style={{ 
              display: 'inline-block',
              padding: '2px 8px', 
              background: '#f1f5f9', 
              color: '#64748b', 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 600,
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
          <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{template.description}</p>
          
          {/* Highlights */}
          <div style={{ marginTop: 'auto' }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 12 }}>Bao gồm (Tự động sinh):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                <CheckCircle size={16} color="#10b981" />
                <span><strong>{template.queues.length}</strong> Queues Phân luồng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                <CheckCircle size={16} color="#10b981" />
                <span><strong>{template.sops?.length || 0}</strong> SOP AI-RAG chuẩn mực</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                <CheckCircle size={16} color="#10b981" />
                <span>Quy tắc SLA & Báo cáo Tự động</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={() => handleInstall(template.id, template.name)}
            disabled={isInstalling || isSuccess}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: isSuccess ? '#10b981' : isInstalling ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#fff',
              cursor: (isInstalling || isSuccess) ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: isSuccess ? 'none' : '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
            }}
          >
            {isInstalling && <Loader2 size={18} className="animate-spin" />}
            {isSuccess && <CheckCircle size={18} />}
            {isInstalling ? 'Đang Khởi tạo...' : isSuccess ? 'Cài đặt Thành công!' : '1-Click Install'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', background: '#fafafa' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 24,
        padding: '48px',
        color: 'white',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(30, 27, 75, 0.1), 0 10px 10px -5px rgba(30, 27, 75, 0.04)'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(99, 102, 241, 0.3)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: 100, width: 250, height: 250, background: 'rgba(139, 92, 246, 0.2)', borderRadius: '50%', filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <span style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
            letterSpacing: '0.05em'
          }}>NEXTFLOW ECOSYSTEM</span>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Hệ sinh thái Template 1-Click
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Biến không gian làm việc trống rỗng thành hệ thống vận hành chuyên nghiệp chỉ với một cú click chuột. Các quy trình (SOP), luồng việc (Queues), và SLA đã được cấu hình sẵn cho ngành nghề của bạn.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#64748b' }}>
          <Loader2 size={40} className="animate-spin mb-4" />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Đang tải hệ sinh thái...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Module Ngành nghề</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: 15 }}>Các giải pháp đóng gói sẵn cho từng lĩnh vực kinh doanh.</p>
            </div>
            <div style={{ color: '#6366f1', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
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
    </div>
  );
};

export default AppStore;
