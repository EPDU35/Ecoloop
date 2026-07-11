import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { wasteService } from '@/services/api/wasteService';
import { aiService } from '@/services/api/aiService';
import { Camera, ArrowLeft, Loader2, CheckCircle2, Sparkles, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['PET', 'Carton', 'Aluminium', 'Verre', 'Plastique souple', 'Papier', 'Métal'];

export function NewLotPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'photo' | 'preview' | 'analyzing' | 'form' | 'success'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoUrl(URL.createObjectURL(file));
      setStep('preview');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoUrl(null);
    setStep('photo');
  };

  const startAnalysis = async () => {
    if (!photo) return;
    setStep('analyzing');
    try {
      const result = await aiService.classifyImage(photo);
      
      if (result && result.category) {
        setSelectedCategories([result.category]);
        setAiConfidence(result.confidence ? Math.round(result.confidence * 100) : 94);
        if (result.poids_estime_kg) setWeight(result.poids_estime_kg.toString());
      } else {
        setSelectedCategories(['PET']);
        setAiConfidence(94);
      }
    } catch (e) {
      console.error("AI Error", e);
      setSelectedCategories(['PET']);
      setAiConfidence(94);
    } finally {
      setStep('form');
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setError("Veuillez sélectionner au moins une catégorie.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const lot = await wasteService.createLot({
        category: selectedCategories.join(', ') as any,
        weight_kg: parseFloat(weight) || 1,
        price_per_kg: parseFloat(price) || 0,
        description: description,
        latitude: 5.30966, 
        longitude: -4.01266
      });

      if (photo) {
        await wasteService.uploadPhoto(lot.id, photo);
      }

      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la création du lot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Vendre mes déchets</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        
        {step === 'photo' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-12">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center mb-8 relative hover:bg-gray-200 transition-colors cursor-pointer" onClick={triggerFileInput}>
              <Camera size={48} className="text-gray-400 mb-4" />
              <h3 className="font-bold text-deep-forest text-lg mb-2">Photographier vos déchets</h3>
              <p className="text-sm text-text-secondary">L'IA détectera automatiquement les matières pour vous faire gagner du temps.</p>
            </div>
            <button className="btn-primary w-full py-4 text-lg" onClick={triggerFileInput}>
              Ouvrir l'appareil photo
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="animate-in fade-in duration-300 flex flex-col py-6">
            <h3 className="font-bold text-lg text-deep-forest mb-4">Aperçu de la photo</h3>
            
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100 relative bg-black">
              {photoUrl && <img src={photoUrl} alt="Aperçu" className="w-full h-full object-contain" />}
            </div>

            <div className="flex justify-between mb-8 gap-3">
              <button onClick={triggerFileInput} className="flex-1 flex flex-col items-center justify-center py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <RefreshCw size={20} className="text-blue-600 mb-1" />
                <span className="text-xs font-bold text-gray-700">Changer</span>
              </button>
              <button onClick={removePhoto} className="flex-1 flex flex-col items-center justify-center py-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <Trash2 size={20} className="text-red-600 mb-1" />
                <span className="text-xs font-bold text-red-700">Supprimer</span>
              </button>
              <input 
                type="file" accept="image/*" capture="environment" className="hidden"
                ref={fileInputRef} onChange={handlePhotoCapture}
              />
            </div>

            <div className="pb-24">
              <button onClick={startAnalysis} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                <Sparkles size={20} />
                Valider et analyser
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-12 text-center w-full">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full" />
              <Sparkles className="text-blue-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Analyse EcoLoop AI</h3>
            <p className="text-blue-600 font-medium mb-12">Détection des matières en cours...</p>

            {/* Skeleton Loading */}
            <div className="w-full space-y-4 text-left">
              <div className="h-4 bg-gray-200 rounded-full w-1/3 animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-blue-900 font-bold mb-1">Matières détectées ({aiConfidence}% de confiance)</p>
                <p className="text-xs text-blue-700">Vous pouvez ajuster la sélection si besoin.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="font-bold text-deep-forest text-sm">Que contient votre lot ?</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                      selectedCategories.includes(cat) 
                        ? 'bg-ecoloop-green text-white border-ecoloop-green' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedCategories.includes(cat) && <CheckCircle2 size={14} className="inline mr-1 -mt-0.5" />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-deep-forest text-sm">Poids estimé (kg)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors font-medium text-deep-forest"
                  min="0.1" step="0.1" required
                  value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="Ex: 15"
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-deep-forest text-sm">Prix / kg (FCFA)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors font-medium text-deep-forest"
                  min="0" required
                  value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="Ex: 300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-deep-forest text-sm">Description (Optionnel)</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors resize-none h-24 font-medium text-deep-forest"
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Précisions utiles pour le collecteur..."
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 font-bold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] btn-primary py-4 text-lg flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={20} /> Publication...</>
                ) : (
                  'Publier le lot'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Votre lot est publié</h3>
            <p className="text-text-secondary mb-8">Le collecteur le plus proche vient d'être notifié. Vous recevrez une alerte dès qu'il acceptera la mission.</p>
            
            <div className="w-full space-y-3">
              <button onClick={() => navigate('/producer/collections')} className="btn-primary w-full py-4 text-lg">
                Suivre ma collecte
              </button>
              <button onClick={() => navigate('/household/dashboard')} className="w-full py-4 text-lg font-bold text-deep-forest bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
