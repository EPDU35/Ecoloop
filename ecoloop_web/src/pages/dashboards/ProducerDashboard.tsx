import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Leaf, Recycle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { wasteService } from '@/services/api/wasteService';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/States';
import './Dashboards.css';

export function ProducerDashboard() {
  const [activeTab, setActiveTab] = useState<'tdb' | 'dechets' | 'impact' | 'historique'>('tdb');

  const [wastes, setWastes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const myWastes = await wasteService.getMyWastes();
      setWastes(myWastes ?? []);
      setStats({
        avg_ecoscore: '—',
        valorisation_rate: '—',
      });
    } catch (err: any) {
      setError("Impossible de charger vos données de producteur.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState fullPage message="Chargement de votre atelier..." />;
  }

  if (error) {
    return (
      <div className="page-container theme-producer">
        <ErrorState title="Erreur réseau" message={error} />
      </div>
    );
  }

  const recentWastes = wastes.slice(0, 5);
  const totalWeight = wastes.reduce((sum: number, w: any) => sum + (parseFloat(w.weight_kg) || 0), 0);

  return (
    <div className="page-container theme-producer">
      <div className="page-header-actions mb-8">
        <div>
          <h1 className="page-title text-3xl font-bold flex items-center gap-3">
            <Leaf className="text-primary" size={32} />
            Mon Atelier de Production
          </h1>
          <p className="page-subtitle text-secondary text-lg mt-2">
            Suivez votre production et maximisez votre impact environnemental.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-outline bg-white border-gray-300 flex items-center gap-2"
            onClick={fetchData}
            aria-label="Actualiser les données du tableau de bord"
          >
            Actualiser
          </button>
          <Link to="/producer/new-waste" className="btn btn-primary bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 shadow-sm" aria-label="Signaler un nouveau déchet">
            <Plus size={20} /> Signaler un Déchet
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'tdb' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('tdb')}
        >
          Tableau de Bord
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'dechets' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('dechets')}
        >
          Mes Déchets
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'impact' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('impact')}
        >
          Impact Environnemental
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          onClick={() => setActiveTab('historique')}
        >
          Historique
        </button>
      </div>

      {/* TAB: Tableau de Bord */}
      {activeTab === 'tdb' && (
        <motion.div 
          className="fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-6 border-l-4 border-primary rounded-xl shadow-sm bg-white">
              <h3 className="text-secondary font-medium mb-1">Mes Déchets</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{wastes.length}</span>
                <Recycle className="text-primary opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-success rounded-xl shadow-sm bg-white">
              <h3 className="text-secondary font-medium mb-1">Poids Total</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{totalWeight.toFixed(0)}<span className="text-lg text-secondary">kg</span></span>
                <BarChart3 className="text-success opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-info rounded-xl shadow-sm bg-white">
              <h3 className="text-secondary font-medium mb-1">ÉcoScore Moyen</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.avg_ecoscore ?? '—'}</span>
                <Leaf className="text-info opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-accent rounded-xl shadow-sm bg-white">
              <h3 className="text-secondary font-medium mb-1">Valorisation</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.valorisation_rate ?? '—'}<span className="text-lg text-secondary">%</span></span>
                <TrendingUp className="text-accent opacity-50" size={24} />
              </div>
            </div>
          </div>

          {recentWastes.length > 0 && (
            <div className="card border rounded-xl shadow-sm bg-white p-6">
              <h3 className="font-bold text-lg mb-4">Derniers Déchets Signales</h3>
              <div className="space-y-3">
                {recentWastes.map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{w.waste_type ?? w.type ?? 'Déchet'}</p>
                      <p className="text-sm text-secondary">{w.weight_kg} kg — {w.status}</p>
                    </div>
                    <span className={`badge badge-sm ${
                      w.status === 'pending' ? 'badge-warning' :
                      w.status === 'collected' ? 'badge-success' : 'badge-info'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentWastes.length === 0 && (
            <EmptyState
              title="Aucun déchet"
              message="Commencez par signaler votre premier déchet pour le recyclage."
            />
          )}
        </motion.div>
      )}

      {/* TAB: Mes Déchets */}
      {activeTab === 'dechets' && (
        <motion.div 
          className="fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Tous Mes Déchets</h2>
            <Link to="/producer/new-waste" className="btn btn-primary btn-sm flex items-center gap-1 bg-gray-900 text-white border-none">
              <Plus size={16} /> Ajouter
            </Link>
          </div>

          {wastes.length > 0 ? (
            <div className="space-y-3">
              {wastes.map((w: any) => (
                <div key={w.id} className="card p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(w.waste_type ?? w.type ?? 'D')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{w.waste_type ?? w.type ?? 'Déchet'}</p>
                      <p className="text-sm text-secondary">{w.weight_kg} kg — {w.status}</p>
                    </div>
                  </div>
                  <span className={`badge badge-sm ${
                    w.status === 'pending' ? 'badge-warning' :
                    w.status === 'collected' ? 'badge-success' : 'badge-info'
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun déchet enregistré"
              message="Signalez votre premier déchet pour commencer."
            />
          )}
        </motion.div>
      )}

      {/* TAB: Impact Environnemental */}
      {activeTab === 'impact' && (
        <motion.div 
          className="fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <h2 className="section-title mb-6">Mon Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 border rounded-xl shadow-sm bg-white text-center">
              <Leaf size={32} className="text-primary mx-auto mb-3 opacity-50" />
              <h3 className="text-4xl font-bold text-primary mb-1">{totalWeight.toFixed(1)}</h3>
              <p className="text-secondary text-sm">kg déviés du carburant</p>
            </div>
            <div className="card p-6 border rounded-xl shadow-sm bg-white text-center">
              <Recycle size={32} className="text-success mx-auto mb-3 opacity-50" />
              <h3 className="text-4xl font-bold text-success mb-1">{stats?.valorisation_rate ?? '0'}</h3>
              <p className="text-secondary text-sm">% de valorisation moyenne</p>
            </div>
            <div className="card p-6 border rounded-xl shadow-sm bg-white text-center">
              <BarChart3 size={32} className="text-accent mx-auto mb-3 opacity-50" />
              <h3 className="text-4xl font-bold text-accent mb-1">{stats?.avg_ecoscore ?? '—'}</h3>
              <p className="text-secondary text-sm">ÉcoScore moyen</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: Historique */}
      {activeTab === 'historique' && (
        <motion.div 
          className="fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <h2 className="section-title mb-6">Historique de Production</h2>
          <div className="card p-6 rounded-xl border shadow-sm bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <select className="input flex-1 bg-white">
                <option>Toutes les catégories</option>
                <option>Plastiques</option>
                <option>Métaux</option>
                <option>Organiques</option>
                <option>Papier / Carton</option>
              </select>
              <select className="input flex-1 bg-white">
                <option>Toutes les statuts</option>
                <option>En attente</option>
                <option>Collecté</option>
                <option>Valorisé</option>
              </select>
            </div>

            {wastes.length > 0 ? (
              <div className="space-y-3 mt-4">
                {wastes.map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{w.waste_type ?? w.type ?? 'Déchet'}</p>
                      <p className="text-sm text-secondary">{w.weight_kg} kg — {w.created_at ? new Date(w.created_at).toLocaleDateString('fr-FR') : '—'}</p>
                    </div>
                    <span className={`badge badge-sm ${
                      w.status === 'pending' ? 'badge-warning' :
                      w.status === 'collected' ? 'badge-success' : 'badge-info'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucun historique"
                message="Vos déchets signalés apparaîtront ici."
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
