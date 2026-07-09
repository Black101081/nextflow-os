import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Link2, ShieldCheck } from 'lucide-react';
import { apiService } from '../../../shared/services/api';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  source?: string;
  isVerified?: boolean;
  txHash?: string;
}

export default function GrillMeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Initial Greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'ai',
          content: 'Xin chào Leader! Tôi là trợ lý ảo **Grill Me** được tích hợp **Cloudflare Workers AI** (Llama-3). Hãy hỏi tôi bất cứ điều gì về số liệu, quy trình SOP, hay nhân sự hôm nay nhé!'
        }
      ]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass empty auth object or null if your apiService handles it
      const res = await apiService.askAiAssistant({}, userMsg.content);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: res.data?.answer || 'Xin lỗi, tôi không thể trả lời lúc này.',
        source: res.data?.source,
        isVerified: res.data?.is_blockchain_verified,
        txHash: res.data?.verification_tx_hash
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `⚠️ **Lỗi:** ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #9333ea)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 20px rgba(147,51,234,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          background: '#121212',
          border: '1px solid #333',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #581c87)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
              <Bot size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Grill Me Assistant</h3>
                <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>Powered by Cloudflare Workers AI</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(to right, #2563eb, #3b82f6)' : '#222',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {msg.role === 'ai' ? (
                    <div className="markdown-body" style={{ color: 'white', background: 'transparent' }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Citations & Blockchain Info (Only for AI) */}
                {msg.role === 'ai' && msg.source && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#888', background: '#1a1a1a', padding: '6px 10px', borderRadius: '4px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Link2 size={12} color="#3b82f6" />
                      <span>Nguồn: <strong>{msg.source}</strong></span>
                    </div>
                    {msg.isVerified && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                        <ShieldCheck size={12} />
                        <span>Blockchain Verified: {msg.txHash?.substring(0, 16)}...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', padding: '8px' }}>
                <Loader2 size={16} className="spin" /> AI đang suy nghĩ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid #333', background: '#1a1a1a' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Hỏi tôi bất kỳ điều gì..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: '#222',
                  border: '1px solid #444',
                  borderRadius: '20px',
                  padding: '10px 16px',
                  color: 'white',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !input.trim() ? 0.5 : 1
                }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
