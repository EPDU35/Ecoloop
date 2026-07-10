import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Home from "../pages/Home";
import Pricing from "../pages/Pricing";

import IndustrialDashboard from "../industrial/Dashboard";
import IndustrialMarketplace from "../industrial/Marketplace";
import IndustrialOrders from "../industrial/Orders";
import HistoriqueAchats from "../industrial/HistoriqueAchats";

import MunicipalityDashboard from "../municipality/Dashboard";
import MunicipalityWasteMap from "../municipality/WasteMap";
import MunicipalityAlerts from "../municipality/Alerts";
import MunicipalityImpact from "../municipality/Impact";
import MunicipalityReports from "../municipality/Reports";
import MairiePreventif from "../municipality/Preventif";
import Architecture from "../municipality/Architecture";
import AiExplain from "../municipality/AiExplain";
import BusinessModel from "../municipality/BusinessModel";

import AdminDashboard from "../admin/Dashboard";
import AdminUsers from "../admin/Users";
import AdminTransactions from "../admin/Transactions";
import AdminPayments from "../admin/Payments";
import AdminSettings from "../admin/Settings";

import Login from "../auth/Login";
import Register from "../auth/Register";
import OtpVerification from "../auth/OtpVerification";
import PendingApproval from "../auth/PendingApproval";
import ForgotPassword from "../auth/ForgotPassword";

import ProducteurDashboard from "../producteur/Dashboard";
import ProducteurLots from "../producteur/Lots";
import ProducteurRevenus from "../producteur/Revenus";
import NouvelleCollecte from "../producteur/NouvelleCollecte";
import SuiviCollecte from "../producteur/SuiviCollecte";
import Recompenses from "../producteur/Recompenses";
import AiScanner from "../producteur/Scanner";

import CollecteurDashboard from "../collecteur/Dashboard";
import CollecteurMarketplace from "../collecteur/Marketplace";
import CollecteurTournees from "../collecteur/Tournees";
import CollecteurRevenus from "../collecteur/Revenus";
import CollecteurMissionDetail from "../collecteur/MissionDetail";
import CollecteurCollecteEnCours from "../collecteur/CollecteEnCours";

import Profil from "../pages/shared/Profil";
import FAQ from "../pages/FAQ";
import CGU from "../pages/CGU";

