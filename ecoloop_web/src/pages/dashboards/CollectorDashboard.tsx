import { useEffect, useState } from 'react';
import { Truck, Map as MapIcon, Star, Target, Navigation, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/States';
import './Dashboards.css';

export function CollectorDashboard() {
  const [activeTab, setActiveTab] = useState<'tdb' | 'missions' | 'historique' | 'performance'>('tdb');
  const [availableLots, setAvailableLots] = useState<WasteLot[]>([]);
  const [historyLots, setHistoryLots] = useState<WasteLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingId, setReservingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lots, history] = await Promise.all([
          wasteService.getAvailableWastes(),
          wasteService.getHistory(),
        ]);
        setAvailableLots(lots);
        setHistoryLots(history);
      } catch (err: any) {
        setError("Impossible de charger les données.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReserve = async (lotId: string) => {
    setReservingId(lotId);
    try {
      await wasteService.reserveCollection(lotId);
      setAvailableLots(prev => prev.filter(l => l.id !== lotId));
    } catch (err: any) {
      console.error(err);
    } finally {
      setReservingId(null);
    }
  };

  if (isLoading) return <LoadingState fullPage message="Chargement des missions..." />;

  if (error) {
    return (
      <div className="page-container theme-collector">
        <ErrorState title="Erreur réseau" message={error} />
      </div>
    );
  }

  const todayMissions = availableLots.length;
  const totalWeightToday = availableLots.reduce((sum, l) => sum + l.weight_kg, 0);
  const estimatedRevenue = availableLots.reduce((sum, l) => sum + l.weight_kg * l.price_per_kg, 0);

  return (
    <div className="page-container theme-collector">
      <div className="page-header-actions mb-8">
        <div>
          <h1 className="page-title text-3xl font-bold flex items-center gap-3">
            <Truck className="text-info" size={32} />
            Espace Collecteur
          </h1>
          <p className="page-subtitle text-secondary text-lg mt-2">Gérez vos missions, naviguez et suivez vos revenus</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-medium text-sm">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span> Disponible
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto pb-2">
        <button 
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'tdb' ? 'border-info text-info' : 'border-transparent text-secondary hover:text-info'}`}
          onClick={() => setActiveTab('tdb')}
        >
          Tableau de Bord
        </button>
        <button 
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'missions' ? 'border-info text-info' : 'border-transparent text-secondary hover:text-info'}`}
          onClick={() => setActiveTab('missions')}
        >
          Missions & Carte
        </button>
        <button 
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'historique' ? 'border-info text-info' : 'border-transparent text-secondary hover:text-info'}`}
          onClick={() => setActiveTab('historique')}
        >
          Historique
        </button>
        <button 
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'performance' ? 'border-info text-info' : 'border-transparent text-secondary hover:text-info'}`}
          onClick={() => setActiveTab('performance')}
        >
          Performances
        </button>
      </div>

      {/* TAB: Tableau de bord */}
      {activeTab === 'tdb' && (
        <motion.div 
          className="fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 border-l-4 border-info rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Missions disponibles</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{todayMissions}</span>
                <Target className="text-info opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-primary rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Revenus estimés</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{estimatedRevenue.toLocaleString()} F</span>
                <span className="text-primary opacity-50 text-xl">FCFA</span>
              </div>
            </div>
            <div className="card p-6 border-l-4 border-accent rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Poids total disponible</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{totalWeightToday} kg</span>
                <Navigation className="text-accent opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-warning rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Collectes terminées</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{historyLots.length}</span>
                <Star className="text-warning opacity-50" size={24} />
              </div>
            </div>
          </div>

          {availableLots.length === 0 && (
            <EmptyState
              title="Aucune mission disponible"
              message="Aucun lot de déchets n'est actuellement disponible pour collecte. Revenez plus tard."
            />
          )}
        </motion.div>
      )}

      {/* TAB: Missions & Carte */}
      {activeTab === 'missions' && (
        <motion.div 
          className="fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-info" /> Missions disponibles
            </h2>

            {availableLots.length === 0 ? (
              <EmptyState
                title="Aucune mission disponible"
                message="Il n'y a pas de mission à proposer pour le moment."
              />
            ) : (
              <>
                {availableLots.length > 0 && (
                  <div className="card border-2 border-info rounded-xl shadow-sm overflow-hidden bg-info-light">
                    <div className="bg-info text-white p-4 flex justify-between items-center">
                      <span className="font-bold">Prochaine mission</span>
                      <span className="bg-white text-info px-2 py-1 rounded text-xs font-bold">
                        {availableLots[0].category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg">{availableLots[0].category}</h3>
                        <p className="text-secondary text-sm">{availableLots[0].description || 'Pas de description'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-3 rounded-lg border">
                          <span className="text-xs text-secondary block">Poids</span>
                          <span className="font-bold">{availableLots[0].weight_kg} kg</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <span className="text-xs text-secondary block">Gain estimé</span>
                          <span className="font-bold text-primary">
                            {(availableLots[0].weight_kg * availableLots[0].price_per_kg).toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>

                      <button
                        className="btn bg-info text-white w-full py-3 hover:bg-blue-600 font-bold"
                        onClick={() => handleReserve(availableLots[0].id)}
                        disabled={reservingId === availableLots[0].id}
                      >
                        {reservingId === availableLots[0].id ? 'Réservation...' : 'Accepter la mission'}
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="font-bold mt-4">Autres missions ({availableLots.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {availableLots.slice(1).map(lot => (
                    <div key={lot.id} className="card p-4 rounded-lg border hover:border-info cursor-pointer transition">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">{lot.category}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{lot.weight_kg} kg</span>
                      </div>
                      <p className="text-xs text-secondary flex items-center gap-1">
                        <MapIcon size={12} /> Lot {lot.id.slice(0, 8)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="card h-full rounded-xl overflow-hidden border shadow-sm relative min-h-[500px] bg-gray-100 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
              <div className="text-center z-10 p-8 bg-white/80 backdrop-blur rounded-2xl border">
                <MapIcon size={48} className="text-info mx-auto mb-4 opacity-50" />
                <h3 className="font-bold text-xl mb-2">Carte de Navigation</h3>
                <p className="text-secondary max-w-sm">
                  En mode production, cette section affichera une carte Leaflet interactive avec votre position en temps réel, les producteurs à proximité et l'itinéraire optimisé de la mission en cours.
                </p>
              </div>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Historique des collectes</h2>
          </div>

          {historyLots.length === 0 ? (
            <EmptyState
              title="Aucune collecte terminée"
              message="Vous n'avez pas encore terminé de mission. Acceptez une mission pour commencer."
            />
          ) : (
            <div className="space-y-3">
              {historyLots.map(lot => (
                <div key={lot.id} className="card p-4 rounded-lg border flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sm">{lot.category}</span>
                    <p className="text-xs text-secondary">{lot.description || 'Pas de description'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{lot.weight_kg} kg</span>
                    <p className="text-xs text-secondary">{lot.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB: Performances */}
      {activeTab === 'performance' && (
        <motion.div 
          className="fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <h2 className="section-title mb-6">Mes Performances</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 rounded-xl shadow-sm border-t-4 border-info text-center">
              <h3 className="font-bold text-3xl mb-1">{historyLots.length}</h3>
              <p className="text-secondary">Collectes terminées</p>
            </div>

            <div className="card p-6 rounded-xl shadow-sm border-t-4 border-info text-center">
              <h3 className="font-bold text-3xl mb-1">
                {historyLots.reduce((sum, l) => sum + l.weight_kg, 0)} kg
              </h3>
              <p className="text-secondary">Poids total collecté</p>
            </div>

            <div className="card p-6 rounded-xl shadow-sm border-t-4 border-warning text-center">
              <h3 className="font-bold text-3xl mb-1">
                {historyLots.reduce((sum, l) => sum + l.weight_kg * l.price_per_kg, 0).toLocaleString()} F
              </h3>
              <p className="text-secondary">Revenus totaux</p>
            </div>
          </div>

          {historyLots.length === 0 && (
            <EmptyState
              title="Aucune performance"
              message="Vous n'avez pas encore de collectes terminées. Vos performances apparaîtront ici une fois vos missions complétées."
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
