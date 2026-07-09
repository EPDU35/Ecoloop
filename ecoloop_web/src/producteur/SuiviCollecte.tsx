import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getTransactionHistory } from '../services/producteur.service';
import { useAuth } from '../auth/AuthContext';
import type { TransactionOut } from '../models/Transaction';

const STATUS_STEPS = [
  { key: 'recherche', label: 'Recherche collecteur', icon: '🔍' },
  { key: 'reserve', label: 'Collecteur trouvé', icon: '🤝' },
  { key: 'collecte', label: 'En collecte', icon: '🚚' },
  { key: 'valide', label: 'Validé & payé', icon: '✅' },
];

const STATUS_MAP: Record<string, { step: number; label: string; icon: string }> = {
  disponible: { step: 0, label: 'Recherche collecteur', icon: '🔍' },
  reserve: { step: 1, label: 'Collecteur trouvé', icon: '🤝' },
  collecte: { step: 2, label: 'En collecte', icon: '🚚' },
  valide: { step: 3, label: 'Validé & payé', icon: '✅' },
};

function StatusTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="pd-timeline">
      {STATUS_STEPS.map((s, i) => (
        <div key={s.key} className={`pd-tl-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}>
          <div className="pd-tl-dot" style={{ background: i <= currentStep ? 'var(--el-signal)' : 'var(--el-line-dark)' }} />
          <div className="pd-tl-content">
            <div className="pd-tl-icon">{s.icon}</div>
            <div className="pd-tl-label">{s.label}</div>
            <div className={`pd-tl-status ${i < currentStep ? 'done' : i === currentStep ? 'current' : 'pending'}`}>
              {i < currentStep ? '✓ Terminé' : i === currentStep ? 'En cours' : 'En attente'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ label, value, icon, href }: { label: string; value: string; icon: string; href?: string }) {
  return (
    <a href={href || '#'} className="pd-info-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="pd-info-icon">{icon}</div>
      <div className="pd-info-label">{label}</div>
      <div className="pd-info-value">{value}</div>
    </a>
  );
}

export default function SuiviCollecte() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [transaction, setTransaction] = useState<TransactionOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  useEffect(() => {
    if (!id) return;
    getTransactionHistory()
      .then(list => {
        const found = list.find(t => t.id === id || t.id.slice(0, 8) === id);
        if (found) setTransaction(found);
        else setError('Collecte introuvable');
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="collectes" onSelect={handleSelect} user={{ name: "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Suivi collecte" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="el-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="collectes" onSelect={handleSelect} user={{ name: "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Suivi collecte" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <div className="el-card" style={{ maxWidth: 400 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Collecte introuvable</h2>
              <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>{error || 'Cette collecte n\'existe pas ou vous n\'y avez pas accès.'}</p>
              <a className="el-btn el-btn-amber" href="/producteur/collectes" onClick={(e) => { e.preventDefault(); navigate('/producteur/collectes'); }}>Retour aux collectes</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[transaction.status?.toLowerCase()] || { step: 0, label: transaction.status, icon: '📋' };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="collectes" onSelect={handleSelect} user={{ name: user?.full_name || "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title={`Collecte #${transaction.id.slice(0, 8)}`} searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="pd-single-header">
            <div className="pd-single-status">
              <span className={`el-pill ${transaction.status === 'PAYEE' ? 'success' : 'in_transit'}`}>
                {transaction.status === 'PAYEE' ? 'Payée' : transaction.status === 'EN_ATTENTE' ? 'En attente' : transaction.status}
              </span>
            </div>
            <div className="pd-single-meta">
              <span className="el-mono">Réf. {transaction.id.slice(0, 8)}</span>
              <span className="el-mono">{new Date(transaction.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <StatusTimeline currentStep={statusInfo.step} />

          <div className="pd-info-grid" style={{ marginTop: '2rem' }}>
            <InfoCard label="Montant net" value={`${transaction.net_amount.toLocaleString('fr-FR')} FCFA`} icon="💰" />
            <InfoCard label="Montant brut" value={`${transaction.gross_amount.toLocaleString('fr-FR')} FCFA`} icon="💵" />
            <InfoCard label="Commission" value={`${transaction.commission_amount.toLocaleString('fr-FR')} FCFA`} icon="📊" />
            <InfoCard label="Statut" value={statusInfo.label} icon={statusInfo.icon} />
          </div>

          <div className="el-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>Détails de la transaction</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><span className="el-label">Type</span><div className="el-value">{transaction.waste_type || '—'}</div></div>
              <div><span className="el-label">Poids collecté</span><div className="el-value">{transaction.actual_weight_kg?.toLocaleString('fr-FR') || '—'} kg</div></div>
              <div><span className="el-label">Prix/kg</span><div className="el-value">{transaction.price_per_kg?.toLocaleString('fr-FR') || '—'} FCFA</div></div>
              <div><span className="el-label">Collecteur</span><div className="el-value">{transaction.collector_name || '—'}</div></div>
              <div><span className="el-label">Date collecte</span><div className="el-value">{transaction.collected_at ? new Date(transaction.collected_at).toLocaleDateString('fr-FR') : '—'}</div></div>
              <div><span className="el-label">Date paiement</span><div className="el-value">{transaction.paid_at ? new Date(transaction.paid_at).toLocaleDateString('fr-FR') : '—'}</div></div>
            </div>
          </div>

          {transaction.status === 'EN_ATTENTE' && (
            <div className="el-card" style={{ marginTop: '1.5rem', borderColor: 'var(--el-amber)', background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
                <div>
                  <strong>En attente de validation</strong>
                  <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem', margin: 0 }}>
                    Le collecteur a récupéré le lot. Le paiement sera déclenché après validation par l'industriel.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
            <a className="el-btn el-btn-ghost" href="/producteur/collectes" onClick={(e) => { e.preventDefault(); navigate('/producteur/collectes'); }}>← Toutes les collectes</a>
            {transaction.status !== 'PAYEE' && (
              <button className="el-btn el-btn-solid" style={{ flex: 1 }} disabled>
                🔔 Suivre cette collecte
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}