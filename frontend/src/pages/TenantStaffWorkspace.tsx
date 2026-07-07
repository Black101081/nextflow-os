import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

import { 
  Layers, 
  User, 
  Plus, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Activity, 
  Terminal,
  Clock,
  Sparkles,
  Inbox,
  MapPin,
  Camera,
  DollarSign,
  Wifi,
  WifiOff
} from 'lucide-react';
import { offlineService } from '../services/offlineSync';

import ExtensionSandboxHost from '../components/ExtensionSandboxHost';




import { useAuth } from '../contexts/AuthContext';

interface WorkItem {
  id: string;
  queue_id?: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  created_at: string;
  due_at?: string;
  version: number;
  tx_hash?: string;
  metadata?: any;
  assignee_id?: string;
}

export default function TenantStaffWorkspace() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  const [activeRole, setActiveRole] = useState(user?.role || 'SME_LEADER');
  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user?.role]);
  
  // Approved extensions list containing mock extension for E2E tests
  const approvedExtensions = (() => {
    const mockHtml = '\n' +
      '<!DOCTYPE html>\n' +
      '<html>\n' +
      '<head><title>Mock Extension</title></head>\n' +
      '<body>\n' +
      '  <div id="status">Chưa kết nối</div>\n' +
      '  <div id="tenant-id"></div>\n' +
      '  <div id="work-item-title"></div>\n' +
      '  <button id="update-btn">Update Work Item</button>\n' +
      '  <script>\n' +
      '    window.addEventListener(\'message\', (e) => {\n' +
      '      if (e.data?.type === \'HANDSHAKE_ACK\') {\n' +
      '        document.getElementById(\'status\').textContent = \'Connected\';\n' +
      '        document.getElementById(\'tenant-id\').textContent = e.data.tenantId;\n' +
      '        console.log(\'Connected successfully\');\n' +
      '        const bc = new BroadcastChannel(\'nextflow_context_\' + e.data.tenantId);\n' +
      '        bc.onmessage = (ev) => {\n' +
      '          if (ev.data?.type === \'WORK_ITEM_SELECTED\') {\n' +
      '            document.getElementById(\'work-item-title\').textContent = ev.data.payload.title;\n' +
      '          }\n' +
      '        };\n' +
      '      }\n' +
      '    });\n' +
      '    const params = new URLSearchParams(window.location.search);\n' +
      '    window.parent.postMessage({\n' +
      '      type: \'HANDSHAKE_INIT\',\n' +
      '      extensionId: params.get(\'extensionId\') || \'com.partner.shippingtracker\',\n' +
      '      sdkVersion: \'1.0.0\'\n' +
      '    }, \'*\');\n' +
      '  </script>\n' +
      '</body>\n' +
      '</html>\n';

    const ocrHtml = '\n' +
      '<!DOCTYPE html>\n' +
      '<html>\n' +
      '<head>\n' +
      '  <title>AI Invoice OCR Reader</title>\n' +
      '  <style>\n' +
      '    body { font-family: system-ui, sans-serif; margin: 0; padding: 10px; background: #0f172a; color: #f8fafc; font-size: 12px; }\n' +
      '    .container { display: flex; flex-direction: column; gap: 8px; }\n' +
      '    .upload-zone { border: 2px dashed #475569; border-radius: 6px; padding: 16px; text-align: center; cursor: pointer; background: #1e293b; transition: border-color 0.2s; }\n' +
      '    .upload-zone:hover { border-color: #3b82f6; }\n' +
      '    .btn { background: #10b981; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-weight: 600; cursor: pointer; display: inline-block; }\n' +
      '    .btn:disabled { opacity: 0.6; }\n' +
      '    .results { background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-top: 8px; }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <div class="container">\n' +
      '    <div class="upload-zone" id="dropzone">\n' +
      '      📁 Click để chọn hoá đơn VAT mẫu\n' +
      '      <input type="file" id="fileInput" style="display: none;" accept="image/*" />\n' +
      '    </div>\n' +
      '    <div id="ocrStatus" style="display: none; align-items: center; justify-content: space-between; margin-top: 6px;">\n' +
      '      <span id="fileName" style="font-weight: 600; color: #3b82f6;">invoice_vat_q1.png</span>\n' +
      '      <button class="btn" id="ocrBtn">AI Extract Data</button>\n' +
      '    </div>\n' +
      '    <div class="results" id="ocrResults" style="display: none;">\n' +
      '      <div style="font-weight: 700; color: #10b981; margin-bottom: 4px;">✓ Dữ liệu trích xuất AI:</div>\n' +
      '      <div>👤 <b>Khách hàng:</b> Nguyễn Thị Thảo</div>\n' +
      '      <div>📦 <b>Sản phẩm:</b> Đơn hàng bảo dưỡng thiết bị lạnh</div>\n' +
      '      <div>💰 <b>Giá trị:</b> 4,500,000 VNĐ</div>\n' +
      '      <div>📍 <b>Địa chỉ:</b> 456 Điện Biên Phủ, Bình Thạnh</div>\n' +
      '      <button class="btn" id="createBtn" style="margin-top: 8px; width: 100%; background: #3b82f6;">\n' +
      '        Tạo đơn hàng tự động\n' +
      '      </button>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '  <script>\n' +
      '    let activeTenantId = "";\n' +
      '    window.addEventListener("message", (e) => {\n' +
      '      if (e.data?.type === "HANDSHAKE_ACK") {\n' +
      '        activeTenantId = e.data.tenantId;\n' +
      '      }\n' +
      '    });\n' +
      '    document.getElementById("dropzone").addEventListener("click", () => {\n' +
      '      document.getElementById("fileInput").click();\n' +
      '    });\n' +
      '    document.getElementById("fileInput").addEventListener("change", (e) => {\n' +
      '      if (e.target.files.length > 0) {\n' +
      '        document.getElementById("fileName").textContent = e.target.files[0].name;\n' +
      '        document.getElementById("ocrStatus").style.display = "flex";\n' +
      '        document.getElementById("ocrResults").style.display = "none";\n' +
      '      }\n' +
      '    });\n' +
      '    document.getElementById("ocrBtn").addEventListener("click", () => {\n' +
      '      document.getElementById("ocrBtn").disabled = true;\n' +
      '      document.getElementById("ocrBtn").textContent = "Processing AI...";\n' +
      '      setTimeout(() => {\n' +
      '        document.getElementById("ocrBtn").disabled = false;\n' +
      '        document.getElementById("ocrBtn").textContent = "AI Extract Data";\n' +
      '        document.getElementById("ocrResults").style.display = "block";\n' +
      '      }, 800);\n' +
      '    });\n' +
      '    document.getElementById("createBtn").addEventListener("click", () => {\n' +
      '      window.parent.postMessage({\n' +
      '        type: "EXTENSION_ACTION",\n' +
      '        action: "CREATE_WORK_ITEM",\n' +
      '        payload: {\n' +
      '          title: "Đơn hàng bảo dưỡng thiết bị lạnh",\n' +
      '          priority: "HIGH",\n' +
      '          category: "OPERATIONS",\n' +
      '          metadata: {\n' +
      '            customer_name: "Nguyễn Thị Thảo",\n' +
      '            shipping_address: "456 Điện Biên Phủ, Bình Thạnh",\n' +
      '            order_value: 4500000,\n' +
      '            branch_id: "branch_q1",\n' +
      '            notes: "Tạo tự động từ AI Invoice OCR Reader Extension"\n' +
      '          }\n' +
      '        }\n' +
      '      }, "*");\n' +
      '    });\n' +
      '    const params = new URLSearchParams(window.location.search);\n' +
      '    window.parent.postMessage({\n' +
      '      type: "HANDSHAKE_INIT",\n' +
      '      extensionId: params.get("extensionId") || "com.partner.invoiceocr",\n' +
      '      sdkVersion: "1.0.0"\n' +
      '    }, "*");\n' +
      '  </script>\n' +
      '</body>\n' +
      '</html>\n';

    return [
      {
        id: 'com.partner.shippingtracker',
        name: 'Shipping & Delivery Tracker',
        url: 'data:text/html;charset=utf-8,' + encodeURIComponent(mockHtml),
        permissions: ['work_item:read', 'work_item:write'],
        sandboxFlags: 'allow-scripts'
      },
      {
        id: 'com.partner.invoiceocr',
        name: 'AI Invoice OCR Reader',
        url: 'data:text/html;charset=utf-8,' + encodeURIComponent(ocrHtml),
        permissions: ['work_item:write'],
        sandboxFlags: 'allow-scripts'
      }
    ];
  })();
  

  
  // Queues: fetch từ API thay vì hardcode
  const [queues, setQueues] = useState<any[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [queueMembers, setQueueMembers] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [kpis, setKpis] = useState<any>(null);

  // New capability states
  const [users, setUsers] = useState<any[]>([]);
  const [dynamicBranches] = useState<any[]>(() => {
    const saved = localStorage.getItem('nf_dynamic_branches');
    return saved ? JSON.parse(saved) : [
      { id: 'branch_q1', name: 'Chi nhánh Quận 1' },
      { id: 'branch_q3', name: 'Chi nhánh Quận 3' },
      { id: 'branch_warehouse', name: 'Kho tổng Q12' }
    ];
  });
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [showNotificationPane, setShowNotificationPane] = useState(false);

  // Form states for adding user

  // Form states for adding branch

  // Form states cho tạo Task mới
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskCategory, setNewTaskCategory] = useState('FINANCE');

  // Form states cho tạo Queue mới
  const [newQueueId, setNewQueueId] = useState('');
  const [newQueueName, setNewQueueName] = useState('');

  // Routing states
  const [routeTargetQueue, setRouteTargetQueue] = useState('');

  // Escalation modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  // View navigation: 'dashboard' | 'marketplace' | 'customer' | 'billing' | 'integrations'
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [activeBranch, setActiveBranch] = useState<string>('all');
  const [newTaskBranch, setNewTaskBranch] = useState<string>('branch_q1');
  const [newTaskOrderValue, setNewTaskOrderValue] = useState<string>('1500000');
  const [newTaskCustomerName, setNewTaskCustomerName] = useState<string>('Nguyen Thi Ha');

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // AI SOP RAG Assistant states
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiScore, setAiScore] = useState(0);
  const [aiSource, setAiSource] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Dynamic vertical template packs

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Lắng nghe trạng thái mạng
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Kiểm tra số lượng task đang chờ sync
    const checkSyncQueue = async () => {
      const q = await offlineService.getSyncQueue();
      setPendingSyncCount(q.length);
    };
    checkSyncQueue();
    const interval = setInterval(checkSyncQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Xử lý Background Sync khi có mạng
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0 && auth) {
      const flushQueue = async () => {
        const q = await offlineService.getSyncQueue();
        for (const task of q) {
          try {
            if (task.type === 'UPDATE_STATUS') {
              await apiService.updateWorkItemStatus(auth, task.payload.id, task.payload.status);
              await offlineService.removeSyncTask(task.id);
            }
          } catch (e) {
            console.error('Lỗi khi sync task', task, e);
          }
        }
        setPendingSyncCount(0);
        // triggerNotification('success', 'Đã đồng bộ xong dữ liệu ngoại tuyến.');
        // fetchData(); // reload work items từ server
      };
      flushQueue();
    }
  }, [isOnline, pendingSyncCount, auth]);

  // Policies state



  // Customer tracking states
  const [trackingSearchId, setTrackingSearchId] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);




  // Fetch queues từ API khi đăng nhập thành công
  useEffect(() => {
    if (!auth) return;
    apiService.getQueues(auth)
      .then(data => {
        const loadedQueues = data.queues || [];
        setQueues(loadedQueues);
        if (loadedQueues.length > 0 && !selectedQueueId) {
          setSelectedQueueId(loadedQueues[0].id);
          setRouteTargetQueue(loadedQueues[0].id);
        }
      })
      .catch(() => {});
  }, [auth]);

  // Fetch data periodically
  useEffect(() => {
    if (!auth) return;

    const fetchData = async () => {
      try {
        // Lấy danh sách thành viên trong Queue được chọn (chỉ khi có queue hợp lệ)
        if (selectedQueueId) {
          const membersData = await apiService.getQueueMembers(auth, selectedQueueId);
          setQueueMembers(membersData.members || []);
        }

        // Fetch KPI Metrics thật
        const kpiData = await apiService.getKpis(auth);
        setKpis(kpiData.metrics);

        // Fetch toàn bộ danh sách Work Items từ database
        const items = await apiService.getWorkItems(auth);
        // Lọc hiển thị theo Queue đang được chọn hoặc theo category nếu chưa gán queue_id
        const selectedQueue = queues.find(q => q.id === selectedQueueId);
        const filtered = items.filter((item: any) => {
          if (item.queue_id) {
            return item.queue_id === selectedQueueId;
          }
          return selectedQueue && item.category === selectedQueue.category;
        });
        setWorkItems(filtered);

        // Exceptions fetch removed for staff view

        // Fetch Users list
        const usersList = await apiService.getTenantUsers(auth);
        setUsers(usersList || []);
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

        // Add to live notifications list
        setLiveNotifications(prev => [
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            event: msg.event,
            message: msg.event === 'WORK_ITEM_CREATED' ? `Nhiệm vụ mới: "${msg.data.title || 'N/A'}"`
                   : msg.event === 'WORK_ITEM_STATUS_UPDATED' ? `Nhiệm vụ ${msg.data.id?.slice(0,6) || ''} cập nhật -> ${msg.data.status}`
                   : msg.event === 'WORK_ITEM_CLAIMED' ? `Nhiệm vụ được nhân viên nhận (Claim)`
                   : msg.event === 'WORK_ITEM_ROUTED' ? `Nhiệm vụ được định tuyến`
                   : `Sự kiện hệ thống: ${msg.event}`
          },
          ...prev
        ].slice(0, 50));

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
        } else if (msg.event === 'WORK_ITEM_EVIDENCE_ADDED') {
          const evData = msg.data;
          apiService.getWorkItem(auth, evData.work_item_id).then(updatedTask => {
            setWorkItems(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            setSelectedItem(prev => prev && prev.id === updatedTask.id ? updatedTask : prev);
            triggerNotification('success', `Real-time: Shipper vừa tải lên bằng chứng hiện trường!`);
          }).catch(() => {});
        } else if (msg.event === 'WORK_ITEM_ESCALATED') {
          const esc = msg.data;
          setWorkItems(prev => prev.map(t => t.id === esc.work_item_id ? { ...t, status: 'SUSPENDED' } : t));
          triggerNotification('success', `Real-time: Task đã leo thang → SUSPENDED!`);
        } else if (msg.event === 'WORK_ITEM_CLAIMED') {
          const claimed = msg.data;
          setWorkItems(prev => prev.map(t => t.id === claimed.work_item_id ? { ...t, status: 'IN_PROGRESS' } : t));
          triggerNotification('success', `Real-time: Task đã được nhận (Claim Next)!`);
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



  // handleInitializeTemplate removed for staff view

  const handleCreateWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[handleCreateWorkItem] Form submitted!', { newTaskTitle, newTaskPriority, newTaskCategory });
    if (!auth) return;
    if (!newTaskTitle.trim()) {
      triggerNotification('error', 'Tiêu đề task không được để trống.');
      return;
    }

    try {
      const payload: any = {
        title: newTaskTitle,
        priority: newTaskPriority,
        category: newTaskCategory,
        source: 'WEB_CONSOLE',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 ngày tới
        metadata: {
          branch_id: newTaskBranch,
          customer_name: newTaskCustomerName,
          order_value: parseFloat(newTaskOrderValue) || 0,
          evidences: []
        }
      };
      const newTask = await apiService.createWorkItem(auth, payload);
      setWorkItems(prev => {
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
      setNewTaskTitle('');
      triggerNotification('success', `Đã tạo thành công Work Item: ${newTask.title}`);
    } catch (err: any) {
      console.error('[Create WorkItem Error]', err.message);
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
    if (!auth || !selectedQueueId) return;
    
    // Phase 2: Gọi API claim-next thực sự theo routing algorithm của queue
    const DEMO_USER_ID = '8f3b2a1a-4c54-4b01-90e6-d701748f0851';
    try {
      const result = await apiService.claimNextTask(auth, selectedQueueId, DEMO_USER_ID);
      if (result.claimed) {
        const claimed = result.work_item;
        setWorkItems(prev => prev.map(t => t.id === claimed.id ? { ...t, status: 'IN_PROGRESS' } : t));
        setSelectedItem(prev => prev && prev.id === claimed.id ? { ...prev, status: 'IN_PROGRESS' } : prev);
        triggerNotification('success', `✅ Đã claim: "${claimed.title}" theo thuật toán ${result.routing_algorithm}`);
      } else {
        triggerNotification('error', result.message || 'Không có task nào đang chờ.');
      }
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!auth || !selectedItem) return;
    try {
      const updated = await apiService.updateWorkItemStatus(auth, selectedItem.id, status);
      setWorkItems(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status, version: updated.version, tx_hash: updated.tx_hash, metadata: updated.metadata } : t));
      setSelectedItem(prev => prev ? { ...prev, status: updated.status, version: updated.version, tx_hash: updated.tx_hash, metadata: updated.metadata } : null);
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

  const handleAISmartRoute = async () => {
    if (!auth || !selectedItem) return;

    try {
      // Gọi API Intelligence để tự động phân tích và Triage
      const res = await apiService.autoTriageTask(auth, selectedItem.id, selectedItem.title, selectedItem.metadata?.description);
      
      // Update local state based on AI Triage result
      const newPriority = res.data.predicted_priority;
      
      setWorkItems(prev => prev.map(t => 
        t.id === selectedItem.id ? { ...t, priority: newPriority } : t
      ));
      
      setSelectedItem(prev => prev ? { ...prev, priority: newPriority } : null);
      
      triggerNotification('success', `AI Triage: [${res.data.automated_action}] ${res.data.rationale} (Confidence: ${res.data.confidence_score * 100}%)`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Phase 2: Escalation handler
  const handleEscalate = async () => {
    if (!auth || !selectedItem || !escalateReason.trim()) {
      triggerNotification('error', 'Vui lòng nhập lý do leo thang.');
      return;
    }
    try {
      await apiService.escalateTask(auth, selectedItem.id, escalateReason);
      setWorkItems(prev => prev.map(t => t.id === selectedItem.id ? { ...t, status: 'SUSPENDED' } : t));
      setSelectedItem(prev => prev ? { ...prev, status: 'SUSPENDED' } : null);
      setShowEscalateModal(false);
      setEscalateReason('');
      triggerNotification('success', `Task đã được leo thang. Trạng thái → SUSPENDED.`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  const handleQueryRag = async (q = aiQuery) => {
    if (!q.trim() || !auth) return;
    setAiLoading(true);
    try {
      const res = await apiService.queryRagAssistant(auth, q);
      setAiAnswer(res.answer || 'Không có câu trả lời từ RAG.');
      setAiScore(res.groundedness_score || 0);
      const cite = res.citations && res.citations.length > 0
        ? `${res.citations[0].source_file} (Mục: ${res.citations[0].section})`
        : '';
      setAiSource(cite);
    } catch (err: any) {
      triggerNotification('error', err.message || 'Lỗi khi hỏi trợ lý AI.');
    } finally {
      setAiLoading(false);
    }
  };



  // Render Dashboard Workspace
  if (queues.length === 0) {
    return (
      <div className="app-container" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: '24px' }}>
        <div className="panel" style={{ padding: '40px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '48px' }}>⚡</div>
          <h2 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: 700, color: '#fff' }}>Workspace Chưa Được Thiết Lập</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6 }}>
            Doanh nghiệp của bạn chưa cấu hình quy trình làm việc (Hàng đợi, SLA, v.v.). Vui lòng liên hệ Quản trị viên (SME Leader) để tiến hành thiết lập hệ thống từ trang quản trị.
          </p>
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
          
          {/* BRANCH SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            <MapPin size={16} color="var(--text-dim)" />
            <select 
              value={activeBranch}
              onChange={(e) => setActiveBranch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '8px' }}
            >
              <option value="all" style={{ color: '#000' }}>🏢 Toàn hệ thống</option>
              {dynamicBranches.map(b => (
                <option key={b.branch_code || b.name} value={b.branch_code || b.name} style={{ color: '#000' }}>
                  📍 {b.name}
                </option>
              ))}
            </select>
          </div>

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

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotificationPane(p => !p)} 
              className="btn btn-secondary" 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
            >
              🔔
              {liveNotifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--color-accent)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 5px',
                  borderRadius: '50%',
                  lineHeight: 1
                }}>
                  {liveNotifications.length}
                </span>
              )}
            </button>

            {showNotificationPane && (
              <div style={{
                position: 'absolute',
                top: '42px',
                right: '0',
                width: '320px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <strong style={{ color: '#fff', fontSize: '13px' }}>🔔 Hoạt động thời gian thực</strong>
                  <button 
                    onClick={() => setLiveNotifications([])} 
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Xoá sạch
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveNotifications.map(n => (
                    <div key={n.id} style={{ fontSize: '12px', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{n.event}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <div style={{ color: '#fff', marginTop: '2px' }}>{n.message}</div>
                    </div>
                  ))}
                  {liveNotifications.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0', fontSize: '12px' }}>Không có thông báo mới.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Đèn báo Offline / Sync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '16px', background: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isOnline ? '#22c55e' : '#ef4444', border: `1px solid ${isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline 
              ? (pendingSyncCount > 0 ? `Đang đồng bộ (${pendingSyncCount})...` : 'Online') 
              : `Offline (${pendingSyncCount} pending)`}
          </div>

          <div className="user-badge" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="user-dot"></span>
            <span>Simulate Role:</span>
            <select 
              value={activeRole} 
              onChange={(e) => setActiveRole(e.target.value)}
              style={{ background: 'transparent', color: 'var(--color-primary)', border: 'none', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="SME_LEADER" style={{ color: 'black' }}>SME_LEADER (Owner)</option>
              <option value="SME_SUPERVISOR" style={{ color: 'black' }}>SME_SUPERVISOR</option>
              <option value="SME_OPS" style={{ color: 'black' }}>SME_OPS</option>
              <option value="FIELD_WORKER" style={{ color: 'black' }}>FIELD_WORKER (Shipper)</option>
            </select>
          </div>


        </div>
      </header>

      {/* Main Workspace Layout */}
      {activeRole === 'FIELD_WORKER' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', minHeight: '80vh', alignItems: 'center' }}>
          <style>{`.dashboard-grid { display: none !important; }`}</style>
          
          {/* Virtual Mobile Device Wrapper */}
          <div style={{ width: '100%', maxWidth: '380px', height: '700px', background: 'var(--bg-surface-elevated)', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 10px #1a1a1a, 0 0 0 12px #333', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Dynamic Island / Notch */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '30px', background: '#1a1a1a', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>
            
            {/* Mobile Header */}
            <div style={{ padding: '40px 20px 20px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: '#000', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Giao nhận & Kho</div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px', fontWeight: 500 }}>Shipper: Nguyễn Văn E (B01)</div>
            </div>
            
            {/* Mobile Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              
              {/* Current Task Card */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đơn hàng đang xử lý</div>
                  <span className="badge badge-high" style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>ĐANG GIAO</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>ORD-2026-999</div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--color-secondary)', fontSize: '14px', marginBottom: '16px', background: 'rgba(56, 189, 248, 0.05)', padding: '12px', borderRadius: '8px' }}>
                  <MapPin size={20} style={{ flexShrink: 0 }} /> 
                  <span style={{ lineHeight: 1.4, fontWeight: 500 }}>123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM</span>
                </div>
                
                <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Người nhận:</span> <span style={{ color: '#fff', fontWeight: 500 }}>Nguyễn Văn Khách</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Số điện thoại:</span> <span style={{ color: '#fff', fontWeight: 500 }}>0909.123.456</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-dim)', fontSize: '14px' }}>Cần thu hộ (COD):</span> 
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>1,500,000đ</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '15px', display: 'flex', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  📸 Quét mã / Chụp ảnh bằng chứng
                </button>
                
                <button className="btn btn-primary" style={{ padding: '16px', fontSize: '15px', display: 'flex', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '12px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
                  <CheckCircle size={20} /> Hoàn tất Giao hàng
                </button>
              </div>
            </div>
            
            {/* Mobile Home Indicator */}
            <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto 12px' }}></div>
          </div>
        </div>
      )}

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

          {activeRole === 'SME_LEADER' && (
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
                + Thêm Queue
              </button>
            </form>
          )}

          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h3 className="panel-title" style={{ fontSize: '14px', marginBottom: '10px' }}>
              <User size={16} color="var(--color-secondary)" /> Nhân sự hàng đợi ({queueMembers.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queueMembers.map((m, idx) => (
                <div key={m.user_id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-main)' }}>{m.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-unassigned" style={{ fontSize: '9px' }}>{m.role}</span>
                    {auth && (
                      <button 
                        type="button"
                        onClick={async () => {
                          try {
                            await apiService.removeQueueMember(auth, selectedQueueId, m.user_id);
                            triggerNotification('success', 'Đã xoá nhân sự khỏi hàng đợi.');
                            const membersData = await apiService.getQueueMembers(auth, selectedQueueId);
                            setQueueMembers(membersData.members || []);
                          } catch (err: any) {
                            triggerNotification('error', err.message);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                        title="Xoá khỏi hàng đợi này"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {queueMembers.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Không có nhân sự trực tiếp</span>
              )}
            </div>

            {/* Dropdown to assign operator to this queue */}
            {auth && selectedQueueId && (
              <div style={{ marginTop: '12px', position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px', height: '28px', width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowAssignDropdown(p => !p)}
                >
                  ➕ Gán nhân sự vào Queue
                </button>
                {showAssignDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '32px',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    maxHeight: '150px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}>
                    {users.filter(u => !queueMembers.some(qm => qm.user_id === u.id)).map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={async () => {
                          setShowAssignDropdown(false);
                          try {
                            await apiService.addQueueMember(auth, selectedQueueId, u.id);
                            triggerNotification('success', 'Đã gán nhân sự vào hàng đợi thành công.');
                            const membersData = await apiService.getQueueMembers(auth, selectedQueueId);
                            setQueueMembers(membersData.members || []);
                          } catch (err: any) {
                            triggerNotification('error', err.message);
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontSize: '11px',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {u.first_name} {u.last_name} ({u.role})
                      </button>
                    ))}
                    {users.filter(u => !queueMembers.some(qm => qm.user_id === u.id)).length === 0 && (
                      <div style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-dim)' }}>Không còn nhân sự trống.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Center Panel: Work Items Inbox */}
        <div className="panel" style={{ gap: '20px' }}>
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('inbox')} 
              className={`btn ${activeTab === 'inbox' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              📥 Inbox ({workItems.length})
            </button>
            <button 
              onClick={() => setActiveTab('ai_assistant')} 
              className={`btn ${activeTab === 'ai_assistant' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              🤖 Trợ lý SOP AI
            </button>
            <button 
              onClick={() => setActiveTab('customer_tracking')} 
              className={`btn ${activeTab === 'customer_tracking' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              🔍 Tra cứu đơn
            </button>
          </div>

                    {activeTab === 'inbox' && (
            <>
              <div className="panel-header" style={{ padding: 0 }}>
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
              </div>

              {/* Add Work Item Form */}
              <form onSubmit={handleCreateWorkItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TẠO ĐƠN HÀNG / TÁC VỤ VẬN HÀNH MỚI (RETAIL WEDGE)</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Tạo nhanh Work Item (ví dụ: Xử lý chứng từ VAT)..." 
                    className="form-input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                  <select 
                    className="form-input" 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="LOW">Độ ưu tiên: LOW</option>
                    <option value="MEDIUM">Độ ưu tiên: MEDIUM</option>
                    <option value="HIGH">Độ ưu tiên: HIGH</option>
                    <option value="CRITICAL">Độ ưu tiên: CRITICAL</option>
                  </select>
                  <select 
                    className="form-input" 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                  >
                    <option value="OPERATIONS">Danh mục: OPERATIONS</option>
                    <option value="FINANCE">Danh mục: FINANCE</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                  <select 
                    className="form-input" 
                    value={newTaskBranch}
                    onChange={(e) => setNewTaskBranch(e.target.value)}
                  >
                    {dynamicBranches.map(b => (
                      <option key={b.id} value={b.id}>Chi nhánh: {b.name}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Tên Khách hàng" 
                    className="form-input"
                    value={newTaskCustomerName}
                    onChange={(e) => setNewTaskCustomerName(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Giá trị đơn hàng (VNĐ)" 
                    className="form-input"
                    value={newTaskOrderValue}
                    onChange={(e) => setNewTaskOrderValue(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', height: '38px' }}>
                    <Plus size={16} /> Tạo đơn
                  </button>
                </div>
              </form>

              {/* Task Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
                {workItems.map(item => (
                  <div 
                    key={item.id} 
                    data-testid="work-item-row"
                    onClick={() => setSelectedItem(item)}
                    className={`work-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`badge ${item.priority === 'HIGH' || item.priority === 'CRITICAL' ? 'badge-high' : item.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {item.priority}
                      </span>
                      <span className={`badge ${item.status === 'UNASSIGNED' ? 'badge-unassigned' : item.status === 'IN_PROGRESS' ? 'badge-progress' : item.status === 'SUSPENDED' ? 'badge-high' : 'badge-completed'}`}>
                        {item.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '8px' }}>{item.title}</h4>
                    
                    {item.metadata && item.metadata.customer_name && (
                      <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                        👤 <strong>KH:</strong> {item.metadata.customer_name} | 💵 {item.metadata.order_value?.toLocaleString()}đ | 🏢 <strong>{item.metadata.branch_id === 'branch_q1' ? 'Q.1' : item.metadata.branch_id === 'branch_q3' ? 'Q.3' : 'Kho tổng'}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
                      <span>ID: {item.id.substring(0, 8)}...</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Phiên bản: {item.version}</span>
                    </div>
                  </div>
                ))}

                {workItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    <Terminal size={36} style={{ margin: '0 auto 12px' }} />
                    <p>Không tìm thấy nhiệm vụ nào trong hàng đợi này.</p>
                  </div>
                )}
              </div>
            </>
          )}
          {activeTab === 'ai_assistant' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>
                🤖 Trợ lý Quy trình AI (SOP Assistant)
              </h3>
              
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                  Hỏi đáp về quy trình vận hành, chính sách xử lý đơn hàng của doanh nghiệp dựa trên bộ tài liệu SOP được cấu hình sẵn.
                </p>

                {/* Suggest queries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {[
                    "SLA là gì?",
                    "Nextflow OS là gì và mục tiêu của hệ thống?",
                    "Operator có nhiệm vụ gì trong hệ thống?",
                    "Work item là gì?"
                  ].map(qText => (
                    <button
                      key={qText}
                      type="button"
                      onClick={() => {
                        setAiQuery(qText);
                        handleQueryRag(qText);
                      }}
                      style={{
                        fontSize: '11px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        color: '#e2e8f0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'block',
                        width: '100%',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    >
                      💡 {qText}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi quy trình..."
                    className="form-input"
                    style={{ fontSize: '12px', flex: 1 }}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && aiQuery.trim().length >= 5) handleQueryRag();
                    }}
                  />
                  <button
                    onClick={() => handleQueryRag()}
                    className="btn btn-primary"
                    disabled={aiLoading || aiQuery.trim().length < 5}
                    style={{ padding: '0 16px', fontSize: '12px', flexShrink: 0, height: '36px' }}
                  >
                    {aiLoading ? '...' : 'Hỏi'}
                  </button>
                </div>

                {/* Answer Box */}
                {aiAnswer && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} /> Trợ lý AI trả lời:
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-secondary)' }}>Độ tin cậy: {(aiScore * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ color: '#e2e8f0', whiteSpace: 'pre-line' }}>{aiAnswer}</div>
                    {aiSource && (
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                        📄 Nguồn tham chiếu: <strong>{aiSource}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}


                                                            {activeTab === 'customer_tracking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>
                🔍 Cổng Tra cứu đơn hàng (Customer Tracking Portal)
              </h3>
              
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
                  Khách hàng có thể nhập mã đơn hàng (ID Work Item) để kiểm tra lịch sử vận chuyển, trạng thái hiện tại, và bằng chứng giao nhận (GPS / hình ảnh chữ ký).
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nhập ID đơn hàng (ví dụ: c8d29f3d-5c6e...)" 
                    value={trackingSearchId}
                    onChange={(e) => setTrackingSearchId(e.target.value)}
                  />
                  <button 
                    onClick={async () => {
                      if (!auth || !trackingSearchId.trim()) return;
                      try {
                        const task = await apiService.getWorkItem(auth, trackingSearchId.trim());
                        setTrackingResult(task);
                      } catch (err: any) {
                        triggerNotification('error', 'Không tìm thấy đơn hàng hợp lệ.');
                        setTrackingResult(null);
                      }
                    }} 
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Tra cứu
                  </button>
                </div>

                {trackingResult && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: 0 }}>{trackingResult.title}</h4>
                      <span className={`badge ${trackingResult.status === 'COMPLETED' ? 'badge-completed' : trackingResult.status === 'SUSPENDED' ? 'badge-high' : 'badge-progress'}`}>
                        {trackingResult.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '13px' }}>
                      <div>👤 <strong>Khách hàng:</strong> {trackingResult.metadata?.customer_name || 'N/A'}</div>
                      <div>🏢 <strong>Chi nhánh:</strong> {trackingResult.metadata?.branch_id === 'branch_q1' ? 'Quận 1' : trackingResult.metadata?.branch_id === 'branch_q3' ? 'Quận 3' : 'Kho tổng'}</div>
                      <div>💰 <strong>Giá trị:</strong> {trackingResult.metadata?.order_value?.toLocaleString() || 0} VNĐ</div>
                      <div>📅 <strong>Khởi tạo:</strong> {new Date(trackingResult.created_at).toLocaleString()}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '20px', marginLeft: '10px', position: 'relative' }}>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '-27px', top: '2px', background: 'var(--color-secondary)', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Đơn hàng được khởi tạo</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Hệ thống tự động phân loại và đưa vào Queue: Xử lý Đơn hàng.</div>
                      </div>

                      {trackingResult.metadata?.check_in_time && (
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '-27px', top: '2px', background: 'var(--color-primary)', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Shipper đã Check-in tại điểm giao</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Tọa độ GPS: {trackingResult.metadata.check_in_lat}, {trackingResult.metadata.check_in_lng} | Lúc: {new Date(trackingResult.metadata.check_in_time).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {trackingResult.status === 'SUSPENDED' && (
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '-27px', top: '2px', background: 'var(--color-accent)', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>Giao hàng gặp sự cố (Leo thang Exception)</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Đang chờ quản lý phê duyệt.
                          </div>
                        </div>
                      )}

                      {trackingResult.status === 'COMPLETED' && (
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '-27px', top: '2px', background: 'var(--color-secondary)', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary)' }}>Giao nhận hoàn tất thành công</div>
                          {trackingResult.metadata?.evidence_note && (
                            <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px' }}>
                              📝 Ghi chú: {trackingResult.metadata.evidence_note}
                            </div>
                          )}
                          {trackingResult.metadata?.evidence_photo && (
                            <div style={{ marginTop: '8px' }}>
                              <img src={trackingResult.metadata.evidence_photo} alt="Proof of delivery" style={{ maxWidth: '200px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

              <div className="detail-section">
                <span className="meta-label">TÀI CHÍNH / HÓA ĐƠN</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <button 
                    onClick={async () => {
                      if (!auth || !selectedItem) return;
                      try {
                        const amount = parseFloat(window.prompt('Nhập số tiền cần thu (USD):', '1500') || '0');
                        if (amount > 0) {
                          await apiService.createInvoice(auth, { work_item_id: selectedItem.id, amount });
                          triggerNotification('success', 'Đã tạo hóa đơn và Link Thanh Toán thành công!');
                        }
                      } catch (err: any) {
                        triggerNotification('error', err.message);
                      }
                    }} 
                    className="btn btn-secondary" style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                  >
                    <DollarSign size={16} /> Tạo Hóa Đơn & Thu Tiền
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

              {/* U2U Blockchain Verified Certificate */}
              {selectedItem.status === 'COMPLETED' && selectedItem.tx_hash && (
                <div className="detail-section" style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '12px',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '13px' }}>
                    <CheckCircle size={16} /> CHỨNG THỰC U2U BLOCKCHAIN
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                    Nhật ký hoàn thành được ký số Cryptographic hash và ghi nhận lên U2U Trust Layer vĩnh viễn.
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--color-secondary)', marginTop: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    TxHash: {selectedItem.tx_hash}
                  </div>
                </div>
              )}

              {/* Task Audit Timeline */}
              <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <span className="meta-label">NHẬT KÝ THỜI GIAN (AUDIT TIMELINE)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                    <span>Khởi tạo:</span>
                    <span style={{ color: '#fff' }}>{new Date(selectedItem.created_at).toLocaleString()}</span>
                  </div>
                  {selectedItem.metadata?.started_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                      <span>Nhận việc lúc:</span>
                      <span style={{ color: '#fff' }}>{new Date(selectedItem.metadata.started_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedItem.metadata?.completed_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                      <span>Hoàn thành lúc:</span>
                      <span style={{ color: '#fff' }}>{new Date(selectedItem.metadata.completed_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Ops Assistant Panel */}
              <div className="detail-section" style={{
                borderTop: '1px dashed var(--border-color)',
                marginTop: '16px',
                paddingTop: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
                  <Sparkles size={16} /> TRỢ LÝ VẬN HÀNH AI
                </div>

                {/* SLA Risk score */}
                {(() => {
                  let riskPercent = 0;
                  let riskColor = 'var(--color-secondary)';
                  let rationale = '';

                  if (selectedItem.status === 'COMPLETED' || selectedItem.status === 'CANCELLED') {
                    riskPercent = 0;
                    riskColor = 'var(--color-secondary)';
                    rationale = 'Nhiệm vụ đã kết thúc vòng đời vận hành an toàn.';
                  } else {
                    if (selectedItem.priority === 'HIGH') {
                      riskPercent = 85;
                      riskColor = 'var(--color-accent)';
                      rationale = 'Độ ưu tiên HIGH. Đã nằm lâu trong hàng đợi và sắp chạm mốc cam kết SLA. Khuyến nghị Operator xử lý khẩn cấp hoặc Định tuyến tối ưu!';
                    } else if (selectedItem.priority === 'MEDIUM') {
                      riskPercent = 45;
                      riskColor = 'var(--color-info)';
                      rationale = 'Tác vụ ở mức bình thường. Tải công việc hàng đợi hiện trạng cân bằng, rủi ro trễ hạn thấp.';
                    } else {
                      riskPercent = 15;
                      riskColor = 'var(--color-secondary)';
                      rationale = 'Tác vụ có độ ưu tiên thấp. Có thể giải quyết tuần tự theo hàng đợi.';
                    }
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Rủi ro trễ hạn (SLA Risk):</span>
                        <span style={{ color: riskColor, fontWeight: 700 }}>{riskPercent}%</span>
                      </div>
                      
                      <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${riskPercent}%`,
                          backgroundColor: riskColor,
                          borderRadius: '3px',
                          transition: 'width var(--transition-medium)'
                        }}></div>
                      </div>

                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        padding: '10px',
                        borderRadius: '6px',
                        lineHeight: '1.4'
                      }}>
                        {rationale}
                      </div>

                      {selectedItem.status === 'UNASSIGNED' && (
                        <button onClick={handleAISmartRoute} className="btn btn-primary" style={{
                          marginTop: '4px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)'
                        }}>
                          <Sparkles size={14} /> AI Smart Route
                        </button>
                      )}

                      {/* Escalate Button — Phase 2 feature */}
                      {selectedItem.status !== 'COMPLETED' && selectedItem.status !== 'CANCELLED' && selectedItem.status !== 'SUSPENDED' && (
                        <button
                          onClick={() => setShowEscalateModal(true)}
                          className="btn"
                          style={{
                            marginTop: '4px',
                            background: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
                            border: 'none',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                          }}
                        >
                          ⚠️ Leo thang Exception
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* AI Chatbox Interface */}
                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>Hỏi đáp quy trình / SOP với Trợ lý AI:</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!auth || !aiQuery.trim()) return;
                    setAiLoading(true);
                    setAiAnswer('');
                    setAiSource('');
                    try {
                      const res = await apiService.askAiAssistant(auth, aiQuery);
                      setAiAnswer(res.data.answer);
                      setAiSource(res.data.source || '');
                    } catch (err: any) {
                      triggerNotification('error', 'Lỗi khi gọi Trợ lý AI: ' + err.message);
                    } finally {
                      setAiLoading(false);
                    }
                  }} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                      placeholder="VD: Chính sách hoàn tiền là gì?"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      disabled={aiLoading}
                    />
                    <button type="submit" className="btn btn-secondary" disabled={aiLoading} style={{ padding: '6px 12px' }}>
                      {aiLoading ? 'Đang nghĩ...' : 'Hỏi'}
                    </button>
                  </form>
                  {aiAnswer && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ color: '#fff' }}>{aiAnswer}</div>
                      {aiSource && (
                        <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} /> Trích xuất từ: {aiSource} (Verified on Blockchain)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Captures from Mobile Field App */}
              {selectedItem.metadata && selectedItem.metadata.evidences && selectedItem.metadata.evidences.length > 0 && (
                <div className="detail-section" style={{
                  borderTop: '1px dashed var(--border-color)',
                  marginTop: '16px',
                  paddingTop: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '13px' }}>
                    <Camera size={16} /> BẰNG CHỨNG HIỆN TRƯỜNG ({selectedItem.metadata.evidences.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedItem.metadata.evidences.map((ev: any, idx: number) => (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000' }}>
                          <img src={ev.photo_base64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Evidence thumbnail ${idx + 1}`} />
                          <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '2px', fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={10} /> {ev.latitude.toFixed(4)}°, {ev.longitude.toFixed(4)}°
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                          <strong>Ghi chú:</strong> {ev.note}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                          Thời gian: {new Date(ev.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Extension Sandbox Panel */}
              <div className="detail-section" style={{ borderBottom: 'none', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                <span className="meta-label">TIỆN ÍCH MỞ RỘNG (EXTENSIONS SANDBOX)</span>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {approvedExtensions.map(ext => (
                    <div key={ext.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                        🔌 {ext.name}
                      </div>
                      <ExtensionSandboxHost
                        extensionUrl={ext.url}
                        extensionId={ext.id}
                        requiredPermissions={ext.permissions}
                        sandboxFlags={ext.sandboxFlags}
                        tenantContext={{
                          id: auth?.tenantId || 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                          name: 'Nguyen Van Test',
                          locale: 'vi-VN',
                          timezone: 'Asia/Ho_Chi_Minh'
                        }}
                        activeWorkItem={{
                          id: selectedItem.id,
                          title: selectedItem.title,
                          status: selectedItem.status,
                          priority: selectedItem.priority,
                          metadata: selectedItem.metadata
                        }}
                        onAction={async (action, payload: any) => {
                          console.log('[Extension Action Callback]', action, payload);
                          if (action === 'CREATE_WORK_ITEM' && auth) {
                            try {
                              const created = await apiService.createWorkItem(auth, payload);
                              setWorkItems(prev => [created, ...prev]);
                              triggerNotification('success', `Khởi tạo đơn hàng từ Extension thành công! ID: ${created.id}`);
                            } catch (err: any) {
                              triggerNotification('error', `Lỗi Extension: ${err.message}`);
                            }
                          }
                        }}
                        height={180}
                      />
                    </div>
                  ))}
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

      {/* Escalation Modal — Phase 2 */}
      {showEscalateModal && selectedItem && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--panel-bg)', border: '1px solid rgba(220, 38, 38, 0.4)',
            borderRadius: '16px', padding: '28px', width: '420px', maxWidth: '90vw',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#f87171', marginBottom: '8px', fontSize: '18px' }}>⚠️ Leo thang Exception</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '20px' }}>
              Task: <strong style={{ color: '#fff' }}>{selectedItem.title}</strong>
            </p>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '11px' }}>LÝ DO LEO THANG *</label>
              <textarea
                value={escalateReason}
                onChange={e => setEscalateReason(e.target.value)}
                placeholder="Mô tả chi tiết tình huống ngoại lệ cần leo thang..."
                rows={4}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '13px',
                  resize: 'vertical', marginTop: '8px', fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowEscalateModal(false); setEscalateReason(''); }}
                className="btn"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
              >
                Huỷ
              </button>
              <button
                onClick={handleEscalate}
                className="btn"
                style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)', border: 'none', color: '#fff' }}
              >
                Xác nhận Leo thang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




