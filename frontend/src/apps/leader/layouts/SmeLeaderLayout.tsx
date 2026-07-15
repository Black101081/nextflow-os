import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  DollarSign, 
  Share2,
  LogOut,
  MessageSquare,
  Network,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingCart,
  BarChart2,
  Box,
  Settings,
  Bell,
  Search,
  Users,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import Avatar from '../../../shared/components/ui/Avatar';

export default function SmeLeaderLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: "Tổng quan",
      items: [
        { name: "Bảng điều khiển", href: "/leader/dashboard", icon: LayoutDashboard },
        { name: "Analytics & Báo cáo", href: "/leader/analytics", icon: BarChart2 },
      ]
    },
    {
      title: "Nghiệp vụ cốt lõi",
      items: [
        { name: "Tài chính & Kế toán", href: "/leader/finance", icon: DollarSign },
        { name: "Nhân sự & Bảng lương", href: "/leader/hr", icon: Users },
        { name: "Quản lý Kho & Cung ứng", href: "/leader/inventory", icon: Box },
        { name: "Vận hành & Hợp đồng", href: "/leader/operations", icon: Briefcase },
        { name: "Bán lẻ & Đặt lịch (POS)", href: "/leader/front-ops", icon: ShoppingCart },
      ]
    },
    {
      title: "Vận hành & Kinh doanh",
      items: [
        { name: "Vận hành ngành", href: "/leader/packs", icon: Package },
        { name: "KiotViet Kanban", href: "/leader/kiotviet", icon: ShoppingCart },
        { name: "Omni-Channel Chat", href: "/leader/chat", icon: MessageSquare },
      ]
    },
    {
      title: "Tự động hóa",
      items: [
        { name: "Automation Workflow", href: "/leader/workflows", icon: Network },
        { name: "Cấu hình Tích hợp", href: "/leader/integrations", icon: Share2 },
        { name: "Gamification & KPI", href: "/leader/gamification", icon: Trophy },
      ]
    },
    {
      title: "Thiết lập hệ thống",
      items: [
        { name: "Chợ ứng dụng", href: "/leader/appstore", icon: Store },
        { name: "Thanh toán & Gói cước", href: "/leader/billing", icon: DollarSign },
        { name: "Quản lý Thực thể", href: "/leader/entities", icon: Box },
        { name: "Bảo mật & Sức khỏe", href: "/leader/security-health", icon: ShieldCheck },
        { name: "Admin Dashboard", href: "/leader/admin", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen w-full bg-[#0b0c10] text-[#f1f5f9] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`bg-[#12141c] border-r border-[#242936] flex flex-col justify-between shadow-2xl z-10 transition-all duration-300 shrink-0 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Logo & Brand */}
          <div className="h-16 flex items-center px-6 border-b border-[#242936] bg-[#1a1d29]/40 justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate('/leader/dashboard')}>
              <div className="w-8 h-8 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                NX
              </div>
              {!isCollapsed && (
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap">
                  NextFlow OS
                </span>
              )}
            </div>
          </div>

          {/* Grouped Navigation Menu */}
          <div className="p-4 flex flex-col gap-5">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="flex flex-col gap-1">
                {!isCollapsed && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 block">
                    {group.title}
                  </span>
                )}
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      title={isCollapsed ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 border ${
                        isActive 
                          ? "bg-indigo-600 text-white border-indigo-500/20 shadow-md shadow-indigo-600/10" 
                          : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                      {!isCollapsed && (
                        <span className="font-medium text-sm whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Profile & Collapse Toggle & Logout */}
        <div className="p-4 border-t border-[#242936] flex flex-col gap-2 shrink-0 bg-[#12141c]">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors w-full border border-transparent"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isCollapsed && <span className="font-medium text-xs">Thu nhỏ Menu</span>}
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full border border-transparent"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#242936] bg-[#12141c]/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 max-w-md w-full bg-[#12141c] border border-[#242936] px-3.5 py-1.5 rounded-lg">
            <Search className="text-slate-500 shrink-0" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm báo cáo, hóa đơn, nhân viên..." 
              className="bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors duration-150">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>

            <div className="h-6 w-px bg-[#242936]" />

            <div className="flex items-center gap-2.5">
              <Avatar name={user?.full_name || 'Leader User'} size="sm" status="online" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Leader User'}</span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Leader Workspace</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0b0c10]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

