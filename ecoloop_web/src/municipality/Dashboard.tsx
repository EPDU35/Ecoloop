import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart, DonutChart } from '../components/Charts';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getMairieKpis, getMairieWeeklyVolume, getMairieMaterialShares } from '../services/analytics.service';
import type { KpiData } from '../models/Transaction';
import type { DailyVolume, MaterialShare } from '../models/Waste';

function KpiCard({ label, value, deltaLabel, deltaDirection }: KpiData) {
  const arrow = deltaDirection === 'up' ? '↑' : '↓';
  return (
    <div className="el-card">
      <div className="el-kpi-label">{label}</div>
      <div className="el-kpi-value">{value}</div>
      <div className={`el-kpi-delta ${deltaDirection}`}>
        {arrow} {deltaLabel}
      </div>
    </div>
  );
}

export default function MunicipalityDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [districtVolume, setDistrictVolume] = useState<DailyVolume[]>([]);
  const [materialShares, setMaterialShares] = useState<MaterialShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [kpisData, volumeData, sharesData] = await Promise.all([
          getMairieKpis(),
          getMairieWeeklyVolume(),
          getMairieMaterialShares(),
        ]);
        if (cancelled) return;
        setKpis(kpisData);
        setDistrictVolume(volumeData);
        setMaterialShares(sharesData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading) {
    return <div className="el-content">Chargement du dashboard...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="dashboard"
        onSelect={handleSelect}
        user={{ name: "Koffi N'Guessan", role: "Mairie d'Abidjan (RSE)" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Dashboard Mairie & RSE"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-kpi-grid">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} {...kpi} />
            ))}
          </div>

          <div className="el-grid-2">
            <BarChart
              title="Volume collecté par commune (7 derniers jours)"
              data={districtVolume}
              linkLabel="Voir la carte"
              onLinkClick={() => navigate(NAV_PATHS.carte)}
            />
            <DonutChart title="Typologie des déchets recyclés" data={materialShares} />
          </div>
        </div>
      </div>
    </div>
  );
}
