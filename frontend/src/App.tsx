import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Layouts
import PlatformLayout from './layouts/PlatformLayout';
import TenantLayout from './layouts/TenantLayout';

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

          {/* Layer 2 & 3: Tenant Routes */}
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route path="/" element={<TenantLayout />}>
            {/* SME Leader Routes */}
            <Route path="tenant/admin" element={
              <ProtectedRoute allowedRoles={['SME_LEADER']}>
                <TenantAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="tenant/appstore" element={
              <ProtectedRoute allowedRoles={['SME_LEADER']}>
                <AppStore />
              </ProtectedRoute>
            } />
            <Route path="tenant/billing" element={
              <ProtectedRoute allowedRoles={['SME_LEADER']}>
                <BillingDashboard />
              </ProtectedRoute>
            } />
            <Route path="tenant/integrations" element={
              <ProtectedRoute allowedRoles={['SME_LEADER']}>
                <IntegrationHub />
              </ProtectedRoute>
            } />

            {/* Shared Workspace Route */}
            <Route path="workspace" element={
              <ProtectedRoute>
                <TenantStaffWorkspace />
              </ProtectedRoute>
            } />
            <Route path="work-items" element={
              <ProtectedRoute>
                <TenantStaffWorkspace />
              </ProtectedRoute>
            } />
          </Route>

          {/* Layer 4: End User Routes */}
          <Route path="/customer" element={<CustomerPortal />} />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
