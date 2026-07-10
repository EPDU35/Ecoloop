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
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          
          {/* Pages institutionnelles (Placeholders) */}
          <Route path="/about" element={<PlaceholderPage title="À propos d'EcoLoop" description="Découvrez notre mission, notre vision et l'équipe derrière le projet." />} />
          <Route path="/careers" element={<PlaceholderPage title="Carrières" description="Rejoignez l'équipe EcoLoop et contribuez à l'économie circulaire." />} />
          <Route path="/press" element={<PlaceholderPage title="Espace Presse" description="Retrouvez nos communiqués et kit média." />} />
          <Route path="/blog" element={<PlaceholderPage title="Blog EcoLoop" description="Actualités, conseils et insights sur le recyclage en Afrique." />} />
          <Route path="/help" element={<PlaceholderPage title="Centre d'aide" description="Trouvez les réponses à vos questions pour bien utiliser la plateforme." />} />
          <Route path="/docs" element={<PlaceholderPage title="Documentation API" description="Intégrez les services EcoLoop dans votre propre SI." />} />
          <Route path="/status" element={<PlaceholderPage title="Statut du service" description="Tous nos systèmes sont opérationnels à 100%." />} />
          <Route path="/terms" element={<PlaceholderPage title="Conditions d'utilisation" description="Règles générales d'utilisation de la plateforme." />} />
          
          {/* Dashboard interne */}
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
