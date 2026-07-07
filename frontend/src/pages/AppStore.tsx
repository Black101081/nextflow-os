import React, { useState, useEffect } from 'react';
import { apiService, type AuthConfig } from '../services/api';

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
const AppStore: React.FC = () => {
  const [listings, setListings] = useState<ExtensionDB[]>([]);
  const [recommendations, setRecommendations] = useState<ExtensionDB[]>([]);
  const [recommendationInsight, setRecommendationInsight] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'recommendations'>('listings');
  const [isLoading, setIsLoading] = useState(false);

  // Đọc config Auth của user hiện tại (SME Admin) từ localStorage
  const auth: AuthConfig = (() => {
    const saved = localStorage.getItem('nf_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi khi đọc token từ localStorage:", e);
      }
    }
    // Fallback sang Tenant Demo hiện tại
    return {
      tenantId: '7fa9db99-f5e2-4fbc-9d1a-2603dc5d087e', 
      apiKey: 'nf_live_test_7fa9db99-f5e2-4fbc-9d1a-2603dc5d087e',
    };
  })();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // SME Admin chỉ nên xem các app đã APPROVED, backend cần hỗ trợ filter này
      const extRes = await apiService.getMarketplaceExtensions(auth);
      if (extRes.status === 'success') {
        const approvedOnly = extRes.data.filter((app: ExtensionDB) => app.status === 'APPROVED');
        setListings(approvedOnly);
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

  // ── Render ────────────────────────────────────────────────────────────────
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
        <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>{listing.ai_audit_notes || 'Đã kiểm định an toàn'}</p>
        
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
          onClick={() => alert('Chức năng cài đặt ứng dụng vào workspace')}
        >
          Cài đặt (Install)
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        🛒 App Store (Dành cho SME)
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Duyệt và cài đặt các ứng dụng, tích hợp đã được xác thực an toàn để mở rộng không gian làm việc của bạn.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['listings', 'recommendations'] as const).map((tab) => (
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
            {tab === 'listings' && '📋 Tất cả Ứng dụng'}
            {tab === 'recommendations' && '✨ Gợi ý từ AI cho bạn'}
          </button>
        ))}
      </div>

      {isLoading && <p>Đang tải dữ liệu từ Blockchain & Hệ thống...</p>}

      {/* ─── Tab: Listings ─────────────────────────────────────────────────── */}
      {activeTab === 'listings' && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {listings.map(renderCard)}
          {listings.length === 0 && <p>Hiện chưa có ứng dụng nào.</p>}
        </div>
      )}

      {/* ─── Tab: Recommendations ───────────────────────────────────────────── */}
      {activeTab === 'recommendations' && !isLoading && (
        <div>
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>AI Insight (Dựa trên dữ liệu vận hành):</strong>
              {recommendationInsight || 'Chưa có phân tích.'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recommendations.map(renderCard)}
            {recommendations.length === 0 && <p>Hiện không có gợi ý nào phù hợp.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppStore;
