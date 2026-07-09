import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import { BarChart, DonutChart } from '../components/Charts';
import OrdersTable from '../components/Tables';
import { NAV_PATHS } from './nav';
import { getKpis, getWeeklyVolume, getMaterialShares } from '../services/analytics.service';
import { getRecentOrders } from '../services/waste.service';
import { getCurrentUser } from '../services/user.service';
import type { KpiData, Order } from '../models/Transaction';
import type { DailyVolume, MaterialShare } from '../models/Waste';
import type { IndustrialUser } from '../models/User';

export default function IndustrialDashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<DailyVolume[]>([]);
  const [materialShares, setMaterialShares] = useState<MaterialShare[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [kpisData, volumeData, sharesData, ordersData, userData] = await Promise.all([
          getKpis(),
          getWeeklyVolume(),
          getMaterialShares(),
          getRecentOrders(),
          getCurrentUser(),
        ]);
        if (cancelled) return;
        setKpis(kpisData);
        setWeeklyVolume(volumeData);
        setMaterialShares(sharesData);
        setOrders(ordersData);
        setUser(userData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !user) {
    return <div className="el-content">Chargement du dashboard...</div>;
  }

  return (
    <AppLayout role="industrial" activeKey="dashboard" title="Dashboard">
      <div className="el-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </div>

      <div className="el-grid-2">
        <BarChart
          title="Volume collecté — 7 derniers jours"
          data={weeklyVolume}
          linkLabel="Voir les rapports"
          onLinkClick={() => navigate(NAV_PATHS.reports)}
        />
        <DonutChart title="Répartition par matériau" data={materialShares} />
      </div>

      <OrdersTable
        title="Commandes récentes"
        orders={orders}
        linkLabel="Voir tout"
        onLinkClick={() => navigate(NAV_PATHS.orders)}
      />
    </AppLayout>
  );
}
