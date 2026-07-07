import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Activity, 
  Store, 
  DollarSign, 
  Share2,
  LogOut 
} from 'lucide-react';

export default function SmeLeaderLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--surface-color)'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo" style={{ width: '32px', height: '32px', fontSize: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>SL</div>
          <div>
            <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>SME Leader</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tenant: {user?.tenant_id?.slice(0, 8)}...</div>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/leader/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Activity size={18} /> Bảng điều khiển (Admin)
          </NavLink>
          
          <NavLink to="/leader/appstore" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Store size={18} /> Chợ ứng dụng (App Store)
          </NavLink>

          <NavLink to="/leader/billing" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <DollarSign size={18} /> Tài chính & Gói cước
          </NavLink>

          <NavLink to="/leader/integrations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Share2 size={18} /> Cấu hình Tích hợp (CSV)
          </NavLink>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--color-accent)', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
