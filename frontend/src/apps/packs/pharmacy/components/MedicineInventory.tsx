import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Pill, Plus, RefreshCw, AlertCircle, Calendar, AlertTriangle } from "lucide-react";

interface MedicineItem {
  id: string;
  medicine_id: string;
  name: string;
  generic_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  batch_number: string;
  purchase_price: number;
  sell_price: number;
  reorder_point: number;
  requires_prescription: boolean;
  category: string;
}

export default function MedicineInventory() {
  const [inventory, setInventory] = useState<MedicineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [genericName, setGenericName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/phar/inventory");
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !quantity) {
      setError("Vui lòng điền đầy đủ tên và số lượng.");
      return;
    }

    try {
      await apiService.post("/api/v1/phar/inventory", {
        name,
        medicine_id: medicineId || null,
        generic_name: genericName || null,
        quantity: parseInt(quantity) || 0,
        unit: unit || "Viên",
        expiry_date: expiryDate || null,
        batch_number: batchNumber || null,
        purchase_price: parseFloat(purchasePrice) || 0,
        sell_price: parseFloat(sellPrice) || 0,
        reorder_point: parseInt(reorderPoint) || 10,
        requires_prescription: requiresPrescription,
        category: category || "Khác"
      });

      setName("");
      setMedicineId("");
      setGenericName("");
      setQuantity("");
      setUnit("");
      setExpiryDate("");
      setBatchNumber("");
      setPurchasePrice("");
      setSellPrice("");
      setReorderPoint("");
      setRequiresPrescription(false);
      setCategory("");
      setShowAddForm(false);
      fetchInventory();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo kho thuốc.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Pill size={18} className="text-cyan-400" />
          Kho Thuốc & Dược Phẩm
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Plus size={14} />
            Thêm thuốc
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Nhập Thuốc Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên thương mại *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Panadol Extra" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Mã thuốc (SKU)</label>
              <input type="text" value={medicineId} onChange={e => setMedicineId(e.target.value)} placeholder="VD: PANA500" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên hoạt chất (Generic)</label>
              <input type="text" value={genericName} onChange={e => setGenericName(e.target.value)} placeholder="VD: Paracetamol" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Nhóm thuốc</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="VD: Giảm đau, Kháng sinh" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số lượng *</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Đơn vị</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Viên, Hộp, Chai" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngưỡng báo tồn</label>
              <input type="number" value={reorderPoint} onChange={e => setReorderPoint(e.target.value)} placeholder="10" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Giá mua (VND)</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Giá bán (VND)</label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="0" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày hết hạn</label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số lô sản xuất</label>
              <input type="text" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="Lot number..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="rx" checked={requiresPrescription} onChange={e => setRequiresPrescription(e.target.checked)} className="rounded border-[#334155] bg-[#0f172a] text-cyan-600 focus:ring-cyan-500" />
            <label htmlFor="rx" className="text-xs text-slate-300 select-none">Bắt buộc phải có đơn thuốc của bác sĩ (Rx Only)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Lưu Kho</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-cyan-500" />
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <Pill size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có dữ liệu kho thuốc</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1e293b] border border-[#334155] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]/30">
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Tên Thuốc</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Nhóm</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Số Lượng Còn</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Giá Bán</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Hạn Sử Dụng</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400">Quy Định</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isLowStock = item.quantity <= item.reorder_point;
                return (
                  <tr key={item.id} className="border-b border-[#334155]/60 hover:bg-[#334155]/10 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-200">
                      <p className="font-extrabold flex items-center gap-1.5">
                        {item.name}
                        {isLowStock && <AlertTriangle size={12} className="text-red-400" title="Cảnh báo sắp hết thuốc!" />}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.generic_name || "Chưa cập nhật hoạt chất"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{item.category || "Khác"}</td>
                    <td className="px-4 py-3 text-xs font-bold">
                      <span className={isLowStock ? "text-red-400" : "text-emerald-400"}>
                        {item.quantity} {item.unit}
                      </span>
                      {isLowStock && <span className="text-[9px] block text-red-500/80 mt-0.5">Dưới ngưỡng ({item.reorder_point})</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-300">{item.sell_price.toLocaleString()}đ</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString("vi-VN") : "Không rõ"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.requires_prescription ? (
                        <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[9px] font-bold border border-red-500/20">
                          Đơn thuốc (Rx)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-500/10 text-slate-400 rounded text-[9px] border border-slate-500/20">
                          OTC
                        </span>
                      )}
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
