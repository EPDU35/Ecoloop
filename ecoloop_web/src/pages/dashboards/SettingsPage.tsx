import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Globe, LogOut, Moon, MapPin, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Switch Component
const Switch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ecoloop-green focus:ring-offset-2 ${checked ? 'bg-ecoloop-green' : 'bg-gray-200'}`}
    aria-label="Toggle"
    role="switch"
    aria-checked={checked}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Local state with localStorage persistence
  const [lang, setLang] = useState(localStorage.getItem('ecoloop_lang') || 'fr');
  const [notifs, setNotifs] = useState(localStorage.getItem('ecoloop_notifs') !== 'false');
  const [geo, setGeo] = useState(localStorage.getItem('ecoloop_geo') === 'true');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('ecoloop_dark') === 'true');

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Update localStorage when state changes
  useEffect(() => { localStorage.setItem('ecoloop_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('ecoloop_notifs', String(notifs)); }, [notifs]);
  useEffect(() => { localStorage.setItem('ecoloop_geo', String(geo)); }, [geo]);
  useEffect(() => { localStorage.setItem('ecoloop_dark', String(darkMode)); }, [darkMode]);

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      <div className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-deep-forest"
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="max-w-md mx-auto text-center mt-4">
          <h1 className="font-heading text-2xl font-bold text-deep-forest mb-2">Réglages</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-6">
        
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-2">Préférences</h3>
          
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                <Globe size={20} />
              </div>
              <label htmlFor="lang-select" className="font-bold text-deep-forest cursor-pointer">Langue</label>
            </div>
            <div className="relative">
              <select 
                id="lang-select"
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="appearance-none bg-transparent font-medium text-text-secondary text-sm pr-8 focus:outline-none cursor-pointer"
                aria-label="Sélectionner la langue"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ba">Baoulé</option>
                <option value="di">Dioula</option>
                <option value="be">Bété</option>
              </select>
              <ChevronRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Bell size={20} />
              </div>
              <span className="font-bold text-deep-forest">Notifications</span>
            </div>
            <Switch checked={notifs} onChange={setNotifs} />
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <span className="font-bold text-deep-forest">Géolocalisation</span>
            </div>
            <Switch checked={geo} onChange={setGeo} />
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center">
                <Moon size={20} />
              </div>
              <span className="font-bold text-deep-forest">Mode sombre</span>
            </div>
            <Switch checked={darkMode} onChange={setDarkMode} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-2">Sécurité</h3>
          
          <button 
            onClick={() => setShowPrivacy(true)}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:border-gray-300 hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ecoloop-green"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                <Lock size={20} />
              </div>
              <span className="font-bold text-deep-forest">Confidentialité</span>
            </div>
            <ChevronRight className="text-text-secondary" size={20} />
          </button>
        </div>

        <button 
          onClick={() => setShowLogout(true)}
          className="w-full mt-8 bg-red-50 text-red-600 rounded-2xl p-5 flex items-center justify-center gap-2 font-bold hover:bg-red-100 transition-colors active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut size={20} />
          Déconnexion
        </button>

      </div>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center items-center sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-2xl flex flex-col max-h-[90vh] shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white sm:rounded-t-2xl z-10">
                <h2 className="font-bold text-xl text-deep-forest">Confidentialité</h2>
                <button onClick={() => setShowPrivacy(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <button className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 font-bold text-deep-forest transition-colors">Politique de confidentialité</button>
                <button className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 font-bold text-deep-forest transition-colors">Conditions d'utilisation</button>
                <button className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 font-bold text-deep-forest transition-colors">Gestion des données personnelles</button>
                
                <div className="mt-8 p-4 border border-red-100 bg-red-50 rounded-xl">
                  <h4 className="font-bold text-red-600 mb-2">Zone dangereuse</h4>
                  <p className="text-sm text-red-500 mb-4 opacity-90">La suppression de votre compte est irréversible.</p>
                  <button className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogout && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-500" size={32} />
              </div>
              <h3 className="font-bold text-2xl text-deep-forest mb-2">Déconnexion</h3>
              <p className="text-text-secondary mb-8">Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogout(false)} 
                  className="flex-1 py-4 font-bold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
                >
                  Annuler
                </button>
                <button 
                  onClick={logout} 
                  className="flex-1 py-4 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
