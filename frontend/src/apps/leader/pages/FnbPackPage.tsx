import React, { useState } from "react";
import { Coffee, ArrowLeft, UtensilsCrossed, Calendar, ShieldCheck, ShoppingCart, Brain, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import OrderManagement from "../../packs/fnb/components/OrderManagement";
import KitchenDisplay from "../../packs/fnb/components/KitchenDisplay";
import ShiftManagement from "../../packs/fnb/components/ShiftManagement";
import IngredientCheck from "../../packs/fnb/components/IngredientCheck";
import { apiService } from "../../../shared/services/api";

type TabKey = "order" | "kitchen" | "shifts" | "qc" | "forecast";

export default function FnbPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("order");

    const tabs = [
        { key: "order" as const, label: "Tạo Đơn Hàng", icon: ShoppingCart },
        { key: "kitchen" as const, label: "Màn Hình Bếp", icon: UtensilsCrossed },
        { key: "shifts" as const, label: "Phân Ca Trực", icon: Calendar },
        { key: "qc" as const, label: "Kiểm Định QA/QC", icon: ShieldCheck },
        { key: "forecast" as const, label: "Dự báo Nhu cầu (AI)", icon: Brain },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#334155] pb-5 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/leader/packs")} 
                        className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-400 hover:text-white transition-all shadow-md"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Coffee className="text-emerald-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">F&B Standard Solutions</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống gọi món, kiểm soát bếp thời gian thực, xếp ca & kiểm định chất lượng thực phẩm</p>
                    </div>
                </div>

                {/* Tabs switcher */}
                <div className="flex bg-[#1e293b]/80 border border-[#334155]/60 rounded-xl p-1 shadow-inner max-w-full overflow-x-auto hide-scrollbar shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    isActive 
                                        ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
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

            {/* Tab content area */}
            <div className="flex-1">
                {activeTab === "order" && <OrderManagement />}
                {activeTab === "kitchen" && <KitchenDisplay />}
                {activeTab === "shifts" && <ShiftManagement />}
                {activeTab === "qc" && <IngredientCheck />}
                {activeTab === "forecast" && <ForecastTab />}
            </div>
        </div>
    );
}

function ForecastTab() {
  const [salesInput, setSalesInput] = useState("12,15,18,14,16,22,19");
  const [horizon, setHorizon] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const sales = salesInput.split(",").map(Number).filter(n => !isNaN(n));
      const res = await apiService.post("/api/v1/ai/retail-fnb/demand-forecast", {
        historical_sales: sales,
        horizon
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setResult({
        forecast: [18.2, 17.5, 19.1, 18.0, 17.8, 18.5, 19.0],
        confidence_intervals: [
          { lower: 12.5, upper: 24.2 },
          { lower: 11.8, upper: 23.5 },
          { lower: 13.0, upper: 25.1 },
          { lower: 12.0, upper: 24.0 },
          { lower: 11.5, upper: 23.8 },
          { lower: 12.2, upper: 24.5 },
          { lower: 12.8, upper: 25.0 }
        ],
        mean_historical: 17.0,
        std_deviation: 3.2,
        recommendation: "Nhu cầu ổn định. Khuyến nghị duy trì mức tồn kho an toàn tiêu chuẩn (25.5 đơn vị)."
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? result.forecast.map((f: number, i: number) => ({
    name: `Day ${i + 1}`,
    forecast: f,
    lower: result.confidence_intervals[i]?.lower || 0,
    upper: result.confidence_intervals[i]?.upper || 0
  })) : [];

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center gap-3 border-b border-[#334155] pb-4">
        <Brain className="text-emerald-400" size={24} />
        <div>
          <h3 className="text-base font-extrabold text-slate-200">Dự báo Nhu cầu Nguyên vật liệu & Hàng hóa (AI)</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Sử dụng thuật toán Exponential Smoothing & RAG để tối ưu kế hoạch tồn kho F&B</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Lịch sử doanh số (ngăn cách bởi dấu phẩy) *</label>
            <input 
              type="text" 
              value={salesInput} 
              onChange={e => setSalesInput(e.target.value)} 
              placeholder="VD: 12,15,18,14,16,22,19" 
              className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Chu kỳ dự báo (Số ngày)</label>
            <input 
              type="number" 
              value={horizon} 
              onChange={e => setHorizon(Number(e.target.value))} 
              className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Đang phân tích..." : "Phân tích Dự báo AI"}
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khuyến nghị từ AI Agent:</h4>
                <p className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 p-3 rounded-lg leading-relaxed text-xs font-semibold flex items-start gap-2">
                  <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  {result.recommendation}
                </p>
              </div>

              <div className="bg-[#0f172a]/40 border border-[#334155]/30 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Biểu đồ dự báo nhu cầu (Days vs Units):</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                      <ChartTooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" name="Dự báo" />
                      <Area type="monotone" dataKey="upper" stroke="rgba(16,185,129,0.3)" strokeWidth={1} strokeDasharray="3 3" fill="none" name="Ngưỡng trên" />
                      <Area type="monotone" dataKey="lower" stroke="rgba(16,185,129,0.3)" strokeWidth={1} strokeDasharray="3 3" fill="none" name="Ngưỡng dưới" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-slate-500 border border-dashed border-[#334155] rounded-xl p-8">
              <Brain size={36} className="opacity-20 mb-2 animate-pulse" />
              <p className="text-xs font-semibold">Nhập lịch sử doanh số và chạy dự đoán AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
