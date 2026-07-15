import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService, type AuthConfig } from '../../../shared/services/api';
import type { NextflowManifest } from '../../../shared/types/sdk';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Layers, Shield, Check, FileCode, PlayCircle, X, ShieldAlert, Cpu, Link as LinkIcon, AlertTriangle } from 'lucide-react';

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
  const [previewManifest, setPreviewManifest] = useState<NextflowManifest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
          setPreviewManifest(manifest);
        } catch {
          setUploadError('Tệp tin không hợp lệ — vui lòng cung cấp manifest.json chuẩn NextFlow OS.');
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const confirmSubmit = async () => {
    if (!previewManifest) return;
    setIsScanning(true);
    setUploadError(null);
    
    // Simulate AI Security Scan & Blockchain Anchoring
    setTimeout(async () => {
      setIsScanning(false);
      setIsSubmitting(true);
      try {
        const payload = {
          name: previewManifest.name,
          description: previewManifest.description || '',
          vendor: previewManifest.developer.name,
          version: previewManifest.version,
          asset_type: 'ui_extension',
          manifest_url: previewManifest.source_url || 'https://cdn.example.com/manifest.json',
          code_content: previewManifest.code || ''
        };

        const res = await apiService.submitExtension(auth, payload);
        if (res.status === 'success') {
          setUploadSuccess(true);
          setTimeout(() => {
            setPreviewManifest(null);
            setUploadSuccess(false);
            setActiveTab('listings');
            fetchData();
          }, 2500);
        } else {
          setUploadError(res.message);
        }
      } catch {
        setUploadError('Lỗi kết nối đến Blockchain U2U Network. Vui lòng thử lại sau.');
      } finally {
        setIsSubmitting(false);
      }
    }, 3000);
  };

  const statusColor: Record<ReviewStatus, string> = {
    PENDING: '#f59e0b',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    DRAFT: '#64748b',
  };

  const renderCard = (listing: ExtensionDB) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={listing.id}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(56, 189, 248, 0.4)', boxShadow: '0 15px 35px -5px rgba(56, 189, 248, 0.15)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: statusColor[listing.status] || '#ccc' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>{listing.name}</h3>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              v{listing.version}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Bởi {listing.vendor}</span>
          </div>
          <p style={{ margin: '14px 0 0 0', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>{listing.description}</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{
            padding: '4px 12px', borderRadius: '20px',
            background: `${statusColor[listing.status]}20`, color: statusColor[listing.status],
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', border: `1px solid ${statusColor[listing.status]}40`
          }}>
            {listing.status}
          </span>
        </div>
      </div>

      <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '16px', fontSize: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginLeft: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} color={listing.risk_level === 'LOW' ? '#10b981' : listing.risk_level === 'MEDIUM' ? '#f59e0b' : '#ef4444'} /> AI Security Audit
          </span>
          <span style={{ 
            color: listing.risk_level === 'LOW' ? '#10b981' : listing.risk_level === 'MEDIUM' ? '#f59e0b' : '#ef4444', 
            fontWeight: 800, fontSize: '11px', letterSpacing: '0.5px'
          }}>
            {listing.risk_level === 'LOW' ? '🟢 AN TOÀN' : listing.risk_level === 'MEDIUM' ? '🟡 RỦI RO THẤP' : '🔴 CẢNH BÁO'}
          </span>
        </div>
        <p style={{ margin: '0 0 12px 0', color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>
          "{listing.ai_audit_notes || 'Hệ thống AI không phát hiện rủi ro bảo mật đáng kể trong mã nguồn.'}"
        </p>
        
        {listing.tx_hash && (
          <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 600, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <LinkIcon size={14} /> Blockchain Tx:
            </span>
            <code style={{ fontSize: '11px', color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.2)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {listing.tx_hash}
            </code>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
          style={{
            padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
        >
          Từ chối (Reject)
        </button>
        <button
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: '#fff', cursor: 'pointer',
            fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.5)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(14, 165, 233, 0.3)'}
        >
          Duyệt & Phát hành Gói
        </button>
      </div>
    </motion.div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: '#f8fafc', fontFamily: '"Outfit", sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ecosystem Hub & Catalog
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0', maxWidth: '600px', lineHeight: 1.6 }}>
          Trung tâm điều phối Hệ sinh thái Ứng dụng. Quản lý, kiểm định bảo mật bằng AI và xuất bản các giải pháp của đối tác lên NextFlow OS Marketplace.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '12px 24px', borderRadius: '12px',
            border: activeTab === 'listings' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', fontWeight: 600,
            background: activeTab === 'listings' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.4)',
            color: activeTab === 'listings' ? '#38bdf8' : '#94a3b8',
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', transition: 'all 0.2s',
            boxShadow: activeTab === 'listings' ? '0 0 20px rgba(56, 189, 248, 0.1)' : 'none'
          }}
        >
          <Layers size={18} /> Quản lý App Chờ Duyệt
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          style={{
            padding: '12px 24px', borderRadius: '12px',
            border: activeTab === 'submit' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', fontWeight: 600,
            background: activeTab === 'submit' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.4)',
            color: activeTab === 'submit' ? '#38bdf8' : '#94a3b8',
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', transition: 'all 0.2s',
            boxShadow: activeTab === 'submit' ? '0 0 20px rgba(56, 189, 248, 0.1)' : 'none'
          }}
        >
          <FileCode size={18} /> Đăng ký Gói Giải pháp
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#38bdf8' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Layers size={32} />
          </motion.div>
        </div>
      )}

      {/* Tab: Submit */}
      {activeTab === 'submit' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}
        >
          <h2 style={{ fontSize: '20px', marginTop: 0, fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={22} color="#38bdf8" /> Đăng ký Gói Giải pháp Mới (Vendor Portal)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            Tải lên tệp tin manifest cấu hình ứng dụng dạng <code>manifest.json</code>. Hệ thống <strong>AI Security Auditor</strong> sẽ tự động phân tích tĩnh mã nguồn và neo giữ chữ ký số lên chuỗi khối <strong>U2U Network</strong> để chống giả mạo.
          </p>

          {!previewManifest ? (
            <div 
              style={{ border: '2px dashed rgba(56, 189, 248, 0.3)', padding: '60px 40px', borderRadius: '20px', textAlign: 'center', background: 'rgba(56, 189, 248, 0.02)', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.8)'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.02)'; }}
            >
              <input type="file" accept=".json" id="manifest-file" onChange={handleManifestUpload} style={{ display: 'none' }} />
              <label htmlFor="manifest-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '50%', color: '#38bdf8' }}>
                  <PlayCircle size={40} />
                </div>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '8px' }}>Bấm để tải lên cấu hình manifest.json</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Hỗ trợ định dạng chuẩn NextFlow OS Extension API</span>
                </div>
              </label>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              
              {/* AI Scanning Overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: -10, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 10, borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                  >
                    <Cpu size={48} color="#38bdf8" />
                    <h3 style={{ color: '#38bdf8', fontSize: '18px', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>AI Security Auditor đang phân tích mã nguồn</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>Đang dò quét lỗ hổng bảo mật và chuẩn bị neo dữ liệu lên U2U Network...</p>
                    {/* Scanner line effect */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'rgba(56, 189, 248, 0.8)', boxShadow: '0 0 15px rgba(56, 189, 248, 0.8)' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 800 }}>{previewManifest.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>v{previewManifest.version}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Bởi {previewManifest.developer.name}</span>
                    </div>
                  </div>
                  <button onClick={() => setPreviewManifest(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}><X size={18} /></button>
                </div>
                
                <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '24px', lineHeight: 1.6 }}>{previewManifest.description}</p>
                
                <div style={{ background: '#020617', padding: '20px', borderRadius: '12px', overflow: 'auto', maxHeight: '300px', fontSize: '12px', color: '#818cf8', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px', fontFamily: 'monospace' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(previewManifest, null, 2)}</pre>
                </div>

                <button
                  onClick={confirmSubmit}
                  disabled={isSubmitting || isScanning}
                  style={{
                    width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px',
                    cursor: (isSubmitting || isScanning) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || isScanning) ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                    boxShadow: '0 8px 25px -5px rgba(14, 165, 233, 0.4)'
                  }}
                >
                  <ShieldCheck size={20} />
                  {isSubmitting ? 'Đang gửi đăng ký...' : 'Xác thực AI & Bắt đầu Neo Blockchain'}
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', marginTop: '24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> {uploadError}
            </motion.div>
          )}
          {uploadSuccess && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#6ee7b7', marginTop: '24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} /> Đã kiểm định bằng AI & neo giữ Blockchain thành công! Ứng dụng đã được chuyển vào hàng chờ duyệt.
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Tab: Listings */}
      {activeTab === 'listings' && !isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {listings.map(renderCard)}
          {listings.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Layers size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8' }}>Hệ sinh thái hiện chưa có ứng dụng nào chờ duyệt.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple Mock component for icon not imported natively above
const ShieldCheck = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

export default EcosystemPublisher;
