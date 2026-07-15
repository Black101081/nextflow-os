import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { HardHat, Plus, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface Project {
  id: string;
  project_name: string;
  client_name: string;
  client_phone: string;
  contract_value: number;
  address: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  created_at: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/const/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectName) {
      setError("Vui lòng điền tên dự án.");
      return;
    }

    try {
      await apiService.post("/api/v1/const/projects", {
        project_name: projectName,
        client_name: clientName || null,
        client_phone: clientPhone || null,
        contract_value: parseFloat(contractValue) || 0,
        address: address || null,
        start_date: startDate || null,
        end_date: endDate || null
      });

      setProjectName("");
      setClientName("");
      setClientPhone("");
      setContractValue("");
      setAddress("");
      setStartDate("");
      setEndDate("");
      setShowAddForm(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo dự án.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <HardHat size={18} className="text-amber-400" />
          Danh sách Dự án Thi công
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchProjects} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
            <Plus size={14} />
            Tạo dự án mới
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Khởi Tạo Dự Án Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Tên công trình / dự án *</label>
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="VD: Thiết kế biệt thự Ciputra P2" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên khách hàng</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Tên chủ đầu tư..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số điện thoại khách hàng</label>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Số điện thoại liên hệ..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Giá trị hợp đồng (VND)</label>
              <input type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Địa chỉ thi công</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ chi tiết công trình..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày khởi công</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Dự kiến hoàn thành</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Tạo Dự Án</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-amber-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <HardHat size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có công trình nào được ghi nhận</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tên Dự Án</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Khách Hàng</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Giá Trị</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Khởi Công / Kết Thúc</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tiến Độ</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-200 font-extrabold">
                    <p>{proj.project_name}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{proj.address || "Không rõ địa điểm"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    <p className="font-semibold">{proj.client_name || "Chưa gán"}</p>
                    <p className="text-[10px] text-slate-500">{proj.client_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-200">{(proj.contract_value || 0).toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {proj.start_date ? new Date(proj.start_date).toLocaleDateString("vi-VN") : "--"} &rarr; {proj.end_date ? new Date(proj.end_date).toLocaleDateString("vi-VN") : "--"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-[#334155]">
                        <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${proj.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{proj.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      proj.status === "Building" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                      proj.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {proj.status === "Planning" ? "Chuẩn bị" : proj.status === "Building" ? "Thi công" : "Hoàn thành"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
