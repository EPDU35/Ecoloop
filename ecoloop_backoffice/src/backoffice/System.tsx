import { useEffect, useState } from 'react';
import { Server, Database, Activity, Clock } from 'lucide-react';
import api from '../services/api';

interface SystemHealth {
  database: { status: string };
  redis: { status: string };
  ai_service: { status: string; models_loaded: Record<string, boolean> };
  environment: string;
  api_version: string;
}

export default function System() {
  const [sys, setSys] = useState<SystemHealth | null>(null);
  const [uptime] = useState(new Date().toISOString());

  useEffect(() => {
    const load = () => api.get('/admin/system').then((r) => setSys(r.data));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!sys) return <div className="bo-loading">Analyse du système...</div>;

  const services = [
    { icon: Database, label: 'Base de données', status: sys.database.status, color: '#10b981' },
    { icon: Database, label: 'Redis (Cache)', status: sys.redis.status, color: '#f59e0b' },
    { icon: Activity, label: 'Service IA', status: sys.ai_service.status, color: '#3b82f6' },
    { icon: Server, label: 'API Server', status: 'healthy', color: '#14b8a6' },
  ];

  return (
    <div className="bo-page">
      <div className="bo-page-header">
        <h1><Server size={20} /> Santé du système</h1>
        <div className="bo-status-bar">
          <Clock size={14} />
          {new Date(uptime).toLocaleString('fr-FR')}
        </div>
      </div>

      <div className="bo-cards-grid">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          const healthy = svc.status === 'healthy';
          return (
            <div key={i} className="bo-card">
              <div className="bo-card-header">
                <Icon size={20} color={svc.color} />
                <span>{svc.label}</span>
              </div>
              <div className="bo-card-value" style={{ color: healthy ? '#10b981' : '#ef4444' }}>
                {healthy ? 'En ligne' : 'Hors ligne'}
              </div>
              <div className="bo-card-sub">
                <span className={`bo-status-dot${healthy ? ' online' : ' offline'}`} />
                Dernier check: maintenant
              </div>
            </div>
          );
        })}
      </div>

      <div className="bo-panel">
        <h3>Informations générales</h3>
        <div className="bo-info-grid">
          <div className="bo-info-row">
            <span className="bo-info-label">Environnement</span>
            <span className="bo-info-value">{sys.environment}</span>
          </div>
          <div className="bo-info-row">
            <span className="bo-info-label">Version API</span>
            <span className="bo-info-value">{sys.api_version}</span>
          </div>
          <div className="bo-info-row">
            <span className="bo-info-label">Modèles IA chargés</span>
            <span className="bo-info-value">
              {Object.values(sys.ai_service.models_loaded).filter(Boolean).length} / {Object.keys(sys.ai_service.models_loaded).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
