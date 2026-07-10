import { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';

export default function AiScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const fetchLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate reverse geocoding to Abidjan/Abobo for the demo context
          setTimeout(() => {
            setLocation({
              lat: Number(position.coords.latitude.toFixed(6)),
              lng: Number(position.coords.longitude.toFixed(6)),
              address: 'Abobo, Abidjan (Côte d\'Ivoire)'
            });
            setLoadingLoc(false);
          }, 1000);
        },
        (error) => {
          console.error(error);
          // Fallback location for demo if permission denied
          setTimeout(() => {
            setLocation({
              lat: 5.316667,
              lng: -4.033333,
              address: 'Marché Central, Abobo (Simulé)'
            });
            setLoadingLoc(false);
          }, 1000);
        }
      );
    } else {
      setLoadingLoc(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Read file for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setScanning(true);
      setResult(null);
      
      // Automatically get location
      fetchLocation();

      // Simulation of AI processing delay
      setTimeout(() => {
        setScanning(false);
        setResult({
          type: 'PET Plastique',
          confidence: 94,
          value: '300 FCFA/kg',
          recyclable: true
        });
      }, 2500);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImagePreview(null);
    setLocation(null);
  };

  return (
    <AppLayout role="producteur" activeKey="scanner" title="">
      <div className="el-shell">
        <div className="el-content">
          <div className="el-fade-in" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>
              EcoLoop AI Vision 📸
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
              Prenez une photo de vos déchets pour une estimation instantanée et une localisation automatique.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 400px)', gap: 32, alignItems: 'start' }} className="el-scanner-grid">
            
            {/* Zone de scan / Photo */}
            <div className="el-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, border: '2px dashed var(--border-focus)', background: 'rgba(59,130,246,0.02)', position: 'relative', overflow: 'hidden' }}>
              
              {scanning ? (
                <div style={{ textAlign: 'center', zIndex: 2 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'pulse 1s infinite' }}>🔍</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Analyse par réseau de neurones en cours...</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>Identification des polymères et matériaux</div>
                </div>
              ) : result && imagePreview ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <img src={imagePreview} alt="Déchet scanné" style={{ width: '100%', maxHeight: 350, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#10B981', color: 'white', padding: '6px 12px', borderRadius: 20, fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    Matière Détectée
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.8 }}>📸</div>
                  <h3 style={{ margin: '0 0 8px 0' }}>Uploadez ou prenez une photo</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                    Notre IA de computer vision identifie automatiquement la matière, la qualité et la valeur de rachat.
                  </p>
                  <button className="el-btn el-btn-primary" onClick={handleUpload}>Ouvrir la caméra / Galerie</button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" capture="environment" />
                </div>
              )}
              
            </div>

            {/* Zone de résultat & Localisation */}
            <div>
              <div className="el-card" style={{ opacity: result ? 1 : 0.4, transition: 'all 0.3s' }}>
                <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Résultat de l'analyse</h3>
                
                {result ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="el-fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Type de matière</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{result.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Confiance IA</span>
                      <span style={{ fontWeight: 700, color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                        {result.confidence}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Valeur estimée</span>
                      <span style={{ fontWeight: 700, color: '#10B981' }}>{result.value}</span>
                    </div>
                    
                    {/* Block Localisation */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600 }}>📍 Localisation du lot</h4>
                      
                      {location ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', background: 'rgba(16,185,129,0.05)', padding: 12, borderRadius: 6, border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div style={{ fontWeight: 600, color: '#047857' }}>{location.address}</div>
                          <div style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            GPS: {location.lat}, {location.lng}
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="el-btn el-btn-secondary" 
                          style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', justifyContent: 'center' }}
                          onClick={fetchLocation}
                          disabled={loadingLoc}
                        >
                          {loadingLoc ? 'Récupération GPS...' : '📍 Ajouter ma localisation'}
                        </button>
                      )}
                    </div>

                    <button 
                      className="el-btn el-btn-primary" 
                      style={{ width: '100%', marginTop: 8, padding: 12, justifyContent: 'center' }}
                      onClick={() => alert("Collecte créée avec succès à Abobo pour ce lot de PET Plastique !")}
                    >
                      Créer une collecte pour ce lot
                    </button>
                    
                    <button 
                      className="el-btn" 
                      style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.85rem' }} 
                      onClick={handleReset}
                    >
                      Réinitialiser / Nouveau scan
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    En attente d'une image...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
