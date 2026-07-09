import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useAuth } from '../auth/AuthContext';
import { getTransactionHistory } from '../services/producteur.service';
import QRScanner from '../components/QRScanner';

const STATUS_STEPS = [
  { key: 'en_route', label: 'En route', icon: '🚗' },
  { key: 'arrive', label: 'Arrivé sur site', icon: '📍' },
  { key: 'scan', label: 'QR scanné', icon: '📷' },
  { key: 'poids', label: 'Poids saisi', icon: '⚖️' },
  { key: 'photo', label: 'Photo preuve', icon: '📸' },
  { key: 'valide', label: 'Validé', icon: '✅' },
];

const STATUS_MAP: Record<string, { step: number; label: string; next: string }> = {
  reserve: { step: 1, label: 'En route vers le producteur', next: 'Arriver sur site' },
  collecte: { step: 3, label: 'Collecte en cours', next: 'Saisir le poids' },
  valide: { step: 5, label: 'Collecte validée', next: '' },
};

function StepIndicator({ currentStep, completedStep }: { currentStep: number; completedStep: number }) {
  return (
    <div className="ce-steps">
      {STATUS_STEPS.map((s, i) => (
        <div key={s.key} className={`ce-step ${i < completedStep ? 'done' : i === currentStep ? 'active' : ''}`}>
          <div className="ce-step-circle" style={{ background: i <= completedStep ? 'var(--el-signal)' : i === currentStep ? 'var(--el-amber)' : 'var(--el-line-dark)' }}>
            {i <= completedStep ? '✓' : s.icon}
          </div>
          <span className="ce-step-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function PhotoDropzone({ photos, onAdd, onRemove, max = 3 }: { photos: File[]; onAdd: (files: File[]) => void; onRemove: (index: number) => void; max?: number }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) onAdd(Array.from(e.dataTransfer.files)); };
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); setDrag(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); };
  const handleClick = () => inputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) onAdd(Array.from(e.target.files)); };

  return (
    <div className={`ce-dropzone ${drag ? 'drag' : ''}`} onDrop={handleDrop} onDragOver={handleDrag} onDragLeave={handleDragLeave} onClick={handleClick}>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
      {photos.length === 0 ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, marginBottom: 12, color: 'var(--el-ink-soft)' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p style={{ color: 'var(--el-ink-soft)', marginBottom: 4 }}>Glissez-déposez ou cliquez</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)', opacity: 0.6 }}>Max {max} photos · 5 Mo max</p>
        </>
      ) : (
        <div className="ce-dz-preview">
          {photos.map((f, i) => (
            <div key={i} className="ce-dz-thumb">
              <img src={URL.createObjectURL(f)} alt={`Preuve ${i + 1}`} onLoad={e => URL.revokeObjectURL(e.currentTarget.src)} />
              <button type="button" className="ce-dz-remove" onClick={e => { e.stopPropagation(); onRemove(i); }}>×</button>
            </div>
          ))}
          {photos.length < max && (
            <button type="button" className="ce-dz-add" onClick={e => { e.stopPropagation(); handleClick(); }}>+ Ajouter</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CollecteEnCours() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [actualWeight, setActualWeight] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [qrScanned, setQrScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => { document.body.style.overflow = sidebarOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [sidebarOpen]);

  const handleSelect = (key: string) => { const path = NAV_PATHS[key]; if (path) navigate(path); };

  useEffect(() => {
    if (!id) return;
    getTransactionHistory()
      .then(list => {
        const found = list.find(t => t.id === id || t.id.slice(0, 8) === id);
        if (found) {
          setCollection(found);
          const info = STATUS_MAP[found.status?.toLowerCase()] || { step: 0, label: found.status, next: '' };
          setCurrentStep(info.step);
          setCompletedSteps(Math.max(0, info.step - 1));
          if (found.actual_weight_kg) setActualWeight(String(found.actual_weight_kg));
        } else setError('Collecte introuvable');
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Géolocalisation non supportée'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      () => { setError('Impossible d\'obtenir la position'); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleStepAction = () => {
    if (currentStep === 1) { // En route -> Arrivé
      getCurrentLocation();
      setCompletedSteps(1);
      setCurrentStep(2);
    } else if (currentStep === 2) { // Arrivé -> Scanner QR
      setShowScanner(true);
    } else if (currentStep === 3) { // QR scanné -> Saisir poids
      setCurrentStep(4);
    } else if (currentStep === 4) { // Poids saisi -> Photo
      if (!actualWeight || Number(actualWeight) <= 0) { setError('Veuillez saisir un poids valide'); return; }
      setCompletedSteps(3);
      setCurrentStep(5);
    } else if (currentStep === 5) { // Photo -> Valider
      if (photos.length === 0) { setError('Ajoutez au moins une photo de preuve'); return; }
      submitCollection();
    }
  };

  const submitCollection = async () => {
    setSubmitting(true);
    try {
      // TODO: Appel API pour valider la collecte
      await new Promise(r => setTimeout(r, 1500));
      setCompletedSteps(5);
      setCurrentStep(6);
      setTimeout(() => navigate('/collecteur/tournees'), 2000);
    } catch (e) {
      setError('Erreur lors de la validation');
    } finally { setSubmitting(false); }
  };

  const addPhotos = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) setError('Certains fichiers sont invalides (max 5 Mo, images uniquement)');
    setPhotos(prev => [...prev, ...valid].slice(0, 3));
  };
  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const handleQrResult = (result: string) => {
    if (result.includes(id || '') || result.includes('ecoloop')) {
      setQrScanned(true);
      setCompletedSteps(2);
      setCurrentStep(3);
    } else {
      alert('QR code invalide pour cette collecte');
    }
    setShowScanner(false);
  };

  if (loading) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="tournees" onSelect={handleSelect} user={{ name: "Collecteur", role: "Collecteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Collecte en cours" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="el-spinner" /></div>
        </div>
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="tournees" onSelect={handleSelect} user={{ name: "Collecteur", role: "Collecteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Collecte en cours" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <div className="el-card" style={{ maxWidth: 400 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Collecte introuvable</h2>
              <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>{error}</p>
              <a className="el-btn el-btn-amber" href="/collecteur/tournees" onClick={e => { e.preventDefault(); navigate('/collecteur/tournees'); }}>← Retour aux tournées</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) return null;

  const statusInfo = STATUS_MAP[collection.status?.toLowerCase()] || { step: 0, label: collection.status, next: '' };
  const nextAction = statusInfo.next;

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="tournees" onSelect={handleSelect} user={{ name: user?.full_name || "Collecteur", role: "Collecteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title={`Collecte #${collection.id.slice(0, 8)}`} searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content" style={{ maxWidth: 720, margin: '0 auto' }}>

          <div className="ce-header-card">
            <div className="ce-header-top">
              <span className={`el-pill ${collection.status === 'valide' ? 'success' : 'in_transit'}`}>
                {collection.status === 'valide' ? '✅ Validée' : collection.status === 'collecte' ? '📦 En collecte' : '🟡 Réservée'}
              </span>
              <span className="el-mono">Réf. {collection.id.slice(0, 8)}</span>
            </div>
            <div className="ce-header-main">
              <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.25rem' }}>{collection.waste_type || 'Déchet'} — {collection.actual_weight_kg || collection.estimated_weight_kg || '?'} kg</h2>
              <p style={{ color: 'var(--el-ink-soft)' }}>{collection.collector_name || 'Producteur'}</p>
            </div>
            <div className="ce-header-gain">
              <span className="ce-gain-label">Votre gain</span>
              <span className="ce-gain-value">{collection.net_amount?.toLocaleString('fr-FR') || '—'} FCFA</span>
            </div>
          </div>

          <StepIndicator currentStep={Math.min(currentStep, 5)} completedStep={completedSteps} />

          {currentStep <= 5 && (
            <div className="ce-content" style={{ marginTop: '1.5rem' }}>
              {currentStep === 1 && (
                <div className="el-card">
                  <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>🚗 En route vers le producteur</h3>
                  <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>
                    Rendez-vous à l'adresse indiquée. Utilisez le bouton ci-dessous pour ouvrir l'itinéraire.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="el-btn el-btn-solid" onClick={getCurrentLocation} disabled={gpsLoading} style={{ flex: 1 }}>
                      {gpsLoading ? '📍 Localisation...' : gpsCoords ? `📍 Position: ${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` : '📍 Ma position actuelle'}
                    </button>
                    <a className="el-btn el-btn-ghost" href={`https://www.google.com/maps/dir/?api=1&destination=${collection.latitude},${collection.longitude}`} target="_blank" rel="noopener" style={{ flex: 1, textAlign: 'center' }}>
                      🗺️ Itinéraire GPS
                    </a>
                  </div>
                  {gpsCoords && <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--el-signal)' }}>✅ Position enregistrée</p>}
                </div>
              )}

              {currentStep === 2 && (
                <div className="el-card">
                  <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>📍 Arrivé sur site</h3>
                  <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>Confirmez votre présence chez le producteur.</p>
                  <div className="ce-checkin-card">
                    <div className="ce-checkin-info">
                      <strong>Producteur :</strong> {collection.producer_name || 'Non renseigné'}<br />
                      <strong>Adresse :</strong> {collection.address || 'Non renseignée'}<br />
                      <strong>Téléphone :</strong> {collection.producer_phone || 'Non renseigné'}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="el-card">
                  <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>📷 Scanner le QR code</h3>
                  <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>
                    Scannez le code QR affiché par le producteur pour confirmer la collecte.
                  </p>
                  {qrScanned ? (
                    <div className="ce-qr-success">
                      <span style={{ fontSize: '3rem' }}>✅</span>
                      <h4>QR code validé !</h4>
                      <p style={{ color: 'var(--el-ink-soft)' }}>Lot confirmé : {collection.waste_type} — {collection.estimated_weight_kg} kg</p>
                    </div>
                  ) : (
                    <button className="el-btn el-btn-solid" style={{ width: '100%', padding: '1.5rem', fontSize: '1.1rem' }} onClick={() => setShowScanner(true)}>
                      📷 Ouvrir le scanner
                    </button>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="el-card">
                  <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>⚖️ Saisir le poids réel</h3>
                  <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>Pesez le lot et entrez le poids exact en kg.</p>
                  <div className="ce-weight-input">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Ex: 52.5"
                      value={actualWeight}
                      onChange={e => setActualWeight(e.target.value)}
                      style={{ fontSize: '2.5rem', fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center', width: '100%', padding: '1rem', border: '2px solid var(--el-line-dark)', borderRadius: 'var(--radius-card)', background: 'transparent', color: 'var(--el-ink)' }}
                    />
                    <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--el-ink-soft)', fontSize: '1.5rem' }}>kg</span>
                  </div>
                  {collection.estimated_weight_kg && (
                    <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--el-ink-soft)', textAlign: 'center' }}>
                      Poids estimé : {collection.estimated_weight_kg} kg
                      {actualWeight && <span style={{ color: Number(actualWeight) > collection.estimated_weight_kg ? 'var(--el-amber)' : 'var(--el-signal)' }}>
                        {' '} | Écart : {(Number(actualWeight) - collection.estimated_weight_kg).toFixed(1)} kg
                      </span>}
                    </p>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div className="el-card">
                  <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>📸 Photo de preuve</h3>
                  <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>Prenez une photo du lot collecté (sacs, contenant, état général).</p>
                  <PhotoDropzone photos={photos} onAdd={addPhotos} onRemove={removePhoto} max={3} />
                  {photos.length > 0 && <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--el-ink-soft)', textAlign: 'center' }}>{photos.length}/3 photos</p>}
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="el-card" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(16,185,129,0.08)', borderColor: 'var(--el-signal)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem', color: 'var(--el-signal)' }}>Collecte validée !</h2>
              <p style={{ color: 'var(--el-ink-soft)', marginBottom: '2rem' }}>
                Le lot a été récupéré avec succès. Votre gain de <strong>{collection.net_amount?.toLocaleString('fr-FR') || '—'} FCFA</strong> sera crédité sous 24h.
              </p>
              <a className="el-btn el-btn-solid" href="/collecteur/tournees" onClick={e => { e.preventDefault(); navigate('/collecteur/tournees'); }}>Voir mes tournées</a>
            </div>
          )}

          <div className="ce-footer-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {currentStep > 1 && currentStep <= 5 && (
              <button className="el-btn el-btn-ghost" onClick={() => { setCurrentStep(currentStep - 1); setCompletedSteps(Math.max(0, completedSteps - 1)); }}>← Étape précédente</button>
            )}
            {currentStep <= 5 && (
              <button className="el-btn el-btn-amber" onClick={handleStepAction} disabled={submitting} style={{ minWidth: 200 }}>
                {submitting ? 'Validation...' : nextAction || 'Terminer'}
              </button>
            )}
            {currentStep === 6 && (
              <a className="el-btn el-btn-solid" href="/collecteur/tournees" onClick={e => { e.preventDefault(); navigate('/collecteur/tournees'); }}>← Retour aux tournées</a>
            )}
          </div>

        </div>
      </div>

      {showScanner && (
        <div className="ce-scanner-overlay" onClick={() => setShowScanner(false)}>
          <div className="ce-scanner-modal" onClick={e => e.stopPropagation()}>
            <button className="ce-scanner-close" onClick={() => setShowScanner(false)}>×</button>
            <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>Scanner le QR code</h3>
            <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>Pointez la caméra vers le code QR du producteur</p>
            <div style={{ width: '100%', maxWidth: 320, aspectRatio: '1 / 1', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: '#000' }}>
              <QRScanner onScan={handleQrResult} />
            </div>
            <button className="el-btn el-btn-ghost" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setShowScanner(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}