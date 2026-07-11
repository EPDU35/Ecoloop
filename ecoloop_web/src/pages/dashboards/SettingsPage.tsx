import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Globe, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      <div className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
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
          
          <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                <Globe size={20} />
              </div>
              <span className="font-bold text-deep-forest">Langue</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="text-sm">Français</span>
              <ChevronRight size={20} />
            </div>
          </button>

          <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Bell size={20} />
              </div>
              <span className="font-bold text-deep-forest">Notifications</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="text-sm bg-ecoloop-green text-white px-2 py-0.5 rounded text-xs font-bold">Activé</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-2">Sécurité</h3>
          
          <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:border-gray-300 transition-colors">
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
          onClick={logout}
          className="w-full mt-8 bg-red-50 text-red-600 rounded-2xl p-5 flex items-center justify-center gap-2 font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          Déconnexion
        </button>

      </div>
    </div>
  );
}
