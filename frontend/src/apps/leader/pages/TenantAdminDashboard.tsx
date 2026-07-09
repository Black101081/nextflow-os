import { useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Database, Network, Settings, Layers, ShoppingBag, MapPin, CheckSquare } from 'lucide-react';
import EntityBuilder from './EntityBuilder';
import KiotVietKanban from './KiotVietKanban';
import AnalyticsDashboard from './AnalyticsDashboard';
import IntegrationHub from './IntegrationHub';
import BlockchainAudit from './BlockchainAudit';
import WorkflowBuilder from './WorkflowBuilder';
import GrillMeChatbot from '../components/GrillMeChatbot';
import { BarChart2, AppWindow, ShieldCheck } from 'lucide-react';
import FieldOperationsMap from '../components/FieldOperationsMap';
import ApprovalsHub from '../components/ApprovalsHub';

export default function TenantAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'entity' | 'workflow' | 'analytics' | 'integrations' | 'blockchain' | 'field_map' | 'approvals'>('analytics');

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">SL</div>
          <div>
            <div className="brand-title">SME Leader Console</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              No-Code Operations Builder
            </div>
          </div>
        </div>
        <div className="user-badge">
          <Settings size={14} style={{ color: 'var(--text-muted)' }} />
          Tenant: {user?.tenant_id?.substring(0, 8) || 'System'}
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '240px 1fr' }}>
        
        {/* Sidebar Navigation */}
        <aside className="panel" style={{ height: 'fit-content' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Layers size={18} color="var(--color-primary)" />
              Builder Menu
            </h2>
          </div>
          <div className="sidebar-list" style={{ marginTop: '12px' }}>
            <button 
              className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart2 size={16} /> Analytics
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={16} /> KiotViet Orders
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckSquare size={16} /> Yêu cầu Phê duyệt
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'field_map' ? 'active' : ''}`}
              onClick={() => setActiveTab('field_map')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} /> Giám sát Hiện trường
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'entity' ? 'active' : ''}`}
              onClick={() => setActiveTab('entity')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={16} /> Data Builder
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'workflow' ? 'active' : ''}`}
              onClick={() => setActiveTab('workflow')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Network size={16} /> Workflow Builder
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AppWindow size={16} /> App Store
              </div>
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'blockchain' ? 'active' : ''}`}
              onClick={() => setActiveTab('blockchain')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={16} /> Blockchain Audit
              </div>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="panel" style={{ minHeight: '80vh', padding: 0 }}>
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'integrations' && <IntegrationHub />}
          {activeTab === 'blockchain' && <BlockchainAudit />}
          {activeTab === 'home' && <KiotVietKanban />}
          {activeTab === 'field_map' && <div style={{ padding: '24px', height: '100%' }}><FieldOperationsMap /></div>}
          {activeTab === 'approvals' && <div style={{ padding: '24px' }}><ApprovalsHub /></div>}

          {activeTab === 'entity' && <div style={{ padding: '24px' }}><EntityBuilder /></div>}
          {activeTab === 'workflow' && <div style={{ padding: '24px' }}><WorkflowBuilder /></div>}
        </main>
      </div>

      {/* Floating RAG Chatbot */}
      <GrillMeChatbot />
    </div>
  );
}
