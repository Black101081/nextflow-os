import React from 'react';

interface ProtectedRouteProps {
  userRole?: string;
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ userRole, allowedRoles, children }: ProtectedRouteProps) {
  if (!userRole) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Đang tải thông tin phân quyền...
      </div>
    );
  }
  
  // SME_LEADER luôn có full quyền
  if (userRole === 'SME_LEADER' || allowedRoles.includes(userRole)) {
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
        Tài khoản của bạn (<strong>{userRole}</strong>) không có đủ quyền để truy cập tính năng này. Vui lòng liên hệ Leader để được cấp quyền.
      </p>
    </div>
  );
}
