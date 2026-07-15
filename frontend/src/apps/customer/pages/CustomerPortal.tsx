import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Home, Search, Grid, Calendar, MoreHorizontal,
  User, ShoppingBag, Gift, MessageSquare, CreditCard, HelpCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../../shared/services/api';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';

import HomeTab from '../components/HomeTab';
import TrackingTab from '../components/TrackingTab';
import AIChatTab from '../components/AIChatTab';
import AccountTab from '../components/AccountTab';
import CatalogTab from '../components/CatalogTab';
import BookingTab from '../components/BookingTab';
import OrdersTab from '../components/OrdersTab';
import LoyaltyTab from '../components/LoyaltyTab';
import FeedbackTab from '../components/FeedbackTab';
import HelpTab from '../components/HelpTab';
import SubscriptionsTab from '../components/SubscriptionsTab';

export default function CustomerPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'home' | 'catalog' | 'booking' | 'orders' | 'loyalty' | 'feedback' | 'subscriptions' | 'help' | 'chat' | 'account' | 'tracking') || 'home';
  const setActiveTab = (tab: 'home' | 'catalog' | 'booking' | 'orders' | 'loyalty' | 'feedback' | 'subscriptions' | 'help' | 'chat' | 'account' | 'tracking') => {
    setSearchParams(prev => { prev.set('tab', tab); return prev; });
  };
  
  const initialTrackId = searchParams.get('track-id') || '';
  
  // Tenant Branding & Theme Customizer
  const [branding, setBranding] = useState<{ brandName: string; brandLogo: string; primaryColor: string; themeMode: string }>({
    brandName: 'NextFlow Spa & Health',
    brandLogo: '🌸',
    primaryColor: 'indigo',
    themeMode: 'dark'
  });

  useEffect(() => {
    const handleBrandingChange = () => {
      const saved = localStorage.getItem('tenant_branding_theme');
      if (saved) {
        setBranding(JSON.parse(saved));
      }
    };
    handleBrandingChange();
    window.addEventListener('storage', handleBrandingChange);
    return () => window.removeEventListener('storage', handleBrandingChange);
  }, []);
  const [trackingId, setTrackingId] = useState(initialTrackId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any | null>(null);

  // Web3 Loyalty States — persisted
  const [walletConnected, setWalletConnected] = useState(() =>
    localStorage.getItem('customer_wallet_connected') === 'true'
  );
  const [nftBalance, setNftBalance] = useState(() => {
    const saved = localStorage.getItem('customer_nftk_balance');
    return saved ? Number(saved) : 1500;
  });

  // Helper that syncs nftBalance to localStorage
  const updateNftBalance = (updater: (prev: number) => number) => {
    setNftBalance(prev => {
      const next = updater(prev);
      localStorage.setItem('customer_nftk_balance', String(next));
      return next;
    });
  };

  // Payment states
  const [paymentTab, setPaymentTab] = useState<'vietqr' | 'crypto'>('vietqr');
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ type: string; text: string }>({ type: '', text: '' });

  // Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // ZNS Toast
  const [znsToast, setZnsToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  useEffect(() => {
    if (initialTrackId) {
      setActiveTab('tracking');
      handleTrackOrder(initialTrackId);
    }
  }, []);

  // Context-Aware AI Concept
  useEffect(() => {
    if (activeTab === 'chat') {
      if (result?.status === 'IN_PROGRESS') {
        setAiSuggestions(['Đơn hàng tôi bao giờ giao tới?', 'Tôi muốn ghi chú thêm cho shipper', 'Gọi điện cho cửa hàng']);
        if (chatMessages.length === 0) setChatMessages([{ id: 'sys1', sender_type: 'AI', content: `Chào bạn, mình thấy đơn hàng "${result.title}" đang được xử lý. Bạn có muốn gửi ghi chú gì cho nhân viên không?` }]);
      } else if (result?.status === 'COMPLETED') {
        setAiSuggestions(['Tôi muốn khiếu nại', 'Cách sử dụng sản phẩm?']);
        if (chatMessages.length === 0) setChatMessages([{ id: 'sys2', sender_type: 'AI', content: `Đơn hàng "${result.title}" đã hoàn thành. Chúc bạn có trải nghiệm tốt! Cần hỗ trợ thêm hãy gõ ở dưới nhé.` }]);
      } else {
        setAiSuggestions(['Tra cứu cửa hàng gần nhất', 'Tôi muốn đặt hàng', 'Chính sách bảo hành']);
        if (chatMessages.length === 0) setChatMessages([{ id: 'sys3', sender_type: 'AI', content: `Chào mừng bạn đến với TT CSKH tự động. Mình có thể giúp gì cho bạn hôm nay?` }]);
      }
    }
  }, [activeTab, result?.status]);

  const { lastMessage } = useWebSocket('ws://localhost:3000/ws');

  // Real-time tracking from WebSocket
  useEffect(() => {
    if (lastMessage?.event === 'WORK_ITEM_UPDATED' && lastMessage?.data?.id === result?.id) {
      const nextStatus = lastMessage.data.status;
      if (nextStatus !== result.status) {
        setZnsToast({ show: true, msg: `[ZALO ZNS] Đơn hàng của bạn vừa chuyển trạng thái: ${nextStatus}` });
        setTimeout(() => setZnsToast({show: false, msg: ''}), 5000);
        setResult((prev: any) => ({ ...prev, status: nextStatus, updated_at: new Date().toISOString() }));
      }
    }
  }, [lastMessage]);

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

  const pushU2uEvent = (event: { type: string; recipient: string; details: string; txHash: string }) => {
    const events = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
    const newEvent = {
      timestamp: new Date().toISOString(),
      block: Math.floor(4082000 + Math.random() * 10000),
      ...event
    };
    events.unshift(newEvent);
    localStorage.setItem('u2u_chain_events', JSON.stringify(events.slice(0, 50)));
  };

  const handleConnectWallet = () => {
    setWalletConnected(true);
    localStorage.setItem('customer_wallet_connected', 'true');
    setZnsToast({ show: true, msg: 'Kết nối U2U Web3 Wallet thành công! Sẵn sàng nhận Cashback.' });
    setTimeout(() => setZnsToast({show: false, msg: ''}), 4000);
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    pushU2uEvent({
      type: 'WalletLinked',
      recipient: '0xU2U...f4A9',
      details: 'Ví Web3 khách hàng được liên kết thành công',
      txHash: `0x${suffix}7d2e...f8a1`
    });
  };

  const handleVerifyCrypto = async () => {
    if (!txHash.trim() || !result?.invoice?.id) return;
    setVerifying(true);
    setVerifyMsg({ type: '', text: '' });
    try {
      await apiService.verifyCryptoPayment(result.invoice.id, txHash.trim());
      if (walletConnected) {
        setTimeout(() => {
          updateNftBalance(prev => prev + 500);
          setZnsToast({ show: true, msg: 'Smart Contract đã hoàn tiền 500 NFTk vào Ví của bạn!' });
          setTimeout(() => setZnsToast({show: false, msg: ''}), 4000);
          
          const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
          pushU2uEvent({
            type: 'LoyaltyTokenMinted',
            recipient: '0xU2U...f4A9',
            details: 'Hoàn tiền mua hàng (Cashback 50%): +500 NFTk',
            txHash: `0x${suffix}2b8d...5e9a`
          });
        }, 2000);
      }
      handleTrackOrder();
    } catch (err: any) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent, msgOverride?: string) => {
    e?.preventDefault();
    const txt = msgOverride || chatInput;
    if (!txt.trim()) return;
    
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender_type: 'CUSTOMER', content: txt }]);
    setChatInput('');
    setSendingChat(true);
    
    const isComplaint = /khiếu nại|trễ|chậm|sla|dị ứng|lỗi/i.test(txt);
    
    setTimeout(() => {
      setSendingChat(false);
      if (isComplaint) {
        updateNftBalance(prev => prev + 150);
        setChatMessages(prev => [
          ...prev, 
          { 
            id: Date.now().toString() + 'ai', 
            sender_type: 'AI', 
            content: `[AI Concierge] Dạ, qua rà soát hệ thống, chúng tôi phát hiện đơn hàng bị chậm trễ so với cam kết SLA. NextFlow OS đã kích hoạt đền bù Smart Contract thành công: +150 NFTk đã được chuyển vào Ví của bạn!` 
          }
        ]);
        setZnsToast({ show: true, msg: '[ZALO ZNS] Bạn nhận được bồi hoàn +150 NFTk do trễ hạn SLA.' });
        setTimeout(() => setZnsToast({show: false, msg: ''}), 5000);

        const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        pushU2uEvent({
          type: 'SlaCompensationSent',
          recipient: '0xU2U...f4A9',
          details: 'Bồi hoàn trễ hạn SLA: +150 NFTk',
          txHash: `0x${suffix}9f5c...12b4`
        });
      } else {
        setChatMessages(prev => [
          ...prev, 
          { 
            id: Date.now().toString() + 'ai', 
            sender_type: 'AI', 
            content: `[AI Concierge] Dạ, mình đã ghi nhận yêu cầu "${txt}". Cửa hàng đang xử lý và phản hồi bạn sớm nhất ạ.` 
          }
        ]);
      }
    }, 1200);
  };

  const getStatusStep = (status: string) => {
    if (status === 'UNASSIGNED') return 0;
    if (status === 'IN_PROGRESS') return 1;
    if (status === 'COMPLETED') return 2;
    if (status === 'CANCELLED') return -1;
    return 0;
  };

  const getThemeColors = () => {
    const colors: Record<string, { primary: string, primaryGlow: string }> = {
      indigo: { primary: '#6366f1', primaryGlow: 'rgba(99,102,241,0.3)' },
      emerald: { primary: '#10b981', primaryGlow: 'rgba(16,185,129,0.3)' },
      amber: { primary: '#f59e0b', primaryGlow: 'rgba(245,158,11,0.3)' },
      rose: { primary: '#f43f5e', primaryGlow: 'rgba(244,63,94,0.3)' },
      violet: { primary: '#8b5cf6', primaryGlow: 'rgba(139,92,246,0.3)' },
    };
    return colors[branding.primaryColor] || colors.indigo;
  };
  
  const theme = getThemeColors();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Sync activeTab selection from other sources: if user changes tab, close More menu
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [activeTab]);

  return (
    <div 
      className={`min-h-[100dvh] text-slate-50 font-sans flex flex-col relative overflow-hidden select-none touch-manipulation transition-colors duration-500 ${
        branding.themeMode === 'cyberpunk' ? 'bg-[#030611] font-mono border-t-2 border-indigo-500/20' : 'bg-slate-950'
      }`}
      style={{
        ['--primary-theme-color' as any]: theme.primary,
        ['--primary-theme-glow' as any]: theme.primaryGlow,
      }}
    >
      {/* Background Orbs */}
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(56,189,248,0.1)_0%,transparent_70%)] blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] blur-[60px] pointer-events-none"></div>

      {/* ZNS Toast */}
      <AnimatePresence>
        {znsToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-blue-500/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3 shadow-[0_10px_30px_rgba(59,130,246,0.3)] w-[90%] max-w-[400px] border border-blue-400/50"
          >
            <MessageCircle size={18} className="shrink-0" /> 
            <span className="leading-tight">{znsToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-32 flex flex-col items-center hide-scrollbar">
        <div className="w-full max-w-[500px]">
          
          {activeTab === 'home' && (
            <HomeTab 
              walletConnected={walletConnected} 
              nftBalance={nftBalance} 
              handleConnectWallet={handleConnectWallet}
              setActiveTab={(tab: any) => setActiveTab(tab)}
              setZnsToast={setZnsToast}
              setNftBalance={updateNftBalance}
              branding={branding}
              setBranding={setBranding}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingTab 
              trackingId={trackingId} setTrackingId={setTrackingId} loading={loading} error={error}
              result={result} handleTrackOrder={handleTrackOrder} step={result ? getStatusStep(result.status) : 0}
              invoice={result?.invoice} paymentTab={paymentTab} setPaymentTab={setPaymentTab}
              txHash={txHash} setTxHash={setTxHash} verifying={verifying} handleVerifyCrypto={handleVerifyCrypto}
            />
          )}

          {activeTab === 'chat' && (
            <AIChatTab 
              chatMessages={chatMessages} sendingChat={sendingChat} chatInput={chatInput} setChatInput={setChatInput}
              aiSuggestions={aiSuggestions} handleSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'account' && (
            <AccountTab 
              walletConnected={walletConnected} 
              onConnectWallet={handleConnectWallet} 
              branding={branding}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogTab 
              onSelectService={(serviceName) => {
                setSearchParams(prev => {
                  prev.set('tab', 'booking');
                  prev.set('service', serviceName);
                  return prev;
                });
              }}
            />
          )}

          {activeTab === 'booking' && (
            <BookingTab 
              initialService={searchParams.get('service') || ''} 
              onBookingSuccess={() => setActiveTab('orders')}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltyTab 
              walletConnected={walletConnected} 
              nftBalance={nftBalance} 
              onConnectWallet={handleConnectWallet} 
              branding={branding}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackTab />
          )}

          {activeTab === 'help' && (
            <HelpTab 
              onOpenChat={() => setActiveTab('chat')}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsTab />
          )}

        </div>
      </div>

      {/* Slide-up Menu Drawer for More Tabs */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Bottom Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-white/10 rounded-t-[32px] p-6 pb-12 z-50 flex justify-center"
            >
              <div className="w-full max-w-[500px] flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Danh mục tính năng</h3>
                  <button onClick={() => setIsMoreMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors text-xs font-semibold">
                    Đóng
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('account')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Tài khoản</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('orders')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Đơn hàng</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('loyalty')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Gift size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Tích điểm</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('subscriptions')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Gói đăng ký</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('feedback')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Đánh giá</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('help')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <HelpCircle size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Trợ giúp</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('tracking')} 
                    className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Search size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">Tra cứu</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION (Super App Style) */}
      <div className="fixed bottom-0 left-0 right-0 h-[85px] bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex justify-center z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-[500px] flex justify-around items-center px-4 h-full pb-2">
          
          <button 
            onClick={() => setActiveTab('home')} 
            className="flex flex-col items-center gap-1.5 transition-colors"
            style={{ color: activeTab === 'home' ? 'var(--primary-theme-color)' : '#64748b' }}
          >
            <motion.div animate={{ y: activeTab === 'home' ? -4 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            </motion.div>
            <span className="text-[11px] font-bold">Trang chủ</span>
          </button>

          <button 
            onClick={() => setActiveTab('catalog')} 
            className="flex flex-col items-center gap-1.5 transition-colors"
            style={{ color: activeTab === 'catalog' ? 'var(--primary-theme-color)' : '#64748b' }}
          >
            <motion.div animate={{ y: activeTab === 'catalog' ? -4 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <Grid size={24} strokeWidth={activeTab === 'catalog' ? 2.5 : 2} />
            </motion.div>
            <span className="text-[11px] font-bold">Danh mục</span>
          </button>

          <button 
            onClick={() => setActiveTab('booking')} 
            className="flex flex-col items-center gap-1.5 transition-colors"
            style={{ color: activeTab === 'booking' ? 'var(--primary-theme-color)' : '#64748b' }}
          >
            <motion.div animate={{ y: activeTab === 'booking' ? -4 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <Calendar size={24} strokeWidth={activeTab === 'booking' ? 2.5 : 2} />
            </motion.div>
            <span className="text-[11px] font-bold">Đặt lịch</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('chat')} 
            className="flex flex-col items-center gap-1.5 transition-colors"
            style={{ color: activeTab === 'chat' ? 'var(--primary-theme-color)' : '#64748b' }}
          >
            <motion.div animate={{ y: activeTab === 'chat' ? -4 : 0 }} transition={{ type: "spring", stiffness: 300 }} className="relative">
              <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
              {result && activeTab !== 'chat' && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              )}
            </motion.div>
            <span className="text-[11px] font-bold">AI Support</span>
          </button>

          <button 
            onClick={() => setIsMoreMenuOpen(prev => !prev)} 
            className="flex flex-col items-center gap-1.5 transition-colors"
            style={{ color: isMoreMenuOpen ? 'var(--primary-theme-color)' : '#64748b' }}
          >
            <motion.div animate={{ rotate: isMoreMenuOpen ? 90 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <MoreHorizontal size={24} strokeWidth={isMoreMenuOpen ? 2.5 : 2} />
            </motion.div>
            <span className="text-[11px] font-bold">Thêm</span>
          </button>
          
        </div>
      </div>

    </div>
  );
}
