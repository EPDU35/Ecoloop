import { useEffect, useState } from 'react';
import { Recycle, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { wasteService } from '@/services/api/wasteService';
import { LoadingState } from '@/components/feedback';

export function HouseholdDashboard() {
  const navigate = useNavigate();
  const [wastes, setWastes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myWastes = await wasteService.getMyWastes();
        setWastes(myWastes ?? []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState fullPage message="Chargement de votre espace..." />;
  }

  const pastWastes = wastes.filter(w => w.status === 'COLLECTED');
  // Calcul basé sur les points uniquement (pas d'argent)
  const points = pastWastes.reduce((sum, w) => sum + (w.weight_kg * 10), 0) + 150; 

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header */}
      <div className="bg-ecoloop-green text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Bonjour, Producteur</h1>
            <p className="opacity-90 mt-1">Prêt à recycler aujourd'hui ?</p>
          </div>
          <div className="text-left sm:text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 block mb-1">Points EcoLoop</span>
            <span className="font-heading text-2xl font-extrabold text-green-100">{points} pts</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-10">
        
        {/* Bannière d'impact direct */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-ecoloop-green text-xl shrink-0">
            🌱
          </div>
          <div>
            <p className="font-medium text-deep-forest text-sm sm:text-base">
              Grâce à vos actions, <strong className="text-ecoloop-green font-bold">4,8 kg de CO₂</strong> ont déjà été évités.
            </p>
          </div>
        </div>

        {/* ACTIONS PRINCIPALES */}
        <div className="space-y-4">
          
          {/* Action 1 : Recycler mes déchets (qui utilise l'IA réelle dans NewLotPage) */}
          <button 
            onClick={() => navigate('/producer/new-lot')}
            className="w-full bg-deep-forest text-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
                <Recycle size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-xl md:text-2xl text-white">Recycler mes déchets</h3>
                <p className="text-sm text-green-100 mt-1">Scanner avec l'IA ou saisir manuellement</p>
              </div>
            </div>
            <ChevronRight className="text-white/50 group-hover:text-white transition-colors hidden sm:block" />
          </button>

          {/* Action 2 : Signaler un dépotoir (qui utilise l'IA réelle dans ReportWastePage) */}
          <button 
            onClick={() => navigate('/producer/report')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-deep-forest">Signaler un dépotoir</h3>
                <p className="text-sm text-text-secondary">Alerter la mairie d'un dépôt sauvage</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-deep-forest transition-colors" />
          </button>

          {/* Action 3 : Mes collectes */}
          <button 
            onClick={() => navigate('/producer/collections')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-deep-forest">Mes collectes</h3>
                <p className="text-sm text-text-secondary">Suivre le statut de vos lots</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-deep-forest transition-colors" />
          </button>

        </div>
      </div>
    </div>
  );
}
