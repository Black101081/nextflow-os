import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { List, Plus, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface Bom {
  id: string;
  product_id: string;
  product_name: string;
  version: string;
  materials: any[];
  labor_hours: number;
  approved: boolean;
  created_at: string;
}

export default function BomList() {
  const [boms, setBoms] = useState<Bom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [productName, setProductName] = useState("");
  const [version, setVersion] = useState("1.0");
  const [materialsRaw, setMaterialsRaw] = useState("");
  const [laborHours, setLaborHours] = useState("");
  const [error, setError] = useState("");

  const fetchBoms = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/mfg/boms");
      setBoms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!productName || !materialsRaw) {
      setError("Vui lòng điền tên sản phẩm và nguyên vật liệu.");
      return;
    }

    let materialsList = [];
    try {
      materialsList = JSON.parse(materialsRaw);
    } catch (err) {
      materialsList = [{ item: materialsRaw, qty: 1, unit: "cái" }];
    }

    try {
      await apiService.post("/api/v1/mfg/boms", {
        product_id: "00000000-0000-0000-0000-000000000000", // dummy product id
        product_name: productName,
        version: version || "1.0",
        materials: materialsList,
        labor_hours: parseFloat(laborHours) || 0
      });

      setProductName("");
      setVersion("1.0");
      setMaterialsRaw("");
      setLaborHours("");
      setShowAddForm(false);
      fetchBoms();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo định mức.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <List size={18} className="text-violet-400" />
          Định Mức Vật Tư (BOM)
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchBoms} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
            <Plus size={14} />
            Thiết lập định mức (BOM)
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Thiết Lập Định Mức Nguyên Vật Liệu Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên sản phẩm *</label>
              <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="VD: Ghế gỗ xếp" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Phiên bản</label>
              <input type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Giờ công lao động định mức</label>
              <input type="number" step="0.1" value={laborHours} onChange={e => setLaborHours(e.target.value)} placeholder="Số giờ..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Nguyên vật liệu (Định dạng JSON) *</label>
            <textarea value={materialsRaw} onChange={e => setMaterialsRaw(e.target.value)} rows={4} placeholder='[{"item": "Gỗ thông", "qty": 2, "unit": "tấm"}]' className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all">Lưu Định Mức</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-violet-500" />
        </div>
      ) : boms.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <List size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có định mức BOM nào được tạo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boms.map(bom => (
            <div key={bom.id} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col justify-between hover:border-[#475569] transition-all">
              <div>
                <div className="flex justify-between items-start border-b border-[#334155]/60 pb-3 mb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-200">{bom.product_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Phiên bản: {bom.version || "1.0"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    bom.approved ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                  }`}>
                    {bom.approved ? "Đã duyệt" : "Bản thảo"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Công thức nguyên vật liệu:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-300">
                      {Array.isArray(bom.materials) ? bom.materials.map((m, idx) => (
                        <li key={idx}>{m.item}: {m.qty} {m.unit}</li>
                      )) : <li>{String(bom.materials)}</li>}
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-400"><span className="font-bold text-slate-300">Thời gian lao động định mức:</span> {bom.labor_hours} giờ / sản phẩm</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#334155]/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Cập nhật: {new Date(bom.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
