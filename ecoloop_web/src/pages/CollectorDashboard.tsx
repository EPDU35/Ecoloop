import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Truck, MapPin, ListFilter, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

export const CollectorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [availableLots, setAvailableLots] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeCollection, setActiveCollection] = useState<any>(null);
  
  const [lat, setLat] = useState('5.348400');
  const [lon, setLon] = useState('-3.980600');
  
  const [otpCode, setOtpCode] = useState('');
  const [actualWeight, setActualWeight] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfileAndData = async () => {
    try {
      const meRes = await api.get('/users/me');
      setProfile(meRes.data);
      
      const lotsRes = await api.get('/available-wastes');
      setAvailableLots(lotsRes.data);

      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data);

      // Check if there's any active collection reserved by this collector
      // The API doesn't have a direct "active collection" route, so we can find lots reserved by us
      // by scanning my-wastes or similar if needed. For a simple E2E, we can look at local state
      // or check notifications for active reservations. Or we can list lots where collector_id is mine
      // and status is RESERVE. Let's do that! We can call /available-wastes or a filter.
      // Actually, since we want to check for reservations, we can just load the last reserved collection.
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const handleUpdateGps = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/users/gps', {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        accuracy_meters: 10.0
      });
      setSuccess('Votre position GPS a été mise à jour.');
      fetchProfileAndData();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de la mise à jour GPS.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (lotId: string) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/reserve', { waste_lot_id: lotId });
      setActiveCollection(res.data);
      setSuccess('Lot réservé avec succès ! Code de validation envoyé au producteur.');
      fetchProfileAndData();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollection) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post(`/validate-collection/${activeCollection.id}`, {
        validation_code: otpCode,
        actual_weight_kg: parseFloat(actualWeight) || activeCollection.estimated_weight_kg
      });
      setSuccess('Collecte validée avec succès ! Transaction financière créée.');
      setActiveCollection(null);
      setOtpCode('');
      setActualWeight('');
      fetchProfileAndData();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Code de validation incorrect.');
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
            <Truck size={20} />
            <span>Tournées</span>
          </div>
          <div className="sidebar-item" onClick={fetchProfileAndData}>
            <RefreshCw size={20} />
            <span>Actualiser</span>
          </div>
        </aside>

        {/* Content */}
        <div className="dashboard-content">
          
          {error && (
            <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* GPS Location Update Card */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Navigation size={22} style={{ color: '#06b6d4' }} />
              <h3>Ma position GPS en temps réel</h3>
            </div>
            <form onSubmit={handleUpdateGps} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                <label className="form-label">Latitude</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                <label className="form-label">Longitude</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ height: '46px' }} disabled={loading}>
                Mettre à jour ma position
              </button>
            </form>
          </div>

          {/* Active Collection Panel (If Reserved) */}
          {activeCollection ? (
            <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--accent-warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <ShieldCheck size={22} style={{ color: '#f59e0b' }} />
                <h3>Collecte active en cours</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ marginBottom: '8px' }}>Lot ID : <strong>{activeCollection.waste_lot_id}</strong></p>
                  <p style={{ marginBottom: '8px' }}>Poids estimé : <strong>{activeCollection.estimated_weight_kg} kg</strong></p>
                  <p style={{ marginBottom: '16px' }}>Statut : <span className="badge badge-warning">{activeCollection.status}</span></p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Veuillez vous rendre sur place, peser les déchets, demander le code OTP au producteur pour valider la collecte.</p>
                </div>
                
                <form onSubmit={handleValidate} className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.2)' }}>
                  <div className="form-group">
                    <label className="form-label">Code OTP de validation (6 chiffres)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="form-input"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Poids réel pesé (kg)</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={actualWeight}
                      placeholder={activeCollection.estimated_weight_kg.toString()}
                      onChange={(e) => setActualWeight(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    Valider la collecte
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {/* Grid: Match Recommendations / Notifications & Marketplace */}
          <div className="grid-2">
            {/* Matching Recommendations via Notifications */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <MapPin size={22} style={{ color: '#10b981' }} />
                <h3>Demandes de collecte suggérées</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.filter(n => n.type === 'collection_request').length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '40px 0' }}>Aucune suggestion basée sur votre localisation actuelle.</p>
                ) : (
                  notifications.filter(n => n.type === 'collection_request').map((notif) => (
                    <div key={notif.id} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '8px' }}>{notif.title}</h4>
                      <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{notif.content}</p>
                      {notif.entity_id && !activeCollection && (
                        <button onClick={() => handleReserve(notif.entity_id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                          Réserver ce lot
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Marketplace of Available Lots */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <ListFilter size={22} style={{ color: '#06b6d4' }} />
                <h3>Tous les lots disponibles</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '400px' }}>
                {availableLots.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '40px 0' }}>Aucun déchet disponible sur la zone.</p>
                ) : (
                  availableLots.map((lot) => (
                    <div key={lot.id} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-success">{lot.category}</span>
                        <h4 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>{lot.weight_kg} kg</h4>
                        <p style={{ fontSize: '0.85rem' }}>{lot.description || 'Pas de description'}</p>
                      </div>
                      {!activeCollection && (
                        <button onClick={() => handleReserve(lot.id)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                          Réserver
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
export default CollectorDashboard;
