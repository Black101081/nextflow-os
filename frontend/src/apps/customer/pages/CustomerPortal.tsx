import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../shared/services/api';
import { 
  Search, 
  Package, 
  CheckCircle, 
  Clock, 
  ShieldCheck,
  User,
  Calendar,
  Loader2,
  Box,
  DollarSign,
  Wallet,
  QrCode,
  MessageCircle,
  X,
  Send
} from 'lucide-react';

export default function CustomerPortal() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialTrackId = queryParams.get('track-id') || '';

  const [trackingId, setTrackingId] = useState(initialTrackId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any | null>(null);

  // Payment states
  const [paymentTab, setPaymentTab] = useState<'vietqr' | 'crypto'>('vietqr');
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState({ type: '', text: '' });

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTrackId) {
      handleTrackOrder(initialTrackId);
    }
  }, []);

  useEffect(() => {
    // Poll chat messages if conversation is active
    let interval: any;
    if (isChatOpen && conversationId) {
      interval = setInterval(() => {
        apiService.getChatMessages(conversationId)
          .then(data => setChatMessages(data))
          .catch(console.error);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isChatOpen, conversationId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleTrackOrder = async (idToTrack = trackingId) => {
    const cleanId = idToTrack.trim();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setResult(null);
    setVerifyMsg({ type: '', text: '' });
    try {
      const data = await apiService.trackOrderPublic(cleanId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy thông tin đơn hàng / dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    if (status === 'UNASSIGNED') return 0;
    if (status === 'IN_PROGRESS') return 1;
    if (status === 'COMPLETED') return 2;
    if (status === 'CANCELLED') return -1;
    return 0;
  };

  const handleVerifyCrypto = async () => {
    if (!txHash.trim() || !result?.invoice?.id) return;
    setVerifying(true);
    setVerifyMsg({ type: '', text: '' });
    try {
      await apiService.verifyCryptoPayment(result.invoice.id, txHash.trim());
      setVerifyMsg({ type: 'success', text: 'Xác minh thanh toán Web3 thành công!' });
      // Refresh order
      handleTrackOrder();
    } catch (err: any) {
      setVerifyMsg({ type: 'error', text: err.message || 'Xác minh thất bại' });
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenChat = async () => {
    setIsChatOpen(true);
    if (!conversationId && result?.tenant_id) {
      try {
        const conv = await apiService.startChat(result.tenant_id, result.id, 'CUSTOMER_WEB');
        setConversationId(conv.id);
        const msgs = await apiService.getChatMessages(conv.id);
        setChatMessages(msgs);
      } catch (err) {
        console.error('Failed to start chat:', err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !conversationId) return;
    setSendingChat(true);
    try {
      const msgs = await apiService.sendChatMessage(conversationId, 'CUSTOMER', chatInput, 'CUSTOMER_WEB');
      // Append the returned messages (user message + possible AI reply)
      setChatMessages(prev => {
        const newMsgs = [...prev];
        msgs.forEach((m: any) => {
          if (!newMsgs.find(existing => existing.id === m.id)) {
            newMsgs.push(m);
          }
        });
        return newMsgs;
      });
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const step = result ? getStatusStep(result.status) : 0;
  const invoice = result?.invoice;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%)',
      color: '#f8fafc',
      fontFamily: '"Inter", system-ui, sans-serif',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box size={24} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tracking Portal
          </h1>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Tra cứu hành trình đơn hàng và dịch vụ thời gian thực</p>
      </div>

      {/* Search Box */}
      <div className="panel-glass" style={{ width: '100%', maxWidth: '600px', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleTrackOrder(); }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Nhập mã tra cứu (VD: a1b2c3d4-...)"
              className="input-premium"
              style={{
                width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px'
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !trackingId.trim()}
            style={{
              padding: '0 24px', borderRadius: '12px', background: 'var(--color-primary)',
              border: 'none', color: '#fff', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: (loading || !trackingId.trim()) ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={18} className="spinner-icon" /> : 'Tra Cứu'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} /> {error}
          </div>
        )}
      </div>

      {/* Result Container */}
      {result && (
        <div className="panel-glass slide-up" style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          
          {/* Section 1: Order Details */}
          <div style={{ background: '#0b0c10', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>{result.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '13px' }}>
                  <Calendar size={14} /> Cập nhật: {new Date(result.updated_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <div style={{ 
                padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: step === 2 ? 'rgba(16, 185, 129, 0.1)' : step === 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: step === 2 ? '#10b981' : step === 1 ? '#3b82f6' : '#f59e0b'
              }}>
                {result.status}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mã tra cứu</div>
                <div style={{ fontSize: '13px', fontWeight: 600, wordBreak: 'break-all' }}>{result.id.substring(0, 18)}...</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Người phụ trách</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                  <User size={14} color="var(--color-primary)" /> {result.operator}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Stepper Timeline */}
          <div style={{ background: '#0b0c10', padding: '32px 24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 24px 0' }}>Trạng thái quy trình</h3>
            
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
              {/* Connecting Line */}
              <div style={{ position: 'absolute', top: '24px', left: '44px', right: '44px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}>
                <div style={{ 
                  height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease',
                  width: step === 0 ? '0%' : step === 1 ? '50%' : '100%' 
                }}></div>
              </div>

              {/* Step 1: Tiêp nhận */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  color: step >= 0 ? '#fff' : 'var(--text-muted)',
                  boxShadow: step >= 0 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <Package size={20} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: step >= 0 ? 600 : 400, color: step >= 0 ? '#fff' : 'var(--text-dim)' }}>Tiếp nhận</span>
              </div>

              {/* Step 2: Đang xử lý */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= 1 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  color: step >= 1 ? '#fff' : 'var(--text-muted)',
                  boxShadow: step >= 1 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <Clock size={20} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: step >= 1 ? 600 : 400, color: step >= 1 ? '#fff' : 'var(--text-dim)' }}>Đang xử lý</span>
              </div>

              {/* Step 3: Hoàn thành */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= 2 ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)',
                  color: step >= 2 ? '#fff' : 'var(--text-muted)',
                  boxShadow: step >= 2 ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <CheckCircle size={20} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: step >= 2 ? 600 : 400, color: step >= 2 ? '#fff' : 'var(--text-dim)' }}>Hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Section 3: Billing & Invoice */}
          {invoice && (
            <div style={{ background: '#0b0c10', padding: '32px 24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="var(--color-secondary)" /> Thông tin Thanh toán
              </h3>

              <div style={{ 
                background: invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.05)', 
                border: `1px solid ${invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Tổng số tiền</div>
                  <div style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: invoice.status === 'PAID' ? '#10b981' : '#f59e0b', color: invoice.status === 'PAID' ? '#fff' : '#000'
                  }}>
                    {invoice.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                </div>
                
                {invoice.status === 'PAID' && invoice.tx_hash && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
                    <ShieldCheck size={14} /> <span>Đã ghi nhận trên Blockchain: {invoice.tx_hash.substring(0, 16)}...</span>
                  </div>
                )}
              </div>

              {invoice.status !== 'PAID' && (
                <div>
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                    <button 
                      onClick={() => setPaymentTab('vietqr')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '6px', border: 'none', 
                        background: paymentTab === 'vietqr' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: paymentTab === 'vietqr' ? '#fff' : 'var(--text-dim)',
                        fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <QrCode size={16} /> Chuyển khoản VietQR
                    </button>
                    <button 
                      onClick={() => setPaymentTab('crypto')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '6px', border: 'none', 
                        background: paymentTab === 'crypto' ? 'var(--color-accent)' : 'transparent',
                        color: paymentTab === 'crypto' ? '#fff' : 'var(--text-dim)',
                        fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: paymentTab === 'crypto' ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none'
                      }}
                    >
                      <Wallet size={16} /> Thanh toán Web3 (Crypto)
                    </button>
                  </div>

                  {paymentTab === 'vietqr' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      {invoice.vietqr_string ? (
                        <>
                          <div className="qr-scanner-container" style={{ padding: '12px', background: '#fff', borderRadius: '16px' }}>
                            <div className="qr-scanner-line"></div>
                            <img src={invoice.vietqr_string} alt="VietQR" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', margin: '8px 0 0 0' }}>
                            Mở ứng dụng ngân hàng và quét mã QR để thanh toán.
                          </p>
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Chưa có thông tin VietQR</div>
                      )}
                    </div>
                  )}

                  {paymentTab === 'crypto' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Địa chỉ Ví nhận (U2U/USDT)</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Sau khi chuyển tiền, nhập mã Giao dịch (TX Hash):</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text"
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            placeholder="0x..."
                            style={{
                              flex: 1, padding: '12px 16px', borderRadius: '8px',
                              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff', fontSize: '14px', outline: 'none'
                            }}
                          />
                          <button 
                            onClick={handleVerifyCrypto}
                            disabled={verifying || !txHash.trim()}
                            style={{
                              padding: '0 20px', borderRadius: '8px', background: 'var(--color-secondary)',
                              border: 'none', color: '#000', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px', opacity: (verifying || !txHash.trim()) ? 0.7 : 1
                            }}
                          >
                            {verifying ? <Loader2 size={16} className="spinner-icon" /> : 'Xác minh'}
                          </button>
                        </div>
                      </div>
                      
                      {verifyMsg.text && (
                        <div style={{ 
                          padding: '12px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                          background: verifyMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: verifyMsg.type === 'success' ? '#10b981' : '#ef4444',
                          border: `1px solid ${verifyMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                          <ShieldCheck size={16} /> {verifyMsg.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Section 4: Metadata */}
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div style={{ background: '#0b0c10', padding: '32px 24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Chi tiết dữ liệu bổ sung</h4>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-dim)' }}>
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Floating Chat Button */}
      {result && (
        <button
          onClick={handleOpenChat}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'transform 0.2s',
            transform: isChatOpen ? 'scale(0)' : 'scale(1)'
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="panel-glass" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '360px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          padding: 0
        }}>
          {/* Chat Header */}
          <div style={{ 
            padding: '16px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Hỗ trợ trực tuyến</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>AI Triage & Live Support</div>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Hệ thống sẽ dùng AI phân tích tự động, nếu không giải quyết được sẽ chuyển cho CSKH.
            </div>
            {chatMessages.map(msg => {
              const isCustomer = msg.sender_type === 'CUSTOMER';
              const isAi = msg.sender_type === 'AI';
              
              let bubbleClass = "chat-bubble chat-bubble-left";
              if (isCustomer) {
                bubbleClass = "chat-bubble chat-bubble-right";
              } else if (isAi) {
                bubbleClass = "chat-bubble chat-bubble-ai";
              }

              return (
                <div key={msg.id} style={{ 
                  alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div className={bubbleClass} style={{ margin: 0, padding: '10px 14px', fontSize: '13px' }}>
                    {msg.content}
                  </div>
                  {isAi && (
                    <span style={{ fontSize: '10px', color: '#a855f7', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>✨ AI Agent</span>
                  )}
                  {msg.sender_type === 'OPERATOR' && (
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: '4px' }}>👨‍💻 Nhân viên hỗ trợ</span>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={sendingChat || !conversationId}
                className="input-premium"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '20px'
                }}
              />
              <button 
                type="submit"
                disabled={sendingChat || !chatInput.trim() || !conversationId}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--color-primary)', border: 'none', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: (sendingChat || !chatInput.trim() || !conversationId) ? 0.5 : 1
                }}
              >
                {sendingChat ? <Loader2 size={16} className="spinner-icon" /> : <Send size={16} style={{ marginLeft: '2px' }} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '40px', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={14} /> Powered by NextFlow OS Secure Tracking
      </div>

      <style>{`
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Premium QR Scanner glow animation */
        .qr-scanner-container {
          position: relative;
          overflow: hidden;
        }
        .qr-scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, transparent, var(--color-accent), transparent);
          box-shadow: 0 0 8px var(--color-accent);
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
