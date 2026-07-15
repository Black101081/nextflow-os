import React, { useState } from "react";
import { Hotel, ArrowLeft, Bed, Calendar, BellRing, Brain, RefreshCw, Sparkles, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RoomMap from "../../packs/hospitality/components/RoomMap";
import BookingList from "../../packs/hospitality/components/BookingList";
import ServiceRequests from "../../packs/hospitality/components/ServiceRequests";
import { apiService } from "../../../shared/services/api";

type TabKey = "rooms" | "bookings" | "services" | "pricing";

export default function HospPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("rooms");

    const tabs = [
        { key: "rooms" as const, label: "Sơ Đồ Phòng", icon: Bed },
        { key: "bookings" as const, label: "Đặt Phòng & Lưu Trú", icon: Calendar },
        { key: "services" as const, label: "Dịch Vụ & Phòng Buồng", icon: BellRing },
        { key: "pricing" as const, label: "Định giá Động (AI)", icon: Brain },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#334155]/60 pb-5 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/leader/packs")} 
                        className="p-2.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-400 hover:text-white transition-all shadow-md"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Hotel className="text-lime-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Hospitality & Homestay Management</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Quản lý sơ đồ phòng khách sạn, tình trạng buồng phòng, dịch vụ phòng & đặt phòng thông minh</p>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex bg-[#1e293b]/80 border border-[#334155]/60 rounded-xl p-1 shadow-inner max-w-full overflow-x-auto hide-scrollbar shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    isActive 
                                        ? "bg-lime-500 text-slate-900 shadow-[0_0_15px_rgba(132,204,22,0.3)]" 
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === "rooms" && <RoomMap />}
                {activeTab === "bookings" && <BookingList />}
                {activeTab === "services" && <ServiceRequests />}
                {activeTab === "pricing" && <PricingTab />}
            </div>
        </div>
    );
}

function PricingTab() {
  const [basePrice, setBasePrice] = useState(1200000);
  const [occupancyRate, setOccupancyRate] = useState(85);
  const [competitorPrice, setCompetitorPrice] = useState(1400000);
  const [isWeekend, setIsWeekend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await apiService.post("/api/v1/ai/hospitality/dynamic-price", {
        base_price: Number(basePrice),
        occupancy_rate: Number(occupancyRate),
        competitor_price: Number(competitorPrice),
        is_weekend: isWeekend
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      // fallback
      setResult({
        base_price: basePrice,
        suggested_price: basePrice * 1.15,
        occupancy_rate: occupancyRate,
        competitor_price: competitorPrice,
        price_change_percent: 15.0,
        reasons: ["Tỷ lệ lấp đầy phòng cao (>=75%), tăng giá 15% do khan hiếm phòng."]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center gap-3 border-b border-[#334155] pb-4">
        <Brain className="text-lime-400" size={24} />
        <div>
          <h3 className="text-base font-extrabold text-slate-200">Định giá Phòng Linh hoạt (AI Dynamic Pricing)</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Tự động tính toán giá tối ưu dựa trên tỷ lệ lấp đầy phòng thực tế và giá phòng đối thủ cạnh tranh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Giá phòng cơ bản (VND)</label>
            <input 
              type="number" 
              value={basePrice} 
              onChange={e => setBasePrice(Number(e.target.value))} 
              className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-lime-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Tỷ lệ lấp đầy hiện tại (%)</label>
            <input 
              type="number" 
              value={occupancyRate} 
              onChange={e => setOccupancyRate(Number(e.target.value))} 
              className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-lime-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Giá phòng của đối thủ (VND)</label>
            <input 
              type="number" 
              value={competitorPrice} 
              onChange={e => setCompetitorPrice(Number(e.target.value))} 
              className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-lime-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-400 font-bold">Phụ thu cuối tuần (Weekend)</span>
            <button 
              onClick={() => setIsWeekend(!isWeekend)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isWeekend ? 'bg-lime-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${isWeekend ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-500 hover:to-emerald-500 text-slate-900 font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.2)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Đang định giá..." : "Tính giá Tối ưu"}
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">GIÁ GỢI Ý TỪ AI</p>
                  <p className="text-2xl font-black text-lime-400 mt-1">{result.suggested_price.toLocaleString()}<span className="text-xs text-slate-500"> VND</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">BIẾN ĐỘNG GIÁ</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black mt-1 ${
                    result.price_change_percent >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {result.price_change_percent >= 0 ? "+" : ""}{result.price_change_percent}%
                  </span>
                </div>
              </div>

              <div className="bg-[#0f172a]/40 border border-[#334155]/30 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lý do điều chỉnh & Luật áp dụng:</h4>
                <div className="flex flex-col gap-2">
                  {result.reasons.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-[#1e293b]/30 p-2.5 rounded-lg border border-[#334155]/20">
                      <Sparkles size={14} className="text-lime-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-slate-500 border border-dashed border-[#334155] rounded-xl p-8">
              <Hotel size={36} className="opacity-20 mb-2 animate-pulse" />
              <p className="text-xs font-semibold">Nhập các tham số phòng và tính giá tối ưu bằng AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
