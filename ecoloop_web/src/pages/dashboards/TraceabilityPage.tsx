import { ArrowLeft, CheckCircle2, Clock, MapPin, Factory, Truck, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMyWastes } from '@/hooks/useApi';
import { ApiErrorDisplay } from '@/components/feedback/ApiErrorDisplay';
import { safeArray, safeString } from '@/utils/parseResponse';

const STATUS_ORDER = ['DISPONIBLE', 'RESERVE', 'EN_ROUTE', 'COLLECTE', 'QUALITY_CHECK', 'MARKETPLACE', 'VENDU', 'RECYCLE', 'PAYE'];

function getStatusSteps(status: string) {
  const steps = [
    { label: 'Lot publié', icon: <CheckCircle2 size={24} />, statusKey: 'DISPONIBLE', desc: 'Signalé par le producteur' },
    { label: 'Réservé', icon: <Clock size={24} />, statusKey: 'RESERVE', desc: 'Pris en charge par un collecteur' },
    { label: 'Collecte effectuée', icon: <Truck size={24} />, statusKey: 'COLLECTE', desc: 'Transport vers le point de regroupement' },
    { label: 'Centre de tri', icon: <MapPin size={24} />, statusKey: 'QUALITY_CHECK', desc: 'Contrôle qualité et pureté' },
    { label: 'Marketplace', icon: <Factory size={24} />, statusKey: 'MARKETPLACE', desc: 'Disponible pour les industriels' },
    { label: 'Recyclé', icon: <Check size={24} />, statusKey: 'RECYCLE', desc: 'Impact enregistré' },
  ];

  const currentIdx = STATUS_ORDER.indexOf(status);
  return steps.map(step => ({
    ...step,
    done: STATUS_ORDER.indexOf(step.statusKey) <= currentIdx,
  }));
}

export function TraceabilityPage() {
  const navigate = useNavigate();
  const { data: wastes, isLoading, isError, error, refetch } = useMyWastes();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-ecoloop-green" size={32} />
      </div>
    );
  }

  if (isError) {
    return <ApiErrorDisplay error={error} onRetry={() => refetch()} context="Traçabilité" />;
  }

  const lots = safeArray<any>(wastes, []);
  const latestLot = lots.length > 0 ? lots[0] : null;

  if (!latestLot) {
    return (
      <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
        <div className="bg-white border-b border-gray-100 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 px-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-deep-forest" />
            </button>
            <h1 className="font-heading text-xl font-bold text-deep-forest">Traçabilité complète</h1>
          </div>
        </div>
        <div className="max-w-xl mx-auto px-6 mt-16 text-center">
          <p className="text-text-secondary">Aucun lot à tracer pour le moment. Publiez un lot pour commencer.</p>
        </div>
      </div>
    );
  }

  const lotId = safeString(latestLot.id, '').slice(0, 8).toUpperCase();
  const lotCategory = safeString(latestLot.category, 'PLASTIQUE');
  const lotStatus = safeString(latestLot.status, 'DISPONIBLE');
  const steps = getStatusSteps(lotStatus);

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-deep-forest">Traçabilité complète</h1>
            <p className="text-xs text-text-secondary">Lot {lotId} ({lotCategory})</p>
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
                    {step.done && <span className="text-sm font-bold text-ecoloop-green bg-green-50 px-2 py-0.5 rounded-md">✓</span>}
                  </div>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other lots */}
        {lots.length > 1 && (
          <div className="mt-6">
            <h3 className="font-bold text-deep-forest mb-3">Autres lots</h3>
            <div className="space-y-3">
              {lots.slice(1, 6).map((lot: any) => (
                <div key={lot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-deep-forest text-sm">{lot.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-xs text-text-secondary ml-2">{lot.category}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    lot.status === 'RECYCLE' ? 'bg-green-50 text-green-600' :
                    lot.status === 'DISPONIBLE' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>{lot.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
