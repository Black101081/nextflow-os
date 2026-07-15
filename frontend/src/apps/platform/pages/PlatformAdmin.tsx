import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../shared/services/api';
import { Layers, Activity, Settings, Webhook, ScrollText } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

import TenantsTab from '../components/TenantsTab';
import HealthTab from '../components/HealthTab';
import ConfigTab from '../components/ConfigTab';
import WebhooksTab from '../components/WebhooksTab';
import AuditLogTab from '../components/AuditLogTab';
import Avatar from '../../../shared/components/ui/Avatar';

export default function PlatformAdmin() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = (searchParams.get('tab') as 'tenants' | 'health' | 'config' | 'webhooks' | 'auditlog') || 'tenants';
  const setActiveTab = (tab: 'tenants' | 'health' | 'config' | 'webhooks' | 'auditlog') => {
    setSearchParams(prev => { prev.set('tab', tab); return prev; });
  };

  const [tenants, setTenants] = useState<any[]>([]);
  const [observability, setObservability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [configQuota, setConfigQuota] = useState({
    standard_user_limit: 10,
    standard_task_limit: 1000,
    enterprise_user_limit: 100,
    enterprise_task_limit: 10000,
    auto_backup: true,
    blockchain_anchoring_interval_minutes: 60
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const [selectedTenantForReport, setSelectedTenantForReport] = useState<any | null>(null);

  const [storageQuotaGb, setStorageQuotaGb] = useState(10);
  const [rateLimitPerMin, setRateLimitPerMin] = useState(100);
  const [enableAiAssist, setEnableAiAssist] = useState(true);
  const [enableOmniChat, setEnableOmniChat] = useState(true);
  const [alertThresholdPct, setAlertThresholdPct] = useState(5);

  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (q: string) => {
    setSearchParams(prev => { if (q) prev.set('q', q); else prev.delete('q'); return prev; });
  };
  
  const statusFilter = (searchParams.get('status') as 'ALL' | 'ACTIVE' | 'SUSPENDED') || 'ALL';
  const setStatusFilter = (status: 'ALL' | 'ACTIVE' | 'SUSPENDED') => {
    setSearchParams(prev => { if (status !== 'ALL') prev.set('status', status); else prev.delete('status'); return prev; });
  };
  
  const tierFilter = (searchParams.get('tier') as 'ALL' | 'STANDARD' | 'ENTERPRISE') || 'ALL';
  const setTierFilter = (tier: 'ALL' | 'STANDARD' | 'ENTERPRISE') => {
    setSearchParams(prev => { if (tier !== 'ALL') prev.set('tier', tier); else prev.delete('tier'); return prev; });
  };

  const [templates, setTemplates] = useState<any[]>([]);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlatformTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Tenant.');
    } finally {
      setLoading(false);
    }
  };

  const fetchObservability = useCallback(async () => {
    try {
      const data = await apiService.getPlatformObservability();
      setObservability(data);
    } catch (err: any) {
      console.error('Error fetching observability data:', err);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'PLATFORM_ADMIN') {
      fetchTenants();
      fetchObservability();
      apiService.getPlatformTemplates?.().then(setTemplates).catch(console.error);
    }
  }, [user]);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingConfig(false);
    triggerNotification('success', 'Lưu cấu hình hệ thống Platform thành công!');
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto text-[#f1f5f9] font-sans">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Quản trị Hệ thống Platform (Tầng 1)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Trung tâm chỉ huy siêu cấp với khả năng chẩn đoán AI & Lưu vết Blockchain U2U.
          </p>
        </div>
      </div>

      {notification && (
        <div className={`fixed top-6 right-6 px-6 py-3.5 rounded-lg z-[9999] font-semibold shadow-lg text-white ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-3 border-b border-white/5 pb-4 mb-8">
        <button 
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeTab === 'tenants' 
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Layers size={16} /> Quản lý Doanh nghiệp
        </button>
        <button 
          onClick={() => { setActiveTab('health'); fetchObservability(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeTab === 'health' 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Activity size={16} /> Giám sát & Sức khỏe AI
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeTab === 'config' 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Settings size={16} /> Cấu hình Tự động hóa
        </button>
        <button 
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeTab === 'webhooks' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <Webhook size={16} /> Webhooks
        </button>
        <button 
          onClick={() => setActiveTab('auditlog')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border ${
            activeTab === 'auditlog' 
              ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <ScrollText size={16} /> Audit Log
        </button>
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'tenants' && (
        <TenantsTab
          tenants={tenants}
          loading={loading}
          error={error}
          fetchTenants={fetchTenants}
          triggerNotification={triggerNotification}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          templates={templates}
        />
      )}

      {activeTab === 'health' && (
        <HealthTab 
          observability={observability} 
          selectedTenantForReport={selectedTenantForReport} 
          setSelectedTenantForReport={setSelectedTenantForReport} 
          storageQuotaGb={storageQuotaGb}
          triggerNotification={triggerNotification}
        />
      )}

      {activeTab === 'config' && (
        <ConfigTab 
          configQuota={configQuota}
          setConfigQuota={setConfigQuota}
          storageQuotaGb={storageQuotaGb}
          setStorageQuotaGb={setStorageQuotaGb}
          rateLimitPerMin={rateLimitPerMin}
          setRateLimitPerMin={setRateLimitPerMin}
          enableAiAssist={enableAiAssist}
          setEnableAiAssist={setEnableAiAssist}
          enableOmniChat={enableOmniChat}
          setEnableOmniChat={setEnableOmniChat}
          alertThresholdPct={alertThresholdPct}
          setAlertThresholdPct={setAlertThresholdPct}
          savingConfig={savingConfig}
          saveConfig={saveConfig}
          templates={templates}
        />
      )}

      {activeTab === 'webhooks' && <WebhooksTab />}

      {activeTab === 'auditlog' && <AuditLogTab />}

    </div>
  );
}
