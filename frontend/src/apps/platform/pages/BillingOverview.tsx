import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../shared/services/api';
import { DollarSign, ShieldCheck, AlertTriangle, TrendingUp, CheckCircle, XCircle, Lock, Shield, Terminal, Cpu } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid } from 'recharts';

export default function BillingOverview() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [aiPayoutCount, setAiPayoutCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [verifyResults, setVerifyResults] = useState<Record<string, any>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiService.getPlatformBillingOverview();
      setInvoices(data.recent_invoices || []);
      setRevenueTrend(data.monthly_revenue || []);
      
      const aiData = await apiService.getPlatformAiUsage();
      const payoutEndpoint = (aiData.usage_by_endpoint || []).find((e: any) => e.endpoint === 'AUTO_PAYOUT');
      setAiPayoutCount(payoutEndpoint ? payoutEndpoint.calls : 0);
    } catch { 
      setInvoices([]); 
      setRevenueTrend([]);
    }
    finally { setLoading(false); }
  };

  const handleVerify = async (invoiceId: string) => {
    setVerifyingId(invoiceId);
    try {
      // Simulate connecting to Blockchain Node
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = await apiService.verifyInvoiceIntegrity(invoiceId);
      setVerifyResults(prev => ({ ...prev, [invoiceId]: result }));
    } catch {
      setVerifyResults(prev => ({ ...prev, [invoiceId]: { status: 'ERROR', message: 'Không thể xác thực' } }));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    const headers = ['ID,Tenant ID,Số Tiền,Trang Thái,Loại Hóa Đơn,Ngày Tạo,Tx Hash\n'];
    const csvData = invoices.map(i => `${i.id},${i.tenant_id},${i.amount},${i.status},${i.invoice_type},${i.created_at},${i.tx_hash || ''}`).join('\n');
    const blob = new Blob([headers + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'platform_invoices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const anchoredCount = invoices.filter(i => i.tx_hash).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9', fontFamily: '"Outfit", sans-serif' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={28} color="#34d399" /> Sci-Fi Financial Ledger
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '8px 0 0 0' }}>
            Giám sát Dòng tiền Platform, tính toàn vẹn U2U Blockchain và nhật ký AI Auto-Payout tự động.
          </p>
        </div>
        <div style={{ padding: '8px 16px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '13px' }}>
          <Shield size={16} /> U2U Blockchain Secured
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.2)' }}><DollarSign size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, letterSpacing: '0.05em' }}>TỔNG DOANH THU</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{revenueTrend.reduce((sum, m) => sum + (m.revenue || 0), 0).toLocaleString('vi-VN')} đ</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(245, 158, 11, 0.2)' }}><AlertTriangle size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 800, letterSpacing: '0.05em' }}>CHỜ THANH TOÁN</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{invoices.filter(i => i.status === 'UNPAID' || i.status === 'PENDING').length} hóa đơn</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(99, 102, 241, 0.2)' }}><ShieldCheck size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 800, letterSpacing: '0.05em' }}>BLOCKCHAIN ANCHORED</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{anchoredCount}/{invoices.length} <span style={{ fontSize: '14px', color: '#818cf8' }}>({invoices.length > 0 ? Math.round(anchoredCount/invoices.length*100) : 0}%)</span></div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderRadius: '14px', padding: '14px', boxShadow: 'inset 0 0 10px rgba(168, 85, 247, 0.2)' }}><TrendingUp size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#a855f7', fontWeight: 800, letterSpacing: '0.05em' }}>AI AUTO-PAYOUT</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{aiPayoutCount} GD</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Revenue Trend Chart */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#34d399" /> Biểu đồ Doanh thu (6 tháng)
          </h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                <ChartTooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '12px', color: '#fff', fontSize: '13px', boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)' }} 
                  formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blockchain Integrity Summary */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#818cf8" /> Blockchain Trust Matrix
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>TỶ LỆ XÁC THỰC THÀNH CÔNG</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>{invoices.filter(i => i.status === 'PAID').length} <span style={{ fontSize: '16px', color: '#64748b' }}>/ {invoices.length}</span></div>
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${invoices.length > 0 ? (invoices.filter(i => i.status === 'PAID').length/invoices.length)*100 : 0}%`, background: 'linear-gradient(90deg, #34d399, #10b981)', borderRadius: '4px', transition: 'width 0.5s', boxShadow: '0 0 10px #34d399' }} />
              </div>
            </div>
            
            <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(168, 85, 247, 0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={14} /> AI SYSTEM LOG
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#d8b4fe', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                <span style={{ color: '#a855f7' }}>{'>'}</span> Initialization sequence... OK<br/>
                <span style={{ color: '#a855f7' }}>{'>'}</span> Auto-Payout Engine... ACTIVE<br/>
                {aiPayoutCount > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <span style={{ color: '#34d399' }}>{'>'}</span> Success: Processed {aiPayoutCount} transactions.
                  </motion.div>
                ) : (
                  <span style={{ color: '#64748b' }}>{'>'} Awaiting payout commands...</span>
                )}
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={20} color="#fbbf24" /> Hóa đơn Kỹ thuật số (Ledger)
          </h3>
          <button 
            onClick={handleExportCSV}
            style={{
              padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Export Ledger
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Scanning Ledger...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>ID HÓA ĐƠN</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>SỐ TIỀN</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>TRẠNG THÁI</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>BLOCKCHAIN TX HASH</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>TOÀN VẸN</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any, idx: number) => (
                  <motion.tr 
                    key={inv.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <td style={{ padding: '16px 12px' }}><code style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace' }}>{inv.id?.slice(0, 12)}...</code></td>
                    <td style={{ padding: '16px 12px', fontWeight: 700, color: '#f8fafc' }}>{Number(inv.amount || 0).toLocaleString('vi-VN')} đ</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '16px',
                        background: inv.status === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: inv.status === 'PAID' ? '#34d399' : '#fbbf24',
                        border: `1px solid ${inv.status === 'PAID' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {inv.tx_hash ? (
                        <div className="tx-hash-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <Terminal size={14} color="#a855f7" />
                          <code style={{ fontSize: '12px', color: '#c084fc', fontFamily: 'monospace' }}>{inv.tx_hash.slice(0, 16)}...</code>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Chưa neo</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <AnimatePresence mode="wait">
                        {verifyingId === inv.id ? (
                          <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '12px', fontWeight: 600 }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Lock size={14} /></motion.div>
                            Verifying...
                          </motion.div>
                        ) : verifyResults[inv.id] ? (
                          <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
                            fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                            color: verifyResults[inv.id].status === 'VERIFIED' ? '#34d399' : (verifyResults[inv.id].status === 'TAMPERED' ? '#ef4444' : '#fbbf24')
                          }}>
                            {verifyResults[inv.id].status === 'VERIFIED' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {verifyResults[inv.id].status}
                          </motion.div>
                        ) : (
                          <span key="none" style={{ fontSize: '12px', color: '#64748b' }}>—</span>
                        )}
                      </AnimatePresence>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleVerify(inv.id)}
                        disabled={verifyingId === inv.id}
                        style={{ 
                          padding: '6px 12px', fontSize: '12px', background: verifyingId === inv.id ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.1)', 
                          color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', cursor: verifyingId === inv.id ? 'not-allowed' : 'pointer', 
                          fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                          opacity: verifyingId === inv.id ? 0.5 : 1
                        }}
                        onMouseOver={(e) => !verifyingId && (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)')}
                        onMouseOut={(e) => !verifyingId && (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
                      >
                        <ShieldCheck size={14} /> Verify Integrity
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Chưa có hóa đơn nào trong hệ thống.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .tx-hash-hover:hover code {
          color: #e879f9 !important;
          text-shadow: 0 0 8px #e879f9;
        }
      `}</style>
    </div>
  );
}
