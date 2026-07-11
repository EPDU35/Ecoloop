import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MunicipalityDashboard } from './pages/dashboards/MunicipalityDashboard';
import { CollectorMapPage } from './pages/dashboards/CollectorMapPage';
import { HouseholdDashboard } from './pages/dashboards/HouseholdDashboard';
import { CollectorDashboard } from './pages/dashboards/CollectorDashboard';
import { RecyclerDashboard } from './pages/dashboards/RecyclerDashboard';
import { TraceabilityPage } from './pages/dashboards/TraceabilityPage';
import { ImpactPage } from './pages/dashboards/ImpactPage';
import { ProfilePage } from './pages/dashboards/ProfilePage';
import { SettingsPage } from './pages/dashboards/SettingsPage';
import { NewLotPage } from './pages/dashboards/NewLotPage';
import { ReportWastePage } from './pages/dashboards/ReportWastePage';
import { MyCollectionsPage } from './pages/dashboards/MyCollectionsPage';
import { MyReportsPage } from './pages/dashboards/MyReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { AiCenterPage } from './pages/AiCenterPage';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { VisionPage } from './pages/VisionPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { AboutPage } from './pages/AboutPage';
import { StatusPage } from './pages/StatusPage';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role.toLowerCase()) {
    case 'mairie':
    case 'admin':
      return <Navigate to="/municipality/dashboard" replace />;
    case 'producteur':
      return <Navigate to="/household/dashboard" replace />;
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
      <DemoProvider>
        <Router>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          
          <Route path="/about" element={<AboutPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/terms" element={<PlaceholderPage title="Conditions d'utilisation" description="Règles générales d'utilisation de la plateforme." />} />
          
          {/* Dashboard interne */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          <Route element={<MainLayout />}>
            <Route path="/municipality/dashboard" element={
              <ProtectedRoute allowedRoles={['mairie', 'admin']}>
                <MunicipalityDashboard />
              </ProtectedRoute>
            } />
            <Route path="/household/dashboard" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <HouseholdDashboard />
              </ProtectedRoute>
            } />
            <Route path="/producer/impact" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <ImpactPage />
              </ProtectedRoute>
            } />
            <Route path="/producer/new-lot" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <NewLotPage />
              </ProtectedRoute>
            } />
            <Route path="/producer/report" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <ReportWastePage />
              </ProtectedRoute>
            } />
            <Route path="/producer/collections" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <MyCollectionsPage />
              </ProtectedRoute>
            } />
            <Route path="/producer/reports" element={
              <ProtectedRoute allowedRoles={['producteur']}>
                <MyReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/collector/dashboard" element={
              <ProtectedRoute allowedRoles={['collecteur']}>
                <CollectorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/collector/map" element={
              <ProtectedRoute allowedRoles={['collecteur']}>
                <CollectorMapPage />
              </ProtectedRoute>
            } />
            <Route path="/recycler/dashboard" element={
              <ProtectedRoute allowedRoles={['industriel']}>
                <RecyclerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            
            {/* Pages publiques / Showcase */}
            <Route path="ai-center" element={<AiCenterPage />} />
            <Route path="investor" element={<InvestorDashboard />} />
            <Route path="vision" element={<VisionPage />} />
            
            {/* Traçabilité (Demo) */}
            <Route path="traceability" element={<TraceabilityPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          </Routes>
        </Router>
      </DemoProvider>
    </AuthProvider>
  );
}

export default App;
