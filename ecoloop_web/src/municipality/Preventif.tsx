import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { NAV_PATHS } from './nav';
import api from '../services/api';

interface AlertZone {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  saturation_pct: number;
  risk_level: 'critique' | 'eleve' | 'modere' | 'faible';
  estimated_days_to_full: number;
  last_collection: string | null;
  next_planned_collection: string | null;
  collector_count: number;
  population_served: number;
}

const RISK_CONFIG: Record<AlertZone['risk_level'], { label: string; color: string; bg: string; icon: string }> = {
  critique: { label: 'Critique', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: '🔴' },
  eleve: { label: 'Élevé', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: '🟠' },
  modere: { label: 'Modéré', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: '🟡' },
  faible: { label: 'Faible', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: '🟢' },
};

function RiskBadge({ level }: { level: AlertZone['risk_level'] }) {
  const c = RISK_CONFIG[level];
  return (
    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {c.icon} {c.label}
    </span>
  );
}

function SaturationBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : pct >= 50 ? '#3B82F6' : '#10B981';
  return (
    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: 'var(--el-paper)' }}>{pct}%</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="mp-card" style={{ animation: 'pdPulse 1.4s ease-in-out infinite' }}>
      <div style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 8, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ width: 80, height: 24, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }} />
        <div style={{ width: 60, height: 24, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
      </div>
      <div style={{ height: 6, width: '80%', marginTop: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
    </div>
  );
}

function ActionButton({ label, onClick, variant = 'primary', disabled, loading }: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; loading?: boolean }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    primary: { bg: 'var(--el-amber)', color: 'var(--el-ink)', border: 'var(--el-amber)' },
    secondary: { bg: 'transparent', color: 'var(--el-ink)', border: 'var(--el-line-dark)' },
    danger: { bg: '#EF4444', color: '#fff', border: '#EF4444' },
  };
  const c = colors[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: c.bg, color: c.color, border: `1.5px solid ${c.border}`,
        borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem', fontSize: '0.8rem',
        fontWeight: 600, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.15s ease',
      }}
    >
      {loading ? '⏳' : ''} {label}
    </button>
  );
}

