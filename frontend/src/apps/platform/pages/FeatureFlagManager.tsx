import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import { 
  ToggleLeft, ToggleRight, Plus, Info, Settings, 
  Trash2, ShieldCheck, RefreshCw, Send, CheckCircle2, Sliders
} from 'lucide-react';

export default function FeatureFlagManager() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [flagKey, setFlagKey] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DISABLED');
  const [rolloutType, setRolloutType] = useState('GLOBAL');
  const [rulesJson, setRulesJson] = useState('{}');
  const [submitting, setSubmitting] = useState(false);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/api/v1/platform/feature-flags');
      setFlags(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggleStatus = async (flag: any) => {
    const nextStatus = flag.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      await apiService.put(`/api/v1/platform/feature-flags/${flag.id}`, {
        flag_key: flag.flag_key,
        description: flag.description,
        status: nextStatus,
        rollout_type: flag.rollout_type,
        rollout_rules: flag.rollout_rules
      });
      fetchFlags();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật Feature Flag.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagKey) return;
    setSubmitting(true);

    try {
      let parsedRules = {};
      try {
        parsedRules = JSON.parse(rulesJson);
      } catch {
        alert('Định dạng JSON quy tắc không hợp lệ!');
        setSubmitting(false);
        return;
      }

      await apiService.post('/api/v1/platform/feature-flags', {
        flag_key: flagKey,
        description: description,
        status: status,
        rollout_type: rolloutType,
        rollout_rules: parsedRules
      });

      setShowCreateModal(false);
      setFlagKey('');
      setDescription('');
      setRulesJson('{}');
      fetchFlags();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo Feature Flag.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto text-[#f1f5f9] font-sans">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Feature Flags & Rollout Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Điều phối và cấu hình các tính năng của hệ thống (Feature Flags) cho từng Tenant, Subscription Tier hoặc chia tỉ lệ phần trăm.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md"
        >
          <Plus size={14} /> Khai Báo Cờ Tính Năng
        </button>
      </div>

      {/* Flags List */}
      <div className="bg-[#1e293b] border border-white/5 rounded-xl p-6 shadow-xl">
        <h3 className="text-md font-bold mb-4 text-slate-300 flex items-center gap-2">
          <Sliders size={18} className="text-indigo-400" /> Quản lý Trạng thái Rollout
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Đang tải danh sách cờ tính năng...
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Chưa có cờ tính năng nào được cấu hình trong DB.
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map(flag => (
              <div key={flag.id} className="flex justify-between items-center p-4 rounded-xl bg-[#0f172a]/50 border border-white/5 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <strong className="text-sm font-extrabold text-indigo-300 font-mono">{flag.flag_key}</strong>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      flag.status === 'ENABLED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {flag.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white/5 px-2 py-0.5 rounded uppercase">
                      Rollout: {flag.rollout_type}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-medium">{flag.description || 'Không có mô tả.'}</p>
                  {flag.rollout_type !== 'GLOBAL' && (
                    <div className="pt-2 text-[10px] text-slate-500">
                      Rules: <code className="bg-[#1e293b] px-1.5 py-0.5 rounded text-amber-400 font-mono">{JSON.stringify(flag.rollout_rules)}</code>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleToggleStatus(flag)}
                  className="text-slate-400 hover:text-white transition-all"
                >
                  {flag.status === 'ENABLED' ? (
                    <ToggleRight size={44} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-600" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal create feature flag */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-2xl max-w-[500px] w-full space-y-5">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-2">
              Khai Báo Cờ Tính Năng Mới
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Cờ Tính Năng</label>
                <input 
                  type="text" 
                  value={flagKey}
                  onChange={e => setFlagKey(e.target.value)}
                  placeholder="enable-super-ai-assistant"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả Chức năng</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Kích hoạt tính năng hỗ trợ khách hàng nâng cấp..."
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng Thái</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="DISABLED">Vô hiệu hóa (DISABLED)</option>
                    <option value="ENABLED">Kích hoạt (ENABLED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cơ Chế Rollout</label>
                  <select
                    value={rolloutType}
                    onChange={e => setRolloutType(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="GLOBAL">Toàn Cầu (GLOBAL)</option>
                    <option value="TIER">Theo Gói Gói Cước (TIER)</option>
                    <option value="TENANT">Theo Mã Tenant (TENANT)</option>
                    <option value="PERCENTAGE">Chia Tỷ Lệ % (PERCENTAGE)</option>
                  </select>
                </div>
              </div>

              {rolloutType !== 'GLOBAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Quy Tắc Rollout Rules (JSON format)</span>
                    <span className="text-[10px] text-indigo-400">
                      {rolloutType === 'TIER' && '{"tiers": ["ENTERPRISE"]}'}
                      {rolloutType === 'TENANT' && '{"tenants": ["uuid-1"]}'}
                      {rolloutType === 'PERCENTAGE' && '{"percentage": 50}'}
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={rulesJson}
                    onChange={e => setRulesJson(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Kích Hoạt Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
