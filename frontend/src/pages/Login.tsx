import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const location = useLocation();

  const from = location.state?.from?.pathname || '/workspace';

  // Tự động nhận diện port và điền sẵn thông tin (chỉ dành cho test/dev)
  const isDev = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  const port = window.location.port;

  let defaultTenantId = '';
  let defaultSecret = '';

  if (isDev) {
    if (port === '8081') {
      // Layer 1: Platform Admin
      defaultTenantId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      defaultSecret = 'nf_platform_secret_admin_key_2026';
    } else {
      // Layer 2, 3: Tenant Admin & Staff
      defaultTenantId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
      defaultSecret = 'nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851';
    }
  }

  const [tenantId, setTenantId] = useState(defaultTenantId);
  const [secret, setSecret] = useState(defaultSecret);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: tenantId,
          client_secret: secret
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || 'Đăng nhập thất bại');
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
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)' }}>
      <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-color)' }}>Đăng Nhập Nextflow OS</h2>
        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-color)', fontSize: '14px' }}>Tenant ID</label>
            <input 
              type="text" 
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Nhập Tenant UUID"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-color)', fontSize: '14px' }}>Secret Key</label>
            <input 
              type="password" 
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="nf_secret_..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
