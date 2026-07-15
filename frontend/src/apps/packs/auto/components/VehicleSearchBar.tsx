import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../../shared/services/api";
import { Wrench, Car, Search, Plus, Calendar, Milestone, User, ShieldCheck } from "lucide-react";

interface Vehicle {
  id: string;
  license_plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  owner_customer_id: string | null;
  current_mileage: number | null;
  last_service_date: string | null;
  next_service_date: string | null;
  next_service_mileage: number | null;
}

export default function VehicleSearchBar({ onSelectVehicle }: { onSelectVehicle: (vehicle: Vehicle) => void }) {
  const [plate, setPlate] = useState("30A-12345");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [brand, setBrand] = useState("Toyota");
  const [model, setModel] = useState("Camry");
  const [year, setYear] = useState(2022);
  const [ownerId, setOwnerId] = useState("8e8f7c53-214c-446e-a1bd-1b6dd27a7444"); // Seed customer
  const [mileage, setMileage] = useState(45000);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVehicle(null);
    try {
      const res = await apiService.get(`/api/v1/garage/vehicles?license_plate=${plate.trim()}`);
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length > 0) {
        const found = list[0];
        setVehicle(found);
        onSelectVehicle(found);
      } else {
        setError("Không tìm thấy xe với biển số này.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tra cứu thông tin phương tiện");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiService.post("/api/v1/garage/vehicles", {
        license_plate: plate.trim(),
        brand,
        model,
        year,
        owner_customer_id: ownerId,
        current_mileage: mileage
      });
      setVehicle(res.data || res.data?.vehicle);
      onSelectVehicle(res.data || res.data?.vehicle);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Lỗi đăng ký xe mới");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 border-b border-[#334155] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Car size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Tra Cứu & Đăng Ký Xe</h3>
            <p className="text-xs text-slate-500">Tra cứu lịch sử xe theo biển số hệ thống</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="VD: 30A-12345..."
          className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
        <button type="submit" className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] text-teal-400 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5">
          <Search size={13} /> Tìm kiếm
        </button>
      </form>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-8">
          Đang tra cứu phương tiện...
        </div>
      ) : vehicle ? (
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f172a]/60 rounded-xl p-3 border border-[#334155]">
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">Hiệu xe / Dòng xe</span>
              <span className="text-xs font-bold text-slate-200">{vehicle.brand} {vehicle.model}</span>
            </div>
            <div className="bg-[#0f172a]/60 rounded-xl p-3 border border-[#334155]">
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">Số Odo Hiện Tại</span>
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                <Milestone size={12} /> {vehicle.current_mileage?.toLocaleString("vi-VN") || 0} KM
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-[#0f172a]/40 border border-[#334155] rounded-xl p-3.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Chủ sở hữu:</span>
              <span className="font-mono text-slate-400">{vehicle.owner_customer_id?.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Năm sản xuất:</span>
              <span>{vehicle.year || "Chưa xác định"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lần bảo dưỡng cuối:</span>
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {vehicle.last_service_date || "Chưa ghi nhận"}
              </span>
            </div>
            {vehicle.next_service_mileage && (
              <div className="flex justify-between border-t border-[#334155]/60 pt-2 mt-2 font-semibold text-teal-400">
                <span>Nhắc bảo dưỡng tại:</span>
                <span>{vehicle.next_service_mileage.toLocaleString("vi-VN")} KM</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-[#334155] rounded-xl p-8 text-center">
          <Car size={36} className="mb-2 opacity-30" />
          <p className="text-sm">Chưa chọn xe</p>
          <p className="text-xs mt-1 text-slate-600">Nhập biển số để tra cứu hoặc đăng ký phương tiện mới</p>
          {error && (
            <button onClick={() => setShowAddForm(true)} className="mt-4 px-3 py-1.5 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-teal-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
              <Plus size={13} /> Đăng Ký Xe {plate}
            </button>
          )}
        </div>
      )}

      {/* Register Form Dialog */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <h4 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Car size={18} className="text-teal-400" /> Đăng Ký Xe Mới Lên Hệ Thống
              </h4>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Biển Số Xe</label>
                  <input type="text" value={plate} readOnly
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-500 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Hãng Xe</label>
                    <input type="text" value={brand} onChange={e => setBrand(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Dòng Xe</label>
                    <input type="text" value={model} onChange={e => setModel(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Năm Sản Xuất</label>
                    <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2020)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Số Odo Hiện Tại (KM)</label>
                    <input type="number" value={mileage} onChange={e => setMileage(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">ID Chủ Xe (Khách Hàng)</label>
                  <input type="text" value={ownerId} onChange={e => setOwnerId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500" required />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-slate-400 text-xs font-semibold transition-colors">
                    Hủy bỏ
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-lg shadow-teal-600/10">
                    {submitting ? "Đang lưu..." : "Xác Nhận Đăng Ký"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
