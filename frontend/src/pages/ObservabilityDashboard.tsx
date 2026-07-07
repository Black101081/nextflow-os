import { useState, useEffect } from 'react';
import { Activity, Database, PlayCircle, ShieldCheck, Cpu } from 'lucide-react';

export default function ObservabilityDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const authStr = localStorage.getItem('nf_auth');
      if (!authStr) return;
      const auth = JSON.parse(authStr);
      
      // Mặc định gọi API lấy dữ liệu. 
      // Do apiService chưa có type cho báo cáo này, ta dùng fetch nội bộ hoặc gọi qua route
      const res = await fetch(`http://localhost:8000/api/v1/analytics/daily-reports`, {
        headers: {
          'x-nextflow-tenant-id': auth.tenantId,
          'x-nextflow-api-key': auth.apiKey
        }
      });
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const authStr = localStorage.getItem('nf_auth');
      if (!authStr) return;
      const auth = JSON.parse(authStr);
      
      const res = await fetch(`http://localhost:8000/api/v1/analytics/generate-daily-report`, {
        method: 'POST',
        headers: {
          'x-nextflow-tenant-id': auth.tenantId,
          'x-nextflow-api-key': auth.apiKey
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã chốt sổ và sinh báo cáo AI thành công!');
        fetchReports();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={28} color="#10b981" />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Business Observability</h2>
        </div>
        <button 
          onClick={handleGenerateReport} 
          disabled={loading}
          style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: 600,
            opacity: loading ? 0.7 : 1
          }}>
          <PlayCircle size={18} /> {loading ? 'Đang phân tích...' : 'Chốt Báo cáo Hôm nay'}
        </button>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
        Mô-đun giám sát hiệu năng nghiệp vụ. Báo cáo hàng ngày được sinh tự động bởi AI và neo lên <strong>Blockchain (Data Anchoring)</strong> để đảm bảo tính bất biến, không thể bị chỉnh sửa bởi bất kỳ ai (kể cả System Admin).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            Chưa có báo cáo ngày nào được ghi nhận.
          </div>
        ) : reports.map(r => (
          <div key={r.report_id} style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={16} color="#3b82f6" />
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Báo cáo Ngày: {r.report_date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '16px' }}>
                <ShieldCheck size={14} /> Blockchain Verified
              </div>
            </div>

            <div style={{ padding: '16px', display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Tổng Tác vụ</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{r.total_tasks}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Đã Hoàn thành</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{r.completed_tasks}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Vi phạm SLA</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{r.sla_violations}</div>
                </div>
              </div>

              <div style={{ flex: 1.5, background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>
                  <Cpu size={14} /> Trợ lý AI Phân tích
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#e2e8f0' }}>
                  {r.ai_insights}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '11px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Data Hash:</strong> {r.data_hash}</span>
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div><strong>Tx Hash (U2U Network):</strong> <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>{r.tx_hash}</a></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
