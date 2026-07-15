import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { FileText, Plus, RefreshCw, AlertCircle, Calendar, Sparkles } from "lucide-react";

interface DailyLog {
  id: string;
  project_id: string;
  log_date: string;
  workers_count: number;
  summary: string;
  completed_items: string[];
  issues: string;
  weather: string;
  ai_report: string;
  created_at: string;
}

export default function DailyLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [projectId, setProjectId] = useState("");
  const [logDate, setLogDate] = useState("");
  const [workersCount, setWorkersCount] = useState("");
  const [summary, setSummary] = useState("");
  const [completedItemsRaw, setCompletedItemsRaw] = useState("");
  const [issues, setIssues] = useState("");
  const [weather, setWeather] = useState("Nắng");
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/const/daily-logs");
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectId || !logDate || !workersCount) {
      setError("Vui lòng chọn công trình, ngày ghi nhận và số lượng nhân công.");
      return;
    }

    const completed_items = completedItemsRaw ? completedItemsRaw.split(",").map(s => s.trim()) : [];

    try {
      await apiService.post("/api/v1/const/daily-logs", {
        project_id: projectId,
        log_date: logDate,
        workers_count: parseInt(workersCount) || 0,
        summary: summary || null,
        completed_items,
        issues: issues || null,
        weather
      });

      setProjectId("");
      setLogDate("");
      setWorkersCount("");
      setSummary("");
      setCompletedItemsRaw("");
      setIssues("");
      setWeather("Nắng");
      setShowAddForm(false);
      fetchLogs();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo nhật ký.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <FileText size={18} className="text-amber-400" />
          Nhật Ký Thi Công Hàng Ngày
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
            <Plus size={14} />
            Ghi nhật ký hôm nay
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Ghi Nhật Ký Công Trình Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã dự án/công trình (UUID) *</label>
              <input type="text" value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="Nhập UUID công trình..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày nhật ký *</label>
              <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số lượng nhân công tại công trường *</label>
              <input type="number" value={workersCount} onChange={e => setWorkersCount(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Thời tiết</label>
              <input type="text" value={weather} onChange={e => setWeather(e.target.value)} placeholder="VD: Nắng tốt, Mưa giông" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Hạng mục đã hoàn thành hôm nay (cách nhau bằng dấu phẩy)</label>
            <input type="text" value={completedItemsRaw} onChange={e => setCompletedItemsRaw(e.target.value)} placeholder="Ốp gạch nhà vệ sinh, Lắp đặt khung xương..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Vấn đề phát sinh / Rủi ro</label>
            <input type="text" value={issues} onChange={e => setIssues(e.target.value)} placeholder="Chậm giao gỗ, thiếu xi măng..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Mô tả chi tiết tiến độ</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} placeholder="Tóm tắt công việc trong ngày..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Ghi Nhật Ký</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-amber-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có nhật ký nào được ghi nhận</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map(log => (
            <div key={log.id} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col justify-between hover:border-[#475569] transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-[#334155]/60 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 font-mono">Dự án: {log.project_id}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={11} />
                      Ngày: {new Date(log.log_date).toLocaleDateString("vi-VN")} | Thời tiết: {log.weather || "Nắng"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold">
                    {log.workers_count} Nhân công
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <p className="text-slate-300"><span className="text-slate-500 font-bold">Công việc đã làm:</span> {log.summary || "Chưa ghi nhận mô tả"}</p>
                  <div>
                    <span className="text-slate-500 font-bold">Hạng mục xong:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.completed_items && log.completed_items.length > 0 ? log.completed_items.map((item, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-[#0f172a]/60 text-slate-300 rounded border border-[#334155]/60 text-[10px]">{item}</span>
                      )) : <span className="text-slate-600">Không có</span>}
                    </div>
                  </div>
                  {log.issues && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                      <span className="font-bold">Sự cố phát sinh:</span> {log.issues}
                    </div>
                  )}
                </div>

                {log.ai_report && (
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-[11px] text-violet-300 flex gap-2">
                    <Sparkles size={16} className="shrink-0 text-violet-400" />
                    <div>
                      <p className="font-bold text-violet-200">AI Daily Synthesis</p>
                      <p className="mt-0.5 text-slate-300">{log.ai_report}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
