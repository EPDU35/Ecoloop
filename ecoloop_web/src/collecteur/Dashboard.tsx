import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart, DonutChart } from '../components/Charts';
import { NAV_ITEMS, NAV_PATHS } from './nav';

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

export default function CollecteurDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const weeklyData = [
    { day: 'Lun', percent: 70 }, { day: 'Mar', percent: 85 }, { day: 'Mer', percent: 50 },
    { day: 'Jeu', percent: 75 }, { day: 'Ven', percent: 90 }, { day: 'Sam', percent: 60 }, { day: 'Dim', percent: 10 },
  ];

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: "Kouamé Jean", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon Espace Collecteur" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-kpi-grid">
            <KpiCard label="Collectes effectuées" value="24" deltaLabel="+4 cette semaine" deltaDirection="up" />
            <KpiCard label="Déchets collectés" value="1.2 t" deltaLabel="+18% vs mois dernier" deltaDirection="up" />
            <KpiCard label="Revenus du mois" value="85 500 FCFA" deltaLabel="+12% vs mois dernier" deltaDirection="up" />
            <KpiCard label="Réputation" value="4.8 ⭐" deltaLabel="Stable" deltaDirection="up" />
          </div>
          <div className="el-grid-2">
            <BarChart title="Collectes — 7 derniers jours" data={weeklyData}
              linkLabel="Voir la marketplace" onLinkClick={() => navigate(NAV_PATHS.marketplace)} />
            <DonutChart title="Répartition par type" data={[
              { name: 'PET', percent: 40, color: '#3fa34d' },
              { name: 'Carton', percent: 30, color: '#d9a441' },
              { name: 'Verre', percent: 20, color: '#b4522f' },
              { name: 'HDPE', percent: 10, color: '#6b8f79' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
