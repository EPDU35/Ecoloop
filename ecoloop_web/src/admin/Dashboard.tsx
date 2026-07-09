import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import { getAdminKpis, getAdminActivity, type PlatformActivity } from '../services/analytics.service';
import type { KpiData } from '../models/Transaction';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="el-content">Chargement du backoffice...</div>;
  }

  return (
    <AppLayout role="admin" activeKey="dashboard" title="Backoffice - Administration Globale">
      <div className="el-kpi-grid bo-stagger">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </div>

      <div className="el-grid-2 bo-stagger" style={{ gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginTop: '1rem' }}>
        {/* Statistiques globales */}
        <div className="bo-card">
          <div className="bo-card-core">
            <div className="el-card-heading">
            <div className="el-card-title">Commissions &amp; Volumes (Derniers 30 jours)</div>
          </div>
          
          <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span>Objectif volume mensuel (250 t)</span>
                <strong>79.4%</strong>
              </div>
              <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '79.4%', background: 'var(--el-signal)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span>Objectif chiffre d'affaires (3.0 M FCFA)</span>
                <strong>70.0%</strong>
              </div>
              <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '70%', background: 'var(--el-signal)' }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--el-line-dark)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--el-ink-soft)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>📈 Taux de commission moyen : <strong>6.5%</strong></span>
            <span>📅 Dernière mise à jour : il y a 5 min</span>
          </div>
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bo-card">
          <div className="bo-card-core">
            <div className="el-card-heading">
              <div className="el-card-title">Activités de la plateforme</div>
            </div>

            <div className="bo-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            {activities.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--el-line-dark)', paddingBottom: 10 }}>
                <div style={{ fontSize: '1.25rem' }}>
                  {a.type === 'user' && <span role="img" aria-label="utilisateur">👤</span>}
                  {a.type === 'collection' && <span role="img" aria-label="collecte">📦</span>}
                  {a.type === 'contract' && <span role="img" aria-label="contrat">📄</span>}
                  {a.type === 'payment' && <span role="img" aria-label="paiement">💸</span>}
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
    </AppLayout>
  );
}
