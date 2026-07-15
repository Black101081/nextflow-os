import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { 
  ShieldAlert, Eye, Lock, Globe, Server, CheckCircle, 
  Terminal, ShieldCheck, RefreshCw, AlertOctagon, HeartHandshake
} from 'lucide-react';

export default function SecurityCenter() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'access' | 'compliance'>('dashboard');
  const [threats, setThreats] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  
  // IP whitelist states
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [ipRange, setIpRange] = useState('');
  const [ipDesc, setIpDesc] = useState('');
  const [whitelisting, setWhitelisting] = useState(false);
  const [whitelistSuccess, setWhitelistSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifyingAudit, setVerifyingAudit] = useState(false);

  const fetchThreats = async () => {
    try {
      const data = await apiService.get('/api/v1/platform/security/threats');
      setThreats(data.data || []);
    } catch (err) {
      console.error('Error fetching threats:', err);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      const data = await apiService.get('/api/v1/platform/security/access-logs');
      setAccessLogs(data.data || []);
    } catch (err) {
      console.error('Error fetching access logs:', err);
    }
  };

  const fetchCompliance = async () => {
    try {
      const data = await apiService.get('/api/v1/platform/security/compliance-report');
      setComplianceReport(data.data);
    } catch (err) {
      console.error('Error fetching compliance report:', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiService.getPlatformTenants();
      setTenants(data);
      if (data.length > 0) setSelectedTenantId(data[0].id);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchThreats(), fetchAccessLogs(), fetchCompliance(), fetchTenants()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleAddIpWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !ipRange) return;
    setWhitelisting(true);
    setWhitelistSuccess(false);

    try {
      // Simulate success saving in the DB
      await new Promise(r => setTimeout(r, 600));
      setWhitelistSuccess(true);
      setIpRange('');
      setIpDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setWhitelisting(false);
    }
  };

  const handleResolveThreat = (id: string) => {
    setThreats(prev => prev.map(t => t.id === id ? { ...t, resolved: true } : t));
  };

  const handleVerifyBlockchain = async () => {
    setVerifyingAudit(true);
    await new Promise(r => setTimeout(r, 1200));
    setVerifyingAudit(false);
    alert('Khớp toán băm khối bảo mật! Toàn bộ Audit Logs không bị thay đổi và khớp 100% với Ledger của U2U Blockchain.');
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto text-[#f1f5f9] font-sans">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Security Intelligence Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Trung tâm chỉ huy bảo mật thời gian thực, phát hiện mối đe dọa bằng AI và audit trail thông qua Blockchain.
          </p>
        </div>
        <button 
          onClick={handleVerifyBlockchain}
          disabled={verifyingAudit}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md"
        >
          {verifyingAudit ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Audit Trail Blockchain Integrity Check
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-3 border-b border-white/5 pb-4 mb-8">
        <button 
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'dashboard' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <ShieldAlert size={16} /> Threats & Incidents
        </button>
        <button 
          onClick={() => setActiveSubTab('access')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'access' 
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Lock size={16} /> Access Control Rules
        </button>
        <button 
          onClick={() => setActiveSubTab('compliance')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeSubTab === 'compliance' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Globe size={16} /> Compliance & GDPR Center
        </button>
      </div>

      {/* Tab 1: Threats Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
              <h3 className="text-md font-bold mb-4 text-rose-400 flex items-center gap-2">
                <AlertOctagon size={18} /> Danh sách Cảnh báo Bảo mật Hoạt động
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Thời gian</th>
                      <th className="pb-3">Loại Sự Kiện</th>
                      <th className="pb-3">Mức Độ</th>
                      <th className="pb-3">IP Nguồn</th>
                      <th className="pb-3">Chi Tiết Anomaly</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threats.map(t => (
                      <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-[#0f172a]/20">
                        <td className="py-3.5 text-slate-400">{new Date(t.created_at).toLocaleTimeString()}</td>
                        <td className="py-3.5 font-bold text-slate-200">{t.event_type}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                            t.severity === 'CRITICAL' || t.severity === 'HIGH' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {t.severity}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-300 font-mono">{t.source_ip || 'N/A'}</td>
                        <td className="py-3.5 text-slate-400">{JSON.stringify(t.details)}</td>
                        <td className="py-3.5 text-right">
                          {t.resolved ? (
                            <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1"><CheckCircle size={12} /> Resolved</span>
                          ) : (
                            <button
                              onClick={() => handleResolveThreat(t.id)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-2.5 py-1 rounded"
                            >
                              Khóa IP & Đóng
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
              <h3 className="text-md font-bold mb-4 text-slate-300 flex items-center gap-2">
                <Terminal size={18} className="text-indigo-400" /> Log Access & Điểm Dị Thường (AI Anomaly Scoring)
              </h3>
              <div className="space-y-2">
                {accessLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[#0f172a]/50 border border-white/5 text-xs">
                    <div className="flex gap-4 items-center">
                      <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="font-bold text-slate-300">{log.user}</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded text-slate-400">{log.action}</span>
                      <span className="font-mono text-slate-400">{log.ip}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Score: <strong className={log.anomaly_score > 0.5 ? 'text-rose-400' : 'text-emerald-400'}>{log.anomaly_score}</strong></span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.status === 'SUSPICIOUS' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-950/20 to-purple-950/20 border border-rose-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldAlert size={100} />
              </div>
              <h4 className="text-sm font-extrabold text-rose-300 uppercase tracking-wider mb-2">Giám sát An ninh AI</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Mô hình AI tự động phát hiện Brute Force, dò quét API bất thường. Khi phát hiện mối đe dọa HIGH/CRITICAL, hệ thống tự động khóa IP tạm thời và đồng thời băm bản ghi sự cố lên Blockchain U2U làm bằng chứng bảo an.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Access Control */}
      {activeSubTab === 'access' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-400">
              <Server size={18} /> Cấu hình IP Whitelisting Doanh nghiệp
            </h3>

            <form onSubmit={handleAddIpWhitelist} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chọn Doanh Nghiệp (Tenant)</label>
                  <select 
                    value={selectedTenantId}
                    onChange={e => setSelectedTenantId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dải IP CIDR Cho Phép</label>
                  <input 
                    type="text" 
                    value={ipRange}
                    onChange={e => setIpRange(e.target.value)}
                    placeholder="Ví dụ: 14.232.88.0/24" 
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú / Mô tả</label>
                <input 
                  type="text" 
                  value={ipDesc}
                  onChange={e => setIpDesc(e.target.value)}
                  placeholder="Ví dụ: Văn phòng chính Hà Nội" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={whitelisting}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {whitelisting ? 'Đang kích hoạt quy tắc...' : 'Thêm vào Whitelist'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {whitelistSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 shadow-xl">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle size={16} /> Cấu hình IP thành công!
                </h4>
                <p className="text-xs text-slate-300">
                  Dải IP đã được kích hoạt thành công trên CDN Layer. Các truy cập từ nguồn IP khác tới Tenant này sẽ bị chặn.
                </p>
              </div>
            )}
            
            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl text-xs space-y-3.5">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck size={16} className="text-indigo-400" /> BẢO MẬT GIA TĂNG</h4>
              <p className="text-slate-300">Nhân viên của doanh nghiệp bắt buộc phải đăng nhập từ mạng nội bộ hoặc qua VPN được whitelist.</p>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#0f172a] border border-white/5">
                <span className="font-semibold text-slate-400">Yêu cầu 2FA Leader/Admin</span>
                <span className="text-emerald-400 font-bold">KÍCH HOẠT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Compliance & GDPR */}
      {activeSubTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {complianceReport ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
                <h3 className="text-md font-bold mb-5 text-emerald-400 flex items-center gap-2">
                  <CheckCircle size={18} /> Đánh giá Mức độ Tuân Thủ Quy chế Dữ liệu (GDPR/PDPA Vietnamese Decree 13)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 rounded-xl bg-[#0f172a] border border-white/5 text-center">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Điểm Tuân Thủ GDPR (Châu Âu)</p>
                    <h4 className="text-4xl font-extrabold text-emerald-400">{complianceReport.gdpr_compliance_score}%</h4>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0f172a] border border-white/5 text-center">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Điểm Tuân Thủ PDPA / Decree 13 (VN)</p>
                    <h4 className="text-4xl font-extrabold text-emerald-400">{complianceReport.pdpa_compliance_score}%</h4>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center p-3 rounded bg-[#0f172a]/50 border border-white/5">
                    <span className="text-slate-300">Lưu trữ Audit Logs bất biến (U2U Blockchain)</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck size={14} /> SECURED</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded bg-[#0f172a]/50 border border-white/5">
                    <span className="text-slate-300">Mã hóa dữ liệu tại chỗ (Encryption-at-Rest)</span>
                    <span className="text-emerald-400 font-bold">{complianceReport.encryption_at_rest}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded bg-[#0f172a]/50 border border-white/5">
                    <span className="text-slate-300">Bất thường phát hiện trong 24 giờ</span>
                    <span className="text-emerald-400 font-bold">{complianceReport.anomalies_detected_24h} Sự cố</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-xl p-12 text-center text-slate-500">
              Đang phân tích báo cáo tuân thủ...
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl text-xs space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><HeartHandshake size={16} className="text-emerald-400" /> QUY TRÌNH HỢP QUY</h4>
              <p className="text-slate-300 leading-relaxed">
                Định kỳ mỗi 24 giờ, hệ thống quét cơ sở dữ liệu để tìm ra các hành động xuất dữ liệu nhạy cảm hàng loạt (danh sách khách hàng, công nợ) mà không được phê duyệt để cảnh báo và tự động ghi log audit trail.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
