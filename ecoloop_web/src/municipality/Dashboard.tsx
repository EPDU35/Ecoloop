import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import { BarChart, DonutChart } from '../components/Charts';
import { NAV_PATHS } from './nav';
import { getMairieKpis, getMairieWeeklyVolume, getMairieMaterialShares } from '../services/analytics.service';
import type { KpiData } from '../models/Transaction';
import type { DailyVolume, MaterialShare } from '../models/Waste';

export default function MunicipalityDashboard() {
  const navigate = useNavigate();
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

  if (loading) {
    return <div className="el-content">Chargement du dashboard...</div>;
  }

  return (
    <AppLayout role="municipality" activeKey="dashboard" title="Dashboard Mairie &amp; RSE">
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
    </AppLayout>
  );
}
