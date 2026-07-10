import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getProducerDashboard, getMyWastes } from '../services/producteur.service';
import { useAuth } from '../auth/AuthContext';
import type { ProducerDashboard, WasteLotOut } from '../models/Waste';

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#00A859', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#00A859', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706', TEXTILE: '#7C3AED',
};

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  let badgeClass = 'el-badge el-badge-neutral';
  let label = status || 'Inconnu';
  
  if (s === 'disponible') { badgeClass = 'el-badge el-badge-primary'; label = 'En attente'; }
  else if (s === 'reserve') { badgeClass = 'el-badge el-badge-warning'; label = 'Réservé'; }
  else if (s === 'collecte' || s === 'valide') { badgeClass = 'el-badge el-badge-success'; label = s === 'collecte' ? 'Collecté' : 'Validé'; }
  
  return <span className={badgeClass}>{label}</span>;
}

function KpiCard({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="el-card pd-kpi">
      <div className="pd-kpi-icon-wrap">{icon}</div>
      <div className="pd-kpi-content">
        <div className="pd-kpi-label">{label}</div>
        <div className="pd-kpi-value">{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="el-card pd-kpi el-skeleton">
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--border)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '60%', height: 12, borderRadius: 4, background: 'var(--border)' }} />
        <div style={{ width: '80%', height: 24, borderRadius: 4, background: 'var(--border)' }} />
      </div>
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
      .catch(err => console.error("Erreur chargement dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const latestLot = lots.length > 0 ? lots[0] : null;

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: user?.full_name ?? 'Producteur', role: 'Producteur' }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="el-main">
        <Navbar title="Tableau de bord" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen(v => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
          
        <div className="el-content">
          <div className="pd-hero el-fade-in">
            <div>
              <h1 className="pd-hello">Bonjour {firstName} 👋</h1>
              <p className="pd-sub">Voici un aperçu de votre impact aujourd'hui</p>
            </div>
            <button className="el-btn el-btn-primary" onClick={() => navigate('/producteur/lots')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
              </svg>
              Publier un lot
            </button>
          </div>

          <div className="pd-kpi-grid">
            {loading ? (
              [1,2,3].map(i => <SkeletonCard key={i} />)
            ) : (
              <>
                <KpiCard 
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>} 
                  label="Déchets recyclés" 
                  value={`${(data?.total_kg_recycled ?? 0).toLocaleString('fr-FR')} kg`} 
                />
                <KpiCard 
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>} 
                  label="Collectes" 
                  value={`${data?.collections_count ?? 0}`} 
                />
                <KpiCard 
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>} 
                  label="Récompenses" 
                  value={`${(data?.points ?? 0).toLocaleString('fr-FR')} pts`} 
                />
              </>
            )}
          </div>

          <div className="pd-main-grid">
            <div className="el-card">
              <div className="el-card-header">
                <span className="el-card-title">Dernière collecte</span>
                {lots.length > 0 && (
                  <button className="el-btn el-btn-ghost" onClick={() => navigate(NAV_PATHS.lots)}>
                    Voir l'historique
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="el-skeleton" style={{ height: 100 }} />
              ) : latestLot ? (
                <div className="pd-lot-row" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                  <div className="pd-lot-icon" style={{ width: 48, height: 48, background: `${CATEGORY_COLORS[latestLot.category] || 'var(--primary)'}18` }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {latestLot.category === 'PLASTIQUE' ? '🧴' : latestLot.category === 'CARTON' ? '📦' :
                       latestLot.category === 'METAL' ? '🔩' : latestLot.category === 'VERRE' ? '🫙' : '♻️'}
                    </span>
                  </div>
                  <div className="pd-lot-info">
                    <div className="pd-lot-name" style={{ fontSize: '1.1rem' }}>{latestLot.category}</div>
                    <div className="pd-lot-date">
                      {latestLot.created_at ? new Date(latestLot.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                  <div className="pd-lot-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div className="pd-lot-weight" style={{ fontSize: '1.25rem' }}>{latestLot.weight_kg} kg</div>
                    <StatusBadge status={latestLot.status} />
                  </div>
                </div>
              ) : (
                <div className="pd-empty">
                  <span style={{ fontSize: '2rem' }}>📭</span>
                  <p>Aucun lot publié pour l'instant.</p>
                  <button className="el-btn el-btn-secondary" onClick={() => navigate('/producteur/lots')}>Commencer à recycler</button>
                </div>
              )}
            </div>
            
            <div className="el-card" style={{ background: 'var(--primary)', color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Votre EcoScore</span>
                <span className="el-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8rem' }}>
                  🏆 NIVEAU {(data?.level ?? 'GOLD').toUpperCase()}
                </span>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '3rem', fontFamily: 'Outfit', fontWeight: 800, lineHeight: 1 }}>780</span>
                  <span style={{ fontSize: '1rem', opacity: 0.8 }}>/ 1000</span>
                </div>
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6, opacity: 0.9 }}>
                    <span>Progression vers Platinum</span>
                    <span>78%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '78%', background: '#fff', borderRadius: 3 }} />
                  </div>
                </div>
                
                <div style={{ fontSize: '0.85rem', marginTop: 12, padding: '10px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎁</span> Prochaine récompense : +20 points pour 50 kg recyclés.
                </div>
              </div>
              
              <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: 4 }}>CO₂ Évité</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    {data?.co2_avoided_kg.toFixed(0) ?? 85} kg
                  </div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: 4 }}>Équivalent</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    🌳 3 arbres
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
