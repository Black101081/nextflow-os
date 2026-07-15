import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { 
  AppWindow, MessageCircle, ShoppingBag, QrCode, Truck, Store, 
  CheckCircle, DownloadCloud, Settings, X, Loader2, FileSpreadsheet,
  Activity, Zap, ShieldCheck, Database, Globe, Paintbrush, Wallet2, Flame, RefreshCw, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Icon mapper
const IconMap: Record<string, any> = {
  MessageCircle: MessageCircle,
  ShoppingBag: ShoppingBag,
  QrCode: QrCode,
  Truck: Truck,
  Store: Store,
  FileSpreadsheet: FileSpreadsheet,
};

export default function IntegrationHub() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'connectors' | 'branding' | 'treasury' | 'zalo_menu'>('connectors');

  // Zalo OA Rich Menu State
  const [zaloMenuButtons, setZaloMenuButtons] = useState([
    { id: 1, label: '🔍 Tra cứu đơn hàng', actionType: 'link', url: 'https://nextflow-customer.vercel.app/?track-id=TKT-8021' },
    { id: 2, label: '💬 Chat với AI hỗ trợ', actionType: 'chat_command', command: 'Trò chuyện với AI Support' },
    { id: 3, label: '🎁 Nhận Cashback NFTk', actionType: 'link', url: 'https://nextflow-customer.vercel.app/' }
  ]);
  const [editingButtonId, setEditingButtonId] = useState<number | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempActionType, setTempActionType] = useState('link');
  const [tempVal, setTempVal] = useState('');
  const [isSavingZaloMenu, setIsSavingZaloMenu] = useState(false);
  const [showZaloMenuToast, setShowZaloMenuToast] = useState(false);

  const handleEditButton = (id: number) => {
    const btn = zaloMenuButtons.find(b => b.id === id);
    if (btn) {
      setEditingButtonId(id);
      setTempLabel(btn.label);
      setTempActionType(btn.actionType);
      setTempVal(btn.actionType === 'link' ? btn.url : btn.command || '');
    }
  };

  const handleSaveButton = () => {
    if (editingButtonId === null) return;
    setZaloMenuButtons(prev => prev.map(b => b.id === editingButtonId ? {
      ...b,
      label: tempLabel,
      actionType: tempActionType,
      url: tempActionType === 'link' ? tempVal : '',
      command: tempActionType === 'chat_command' ? tempVal : ''
    } : b));
    setEditingButtonId(null);
  };

  const handlePublishZaloMenu = () => {
    setIsSavingZaloMenu(true);
    setTimeout(() => {
      setIsSavingZaloMenu(false);
      setShowZaloMenuToast(true);
      setTimeout(() => setShowZaloMenuToast(false), 3000);
    }, 1500);
  };

  // Tenant Branding & Theme Customizer State
  const [brandName, setBrandName] = useState(() => {
    const saved = localStorage.getItem('tenant_branding_theme');
    if (saved) return JSON.parse(saved).brandName;
    return 'NextFlow Spa & Health';
  });
  const [brandLogo, setBrandLogo] = useState('🌸');
  const [primaryColor, setPrimaryColor] = useState(() => {
    const saved = localStorage.getItem('tenant_branding_theme');
    if (saved) return JSON.parse(saved).primaryColor;
    return 'indigo'; // Indigo as default
  });
  const [themeMode, setThemeMode] = useState('dark');
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [showBrandingToast, setShowBrandingToast] = useState(false);

  // Web3 Loyalty Treasury Hub State
  const [treasuryTotal, setTreasuryTotal] = useState(50000);
  const [treasuryDistributed, setTreasuryDistributed] = useState(12450);
  const [slaBuffer, setSlaBuffer] = useState(5000);
  const [mintAmount, setMintAmount] = useState<number>(10000);
  const [burnAmount, setBurnAmount] = useState<number>(2000);
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [treasuryLogs, setTreasuryLogs] = useState<Array<{ action: string; amount: number; tx: string; block: number }>>([
    { action: 'MINT', amount: 50000, tx: '0x9fa1c7be7e3c8821...9f8b', block: 912845 },
    { action: 'SLA_ALLOCATION', amount: 5000, tx: '0x81da12c0192ba827...c4fa', block: 912850 }
  ]);
  
  // Modal state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [installing, setInstalling] = useState(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [installProgress, setInstallProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availableRes, installedRes] = await Promise.all([
        apiService.getAvailableIntegrations(user),
        apiService.getTenantIntegrations(user)
      ]);
      setAvailableApps(availableRes.data);
      setInstalledApps(installedRes.installed);
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const isInstalled = (appId: string) => {
    return installedApps.some(app => app.connector_name === appId && app.status === 'ACTIVE');
  };

  const handleOpenInstall = (app: any) => {
    setSelectedApp(app);
    setCredentials({});
    setInstallLogs([]);
    setInstallProgress(0);
  };

  const handleInstall = async () => {
    if (!selectedApp) return;
    try {
      setInstalling(true);
      
      // Simulate Terminal Installation Experience
      const addLog = (msg: string) => setInstallLogs(prev => [...prev, msg]);
      
      addLog(`> [INIT] Initializing handshake with ${selectedApp.name} API...`);
      setInstallProgress(15);
      await new Promise(r => setTimeout(r, 600));

      addLog(`> [AUTH] Verifying API Keys via secure tunnel...`);
      setInstallProgress(40);
      await new Promise(r => setTimeout(r, 800));

      addLog(`> [SYNC] Establishing Webhook listeners...`);
      setInstallProgress(75);
      await new Promise(r => setTimeout(r, 700));

      await apiService.installTenantIntegration(user, selectedApp.id, credentials);
      
      addLog(`> [SUCCESS] Integration ACTIVE. Data stream established.`);
      setInstallProgress(100);
      await new Promise(r => setTimeout(r, 800));

      setSelectedApp(null);
      await loadData();
    } catch (error: any) {
      setInstallLogs(prev => [...prev, `> [ERROR] ${error.message || 'Connection Refused by Remote Host.'}`]);
    } finally {
      setInstalling(false);
    }
  };

  const handleSaveBranding = () => {
    setIsSavingBranding(true);
    setTimeout(() => {
      localStorage.setItem('tenant_branding_theme', JSON.stringify({
        brandName,
        brandLogo,
        primaryColor,
        themeMode
      }));
      // Dispatch storage event so CustomerPortal listens immediately
      window.dispatchEvent(new Event('storage'));
      setIsSavingBranding(false);
      setShowBrandingToast(true);
      setTimeout(() => setShowBrandingToast(false), 3000);
    }, 1000);
  };

  const handleMintTreasury = () => {
    if (mintAmount <= 0) return;
    setIsMinting(true);
    setTimeout(() => {
      setTreasuryTotal(prev => prev + mintAmount);
      const newLog = {
        action: 'MINT',
        amount: mintAmount,
        tx: '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        block: Math.floor(Math.random() * 5000) + 915000
      };
      setTreasuryLogs(prev => [newLog, ...prev]);
      setIsMinting(false);
      
      // Push U2U transaction to chain logs
      const currentEvents = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
      const updated = [
        {
          block: newLog.block,
          event: "LoyaltyTokenMinted",
          recipient: "0xU2U_Treasury",
          detail: `Minted +${mintAmount} NFTk to Treasury Pool`,
          txHash: newLog.tx,
          timestamp: new Date().toLocaleTimeString()
        },
        ...currentEvents
      ];
      localStorage.setItem('u2u_chain_events', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }, 1200);
  };

  const handleBurnTreasury = () => {
    if (burnAmount <= 0 || burnAmount > treasuryTotal - treasuryDistributed) return;
    setIsBurning(true);
    setTimeout(() => {
      setTreasuryTotal(prev => prev - burnAmount);
      const newLog = {
        action: 'BURN',
        amount: burnAmount,
        tx: '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        block: Math.floor(Math.random() * 5000) + 915000
      };
      setTreasuryLogs(prev => [newLog, ...prev]);
      setIsBurning(false);

      // Push U2U transaction to chain logs
      const currentEvents = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');
      const updated = [
        {
          block: newLog.block,
          event: "LoyaltyTokenBurned",
          recipient: "0xU2U_Treasury",
          detail: `Burned -${burnAmount} NFTk from Treasury Pool`,
          txHash: newLog.tx,
          timestamp: new Date().toLocaleTimeString()
        },
        ...currentEvents
      ];
      localStorage.setItem('u2u_chain_events', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-[#050A0F] text-slate-300 font-['Outfit'] overflow-hidden relative">
      
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ 
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }}></div>

      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar p-8">
        
        {/* Header & Stats Dashboard */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-blue-400 flex items-center gap-3 tracking-widest uppercase text-shadow-glow">
                <AppWindow size={32} /> Integration Hub
              </h2>
              <p className="text-blue-500/70 mt-2 font-medium">Cybernetic Marketplace. Kết nối hệ thống với các nền tảng bên ngoài qua API.</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 px-5 py-3 rounded-xl flex items-center gap-4 backdrop-blur-md">
                <Activity size={24} className="text-blue-400 animate-pulse" />
                <div>
                  <div className="text-[10px] text-blue-500/70 uppercase tracking-widest font-black">API Requests (24h)</div>
                  <div className="text-xl font-black text-blue-400">12,458</div>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-xl flex items-center gap-4 backdrop-blur-md">
                <Globe size={24} className="text-emerald-400 animate-[spin_10s_linear_infinite]" />
                <div>
                  <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-black">Active Tunnels</div>
                  <div className="text-xl font-black text-emerald-400">{installedApps.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-slate-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('connectors')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
              activeTab === 'connectors' 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'text-slate-400 hover:text-white bg-[#0A101A]/50 hover:bg-[#0A101A]'
            }`}
          >
            <AppWindow size={16} /> Marketplace Connectors
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
              activeTab === 'branding' 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'text-slate-400 hover:text-white bg-[#0A101A]/50 hover:bg-[#0A101A]'
            }`}
          >
            <Paintbrush size={16} /> Theme & Branding Customizer
          </button>
          <button
            onClick={() => setActiveTab('treasury')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
              activeTab === 'treasury' 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'text-slate-400 hover:text-white bg-[#0A101A]/50 hover:bg-[#0A101A]'
            }`}
          >
            <Wallet2 size={16} /> Web3 Treasury Hub
          </button>
          <button
            onClick={() => setActiveTab('zalo_menu')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
              activeTab === 'zalo_menu' 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'text-slate-400 hover:text-white bg-[#0A101A]/50 hover:bg-[#0A101A]'
            }`}
          >
            <MessageCircle size={16} /> Zalo Rich Menu Builder
          </button>
        </div>

        {activeTab === 'connectors' && (
          loading && availableApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
              <Loader2 size={48} className="animate-spin text-blue-500" />
              <div className="text-blue-500/70 animate-pulse tracking-widest font-bold uppercase">Scanning Market...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
              {availableApps.map((app) => {
                const Icon = IconMap[app.icon_url] || AppWindow;
                const installed = isInstalled(app.id);

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={app.id} 
                    className={`relative flex flex-col h-full bg-[#0A101A]/80 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 group overflow-hidden ${
                      installed ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-blue-500/20 shadow-lg hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:-translate-y-1'
                    }`}
                  >
                    {/* Neon top bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${installed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-transparent group-hover:bg-blue-500 group-hover:shadow-[0_0_10px_#3b82f6]'} transition-all duration-300`}></div>
                    
                    {/* Scanner line on hover */}
                    {!installed && <div className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] left-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>}

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        installed 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20'
                      } transition-all duration-300 shadow-inner`}>
                        <Icon size={28} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl font-black text-white tracking-wide mb-1">{app.name}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                          installed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {app.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-6 font-medium">
                      {app.description}
                    </p>

                    <div className="mt-auto">
                      {installed ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                            <ShieldCheck size={16} /> Verified Active
                          </div>
                          <button 
                            onClick={() => handleOpenInstall(app)}
                            className="bg-transparent hover:bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                          >
                            <Settings size={14} /> Config
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenInstall(app)}
                          className="w-full bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/50 hover:border-blue-500 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                        >
                          <Zap size={16} /> Tích Hợp Ngay
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {/* Tab 2: Theme & Branding Customizer */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="md:col-span-2 bg-[#0A101A]/80 border border-blue-500/20 p-6 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                <Paintbrush className="text-blue-400" /> Tùy Biến Giao Diện Doanh Nghiệp
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tên thương hiệu</label>
                    <input 
                      type="text" 
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      className="w-full bg-[#050a15] border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Biểu tượng thương hiệu</label>
                    <input 
                      type="text" 
                      value={brandLogo}
                      onChange={e => setBrandLogo(e.target.value)}
                      className="w-full bg-[#050a15] border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Màu sắc chủ đạo (Primary Color)</label>
                  <div className="grid grid-cols-5 gap-3">
                    {['indigo', 'emerald', 'amber', 'rose', 'violet'].map((color) => {
                      const colorMap: Record<string, string> = {
                        indigo: 'bg-indigo-600',
                        emerald: 'bg-emerald-600',
                        amber: 'bg-amber-600',
                        rose: 'bg-rose-600',
                        violet: 'bg-violet-600',
                      };
                      return (
                        <button
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          className={`h-12 rounded-xl flex items-center justify-center border font-bold capitalize transition-all ${
                            primaryColor === color 
                              ? 'border-white text-white ring-2 ring-blue-500/50' 
                              : 'border-slate-800 text-slate-400 hover:border-slate-700'
                          } ${colorMap[color]}`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chế độ giao diện (Theme Mode)</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['dark', 'cyberpunk'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setThemeMode(mode)}
                        className={`h-12 rounded-xl flex items-center justify-center border text-sm font-bold capitalize transition-all ${
                          themeMode === mode 
                            ? 'bg-blue-600 text-white border-blue-500' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {mode === 'dark' ? 'Sleek Dark Mode' : 'Neon Cyberpunk'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveBranding}
                  disabled={isSavingBranding}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                  {isSavingBranding ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Áp dụng thương hiệu
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-[#0A101A]/80 border border-blue-500/20 p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 mb-4">Giao diện xem trước (Customer Portal)</h3>
                
                {/* Simulated Customer App */}
                <div className="bg-[#050a15] border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{brandLogo}</span>
                    <span className="font-black text-white text-md">{brandName}</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl space-y-2 border border-slate-800">
                    <p className="text-xs text-slate-400">Ví bồi hoàn bão hòa của bạn</p>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-white">450 <span className="text-xs text-slate-500 font-bold">NFTk</span></span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-white ${
                        primaryColor === 'indigo' ? 'bg-indigo-600' :
                        primaryColor === 'emerald' ? 'bg-emerald-600' :
                        primaryColor === 'amber' ? 'bg-amber-600' :
                        primaryColor === 'rose' ? 'bg-rose-600' : 'bg-violet-600'
                      }`}>
                        Hạng Vàng
                      </span>
                    </div>
                  </div>
                  <button className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all ${
                    primaryColor === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' :
                    primaryColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    primaryColor === 'amber' ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                    primaryColor === 'rose' ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                    'bg-violet-600 hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  }`}>
                    Đổi Voucher POS KiotViet
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                *Khi thay đổi, màu sắc thương hiệu và logo sẽ được đồng bộ ngay tức thì đến giao diện ví bồi hoàn của Khách hàng.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Web3 Treasury Hub */}
        {activeTab === 'treasury' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left: Action controls */}
            <div className="md:col-span-2 space-y-6">
              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0A101A]/80 border border-blue-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">MINTED SUPPLY</span>
                  <span className="text-xl font-black text-white font-mono">{treasuryTotal.toLocaleString()} NFTk</span>
                </div>
                <div className="bg-[#0A101A]/80 border border-blue-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">DISTRIBUTED POOL</span>
                  <span className="text-xl font-black text-indigo-400 font-mono">{treasuryDistributed.toLocaleString()} NFTk</span>
                </div>
                <div className="bg-[#0A101A]/80 border border-blue-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">SLA BUFFER</span>
                  <span className="text-xl font-black text-orange-400 font-mono">{slaBuffer.toLocaleString()} NFTk</span>
                </div>
              </div>

              {/* Action Mint / Burn */}
              <div className="grid grid-cols-2 gap-6">
                {/* Mint card */}
                <div className="bg-[#0A101A]/80 border border-blue-500/20 p-5 rounded-2xl space-y-4">
                  <h4 className="font-bold text-white flex items-center gap-2"><Zap size={16} className="text-emerald-400" /> Mint Additional Supply</h4>
                  <div className="space-y-3">
                    <input 
                      type="number" 
                      value={mintAmount} 
                      onChange={e => setMintAmount(Number(e.target.value))}
                      className="w-full bg-[#050a15] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                    <button
                      onClick={handleMintTreasury}
                      disabled={isMinting}
                      className="w-full py-2.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/30 text-emerald-400 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {isMinting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      Execute Mint Transaction
                    </button>
                  </div>
                </div>

                {/* Burn card */}
                <div className="bg-[#0A101A]/80 border border-blue-500/20 p-5 rounded-2xl space-y-4">
                  <h4 className="font-bold text-white flex items-center gap-2"><Flame size={16} className="text-rose-400" /> Burn Excess Supply</h4>
                  <div className="space-y-3">
                    <input 
                      type="number" 
                      value={burnAmount} 
                      onChange={e => setBurnAmount(Number(e.target.value))}
                      className="w-full bg-[#050a15] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                    <button
                      onClick={handleBurnTreasury}
                      disabled={isBurning}
                      className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {isBurning ? <Loader2 size={12} className="animate-spin" /> : <Flame size={12} />}
                      Execute Burn Transaction
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Treasury logs */}
            <div className="bg-[#0A101A]/80 border border-blue-500/20 p-6 rounded-2xl shadow-xl flex flex-col h-full min-h-[300px]">
              <h4 className="font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Layers size={16} className="text-blue-400" /> Treasury Ledger Audit
              </h4>
              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] hide-scrollbar">
                {treasuryLogs.map((log, idx) => (
                  <div key={idx} className="border border-slate-800 p-2.5 rounded-lg space-y-1.5 bg-black/40">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${log.action === 'MINT' ? 'text-emerald-400' : log.action === 'BURN' ? 'text-rose-400' : 'text-orange-400'}`}>
                        {log.action}
                      </span>
                      <span className="text-slate-500">Block #{log.block}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Amount:</span>
                      <span className="font-bold">{log.amount.toLocaleString()} NFTk</span>
                    </div>
                    <div className="text-[10px] text-slate-600 truncate">Tx: {log.tx}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Zalo OA Rich Menu Builder */}
        {activeTab === 'zalo_menu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Mockup phone & rich menu preview */}
            <div className="bg-[#0A101A]/80 border border-blue-500/20 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 block w-full text-left border-b border-slate-800 pb-2">Zalo OA Chat Mockup</h3>
              
              {/* Phone Container */}
              <div className="w-[280px] h-[480px] bg-[#020408] border-4 border-slate-800 rounded-[36px] overflow-hidden flex flex-col justify-between shadow-2xl relative">
                {/* Status Bar */}
                <div className="h-6 bg-slate-900 flex justify-between items-center px-4 text-[10px] text-slate-500 font-bold select-none">
                  <span>NextFlow OA</span>
                  <span>12:00</span>
                </div>

                {/* Chat Log Body */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto text-[10px] select-none hide-scrollbar">
                  <div className="bg-slate-900 text-slate-300 p-2 rounded-xl max-w-[80%]">
                    Chào mừng bạn đến với Zalo OA của chúng tôi! Chọn các phím chức năng nhanh ở bên dưới để trải nghiệm dịch vụ tự động.
                  </div>
                  <div className="bg-blue-600 text-white p-2 rounded-xl max-w-[80%] ml-auto">
                    Tra cứu đơn hàng
                  </div>
                  <div className="bg-slate-900 text-slate-300 p-2 rounded-xl max-w-[80%]">
                    [Triage Agent] Tìm thấy 1 đơn hàng trễ hẹn. Đang hoàn tất bồi thường 50 NFTk vào ví của bạn.
                  </div>
                </div>

                {/* Zalo Rich Menu Mockup */}
                <div className="bg-slate-900 border-t border-slate-800">
                  <div className="grid grid-cols-3 divide-x divide-slate-800 h-[60px]">
                    {zaloMenuButtons.map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => handleEditButton(btn.id)}
                        className={`h-full flex items-center justify-center text-[10px] font-bold text-center px-1 text-slate-300 hover:bg-slate-800 transition-colors ${
                          editingButtonId === btn.id ? 'bg-blue-900/30 text-blue-400 ring-2 ring-blue-500/50' : ''
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic mt-3 text-center">
                *Click vào nút menu trên điện thoại giả lập để chỉnh sửa hành động nhanh.
              </p>
            </div>

            {/* Editor Detail Form */}
            <div className="md:col-span-2 bg-[#0A101A]/80 border border-blue-500/20 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
                  <Settings className="text-blue-400" /> Cấu hình Nút Menu Tương Tác Zalo OA
                </h3>

                {editingButtonId !== null ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tiêu đề nút bấm</label>
                      <input 
                        type="text"
                        value={tempLabel}
                        onChange={e => setTempLabel(e.target.value)}
                        className="w-full bg-[#050a15] border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Loại hành động (Action Event)</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['link', 'chat_command'].map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              setTempActionType(type);
                              setTempVal('');
                            }}
                            className={`h-11 rounded-xl flex items-center justify-center border text-xs font-bold capitalize transition-all ${
                              tempActionType === type 
                                ? 'bg-blue-600 text-white border-blue-500' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {type === 'link' ? 'Mở đường dẫn (Link)' : 'Gửi tin nhắn (Chat Command)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {tempActionType === 'link' ? 'Địa chỉ URL (Mở Customer Portal)' : 'Nội dung tin nhắn kích hoạt AI'}
                      </label>
                      <input 
                        type="text"
                        value={tempVal}
                        onChange={e => setTempVal(e.target.value)}
                        placeholder={tempActionType === 'link' ? 'https://...' : 'Ví dụ: Hỗ trợ tôi tra đơn hàng'}
                        className="w-full bg-[#050a15] border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveButton}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        Lưu thiết lập nút
                      </button>
                      <button
                        onClick={() => setEditingButtonId(null)}
                        className="bg-transparent hover:bg-slate-800 border border-slate-800 text-slate-400 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 text-center py-12 text-slate-500 text-sm">
                    Chọn một nút bấm trong điện thoại giả lập bên trái để tiến hành cấu hình sự kiện phản hồi.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-6 mt-6 flex justify-end">
                <button
                  onClick={handlePublishZaloMenu}
                  disabled={isSavingZaloMenu}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(59,130,246,0.2)] flex items-center gap-2 transition-all"
                >
                  {isSavingZaloMenu ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Phát hành Rich Menu lên Zalo OA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save zalo menu Toast */}
        {showZaloMenuToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-blue-500/30 text-blue-400 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn">
            <MessageCircle className="text-blue-400 animate-bounce" size={20} />
            <div>
              <p className="font-bold text-sm">Rich Menu đã cập nhật thành công!</p>
              <p className="text-xs text-slate-400">Đã cập nhật giao diện tương tác mới trên Zalo OA.</p>
            </div>
          </div>
        )}

        {/* Save branding Toast */}
        {showBrandingToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-blue-500/30 text-blue-400 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn">
            <Paintbrush className="text-blue-400 animate-bounce" size={20} />
            <div>
              <p className="font-bold text-sm">Đã đồng bộ thương hiệu!</p>
              <p className="text-xs text-slate-400">Diện mạo mới đã được phát hành trên các Portal.</p>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Installation Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-[#02040A]/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#0B101A] border border-blue-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(59,130,246,0.15)] overflow-hidden relative flex flex-col"
            >
              {/* Terminal Header */}
              <div className="bg-[#05080F] border-b border-blue-500/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    {React.createElement(IconMap[selectedApp.icon_url] || AppWindow, { size: 16 })}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Database size={14} className="text-blue-400"/> API Connection
                    </h3>
                    <div className="text-[10px] text-slate-500 font-mono">TARGET: {selectedApp.name}</div>
                  </div>
                </div>
                <button 
                  onClick={() => !installing && setSelectedApp(null)}
                  disabled={installing}
                  className="text-slate-500 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                
                {/* Credentials Form */}
                <div className={`space-y-4 transition-opacity duration-300 ${installing || installLogs.length > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  {selectedApp.fields_required.map((field: string) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        {field.replace('_', ' ')}
                      </label>
                      <input 
                        type="password"
                        value={credentials[field] || ''}
                        onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                        placeholder={`Enter ${field}...`}
                        disabled={installing || installLogs.length > 0}
                        className="w-full bg-[#020408] border border-slate-700 focus:border-blue-500 px-4 py-3 rounded-xl text-white outline-none transition-colors font-mono text-sm shadow-inner"
                      />
                    </div>
                  ))}
                </div>

                {/* Console Log Area (Appears during install) */}
                <AnimatePresence>
                  {(installing || installLogs.length > 0) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="bg-black/80 rounded-xl border border-blue-500/30 p-4 font-mono text-[11px] flex flex-col gap-2 relative overflow-hidden"
                    >
                      {/* Scanline */}
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50"></div>
                      
                      {installLogs.map((log, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }}
                          className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('ERROR') ? 'text-rose-400 font-bold' : 'text-blue-400'}
                        >
                          {log}
                        </motion.div>
                      ))}

                      {/* Progress Bar */}
                      <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                          initial={{ width: 0 }}
                          animate={{ width: `${installProgress}%` }}
                        ></motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedApp(null)}
                    disabled={installing}
                    className="flex-1 py-3 bg-transparent hover:bg-white/5 border border-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {installLogs.length > 0 && !installing ? 'Đóng' : 'Hủy bỏ'}
                  </button>
                  {(!installLogs.length || installLogs.some(l => l.includes('ERROR'))) && (
                    <button 
                      onClick={handleInstall}
                      disabled={installing}
                      className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_5px_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
                    >
                      {installing ? (
                        <><Loader2 size={16} className="animate-spin" /> EXECUTING...</>
                      ) : (
                        <><Zap size={16} /> INITIALIZE LINK</>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .text-shadow-glow {
          text-shadow: 0 0 15px currentColor;
        }
      `}</style>
    </div>
  );
}
