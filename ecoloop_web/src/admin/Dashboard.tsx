import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { getAdminActivity, type PlatformActivity } from '../services/analytics.service';
import api from '../services/api';
import '../../styles/dark-dashboard.css';

interface AdminStats {
  users: { total: number; producers: number; collectors: number; verified: number };
  waste_lots: { total: number; available: number; collected: number };
  collections: { total: number; validated: number };
  transactions: { total: number; total_revenue_fcfa: number };
  environmental: { total_weight_kg: number; co2_avoided_kg: number; by_category_kg: Record<string,number> };
  reviews_count: number;
  ai_healthy: boolean;
}

function SkeletonKpi() {
  return (
    <div className="dd-kpi">
      <div className="dd-skel" style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 12 }} />
      <div className="dd-skel" style={{ width: '55%', height: 9, borderRadius: 4, marginBottom: 8 }} />
      <div className="dd-skel" style={{ width: '75%', height: 18, borderRadius: 4 }} />
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Admin';

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, actRes] = await Promise.all([
          api.get('/admin/stats'),
          getAdminActivity(),
        ]);
        setStats(statsRes.data);
        setActivities(actRes);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const CATEGORY_COLORS: Record<string, string> = {
    PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
    PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  };

  const byCategory = stats?.environmental.by_category_kg ?? {};
  const totalKg = Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;
  const barMax = Math.max(...Object.values(byCategory), 1);

  const activityIcon: Record<string, string> = {
    user: '👤', collection: '📦', contract: '📄', payment: '💸',
    user_registered: '👤', collection_validee: '✅', collection_reserve: '📦',
  };

  return (
    <AppLayout role="admin" activeKey="dashboard" title="">
      <div className="dd-root" style={{ padding: 0 }}>

        {/* Hero */}
        <div className="dd-hero" style={{ marginBottom: '1.5rem' }}>
          <div className="dd-hero-text">
            <h1>Bonjour {firstName} 👋</h1>
            <p>Vue globale de la plateforme EcoLoop</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="dd-cta" onClick={() => navigate('/admin/users')}>👥 Utilisateurs</button>
            <button className="dd-cta" style={{ background: '#3B82F6' }} onClick={() => navigate('/admin/system')}>
              🔧 Système
            </button>
          </div>
        </div>

        {/* KPI Grid — 3 lignes de 3 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="dd-admin-grid">
            {loading ? [1,2,3,4,5,6].map(i => <SkeletonKpi key={i} />) : stats ? (
              <>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">👥</div>
                  <div className="dd-kpi-label">Utilisateurs</div>
                  <div className="dd-kpi-value">{stats.users.total.toLocaleString('fr-FR')}</div>
                  <div className="dd-kpi-sub">{stats.users.verified} vérifiés</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">🌱</div>
                  <div className="dd-kpi-label">Producteurs</div>
                  <div className="dd-kpi-value">{stats.users.producers}</div>
                  <div className="dd-kpi-sub">{stats.users.collectors} collecteurs</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">📦</div>
                  <div className="dd-kpi-label">Lots de déchets</div>
                  <div className="dd-kpi-value">{stats.waste_lots.total}</div>
                  <div className="dd-kpi-sub">{stats.waste_lots.available} disponibles</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">🚛</div>
                  <div className="dd-kpi-label">Collectes</div>
                  <div className="dd-kpi-value">{stats.collections.total}</div>
                  <div className="dd-kpi-sub">{stats.collections.validated} validées</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">💰</div>
                  <div className="dd-kpi-label">Chiffre d'affaires</div>
                  <div className="dd-kpi-value">{stats.transactions.total_revenue_fcfa.toLocaleString('fr-FR')} F</div>
                  <div className="dd-kpi-sub">{stats.transactions.total} transactions</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">🌍</div>
                  <div className="dd-kpi-label">CO₂ évité</div>
                  <div className="dd-kpi-value">{stats.environmental.co2_avoided_kg.toFixed(1)} kg</div>
                  <div className="dd-kpi-sub">{stats.environmental.total_weight_kg.toFixed(0)} kg recyclés</div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Grid principal */}
        <div className="dd-grid">

          {/* Répartition matières */}
          <div className="dd-section">
            <div className="dd-section-head">
              <span className="dd-section-title">♻️ Répartition des déchets</span>
              <span style={{ fontSize: '0.75rem', color: '#52525B' }}>{stats?.environmental.total_weight_kg.toFixed(0)} kg au total</span>
            </div>
            {!loading && Object.keys(byCategory).length > 0 ? (
              <>
                <div className="dd-bars">
                  {Object.entries(byCategory).map(([cat, kg]) => (
                    <div key={cat} className="dd-bar-col">
                      <div className="dd-bar" style={{
                        height: `${(kg / barMax) * 70}px`,
                        background: CATEGORY_COLORS[cat] || '#10B981',
                      }} />
                      <span className="dd-bar-lbl">{cat.substring(0, 4)}</span>
                    </div>
                  ))}
                </div>
                <div className="dd-legend">
                  {Object.entries(byCategory).map(([cat, kg]) => (
                    <div key={cat} className="dd-legend-row">
                      <div className="dd-legend-dot" style={{ background: CATEGORY_COLORS[cat] || '#10B981' }} />
                      <span className="dd-legend-name">{cat}</span>
                      <span className="dd-legend-val">{((kg / totalKg) * 100).toFixed(0)}%</span>
                      <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.68rem', color: '#52525B' }}>{kg.toFixed(1)} kg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : loading ? (
              <div className="dd-skel" style={{ height: 100, borderRadius: 8, marginTop: 12 }} />
            ) : (
              <div className="dd-empty"><div className="dd-empty-icon">📊</div><p>Aucune donnée disponible.</p></div>
            )}

            {/* Barre santé IA */}
            {!loading && (
              <div style={{
                marginTop: 20, padding: '10px 14px',
                background: stats?.ai_healthy ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${stats?.ai_healthy ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: '1.1rem' }}>{stats?.ai_healthy ? '🤖' : '⚠️'}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F8FAFC' }}>
                    Service IA : {stats?.ai_healthy ? 'En ligne' : 'Hors ligne'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#A1A1AA' }}>
                    {stats?.reviews_count ?? 0} avis enregistrés
                  </div>
                </div>
                <button className="dd-link-btn" style={{ marginLeft: 'auto' }} onClick={() => navigate('/admin/system')}>
                  Détails →
                </button>
              </div>
            )}
          </div>

          {/* Activités récentes */}
          <div className="dd-col">
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">🕒 Activités récentes</span>
                <button className="dd-link-btn" onClick={() => navigate('/admin/users')}>Tout voir →</button>
              </div>
              <div className="dd-list">
                {loading ? (
                  [1,2,3,4].map(i => (
                    <div key={i} className="dd-row">
                      <div className="dd-skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
                      <div style={{ flex: 1 }}>
                        <div className="dd-skel" style={{ width: '70%', height: 10, borderRadius: 4, marginBottom: 5 }} />
                        <div className="dd-skel" style={{ width: '40%', height: 8, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <div className="dd-empty"><div className="dd-empty-icon">📋</div><p>Aucune activité récente.</p></div>
                ) : (
                  activities.slice(0, 8).map(a => (
                    <div key={a.id} className="dd-row">
                      <div className="dd-row-icon" style={{ background: 'rgba(255,255,255,0.04)', fontSize: '1.1rem' }}>
                        {activityIcon[a.type] ?? '📌'}
                      </div>
                      <div className="dd-row-main">
                        <div className="dd-row-title">{a.description}</div>
                        <div className="dd-row-sub">{a.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">⚡ Actions rapides</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '👥 Utilisateurs', path: '/admin/users' },
                  { label: '💳 Paiements', path: '/admin/paiements' },
                  { label: '📋 Transactions', path: '/admin/transactions' },
                  { label: '🔧 Système', path: '/admin/system' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      background: '#1A1A24', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '12px', color: '#A1A1AA',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', textAlign: 'center',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseOver={e => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.3)'; (e.target as HTMLButtonElement).style.color = '#F8FAFC'; }}
                    onMouseOut={e => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.target as HTMLButtonElement).style.color = '#A1A1AA'; }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
