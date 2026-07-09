import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getAdminKpis, getAdminActivity, type PlatformActivity } from '../services/analytics.service';
import type { KpiData } from '../models/Transaction';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpisData, activitiesData] = await Promise.all([
          getAdminKpis(),
          getAdminActivity(),
        ]);
        setKpis(kpisData);
        setActivities(activitiesData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading) {
    return <div className="el-content">Chargement du backoffice...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="dashboard"
        onSelect={handleSelect}
        user={{ name: "Admin EcoLoop", role: "Super-Administrateur" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Backoffice - Administration Globale"
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

          <div className="el-grid-2" style={{ gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginTop: '1rem' }}>
            {/* Statistiques globales */}
            <div className="el-card">
              <div className="el-card-heading">
                <div className="el-card-title">Commissions &amp; Volumes (Derniers 30 jours)</div>
              </div>
              
              <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span>Objectif volume mensuel (250 t)</span>
                    <strong>79.4%</strong>
                  </div>
                  <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '79.4%', background: 'var(--el-emerald)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span>Objectif chiffre d'affaires (3.0 M FCFA)</span>
                    <strong>70.0%</strong>
                  </div>
                  <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '70%', background: 'var(--el-emerald)' }} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--el-border)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--el-ink-soft)', display: 'flex', gap: '1.5rem' }}>
                <span>📈 Taux de commission moyen : <strong>6.5%</strong></span>
                <span>📅 Dernière mise à jour : il y a 5 min</span>
              </div>
            </div>

            {/* Activités récentes */}
            <div className="el-card">
              <div className="el-card-heading">
                <div className="el-card-title">Activités de la plateforme</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
                {activities.map((a) => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--el-border)', paddingBottom: 10 }}>
                    <div style={{ fontSize: '1.25rem' }}>
                      {a.type === 'user' && '👤'}
                      {a.type === 'collection' && '📦'}
                      {a.type === 'contract' && '📄'}
                      {a.type === 'payment' && '💸'}
                    </div>
                    <div>
                      <div>{a.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)', marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
