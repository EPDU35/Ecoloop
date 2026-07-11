import { useEffect, useState } from 'react';
import { Recycle, Camera, Clock, BarChart3, CheckCircle2, ChevronRight, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { wasteService } from '@/services/api/wasteService';
import { LoadingState } from '@/components/feedback';
import { useNavigate } from 'react-router-dom';

export function HouseholdDashboard() {
  const navigate = useNavigate();
  const [wastes, setWastes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [recycleStep, setRecycleStep] = useState(1);
  const [recycleType, setRecycleType] = useState('Plastique');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const myWastes = await wasteService.getMyWastes();
      setWastes(myWastes ?? []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecycleSubmit = async () => {
    try {
      await wasteService.createLot({
        category: recycleType.toUpperCase() as any,
        weight_kg: 5,
        price_per_kg: 100,
        latitude: 5.34,
        longitude: -4.02,
        description: `Demande de collecte - ${recycleType}`
      });
      setRecycleStep(3); // Success
      setTimeout(() => {
        setRecycleStep(1);
        setShowRecycleModal(false);
        fetchData();
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingState fullPage message="Chargement de votre espace..." />;
  }

  const pastWastes = wastes.filter(w => w.status === 'COLLECTED');
  const points = pastWastes.reduce((sum, w) => sum + (w.weight_kg * 10), 0) + 150; // Mock base points

  // AI Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState<'idle'|'scanning'|'analyzing'|'result'>('idle');

  const handleScan = () => {
    setShowScanner(true);
    setScanStep('scanning');
    setTimeout(() => setScanStep('analyzing'), 1500);
    setTimeout(() => setScanStep('result'), 3500);
  };

  const closeScanner = () => {
    setShowScanner(false);
    setTimeout(() => setScanStep('idle'), 300);
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header compact et accueillant */}
      <div className="bg-ecoloop-green text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Bonjour, Producteur</h1>
            <p className="opacity-90 mt-1">Prêt à avoir un impact positif aujourd'hui ?</p>
          </div>
          <div className="text-left sm:text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 block mb-1">Points EcoLoop</span>
            <span className="font-heading text-2xl font-extrabold text-green-100">{points} pts</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-10">
        
        {/* EFFET WOW : Bannière d'impact direct */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 mb-8 flex items-center gap-4">
          <div className="text-3xl">🌱</div>
          <div>
            <p className="font-medium text-deep-forest">
              Grâce à vos actions, <strong className="text-ecoloop-green font-bold">4,8 kg de CO₂</strong> ont déjà été évités.
            </p>
          </div>
        </div>

        {/* 1. Demander une collecte (Gros bouton) */}
        <button 
          onClick={() => setShowRecycleModal(true)}
          className="w-full bg-deep-forest text-white rounded-2xl shadow-sm hover:shadow-md transition-all p-8 flex flex-col items-center justify-center gap-4 mb-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
            <Recycle size={40} className="text-white" />
          </div>
          <h2 className="relative z-10 font-heading text-2xl md:text-3xl font-extrabold tracking-tight">Demander une collecte</h2>
        </button>

        {/* Autres actions sous forme de liste claire */}
        <div className="space-y-4">
          {/* 2. Scanner un déchet */}
          <button onClick={handleScan} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Camera size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-deep-forest">Scanner un déchet</h3>
                <p className="text-sm text-text-secondary">Identifier avec l'IA</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-deep-forest transition-colors" />
          </button>

          {/* 3. Mes collectes */}
          <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-deep-forest">Mes collectes</h3>
                <p className="text-sm text-text-secondary">Suivi et historique</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-deep-forest transition-colors" />
          </button>

          {/* 4. Mon impact */}
          <button 
            onClick={() => navigate('/producer/impact')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:border-ecoloop-green transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-ecoloop-green rounded-full flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-deep-forest">Mon impact</h3>
                <p className="text-sm text-text-secondary">Arbres, eau, CO₂ évité</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-ecoloop-green transition-colors" />
          </button>
        </div>
      </div>

      {/* AI SCANNER MODAL */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-gray-900/90 z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center relative overflow-hidden">
              {scanStep === 'scanning' && (
                <div className="py-8">
                  <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-xl mx-auto mb-6 flex items-center justify-center relative">
                    <Camera className="text-gray-400" size={40} />
                    <motion.div 
                      className="absolute inset-0 bg-blue-500/20"
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-deep-forest mb-2">Prise de photo...</h3>
                </div>
              )}

              {scanStep === 'analyzing' && (
                <div className="py-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Recycle className="text-blue-500" size={32} />
                    </motion.div>
                  </div>
                  <h3 className="font-bold text-xl text-deep-forest mb-2">Analyse EcoLoop AI</h3>
                  <p className="text-text-secondary text-sm">Identification de la matière en cours...</p>
                </div>
              )}

              {scanStep === 'result' && (
                <div className="py-6 text-left">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
                    <CheckCircle2 className="text-ecoloop-green" size={32} />
                  </div>
                  <h3 className="font-bold text-2xl text-center text-deep-forest mb-6">Plastique PET détecté</h3>
                  
                  <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Indice de confiance</span>
                      <span className="font-bold text-deep-forest">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Valeur estimée</span>
                      <span className="font-bold text-ecoloop-green">300 FCFA / kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Demande</span>
                      <span className="font-bold text-orange-500">Très élevée</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={closeScanner} className="px-4 py-3 font-bold text-text-secondary hover:bg-gray-50 rounded-xl transition-colors">
                      Fermer
                    </button>
                    <button onClick={() => { closeScanner(); setShowRecycleModal(true); setRecycleType('Plastique'); }} className="btn-primary flex-1 py-3">
                      Demander la collecte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* RECYCLE MODAL */}
      <AnimatePresence>
        {showRecycleModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6">
            <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-2xl p-6 pb-12 sm:pb-6 shadow-xl">
              {recycleStep === 1 && (
                <div>
                  <h3 className="font-heading text-2xl font-bold text-deep-forest mb-2">Que voulez-vous recycler ?</h3>
                  <p className="text-text-secondary mb-6">Sélectionnez la matière principale.</p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {['Plastique', 'Carton', 'Métal', 'Verre'].map(mat => (
                      <button 
                        key={mat}
                        onClick={() => setRecycleType(mat)}
                        className={`p-4 border border-gray-200 rounded-xl font-bold text-center transition-colors ${recycleType === mat ? 'border-ecoloop-green bg-green-50 text-ecoloop-green' : 'text-deep-forest hover:border-gray-300'}`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowRecycleModal(false)} className="px-6 py-4 font-bold text-text-secondary hover:bg-gray-50 rounded-xl transition-colors">
                      Annuler
                    </button>
                    <button onClick={() => setRecycleStep(2)} className="btn-primary flex-1 py-4">
                      Continuer
                    </button>
                  </div>
                </div>
              )}
              
              {recycleStep === 2 && (
                <div>
                  <h3 className="font-heading text-2xl font-bold text-deep-forest mb-2">Confirmation</h3>
                  <p className="text-text-secondary mb-6">Un collecteur sera notifié pour récupérer vos déchets de <strong>{recycleType}</strong>.</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 mb-8">
                    <Leaf className="text-ecoloop-green" />
                    <span className="text-sm font-medium">En recyclant ceci, vous contribuez à un quartier plus propre.</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setRecycleStep(1)} className="px-6 py-4 font-bold text-text-secondary hover:bg-gray-50 rounded-xl transition-colors">
                      Retour
                    </button>
                    <button onClick={handleRecycleSubmit} className="btn-primary flex-1 py-4">
                      Confirmer
                    </button>
                  </div>
                </div>
              )}

              {recycleStep === 3 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-ecoloop-green" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-deep-forest mb-2">Demande envoyée !</h3>
                  <p className="text-text-secondary">Un collecteur vous sera attribué sous peu.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
