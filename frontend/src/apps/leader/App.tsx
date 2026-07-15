import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import Login from '../../shared/pages/Login';
import NotFound from '../../shared/pages/NotFound';

import SmeLeaderLayout from './layouts/SmeLeaderLayout';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import AppStore from './pages/AppStore';
import BillingDashboard from './pages/BillingDashboard';
import IntegrationHub from './pages/IntegrationHub';
import OmniChannelChat from './pages/OmniChannelChat';
import WorkflowBuilder from './pages/WorkflowBuilder';
import AutomationWorkflows from './pages/AutomationWorkflows';
import GamificationBoard from '../../shared/pages/GamificationBoard';
import PackOperationsHub from './pages/PackOperationsHub';
import SpaPackPage from './pages/SpaPackPage';
import AutoPackPage from './pages/AutoPackPage';
import FnbPackPage from './pages/FnbPackPage';
import EduPackPage from './pages/EduPackPage';
import HospPackPage from './pages/HospPackPage';
import RePackPage from './pages/RePackPage';
import LogPackPage from './pages/LogPackPage';
import PharPackPage from './pages/PharPackPage';
import MfgPackPage from './pages/MfgPackPage';
import ConstPackPage from './pages/ConstPackPage';
import KiotVietKanban from './pages/KiotVietKanban';
import EntityBuilder from './pages/EntityBuilder';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TenantAdminDashboard from './pages/TenantAdminDashboard';
import PsPackPage from './pages/PsPackPage';
import FinanceManager from './pages/FinanceManager';
import HRManager from './pages/HRManager';
import InventoryManager from './pages/InventoryManager';
import OperationsManager from './pages/OperationsManager';
import FrontOperationsManager from './pages/FrontOperationsManager';
import SecurityHealthManager from './pages/SecurityHealthManager';
import AICopilotWorkspace from './pages/AICopilotWorkspace';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/leader" element={
            <ProtectedRoute allowedRoles={['SME_LEADER']}>
              <SmeLeaderLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ExecutiveDashboard />} />
            <Route path="appstore" element={<AppStore />} />
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="integrations" element={<IntegrationHub />} />
            <Route path="chat" element={<OmniChannelChat />} />
            <Route path="workflows" element={<AutomationWorkflows />} />
            <Route path="workflows/builder" element={<WorkflowBuilder />} />
            <Route path="gamification" element={<GamificationBoard />} />
            <Route path="packs" element={<PackOperationsHub />} />
            <Route path="spa" element={<SpaPackPage />} />
            <Route path="auto" element={<AutoPackPage />} />
            <Route path="fnb" element={<FnbPackPage />} />
            <Route path="edu" element={<EduPackPage />} />
            <Route path="hosp" element={<HospPackPage />} />
            <Route path="re" element={<RePackPage />} />
            <Route path="log" element={<LogPackPage />} />
            <Route path="phar" element={<PharPackPage />} />
            <Route path="mfg" element={<MfgPackPage />} />
            <Route path="const" element={<ConstPackPage />} />
            <Route path="ps" element={<PsPackPage />} />
            <Route path="kiotviet" element={<KiotVietKanban />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="entities" element={<EntityBuilder />} />
            <Route path="admin" element={<TenantAdminDashboard />} />
            <Route path="finance" element={<FinanceManager />} />
            <Route path="hr" element={<HRManager />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="operations" element={<OperationsManager />} />
            <Route path="front-ops" element={<FrontOperationsManager />} />
            <Route path="security-health" element={<SecurityHealthManager />} />
            <Route path="ai-copilot" element={<AICopilotWorkspace />} />
            <Route index element={<Navigate to="/leader/dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/leader/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
