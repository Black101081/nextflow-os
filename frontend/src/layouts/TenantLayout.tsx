
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Activity, 
  Store, 
  DollarSign, 
  Inbox, 
  LogOut 
} from 'lucide-react';

export default function TenantLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLeader = user?.role === 'SME_LEADER' || user?.role === 'PLATFORM_ADMIN';

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
          <div className="brand-logo" style={{ width: '32px', height: '32px', fontSize: '14px' }}>NF</div>
          <div>
            <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>Workspace</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Role: {user?.role}</div>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isLeader && (
            <NavLink to="/tenant/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Activity size={18} /> Admin Dashboard
            </NavLink>
          )}
          
          <NavLink to="/workspace" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Inbox size={18} /> Công việc (Workspace)
          </NavLink>

          {isLeader && (
            <>
              <NavLink to="/tenant/appstore" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Store size={18} /> App Store & Ecosystem
              </NavLink>
              <NavLink to="/tenant/billing" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <DollarSign size={18} /> Billing & Quota
              </NavLink>
            </>
          )}
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

