import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Award, PlusCircle, History, Landmark, Package, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ProducerDashboard: React.FC = () => {
  const [rewards, setRewards] = useState<any>(null);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  
  const [category, setCategory] = useState('PLASTIQUE');
  const [weight, setWeight] = useState('10');
  const [pricePerKg, setPricePerKg] = useState('150');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('5.348400');
  const [lon, setLon] = useState('-3.980600');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const rewRes = await api.get('/rewards/me');
      setRewards(rewRes.data);
      
      const histRes = await api.get('/rewards/history');
      setPointsHistory(histRes.data);

      const lotsRes = await api.get('/my-wastes');
      setLots(lotsRes.data);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/wastes', {
        category,
        weight_kg: parseFloat(weight),
        price_per_kg: parseFloat(pricePerKg),
        description,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      });
      setSuccess('Votre lot de déchets a été publié avec succès !');
      setDescription('');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Une erreur est survenue lors de la publication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-item active">
            <Package size={20} />
            <span>Mon Espace</span>
          </div>
          <div className="sidebar-item">
            <Award size={20} />
            <span>Mes Récompenses</span>
          </div>
        </aside>

        {/* Content */}
        <div className="dashboard-content">
          {/* Top rewards summary card */}
          {rewards && (
            <div className="glass-panel animate-fade-in" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut fidélité</span>
                <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Niveau {rewards.level.toUpperCase()}</h2>
                <p style={{ marginTop: '8px' }}>Total recyclé : <strong>{rewards.total_kg_recycled} kg</strong></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Points disponibles</span>
                <h3 style={{ fontSize: '2.5rem', color: '#10b981', fontWeight: 800 }}>{rewards.points} pts</h3>
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Publish Form */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <PlusCircle size={22} style={{ color: '#10b981' }} />
                <h3>Publier un lot de déchets</h3>
              </div>

              {error && (
                <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', marginBottom: '20px', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handlePublish}>
                <div className="form-group">
                  <label className="form-label">Catégorie</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ background: '#101b33' }}
                  >
                    <option value="PLASTIQUE">Plastique</option>
                    <option value="CARTON">Carton</option>
                    <option value="METAL">Métal</option>
                    <option value="VERRE">Verre</option>
                    <option value="ORGANIQUE">Organique</option>
                    <option value="ELECTRONIQUE">Électronique</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Poids estimé (kg)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix souhaité (FCFA/kg)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (optionnel)</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Ex: 3 sacs de bouteilles PET transparentes"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid-2" style={{ marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  <span>Publier le lot</span>
                </button>
              </form>
            </div>

            {/* My Lots List */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={22} style={{ color: '#06b6d4' }} />
                <h3>Mes lots récents</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px' }}>
                {lots.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '40px 0' }}>Aucun lot publié pour le moment.</p>
                ) : (
                  lots.map((lot) => (
                    <div key={lot.id} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-blue">{lot.category}</span>
                          <span className="badge badge-success">{lot.status}</span>
                        </div>
                        <h4 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>{lot.weight_kg} kg estimé</h4>
                        <p style={{ fontSize: '0.85rem' }}>{lot.description || 'Pas de description'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{lot.price_per_kg * lot.weight_kg} FCFA</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Points History */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <History size={22} style={{ color: '#f59e0b' }} />
              <h3>Historique de mes récompenses</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pointsHistory.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px 0' }}>Aucune transaction de points pour le moment.</p>
              ) : (
                pointsHistory.map((h) => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{h.action.replace('_', ' ')}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: h.points > 0 ? '#10b981' : '#ef4444' }}>
                        {h.points > 0 ? `+${h.points}` : h.points} pts
                      </span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Solde: {h.balance_after} pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
export default ProducerDashboard;
