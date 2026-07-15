import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Calendar, Plus, RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";

interface TaxFiling {
  id: string;
  client_id: string;
  filing_type: string;
  period: string;
  due_date: string;
  filed_date: string;
  status: string;
  notes: string;
}

export default function TaxFilings() {
  const [filings, setFilings] = useState<TaxFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [clientId, setClientId] = useState("");
  const [filingType, setFilingType] = useState("");
  const [period, setPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const fetchFilings = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/ps/tax-filings");
      setFilings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId || !filingType || !period || !dueDate) {
      setError("Vui lòng điền đầy đủ các thông tin lịch nộp báo cáo.");
      return;
    }

    try {
      await apiService.post("/api/v1/ps/tax-filings", {
        client_id: clientId,
        filing_type: filingType,
        period,
        due_date: dueDate,
        notes: notes || null
      });

      setClientId("");
      setFilingType("");
      setPeriod("");
      setDueDate("");
      setNotes("");
      setShowAddForm(false);
      fetchFilings();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo lịch báo cáo.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" />
          Lịch Trình Báo Cáo Thuế Doanh Nghiệp
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchFilings} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
            <Plus size={14} />
            Lập lịch báo cáo
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Lập Lịch Nộp Báo Cáo Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã khách hàng (UUID) *</label>
              <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Nhập UUID doanh nghiệp..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Loại báo cáo thuế *</label>
              <input type="text" value={filingType} onChange={e => setFilingType(e.target.value)} placeholder="VD: Tờ khai thuế GTGT, Quyết toán thuế TNDN" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Kỳ báo cáo *</label>
              <input type="text" value={period} onChange={e => setPeriod(e.target.value)} placeholder="VD: Q1/2026, Tháng 07/2026" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Hạn nộp báo cáo *</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all">Lập Lịch</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : filings.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <Calendar size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có lịch nộp tờ khai thuế nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Doanh Nghiệp (Client)</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tờ Khai Báo Cáo</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Kỳ Kế Toán</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Hạn Nộp</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Ngày Đã Nộp</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filings.map(fil => {
                const isOverdue = new Date(fil.due_date).getTime() < Date.now() && fil.status === "Pending";
                return (
                  <tr key={fil.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-300 font-mono truncate max-w-[120px]" title={fil.client_id}>{fil.client_id}</td>
                    <td className="px-4 py-3 text-xs text-slate-200 font-bold">{fil.filing_type}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{fil.period}</td>
                    <td className={`px-4 py-3 text-xs font-bold ${isOverdue ? "text-red-400" : "text-slate-300"}`}>
                      {new Date(fil.due_date).toLocaleDateString("vi-VN")}
                      {isOverdue && <AlertTriangle size={12} className="inline ml-1 text-red-400" title="Đã quá hạn nộp tờ khai!" />}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {fil.filed_date ? new Date(fil.filed_date).toLocaleDateString("vi-VN") : "--"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fil.status === "Filed" ? "bg-emerald-500/20 text-emerald-400" :
                        isOverdue ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {fil.status === "Filed" ? "Đã nộp" : isOverdue ? "Trễ hạn" : "Chờ nộp"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
