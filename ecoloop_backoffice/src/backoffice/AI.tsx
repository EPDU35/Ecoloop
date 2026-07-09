import { useEffect, useState } from 'react';
import { Cpu, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface AIHealth {
  status: string;
  models_loaded: Record<string, boolean>;
  version: string;
  environment: string;
}

export default function AI() {
  const [health, setHealth] = useState<AIHealth | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/system').then((r) => {
      if (r.data.ai_service.status === 'healthy') {
        setHealth({
          status: 'ok',
          models_loaded: r.data.ai_service.models_loaded,
          version: '1.0.0',
          environment: r.data.environment,
        });
      } else {
        setError('Service IA injoignable');
      }
    }).catch(() => setError('Impossible de contacter le service IA'));
  }, []);

  const modelLabels: Record<string, string> = {
    waste_classifier: 'Classification de déchets',
    price_predictor: 'Prédiction de prix',
    volume_predictor: 'Prédiction de volume',
    fraud_detector: 'Détection de fraude',
  };

  return (
    <div className="bo-page">
      <div className="bo-page-header">
        <h1><Cpu size={20} /> IA & Modèles</h1>
      </div>

      {error ? (
        <div className="bo-panel bo-panel-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      ) : health ? (
        <>
          <div className="bo-cards-grid">
            <div className="bo-card">
              <div className="bo-card-header">
                <Brain size={20} color="#10b981" />
                <span>Statut</span>
              </div>
              <div className="bo-card-value" style={{ color: '#10b981' }}>{health.status}</div>
              <div className="bo-card-sub">Version {health.version}</div>
            </div>
            <div className="bo-card">
              <div className="bo-card-header">
                <TrendingUp size={20} color="#3b82f6" />
                <span>Modèles chargés</span>
              </div>
              <div className="bo-card-value">
                {Object.values(health.models_loaded).filter(Boolean).length}/{Object.keys(health.models_loaded).length}
              </div>
              <div className="bo-card-sub">Environnement: {health.environment}</div>
            </div>
          </div>

          <div className="bo-panel">
            <h3>Modèles</h3>
            <div className="bo-model-list">
              {Object.entries(health.models_loaded).map(([key, loaded]) => (
                <div key={key} className="bo-model-item">
                  <div className="bo-model-info">
                    <span className="bo-model-name">{modelLabels[key] || key}</span>
                    <span className="bo-model-key">{key}</span>
                  </div>
                  <span className={`bo-status-badge ${loaded ? 'success' : 'danger'}`}>
                    {loaded ? 'Chargé' : 'Non chargé'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bo-loading">Chargement du statut IA...</div>
      )}
    </div>
  );
}
