import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { FileText, Plus, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface Contract {
  id: string;
  client_id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_fee: number;
  auto_renewal: boolean;
  status: string;
  notes: string;
}

export default function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [clientId, setClientId] = useState("");
  const [contractType, setContractType] = useState("KeToan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/ps/contracts");
      setContracts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId || !contractType || !monthlyFee) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      await apiService.post("/api/v1/ps/contracts", {
        client_id: clientId,
        contract_type: contractType,
        start_date: startDate || null,
        end_date: endDate || null,
        monthly_fee: parseFloat(monthlyFee) || 0,
        auto_renewal: autoRenewal,
        notes: notes || null
      });

      setClientId("");
      setContractType("KeToan");
      setStartDate("");
      setEndDate("");
      setMonthlyFee("");
      setAutoRenewal(false);
      setNotes("");
      setShowAddForm(false);
      fetchContracts();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo hợp đồng.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <FileText size={18} className="text-indigo-400" />
          Hợp Đồng Dịch Vụ Retainer
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchContracts} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
            <Plus size={14} />
            Ký hợp đồng mới
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Ký Hợp Đồng Dịch Vụ Mới</h4>
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
              <label className="text-xs text-slate-400 font-bold">Loại dịch vụ hợp đồng *</label>
              <select value={contractType} onChange={e => setContractType(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors">
                <option value="KeToan">Kế Toán Trọn Gói (KeToan)</option>
                <option value="KiemToan">Kiểm Toán Pháp Lý (KiemToan)</option>
                <option value="TuVan">Tư Vấn Thuế & Tài Chính (TuVan)</option>
                <option value="PhapLy">Dịch Vụ Pháp Lý Doanh Nghiệp (PhapLy)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Phí dịch vụ hàng tháng *</label>
              <input type="number" value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày bắt đầu</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày kết thúc</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Điều khoản & Ghi chú</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú thêm..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto_renew" checked={autoRenewal} onChange={e => setAutoRenewal(e.target.checked)} className="rounded border-[#334155] bg-[#0f172a] text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="auto_renew" className="text-xs text-slate-300 select-none">Hợp đồng tự động gia hạn khi hết hạn hiệu lực (Auto Renewal)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all">Ký Hợp Đồng</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có hợp đồng dịch vụ retainer nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Khách Hàng (Client)</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Loại Dịch Vụ</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Phí Định Kỳ / Tháng</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Hiệu Lực</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Gia Hạn</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(con => (
                <tr key={con.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-300 font-mono truncate max-w-[120px]" title={con.client_id}>{con.client_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-200 font-bold">
                    {con.contract_type === "KeToan" ? "Kế Toán Trọn Gói" :
                     con.contract_type === "KiemToan" ? "Kiểm Toán" :
                     con.contract_type === "TuVan" ? "Tư Vấn Thuế" : "Pháp Lý Doanh Nghiệp"}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-emerald-400">{con.monthly_fee.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {con.start_date ? new Date(con.start_date).toLocaleDateString("vi-VN") : "--"} &rarr; {con.end_date ? new Date(con.end_date).toLocaleDateString("vi-VN") : "--"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{con.auto_renewal ? "Có tự động" : "Không"}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      con.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                    }`}>
                      {con.status === "Active" ? "Đang chạy" : con.status}
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
