import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import IndustrialDashboard from "../pages/industrial/Dashboard";

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

      {/* Auth — à remplacer par ../auth/Login et ../auth/Register dès qu'ils existent */}
      <Route path="/connexion" element={<ComingSoon title="Connexion" />} />
      <Route path="/inscription" element={<ComingSoon title="Inscription" />} />

      {/* Dashboards */}
      <Route path="/industriel" element={<IndustrialDashboard />} />
      <Route path="/mairie" element={<ComingSoon title="Dashboard Mairie / RSE" />} />
      <Route path="/admin" element={<ComingSoon title="Backoffice EcoLoop" />} />

      {/* Page introuvable */}
      <Route path="*" element={<ComingSoon title="Page introuvable" />} />
    </Routes>
  );
}
