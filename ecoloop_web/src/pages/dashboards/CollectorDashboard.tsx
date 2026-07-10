import { useEffect, useState } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function CollectorDashboard() {
  const [availableLots, setAvailableLots] = useState<WasteLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const lots = await wasteService.getAvailableWastes();
        setAvailableLots(lots);
      } catch (err: any) {
        setError("Impossible de charger les lots disponibles.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLots();
  }, []);

  const handleReserve = async (lotId: string) => {
    try {
      await wasteService.reserveCollection(lotId);
      alert('Mission réservée avec succès !');
      setAvailableLots(prev => prev.filter(l => l.id !== lotId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la réservation.");
    }
  };

  if (isLoading) return <div className="page-container text-center mt-8">Chargement...</div>;

  if (error) return <div className="page-container"><ErrorState title="Erreur réseau" message={error} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Missions de Collecte</h1>
        <p className="page-subtitle">Trouvez les meilleures tournées recommandées par EcoLoop</p>
      </div>

      <div className="dashboard-stats grid-cols-4 mt-6">
        <div className="stat-card">
          <div className="stat-icon bg-primary-light text-primary"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Lots Disponibles</span>
            <span className="stat-value">{availableLots.length}</span>
          </div>
        </div>
      </div>

      <section className="dashboard-section mt-8">
        <div className="section-header-flex">
          <h2 className="section-title">Recommandations Prioritaires</h2>
        </div>
        
        {availableLots.length === 0 ? (
          <EmptyState title="Aucune mission disponible" message="Il n'y a pas de déchets à collecter pour le moment dans votre secteur." />
        ) : (
          <div className="mission-list">
            {availableLots.map(lot => (
              <div key={lot.id} className="card mission-card">
                <div className="mission-header">
                  <div className="mission-type">
                    <span className="badge badge-info">{lot.category}</span>
                    <span className="mission-weight">{lot.weight_kg} kg</span>
                  </div>
                  <div className="mission-score">
                    Localisation: <strong>Lat {lot.latitude.toFixed(2)}, Lon {lot.longitude.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="mission-details">
                  <p><MapPin size={16} /> {lot.description || "Aucune description fournie"}</p>
                </div>
                <div className="mission-actions">
                  <span className="mission-earnings">{(lot.price_per_kg * lot.weight_kg).toFixed(0)} FCFA</span>
                  <button className="btn btn-primary" onClick={() => handleReserve(lot.id)}>Accepter la mission</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
