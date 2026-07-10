import { useEffect, useState } from 'react';
import { Plus, Package, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function ProducerDashboard() {
  const [myLots, setMyLots] = useState<WasteLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const lots = await wasteService.getHistory();
        setMyLots(lots);
      } catch (err: any) {
        setError("Impossible de charger l'historique des lots.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLots();
  }, []);

  if (isLoading) return <div className="page-container text-center mt-8">Chargement...</div>;

  if (error) {
    return (
      <div className="page-container">
        <ErrorState title="Erreur réseau" message={error} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Mes Déchets</h1>
          <p className="page-subtitle">Suivez vos déclarations et vos gains</p>
        </div>
        <Link to="/producer/new-lot" className="btn btn-primary">
          <Plus size={20} /> Nouveau Lot
        </Link>
      </div>

      <div className="dashboard-stats grid-cols-4 mt-6">
        <div className="stat-card">
          <div className="stat-icon bg-primary-light text-primary"><Package size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Lots Déclarés</span>
            <span className="stat-value">{myLots.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-primary-light text-primary"><Award size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Points Cumulés</span>
            <span className="stat-value">1 450</span>
          </div>
        </div>
      </div>

      <section className="dashboard-section mt-8">
        <h2 className="section-title">Historique des lots</h2>
        
        {myLots.length === 0 ? (
          <EmptyState 
            title="Aucun lot déclaré" 
            message="Vous n'avez pas encore déclaré de déchets. Cliquez sur Nouveau Lot pour commencer."
            action={<Link to="/producer/new-lot" className="btn btn-primary mt-4">Déclarer un lot</Link>}
          />
        ) : (
          <div className="table-responsive card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Poids</th>
                  <th>Valeur estimée</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {myLots.map(lot => (
                  <tr key={lot.id}>
                    <td>{lot.category}</td>
                    <td>{lot.weight_kg} kg</td>
                    <td>{lot.price_per_kg * lot.weight_kg} FCFA</td>
                    <td>
                      <span className={`badge ${lot.status === 'PENDING' ? 'badge-warning' : lot.status === 'COLLECTED' ? 'badge-info' : 'badge-success'}`}>
                        {lot.status}
                      </span>
                    </td>
                    <td>{new Date(lot.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
