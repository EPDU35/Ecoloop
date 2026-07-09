import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { createWasteLot } from '../services/producteur.service';
import { useAuth } from '../auth/AuthContext';

const WASTE_CATEGORIES = [
  { value: 'PET', label: 'PET (Bouteilles plastiques transparentes)', icon: '🥤' },
  { value: 'HDPE', label: 'HDPE (Flacons opaques, bidons)', icon: '🧴' },
  { value: 'CARTON', label: 'Carton / Papier', icon: '📦' },
  { value: 'VERRE', label: 'Verre (Bouteilles, bocaux)', icon: '🍾' },
  { value: 'METAL', label: 'Métal (Canettes, ferraille)', icon: '♻️' },
  { value: 'PLASTIQUE', label: 'Autres plastiques (PP, PS, etc.)', icon: '🔴' },
  { value: 'ORGANIQUE', label: 'Déchets organiques', icon: '🌱' },
  { value: 'BOIS', label: 'Bois / Palettes', icon: '🪵' },
  { value: 'TEXTILE', label: 'Textiles / Vêtements', icon: '👕' },
];

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706', TEXTILE: '#7C3AED',
};

function CategoryCard({ category, selected, onClick }: { category: typeof WASTE_CATEGORIES[0]; selected: boolean; onClick: () => void }) {
  const color = CATEGORY_COLORS[category.value] || '#6B7280';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pd-category-card ${selected ? 'selected' : ''}`}
      style={{ borderColor: selected ? color : 'var(--el-line-dark)' }}
    >
      <span className="pd-cat-icon">{category.icon}</span>
      <span className="pd-cat-label">{category.label}</span>
      <input type="radio" name="category" value={category.value} checked={selected} onChange={() => {}} style={{ display: 'none' }} />
    </button>
  );
}

function PhotoDropzone({ photos, onAdd, onRemove }: { photos: File[]; onAdd: (files: File[]) => void; onRemove: (index: number) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length) onAdd(Array.from(e.dataTransfer.files));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onAdd(Array.from(e.target.files));
  };

  return (
    <div className={`pd-dropzone ${dragActive ? 'drag-active' : ''}`} onDrop={handleDrop} onDragOver={handleDrag} onDragLeave={handleDragLeave} onClick={handleClick}>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
      {photos.length === 0 ? (
        <>
          <svg className="pd-dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="pd-dz-text">Glissez-déposez vos photos ici</p>
          <p className="pd-dz-sub">ou cliquez pour sélectionner (max 5 photos, 5 Mo chacune)</p>
        </>
      ) : (
        <div className="pd-dz-preview">
          {photos.map((file, i) => (
            <div key={i} className="pd-dz-thumb">
              <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`} onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} />
              <button type="button" className="pd-dz-remove" onClick={(e) => { e.stopPropagation(); onRemove(i); }} aria-label="Supprimer">
                ×
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button type="button" className="pd-dz-add" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              <span>+</span> Ajouter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function NouvelleCollecte() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const addPhotos = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) setError('Certains fichiers sont invalides (max 5 Mo, images uniquement)');
    setPhotos(prev => [...prev, ...valid].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
      () => setError('Impossible d\'obtenir la position'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!category) return setError('Choisissez un type de déchet');
      if (photos.length === 0) return setError('Ajoutez au moins une photo');
      setStep(2);
    } else if (step === 2) {
      if (!description.trim()) return setError('Décrivez le lot');
      if (!weightKg || Number(weightKg) <= 0) return setError('Poids invalide');
      if (!pricePerKg || Number(pricePerKg) <= 0) return setError('Prix invalide');
      setStep(3);
    } else if (step === 3) {
      if (!address.trim()) return setError('Adresse requise');
      if (latitude === null || longitude === null) return setError('Localisez le lot sur la carte');
      if (!availability.trim()) return setError('Indiquez vos créneaux');
      submit();
    }
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createWasteLot({
        category,
        description: description.trim(),
        weight_kg: Number(weightKg),
        price_per_kg: Number(pricePerKg),
        latitude: latitude!,
        longitude: longitude!,
      });
      setSuccess(true);
      setTimeout(() => navigate('/producteur/lots'), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="el-shell">
        <Sidebar items={NAV_ITEMS} activeKey="lots" onSelect={handleSelect} user={{ name: user?.full_name || "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="el-main">
          <Navbar title="Nouvelle collecte" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="el-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <div className="el-card" style={{ maxWidth: 400 }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Lot publié !</h2>
              <p style={{ color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>Votre lot est en attente de collecteur. Vous serez notifié dès qu\'une mission est acceptée.</p>
              <a className="el-btn el-btn-amber" href="/producteur/lots" onClick={(e) => { e.preventDefault(); navigate('/producteur/lots'); }}>Voir mes lots</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="lots" onSelect={handleSelect} user={{ name: user?.full_name || "Producteur", role: "Producteur" }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Nouvelle collecte" searchOpen={searchOpen} onToggleSearch={() => setSearchOpen(v => !v)} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="pd-stepper">
            <div className={`pd-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
              <span className="pd-step-num">1</span>
              <span className="pd-step-label">Type & Photos</span>
            </div>
            <div className="pd-step-line" style={{ width: step > 1 ? '100%' : '0%' }} />
            <div className={`pd-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
              <span className="pd-step-num">2</span>
              <span className="pd-step-label">Détails</span>
            </div>
            <div className="pd-step-line" style={{ width: step > 2 ? '100%' : '0%' }} />
            <div className={`pd-step ${step >= 3 ? 'active' : ''}`}>
              <span className="pd-step-num">3</span>
              <span className="pd-step-label">Localisation</span>
            </div>
          </div>

          <div className="el-card" style={{ marginTop: '1.5rem' }}>
            {error && <div className="el-alert error">{error}</div>}

            {step === 1 && (
              <>
                <h3 style={{ marginBottom: '0.5rem' }}>Quel type de déchet ?</h3>
                <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Sélectionnez la catégorie — l'IA affinera la détection à la collecte.
                </p>
                <div className="pd-category-grid">
                  {WASTE_CATEGORIES.map(cat => (
                    <CategoryCard key={cat.value} category={cat} selected={category === cat.value} onClick={() => setCategory(cat.value)} />
                  ))}
                </div>
                {category && (
                  <div className="pd-selected-badge" style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--el-paper-2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{WASTE_CATEGORIES.find(c => c.value === category)?.icon}</span>
                    <span style={{ fontWeight: 600 }}>Catégorie : {WASTE_CATEGORIES.find(c => c.value === category)?.label}</span>
                  </div>
                )}
                <hr style={{ margin: '1.5rem 0', borderColor: 'var(--el-line-dark)' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Photos du lot</h3>
                <PhotoDropzone photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {photos.length > 0 && <p className="pd-photo-count">{photos.length}/5 photos</p>}
              </>
            )}

            {step === 2 && (
              <>
                <h3 style={{ marginBottom: '0.5rem' }}>Détails du lot</h3>
                <div className="pd-form-grid">
                  <div className="pd-field">
                    <label htmlFor="description">Description <span className="required">*</span></label>
                    <textarea id="description" rows={3} placeholder="État, particularités, tri effectué..." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="pd-field">
                    <label htmlFor="weight">Poids estimé (kg) <span className="required">*</span></label>
                    <input id="weight" type="number" min="0.1" step="0.1" placeholder="Ex: 25.5" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
                  </div>
                  <div className="pd-field">
                    <label htmlFor="price">Prix souhaité (FCFA/kg) <span className="required">*</span></label>
                    <input id="price" type="number" min="1" step="1" placeholder="Ex: 150" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} />
                  </div>
                </div>
                {weightKg && pricePerKg && (
                  <div className="pd-estimate">
                    <span>Valeur estimée :</span>
                    <strong>{(Number(weightKg) * Number(pricePerKg)).toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h3 style={{ marginBottom: '0.5rem' }}>Où et quand ?</h3>
                <div className="pd-field">
                  <label htmlFor="address">Adresse de collecte <span className="required">*</span></label>
                  <input id="address" type="text" placeholder="Ex: Rue de la République, Cocody, Abidjan" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" className="el-btn el-btn-ghost" onClick={useCurrentLocation} style={{ flex: 1 }}>
                    📍 Ma position actuelle
                  </button>
                  <button type="button" className="el-btn el-btn-ghost" onClick={() => { /* ouvrir carte */ setLatitude(5.359954); setLongitude(-4.008256); setAddress('Cocody Centre, Abidjan'); }} style={{ flex: 1 }}>
                    🗺️ Choisir sur la carte
                  </button>
                </div>
                {latitude && longitude && (
                  <div className="pd-coords" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--el-paper-2)', borderRadius: 'var(--radius-sm)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem' }}>
                    Coordonnées : {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </div>
                )}
                <div className="pd-field" style={{ marginTop: '1.5rem' }}>
                  <label htmlFor="availability">Créneaux de disponibilité <span className="required">*</span></label>
                  <textarea id="availability" rows={3} placeholder="Ex: Lundi 9h-12h, Mercredi 14h-17h, Samedi matin..." value={availability} onChange={e => setAvailability(e.target.value)} />
                </div>
              </>
            )}

            <div className="pd-actions" style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {step > 1 && (
                <button type="button" className="el-btn el-btn-ghost" onClick={() => setStep(step - 1)} disabled={loading}>
                  ← Retour
                </button>
              )}
              <button type="button" className={step === 3 ? 'el-btn el-btn-amber' : 'el-btn el-btn-solid'} onClick={validateStep} disabled={loading}>
                {loading ? 'Publication...' : step === 3 ? 'Publier le lot' : 'Suivant →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}