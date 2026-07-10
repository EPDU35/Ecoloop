import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MunicipalityDashboard } from './pages/dashboards/MunicipalityDashboard';
import { ProducerDashboard } from './pages/dashboards/ProducerDashboard';
import { CollectorDashboard } from './pages/dashboards/CollectorDashboard';
import { RecyclerDashboard } from './pages/dashboards/RecyclerDashboard';
import { NewLotPage } from './pages/dashboards/NewLotPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role.toLowerCase()) {
    case 'mairie':
    case 'admin':
      return <Navigate to="/municipality/dashboard" replace />;
    case 'producteur':
      return <Navigate to="/producer/dashboard" replace />;
    case 'collecteur':
      return <Navigate to="/collector/dashboard" replace />;
    case 'industriel':
      return <Navigate to="/recycler/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          <Route element={<MainLayout />}>
            <Route path="/municipality/dashboard" element={
              <ProtectedRoute allowedRoles={['mairie', 'admin']}>
                <MunicipalityDashboard />
              </ProtectedRoute>
            } />
            <Route path="/producer/dashboard" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <ProducerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/producer/new-lot" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <NewLotPage />
              </ProtectedRoute>
            } />
            <Route path="/collector/dashboard" element={
              <ProtectedRoute allowedRoles={['collecteur']}>
                <CollectorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recycler/dashboard" element={
              <ProtectedRoute allowedRoles={['industriel']}>
                <RecyclerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
