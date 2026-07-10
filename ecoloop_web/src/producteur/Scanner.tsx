import { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';

export default function AiScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setScanning(true);
      setResult(null);
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

  return (
    <AppLayout role="producteur" activeKey="scanner" title="">
      <div className="el-shell">
        <div className="el-content">
          <div className="el-fade-in" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>
              EcoLoop AI Vision 📸
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
              Prenez une photo de vos déchets pour une estimation instantanée.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 400px)', gap: 32, alignItems: 'start' }}>
            
            {/* Zone de scan */}
            <div className="el-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, border: '2px dashed var(--border-focus)', background: 'rgba(59,130,246,0.02)' }}>
              
              {scanning ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'pulse 1s infinite' }}>🔍</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Analyse par réseau de neurones en cours...</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>Identification des polymères et matériaux</div>
                </div>
              ) : result ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Scan Réussi</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>L'IA a identifié la matière avec succès.</p>
                  <button className="el-btn el-btn-primary" onClick={() => setResult(null)}>Scanner un autre objet</button>
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

            {/* Zone de résultat */}
            <div>
              <div className="el-card" style={{ opacity: result ? 1 : 0.4, transition: 'all 0.3s' }}>
                <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Résultat de l'analyse</h3>
                
                {result ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="el-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Type de matière</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{result.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Confiance IA</span>
                      <span style={{ fontWeight: 700, color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                        {result.confidence}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Valeur estimée</span>
                      <span style={{ fontWeight: 700, color: '#10B981' }}>{result.value}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Recyclable</span>
                      <span style={{ fontWeight: 700 }}>{result.recyclable ? 'Oui ♻️' : 'Non ❌'}</span>
                    </div>

                    <button className="el-btn el-btn-primary" style={{ width: '100%', marginTop: 16, padding: 12, justifyContent: 'center' }}>
                      Créer une collecte pour ce lot
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
