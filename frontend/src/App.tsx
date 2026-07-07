import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Layouts
import PlatformLayout from './layouts/PlatformLayout';
import SmeLeaderLayout from './layouts/SmeLeaderLayout';
import SmeStaffLayout from './layouts/SmeStaffLayout';

// Layer 1: Platform Admin
import PlatformAdmin from './pages/PlatformAdmin';
import EcosystemPublisher from './pages/EcosystemPublisher';
import ObservabilityDashboard from './pages/ObservabilityDashboard';

// Layer 2 & 3: Tenant Admin & Staff
import TenantAdminDashboard from './pages/TenantAdminDashboard';
import AppStore from './pages/AppStore';
import BillingDashboard from './pages/BillingDashboard';
import IntegrationHub from './pages/IntegrationHub';
import TenantStaffWorkspace from './pages/TenantStaffWorkspace';

// Layer 4: End User
import CustomerPortal from './pages/CustomerPortal';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Layer 1: Platform Admin Routes */}
          <Route path="/platform" element={
            <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route path="admin" element={<PlatformAdmin />} />
            <Route path="ecosystem" element={<EcosystemPublisher />} />
            <Route path="observability" element={<ObservabilityDashboard />} />
            <Route index element={<Navigate to="/platform/admin" replace />} />
          </Route>

          {/* Layer 2: SME Leader Routes */}
          <Route path="/leader" element={
            <ProtectedRoute allowedRoles={['SME_LEADER']}>
              <SmeLeaderLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TenantAdminDashboard />} />
            <Route path="appstore" element={<AppStore />} />
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="integrations" element={<IntegrationHub />} />
            <Route index element={<Navigate to="/leader/dashboard" replace />} />
          </Route>

          {/* Layer 3: Tenant Staff Workspace Routes */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['SME_STAFF', 'FIELD_WORKER', 'SME_LEADER']}>
              <SmeStaffLayout />
            </ProtectedRoute>
          }>
            <Route path="workspace" element={<TenantStaffWorkspace />} />
            <Route index element={<Navigate to="/staff/workspace" replace />} />
          </Route>

          {/* Redirections for backward compatibility */}
          <Route path="/workspace" element={<Navigate to="/staff/workspace" replace />} />
          <Route path="/tenant/admin" element={<Navigate to="/leader/dashboard" replace />} />
          <Route path="/tenant/appstore" element={<Navigate to="/leader/appstore" replace />} />
          <Route path="/tenant/billing" element={<Navigate to="/leader/billing" replace />} />
          <Route path="/tenant/integrations" element={<Navigate to="/leader/integrations" replace />} />
          <Route path="/" element={<Navigate to="/staff/workspace" replace />} />

          {/* Layer 4: End User Routes */}
          <Route path="/customer" element={<CustomerPortal />} />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
