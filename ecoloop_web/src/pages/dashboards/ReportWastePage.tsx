import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Loader2, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function ReportWastePage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'camera' | 'photo' | 'analyzing' | 'gps' | 'form' | 'success'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');


  const simulateFlow = () => {
    // 1. Analyse IA
    setStep('analyzing');
    setTimeout(() => {
      // 2. Fetch GPS
      setStep('gps');
      setTimeout(() => {
        setLocationName('Cocody, Abidjan');
        // 3. Formulaire (commentaire)
        setStep('form');
      }, 1500);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      setTimeout(() => navigate('/household/dashboard'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Signaler un dépôt</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        
        {step === 'photo' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-12">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center mb-8 relative hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => setStep('camera')}>
              <Camera size={48} className="text-gray-400 mb-4" />
              <h3 className="font-bold text-deep-forest text-lg mb-2">Prendre en photo</h3>
              <p className="text-sm text-text-secondary">Prenez une photo du dépôt sauvage. Nous nous occupons du reste en moins de 20s.</p>
            </div>
            <button className="btn-primary w-full py-4 text-lg" onClick={() => setStep('camera')}>
              Ouvrir la caméra
            </button>
          </div>
        )}

        {step === 'camera' && (
          <div className="animate-in fade-in duration-300 flex flex-col py-6">
            <h3 className="font-bold text-lg text-deep-forest mb-4">Cadrez le dépôt sauvage</h3>
            <div className="w-full aspect-[4/3] bg-gray-800 rounded-2xl overflow-hidden mb-6 relative">
              <img src="https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=400&auto=format&fit=crop" alt="Camera feed" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 border-2 border-white/50 m-8 rounded-xl border-dashed"></div>
            </div>
            <div className="flex flex-col gap-3 pb-24">
              <button onClick={simulateFlow} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                <Camera size={24} />
                Capturer et Signaler
              </button>
              <button onClick={() => setStep('photo')} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-deep-forest font-bold rounded-xl transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full" />
              <Sparkles className="text-blue-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Analyse EcoLoop AI</h3>
            <p className="text-blue-600 font-medium">Identification des déchets...</p>
          </div>
        )}

        {step === 'gps' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="absolute inset-0 border-4 border-orange-200 border-t-orange-500 rounded-full" />
              <MapPin className="text-orange-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Localisation</h3>
            <p className="text-orange-600 font-medium">Récupération de votre position GPS...</p>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-3">
              <MapPin className="text-orange-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-deep-forest font-bold mb-1">Localisation trouvée</p>
                <p className="text-xs text-text-secondary">{locationName}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-blue-900 font-bold mb-1">Dépôt analysé</p>
                <p className="text-xs text-blue-700">Mélange de plastiques et organiques.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-deep-forest text-sm">Commentaire (Facultatif)</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors resize-none h-24"
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Caniveau bouché, odeurs..."
              />
            </div>

            <div className="pt-4 flex gap-3 pb-24">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 font-bold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] btn-primary py-4 text-lg flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={20} /> Envoi...</>
                ) : (
                  'Signaler à la mairie'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-ecoloop-green" size={40} />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Signalement envoyé !</h3>
            <p className="text-text-secondary mb-8">Merci de contribuer à la propreté de votre quartier. La mairie a été alertée.</p>
            <button onClick={() => navigate('/household/dashboard')} className="btn-primary w-full py-4 text-lg">
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
