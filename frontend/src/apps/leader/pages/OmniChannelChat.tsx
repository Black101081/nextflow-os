import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  MessageSquare, 
  Send,
  Loader2,
  CheckCircle,
  User,
  ShieldCheck,
  Bot
} from 'lucide-react';

export default function OmniChannelChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      const interval = setInterval(() => fetchMessages(activeConv.id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const auth = { token: localStorage.getItem('token') };
      const data = await apiService.getOpenConversations(auth);
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
      await apiService.seedDemoData(auth);
      alert("Nạp dữ liệu mẫu thành công! Đang đồng bộ...");
      fetchConversations();
    } catch (err: any) {
      alert("Lỗi nạp dữ liệu: " + err.message);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const msgs = await apiService.getChatMessages(id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    
    setLoading(true);
    try {
      await apiService.sendChatMessage(activeConv.id, 'OPERATOR', input, 'STAFF_ID');
      setInput('');
      fetchMessages(activeConv.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px' }}>
      
      {/* Sidebar: Danh sách chat */}
      <div className="panel-glass" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border-color)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={20} color="var(--color-accent)" />
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700, color: 'var(--text-color)' }}>Hộp thư đến</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <MessageSquare size={36} color="var(--text-muted)" opacity={0.3} style={{ marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Hộp thư trống.<br />Nạp dữ liệu hội thoại mẫu để thử nghiệm tính năng.
              </p>
              <button 
                onClick={handleSeedDemo}
                style={{ 
                  background: 'var(--color-accent)', 
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '12px', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                Nạp dữ liệu hội thoại mẫu
              </button>
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className="chat-list-item"
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: activeConv?.id === conv.id ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                  borderLeft: activeConv?.id === conv.id ? '3px solid var(--color-accent)' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: activeConv?.id === conv.id ? 'var(--color-accent)' : '#fff' }}>
                    Tracking: {conv.work_item_id ? conv.work_item_id.substring(0, 8) : 'Khách vãng lai'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {new Date(conv.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
                  Đang mở
                </div>
              </div>
            ))
          )}
        </div>
      </div>
 
      {/* Main Chat Area */}
      <div className="panel-glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#fff', fontWeight: 600 }}>Phiên hỗ trợ trực tuyến</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  ID: {activeConv.id}
                </div>
              </div>
              <button 
                style={{ 
                  padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-accent)', border: '1px solid rgba(34, 197, 94, 0.2)', 
                  borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                }}
              >
                <CheckCircle size={16} /> Mark as Resolved
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(msg => {
                const isOp = msg.sender_type === 'OPERATOR';
                const isAi = msg.sender_type === 'AI';
                const isCustomer = msg.sender_type === 'CUSTOMER';
                
                let bubbleStyle: React.CSSProperties = {
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                };

                if (isOp) {
                  bubbleStyle.background = 'var(--color-accent)';
                  bubbleStyle.color = '#fff';
                  bubbleStyle.borderRadius = '12px 12px 0 12px';
                } else if (isAi) {
                  bubbleStyle.background = 'rgba(168, 85, 247, 0.1)';
                  bubbleStyle.color = '#e9d5ff';
                  bubbleStyle.border = '1px solid rgba(168, 85, 247, 0.2)';
                  bubbleStyle.borderRadius = '12px 12px 12px 0';
                } else {
                  bubbleStyle.background = 'rgba(255, 255, 255, 0.05)';
                  bubbleStyle.color = '#f8fafc';
                  bubbleStyle.border = '1px solid rgba(255, 255, 255, 0.08)';
                  bubbleStyle.borderRadius = '12px 12px 12px 0';
                }

                return (
                  <div key={msg.id} className="chat-msg-row" style={{ 
                    alignSelf: isOp ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    animation: 'msgFadeIn 0.25s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', alignSelf: isOp ? 'flex-end' : 'flex-start' }}>
                      {isOp ? 'Bạn' : (isAi ? 'AI Triage Agent' : 'Khách hàng')}
                      {isAi && <Bot size={12} color="#a855f7" />}
                      {isCustomer && <User size={12} />}
                      {isOp && <ShieldCheck size={12} color="var(--color-accent)" />}
                    </div>
                    <div style={bubbleStyle}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', alignSelf: isOp ? 'flex-end' : 'flex-start' }}>
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn để trả lời khách hàng..."
                  disabled={loading}
                  style={{ 
                    flex: 1, padding: '12px 16px', borderRadius: '8px', 
                    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', 
                    color: '#fff', outline: 'none', transition: 'border-color 0.2s' 
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{
                    padding: '0 24px', borderRadius: '8px',
                    background: 'var(--color-accent)', border: 'none', color: '#fff',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                    opacity: (loading || !input.trim()) ? 0.5 : 1
                  }}
                  onMouseOver={(e) => { if(!loading && input.trim()) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
                >
                  {loading ? <Loader2 size={18} className="spinner-icon" /> : 'Gửi'} <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>Omni-Channel Chat</h3>
            <p style={{ fontSize: '14px', margin: 0 }}>Chọn một phiên trò chuyện bên trái để bắt đầu hỗ trợ.</p>
          </div>
        )}
      </div>

      {/* CRM Customer Profile Panel */}
      {activeConv && (
        <div className="panel-glass crm-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px' }}>
          <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--color-accent)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>Hồ sơ khách hàng (CRM)</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {/* Contact Details */}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                Nguyễn Thị Lan Anh
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                SĐT: 0984.556.782
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                Đ/C: Cầu Giấy, Hà Nội
              </div>
            </div>

            {/* Loyalty Tier */}
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>HẠNG VÀNG (GOLD)</span>
                <span style={{ fontSize: '11px', color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>2,450 pts</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                Khách hàng thân thiết từ 2025. Tặng Voucher 10% dịp sinh nhật.
              </div>
            </div>

            {/* KiotViet Orders */}
            <div>
              <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '10px' }}>Lịch sử đơn (KiotViet)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="crm-order-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', transition: 'border-color 0.2s' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>DH000921</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>20/06/2026</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-accent)' }}>450,000đ</div>
                    <div style={{ color: 'var(--color-accent)', fontSize: '10px' }}>Đã giao</div>
                  </div>
                </div>
                <div className="crm-order-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', transition: 'border-color 0.2s' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>DH000854</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>15/05/2026</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>1,200,000đ</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Hoàn thành</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                onClick={() => alert('Đã gửi VietQR cho khách!')}
                style={{ 
                  width: '100%', padding: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', 
                  color: 'var(--color-accent)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
              >
                Gửi mã VietQR thanh toán
              </button>
              <button 
                onClick={() => alert('Đã kích hoạt Workflow CSKH Zalo!')}
                style={{ 
                  width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', 
                  color: 'var(--text-color)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                Kích hoạt CSKH Zalo ZNS
              </button>
            </div>

          </div>
        </div>
      )}
      <style>{`
        .chat-list-item:hover {
          background: rgba(255,255,255,0.02) !important;
        }
        .crm-order-item:hover {
          border-color: rgba(255,255,255,0.15) !important;
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
