import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [context, setContext] = useState<any>(null);
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    // Lắng nghe sự kiện từ Nextflow OS Core (Parent Window)
    const handleMessage = (event: MessageEvent) => {
      // Chỉ nhận thông điệp qua postMessage nếu nguồn đáng tin cậy
      if (event.data?.type === 'NEXTFLOW_INIT_CONTEXT') {
        setContext(event.data.payload);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Yêu cầu Nền tảng cấp Context khởi tạo (vd: activeTask, user)
    window.parent.postMessage({ type: 'EXTENSION_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleAction = () => {
    // Gửi yêu cầu (Yêu cầu API tạo Task mới thông qua quyền đã được User duyệt)
    window.parent.postMessage({
      type: 'EXTENSION_ACTION',
      action: 'CREATE_WORK_ITEM',
      payload: {
        title: 'Nhiệm vụ từ Tiện ích mở rộng',
        status: 'UNASSIGNED',
        priority: 'MEDIUM'
      }
    }, '*');
    setResponseMsg("Đã gửi yêu cầu tạo Task về hệ thống lõi!");
  };

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif' }}>
      <h3 style={{ color: '#a855f7' }}>Hello from Nextflow Extension!</h3>
      <p style={{ fontSize: '12px', color: '#666' }}>
        <strong>Bảo mật:</strong> Ứng dụng này đang chạy trong môi trường Sandbox cô lập.
      </p>
      
      {context ? (
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          <strong>Tenant ID:</strong> {context.tenant.id} <br/>
          <strong>Active Task:</strong> {context.workItem?.title || 'Không có task'}
        </div>
      ) : (
        <p>Đang tải dữ liệu từ Nextflow OS...</p>
      )}

      <button 
        onClick={handleAction}
        style={{ marginTop: '10px', padding: '8px 12px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Tạo Task Mới (Test Webhook API)
      </button>

      {responseMsg && <p style={{ color: 'green', fontSize: '12px', marginTop: '10px' }}>{responseMsg}</p>}
    </div>
  )
}

export default App
