import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const location = useLocation();
  const hostname = window.location.hostname;
  const port = window.location.port;

  let fallbackPath = '/staff/workspace';
  if (port === '8081' || hostname.startsWith('platform')) {
    fallbackPath = '/platform/admin';
  } else if (port === '8082' || hostname.startsWith('leader')) {
    fallbackPath = '/leader/dashboard';
  } else if (port === '8083' || hostname.startsWith('staff')) {
    fallbackPath = '/staff/workspace';
  } else if (port === '8084' || hostname.startsWith('customer')) {
    fallbackPath = '/customer';
  }

  const from = location.state?.from?.pathname || fallbackPath;

  let defaultTenantId = '';
  let defaultSecret = '';
  let defaultEmail = '';
  let defaultPassword = '';

  if (port === '8081' || hostname.startsWith('platform')) {
    defaultTenantId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    defaultSecret = 'nf_platform_secret_admin_key_2026';
    defaultEmail = 'admin@platform.com';
    defaultPassword = 'nf_platform_secret_admin_key_2026';
  } else {
    // SME Applications (Ports 8082, 8083, etc.)
    defaultTenantId = '4cd5f972-39b5-4786-97b6-32a4a081d859';
    defaultSecret = 'nf_live_test_4cd5f972-39b5-4786-97b6-32a4a081d859';
    defaultEmail = 'admin@smartretail.vn';
    defaultPassword = 'Sme_Nextflow_2026!';
  }

  const [loginMode, setLoginMode] = useState<'credentials' | 'tenant'>('credentials');
  const [tenantId, setTenantId] = useState(defaultTenantId);
  const [secret, setSecret] = useState(defaultSecret);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body = loginMode === 'credentials'
        ? { grant_type: 'password', username: email, password: password }
        : { grant_type: 'client_credentials', client_id: tenantId, client_secret: secret };

      const response = await fetch('/api/v1/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Đăng nhập thất bại');
      }

      login(data.access_token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      fontFamily: '"Outfit", sans-serif'
    }}>
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.45)', 
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', 
        width: '420px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            fontSize: '18px', fontWeight: 800, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            borderRadius: '10px', color: '#fff' 
          }}>NF</div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#f8fafc', fontSize: '20px', fontWeight: 700 }}>
          Đăng Nhập Nextflow OS
        </h2>
        
        {/* Tab Selection */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(15, 23, 42, 0.6)', 
          padding: '4px', 
          borderRadius: '8px', 
          marginBottom: '24px' 
        }}>
          <button 
            type="button"
            onClick={() => setLoginMode('credentials')}
            style={{ 
              flex: 1, 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: 'none',
              background: loginMode === 'credentials' ? '#3b82f6' : 'transparent',
              color: loginMode === 'credentials' ? '#fff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Email / Password
          </button>
          <button 
            type="button"
            onClick={() => setLoginMode('tenant')}
            style={{ 
              flex: 1, 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: 'none',
              background: loginMode === 'tenant' ? '#3b82f6' : 'transparent',
              color: loginMode === 'tenant' ? '#fff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Developer (Tenant ID)
          </button>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            fontSize: '13px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {loginMode === 'credentials' ? (
            <>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ 
                    width: '100%', 
                    padding: '11px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(15,23,42,0.4)', 
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ 
                    width: '100%', 
                    padding: '11px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(15,23,42,0.4)', 
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Tenant ID (UUID)</label>
                <input 
                  type="text" 
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="ffffffff-ffff-ffff-ffff-ffffffffffff"
                  style={{ 
                    width: '100%', 
                    padding: '11px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(15,23,42,0.4)', 
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Secret Key</label>
                <input 
                  type="password" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="nf_secret_..."
                  style={{ 
                    width: '100%', 
                    padding: '11px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(15,23,42,0.4)', 
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
