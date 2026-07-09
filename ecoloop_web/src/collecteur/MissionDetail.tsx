import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useAuth } from '../auth/AuthContext';
import { getAvailableWastes, reserveWasteLot } from '../services/collecteur.service';
import type { WasteLotOut } from '../models/Waste';

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706', TEXTILE: '#7C3AED',
};

const MATERIAL_ICONS: Record<string, string> = {
  PET: '🥤', HDPE: '🧴', CARTON: '📦', VERRE: '🍾',
  PLASTIQUE: '🔴', METAL: '🔩', PAPIER: '📄',
  ORGANIQUE: '🌱', BOIS: '🪵', TEXTILE: '👕',
};

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="cd-info-row">
      <span className="cd-info-label">{icon}{label}</span>
      <span className="cd-info-value">{value}</span>
    </div>
  );
}

function ActionButton({ label, onClick, variant = 'primary', disabled, loading }: { 
  label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; loading?: boolean }) {
  return (
    <button 
      type="button" 
      className={`cd-btn ${variant} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? '⏳' : ''} {label}
    </button>
  );
}

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lot, setLot] = useState<WasteLotOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

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
    getAvailableWastes()
      .then(list => {
        const found = list.find(l => l.id === id || l.id.slice(0, 8) === id);
        if (found) setLot(found);
        else setError('Mission introuvable');
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserve = async () => {
    if (!lot) return;
    setReserving(true);
    try {
      await reserveWasteLot(lot.id);
      setReserved(true);
      setTimeout(() => navigate('/collecteur/tournees'), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="marketplace" onSelect={handleSelect} user={{ name: "Collecteur", role: "Collecteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Détails mission" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="el-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="marketplace" onSelect={handleSelect} user={{ name: "Collecteur", role: "Collecteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Détails mission" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <div className="el-card" style={{ maxWidth: 400 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Mission introuvable</h2>
              <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>{error || 'Cette mission n\'existe plus ou a déjà été réservée.'}</p>
              <a className="el-btn el-btn-amber" href="/collecteur/marketplace" onClick={(e) => { e.preventDefault(); navigate('/collecteur/marketplace'); }}>← Retour au marketplace</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const color = MATERIAL_COLORS[lot.category] || '#6b8f79';
  const icon = MATERIAL_ICONS[lot.category] || '♻️';
  const estValue = (lot.weight_kg * lot.price_per_kg).toLocaleString('fr-FR');

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="marketplace" onSelect={handleSelect} user={{ name: user?.name || "Collecteur", role: "Collecteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title={`Mission #${lot.id.slice(0, 8)}`} searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content" style={{ maxWidth: 800, margin: '0 auto' }}>

          <div className="cd-header" style={{ background: `${color}12`, borderColor: `${color}44` }}>
            <div className="cd-header-main">
              <span className="cd-badge" style={{ background: `${color}18`, color: color }}>
                {lot.status === 'disponible' ? '🟢 Disponible' : lot.status === 'reserve' ? '🟡 Réservé' : '🔴 Collecté'}
              </span>
              <h2 style={{ fontFamily: 'Fraunces, serif', marginTop: '0.5rem' }}>
                {icon} {lot.category} — {lot.weight_kg} kg
              </h2>
              <p className="cd-desc">{lot.description || 'Aucune description fournie par le producteur'}</p>
            </div>
            <div className="cd-header-price">
              <div className="cd-price-label">Gain estimé</div>
              <div className="cd-price-value">{estValue} FCFA</div>
              <div className="cd-price-sub">{lot.price_per_kg.toLocaleString('fr-FR')} FCFA/kg × {lot.weight_kg} kg</div>
            </div>
          </div>

          {reserved && (
            <div className="cd-success-banner">
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <strong>Mission réservée !</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--el-ink-soft)' }}>Vous serez redirigé vers vos tournées dans quelques secondes...</p>
              </div>
            </div>
          )}

          <div className="cd-grid">
            <div className="el-card cd-card">
              <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>📍 Localisation</h3>
              <InfoRow label="Coordonnées" value={`${lot.latitude?.toFixed(6) || '—'}, ${lot.longitude?.toFixed(6) || '—'}`} icon="📌 " />
              <InfoRow label="Adresse approximative" value={lot.address || 'Non renseignée'} icon="🏠 " />
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <ActionButton label="Ouvrir dans Maps" variant="secondary" onClick={() => window.open(`https://maps.google.com/?q=${lot.latitude},${lot.longitude}`, '_blank')} />
                <ActionButton label="Itinéraire" variant="secondary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`, '_blank')} />
              </div>
            </div>

            <div className="el-card cd-card">
              <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>👤 Producteur</h3>
              <InfoRow label="Nom" value={lot.producer_name || 'Anonyme'} icon="👤 " />
              <InfoRow label="Téléphone" value={lot.producer_phone || 'Non communiqué'} icon="📞 " />
              <InfoRow label="Note moyenne" value={lot.producer_rating ? `${lot.producer_rating}/5 ⭐` : '—'} icon="⭐ " />
            </div>

            <div className="el-card cd-card">
              <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>💰 Détails financiers</h3>
              <InfoRow label="Prix au kg" value={`${lot.price_per_kg.toLocaleString('fr-FR')} FCFA`} icon="🏷️ " />
              <InfoRow label="Poids déclaré" value={`${lot.weight_kg} kg`} icon="⚖️ " />
              <InfoRow label="Valeur brute" value={`${estValue} FCFA`} icon="💵 " />
              <InfoRow label="Votre part (estimée)" value={`${Math.round(estValue.replace(/\s/g, '') * 0.27).toLocaleString('fr-FR')} FCFA`} icon="💰 " />
              <InfoRow label="Commission EcoLoop" value={`${Math.round(estValue.replace(/\s/g, '') * 0.1).toLocaleString('fr-FR')} FCFA`} icon="📊 " />
            </div>

            <div className="el-card cd-card">
              <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>📋 Infos collecte</h3>
              <InfoRow label="Type de déchet" value={`${icon} ${lot.category}`} />
              <InfoRow label="Qualité attendue" value={lot.quality || 'Standard'} icon="🏷️ " />
              <InfoRow label="Créneaux dispo." value={lot.availability || 'À convenir'} icon="🕐 " />
              <InfoRow label="Publié le" value={lot.created_at ? new Date(lot.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—'} icon="📅 " />
            </div>
          </div>

          {!reserved && (
            <div className="cd-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <ActionButton label="← Retour au marketplace" variant="secondary" onClick={() => navigate('/collecteur/marketplace')} />
              <ActionButton label={reserving ? 'Réservation...' : 'Réserver cette mission'} onClick={handleReserve} loading={reserving} disabled={reserved} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}