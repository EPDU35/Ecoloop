import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, MapPin, Clock, FileText, CheckSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback';

export function MunicipalityDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Fake state to toggle a report's status in the demo
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) return <LoadingState fullPage message="Chargement des données de la commune..." />;

  const reports = [
    {
      id: 'REP-01',
      date: 'Aujourd\'hui, 08:30',
      address: 'Carrefour Duncan, Cocody',
      description: 'Dépôt sauvage de gravats et plastiques bloquant le trottoir.',
      status: resolvedIds.includes('REP-01') ? 'Résolu' : 'En attente',
      reporter: 'Citoyen Anonyme',
      img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&q=80'
    },
    {
      id: 'REP-02',
      date: 'Hier, 14:15',
      address: 'Riviera Palmeraie, Rue 12',
      description: 'Poubelles non ramassées depuis 3 jours, odeur nauséabonde.',
      status: resolvedIds.includes('REP-02') ? 'Résolu' : 'En cours',
      reporter: 'K. Marc',
      img: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=400&q=80'
    },
    {
      id: 'REP-03',
      date: 'Hier, 09:10',
      address: 'Treichville, Avenue 16',
      description: 'Accumulation de cartons près du marché.',
      status: 'Résolu',
      reporter: 'A. Koffi',
      img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80'
    }
  ];

  const pendingCount = reports.filter(r => r.status !== 'Résolu').length;
  const resolvedCount = reports.filter(r => r.status === 'Résolu').length;
  const totalCount = reports.length;

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      {/* Header Mairie */}
      <div className="bg-orange-600 text-white pt-12 pb-24 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Espace Mairie
          </div>
          <h1 className="font-heading text-4xl font-black tracking-tight">Gestion des Signalements</h1>
          <p className="opacity-90 mt-2 text-lg">Supervisez la propreté de votre commune grâce aux alertes citoyennes.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        
        {/* KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="md" className="border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase">Total Signalements</p>
              <p className="text-3xl font-black text-deep-forest">{totalCount}</p>
            </div>
          </Card>
          
          <Card padding="md" className="border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase">En attente / En cours</p>
              <p className="text-3xl font-black text-red-600">{pendingCount}</p>
            </div>
          </Card>

          <Card padding="md" className="border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase">Résolus</p>
              <p className="text-3xl font-black text-ecoloop-green">{resolvedCount}</p>
            </div>
          </Card>
        </div>

        <h2 className="font-heading text-2xl font-bold text-deep-forest mb-6">Derniers Signalements</h2>
        
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <img src={report.img} alt="Signalement" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    report.status === 'Résolu' ? 'bg-green-100 text-green-700' :
                    report.status === 'En cours' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-sm text-text-secondary flex items-center gap-1">
                    <Clock size={14} /> {report.date}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-deep-forest mb-2">{report.description}</h3>
                
                <div className="flex items-center gap-2 text-text-secondary mb-4">
                  <MapPin size={16} className="text-orange-500" />
                  <span className="font-medium text-sm">{report.address}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Signalé par: <strong>{report.reporter}</strong></span>
                  
                  {report.status !== 'Résolu' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 text-deep-forest hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setResolvedIds(prev => [...prev, report.id])}
                    >
                      <CheckSquare size={16} />
                      Marquer comme résolu
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
