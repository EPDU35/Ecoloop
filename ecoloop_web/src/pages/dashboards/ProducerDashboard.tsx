import { useEffect, useState } from 'react';
import { Plus, Package, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function ProducerDashboard() {
  const [activeTab, setActiveTab] = useState<'accueil' | 'historique' | 'impact'>('accueil');
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
      <div className="page-container theme-producer">
        <ErrorState title="Erreur réseau" message={error} />
      </div>
    );
  }

  return (
    <div className="page-container theme-producer">
      <div className="page-header-actions mb-8">
        <div>
          <h1 className="page-title text-3xl font-bold flex items-center gap-3">
            <Leaf className="text-primary" size={32} />
            Espace Producteur
          </h1>
          <p className="page-subtitle text-secondary text-lg mt-2">Valorisez vos déchets et suivez votre impact</p>
        </div>
        <Link to="/producer/new-lot" className="btn btn-primary btn-lg shadow-sm">
          <Plus size={20} /> Déclarer un lot
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'accueil' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('accueil')}
        >
          Accueil
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('historique')}
        >
          Mes Déchets
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'impact' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('impact')}
        >
          Impact Environnemental
        </button>
      </div>

      {/* TAB: Accueil */}
      {activeTab === 'accueil' && (
        <div className="fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 border-l-4 border-primary rounded-xl shadow-sm">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Package size={20} /> Lots Déclarés
              </h3>
              <div className="text-4xl font-bold text-primary">{myLots.length}</div>
              <p className="text-sm text-secondary mt-1">Depuis votre inscription</p>
            </div>

            <div className="card p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-2">EcoScore</h3>
              <EmptyState
                title="Pas encore de score"
                message="Votre EcoScore apparaîtra après votre première collecte."
              />
            </div>

            <div className="card p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-2">Récompenses</h3>
              <EmptyState
                title="Aucune récompense"
                message="Les récompenses seront disponibles après vos premières collectes."
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Historique */}
      {activeTab === 'historique' && (
        <div className="fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Historique des déclarations</h2>
          </div>

          {myLots.length === 0 ? (
            <EmptyState
              title="Aucun lot déclaré"
              message="Vous n'avez pas encore déclaré de déchets. Cliquez sur Déclarer un lot pour commencer."
              action={<Link to="/producer/new-lot" className="btn btn-primary mt-4">Déclarer un lot</Link>}
            />
          ) : (
            <div className="table-responsive card rounded-xl shadow-sm">
              <table className="data-table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-bold text-gray-600">Matière</th>
                    <th className="p-4 font-bold text-gray-600">Poids estimé</th>
                    <th className="p-4 font-bold text-gray-600">Statut</th>
                    <th className="p-4 font-bold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myLots.map(lot => (
                    <tr key={lot.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium">{lot.category}</td>
                      <td className="p-4">{lot.weight_kg} kg</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lot.status === 'PENDING' ? 'bg-warning-light text-warning' :
                          lot.status === 'COLLECTED' ? 'bg-info-light text-info' :
                          'bg-primary-light text-primary'
                        }`}>
                          {lot.status === 'PENDING' ? 'En attente' : lot.status}
                        </span>
                      </td>
                      <td className="p-4 text-secondary">{new Date(lot.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Impact */}
      {activeTab === 'impact' && (
        <div className="fade-in-up">
          <h2 className="section-title mb-6">Mon Bilan Environnemental</h2>

          <EmptyState
            title="Données d'impact non disponibles"
            message="Les données d'impact seront disponibles après vos premières collectes."
          />
        </div>
      )}
    </div>
  );
}
