import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getProducerDashboard, getMyWastes } from '../services/producteur.service';
import { useAuth } from '../auth/AuthContext';
import type { ProducerDashboard, WasteLotOut } from '../models/Waste';

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706', TEXTILE: '#7C3AED',
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    disponible: { label: 'En attente', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    reserve:    { label: 'Réservé',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    collecte:   { label: 'Collecté',   color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    valide:     { label: 'Validé',     color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  };
  const s = cfg[status?.toLowerCase()] || { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 999,
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {s.label}
    </span>
  );
}

function KpiCard({ label, value, icon, sub }: { label: string; value: string; icon: string; sub?: string }) {
  return (
    <div className="pd-kpi">
      <div className="pd-kpi-icon">{icon}</div>
      <div className="pd-kpi-label">{label}</div>
      <div className="pd-kpi-value">{value}</div>
      {sub && <div className="pd-kpi-sub">{sub}</div>}
    </div>
  );
}

function MiniBar({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginTop: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', height: `${(d.value / max) * 70}px`,
            minHeight: 4,
            background: d.color,
            borderRadius: '3px 3px 0 0',
            opacity: 0.9,
            transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
          }} />
          <span style={{ fontSize: '0.62rem', color: '#A1A1AA', fontFamily: 'IBM Plex Mono,monospace', textAlign: 'center', lineHeight: 1.2 }}>
            {d.label.substring(0, 4)}
          </span>
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="pd-kpi" style={{ animation: 'pdPulse 1.4s ease-in-out infinite' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
      <div style={{ width: '60%', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
      <div style={{ width: '80%', height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

export default function ProducteurDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [data, setData] = useState<ProducerDashboard | null>(null);
  const [lots, setLots] = useState<WasteLotOut[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Producteur';

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    Promise.all([getProducerDashboard(), getMyWastes()])
      .then(([dash, myLots]) => { setData(dash); setLots(myLots); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const co2 = data ? data.co2_avoided_kg : 0;
  const barData = lots.slice(0, 6).map(l => ({
    label: l.category,
    value: l.weight_kg,
    color: CATEGORY_COLORS[l.category] || '#10B981',
  }));

  const byCategory: Record<string, number> = {};
  lots.forEach(l => { byCategory[l.category] = (byCategory[l.category] || 0) + l.weight_kg; });
  const totalKg = Object.values(byCategory).reduce((a, b) => a + b, 0);

  const levelColor: Record<string, string> = {
    BRONZE: '#D97706', SILVER: '#9CA3AF', GOLD: '#F59E0B', PLATINUM: '#10B981',
  };
  const lvl = (data?.level ?? 'BRONZE').toUpperCase();

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: user?.full_name ?? 'Producteur', role: 'Producteur' }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon Espace Producteur" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen(v => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content pd-root">

          {/* ── Header hero ── */}
          <div className="pd-hero">
            <div className="pd-hero-text">
              <h1 className="pd-hello">Bonjour {firstName} 👋</h1>
              <p className="pd-sub">Voici un aperçu de votre impact aujourd'hui</p>
            </div>
            <button className="pd-cta" onClick={() => navigate('/producteur/lots')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
              </svg>
              Publier un lot
            </button>
          </div>

          {/* ── KPI Grid ── */}
          <div className="pd-kpi-grid">
            {loading ? (
              [1,2,3,4].map(i => <SkeletonCard key={i} />)
            ) : (
              <>
                <KpiCard icon="♻️" label="Déchets valorisés" value={`${(data?.total_kg_recycled ?? 0).toLocaleString('fr-FR')} kg`} sub={`CO₂ évité : ${co2.toFixed(1)} kg`} />
                <KpiCard icon="📦" label="Lots publiés" value={`${lots.length}`} sub={`${lots.filter(l => l.status === 'disponible').length} disponibles`} />
                <KpiCard icon="🚛" label="Collectes réalisées" value={`${data?.collections_count ?? 0}`} sub="validées" />
                <KpiCard icon="💰" label="Revenus totaux" value={`${(data?.total_revenue_fcfa ?? 0).toLocaleString('fr-FR')} FCFA`} sub="montant net" />
              </>
            )}
          </div>

          {/* ── Main grid ── */}
          <div className="pd-main-grid">

            {/* ── Lots récents ── */}
            <div className="pd-section">
              <div className="pd-section-head">
                <span className="pd-section-title">Mes derniers lots</span>
                <button className="pd-see-all" onClick={() => navigate(NAV_PATHS.lots)}>Voir tout →</button>
              </div>
              <div className="pd-lots-list">
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="pd-lot-row" style={{ animation: 'pdPulse 1.4s ease-in-out infinite' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '50%', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
                        <div style={{ width: '30%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    </div>
                  ))
                ) : lots.length === 0 ? (
                  <div className="pd-empty">
                    <span style={{ fontSize: '2rem' }}>📭</span>
                    <p>Aucun lot publié pour l'instant.</p>
                    <button className="pd-cta" onClick={() => navigate('/producteur/lots')}>Publier maintenant</button>
                  </div>
                ) : (
                  lots.slice(0, 6).map(lot => (
                    <div key={lot.id} className="pd-lot-row">
                      <div className="pd-lot-icon" style={{ background: `${CATEGORY_COLORS[lot.category] || '#10B981'}18` }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {lot.category === 'PLASTIQUE' ? '🧴' : lot.category === 'CARTON' ? '📦' :
                           lot.category === 'METAL' ? '🔩' : lot.category === 'VERRE' ? '🫙' : '♻️'}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pd-lot-name">{lot.weight_kg} kg · {lot.category}</div>
                        <div className="pd-lot-date">
                          {lot.created_at ? new Date(lot.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
                        </div>
                      </div>
                      <StatusBadge status={lot.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="pd-right-col">

              {/* Niveau & récompenses */}
              <div className="pd-section">
                <div className="pd-section-head">
                  <span className="pd-section-title">Niveau & Points</span>
                </div>
                <div className="pd-level-card" style={{ borderColor: `${levelColor[lvl] ?? '#10B981'}44` }}>
                  <div className="pd-level-badge" style={{ background: `${levelColor[lvl] ?? '#10B981'}18`, color: levelColor[lvl] ?? '#10B981' }}>
                    🏆 {lvl}
                  </div>
                  <div className="pd-level-points">{(data?.points ?? 0).toLocaleString('fr-FR')}</div>
                  <div className="pd-level-sub">points EcoLoop</div>
                </div>
              </div>

              {/* Répartition matières */}
              {!loading && barData.length > 0 && (
                <div className="pd-section">
                  <div className="pd-section-head">
                    <span className="pd-section-title">Répartition matières</span>
                  </div>
                  <MiniBar data={barData} />
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(byCategory).map(([cat, kg]) => (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[cat] || '#10B981', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '0.78rem', color: '#A1A1AA' }}>{cat}</span>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.78rem', color: '#F8FAFC', fontWeight: 600 }}>
                          {((kg / totalKg) * 100).toFixed(0)}%
                        </span>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.72rem', color: '#71717A' }}>
                          {kg} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prévisions IA */}
              {!loading && data?.price_predictions && Object.keys(data.price_predictions).length > 0 && (
                <div className="pd-section">
                  <div className="pd-section-head">
                    <span className="pd-section-title">📈 Prévisions IA</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {Object.entries(data.price_predictions).slice(0, 4).map(([cat, preds]) => {
                      const arr = preds as any[];
                      const price = arr[0]?.price ?? arr[0]?.yhat ?? arr[0] ?? '—';
                      return (
                        <div key={cat} style={{
                          background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          borderRadius: 10, padding: '8px 12px', minWidth: 90,
                        }}>
                          <div style={{ fontSize: '0.68rem', color: '#71717A', marginBottom: 2 }}>{cat.substring(0, 5)}</div>
                          <div style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.82rem', color: '#10B981', fontWeight: 700 }}>
                            {typeof price === 'number' ? `${Math.round(price)} F` : price}
                          </div>
                        </div>
                      );
                    })}
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
