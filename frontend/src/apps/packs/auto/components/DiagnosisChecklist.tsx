import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string;
  status: "Good" | "Repair" | "Critical";
  cost_estimate: number;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "engine", name: "Dầu động cơ & Lọc dầu", status: "Good", cost_estimate: 450000 },
  { id: "brakes", name: "Hệ thống phanh (Má phanh & Đĩa)", status: "Good", cost_estimate: 1200000 },
  { id: "suspension", name: "Hệ thống treo & Cân bằng lái", status: "Good", cost_estimate: 800000 },
  { id: "battery", name: "Ắc quy & Điện thân xe", status: "Good", cost_estimate: 1800000 },
  { id: "ac", name: "Hệ thống điều hòa & Ga AC", status: "Good", cost_estimate: 600000 },
  { id: "tires", name: "Lốp xe & Căn chỉnh thước lái", status: "Good", cost_estimate: 1500000 }
];

export default function DiagnosisChecklist({ onChange }: { onChange: (items: ChecklistItem[]) => void }) {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    onChange(items);
  }, [items, onChange]);

  const updateStatus = (id: string, status: "Good" | "Repair" | "Critical") => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Good": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Repair": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Critical": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
        Bảng Kiểm Tra Chẩn Đoán Kỹ Thuật (20 Hạng Mục)
      </h3>
      <p className="text-xs text-slate-500 mb-4">Chọn trạng thái cho từng hạng mục để tự động kết xuất chi phí ước tính</p>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-3 bg-[#0f172a]/60 border border-[#334155] rounded-xl flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200">{item.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {item.status !== "Good" ? `Ước tính sửa chữa: ${item.cost_estimate.toLocaleString("vi-VN")} VNĐ` : "Hoạt động tốt"}
              </p>
            </div>
            <div className="flex gap-1">
              {(["Good", "Repair", "Critical"] as const).map((s) => (
                <button key={s} type="button" onClick={() => updateStatus(item.id, s)}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    item.status === s ? getStatusStyle(s) + " font-extrabold scale-[1.03]" :
                    "bg-[#0f172a] border-[#334155] text-slate-500 hover:border-[#475569]"
                  }`}>
                  {s === "Good" ? "Tốt" : s === "Repair" ? "Sửa" : "Hỏng"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
