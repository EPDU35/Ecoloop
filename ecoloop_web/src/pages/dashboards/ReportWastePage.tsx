import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Loader2, CheckCircle2, MapPin, AlertTriangle, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ReportWastePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'photo' | 'gps' | 'form' | 'submitting' | 'success'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fetchLocation = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address;
        const parts = [
          addr?.road || addr?.pedestrian || addr?.neighbourhood || '',
          addr?.suburb || addr?.city_district || addr?.quarter || '',
          addr?.city || addr?.town || addr?.village || '',
          addr?.state || '',
        ].filter(Boolean);
        return parts.join(', ') || data.display_name || 'Position trouvée';
      }
    } catch { /* silently fail */ }
    return `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
  };

  const requestGPS = async () => {
    setGpsLoading(true);
    setGpsError(false);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true, timeout: 15000, maximumAge: 0 
        });
      });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      const name = await fetchLocation(pos.coords.latitude, pos.coords.longitude);
      setLocationName(name);
    } catch {
      setGpsError(true);
      setLocationName('Position non disponible — vérifiez vos paramètres GPS');
    } finally {
      setGpsLoading(false);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoUrl(URL.createObjectURL(file));
      
      // Récupérer la position GPS automatiquement
      setStep('gps');
      await requestGPS();
      setStep('form');
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removePhoto = () => {
    setPhotoUrl(null);
    setCoords(null);
    setLocationName('');
    setStep('photo');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation d'envoi au serveur (en production → POST /api/v1/reports)
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Signaler un dépotoir</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoCapture} />
        
        {/* ÉTAPE 1 : Prendre la photo */}
        {step === 'photo' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-12">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center mb-8 relative hover:bg-gray-200 transition-colors cursor-pointer" onClick={triggerFileInput}>
              <Camera size={48} className="text-gray-400 mb-4" />
              <h3 className="font-bold text-deep-forest text-lg mb-2">Prendre en photo le dépotoir</h3>
              <p className="text-sm text-text-secondary">Prenez une photo claire du dépôt sauvage. Votre position sera localisée automatiquement.</p>
            </div>
            <button className="btn-primary w-full py-4 text-lg" onClick={triggerFileInput}>
              Ouvrir la caméra
            </button>
          </div>
        )}

        {/* ÉTAPE 2 : Récupération GPS */}
        {step === 'gps' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="absolute inset-0 border-4 border-orange-200 border-t-orange-500 rounded-full" />
              <MapPin className="text-orange-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Localisation en cours</h3>
            <p className="text-orange-600 font-medium">Récupération de votre position GPS...</p>
          </div>
        )}

        {/* ÉTAPE 3 : Formulaire */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-5">
            
            {/* Photo capturée */}
            {photoUrl && (
              <div className="relative">
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 bg-black">
                  <img src={photoUrl} alt="Photo du dépotoir" className="w-full h-full object-contain" />
                </div>
                <div className="flex justify-center gap-3 mt-3">
                  <button type="button" onClick={triggerFileInput} className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700">
                    <RefreshCw size={16} /> Changer
                  </button>
                  <button type="button" onClick={removePhoto} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold text-red-700">
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              </div>
            )}

            {/* Localisation */}
            <div className={`rounded-xl p-4 flex gap-3 border ${gpsError ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <MapPin className={`shrink-0 mt-0.5 ${gpsError ? 'text-amber-600' : 'text-green-600'}`} size={20} />
              <div className="flex-1">
                <p className="text-sm text-deep-forest font-bold mb-0.5">
                  {gpsError ? 'GPS non disponible' : 'Position localisée'}
                </p>
                <p className="text-xs text-gray-600">{locationName || 'Chargement...'}</p>
                {coords && (
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                )}
                {gpsError && (
                  <button type="button" onClick={requestGPS} className="mt-2 text-xs text-amber-700 font-bold underline">
                    Réessayer la localisation
                  </button>
                )}
              </div>
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <label className="font-bold text-deep-forest text-sm">Commentaire (Facultatif)</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:bg-white transition-colors resize-none h-24 font-medium text-deep-forest"
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Tas d'ordures au bord de la route, odeurs, caniveau bouché..."
              />
            </div>

            {/* Boutons */}
            <div className="pt-4 flex gap-3 pb-24">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 font-bold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
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

        {/* ÉTAPE 4 : Succès */}
        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-200">
              <CheckCircle2 className="text-ecoloop-green" size={40} />
            </div>
            <h3 className="font-bold text-2xl text-deep-forest mb-2">Signalement envoyé</h3>
            <p className="text-text-secondary mb-8">La mairie a été alertée. Merci pour votre vigilance !</p>
            <button onClick={() => navigate('/household/dashboard')} className="btn-primary w-full py-4 text-lg">
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
