import React, { useState } from "react";
import VehicleSearchBar from "../../packs/auto/components/VehicleSearchBar";
import DiagnosisChecklist from "../../packs/auto/components/DiagnosisChecklist";
import RepairQuoteCard from "../../packs/auto/components/RepairQuoteCard";
import { Wrench, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function AutoPackPage() {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [diagnosisItems, setDiagnosisItems] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#334155] pb-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/leader/packs")} className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="text-teal-400" size={20} />
              <h1 className="text-xl font-extrabold tracking-tight">Auto Repair & Garage Solutions</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Quy trình đón nhận xe, chẩn đoán lỗi chuyên sâu & báo giá khách hàng duyệt tự động</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left column: Search and Vehicle details (5 columns) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <VehicleSearchBar onSelectVehicle={(v) => setSelectedVehicle(v)} />
        </div>

        {/* Right column: Checklist & Quote Card (7 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {selectedVehicle ? (
            <>
              <DiagnosisChecklist onChange={setDiagnosisItems} />
              <RepairQuoteCard vehicleId={selectedVehicle.id} diagnosisItems={diagnosisItems} />
            </>
          ) : (
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 text-center flex-1 min-h-[300px]">
              <CarPlaceholder />
              <p className="text-sm font-semibold mt-4">Vui lòng tra cứu xe bằng biển số trước</p>
              <p className="text-xs text-slate-600 mt-1">Bảng kiểm tra 20 hạng mục chẩn đoán lỗi sẽ xuất hiện ngay sau khi chọn xe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CarPlaceholder() {
  return (
    <svg className="w-16 h-16 text-slate-700 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}
