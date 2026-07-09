import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import CustomerPortal from './pages/CustomerPortal';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/customer" element={<CustomerPortal />} />
        <Route path="/" element={<Navigate to="/customer" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
