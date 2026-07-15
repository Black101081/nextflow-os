import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../shared/services/api";
import {
  Package, ShoppingBag, Coffee, Sparkles, GraduationCap, Building2,
  Briefcase, HardHat, Wrench, Truck, Factory, Pill, Hotel,
  AlertTriangle, CheckCircle2, Zap, BarChart2,
  Plus, RefreshCw, Loader2,
  Circle, Activity, Target, Inbox,
  Bell, Shield, Flame, X,
  AlertCircle
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface PackMeta {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  installed: boolean;
}

interface QueueItem {
  id: string;
  name: string;
  description: string;
  pending_count: number;
  sla_breach_count: number;
  avg_age_minutes: number;
  sla_target_seconds?: number;
}

interface WorkItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  due_at?: string;
}

interface PackStats {
  open_items: number;
  sla_breaches: number;
  completed_today: number;
  avg_resolution_minutes: number;
}

// ============================================================
// 12 Pack Metadata
// ============================================================
const PACK_METADATA: PackMeta[] = [
  { id: "tpl_retail_standard", name: "Retail Pro", category: "retail", icon: ShoppingBag, color: "#f97316", gradient: "from-orange-500/20 to-orange-600/5", installed: true },
  { id: "tpl_fnb_standard",    name: "F&B Standard", category: "fnb", icon: Coffee, color: "#10b981", gradient: "from-emerald-500/20 to-emerald-600/5", installed: true },
  { id: "tpl_spa_clinic",      name: "Spa & Clinic", category: "spa", icon: Sparkles, color: "#ec4899", gradient: "from-pink-500/20 to-pink-600/5", installed: true },
  { id: "tpl_edu_training",    name: "Edu & Training", category: "education", icon: GraduationCap, color: "#3b82f6", gradient: "from-blue-500/20 to-blue-600/5", installed: true },
  { id: "tpl_real_estate",     name: "Real Estate", category: "real_estate", icon: Building2, color: "#a855f7", gradient: "from-purple-500/20 to-purple-600/5", installed: true },
  { id: "tpl_professional_services", name: "Professional Svcs", category: "services", icon: Briefcase, color: "#6366f1", gradient: "from-indigo-500/20 to-indigo-600/5", installed: true },
  { id: "tpl_contractor",      name: "Contractor", category: "construction", icon: HardHat, color: "#f59e0b", gradient: "from-amber-500/20 to-amber-600/5", installed: true },
  { id: "tpl_auto_repair",     name: "Auto Repair", category: "automotive", icon: Wrench, color: "#14b8a6", gradient: "from-teal-500/20 to-teal-600/5", installed: true },
  { id: "tpl_logistics",       name: "Logistics", category: "logistics", icon: Truck, color: "#ef4444", gradient: "from-red-500/20 to-red-600/5", installed: true },
  { id: "tpl_manufacturing",   name: "Manufacturing", category: "manufacturing", icon: Factory, color: "#8b5cf6", gradient: "from-violet-500/20 to-violet-600/5", installed: true },
  { id: "tpl_pharmacy",        name: "Pharmacy", category: "healthcare", icon: Pill, color: "#06b6d4", gradient: "from-cyan-500/20 to-cyan-600/5", installed: true },
  { id: "tpl_hospitality",     name: "Hospitality", category: "hospitality", icon: Hotel, color: "#84cc16", gradient: "from-lime-500/20 to-lime-600/5", installed: true },
];

