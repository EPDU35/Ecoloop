import { useEffect, useState } from 'react';
import { Map as MapIcon, RefreshCw } from 'lucide-react';
import { dashboardService } from '@/services/api/dashboardService';
import { aiService } from '@/services/api/aiService';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function MunicipalityDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'zones'>('overview');

  const [stats, setStats] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [dashStats, risks] = await Promise.all([
        dashboardService.getMunicipalityOverview(),
        aiService.getZonesRisk('Abobo'),
      ]);
      setStats(dashStats);
      setRiskData(risks);
    } catch (err: any) {
      setError("Impossible de charger les données du territoire.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="page-container text-center mt-8">
        Chargement du Centre de Commandement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container theme-municipality">
        <ErrorState title="Erreur réseau" message={error} />
      </div>
    );
  }

  const hasStats = !!stats;
  const hasRisk = !!riskData;

  return (
    <div className="page-container theme-municipality">
      <div className="page-header-actions mb-8 border-b pb-6">
        <div>
          <h1 className="page-title text-3xl font-bold flex items-center gap-3">
            <MapIcon className="text-warning" size={32} />
            EcoLoop Intelligence Center
          </h1>
          <p className="page-subtitle text-secondary text-lg mt-2">
            Supervision territoriale et prévisions analytiques
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary bg-gray-900 text-white hover:bg-gray-800 border-none flex items-center gap-2 shadow-sm"
            onClick={fetchData}
          >
            <RefreshCw size={18} /> Actualiser
          </button>
        </div>
      </div>

      {/* KPI Global */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <span className="text-sm text-secondary block mb-1">Tonnes Recyclées</span>
          <span className="text-2xl font-bold">{stats?.total_lots ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <span className="text-sm text-secondary block mb-1">Acteurs Actifs</span>
          <span className="text-2xl font-bold">{stats?.active_collectors ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <span className="text-sm text-secondary block mb-1">ÉcoScore Moyen</span>
          <span className="text-2xl font-bold">{stats?.avg_ecoscore ?? '—'}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <span className="text-sm text-secondary block mb-1">Taux de Collecte</span>
          <span className="text-2xl font-bold">{stats?.collection_rate ?? '—'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-warning text-warning'
              : 'border-transparent text-secondary hover:text-warning'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'zones'
              ? 'border-warning text-warning'
              : 'border-transparent text-secondary hover:text-warning'
          }`}
          onClick={() => setActiveTab('zones')}
        >
          Carte des Zones
        </button>
      </div>

      {/* TAB: Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="fade-in-up">
          {hasRisk ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card border rounded-xl shadow-sm bg-white p-6">
                <h3 className="font-bold text-lg mb-4">Prévisions par Zone</h3>
                <p className="text-sm text-secondary mb-2">
                  Zone : <span className="font-semibold">{riskData.zone}</span>
                </p>
                <p className="text-sm text-secondary">
                  Risque estimé : <span className="font-semibold">{riskData.risk_percentage ?? '—'}%</span>
                </p>
                {riskData.recommendation && (
                  <p className="text-sm mt-4 text-secondary">{riskData.recommendation}</p>
                )}
              </div>

              <div className="card border rounded-xl shadow-sm bg-white p-6">
                <h3 className="font-bold text-lg mb-4">Détails du Risque</h3>
                {riskData.factors && riskData.factors.length > 0 ? (
                  <ul className="space-y-2">
                    {riskData.factors.map((f: string, i: number) => (
                      <li key={i} className="text-sm text-secondary">• {f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-secondary">Aucun facteur de risque disponible.</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Aucune donnée de risque"
              message="Les prévisions analytiques ne sont pas encore disponibles."
            />
          )}

          {hasStats && stats?.recent_activity && (
            <div className="card border rounded-xl shadow-sm bg-white p-6 mt-6">
              <h3 className="font-bold text-lg mb-4">Activité Récente</h3>
              {stats.recent_activity.length > 0 ? (
                <ul className="space-y-2">
                  {stats.recent_activity.map((item: any, i: number) => (
                    <li key={i} className="text-sm text-secondary">
                      {item.description ?? JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-secondary">Aucune activité récente.</p>
              )}
            </div>
          )}

          {!hasStats && !hasRisk && (
            <EmptyState
              title="Aucune donnée disponible"
              message="Les données du territoire ne sont pas encore chargées."
            />
          )}
        </div>
      )}

      {/* TAB: Carte des Zones */}
      {activeTab === 'zones' && (
        <div className="fade-in-up">
          <div
            className="card h-[600px] rounded-xl overflow-hidden border shadow-sm relative bg-gray-100 flex items-center justify-center"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="text-center z-10 p-8 bg-white/90 backdrop-blur rounded-2xl border max-w-md">
              <MapIcon size={48} className="text-warning mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-xl mb-2">Carte Thermique (Heatmap)</h3>
              <p className="text-secondary text-sm">
                En mode production, Leaflet affichera ici une heatmap dynamique des dépôts
                sauvages et de la fréquence de collecte par secteur, superposée à la carte d'Abidjan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
