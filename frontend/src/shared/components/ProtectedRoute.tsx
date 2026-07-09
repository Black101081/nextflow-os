import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // SME_LEADER luôn có full quyền hoặc platform admin
  if (user.role === 'SME_LEADER' || user.role === 'PLATFORM_ADMIN' || !allowedRoles || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return (
    <div style={{ 
      padding: '32px', 
      background: 'rgba(239, 68, 68, 0.05)', 
      border: '1px dashed rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      margin: '24px',
      textAlign: 'center'
    }}>
      <div style={{ 
        width: '48px', height: '48px', borderRadius: '50%', 
        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: '24px'
      }}>
        🛡️
      </div>
      <h3 style={{ color: '#ef4444', marginTop: 0, fontSize: '18px' }}>Truy Cập Bị Từ Chối</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
        Tài khoản của bạn (<strong>{user.role}</strong>) không có đủ quyền để truy cập tính năng này. Vui lòng liên hệ Leader để được cấp quyền.
      </p>
    </div>
  );
}
