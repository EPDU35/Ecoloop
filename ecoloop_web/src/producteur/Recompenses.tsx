import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useAuth } from '../auth/AuthContext';
import { getProducerDashboard } from '../services/producteur.service';

const REWARDS_CATALOG = [
  { id: 'mobile_5000', name: 'Recharge Mobile Money 5 000 FCFA', cost: 5500, icon: '📱', category: 'Mobile Money', desc: 'Orange Money / Moov Money / Wave' },
  { id: 'mobile_10000', name: 'Recharge Mobile Money 10 000 FCFA', cost: 10500, icon: '📱', category: 'Mobile Money', desc: 'Orange Money / Moov Money / Wave' },
  { id: 'virement_25000', name: 'Virement bancaire 25 000 FCFA', cost: 26000, icon: '🏦', category: 'Virement', desc: 'Vers votre compte bancaire (délai 48h)' },
  { id: 'virement_50000', name: 'Virement bancaire 50 000 FCFA', cost: 51000, icon: '🏦', category: 'Virement', desc: 'Vers votre compte bancaire (délai 48h)' },
  { id: 'goodies_tshirt', name: 'T-shirt EcoLoop "Ambassadeur"', cost: 8000, icon: '👕', category: 'Goodies', desc: 'Coton bio, coupe unisexe, livré chez vous' },
  { id: 'goodies_tote', name: 'Sac tote bag EcoLoop', cost: 4500, icon: '🛍️', category: 'Goodies', desc: '100% coton recyclé, format A4' },
  { id: 'don_arbre', name: 'Planter un arbre en votre nom', cost: 3000, icon: '🌳', category: 'Impact', desc: 'Certificat de plantation + géolocalisation' },
  { id: 'don_ecole', name: 'Kit scolaire pour un enfant', cost: 12000, icon: '🎒', category: 'Impact', desc: 'Cartable, cahiers, stylos - remis via ONG partenaire' },
];

const LEVELS = [
  { key: 'BRONZE', name: 'Bronze', minPoints: 0, color: '#D97706', icon: '🥉', perks: ['Accès catalogue basique', 'Support email'] },
  { key: 'SILVER', name: 'Argent', minPoints: 5000, color: '#9CA3AF', icon: '🥈', perks: ['Catalogue complet', 'Support prioritaire', '-10% sur goodies'] },
  { key: 'GOLD', name: 'Or', minPoints: 15000, color: '#F59E0B', icon: '🥇', perks: ['Catalogue + offres exclusives', 'Support dédié', '-20% sur goodies', 'Virements gratuits'] },
  { key: 'PLATINUM', name: 'Platine', minPoints: 50000, color: '#10B981', icon: '💎', perks: ['Tout illimité', 'Gestionnaire de compte', 'Invitations événements', 'Commission réduite 3%'] },
];

function RewardCard({ reward, points, onRedeem, disabled }: { reward: typeof REWARDS_CATALOG[0]; points: number; onRedeem: () => void; disabled: boolean }) {
  const canAfford = points >= reward.cost;
  return (
    <div className={`pd-reward-card ${!canAfford ? 'unaffordable' : ''} ${disabled ? 'redeeming' : ''}`}>
      <div className="pd-reward-head">
        <span className="pd-reward-icon">{reward.icon}</span>
        <span className="pd-reward-cat">{reward.category}</span>
      </div>
      <h4>{reward.name}</h4>
      <p className="pd-reward-desc">{reward.desc}</p>
      <div className="pd-reward-footer">
        <span className="pd-reward-cost">
          <span className="pd-points-icon">⭐</span> {reward.cost.toLocaleString('fr-FR')} pts
        </span>
        <button
          className={`el-btn ${canAfford ? 'el-btn-amber' : 'el-btn-ghost'}`}
          onClick={onRedeem}
          disabled={!canAfford || disabled}
        >
          {canAfford ? 'Échanger' : 'Points insuffisants'}
        </button>
      </div>
    </div>
  );
}

function LevelBadge({ level, current, onClick }: { level: typeof LEVELS[0]; current: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`pd-level-badge ${current ? 'current' : ''}`} onClick={onClick} style={{ borderColor: level.color }}>
      <span className="pd-level-icon">{level.icon}</span>
      <span className="pd-level-name">{level.name}</span>
      {current && <span className="pd-level-current">Actuel</span>}
    </button>
  );
}

function PerkItem({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2, color: 'var(--el-signal)' }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span style={{ fontSize: '0.85rem', color: 'var(--el-ink-soft)' }}>{text}</span>
    </div>
  );
}

