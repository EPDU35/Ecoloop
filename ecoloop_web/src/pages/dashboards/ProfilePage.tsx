import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Award, MapPin } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      <div className="bg-deep-forest text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="max-w-md mx-auto text-center mt-4">
          <h1 className="font-heading text-3xl font-bold mb-2">Mon Profil</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center mb-6 relative">
          <div className="w-24 h-24 bg-ecoloop-green text-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg text-3xl font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <h2 className="font-heading text-2xl font-bold text-deep-forest mb-1">{user?.full_name || 'Utilisateur'}</h2>
          <p className="text-text-secondary mb-4 capitalize">{user?.role || 'Membre'}</p>
          
          <div className="inline-flex items-center gap-1 bg-green-50 text-ecoloop-green px-3 py-1 rounded-full text-sm font-bold">
            <ShieldCheck size={16} /> Compte vérifié
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Award size={24} />
            </div>
            <div>
              <span className="font-bold text-deep-forest block">Niveau Argent</span>
              <span className="text-sm text-text-secondary">Encore 50 pts pour l'Or</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <span className="font-bold text-deep-forest block">Zone d'activité</span>
              <span className="text-sm text-text-secondary">Abidjan, Cocody</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
