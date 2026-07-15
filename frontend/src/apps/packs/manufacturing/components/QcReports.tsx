import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { ShieldCheck, Plus, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface QcReport {
  id: string;
  work_order_id: string;
  checked_quantity: number;
  pass_quantity: number;
  defect_types: any;
  disposition: string;
  inspector_id: string;
  inspected_at: string;
}

export default function QcReports() {
  const [reports, setReports] = useState<QcReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [workOrderId, setWorkOrderId] = useState("");
  const [checkedQuantity, setCheckedQuantity] = useState("");
  const [passQuantity, setPassQuantity] = useState("");
  const [defectTypesRaw, setDefectTypesRaw] = useState("");
  const [disposition, setDisposition] = useState("Accept");
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/mfg/qc-reports");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!workOrderId || !checkedQuantity || !passQuantity) {
      setError("Vui lòng điền đầy đủ các thông tin QC.");
      return;
    }

    let defectTypesList = {};
    try {
      defectTypesList = JSON.parse(defectTypesRaw);
    } catch (err) {
      defectTypesList = { "Lỗi khác": parseInt(checkedQuantity) - parseInt(passQuantity) };
    }

    try {
      await apiService.post("/api/v1/mfg/qc-reports", {
        work_order_id: workOrderId,
        checked_quantity: parseInt(checkedQuantity) || 0,
        pass_quantity: parseInt(passQuantity) || 0,
        defect_types: defectTypesList,
        disposition
      });

      setWorkOrderId("");
      setCheckedQuantity("");
      setPassQuantity("");
      setDefectTypesRaw("");
      setDisposition("Accept");
      setShowAddForm(false);
      fetchReports();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi lưu báo cáo QC.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck size={18} className="text-violet-400" />
          Kiểm Định Chất Lượng (QC)
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchReports} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
            <Plus size={14} />
            Lập phiếu QC
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Lập Phiếu Kiểm Định Chất Lượng Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã lệnh sản xuất (UUID) *</label>
              <input type="text" value={workOrderId} onChange={e => setWorkOrderId(e.target.value)} placeholder="Nhập UUID lệnh sản xuất..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Quyết định kiểm định (Disposition) *</label>
              <select value={disposition} onChange={e => setDisposition(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors">
                <option value="Accept">Chấp nhận (Accept)</option>
                <option value="Rework">Làm lại (Rework)</option>
                <option value="Scrap">Hủy bỏ (Scrap)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số lượng kiểm tra *</label>
              <input type="number" value={checkedQuantity} onChange={e => setCheckedQuantity(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số lượng đạt chuẩn *</label>
              <input type="number" value={passQuantity} onChange={e => setPassQuantity(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Chi tiết lỗi (Định dạng JSON)</label>
            <input type="text" value={defectTypesRaw} onChange={e => setDefectTypesRaw(e.target.value)} placeholder='{"Trầy xước": 2, "Lệch khớp": 1}' className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all">Ghi Nhận QC</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-violet-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <ShieldCheck size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có biên bản kiểm định QC nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Mã Lệnh SX</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Đã Kiểm</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Đạt Yêu Cầu</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Chi Tiết Lỗi</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Quyết Định</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(rep => (
                <tr key={rep.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-300 font-mono truncate max-w-[120px]" title={rep.work_order_id}>{rep.work_order_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-200 font-bold">{rep.checked_quantity}</td>
                  <td className="px-4 py-3 text-xs text-emerald-400 font-bold">{rep.pass_quantity}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {rep.defect_types ? JSON.stringify(rep.defect_types) : "Không ghi nhận"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.disposition === "Accept" ? "bg-emerald-500/20 text-emerald-400" :
                      rep.disposition === "Rework" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {rep.disposition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(rep.inspected_at).toLocaleString("vi-VN")}
                    </div>
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
