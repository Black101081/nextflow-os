
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Layers, Globe, Activity, LogOut } from 'lucide-react';

export default function PlatformLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0f172a', color: '#f8fafc', fontFamily: '"Outfit", sans-serif' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        borderRight: '1px solid #334155', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#1e293b'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo" style={{ width: '36px', height: '36px', fontSize: '15px', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#fff' }}>NF</div>
          <div>
            <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Platform Admin</h2>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{user?.role || 'SaaS Provider'}</div>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <NavLink 
            to="/platform/admin" 
            style={{ textDecoration: 'none' }}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                color: isActive ? '#fff' : '#94a3b8', 
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px'
              }}>
                <Layers size={18} color={isActive ? '#3b82f6' : '#94a3b8'} /> Quản lý Tenants
              </div>
            )}
          </NavLink>
          <NavLink 
            to="/platform/ecosystem" 
            style={{ textDecoration: 'none' }}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                color: isActive ? '#fff' : '#94a3b8', 
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px'
              }}>
                <Globe size={18} color={isActive ? '#3b82f6' : '#94a3b8'} /> Ecosystem Catalog
              </div>
            )}
          </NavLink>
          <NavLink 
            to="/platform/observability" 
            style={{ textDecoration: 'none' }}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                color: isActive ? '#fff' : '#94a3b8', 
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px'
              }}>
                <Activity size={18} color={isActive ? '#3b82f6' : '#94a3b8'} /> Observability
              </div>
            )}
          </NavLink>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: '#ef4444', 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a' }}>
        <Outlet />
      </div>
    </div>
  );
}

