import { useState } from 'react';
import { Truck, Map as MapIcon, ShieldCheck, Clock, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LoadingState } from '@/components/feedback';
import { ApiErrorDisplay } from '@/components/feedback/ApiErrorDisplay';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/features/auth/AuthContext';
import { useCollectorDashboard, useReserveCollection } from '@/hooks/useApi';
import { safeNumber, safeArray } from '@/utils/parseResponse';

export function CollectorDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useCollectorDashboard();
  const reserveMutation = useReserveCollection();
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (isLoading) return <LoadingState fullPage message="Recherche de missions..." />;
  if (isError) return <ApiErrorDisplay error={error} onRetry={() => refetch()} context="Dashboard collecteur" />;

  const completedCollections = safeNumber(data?.completed_collections, 0);
  const totalCollections = safeNumber(data?.total_collections, 0);
  const totalEarnings = safeNumber(data?.total_earnings_fcfa, 0);
  const reputationScore = safeNumber(data?.reputation_score, 0);
  const availableLots = safeArray<any>(data?.available_lots, []);
  const myCollections = safeArray<any>(data?.my_collections, []);

  const totalCollectedKg = myCollections.reduce((sum: number, c: any) =>
    sum + safeNumber(c.actual_weight_kg, 0), 0
  );

  const topLot = availableLots[0];
  const firstName = user?.full_name?.split(' ')[0] || 'Collecteur';

  const handleReserve = async (lotId: string) => {
    setReserveError(null);
    try {
      await reserveMutation.mutateAsync(lotId);
      setShowNavigationModal(true);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setReserveError('Ce lot a déjà été réservé par un autre collecteur.');
      } else {
        setReserveError('Erreur lors de la réservation. Réessayez.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header */}
      <div className="bg-blue-600 text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> En service
            </div>
            <h1 className="font-heading text-2xl font-bold">Bonjour, {firstName}</h1>
          </div>
          <div className="text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 block mb-1">Revenus</span>
            <span className="font-heading text-xl font-extrabold">{totalEarnings.toLocaleString()} F</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16">
        
        {/* Reserve error */}
        {reserveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm font-medium">
            {reserveError}
          </div>
        )}

        {/* Top lot or empty */}
        {topLot ? (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-8">
            <div className="bg-blue-50 text-blue-800 px-5 py-3 font-bold text-sm uppercase tracking-wide flex justify-between items-center border-b border-blue-100">
              <span>🌟 Mission recommandée</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-heading text-3xl font-extrabold text-deep-forest mb-1">{topLot.category}</h3>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-ecoloop-green text-xs font-bold px-2 py-1 rounded-md">
                    <ShieldCheck size={14} /> Producteur vérifié
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <MapIcon size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">{topLot.description || 'À proximité'}</span>
                  <span className="text-xs text-text-secondary">Lieu</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <Truck size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">{topLot.weight_kg} kg</span>
                  <span className="text-xs text-text-secondary">Poids estimé</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <Clock size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">{Math.round(topLot.estimated_value).toLocaleString()} F</span>
                  <span className="text-xs text-text-secondary">Valeur</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleReserve(topLot.id)}
                  disabled={reserveMutation.isPending}
                >
                  {reserveMutation.isPending ? 'Réservation...' : 'Accepter la mission'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <EmptyState 
              icon={<Truck size={32} />}
              title="Aucune mission disponible" 
              description="Il n'y a pas de lot disponible dans votre zone pour le moment. Nous vous notifierons dès qu'un producteur publiera un lot." 
            />
          </div>
        )}

        {/* Stats */}
        <h2 className="font-heading text-xl font-bold text-deep-forest mb-4">Statistiques</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard 
            title="Missions terminées" 
            value={completedCollections} 
            colorClass="text-deep-forest"
          />
          <StatCard 
            title="Volume collecté" 
            value={`${totalCollectedKg.toFixed(0)} kg`} 
            colorClass="text-blue-600"
          />
          <StatCard 
            title="Note moyenne" 
            value={reputationScore > 0 ? `${reputationScore.toFixed(1)}/5` : '—'} 
            colorClass="text-yellow-600"
          />
          <StatCard 
            title="Total missions" 
            value={totalCollections} 
            colorClass="text-purple-600"
          />
        </div>

        {/* Other lots */}
        {availableLots.length > 1 && (
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-forest mb-4">À proximité ({availableLots.length - 1})</h2>
            <div className="space-y-4">
              {availableLots.slice(1).map((lot: any) => (
                <Card key={lot.id} hoverable padding="sm" className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Truck className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-deep-forest text-lg">{lot.category}</p>
                      <p className="text-sm text-text-secondary flex items-center gap-1">
                        <MapIcon size={12} /> {lot.weight_kg} kg • {Math.round(lot.estimated_value).toLocaleString()} F
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION MODAL */}
      <AnimatePresence>
        {showNavigationModal && (
          <div key="navigation-modal" className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-2xl text-deep-forest mb-2">Mission Acceptée</h3>
              <p className="text-text-secondary mb-8">Voulez-vous vous rendre sur le lieu de collecte maintenant ?</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowNavigationModal(false);
                    navigate('/collector/map');
                  }} 
                  className="w-full py-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin size={20} />
                  Oui, lancer le GPS
                </button>
                <button 
                  onClick={() => setShowNavigationModal(false)} 
                  className="w-full py-4 font-bold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
