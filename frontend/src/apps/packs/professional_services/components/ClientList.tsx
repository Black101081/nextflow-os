import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Briefcase, Plus, RefreshCw, AlertCircle, Calendar, ShieldAlert, CheckCircle } from "lucide-react";

interface PsClient {
  id: string;
  company_name: string;
  tax_code: string;
  legal_rep: string;
  accounting_email: string;
  phone: string;
  status: string;
  contract_value: number;
  assigned_cpa: string;
  nda_signed: boolean;
  created_at: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<PsClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [legalRep, setLegalRep] = useState("");
  const [accountingEmail, setAccountingEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [ndaSigned, setNdaSigned] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/ps/clients");
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName) {
      setError("Vui lòng điền tên công ty.");
      return;
    }

    try {
      await apiService.post("/api/v1/ps/clients", {
        company_name: companyName,
        tax_code: taxCode || null,
        legal_rep: legalRep || null,
        accounting_email: accountingEmail || null,
        phone: phone || null,
        contract_value: parseFloat(contractValue) || 0,
        nda_signed: ndaSigned
      });

      setCompanyName("");
      setTaxCode("");
      setLegalRep("");
      setAccountingEmail("");
      setPhone("");
      setContractValue("");
      setNdaSigned(false);
      setShowAddForm(false);
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo khách hàng.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Briefcase size={18} className="text-indigo-400" />
          Danh sách Khách hàng Doanh nghiệp (B2B)
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchClients} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
            <Plus size={14} />
            Thêm doanh nghiệp
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Đăng Ký Khách Hàng B2B Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên doanh nghiệp / công ty *</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Công ty CP..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã số thuế</label>
              <input type="text" value={taxCode} onChange={e => setTaxCode(e.target.value)} placeholder="Tax code..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Người đại diện pháp luật</label>
              <input type="text" value={legalRep} onChange={e => setLegalRep(e.target.value)} placeholder="Họ và tên..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số điện thoại liên hệ</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="SĐT doanh nghiệp..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Email kế toán / nhận hóa đơn</label>
              <input type="email" value={accountingEmail} onChange={e => setAccountingEmail(e.target.value)} placeholder="accounting@company.com" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Giá trị hợp đồng tích lũy (VND)</label>
              <input type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="nda" checked={ndaSigned} onChange={e => setNdaSigned(e.target.checked)} className="rounded border-[#334155] bg-[#0f172a] text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="nda" className="text-xs text-slate-300 select-none">Đã ký kết biên bản bảo mật NDA (Non-Disclosure Agreement)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all">Lưu Khách Hàng</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <Briefcase size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có khách hàng B2B nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Doanh Nghiệp</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Mã Số Thuế</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Người Đại Diện</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Giá Trị Tích Lũy</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Bảo Mật NDA</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(cli => (
                <tr key={cli.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-200 font-extrabold">
                    <p>{cli.company_name}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{cli.accounting_email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300 font-mono">{cli.tax_code || "Chưa khai báo"}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    <p className="font-semibold">{cli.legal_rep || "--"}</p>
                    <p className="text-[10px] text-slate-500">{cli.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-200">{cli.contract_value.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-xs">
                    {cli.nda_signed ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                        <CheckCircle size={12} /> Đã Ký NDA
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-bold text-[10px]">
                        <ShieldAlert size={12} /> Chưa Ký
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cli.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                    }`}>
                      {cli.status === "Active" ? "Hoạt động" : cli.status}
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