// Pages de pied de page premium crées pour le client
import { About, Partners, Contact } from "../pages/FooterPages";

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: "3rem", fontFamily: "'Manrope', sans-serif", color: "var(--el-ink)" }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: "0.5rem" }}>{title}</h1>
      <p style={{ color: "var(--el-ink-soft)" }}>Cette page n'est pas encore construite.</p>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="el-content" style={{ padding: "3rem", textAlign: "center" }}>Chargement...</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <ComingSoon title="Accès non autorisé" />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="el-content" style={{ padding: "3rem", textAlign: "center" }}>Chargement...</div>;
  if (!user) return <Home />;
  switch (user.role) {
    case 'producteur': return <Navigate to="/producteur" replace />;
    case 'collecteur': return <Navigate to="/collecteur" replace />;
    case 'industriel': return <Navigate to="/industrial" replace />;
    case 'mairie': return <Navigate to="/mairie" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Home />;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/about" element={<About />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/cgu" element={<CGU />} />

      {/* Auth */}
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route path="/verifier-otp" element={<OtpVerification />} />
      <Route path="/compte-en-attente" element={<PendingApproval />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />

      {/* Profil commun */}
      <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />

      {/* Producteur */}
      <Route path="/producteur" element={<ProtectedRoute allowedRoles={['producteur']}><ProducteurDashboard /></ProtectedRoute>} />
      <Route path="/producteur/lots" element={<ProtectedRoute allowedRoles={['producteur']}><ProducteurLots /></ProtectedRoute>} />
      <Route path="/producteur/nouvelle-collecte" element={<ProtectedRoute allowedRoles={['producteur']}><NouvelleCollecte /></ProtectedRoute>} />
      <Route path="/producteur/suivi/:id" element={<ProtectedRoute allowedRoles={['producteur']}><SuiviCollecte /></ProtectedRoute>} />
      <Route path="/producteur/revenus" element={<ProtectedRoute allowedRoles={['producteur']}><ProducteurRevenus /></ProtectedRoute>} />
      <Route path="/producteur/recompenses" element={<ProtectedRoute allowedRoles={['producteur']}><Recompenses /></ProtectedRoute>} />
      <Route path="/producteur/scanner" element={<ProtectedRoute allowedRoles={['producteur']}><AiScanner /></ProtectedRoute>} />

      {/* Collecteur */}
      <Route path="/collecteur" element={<ProtectedRoute allowedRoles={['collecteur']}><CollecteurDashboard /></ProtectedRoute>} />
      <Route path="/collecteur/marketplace" element={<ProtectedRoute allowedRoles={['collecteur']}><CollecteurMarketplace /></ProtectedRoute>} />
      <Route path="/collecteur/mission/:id" element={<ProtectedRoute allowedRoles={['collecteur']}><CollecteurMissionDetail /></ProtectedRoute>} />
      <Route path="/collecteur/tournees" element={<ProtectedRoute allowedRoles={['collecteur']}><CollecteurTournees /></ProtectedRoute>} />
      <Route path="/collecteur/collecte/:id" element={<ProtectedRoute allowedRoles={['collecteur']}><CollecteurCollecteEnCours /></ProtectedRoute>} />
      <Route path="/collecteur/revenus" element={<ProtectedRoute allowedRoles={['collecteur']}><CollecteurRevenus /></ProtectedRoute>} />

      {/* Industriel (Refactorisé) */}
      <Route path="/industrial" element={<ProtectedRoute allowedRoles={['industriel']}><IndustrialDashboard /></ProtectedRoute>} />
      <Route path="/industrial/marketplace" element={<ProtectedRoute allowedRoles={['industriel']}><IndustrialMarketplace /></ProtectedRoute>} />
      <Route path="/industrial/orders" element={<ProtectedRoute allowedRoles={['industriel']}><IndustrialOrders /></ProtectedRoute>} />
      <Route path="/industrial/historique" element={<ProtectedRoute allowedRoles={['industriel']}><HistoriqueAchats /></ProtectedRoute>} />

{/* Mairie / RSE (Refactorisé) */}
      <Route path="/mairie" element={<ProtectedRoute allowedRoles={['mairie']}><MunicipalityDashboard /></ProtectedRoute>} />
      <Route path="/mairie/carte" element={<ProtectedRoute allowedRoles={['mairie']}><MunicipalityWasteMap /></ProtectedRoute>} />
      <Route path="/mairie/alertes" element={<ProtectedRoute allowedRoles={['mairie']}><MunicipalityAlerts /></ProtectedRoute>} />
      <Route path="/mairie/impact" element={<ProtectedRoute allowedRoles={['mairie']}><MunicipalityImpact /></ProtectedRoute>} />
      <Route path="/mairie/architecture" element={<ProtectedRoute allowedRoles={['mairie']}><Architecture /></ProtectedRoute>} />
      <Route path="/mairie/ai-explain" element={<ProtectedRoute allowedRoles={['mairie']}><AiExplain /></ProtectedRoute>} />
      <Route path="/mairie/business" element={<ProtectedRoute allowedRoles={['mairie']}><BusinessModel /></ProtectedRoute>} />
      <Route path="/mairie/rapports" element={<ProtectedRoute allowedRoles={['mairie']}><MunicipalityReports /></ProtectedRoute>} />
      <Route path="/mairie/preventif" element={<ProtectedRoute allowedRoles={['mairie']}><MairiePreventif /></ProtectedRoute>} />

      {/* Compatibilité ancienne route */}
      <Route path="/industriel" element={<Navigate to="/industrial" replace />} />

      {/* Administration / Backoffice (Refactorisé) */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

      {/* Page introuvable */}
      <Route path="*" element={<ComingSoon title="Page introuvable" />} />
    </Routes>
  );
}