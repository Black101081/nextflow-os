import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface User {
  sub: string;
  tenant_id: string;
  role: string;
  exp: number;
  api_key?: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nf_access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  useEffect(() => {
    if (!token && !autoLoggingIn) {
      const port = window.location.port;
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
      
      if (isLocal && (port === '8081' || port === '8082' || port === '8083')) {
        let tenantId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
        let secret = 'nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851';
        
        if (port === '8081') {
          tenantId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
          secret = 'nf_platform_secret_admin_key_2026';
        }
        
        setAutoLoggingIn(true);
        fetch('/api/v1/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: tenantId,
            client_secret: secret
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            setToken(data.access_token);
          }
        })
        .catch(err => {
          console.error("Auto login failed", err);
        })
        .finally(() => {
          setAutoLoggingIn(false);
        });
      }
    }
  }, [token, autoLoggingIn]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired");
          logout();
        } else {
          setUser(decoded);
          localStorage.setItem('nf_access_token', token);
          localStorage.setItem('nf_tenant_id', decoded.tenant_id);
        }
      } catch (e) {
        console.error("Invalid token", e);
        logout();
      }
    } else {
      setUser(null);
      localStorage.removeItem('nf_access_token');
      localStorage.removeItem('nf_tenant_id');
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const port = window.location.port;
  if (autoLoggingIn && (port === '8081' || port === '8082' || port === '8083')) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#09090b',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontSize: '12px', color: '#a1a1aa', letterSpacing: '0.05em' }}>
          ĐANG KHỞI TẠO PHÂN QUYỀN HỆ THỐNG...
        </span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
