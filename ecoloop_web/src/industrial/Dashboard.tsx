import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart, DonutChart } from '../components/Charts';
import OrdersTable from '../components/Tables';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getKpis, getWeeklyVolume, getMaterialShares } from '../services/analytics.service';
import { getRecentOrders } from '../services/waste.service';
import { getCurrentUser } from '../services/user.service';
import type { KpiData, Order } from '../models/Transaction';
import type { DailyVolume, MaterialShare } from '../models/Waste';
import type { IndustrialUser } from '../models/User';

// Petit composant local — pas besoin d'un fichier séparé pour ça.
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

export default function IndustrialDashboard() {
  const navigate = useNavigate();

  // Sidebar mobile + recherche mobile — gérés ici directement,
  // pas besoin d'un hook séparé pour 3 lignes d'état.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

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

  // Navigue réellement vers la page choisie (le fichier d'origine ne faisait
  // que changer le surlignage du menu, sans changer de page).
  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading || !user) {
    return <div className="el-content">Chargement du dashboard...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="dashboard"
        onSelect={handleSelect}
        user={{ name: user.name, role: user.company }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Dashboard"
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
        </div>
      </div>
    </div>
  );
}
