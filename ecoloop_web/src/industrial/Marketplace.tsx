import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import api from '../services/api';

const MATERIALS = [
  { id: 'm1', name: 'PET Plastique', weight: 500, quality: 'A+', origin: 'Daloa Centre', value: 150000, co2: 300, image: 'https://images.unsplash.com/photo-1595278455490-6718d781cebf?auto=format&fit=crop&q=80&w=400', category: 'PLASTIQUE' },
  { id: 'm2', name: 'Carton Ondulé', weight: 1200, quality: 'A', origin: 'Abidjan Sud', value: 180000, co2: 450, image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400', category: 'CARTON' },
  { id: 'm3', name: 'Aluminium Brossé', weight: 350, quality: 'Premium', origin: 'Bouaké Zone Ind.', value: 420000, co2: 1200, image: 'https://images.unsplash.com/photo-1558451152-78d1f760fc85?auto=format&fit=crop&q=80&w=400', category: 'METAL' },
  { id: 'm4', name: 'Verre Mixte', weight: 800, quality: 'B', origin: 'Yamoussoukro', value: 40000, co2: 180, image: 'https://images.unsplash.com/photo-1605370213054-9ce542b6a536?auto=format&fit=crop&q=80&w=400', category: 'VERRE' },
];

export default function Marketplace() {
  const { user } = useAuth();
  const [reserving, setReserving] = useState<string | null>(null);

  const handleReserve = (id: string) => {
    setReserving(id);
    setTimeout(() => {
      setReserving(null);
      alert('Réservation confirmée ! Le contrat B2B est en cours de génération.');
    }, 1500);
  };

  return (
    <AppLayout role="industrial" activeKey="marketplace" title="">
      <div className="el-shell">
        <div className="el-content">
          <div className="el-fade-in" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>
              EcoLoop Materials Marketplace 🏭
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
              Approvisionnement B2B en matières premières secondaires vérifiées par l'IA.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {MATERIALS.map(mat => (
              <div key={mat.id} className="el-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 160, backgroundImage: `url(${mat.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
                    Qualité {mat.quality}
                  </div>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    {mat.category}
                  </div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', display: 'flex', justifyContent: 'space-between' }}>
                    {mat.name}
                    <span>{mat.weight} kg</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <span>📍</span> Origine: {mat.origin}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <span>💰</span> Valeur estimée: <strong style={{ color: 'var(--text-primary)' }}>{mat.value.toLocaleString('fr-FR')} FCFA</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', fontSize: '0.95rem', background: 'rgba(16,185,129,0.1)', padding: '6px 10px', borderRadius: 6, marginTop: 4 }}>
                      <span>🌍</span> Impact: {mat.co2} kg CO₂ évités
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      className="el-btn el-btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                      onClick={() => handleReserve(mat.id)}
                      disabled={reserving === mat.id}
                    >
                      {reserving === mat.id ? 'Réservation...' : 'Réserver ce lot'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
