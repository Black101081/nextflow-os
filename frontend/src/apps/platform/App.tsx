import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import Login from '../../shared/pages/Login';
import NotFound from '../../shared/pages/NotFound';

import PlatformLayout from './layouts/PlatformLayout';
import PlatformAdmin from './pages/PlatformAdmin';
import EcosystemPublisher from './pages/EcosystemPublisher';
import ObservabilityDashboard from './pages/ObservabilityDashboard';
import BillingOverview from './pages/BillingOverview';
import UserManagement from './pages/UserManagement';
import AuditLog from './pages/AuditLog';
import WebhookMonitor from './pages/WebhookMonitor';
import AiUsageDashboard from './pages/AiUsageDashboard';
import GamificationAdmin from './pages/GamificationAdmin';
import BlockchainExplorer from './pages/BlockchainExplorer';

import TenantLifecycleManager from './pages/TenantLifecycleManager';
import SecurityCenter from './pages/SecurityCenter';
import RevenueAnalytics from './pages/RevenueAnalytics';
import FeatureFlagManager from './pages/FeatureFlagManager';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/platform" element={
            <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route path="admin" element={<PlatformAdmin />} />
            <Route path="ecosystem" element={<EcosystemPublisher />} />
            <Route path="observability" element={<ObservabilityDashboard />} />
            <Route path="billing" element={<BillingOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="webhooks" element={<WebhookMonitor />} />
            <Route path="ai-usage" element={<AiUsageDashboard />} />
            <Route path="gamification" element={<GamificationAdmin />} />
            <Route path="blockchain" element={<BlockchainExplorer />} />
            <Route path="lifecycle" element={<TenantLifecycleManager />} />
            <Route path="security" element={<SecurityCenter />} />
            <Route path="revenue-analytics" element={<RevenueAnalytics />} />
            <Route path="feature-flags" element={<FeatureFlagManager />} />
            <Route index element={<Navigate to="/platform/admin" replace />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/platform/admin" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
