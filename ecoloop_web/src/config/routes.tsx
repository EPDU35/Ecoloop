import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import IndustrialDashboard from "../industrial/Dashboard";
import Marketplace from "../industrial/Marketplace";
import Suppliers from "../industrial/Suppliers";
import Contracts from "../industrial/Contracts";
import Orders from "../industrial/Orders";
import Reports from "../industrial/Reports";
import MunicipalityDashboard from "../municipality/Dashboard";
import MunicipalityWasteMap from "../municipality/WasteMap";
import MunicipalityAlerts from "../municipality/Alerts";
import MunicipalityImpact from "../municipality/Impact";
import MunicipalityReports from "../municipality/Reports";
import AdminDashboard from "../admin/Dashboard";
import AdminUsers from "../admin/Users";
import AdminTransactions from "../admin/Transactions";
import AdminPayments from "../admin/Payments";
import AdminSettings from "../admin/Settings";
import Login from "../auth/Login";
import Register from "../auth/Register";
import { About, Partners, Contact } from "../pages/FooterPages";

/* ------------------------------------------------------------------
   ComingSoon — remplace temporairement une page qui n'existe pas
   encore dans le projet (ex: ../auth/Login.tsx, ../auth/Register.tsx).
   Dès qu'un coéquipier crée le vrai fichier, il suffit de remplacer
   la ligne correspondante ci-dessous par le vrai import.
   ------------------------------------------------------------------ */
function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: "3rem", fontFamily: "'Manrope', sans-serif", color: "var(--el-ink)" }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: "0.5rem" }}>{title}</h1>
      <p style={{ color: "var(--el-ink-soft)" }}>Cette page n'est pas encore construite.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Page publique */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth */}
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />

      {/* Dashboards */}
      {/* Industriel */}
      <Route path="/industrial" element={<IndustrialDashboard />} />
      <Route path="/industrial/marketplace" element={<Marketplace />} />
      <Route path="/industrial/suppliers" element={<Suppliers />} />
      <Route path="/industrial/contracts" element={<Contracts />} />
      <Route path="/industrial/orders" element={<Orders />} />
      <Route path="/industrial/reports" element={<Reports />} />
      
      {/* Mairie / RSE */}
      <Route path="/mairie" element={<MunicipalityDashboard />} />
      <Route path="/mairie/carte" element={<MunicipalityWasteMap />} />
      <Route path="/mairie/alertes" element={<MunicipalityAlerts />} />
      <Route path="/mairie/impact" element={<MunicipalityImpact />} />
      <Route path="/mairie/rapports" element={<MunicipalityReports />} />
      
      {/* Compatibilité ancienne route */}
      <Route path="/industriel" element={<IndustrialDashboard />} />
      
      {/* Administration / Backoffice */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/transactions" element={<AdminTransactions />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/settings" element={<AdminSettings />} />

      {/* Page introuvable */}
      <Route path="*" element={<ComingSoon title="Page introuvable" />} />
    </Routes>
  );
}
