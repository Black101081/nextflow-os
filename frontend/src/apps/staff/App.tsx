import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import Login from '../../shared/pages/Login';

import SmeStaffLayout from './layouts/SmeStaffLayout';
import TenantStaffWorkspace from './pages/TenantStaffWorkspace';
import OmniChannelChat from '../leader/pages/OmniChannelChat';
import FieldCheckin from './pages/FieldCheckin';
import QRScanner from './pages/QRScanner';
import GamificationBoard from '../../shared/pages/GamificationBoard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['SME_STAFF', 'SME_OPS', 'FIELD_WORKER', 'SME_LEADER']}>
              <SmeStaffLayout />
            </ProtectedRoute>
          }>
            <Route path="workspace" element={<TenantStaffWorkspace />} />
            <Route path="chat" element={<OmniChannelChat />} />
            <Route path="checkin" element={<FieldCheckin />} />
            <Route path="qr-scanner" element={<QRScanner />} />
            <Route path="gamification" element={<GamificationBoard />} />
            <Route index element={<Navigate to="/staff/workspace" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/staff/workspace" replace />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
