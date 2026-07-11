import { useEffect, useState } from 'react';
import { Map as MapIcon, RefreshCw, TrendingUp, Users, AlertTriangle, FileText } from 'lucide-react';
import { dashboardService } from '@/services/api/dashboardService';
import { aiService } from '@/services/api/aiService';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function MunicipalityDashboard() {
  const [activeTab, setActiveTab] = useState<'tdb' | 'zones' | 'alertes' | 'rapports'>('tdb');

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
      <div className="page-header-actions mb-8">
        <div>
          <h1 className="page-title text-3xl font-bold flex items-center gap-3">
            <MapIcon className="text-warning" size={32} />
            EcoLoop Intelligence Center
          </h1>
          <p className="page-subtitle text-secondary text-lg mt-2">
            Supervision territoriale et prévisions analytiques
          </p>
        </div>
        <button
          className="btn btn-primary bg-gray-900 text-white hover:bg-gray-800 border-none flex items-center gap-2 shadow-sm"
          onClick={fetchData}
        >
          <RefreshCw size={18} /> Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'tdb' ? 'border-warning text-warning' : 'border-transparent text-secondary hover:text-warning'}`}
          onClick={() => setActiveTab('tdb')}
        >
          Tableau de Bord
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'zones' ? 'border-warning text-warning' : 'border-transparent text-secondary hover:text-warning'}`}
          onClick={() => setActiveTab('zones')}
        >
          Carte des Zones
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'alertes' ? 'border-warning text-warning' : 'border-transparent text-secondary hover:text-warning'}`}
          onClick={() => setActiveTab('alertes')}
        >
          Alertes
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'rapports' ? 'border-warning text-warning' : 'border-transparent text-secondary hover:text-warning'}`}
          onClick={() => setActiveTab('rapports')}
        >
          Rapports
        </button>
      </div>

      {/* TAB: Tableau de Bord */}
      {activeTab === 'tdb' && (
        <div className="fade-in-up">
          {/* KPI Global */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-6 border-l-4 border-warning rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Tonnes Recyclées</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.total_lots ?? 0}</span>
                <TrendingUp className="text-warning opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-primary rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Acteurs Actifs</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.active_collectors ?? 0}</span>
                <Users className="text-primary opacity-50" size={24} />
              </div>
            </div>
            <div className="card p-6 border-l-4 border-accent rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">ÉcoScore Moyen</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.avg_ecoscore ?? '—'}</span>
                <span className="text-accent opacity-50 text-xl">pts</span>
              </div>
            </div>
            <div className="card p-6 border-l-4 border-info rounded-xl shadow-sm">
              <h3 className="text-secondary font-medium mb-1">Taux de Collecte</h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.collection_rate ?? '—'}</span>
                <span className="text-info opacity-50 text-xl">%</span>
              </div>
            </div>
          </div>

          {/* Risk Preview */}
          {hasRisk ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card border rounded-xl shadow-sm bg-white p-6">
                <h3 className="font-bold text-lg mb-4">Prévisions par Zone</h3>
                <p className="text-sm text-secondary mb-2">
                  Zone : <span className="font-semibold">{riskData?.zone ?? '—'}</span>
                </p>
                <p className="text-sm text-secondary">
                  Risque estimé : <span className="font-semibold">{riskData?.risk_score ?? '—'}%</span>
                </p>
                {riskData?.recommendation?.action && (
                  <p className="text-sm mt-4 text-secondary">
                    {riskData.recommendation.priority === 'URGENT' ? '🚨 ' : ''}
                    {riskData.recommendation.action}
                  </p>
                )}
              </div>

              <div className="card border rounded-xl shadow-sm bg-white p-6">
                <h3 className="font-bold text-lg mb-4">Détails du Risque</h3>
                {riskData?.reasons && riskData.reasons.length > 0 ? (
                  <ul className="space-y-2">
                    {riskData.reasons.map((f: string, i: number) => (
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
        </div>
      )}

      {/* TAB: Carte des Zones */}
      {activeTab === 'zones' && (
        <div className="fade-in-up">
          <div className="card h-[600px] rounded-xl overflow-hidden border shadow-sm relative bg-gray-100 flex items-center justify-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="text-center z-10 p-8 bg-white/90 backdrop-blur rounded-2xl border max-w-md">
              <MapIcon size={48} className="text-warning mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-xl mb-2">Carte Thermique (Heatmap)</h3>
              <p className="text-secondary text-sm">
                En mode production, Leaflet affichera ici une heatmap dynamique des dépôts
                sauvages et de la fréquence de collecte par secteur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Alertes */}
      {activeTab === 'alertes' && (
        <div className="fade-in-up">
          <h2 className="section-title mb-6">Alertes Territoriales</h2>

          {hasRisk && (riskData?.risk_score ?? 0) > 70 ? (
            <div className="space-y-4">
              <div className="card p-6 border-l-4 border-red-500 rounded-xl shadow-sm bg-red-50">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <h3 className="font-bold text-red-800">Risque Élevé — {riskData?.zone}</h3>
                </div>
                <p className="text-sm text-red-700">
                  Le risque de saturation est estimé à {riskData?.risk_score}%. Une intervention est recommandée.
                </p>
              </div>
              {riskData?.recommendation?.action && (
                <div className="card p-6 border-l-4 border-warning rounded-xl shadow-sm">
                  <h3 className="font-bold mb-2">Recommandation</h3>
                  <p className="text-sm text-secondary">
                    [{riskData.recommendation.priority}] {riskData.recommendation.action}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Aucune alerte active"
              message="Toutes les zones sont dans les normes pour le moment."
            />
          )}
        </div>
      )}

      {/* TAB: Rapports */}
      {activeTab === 'rapports' && (
        <div className="fade-in-up">
          <h2 className="section-title mb-6">Générer un Rapport</h2>

          <div className="card p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <select className="input flex-1 bg-white">
                <option>Toutes les périodes</option>
                <option>Cette semaine</option>
                <option>Ce mois</option>
                <option>Cette année</option>
              </select>
              <select className="input flex-1 bg-white">
                <option>Toutes les zones</option>
                <option>Abobo</option>
                <option>Plateau</option>
                <option>Cocody</option>
              </select>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="btn btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white border-none">
                  <FileText size={18} /> Exporter PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
