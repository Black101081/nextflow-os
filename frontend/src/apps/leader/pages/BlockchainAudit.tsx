import { useState, useEffect } from 'react';
import { ShieldCheck, Link2, Loader2, Database, Key, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiService } from '../../../shared/services/api';

export default function BlockchainAudit() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingMap, setVerifyingMap] = useState<Record<string, { loading: boolean; result?: any; error?: string }>>({});

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiService.getInvoices({});
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (invoiceId: string) => {
    setVerifyingMap(prev => ({ ...prev, [invoiceId]: { loading: true } }));
    try {
      const res = await apiService.verifyInvoiceIntegrity(invoiceId);
      setVerifyingMap(prev => ({ ...prev, [invoiceId]: { loading: false, result: res } }));
    } catch (err: any) {
      setVerifyingMap(prev => ({ ...prev, [invoiceId]: { loading: false, error: err.message } }));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'var(--color-success)';
      case 'UNPAID': return 'var(--color-warning)';
      case 'CANCELLED': return 'var(--color-danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#e5e5e5', border: '1px solid #333' }}>
      <div className="panel-header" style={{ borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        <div>
          <h2 className="panel-title" style={{ fontSize: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#10b981" />
            Blockchain Audit Trail
          </h2>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
            Minh bạch tuyệt đối. Mọi giao dịch tài chính (Invoices) đều được mã hoá (SHA-256) và neo trên mạng lưới Blockchain L1 để chống sửa đổi dữ liệu (Immutable Ledger).
          </p>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} className="spin" color="#10b981" />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <Database size={48} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
            <p>Chưa có bản ghi giao dịch nào trên mạng lưới.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {invoices.map((inv) => (
              <div key={inv.id} style={{ 
                background: '#141414', 
                border: '1px solid #333', 
                borderRadius: '8px', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Header of Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Block: {inv.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: getStatusColor(inv.status), fontWeight: 600, fontSize: '14px' }}>
                      {inv.amount.toLocaleString('vi-VN')} {inv.currency}
                    </span>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                      {inv.status}
                    </span>
                  </div>
                </div>

                {/* Body of Block (Hashes) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  
                  {/* Data Hash */}
                  <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '4px', border: '1px solid #222' }}>
                    <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Key size={14} /> Local Data Hash (SHA-256)
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#10b981', wordBreak: 'break-all' }}>
                      {inv.data_hash || "PENDING_SYNC"}
                    </div>
                  </div>

                  {/* TX Hash */}
                  <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '4px', border: '1px solid #222' }}>
                    <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Link2 size={14} /> Blockchain TX Hash (L1 Anchor)
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#3b82f6', wordBreak: 'break-all' }}>
                      {inv.tx_hash ? (
                        <a href={`https://explorer.example.com/tx/${inv.tx_hash}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                          {inv.tx_hash}
                        </a>
                      ) : (
                        "PENDING_NETWORK_CONFIRMATION"
                      )}
                    </div>
                  </div>

                </div>

                {/* Verification result area */}
                {verifyingMap[inv.id] && (
                  <div style={{
                    marginTop: '4px',
                    padding: '12px',
                    borderRadius: '4px',
                    background: verifyingMap[inv.id].loading ? 'rgba(255,255,255,0.05)' :
                                verifyingMap[inv.id].result?.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' :
                                verifyingMap[inv.id].result?.status === 'TAMPERED' ? 'rgba(239, 68, 68, 0.15)' :
                                'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${
                                verifyingMap[inv.id].loading ? '#333' :
                                verifyingMap[inv.id].result?.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.3)' :
                                verifyingMap[inv.id].result?.status === 'TAMPERED' ? '#ef4444' :
                                'rgba(245, 158, 11, 0.3)'
                    }`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {verifyingMap[inv.id].loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#aaa' }}>
                        <Loader2 size={16} className="spin" color="#3b82f6" />
                        Đang truy vấn U2U Smart Contract để đối soát...
                      </div>
                    ) : verifyingMap[inv.id].error ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ef4444' }}>
                        <AlertTriangle size={16} />
                        Lỗi xác thực: {verifyingMap[inv.id].error}
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, 
                          color: verifyingMap[inv.id].result.status === 'VERIFIED' ? '#10b981' : 
                                 verifyingMap[inv.id].result.status === 'TAMPERED' ? '#ef4444' : '#f59e0b'
                        }}>
                          {verifyingMap[inv.id].result.status === 'VERIFIED' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                          Trạng thái: {verifyingMap[inv.id].result.status}
                        </div>
                        <div style={{ fontSize: '13px', color: '#ddd' }}>
                          {verifyingMap[inv.id].result.message}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '4px' }}>
                          Expected Hash: {verifyingMap[inv.id].result.expected_hash}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Footer of Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666', paddingTop: '8px', borderTop: '1px solid #222' }}>
                  <span>Work Item ID: {inv.work_item_id.substring(0, 8)}...</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => handleVerify(inv.id)}
                      disabled={verifyingMap[inv.id]?.loading}
                      style={{
                        background: 'transparent',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!verifyingMap[inv.id]?.loading) e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        if (!verifyingMap[inv.id]?.loading) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <RefreshCw size={12} className={verifyingMap[inv.id]?.loading ? "spin" : ""} />
                      Xác thực On-chain
                    </button>
                    <span>Timestamp: {new Date(inv.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
