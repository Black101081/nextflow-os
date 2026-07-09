import { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Box, Workflow, Plus, X, Activity, MessageCircle } from 'lucide-react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

interface Entity {
  id: string;
  name: string;
  system_name: string;
}

interface WorkflowDef {
  id: string;
  name: string;
  dag_json: any;
}

export default function TenantStaffWorkspace() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  
  const [entities, setEntities] = useState<Entity[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entity' | 'workflow'>('dashboard');
  const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDef | null>(null);
  
  const [entityData, setEntityData] = useState<any[]>([]);
  const [entitySchema, setEntitySchema] = useState<any>(null);
  const [entityMeta, setEntityMeta] = useState<{ entity_id: string, schema_version_id: string } | null>(null);
  const [workflowTasks, setWorkflowTasks] = useState<any[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    fetchEntities();
    fetchWorkflows();
  }, []);

  const fetchEntities = async () => {
    try {
      const res = await apiService.getEntities(auth);
      setEntities(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await apiService.getWorkflows(auth);
      setWorkflows(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEntityData = async (entity: Entity) => {
    setActiveTab('entity');
    setActiveEntity(entity);
    setIsFormOpen(false);
    try {
      const schemaRes = await apiService.getEntitySchema(auth, entity.system_name);
      setEntitySchema(schemaRes.schema_json);
      setEntityMeta({
        entity_id: schemaRes.entity_id,
        schema_version_id: schemaRes.schema_version_id
      });
      
      const recordsRes = await apiService.getEntityRecords(auth, entity.system_name);
      setEntityData(recordsRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWorkflowData = async (wf: WorkflowDef) => {
    setActiveTab('workflow');
    setActiveWorkflow(wf);
    try {
      const items = await apiService.getWorkItems(auth);
      const mappedItems = (items || []).map((t: any) => ({
        id: t.id,
        title: t.title || `Nhiệm vụ #${t.id.slice(0, 4)}`,
        status: t.status === 'UNASSIGNED' ? 'TODO' : (t.status === 'COMPLETED' ? 'DONE' : 'IN_PROGRESS')
      }));
      setWorkflowTasks(mappedItems);
    } catch (err) {
      console.error(err);
      setWorkflowTasks([]);
    }
  };

  const submitEntityRecord = async ({ formData }: any) => {
    if (!activeEntity || !entityMeta) return;
    try {
      await apiService.createEntityRecord(auth, {
        entity_id: entityMeta.entity_id,
        schema_version_id: entityMeta.schema_version_id,
        data: formData
      });
      setIsFormOpen(false);
      loadEntityData(activeEntity); // reload
    } catch (err) {
      console.error('Failed to submit record', err);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <Activity size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Workspace</h2>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {/* Entities Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '0 20px 8px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Dữ liệu (Entities)
            </div>
            {entities.map(e => (
              <div 
                key={e.id}
                onClick={() => loadEntityData(e)}
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  color: activeEntity?.id === e.id ? 'var(--text-main)' : 'var(--text-muted)',
                  background: activeEntity?.id === e.id ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderLeft: activeEntity?.id === e.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(evt) => evt.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                onMouseOut={(evt) => evt.currentTarget.style.background = activeEntity?.id === e.id ? 'var(--bg-surface-elevated)' : 'transparent'}
              >
                <Box size={16} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{e.name}</span>
              </div>
            ))}
          </div>

          {/* Workflows Section */}
          <div>
            <div style={{ padding: '0 20px 8px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Quy trình (Workflows)
            </div>
            {workflows.map(w => (
              <div 
                key={w.id}
                onClick={() => loadWorkflowData(w)}
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  color: activeWorkflow?.id === w.id ? 'var(--text-main)' : 'var(--text-muted)',
                  background: activeWorkflow?.id === w.id ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderLeft: activeWorkflow?.id === w.id ? '3px solid var(--color-secondary)' : '3px solid transparent',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(evt) => evt.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                onMouseOut={(evt) => evt.currentTarget.style.background = activeWorkflow?.id === w.id ? 'var(--bg-surface-elevated)' : 'transparent'}
              >
                <Workflow size={16} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{w.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', marginTop: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              Welcome to Staff Workspace
            </h1>
            <h2 style={{ fontSize: '20px', color: 'var(--color-primary)', marginBottom: '16px' }}>
              Xin chào, {user?.sub || 'Staff'}!
            </h2>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>Bạn đang truy cập vào Workspace động của NextFlow OS.</p>
              <p>Hệ thống đã đọc các cấu hình Entity và Workflow từ Backend và hiển thị ở thanh công cụ bên trái. Bạn có thể chọn một chức năng bất kỳ để trải nghiệm tính năng sinh giao diện tự động (Dynamic UI Canvas) mà không cần lập trình.</p>
            </div>
          </div>
        )}

        {activeTab === 'entity' && activeEntity && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 8px 0' }}>{activeEntity.name}</h2>
                <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '14px' }}>Quản lý dữ liệu động cho {activeEntity.system_name}</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                  fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <Plus size={16} /> Thêm Mới
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dữ liệu (JSON)</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {entityData.map(record => (
                    <tr key={record.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{record.id.slice(0, 8)}...</td>
                      <td>
                        <pre style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '6px', margin: 0, fontSize: '12px', color: 'var(--color-secondary)', border: '1px solid var(--border-color)' }}>
                          {JSON.stringify(record.data, null, 2)}
                        </pre>
                      </td>
                      <td style={{ color: 'var(--text-dim)' }}>{new Date(record.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                  {entityData.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        Chưa có bản ghi nào. Hãy ấn "Thêm Mới" để tạo dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Form Overlay */}
            {isFormOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', justifyContent: 'flex-end', zIndex: 1000
              }}>
                <div style={{
                  width: '500px', background: 'var(--bg-surface)', height: '100%',
                  borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Tạo {activeEntity.name}</h3>
                    <button onClick={() => setIsFormOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>
                  <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: '#333' }}>
                    {entitySchema ? (
                      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
                        <Form
                          schema={entitySchema}
                          validator={validator}
                          onSubmit={submitEntityRecord}
                          className="rjsf-form"
                        />
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-dim)' }}>Đang tải schema...</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflow' && activeWorkflow && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 8px 0' }}>{activeWorkflow.name}</h2>
                <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '14px' }}>Kanban Board hiển thị các luồng nhiệm vụ tự động</p>
              </div>
              <button 
                onClick={async () => {
                  const title = window.prompt("Nhập tiêu đề tác vụ mới:");
                  if (!title) return;
                  try {
                    await apiService.createWorkItem(auth, { title, priority: 'MEDIUM' });
                    loadWorkflowData(activeWorkflow);
                  } catch (err: any) {
                    alert("Lỗi tạo tác vụ: " + err.message);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                  fontWeight: 500, cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Thêm Tác Vụ
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
              {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                const isTodo = status === 'TODO';
                const isProgress = status === 'IN_PROGRESS';
                
                const dotColor = isTodo ? '#94a3b8' : (isProgress ? 'var(--color-primary)' : '#10b981');
                const columnTitle = isTodo ? 'Việc cần làm' : (isProgress ? 'Đang thực hiện' : 'Đã hoàn thành');
                
                return (
                  <div key={status} className="panel-glass" style={{
                    minWidth: '320px', display: 'flex', flexDirection: 'column', padding: '16px', flex: 1,
                    background: 'rgba(18, 20, 28, 0.45)', boxShadow: 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, boxShadow: `0 0 10px ${dotColor}` }}></div>
                      <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {columnTitle} ({workflowTasks.filter(t => t.status === status).length})
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {workflowTasks.filter(t => t.status === status).map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => setSelectedTask(t)}
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)', padding: '14px',
                            borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'var(--shadow-sm)',
                            borderLeft: `3px solid ${dotColor}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = dotColor;
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.15), 0 0 10px ${dotColor}22`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{t.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                              ID: {t.id.slice(0, 8)}
                            </span>
                            {t.metadata?.comments && t.metadata.comments.length > 0 && (
                              <span style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <MessageCircle size={12} /> {t.metadata.comments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {workflowTasks.filter(t => t.status === status).length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                          Trống
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Luklak-style Collaboration Modal */}
      {selectedTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '16px'
        }}>
          <div style={{
            background: '#1e293b', width: '100%', maxWidth: '600px',
            borderRadius: '12px', border: '1px solid #334155',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', marginRight: '8px' }}>
                  Chi tiết Tác Vụ
                </span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#fff' }}>{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Trạng thái quy trình</div>
                  <select 
                    value={selectedTask.status} 
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        const apiStatus = newStatus === 'TODO' ? 'UNASSIGNED' : (newStatus === 'DONE' ? 'COMPLETED' : 'IN_PROGRESS');
                        await apiService.updateWorkItemStatus(auth, selectedTask.id, apiStatus, selectedTask.metadata);
                        const updated = { ...selectedTask, status: newStatus };
                        setSelectedTask(updated);
                        loadWorkflowData(activeWorkflow!);
                      } catch (err: any) {
                        alert("Lỗi cập nhật trạng thái: " + err.message);
                      }
                    }}
                    className="input-premium"
                    style={{ width: '100%', padding: '8px 12px' }}
                  >
                    <option value="TODO">Việc cần làm (TODO)</option>
                    <option value="IN_PROGRESS">Đang xử lý (IN PROGRESS)</option>
                    <option value="DONE">Đã hoàn thành (DONE)</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Độ ưu tiên</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '8px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px',
                      background: selectedTask.priority === 'HIGH' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                      color: selectedTask.priority === 'HIGH' ? '#f87171' : '#e2e8f0'
                    }}>
                      {selectedTask.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>
              </div>
 
              {/* Comments section */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageCircle size={16} /> Hoạt động & Trao đổi (Luklak style)
                </h4>
                
                {/* Write comment */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Nhập ghi chú hoặc bình luận..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="input-premium"
                    style={{ flex: 1, padding: '10px 12px', fontSize: '13px' }}
                  />
                  <button 
                    onClick={async () => {
                      if (!commentText.trim()) return;
                      const newComment = {
                        author: user?.name || user?.email || 'Nhân viên',
                        text: commentText.trim(),
                        timestamp: new Date().toISOString()
                      };
                      const currentMeta = selectedTask.metadata || {};
                      const updatedComments = [...(currentMeta.comments || []), newComment];
                      const updatedMeta = { ...currentMeta, comments: updatedComments };
                      
                      try {
                        const apiStatus = selectedTask.status === 'TODO' ? 'UNASSIGNED' : (selectedTask.status === 'DONE' ? 'COMPLETED' : 'IN_PROGRESS');
                        await apiService.updateWorkItemStatus(auth, selectedTask.id, apiStatus, updatedMeta);
                        
                        const updated = { ...selectedTask, metadata: updatedMeta };
                        setSelectedTask(updated);
                        setCommentText('');
                        loadWorkflowData(activeWorkflow!);
                      } catch (err: any) {
                        alert("Lỗi thêm bình luận: " + err.message);
                      }
                    }}
                    style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Gửi
                  </button>
                </div>

                {/* Comment list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
                  {((selectedTask.metadata?.comments) || []).map((c: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>{c.author}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {new Date(c.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{c.text}</p>
                    </div>
                  ))}
                  {(!selectedTask.metadata?.comments || selectedTask.metadata.comments.length === 0) && (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px dashed #334155' }}>
                      Chưa có trao đổi nào. Nhập tin nhắn phía trên để bắt đầu!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
