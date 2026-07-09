import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Activity, FileText, Settings, UserCircle, LogOut, Cpu } from "lucide-react";

export function TenantLayout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "KiotViet Orders", href: "/app/orders", icon: ShoppingCart },
    { name: "VietQR Billing", href: "/app/billing", icon: FileText },
    { name: "Intelligence", href: "/app/intelligence", icon: Cpu },
    { name: "Workflows", href: "/app/workflows", icon: Activity },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0b0c10] text-[#f1f5f9] overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-[#12141c] border-r border-[#242936] flex flex-col justify-between shadow-lg z-10">
        <div>
          {/* Logo & Brand */}
          <div className="h-16 flex items-center px-6 border-b border-[#242936] bg-opacity-80 backdrop-blur-md">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/app/dashboard'}>
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                NX
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                NextFlow OS
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-6 flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
              Workspace
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1d29]"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`font-medium text-[15px] ${isActive ? "text-white" : ""}`}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#242936]">
          <div className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1d29] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#242936]">
            <div className="flex items-center gap-3">
              <UserCircle className="w-8 h-8 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Admin User</span>
                <span className="text-xs text-slate-500">Demo Tenant</span>
              </div>
            </div>
            <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#242936] bg-[#12141c]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="text-sm font-medium text-slate-400 capitalize">
            {location.pathname.replace("/app/", "").replace("-", " ")}
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
