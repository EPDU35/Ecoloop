import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart, DonutChart } from '../components/Charts';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getProducerDashboard } from '../services/producteur.service';
import type { ProducerDashboard } from '../models/Waste';

function KpiCard({ label, value, deltaLabel, deltaDirection }: { label: string; value: string; deltaLabel?: string; deltaDirection?: 'up' | 'down' }) {
  return (
    <div className="el-card">
      <div className="el-kpi-label">{label}</div>
      <div className="el-kpi-value">{value}</div>
      {deltaLabel && (
        <div className={`el-kpi-delta ${deltaDirection}`}>
          {deltaDirection === 'up' ? '↑' : '↓'} {deltaLabel}
        </div>
      )}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#3fa34d', HDPE: '#6b8f79', CARTON: '#d9a441', VERRE: '#b4522f',
  PLASTIQUE: '#3fa34d', METAL: '#6b8f79', PAPIER: '#d9a441',
};

export default function ProducteurDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [data, setData] = useState<ProducerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    getProducerDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
          user={{ name: "Producteur", role: "Producteur" }}
          open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Mon Espace Producteur" searchOpen={searchOpen}
            onToggleSearch={() => setSearchOpen((v) => !v)}
            onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content"><p className="el-empty">Chargement...</p></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
          user={{ name: "Producteur", role: "Producteur" }}
          open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Mon Espace Producteur" searchOpen={searchOpen}
            onToggleSearch={() => setSearchOpen((v) => !v)}
            onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content"><p className="el-empty">Erreur : {error || "Impossible de charger les données"}</p></div>
        </div>
      </div>
    );
  }

  const materialData = Object.entries(
    data.recent_lots.reduce<Record<string, number>>((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + l.weight_kg;
      return acc;
    }, {})
  ).map(([name, kg]) => ({
    name,
    percent: Math.round((kg / data.recent_lots.reduce((s, l) => s + l.weight_kg, 0)) * 100) || 100,
    color: CATEGORY_COLORS[name] || '#6b8f79',
  }));

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: "Producteur", role: "Producteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon Espace Producteur" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-kpi-grid">
            <KpiCard label="Déchets valorisés" value={`${data.total_kg_recycled.toLocaleString('fr-FR')} kg`} />
            <KpiCard label="Lots publiés" value={`${data.recent_lots.length}`} />
            <KpiCard label="Collectes" value={`${data.collections_count}`} />
            <KpiCard label="Revenus totaux" value={`${data.total_revenue_fcfa.toLocaleString('fr-FR')} FCFA`} />
          </div>
          <div className="el-grid-2">
            <BarChart title="Derniers lots" data={data.recent_lots.map((l) => ({
              day: l.category,
              percent: l.weight_kg,
            }))} linkLabel="Voir mes lots" onLinkClick={() => navigate(NAV_PATHS.lots)} />
            <DonutChart title="Répartition par type" data={materialData.length ? materialData : [{ name: 'Aucun', percent: 100, color: '#e0e0e0' }]} />
          </div>
        </div>
      </div>
    </div>
  );
}
