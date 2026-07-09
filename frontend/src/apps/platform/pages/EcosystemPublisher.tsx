import React, { useState, useEffect, useCallback } from 'react';
import { apiService, type AuthConfig } from '../../../shared/services/api';
import type { NextflowManifest } from '../../../shared/types/sdk';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Layers, Shield, Check, FileCode, PlayCircle } from 'lucide-react';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';

interface ExtensionDB {
  id: string;
  name: string;
  description: string;
  vendor: string;
  version: string;
  status: ReviewStatus;
  risk_level: string;
  tx_hash?: string;
  ai_audit_notes?: string;
}

const EcosystemPublisher: React.FC = () => {
  const { user } = useAuth();
  const adminKey = user?.tenant_id || '';
  const [listings, setListings] = useState<ExtensionDB[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'submit'>('listings');
  const [isLoading, setIsLoading] = useState(false);

  const auth: AuthConfig = {
    tenantId: 'platform-admin',
    apiKey: adminKey
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const extRes = await apiService.getMarketplaceExtensions(auth);
      if (extRes.status === 'success') {
        setListings(extRes.data);
      }
    } catch (err) {
      console.error('Error fetching ecosystem data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManifestUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUploadError(null);
      setUploadSuccess(false);
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const manifest = JSON.parse(ev.target?.result as string) as NextflowManifest;
          const payload = {
            name: manifest.name,
            description: manifest.description || '',
            vendor: manifest.developer.name,
            version: manifest.version,
            asset_type: 'ui_extension',
            manifest_url: manifest.source_url || 'https://cdn.example.com/manifest.json',
            code_content: manifest.code || ''
          };

          const res = await apiService.submitExtension(auth, payload);
          if (res.status === 'success') {
            setUploadSuccess(true);
            setActiveTab('listings');
            fetchData();
          } else {
            setUploadError(res.message);
          }
        } catch {
          setUploadError('File không hợp lệ — phải là JSON đúng format manifest.');
        }
      };
      reader.readAsText(file);
    },
    [] // eslint-disable-next-line react-hooks/exhaustive-deps
  );

  const statusColor: Record<ReviewStatus, string> = {
    PENDING: '#f59e0b',
    APPROVED: '#22c55e',
    REJECTED: '#ef4444',
    DRAFT: '#64748b',
  };

  const renderCard = (listing: ExtensionDB) => (
    <div
      key={listing.id}
      className="publisher-card"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '24px',
        background: 'rgba(30, 41, 59, 0.45)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{listing.name}</h3>
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code style={{ fontSize: '11px', color: 'var(--color-accent)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>v{listing.version}</code>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>by {listing.vendor}</span>
          </div>
          <p style={{ margin: '14px 0 0 0', color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.5 }}>{listing.description}</p>
        </div>
        
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '20px',
            background: statusColor[listing.status] || '#ccc',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}
        >
          {listing.status}
        </span>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="var(--color-accent)" /> AI Security Audit
          </span>
          <span style={{ 
            color: listing.risk_level === 'LOW' ? '#22c55e' : listing.risk_level === 'MEDIUM' ? '#f59e0b' : '#ef4444', 
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.5px'
          }}>
            {listing.risk_level === 'LOW' ? '🟢 AN TOÀN' : listing.risk_level === 'MEDIUM' ? '🟡 RỦI RO THẤP' : '🔴 CẢNH BÁO'}
          </span>
        </div>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-dim)', lineHeight: 1.5 }}>{listing.ai_audit_notes || 'Chưa kiểm định'}</p>
        
        {listing.tx_hash && (
          <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '10px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> Blockchain Verified
            </span>
            <code style={{ fontSize: '11px', color: '#a855f7', display: 'block', wordBreak: 'break-all', marginTop: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
              Tx: {listing.tx_hash}
            </code>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          Từ chối (Reject)
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
        >
          Duyệt & Phát hành
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ecosystem Hub & Catalog
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: '6px 0 0 0' }}>
          Dành cho Platform Admin & Developers. Phát hành, kiểm duyệt ứng dụng và kiểm soát phân hệ giải pháp NextFlow OS.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: activeTab === 'listings' ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            fontWeight: 600,
            background: activeTab === 'listings' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            color: activeTab === 'listings' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <Layers size={16} /> Quản lý App Chờ Duyệt
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: activeTab === 'submit' ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            fontWeight: 600,
            background: activeTab === 'submit' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            color: activeTab === 'submit' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <FileCode size={16} /> Submit Solution Pack
        </button>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Đang truy vấn trạng thái từ Blockchain & CSDL...
        </div>
      )}

      {/* Tab: Submit */}
      {activeTab === 'submit' && (
        <div style={{ background: 'rgba(30, 41, 59, 0.45)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, fontWeight: 700, color: '#fff' }}>Đăng ký Gói Giải pháp Mới (Vendor)</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Tải lên tệp tin manifest cấu hình ứng dụng dạng <code>manifest.json</code>. Hệ thống AI Security Auditor sẽ tự động quét mã nguồn và neo giữ bảo chứng chống sửa đổi lên chuỗi khối U2U Network.
          </p>

          <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '40px', borderRadius: '12px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.3)', cursor: 'pointer', transition: 'border-color 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
               onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            <input
              type="file"
              accept=".json"
              id="manifest-file"
              onChange={handleManifestUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="manifest-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <PlayCircle size={32} color="var(--color-accent)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Bấm để tải tệp tin manifest.json</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Định dạng JSON chứa thuộc tính gói giải pháp</span>
            </label>
          </div>

          {uploadError && <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '13px' }}>❌ {uploadError}</p>}
          {uploadSuccess && <p style={{ color: 'var(--color-accent)', marginTop: '16px', fontSize: '13px' }}>✅ Đã xác minh & kiểm tra bảo mật gói thành công!</p>}
        </div>
      )}

      {/* Tab: Listings */}
      {activeTab === 'listings' && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {listings.map(renderCard)}
          {listings.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              Chưa có ứng dụng nào được xuất bản hoặc cần duyệt.
            </div>
          )}
        </div>
      )}
      <style>{`
        .publisher-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-accent) !important;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25), 0 0 15px rgba(34, 197, 94, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default EcosystemPublisher;
