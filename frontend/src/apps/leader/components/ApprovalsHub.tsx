import { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ApprovalsHub() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWorkItems(auth);
      // Filter active tasks that need review/approval (not DONE)
      const activeTasks = (data || []).filter((t: any) => t.status !== 'COMPLETED');
      setTasks(activeTasks);
    } catch (err) {
      console.error("Error loading tasks for approval:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAction = async (taskId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const status = action === 'APPROVE' ? 'COMPLETED' : 'UNASSIGNED';
      const result = await apiService.updateWorkItemStatus(auth, taskId, status);
      
      setMessage({
        text: action === 'APPROVE' 
          ? `Đã phê duyệt thành công! Mã giao dịch U2U: ${result.metadata?.tx_hash?.slice(0, 16)}...`
          : 'Đã từ chối yêu cầu thành công.',
        type: 'success'
      });
      
      loadTasks();
      setTimeout(() => setMessage({ text: '', type: null }), 6000);
    } catch (err: any) {
      setMessage({
        text: "Thao tác thất bại: " + err.message,
        type: 'error'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Phê Duyệt Luồng Công Việc</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Phê duyệt hoặc từ chối các đề xuất, yêu cầu vận hành nội bộ</p>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {message.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
            Đang tải danh sách yêu cầu...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
            Không có yêu cầu phê duyệt nào đang chờ xử lý.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Tên Yêu Cầu / Tác Vụ</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Độ Ưu Tiên</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng Thái Hiện Tại</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày Tạo</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t: any) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px 20px', fontWeight: 500, color: '#fff' }}>{t.title}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                        background: t.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: t.priority === 'HIGH' ? '#f87171' : 'var(--text-dim)'
                      }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-dim)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#f59e0b" />
                        <span>{t.status === 'UNASSIGNED' ? 'Chờ nhận việc' : 'Đang thực hiện'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(t.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleAction(t.id, 'APPROVE')}
                          style={{
                            background: '#10b981', color: '#fff', border: 'none',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <CheckCircle size={14} /> Duyệt
                        </button>
                        <button
                          onClick={() => handleAction(t.id, 'REJECT')}
                          style={{
                            background: 'transparent', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <XCircle size={14} /> Từ Chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
