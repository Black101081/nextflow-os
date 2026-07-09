import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import Login from '../../shared/pages/Login';

import PlatformLayout from './layouts/PlatformLayout';
import PlatformAdmin from './pages/PlatformAdmin';
import EcosystemPublisher from './pages/EcosystemPublisher';
import ObservabilityDashboard from './pages/ObservabilityDashboard';

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
            <Route index element={<Navigate to="/platform/admin" replace />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/platform/admin" replace />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
