import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, MapPin, Search } from 'lucide-react';

// Mock Data
const MOCK_REPORTS = [
  {
    id: 'REP-1042',
    date: 'Aujourd\'hui, 10:15',
    types: 'Plastiques et Organiques',
    status: 'Pris en charge',
    address: 'Carrefour Duncan, Cocody',
    timeline: [
      { label: 'Publié', done: true },
      { label: 'Pris en charge', done: true },
      { label: 'En cours', done: false },
      { label: 'Résolu', done: false }
    ]
  },
  {
    id: 'REP-1041',
    date: 'Hier, 16:45',
    types: 'Déchets de construction',
    status: 'Résolu',
    address: 'Riviera Palmeraie',
    timeline: [
      { label: 'Publié', done: true },
      { label: 'Pris en charge', done: true },
      { label: 'En cours', done: true },
      { label: 'Résolu', done: true }
    ]
  }
];

export function MyReportsPage() {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Résolu': return 'text-ecoloop-green bg-green-50';
      case 'Pris en charge': return 'text-blue-600 bg-blue-50';
      case 'Publié': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Résolu': return <CheckCircle2 size={16} />;
      case 'Pris en charge': return <Clock size={16} />;
      case 'Publié': return <AlertTriangle size={16} />;
      default: return <Search size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Mes signalements</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        {MOCK_REPORTS.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-bold text-lg text-deep-forest mb-2">Aucun signalement effectué</h3>
            <p className="text-text-secondary text-sm mb-6 px-6">
              Contribuez à rendre votre quartier plus propre en signalant les dépôts sauvages.
            </p>
            <button onClick={() => navigate('/producer/report')} className="btn-primary px-8 py-3 mx-auto flex items-center justify-center gap-2">
              <MapPin size={20} /> Signaler un dépôt
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_REPORTS.map(rep => (
              <div key={rep.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400">{rep.id}</span>
                    <h3 className="font-bold text-deep-forest text-lg">{rep.address}</h3>
                    <p className="text-sm text-text-secondary">{rep.types}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(rep.status)}`}>
                    {getStatusIcon(rep.status)}
                    {rep.status}
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-gray-400 block text-xs">Date du signalement</span>
                  <span className="font-medium text-deep-forest text-sm">{rep.date}</span>
                </div>

                {/* Timeline */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center relative">
                    {/* Line behind */}
                    <div className="absolute top-3 left-4 right-4 h-0.5 bg-gray-100 -z-10"></div>
                    
                    {rep.timeline.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step.done ? 'bg-ecoloop-green' : 'bg-gray-200'}`}>
                          {step.done && <CheckCircle2 size={12} strokeWidth={4} />}
                        </div>
                        <span className={`text-[10px] text-center w-16 leading-tight ${step.done ? 'font-bold text-deep-forest' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