export default function Recompenses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState('BRONZE');
  const [history, setHistory] = useState<Array<{ id: string; reward: string; cost: number; date: string; status: string }>>([]);
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[0]>(LEVELS[0]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  useEffect(() => {
    getProducerDashboard()
      .then(dash => {
        setPoints(dash.points ?? 0);
        setLevel((dash.level ?? 'BRONZE').toUpperCase());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentLevelData = LEVELS.find(l => l.key === level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minPoints > currentLevelData.minPoints);

  const handleRedeem = (reward: typeof REWARDS_CATALOG[0]) => {
    if (points < reward.cost) return;
    setRedeeming(reward.id);
    // Simulate API call
    setTimeout(() => {
      setPoints(p => p - reward.cost);
      setHistory(prev => [{
        id: `EXC-${Date.now().toString(36).toUpperCase()}`,
        reward: reward.name,
        cost: reward.cost,
        date: new Date().toISOString(),
        status: 'Confirmé',
      }, ...prev]);
      setRedeeming(null);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="revenus" onSelect={handleSelect} user={{ name: "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Récompenses" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="el-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="revenus" onSelect={handleSelect} user={{ name: user?.full_name || "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mes Récompenses" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content pd-root">

          {/* Points Hero */}
          <div className="pd-rewards-hero">
            <div className="pd-points-main">
              <div className="pd-points-label">Vos points EcoLoop</div>
              <div className="pd-points-value">{points.toLocaleString('fr-FR')}</div>
              <div className="pd-points-sub">⭐ {!nextLevel ? 'Niveau max atteint !' : `${((nextLevel.minPoints || 0) - points || 0).toLocaleString('fr-FR')} pts pour le niveau ${nextLevel.name}`}</div>
            </div>
            <div className="pd-level-progress" style={{ minWidth: 200 }}>
              <div className="pd-level-badge" style={{ background: `${currentLevelData.color}18`, color: currentLevelData.color, borderColor: currentLevelData.color }}>
                <span className="pd-level-icon">{currentLevelData.icon}</span>
                <span className="pd-level-name-large">{currentLevelData.name}</span>
              </div>
              {nextLevel && (
                <div className="pd-next-level">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--el-ink-soft)', marginBottom: '0.5rem' }}>
                    <span>Progression vers {nextLevel.name}</span>
                    <span>{Math.min(100, Math.round((points / (nextLevel.minPoints || 1)) * 100))}%</span>
                  </div>
                  <div className="pd-progress-bar">
                    <div className="pd-progress-fill" style={{ width: `${Math.min(100, (points / (nextLevel.minPoints || 1)) * 100)}%`, background: nextLevel.color }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Level Selector */}
          <div className="el-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>Vos avantages par niveau</h3>
            <div className="pd-level-selector">
              {LEVELS.map(l => (
                <LevelBadge key={l.key} level={l} current={selectedLevel.key === l.key} onClick={() => setSelectedLevel(l)} />
              ))}
            </div>
            <div className="pd-level-perks" style={{ marginTop: '1.5rem' }}>
              {selectedLevel.perks.map((p, i) => <PerkItem key={i} text={p} />)}
            </div>
          </div>

          {/* Rewards Catalog */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Fraunces, serif' }}>Catalogue de récompenses</h3>
              <span className="el-pill info">{REWARDS_CATALOG.length} offres disponibles</span>
            </div>
            <div className="pd-rewards-grid">
              {REWARDS_CATALOG.map(r => (
                <RewardCard key={r.id} reward={r} points={points} onRedeem={() => handleRedeem(r)} disabled={redeeming === r.id} />
              ))}
            </div>
          </div>

          {/* History */}
          <div className="el-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>Historique des échanges</h3>
            {history.length === 0 ? (
              <p className="el-empty" style={{ textAlign: 'center', padding: '2rem' }}>Aucun échange effectué pour le moment</p>
            ) : (
              <div className="el-table-wrap">
                <table className="el-table">
                  <thead>
                    <tr><th>Réf.</th><th>Récompense</th><th>Coût</th><th>Date</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id}>
                        <td className="el-mono" style={{ fontWeight: 600 }}>{h.id}</td>
                        <td>{h.reward}</td>
                        <td className="el-mono">{h.cost.toLocaleString('fr-FR')} pts</td>
                        <td className="el-mono">{new Date(h.date).toLocaleDateString('fr-FR')}</td>
                        <td><span className={`el-pill ${h.status === 'Confirmé' ? 'success' : 'in_transit'}`}>{h.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}