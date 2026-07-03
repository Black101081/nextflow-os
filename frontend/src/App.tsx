import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import type { AuthConfig, WorkItemPayload } from './services/api';
import { 
  Layers, 
  User, 
  Plus, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  LogOut, 
  Activity, 
  Database,
  Terminal,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';

interface WorkItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  due_at?: string;
  version: number;
}

export default function App() {
  const [auth, setAuth] = useState<AuthConfig | null>(null);
  const [tenantInput, setTenantInput] = useState('d290f1ee-6c54-4b01-90e6-d701748f0851');
  const [apiKeyInput, setApiKeyInput] = useState('nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851');
  
  const [queues, setQueues] = useState<any[]>([
    { id: 'q_test_queue', name: 'Hàng đợi Tài chính - Kế toán', category: 'FINANCE' }
  ]);
  const [selectedQueueId, setSelectedQueueId] = useState('q_test_queue');
  const [queueMembers, setQueueMembers] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [kpis, setKpis] = useState<any>(null);

  // Form states cho tạo Task mới
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskCategory, setNewTaskCategory] = useState('FINANCE');

  // Form states cho tạo Queue mới
  const [newQueueId, setNewQueueId] = useState('');
  const [newQueueName, setNewQueueName] = useState('');

  // Routing states
  const [routeTargetQueue, setRouteTargetQueue] = useState('q_test_queue');

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);

  // Check Backend health on load
  useEffect(() => {
    apiService.checkHealth().then(up => setIsBackendUp(up));
  }, []);

  // Fetch data periodically
  useEffect(() => {
    if (!auth) return;

    const fetchData = async () => {
      try {
        // Lấy danh sách thành viên trong Queue được chọn
        const membersData = await apiService.getQueueMembers(auth, selectedQueueId);
        setQueueMembers(membersData.members || []);

        // Fetch KPI Metrics thật
        const kpiData = await apiService.getKpis(auth);
        setKpis(kpiData.metrics);
      } catch (err: any) {
        console.error('Lỗi khi fetch dữ liệu:', err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [auth, selectedQueueId]);

  // Real-time WebSocket live updates
  useEffect(() => {
    if (!auth) return;

    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('[WebSocket Client] Connected to Live Updates Server');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('[WebSocket Client] Broadcast event received:', msg);

        if (msg.event === 'WORK_ITEM_CREATED') {
          const newTask = msg.data;
          setWorkItems(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
          });
          triggerNotification('success', `Real-time: Có nhiệm vụ mới "${newTask.title}" vừa được tạo!`);
        } else if (msg.event === 'WORK_ITEM_STATUS_UPDATED') {
          const updated = msg.data;
          setWorkItems(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status, version: updated.version } : t));
          setSelectedItem(prev => {
            if (prev && prev.id === updated.id) {
              return { ...prev, status: updated.status, version: updated.version };
            }
            return prev;
          });
          triggerNotification('success', `Real-time: Cập nhật trạng thái nhiệm vụ thành ${updated.status}.`);
        } else if (msg.event === 'WORK_ITEM_ROUTED') {
          const routed = msg.data;
          setWorkItems(prev => prev.map(t => t.id === routed.work_item_id ? { ...t, status: routed.status } : t));
          setSelectedItem(prev => {
            if (prev && prev.id === routed.work_item_id) {
              return { ...prev, status: routed.status };
            }
            return prev;
          });
          triggerNotification('success', `Real-time: Nhiệm vụ đã được định tuyến.`);
        }

        // Tự động cập nhật chỉ số KPI real-time tức thời
        apiService.getKpis(auth)
          .then(kpiData => setKpis(kpiData.metrics))
          .catch(() => {});
      } catch (err) {
        console.error('Lỗi phân tích WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[WebSocket Client] Error:', err);
    };

    ws.onclose = () => {
      console.log('[WebSocket Client] Disconnected from server');
    };

    return () => {
      ws.close();
    };
  }, [auth]);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInput || !apiKeyInput) {
      triggerNotification('error', 'Vui lòng nhập đầy đủ Tenant ID và API Key.');
      return;
    }

    const testAuth = { tenantId: tenantInput, apiKey: apiKeyInput };
    
    // Test thử kết nối bằng cách gọi API lấy members của test queue
    try {
      await apiService.getQueueMembers(testAuth, 'q_test_queue');
      setAuth(testAuth);
      triggerNotification('success', 'Đăng nhập kết nối Tenant thành công!');
    } catch (err: any) {
      triggerNotification('error', 'Thông tin xác thực sai hoặc Tenant không tồn tại.');
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setWorkItems([]);
    setSelectedItem(null);
  };

  const handleCreateWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!newTaskTitle.trim()) {
      triggerNotification('error', 'Tiêu đề task không được để trống.');
      return;
    }

    try {
      const payload: WorkItemPayload = {
        title: newTaskTitle,
        priority: newTaskPriority,
        category: newTaskCategory,
        source: 'WEB_CONSOLE',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 ngày tới
      };
      const newTask = await apiService.createWorkItem(auth, payload);
      setWorkItems(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      triggerNotification('success', `Đã tạo thành công Work Item: ${newTask.title}`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!newQueueId.trim() || !newQueueName.trim()) {
      triggerNotification('error', 'Vui lòng điền đủ Queue ID và Tên hàng đợi.');
      return;
    }

    try {
      const newQ = await apiService.createQueue(auth, newQueueId, newQueueName, 'FINANCE');
      setQueues(prev => [...prev, { id: newQ.id, name: newQ.name, category: newQ.category }]);
      setNewQueueId('');
      setNewQueueName('');
      triggerNotification('success', `Đã tạo Queue: ${newQ.name}`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  const handleClaimNextTask = async () => {
    if (!auth) return;
    
    // Tìm task đầu tiên ở trạng thái UNASSIGNED
    const unassignedTask = workItems.find(t => t.status === 'UNASSIGNED');
    if (!unassignedTask) {
      // Nếu không có task nào trong state, hãy tạo nhanh một task giả định để claim test
      try {
        const payload: WorkItemPayload = {
          title: 'Yêu cầu thanh toán hóa đơn đối tác',
          priority: 'MEDIUM',
          category: 'FINANCE',
          source: 'CLAIM_TEST'
        };
        const tempTask = await apiService.createWorkItem(auth, payload);
        const updated = await apiService.updateWorkItemStatus(auth, tempTask.id, 'IN_PROGRESS');
        setWorkItems(prev => [updated, ...prev]);
        setSelectedItem(updated);
        triggerNotification('success', `Đã claim thành công nhiệm vụ: ${tempTask.title}`);
      } catch (err: any) {
        triggerNotification('error', err.message);
      }
      return;
    }

    try {
      const updated = await apiService.updateWorkItemStatus(auth, unassignedTask.id, 'IN_PROGRESS');
      setWorkItems(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status, version: updated.version } : t));
      if (selectedItem?.id === updated.id) {
        setSelectedItem(prev => prev ? { ...prev, status: updated.status, version: updated.version } : null);
      }
      triggerNotification('success', `Đã claim thành công nhiệm vụ: ${unassignedTask.title}`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!auth || !selectedItem) return;
    try {
      const updated = await apiService.updateWorkItemStatus(auth, selectedItem.id, status);
      setWorkItems(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status, version: updated.version } : t));
      setSelectedItem(prev => prev ? { ...prev, status: updated.status, version: updated.version } : null);
      triggerNotification('success', `Cập nhật trạng thái sang ${status} thành công.`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  const handleRouteTask = async () => {
    if (!auth || !selectedItem) return;
    try {
      const routed = await apiService.routeWorkItem(auth, selectedItem.id, routeTargetQueue);
      setWorkItems(prev => prev.map(t => t.id === routed.work_item_id ? { ...t, status: routed.status } : t));
      setSelectedItem(null);
      triggerNotification('success', `Đã chuyển tiếp Task sang Queue: ${routeTargetQueue}`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Render Login Portal Screen
  if (!auth) {
    return (
      <div className="login-screen">
        <div className="login-glow"></div>
        <div className="login-card">
          <div style={{ textAlign: 'center' }}>
            <div className="brand-logo" style={{ margin: '0 auto 16px', width: '48px', height: '48px', fontSize: '22px' }}>NF</div>
            <h2 className="brand-title" style={{ fontSize: '24px' }}>Nextflow Portal</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Hệ điều hành vận hành tác vụ SMEs thời gian thực
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>NEXTFLOW TENANT ID</label>
              <input 
                type="text" 
                className="form-input" 
                value={tenantInput} 
                onChange={(e) => setTenantInput(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>X-NEXTFLOW-API-KEY</label>
              <input 
                type="password" 
                className="form-input" 
                value={apiKeyInput} 
                onChange={(e) => setApiKeyInput(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Activity size={18} /> Kết nối hệ thống
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> Backend Status:
            </span>
            {isBackendUp === null ? (
              <span style={{ color: 'var(--text-dim)' }}>Checking...</span>
            ) : isBackendUp ? (
              <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>ONLINE (PORT 8000)</span>
            ) : (
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>OFFLINE</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard Workspace
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">NF</div>
          <div>
            <h1 className="brand-title">Nextflow OS</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>SME OPERATIONAL CONSOLE</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {notification && (
            <div style={{
              backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${notification.type === 'success' ? 'var(--color-secondary)' : 'var(--color-accent)'}`,
              color: notification.type === 'success' ? 'var(--color-secondary)' : 'var(--color-accent)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn var(--transition-fast)'
            }}>
              <Sparkles size={14} /> {notification.message}
            </div>
          )}

          <div className="user-badge">
            <span className="user-dot"></span>
            <span>Nguyen Van Test</span>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>SME_OPS</span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="dashboard-grid">
        {/* Left Sidebar: Queues & Members */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title"><Layers size={18} color="var(--color-primary)" /> Hàng đợi (Queues)</h3>
          </div>
          
          <div className="sidebar-list">
            {queues.map(q => (
              <button 
                key={q.id}
                onClick={() => setSelectedQueueId(q.id)}
                className={`sidebar-item ${selectedQueueId === q.id ? 'active' : ''}`}
              >
                <span>{q.name}</span>
                <span className="badge badge-low" style={{ fontSize: '9px' }}>{q.category}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateQueue} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TẠO HÀNG ĐỢI MỚI</span>
            <input 
              type="text" 
              placeholder="Queue ID (ví dụ: q_sales)" 
              className="form-input"
              style={{ fontSize: '13px', padding: '8px' }}
              value={newQueueId}
              onChange={(e) => setNewQueueId(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Tên hàng đợi" 
              className="form-input"
              style={{ fontSize: '13px', padding: '8px' }}
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px' }}>
              <Plus size={14} /> Thêm Queue
            </button>
          </form>

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h3 className="panel-title" style={{ fontSize: '14px', marginBottom: '10px' }}>
              <User size={16} color="var(--color-secondary)" /> Nhân sự hàng đợi ({queueMembers.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queueMembers.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-main)' }}>{m.name}</span>
                  <span className="badge badge-unassigned" style={{ fontSize: '9px' }}>{m.role}</span>
                </div>
              ))}
              {queueMembers.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Nguyen Van Test (Offline)</span>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel: Work Items Inbox */}
        <div className="panel" style={{ gap: '20px' }}>
          <div className="panel-header">
            <h3 className="panel-title"><Inbox size={18} color="var(--color-primary)" /> Hộp thư nhiệm vụ (Task Inbox)</h3>
            <button onClick={handleClaimNextTask} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Sparkles size={14} /> Claim Next Task
            </button>
          </div>

          {/* Stats & KPIs Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-num">{kpis ? kpis.unassigned_count : 0}</div>
                <div className="stat-label">Chưa gán (Unassigned)</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: 'var(--color-primary)' }}>{kpis ? kpis.in_progress_count : 0}</div>
                <div className="stat-label">Đang xử lý (In Progress)</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: 'var(--color-secondary)' }}>{kpis ? kpis.completed_count : 0}</div>
                <div className="stat-label">Đã xong (Completed)</div>
              </div>
            </div>

            <div className="stats-container" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="stat-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                <div className="stat-num" style={{ color: 'var(--color-accent)' }}>
                  {kpis ? `${kpis.sla_breach_rate}%` : '0.0%'}
                </div>
                <div className="stat-label">SLA Breach Rate</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '3px solid var(--color-info)' }}>
                <div className="stat-num" style={{ color: 'var(--color-info)' }}>
                  {kpis ? `${kpis.avg_resolution_seconds}s` : '0s'}
                </div>
                <div className="stat-label">Avg Resolution Time</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
                <div className="stat-num" style={{ color: 'var(--color-warning)' }}>
                  {kpis ? kpis.completed_24h : 0}
                </div>
                <div className="stat-label">Throughput (24h)</div>
              </div>
            </div>
          </div>

          {/* Add Work Item Form */}
          <form onSubmit={handleCreateWorkItem} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '10px', backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              placeholder="Tạo nhanh Work Item (ví dụ: Xử lý chứng từ VAT)..." 
              className="form-input"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <select 
              className="form-input" 
              style={{ padding: '8px 12px' }}
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <select 
              className="form-input" 
              style={{ padding: '8px 12px' }}
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
            >
              <option value="FINANCE">FINANCE</option>
              <option value="OPERATIONS">OPERATIONS</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
              <Plus size={16} />
            </button>
          </form>

          {/* Task Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '500px' }}>
            {workItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className={`work-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${item.priority === 'HIGH' ? 'badge-high' : item.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                    {item.priority}
                  </span>
                  <span className={`badge ${item.status === 'UNASSIGNED' ? 'badge-unassigned' : item.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-completed'}`}>
                    {item.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{item.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
                  <span>ID: {item.id.substring(0, 8)}...</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Version: {item.version}</span>
                </div>
              </div>
            ))}

            {workItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                <Terminal size={36} style={{ margin: '0 auto 12px' }} />
                <p>Hộp thư trống. Hãy tạo nhanh một nhiệm vụ mới để bắt đầu test.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Details & Action Console */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title"><Activity size={18} color="var(--color-primary)" /> Bảng điều khiển tác vụ</h3>
          </div>

          {selectedItem ? (
            <div className="detail-panel">
              <div className="detail-section">
                <span className="meta-label">TIÊU ĐỀ NHIỆM VỤ</span>
                <div className="detail-title">{selectedItem.title}</div>
              </div>

              <div className="detail-section">
                <div className="meta-grid">
                  <div>
                    <span className="meta-label">TRẠNG THÁI</span>
                    <div style={{ marginTop: '6px' }}>
                      <span className={`badge ${selectedItem.status === 'UNASSIGNED' ? 'badge-unassigned' : selectedItem.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-completed'}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="meta-label">ĐỘ ƯU TIÊN</span>
                    <div style={{ marginTop: '6px' }}>
                      <span className={`badge ${selectedItem.priority === 'HIGH' ? 'badge-high' : selectedItem.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {selectedItem.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <span className="meta-label">THAO TÁC XỬ LÝ</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {selectedItem.status === 'UNASSIGNED' && (
                    <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="btn btn-primary">
                      <Play size={16} /> Nhận việc (Start Task)
                    </button>
                  )}
                  {selectedItem.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus('COMPLETED')} className="btn btn-secondary" style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }}>
                      <CheckCircle size={16} /> Hoàn thành (Complete)
                    </button>
                  )}
                  <button onClick={() => handleUpdateStatus('CANCELLED')} className="btn btn-accent">
                    Huỷ bỏ (Cancel Task)
                  </button>
                </div>
              </div>

              <div className="detail-section" style={{ borderBottom: 'none' }}>
                <span className="meta-label">ĐỊNH TUYẾN THỦ CÔNG (ROUTING)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <select 
                    className="form-input"
                    value={routeTargetQueue}
                    onChange={(e) => setRouteTargetQueue(e.target.value)}
                  >
                    {queues.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                  <button onClick={handleRouteTask} className="btn btn-secondary">
                    <ArrowRight size={16} /> Chuyển tiếp hàng đợi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-dim)' }}>
              <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Chọn một Work Item để xem chi tiết và thực thi các thao tác điều khiển.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
