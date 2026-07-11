import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Truck, PackageCheck, AlertTriangle } from 'lucide-react';

const TABS = ['Toutes', 'En attente', 'En cours', 'Terminées', 'Annulées'];

// Mock Data
const MOCK_COLLECTIONS = [
  {
    id: 'COL-8472',
    date: '12 Jui 2026, 14:30',
    types: ['PET', 'Carton'],
    weight: '15 kg',
    status: 'Terminées',
    reward: '450 FCFA',
    collector: 'Koffi Express',
    address: 'Cocody Riviera 2',
    timeline: [
      { label: 'Publié', done: true },
      { label: 'Collecteur trouvé', done: true },
      { label: 'Collecte en cours', done: true },
      { label: 'Terminée', done: true }
    ]
  },
  {
    id: 'COL-8473',
    date: 'Aujourd\'hui, 09:15',
    types: ['Aluminium'],
    weight: '5 kg',
    status: 'En attente',
    reward: '250 FCFA',
    collector: '-',
    address: 'Cocody Riviera 2',
    timeline: [
      { label: 'Publié', done: true },
      { label: 'Collecteur trouvé', done: false },
      { label: 'Collecte en cours', done: false },
      { label: 'Terminée', done: false }
    ]
  }
];

export function MyCollectionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Toutes');

  const filteredCollections = MOCK_COLLECTIONS.filter(c => 
    activeTab === 'Toutes' || c.status === activeTab
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Terminées': return 'text-ecoloop-green bg-green-50';
      case 'En attente': return 'text-orange-600 bg-orange-50';
      case 'En cours': return 'text-blue-600 bg-blue-50';
      case 'Annulées': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Terminées': return <CheckCircle2 size={16} />;
      case 'En attente': return <Clock size={16} />;
      case 'En cours': return <Truck size={16} />;
      case 'Annulées': return <AlertTriangle size={16} />;
      default: return <PackageCheck size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <h1 className="font-heading text-xl font-bold text-deep-forest">Mes collectes</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-2 pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-deep-forest text-white' 
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <PackageCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-bold text-lg text-deep-forest mb-2">Aucune collecte trouvée</h3>
            <p className="text-text-secondary text-sm mb-6 px-6">
              {activeTab === 'Toutes' 
                ? "Vous n'avez encore publié aucun lot. Déclarez votre premier lot pour commencer à recycler." 
                : `Aucune collecte avec le statut "${activeTab}".`}
            </p>
            {activeTab === 'Toutes' && (
              <button onClick={() => navigate('/producer/new-lot')} className="btn-primary px-8 py-3 mx-auto">
                Déclarer un lot
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCollections.map(col => (
              <div key={col.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400">{col.id}</span>
                    <h3 className="font-bold text-deep-forest text-lg">{col.types.join(' • ')}</h3>
                    <p className="text-sm text-text-secondary">{col.weight}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(col.status)}`}>
                    {getStatusIcon(col.status)}
                    {col.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-6">
                  <div>
                    <span className="text-gray-400 block text-xs">Date</span>
                    <span className="font-medium text-deep-forest">{col.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Collecteur</span>
                    <span className="font-medium text-deep-forest">{col.collector}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Adresse</span>
                    <span className="font-medium text-deep-forest truncate block" title={col.address}>{col.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Récompense</span>
                    <span className="font-bold text-ecoloop-green">{col.reward}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center relative">
                    {/* Line behind */}
                    <div className="absolute top-3 left-4 right-4 h-0.5 bg-gray-100 -z-10"></div>
                    
                    {col.timeline.map((step, idx) => (
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
