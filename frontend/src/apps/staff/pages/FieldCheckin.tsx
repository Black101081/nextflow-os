import { useState, useRef, useEffect } from 'react';
import { MapPin, Camera, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';

export default function FieldCheckin() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  const [status, setStatus] = useState<'idle' | 'locating' | 'ready' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [location, setLocation] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const data = await apiService.getFieldCheckins(auth);
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGetLocation = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Trình duyệt không hỗ trợ Geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy
        });
        setStatus('ready');
      },
      (err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Không thể lấy tọa độ GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImageBase64(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!location && !imageBase64) return;
    setStatus('submitting');
    
    try {
      await apiService.submitFieldCheckin(auth, {
        latitude: location?.lat,
        longitude: location?.lng,
        accuracy: location?.acc,
        image_base64: imageBase64,
        metadata: { client: 'PWA Mobile' }
      });
      
      setStatus('success');
      fetchHistory(); // Reload history
      setTimeout(() => {
        setStatus('idle');
        setLocation(null);
        setImageBase64(null);
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Lỗi khi Check-in.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Field Check-in</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Ghi nhận vị trí và ảnh minh chứng</p>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* GPS Section */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="var(--color-primary)" />
            Tọa độ GPS
          </h3>
          
          {location ? (
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <div>
                <div>Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}</div>
                <div style={{ opacity: 0.8, fontSize: '11px' }}>Độ chính xác: ~{Math.round(location.acc)}m</div>
              </div>
            </div>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={handleGetLocation}
              disabled={status === 'locating'}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {status === 'locating' ? <Loader2 size={16} className="spin" /> : <MapPin size={16} />}
              {status === 'locating' ? 'Đang định vị...' : 'Lấy Tọa độ Hiện tại'}
            </button>
          )}
        </div>

        {/* Photo Section */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={16} color="var(--color-primary)" />
            Ảnh Minh Chứng
          </h3>
          
          {imageBase64 ? (
            <div style={{ position: 'relative' }}>
              <img src={imageBase64} alt="Proof" style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
              <button 
                onClick={() => setImageBase64(null)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
              >
                Huỷ
              </button>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                onChange={handlePhotoCapture}
                style={{ display: 'none' }} 
              />
              <button 
                className="btn btn-secondary" 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Camera size={16} /> Chụp Ảnh
              </button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {status === 'error' && (
          <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '8px', fontSize: '13px' }}>
            {errorMessage}
          </div>
        )}
        {status === 'success' && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} />
            Lưu Check-in thành công!
          </div>
        )}

        {/* Submit */}
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={(!location && !imageBase64) || status === 'submitting'}
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
        >
          {status === 'submitting' ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
          {status === 'submitting' ? 'Đang gửi...' : 'Xác nhận Check-in'}
        </button>

      </div>

      {/* History panel */}
      <div className="panel" style={{ marginTop: '24px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Lịch sử Check-in Hôm Nay</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((h: any) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>
                  Check-in thành công
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  GPS: {h.latitude?.toFixed(4)}, {h.longitude?.toFixed(4)} | Acc: ~{Math.round(h.accuracy || 0)}m
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(h.created_at).toLocaleTimeString('vi-VN')}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Chưa có lượt Check-in nào trong ngày.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
