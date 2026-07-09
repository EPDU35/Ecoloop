import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getCollectorDashboard, getAvailableWastes, reserveWasteLot } from '../services/collecteur.service';
import { useAuth } from '../auth/AuthContext';
import type { CollectorDashboard, WasteLotOut } from '../models/Waste';
import '../../styles/dark-dashboard.css';

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706', TEXTILE: '#7C3AED',
};

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === 'valide' || s === 'validee' || s === 'payee') return <span className="dd-badge dd-badge-green">Validé</span>;
  if (s === 'reserve' || s === 'en_cours') return <span className="dd-badge dd-badge-yellow">En cours</span>;
  if (s === 'disponible') return <span className="dd-badge dd-badge-blue">Disponible</span>;
  return <span className="dd-badge dd-badge-gray">{status}</span>;
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

export default function CollecteurDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [data, setData] = useState<CollectorDashboard | null>(null);
  const [lots, setLots] = useState<WasteLotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Collecteur';

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    Promise.all([getCollectorDashboard(), getAvailableWastes()])
      .then(([dash, avail]) => { setData(dash); setLots(avail); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    if (NAV_PATHS[key]) navigate(NAV_PATHS[key]);
  };

  const handleReserve = async (id: string) => {
    setReservingId(id);
    try {
      await reserveWasteLot(id);
      const fresh = await getAvailableWastes();
      setLots(fresh);
    } catch (e) {
      console.error(e);
    } finally {
      setReservingId(null);
    }
  };

  const byCategory: Record<string, number> = {};
  lots.forEach(l => { byCategory[l.category] = (byCategory[l.category] || 0) + l.weight_kg; });
  const totalKg = Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;
  const barMax = Math.max(...Object.values(byCategory), 1);

  const activeCollection = data?.my_collections?.find(c =>
    ['reserve', 'en_cours', 'RESERVE', 'EN_COURS'].includes(c.status)
  );

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: user?.full_name ?? 'Collecteur', role: 'Collecteur' }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon Espace Collecteur" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen(v => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content dd-root">

          {/* Hero */}
          <div className="dd-hero">
            <div className="dd-hero-text">
              <h1>Bonjour {firstName} 👋</h1>
              <p>Déchets disponibles autour de vous</p>
            </div>
            <button className="dd-cta" onClick={() => navigate(NAV_PATHS.marketplace ?? '/collecteur/marketplace')}>
              🗺️ Explorer la carte
            </button>
          </div>

          {/* Alerte collecte en cours */}
          {activeCollection && (
            <div className="dd-alert">
              <div className="dd-alert-icon">⏳</div>
              <div className="dd-alert-text">
                <strong>Collecte en cours</strong>
                <span>Poids estimé : {activeCollection.actual_weight_kg ?? '—'} kg</span>
              </div>
              <button className="dd-alert-btn" onClick={() => navigate('/collecteur/tournees')}>
                Valider →
              </button>
            </div>
          )}

          {/* KPIs */}
          <div className="dd-kpi-grid">
            {loading ? (
              [1,2,3,4].map(i => <SkeletonKpi key={i} />)
            ) : (
              <>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">🚛</div>
                  <div className="dd-kpi-label">Collectes terminées</div>
                  <div className="dd-kpi-value">{data?.completed_collections ?? 0}</div>
                  <div className="dd-kpi-sub">sur {data?.total_collections ?? 0} total</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">♻️</div>
                  <div className="dd-kpi-label">Poids collecté</div>
                  <div className="dd-kpi-value">
                    {(data?.available_lots?.reduce((s, l) => s + l.weight_kg, 0) ?? 0).toLocaleString('fr-FR')} kg
                  </div>
                  <div className="dd-kpi-sub">{lots.length} lots disponibles</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">💰</div>
                  <div className="dd-kpi-label">Gains totaux</div>
                  <div className="dd-kpi-value">
                    {(data?.total_earnings_fcfa ?? 0).toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="dd-kpi-sub">commissions perçues</div>
                </div>
                <div className="dd-kpi">
                  <div className="dd-kpi-icon">⭐</div>
                  <div className="dd-kpi-label">Réputation</div>
                  <div className="dd-kpi-value">{(data?.reputation_score ?? 0).toFixed(1)} / 5</div>
                  <div className="dd-kpi-sub">score de fiabilité</div>
                </div>
              </>
            )}
          </div>

          {/* Main grid */}
          <div className="dd-grid">

            {/* Lots disponibles */}
            <div className="dd-section">
              <div className="dd-section-head">
                <span className="dd-section-title">🗺️ Lots disponibles à collecter</span>
                <button className="dd-link-btn" onClick={() => navigate(NAV_PATHS.marketplace ?? '/collecteur/marketplace')}>
                  Voir tout →
                </button>
              </div>
              <div className="dd-list">
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="dd-row">
                      <div className="dd-skel" style={{ width: 40, height: 40, borderRadius: 10 }} />
                      <div style={{ flex: 1 }}>
                        <div className="dd-skel" style={{ width: '50%', height: 10, borderRadius: 4, marginBottom: 6 }} />
                        <div className="dd-skel" style={{ width: '35%', height: 8, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))
                ) : lots.length === 0 ? (
                  <div className="dd-empty">
                    <div className="dd-empty-icon">📭</div>
                    <p>Aucun lot disponible pour le moment.</p>
                  </div>
                ) : (
                  lots.slice(0, 8).map(lot => (
                    <div key={lot.id} className="dd-row">
                      <div className="dd-row-icon" style={{ background: `${CATEGORY_COLORS[lot.category] || '#10B981'}18` }}>
                        <span>{lot.category === 'PLASTIQUE' ? '🧴' : lot.category === 'CARTON' ? '📦' :
                          lot.category === 'METAL' ? '🔩' : lot.category === 'VERRE' ? '🫙' : '♻️'}</span>
                      </div>
                      <div className="dd-row-main">
                        <div className="dd-row-title">{lot.weight_kg} kg · {lot.category}</div>
                        <div className="dd-row-sub">{lot.price_per_kg} FCFA/kg</div>
                      </div>
                      <button
                        style={{
                          background: '#10B981', color: '#000', border: 'none',
                          borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem',
                          fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                          opacity: reservingId === lot.id ? 0.5 : 1,
                        }}
                        onClick={() => handleReserve(lot.id)}
                        disabled={reservingId === lot.id}
                      >
                        {reservingId === lot.id ? '…' : 'Réserver'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right */}
            <div className="dd-col">

              {/* Score réputation */}
              {!loading && (
                <div className="dd-section">
                  <div className="dd-section-head">
                    <span className="dd-section-title">Score de réputation</span>
                  </div>
                  <div className="dd-score">
                    <div className="dd-score-circle" style={{
                      borderColor: (data?.reputation_score ?? 0) >= 4 ? '#10B981' :
                        (data?.reputation_score ?? 0) >= 2.5 ? '#F59E0B' : '#EF4444'
                    }}>
                      <span className="dd-score-num">{(data?.reputation_score ?? 0).toFixed(1)}</span>
                    </div>
                    <div>
                      <div className="dd-score-label">
                        {(data?.reputation_score ?? 0) >= 4 ? '🌟 Excellent' :
                          (data?.reputation_score ?? 0) >= 2.5 ? '👍 Bien' : '⚠️ À améliorer'}
                      </div>
                      <div className="dd-score-sub">{data?.completed_collections ?? 0} collectes validées</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Répartition matières */}
              {!loading && Object.keys(byCategory).length > 0 && (
                <div className="dd-section">
                  <div className="dd-section-head">
                    <span className="dd-section-title">Matières disponibles</span>
                  </div>
                  <div className="dd-bars">
                    {Object.entries(byCategory).slice(0, 6).map(([cat, kg]) => (
                      <div key={cat} className="dd-bar-col">
                        <div className="dd-bar" style={{
                          height: `${(kg / barMax) * 70}px`,
                          background: CATEGORY_COLORS[cat] || '#10B981',
                          opacity: 0.85,
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
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.68rem', color: '#52525B' }}>{kg} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mes collectes récentes */}
              {!loading && (data?.my_collections?.length ?? 0) > 0 && (
                <div className="dd-section">
                  <div className="dd-section-head">
                    <span className="dd-section-title">Mes collectes</span>
                    <button className="dd-link-btn" onClick={() => navigate('/collecteur/tournees')}>Voir tout →</button>
                  </div>
                  <div className="dd-list">
                    {data!.my_collections.slice(0, 4).map(c => (
                      <div key={c.id} className="dd-row">
                        <div className="dd-row-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>🚛</div>
                        <div className="dd-row-main">
                          <div className="dd-row-title">{c.actual_weight_kg ? `${c.actual_weight_kg} kg` : 'En cours'}</div>
                          <div className="dd-row-sub">
                            {c.validated_at ? new Date(c.validated_at).toLocaleDateString('fr-FR') :
                              c.reserved_at ? new Date(c.reserved_at).toLocaleDateString('fr-FR') : '—'}
                          </div>
                        </div>
                        {statusBadge(c.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
