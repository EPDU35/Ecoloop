import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { wasteService } from '@/services/api/wasteService';
import { aiService } from '@/services/api/aiService';
import { Camera, ArrowLeft, Loader2, CheckCircle2, Sparkles, Image as ImageIcon, Trash2, RefreshCw, Package, AlertTriangle, BarChart3, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Catégories alignées avec la sortie IA
const CATEGORIES = [
  { id: 'plastique', label: 'Plastique', icon: '♻️' },
  { id: 'carton', label: 'Carton', icon: '📦' },
  { id: 'metal', label: 'Métal', icon: '🔩' },
  { id: 'verre', label: 'Verre', icon: '🫙' },
  { id: 'papier', label: 'Papier', icon: '📄' },
  { id: 'non-recyclable', label: 'Non recyclable', icon: '🚫' },
];

export function NewLotPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'photo' | 'preview' | 'analyzing' | 'form' | 'success'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  
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
    setAiResult(null);
    setStep('photo');
  };

  const startAnalysis = async () => {
    setStep('analyzing');
    try {
      if (!photo) {
         setError("Aucune photo sélectionnée.");
         setStep('photo');
         return;
      }
      
      const result = await aiService.classifyImage(photo);
      setAiResult(result);
      
      if (result && result.category) {
        // Sélectionner toutes les catégories détectées
        const detectedCats = result.resume_quantite 
          ? Object.keys(result.resume_quantite) 
          : [result.category];
        setSelectedCategories(detectedCats);
        
        if (result.poids_estime_kg) {
          setWeight(result.poids_estime_kg.toFixed(2));
        }
      }
    } catch (e) {
      console.error("AI Error", e);
      setError("L'analyse IA a échoué. Sélectionnez manuellement.");
    } finally {
      setStep('form');
    }
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
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
      let latitude = 5.30966;
      let longitude = -4.01266;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch { /* GPS non dispo */ }

      const lot = await wasteService.createLot({
        category: selectedCategories[0].toUpperCase(),
        weight_kg: parseFloat(weight) || 1,
        description: description || `Lot de ${selectedCategories.map(c => c).join(', ')}`,
        latitude,
        longitude,
      });

      if (photo) {
        await wasteService.uploadPhoto(lot.id, photo);
      }

      setStep('success');
    } catch (err: any) {
      let msg = "Erreur lors de la création du lot.";
      if (err.response?.data?.detail) {
        const d = err.response.data.detail;
        if (typeof d === 'string') msg = d;
        else if (Array.isArray(d) && d[0]?.msg) msg = d[0].msg;
        else msg = JSON.stringify(d);
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreColor = (s: number) => s >= 60 ? '#16a34a' : s >= 35 ? '#ca8a04' : '#dc2626';
  const scoreBg = (s: number) => s >= 60 ? '#f0fdf4' : s >= 35 ? '#fefce8' : '#fef2f2';
  const scoreBorder = (s: number) => s >= 60 ? '#bbf7d0' : s >= 35 ? '#fef08a' : '#fecaca';

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Scanner mes déchets</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <input 
          type="file" accept="image/*" capture="environment" className="hidden"
          ref={fileInputRef} onChange={handlePhotoCapture}
        />
        
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
              <button onClick={() => window.open(photoUrl || '', '_blank')} className="flex-1 flex flex-col items-center justify-center py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <ImageIcon size={20} className="text-gray-600 mb-1" />
                <span className="text-xs font-bold text-gray-700">Voir</span>
              </button>
              <button onClick={removePhoto} className="flex-1 flex flex-col items-center justify-center py-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <Trash2 size={20} className="text-red-600 mb-1" />
                <span className="text-xs font-bold text-red-700">Supprimer</span>
              </button>
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
            <div className="w-full space-y-4 text-left">
              <div className="h-4 bg-gray-200 rounded-full w-1/3 animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-5">
            
            {/* === Rapport IA === */}
            {aiResult && !aiResult.fallback_used && (
              <>
                {/* Score qualité */}
                <div style={{ background: scoreBg(aiResult.score_qualite || 0), borderColor: scoreBorder(aiResult.score_qualite || 0) }} className="rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} style={{ color: scoreColor(aiResult.score_qualite || 0) }} />
                      <span className="font-bold text-sm text-deep-forest">Score qualité du lot</span>
                    </div>
                    <span className="text-2xl font-black" style={{ color: scoreColor(aiResult.score_qualite || 0) }}>
                      {Math.round(aiResult.score_qualite || 0)}<span className="text-sm font-medium text-gray-500">/100</span>
                    </span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ 
                        width: `${Math.min(aiResult.score_qualite || 0, 100)}%`,
                        backgroundColor: scoreColor(aiResult.score_qualite || 0)
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    État : <span className="font-bold capitalize">{aiResult.etat || 'inconnu'}</span>
                    {' · '}
                    {aiResult.total_items || 0} objet{(aiResult.total_items || 0) > 1 ? 's' : ''} détecté{(aiResult.total_items || 0) > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Détail par catégorie */}
                {aiResult.resume_quantite && Object.keys(aiResult.resume_quantite).length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={16} className="text-deep-forest" />
                      <span className="font-bold text-sm text-deep-forest">Composition détectée</span>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(aiResult.resume_quantite).map(([cat, qte]) => {
                        const catInfo = CATEGORIES.find(c => c.id === cat);
                        const poidsKg = aiResult.poids_par_categorie_kg?.[cat];
                        const total = Object.values(aiResult.resume_quantite as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                        const pct = total > 0 ? Math.round(((qte as number) / total) * 100) : 0;
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{catInfo?.label || cat}</span>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="font-bold text-deep-forest">{qte as number}</span>
                                {poidsKg != null && <span>~{poidsKg.toFixed(2)} kg</span>}
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-1.5 rounded-full bg-ecoloop-green transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Collectabilité */}
                <div className={`rounded-xl p-3 flex gap-3 border ${aiResult.collectable ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  {aiResult.collectable 
                    ? <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
                    : <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                  }
                  <div>
                    <p className={`text-xs font-bold ${aiResult.collectable ? 'text-green-800' : 'text-orange-800'}`}>
                      {aiResult.collectable ? 'Lot collectible' : 'Lot à améliorer'}
                    </p>
                    <p className="text-xs text-gray-600">{aiResult.raison_collectabilite}</p>
                  </div>
                </div>

                {/* Recommandations */}
                {aiResult.recommandations && aiResult.recommandations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Info size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-900">Recommandations</span>
                    </div>
                    {aiResult.recommandations.map((rec: string, i: number) => (
                      <p key={i} className="text-xs text-blue-700 leading-relaxed">• {rec}</p>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pas de résultat IA */}
            {(!aiResult || aiResult.fallback_used) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-amber-900 font-bold mb-1">Analyse limitée</p>
                  <p className="text-xs text-amber-700">L'IA n'a pas pu identifier clairement les déchets. Sélectionnez manuellement ci-dessous.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            {/* Sélection catégories */}
            <div className="space-y-3">
              <label className="font-bold text-deep-forest text-sm">Que contient votre lot ?</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                      selectedCategories.includes(cat.id) 
                        ? 'bg-ecoloop-green text-white border-ecoloop-green shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {selectedCategories.includes(cat.id) && <CheckCircle2 size={14} className="inline mr-1.5 -mt-0.5" />}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Poids */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-deep-forest text-sm">Poids estimé (kg)</label>
                {aiResult?.poids_estime_kg && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                    IA : ~{aiResult.poids_estime_kg.toFixed(2)} kg
                  </span>
                )}
              </div>
              <input 
                type="number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors font-medium text-deep-forest"
                min="0.1" step="0.1" required
                value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="Ex: 2.5"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="font-bold text-deep-forest text-sm">Description (Optionnel)</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors resize-none h-24 font-medium text-deep-forest"
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Précisions utiles pour le collecteur..."
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 font-bold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
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
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-200">
              <CheckCircle2 size={48} className="text-ecoloop-green" />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Votre lot est publié</h3>
            <p className="text-text-secondary mb-8">Le collecteur le plus proche vient d'être notifié.</p>
            <div className="w-full space-y-3">
              <button onClick={() => navigate('/producer/collections')} className="btn-primary w-full py-4 text-lg">
                Suivre ma collecte
              </button>
              <button onClick={() => navigate('/household/dashboard')} className="w-full py-4 text-lg font-bold text-deep-forest bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
