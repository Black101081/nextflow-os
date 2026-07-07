
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Globe, Activity, LogOut } from 'lucide-react';

export default function PlatformLayout() {
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
          <div className="brand-logo" style={{ width: '32px', height: '32px', fontSize: '14px' }}>NF</div>
          <div>
            <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>Platform Admin</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/platform/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Layers size={18} /> Quản lý Tenants
          </NavLink>
          <NavLink to="/platform/ecosystem" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Globe size={18} /> Ecosystem
          </NavLink>
          <NavLink to="/platform/observability" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Activity size={18} /> Observability
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

