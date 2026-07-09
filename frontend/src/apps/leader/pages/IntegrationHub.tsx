import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { 
  AppWindow, 
  MessageCircle, 
  ShoppingBag, 
  QrCode, 
  Truck, 
  Store, 
  CheckCircle, 
  DownloadCloud, 
  Settings, 
  X,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

// Icon mapper
const IconMap: Record<string, any> = {
  MessageCircle: MessageCircle,
  ShoppingBag: ShoppingBag,
  QrCode: QrCode,
  Truck: Truck,
  Store: Store,
  FileSpreadsheet: FileSpreadsheet,
};

export default function IntegrationHub() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  
  // Modal state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availableRes, installedRes] = await Promise.all([
        apiService.getAvailableIntegrations(user),
        apiService.getTenantIntegrations(user)
      ]);
      setAvailableApps(availableRes.data);
      setInstalledApps(installedRes.installed);
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const isInstalled = (appId: string) => {
    return installedApps.some(app => app.connector_name === appId && app.status === 'ACTIVE');
  };

  const handleOpenInstall = (app: any) => {
    setSelectedApp(app);
    setCredentials({});
  };

  const handleInstall = async () => {
    if (!selectedApp) return;
    try {
      setInstalling(true);
      // Simulate 2s delay for "installing" UX
      await new Promise(r => setTimeout(r, 2000));
      
      await apiService.installTenantIntegration(user, selectedApp.id, credentials);
      alert(`Đã kết nối ${selectedApp.name} thành công!`);
      setSelectedApp(null);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cài đặt.');
    } finally {
      setInstalling(false);
    }
  };

  if (loading && availableApps.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', width: '32px', height: '32px' }}></div>
          <span>Đang tải danh sách ứng dụng...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AppWindow color="var(--color-primary)" /> App Store & Integrations
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Khám phá và kết nối hệ thống với các nền tảng thiết yếu cho SME Việt Nam.</p>
        </div>
      </div>

      {/* App Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {availableApps.map((app) => {
          const Icon = IconMap[app.icon_url] || AppWindow;
          const installed = isInstalled(app.id);

          return (
            <div key={app.id} className="panel app-integration-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {/* Highlight bar at top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: installed ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: installed ? 'rgba(34, 197, 150, 0.1)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: installed ? 'var(--color-accent)' : 'var(--text-muted)',
                  border: `1px solid ${installed ? 'rgba(34, 197, 150, 0.3)' : 'rgba(255,255,255,0.1)'}`
                }}>
                  <Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{app.name}</h3>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-accent)' }}>
                    {app.category}
                  </span>
                </div>
              </div>
              
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.5', flex: 1, margin: '0 0 24px 0' }}>
                {app.description}
              </p>

              <div style={{ marginTop: 'auto' }}>
                {installed ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Đã kết nối
                    </div>
                    <button 
                      onClick={() => handleOpenInstall(app)}
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <Settings size={14} /> Cấu hình
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleOpenInstall(app)}
                    style={{ width: '100%', background: 'var(--color-accent)', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
                  >
                    <DownloadCloud size={16} /> Cài đặt
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Cài đặt */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <button 
              onClick={() => !installing && setSelectedApp(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                {React.createElement(IconMap[selectedApp.icon_url] || AppWindow, { size: 24 })}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Kết nối {selectedApp.name}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>Nhập thông tin xác thực để đồng bộ dữ liệu.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {selectedApp.fields_required.map((field: string) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-color)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                    {field.replace('_', ' ')}
                  </label>
                  <input 
                    type="password"
                    value={credentials[field] || ''}
                    onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                    placeholder={`Nhập ${field}...`}
                    disabled={installing}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setSelectedApp(null)}
                disabled={installing}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Hủy
              </button>
              <button 
                onClick={handleInstall}
                disabled={installing}
                style={{ flex: 2, padding: '12px', background: 'var(--color-accent)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                {installing ? (
                  <>
                    <Loader2 size={16} className="spinner-icon" /> Đang xử lý...
                  </>
                ) : (
                  <>Kết Nối Ngay</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .app-integration-card {
          background: rgba(30, 41, 59, 0.45) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(16px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .app-integration-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-accent) !important;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), 0 0 15px rgba(34, 197, 94, 0.15) !important;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
