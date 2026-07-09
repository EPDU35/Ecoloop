import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { NAV_PATHS } from './nav';
import api from '../services/api';

interface IndustrialDash {
  total_revenue_fcfa: number;
  total_kg_purchased: number;
  active_contracts: number;
  co2_avoided_kg: number;
  recent_lots: { id: string; category: string; weight_kg: number; price_per_kg: number; status: string; created_at: string | null }[];
  by_category_kg: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706',
};

function SkeletonKpi() {
  return (
    <div className="dd-kpi">
      <div className="dd-skel" style={{ width: 36, height: 36, borderRadius: 8, marginBottom: 12 }} />
      <div className="dd-skel" style={{ width: '55%', height: 9, borderRadius: 4, marginBottom: 8 }} />
      <div className="dd-skel" style={{ width: '75%', height: 18, borderRadius: 4 }} />
    </div>
  );
}

export default function IndustrialDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<IndustrialDash | null>(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Industriel';

  useEffect(() => {
    api.get('/dashboard/industrial')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byCategory = data?.by_category_kg ?? {};
  const totalKg = Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;
  const barMax = Math.max(...Object.values(byCategory), 1);

  return (
    <AppLayout role="industrial" activeKey="dashboard" title="">
      <div className="dd-root" style={{ padding: 0 }}>

        {/* Hero */}
        <div className="dd-hero">
          <div className="dd-hero-text">
            <h1>Bonjour {firstName} 👋</h1>
            <p>Vos approvisionnements en matières premières secondaires</p>
          </div>
          <button className="dd-cta" onClick={() => navigate(NAV_PATHS.marketplace)}>
            🏭 Marketplace
          </button>
        </div>

        {/* KPIs */}
        <div className="dd-kpi-grid">
          {loading ? [1,2,3,4].map(i => <SkeletonKpi key={i} />) : (
            <>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">💰</div>
                <div className="dd-kpi-label">Dépenses totales</div>
                <div className="dd-kpi-value">{(data?.total_revenue_fcfa ?? 0).toLocaleString('fr-FR')} FCFA</div>
                <div className="dd-kpi-sub">achats de matières</div>
              </div>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">⚖️</div>
                <div className="dd-kpi-label">Matières achetées</div>
                <div className="dd-kpi-value">{(data?.total_kg_purchased ?? 0).toLocaleString('fr-FR')} kg</div>
                <div className="dd-kpi-sub">volume approvisionné</div>
              </div>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">📄</div>
                <div className="dd-kpi-label">Contrats actifs</div>
                <div className="dd-kpi-value">{data?.active_contracts ?? 0}</div>
                <div className="dd-kpi-sub">fournisseurs</div>
              </div>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">🌍</div>
                <div className="dd-kpi-label">CO₂ évité</div>
                <div className="dd-kpi-value">{(data?.co2_avoided_kg ?? 0).toFixed(1)} kg</div>
                <div className="dd-kpi-sub">impact RSE</div>
              </div>
            </>
          )}
        </div>

        {/* Main grid */}
        <div className="dd-grid">

          {/* Lots récents */}
          <div className="dd-section">
            <div className="dd-section-head">
              <span className="dd-section-title">📦 Lots récemment achetés</span>
              <button className="dd-link-btn" onClick={() => navigate(NAV_PATHS.marketplace)}>Voir la marketplace →</button>
            </div>
            <div className="dd-list">
              {loading ? [1,2,3,4].map(i => (
                <div key={i} className="dd-row">
                  <div className="dd-skel" style={{ width: 40, height: 40, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="dd-skel" style={{ width: '55%', height: 10, borderRadius: 4, marginBottom: 6 }} />
                    <div className="dd-skel" style={{ width: '35%', height: 8, borderRadius: 4 }} />
                  </div>
                </div>
              )) : (data?.recent_lots?.length ?? 0) === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">🏭</div>
                  <p>Aucun lot acheté pour le moment.</p>
                  <button className="dd-cta" style={{ marginTop: 8 }} onClick={() => navigate(NAV_PATHS.marketplace)}>
                    Parcourir la marketplace
                  </button>
                </div>
              ) : (
                data!.recent_lots.map(lot => (
                  <div key={lot.id} className="dd-row">
                    <div className="dd-row-icon" style={{ background: `${CATEGORY_COLORS[lot.category] || '#10B981'}18` }}>
                      <span>{lot.category === 'PLASTIQUE' ? '🧴' : lot.category === 'CARTON' ? '📦' :
                        lot.category === 'METAL' ? '🔩' : lot.category === 'VERRE' ? '🫙' : '♻️'}</span>
                    </div>
                    <div className="dd-row-main">
                      <div className="dd-row-title">{lot.weight_kg} kg · {lot.category}</div>
                      <div className="dd-row-sub">{lot.price_per_kg} FCFA/kg
                        {lot.created_at && ` · ${new Date(lot.created_at).toLocaleDateString('fr-FR')}`}
                      </div>
                    </div>
                    <span className={`dd-badge ${
                      lot.status === 'valide' ? 'dd-badge-green' :
                      lot.status === 'reserve' ? 'dd-badge-yellow' :
                      lot.status === 'disponible' ? 'dd-badge-blue' : 'dd-badge-gray'
                    }`}>
                      {lot.status === 'valide' ? 'Validé' : lot.status === 'reserve' ? 'Réservé' :
                       lot.status === 'disponible' ? 'Disponible' : lot.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Colonne droite */}
          <div className="dd-col">

            {/* Répartition matières */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">📊 Matières achetées</span>
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
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.68rem', color: '#52525B' }}>
                          {kg.toFixed(0)} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : loading ? (
                <div className="dd-skel" style={{ height: 80, borderRadius: 8, marginTop: 8 }} />
              ) : (
                <div className="dd-empty"><div className="dd-empty-icon">📊</div><p>Aucune donnée.</p></div>
              )}
            </div>

            {/* Impact RSE */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">🌱 Impact environnemental</span>
                <button className="dd-link-btn" onClick={() => navigate(NAV_PATHS.historique)}>Historique →</button>
              </div>
              <div className="dd-info-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                <div className="dd-info-card-badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                  ♻️ MATIÈRE RECYCLÉE
                </div>
                <div className="dd-info-card-value">
                  {loading ? '…' : `${(data?.total_kg_purchased ?? 0).toLocaleString('fr-FR')} kg`}
                </div>
                <div className="dd-info-card-sub">{loading ? '' : `≈ ${(data?.co2_avoided_kg ?? 0).toFixed(0)} kg CO₂ évité`}</div>
              </div>
            </div>

            {/* Navigation rapide */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">⚡ Accès rapide</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: '🏭 Marketplace', path: NAV_PATHS.marketplace },
                  { label: '📦 Commandes', path: NAV_PATHS.orders },
                  { label: '🕐 Historique achats', path: NAV_PATHS.historique },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      background: '#1A1A24', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '10px 14px', color: '#A1A1AA',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', textAlign: 'left',
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
