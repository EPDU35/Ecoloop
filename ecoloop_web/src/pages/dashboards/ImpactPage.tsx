import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TreePine, Droplets, CloudFog, Medal, Sparkles, Loader2 } from 'lucide-react';
import { useMyRewards, usePointsHistory } from '@/hooks/useApi';
import { ApiErrorDisplay } from '@/components/feedback/ApiErrorDisplay';
import { safeNumber, safeString, safeArray } from '@/utils/parseResponse';

export function ImpactPage() {
  const navigate = useNavigate();
  const { data: rewards, isLoading: loadingRewards, isError: isRewardsError, error: rewardsError, refetch: refetchRewards } = useMyRewards();
  const { data: history, isLoading: loadingHistory } = usePointsHistory();

  const isLoading = loadingRewards || loadingHistory;

  if (isRewardsError) {
    return <ApiErrorDisplay error={rewardsError} onRetry={() => refetchRewards()} context="Page d'impact" />;
  }

  const points = safeNumber(rewards?.points, 0);
  const level = safeString(rewards?.level, 'bronze');
  const totalKg = safeNumber(rewards?.total_kg_recycled, 0);
  const historyItems = safeArray<any>(history, []);

  // Compute environmental impact from real data
  const co2Avoided = totalKg * 0.65; // 0.65 kg CO2 per kg recycled
  const treesPreserved = Math.round(co2Avoided / 22); // 22 kg CO2 per tree/year
  const waterSaved = Math.round(totalKg * 83); // 83L per kg recycled
  const oilAvoided = Math.round(totalKg * 2.3); // 2.3L per kg recycled

  // Level progress
  const levelThresholds: Record<string, { next: string; max: number }> = {
    'bronze': { next: 'Argent', max: 500 },
    'argent': { next: 'Or', max: 1000 },
    'silver': { next: 'Or', max: 1000 },
    'or': { next: 'Platine', max: 2500 },
    'gold': { next: 'Platine', max: 2500 },
    'platine': { next: 'Diamant', max: 5000 },
    'platinum': { next: 'Diamant', max: 5000 },
  };
  const currentLevel = levelThresholds[level.toLowerCase()] || { next: 'Prochain niveau', max: 1000 };
  const progress = Math.min(100, (points / currentLevel.max) * 100);

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
        
        {/* Level badge */}
        <div className="bg-gradient-to-br from-ecoloop-green to-green-600 rounded-3xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-green-50 font-medium text-sm mb-1">Niveau actuel</p>
              <h2 className="text-3xl font-black flex items-center gap-2 capitalize">
                {level} <Sparkles size={24} className="text-yellow-300" />
              </h2>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
              <Medal size={36} className="text-white" />
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold mb-2 text-green-50">
              <span>{points} pts</span>
              <span>{currentLevel.max} pts ({currentLevel.next})</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Global Impact */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-deep-forest">Votre Impact Environnemental</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full">Ressources Sauvées</span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-ecoloop-green" size={32} />
            </div>
          ) : totalKg > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <TreePine size={24} className="text-ecoloop-green" />
                </div>
                <h4 className="font-black text-2xl text-deep-forest">{treesPreserved}</h4>
                <p className="text-xs font-bold text-text-secondary mt-1">Arbres préservés</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-3">
                  <Droplets size={24} className="text-white" />
                </div>
                <h4 className="font-black text-2xl text-deep-forest">{oilAvoided}</h4>
                <p className="text-xs font-bold text-text-secondary mt-1">L. Pétrole évités</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <Droplets size={24} className="text-blue-500" />
                </div>
                <h4 className="font-black text-2xl text-deep-forest">{waterSaved.toLocaleString()}</h4>
                <p className="text-xs font-bold text-text-secondary mt-1">L. Eau économisés</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <CloudFog size={24} className="text-gray-500" />
                </div>
                <h4 className="font-black text-2xl text-deep-forest">{co2Avoided >= 1000 ? `${(co2Avoided / 1000).toFixed(1)}` : co2Avoided.toFixed(1)}<span className="text-lg">{co2Avoided >= 1000 ? 't' : 'kg'}</span></h4>
                <p className="text-xs font-bold text-text-secondary mt-1">CO₂ évités</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-text-secondary text-sm">Commencez à recycler pour mesurer votre impact environnemental.</p>
            </div>
          )}
          <p className="text-xs text-center text-text-secondary mt-3">Basé sur vos {totalKg.toFixed(0)} kg recyclés</p>
        </div>

        {/* History */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-deep-forest mb-4">Dernières récompenses</h3>
          
          {historyItems.length > 0 ? (
            <div className="space-y-4">
              {historyItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <span className="font-black text-sm text-ecoloop-green">+{item.points}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-deep-forest">{item.reason}</h4>
                      <p className="text-xs text-text-secondary">
                        {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-ecoloop-green text-sm">+ {item.points} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">Aucune récompense pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
