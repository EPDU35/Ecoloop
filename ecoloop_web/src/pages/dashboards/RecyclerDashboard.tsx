import { useEffect, useState } from 'react';
import { PackageOpen, ArrowRight, FileText, Clock, TrendingUp } from 'lucide-react';
import { LoadingState } from '@/components/feedback';

export function RecyclerDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) return <LoadingState fullPage message="Chargement du stock en temps réel..." />;

  // Mock data for impact/demo
  const stocks = [
    { name: 'Plastique PET', quantity: '12.5 T', trend: '+18%' },
    { name: 'Plastique HDPE', quantity: '4.2 T', trend: '+5%' },
    { name: 'Carton', quantity: '28.0 T', trend: '-2%' },
    { name: 'Métal / Alu', quantity: '1.8 T', trend: '+12%' },
    { name: 'Verre', quantity: '8.4 T', trend: '+0%' }
  ];

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header Impactful */}
      <div className="bg-purple-600 text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Approvisionnement Actif
            </div>
            <h1 className="font-heading text-3xl font-bold">Bonjour, Industriel</h1>
            <p className="opacity-90 mt-1">Sécurisez votre approvisionnement en matière première secondaire.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16">
        
        {/* STOCK DISPONIBLE AUJOURD'HUI */}
        <h2 className="font-heading text-xl font-bold text-white mb-4">Stock disponible aujourd'hui</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {stocks.map((stock) => (
            <div 
              key={stock.name}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between"
            >
              <span className="text-sm font-bold text-text-secondary mb-2">{stock.name}</span>
              <div>
                <span className="font-heading text-2xl font-extrabold text-purple-900 block">{stock.quantity}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${stock.trend.startsWith('+') ? 'text-ecoloop-green' : 'text-orange-500'}`}>
                  <TrendingUp size={12} /> {stock.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* GROS BOUTON COMMANDER */}
        <button 
          className="w-full bg-purple-900 text-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative overflow-hidden group hover:bg-purple-800 transition-colors"
        >
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
              <PackageOpen size={32} className="text-white" />
            </div>
            <div className="text-left">
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">Commander de la matière</h2>
              <p className="text-purple-200">Accéder à la marketplace B2B</p>
            </div>
          </div>
          <div className="relative z-10 bg-white/10 p-3 rounded-full group-hover:bg-white group-hover:text-purple-900 transition-colors">
            <ArrowRight size={24} />
          </div>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CERTIFICATS ESG */}
          <button className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center group hover:border-purple-300 transition-colors">
            <div className="w-16 h-16 bg-green-50 text-ecoloop-green rounded-full flex items-center justify-center mb-4 transition-transform">
              <FileText size={32} />
            </div>
            <h3 className="font-bold text-lg text-deep-forest mb-1">Certificats ESG</h3>
            <p className="text-sm text-text-secondary">Téléchargez vos rapports d'impact et de traçabilité</p>
          </button>

          {/* HISTORIQUE */}
          <button className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center group hover:border-purple-300 transition-colors">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform">
              <Clock size={32} />
            </div>
            <h3 className="font-bold text-lg text-deep-forest mb-1">Historique des commandes</h3>
            <p className="text-sm text-text-secondary">Suivez vos livraisons et factures passées</p>
          </button>
        </div>

      </div>
    </div>
  );
}
