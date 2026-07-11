import { ArrowLeft, CheckCircle2, Clock, MapPin, Factory, Truck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';

export function TraceabilityPage() {
  const navigate = useNavigate();
  const { demoStep } = useDemo();

  const steps = [
    { label: 'Lot ECO-00094 Publié', time: '14:02', icon: <CheckCircle2 size={24} />, done: demoStep >= 1, desc: 'Signalé par le Producteur' },
    { label: 'Mission Acceptée', time: '14:04', icon: <Clock size={24} />, done: demoStep >= 2, desc: 'Prise en charge par le Collecteur le plus proche' },
    { label: 'Collecte effectuée', time: '14:18', icon: <Truck size={24} />, done: demoStep >= 3, desc: 'Transport vers le point de regroupement' },
    { label: 'Arrivée Centre de tri', time: '14:52', icon: <MapPin size={24} />, done: demoStep >= 4, desc: 'Contrôle qualité et pureté' },
    { label: 'Disponible Marketplace', time: '15:10', icon: <Factory size={24} />, done: demoStep >= 4, desc: 'En attente d\'achat Industriel' },
    { label: 'Vendu & Recyclé', time: '15:34', icon: <Check size={24} />, done: demoStep >= 5, desc: 'Impact enregistré par la Mairie' }
  ];

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-deep-forest">Traçabilité complète</h1>
            <p className="text-xs text-text-secondary">Lot ECO-00094 (PET transparent)</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-heading text-xl font-bold mb-6 text-deep-forest border-b border-gray-100 pb-4">
            Historique du lot
          </h2>
          <div className="relative pl-4 space-y-8">
            <div className="absolute top-2 bottom-4 left-[27px] w-0.5 bg-gray-200"></div>
            
            {steps.map((step, idx) => (
              <div key={idx} className={`relative flex gap-6 items-start ${step.done ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${step.done ? 'bg-ecoloop-green text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step.icon}
                </div>
                <div className="pt-2 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold ${step.done ? 'text-deep-forest' : 'text-gray-500'}`}>{step.label}</h3>
                    {step.done && <span className="text-sm font-bold text-ecoloop-green bg-green-50 px-2 py-0.5 rounded-md">{step.time}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
