import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { 
  Building, ShieldCheck, DatabaseBackup, Send, CheckCircle2, AlertTriangle, 
  Activity, ArrowRight, UserPlus, Info, Zap, Download, RefreshCw
} from 'lucide-react';

export default function TenantLifecycleManager() {
  const [activeSubTab, setActiveSubTab] = useState<'provision' | 'health' | 'migrate'>('provision');
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [healthData, setHealthData] = useState<any>(null);
  
  // Provision form states
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [tier, setTier] = useState('STANDARD');
  const [selectedModules, setSelectedModules] = useState<string[]>(['Finance', 'HR', 'CRM', 'POS']);
  const [seedDemoData, setSeedDemoData] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState<any>(null);

  // Migration states
  const [sourceSystem, setSourceSystem] = useState('kiotviet');
  const [migrationPayload, setMigrationPayload] = useState('');
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  // General lists
  const availableModules = ['Finance', 'HR', 'CRM', 'POS', 'Inventory', 'Automation', 'Blockchain', 'AI'];

  const fetchTenants = async () => {
    try {
      const data = await apiService.getPlatformTenants();
      setTenants(data);
      if (data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const fetchHealth = async (id: string) => {
    if (!id) return;
    try {
      const res = await apiService.get(`/api/v1/platform/tenants/${id}/health-score`);
      setHealthData(res.data);
    } catch (err) {
      console.error('Error fetching health score:', err);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchHealth(selectedTenantId);
    }
  }, [selectedTenantId]);

  const handleModuleToggle = (mod: string) => {
    if (selectedModules.includes(mod)) {
      setSelectedModules(selectedModules.filter(m => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !domain) return;
    setProvisioning(true);
    setProvisionResult(null);

    try {
      const res = await apiService.post('/api/v1/platform/tenants/provision', {
        company_name: companyName,
        domain: domain,
        subscription_tier: tier,
        activate_modules: selectedModules,
        seed_demo_data: seedDemoData
      });
      setProvisionResult(res.data);
      setCompanyName('');
      setDomain('');
      fetchTenants();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kích hoạt Tenant mới.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !migrationPayload) return;
    setMigrating(true);
    setMigrationResult(null);

    try {
      const res = await apiService.post(`/api/v1/platform/tenants/${selectedTenantId}/migrate`, {
        source_system: sourceSystem,
        data_payload: migrationPayload
      });
      setMigrationResult(res.data);
      setMigrationPayload('');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi import dữ liệu.');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto text-[#f1f5f9] font-sans">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Tenant Lifecycle Manager (TLM)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Tự động hóa onboarding, đánh giá rủi ro rời bỏ hệ thống bằng AI và hỗ trợ dịch chuyển dữ liệu.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-3 border-b border-white/5 pb-4 mb-8">
        <button 
          onClick={() => setActiveSubTab('provision')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'provision' 
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <UserPlus size={16} /> Onboarding Wizard
        </button>
        <button 
          onClick={() => setActiveSubTab('health')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'health' 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Activity size={16} /> AI Health Dashboard
        </button>
        <button 
          onClick={() => setActiveSubTab('migrate')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'migrate' 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <DatabaseBackup size={16} /> Data Migration Center
        </button>
      </div>

      {/* Tab: Provisioning Wizard */}
      {activeSubTab === 'provision' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-400">
              <Building size={18} /> Khởi tạo Tenant & Provisioning Tự Động
            </h3>
            
            <form onSubmit={handleProvision} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên Doanh Nghiệp / Công Ty</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Ví dụ: Công ty TNHH Cà phê Việt" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Domain Tùy Chỉnh</label>
                  <input 
                    type="text" 
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder="vietcoffee" 
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subscription Tier</label>
                  <select 
                    value={tier}
                    onChange={e => setTier(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="STANDARD">Standard ($99/mo)</option>
                    <option value="ENTERPRISE">Enterprise ($499/mo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kích hoạt Module Nghiệp vụ</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableModules.map(mod => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => handleModuleToggle(mod)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                        selectedModules.includes(mod)
                          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                          : 'bg-[#0f172a] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0f172a]/50 p-3 rounded-lg border border-white/5">
                <input 
                  type="checkbox" 
                  id="seedDemo"
                  checked={seedDemoData}
                  onChange={e => setSeedDemoData(e.target.checked)}
                  className="rounded bg-[#0f172a] border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="seedDemo" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  Tự động nạp dữ liệu mẫu (Seeding Demo Data) cho F&B/Spa/Retail.
                </label>
              </div>

              <button
                type="submit"
                disabled={provisioning}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {provisioning ? (
                  <>Đang thiết lập cơ sở dữ liệu...</>
                ) : (
                  <>
                    <Send size={16} /> Bắt đầu Provisioning Tenant
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                <Info size={16} className="text-indigo-400" /> QUY TRÌNH PROVISIONING
              </h4>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex gap-2">
                  <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold">1</span>
                  <span>Thiết lập Schema riêng biệt cho Tenant trên PostgreSQL.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold">2</span>
                  <span>Khởi tạo User quản trị (LEADER) mặc định.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold">3</span>
                  <span>Thiết lập Policies & Seeding dữ liệu mẫu (nếu chọn).</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold">4</span>
                  <span>Ghi băm trạng thái nâng cấp hạ tầng & log Blockchain U2U.</span>
                </li>
              </ul>
            </div>

            {provisionResult && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 shadow-xl">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Khởi tạo thành công!
                </h4>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300">Tenant ID: <code className="bg-[#0f172a] px-1.5 py-0.5 rounded text-indigo-400">{provisionResult.tenant_id}</code></p>
                  <p className="text-slate-300">Email quản trị: <code className="bg-[#0f172a] px-1.5 py-0.5 rounded text-emerald-400">{provisionResult.admin_email}</code></p>
                  <p className="text-slate-300">Mật khẩu mặc định: <code className="bg-[#0f172a] px-1.5 py-0.5 rounded text-amber-400">admin123</code></p>
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 text-[10px] text-slate-400 break-all">
                    Blockchain Hash: <span className="text-indigo-300">{provisionResult.blockchain_tx}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AI Health Dashboard */}
      {activeSubTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl lg:col-span-1">
            <h3 className="text-md font-bold mb-4 text-slate-300">Danh sách Tenant</h3>
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
              {tenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTenantId(t.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex justify-between items-center ${
                    selectedTenantId === t.id
                      ? 'bg-purple-500/10 border-purple-500/50 text-white'
                      : 'bg-[#0f172a] border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-sm">{t.company_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{t.subscription_tier} • {t.domain}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {healthData ? (
              <div className="space-y-6">
                <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                      <Activity size={20} /> Chỉ số Sức Khỏe AI (Usage & Engagement)
                    </h3>
                    <span className="text-xs text-slate-500">Cập nhật: {new Date(healthData.computed_at).toLocaleTimeString()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 text-center relative overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Health Score</p>
                      <h4 className="text-3xl font-extrabold text-purple-400">{healthData.score}%</h4>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" style={{ width: `${healthData.score}%` }}></div>
                    </div>

                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 text-center relative overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Churn Risk</p>
                      <h4 className={`text-2xl font-extrabold mt-1 ${
                        healthData.churn_risk === 'LOW' ? 'text-emerald-400' : 
                        healthData.churn_risk === 'MEDIUM' ? 'text-amber-400' : 'text-rose-500'
                      }`}>{healthData.churn_risk}</h4>
                    </div>

                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 text-center relative overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Usage Score</p>
                      <h4 className="text-3xl font-extrabold text-blue-400">{healthData.usage_score}%</h4>
                    </div>

                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 text-center relative overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Growth Speed</p>
                      <h4 className="text-3xl font-extrabold text-emerald-400">+{healthData.growth_velocity}%</h4>
                    </div>
                  </div>

                  {/* AI Recommendation Card */}
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-purple-300 mb-2.5 flex items-center gap-1.5">
                      <Zap size={16} className="text-amber-400" /> Đề xuất tự động từ AI Agent (Engagement)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {healthData.ai_recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e293b] border border-white/5 rounded-xl p-12 text-center text-slate-500">
                Vui lòng chọn Tenant để kiểm tra chỉ số sức khỏe.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Data Migration */}
      {activeSubTab === 'migrate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
              <DatabaseBackup size={18} /> Dịch chuyển Dữ liệu Doanh nghiệp (Excel / Sapo / KiotViet)
            </h3>

            <form onSubmit={handleMigration} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Tenant</label>
                  <select 
                    value={selectedTenantId}
                    onChange={e => setSelectedTenantId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.company_name} ({t.domain})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nguồn Hệ thống cũ</label>
                  <select 
                    value={sourceSystem}
                    onChange={e => setSourceSystem(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  >
                    <option value="kiotviet">KiotViet (JSON Catalog)</option>
                    <option value="sapo">Sapo (CSV Import)</option>
                    <option value="excel">Excel Template Standard</option>
                    <option value="custom">API Gateway Integration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dữ liệu Migration Payload (JSON / CSV)</label>
                <textarea
                  rows={6}
                  value={migrationPayload}
                  onChange={e => setMigrationPayload(e.target.value)}
                  placeholder='Ví dụ: { "customers": [...], "inventory": [...], "invoices": [...] }'
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={migrating}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {migrating ? (
                  <>Đang dịch chuyển dữ liệu...</>
                ) : (
                  <>
                    <RefreshCw size={16} className="animate-spin-slow" /> Bắt đầu Tiến Trình Migration
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                <Info size={16} className="text-amber-400" /> HỖ TRỢ ĐỊNH DẠNG
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Hệ thống hỗ trợ tự động chuẩn hóa trường dữ liệu bằng AI. Bạn chỉ cần xuất tệp sản phẩm/khách hàng từ KiotViet hoặc Sapo dưới dạng JSON/Excel và dán vào box bên trái.
              </p>
              <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold">
                <Download size={14} /> Tải xuống Excel template mẫu
              </button>
            </div>

            {migrationResult && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 shadow-xl">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Migration Thành Công!
                </h4>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-300">Migration ID: <span className="text-slate-400 font-mono">{migrationResult.migration_id}</span></p>
                  <p className="text-slate-300">Hệ thống nguồn: <span className="text-amber-400 capitalize font-bold">{migrationResult.source}</span></p>
                  <p className="text-slate-300">Dữ liệu đã nạp: <span className="text-emerald-400 font-bold">{migrationResult.imported_count} bản ghi</span></p>
                  <p className="text-slate-300">Trạng thái: <span className="text-emerald-400 font-bold">{migrationResult.status}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