// ============================================================
// SLA Ring Component
// ============================================================
function SlaRing({ value, size = 48 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color}
        strokeWidth={6} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

// ============================================================
// Queue Card
// ============================================================
function QueueCard({ queue }: { queue: QueueItem }) {
  const slaHealth = queue.sla_breach_count === 0 ? 100 :
    Math.max(0, 100 - (queue.sla_breach_count / Math.max(queue.pending_count, 1)) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 hover:border-[#475569] transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{queue.name}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{queue.description}</p>
        </div>
        <div className="relative shrink-0">
          <SlaRing value={slaHealth} size={44} />
          <div className="absolute inset-0 flex items-center justify-center rotate-90">
            <span className="text-[9px] font-bold" style={{ color: slaHealth >= 90 ? "#10b981" : slaHealth >= 70 ? "#f59e0b" : "#ef4444" }}>
              {Math.round(slaHealth)}%
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0f172a] rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-slate-100">{queue.pending_count}</p>
          <p className="text-[10px] text-slate-500">Đang chờ</p>
        </div>
        <div className={`rounded-lg p-2 text-center ${queue.sla_breach_count > 0 ? "bg-red-500/10" : "bg-[#0f172a]"}`}>
          <p className={`text-lg font-bold ${queue.sla_breach_count > 0 ? "text-red-400" : "text-slate-100"}`}>{queue.sla_breach_count}</p>
          <p className="text-[10px] text-slate-500">Quá SLA</p>
        </div>
        <div className="bg-[#0f172a] rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-slate-100">{queue.avg_age_minutes}p</p>
          <p className="text-[10px] text-slate-500">TB xử lý</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// WorkItem Row
// ============================================================
function WorkItemRow({ item }: { item: WorkItem }) {
  const statusColor: Record<string, string> = {
    OPEN: "bg-blue-500/20 text-blue-400",
    IN_PROGRESS: "bg-amber-500/20 text-amber-400",
    COMPLETED: "bg-emerald-500/20 text-emerald-400",
    OVERDUE: "bg-red-500/20 text-red-400",
  };
  const statusLabel: Record<string, string> = {
    OPEN: "Mới", IN_PROGRESS: "Đang xử lý", COMPLETED: "Xong", OVERDUE: "Quá hạn"
  };
  const minutesAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 60000);
  const timeLabel = minutesAgo < 60 ? `${minutesAgo}p` : minutesAgo < 1440 ? `${Math.floor(minutesAgo/60)}h` : `${Math.floor(minutesAgo/1440)}d`;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer">
      {item.priority === "HIGH" && <Flame size={12} className="text-red-400 shrink-0" />}
      {item.priority === "MEDIUM" && <Activity size={12} className="text-amber-400 shrink-0" />}
      {item.priority === "LOW" && <Circle size={12} className="text-slate-600 shrink-0" />}
      <p className="flex-1 text-sm text-slate-300 truncate">{item.title}</p>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor[item.status] || "bg-slate-500/20 text-slate-400"}`}>
        {statusLabel[item.status] || item.status}
      </span>
      <span className="text-[10px] text-slate-600 shrink-0 w-8 text-right">{timeLabel}</span>
    </motion.div>
  );
}

// ============================================================
// Pack Detail Panel
// ============================================================
function PackDetailPanel({ pack, onClose }: { pack: PackMeta; onClose: () => void }) {
  const navigate = useNavigate();
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [stats, setStats] = useState<PackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"queues"|"items"|"workflows">("queues");
  const [workflows, setWorkflows] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [queuesRes, workItemsRes, wfRes] = await Promise.all([
        apiService.get(`/api/v1/queues?category=${pack.category}`),
        apiService.get(`/api/v1/work-items?category=${pack.category}&limit=20`),
        apiService.get(`/api/v1/meta/workflows?template_id=${pack.id}`).catch(() => ({ data: [] })),
      ]);
      const rawQueues = Array.isArray(queuesRes.data?.queues) ? queuesRes.data.queues : Array.isArray(queuesRes.data) ? queuesRes.data : [];
      const qs: QueueItem[] = rawQueues.map((q: any) => ({
        id: q.id, name: q.name, description: q.description || "",
        pending_count: q.pending_count ?? q.work_item_count ?? 0,
        sla_breach_count: q.sla_breach_count ?? 0,
        avg_age_minutes: Math.round(q.avg_age_minutes ?? 0),
      }));
      setQueues(qs);
      
      const rawItems = Array.isArray(workItemsRes.data?.work_items) ? workItemsRes.data.work_items : Array.isArray(workItemsRes.data) ? workItemsRes.data : [];
      const wis: WorkItem[] = rawItems;
      setWorkItems(wis);
      
      const rawWfs = Array.isArray(wfRes.data?.workflows) ? wfRes.data.workflows : Array.isArray(wfRes.data) ? wfRes.data : [];
      setWorkflows(rawWfs);
      setStats({
        open_items: qs.reduce((s, q) => s + q.pending_count, 0),
        sla_breaches: qs.reduce((s, q) => s + q.sla_breach_count, 0),
        completed_today: wis.filter(w => w.status === "COMPLETED").length,
        avg_resolution_minutes: qs.length ? Math.round(qs.reduce((s, q) => s + q.avg_age_minutes, 0) / qs.length) : 0,
      });
    } catch (err) {
      console.error("[PackHub]", err);
    } finally {
      setLoading(false);
    }
  }, [pack.category, pack.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const Icon = pack.icon;
  const tabs = [
    { key: "queues" as const, label: "Queues", count: queues.length },
    { key: "items" as const, label: "Work Items", count: workItems.length },
    { key: "workflows" as const, label: "Workflows", count: workflows.length },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
      className="h-full flex flex-col bg-[#0f172a] border-l border-[#334155]">
      {/* Header */}
      <div className={`p-5 border-b border-[#334155] bg-gradient-to-r ${pack.gradient}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${pack.color}22`, border: `1px solid ${pack.color}44` }}>
              <Icon size={20} style={{ color: pack.color }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{pack.name}</h2>
              <p className="text-xs text-slate-500 capitalize mb-1">{pack.category} pack</p>
              {pack.category !== "retail" && (
                <button onClick={() => navigate(
                  pack.category === "spa" ? "/leader/spa" :
                  pack.category === "automotive" ? "/leader/auto" :
                  pack.category === "fnb" ? "/leader/fnb" :
                  pack.category === "education" ? "/leader/edu" :
                  pack.category === "hospitality" ? "/leader/hosp" :
                  pack.category === "real_estate" ? "/leader/re" :
                  pack.category === "logistics" ? "/leader/log" :
                  pack.category === "healthcare" ? "/leader/phar" :
                  pack.category === "manufacturing" ? "/leader/mfg" :
                  pack.category === "construction" ? "/leader/const" :
                  "/leader/ps"
                )}
                  className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 transition-all hover:scale-[1.03]">
                  Mở ứng dụng chuyên biệt &rarr;
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-[#334155] text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw size={14} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#334155] text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Đang xử lý", value: stats.open_items, color: "#3b82f6" },
              { label: "Quá SLA", value: stats.sla_breaches, color: stats.sla_breaches > 0 ? "#ef4444" : "#10b981" },
              { label: "Xong hôm nay", value: stats.completed_today, color: "#10b981" },
              { label: "TB xử lý", value: `${stats.avg_resolution_minutes}p`, color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f172a]/60 rounded-lg p-2 text-center">
                <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#334155] px-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`text-xs font-medium py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === t.key ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? "bg-indigo-500/20 text-indigo-400" : "bg-[#334155] text-slate-500"
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "queues" && (
              <motion.div key="queues" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {queues.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Chưa có queue nào cho pack này</p>
                    <p className="text-xs mt-1 text-slate-600">Cài đặt pack từ App Store để bắt đầu</p>
                  </div>
                ) : queues.map(q => <QueueCard key={q.id} queue={q} />)}
              </motion.div>
            )}
            {activeTab === "items" && (
              <motion.div key="items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-0.5">
                {workItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Không có work item nào</p>
                  </div>
                ) : workItems.map(w => <WorkItemRow key={w.id} item={w} />)}
              </motion.div>
            )}
            {activeTab === "workflows" && (
              <motion.div key="workflows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {workflows.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Zap size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Chưa có workflow nào</p>
                    <p className="text-xs mt-1 text-slate-600">Tạo từ trang Automation Workflows</p>
                  </div>
                ) : workflows.map(wf => (
                  <div key={wf.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${pack.color}22` }}>
                      <Zap size={14} style={{ color: pack.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{wf.name}</p>
                      <p className="text-xs text-slate-500">Trigger: {wf.trigger_event || "Scheduled"}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${wf.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                      {wf.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#334155] flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm rounded-lg hover:bg-indigo-500/20 transition-colors">
          <Plus size={15} /> Thêm Work Item
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e293b] border border-[#334155] text-slate-400 text-sm rounded-lg hover:bg-[#334155] transition-colors">
          <BarChart2 size={15} /> Báo cáo
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// Pack Card (Grid)
// ============================================================
function PackCard({ pack, isSelected, onSelect }: { pack: PackMeta; isSelected: boolean; onSelect: () => void }) {
  const [summary, setSummary] = useState<{ pending: number; breaches: number } | null>(null);
  useEffect(() => {
    if (!pack.installed) return;
    apiService.get(`/api/v1/queues?category=${pack.category}`)
      .then(res => {
        const qs = Array.isArray(res.data?.queues) ? res.data.queues : Array.isArray(res.data) ? res.data : [];
        setSummary({
          pending: qs.reduce((s: number, q: any) => s + (q.pending_count ?? q.work_item_count ?? 0), 0),
          breaches: qs.reduce((s: number, q: any) => s + (q.sla_breach_count ?? 0), 0),
        });
      }).catch(() => setSummary({ pending: 0, breaches: 0 }));
  }, [pack.installed, pack.category]);
  const Icon = pack.icon;
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onSelect}
      className={`relative w-full text-left rounded-2xl p-4 border transition-all duration-200 ${
        isSelected ? "border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]" :
        pack.installed ? "border-[#334155] bg-[#1e293b] hover:border-[#475569]" :
        "border-[#1e293b] bg-[#0f172a]/60 opacity-60 hover:opacity-80"
      }`}>
      {pack.installed && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${pack.color}22`, border: `1px solid ${pack.color}40` }}>
          <Icon size={18} style={{ color: pack.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{pack.name}</p>
          <p className="text-[10px] text-slate-500 capitalize">{pack.category}</p>
        </div>
      </div>
      {pack.installed && summary ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0f172a] rounded-lg p-2 text-center">
            <p className="text-base font-bold text-slate-100">{summary.pending}</p>
            <p className="text-[10px] text-slate-500">Đang xử lý</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${summary.breaches > 0 ? "bg-red-500/10" : "bg-[#0f172a]"}`}>
            <p className={`text-base font-bold ${summary.breaches > 0 ? "text-red-400" : "text-slate-100"}`}>{summary.breaches}</p>
            <p className="text-[10px] text-slate-500">Quá SLA</p>
          </div>
        </div>
      ) : !pack.installed && (
        <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" /> Chưa cài đặt
        </p>
      )}
      {isSelected && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }}
        className="absolute bottom-0 left-0 h-0.5 rounded-full" style={{ background: pack.color }} />}
    </motion.button>
  );
}

// ============================================================
// Main Export
// ============================================================
export default function PackOperationsHub() {
  const [selectedPack, setSelectedPack] = useState<PackMeta | null>(PACK_METADATA[0]);
  const [filter, setFilter] = useState<"all"|"installed">("installed");
  const [alerts, setAlerts] = useState<{ id: string; message: string; type: "warning"|"error"|"info" }[]>([]);
  const [globalStats, setGlobalStats] = useState<{ totalPending: number; totalBreaches: number; installedPacks: number } | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  useEffect(() => {
    const installed = PACK_METADATA.filter(p => p.installed);
    Promise.all(
      installed.map(p =>
        apiService.get(`/api/v1/queues?category=${p.category}`)
          .then(res => {
            const qs = Array.isArray(res.data?.queues) ? res.data.queues : Array.isArray(res.data) ? res.data : [];
            return {
              pending: qs.reduce((s: number, q: any) => s + (q.pending_count ?? q.work_item_count ?? 0), 0),
              breaches: qs.reduce((s: number, q: any) => s + (q.sla_breach_count ?? 0), 0),
            };
          }).catch(() => ({ pending: 0, breaches: 0 }))
      )
    ).then(results => {
      const totalPending = results.reduce((s, r) => s + r.pending, 0);
      const totalBreaches = results.reduce((s, r) => s + r.breaches, 0);
      setGlobalStats({ totalPending, totalBreaches, installedPacks: installed.length });
      const newAlerts: typeof alerts = [];
      if (totalBreaches > 0) newAlerts.push({ id: "sla", message: `${totalBreaches} work item đang vượt SLA — cần xử lý ngay!`, type: "error" });
      if (totalPending > 20) newAlerts.push({ id: "load", message: `Khối lượng cao: ${totalPending} item đang chờ xử lý`, type: "warning" });
      setAlerts(newAlerts);
    }).finally(() => setLoadingGlobal(false));
  }, []);

  const visiblePacks = filter === "all" ? PACK_METADATA : PACK_METADATA.filter(p => p.installed);

  return (
    <div className="flex h-full overflow-hidden bg-[#0f172a]">
      {/* Left Sidebar */}
      <div className="w-[300px] shrink-0 flex flex-col border-r border-[#334155] overflow-hidden">
        <div className="p-4 border-b border-[#334155]">
          <h1 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Package size={16} className="text-indigo-400" /> Pack Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mb-4">Điều hành 12 Vertical Industry Packs</p>

          {/* Global Stats */}
          {loadingGlobal ? (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-[#1e293b] rounded-lg h-14 animate-pulse" />)}
            </div>
          ) : globalStats && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Đang xử lý", value: globalStats.totalPending, Icon: Activity, color: "#3b82f6" },
                { label: "Quá SLA", value: globalStats.totalBreaches, Icon: AlertTriangle, color: globalStats.totalBreaches > 0 ? "#ef4444" : "#10b981" },
                { label: "Packs chạy", value: globalStats.installedPacks, Icon: Shield, color: "#10b981" },
              ].map(s => (
                <div key={s.label} className="bg-[#1e293b] rounded-lg p-2.5 text-center border border-[#334155]">
                  <s.Icon size={13} style={{ color: s.color }} className="mx-auto mb-1" />
                  <p className="text-sm font-bold text-slate-100">{s.value}</p>
                  <p className="text-[9px] text-slate-500 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Alerts */}
          {alerts.map(a => (
            <div key={a.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs mb-2 ${
              a.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
              a.type === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
              "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}>
              {a.type === "error" ? <AlertCircle size={12} className="shrink-0" /> :
               a.type === "warning" ? <AlertTriangle size={12} className="shrink-0" /> :
               <Bell size={12} className="shrink-0" />}
              <span className="leading-tight">{a.message}</span>
            </div>
          ))}

          {/* Filter */}
          <div className="flex bg-[#1e293b] rounded-lg p-1">
            {(["installed", "all"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                  filter === f ? "bg-[#334155] text-white font-medium" : "text-slate-500 hover:text-slate-300"
                }`}>
                {f === "installed" ? `Đã cài (${PACK_METADATA.filter(p => p.installed).length})` : `Tất cả (${PACK_METADATA.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Pack List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {visiblePacks.map(pack => (
            <PackCard key={pack.id} pack={pack}
              isSelected={selectedPack?.id === pack.id}
              onSelect={() => setSelectedPack(pack)} />
          ))}
          {filter === "installed" && (
            <button onClick={() => setFilter("all")}
              className="w-full border border-dashed border-[#334155] rounded-2xl p-4 text-slate-600 hover:text-slate-400 hover:border-[#475569] transition-colors flex items-center justify-center gap-2 text-sm">
              <Plus size={16} /> Xem thêm packs
            </button>
          )}
        </div>
      </div>

      {/* Right Detail Panel */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedPack ? (
            <motion.div key={selectedPack.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <PackDetailPanel pack={selectedPack} onClose={() => setSelectedPack(null)} />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-slate-600">
              <Package size={48} className="mb-4 opacity-30" />
              <p className="text-base font-medium">Chọn một Pack để xem chi tiết</p>
              <p className="text-sm mt-1 opacity-60">Hiển thị queues, work items và workflows</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
