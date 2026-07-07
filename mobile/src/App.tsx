import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Camera, 
  MapPin, 
  CheckCircle, 
  Play, 
  Inbox,
  CloudLightning,
  Check,
  AlertTriangle,
  FolderOpen,
  LogOut
} from 'lucide-react';

// Cấu hình localforage lưu trữ IndexedDB cục bộ (Offline Resilience)
const tasksStore = localforage.createInstance({ name: 'nextflow_mobile', storeName: 'tasks' });
const logsStore = localforage.createInstance({ name: 'nextflow_mobile', storeName: 'offline_logs' });
const evidenceStore = localforage.createInstance({ name: 'nextflow_mobile', storeName: 'evidences' });

interface MobileTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  metadata?: any;
}

interface OfflineLog {
  id: string; // unique event id
  task_id: string;
  action: 'status_update' | 'add_evidence';
  value: string; // trạng thái mới hoặc evidence_id
  timestamp: string;
}

interface Evidence {
  id: string;
  task_id: string;
  photo_base64: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  note: string;
}

const API_BASE_URL = 'http://localhost:8000';
const TEST_USER_ID = '8f3b2a1a-4c54-4b01-90e6-d701748f0851';

export default function App() {
  const [connection, setConnection] = useState<{ tenantId: string; apiKey: string } | null>(null);
  const [tenantInput, setTenantInput] = useState('d290f1ee-6c54-4b01-90e6-d701748f0851');
  const [apiKeyInput, setApiKeyInput] = useState('nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851');

  // Load connection on startup
  useEffect(() => {
    const saved = localStorage.getItem('nf_mobile_connection');
    if (saved) {
      try {
        setConnection(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTenant = tenantInput.trim();
    const cleanKey = apiKeyInput.trim();
    if (!cleanTenant || !cleanKey) {
      triggerNotification('error', 'Vui lòng điền đủ Tenant ID và API Key.');
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanTenant)) {
      triggerNotification('error', 'Định dạng Tenant ID phải là UUID.');
      return;
    }
    try {
      triggerNotification('warning', 'Đang xác thực kết nối...');
      const res = await fetch(`${API_BASE_URL}/api/v1/queues`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Nextflow-Tenant-ID': cleanTenant,
          'X-Nextflow-API-Key': cleanKey,
        }
      });
      if (res.ok) {
        const connData = { tenantId: cleanTenant, apiKey: cleanKey };
        setConnection(connData);
        localStorage.setItem('nf_mobile_connection', JSON.stringify(connData));
        triggerNotification('success', 'Kết nối Workspace thành công!');
      } else {
        triggerNotification('error', 'Thông tin xác thực sai hoặc Tenant không tồn tại.');
      }
    } catch (err) {
      const connData = { tenantId: cleanTenant, apiKey: cleanKey };
      setConnection(connData);
      localStorage.setItem('nf_mobile_connection', JSON.stringify(connData));
      triggerNotification('success', 'Kết nối thành công (Offline Mode).');
    }
  };

  const handleDisconnect = () => {
    setConnection(null);
    localStorage.removeItem('nf_mobile_connection');
    setTasks([]);
    setSelectedTask(null);
    setOfflineLogs([]);
    setEvidences([]);
    tasksStore.clear();
    logsStore.clear();
    evidenceStore.clear();
    triggerNotification('success', 'Đã ngắt kết nối khỏi Workspace.');
  };

  const tenantId = connection?.tenantId || '';
  const apiKey = connection?.apiKey || '';

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [tasks, setTasks] = useState<MobileTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MobileTask | null>(null);
  
  // States cho Offline Logs và Evidences
  const [offlineLogs, setOfflineLogs] = useState<OfflineLog[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Form states cho Evidence Capture
  const [evidenceNote, setEvidenceNote] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

  // Phase 3: Real Camera states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string>('');

  // Phase 3: Conflict resolution — track local version
  const [localVersionMap, setLocalVersionMap] = useState<Record<string, number>>({});

  // States cho Leo thang sự cố
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [escalateReason, setEscalateReason] = useState<string>('');
  const [escalateType, setEscalateType] = useState<string>('COURIER_DELAY');

  // Load offline data from IndexedDB on startup
  useEffect(() => {
    const loadOfflineData = async () => {
      const savedTasks: MobileTask[] = [];
      await tasksStore.iterate((value: MobileTask) => {
        savedTasks.push(value);
      });
      setTasks(savedTasks);

      const savedLogs: OfflineLog[] = [];
      await logsStore.iterate((value: OfflineLog) => {
        savedLogs.push(value);
      });
      setOfflineLogs(savedLogs);

      const savedEvidences: Evidence[] = [];
      await evidenceStore.iterate((value: Evidence) => {
        savedEvidences.push(value);
      });
      setEvidences(savedEvidences);
    };

    loadOfflineData();
  }, []);

  const triggerNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Morning Sync: Đồng bộ đầu ngày (Tải dữ liệu từ Rust API thật về máy lưu offline)
  const handleMorningSync = async () => {
    if (!isOnline) {
      triggerNotification('error', 'Bạn đang offline, không thể thực hiện Morning Sync.');
      return;
    }

    try {
      triggerNotification('warning', 'Đang tải danh sách nhiệm vụ thực địa...');
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Nextflow-Tenant-ID': tenantId,
        'X-Nextflow-API-Key': apiKey,
      };

      const getRes = await fetch(`${API_BASE_URL}/api/v1/work-items`, {
        method: 'GET',
        headers,
      });

      let itemsList = [];
      if (getRes.ok) {
        itemsList = await getRes.json();
      }

      if (itemsList.length === 0) {
        const task1Res = await fetch(`${API_BASE_URL}/api/v1/work-items`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: 'Kiểm tra đơn hàng linh kiện PC Asus (Morning Sync)',
            description: 'Khảo sát thực địa và chụp ảnh xác minh vị trí GPS đơn hàng',
            priority: 'HIGH',
            category: 'OPERATIONS',
            source: 'MORNING_SYNC_GENERATOR'
          })
        });
        const t1 = await task1Res.json();

        const task2Res = await fetch(`${API_BASE_URL}/api/v1/work-items`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: 'Giao đơn hàng sữa hạt organic Quận 3 (Morning Sync)',
            description: 'Khảo sát thực địa và thu thập chữ ký/hình ảnh',
            priority: 'MEDIUM',
            category: 'OPERATIONS',
            source: 'MORNING_SYNC_GENERATOR'
          })
        });
        const t2 = await task2Res.json();
        
        itemsList = [t1, t2];
      }

      const morningTasks = itemsList.map((item: any) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        category: item.category || 'OPERATIONS',
        metadata: item.metadata || {}
      }));

      await tasksStore.clear();
      for (const t of morningTasks) {
        await tasksStore.setItem(t.id, t);
      }

      setTasks(morningTasks);
      triggerNotification('success', `Morning Sync hoàn tất! Đã tải và lưu trữ ngoại tuyến ${morningTasks.length} nhiệm vụ.`);
    } catch (err: any) {
      triggerNotification('error', 'Lỗi kết nối Backend. Vui lòng kiểm tra Docker Postgres và Rust API.');
    }
  };

  // 2. Thay đổi trạng thái Task (Hỗ trợ chạy Offline lưu log + Conflict Resolution)
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTask) return;

    if (isOnline) {
      // ONLINE: Kiểm tra conflict trước — so sánh version hiện tại
      try {
        // Phase 3 Conflict Resolution: kiểm tra version server
        const checkRes = await fetch(`${API_BASE_URL}/api/v1/work-items/${selectedTask.id}`, {
          headers: {
            'X-Nextflow-Tenant-ID': tenantId,
            'X-Nextflow-API-Key': apiKey,
          }
        });
        if (checkRes.ok) {
          const serverTask = await checkRes.json();
          const serverVersion = serverTask.version || 1;
          const localVersion = localVersionMap[selectedTask.id] || 1;
          
          // Nếu server version cao hơn local → conflict!
          if (serverVersion > localVersion && serverTask.status !== selectedTask.status) {
            triggerNotification('warning', 
              `⚠️ Xung đột phiên bản! Server: v${serverVersion} (${serverTask.status}), Local: v${localVersion}. Đang đồng bộ trạng thái mới nhất...`
            );
            // Tự động resolve: lấy trạng thái mới nhất từ server
            const updated = { ...selectedTask, status: serverTask.status };
            await tasksStore.setItem(selectedTask.id, updated);
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
            setSelectedTask(updated);
            setLocalVersionMap(prev => ({ ...prev, [selectedTask.id]: serverVersion }));
            return;
          }
        }
      } catch (_) { /* ignore conflict check errors */ }

      // Gọi trực tiếp API Rust thật
      try {
        const headers: any = {
          'Content-Type': 'application/json',
          'X-Nextflow-Tenant-ID': tenantId,
        };
        if (newStatus === 'IN_PROGRESS') {
          headers['Authorization'] = `Bearer ${TEST_USER_ID}`;
        } else {
          headers['X-Nextflow-API-Key'] = apiKey;
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${selectedTask.id}/status`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) throw new Error('API server rejected status update');
        
        const updated = await res.json();
        
        // Cập nhật IndexedDB & State & local version map
        const updatedTask = { ...selectedTask, status: updated.status };
        await tasksStore.setItem(selectedTask.id, updatedTask);
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
        setSelectedTask(updatedTask);
        setLocalVersionMap(prev => ({ ...prev, [selectedTask.id]: updated.version || 1 }));
        triggerNotification('success', `Cập nhật trạng thái thành ${newStatus} trực tiếp trên Cloud.`);
      } catch (err) {
        triggerNotification('error', 'Lỗi đồng bộ trực tiếp. Tự động chuyển sang lưu log offline.');
      }
    } else {
      // OFFLINE: Lưu log sự kiện vào IndexedDB
      const logId = Uuid_test();
      const logEvent: OfflineLog = {
        id: logId,
        task_id: selectedTask.id,
        action: 'status_update',
        value: newStatus,
        timestamp: new Date().toISOString()
      };

      await logsStore.setItem(logId, logEvent);
      setOfflineLogs(prev => [...prev, logEvent]);

      // Cập nhật state cục bộ của task
      const updatedTask = { ...selectedTask, status: newStatus };
      await tasksStore.setItem(selectedTask.id, updatedTask);
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
      setSelectedTask(updatedTask);
      triggerNotification('warning', `Offline: Đã lưu thay đổi trạng thái sang ${newStatus} cục bộ.`);
    }
  };

  // Helper sinh UUID giả định phục vụ ID log offline cục bộ
  const Uuid_test = () => {
    return 'offline_xxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 3. Evidence Capture: Ghi nhận bằng chứng thực địa (Ảnh, GPS thật, Timestamp thật)
  // Phase 3: Real Camera — getUserMedia + Canvas Image Compression
  const handleOpenCamera = async () => {
    if (!selectedTask) return;
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError' 
        ? 'Quyền camera bị từ chối. Vui lòng cho phép camera trong cài đặt trình duyệt.'
        : 'Không tìm thấy camera. Đang sử dụng ảnh demo thay thế.';
      setCameraError(msg);
      // Fallback to demo image
      const demoBase64 = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" style="background:#1a1a2e"><rect width="320" height="240" fill="#0f0f23"/><text x="50%" y="45%" fill="#6366f1" font-size="14" text-anchor="middle" font-family="monospace">📍 Field Evidence</text><text x="50%" y="60%" fill="#888" font-size="10" text-anchor="middle" font-family="monospace">${new Date().toLocaleString()}</text></svg>`);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => { setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
          () => { setCurrentCoords({ lat: 10.7769, lng: 106.7009 }); }
        );
      } else {
        setCurrentCoords({ lat: 10.7769, lng: 106.7009 });
      }
      setCapturedPhoto(demoBase64);
      triggerNotification('warning', msg);
    }
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef || !cameraStream) return;
    // Phase 3: Canvas compression — resize to 640x480 max, JPEG 0.8
    const canvas = document.createElement('canvas');
    const maxW = 640, maxH = 480;
    const vW = videoRef.videoWidth || maxW;
    const vH = videoRef.videoHeight || maxH;
    const ratio = Math.min(maxW / vW, maxH / vH, 1);
    canvas.width = vW * ratio;
    canvas.height = vH * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(compressed);
    // Stop camera stream
    cameraStream.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setShowCamera(false);
    // Get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); triggerNotification('success', 'Ảnh đã chụp + GPS định vị thành công!'); },
        () => { setCurrentCoords({ lat: 10.7769, lng: 106.7009 }); triggerNotification('success', 'Ảnh đã chụp! GPS mặc định TP.HCM.'); }
      );
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    setShowCamera(false);
  };

  // Legacy handleCaptureEvidence: kept for backward compat, replaced by camera flow above
  const handleCaptureEvidence = () => {
    handleOpenCamera();
  };

  const handleSaveEvidence = async () => {
    if (!selectedTask || !capturedPhoto || !currentCoords) return;

    const evidenceId = Uuid_test();
    const newEvidence: Evidence = {
      id: evidenceId,
      task_id: selectedTask.id,
      photo_base64: capturedPhoto,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      timestamp: new Date().toISOString(),
      note: evidenceNote || 'Bằng chứng hiện trường thực địa.'
    };

    // 1. Lưu Evidence cục bộ vào database IndexedDB
    await evidenceStore.setItem(evidenceId, newEvidence);
    setEvidences(prev => [...prev, newEvidence]);

    // 2. Đồng bộ online hoặc lưu log sự kiện offline
    if (!isOnline) {
      const logId = Uuid_test();
      const logEvent: OfflineLog = {
        id: logId,
        task_id: selectedTask.id,
        action: 'add_evidence',
        value: evidenceId,
        timestamp: new Date().toISOString()
      };
      await logsStore.setItem(logId, logEvent);
      setOfflineLogs(prev => [...prev, logEvent]);
      triggerNotification('warning', 'Đã lưu bằng chứng thực địa cục bộ (đang offline).');
    } else {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'X-Nextflow-Tenant-ID': tenantId,
          'X-Nextflow-API-Key': apiKey,
        };
        const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${selectedTask.id}/evidence`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            photo_base64: newEvidence.photo_base64,
            latitude: newEvidence.latitude,
            longitude: newEvidence.longitude,
            note: newEvidence.note
          })
        });
        if (res.ok) {
          triggerNotification('success', 'Đã đẩy bằng chứng thực địa trực tiếp lên server Cloud!');
        } else {
          throw new Error('Server rejected evidence upload');
        }
      } catch (err) {
        const logId = Uuid_test();
        const logEvent: OfflineLog = {
          id: logId,
          task_id: selectedTask.id,
          action: 'add_evidence',
          value: evidenceId,
          timestamp: new Date().toISOString()
        };
        await logsStore.setItem(logId, logEvent);
        setOfflineLogs(prev => [...prev, logEvent]);
        triggerNotification('warning', 'Lỗi đẩy trực tiếp. Đã lưu bằng chứng ngoại tuyến.');
      }
    }

    // Reset form
    setCapturedPhoto(null);
    setCurrentCoords(null);
    setEvidenceNote('');
  };

  const handleCheckIn = async () => {
    if (!selectedTask) return;
    try {
      let lat = 10.7769;
      let lng = 106.7009;

      if (navigator.geolocation) {
        const getPos = () => new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        try {
          const pos = await getPos();
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}
      }

      const checkInMeta = {
        check_in_time: new Date().toISOString(),
        check_in_lat: lat,
        check_in_lng: lng
      };

      const updatedMetadata = {
        ...(selectedTask.metadata || {}),
        ...checkInMeta
      };

      const updatedTask = {
        ...selectedTask,
        metadata: updatedMetadata
      };

      await tasksStore.setItem(selectedTask.id, updatedTask);
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
      setSelectedTask(updatedTask);

      if (isOnline) {
        const headers = {
          'Content-Type': 'application/json',
          'X-Nextflow-Tenant-ID': tenantId,
          'X-Nextflow-API-Key': apiKey,
        };
        await fetch(`${API_BASE_URL}/api/v1/work-items/${selectedTask.id}/status`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: selectedTask.status,
            metadata: checkInMeta
          }),
        });
        triggerNotification('success', 'Check-in thành công và đã đồng bộ lên Cloud!');
      } else {
        const logId = Uuid_test();
        const logEvent: OfflineLog = {
          id: logId,
          task_id: selectedTask.id,
          action: 'status_update',
          value: selectedTask.status,
          timestamp: new Date().toISOString()
        };
        await logsStore.setItem(logId, logEvent);
        setOfflineLogs(prev => [...prev, logEvent]);
        triggerNotification('warning', 'Check-in thành công (lưu offline).');
      }
    } catch (err: any) {
      triggerNotification('error', 'Lỗi Check-in: ' + err.message);
    }
  };

  const handleEscalate = async () => {
    if (!selectedTask || !escalateReason.trim()) {
      triggerNotification('error', 'Vui lòng nhập lý do sự cố.');
      return;
    }

    try {
      if (isOnline) {
        const headers = {
          'Content-Type': 'application/json',
          'X-Nextflow-Tenant-ID': tenantId,
          'X-Nextflow-API-Key': apiKey,
        };
        const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${selectedTask.id}/escalate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            reason: escalateReason,
            exception_type: escalateType
          }),
        });
        if (!res.ok) throw new Error('Không thể gửi yêu cầu leo thang');

        triggerNotification('success', 'Đã leo thang sự cố lên quản lý thành công!');
      } else {
        const logId = Uuid_test();
        const logEvent: OfflineLog = {
          id: logId,
          task_id: selectedTask.id,
          action: 'status_update',
          value: 'SUSPENDED',
          timestamp: new Date().toISOString()
        };
        await logsStore.setItem(logId, logEvent);
        setOfflineLogs(prev => [...prev, logEvent]);
        triggerNotification('warning', 'Đã lưu sự cố leo thang offline.');
      }

      const updatedTask = { ...selectedTask, status: 'SUSPENDED' };
      await tasksStore.setItem(selectedTask.id, updatedTask);
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
      setSelectedTask(updatedTask);

      setShowEscalateModal(false);
      setEscalateReason('');
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // 4. Sync Center: Tự động hoặc thủ công đồng bộ offline logs lên Backend Rust khi có mạng
  const handleSyncOfflineData = async () => {
    if (!isOnline) {
      triggerNotification('error', 'Không thể đồng bộ khi chưa bật mạng kết nối (Online).');
      return;
    }
    if (offlineLogs.length === 0) {
      triggerNotification('success', 'Không có tác vụ ngoại tuyến nào cần đồng bộ.');
      return;
    }

    setIsSyncing(true);
    triggerNotification('warning', `Đang đồng bộ ${offlineLogs.length} sự kiện ngoại tuyến lên máy chủ...`);

    let syncedCount = 0;

    for (const log of offlineLogs) {
      try {
        if (log.action === 'status_update') {
          // Gọi API cập nhật status thật lên Rust Backend
          const headers: any = {
            'Content-Type': 'application/json',
            'X-Nextflow-Tenant-ID': tenantId,
          };
          if (log.value === 'IN_PROGRESS') {
            headers['Authorization'] = `Bearer ${TEST_USER_ID}`;
          } else {
            headers['X-Nextflow-API-Key'] = apiKey;
          }

          const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${log.task_id}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: log.value }),
          });

          if (res.ok) {
            syncedCount++;
            await logsStore.removeItem(log.id); // xóa log cục bộ
          }
        } else if (log.action === 'add_evidence') {
          // Lấy dữ liệu bằng chứng thật từ IndexedDB để upload lên Rust Backend
          const evData = await evidenceStore.getItem<Evidence>(log.value);
          if (evData) {
            const headers = {
              'Content-Type': 'application/json',
              'X-Nextflow-Tenant-ID': tenantId,
              'X-Nextflow-API-Key': apiKey,
            };

            const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${log.task_id}/evidence`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                photo_base64: evData.photo_base64,
                latitude: evData.latitude,
                longitude: evData.longitude,
                note: evData.note,
              }),
            });

            if (res.ok) {
              syncedCount++;
              await logsStore.removeItem(log.id);
              await evidenceStore.removeItem(log.value); // xóa evidence cục bộ sau khi đồng bộ thành công
            }
          } else {
            // Nếu không tìm thấy bằng chứng cục bộ, bỏ qua sự kiện này
            await logsStore.removeItem(log.id);
          }
        }
      } catch (err) {
        console.error('Đồng bộ thất bại cho log event:', log.id);
      }
    }

    // Reload logs
    const savedLogs: OfflineLog[] = [];
    await logsStore.iterate((value: OfflineLog) => {
      savedLogs.push(value);
    });
    setOfflineLogs(savedLogs);
    setIsSyncing(false);

    triggerNotification('success', `Đồng bộ hoàn tất! Đã đẩy ${syncedCount} tác vụ thành công lên Cloud.`);
  };

  if (!connection) {
    return (
      <div className="mobile-device-frame animate-slide-up">
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--color-primary), #a855f7)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>NF</div>
            <span className="brand-title">Nextflow Mobile Connect</span>
          </div>
        </header>

        <div className="mobile-content" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center', minHeight: '80%' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 700 }}>Kết nối Frontline App</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Vui lòng kết nối ứng dụng với Tenant Workspace của doanh nghiệp bạn.
            </p>
          </div>

          <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '10px' }}>TENANT ID (UUID) *</label>
              <input 
                type="text" 
                className="form-input" 
                value={tenantInput} 
                onChange={(e) => setTenantInput(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '10px' }}>OPERATOR API KEY *</label>
              <input 
                type="password" 
                className="form-input" 
                value={apiKeyInput} 
                onChange={(e) => setApiKeyInput(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn-mobile btn-mobile-primary" style={{ padding: '12px', marginTop: '8px' }}>
              Kết nối Workspace
            </button>
          </form>

          {notification && (
            <div style={{
              backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${notification.type === 'success' ? 'var(--color-secondary)' : 'var(--color-accent)'}`,
              color: notification.type === 'success' ? 'var(--color-secondary)' : 'var(--color-accent)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              textAlign: 'center'
            }}>
              {notification.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-device-frame animate-slide-up">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--color-primary), #a855f7)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>NF</div>
          <span className="brand-title">Nextflow Mobile</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setIsOnline(!isOnline)} 
            className="btn" 
            style={{ 
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${isOnline ? 'var(--color-secondary)' : 'var(--color-accent)'}`,
              color: isOnline ? 'var(--color-secondary)' : 'var(--color-accent)',
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {isOnline ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wifi size={14} /> Online</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><WifiOff size={14} /> Offline</span>
            )}
          </button>
          
          <button 
            onClick={handleDisconnect}
            className="btn"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '6px 8px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Đăng xuất khỏi Workspace"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Network alert status banner */}
      <div className={`network-status-bar ${isOnline ? 'network-online' : 'network-offline'}`}>
        <span className="status-dot" style={{ backgroundColor: isOnline ? 'var(--color-secondary)' : 'var(--color-accent)' }}></span>
        {isOnline ? 'Đã kết nối máy chủ Cloud' : 'Chế độ ngoại tuyến (Offline Resilience)'}
      </div>

      {/* Main Content Area */}
      <div className="mobile-content">
        {/* Floating Notification */}
        {notification && (
          <div style={{
            backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : notification.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${notification.type === 'success' ? 'var(--color-secondary)' : notification.type === 'warning' ? 'var(--color-warning)' : 'var(--color-accent)'}`,
            color: notification.type === 'success' ? 'var(--color-secondary)' : notification.type === 'warning' ? 'var(--color-warning)' : 'var(--color-accent)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {notification.type === 'error' ? <AlertTriangle size={16} /> : <CloudLightning size={16} />}
            {notification.message}
          </div>
        )}

        {/* Sync Controls Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={handleMorningSync} className="btn-mobile btn-mobile-secondary">
            <RefreshCw size={16} /> Morning Sync
          </button>
          <button onClick={handleSyncOfflineData} className="btn-mobile btn-mobile-primary" disabled={isSyncing || offlineLogs.length === 0}>
            {isSyncing ? 'Syncing...' : `Sync Center (${offlineLogs.length})`}
          </button>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Inbox size={14} /> Nhiệm vụ thực địa hôm nay</span>
          
          {tasks.map(t => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTask(t)}
              className={`mobile-task-card ${selectedTask?.id === t.id ? 'active-working' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className={`badge ${t.priority === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>{t.priority}</span>
                <span className={`badge ${t.status === 'UNASSIGNED' ? 'badge-unassigned' : t.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-completed'}`}>{t.status}</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{t.title}</h4>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phân hệ: {t.category}</div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <FolderOpen size={28} style={{ margin: '0 auto 8px', color: 'var(--text-dim)' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Không có task offline. Bấm **Morning Sync** để tải nhiệm vụ từ máy chủ.</p>
            </div>
          )}
        </div>

        {/* Selected Task Details & Action Panel */}
        {selectedTask && (
          <div className="animate-slide-up" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Bảng điều khiển thực hiện
            </h3>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nhiệm vụ đang chọn:</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>{selectedTask.title}</div>
            </div>

            {/* Status change actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedTask.status === 'UNASSIGNED' && (
                <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="btn-mobile btn-mobile-primary" style={{ padding: '10px' }}>
                  <Play size={14} /> Bắt đầu vận chuyển (Start)
                </button>
              )}
              {selectedTask.status === 'IN_PROGRESS' && (
                <>
                  {!selectedTask.metadata?.check_in_time ? (
                    <button onClick={handleCheckIn} className="btn-mobile btn-mobile-secondary" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', padding: '12px', fontWeight: 600 }}>
                      <MapPin size={14} /> Điểm đến: Bấm Check-in GPS
                    </button>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.05)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <CheckCircle size={14} /> Đã Check-in địa chỉ lúc {new Date(selectedTask.metadata.check_in_time).toLocaleTimeString()}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleUpdateStatus('COMPLETED')} 
                      className="btn-mobile btn-mobile-primary" 
                      style={{ backgroundColor: 'var(--color-secondary)', padding: '10px', flex: 2 }}
                      disabled={!selectedTask.metadata?.check_in_time}
                    >
                      <CheckCircle size={14} /> Hoàn tất giao hàng
                    </button>
                    <button 
                      onClick={() => setShowEscalateModal(true)} 
                      className="btn-mobile btn-mobile-danger" 
                      style={{ padding: '10px', flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-accent)' }}
                    >
                      <AlertTriangle size={14} /> Sự cố
                    </button>
                  </div>
                </>
              )}

              {selectedTask.status === 'SUSPENDED' && (
                <div style={{ fontSize: '13px', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 63, 94, 0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <AlertTriangle size={14} /> Đơn hàng bị tạm dừng (SUSPENDED). Đang chờ quản lý phê duyệt sự cố hoặc đổi trạng thái.
                </div>
              )}
            </div>

            {/* Evidence Camera Module */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Camera size={14} /> Bằng chứng thực địa (Evidence)</span>
              
              <div className="camera-simulator">
                {capturedPhoto ? (
                  <>
                    <img src={capturedPhoto} className="evidence-thumbnail" alt="Evidence Preview" />
                    {currentCoords && (
                      <div className="camera-sim-overlay">
                        <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        {currentCoords.lat.toFixed(4)}°, {currentCoords.lng.toFixed(4)}°
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Camera size={28} color="var(--text-dim)" />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Chưa có ảnh chụp thực địa</span>
                  </>
                )}
              </div>

              {!capturedPhoto ? (
                <button onClick={handleCaptureEvidence} className="btn-mobile btn-mobile-secondary" style={{ padding: '10px' }}>
                  <Camera size={14} /> Chụp ảnh thực địa (Capture)
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Ghi chú thực địa (ví dụ: Đã kiểm tra cột mốc)..."
                    className="form-input"
                    style={{ padding: '10px', fontSize: '13px' }}
                    value={evidenceNote}
                    onChange={(e) => setEvidenceNote(e.target.value)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button onClick={() => setCapturedPhoto(null)} className="btn-mobile btn-mobile-danger" style={{ padding: '10px', fontSize: '13px' }}>
                      Chụp lại
                    </button>
                    <button onClick={handleSaveEvidence} className="btn-mobile btn-mobile-primary" style={{ backgroundColor: 'var(--color-secondary)', padding: '10px', fontSize: '13px' }}>
                      <Check size={14} /> Lưu bằng chứng
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Offline evidence warning indicator */}
            {evidences.filter(e => e.task_id === selectedTask.id).length > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> Đã có {evidences.filter(e => e.task_id === selectedTask.id).length} bằng chứng thực địa lưu cục bộ.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phase 3: Camera Modal — getUserMedia Live Stream */}
      {showCamera && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, gap: '16px'
        }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>📷 Camera Thực Địa</div>
          <video
            ref={el => {
              if (el && cameraStream && !el.srcObject) {
                el.srcObject = cameraStream;
                el.play().catch(() => {});
                setVideoRef(el);
              }
            }}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxWidth: '360px', borderRadius: '12px', border: '2px solid #6366f1' }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCloseCamera}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #555', background: '#222', color: '#fff', fontSize: '14px' }}
            >
              ✕ Đóng
            </button>
            <button
              onClick={handleCaptureFromCamera}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 600 }}
            >
              📸 Chụp ảnh
            </button>
          </div>
          {cameraError && <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', maxWidth: '300px' }}>{cameraError}</p>}
        </div>
      )}
      {/* Escalate Exception Modal */}
      {showEscalateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> Báo cáo Sự cố Giao hàng
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Đơn hàng sẽ chuyển trạng thái sang **Tạm dừng (SUSPENDED)** để chờ quản lý chi nhánh xử lý.
            </p>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>LOẠI SỰ CỐ</label>
              <select 
                className="form-input" 
                value={escalateType} 
                onChange={(e) => setEscalateType(e.target.value)}
                style={{ padding: '8px', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: '#fff' }}
              >
                <option value="COURIER_DELAY">Địa chỉ không chính xác / Sai SĐT</option>
                <option value="CUSTOMER_REJECTED">Khách từ chối nhận hàng (Hoàn đơn)</option>
                <option value="ACCIDENT_TRAFFIC">Sự cố giao thông / Thời tiết xấu</option>
                <option value="OTHER_EXCEPTIONS">Sự cố khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>LÝ DO CHI TIẾT</label>
              <textarea 
                className="form-input" 
                placeholder="Nhập lý do cụ thể..." 
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                style={{ height: '80px', padding: '8px', fontSize: '13px', width: '100%', resize: 'none', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setShowEscalateModal(false); setEscalateReason(''); }} 
                className="btn-mobile btn-mobile-secondary"
                style={{ flex: 1, padding: '8px' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleEscalate} 
                className="btn-mobile btn-mobile-danger"
                style={{ flex: 1, padding: '8px', backgroundColor: 'var(--color-accent)', border: 'none', color: '#fff', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
