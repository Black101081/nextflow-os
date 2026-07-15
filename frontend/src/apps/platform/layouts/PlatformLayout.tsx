
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import CommandPalette from '../../../shared/components/CommandPalette';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  Layers, Globe, Activity, LogOut, 
  DollarSign, Users, ScrollText, Webhook, Brain, Trophy, Shield,
  ChevronLeft, ChevronRight, Sliders, ShieldAlert, Lock, TrendingUp
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  color?: string;
}

function NavItem({ to, icon, label, collapsed, color }: NavItemProps) {
  return (
    <NavLink 
      to={to} 
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: collapsed ? 0 : '12px', 
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '10px 16px', 
            borderRadius: '8px', 
            color: isActive ? '#fff' : '#94a3b8', 
            background: isActive ? (color || 'rgba(59, 130, 246, 0.15)') : 'transparent',
            borderLeft: isActive ? `3px solid ${color ? color.replace('0.15', '1') : '#3b82f6'}` : '3px solid transparent',
            transition: 'all 0.2s',
            fontWeight: isActive ? 600 : 500,
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          title={collapsed ? label : undefined}
        >
          {icon}
          {!collapsed && <span>{label}</span>}
        </div>
      )}
    </NavLink>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div style={{ borderTop: '1px solid #334155', margin: '8px 12px' }} />;
  return (
    <div style={{ 
      fontSize: '10px', 
      fontWeight: 700, 
      color: '#475569', 
      textTransform: 'uppercase', 
      letterSpacing: '0.08em',
      padding: '12px 16px 4px 16px',
      userSelect: 'none'
    }}>
      {label}
    </div>
  );
}

export default function PlatformLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? '68px' : '260px';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0f172a', color: '#f8fafc', fontFamily: '"Outfit", sans-serif' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarWidth, 
        minWidth: sidebarWidth,
        borderRight: '1px solid #334155', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#1e293b',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: collapsed ? '20px 16px' : '20px 24px', 
          borderBottom: '1px solid #334155', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <div style={{ 
            width: '36px', height: '36px', minWidth: '36px',
            fontSize: '15px', fontWeight: 800, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            borderRadius: '8px', color: '#fff' 
          }}>NF</div>
          {!collapsed && (
            <div>
              <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Platform Admin</h2>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{user?.role || 'SaaS Provider'}</div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          <SectionLabel label="Quản trị" collapsed={collapsed} />
          <NavItem to="/platform/admin" icon={<Layers size={18} />} label="Quản lý Tenants" collapsed={collapsed} />
          <NavItem to="/platform/lifecycle" icon={<Users size={18} />} label="Tenant Lifecycle" collapsed={collapsed} />
          <NavItem to="/platform/users" icon={<Users size={18} />} label="User Management" collapsed={collapsed} />
          <NavItem to="/platform/feature-flags" icon={<Sliders size={18} />} label="Feature Flags" collapsed={collapsed} />
          <NavItem to="/platform/gamification" icon={<Trophy size={18} />} label="Gamification" collapsed={collapsed} />

          <SectionLabel label="Giám sát" collapsed={collapsed} />
          <NavItem to="/platform/ecosystem" icon={<Globe size={18} />} label="Ecosystem Catalog" collapsed={collapsed} />
          <NavItem to="/platform/observability" icon={<Activity size={18} />} label="Observability" collapsed={collapsed} />
          <NavItem to="/platform/security" icon={<ShieldAlert size={18} />} label="Security Center" collapsed={collapsed} />
          <NavItem to="/platform/revenue-analytics" icon={<TrendingUp size={18} />} label="Revenue Analytics" collapsed={collapsed} />
          <NavItem to="/platform/billing" icon={<DollarSign size={18} />} label="Billing & Invoices" collapsed={collapsed} />
          <NavItem to="/platform/ai-usage" icon={<Brain size={18} />} label="AI Intelligence" collapsed={collapsed} />
          <NavItem to="/platform/blockchain" icon={<Shield size={18} color="#3b82f6" />} label="Blockchain Ledger" collapsed={collapsed} />
          <NavItem to="/platform/webhooks" icon={<Webhook size={18} />} label="Webhooks & Workflows" collapsed={collapsed} />
          <NavItem to="/platform/audit" icon={<ScrollText size={18} />} label="Audit Log" collapsed={collapsed} />
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid #334155',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Thu gọn</>}
        </button>

        {/* Logout */}
        <div style={{ padding: '8px', borderTop: '1px solid #334155' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: '#ef4444', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: collapsed ? '12px' : '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '13px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && 'Đăng xuất'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a' }}>
        <Outlet />
      </div>

      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        role={user?.role as 'PLATFORM_ADMIN'} 
      />
    </div>
  );
}
