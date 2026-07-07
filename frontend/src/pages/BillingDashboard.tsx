import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api';

import { useAuth } from '../contexts/AuthContext';

export default function BillingDashboard() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [auth]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInvoices(auth);
      setInvoices(data.invoices || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu tài chính...</div>;
  if (error) return <div style={{ padding: '20px', color: '#ef4444' }}>Lỗi: {error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-main)' }}>
        <DollarSign size={24} color="var(--color-primary)" /> Quản Lý Dòng Tiền (Billing & Payments)
      </h2>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>TỔNG DOANH THU (ĐÃ THU)</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-success)', marginTop: '8px' }}>
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>CHỜ THANH TOÁN (CÔNG NỢ)</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)', marginTop: '8px' }}>
            ${pendingRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '15px' }}>Danh sách Hóa đơn</h3>
        </div>
        
        {invoices.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
            Chưa có hóa đơn nào được tạo.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ textAlign: 'left', background: '#f1f5f9', color: 'var(--text-muted)' }}>
              <tr>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Mã Hóa đơn (ID)</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Số tiền</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Ngày tạo</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                    {inv.id.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {inv.status === 'PAID' ? (
                      <span className="badge badge-high" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none' }}>
                        <CheckCircle size={10} style={{ marginRight: '4px' }} /> Đã thanh toán
                      </span>
                    ) : (
                      <span className="badge badge-medium" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none' }}>
                        <Clock size={10} style={{ marginRight: '4px' }} /> Chờ thanh toán
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    {inv.payment_link_url && inv.status !== 'PAID' && (
                      <a 
                        href={inv.payment_link_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Thanh toán <ExternalLink size={10} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}



