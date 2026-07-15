import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { ClipboardCheck, Plus, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface MaterialRequest {
  id: string;
  project_id: string;
  items: any[];
  urgency: string;
  status: string;
  created_at: string;
}

export default function MaterialRequests() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [projectId, setProjectId] = useState("");
  const [itemsRaw, setItemsRaw] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/const/material-requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectId || !itemsRaw) {
      setError("Vui lòng nhập công trình và danh sách vật tư.");
      return;
    }

    let itemsList = [];
    try {
      itemsList = JSON.parse(itemsRaw);
    } catch (err) {
      itemsList = [{ item: itemsRaw, qty: 1, unit: "cái" }];
    }

    try {
      await apiService.post("/api/v1/const/material-requests", {
        project_id: projectId,
        items: itemsList,
        urgency
      });

      setProjectId("");
      setItemsRaw("");
      setUrgency("Normal");
      setShowAddForm(false);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo yêu cầu.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-amber-400" />
          Yêu Cầu Cung Cấp Vật Tư
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchRequests} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
            <Plus size={14} />
            Tạo yêu cầu vật tư
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Gửi Yêu Cầu Vật Tư Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã công trình (UUID) *</label>
              <input type="text" value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="Nhập UUID công trình..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mức độ khẩn cấp</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors">
                <option value="Normal">Bình thường (Normal)</option>
                <option value="Urgent">Khẩn cấp (Urgent)</option>
                <option value="Critical">Nguy cấp (Critical)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Danh sách vật tư (Định dạng JSON) *</label>
            <textarea value={itemsRaw} onChange={e => setItemsRaw(e.target.value)} rows={4} placeholder='[{"item": "Xi măng PC40", "qty": 100, "unit": "bao"}]' className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Gửi Yêu Cầu</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-amber-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <ClipboardCheck size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có yêu cầu vật tư nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col justify-between hover:border-[#475569] transition-all">
              <div>
                <div className="flex justify-between items-start border-b border-[#334155]/60 pb-3 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 font-mono">Công trình: {req.project_id}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                  }`}>
                    {req.status === "Pending" ? "Đang chờ duyệt" : "Đã cấp phát"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Danh mục vật tư:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-300">
                      {Array.isArray(req.items) ? req.items.map((it, idx) => (
                        <li key={idx}>{it.item}: {it.qty} {it.unit}</li>
                      )) : <li>{String(req.items)}</li>}
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-400"><span className="font-bold text-slate-300">Mức độ khẩn cấp:</span> {req.urgency}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#334155]/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Gửi lúc: {new Date(req.created_at).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
