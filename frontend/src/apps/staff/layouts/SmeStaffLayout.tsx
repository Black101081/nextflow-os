import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  Inbox, 
  LogOut,
  MessageSquare,
  MapPin,
  QrCode,
  Trophy
} from 'lucide-react';

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
    <div className="staff-layout">
      {/* Sidebar for Desktop */}
      <div className="staff-sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo" style={{ width: '32px', height: '32px', fontSize: '14px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>SS</div>
          <div>
            <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>SME Operator</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tenant: {user?.tenant_id?.slice(0, 8)}...</div>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/staff/workspace" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Inbox size={18} /> <span className="nav-text">Hộp thư công việc</span>
          </NavLink>
          <NavLink to="/staff/chat" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} /> <span className="nav-text">Omni-Channel Chat</span>
          </NavLink>
          <NavLink to="/staff/checkin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <MapPin size={18} /> <span className="nav-text">Check-in</span>
          </NavLink>
          <NavLink to="/staff/qr-scanner" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <QrCode size={18} /> <span className="nav-text">Quét QR</span>
          </NavLink>
          <NavLink to="/staff/gamification" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Trophy size={18} /> <span className="nav-text">Gamification & KPI</span>
          </NavLink>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '16px', background: 'var(--color-primary-light)', padding: '12px', borderRadius: '8px', color: 'var(--color-primary)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>NF Token</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{points}</div>
          </div>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--color-accent)', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> <span className="nav-text">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="staff-main">
        <Outlet />
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="staff-bottom-nav">
        <NavLink to="/staff/workspace" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Inbox size={20} />
          <span>Hộp thư</span>
        </NavLink>
        <NavLink to="/staff/chat" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>Chat</span>
        </NavLink>
        <NavLink to="/staff/checkin" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <MapPin size={20} />
          <span>Check-in</span>
        </NavLink>
        <NavLink to="/staff/gamification" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Trophy size={20} />
          <span>KPI</span>
        </NavLink>
      </div>

      <style>{`
        .staff-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: var(--bg-color);
          color: var(--text-color);
          overflow: hidden;
        }
        
        .staff-main {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 0;
        }

        .staff-sidebar {
          width: 260px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: var(--surface-color);
        }

        .staff-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background: var(--surface-color);
          border-top: 1px solid var(--border-color);
          z-index: 50;
          justify-content: space-around;
          align-items: center;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 10px;
          font-weight: 500;
          padding: 8px;
        }

        .bottom-nav-item.active {
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .staff-layout {
            flex-direction: column;
          }
          .staff-sidebar {
            display: none;
          }
          .staff-bottom-nav {
            display: flex;
          }
          .staff-main {
            padding-bottom: 65px; /* space for bottom nav */
          }
        }
      `}</style>
    </div>
  );
}
