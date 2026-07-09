import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import Login from '../../shared/pages/Login';

import SmeLeaderLayout from './layouts/SmeLeaderLayout';
import TenantAdminDashboard from './pages/TenantAdminDashboard';
import AppStore from './pages/AppStore';
import BillingDashboard from './pages/BillingDashboard';
import IntegrationHub from './pages/IntegrationHub';
import OmniChannelChat from './pages/OmniChannelChat';
import WorkflowBuilder from './pages/WorkflowBuilder';
import GamificationBoard from '../../shared/pages/GamificationBoard';

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
            <Route path="dashboard" element={<TenantAdminDashboard />} />
            <Route path="appstore" element={<AppStore />} />
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="integrations" element={<IntegrationHub />} />
            <Route path="chat" element={<OmniChannelChat />} />
            <Route path="workflows" element={<WorkflowBuilder />} />
            <Route path="gamification" element={<GamificationBoard />} />
            <Route index element={<Navigate to="/leader/dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/leader/dashboard" replace />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
