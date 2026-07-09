import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { NAV_PATHS } from './nav';
import api from '../services/api';
import '../../styles/dark-dashboard.css';

interface MunicipalityDash {
  users_count: number;
  total_weight_kg: number;
  co2_avoided_kg: number;
  collections_count: number;
  collections_validated: number;
  waste_lots_available: number;
  by_category_kg: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706',
};

function Skel({ w, h }: { w: string; h: number }) {
  return <div className="dd-skel" style={{ width: w, height: h, borderRadius: 6, marginBottom: 8 }} />;
}

export default function MunicipalityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<MunicipalityDash | null>(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Mairie';

  useEffect(() => {
    api.get('/dashboard/municipality')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byCategory = data?.by_category_kg ?? {};
  const totalKg = Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;
  const barMax = Math.max(...Object.values(byCategory), 1);
  const validationRate = data && data.collections_count > 0
    ? Math.round((data.collections_validated / data.collections_count) * 100) : 0;

  return (
    <AppLayout role="municipality" activeKey="dashboard" title="">
      <div className="dd-root" style={{ padding: 0 }}>

        {/* Hero */}
        <div className="dd-hero">
          <div className="dd-hero-text">
            <h1>Bonjour {firstName} 👋</h1>
            <p>Tableau de bord Mairie & RSE — vue globale du territoire</p>
          </div>
          <button className="dd-cta" onClick={() => navigate(NAV_PATHS.carte)}>
            🗺️ Carte des déchets
          </button>
        </div>

        {/* KPI Grid */}
        <div className="dd-kpi-grid">
          {loading ? [1,2,3,4].map(i => (
            <div key={i} className="dd-kpi"><Skel w="40px" h={40} /><Skel w="60%" h={9} /><Skel w="75%" h={18} /></div>
          )) : (
            <>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">♻️</div>
                <div className="dd-kpi-label">Déchets valorisés</div>
                <div className="dd-kpi-value">{(data?.total_weight_kg ?? 0).toLocaleString('fr-FR')} kg</div>
                <div className="dd-kpi-sub">sur le territoire</div>
              </div>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">🌍</div>
                <div className="dd-kpi-label">CO₂ évité</div>
                <div className="dd-kpi-value">{(data?.co2_avoided_kg ?? 0).toFixed(1)} kg</div>
                <div className="dd-kpi-sub">impact environnemental</div>
              </div>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">🚛</div>
                <div className="dd-kpi-label">Collectes</div>
                <div className="dd-kpi-value">{data?.collections_count ?? 0}</div>
                <div className="dd-kpi-sub">{data?.collections_validated ?? 0} validées · {validationRate}%</div>
              </div>
              <div className="dd-kpi">
                <div className="dd-kpi-icon">📦</div>
                <div className="dd-kpi-label">Lots disponibles</div>
                <div className="dd-kpi-value">{data?.waste_lots_available ?? 0}</div>
                <div className="dd-kpi-sub">{data?.users_count ?? 0} citoyens inscrits</div>
              </div>
            </>
          )}
        </div>

        {/* Main grid */}
        <div className="dd-grid">

          {/* Répartition déchets par catégorie */}
          <div className="dd-section">
            <div className="dd-section-head">
              <span className="dd-section-title">🗑️ Déchets par catégorie</span>
              <button className="dd-link-btn" onClick={() => navigate(NAV_PATHS.reports)}>Rapports →</button>
            </div>

            {loading ? (
              <div className="dd-skel" style={{ height: 100, borderRadius: 8, marginTop: 8 }} />
            ) : Object.keys(byCategory).length === 0 ? (
              <div className="dd-empty">
                <div className="dd-empty-icon">📊</div>
                <p>Aucune donnée de répartition disponible.</p>
              </div>
            ) : (
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
                        {kg.toFixed(1)} kg
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Taux de validation */}
            {!loading && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6, color: '#A1A1AA' }}>
                  <span>Taux de collectes validées</span>
                  <strong style={{ color: '#F8FAFC' }}>{validationRate}%</strong>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${validationRate}%`,
                    background: validationRate >= 70 ? '#10B981' : validationRate >= 40 ? '#F59E0B' : '#EF4444',
                    borderRadius: 3, transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite */}
          <div className="dd-col">

            {/* Impact RSE */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">🌱 Impact RSE</span>
                <button className="dd-link-btn" onClick={() => navigate(NAV_PATHS.impact)}>Détails →</button>
              </div>
              <div className="dd-info-card" style={{ borderColor: 'rgba(16,185,129,0.25)' }}>
                <div className="dd-info-card-badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                  🌍 BILAN CARBONE
                </div>
                <div className="dd-info-card-value">{loading ? '…' : `${(data?.co2_avoided_kg ?? 0).toFixed(0)} kg`}</div>
                <div className="dd-info-card-sub">de CO₂ évité cette année</div>
              </div>
            </div>

            {/* Liens rapides */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">⚡ Accès rapide</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: '🗺️ Carte des déchets', path: NAV_PATHS.carte },
                  { label: '⚠️ Signalements', path: NAV_PATHS.alertes },
                  { label: '📊 Impact RSE', path: NAV_PATHS.impact },
                  { label: '📋 Rapports', path: NAV_PATHS.reports },
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
