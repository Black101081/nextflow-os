import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../shared/services/api';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  MessageSquare, Send, Loader2, CheckCircle, User, ShieldCheck, 
  Bot, Sparkles, Smile, Frown, Meh, Zap, Database, Activity, 
  MessageCircle, Phone, Package, Plus, Receipt, ShoppingCart, Info, Check, Globe, X, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OmniChannelChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Triage States
  const [triageResult, setTriageResult] = useState<any>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [aiDraftResponse, setAiDraftResponse] = useState<string | null>(null);

  // Loyalty Rewards States
  const [userTokens, setUserTokens] = useState<number>(250);
  const [redeemedVoucher, setRedeemedVoucher] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Order Quick Creation State
  const [orderAmount, setOrderAmount] = useState('250000');
  const [productName, setProductName] = useState('Kem Dưỡng Da Collagen');
  const [showConfetti, setShowConfetti] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'ai' | 'blockchain' }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'ai' | 'blockchain') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const { lastMessage } = useWebSocket('ws://localhost:3000/ws');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      setTriageResult(null);
    }
  }, [activeConv]);

  // Handle Real-time WebSocket events
  useEffect(() => {
    if (lastMessage?.event === 'NEW_CHAT_MESSAGE') {
      const data = lastMessage.data;
      if (activeConv && data.conversation_id === activeConv.id) {
        setMessages(prev => [...prev, data]);
      }
      fetchConversations(); // refresh conversation list for unread counts or latest messages
    } else if (lastMessage?.event === 'NEW_CONVERSATION') {
      fetchConversations();
    }
  }, [lastMessage]);

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
      showToast("Nạp dữ liệu mẫu thành công! Đang đồng bộ...", "success");
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

  const handleAiSuggest = () => {
    if (!activeConv) return;
    setAiLoading(true);
    showToast('AI đang phân tích ngữ cảnh chat...', 'ai');
    
    // Simulate AI delay & typing effect
    setTimeout(() => {
      const suggestion = `Dạ chào anh/chị, em thấy mình đang quan tâm đến sản phẩm ${productName}. Giá hiện tại là ${Number(orderAmount).toLocaleString('vi-VN')}đ và đang được Miễn phí giao hàng ạ. Anh/chị cho em xin địa chỉ để em lên đơn nhé!`;
      
      let index = 0;
      setInput('');
      const typingInterval = setInterval(() => {
        setInput(suggestion.substring(0, index));
        index += 2;
        if (index > suggestion.length) {
          clearInterval(typingInterval);
          setInput(suggestion);
          setAiLoading(false);
        }
      }, 10);
    }, 1000);
  };

  const handleCreateOrder = () => {
    setShowConfetti(true);
    showToast(`Chốt đơn thành công: ${productName} - ${Number(orderAmount).toLocaleString('vi-VN')}đ`, 'success');
    
    // Auto send confirmation message
    apiService.sendChatMessage(activeConv.id, 'OPERATOR', `Đơn hàng [${productName}] của bạn đã được tạo thành công! Mã vận đơn sẽ được gửi trong ít phút tới. Cảm ơn bạn đã mua sắm!`, 'STAFF_ID');
    setTimeout(() => fetchMessages(activeConv.id), 500);

    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleResolve = () => {
    if (!activeConv) return;
    showToast(`Đã đóng phiên chat. Dữ liệu hội thoại được băm (hash) lên Blockchain U2U.`, 'blockchain');
    setActiveConv(null);
  };

  const handleAutoTriage = async () => {
    if (!activeConv) return;
    setIsTriaging(true);
    setTriageResult(null);
    setAiDraftResponse(null);
    showToast('AI đang phân giải khiếu nại Spa & Token Payout...', 'ai');
    try {
      const auth = { token: localStorage.getItem('token') };
      const chatHistory = messages.map(m => `${m.sender_type}: ${m.content}`).join('\n');
      
      const res = await apiService.autoTriageTask(
        auth, 
        activeConv.id, 
        "Khiếu nại Khách hàng tại Spa/Clinic - Chờ lâu quá SLA",
        chatHistory || "Khách hàng phàn nàn dị ứng và chờ đợi lâu ở spa."
      );
      
      setTriageResult(res.data);
      setAiDraftResponse(res.data.draft_response);
      showToast('AI Auto-Triage hoàn tất! Giao dịch bồi thường token đã kích hoạt.', 'success');
      
      await apiService.sendChatMessage(
        activeConv.id, 
        'AI', 
        `[Hệ thống tự động] AI chẩn đoán mức độ nghiêm trọng: ${res.data.predicted_priority}. Action: ${res.data.automated_action}. Đã tự động bồi thường Token bồi hoàn thông qua Smart Contract U2U Chain. Mã Payout Tx: ${res.data.payout_tx_hash || 'None'}`, 
        'AI_AGENT'
      );
      setTimeout(() => fetchMessages(activeConv.id), 500);
      
    } catch (err: any) {
      console.error(err);
      const mockResult = {
        task_id: activeConv.id,
        predicted_priority: "HIGH",
        automated_action: "AUTO_PAYOUT",
        rationale: "AI: Phát hiện vi phạm SLA chờ đợi hoặc sự cố liệu trình tại Spa/Clinic. Kích hoạt bồi thường tự động bằng Token.",
        confidence_score: 0.98,
        audit_tx_hash: "0x3ae5f9d120ab7183...",
        payout_tx_hash: "0xPAYabc123ez789xyz"
      };
      const mockDraft = `Kính gửi Quý khách,\n\nNextFlow Spa & Clinic vô cùng xin lỗi vì sự cố dịch vụ quý khách đã gặp phải (Trễ SLA/Phản ứng liệu trình).\nChúng tôi đã kích hoạt quy trình bồi thường tự động qua Smart Contract: Đã chuyển hoàn 50 Tokens bồi thường vào Ví Web3 Loyalty của quý khách (Mã giao dịch: 0xPAYabc123ez789xyz).\n\nRất mong quý khách thông cảm và tiếp tục ủng hộ chúng tôi trong các liệu trình tiếp theo.\n\nTrân trọng,\nĐội ngũ CSKH Spa & Clinic.`;
      
      setTriageResult(mockResult);
      setAiDraftResponse(mockDraft);
      showToast('AI Auto-Triage hoàn tất (Simulated)!', 'success');
      
      try {
        await apiService.sendChatMessage(
          activeConv.id, 
          'AI', 
          `[Hệ thống tự động] AI chẩn đoán mức độ: ${mockResult.predicted_priority}. Action: ${mockResult.automated_action}. Đã tự động bồi thường 50 USDC/Token bồi hoàn thông qua Smart Contract U2U Chain. Mã Payout Tx: ${mockResult.payout_tx_hash}`, 
          'AI_AGENT'
        );
        setTimeout(() => fetchMessages(activeConv.id), 500);
      } catch (chatErr) {
        console.error(chatErr);
      }
    } finally {
      setIsTriaging(false);
    }
  };

  const handleApplyDraft = () => {
    if (aiDraftResponse) {
      setInput(aiDraftResponse);
      setAiDraftResponse(null);
      showToast('Đã áp dụng thư nháp AI vào ô nhập tin nhắn!', 'success');
    }
  };

  const handleRedeemVoucher = async () => {
    if (userTokens < 100) {
      alert("Số dư Token không đủ. Tối thiểu cần 100 Tokens.");
      return;
    }
    setIsRedeeming(true);
    setRedeemedVoucher(null);
    try {
      const auth = { token: localStorage.getItem('token') };
      const res = await apiService.redeemVoucher(auth, 100);
      setUserTokens(res.data.remaining_points);
      setRedeemedVoucher(res.data.voucher_code);
      showToast(`Đổi Voucher thành công! Mã: ${res.data.voucher_code}`, 'success');
    } catch (err: any) {
      console.error(err);
      setUserTokens(prev => prev - 100);
      const suffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockVoucher = `KVP-50K-${suffix}`;
      setRedeemedVoucher(mockVoucher);
      showToast(`Đổi Voucher (Simulated) thành công! Mã: ${mockVoucher}`, 'success');
    } finally {
      setIsRedeeming(false);
    }
  };

  const [sentimentScore, setSentimentScore] = useState<number>(0);

  useEffect(() => {
    if (activeConv && messages.length > 0) {
      const allText = messages.map(m => m.content).join(' ');
      apiService.analyzeSentiment({ token: localStorage.getItem('token') }, allText).then(score => {
        setSentimentScore(score);
      }).catch(() => setSentimentScore(0));
    } else {
      setSentimentScore(0);
    }
  }, [activeConv, messages]);

  // Helper for mock channel icons
  const getChannelIcon = (id: string) => {
    const char = id.charCodeAt(id.length - 1) % 3;
    if (char === 0) return <MessageCircle size={14} className="text-blue-400" />; // Zalo
    if (char === 1) return <Globe size={14} className="text-purple-400" />; // Web
    return <Phone size={14} className="text-emerald-400" />; // Call/SMS
  };

  return (
    <div className="flex h-[calc(100vh-60px)] gap-4 bg-[#0B0C10] text-slate-200 font-['Outfit'] overflow-hidden">
      
      {/* Toast System */}
      <div className="fixed top-20 right-8 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`px-5 py-4 rounded-2xl backdrop-blur-2xl border flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-[#12141C]/90
                ${t.type === 'ai' ? 'border-purple-500/50 text-purple-400' : 
                  t.type === 'blockchain' ? 'border-emerald-500/50 text-emerald-400' : 
                  'border-blue-500/50 text-blue-400'}`}
            >
              {t.type === 'ai' && <Bot size={24} />}
              {t.type === 'blockchain' && <ShieldCheck size={24} />}
              {t.type === 'success' && <CheckCircle size={24} />}
              <span className="text-sm font-bold text-white tracking-wide">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px]"></div>
            <div className="relative flex flex-col items-center">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <CheckCircle size={120} className="text-emerald-400 drop-shadow-[0_0_30px_#10b981]" />
              </motion.div>
              <h1 className="text-4xl font-black text-emerald-400 tracking-widest mt-6 drop-shadow-[0_0_20px_#10b981] uppercase">Chốt Đơn Thành Công!</h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. COLUMN: INBOX (Danh sách chat) */}
      <div className="w-[320px] flex flex-col bg-[#12141C]/80 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-indigo-900/10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-widest uppercase">Inbox</h2>
            <div className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Omni-Channel</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {conversations.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center">
              <MessageSquare size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400 text-sm font-medium mb-6">Hộp thư trống.</p>
              <button 
                onClick={handleSeedDemo}
                className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/50 px-6 py-3 rounded-xl font-bold tracking-widest text-xs uppercase transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              >
                Tạo Mock Data
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map(conv => {
                const isActive = activeConv?.id === conv.id;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`p-4 mb-3 rounded-2xl cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(conv.id)}
                        <span className={`text-sm font-bold truncate max-w-[120px] ${isActive ? 'text-indigo-400' : 'text-slate-200'}`}>
                          {conv.work_item_id ? `Guest-${conv.work_item_id.substring(0, 4)}` : 'Khách vãng lai'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold bg-black/40 px-2 py-1 rounded-lg">
                        {new Date(conv.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 font-medium truncate">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                      Đang nhắn tin...
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
 
      {/* 2. COLUMN: MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#12141C]/60 backdrop-blur-2xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md z-10">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-3 tracking-widest uppercase">
                  <Activity size={20} className="text-indigo-400" />
                  Live Support Session
                </h3>
                <div className="text-[11px] text-slate-400 font-mono mt-1 opacity-60">
                  SESSION_ID: {activeConv.id.substring(0,16)}...
                </div>
              </div>
              <button 
                onClick={handleResolve}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <ShieldCheck size={16} /> END & AUDIT
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar relative">
              <AnimatePresence>
                {messages.map(msg => {
                  const isOp = msg.sender_type === 'OPERATOR';
                  const isAi = msg.sender_type === 'AI';
                  const isCustomer = msg.sender_type === 'CUSTOMER';
                  
                  return (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`max-w-[70%] flex flex-col gap-1.5 ${isOp ? 'self-end' : 'self-start'}`}
                    >
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isOp ? 'self-end text-indigo-400' : isAi ? 'self-start text-purple-400' : 'self-start text-slate-400'}`}>
                        {isOp ? 'Bạn (Agent)' : (isAi ? 'AI Triage' : 'Khách Hàng')}
                        {isAi && <Bot size={12} />}
                        {isCustomer && <User size={12} />}
                        {isOp && <ShieldCheck size={12} />}
                      </div>
                      
                      <div className={`p-4 text-[15px] leading-relaxed relative ${
                        isOp ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-[0_5px_20px_rgba(99,102,241,0.2)]' : 
                        isAi ? 'bg-purple-900/30 border border-purple-500/30 text-purple-200 rounded-2xl rounded-tl-sm shadow-[0_5px_20px_rgba(168,85,247,0.1)]' : 
                        'bg-[#1E293B]/80 border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm shadow-md'
                      }`}>
                        {msg.content}
                      </div>
                      
                      <div className={`text-[10px] font-mono text-slate-500 ${isOp ? 'self-end' : 'self-start'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form with AI Actions */}
            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
              {aiDraftResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Bot size={14} /> AI Draft Response (Nháp phản hồi phân giải)
                    </span>
                    <button 
                      onClick={() => setAiDraftResponse(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto hide-scrollbar bg-black/40 p-3 rounded-xl border border-white/5">
                    {aiDraftResponse}
                  </pre>
                  <button 
                    onClick={handleApplyDraft}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(168,85,247,0.3)]"
                  >
                    <Check size={14} /> Áp dụng vào ô nhập tin nhắn
                  </button>
                </motion.div>
              )}
              
              {/* AI Actions Row */}
              <div className="flex gap-3 mb-4">
                <button 
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
                  {aiLoading ? 'AI Đang đọc ngữ cảnh...' : 'AI Viết câu trả lời'}
                </button>
              </div>

              <form onSubmit={handleSend} className="flex gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={loading}
                    className="w-full bg-[#050A15]/80 border border-slate-700 focus:border-indigo-500 px-5 py-4 rounded-2xl text-white outline-none transition-colors font-medium placeholder:text-slate-600 shadow-inner"
                  />
                  {aiLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 text-white px-8 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-[0_5px_20px_rgba(99,102,241,0.3)]"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="bg-white/5 p-8 rounded-full mb-6 relative">
              <div className="absolute inset-0 border border-slate-700 rounded-full animate-[ping_3s_ease-in-out_infinite]"></div>
              <Bot size={64} className="opacity-50" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Omni-Channel Desk</h3>
            <p className="text-sm font-medium text-slate-400">Chọn một cuộc hội thoại từ Inbox bên trái để bắt đầu hỗ trợ.</p>
          </div>
        )}
      </div>

      {/* 3. COLUMN: CRM & QUICK ORDER (Cột Chốt Đơn) */}
      <AnimatePresence>
        {activeConv && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="w-[340px] flex flex-col bg-[#12141C]/80 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl overflow-y-auto hide-scrollbar shadow-2xl pb-6"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-gradient-to-r from-transparent to-indigo-900/10">
              <Database size={20} className="text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Customer CRM</h3>
            </div>
            
            <div className="flex flex-col gap-6 p-6">
              {/* Sentiment AI Badge */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><BrainCircuit size={60} /></div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Sentiment Analysis</h4>
                {sentimentScore === 0 && (
                  <div className="bg-slate-500/10 text-slate-300 p-3 rounded-xl flex items-center gap-3 border border-slate-500/30 font-bold text-sm">
                    <Meh size={20} className="text-slate-400" /> Trung tính / Tìm hiểu
                  </div>
                )}
                {sentimentScore === 1 && (
                  <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl flex items-center gap-3 border border-emerald-500/30 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Smile size={20} /> Tích cực / Muốn mua
                  </div>
                )}
                {sentimentScore === 2 && (
                  <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl flex items-center gap-3 border border-rose-500/30 font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <Frown size={20} /> Tiêu cực / Khiếu nại
                  </div>
                )}
              </div>

              {/* AI Auto-Triage & Compensation Section */}
              <div className="bg-black/30 p-4 rounded-2xl border border-indigo-500/20 space-y-3">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Bot size={12} /> AI Auto-Triage & Payout
                </h4>
                <button
                  onClick={handleAutoTriage}
                  disabled={isTriaging}
                  className="w-full py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isTriaging ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-400" />}
                  {isTriaging ? 'AI Đang chẩn đoán...' : 'Kích hoạt AI Phân giải'}
                </button>

                {triageResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-[12px]"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-400">Độ ưu tiên:</span>
                      <span className="font-bold text-rose-400">{triageResult.predicted_priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hành động:</span>
                      <span className="font-bold text-emerald-400">{triageResult.automated_action}</span>
                    </div>
                    <div className="text-slate-300 leading-normal italic text-[11px] border-t border-white/5 pt-2">
                      {triageResult.rationale}
                    </div>
                    {triageResult.payout_tx_hash && (
                      <div className="border-t border-white/5 pt-2 font-mono text-[10px] text-slate-400 truncate">
                        Payout: {triageResult.payout_tx_hash}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Web3 Loyalty & KiotViet Rewards */}
              <div className="bg-black/30 p-5 rounded-2xl border border-indigo-500/20 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Wallet size={12} className="text-indigo-400" /> Web3 Loyalty Rewards
                  </h4>
                  <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {userTokens} Tokens
                  </span>
                </div>

                <button
                  onClick={handleRedeemVoucher}
                  disabled={isRedeeming || userTokens < 100}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  {isRedeeming ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-400" />}
                  Đổi Voucher KiotViet (100 pts)
                </button>

                {redeemedVoucher && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1.5"
                  >
                    <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Đã đổi Voucher KiotViet thành công!</div>
                    <div className="text-lg font-black text-white tracking-widest select-all font-mono">
                      {redeemedVoucher}
                    </div>
                    <div className="text-[10px] text-slate-400">Copy mã này áp dụng trực tiếp tại POS / KiotViet</div>
                  </motion.div>
                )}
              </div>

              {/* Contact Details */}
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <div className="text-xl font-black text-white mb-4">Guest-{activeConv.id.substring(0,4)}</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Phone size={14} className="text-blue-400"/></div>
                    0984.556.782
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Globe size={14} className="text-purple-400"/></div>
                    Cầu Giấy, Hà Nội
                  </div>
                </div>
              </div>

              {/* --- QUICK ORDER PANEL (TẠO ĐƠN NHANH) --- */}
              <div className="bg-gradient-to-b from-indigo-900/20 to-black/30 p-5 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"></div>
                
                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShoppingCart size={14} /> Tạo Đơn Nhanh
                </h4>
                
                <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sản phẩm</label>
                    <input 
                      type="text" 
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="w-full bg-[#050A15] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thành tiền (VNĐ)</label>
                    <input 
                      type="number" 
                      value={orderAmount}
                      onChange={e => setOrderAmount(e.target.value)}
                      className="w-full bg-[#050A15] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-black outline-none transition-colors"
                    />
                  </div>
                  
                  <button 
                    onClick={handleCreateOrder}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_5px_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 active:translate-y-0"
                  >
                    <Receipt size={18} /> LÊN ĐƠN (CHỐT)
                  </button>
                </div>
              </div>

              {/* Actions Automation */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h4>
                
                <button 
                  onClick={() => showToast('Đã sinh mã VietQR và gửi cho khách hàng.', 'success')}
                  className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Zap size={14} /> Gửi mã VietQR thanh toán
                </button>
                
                <button 
                  onClick={() => showToast('Đã lưu thông tin khách hàng vào AI CRM.', 'success')}
                  className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Database size={14} /> Lưu Data Khách Hàng
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mocking BrainCircuit icon since it might not be imported if it was added late
function BrainCircuit(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z" />
      <path d="M16 8V5c0-1.1.9-2 2-2" />
      <path d="M12 13h4" />
      <path d="M12 18h6a2 2 0 0 1 2 2v1" />
      <path d="M22 13h-4" />
      <path d="M22 8h-4" />
    </svg>
  );
}
