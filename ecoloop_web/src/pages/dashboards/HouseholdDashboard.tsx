import { useRef, useState } from 'react';
import { Recycle, Camera, Clock, BarChart3, CheckCircle2, ChevronRight, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/services/api/aiService';
import { LoadingState } from '@/components/feedback';
import { ApiErrorDisplay } from '@/components/feedback/ApiErrorDisplay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useProducerDashboard, useCreateLot } from '@/hooks/useApi';
import { safeNumber, safeString, safeArray } from '@/utils/parseResponse';

export function HouseholdDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useProducerDashboard();
  const createLotMutation = useCreateLot();

  // Modals
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [recycleStep, setRecycleStep] = useState(1);
  const [recycleType, setRecycleType] = useState('Plastique');

  // AI Scanner state
  const scannerInputRef = useRef<HTMLInputElement>(null);
  const [scannerPhoto, setScannerPhoto] = useState<File | null>(null);
  const [scannerPhotoUrl, setScannerPhotoUrl] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState<'idle'|'camera'|'preview'|'analyzing'|'result'>('idle');
  const [analysisText, setAnalysisText] = useState('Analyse...');
  const [detectedCategory, setDetectedCategory] = useState('Plastique PET');
  const [detectedConfidence, setDetectedConfidence] = useState(94);

  if (isLoading) {
    return <LoadingState fullPage message="Chargement de votre espace..." />;
  }

  if (isError) {
    return <ApiErrorDisplay error={error} onRetry={() => refetch()} context="Dashboard producteur" />;
  }

  const points = safeNumber(data?.points, 0, 'points');
  const level = safeString(data?.level, 'bronze', 'level');
  const co2Avoided = safeNumber(data?.co2_avoided_kg, 0, 'co2_avoided_kg');
  const totalKg = safeNumber(data?.total_kg_recycled, 0, 'total_kg_recycled');
  const collectionsCount = safeNumber(data?.collections_count, 0, 'collections_count');
  const recentLots = safeArray(data?.recent_lots, []);

  const handleRecycleSubmit = async () => {
    try {
      await createLotMutation.mutateAsync({
        category: recycleType.toUpperCase(),
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
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = () => {
    scannerInputRef.current?.click();
  };

  const handleScannerPhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScannerPhoto(file);
      setScannerPhotoUrl(URL.createObjectURL(file));
      setScanStep('preview');
      setShowScanner(true);
    }
  };

  const startAnalysis = async () => {
    if (!scannerPhoto) return;
    setScanStep('analyzing');
    setAnalysisText('Analyse EcoLoop AI...');
    try {
      const result = await aiService.classifyImage(scannerPhoto);
      if (result && result.category) {
        setDetectedCategory(result.category);
        setDetectedConfidence(result.confidence ? Math.round(result.confidence * 100) : 94);
      } else {
        setDetectedCategory('Non identifié');
        setDetectedConfidence(0);
      }
    } catch (e) {
      console.error(e);
      setDetectedCategory('Erreur d\'analyse');
      setDetectedConfidence(0);
    }
    
    setScanStep('result');
  };

  const closeScanner = () => {
    setShowScanner(false);
    setTimeout(() => setScanStep('idle'), 300);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Producteur';

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header */}
      <div className="bg-ecoloop-green text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Bonjour, {firstName}</h1>
            <p className="opacity-90 mt-1">Prêt à avoir un impact positif aujourd'hui ?</p>
          </div>
          <div className="text-left sm:text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 block mb-1">Points EcoLoop</span>
            <span className="font-heading text-2xl font-extrabold text-green-100">{points} pts</span>
            <span className="text-xs opacity-70 block capitalize">{level}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-10">
        
        {/* Impact banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 mb-8 flex items-center gap-4">
          <div className="text-3xl">🌱</div>
          <div>
            {totalKg > 0 ? (
              <p className="font-medium text-deep-forest">
                Grâce à vos <strong className="text-ecoloop-green font-bold">{collectionsCount}</strong> collectes,{' '}
                <strong className="text-ecoloop-green font-bold">{co2Avoided.toFixed(1)} kg de CO₂</strong> ont été évités.
              </p>
            ) : (
              <p className="font-medium text-deep-forest">
                Publiez votre premier lot pour commencer à mesurer votre impact environnemental.
              </p>
            )}
          </div>
        </div>

        {/* Create collection button */}
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

        {/* Action list */}
        <div className="space-y-4">
          {/* Scanner */}
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

          {/* Collections */}
          <button onClick={() => navigate('/producer/collections')} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-deep-forest">Mes collectes</h3>
                <p className="text-sm text-text-secondary">{collectionsCount > 0 ? `${collectionsCount} collectes réalisées` : 'Suivi et historique'}</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-deep-forest transition-colors" />
          </button>

          {/* Impact */}
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
                <p className="text-sm text-text-secondary">{totalKg > 0 ? `${totalKg.toFixed(0)} kg recyclés` : 'Arbres, eau, CO₂ évité'}</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-ecoloop-green transition-colors" />
          </button>
        </div>

        {/* Recent lots */}
        {recentLots.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-bold text-deep-forest mb-4">Derniers lots</h2>
            <div className="space-y-3">
              {recentLots.slice(0, 5).map((lot: any) => (
                <div key={lot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-deep-forest">{lot.category}</span>
                    <span className="text-sm text-text-secondary ml-2">{lot.weight_kg} kg</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    lot.status === 'DISPONIBLE' ? 'bg-blue-50 text-blue-600' :
                    lot.status === 'COLLECTE' ? 'bg-orange-50 text-orange-600' :
                    lot.status === 'RECYCLE' ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>{lot.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI SCANNER MODAL */}
      <AnimatePresence>
        {showScanner && (
          <div key="scanner-modal" className="fixed inset-0 bg-gray-900/90 z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center relative overflow-hidden">
              {scanStep === 'preview' && (
                <div className="py-8">
                  <div className="w-full aspect-[4/3] bg-gray-800 rounded-xl mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
                    {scannerPhotoUrl && <img src={scannerPhotoUrl} alt="Captured waste" className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={startAnalysis} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                      ✅ Utiliser cette photo
                    </button>
                    <button onClick={() => scannerInputRef.current?.click()} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-deep-forest font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                      🔄 Reprendre
                    </button>
                    <button onClick={closeScanner} className="mt-2 text-text-secondary hover:text-deep-forest font-bold transition-colors">
                      Fermer
                    </button>
                  </div>
                </div>
              )}

              {scanStep === 'analyzing' && (
                <div className="py-12">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full" />
                    <Recycle className="text-blue-500" size={40} />
                  </div>
                  <h3 className="font-bold text-2xl text-deep-forest mb-2">EcoLoop AI</h3>
                  <motion.p 
                    key={analysisText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-blue-600 font-medium text-lg"
                  >
                    {analysisText}
                  </motion.p>
                  <div className="w-48 h-2 bg-gray-100 rounded-full mx-auto mt-6 overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.2, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {scanStep === 'result' && (
                <div className="py-6 text-left mb-[100px] md:mb-0">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
                    <CheckCircle2 className="text-ecoloop-green" size={32} />
                  </div>
                  <h3 className="font-bold text-2xl text-center text-deep-forest mb-6">{detectedCategory} détecté</h3>
                  
                  <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Indice de confiance</span>
                      <span className="font-bold text-deep-forest">{detectedConfidence}%</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="text-text-secondary font-medium">Impact</span>
                      <span className="font-bold text-deep-forest flex items-center gap-1"><Leaf size={14} className="text-ecoloop-green"/> Recyclable</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button onClick={() => { closeScanner(); setShowRecycleModal(true); setRecycleType(detectedCategory); }} className="btn-primary w-full py-4 text-lg">
                      Publier le lot
                    </button>
                    <button onClick={() => scannerInputRef.current?.click()} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-deep-forest font-bold rounded-xl transition-colors">
                      Reprendre une photo
                    </button>
                    <button onClick={closeScanner} className="mt-2 text-text-secondary hover:text-deep-forest font-bold transition-colors text-center w-full">
                      Fermer
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
          <div key="recycle-modal" className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6">
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
                    <button onClick={handleRecycleSubmit} disabled={createLotMutation.isPending} className="btn-primary flex-1 py-4 disabled:opacity-50">
                      {createLotMutation.isPending ? 'Envoi...' : 'Confirmer'}
                    </button>
                  </div>
                </div>
              )}

              {recycleStep === 3 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-ecoloop-green" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-deep-forest mb-2">Lot publié avec succès 🎉</h3>
                  <p className="text-sm font-medium text-text-secondary mb-4 italic">"EcoLoop crée une économie circulaire où chaque acteur possède une source de valeur."</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
      <input 
        type="file" accept="image/*" capture="environment" className="hidden"
        ref={scannerInputRef} onChange={handleScannerPhotoCapture}
      />
    </div>
  );
}
