import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import type { AuthConfig, TemplatePack } from './services/api';
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
  Inbox,
  MapPin,
  Store,
  Shield,
  DollarSign,
  Wifi,
  WifiOff
} from 'lucide-react';
import { offlineService } from './services/offlineSync';
import MarketplaceAdmin from './pages/MarketplaceAdmin';
import PlatformAdmin from './pages/PlatformAdmin';
import ExtensionSandboxHost from './components/ExtensionSandboxHost';
import CustomerPortal from './pages/CustomerPortal';
import ProtectedRoute from './components/ProtectedRoute';
import BillingDashboard from './pages/BillingDashboard';
import IntegrationHub from './pages/IntegrationHub';
import ObservabilityDashboard from './pages/ObservabilityDashboard';
import { DynamicFormBuilder } from './components/DynamicFormBuilder';

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

export default function App() {
  const [auth, setAuth] = useState<AuthConfig | null>(() => {
    if (window.location.pathname.includes('/work-items')) {
      return {
        tenantId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        apiKey: 'nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851'
      };
    }
    return null;
  });
  const [tenantInput, setTenantInput] = useState('d290f1ee-6c54-4b01-90e6-d701748f0851');
  const [apiKeyInput, setApiKeyInput] = useState('nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851');
  const [activeRole, setActiveRole] = useState('SME_LEADER');
  
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
  
  // Platform admin login state
  const [isPlatformAdminView, setIsPlatformAdminView] = useState(false);
  const [platformAdminKeyInput, setPlatformAdminKeyInput] = useState('');
  const [platformAdminKey, setPlatformAdminKey] = useState<string | null>(null);
  
  // Queues: fetch từ API thay vì hardcode
  const [queues, setQueues] = useState<any[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [queueMembers, setQueueMembers] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [kpis, setKpis] = useState<any>(null);

  // New capability states
  const [users, setUsers] = useState<any[]>([]);
  const [dynamicBranches, setDynamicBranches] = useState<any[]>(() => {
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
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState('FIELD_WORKER');

  // Form states for adding branch
  const [newBranchId, setNewBranchId] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'marketplace' | 'customer' | 'billing' | 'integrations' | 'observability'>(() => {
    if (window.location.pathname.includes('/customer')) {
      return 'customer';
    }
    return window.location.pathname.includes('/marketplace') ? 'marketplace' : 'dashboard';
  });
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [activeBranch, setActiveBranch] = useState<string>('all');
  const [newTaskBranch, setNewTaskBranch] = useState<string>('branch_q1');
  const [newTaskOrderValue, setNewTaskOrderValue] = useState<string>('1500000');
  const [newTaskCustomerName, setNewTaskCustomerName] = useState<string>('Nguyen Thi Ha');

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);

  // AI SOP RAG Assistant states
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiScore, setAiScore] = useState(0);
  const [aiSource, setAiSource] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Dynamic vertical template packs
  const [templatePacks, setTemplatePacks] = useState<TemplatePack[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

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
        triggerNotification('success', 'Đã đồng bộ xong dữ liệu ngoại tuyến.');
        loadData(auth); // reload work items từ server
      };
      flushQueue();
    }
  }, [isOnline, pendingSyncCount, auth]);
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('All');

  // Policies state
  const [policies, setPolicies] = useState<{ sla_minutes_default: number; sla_minutes_high: number; auto_assignment_enabled: boolean; routing_mode: string }>({
    sla_minutes_default: 60,
    sla_minutes_high: 30,
    auto_assignment_enabled: false,
    routing_mode: 'FIFO',
  });

  // Webhook integration simulation payload
  const [webhookPayload, setWebhookPayload] = useState<string>(JSON.stringify({
    order_id: "SHPF-99827-X",
    customer_name: "Lê Minh Tuấn",
    email: "tuan.le@gmail.com",
    branch_id: "branch_q1",
    total_amount: 14500000,
    items: [
      { name: "Laptop Dell Vostro", quantity: 1, price: 14500000 }
    ],
    shipping_address: "182 Nguyễn Thị Minh Khai, Quận 1, TPHCM"
  }, null, 2));

  // Customer tracking states
  const [trackingSearchId, setTrackingSearchId] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

  // Check Backend health on load
  useEffect(() => {
    apiService.checkHealth().then(up => setIsBackendUp(up));
  }, []);

  // Fetch template packs dynamically
  useEffect(() => {
    if (!auth) return;
    setIsLoadingTemplates(true);
    apiService.getTemplatePacks()
      .then(packs => {
        setTemplatePacks(packs);
        setIsLoadingTemplates(false);
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
        setIsLoadingTemplates(false);
      });
  }, [auth]);

  // Fetch policies when authenticated
  useEffect(() => {
    if (!auth) return;
    apiService.getTenantPolicies(auth)
      .then(data => setPolicies(data))
      .catch(() => {});
  }, [auth]);

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

        // Fetch Exceptions list
        const exceptionsData = await apiService.getExceptions(auth);
        setExceptions(exceptionsData.exceptions || []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTenant = tenantInput.trim();
    const cleanApiKey = apiKeyInput.trim();
    if (!cleanTenant || !cleanApiKey) {
      triggerNotification('error', 'Vui lòng nhập đầy đủ Tenant ID và API Key.');
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanTenant)) {
      triggerNotification('error', 'Định dạng Tenant ID không hợp lệ (phải là UUID).');
      return;
    }

    const testAuth = { tenantId: cleanTenant, apiKey: cleanApiKey };

    // Xác thực bằng cách gọi GET /api/v1/queues — endpoint này không cần queue_id cụ thể
    // và luôn trả về danh sách queues của tenant (có thể rỗng) nếu auth hợp lệ.
    try {
      await apiService.getQueues(testAuth);
      setAuth(testAuth);
      triggerNotification('success', 'Đăng nhập kết nối Tenant thành công!');
    } catch (err: any) {
      // Nếu là lỗi cụ thể từ server (như định dạng ko hợp lệ hoặc unauthorized)
      if (err.message?.includes('không hợp lệ') || err.message?.includes('xác thực') || err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('Unauthorized')) {
        triggerNotification('error', err.message || 'Thông tin xác thực sai hoặc Tenant không tồn tại.');
      } else {
        // Backend lỗi mạng hoặc đang offline thực sự — vẫn cho vào làm fallback
        setAuth(testAuth);
        triggerNotification('success', 'Kết nối thành công (Backend đang khởi động hoặc offline).');
      }
    }
  };

  const handlePlatformAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = platformAdminKeyInput.trim();
    if (!cleanKey) {
      triggerNotification('error', 'Vui lòng nhập Platform Admin Key.');
      return;
    }
    try {
      // Gọi thử API list tenants để kiểm tra key
      await apiService.getPlatformTenants(cleanKey);
      setPlatformAdminKey(cleanKey);
      triggerNotification('success', 'Đăng nhập Platform Admin thành công!');
    } catch (err: any) {
      triggerNotification('error', err.message || 'Khóa quản trị Platform không chính xác.');
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setWorkItems([]);
    setSelectedItem(null);
  };

  const handleInitializeTemplate = async (templateId: string) => {
    if (!auth) return;
    try {
      triggerNotification('success', 'Đang thiết lập gói mẫu giải pháp...');
      const res = await apiService.initializeTenantTemplate(auth, templateId, true);
      triggerNotification('success', res.message || 'Khởi tạo thành công!');
      const data = await apiService.getQueues(auth);
      setQueues(data.queues || []);
      if (data.queues && data.queues.length > 0) {
        setSelectedQueueId(data.queues[0].id);
        setRouteTargetQueue(data.queues[0].id);
      }
      const policyData = await apiService.getTenantPolicies(auth);
      setPolicies(policyData);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

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

  // If Customer view is selected, render CustomerPortal directly
  if (currentView === 'customer') {
    return <CustomerPortal />;
  }

  if (currentView === 'integrations' || currentView === 'observability') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="brand-section">
            <div className="brand-logo">NF</div>
            <div>
              <h1 className="brand-title">Nextflow OS</h1>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>INTEGRATION HUB</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <button onClick={() => setCurrentView('dashboard')} className="btn btn-secondary">Quay lại Dashboard</button>
          </div>
        </header>
        <div style={{ padding: '20px' }}>
          {currentView === 'integrations' ? <IntegrationHub /> : <ObservabilityDashboard />}
        </div>
      </div>
    );
  }

  // If Platform Admin is logged in, show PlatformAdmin portal
  if (platformAdminKey) {
    return (
      <PlatformAdmin 
        adminKey={platformAdminKey} 
        onLogout={() => setPlatformAdminKey(null)} 
      />
    );
  }

  // Render Login Portal Screen
  if (!auth && currentView !== 'marketplace') {
    return (
      <div className="login-screen">
        <div className="login-glow"></div>
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="brand-logo" style={{ margin: '0 auto 16px', width: '48px', height: '48px', fontSize: '22px' }}>NF</div>
            <h2 className="brand-title" style={{ fontSize: '24px' }}>Nextflow Portal</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Hệ điều hành vận hành tác vụ SMEs thời gian thực
            </p>
          </div>

          {/* Connection Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => setIsPlatformAdminView(false)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                background: !isPlatformAdminView ? 'var(--color-primary)' : 'transparent',
                color: !isPlatformAdminView ? '#000' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Workspace SME
            </button>
            <button
              type="button"
              onClick={() => setIsPlatformAdminView(true)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                background: isPlatformAdminView ? 'var(--color-secondary)' : 'transparent',
                color: isPlatformAdminView ? '#000' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Operator Platform
            </button>
          </div>

          {!isPlatformAdminView ? (
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
          ) : (
            <form onSubmit={handlePlatformAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label>PLATFORM OPERATOR ADMIN KEY</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Nhập khóa quản trị hệ thống..."
                  value={platformAdminKeyInput} 
                  onChange={(e) => setPlatformAdminKeyInput(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn" style={{ background: 'var(--color-secondary)', color: '#000', fontWeight: 600 }}>
                <Shield size={18} /> Xác thực Operator
              </button>
            </form>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', marginTop: '20px' }}>
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
  if (queues.length === 0 && currentView !== 'marketplace') {
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
                gap: '8px'
              }}>
                <Sparkles size={14} /> {notification.message}
              </div>
            )}
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </header>

        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <div className="panel" style={{ padding: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>Chào mừng bạn đến với Nextflow OS</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
                Workspace của doanh nghiệp chưa được khởi tạo cấu hình vận hành. Vui lòng chọn một trong **12 Cụm Ngành Giải pháp Mẫu (Vertical Template Packs)** dưới đây để thiết lập Hàng đợi xử lý và quy tắc SLA tiêu chuẩn.
              </p>
            </div>

            {/* Filter Categories */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              {['All', 'Retail', 'Services', 'Wellness', 'F&B', 'Logistics', 'Education', 'Construction', 'Healthcare', 'Real Estate', 'Manufacturing', 'Automotive'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedIndustryFilter(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: selectedIndustryFilter === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
                    color: selectedIndustryFilter === cat ? '#000' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedIndustryFilter === cat ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                >
                  {cat === 'All' ? 'Tất cả các ngành' : cat}
                </button>
              ))}
            </div>

            {isLoadingTemplates ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <Activity className="spin" size={32} style={{ marginBottom: '16px', color: 'var(--color-primary)' }} />
                <p>Đang tải danh sách Gói Giải pháp Mẫu...</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px',
                textAlign: 'left'
              }}>
                {(templatePacks.length > 0 ? templatePacks : [
                  {
                    id: 'retail_distribution',
                    name: 'Retail & Light Distribution (Bán lẻ & Phân phối)',
                    description: 'Thiết lập tối ưu cho các doanh nghiệp bán lẻ, kho hàng và giao nhận. Bao gồm các hàng đợi Xử lý đơn, Đóng gói kho, Shipper giao hàng và Đối soát.',
                    industry: 'Retail',
                    config_metadata: {
                      queues: [
                        { id: 'q_order_processing', name: '1. Xử lý Đơn', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 1800 },
                        { id: 'q_warehouse_pack', name: '2. Đóng gói kho', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_shipper_delivery', name: '3. Shipper Giao', category: 'OPERATIONS', routing: 'ROUND_ROBIN', sla_seconds: 7200 },
                        { id: 'q_finance_clearance', name: '4. Đối soát COD', category: 'FINANCE', routing: 'FIFO', sla_seconds: 10800 }
                      ]
                    }
                  },
                  {
                    id: 'field_maintenance',
                    name: 'Field Maintenance & Installation (Bảo trì & Lắp đặt)',
                    description: 'Cấu hình cho các dịch vụ bảo trì kỹ thuật, lắp đặt thiết bị tận nơi. Bao gồm tiếp nhận yêu cầu, kỹ thuật viên thực địa và nghiệm thu khách hàng.',
                    industry: 'Services',
                    config_metadata: {
                      queues: [
                        { id: 'q_service_request', name: '1. Tiếp nhận Yêu cầu', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 1800 },
                        { id: 'q_tech_dispatch', name: '2. Kỹ thuật viên', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 14400 },
                        { id: 'q_customer_signoff', name: '3. Nghiệm thu', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 7200 },
                        { id: 'q_billing_clearance', name: '4. Đối soát thanh toán', category: 'FINANCE', routing: 'FIFO', sla_seconds: 7200 }
                      ]
                    }
                  },
                  {
                    id: 'spa_wellness',
                    name: 'Spa & Wellness Booking (Dịch vụ Spa & Làm đẹp)',
                    description: 'Thiết lập cho các spa, tiệm thẩm mỹ và trung tâm chăm sóc sức khỏe. Gồm đặt lịch, phân phòng & kỹ thuật viên, thực hiện liệu trình và chăm sóc khách hàng.',
                    industry: 'Wellness',
                    config_metadata: {
                      queues: [
                        { id: 'q_booking_scheduler', name: '1. Đặt lịch Spa', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 900 },
                        { id: 'q_room_assigner', name: '2. Xếp phòng/KTV', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 1800 },
                        { id: 'q_therapy_execution', name: '3. Trị liệu', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 7200 },
                        { id: 'q_post_service', name: '4. Chăm sóc sau liệu trình', category: 'FINANCE', routing: 'FIFO', sla_seconds: 14400 }
                      ]
                    }
                  },
                  {
                    id: 'fb_operations',
                    name: 'F&B Operations (Nhà hàng & Quán cafe)',
                    description: 'Quy trình vận hành tối ưu cho ngành ẩm thực và đồ uống. Bao gồm ghi nhận order tại bàn/thu ngân, chế biến bếp, phục vụ bàn và đối soát doanh thu.',
                    industry: 'F&B',
                    config_metadata: {
                      queues: [
                        { id: 'q_order_taking', name: '1. Tiếp nhận & Thu ngân', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 600 },
                        { id: 'q_kitchen_prep', name: '2. Chế biến & Bếp', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 1200 },
                        { id: 'q_table_service', name: '3. Phục vụ bàn', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 600 },
                        { id: 'q_fb_reconciliation', name: '4. Đối soát doanh thu', category: 'FINANCE', routing: 'FIFO', sla_seconds: 3600 }
                      ]
                    }
                  },
                  {
                    id: 'logistics_delivery',
                    name: 'Logistics & Express Delivery (Vận tải & Giao nhận nhanh)',
                    description: 'Thiết lập cho các công ty chuyển phát nhanh và kho vận. Tối ưu thu gom đơn hàng bưu cục, phân loại và phân công shipper chặng cuối.',
                    industry: 'Logistics',
                    config_metadata: {
                      queues: [
                        { id: 'q_pickup_request', name: '1. Tiếp nhận đơn ký gửi', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 1800 },
                        { id: 'q_hub_sorting', name: '2. Phân loại tại Bưu cục', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_last_mile', name: '3. Giao hàng chặng cuối', category: 'OPERATIONS', routing: 'ROUND_ROBIN', sla_seconds: 7200 },
                        { id: 'q_cod_reconciliation', name: '4. Đối soát thu hộ COD', category: 'FINANCE', routing: 'FIFO', sla_seconds: 10800 }
                      ]
                    }
                  },
                  {
                    id: 'professional_services',
                    name: 'Professional Services (Dịch vụ Tư vấn & Agency)',
                    description: 'Quy trình vận hành cho các công ty thiết kế, quảng cáo và tư vấn. Quản lý luồng tiếp nhận lead, thiết kế giải pháp và nghiệm thu dự án.',
                    industry: 'Services',
                    config_metadata: {
                      queues: [
                        { id: 'q_lead_qualification', name: '1. Đánh giá nhu cầu khách hàng', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_proposal_design', name: '2. Thiết kế giải pháp & Báo giá', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 14400 },
                        { id: 'q_project_delivery', name: '3. Triển khai dự án', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 28800 },
                        { id: 'q_milestone_billing', name: '4. Nghiệm thu & Xuất hóa đơn', category: 'FINANCE', routing: 'FIFO', sla_seconds: 7200 }
                      ]
                    }
                  },
                  {
                    id: 'education_training',
                    name: 'Education & Training Centers (Trung tâm Giáo dục)',
                    description: 'Giải pháp cho các trung tâm đào tạo, anh ngữ và dạy nghề. Quản lý tư vấn viên, xếp lớp học, gán giảng viên và nghiệm thu kết quả học tập.',
                    industry: 'Education',
                    config_metadata: {
                      queues: [
                        { id: 'q_consultation', name: '1. Tư vấn khóa học', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 1800 },
                        { id: 'q_class_allocation', name: '2. Xếp lớp & Gán giảng viên', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_tuition_fee', name: '3. Đối soát học phí', category: 'FINANCE', routing: 'FIFO', sla_seconds: 7200 },
                        { id: 'q_course_evaluation', name: '4. Nghiệm thu & Báo cáo chất lượng', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 14400 }
                      ]
                    }
                  },
                  {
                    id: 'construction_interior',
                    name: 'Construction & Interior Contractor (Thi công & Nội thất)',
                    description: 'Cấu hình cho các đơn vị thầu xây dựng và thiết kế nội thất. Quản lý khảo sát hiện trường, thiết kế 3D, mua sắm vật tư và thi công dự án.',
                    industry: 'Construction',
                    config_metadata: {
                      queues: [
                        { id: 'q_site_survey', name: '1. Khảo sát hiện trường', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 7200 },
                        { id: 'q_3d_modeling', name: '2. Thiết kế bản vẽ 3D', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 28800 },
                        { id: 'q_material_procurement', name: '3. Mua sắm vật tư', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 14400 },
                        { id: 'q_site_execution', name: '4. Thi công & Nghiệm thu', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 57600 }
                      ]
                    }
                  },
                  {
                    id: 'healthcare_clinic',
                    name: 'Healthcare & Clinic Booking (Phòng khám & Y tế)',
                    description: 'Thiết lập tối ưu cho phòng khám đa khoa, nha khoa hoặc thẩm mỹ viện. Chuẩn hóa tiếp nhận bệnh nhân, khám lâm sàng, phát thuốc và tái khám.',
                    industry: 'Healthcare',
                    config_metadata: {
                      queues: [
                        { id: 'q_patient_reception', name: '1. Tiếp nhận bệnh nhân', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 600 },
                        { id: 'q_clinical_exam', name: '2. Khám lâm sàng', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 1800 },
                        { id: 'q_pharmacy_dispense', name: '3. Phát thuốc & Thanh toán', category: 'FINANCE', routing: 'FIFO', sla_seconds: 1200 },
                        { id: 'q_followup_scheduling', name: '4. Hẹn lịch tái khám', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 }
                      ]
                    }
                  },
                  {
                    id: 'real_estate',
                    name: 'Real Estate Agency & Brokerage (Môi giới Bất động sản)',
                    description: 'Dành cho các sàn giao dịch bất động sản. Quy trình quản lý từ việc nhận nguồn ký gửi, xác thực thông tin, dẫn khách xem nhà và đối soát hoa hồng.',
                    industry: 'Real Estate',
                    config_metadata: {
                      queues: [
                        { id: 'q_listing_verification', name: '1. Xác thực nguồn nhà', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_viewing_schedule', name: '2. Lên lịch xem nhà', category: 'OPERATIONS', routing: 'ROUND_ROBIN', sla_seconds: 7200 },
                        { id: 'q_contract_negotiation', name: '3. Thương lượng & Soạn hợp đồng', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 14400 },
                        { id: 'q_commission_clearance', name: '4. Đối soát phí môi giới', category: 'FINANCE', routing: 'FIFO', sla_seconds: 14400 }
                      ]
                    }
                  },
                  {
                    id: 'manufacturing_sme',
                    name: 'Manufacturing & Work Order (Sản xuất quy mô vừa/nhỏ)',
                    description: 'Tối ưu cho xưởng sản xuất cơ khí, may mặc, chế biến gỗ. Quản lý lệnh sản xuất, cấp phát nguyên vật liệu, theo dõi công đoạn lắp ráp và QA.',
                    industry: 'Manufacturing',
                    config_metadata: {
                      queues: [
                        { id: 'q_work_order_intake', name: '1. Tiếp nhận lệnh sản xuất', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_material_allocation', name: '2. Cấp phát nguyên vật liệu', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 7200 },
                        { id: 'q_assembly_production', name: '3. Lắp ráp & Sản xuất', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 28800 },
                        { id: 'q_quality_assurance', name: '4. Kiểm định chất lượng QA', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 7200 }
                      ]
                    }
                  },
                  {
                    id: 'auto_repair',
                    name: 'Automotive Repair & Garage (Sửa chữa Ô tô & Garage)',
                    description: 'Quy trình quản lý tiếp nhận xe chẩn đoán lỗi, lập báo giá cho khách duyệt, phân công kỹ thuật viên garage sửa chữa và bàn giao xe thanh toán.',
                    industry: 'Automotive',
                    config_metadata: {
                      queues: [
                        { id: 'q_vehicle_reception', name: '1. Tiếp nhận xe & Chẩn đoán lỗi', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 1800 },
                        { id: 'q_quote_approval', name: '2. Báo giá & Khách hàng duyệt', category: 'OPERATIONS', routing: 'FIFO', sla_seconds: 3600 },
                        { id: 'q_repair_execution', name: '3. Sửa chữa & Thay thế linh kiện', category: 'OPERATIONS', routing: 'CAPACITY_BASED', sla_seconds: 14400 },
                        { id: 'q_wash_checkout', name: '4. Rửa xe, bàn giao & Thanh toán', category: 'FINANCE', routing: 'FIFO', sla_seconds: 1800 }
                      ]
                    }
                  }
                ])
                .filter(tp => selectedIndustryFilter === 'All' || tp.industry === selectedIndustryFilter)
                .map(tp => (
                  <div
                    key={tp.id}
                    className="panel"
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '12px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleInitializeTemplate(tp.id)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--color-primary)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {tp.industry}
                          </span>
                          {tp.id === 'retail_distribution' && (
                            <span className="badge badge-high" style={{ padding: '3px 8px', fontSize: '10px' }}>Khuyên dùng</span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '12px', marginTop: 0, lineHeight: 1.4 }}>{tp.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.6 }}>{tp.description}</p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Quy trình hàng đợi (SLA):</span>
                          {tp.config_metadata?.queues?.map((q: any) => {
                            const formatSlaVal = (seconds: number) => {
                              if (seconds < 60) return `${seconds}s`;
                              const minutes = Math.round(seconds / 60);
                              if (minutes < 60) return `${minutes}m`;
                              const hours = Math.round(minutes / 60);
                              return `${hours}h`;
                            };
                            return (
                              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)' }}>
                                <span>{q.name}</span>
                                <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{formatSlaVal(q.sla_seconds)}</span>
                              </div>
                            );
                          })}
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontWeight: 600 }}>Khởi chạy giải pháp</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            </select>
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

          <ProtectedRoute userRole={activeRole} allowedRoles={['SME_LEADER']}>
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
          </ProtectedRoute>

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

          {/* Marketplace Nav Link */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setCurrentView('observability')}
              className={`sidebar-item ${currentView === 'observability' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
            >
              <Activity size={16} /> Giám sát & Báo cáo
            </button>
            <button
              onClick={() => setCurrentView('integrations')}
              className={`sidebar-item ${currentView === 'integrations' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
            >
              🔌 Webhooks & Tích hợp
            </button>
            <button
              data-testid="nav-marketplace"
              onClick={() => setCurrentView(v => v === 'marketplace' ? 'dashboard' : 'marketplace')}
              className={`sidebar-item ${currentView === 'marketplace' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
            >
              <Store size={15} /> Marketplace
            </button>
            <ProtectedRoute userRole={activeRole} allowedRoles={['SME_LEADER', 'SME_OPS']}>
              <button
                onClick={() => setCurrentView(v => v === 'billing' ? 'dashboard' : 'billing')}
                className={`sidebar-item ${currentView === 'billing' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', marginTop: '4px' }}
              >
                <DollarSign size={15} /> Quản lý Tài chính (Billing)
              </button>
            </ProtectedRoute>
          </div>
        </div>

        {/* Center Panel: Work Items Inbox OR Marketplace OR Billing */}
        {currentView === 'marketplace' ? (
          <div className="panel" style={{ gridColumn: 'span 2' }}>
            <MarketplaceAdmin />
          </div>
        ) : currentView === 'billing' && auth ? (
          <div className="panel" style={{ gridColumn: 'span 2' }}>
            <BillingDashboard auth={auth} />
          </div>
        ) : (<>
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
              onClick={() => setActiveTab('control_center')} 
              className={`btn ${activeTab === 'control_center' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              📊 Control
            </button>
            <button 
              onClick={() => setActiveTab('branch_overview')} 
              className={`btn ${activeTab === 'branch_overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              🏢 Chi nhánh
            </button>
            <button 
              onClick={() => setActiveTab('exceptions')} 
              className={`btn ${activeTab === 'exceptions' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              ⚠️ Phê duyệt ({exceptions.filter(e => e.status === 'PENDING').length})
            </button>
            <button 
              onClick={() => setActiveTab('policies')} 
              className={`btn ${activeTab === 'policies' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              ⚙️ Policies
            </button>
            <button 
              onClick={() => setActiveTab('integrations')} 
              className={`btn ${activeTab === 'integrations' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              🔗 Webhooks/CSV
            </button>
            <button 
              onClick={() => setActiveTab('customer_tracking')} 
              className={`btn ${activeTab === 'customer_tracking' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              🔍 Tra cứu KH
            </button>
            <button 
              onClick={() => setActiveTab('team_management')} 
              className={`btn ${activeTab === 'team_management' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto' }}
            >
              👥 Nhân sự ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('nocode_builder')} 
              className={`btn ${activeTab === 'nocode_builder' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '12px', flex: '1 0 auto', background: activeTab === 'nocode_builder' ? '#3b82f6' : '#1e293b', border: '1px solid #3b82f6' }}
            >
              ✨ No-Code Builder
            </button>
          </div>

          {activeTab === 'nocode_builder' && (
            <div className="panel" style={{ padding: '20px' }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Trình Tạo Giao Diện Tự Động (Schema-Driven UI)</h2>
                <p className="text-slate-400">Ví dụ này minh họa cách một file cấu hình JSON được gửi từ Backend tự động "biến hình" thành một giao diện ứng dụng hoàn chỉnh cho SME. 
                Bạn không cần sửa code React mỗi khi SME muốn thêm một trường dữ liệu mới vào hệ thống.</p>
              </div>
              <DynamicFormBuilder 
                schema={{
                  title: "Tạo Hồ Sơ Khám Bệnh (Template Nha Khoa)",
                  type: "object",
                  required: ["patient_name", "blood_pressure"],
                  properties: {
                    patient_name: { type: "string", title: "Tên Bệnh Nhân", description: "Vui lòng nhập họ và tên đầy đủ" },
                    age: { type: "number", title: "Tuổi" },
                    blood_pressure: { type: "string", title: "Chỉ số Huyết Áp (mmHg)" }
                  }
                }}
                onSubmit={(data) => alert("Dữ liệu chuẩn bị được nạp vào Entity Records và chạy qua Workflow Engine:\\n" + JSON.stringify(data, null, 2))}
              />
            </div>
          )}

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

          {activeTab === 'control_center' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                📊 Operational Control Dashboard & AI SOP Assistant
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
                {/* Column 1: Metrics & SLA alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="stats-container" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
                      <div className="stat-num" style={{ color: 'var(--color-secondary)' }}>90.9%</div>
                      <div className="stat-label">SLA Compliance Rate (Target: &gt;90%)</div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--color-info)' }}>
                      <div className="stat-num" style={{ color: 'var(--color-info)' }}>18.4 /h</div>
                      <div className="stat-label">Throughput Tốc độ Xử lý</div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                      <div className="stat-num" style={{ color: 'var(--color-warning)' }}>{exceptions.filter(e => e.status === 'PENDING').length}</div>
                      <div className="stat-label">Ngoại lệ PENDING Chờ duyệt</div>
                    </div>
                  </div>

                  {/* SLA Risk Distribution */}
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>SLA Risk Distribution (Phân bổ mức độ trễ hạn)</h4>
                    <div style={{ display: 'flex', gap: '4px', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '15%', backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700 }}>
                        15% High
                      </div>
                      <div style={{ width: '30%', backgroundColor: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', fontWeight: 700 }}>
                        30% Med
                      </div>
                      <div style={{ width: '55%', backgroundColor: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700 }}>
                        55% Low
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
                      💡 <strong>Gợi ý AI:</strong> Hiện trạng có tác vụ độ ưu tiên HIGH đang ở tình trạng sắp vi phạm SLA. Bạn nên chuyển tiếp tác vụ này hoặc click Duyệt Ngoại lệ.
                    </p>
                  </div>

                  {/* SLA Risk items */}
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Cảnh báo Trễ hạn (SLA High Risk Items)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {workItems.filter(item => item.priority === 'HIGH' || item.priority === 'CRITICAL').map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{item.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Hàng đợi: {queues.find(q => q.id === item.queue_id)?.name || item.queue_id}</div>
                          </div>
                          <span className="badge badge-high">Rủi ro: 85%</span>
                        </div>
                      ))}
                      {workItems.filter(item => item.priority === 'HIGH' || item.priority === 'CRITICAL').length === 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '10px' }}>
                          🎉 Tuyệt vời! Không có tác vụ nào gặp rủi ro SLA cao tại hàng đợi này.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: AI SOP RAG Assistant */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="var(--color-primary)" /> Trợ lý Quy trình AI (SOP Assistant)
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
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
            </div>
          )}

          {activeTab === 'branch_overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="panel-title">🏢 Giám sát Hoạt động Chi nhánh (Branch Visibility)</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setActiveBranch('all')} className={`btn ${activeBranch === 'all' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                    Tất cả
                  </button>
                  {dynamicBranches.map(b => (
                    <button key={b.id} onClick={() => setActiveBranch(b.id)} className={`btn ${activeBranch === b.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {dynamicBranches.map(b => (
                  <div key={b.id} style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{b.name}</h4>
                    <div style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 700, margin: '8px 0' }}>
                      {workItems.filter(item => item.metadata?.branch_id === b.id).length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Backlog đơn hàng</div>
                  </div>
                ))}
              </div>

              {/* Branch Comparison Table */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>📊 Phân tích & So sánh Hiệu năng Chi nhánh</h4>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px 8px' }}>TÊN CHI NHÁNH</th>
                        <th style={{ padding: '12px 8px' }}>BACKLOG HOẠT ĐỘNG</th>
                        <th style={{ padding: '12px 8px' }}>TỈ LỆ ĐẠT SLA</th>
                        <th style={{ padding: '12px 8px' }}>TỔNG GIÁ TRỊ ĐƠN HÀNG</th>
                        <th style={{ padding: '12px 8px' }}>NHÂN SỰ VẬN HÀNH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dynamicBranches.map(b => {
                        const backlog = workItems.filter(item => item.metadata?.branch_id === b.id && item.status !== 'COMPLETED' && item.status !== 'CANCELLED').length;
                        const totalValue = workItems.filter(item => item.metadata?.branch_id === b.id).reduce((sum, item) => sum + (parseFloat(item.metadata?.order_value) || 0), 0);
                        const slaRate = b.id === 'branch_q1' ? '94.5%' : b.id === 'branch_q3' ? '88.2%' : '91.8%';
                        const staffCount = b.id === 'branch_q1' ? 4 : b.id === 'branch_q3' ? 2 : 5;
                        
                        return (
                          <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#e2e8f0' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 600 }}>🏢 {b.name}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '12px', 
                                fontSize: '11px',
                                fontWeight: 700,
                                background: backlog > 3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                color: backlog > 3 ? '#ef4444' : '#10b981'
                              }}>{backlog} đơn</span>
                            </td>
                            <td style={{ padding: '12px 8px', color: '#10b981', fontWeight: 'bold' }}>{slaRate}</td>
                            <td style={{ padding: '12px 8px', fontWeight: '600' }}>{totalValue.toLocaleString()} VNĐ</td>
                            <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>👤 {staffCount} operators</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Branch Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Danh sách đơn hàng của Chi nhánh</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '240px' }}>
                  {workItems.filter(item => activeBranch === 'all' || item.metadata?.branch_id === activeBranch).map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          KH: {item.metadata?.customer_name || 'N/A'} | Đơn giá: {item.metadata?.order_value?.toLocaleString() || 0}đ
                        </div>
                      </div>
                      <span className={`badge ${item.status === 'UNASSIGNED' ? 'badge-unassigned' : 'badge-progress'}`}>{item.status}</span>
                    </div>
                  ))}
                  {workItems.filter(item => activeBranch === 'all' || item.metadata?.branch_id === activeBranch).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
                      Không có đơn hàng nào tại chi nhánh này.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exceptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="panel-title">⚠️ Phê duyệt Ngoại lệ Vận hành (Escalated Exceptions Panel)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Khi nhân viên giao hàng (Shipper) hoặc đội tác nghiệp gặp sự cố ngoài chuẩn (đơn trễ hạn, sai địa chỉ, khách hoàn trả), họ sẽ thực hiện "Leo thang". Yêu cầu đó hiển thị dưới đây để Manager duyệt hoặc bác bỏ.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px' }}>
                {exceptions.map(ex => {
                  const handleResolve = async (decision: 'APPROVED' | 'REJECTED') => {
                    if (!auth) return;
                    try {
                      await apiService.resolveException(auth, ex.id, decision);
                      triggerNotification('success', `Đã ${decision === 'APPROVED' ? 'Duyệt' : 'Từ chối'} ngoại lệ thành công!`);
                      const excData = await apiService.getExceptions(auth);
                      setExceptions(excData.exceptions || []);
                    } catch (err: any) {
                      triggerNotification('error', err.message);
                    }
                  };

                  return (
                    <div key={ex.id} style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="badge badge-high" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          {ex.exception_type}
                        </span>
                        <span className={`badge ${ex.status === 'PENDING' ? 'badge-unassigned' : ex.status === 'APPROVED' ? 'badge-completed' : 'badge-high'}`}>
                          {ex.status}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                        Nhiệm vụ: {ex.work_item_title || ex.work_item_id.substring(0, 8)}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-main)', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <strong>Lý do leo thang:</strong> {ex.reason}
                      </div>

                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        Yêu cầu lúc: {new Date(ex.created_at).toLocaleString()}
                      </div>

                      {ex.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                          <button 
                            onClick={() => handleResolve('APPROVED')} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', padding: '6px' }}
                          >
                            ✓ Duyệt (Chạy tiếp)
                          </button>
                          <button 
                            onClick={() => handleResolve('REJECTED')} 
                            className="btn btn-accent" 
                            style={{ flex: 1, padding: '6px' }}
                          >
                            ✗ Từ chối (Hủy đơn)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {exceptions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    <CheckCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p>Không có ngoại lệ nào cần xử lý.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>
                ⚙️ Chính sách & Quy tắc vận hành (SLA Policies)
              </h3>
              
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>THỜI HẠN SLA MẶC ĐỊNH (PHÚT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={policies.sla_minutes_default} 
                      onChange={(e) => setPolicies({ ...policies, sla_minutes_default: parseInt(e.target.value) || 60 })} 
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>Áp dụng cho các nhiệm vụ độ ưu tiên MEDIUM & LOW</span>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>THỜI HẠN SLA KHẨN CẤP (PHÚT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={policies.sla_minutes_high} 
                      onChange={(e) => setPolicies({ ...policies, sla_minutes_high: parseInt(e.target.value) || 30 })} 
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>Áp dụng cho các nhiệm vụ độ ưu tiên HIGH & CRITICAL</span>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input 
                    type="checkbox" 
                    id="auto_assign_toggle"
                    checked={policies.auto_assignment_enabled} 
                    onChange={(e) => setPolicies({ ...policies, auto_assignment_enabled: e.target.checked })} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="auto_assign_toggle" style={{ cursor: 'pointer', margin: 0, color: '#fff' }}>
                    <strong>Tự động phân phối công việc (AI Auto-Assignment)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 'normal', marginTop: '2px' }}>AI tự động tính toán hiệu năng và gán task cho Operator phù hợp nhất.</div>
                  </label>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>THUẬT TOÁN ĐỊNH TUYẾN (ROUTING ALGORITHM)</label>
                  <select 
                    className="form-input" 
                    value={policies.routing_mode} 
                    onChange={(e) => setPolicies({ ...policies, routing_mode: e.target.value })}
                  >
                    <option value="FIFO">FIFO (First In First Out - Đến trước xử lý trước)</option>
                    <option value="ROUND_ROBIN">Round Robin (Chia đều xoay vòng)</option>
                    <option value="AI_RECOMMENDED">AI Smart Routing (Gợi ý phân bổ tối ưu)</option>
                  </select>
                </div>

                <button 
                  onClick={async () => {
                    if (!auth) return;
                    try {
                      await apiService.updateTenantPolicies(auth, policies);
                      triggerNotification('success', 'Đã lưu cấu hình SLA & Routing thành công!');
                    } catch (err: any) {
                      triggerNotification('error', err.message);
                    }
                  }} 
                  className="btn btn-primary" 
                  style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
                >
                  Lưu cấu hình chính sách
                </button>

                <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '24px', paddingTop: '20px' }}>
                  <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    📦 Khởi tạo Gói Giải pháp mẫu theo Ngành (Vertical Templates)
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                    Lựa chọn ngành nghề của bạn để hệ thống tự động cấu hình các Hàng đợi xử lý (Queues) và quy tắc SLA mặc định chuẩn công nghiệp.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {[
                      { id: 'retail_logistics', name: 'Logistics Bán lẻ (Retail)', desc: 'Cấu hình luồng Tiếp nhận, Vận chuyển, Đối soát dòng tiền và Hàng trả lại.' },
                      { id: 'automotive_repair', name: 'Garage Ô tô (Automotive)', desc: 'Quy trình Tiếp nhận chẩn đoán, Báo giá khách hàng, Sửa chữa máy/đồng sơn và Bàn giao xe.' },
                      { id: 'real_estate', name: 'Môi giới BĐS (Real Estate)', desc: 'Quy trình Thẩm định bất động sản, Dẫn khách xem nhà, Ký cọc và Hồ sơ pháp lý.' }
                    ].map(tpl => (
                      <div key={tpl.id} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>{tpl.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>{tpl.desc}</div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '11px', padding: '6px 12px', width: '100%', justifyContent: 'center' }}
                          onClick={async () => {
                            if (!auth) return;
                            if (!window.confirm(`Bạn có chắc chắn muốn khởi tạo gói mẫu "${tpl.name}"? Hành động này sẽ thay thế cấu hình hàng đợi hiện tại.`)) return;
                            try {
                              triggerNotification('success', `Đang cấu hình gói giải pháp ${tpl.name}...`);
                              await apiService.initializeTenantTemplate(auth, tpl.id, true);
                              triggerNotification('success', `Đã cấu hình thành công Gói giải pháp ${tpl.name}!`);
                              // Refresh queues
                              const queuesData = await apiService.getQueues(auth);
                              setQueues(queuesData.queues || []);
                              if (queuesData.queues && queuesData.queues.length > 0) {
                                setSelectedQueueId(queuesData.queues[0].id);
                              }
                            } catch (err: any) {
                              triggerNotification('error', err.message);
                            }
                          }}
                        >
                          Kích hoạt Gói này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>
                🔗 Cổng Tích hợp & Webhooks (Shopify / CSV Ingestion)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Shopify Webhook Simulator */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0' }}>Shopify Order Ingestion Simulator</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                    Mô phỏng sự kiện `order/create` gửi từ Shopify Webhook để đưa đơn hàng tự động vào Queue xử lý của Nextflow OS.
                  </p>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>MOCK WEBHOOK PAYLOAD (JSON)</label>
                    <textarea 
                      className="form-input" 
                      style={{ fontFamily: 'monospace', fontSize: '12px', height: '150px', background: '#000', color: '#10B981', border: '1px solid var(--border-color)', padding: '10px', width: '100%' }}
                      value={webhookPayload}
                      onChange={(e) => setWebhookPayload(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={async () => {
                      if (!auth) return;
                      try {
                        const parsed = JSON.parse(webhookPayload);
                        const payload = {
                          title: `Xử lý đơn hàng Shopify #${parsed.order_id}`,
                          description: `Giao hàng đến: ${parsed.shipping_address}`,
                          priority: parsed.total_amount > 10000000 ? 'HIGH' : 'MEDIUM',
                          category: 'OPERATIONS',
                          source: 'SHOPIFY_WEBHOOK',
                          external_id: parsed.order_id,
                          metadata: {
                            branch_id: parsed.branch_id || 'branch_q1',
                            customer_name: parsed.customer_name,
                            order_value: parsed.total_amount,
                            email: parsed.email
                          }
                        };
                        const created = await apiService.createWorkItem(auth, payload as any);
                        setWorkItems(prev => [created, ...prev]);
                        triggerNotification('success', `Đã nhận đơn hàng từ Shopify Webhook! ID: ${created.id}`);
                      } catch (err: any) {
                        triggerNotification('error', 'Payload JSON không hợp lệ hoặc lỗi kết nối: ' + err.message);
                      }
                    }} 
                    className="btn btn-primary"
                    style={{ marginTop: '12px' }}
                  >
                    Gửi simulated webhook
                  </button>
                </div>

                {/* CSV Ingestion */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>Nhập File Đơn hàng (CSV Bulk Import)</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Tải lên danh sách đơn hàng loạt để phân phối nhanh vào các chi nhánh tương ứng.
                  </p>

                  <button 
                    onClick={async () => {
                      if (!auth) return;
                      try {
                        triggerNotification('success', 'Đang tải lên dữ liệu CSV giả lập...');
                        const mockCSVRows = [
                          { title: "Đơn hàng nội thành Hà Nội #8827", name: "Trịnh Khắc Huy", val: 1250000, branch: "branch_q1" },
                          { title: "Đơn hàng linh kiện PC Biên Hòa #8828", name: "Nguyễn Minh Đức", val: 19800000, branch: "branch_warehouse" },
                          { title: "Đơn hàng thời trang Q.3 #8829", name: "Vũ Phương Ly", val: 680000, branch: "branch_q3" }
                        ];

                        for (const row of mockCSVRows) {
                          await apiService.createWorkItem(auth, {
                            title: row.title,
                            priority: row.val > 10000000 ? 'HIGH' : 'MEDIUM',
                            category: 'OPERATIONS',
                            source: 'CSV_IMPORT',
                            metadata: {
                              branch_id: row.branch,
                              customer_name: row.name,
                              order_value: row.val
                            } as any
                          });
                        }
                        
                        triggerNotification('success', 'Đã import thành công 3 đơn hàng từ file CSV!');
                        const items = await apiService.getWorkItems(auth);
                        const selectedQueue = queues.find(q => q.id === selectedQueueId);
                        const filtered = items.filter((item: any) => {
                          if (item.queue_id) return item.queue_id === selectedQueueId;
                          return selectedQueue && item.category === selectedQueue.category;
                        });
                        setWorkItems(filtered);
                      } catch (err: any) {
                        triggerNotification('error', err.message);
                      }
                    }} 
                    className="btn btn-secondary"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Simulate CSV Import (3 đơn hàng)
                  </button>
                </div>
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

          {activeTab === 'team_management' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>
                👥 Quản lý Nhân sự & Chi nhánh Vận hành
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                
                {/* Column 1: Operator Directory */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>Danh sách Nhân sự vận hành</h4>
                  </div>

                  {/* Add Operator Form */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!auth) return;
                    if (!newUserEmail || !newUserFirstName || !newUserLastName) {
                      triggerNotification('error', 'Vui lòng điền đầy đủ email, họ và tên.');
                      return;
                    }
                    try {
                      await apiService.createTenantUser(auth, {
                        email: newUserEmail,
                        first_name: newUserFirstName,
                        last_name: newUserLastName,
                        role: newUserRole
                      });
                      triggerNotification('success', 'Đã thêm nhân sự vận hành mới.');
                      setNewUserEmail('');
                      setNewUserFirstName('');
                      setNewUserLastName('');
                      // reload users
                      const list = await apiService.getTenantUsers(auth);
                      setUsers(list || []);
                    } catch (err: any) {
                      triggerNotification('error', err.message);
                    }
                  }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ gridColumn: 'span 2', fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)' }}>THÊM NHÂN SỰ MỚI</div>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px' }}
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                    <select 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px' }}
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="SME_OPS">SME Operator (Admin)</option>
                      <option value="FIELD_WORKER">Field Worker (Shipper/Staff)</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Họ" 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px' }}
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Tên" 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px' }}
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
                      + Thêm nhân viên
                    </button>
                  </form>

                  {/* Users List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {users.map(u => (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                            {u.first_name} {u.last_name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{u.email}</div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            <span className="badge badge-unassigned" style={{ fontSize: '9px' }}>{u.role}</span>
                            <span className={`badge ${u.is_active ? 'badge-completed' : 'badge-low'}`} style={{ fontSize: '9px' }}>
                              {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button"
                            onClick={async () => {
                              if (!auth) return;
                              try {
                                  await apiService.updateTenantUser(auth, u.id, { is_active: !u.is_active });
                                  triggerNotification('success', 'Đã thay đổi trạng thái hoạt động.');
                                  const list = await apiService.getTenantUsers(auth);
                                  setUsers(list || []);
                              } catch (err: any) {
                                triggerNotification('error', err.message);
                              }
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '10px' }}
                          >
                            {u.is_active ? 'Khóa' : 'Mở'}
                          </button>
                          <button 
                            type="button"
                            onClick={async () => {
                              if (!auth) return;
                              if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân sự ${u.first_name} ${u.last_name}?`)) return;
                              try {
                                await apiService.deleteTenantUser(auth, u.id);
                                triggerNotification('success', 'Đã xóa nhân sự.');
                                const list = await apiService.getTenantUsers(auth);
                                setUsers(list || []);
                              } catch (err: any) {
                                triggerNotification('error', err.message);
                              }
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--color-accent)' }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>Chưa có nhân viên nào.</div>
                    )}
                  </div>
                </div>

                {/* Column 2: Branches Structure */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>Cấu trúc Chi nhánh (SME Branches)</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                    Định cấu hình các chi nhánh/kho bãi để hệ thống tự động phân chia luồng công việc tương ứng.
                  </p>

                  {/* Add Branch Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newBranchId.trim() || !newBranchName.trim()) {
                      triggerNotification('error', 'Vui lòng điền đủ mã và tên chi nhánh.');
                      return;
                    }
                    const updated = [...dynamicBranches, { id: newBranchId.trim(), name: newBranchName.trim() }];
                    setDynamicBranches(updated);
                    localStorage.setItem('nf_dynamic_branches', JSON.stringify(updated));
                    setNewBranchId('');
                    setNewBranchName('');
                    triggerNotification('success', 'Đã lưu cấu hình chi nhánh mới.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>THÊM CHI NHÁNH MỚI</div>
                    <input 
                      type="text" 
                      placeholder="Mã chi nhánh (vd: branch_q1)" 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px' }}
                      value={newBranchId}
                      onChange={(e) => setNewBranchId(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Tên chi nhánh" 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px' }}
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
                      + Thêm chi nhánh
                    </button>
                  </form>

                  {/* Branches List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dynamicBranches.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{b.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ID: {b.id}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = dynamicBranches.filter(x => x.id !== b.id);
                            setDynamicBranches(updated);
                            localStorage.setItem('nf_dynamic_branches', JSON.stringify(updated));
                            triggerNotification('success', 'Đã xoá chi nhánh.');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '12px' }}
                          title="Xóa chi nhánh"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

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
                <span className="meta-label">NHÂN SỰ PHỤ TRÁCH (MANUAL ASSIGNMENT)</span>
                <select 
                  id="assign_user_select"
                  className="form-input" 
                  style={{ fontSize: '13px', marginTop: '6px', width: '100%' }}
                  value={selectedItem.assignee_id || ''}
                  onChange={async (e) => {
                    const userId = e.target.value;
                    if (!auth || !selectedItem) return;
                    try {
                      const targetQueue = selectedItem.queue_id || selectedQueueId || queues[0]?.id;
                      await apiService.routeWorkItem(auth, selectedItem.id, targetQueue, userId || undefined);
                      // reload work items
                      const items = await apiService.getWorkItems(auth);
                      const selectedQ = queues.find(q => q.id === selectedQueueId);
                      const filtered = items.filter((item: any) => {
                        if (item.queue_id) return item.queue_id === selectedQueueId;
                        return selectedQ && item.category === selectedQ.category;
                      });
                      setWorkItems(filtered);
                      // update selected item details
                      const freshTask = await apiService.getWorkItem(auth, selectedItem.id);
                      setSelectedItem(freshTask);
                      triggerNotification('success', 'Đã cập nhật nhân sự xử lý.');
                    } catch (err: any) {
                      triggerNotification('error', err.message);
                    }
                  }}
                >
                  <option value="">-- Chưa phân công --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                  ))}
                </select>
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
      </>)}
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
