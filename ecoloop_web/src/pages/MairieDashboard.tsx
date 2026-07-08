import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { BarChart3, Recycle, Wallet, ShieldCheck, Landmark } from 'lucide-react';

export const MairieDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/municipality/impact');
      setStats(res.data);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-item active">
            <BarChart3 size={20} />
            <span>Statistiques Globales</span>
          </div>
        </aside>

        {/* Content */}
        <div className="dashboard-content">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Landmark style={{ color: '#10b981' }} />
              Supervision Écologique Communale
            </h2>
            <p style={{ marginTop: '8px' }}>Tableau de bord de supervision de l'activité écologique globale (Conforme RGPD / Données Anonymisées)</p>
          </div>

          {stats ? (
            <>
              {/* Aggregated KPIs Cards */}
              <div className="grid-3">
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Recycle size={32} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Matière Totale Recyclée</span>
                  <h3 style={{ fontSize: '2rem', color: 'white' }}>{stats.total_weight_kg.toLocaleString()} kg</h3>
                </div>

                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Wallet size={32} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fonds Transactés Globaux</span>
                  <h3 style={{ fontSize: '2rem', color: 'white' }}>{stats.total_paid_amount_fcfa.toLocaleString()} FCFA</h3>
                </div>

                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ShieldCheck size={32} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confidentialité Citoyenne</span>
                  <h3 style={{ fontSize: '1.2rem', color: '#f59e0b', marginTop: '6px' }}>ANONYME & SÉCURISÉ</h3>
                </div>
              </div>

              {/* Categorical Breakdown */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '24px' }}>Répartition des collectes par catégorie de déchets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {Object.keys(stats.by_category_kg).length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px 0' }}>Aucune donnée disponible pour le moment.</p>
                  ) : (
                    Object.entries(stats.by_category_kg).map(([cat, val]: any) => {
                      const percentage = stats.total_weight_kg > 0 ? (val / stats.total_weight_kg) * 100 : 0;
                      return (
                        <div key={cat}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 600 }}>{cat}</span>
                            <span>{val.toLocaleString()} kg ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--gradient-accent)', borderRadius: '9999px' }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <p>Chargement des statistiques...</p>
          )}

        </div>
      </main>
    </div>
  );
};
export default MairieDashboard;
