import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, BrainCircuit, Target, CheckCircle2, Navigation } from 'lucide-react';
import { LoadingState } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function MunicipalityDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [decisionTaken, setDecisionTaken] = useState(false);
  const [simulationTriggered, setSimulationTriggered] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) return <LoadingState fullPage message="Initialisation du Centre de Commandement..." />;

  const abidjanCenter: [number, number] = [5.3364, -4.0267];

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header Centre de Commandement */}
      <div className="bg-orange-500 text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> En Ligne
            </div>
            <h1 className="font-heading text-4xl font-black tracking-tight">Centre de Commandement</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
              <span className="text-xs font-medium uppercase tracking-widest block mb-1 opacity-80">Index de propreté globale</span>
              <div className="flex items-center gap-2">
                <Activity className="text-green-300" />
                <span className="font-heading text-2xl font-bold">88<span className="text-sm opacity-80">/100</span></span>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
              <span className="text-xs font-medium uppercase tracking-widest block mb-1 opacity-80">Collecteurs actifs</span>
              <div className="flex items-center gap-2">
                <Navigation className="text-blue-300" />
                <span className="font-heading text-2xl font-bold">128</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        
        {/* CARTE INTERACTIVE */}
        <Card padding="none" className="mb-8 overflow-hidden border-orange-100 relative">
          <div className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-sm mb-2">Légende</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Zone Stable</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Collecteur Actif</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Risque / Décharge</div>
            </div>
          </div>
          <div className="h-[400px] w-full z-0 relative">
            <MapContainer center={abidjanCenter} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Producteurs / Zones stables */}
              <CircleMarker center={[5.345, -4.015]} radius={10} color="transparent" fillColor="#22c55e" fillOpacity={0.7}>
                <Popup>Zone Stable (Marcory)</Popup>
              </CircleMarker>
              <CircleMarker center={[5.320, -4.005]} radius={15} color="transparent" fillColor="#22c55e" fillOpacity={0.6}>
                <Popup>Zone Stable (Treichville)</Popup>
              </CircleMarker>
              
              {/* Collecteurs */}
              <CircleMarker center={[5.350, -4.030]} radius={6} color="#ffffff" weight={2} fillColor="#3b82f6" fillOpacity={1}>
                <Popup>Collecteur: Amadou</Popup>
              </CircleMarker>
              <CircleMarker center={[5.330, -3.990]} radius={6} color="#ffffff" weight={2} fillColor="#3b82f6" fillOpacity={1}>
                <Popup>Collecteur: Sarah</Popup>
              </CircleMarker>

              {/* Simulation J+7 effect: Zone critique */}
              {simulationTriggered && (
                <CircleMarker center={[5.370, -3.980]} radius={40} color="#ef4444" weight={2} fillColor="#ef4444" fillOpacity={0.4}>
                  <Popup>
                    <strong>Alerte Critique (Cocody)</strong><br/>
                    Risque de saturation: 85%
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>
        </Card>

        {/* PRÉVISION J+7 & IA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* PRÉVISION */}
          <Card className="relative overflow-hidden border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Target className="text-orange-500" size={28} />
                <h2 className="font-heading text-2xl font-bold text-deep-forest">Prévision J+7</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulationTriggered(true)}
                disabled={simulationTriggered}
              >
                {simulationTriggered ? 'Simulation Active' : 'Lancer Simulation'}
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Risque de saturation (Cocody)</span>
                  <span className={`${simulationTriggered ? 'text-red-500' : 'text-orange-500'} font-bold`}>{simulationTriggered ? '85%' : '42%'}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${simulationTriggered ? 'bg-red-500' : 'bg-orange-500'} h-2 rounded-full transition-all duration-1000`} style={{ width: simulationTriggered ? '85%' : '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Taux de collecte estimé (Globale)</span>
                  <span className="text-ecoloop-green font-bold">92%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-ecoloop-green h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              {simulationTriggered && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-text-secondary leading-relaxed bg-red-50 p-3 rounded-lg border border-red-100">
                    <strong className="text-red-600">Alerte IA :</strong> Les données météorologiques annoncent de fortes pluies dans 4 jours. Combiné à la baisse de 40% des collectes sur la zone Riviera, le risque d'inondation par blocage des canaux est <span className="font-bold">CRITIQUE</span>.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* RECOMMANDATION IA & DÉCISION */}
          <Card className="relative overflow-hidden flex flex-col shadow-sm border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="text-purple-600" size={28} />
              <h2 className="font-heading text-2xl font-bold text-deep-forest">Recommandation IA</h2>
            </div>

            {!simulationTriggered ? (
              <div className="flex-1 flex items-center justify-center text-center text-text-secondary p-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                Lancez la simulation J+7 pour générer des recommandations prédictives.
              </div>
            ) : !decisionTaken ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 mb-6">
                  <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} /> Action préventive requise
                  </h3>
                  <ul className="text-sm text-orange-700 space-y-2 ml-6 list-disc">
                    <li>Déployer 5 collecteurs partenaires en urgence sur Cocody Riviera.</li>
                    <li>Envoyer une alerte SMS aux producteurs de la zone.</li>
                    <li>Augmenter la prime de collecte de 20% pour inciter à l'action.</li>
                  </ul>
                </div>

                <div className="flex gap-4 mt-auto">
                  <Button variant="outline" className="flex-1">
                    Ignorer
                  </Button>
                  <Button 
                    variant="primary"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => setDecisionTaken(true)}
                  >
                    Appliquer la décision
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={40} className="text-ecoloop-green" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-deep-forest mb-2">Décision Prise</h3>
                <p className="text-text-secondary">Les collecteurs partenaires ont été notifiés et la prime a été augmentée automatiquement. La zone devrait être sécurisée d'ici 24h.</p>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
