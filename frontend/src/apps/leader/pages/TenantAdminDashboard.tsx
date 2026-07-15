import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, ShoppingBag, MapPin, CheckSquare, BarChart2, ShieldCheck, 
  Users, Network, LogOut, Settings, Bell, ChevronLeft, ChevronRight 
} from 'lucide-react';
import EntityBuilder from './EntityBuilder';
import KiotVietKanban from './KiotVietKanban';
import AnalyticsDashboard from './AnalyticsDashboard';
import BlockchainAudit from './BlockchainAudit';
import GrillMeChatbot from '../components/GrillMeChatbot';
import FieldOperationsMap from '../components/FieldOperationsMap';
import ApprovalsHub from '../components/ApprovalsHub';
import CustomerCRM from '../components/CustomerCRM';
import WorkflowBuilder from './WorkflowBuilder';
import { useAuth } from '../../../shared/contexts/AuthContext';

export default function TenantAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'entity' | 'workflow' | 'analytics' | 'integrations' | 'blockchain' | 'field_map' | 'approvals' | 'crm'>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const menuItems = [
    { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { id: 'home', icon: <ShoppingBag size={20} />, label: 'Đơn KiotViet' },
    { id: 'crm', icon: <Users size={20} />, label: 'CRM Khách Hàng' },
    { id: 'workflow', icon: <Network size={20} />, label: 'Workflow Auto' },
    { id: 'approvals', icon: <CheckSquare size={20} />, label: 'Phê duyệt' },
    { id: 'field_map', icon: <MapPin size={20} />, label: 'Hiện trường' },
    { id: 'entity', icon: <Database size={20} />, label: 'Data Builder' },
    { id: 'blockchain', icon: <ShieldCheck size={20} />, label: 'Blockchain Audit' },
  ];

  return (
    <div className="flex h-full bg-[#0a0f1c] text-slate-200 overflow-hidden" style={{ fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Sci-Fi Glassmorphism Sidebar */}
      <motion.div 
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="relative flex flex-col border-r border-indigo-500/20 backdrop-blur-xl"
        style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 28, 0.9) 100%)', boxShadow: '5px 0 20px rgba(0,0,0,0.3)' }}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                  N
                </div>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 whitespace-nowrap">
                  NEXTFLOW OS
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Tenant Profile (Condensed) */}
        <div className="p-4 border-b border-white/5">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="relative">
              <img src={`https://ui-avatars.com/api/?name=${user?.tenant_name || 'T'}&background=312e81&color=a5b4fc`} alt="Tenant" className="w-10 h-10 rounded-full border border-indigo-500/50" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0f1c]"></div>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-white truncate">{user?.tenant_name || 'Tenant Space'}</div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> ONLINE
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 hide-scrollbar">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                )}
                <div className={`${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-300'} transition-colors`}>
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <button className={`flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors ${sidebarOpen ? '' : 'justify-center'}`}>
            <Settings size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button className={`flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${sidebarOpen ? '' : 'justify-center'}`}>
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1c] relative">
        {/* Glow effect in background */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Topbar */}
        <header className="h-16 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {menuItems.find(m => m.id === activeTab)?.label?.toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet Balance Mock */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <span className="text-emerald-500 text-xs font-bold">BALANCE:</span>
              <span className="text-emerald-400 text-sm font-black">2,450,000 ₫</span>
            </div>
            <button className="relative p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0a0f1c]"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Rendering */}
        <main className="flex-1 overflow-auto p-6 z-10 relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'blockchain' && <BlockchainAudit />}
              {activeTab === 'home' && <KiotVietKanban />}
              {activeTab === 'field_map' && <div style={{ height: '100%' }}><FieldOperationsMap /></div>}
              {activeTab === 'approvals' && <ApprovalsHub />}
              {activeTab === 'crm' && <CustomerCRM />}
              {activeTab === 'entity' && <EntityBuilder />}
              {activeTab === 'workflow' && <WorkflowBuilder />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating RAG Chatbot */}
      <GrillMeChatbot />
    </div>
  );
}
