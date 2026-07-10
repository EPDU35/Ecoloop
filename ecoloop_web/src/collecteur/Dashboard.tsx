import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getCollectorDashboard, getAvailableWastes, reserveWasteLot } from '../services/collecteur.service';
import { useAuth } from '../auth/AuthContext';
import type { CollectorDashboard, WasteLotOut } from '../models/Waste';

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

  const activeCollection = data?.my_collections?.find(c =>
    ['reserve', 'en_cours', 'RESERVE', 'EN_COURS'].includes(c.status)
  );

  // Mock IA de la meilleure mission
  const recommendedMission = lots.length > 0 ? lots[0] : null;

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="dashboard" onSelect={handleSelect}
        user={{ name: user?.full_name ?? 'Collecteur', role: 'Collecteur' }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="EcoLoop Mission Intelligence" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen(v => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-fade-in" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>
              Bonjour {firstName} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
              L'IA EcoLoop a analysé les besoins et trouvé la mission idéale pour vous.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
            
            {/* Colonne Principale: Mission IA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {activeCollection && (
                <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.5rem' }}>⏳</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#854D0E' }}>Mission en cours</div>
                      <div style={{ fontSize: '0.9rem', color: '#A16207' }}>Poids estimé : {activeCollection.actual_weight_kg ?? '—'} kg</div>
                    </div>
                  </div>
                  <button className="el-btn el-btn-primary" onClick={() => navigate('/collecteur/tournees')}>Continuer</button>
                </div>
              )}

              <div className="el-card" style={{ borderTop: '4px solid #10B981', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 700, borderRadius: '0 0 0 12px' }}>
                  ⭐ RECOMMANDÉ PAR L'IA
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Mission recommandée</span>
                  <h2 style={{ margin: '8px 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                    📍 Marché Central
                  </h2>
                </div>

                {loading ? (
                  <div className="el-skeleton" style={{ height: 200 }} />
                ) : recommendedMission ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                      <div style={{ padding: 16, background: 'var(--background)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distance</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>850 m</div>
                      </div>
                      <div style={{ padding: 16, background: 'var(--background)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Déchets estimés</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>120 kg</div>
                      </div>
                      <div style={{ padding: 16, background: 'var(--background)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gain estimé</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: '#10B981' }}>2500 FCFA</div>
                      </div>
                      <div style={{ padding: 16, background: 'rgba(59,130,246,0.1)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#3B82F6' }}>Score IA</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: '#3B82F6' }}>94%</div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--background)', padding: 20, borderRadius: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, marginBottom: 12 }}>Pourquoi cette mission ?</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ color: '#10B981' }}>✓</span> Très proche de votre position actuelle (gain de temps)
                        </li>
                        <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ color: '#10B981' }}>✓</span> Parfaitement adapté à la capacité de votre tricycle
                        </li>
                        <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ color: '#10B981' }}>✓</span> Zone prioritaire signalée par la mairie (risque de saturation)
                        </li>
                      </ul>
                    </div>

                    <button 
                      className="el-btn el-btn-primary" 
                      style={{ width: '100%', padding: 16, fontSize: '1.2rem', justifyContent: 'center' }}
                      onClick={() => handleReserve(recommendedMission.id)}
                      disabled={reservingId === recommendedMission.id}
                    >
                      {reservingId === recommendedMission.id ? 'Acceptation...' : 'Accepter la mission IA'}
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Aucune mission prioritaire pour le moment.
                  </div>
                )}
              </div>
            </div>

            {/* Colonne Droite: Statistiques & Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div className="el-card" style={{ background: '#0F172A', color: '#F8FAFC', border: 'none' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Performances IA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                    4.8
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Score de fiabilité</div>
                    <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Basé sur 14 missions</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, fontSize: '0.9rem', color: '#9CA3AF' }}>
                  L'IA augmente vos gains de +24% en optimisant vos trajets.
                </div>
              </div>

              <div className="el-card">
                <div className="el-card-header">
                  <span className="el-card-title">Autres lots à proximité</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {lots.slice(1, 4).map(lot => (
                    <div key={lot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{lot.category}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lot.weight_kg} kg • ~ {lot.weight_kg * (lot.price_per_kg || 15)} FCFA</div>
                      </div>
                      <button 
                        className="el-btn el-btn-ghost" 
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleReserve(lot.id)}
                        disabled={reservingId === lot.id}
                      >
                        Réserver
                      </button>
                    </div>
                  ))}
                  {lots.length <= 1 && !loading && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>Aucun autre lot proche.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
