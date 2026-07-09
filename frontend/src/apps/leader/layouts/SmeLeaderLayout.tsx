import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  DollarSign, 
  Share2,
  LogOut,
  UserCircle,
  MessageSquare,
  Network,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function SmeLeaderLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: "Bảng điều khiển", href: "/leader/dashboard", icon: LayoutDashboard },
    { name: "Chợ ứng dụng", href: "/leader/appstore", icon: Store },
    { name: "Thanh toán & Gói cước", href: "/leader/billing", icon: DollarSign },
    { name: "Cấu hình Tích hợp", href: "/leader/integrations", icon: Share2 },
    { name: "Omni-Channel Chat", href: "/leader/chat", icon: MessageSquare },
    { name: "Tự động hóa", href: "/leader/workflows", icon: Network },
    { name: "Gamification & KPI", href: "/leader/gamification", icon: Trophy },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-[#f1f5f9] overflow-hidden font-sans">
      {/* Sidebar */}
      <div 
        className={`bg-[#1e293b] border-r border-[#334155] flex flex-col justify-between shadow-lg z-10 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-16 flex items-center px-5 border-b border-[#334155] bg-opacity-80 backdrop-blur-md justify-between">
            <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate('/leader/dashboard')}>
              <div className="w-8 h-8 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                NX
              </div>
              {!isCollapsed && (
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap">
                  NextFlow OS
                </span>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-6 flex flex-col gap-2">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 whitespace-nowrap">
                Leader Workspace
              </div>
            )}
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#334155] border border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && (
                    <span className={`font-medium text-[15px] whitespace-nowrap ${isActive ? "text-white" : ""}`}>
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Profile & Collapse Toggle & Logout */}
        <div className="p-3 border-t border-[#334155] flex flex-col gap-2">
          {/* User profile */}
          <div className="flex items-center justify-between px-2 py-2 bg-[#334155]/50 rounded-lg border border-[#334155] overflow-hidden">
            <div className="flex items-center gap-3">
              <UserCircle className="w-8 h-8 shrink-0 text-slate-400" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">Leader</span>
                  <span className="text-xs text-slate-500 truncate w-32">{user?.tenant_id || "Tenant"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#334155] hover:text-white transition-colors w-full border border-transparent"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              {!isCollapsed && <span className="font-medium text-[14px]">Thu nhỏ Menu</span>}
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full border border-transparent"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="font-medium text-[14px]">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#242936] bg-[#12141c]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="text-lg font-semibold text-slate-200 capitalize flex items-center gap-2">
            {location.pathname.replace("/leader/", "").replace("-", " ")}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1a1d29] px-3 py-1.5 rounded-full border border-[#242936]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">System Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
