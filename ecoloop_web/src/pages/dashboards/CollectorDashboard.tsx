import { useEffect, useState } from 'react';
import { Truck, Map as MapIcon, ShieldCheck, Clock } from 'lucide-react';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { LoadingState } from '@/components/feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';

export function CollectorDashboard() {
  const [availableLots, setAvailableLots] = useState<WasteLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lots] = await Promise.all([
          wasteService.getAvailableWastes(),
        ]);
        setAvailableLots(lots);
      } catch (err: any) {
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

  if (isLoading) return <LoadingState fullPage message="Recherche de missions..." />;

  const todayRevenue = 18500; // Mock from user requirement
  const missionsCount = 12; // Mock
  const topLot = availableLots[0]; // La mission recommandée

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header gig-economy */}
      <div className="bg-blue-600 text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> En service
            </div>
            <h1 className="font-heading text-2xl font-bold">Bonjour, Collecteur</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16">
        
        {/* MISSION RECOMMANDÉE */}
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
                <div className="text-right">
                  <span className="block text-sm text-text-secondary mb-1">Gain net</span>
                  <span className="font-heading text-3xl font-extrabold text-blue-600">
                    {(topLot.weight_kg * topLot.price_per_kg).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <MapIcon size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">2.5 km</span>
                  <span className="text-xs text-text-secondary">Distance</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <Truck size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">{topLot.weight_kg} kg</span>
                  <span className="text-xs text-text-secondary">Poids estimé</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <Clock size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">15 min</span>
                  <span className="text-xs text-text-secondary">Temps estimé</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleReserve(topLot.id)}
                isLoading={reservingId === topLot.id}
              >
                Accepter la mission
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <EmptyState 
              icon={<Truck size={32} />}
              title="Aucune mission" 
              description="Il n'y a pas de lot disponible dans votre zone pour le moment. Nous vous notifierons dès qu'un producteur publiera un lot." 
            />
          </div>
        )}

        {/* STATISTIQUES AUJOURD'HUI */}
        <h2 className="font-heading text-xl font-bold text-deep-forest mb-4">Aujourd'hui</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard 
            title="Missions" 
            value={missionsCount} 
            colorClass="text-deep-forest"
          />
          <StatCard 
            title="Gains" 
            value={`${todayRevenue.toLocaleString()} FCFA`} 
            colorClass="text-blue-600"
          />
        </div>

        {/* AUTRES MISSIONS (Si plus d'une) */}
        {availableLots.length > 1 && (
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-forest mb-4">À proximité ({availableLots.length - 1})</h2>
            <div className="space-y-4">
              {availableLots.slice(1).map(lot => (
                <Card key={lot.id} hoverable padding="sm" className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Truck className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-deep-forest text-lg">{lot.category}</p>
                      <p className="text-sm text-text-secondary flex items-center gap-1">
                        <MapIcon size={12} /> 4.2 km • {lot.weight_kg} kg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600 block">{(lot.weight_kg * lot.price_per_kg).toLocaleString()} FCFA</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
