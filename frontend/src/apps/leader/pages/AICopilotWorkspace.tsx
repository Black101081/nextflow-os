import { useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiService } from '../../../shared/services/api';
import { Brain, DollarSign, Users, Package, Award, Sparkles, TrendingUp, AlertTriangle, UserCheck, ShieldAlert, HeartHandshake, Smile, RefreshCw, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AICopilotWorkspace() {
  const { auth } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'finance' | 'hr' | 'inventory' | 'crm' | 'feedback'>('finance');
  const [loading, setLoading] = useState(false);

  // --- Financial State ---
  const [cashflowHistory] = useState([
    { name: 'D1-10', type: 'INCOME', amount: 45000000 },
    { name: 'D11-20', type: 'EXPENSE', amount: 32000000 },
    { name: 'D21-30', type: 'INCOME', amount: 28000000 },
  ]);
  const [cashflowForecast, setCashflowForecast] = useState<number[]>([]);
  const [cashflowRemark, setCashflowRemark] = useState('');
  
  const [expenseDesc, setExpenseDesc] = useState('Nhập nguyên liệu cà phê Robusta và sữa tươi 5,000,000đ');
  const [expenseCategory, setExpenseCategory] = useState<any>(null);

  const [receivables] = useState([
    { customer_name: 'Nguyễn Văn A', amount: 15000000, due_days: 45 },
    { customer_name: 'Trần Thị B', amount: 8000000, due_days: 12 },
    { customer_name: 'Công ty C', amount: 42000000, due_days: 95 },
  ]);
  const [debtAnalysis, setDebtAnalysis] = useState<any[]>([]);

  // --- HR State ---
  const [attendance] = useState([
    { employee_id: 'emp-01', name: 'Lê Văn Thắng', hours_worked: 176, overtime_hours: 12, days: [{ overtime_hours: 2 }, { overtime_hours: 3 }] },
    { employee_id: 'emp-02', name: 'Phạm Minh Trang', hours_worked: 180, overtime_hours: 24, days: [{ overtime_hours: 4 }, { overtime_hours: 4 }] },
    { employee_id: 'emp-03', name: 'Đỗ Hữu Hưng', hours_worked: 160, overtime_hours: 0, days: [] },
  ]);
  const [baseRates] = useState<any>({
    'emp-01': 45000,
    'emp-02': 50000,
    'emp-03': 40000,
  });
  const [payrollResult, setPayrollResult] = useState<any[]>([]);
  const [burnoutResult, setBurnoutResult] = useState<any[]>([]);

  // --- Inventory State ---
  const [stockLevels] = useState([
    { product_id: 'prod-01', product_name: 'Hạt Cà Phê Espresso Blend', current_level: 5, min_level: 20, avg_daily_sales: 2.5 },
    { product_id: 'prod-02', product_name: 'Ly Giấy 12oz', current_level: 450, min_level: 200, avg_daily_sales: 35 },
    { product_id: 'prod-03', product_name: 'Sữa Đặc Ngôi Sao', current_level: 8, min_level: 15, avg_daily_sales: 1.8 },
  ]);
  const [poHistory] = useState([
    { supplier_name: 'Supplier Alpha', value: 15000000, delivered_on_time: true },
    { supplier_name: 'Supplier Alpha', value: 20000000, delivered_on_time: false },
    { supplier_name: 'Supplier Beta', value: 8000000, delivered_on_time: true },
    { supplier_name: 'Supplier Gamma', value: 45000000, delivered_on_time: true },
  ]);
  const [demandPlan, setDemandPlan] = useState<any[]>([]);
  const [supplierScores, setSupplierScores] = useState<any[]>([]);

  // --- CRM & Booking State ---
  const [customerActivities] = useState([
    { customer_id: 'cust-01', customer_name: 'Lê Hoài Nam', recency_days: 95, support_tickets_count: 4, frequency_30d: 0 },
    { customer_id: 'cust-02', customer_name: 'Nguyễn Bích Thủy', recency_days: 5, support_tickets_count: 0, frequency_30d: 8 },
    { customer_id: 'cust-03', customer_name: 'Vương Thế Anh', recency_days: 35, support_tickets_count: 2, frequency_30d: 1 },
  ]);
  const [churnPredictions, setChurnPredictions] = useState<any[]>([]);
  
  const [upsellProfile, setUpsellProfile] = useState<any>({
    purchased_items: ['Standard Pack', 'POS Basic'],
    industry: 'F&B',
  });
  const [upsellRecs, setUpsellRecs] = useState<any[]>([]);

  const [bookingRequest] = useState({
    availability: {
      'Nguyễn Hồng Hạnh (Nail Stylist)': ['09', '10', '11', '14'],
      'Trần Văn Kiên (Hair Expert)': ['10', '13', '15', '16'],
    },
    duration_minutes: 60,
  });
  const [bookingSlots, setBookingSlots] = useState<any[]>([]);

  // --- Feedback Sentiment State ---
  const [feedbackText, setFeedbackText] = useState('Đồ uống ngon, không gian rất sạch sẽ và nhân viên nhiệt tình phục vụ nhanh chóng. Sẽ quay lại nhiều lần!');
  const [sentimentResult, setSentimentResult] = useState<any>(null);

  // --- Actions ---
  const runFinanceAI = async () => {
    setLoading(true);
    try {
      const forecastRes = await apiService.runCashflowForecast(auth, cashflowHistory);
      setCashflowForecast(forecastRes.forecast_30d || []);
      setCashflowRemark(forecastRes.ai_remark || '');

      const debtRes = await apiService.runDebtCollection(auth, receivables);
      setDebtAnalysis(debtRes.ranked_receivables || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runCategorizeAI = async () => {
    setLoading(true);
    try {
      const catRes = await apiService.runExpenseCategorize(auth, expenseDesc);
      setExpenseCategory(catRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runHrAI = async () => {
    setLoading(true);
    try {
      const payrollRes = await apiService.runPayrollCalculate(auth, attendance, baseRates);
      setPayrollResult(payrollRes.payroll_items || []);

      const formattedAttendance = attendance.map(a => ({
        employee_id: a.employee_id,
        name: a.name,
        days: a.days,
        consecutive_days_worked: 6
      }));
      const burnoutRes = await apiService.runBurnoutDetect(auth, formattedAttendance);
      setBurnoutResult(burnoutRes.burnout_risks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runInventoryAI = async () => {
    setLoading(true);
    try {
      const planRes = await apiService.runDemandPlan(auth, stockLevels);
      setDemandPlan(planRes.reorder_plan || []);

      const scoreRes = await apiService.runSupplierScore(auth, poHistory);
      setSupplierScores(scoreRes.supplier_rankings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runCrmAI = async () => {
    setLoading(true);
    try {
      const churnRes = await apiService.runChurnPredict(auth, customerActivities);
      setChurnPredictions(churnRes.churn_predictions || []);

      const upsellRes = await apiService.runUpsellRecommend(auth, upsellProfile);
      setUpsellRecs(upsellRes.recommendations || []);

      const bookingRes = await apiService.runSmartSchedule(auth, bookingRequest);
      setBookingSlots(bookingRes.optimal_slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runSentimentAI = async () => {
    setLoading(true);
    try {
      const res = await apiService.runSentimentAnalyze(auth, feedbackText);
      setSentimentResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forecastChartData = cashflowForecast.map((val, idx) => ({
    day: `Ngày ${idx + 1}`,
    'Dự báo (VND)': Math.round(val),
  }));

  return (
    <div className="p-8 font-['Outfit'] space-y-6 text-slate-100 min-h-screen bg-[#0b0f19]">
      {/* Premium Copilot Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#141d33] to-[#0b0f19] p-6 rounded-2xl border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Brain size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
              NextFlow AI Copilot Workspace <Sparkles className="text-purple-400" size={20} />
            </h1>
            <p className="text-slate-400 text-sm mt-1">Hệ thống kích hoạt và điều phối 13 AI Agents đa tác vụ cấp doanh nghiệp.</p>
          </div>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-2">
        {(['finance', 'hr', 'inventory', 'crm', 'feedback'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                : 'text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800'
            }`}
          >
            {cat === 'finance' && <DollarSign size={16} />}
            {cat === 'hr' && <Users size={16} />}
            {cat === 'inventory' && <Package size={16} />}
            {cat === 'crm' && <Award size={16} />}
            {cat === 'feedback' && <MessageSquare size={16} />}
            <span className="capitalize">{cat === 'crm' ? 'CRM & Booking' : cat} AI</span>
          </button>
        ))}
      </div>

      {/* Workspace Body */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* --- Finance Tab --- */}
        {activeCategory === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Agent 1: CashFlowForecastAgent */}
              <div className="lg:col-span-2 bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-emerald-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">CashFlowForecastAgent</h3>
                      <p className="text-xs text-slate-400">Dự phóng và cảnh báo tình trạng dòng tiền 30 ngày.</p>
                    </div>
                  </div>
                  <button
                    onClick={runFinanceAI}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Chạy Dự Báo'}
                  </button>
                </div>

                {cashflowForecast.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastChartData}>
                          <defs>
                            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                          <Area type="monotone" dataKey="Dự báo (VND)" stroke="#10b981" fillOpacity={1} fill="url(#colorCash)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300">
                      <span className="font-bold text-indigo-400 block mb-1">💡 Nhận xét của AI:</span>
                      {cashflowRemark}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa có kết quả dự báo. Bấm "Chạy Dự Báo".</div>
                )}
              </div>

              {/* Agent 2: ExpenseCategorizerAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-indigo-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">ExpenseCategorizerAgent</h3>
                      <p className="text-xs text-slate-400">Phân loại chi phí từ mô tả tự do.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Mô tả giao dịch chi tiêu:</label>
                    <textarea
                      value={expenseDesc}
                      onChange={e => setExpenseDesc(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {expenseCategory && (
                    <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Nhóm:</span>
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-bold text-xs font-mono">{expenseCategory.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Độ tin cậy:</span>
                        <span className="text-emerald-400 font-mono font-bold text-xs">{(expenseCategory.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-slate-500 leading-normal border-t border-slate-800/80 pt-2 mt-1">
                        {expenseCategory.reason}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={runCategorizeAI}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all"
                  >
                    {loading ? 'Đang phân tích...' : 'Phân Loại Bằng AI'}
                  </button>
                </div>
              </div>
            </div>

            {/* Agent 3: DebtCollectionAgent */}
            <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-amber-500" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">DebtCollectionAgent</h3>
                    <p className="text-xs text-slate-400">Đánh giá rủi ro công nợ quá hạn và đề xuất hành động.</p>
                  </div>
                </div>
                {debtAnalysis.length === 0 && (
                  <button
                    onClick={runFinanceAI}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
                  >
                    Phân Tích Công Nợ
                  </button>
                )}
              </div>

              {debtAnalysis.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3">Khách Hàng</th>
                        <th className="pb-3">Số Tiền (VND)</th>
                        <th className="pb-3 text-center">Số Ngày Quá Hạn</th>
                        <th className="pb-3 text-center">Chỉ Số Rủi Ro</th>
                        <th className="pb-3 text-center">Độ Ưu Tiên</th>
                        <th className="pb-3 text-right">Hành Động Đề Xuất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {debtAnalysis.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-3 font-bold">{item.customer_name}</td>
                          <td className="py-3 font-mono">{item.amount.toLocaleString()}đ</td>
                          <td className="py-3 text-center font-mono">{item.due_days} ngày</td>
                          <td className="py-3 text-center">
                            <span className="font-mono text-amber-500 font-bold">{item.risk_score.toFixed(1)}/100</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              item.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>{item.priority}</span>
                          </td>
                          <td className="py-3 text-right text-slate-400 text-xs">{item.recommended_action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">Chưa thực thi phân tích rủi ro công nợ.</div>
              )}
            </div>
          </div>
        )}

        {/* --- HR Tab --- */}
        {activeCategory === 'hr' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Agent 4: PayrollCalculatorAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UserCheck className="text-indigo-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">PayrollCalculatorAgent</h3>
                      <p className="text-xs text-slate-400">Tự động hóa tính lương dựa trên số giờ làm và tăng ca.</p>
                    </div>
                  </div>
                  <button
                    onClick={runHrAI}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all"
                  >
                    Tính Lương
                  </button>
                </div>

                {payrollResult.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-3">Nhân Viên</th>
                          <th className="pb-3">Giờ Làm</th>
                          <th className="pb-3">Làm Thêm</th>
                          <th className="pb-3">Lương Trước Thuế</th>
                          <th className="pb-3 text-right">Lương Thực Nhận (Net)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {payrollResult.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="py-3 font-bold">{item.name}</td>
                            <td className="py-3 font-mono">{item.hours_worked}h</td>
                            <td className="py-3 font-mono">+{item.overtime_hours}h</td>
                            <td className="py-3 font-mono text-slate-300">{item.gross_salary.toLocaleString()}đ</td>
                            <td className="py-3 text-right font-mono text-emerald-400 font-bold">{item.net_salary.toLocaleString()}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa có bảng lương tháng này.</div>
                )}
              </div>

              {/* Agent 5: BurnoutDetectorAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-rose-500" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">BurnoutDetectorAgent</h3>
                      <p className="text-xs text-slate-400">Dự đoán mức độ quá tải công việc của nhân sự.</p>
                    </div>
                  </div>
                  {burnoutResult.length === 0 && (
                    <button
                      onClick={runHrAI}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      Kiểm Tra Sức Khỏe Nhân Sự
                    </button>
                  )}
                </div>

                {burnoutResult.length > 0 ? (
                  <div className="space-y-4">
                    {burnoutResult.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-400 leading-normal">{item.recommendation}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold block ${
                            item.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            item.risk_level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>{item.risk_level} RISK</span>
                          <span className="text-xs font-mono text-slate-500 mt-1 block">Score: {item.burnout_score.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa quét dữ liệu mệt mỏi/burnout.</div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- Inventory Tab --- */}
        {activeCategory === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Agent 6: DemandPlannerAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Package className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">DemandPlannerAgent</h3>
                      <p className="text-xs text-slate-400">Phát hiện cạn kho sớm và lập kế hoạch reorder thông minh.</p>
                    </div>
                  </div>
                  <button
                    onClick={runInventoryAI}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all"
                  >
                    Quét Tồn Kho
                  </button>
                </div>

                {demandPlan.length > 0 ? (
                  <div className="space-y-3">
                    {demandPlan.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">{item.product_name}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.note}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold block ${
                            item.status === 'CRITICAL_REORDER' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            item.status === 'WARNING_REORDER' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>{item.status}</span>
                          {item.recommended_order_qty > 0 && (
                            <span className="text-xs text-indigo-400 font-mono font-bold mt-1 block">Đặt thêm: {item.recommended_order_qty} chiếc</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa quét kế hoạch đặt hàng.</div>
                )}
              </div>

              {/* Agent 7: SupplierScorerAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Award className="text-purple-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">SupplierScorerAgent</h3>
                      <p className="text-xs text-slate-400">Tính toán mức độ tín nhiệm & xếp hạng nhà cung cấp.</p>
                    </div>
                  </div>
                  {supplierScores.length === 0 && (
                    <button
                      onClick={runInventoryAI}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      Đánh Giá Nhà Cung Cấp
                    </button>
                  )}
                </div>

                {supplierScores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-3">Nhà Cung Cấp</th>
                          <th className="pb-3 text-center">Đơn Hàng</th>
                          <th className="pb-3 text-center">Giao Đúng Hạn</th>
                          <th className="pb-3 text-center">Điểm AI</th>
                          <th className="pb-3 text-right">Phân Hạng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {supplierScores.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="py-3 font-bold">{item.supplier_name}</td>
                            <td className="py-3 text-center font-mono">{item.total_orders} PO</td>
                            <td className="py-3 text-center font-mono text-emerald-400">{item.reliability_rate_pct.toFixed(0)}%</td>
                            <td className="py-3 text-center font-mono text-indigo-400 font-bold">{item.score.toFixed(1)}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-xs font-black ${
                                item.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                item.grade === 'B' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>{item.grade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa chấm điểm nhà cung cấp.</div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- CRM & Booking Tab --- */}
        {activeCategory === 'crm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Agent 8: ChurnPredictorAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="text-rose-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">ChurnPredictorAgent</h3>
                      <p className="text-xs text-slate-400">Tính tỉ lệ rời đi và đề xuất chăm sóc khách hàng.</p>
                    </div>
                  </div>
                  <button
                    onClick={runCrmAI}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all"
                  >
                    Dự Báo Churn
                  </button>
                </div>

                {churnPredictions.length > 0 ? (
                  <div className="space-y-3">
                    {churnPredictions.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{item.customer_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            item.status === 'CHURNING' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            item.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>{item.status}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Khả năng rời bỏ:</span>
                          <span className="font-bold text-rose-400">{item.churn_probability_pct.toFixed(0)}%</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-800/80 pt-1 mt-1">{item.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa tính tỷ lệ churn.</div>
                )}
              </div>

              {/* Agent 9: UpsellRecommenderAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-indigo-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">UpsellRecommenderAgent</h3>
                      <p className="text-xs text-slate-400">Khám phá cơ hội bán thêm thông minh.</p>
                    </div>
                  </div>
                  {upsellRecs.length === 0 && (
                    <button
                      onClick={runCrmAI}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      Tìm Gợi Ý Upsell
                    </button>
                  )}
                </div>

                {upsellRecs.length > 0 ? (
                  <div className="space-y-4">
                    {upsellRecs.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-indigo-400">{item.target_product}</span>
                          <span className="text-emerald-400 font-mono font-bold text-xs">{item.price_diff}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-semibold">{item.benefit}</p>
                        <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-800/80 pt-1 mt-1">"{item.pitch}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa có dữ liệu upsell.</div>
                )}
              </div>

              {/* Agent 10: SmartSchedulerAgent */}
              <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="text-emerald-400" size={24} />
                    <div>
                      <h3 className="font-bold text-lg">SmartSchedulerAgent</h3>
                      <p className="text-xs text-slate-400">Tìm kiếm khung giờ đặt lịch rảnh rỗi tối ưu nhất.</p>
                    </div>
                  </div>
                  {bookingSlots.length === 0 && (
                    <button
                      onClick={runCrmAI}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      Tìm Khung Giờ
                    </button>
                  )}
                </div>

                {bookingSlots.length > 0 ? (
                  <div className="space-y-3">
                    {bookingSlots.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-slate-200">{item.employee_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">{new Date(item.slot_time).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400">{item.suitability_score}% Match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">Chưa tính khung giờ đặt lịch.</div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- Feedback Tab --- */}
        {activeCategory === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Agent 11: SentimentAnalyzerAgent */}
            <div className="lg:col-span-2 bg-[#141b2d] border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Smile className="text-indigo-400" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">SentimentAnalyzerAgent</h3>
                    <p className="text-xs text-slate-400">Phân tích cảm xúc phản hồi khách hàng và trích xuất ý chính.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Phản hồi của khách hàng:</label>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                  rows={4}
                />
              </div>

              <button
                onClick={runSentimentAI}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all"
              >
                {loading ? 'Đang phân tích...' : 'Phân Tích Bằng AI'}
              </button>
            </div>

            {/* Sentiment Results */}
            <div className="bg-[#141b2d] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-md border-b border-slate-800 pb-3">Kết quả phân tích</h3>

                {sentimentResult ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Cảm xúc:</span>
                      <span className={`px-2.5 py-1 rounded text-xs font-black ${
                        sentimentResult.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        sentimentResult.sentiment === 'NEGATIVE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>{sentimentResult.sentiment}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Chỉ số cảm xúc:</span>
                      <span className="text-indigo-400 font-mono font-bold">{(sentimentResult.score * 100).toFixed(0)}/100</span>
                    </div>

                    <div className="space-y-2 border-t border-slate-800/80 pt-3">
                      <span className="text-xs text-slate-400 font-bold block mb-1">Ý chính rút ra:</span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300 leading-normal">
                        {sentimentResult.key_insights?.map((insight: string, idx: number) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Chưa phân tích phản hồi.</div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 leading-normal">
                Sử dụng Gemini LLM phân tích cảm xúc từ phản hồi khách hàng để đề xuất chính sách chăm sóc/Loyalty tự động.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
