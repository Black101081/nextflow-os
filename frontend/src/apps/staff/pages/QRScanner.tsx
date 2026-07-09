import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, X, Search } from 'lucide-react';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // get cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // default to back camera if available
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    }).catch(err => {
      console.error("Lỗi lấy danh sách camera", err);
    });

    return () => {
      stopScan();
    };
  }, []);

  const startScan = async () => {
    if (!selectedCamera) return;
    setIsScanning(true);
    setScanResult(null);
    
    scannerRef.current = new Html5Qrcode("reader");
    
    try {
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // success
          setScanResult(decodedText);
          stopScan();
        },
        (_errorMessage) => {
          // parse error, ignore
        }
      );
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        setIsScanning(false);
      }).catch(err => console.error(err));
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34, 197, 94, 0.2)', boxShadow: '0 0 15px rgba(34, 197, 94, 0.15)' }}>
          <QrCode size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#fff' }}>Quét Mã QR</h2>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px' }}>Tra cứu Đơn hàng / Hợp đồng nhanh</p>
        </div>
      </div>

      <div className="panel" style={{ overflow: 'hidden', padding: '20px', background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)' }}>
        
        {!isScanning && !scanResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chọn Camera thiết bị</label>
              <select 
                value={selectedCamera} 
                onChange={e => setSelectedCamera(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {cameras.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#1e293b', color: '#fff' }}>{c.label || `Camera ${c.id}`}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={startScan} 
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 600, background: 'var(--color-accent)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.2)' }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Search size={18} /> Bắt đầu Quét QR
            </button>
          </div>
        )}

        <div id="reader" style={{ width: '100%', display: isScanning ? 'block' : 'none', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}></div>
        
        {isScanning && (
          <button 
            onClick={stopScan} 
            style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <X size={18} /> Hủy Quét
          </button>
        )}

        {scanResult && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-accent)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', wordBreak: 'break-all' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px', fontWeight: 600 }}>Kết quả quét:</div>
              <strong style={{ fontSize: '16px' }}>{scanResult}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setScanResult(null)} 
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Quét lại
              </button>
              <button 
                style={{ flex: 2, padding: '12px', background: 'var(--color-accent)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                Tiến hành Xử lý
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
