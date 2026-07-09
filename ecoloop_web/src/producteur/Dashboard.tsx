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

export default function ProducteurDashboard() {
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
    { day: 'Lun', percent: 65 }, { day: 'Mar', percent: 80 }, { day: 'Mer', percent: 45 },
    { day: 'Jeu', percent: 90 }, { day: 'Ven', percent: 70 }, { day: 'Sam', percent: 30 }, { day: 'Dim', percent: 20 },
  ];
  const materialData = [
    { name: 'PET', percent: 45, color: '#3fa34d' },
    { name: 'Carton', percent: 30, color: '#d9a441' },
    { name: 'Verre', percent: 15, color: '#b4522f' },
    { name: 'HDPE', percent: 10, color: '#6b8f79' },
  ];

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: "Aïcha Koné", role: "Producteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon Espace Producteur" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-kpi-grid">
            <KpiCard label="Déchets valorisés" value="340 kg" deltaLabel="+12% vs mois dernier" deltaDirection="up" />
            <KpiCard label="Lots publiés" value="8" deltaLabel="+2 cette semaine" deltaDirection="up" />
            <KpiCard label="Collectes en attente" value="3" deltaLabel="1 programmée demain" deltaDirection="up" />
            <KpiCard label="Revenus totaux" value="45 200 FCFA" deltaLabel="+8% vs mois dernier" deltaDirection="up" />
          </div>
          <div className="el-grid-2">
            <BarChart title="Déchets collectés — 7 derniers jours" data={weeklyData}
              linkLabel="Voir mes lots" onLinkClick={() => navigate(NAV_PATHS.lots)} />
            <DonutChart title="Répartition par type" data={materialData} />
          </div>
        </div>
      </div>
    </div>
  );
}
