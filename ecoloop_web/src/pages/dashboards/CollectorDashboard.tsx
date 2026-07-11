import { useEffect, useState } from 'react';
import { Truck, Map as MapIcon, ShieldCheck, Clock, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { LoadingState } from '@/components/feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useDemo } from '@/contexts/DemoContext';

export function CollectorDashboard() {
  const { demoStep } = useDemo();
  const [availableLots, setAvailableLots] = useState<WasteLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const navigate = useNavigate();

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

  if (isLoading) return <LoadingState fullPage message="Recherche de missions..." />;

  const missionsCount = demoStep >= 3 ? 5 : 4; 
  
  const demoLot = {
    id: 'ECO-00094',
    category: 'PET transparent',
    weight_kg: 12,
    price_per_kg: 250,
    address: 'Cocody Riviera',
    purity: '98%',
    created_at: new Date(Date.now() - 4 * 60000).toISOString()
  };

  const topLot = demoStep >= 1 ? demoLot : availableLots[0];

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
        
        {/* MISSION RECOMMANDÉE OU TERMINÉE */}
        {demoStep >= 3 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden mb-8 p-6 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
              <ShieldCheck className="text-ecoloop-green" size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-deep-forest mb-2">Mission terminée</h3>
            <div className="bg-gray-50 rounded-xl p-4 my-6 text-left border border-gray-100 space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Distance :</span>
                <span className="font-bold text-deep-forest">3,2 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Temps :</span>
                <span className="font-bold text-deep-forest">25 min</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg">
                <span className="text-sm font-bold text-green-800">Points récoltés :</span>
                <span className="font-heading text-xl font-black text-ecoloop-green">+250 pts</span>
              </div>
            </div>
            <p className="text-sm font-medium text-text-secondary italic">"EcoLoop crée une économie circulaire où chaque acteur possède une source de valeur."</p>
          </div>
        ) : topLot ? (
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
                  <span className="block font-bold text-deep-forest">1.3 km</span>
                  <span className="text-xs text-text-secondary">Distance</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <Truck size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">{topLot.weight_kg} kg</span>
                  <span className="text-xs text-text-secondary">Poids estimé</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <Clock size={20} className="mx-auto text-blue-500 mb-2" />
                  <span className="block font-bold text-deep-forest">8 min</span>
                  <span className="text-xs text-text-secondary">Temps estimé</span>
                </div>
              </div>

              {/* AI EXPLANATION BLOCK */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-black">94%</span>
                    Score IA
                  </h4>
                  <span className="text-xs text-blue-600 font-medium">Recommandation optimale</span>
                </div>
                
                <div className="flex justify-between text-xs text-blue-800 mb-4 px-2">
                  <div className="text-center"><span className="block font-bold text-lg">+35</span>Distance</div>
                  <div className="text-center"><span className="block font-bold text-lg">+20</span>Capacité</div>
                  <div className="text-center"><span className="block font-bold text-lg">+18</span>Trafic</div>
                  <div className="text-center"><span className="block font-bold text-lg">+12</span>Urgence</div>
                  <div className="text-center"><span className="block font-bold text-lg">+9</span>Historique</div>
                </div>

                <div className="text-sm text-blue-800 bg-white/50 p-3 rounded-lg">
                  <p className="font-bold mb-1">Pourquoi cette mission ?</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>Vous êtes le collecteur le plus proche (1.3 km).</li>
                    <li>Votre camion dispose encore de 280 kg de capacité.</li>
                    <li>Le trafic actuel est faible sur cet itinéraire.</li>
                    <li>Cette zone est prioritaire (risque météo).</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowNavigationModal(true)}
                >
                  Accepter la mission
                </Button>
              </div>
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
            title="Volume collecté" 
            value="185 kg" 
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
