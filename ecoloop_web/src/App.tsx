import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProducerDashboard from './pages/ProducerDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import MairieDashboard from './pages/MairieDashboard';
import IndustrialDashboard from './pages/IndustrialDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/producer" element={<ProducerDashboard />} />
          <Route path="/dashboard/collector" element={<CollectorDashboard />} />
          <Route path="/dashboard/municipality" element={<MairieDashboard />} />
          <Route path="/dashboard/industrial" element={<IndustrialDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
