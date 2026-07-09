import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart, DonutChart } from '../components/Charts';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getCollectorDashboard } from '../services/collecteur.service';
import type { CollectorDashboard } from '../models/Waste';

function KpiCard({ label, value, deltaLabel, deltaDirection }: { label: string; value: string; deltaLabel?: string; deltaDirection?: 'up' | 'down' }) {
  return (
    <div className="bo-card">
      <div className="bo-card-core">
        <div className="el-kpi-label">{label}</div>
        <div className="el-kpi-value">{value}</div>
        {deltaLabel && (
          <div className={`el-kpi-delta ${deltaDirection}`}>
            {deltaDirection === 'up' ? '↑' : '↓'} {deltaLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollecteurDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [data, setData] = useState<CollectorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    getCollectorDashboard()
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
          user={{ name: "Collecteur", role: "Collecteur" }}
          open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Mon Espace Collecteur" searchOpen={searchOpen}
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
          user={{ name: "Collecteur", role: "Collecteur" }}
          open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Mon Espace Collecteur" searchOpen={searchOpen}
            onToggleSearch={() => setSearchOpen((v) => !v)}
            onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content"><p className="el-empty">Erreur : {error || "Impossible de charger les données"}</p></div>
        </div>
      </div>
    );
  }

  const catCounts = data.available_lots.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});

  const totalCat = Object.values(catCounts).reduce((s, v) => s + v, 0) || 1;
  const materialData = Object.entries(catCounts).map(([name, count], i) => ({
    name,
    percent: Math.round((count / totalCat) * 100),
    color: ['#3fa34d', '#d9a441', '#b4522f', '#6b8f79', '#4a7c8c'][i % 5],
  }));

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: "Collecteur", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon Espace Collecteur" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-kpi-grid bo-stagger">
            <KpiCard label="Collectes effectuées" value={`${data.completed_collections}`} />
            <KpiCard label="Total collecté" value={`${data.available_lots.reduce((s, l) => s + l.weight_kg, 0).toLocaleString('fr-FR')} kg`} />
            <KpiCard label="Revenus totaux" value={`${data.total_earnings_fcfa.toLocaleString('fr-FR')} FCFA`} />
            <KpiCard label="Réputation" value={`${data.reputation_score.toFixed(1)} ⭐`} />
          </div>
          <div className="el-grid-2 bo-stagger" style={{ marginTop: '1.5rem' }}>
            <div className="bo-card"><div className="bo-card-core">
              <BarChart title="Lots disponibles" data={data.available_lots.slice(0, 7).map((l) => ({
                day: l.category,
                percent: l.weight_kg,
              }))} linkLabel="Voir la marketplace" onLinkClick={() => navigate(NAV_PATHS.marketplace)} />
            </div></div>
            <div className="bo-card"><div className="bo-card-core">
              <DonutChart title="Répartition par type" data={materialData.length ? materialData : [{ name: 'Aucun', percent: 100, color: '#e0e0e0' }]} />
            </div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
