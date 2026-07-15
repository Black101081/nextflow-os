import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { 
  DollarSign, TrendingUp, Users, ArrowUpRight, BarChart2, 
  Settings, Award, RefreshCw, Layers, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';

export default function RevenueAnalytics() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'cohorts' | 'forecast'>('overview');
  const [mrrData, setMrrData] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [updatingTenantId, setUpdatingTenantId] = useState<string | null>(null);

  const fetchMrr = async () => {
    try {
      const res = await apiService.get('/api/v1/platform/revenue/mrr');
      setMrrData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCohorts = async () => {
    try {
      const res = await apiService.get('/api/v1/platform/revenue/cohorts');
      setCohorts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForecast = async () => {
    try {
      const res = await apiService.get('/api/v1/platform/revenue/forecasts');
      setForecast(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiService.getPlatformTenants();
      setTenants(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMrr();
    fetchCohorts();
    fetchForecast();
    fetchTenants();
  }, []);

  const handleUpdateTier = async (id: string, currentTier: string) => {
    const nextTier = currentTier === 'STANDARD' ? 'ENTERPRISE' : 'STANDARD';
    setUpdatingTenantId(id);
    try {
      await apiService.patch(`/api/v1/platform/tenants/${id}`, {
        subscription_tier: nextTier
      });
      alert(`Đã cập nhật gói dịch vụ thành công sang ${nextTier}!`);
      fetchTenants();
      fetchMrr();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật gói dịch vụ.');
    } finally {
      setUpdatingTenantId(null);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto text-[#f1f5f9] font-sans">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Billing & Revenue Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Giám sát chỉ số tài chính SaaS, phân tích Cohort, điều phối Subscription và dự đoán tăng trưởng MRR bằng AI.
        </p>
      </div>

      {/* Metrics Header */}
      {mrrData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1e293b] border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Recurring Revenue (MRR)</p>
            <h4 className="text-2xl font-extrabold text-emerald-400">${mrrData.mrr.toLocaleString()}</h4>
            <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><ArrowUpRight size={12} className="text-emerald-400" /> Tăng trưởng ổn định</span>
          </div>

          <div className="bg-[#1e293b] border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Annual Recurring Revenue (ARR)</p>
            <h4 className="text-2xl font-extrabold text-blue-400">${mrrData.arr.toLocaleString()}</h4>
            <span className="text-[10px] text-slate-500 mt-1">MRR nhân với 12 tháng</span>
          </div>

          <div className="bg-[#1e293b] border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">LTV / CAC Ratio</p>
            <h4 className="text-2xl font-extrabold text-purple-400">{(mrrData.ltv_usd / mrrData.cac_usd).toFixed(1)}x</h4>
            <span className="text-[10px] text-slate-500 mt-1">LTV: ${mrrData.ltv_usd} / CAC: ${mrrData.cac_usd}</span>
          </div>

          <div className="bg-[#1e293b] border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Churn Rate</p>
            <h4 className="text-2xl font-extrabold text-rose-400">{mrrData.churn_rate_pct}%</h4>
            <span className="text-[10px] text-slate-500 mt-1">Tỷ lệ hủy gói trung bình tháng</span>
          </div>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex gap-3 border-b border-white/5 pb-4 mb-8">
        <button 
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'overview' 
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Layers size={16} /> Subscription Manager
        </button>
        <button 
          onClick={() => setActiveSubTab('cohorts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'cohorts' 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Users size={16} /> Cohort Retention Analysis
        </button>
        <button 
          onClick={() => setActiveSubTab('forecast')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'forecast' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <TrendingUp size={16} /> AI Revenue Forecast
        </button>
      </div>

      {/* Tab 1: Subscription Manager */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
            <h3 className="text-md font-bold mb-4 text-slate-300">Phân Phối & Nâng Cấp Gói Dịch Vụ Tenants</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Doanh Nghiệp (Tenant)</th>
                    <th className="pb-3">Domain</th>
                    <th className="pb-3">Subscription Tier</th>
                    <th className="pb-3">Trạng Thái</th>
                    <th className="pb-3 text-right">Điều chỉnh gói</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-[#0f172a]/20">
                      <td className="py-3.5 font-bold text-slate-200">{t.company_name}</td>
                      <td className="py-3.5 text-slate-400">{t.domain}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                          t.subscription_tier === 'ENTERPRISE' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {t.subscription_tier}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                          t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleUpdateTier(t.id, t.subscription_tier)}
                          disabled={updatingTenantId === t.id}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold px-3 py-1.5 rounded transition-all text-xs"
                        >
                          {updatingTenantId === t.id ? 'Đang cập nhật...' : `Chuyển sang ${t.subscription_tier === 'STANDARD' ? 'ENTERPRISE' : 'STANDARD'}`}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cohorts */}
      {activeSubTab === 'cohorts' && (
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
          <h3 className="text-md font-bold mb-4 text-purple-400 flex items-center gap-2">
            <BarChart2 size={18} /> Cohort Retention Matrix (Tỷ lệ giữ chân người dùng %)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-left">
                  <th className="pb-3 text-left">Cohort</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Month 1</th>
                  <th className="pb-3">Month 2</th>
                  <th className="pb-3">Month 3</th>
                  <th className="pb-3">Month 4</th>
                  <th className="pb-3">Month 5</th>
                  <th className="pb-3">Month 6</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-[#0f172a]/20 text-left">
                    <td className="py-3.5 font-bold text-slate-200 text-left">{row.cohort}</td>
                    <td className="py-3.5 text-slate-400 text-left">{row.size} Tenants</td>
                    {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((val, idx) => (
                      <td 
                        key={idx} 
                        className="py-3.5 text-center font-semibold"
                        style={{
                          background: val ? `rgba(139, 92, 246, ${val / 200})` : 'transparent',
                          color: val ? '#fff' : '#475569'
                        }}
                      >
                        {val ? `${val}%` : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Forecast */}
      {activeSubTab === 'forecast' && forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
            <h3 className="text-md font-bold mb-4 text-emerald-400 flex items-center gap-2">
              <TrendingUp size={18} /> Dự Đoán Tăng Trưởng MRR 6 Tháng Tiếp Theo
            </h3>
            
            <div className="space-y-4">
              {forecast.forecast_months.map((month: string, i: number) => {
                const standard = forecast.forecasted_mrr[i];
                const opt = forecast.optimistic_mrr[i];
                const pess = forecast.pessimistic_mrr[i];
                
                return (
                  <div key={month} className="bg-[#0f172a]/40 p-4 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{month} 2026</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Dự phóng tăng trưởng</p>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Standard</span>
                        <strong className="text-emerald-400 font-extrabold text-sm">${standard.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Optimistic</span>
                        <strong className="text-indigo-400 font-extrabold text-sm">${opt.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Pessimistic</span>
                        <strong className="text-rose-400 font-extrabold text-sm">${pess.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-6 shadow-xl">
              <h4 className="text-sm font-extrabold text-purple-300 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <Zap size={16} className="text-amber-400" /> AI Pricing Optimization
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {forecast.ai_recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
