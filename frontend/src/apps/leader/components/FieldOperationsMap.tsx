import { useEffect, useState, useRef } from 'react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { MapPin, RefreshCw } from 'lucide-react';

export default function FieldOperationsMap() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const loadCheckins = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFieldCheckins(auth);
      setCheckins(data || []);
    } catch (err) {
      console.error("Error loading checkins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckins();
  }, []);

  useEffect(() => {
    if (loading || checkins.length === 0) return;

    // Load Leaflet scripts from CDN dynamically if they don't exist yet
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Clean up previous map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Default center: Hanoi
      const defaultCenter: [number, number] = [21.0285, 105.8542];
      const validCheckins = checkins.filter(c => c.latitude !== null && c.longitude !== null);
      const center: [number, number] = validCheckins.length > 0 
        ? [validCheckins[0].latitude, validCheckins[0].longitude] 
        : defaultCenter;

      const map = L.map(mapContainerRef.current).setView(center, 13);
      mapInstanceRef.current = map;

      // Premium Dark-slate tile theme matching NextFlow OS design system
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Render checkin pins
      validCheckins.forEach(c => {
        const dateStr = new Date(c.created_at).toLocaleString('vi-VN');
        const popupContent = `
          <div style="color: #fff; background: #1e293b; padding: 10px; border-radius: 8px; font-family: sans-serif; font-size: 13px; max-width: 220px;">
            <div style="font-weight: bold; margin-bottom: 4px; color: var(--color-primary);">Check-in thành công</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">Thời gian: ${dateStr}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">Độ chính xác: ~${Math.round(c.accuracy || 0)}m</div>
            ${c.image_base64 ? `
              <div style="margin-top: 8px;">
                <img src="${c.image_base64}" alt="Proof" style="width: 100%; border-radius: 6px; max-height: 100px; object-fit: cover;" />
              </div>
            ` : '<div style="font-size: 11px; color: #64748b;">(Không có ảnh đính kèm)</div>'}
          </div>
        `;

        // Style the marker dynamically
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #10b981; width: 14px; height: 14px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 10px rgba(16,185,129,0.6);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        L.marker([c.latitude, c.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });
    };

    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [loading, checkins]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Giám sát Hiện trường</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Bản đồ giám sát lộ trình và minh chứng check-in của nhân viên thị trường</p>
        </div>
        <button 
          onClick={loadCheckins}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
            color: '#fff', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Làm mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        {/* Map area */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '100%' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              Đang tải dữ liệu bản đồ...
            </div>
          )}
          {checkins.length === 0 && !loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '14px' }}>
              Chưa có dữ liệu check-in đi thị trường nào hôm nay.
            </div>
          ) : (
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0f172a' }} />
          )}
        </div>

        {/* Info panel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Lịch sử check-in gần nhất
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checkins.map((c: any) => (
              <div 
                key={c.id} 
                onClick={() => {
                  if (mapInstanceRef.current && c.latitude && c.longitude) {
                    mapInstanceRef.current.setView([c.latitude, c.longitude], 16);
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid var(--border-color)',
                  borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Nhân viên thị trường</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(c.created_at).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="var(--color-secondary)" />
                  <span>Lat: {c.latitude?.toFixed(4)}, Lng: {c.longitude?.toFixed(4)}</span>
                </div>
                {c.image_base64 && (
                  <img src={c.image_base64} alt="Proof" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', marginTop: '4px' }} />
                )}
              </div>
            ))}
            {checkins.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', padding: '20px' }}>
                Danh sách trống
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
