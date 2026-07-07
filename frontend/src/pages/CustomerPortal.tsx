import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  CheckCircle, 
  Search, 
  PlusCircle, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function CustomerPortal() {
  // Get tenant ID from query parameter or default to the test tenant
  const queryParams = new URLSearchParams(window.location.search);
  const tenantId = queryParams.get('tenant-id') || 'd290f1ee-6c54-4b01-90e6-d701748f0851';
  
  const customerAuth = {
    tenantId,
    apiKey: `nf_live_test_${tenantId}`
  };

  // State variables
  const [activeMode, setActiveMode] = useState<'track' | 'create'>('track');
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  
  // Create order states
  const [customerName, setCustomerName] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderValue, setOrderValue] = useState('1500000');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('branch_q1');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill tracking ID from query param if available
  useEffect(() => {
    const trackParam = queryParams.get('track-id');
    if (trackParam) {
      setTrackingId(trackParam);
      handleTrackOrder(trackParam);
    }
  }, []);

  const handleTrackOrder = async (idToTrack = trackingId) => {
    const cleanId = idToTrack.trim();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setCreatedOrderId(null);
    try {
      const task = await apiService.getWorkItem(customerAuth, cleanId);
      setTrackingResult(task);
    } catch (err: any) {
      setError('Không tìm thấy đơn hàng hợp lệ với mã tra cứu này.');
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !orderTitle.trim() || !shippingAddress.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        title: `Đơn hàng: ${orderTitle}`,
        priority: parseFloat(orderValue) >= 10000000 ? 'HIGH' : 'MEDIUM',
        category: 'OPERATIONS',
        source: 'CUSTOMER_PORTAL',
        metadata: {
          customer_name: customerName,
          shipping_address: shippingAddress,
          order_value: parseFloat(orderValue) || 0,
          branch_id: selectedBranch,
          notes: orderNotes,
          evidences: []
        }
      };

      const result = await apiService.createWorkItem(customerAuth, payload);
      setCreatedOrderId(result.id);
      setTrackingId(result.id);
      // Auto pre-populate search result
      setTrackingResult(result);
      
      // Reset form fields
      setCustomerName('');
      setOrderTitle('');
      setOrderValue('1500000');
      setShippingAddress('');
      setOrderNotes('');
      
    } catch (err: any) {
      setError(err.message || 'Lỗi khi khởi tạo đơn hàng mới.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
      color: '#f8fafc',
      fontFamily: '"Inter", system-ui, sans-serif',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual background glow elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.05)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 16px',
            borderRadius: '100px',
            marginBottom: '16px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              CỔNG DỊCH VỤ KHÁCH HÀNG (SME CLIENT PORTAL)
            </span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 12px 0' }}>
            Nextflow OS Client Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Khởi tạo đơn hàng giao nhận trực tuyến & theo dõi hành trình chuyển phát thời gian thực được xác thực trên nền tảng blockchain.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '6px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => { setActiveMode('track'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeMode === 'track' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
              color: activeMode === 'track' ? '#fff' : '#64748b',
              transition: 'all 0.3s ease'
            }}
          >
            <Search size={16} /> Tra cứu hành trình đơn hàng
          </button>
          <button
            onClick={() => { setActiveMode('create'); setError(''); setCreatedOrderId(null); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeMode === 'create' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'transparent',
              color: activeMode === 'create' ? '#fff' : '#64748b',
              transition: 'all 0.3s ease'
            }}
          >
            <PlusCircle size={16} /> Tạo đơn đặt hàng mới
          </button>
        </div>

        {/* Error alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            padding: '14px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main Body Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>

          {/* MODE: TRA CỨU ĐƠN HÀNG */}
          {activeMode === 'track' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Tra cứu mã vận đơn</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>
                Nhập mã định danh duy nhất (UUID) của đơn hàng để nhận được báo cáo tiến độ check-in hiện trường.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Mã vận đơn (ví dụ: a8b387c2-849c-482a...)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button
                  onClick={() => handleTrackOrder()}
                  disabled={loading}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 24px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  {loading ? 'Đang tải...' : <>Tìm kiếm <ChevronRight size={16} /></>}
                </button>
              </div>

              {/* RENDER TRACKING RESULTS */}
              {trackingResult && (
                <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '32px' }}>
                  
                  {/* Summary Block */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TÊN ĐƠN HÀNG</div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>{trackingResult.title}</h4>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>TRẠNG THÁI HIỆN TẠI</div>
                      <span className={`badge ${
                        trackingResult.status === 'COMPLETED' ? 'badge-completed' 
                        : trackingResult.status === 'SUSPENDED' ? 'badge-high' 
                        : trackingResult.status === 'IN_PROGRESS' ? 'badge-progress' 
                        : 'badge-unassigned'
                      }`} style={{ display: 'inline-block', marginTop: '6px', fontSize: '12px', padding: '4px 10px' }}>
                        {trackingResult.status === 'UNASSIGNED' ? 'Đang chờ xử lý'
                         : trackingResult.status === 'IN_PROGRESS' ? 'Đang giao nhận'
                         : trackingResult.status === 'COMPLETED' ? 'Giao thành công'
                         : trackingResult.status === 'SUSPENDED' ? 'Sự cố phát sinh'
                         : trackingResult.status}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px',
                    fontSize: '13px',
                    color: '#94a3b8'
                  }}>
                    <div>👤 <strong>Người nhận:</strong> {trackingResult.metadata?.customer_name || 'N/A'}</div>
                    <div>🏢 <strong>Chi nhánh gửi:</strong> {
                      trackingResult.metadata?.branch_id === 'branch_q1' ? 'Chi nhánh Quận 1' 
                      : trackingResult.metadata?.branch_id === 'branch_q3' ? 'Chi nhánh Quận 3' 
                      : 'Kho tổng Q12'
                    }</div>
                    <div>💰 <strong>Giá trị hàng hóa:</strong> {trackingResult.metadata?.order_value?.toLocaleString() || 0} VNĐ</div>
                    <div>📍 <strong>Địa chỉ giao:</strong> {trackingResult.metadata?.shipping_address || 'N/A'}</div>
                  </div>

                  {/* Financial / Billing Block */}
                  {trackingResult.invoice_status && (
                    <div style={{
                      marginBottom: '32px',
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: trackingResult.invoice_status === 'PAID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TÌNH TRẠNG THANH TOÁN</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: trackingResult.invoice_status === 'PAID' ? '#34d399' : '#fbbf24', marginTop: '6px' }}>
                          {trackingResult.invoice_amount?.toLocaleString('en-US')} USD — {trackingResult.invoice_status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                        </div>
                      </div>
                      {trackingResult.invoice_status === 'UNPAID' && trackingResult.payment_link_url && (
                        <a href={trackingResult.payment_link_url} target="_blank" rel="noopener noreferrer" style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff', 
                          textDecoration: 'none', 
                          padding: '12px 24px', 
                          borderRadius: '8px', 
                          fontWeight: 600, 
                          fontSize: '14px',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                        }}>
                          Thanh toán ngay
                        </a>
                      )}
                      
                      {/* Blockchain Trust Layer Verification */}
                      {trackingResult.invoice_data_hash && trackingResult.invoice_tx_hash && (
                        <div style={{ width: '100%', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                            <ShieldCheck size={16} /> 🔒 TÀI CHÍNH BẢO MẬT BỞI U2U BLOCKCHAIN
                          </div>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                            Thông tin hóa đơn này đã được niêm phong mật mã học (Data Anchoring). Mọi sửa đổi trái phép từ cơ sở dữ liệu sẽ làm thay đổi chuỗi băm (Hash) và bị phát hiện.
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <strong style={{ color: '#64748b' }}>Data Hash:</strong> {trackingResult.invoice_data_hash}
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <strong style={{ color: '#64748b' }}>Tx Hash:</strong> {trackingResult.invoice_tx_hash}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vertical Progress Timeline */}
                  <div style={{ paddingLeft: '24px', borderLeft: '2px solid rgba(255, 255, 255, 0.06)', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative' }}>
                    
                    {/* Step 1: Placed */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: '-33px', top: '2px',
                        background: '#10b981', width: '16px', height: '16px', borderRadius: '50%',
                        border: '4px solid #0f172a', boxShadow: '0 0 0 1px #10b981'
                      }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Đơn hàng đã được khởi tạo</div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                        Khởi tạo thành công từ cổng Client Portal lúc {new Date(trackingResult.created_at).toLocaleString()}.
                      </p>
                    </div>

                    {/* Step 2: Processing / Dispatched */}
                    <div style={{ position: 'relative', opacity: (trackingResult.status !== 'UNASSIGNED') ? 1 : 0.4 }}>
                      <div style={{
                        position: 'absolute', left: '-33px', top: '2px',
                        background: (trackingResult.status !== 'UNASSIGNED') ? '#3b82f6' : '#334155', 
                        width: '16px', height: '16px', borderRadius: '50%',
                        border: '4px solid #0f172a', 
                        boxShadow: (trackingResult.status !== 'UNASSIGNED') ? '0 0 0 1px #3b82f6' : 'none'
                      }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Đã bàn giao cho nhân viên thực địa</div>
                      {trackingResult.assignee_id ? (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                          Nhiệm vụ giao nhận đã được tiếp nhận bởi nhân sự hiện trường.
                        </p>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                          Đang sắp xếp điều phối nhân sự xử lý chặng cuối.
                        </p>
                      )}
                    </div>

                    {/* Step 3: Check-in / In Transit */}
                    {trackingResult.metadata?.check_in_time && (
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute', left: '-33px', top: '2px',
                          background: '#eab308', width: '16px', height: '16px', borderRadius: '50%',
                          border: '4px solid #0f172a', boxShadow: '0 0 0 1px #eab308'
                        }} />
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📍 Nhân viên đã check-in tại điểm giao
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                          Vị trí GPS: <a href={`https://www.google.com/maps?q=${trackingResult.metadata.check_in_lat},${trackingResult.metadata.check_in_lng}`} target="_blank" rel="noopener noreferrer" style={{ color: '#eab308', textDecoration: 'underline' }}>{trackingResult.metadata.check_in_lat?.toFixed(5)}°, {trackingResult.metadata.check_in_lng?.toFixed(5)}° <ExternalLink size={10} style={{ display: 'inline' }} /></a>
                        </p>
                        <span style={{ fontSize: '10px', color: '#475569' }}>Lúc: {new Date(trackingResult.metadata.check_in_time).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Step 3b: Suspended/Exception */}
                    {trackingResult.status === 'SUSPENDED' && (
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute', left: '-33px', top: '2px',
                          background: '#ef4444', width: '16px', height: '16px', borderRadius: '50%',
                          border: '4px solid #0f172a', boxShadow: '0 0 0 1px #ef4444'
                        }} />
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171' }}>⚠️ Đơn hàng tạm ngưng xử lý</div>
                        <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                          <strong>Ngoại lệ phát sinh:</strong> Hệ thống tự động kích hoạt quy trình xử lý ngoại lệ do chậm trễ hoặc sự cố thực địa.
                        </p>
                      </div>
                    )}

                    {/* Step 4: Completed */}
                    <div style={{ position: 'relative', opacity: (trackingResult.status === 'COMPLETED') ? 1 : 0.4 }}>
                      <div style={{
                        position: 'absolute', left: '-33px', top: '2px',
                        background: (trackingResult.status === 'COMPLETED') ? '#10b981' : '#334155', 
                        width: '16px', height: '16px', borderRadius: '50%',
                        border: '4px solid #0f172a', 
                        boxShadow: (trackingResult.status === 'COMPLETED') ? '0 0 0 1px #10b981' : 'none'
                      }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Giao hàng thành công & Chứng thực hoàn tất</div>
                      
                      {trackingResult.status === 'COMPLETED' && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                            Đơn hàng đã giao nhận thành công và được lưu vết an toàn.
                          </p>

                          {/* U2U blockchain transaction details */}
                          {trackingResult.tx_hash && (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.03) 100%)',
                              border: '1px solid rgba(16,185,129,0.18)',
                              borderRadius: '8px',
                              padding: '12px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                                <ShieldCheck size={14} /> XÁC THỰC SỐ U2U BLOCKCHAIN TRUST LAYER
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                TxHash: {trackingResult.tx_hash}
                              </div>
                            </div>
                          )}

                          {/* Evidence snapshot */}
                          {trackingResult.metadata?.evidence_photo && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>HÌNH ẢNH KÝ NHẬN HIỆN TRƯỜNG:</span>
                              <img 
                                src={trackingResult.metadata.evidence_photo} 
                                alt="Evidence signature" 
                                style={{ maxWidth: '240px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} 
                              />
                            </div>
                          )}
                          
                          {trackingResult.metadata?.evidence_note && (
                            <div style={{ fontSize: '12px', color: '#fff', marginTop: '8px' }}>
                              📝 <strong>Ghi chú giao:</strong> {trackingResult.metadata.evidence_note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* MODE: TẠO ĐƠN ĐẶT HÀNG MỚI */}
          {activeMode === 'create' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Khởi tạo Đơn hàng mới</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px 0' }}>
                Điền thông tin giao nhận dưới đây để đưa đơn hàng vào hệ thống queues xử lý tự động của chúng tôi.
              </p>

              {createdOrderId ? (
                /* Success view for created order */
                <div style={{
                  textAlign: 'center',
                  padding: '20px 0',
                  animation: 'fadeIn var(--transition-medium)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <CheckCircle size={32} color="#10b981" />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 10px 0' }}>Tạo đơn hàng thành công!</h4>
                  <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                    Đơn hàng đã được đưa vào hệ thống queue xử lý chặng cuối. Vui lòng sao chép Mã vận đơn dưới đây để tra cứu.
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    maxWidth: '460px',
                    margin: '0 auto 32px'
                  }}>
                    <code style={{ fontFamily: 'monospace', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>{createdOrderId}</code>
                    <button
                      onClick={() => copyToClipboard(createdOrderId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copied ? '#10b981' : '#3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      {copied ? <><Check size={14} /> Đã chép</> : <><Copy size={14} /> Sao chép</>}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setCreatedOrderId(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Tạo đơn khác
                    </button>
                    <button
                      onClick={() => {
                        setActiveMode('track');
                        setCreatedOrderId(null);
                      }}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Xem chi tiết hành trình
                    </button>
                  </div>
                </div>
              ) : (
                /* Create Order Form */
                <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>HỌ TÊN KHÁCH HÀNG *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Nguyễn Văn A" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '10px 14px', color: '#fff', width: '100%', outline: 'none' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>CHI NHÁNH GỬI HÀNG</label>
                      <select 
                        className="form-input" 
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '10px 14px', color: '#fff', width: '100%', outline: 'none' }}
                      >
                        <option value="branch_q1">Chi nhánh Quận 1 (TPHCM)</option>
                        <option value="branch_q3">Chi nhánh Quận 3 (TPHCM)</option>
                        <option value="branch_warehouse">Kho tổng Q12 (TPHCM)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>TÊN SẢN PHẨM / ĐƠN HÀNG *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Điện thoại iPhone 15 Pro Max" 
                        value={orderTitle}
                        onChange={(e) => setOrderTitle(e.target.value)}
                        required
                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '10px 14px', color: '#fff', width: '100%', outline: 'none' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>GIÁ TRỊ HÀNG HÓA (VNĐ)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={orderValue}
                        onChange={(e) => setOrderValue(e.target.value)}
                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '10px 14px', color: '#fff', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>ĐỊA CHỈ GIAO HÀNG (SHIPPING ADDRESS) *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Số 15 Lê Lợi, Phường Bến Nghé, Quận 1, TPHCM" 
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '10px 14px', color: '#fff', width: '100%', outline: 'none' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>GHI CHÚ GIAO HÀNG</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Giao giờ hành chính, gọi điện trước khi đến..." 
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '10px 14px', color: '#fff', width: '100%', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '14px',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: loading ? 0.7 : 1,
                      marginTop: '10px',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {loading ? 'Đang tạo...' : <>Xác nhận & Gửi yêu cầu vận chuyển</>}
                  </button>

                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#475569', fontSize: '12px' }}>
          Powered by Nextflow OS Blockchain Trust Layer. Tất cả các dữ liệu đã mã hóa được lưu trữ bất biến.
        </div>

      </div>
    </div>
  );
}
