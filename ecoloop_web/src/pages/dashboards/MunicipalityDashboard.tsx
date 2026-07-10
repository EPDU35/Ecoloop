import { Map, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aiService } from '@/services/api/aiService';
import { dashboardService } from '@/services/api/dashboardService';
import { ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function MunicipalityDashboard() {
  const [riskData, setRiskData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await dashboardService.getMunicipalityOverview();
        const riskRes = await aiService.getZonesRisk('Abobo'); // Exemple de zone
        
        setStats(statsRes);
        setRiskData(riskRes.data);
      } catch (err: any) {
        setError("Impossible de charger les données du tableau de bord. " + (err.response?.data?.detail || ""));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="page-container text-center mt-8">Chargement des données d'impact...</div>;
  if (error) return <div className="page-container"><ErrorState title="Erreur tableau de bord" message={error} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Supervision Communale</h1>
        <p className="page-subtitle">Vue globale de l'insalubrité et de l'impact environnemental</p>
      </div>

      <div className="dashboard-stats grid-cols-4 mt-6">
        <div className="stat-card">
          <div className="stat-icon bg-primary-light text-primary"><ShieldCheck size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Déchets Collectés</span>
            <span className="stat-value">{stats?.total_lots || 0} Lots</span>
          </div>
        </div>
      </div>

      <section className="dashboard-section mt-8">
        <h2 className="section-title">Analyse des Risques (IA)</h2>
        <div className="grid-cols-2">
          <div className="card">
            <h3>Cartographie des risques : {riskData?.zone || 'Abobo'}</h3>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div className="bg-alert-light text-alert" style={{ padding: '16px', borderRadius: '50%' }}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--alert)' }}>
                  Niveau de risque: {riskData?.risk_level || 'Moyen'}
                </p>
                <p className="text-secondary mt-2">
                  Probabilité de saturation: {((riskData?.saturation_probability || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Recommandations du Decision Support Engine</h3>
            <ul className="mt-4" style={{ listStyle: 'none', padding: 0 }}>
              {riskData?.recommendations?.map((rec: string, index: number) => (
                <li key={index} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Map size={16} className="text-primary" />
                  <span>{rec}</span>
                </li>
              ))}
              {!riskData?.recommendations && (
                <li className="text-secondary">Aucune recommandation critique pour le moment.</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
