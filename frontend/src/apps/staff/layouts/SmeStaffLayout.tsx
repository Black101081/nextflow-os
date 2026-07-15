import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  Inbox, 
  LogOut,
  MessageSquare,
  MapPin,
  QrCode,
  Trophy,
  Bell,
  Search,
  UserCircle
} from 'lucide-react';
import Avatar from '../../../shared/components/ui/Avatar';

export default function SmeStaffLayout() {
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = React.useState(0);

  React.useEffect(() => {
    if (token) {
      fetch('/api/v1/gamification/my-points', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(d => setPoints(d.total_points || 0))
      .catch(e => console.error(e));
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0c10] text-[#f1f5f9] overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#12141c] border-r border-[#242936] justify-between shadow-xl shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-[#242936] bg-[#1a1d29]/40 gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              NX
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm leading-tight text-white tracking-tight">SME Operator</h2>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                ID: {user?.tenant_id?.slice(0, 8)}
              </span>
            </div>
          </div>
          
          {/* Navigation links */}
          <nav className="p-4 flex flex-col gap-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Vận hành hằng ngày
            </div>
            
            <NavLink 
              to="/staff/workspace" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Inbox size={18} />
              <span>Hộp thư công việc</span>
            </NavLink>

            <NavLink 
              to="/staff/chat" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <MessageSquare size={18} />
              <span>Omni-Channel Chat</span>
            </NavLink>

            <NavLink 
              to="/staff/checkin" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <MapPin size={18} />
              <span>Check-in địa điểm</span>
            </NavLink>

            <NavLink 
              to="/staff/qr-scanner" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <QrCode size={18} />
              <span>Quét mã QR</span>
            </NavLink>

            <NavLink 
              to="/staff/gamification" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Trophy size={18} />
              <span>Gamification & KPI</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer info & points */}
        <div className="p-4 border-t border-[#242936] flex flex-col gap-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">NF Tokens</span>
              <span className="text-xl font-bold text-white tracking-tight">{points}</span>
            </div>
            <Trophy className="text-indigo-400" size={24} />
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 w-full justify-start"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header bar */}
        <header className="h-16 border-b border-[#242936] bg-[#12141c]/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 max-w-md w-full bg-[#12141c] border border-[#242936] px-3.5 py-1.5 rounded-lg">
            <Search className="text-slate-500 shrink-0" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm công việc, SOP..." 
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
              <Avatar name={user?.full_name || 'Staff User'} size="sm" status="online" />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Staff User'}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{user?.role || 'Staff'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[#0b0c10]">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#12141c] border-t border-[#242936] flex items-center justify-around z-50 px-2 pb-safe">
        <NavLink 
          to="/staff/workspace" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors duration-150 ${
              isActive ? 'text-indigo-400' : 'text-slate-500'
            }`
          }
        >
          <Inbox size={20} />
          <span>Hộp thư</span>
        </NavLink>
        
        <NavLink 
          to="/staff/chat" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors duration-150 ${
              isActive ? 'text-indigo-400' : 'text-slate-500'
            }`
          }
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </NavLink>

        <NavLink 
          to="/staff/checkin" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors duration-150 ${
              isActive ? 'text-indigo-400' : 'text-slate-500'
            }`
          }
        >
          <MapPin size={20} />
          <span>Checkin</span>
        </NavLink>

        <NavLink 
          to="/staff/gamification" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors duration-150 ${
              isActive ? 'text-indigo-400' : 'text-slate-500'
            }`
          }
        >
          <Trophy size={20} />
          <span>KPI</span>
        </NavLink>
      </nav>
    </div>
  );
}

