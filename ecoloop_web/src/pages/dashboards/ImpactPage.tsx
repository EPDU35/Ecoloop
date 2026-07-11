import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TreePine, Droplets, CloudFog, Medal, Sparkles } from 'lucide-react';

export function ImpactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Mon Impact</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Header Badges */}
        <div className="bg-gradient-to-br from-ecoloop-green to-green-600 rounded-3xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-green-50 font-medium text-sm mb-1">Niveau actuel</p>
              <h2 className="text-3xl font-black flex items-center gap-2">
                Argent <Sparkles size={24} className="text-yellow-300" />
              </h2>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
              <Medal size={36} className="text-white" />
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold mb-2 text-green-50">
              <span>850 pts</span>
              <span>1000 pts (Or)</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-deep-forest">EcoLoop Impact Global</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full">Ressources Sauvées</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <TreePine size={24} className="text-ecoloop-green" />
              </div>
              <h4 className="font-black text-2xl text-deep-forest">125</h4>
              <p className="text-xs font-bold text-text-secondary mt-1">Arbres préservés</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-3">
                <Droplets size={24} className="text-white" />
              </div>
              <h4 className="font-black text-2xl text-deep-forest">340</h4>
              <p className="text-xs font-bold text-text-secondary mt-1">L. Pétrole évités</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <Droplets size={24} className="text-blue-500" />
              </div>
              <h4 className="font-black text-2xl text-deep-forest">12 500</h4>
              <p className="text-xs font-bold text-text-secondary mt-1">L. Eau économisés</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <CloudFog size={24} className="text-gray-500" />
              </div>
              <h4 className="font-black text-2xl text-deep-forest">2.4<span className="text-lg">t</span></h4>
              <p className="text-xs font-bold text-text-secondary mt-1">CO₂ évités</p>
            </div>
            
          </div>
          <p className="text-xs text-center text-text-secondary mt-3">Depuis le lancement de la plateforme</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-deep-forest mb-4">Dernières récompenses</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <span className="font-black text-sm text-ecoloop-green">+50</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-deep-forest">Lot de Plastique (15kg)</h4>
                  <p className="text-xs text-text-secondary">Il y a 2 jours</p>
                </div>
              </div>
              <span className="font-bold text-ecoloop-green text-sm">+ 50 pts</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <span className="font-black text-sm text-ecoloop-green">+20</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-deep-forest">Signalement Dépôt</h4>
                  <p className="text-xs text-text-secondary">Il y a 1 semaine</p>
                </div>
              </div>
              <span className="font-bold text-ecoloop-green text-sm">+ 20 pts</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
