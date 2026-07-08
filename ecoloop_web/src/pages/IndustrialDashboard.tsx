import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { ShoppingBag, Search, Filter, Layers, DollarSign } from 'lucide-react';

export const IndustrialDashboard: React.FC = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [minWeight, setMinWeight] = useState('0');
  const [loading, setLoading] = useState(false);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      if (minWeight) params.min_weight_kg = parseFloat(minWeight) || 0;
      
      const res = await api.get('/industrial/marketplace', { params });
      setLots(res.data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, [category, minWeight]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-item active">
            <ShoppingBag size={20} />
            <span>Marketplace</span>
          </div>
        </aside>

        {/* Content */}
        <div className="dashboard-content">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers style={{ color: '#06b6d4' }} />
              Marketplace Industrielle
            </h2>
            <p style={{ marginTop: '8px' }}>Commandez des matières recyclées prêtes et triées à la source pour votre usine.</p>
          </div>

          {/* Filters Card */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Filter size={20} style={{ color: '#06b6d4' }} />
              <h3>Filtres de recherche</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
                <label className="form-label">Catégorie</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: '#101b33' }}
                >
                  <option value="">Toutes les catégories</option>
                  <option value="PLASTIQUE">Plastique</option>
                  <option value="CARTON">Carton</option>
                  <option value="METAL">Métal</option>
                  <option value="VERRE">Verre</option>
                  <option value="ORGANIQUE">Organique</option>
                  <option value="ELECTRONIQUE">Électronique</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
                <label className="form-label">Poids minimum (kg)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Lots Grid */}
          <div className="grid-2">
            {loading ? (
              <p>Chargement des offres...</p>
            ) : lots.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', gridColumn: 'span 2', textAlign: 'center' }}>
                <p>Aucune matière recyclable disponible correspondant à ces critères de recherche.</p>
              </div>
            ) : (
              lots.map((lot) => (
                <div key={lot.id} className="glass-panel glass-panel-interactive" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-success">{lot.category}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lot #{lot.id.substring(0, 8)}</span>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: 'white' }}>{lot.weight_kg} kg de matière</h3>
                    <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>{lot.description || 'Trié et prêt pour enlèvement.'}</p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prix total :</span>
                      <h4 style={{ color: '#10b981', fontSize: '1.2rem' }}>{(lot.price_per_kg * lot.weight_kg).toLocaleString()} FCFA</h4>
                    </div>
                    
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <ShoppingBag size={16} />
                      <span>Acheter</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
export default IndustrialDashboard;