export default function MairiePreventif() {
  const { user } = useAuth();
  const [zones, setZones] = useState<AlertZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<AlertZone | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    api.get('/municipality/zones')
      .then(r => { setZones(r.data || []); })
      .catch(e => { setError(e.message); console.error(e); })
      .finally(() => setLoading(false));
  }, []);

  const handleSchedule = async (zoneId: string) => {
    setActionLoading(zoneId);
    try {
      await api.post(`/municipality/zones/${zoneId}/schedule-collection`);
      alert('Collecte programmée avec succès ! L\'équipe a été notifiée.');
      // Refresh
      const r = await api.get('/municipality/zones');
      setZones(r.data || []);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la programmation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendTeam = async (zoneId: string) => {
    setActionLoading(zoneId);
    try {
      await api.post(`/municipality/zones/${zoneId}/dispatch-team`);
      alert('Équipe d\'intervention mobilisée ! Temps d\'arrivée estimé : 30-45 min.');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de l\'envoi');
    } finally {
      setActionLoading(null);
    }
  };

  const criticalZones = zones.filter(z => z.risk_level === 'critique').length;
  const highRiskZones = zones.filter(z => z.risk_level === 'eleve').length;
  const avgSaturation = zones.length ? zones.reduce((a, b) => a + b.saturation_pct, 0) / zones.length : 0;
  const totalPopulation = zones.reduce((a, b) => a + b.population_served, 0);

  return (
    <AppLayout role="mairie" activeKey="preventif" title="Système préventif">
      <div className="mp-root">

        {/* KPIs */}
        <div className="mp-kpi-grid">
          <div className="mp-kpi">
            <div className="mp-kpi-icon">🔴</div>
            <div className="mp-kpi-label">Zones critiques</div>
            <div className="mp-kpi-value">{criticalZones}</div>
            <div className="mp-kpi-sub">nécessitent action immédiate</div>
          </div>
          <div className="mp-kpi">
            <div className="mp-kpi-icon">🟠</div>
            <div className="mp-kpi-label">Zones à risque élevé</div>
            <div className="mp-kpi-value">{highRiskZones}</div>
            <div className="mp-kpi-sub">surveillance renforcée</div>
          </div>
          <div className="mp-kpi">
            <div className="mp-kpi-icon">📊</div>
            <div className="mp-kpi-label">Saturation moyenne</div>
            <div className="mp-kpi-value">{avgSaturation.toFixed(0)}%</div>
            <div className="mp-kpi-sub">sur l'ensemble du territoire</div>
          </div>
          <div className="mp-kpi">
            <div className="mp-kpi-icon">👥</div>
            <div className="mp-kpi-label">Population couverte</div>
            <div className="mp-kpi-value">{totalPopulation.toLocaleString('fr-FR')}</div>
            <div className="mp-kpi-sub">habitants</div>
          </div>
        </div>

        {/* Alert banner */}
        {criticalZones > 0 && (
          <div className="mp-alert-banner">
            <div className="mp-alert-icon">⚠️</div>
            <div className="mp-alert-text">
              <strong>{criticalZones} zone{criticalZones > 1 ? 's' : ''} en saturation critique !</strong>
              <span>Programmez des collectes d'urgence pour éviter les débordements.</span>
            </div>
            <div className="mp-alert-actions">
              <ActionButton label="Voir les zones critiques" onClick={() => setSelectedZone(zones.find(z => z.risk_level === 'critique') || null)} variant="primary" />
            </div>
          </div>
        )}

        {/* Zones grid */}
        <div className="mp-section">
          <div className="mp-section-head">
            <h2 style={{ fontFamily: 'Fraunces, serif', margin: 0 }}>Carte des risques de saturation</h2>
            <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem', margin: 0 }}>Mise à jour temps réel · Prévision J+4 basée sur l'historique et l'IA</p>
          </div>

          {loading ? (
            [1,2,3,4].map(i => <SkeletonCard key={i} />)
          ) : error ? (
            <div className="el-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
              <p style={{ color: 'var(--el-ink-soft)' }}>Erreur : {error}</p>
            </div>
          ) : zones.length === 0 ? (
            <div className="el-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
              <p style={{ color: 'var(--el-ink-soft)' }}>Aucune zone configurée pour votre collectivité.</p>
            </div>
          ) : (
            <div className="mp-zones-grid">
              {zones.map(zone => (
                <article key={zone.id} className="mp-card" onClick={() => setSelectedZone(zone)} style={{ cursor: 'pointer' }}>
                  <div className="mp-card-header">
                    <div>
                      <h3 style={{ fontFamily: 'Fraunces, serif', margin: 0, fontSize: '1rem' }}>{zone.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>{zone.district}</p>
                    </div>
                    <RiskBadge level={zone.risk_level} />
                  </div>

                  <div className="mp-saturation">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>Saturation actuelle</span>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 700 }}>{zone.saturation_pct}%</span>
                    </div>
                    <SaturationBar pct={zone.saturation_pct} />
                  </div>

                  <div className="mp-meta">
                    <div className="mp-meta-item">
                      <span className="mp-meta-icon">📅</span>
                      <span>Prévision remplissage : <strong>J+{zone.estimated_days_to_full}</strong></span>
                    </div>
                    <div className="mp-meta-item">
                      <span className="mp-meta-icon">🚛</span>
                      <span>Collecteurs actifs : <strong>{zone.collector_count}</strong></span>
                    </div>
                    <div className="mp-meta-item">
                      <span className="mp-meta-icon">👥</span>
                      <span>Population : <strong>{zone.population_served.toLocaleString('fr-FR')}</strong></span>
                    </div>
                    <div className="mp-meta-item">
                      <span className="mp-meta-icon">📦</span>
                      <span>Dernière collecte : <strong>{zone.last_collection ? new Date(zone.last_collection).toLocaleDateString('fr-FR') : '—'}</strong></span>
                    </div>
                  </div>

                  {zone.risk_level !== 'faible' && (
                    <div className="mp-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <ActionButton
                        label="📅 Programmer collecte"
                        onClick={() => handleSchedule(zone.id)}
                        variant="primary"
                        disabled={actionLoading === zone.id}
                        loading={actionLoading === zone.id}
                        style={{ flex: 1 }}
                      />
                      {zone.risk_level === 'critique' && (
                        <ActionButton
                          label="🚨 Envoyer équipe"
                          onClick={() => handleSendTeam(zone.id)}
                          variant="danger"
                          disabled={actionLoading === zone.id}
                          loading={actionLoading === zone.id}
                          style={{ flex: 1 }}
                        />
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

        </div>

        {/* Side panel for selected zone */}
        {selectedZone && (
          <div className="mp-side-panel" onClick={e => e.stopPropagation()}>
            <div className="mp-panel-header">
              <h3 style={{ fontFamily: 'Fraunces, serif', margin: 0 }}>Détails zone</h3>
              <button onClick={() => setSelectedZone(null)} style={{ background: 'none', border: 'none', color: 'var(--el-ink-soft)', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="mp-panel-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontFamily: 'Fraunces, serif' }}>{selectedZone.name}</h4>
                <RiskBadge level={selectedZone.risk_level} />
              </div>

              <div className="mp-detail-grid">
                <div className="mp-detail-item">
                  <label>Saturation</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SaturationBar pct={selectedZone.saturation_pct} style={{ flex: 1 }} />
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{selectedZone.saturation_pct}%</span>
                  </div>
                </div>
                <div className="mp-detail-item">
                  <label>Remplissage complet prévu</label>
                  <value>Dans {selectedZone.estimated_days_to_full} jour{selectedZone.estimated_days_to_full > 1 ? 's' : ''}</value>
                </div>
                <div className="mp-detail-item">
                  <label>Dernière collecte</label>
                  <value>{selectedZone.last_collection ? new Date(selectedZone.last_collection).toLocaleDateString('fr-FR') : 'Jamais'}</value>
                </div>
                <div className="mp-detail-item">
                  <label>Prochaine prévue</label>
                  <value>{selectedZone.next_planned_collection ? new Date(selectedZone.next_planned_collection).toLocaleDateString('fr-FR') : 'Non programmée'}</value>
                </div>
                <div className="mp-detail-item">
                  <label>Collecteurs assignés</label>
                  <value>{selectedZone.collector_count}</value>
                </div>
                <div className="mp-detail-item">
                  <label>Population desservie</label>
                  <value>{selectedZone.population_served.toLocaleString('fr-FR')} hab.</value>
                </div>
                <div className="mp-detail-item">
                  <label>Coordonnées</label>
                  <value style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem' }}>
                    {selectedZone.latitude.toFixed(5)}, {selectedZone.longitude.toFixed(5)}
                  </value>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <ActionButton label="📅 Programmer collecte" onClick={() => handleSchedule(selectedZone.id)} variant="primary" style={{ flex: 1 }} />
                {selectedZone.risk_level === 'critique' && (
                  <ActionButton label="🚨 Envoyer équipe" onClick={() => handleSendTeam(selectedZone.id)} variant="danger" style={{ flex: 1 }} />
                )}
                <ActionButton label="🗺️ Voir sur carte" onClick={() => window.open(`https://maps.google.com/?q=${selectedZone.latitude},${selectedZone.longitude}`, '_blank')} variant="secondary" style={{ flex: 1 }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}