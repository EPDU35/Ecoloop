import { Users, Package, TrendingUp, CloudFog, Banknote, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InvestorDashboard() {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Utilisateurs Actifs', value: '4 250', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Lots Valorisés', value: '12 840', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Tonnes Recyclées', value: '342 t', icon: TrendingUp, color: 'text-ecoloop-green', bg: 'bg-green-50' },
    { label: 'CO₂ Évité', value: '45.6 t', icon: CloudFog, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'Revenus Générés (MRR)', value: '18M FCFA', icon: Banknote, color: 'text-orange-500', bg: 'bg-orange-50' }
  ];

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-deep-forest text-white pt-12 pb-20 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Investor Relations</h1>
            <p className="text-gray-300 mt-1">Données de traction en temps réel (Mode Simulation)</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 space-y-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-14 h-14 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center shrink-0`}>
                <metric.icon size={28} />
              </div>
              <div>
                <span className="block text-sm text-text-secondary font-bold mb-1">{metric.label}</span>
                <span className="font-heading text-2xl font-black text-deep-forest">{metric.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Growth Chart Placeholder */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-deep-forest">Croissance du volume mensuel (Tonnes)</h3>
            <span className="text-sm font-bold text-ecoloop-green bg-green-50 px-3 py-1 rounded-full">+ 24% MoM</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-200 pb-2">
            {[45, 52, 68, 85, 120, 160].map((h, i) => (
              <div key={i} className="w-full bg-gradient-to-t from-ecoloop-green to-green-300 rounded-t-lg" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-bold">
            <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
