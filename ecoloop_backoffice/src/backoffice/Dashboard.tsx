import { useEffect, useState } from 'react';
import {
  Users, Truck, Receipt, Recycle, Activity, AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useSSE } from './useSSE';

interface Stats {
  users: { total: number; producers: number; collectors: number; verified: number };
  waste_lots: { total: number; available: number; collected: number };
  collections: { total: number; validated: number };
  transactions: { total: number; total_revenue_fcfa: number };
  environmental: { total_weight_kg: number; co2_avoided_kg: number; by_category_kg: Record<string, number> };
  reviews_count: number;
  ai_healthy: boolean;
}

interface ActivityEvent {
  type: string;
  description: string;
  timestamp: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/activity').then((r) => setActivity(r.data.events));
  }, []);

  useSSE('/admin/events', (event) => {
    setRealtimeEvents((prev) => [event, ...prev].slice(0, 20));
    if (event.type === 'stats_updated') {
      setStats(event.data);
    }
  });

  if (!stats) {
    return <div className="bo-loading">Chargement...</div>;
  }

  const cards = [
    {
      icon: Users, label: 'Utilisateurs', value: stats.users.total,
      sub: `${stats.users.producers} producteurs, ${stats.users.collectors} collecteurs`,
      color: '#3b82f6',
    },
    {
      icon: Recycle, label: 'Déchets recyclés', value: `${stats.environmental.total_weight_kg.toFixed(0)} kg`,
      sub: `${stats.environmental.co2_avoided_kg.toFixed(2)} kg CO₂ évités`,
      color: '#10b981',
    },
    {
      icon: Truck, label: 'Collectes', value: stats.collections.total,
      sub: `${stats.collections.validated} validées`,
      color: '#14b8a6',
    },
    {
      icon: Receipt, label: 'Revenus', value: `${stats.transactions.total_revenue_fcfa.toLocaleString()} FCFA`,
      sub: `${stats.transactions.total} transactions`,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="bo-page">
      <div className="bo-page-header">
        <h1>Dashboard</h1>
        <div className="bo-status-bar">
          <span className={`bo-status-dot${stats.ai_healthy ? ' online' : ' offline'}`} />
          IA {stats.ai_healthy ? 'En ligne' : 'Hors ligne'}
        </div>
      </div>

      <div className="bo-cards-grid">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bo-card" style={{ borderTopColor: card.color }}>
              <div className="bo-card-header">
                <Icon size={20} color={card.color} />
                <span>{card.label}</span>
              </div>
              <div className="bo-card-value">{card.value}</div>
              <div className="bo-card-sub">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="bo-grid-2">
        <div className="bo-panel">
          <h3>
            <Activity size={16} /> Activité récente
          </h3>
          <div className="bo-activity-list">
            {activity.map((e, i) => (
              <div key={i} className="bo-activity-item">
                <span className={`bo-activity-dot ${e.type.includes('collection') ? 'green' : 'blue'}`} />
                <div>
                  <div className="bo-activity-desc">{e.description}</div>
                  <div className="bo-activity-time">{e.timestamp ? new Date(e.timestamp).toLocaleString('fr-FR') : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bo-panel">
          <h3>
            <AlertTriangle size={16} /> Événements temps réel
          </h3>
          <div className="bo-activity-list">
            {realtimeEvents.length === 0 && (
              <div className="bo-empty">En attente d'événements...</div>
            )}
            {realtimeEvents.map((e, i) => (
              <div key={i} className="bo-activity-item">
                <span className={`bo-activity-dot ${e.type?.includes('fraud') ? 'red' : 'green'}`} />
                <div>
                  <div className="bo-activity-desc">{e.type} — {JSON.stringify(e.data).slice(0, 60)}</div>
                  <div className="bo-activity-time">{e.timestamp ? new Date(e.timestamp).toLocaleString('fr-FR') : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bo-panel">
        <h3>Répartition par catégorie (kg)</h3>
        <div className="bo-category-bars">
          {Object.entries(stats.environmental.by_category_kg).map(([cat, kg]) => (
            <div key={cat} className="bo-category-row">
              <span className="bo-cat-label">{cat}</span>
              <div className="bo-bar-track">
                <div
                  className="bo-bar-fill"
                  style={{ width: `${Math.min((kg / Math.max(...Object.values(stats.environmental.by_category_kg))) * 100, 100)}%` }}
                />
              </div>
              <span className="bo-cat-value">{kg.toFixed(1)} kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
