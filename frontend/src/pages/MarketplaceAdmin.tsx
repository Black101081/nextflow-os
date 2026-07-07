import React, { useState, useEffect, useCallback } from 'react';
import { apiService, AuthConfig } from '../services/api';
import type { NextflowManifest } from '../types/sdk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const MarketplaceAdmin: React.FC = () => {
  const [listings, setListings] = useState<ExtensionDB[]>([]);
  const [recommendations, setRecommendations] = useState<ExtensionDB[]>([]);
  const [recommendationInsight, setRecommendationInsight] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'recommendations' | 'submit'>('listings');
  const [isLoading, setIsLoading] = useState(false);

  // Giả lập config Auth của user hiện tại
  const auth: AuthConfig = {
    tenantId: '00000000-0000-0000-0000-000000000001',
    apiKey: 'pk_live_123',
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
      const recRes = await apiService.getMarketplaceRecommendations(auth);
      if (recRes.status === 'success') {
        setRecommendations(recRes.data);
        setRecommendationInsight(recRes.recommendation_insight);
      }
    } catch (err) {
      console.error('Error fetching marketplace data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Upload manifest JSON ─────────────────────────────────────────────────
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
          
          // Giả lập code content gửi lên để AI quét
          const mockCodeContent = "console.log('Safe code snippet');" + (manifest.name.includes("Hack") ? " eval(data);" : "");

          const payload = {
            name: manifest.name,
            description: manifest.description || '',
            vendor: manifest.developer.name,
            version: manifest.version,
            asset_type: 'ui_extension',
            manifest_url: 'https://cdn.example.com/manifest.json',
            code_content: mockCodeContent
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
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const statusColor: Record<ReviewStatus, string> = {
    PENDING: '#f59e0b',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    DRAFT: '#9ca3af',
  };

  const renderCard = (listing: ExtensionDB) => (
    <div
      key={listing.id}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{listing.name}</h3>
        <code style={{ fontSize: 12, color: '#6b7280' }}>v{listing.version} by {listing.vendor}</code>
        <p style={{ margin: '4px 0', color: '#374151', fontSize: 13 }}>{listing.description}</p>
        
        <span
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '4px 12px',
            borderRadius: 20,
            background: statusColor[listing.status] || '#ccc',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {listing.status}
        </span>
      </div>

      <div style={{ marginTop: 16, background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#4b5563' }}>AI Security Audit</span>
          <span style={{ 
            color: listing.risk_level === 'LOW' ? '#10b981' : listing.risk_level === 'MEDIUM' ? '#f59e0b' : '#ef4444', 
            fontWeight: 700 
          }}>
            {listing.risk_level === 'LOW' ? '🟢 AN TOÀN' : listing.risk_level === 'MEDIUM' ? '🟡 RỦI RO THẤP' : '🔴 CẢNH BÁO'}
          </span>
        </div>
        <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>{listing.ai_audit_notes || 'Chưa kiểm định'}</p>
        
        {listing.tx_hash && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 8 }}>
            <span style={{ fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}>
              🔗 Blockchain Verified
            </span>
            <code style={{ fontSize: 11, color: '#8b5cf6', display: 'block', wordBreak: 'break-all', marginTop: 4 }}>
              Tx: {listing.tx_hash}
            </code>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#6366f1',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Cài đặt
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        🛒 Nextflow Marketplace (Web3 & AI Powered)
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Hệ sinh thái mở rộng với Smart Contracts phân chia doanh thu và AI kiểm duyệt.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['listings', 'recommendations', 'submit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              background: activeTab === tab ? '#6366f1' : '#f3f4f6',
              color: activeTab === tab ? '#fff' : '#374151',
            }}
          >
            {tab === 'listings' && '📋 Tất cả Extensions'}
            {tab === 'recommendations' && '✨ Gợi ý từ AI'}
            {tab === 'submit' && '📤 Submit Manifest (Devs)'}
          </button>
        ))}
      </div>

      {isLoading && <p>Đang tải dữ liệu từ Blockchain & Hệ thống...</p>}

      {/* ─── Tab: Listings ─────────────────────────────────────────────────── */}
      {activeTab === 'listings' && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {listings.map(renderCard)}
          {listings.length === 0 && <p>Chưa có Extension nào.</p>}
        </div>
      )}

      {/* ─── Tab: Recommendations ───────────────────────────────────────────── */}
      {activeTab === 'recommendations' && !isLoading && (
        <div>
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>AI Insight (Dựa trên dữ liệu vận hành):</strong>
              {recommendationInsight}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recommendations.map(renderCard)}
            {recommendations.length === 0 && <p>Hiện không có gợi ý nào phù hợp.</p>}
          </div>
        </div>
      )}

      {/* ─── Tab: Submit ───────────────────────────────────────────────────── */}
      {activeTab === 'submit' && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Đăng ký Extension Mới (Vendor)</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Tải lên file <code>manifest.json</code> của bạn. AI Security Auditor sẽ quét mã nguồn, 
            sau đó Neo mã (Anchor) lên Blockchain (U2U Network) để đảm bảo tính toàn vẹn.
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleManifestUpload}
            style={{ marginTop: 16 }}
          />
          {uploadError && <p style={{ color: '#ef4444', marginTop: 12 }}>❌ {uploadError}</p>}
          {uploadSuccess && <p style={{ color: '#10b981', marginTop: 12 }}>✅ Tải lên & Audit thành công!</p>}
        </div>
      )}
    </div>
  );
};

export default MarketplaceAdmin;
