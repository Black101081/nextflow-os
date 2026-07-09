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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Quét Mã QR</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Tra cứu Đơn hàng / Hợp đồng nhanh</p>
        </div>
      </div>

      <div className="panel" style={{ overflow: 'hidden', padding: '16px' }}>
        
        {!isScanning && !scanResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Chọn Camera</label>
              <select className="form-input" value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)}>
                {cameras.map(c => (
                  <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>
                ))}
              </select>
            </div>
            
            <button className="btn btn-primary" onClick={startScan} style={{ padding: '14px', fontSize: '16px', justifyContent: 'center' }}>
              <Search size={18} /> Bắt đầu Quét QR
            </button>
          </div>
        )}

        <div id="reader" style={{ width: '100%', display: isScanning ? 'block' : 'none', borderRadius: '8px', overflow: 'hidden' }}></div>
        
        {isScanning && (
          <button className="btn btn-secondary" onClick={stopScan} style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
            <X size={18} /> Hủy Quét
          </button>
        )}

        {scanResult && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', wordBreak: 'break-all' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Kết quả quét:</div>
              <strong style={{ fontSize: '16px' }}>{scanResult}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setScanResult(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Quét lại
              </button>
              <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                Tiến hành Xử lý
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
