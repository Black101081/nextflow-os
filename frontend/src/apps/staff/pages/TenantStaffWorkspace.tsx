import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  Box, Workflow, Plus, X, Activity, MessageCircle, Flame, Search, 
  Brain, ShieldCheck, Zap, Bot, Database, CheckCircle2, Link2, Send, 
  FileText, Star, TrendingUp, Cpu, Calendar, Bell, BookOpen, Award, ClipboardList
} from 'lucide-react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { motion, AnimatePresence } from 'framer-motion';

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

// Particle Effect Component for DONE tasks
const ConfettiParticle = ({ delay = 0, color = '#10b981' }) => {
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{ 
        x: (Math.random() - 0.5) * 100, 
        y: (Math.random() - 0.5) * 100 - 50, 
        scale: Math.random() * 1.5,
        opacity: 0 
      }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: color, pointerEvents: 'none', zIndex: 10
      }}
    />
  );
};

export default function TenantStaffWorkspace() {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: '' };
  
  const [entities, setEntities] = useState<Entity[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entity' | 'workflow' | 'tasks' | 'schedule' | 'notifications' | 'reports' | 'kb' | 'performance'>('dashboard');
  const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDef | null>(null);
  
  const [entityData, setEntityData] = useState<any[]>([]);
  const [entitySchema, setEntitySchema] = useState<any>(null);
  const [entityMeta, setEntityMeta] = useState<{ entity_id: string, schema_version_id: string } | null>(null);
  const [workflowTasks, setWorkflowTasks] = useState<any[]>([]);

  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState([
    { day: 'Thứ Hai', date: '13/07', shift: 'Ca Sáng', time: '08:00 - 12:00', role: 'F&B Cashier', status: 'COMPLETED' },
    { day: 'Thứ Ba', date: '14/07', shift: 'Ca Chiều', time: '12:00 - 17:00', role: 'Front Desk', status: 'COMPLETED' },
    { day: 'Thứ Tư', date: '15/07', shift: 'Ca Sáng', time: '08:00 - 12:00', role: 'Tech Operator', status: 'ACTIVE' },
    { day: 'Thứ Năm', date: '16/07', shift: 'Ca Tối', time: '17:00 - 22:00', role: 'Tech Operator', status: 'SCHEDULED' },
    { day: 'Thứ Sáu', date: '17/07', shift: 'Ca Chiều', time: '12:00 - 17:00', role: 'Front Desk', status: 'SCHEDULED' },
    { day: 'Thứ Bảy', date: '18/07', shift: 'Nghỉ', time: '-', role: '-', status: 'OFF' },
    { day: 'Chủ Nhật', date: '19/07', shift: 'Ca Tối', time: '17:00 - 22:00', role: 'Tech Operator', status: 'SCHEDULED' }
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nhiệm vụ mới được phân công', content: 'Bạn đã được phân công nhiệm vụ #WORK-8842: Kiểm tra hạn sử dụng thuốc.', time: '10 phút trước', read: false, type: 'task' },
    { id: 2, title: 'Cảnh báo vi phạm SLA', content: 'Tác vụ #WORK-7412 đã quá hạn phản hồi ban đầu. Vui lòng cập nhật trạng thái.', time: '1 giờ trước', read: false, type: 'alert' },
    { id: 3, title: 'Thưởng hiệu suất', content: 'Chúc mừng! Bạn nhận được +100 XP từ hệ thống Gamification do hoàn thành tác vụ xuất sắc.', time: '3 giờ trước', read: true, type: 'xp' },
    { id: 4, title: 'Lịch trực được cập nhật', content: 'Lịch làm việc tuần sau của bạn đã được quản trị viên phê duyệt.', time: '1 ngày trước', read: true, type: 'schedule' }
  ]);
  
  // Daily Report Form State
  const [reportShift, setReportShift] = useState('Morning');
  const [reportTasks, setReportTasks] = useState('');
  const [reportPending, setReportPending] = useState('');
  const [reportIncidents, setReportIncidents] = useState('');
  
  // Knowledge Base State
  const [kbSearch, setKbSearch] = useState('');
  const [kbCategory, setKbCategory] = useState('ALL');
  const [selectedSop, setSelectedSop] = useState<any | null>(null);

  const sops = [
    {
      id: 'SOP-01',
      title: 'SOP-01: Quy trình đón tiếp khách hàng & check-in VIP',
      category: 'F&B',
      content: `1. MỤC ĐÍCH: Hướng dẫn nhân viên thực hiện đón tiếp khách hàng và làm thủ tục nhận phòng cho khách hàng VIP.
2. PHẠM VI: Áp dụng tại quầy lễ tân của toàn hệ thống.
3. QUY TRÌNH CHI TIẾT:
   - Bước 1: Khi khách hàng VIP tới cổng, nhân viên bảo vệ thông báo qua bộ đàm cho lễ tân và quản lý sảnh.
   - Bước 2: Lễ tân đứng dậy chào bằng tên khách hàng (nếu có thông tin trước), mỉm cười thân thiện và cúi chào 15 độ.
   - Bước 3: Mời khách hàng dùng nước welcome drink và khăn lạnh trong lúc làm thủ tục.
   - Bước 4: Kiểm tra thông tin đặt phòng trên hệ thống NextFlow OS. Xác nhận quyền lợi VIP (miễn phí trà chiều, coupon spa).
   - Bước 5: Hoàn tất ký nhận điện tử và trao chìa khóa phòng kèm thư chào mừng của Ban Giám Đốc.
   - Bước 6: Nhân viên hành lý (Bellman) dẫn khách lên phòng và giới thiệu các trang thiết bị trong phòng.`
    },
    {
      id: 'SOP-02',
      title: 'SOP-02: Kiểm tra chất lượng và vệ sinh an toàn thực phẩm',
      category: 'F&B',
      content: `1. MỤC ĐÍCH: Đảm bảo toàn bộ nguyên vật liệu đầu vào và thành phẩm đạt tiêu chuẩn vệ sinh an toàn thực phẩm.
2. PHẠM VI: Bộ phận bếp, kho và nhà hàng.
3. QUY TRÌNH CHI TIẾT:
   - Bước 1: Tiếp nhận nguyên vật liệu từ nhà cung cấp. Kiểm tra hạn sử dụng, nhiệt độ bảo quản của xe đông lạnh (phải dưới -18 độ C cho đồ đông lạnh, dưới 5 độ C cho đồ mát).
   - Bước 2: Phân loại hàng hóa và dán nhãn ghi ngày nhập kho, ngày hết hạn. Áp dụng nguyên tắc FIFO (Vào trước - Ra trước).
   - Bước 3: Nhân viên bếp rửa tay sát khuẩn đúng 6 bước của Bộ Y tế trước khi chế biến.
   - Bước 4: Sử dụng thớt và dao riêng biệt cho thực phẩm chín và thực phẩm sống để tránh nhiễm chéo.
   - Bước 5: Lưu mẫu thực phẩm 24 giờ trong tủ mẫu chuyên dụng.`
    },
    {
      id: 'SOP-03',
      title: 'SOP-03: Kịch bản xử lý phản hồi tiêu cực từ khách hàng',
      category: 'Vận hành',
      content: `1. MỤC ĐÍCH: Hướng dẫn nhân viên xoa dịu và giải quyết khiếu nại của khách hàng một cách chuyên nghiệp.
2. PHẠM VI: Toàn bộ nhân viên tiếp xúc khách hàng.
3. QUY TRÌNH CHI TIẾT:
   - Bước 1: Lắng nghe chủ động. Không ngắt lời khách hàng. Thể hiện sự đồng cảm bằng ánh mắt và cử chỉ gật đầu nhẹ.
   - Bước 2: Xin lỗi chân thành về trải nghiệm không tốt của khách hàng, ngay cả khi lỗi không thuộc về cá nhân nhân viên.
   - Bước 3: Xác minh sự việc nhanh chóng với các bộ phận liên quan mà không đùn đẩy trách nhiệm.
   - Bước 4: Đưa ra giải pháp khắc phục ngay lập tức (Ví dụ: đổi món ăn mới, đổi phòng nâng cấp miễn phí).
   - Bước 5: Tặng quà xin lỗi (trà, bánh hoặc giảm giá 10-20% hóa đơn hiện tại) và lưu thông tin khiếu nại vào hồ sơ khách hàng trên CRM.`
    },
    {
      id: 'SOP-04',
      title: 'SOP-04: Xử lý sự cố mất kết nối mạng và thanh toán POS',
      category: 'Vận hành',
      content: `1. MỤC ĐÍCH: Đảm bảo hoạt động thanh toán và dịch vụ không bị gián đoạn khi gặp sự cố kỹ thuật.
2. PHẠM VI: Bộ phận thu ngân, lễ tân và kỹ thuật CNTT.
3. QUY TRÌNH CHI TIẾT:
   - Bước 1: Khi máy POS hoặc mạng Internet mất kết nối, nhân viên lập tức chuyển sang sử dụng mạng 4G dự phòng của quầy.
   - Bước 2: Nếu mạng dự phòng cũng gặp sự cố, xin lỗi khách hàng và đề xuất thanh toán bằng tiền mặt hoặc chuyển khoản QR offline qua ngân hàng.
   - Bước 3: Sử dụng sổ ghi chép thủ công để lưu lại mã đơn hàng, số tiền và thông tin liên hệ của khách hàng.
   - Bước 4: Liên hệ ngay hotline kỹ thuật CNTT (nội bộ: 999) để yêu cầu khắc phục sự cố mạng.
   - Bước 5: Sau khi có mạng lại, nhập toàn bộ dữ liệu ghi thủ công vào hệ thống NextFlow OS để đồng bộ doanh thu.`
    }
  ];
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  
  // Gamification State — persisted to localStorage per user
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem(`staff_xp_${user?.id || 'default'}`);
    return saved ? Number(saved) : 1450;
  });
  const level = Math.floor(xp / 1000) + 1;
  const xpProgress = (xp % 1000) / 10;

  const addXp = (amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      localStorage.setItem(`staff_xp_${user?.id || 'default'}`, String(next));
      return next;
    });
  };
  
  // Toasts
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'ai' | 'blockchain' | 'xp' }[]>([]);

  const showToast = (message: string, type: 'success' | 'ai' | 'blockchain' | 'xp') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    fetchEntities();
    fetchWorkflows();
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const items = await apiService.getWorkItems(auth);
      const list = Array.isArray(items) ? items : Array.isArray(items?.work_items) ? items.work_items : [];
      const mappedItems = list.map((t: any) => ({
        id: t.id,
        title: t.title || `Nhiệm vụ #${t.id.slice(0, 4)}`,
        status: t.status === 'UNASSIGNED' ? 'TODO' : (t.status === 'COMPLETED' ? 'DONE' : 'IN_PROGRESS'),
        metadata: t.metadata || {}
      }));
      setAllTasks(mappedItems);
    } catch (err) {
      console.error(err);
      setAllTasks([]);
    }
  };

  const fetchEntities = async () => {
    try {
      const res = await apiService.getEntities(auth);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setEntities(list);
    } catch (err) {
      console.error(err);
      setEntities([]);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await apiService.getWorkflows(auth);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setWorkflows(list);
    } catch (err) {
      console.error(err);
      setWorkflows([]);
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
      const list = Array.isArray(items) ? items : Array.isArray(items?.work_items) ? items.work_items : [];
      const mappedItems = list.map((t: any) => ({
        id: t.id,
        title: t.title || `Nhiệm vụ #${t.id.slice(0, 4)}`,
        status: t.status === 'UNASSIGNED' ? 'TODO' : (t.status === 'COMPLETED' ? 'DONE' : 'IN_PROGRESS'),
        metadata: t.metadata || {}
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
      showToast(`Bản ghi ${activeEntity.name} được lưu an toàn với Blockchain Hash!`, 'blockchain');
      
      // Reward XP (persisted)
      addXp(50);
      showToast('+50 XP (Data Entry)', 'xp');

      loadEntityData(activeEntity); 
    } catch (err) {
      console.error('Failed to submit record', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] bg-[#050A0F] text-slate-300 font-['Outfit'] overflow-hidden relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ 
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)', 
        backgroundSize: '30px 30px' 
      }}></div>

      {/* Floating AI Orb */}
      <motion.div 
        animate={{ y: [0, -10, 0], boxShadow: ['0 0 20px rgba(167,139,250,0.4)', '0 0 40px rgba(167,139,250,0.8)', '0 0 20px rgba(167,139,250,0.4)'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center cursor-pointer z-50 border border-purple-300/50"
        onClick={() => setIsCommandPaletteOpen(true)}
      >
        <Brain size={28} color="#fff" />
      </motion.div>

      {/* Toast Notification System */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`backdrop-blur-xl border px-5 py-4 rounded-xl flex items-center gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${
                t.type === 'ai' ? 'bg-purple-900/40 border-purple-500/50' : 
                t.type === 'blockchain' ? 'bg-emerald-900/40 border-emerald-500/50' : 
                t.type === 'xp' ? 'bg-amber-900/40 border-amber-500/50' :
                'bg-blue-900/40 border-blue-500/50'
              }`}
            >
              {t.type === 'ai' && <Brain size={20} className="text-purple-400" />}
              {t.type === 'blockchain' && <ShieldCheck size={20} className="text-emerald-400" />}
              {t.type === 'success' && <Zap size={20} className="text-blue-400" />}
              {t.type === 'xp' && <Star size={20} className="text-amber-400" />}
              <span className="text-sm font-bold text-white">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sci-Fi Sidebar */}
      <div className="w-[280px] bg-[#0A101A]/80 backdrop-blur-2xl border-r border-blue-500/20 flex flex-col z-10 shadow-[5px_0_30px_rgba(0,0,0,0.3)]">
        <div className="p-6 border-b border-blue-500/20">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-xl group-hover:bg-blue-500/20 transition-all group-hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Activity size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white m-0 tracking-wide uppercase">Command Center</h2>
              <div className="text-[10px] text-blue-500/70 font-black tracking-widest mt-1">OPERATOR WORKSPACE</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar py-6">
          {/* Staff Space */}
          <div className="mb-8">
            <div className="px-6 pb-3 text-[10px] uppercase text-purple-500/50 font-black tracking-widest flex items-center gap-2">
              <Cpu size={12} /> Staff Operations
            </div>
            
            <div 
              onClick={() => { setActiveTab('tasks'); fetchAllTasks(); }}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                activeTab === 'tasks' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(168,85,247,0.1)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList size={16} className={activeTab === 'tasks' ? "text-purple-400" : "text-slate-500"} />
              <span className="text-sm font-bold tracking-wide">Task Board</span>
            </div>

            <div 
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                activeTab === 'schedule' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(168,85,247,0.1)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={16} className={activeTab === 'schedule' ? "text-purple-400" : "text-slate-500"} />
              <span className="text-sm font-bold tracking-wide">My Schedule</span>
            </div>

            <div 
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                activeTab === 'notifications' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(168,85,247,0.1)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Bell size={16} className={activeTab === 'notifications' ? "text-purple-400" : "text-slate-500"} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
                )}
              </div>
              <span className="text-sm font-bold tracking-wide">Notifications</span>
            </div>

            <div 
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                activeTab === 'reports' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(168,85,247,0.1)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={16} className={activeTab === 'reports' ? "text-purple-400" : "text-slate-500"} />
              <span className="text-sm font-bold tracking-wide">Daily Report</span>
            </div>

            <div 
              onClick={() => setActiveTab('kb')}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                activeTab === 'kb' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(168,85,247,0.1)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen size={16} className={activeTab === 'kb' ? "text-purple-400" : "text-slate-500"} />
              <span className="text-sm font-bold tracking-wide">Knowledge Base</span>
            </div>

            <div 
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                activeTab === 'performance' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(168,85,247,0.1)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award size={16} className={activeTab === 'performance' ? "text-purple-400" : "text-slate-500"} />
              <span className="text-sm font-bold tracking-wide">My Performance</span>
            </div>
          </div>

          {/* Workflows */}
          <div className="mb-8">
            <div className="px-6 pb-3 text-[10px] uppercase text-blue-500/50 font-black tracking-widest flex items-center gap-2">
              <Workflow size={12} /> Active Workflows
            </div>
            {workflows.map(w => (
              <div 
                key={w.id}
                onClick={() => loadWorkflowData(w)}
                className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                  activeWorkflow?.id === w.id 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(59,130,246,0.1)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeWorkflow?.id === w.id ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' : 'bg-slate-600'}`}></div>
                <span className="text-sm font-bold tracking-wide">{w.name}</span>
              </div>
            ))}
          </div>

          {/* Entities */}
          <div>
            <div className="px-6 pb-3 text-[10px] uppercase text-emerald-500/50 font-black tracking-widest flex items-center gap-2">
              <Database size={12} /> Data Streams
            </div>
            {entities.map(e => (
              <div 
                key={e.id}
                onClick={() => loadEntityData(e)}
                className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                  activeEntity?.id === e.id 
                    ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/20 to-transparent text-white shadow-[inset_10px_0_20px_rgba(16,185,129,0.1)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database size={16} className={activeEntity?.id === e.id ? "text-emerald-400" : "text-slate-500"} />
                <span className="text-sm font-bold tracking-wide">{e.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification Profile Footer */}
        <div className="p-5 border-t border-blue-500/20 bg-[#05080F]">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/50">
                {user?.name?.[0] || 'O'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#0A101A] text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/50 shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                Lv.{level}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-black text-white">{user?.name || 'Operator Agent'}</div>
              <div className="text-xs text-amber-500/80 font-bold flex items-center gap-1">
                <Star size={10} /> {xp} XP
              </div>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_#f59e0b]"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10 hide-scrollbar">
        
        {/* Top Search Bar */}
        <div className="flex justify-end mb-8">
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="bg-[#0B121C]/80 backdrop-blur-md border border-blue-500/30 px-4 py-2.5 rounded-xl text-xs text-blue-400/70 font-black tracking-widest flex items-center gap-3 cursor-pointer hover:border-blue-400 hover:text-blue-400 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] group"
          >
            <Search size={16} className="group-hover:animate-pulse" /> 
            <span>COMMAND PALETTE</span>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] ml-2">CTRL + K</span>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            {/* Personal Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">
                Chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.name || 'Operator'}</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' — '}Không gian làm việc được bảo vệ bởi Blockchain &amp; Tối ưu bằng AI.
              </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-blue-500/20 p-5 rounded-2xl hover:border-blue-500/40 transition-all group">
                <div className="text-[10px] text-blue-400/70 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Hoàn thành
                </div>
                <div className="text-3xl font-black text-white">
                  {workflowTasks.filter(t => t.status === 'DONE').length}
                </div>
                <div className="text-xs text-slate-500 mt-1">/ {workflowTasks.length} tác vụ</div>
              </div>

              <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-amber-500/20 p-5 rounded-2xl hover:border-amber-500/40 transition-all group">
                <div className="text-[10px] text-amber-400/70 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Star size={12} /> XP Tích lũy
                </div>
                <div className="text-3xl font-black text-white">{xp.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">Cấp {level} • Còn {1000 - (xp % 1000)} XP lên cấp</div>
              </div>

              <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-blue-500/20 p-5 rounded-2xl hover:border-blue-500/40 transition-all group">
                <div className="text-[10px] text-blue-400/70 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Activity size={12} className="animate-pulse" /> Đang xử lý
                </div>
                <div className="text-3xl font-black text-blue-400">
                  {workflowTasks.filter(t => t.status === 'IN_PROGRESS').length}
                </div>
                <div className="text-xs text-slate-500 mt-1">tác vụ đang chạy</div>
              </div>

              <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-2xl hover:border-emerald-500/40 transition-all group">
                <div className="text-[10px] text-emerald-400/70 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Database size={12} /> Data Streams
                </div>
                <div className="text-3xl font-black text-emerald-400">{entities.length}</div>
                <div className="text-xs text-slate-500 mt-1">thực thể kết nối</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Star size={14} /> Tiến độ lên cấp {level + 1}
                </span>
                <span className="text-xs text-slate-400 font-mono">{xp % 1000} / 1000 XP</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_#f59e0b] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Quick Start Actions */}
            <div className="mb-4">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Thao tác nhanh</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => workflows.length > 0 ? loadWorkflowData(workflows[0]) : null}
                  className="bg-[#0B121C]/60 backdrop-blur-xl border border-blue-500/30 p-5 rounded-2xl hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all group text-left"
                >
                  <div className="bg-blue-500/10 w-10 h-10 flex items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Zap size={22} className="text-blue-400" />
                  </div>
                  <h3 className="text-base font-black text-white mb-1 tracking-wide uppercase">Mở Workflow</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{workflows.length > 0 ? `${workflows[0].name}` : 'Chưa có workflow nào'}</p>
                </button>

                <button 
                  onClick={() => entities.length > 0 ? loadEntityData(entities[0]) : null}
                  className="bg-[#0B121C]/60 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-2xl hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all group text-left"
                >
                  <div className="bg-emerald-500/10 w-10 h-10 flex items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Database size={22} className="text-emerald-400" />
                  </div>
                  <h3 className="text-base font-black text-white mb-1 tracking-wide uppercase">Nhập Dữ liệu</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{entities.length > 0 ? `Entity: ${entities[0].name}` : 'Chưa có entity nào'}</p>
                </button>

                <button 
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="bg-[#0B121C]/60 backdrop-blur-xl border border-purple-500/30 p-5 rounded-2xl hover:border-purple-400 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)] hover:-translate-y-1 transition-all group text-left"
                >
                  <div className="bg-purple-500/10 w-10 h-10 flex items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Brain size={22} className="text-purple-400" />
                  </div>
                  <h3 className="text-base font-black text-white mb-1 tracking-wide uppercase">AI Copilot</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Hỏi AI, tìm tác vụ, thực thi lệnh nhanh (Ctrl+K)</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Data Stream (Entities) */}
        {activeTab === 'entity' && activeEntity && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-white m-0 flex items-center gap-3 tracking-widest uppercase">
                  {activeEntity.name}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    Live Data Stream
                  </span>
                  <span className="text-slate-400 text-sm">Synchronized Database Table</span>
                </div>
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/50 hover:border-emerald-500 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                <Plus size={16} /> NEW RECORD
              </button>
            </div>

            <div className="bg-[#0B121C]/80 backdrop-blur-xl rounded-2xl border border-emerald-500/20 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-500/5 border-b border-emerald-500/20">
                      <th className="p-5 text-emerald-500/70 text-xs font-black uppercase tracking-widest">Hash ID</th>
                      <th className="p-5 text-emerald-500/70 text-xs font-black uppercase tracking-widest">JSON Payload</th>
                      <th className="p-5 text-emerald-500/70 text-xs font-black uppercase tracking-widest">Status / Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entityData.map(record => (
                      <tr key={record.id} className="border-b border-slate-800 hover:bg-white/5 transition-colors group">
                        <td className="p-5 font-mono text-blue-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Link2 size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" /> {record.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="p-5">
                          <pre className="bg-[#05080F] p-3 rounded-lg m-0 text-xs text-emerald-300/80 border border-emerald-500/10 max-w-md overflow-x-auto font-mono">
                            {JSON.stringify(record.data, null, 2)}
                          </pre>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-2">
                            <span className="w-max flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                              <ShieldCheck size={12} /> SECURED
                            </span>
                            <span className="text-slate-500 text-xs font-mono">{new Date(record.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {entityData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-16 text-center text-slate-500 font-mono text-sm border-dashed border-t border-slate-800">
                          [ NO RECORDS DETECTED IN DATABASE ]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Entity Form Terminal */}
            <AnimatePresence>
              {isFormOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex justify-end">
                  <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-[600px] bg-[#0A101A] border-l border-emerald-500/30 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="p-6 border-b border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center">
                      <div>
                        <h3 className="m-0 text-xl font-black text-white uppercase tracking-widest">APPEND {activeEntity.name}</h3>
                        <div className="text-[10px] text-emerald-500/70 mt-1 flex items-center gap-2 tracking-widest font-mono">
                          <Bot size={12} className="text-emerald-400" /> AI AUTO-GENERATED SCHEMA
                        </div>
                      </div>
                      <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-8 overflow-y-auto flex-1">
                      {entitySchema ? (
                        <div className="bg-[#05080F] border border-emerald-500/20 p-6 rounded-xl text-white terminal-form shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                          <Form
                            schema={entitySchema}
                            validator={validator}
                            onSubmit={submitEntityRecord}
                            className="rjsf-form-cyber"
                          />
                        </div>
                      ) : (
                        <div className="text-emerald-500/70 text-center p-10 font-mono animate-pulse">FETCHING SCHEMA...</div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Workflow Kanban */}
        {activeTab === 'workflow' && activeWorkflow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-white m-0 flex items-center gap-3 tracking-widest uppercase">
                  {activeWorkflow.name}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    KANBAN CONSOLE
                  </span>
                  <p className="text-slate-400 text-sm font-medium">Phân luồng và xử lý tác vụ theo thời gian thực.</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  const title = window.prompt("Nhập nội dung tác vụ khẩn cấp:");
                  if (!title) return;
                  try {
                    await apiService.createWorkItem(auth, { title, priority: 'HIGH' });
                    showToast('Tác vụ khẩn cấp đã được ghi nhận.', 'success');
                    loadWorkflowData(activeWorkflow);
                  } catch (err: any) {
                    alert("Lỗi tạo tác vụ: " + err.message);
                  }
                }}
                className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/50 hover:border-rose-500 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
              >
                <Flame size={16} /> URGENT TICKET
              </button>
            </div>
            
            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start hide-scrollbar">
              {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                const isTodo = status === 'TODO';
                const isProgress = status === 'IN_PROGRESS';
                const isDone = status === 'DONE';
                
                const colColor = isTodo ? 'slate' : (isProgress ? 'blue' : 'emerald');
                const colHex = isTodo ? '#94a3b8' : (isProgress ? '#3b82f6' : '#10b981');
                const colTitle = isTodo ? 'QUEUE' : (isProgress ? 'PROCESSING' : 'VERIFIED');
                
                const tasks = workflowTasks.filter(t => t.status === status);

                return (
                  <div key={status} className={`min-w-[350px] flex-1 flex flex-col bg-[#0B121C]/80 backdrop-blur-xl rounded-2xl border border-${colColor}-500/20 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-h-full`}>
                    <div className={`bg-${colColor}-500/10 p-4 border-b-2 border-${colColor}-500/50 flex justify-between items-center`}>
                      <h3 className={`m-0 text-xs font-black text-${colColor}-400 tracking-widest uppercase flex items-center gap-2`}>
                        {isTodo && <Database size={14} />}
                        {isProgress && <Activity size={14} className="animate-pulse" />}
                        {isDone && <ShieldCheck size={14} />}
                        {colTitle}
                      </h3>
                      <div className={`bg-${colColor}-500 text-white px-2 py-0.5 rounded text-[10px] font-black`}>
                        {tasks.length}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto hide-scrollbar">
                      <AnimatePresence>
                      {tasks.map(t => (
                        <motion.div 
                          layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          key={t.id} 
                          onClick={() => setSelectedTask(t)}
                          className={`bg-[#05080F] p-5 rounded-xl border border-${colColor}-500/20 cursor-pointer relative group transition-all hover:-translate-y-1 hover:border-${colColor}-500/60 hover:shadow-[0_5px_20px_rgba(0,0,0,0.5),0_0_15px_${colHex}44]`}
                        >
                          {t.priority === 'HIGH' && (
                             <div className="absolute top-3 right-3 flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest">
                               <Flame size={10} className="animate-pulse" /> URGENT
                             </div>
                          )}
                          {isDone && (
                             <div className="absolute top-3 right-3 text-emerald-500">
                               <CheckCircle2 size={16} />
                             </div>
                          )}

                          <div className={`text-sm font-bold text-white mb-4 pr-${t.priority === 'HIGH' ? '16' : '6'} leading-relaxed`}>{t.title}</div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                            <span className="text-[10px] text-slate-500 font-mono">#{t.id.slice(0, 8)}</span>
                            <div className="flex gap-3">
                              {t.metadata?.ai_summary && <Brain size={14} className="text-purple-400" />}
                              {t.metadata?.comments?.length > 0 && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                                  <MessageCircle size={12} /> {t.metadata.comments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                      {tasks.length === 0 && (
                        <div className="p-8 text-center text-slate-600 text-xs font-mono border border-dashed border-slate-700 rounded-xl">
                          [ EMPTY ]
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Task Board */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-white m-0 flex items-center gap-3 tracking-widest uppercase">
                  Nhiệm vụ chung
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    TASK BOARD
                  </span>
                  <p className="text-slate-400 text-sm font-medium">Bảng công việc tổng hợp kéo thả và phân loại.</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  const title = window.prompt("Nhập nội dung tác vụ mới:");
                  if (!title) return;
                  try {
                    await apiService.createWorkItem(auth, { title, priority: 'HIGH' });
                    showToast('Tác vụ mới đã được ghi nhận.', 'success');
                    fetchAllTasks();
                  } catch (err: any) {
                    alert("Lỗi tạo tác vụ: " + err.message);
                  }
                }}
                className="bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/50 hover:border-purple-500 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <Plus size={16} /> NEW TICKET
              </button>
            </div>
            
            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start hide-scrollbar">
              {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                const isTodo = status === 'TODO';
                const isProgress = status === 'IN_PROGRESS';
                const isDone = status === 'DONE';
                
                const colColor = isTodo ? 'slate' : (isProgress ? 'blue' : 'emerald');
                const colHex = isTodo ? '#94a3b8' : (isProgress ? '#3b82f6' : '#10b981');
                const colTitle = isTodo ? 'QUEUE' : (isProgress ? 'PROCESSING' : 'VERIFIED');
                
                const tasks = allTasks.filter(t => t.status === status);

                return (
                  <div key={status} className={`min-w-[320px] flex-1 flex flex-col bg-[#0B121C]/80 backdrop-blur-xl rounded-2xl border border-${colColor}-500/20 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-h-[60vh]`}>
                    <div className={`bg-${colColor}-500/10 p-4 border-b-2 border-${colColor}-500/50 flex justify-between items-center`}>
                      <h3 className={`m-0 text-xs font-black text-${colColor}-400 tracking-widest uppercase flex items-center gap-2`}>
                        {isTodo && <Database size={14} />}
                        {isProgress && <Activity size={14} className="animate-pulse" />}
                        {isDone && <ShieldCheck size={14} />}
                        {colTitle}
                      </h3>
                      <div className={`bg-${colColor}-500 text-white px-2 py-0.5 rounded text-[10px] font-black`}>
                        {tasks.length}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto hide-scrollbar">
                      <AnimatePresence>
                      {tasks.map(t => (
                        <motion.div 
                          layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          key={t.id} 
                          onClick={() => setSelectedTask(t)}
                          className={`bg-[#05080F] p-5 rounded-xl border border-${colColor}-500/20 cursor-pointer relative group transition-all hover:-translate-y-1 hover:border-${colColor}-500/60 hover:shadow-[0_5px_20px_rgba(0,0,0,0.5),0_0_15px_${colHex}44]`}
                        >
                          {t.priority === 'HIGH' && (
                             <div className="absolute top-3 right-3 flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest">
                               <Flame size={10} className="animate-pulse" /> URGENT
                             </div>
                          )}
                          {isDone && (
                             <div className="absolute top-3 right-3 text-emerald-500">
                               <CheckCircle2 size={16} />
                             </div>
                          )}

                          <div className={`text-sm font-bold text-white mb-4 pr-${t.priority === 'HIGH' ? '16' : '6'} leading-relaxed`}>{t.title}</div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                            <span className="text-[10px] text-slate-500 font-mono">#{t.id.slice(0, 8)}</span>
                            <div className="flex gap-3">
                              {t.metadata?.ai_summary && <Brain size={14} className="text-purple-400" />}
                              {t.metadata?.comments?.length > 0 && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                                  <MessageCircle size={12} /> {t.metadata.comments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                      {tasks.length === 0 && (
                        <div className="p-8 text-center text-slate-600 text-xs font-mono border border-dashed border-slate-700 rounded-xl">
                          [ EMPTY ]
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* My Schedule */}
        {activeTab === 'schedule' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white m-0 tracking-widest uppercase">
                Lịch Làm Việc
              </h2>
              <p className="text-slate-400 text-sm mt-1">Quản lý ca trực, đề xuất đổi ca trực tuyến.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
              {schedules.map((s, idx) => (
                <div 
                  key={idx}
                  className={`backdrop-blur-md border rounded-2xl p-5 flex flex-col justify-between min-h-[160px] transition-all hover:scale-[1.02] ${
                    s.status === 'ACTIVE' 
                      ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                      : s.status === 'COMPLETED'
                      ? 'bg-[#0B121C]/40 border-slate-800 opacity-60'
                      : s.status === 'OFF'
                      ? 'bg-slate-900/20 border-dashed border-slate-800'
                      : 'bg-[#0B121C]/80 border-blue-500/10'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-slate-400">{s.day}</span>
                      <span className="text-xs font-mono text-slate-500">{s.date}</span>
                    </div>
                    <div className="text-lg font-black text-white mb-1">{s.shift}</div>
                    <div className="text-xs font-mono text-blue-400/80 mb-2">{s.time}</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{s.role}</div>
                    {s.status === 'ACTIVE' && (
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                        ON DUTY
                      </span>
                    )}
                    {s.status === 'COMPLETED' && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                        COMPLETED
                      </span>
                    )}
                    {s.status === 'SCHEDULED' && (
                      <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                        SCHEDULED
                      </span>
                    )}
                    {s.status === 'OFF' && (
                      <span className="bg-slate-800/40 text-slate-500 border border-slate-700/30 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                        OFF
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Shift Actions */}
            <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div>
                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-wide">Yêu Cầu Đổi Ca Trực</h3>
                <p className="text-sm text-slate-400">Bạn muốn xin nghỉ hoặc đổi ca làm việc với nhân viên khác?</p>
              </div>
              <button 
                onClick={() => {
                  const reason = window.prompt("Nhập lý do xin đổi ca & ca mong muốn:");
                  if (!reason) return;
                  showToast('Yêu cầu đổi ca của bạn đã được chuyển tới Leader phê duyệt.', 'success');
                  // Trigger notification
                  const newNotify = {
                    id: Date.now(),
                    title: 'Yêu cầu đổi ca được gửi',
                    content: `Bạn đã gửi yêu cầu đổi ca với lý do: "${reason}"`,
                    time: 'Vừa xong',
                    read: false,
                    type: 'schedule'
                  };
                  setNotifications(prev => [newNotify, ...prev]);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                GỬI YÊU CẦU ĐỔI CA
              </button>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-white m-0 tracking-widest uppercase">
                  Trung Tâm Thông Báo
                </h2>
                <p className="text-slate-400 text-sm mt-1">Thông tin cập nhật trạng thái tác vụ, hệ thống &amp; SLA.</p>
              </div>
              <button 
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  showToast('Đã đánh dấu tất cả thông báo là đã đọc.', 'success');
                }}
                className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest"
              >
                Đánh dấu đã đọc tất cả
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {notifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => {
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                    n.read 
                      ? 'bg-[#0B121C]/40 border-slate-800 opacity-70' 
                      : 'bg-[#0B121C] border-blue-500/20 hover:border-blue-500/40 shadow-[0_4px_15px_rgba(59,130,246,0.05)]'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${
                    n.type === 'alert' ? 'bg-rose-500/10 text-rose-400' :
                    n.type === 'xp' ? 'bg-amber-500/10 text-amber-400' :
                    n.type === 'schedule' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {n.type === 'alert' && <Flame size={18} />}
                    {n.type === 'xp' && <Star size={18} />}
                    {n.type === 'schedule' && <Calendar size={18} />}
                    {n.type === 'task' && <ClipboardList size={18} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
                        {n.title}
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed m-0">{n.content}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-16 text-center text-slate-500 font-mono text-sm border-dashed border border-slate-800 rounded-2xl">
                  [ KHÔNG CÓ THÔNG BÁO MỚI ]
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Daily Report */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white m-0 tracking-widest uppercase">
                Báo Cáo Ca Làm Việc
              </h2>
              <p className="text-slate-400 text-sm mt-1">Nộp báo cáo ngày ghi nhận trực tiếp lên Ledger Blockchain &amp; gửi cho Leader.</p>
            </div>

            <div className="bg-[#0B121C]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
              <div className="mb-6">
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Chọn ca trực</label>
                <select 
                  value={reportShift}
                  onChange={(e) => setReportShift(e.target.value)}
                  className="w-full p-3.5 bg-[#05080F] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 text-sm font-bold transition-all"
                >
                  <option value="Morning">Ca Sáng (08:00 - 12:00)</option>
                  <option value="Afternoon">Ca Chiều (12:00 - 17:00)</option>
                  <option value="Evening">Ca Tối (17:00 - 22:00)</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Công việc đã hoàn thành trong ca</label>
                <textarea 
                  rows={4}
                  value={reportTasks}
                  onChange={(e) => setReportTasks(e.target.value)}
                  placeholder="Ghi rõ các đầu việc đã xử lý thành công..."
                  className="w-full p-4 bg-[#05080F] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 text-xs font-medium transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Công việc bàn giao / Tồn đọng</label>
                <textarea 
                  rows={3}
                  value={reportPending}
                  onChange={(e) => setReportPending(e.target.value)}
                  placeholder="Các công việc cần lưu ý cho ca tiếp theo..."
                  className="w-full p-4 bg-[#05080F] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 text-xs font-medium transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Sự cố phát sinh (nếu có)</label>
                <textarea 
                  rows={2}
                  value={reportIncidents}
                  onChange={(e) => setReportIncidents(e.target.value)}
                  placeholder="Mô tả sự cố kỹ thuật, xung đột hoặc phát sinh..."
                  className="w-full p-4 bg-[#05080F] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 text-xs font-medium transition-all"
                />
              </div>

              <button 
                onClick={async () => {
                  if (!reportTasks.trim()) {
                    alert("Vui lòng điền nội dung công việc hoàn thành.");
                    return;
                  }
                  try {
                    const reportData = {
                      shift: reportShift,
                      completed_tasks: reportTasks,
                      pending_tasks: reportPending,
                      incidents: reportIncidents,
                      submitted_by: user?.name || user?.email,
                      timestamp: new Date().toISOString()
                    };

                    showToast('Đang ký nhận báo cáo trên Blockchain...', 'blockchain');
                    
                    const anchorRes = await apiService.anchorData(auth, { 
                      data: JSON.stringify(reportData), 
                      context: "DAILY_REPORT" 
                    });

                    showToast(`Đã neo báo cáo thành công! TX: ${anchorRes.tx_hash.substring(0, 10)}`, 'blockchain');
                    addXp(30);
                    showToast('+30 XP (Nộp Báo cáo Ngày)', 'xp');

                    // Prepend notification
                    const newNotify = {
                      id: Date.now(),
                      title: 'Báo cáo ca trực được gửi thành công',
                      content: `Báo cáo ca trực ${reportShift} đã được gửi cho Leader và mã hóa trên U2U Blockchain.`,
                      time: 'Vừa xong',
                      read: false,
                      type: 'task'
                    };
                    setNotifications(prev => [newNotify, ...prev]);

                    // Reset form
                    setReportTasks('');
                    setReportPending('');
                    setReportIncidents('');
                  } catch (err: any) {
                    alert("Lỗi khi nộp báo cáo: " + err.message);
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} /> GỬI BÁO CÁO &amp; NEO BLOCKCHAIN
              </button>
            </div>
          </motion.div>
        )}

        {/* Knowledge Base */}
        {activeTab === 'kb' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto flex flex-col h-full">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white m-0 tracking-widest uppercase">
                Cơ Sở Tri Thức (SOP Library)
              </h2>
              <p className="text-slate-400 text-sm mt-1">Quy trình vận hành tiêu chuẩn (SOP), hướng dẫn xử lý sự cố.</p>
            </div>

            {/* Filter Search Header */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 bg-[#0B121C]/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <Search size={16} className="text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm tài liệu SOP..."
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  className="bg-transparent border-none text-white text-sm outline-none w-full"
                />
              </div>

              <div className="flex gap-2">
                {['ALL', 'F&B', 'Vận hành'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setKbCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                      kbCategory === cat 
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' 
                        : 'bg-[#0B121C]/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of SOPs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sops.filter(s => {
                const matchSearch = s.title.toLowerCase().includes(kbSearch.toLowerCase()) || s.content.toLowerCase().includes(kbSearch.toLowerCase());
                const matchCat = kbCategory === 'ALL' || s.category === kbCategory;
                return matchSearch && matchCat;
              }).map(s => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedSop(s)}
                  className="bg-[#0B121C]/80 border border-slate-800 hover:border-blue-500/40 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                        {s.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{s.id}</span>
                    </div>
                    <h3 className="text-base font-black text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">{s.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">{s.content}</p>
                  </div>
                  <span className="text-xs text-blue-500/80 font-bold flex items-center gap-1">Đọc tài liệu →</span>
                </div>
              ))}
            </div>

            {/* SOP Detail Modal */}
            <AnimatePresence>
              {selectedSop && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex justify-end">
                  <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-[600px] bg-[#0A101A] border-l border-blue-500/20 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="p-6 border-b border-slate-800 bg-[#0B121C] flex justify-between items-center">
                      <div>
                        <h3 className="m-0 text-lg font-black text-white uppercase tracking-wider">{selectedSop.id}</h3>
                        <span className="text-[10px] text-blue-400 font-black tracking-widest mt-1 uppercase block">{selectedSop.category} SOP DOCUMENT</span>
                      </div>
                      <button onClick={() => setSelectedSop(null)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-8 overflow-y-auto flex-1">
                      <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wide leading-snug">{selectedSop.title}</h2>
                      <pre className="bg-[#05080F] p-6 rounded-xl text-xs text-slate-300 border border-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                        {selectedSop.content}
                      </pre>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* My Performance */}
        {activeTab === 'performance' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white m-0 tracking-widest uppercase">
                Chỉ Số Hiệu Suất (Gamification Profile)
              </h2>
              <p className="text-slate-400 text-sm mt-1">Đánh giá kết quả làm việc, điểm thưởng XP và bảng xếp hạng.</p>
            </div>

            {/* Top Score Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Level & XP card */}
              <div className="bg-[#0B121C]/80 border border-amber-500/20 p-6 rounded-2xl flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                <div>
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Star size={12} /> Cấp Độ &amp; Điểm thưởng
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white">Lv. {level}</span>
                    <span className="text-sm font-bold text-slate-400">{xp} XP</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-mono mb-2">
                    <span>Tiến độ lên cấp tiếp theo</span>
                    <span>{xp % 1000} / 1000 XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* SLA compliance */}
              <div className="bg-[#0B121C]/80 border border-blue-500/20 p-6 rounded-2xl flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                <div>
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Activity size={12} /> SLA Compliance Rate
                  </span>
                  <div className="text-5xl font-black text-white">98.4%</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">Cam kết chất lượng dịch vụ và phản hồi tác vụ đúng hạn.</p>
                </div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">RATING: OUTSTANDING</div>
              </div>

              {/* Tasks done */}
              <div className="bg-[#0B121C]/80 border border-emerald-500/20 p-6 rounded-2xl flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                <div>
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <CheckCircle2 size={12} /> Tác Vụ Hoàn Thành
                  </span>
                  <div className="text-5xl font-black text-white">24</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">Tổng số lượng ticket được giải quyết thành công.</p>
                </div>
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AVG TIME: 14 MINS</div>
              </div>
            </div>

            {/* Achievements & Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#0B121C]/80 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Huy Hiệu Đã Đạt Được</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4 items-center bg-[#05080F] p-4 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      🏆
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">SLA Master</div>
                      <div className="text-xs text-slate-500">Tỷ lệ xử lý đúng hạn đạt trên 95% liên tục 7 ngày.</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center bg-[#05080F] p-4 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                      🔗
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Blockchain Pioneer</div>
                      <div className="text-xs text-slate-500">Đã lưu trữ và neo bảo mật thành công 10+ giao dịch.</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center bg-[#05080F] p-4 rounded-xl border border-slate-800 opacity-40">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-bold">
                      ⚡
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-400">Speed Demon (Chưa đạt)</div>
                      <div className="text-xs text-slate-600">Hoàn thành tác vụ bất kỳ trong thời gian dưới 15 phút.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-[#0B121C]/80 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Bảng Xếp Hạng Operator</h3>
                <div className="flex flex-col gap-2 font-mono">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-white">
                    <span className="text-sm font-bold">1. Nguyen Van A (Bạn)</span>
                    <span className="text-xs font-bold text-amber-400">Lv. {level} • {xp} XP</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#05080F] border border-slate-800 text-slate-400">
                    <span className="text-sm">2. Tran Thi B</span>
                    <span className="text-xs">Lv. 4 • 3,800 XP</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#05080F] border border-slate-800 text-slate-400">
                    <span className="text-sm">3. Le Van C</span>
                    <span className="text-xs">Lv. 2 • 1,100 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Advanced Task Modal with Copilot */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-[#02040A]/90 backdrop-blur-md flex items-center justify-center z-[1000] p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0B121C] w-full max-w-5xl h-[85vh] rounded-2xl border border-blue-500/30 shadow-[0_25px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden relative"
            >
              {selectedTask.status === 'DONE' && (
                <>
                  {[...Array(15)].map((_, i) => <ConfettiParticle key={i} delay={Math.random() * 0.5} color={['#10b981', '#34d399', '#059669'][Math.floor(Math.random()*3)]} />)}
                </>
              )}

              {/* Header */}
              <div className="p-6 border-b border-blue-500/20 bg-[#05080F] flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-widest uppercase">TASK INSPECTOR</span>
                    {selectedTask.status === 'DONE' && (
                      <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-widest uppercase flex items-center gap-1">
                        <ShieldCheck size={12} /> VERIFIED ON U2U NETWORK
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white m-0 tracking-wide">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-1 overflow-hidden">
                
                {/* Left: Actions & Copilot */}
                <div className="w-[45%] border-r border-slate-800 p-8 overflow-y-auto bg-[#0A101A]">
                  <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={16} className="text-blue-400" /> Control Variables
                  </h4>
                  
                  <div className="bg-[#05080F] p-5 rounded-xl border border-slate-800 mb-8">
                    <div className="text-[10px] font-black text-blue-500/70 mb-2 uppercase tracking-widest">STATE TRANSITION</div>
                    <select 
                      value={selectedTask.status} 
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const apiStatus = newStatus === 'TODO' ? 'UNASSIGNED' : (newStatus === 'DONE' ? 'COMPLETED' : 'IN_PROGRESS');
                          await apiService.updateWorkItemStatus(auth, selectedTask.id, apiStatus, selectedTask.metadata);
                          const updated = { ...selectedTask, status: newStatus };
                          setSelectedTask(updated);
                          
                          if (newStatus === 'IN_PROGRESS') {
                            showToast('Automated SMS & Zalo ZNS dispatched to client.', 'success');
                          } else if (newStatus === 'DONE') {
                            try {
                              const anchorRes = await apiService.anchorData(auth, { data: selectedTask.id, context: "TASK_COMPLETED" });
                              showToast(`Smart Contract Secured. Hash: ${anchorRes.tx_hash.substring(0, 10)}`, 'blockchain');
                            } catch (e) {
                              console.error(e);
                            }
                            addXp(100);
                            showToast('+100 XP (Task Completed)', 'xp');
                          }
                          
                          if (activeWorkflow) {
                            loadWorkflowData(activeWorkflow);
                          }
                          fetchAllTasks();
                        } catch (err: any) {
                          console.error('Lỗi cập nhật trạng thái: ', err.message);
                        }
                      }}
                      className="w-full p-3 bg-[#0B121C] border border-blue-500/30 rounded-lg text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    >
                      <option value="TODO">QUEUE (Chờ xử lý)</option>
                      <option value="IN_PROGRESS">PROCESSING (Đang xử lý) 🚀</option>
                      <option value="DONE">VERIFIED (Hoàn thành) 🛡️</option>
                    </select>
                  </div>
                  
                  {/* AI Copilot Box */}
                  <div className="bg-gradient-to-b from-purple-900/20 to-transparent rounded-xl border border-purple-500/30 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                      <Brain size={20} className="text-purple-400" />
                      <span className="text-sm font-black text-purple-300 uppercase tracking-widest">AI COPILOT</span>
                    </div>
                    
                    <div className="relative z-10">
                      {selectedTask.metadata?.ai_summary ? (
                        <p className="text-sm text-purple-100/80 leading-relaxed m-0">{selectedTask.metadata.ai_summary}</p>
                      ) : (
                        <p className="text-sm text-slate-400 leading-relaxed m-0 font-mono">No AI analysis present. Request generation to scan logs and propose actions.</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        showToast('AI is analyzing task context...', 'ai');
                        setTimeout(() => {
                          const summary = "AI Phân tích: Khách hàng cần hỗ trợ gấp. Đề xuất: Chuyển sang PROCESSING, hệ thống sẽ tự báo Zalo. Nội dung phản hồi: 'Chúng tôi đang xử lý đơn của bạn.'";
                          const updatedMeta = { ...selectedTask.metadata, ai_summary: summary };
                          apiService.updateWorkItemStatus(auth, selectedTask.id, selectedTask.status === 'TODO' ? 'UNASSIGNED' : (selectedTask.status === 'DONE' ? 'COMPLETED' : 'IN_PROGRESS'), updatedMeta).then(() => {
                            setSelectedTask({ ...selectedTask, metadata: updatedMeta });
                            if (activeWorkflow) {
                              loadWorkflowData(activeWorkflow);
                            }
                            fetchAllTasks();
                            showToast('AI Analysis Complete.', 'ai');
                            addXp(10);
                            showToast('+10 XP (AI Utilization)', 'xp');
                          });
                        }, 1500);
                      }}
                      className="mt-6 w-full bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative z-10"
                    >
                      Initialize Analysis
                    </button>
                  </div>
                </div>

                {/* Right: Internal Chat Stream */}
                <div className="flex-1 flex flex-col bg-[#05080F]">
                  <div className="p-6 border-b border-slate-800">
                    <h4 className="m-0 text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                      <MessageCircle size={16} className="text-blue-400" /> Comms Stream
                    </h4>
                  </div>
                  
                  {/* Chat Log */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                    {((selectedTask.metadata?.comments) || []).map((c: any, idx: number) => {
                      const isMe = c.author === (user?.name || user?.email || 'Operator');
                      return (
                        <div key={idx} className={`max-w-[85%] flex flex-col ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase ${isMe ? 'text-blue-400' : 'text-purple-400'}`}>{c.author}</span>
                            <span className="text-[9px] font-mono text-slate-500">{new Date(c.timestamp).toLocaleTimeString('vi-VN')}</span>
                          </div>
                          <div className={`p-4 rounded-xl text-sm leading-relaxed border ${
                            isMe 
                              ? 'bg-blue-600/20 text-blue-50 border-blue-500/30 rounded-tr-sm' 
                              : 'bg-slate-800/50 text-slate-300 border-slate-700 rounded-tl-sm'
                          }`}>
                            {c.text}
                          </div>
                        </div>
                      )
                    })}
                    {(!selectedTask.metadata?.comments || selectedTask.metadata.comments.length === 0) && (
                      <div className="flex-1 flex items-center justify-center text-slate-600 text-xs font-mono">
                        [ COMMS STREAM EMPTY ]
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <div className="p-5 border-t border-slate-800 bg-[#0A101A]">
                    <div className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        placeholder="Transmit message..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') document.getElementById('send-comment-btn')?.click();
                        }}
                        className="flex-1 bg-[#05080F] border border-slate-700 focus:border-blue-500 text-white px-5 py-3.5 rounded-xl text-sm outline-none transition-colors font-medium shadow-inner"
                      />
                      <button 
                        id="send-comment-btn"
                        onClick={async () => {
                          if (!commentText.trim()) return;
                          const newComment = {
                            author: user?.name || user?.email || 'Operator',
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
                            if (activeWorkflow) {
                              loadWorkflowData(activeWorkflow);
                            }
                            fetchAllTasks();
                          } catch (err: any) {
                            alert("Lỗi thêm bình luận: " + err.message);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cybernetic Command Palette Spotlight */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 bg-[#02040A]/80 backdrop-blur-md z-[9999] flex justify-center pt-[15vh]" onClick={() => setIsCommandPaletteOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-[#0B121C] w-full max-w-2xl rounded-2xl border border-blue-500/40 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-[#05080F]">
                <Search size={24} className="text-blue-500" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Ask AI Copilot, search tasks, or execute commands..."
                  value={commandSearch}
                  onChange={e => setCommandSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white text-lg outline-none font-medium placeholder-slate-600"
                />
                <div className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-black">ESC</div>
              </div>
              
              <div className="p-2">
                <div className="px-4 py-2 text-[10px] font-black text-slate-500 tracking-widest uppercase">SUGGESTED ACTIONS</div>
                
                <div className="p-3 hover:bg-blue-500/10 rounded-xl cursor-pointer flex items-center gap-4 text-slate-300 transition-colors group">
                  <div className="bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500 text-blue-400 group-hover:text-white transition-colors">
                    <Brain size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Summarize my daily tasks</div>
                    <div className="text-xs text-slate-500">AI will analyze all assigned pending tickets</div>
                  </div>
                </div>

                <div className="p-3 hover:bg-emerald-500/10 rounded-xl cursor-pointer flex items-center gap-4 text-slate-300 transition-colors group">
                  <div className="bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white transition-colors">
                    <Database size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">New Data Record</div>
                    <div className="text-xs text-slate-500">Open rapid entry form for current active entity</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        /* Custom scrollbar for cyber look */
        .hide-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
        
        /* RJSF Custom Styling for Cyber Theme */
        .rjsf-form-cyber .form-group { margin-bottom: 20px; }
        .rjsf-form-cyber label { display: block; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #60a5fa; text-transform: uppercase; margin-bottom: 8px; }
        .rjsf-form-cyber input, .rjsf-form-cyber select, .rjsf-form-cyber textarea {
          width: 100%; padding: 12px; background: #0B121C; border: 1px solid #1e293b; border-radius: 8px; color: #fff; font-family: monospace; font-size: 14px; transition: all 0.2s; outline: none;
        }
        .rjsf-form-cyber input:focus, .rjsf-form-cyber select:focus, .rjsf-form-cyber textarea:focus { border-color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
        .rjsf-form-cyber button[type=submit] {
          background: #10b981; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(16,185,129,0.3);
        }
        .rjsf-form-cyber button[type=submit]:hover { background: #059669; box-shadow: 0 0 25px rgba(16,185,129,0.5); }
        .rjsf-form-cyber .btn-add { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
        .rjsf-form-cyber .btn-danger { background: rgba(244,63,94,0.1); color: #fb7185; border: 1px solid rgba(244,63,94,0.3); }
      `}</style>
    </div>
  );
}
