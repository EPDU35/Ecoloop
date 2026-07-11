import { ArrowLeft, ScanLine, Network, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AiCenterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-deep-forest">EcoLoop AI Engine</h1>
            <p className="text-xs text-text-secondary">Au cœur de notre infrastructure technologique</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-12">
        
        {/* VISION IA */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ScanLine size={24} />
            </div>
            <h2 className="font-heading text-2xl font-bold text-deep-forest">Vision IA</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p className="text-text-secondary mb-8">Classification automatique des déchets à partir d'une simple photo.</p>
            
            <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
              <div className="w-40 h-40 bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=400&auto=format&fit=crop" alt="Bouteilles plastique" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col items-center text-blue-500">
                <ArrowLeft size={24} className="rotate-90 md:rotate-0 mb-2 md:mb-0 md:mr-2 hidden" />
                <div className="text-sm font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 md:mb-0">Modèle Vision</div>
                <ArrowLeft size={24} className="rotate-90 md:rotate-180 mt-2 md:mt-0 md:ml-2" />
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md min-w-[200px]">
                <h3 className="font-bold text-xl mb-1">PET plastique</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-black">94%</span>
                  <span className="text-blue-200 text-sm">Confiance</span>
                </div>
                <div className="bg-blue-700/50 rounded-lg p-2 text-sm">
                  Qualité : <span className="font-bold text-green-300">Haute</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MATCHING IA */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-50 text-ecoloop-green rounded-xl flex items-center justify-center">
              <Network size={24} />
            </div>
            <h2 className="font-heading text-2xl font-bold text-deep-forest">Matching IA</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p className="text-text-secondary mb-6">Algorithme d'affectation dynamique des missions pour minimiser l'empreinte carbone et maximiser l'efficacité.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-deep-forest">Mission recommandée</h4>
                  <p className="text-sm text-text-secondary">Collecteur : Koffi</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-text-secondary mb-1">Score global</span>
                  <span className="text-3xl font-black text-ecoloop-green">94%</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-widest">Calcul du score</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-medium">Distance</span>
                    <span className="font-bold text-ecoloop-green">+35</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-medium">Capacité restante</span>
                    <span className="font-bold text-ecoloop-green">+25</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-medium">Disponibilité</span>
                    <span className="font-bold text-ecoloop-green">+20</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-medium">Optimisation du trajet</span>
                    <span className="font-bold text-ecoloop-green">+14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IA PREDICTIVE */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <MapIcon size={24} />
            </div>
            <h2 className="font-heading text-2xl font-bold text-deep-forest">IA Prédictive</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p className="text-text-secondary mb-8">
              Notre moteur prédictif estime les zones à risque grâce aux historiques de collecte, aux données terrain et aux paramètres environnementaux (météo, événements).
            </p>
            
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-2xl p-8 max-w-lg w-full relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
                
                <h3 className="font-bold text-xl mb-6 relative z-10">Analyse de Zone : Cocody</h3>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-purple-200">Risque de saturation (dépôts sauvages)</span>
                      <span className="font-bold text-orange-400">72%</span>
                    </div>
                    <div className="w-full bg-purple-950 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                    <span className="block text-sm text-purple-200 mb-1">Prévision critique</span>
                    <span className="font-heading text-2xl font-bold">Dans 5 jours</span>
                    <p className="text-xs text-purple-300 mt-2">Action recommandée : Augmenter la fréquence de collecte dans le secteur Riviera 2.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
