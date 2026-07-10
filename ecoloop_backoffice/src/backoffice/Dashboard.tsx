import { useEffect, useState } from 'react';
import {
  Users, Truck, Receipt, Recycle, Activity, AlertTriangle, TrendingUp, Leaf,
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
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => setError('Impossible de charger les statistiques. Le backend est peut-être en démarrage (cold start). Réessayez dans 30 secondes.'));
    api.get('/admin/activity')
      .then((r) => setActivity(r.data.events ?? []))
      .catch(() => {});
  }, []);

  useSSE('/admin/events', (event: any) => {
    setRealtimeEvents((prev) => [event, ...prev].slice(0, 20));
    if (event.type === 'stats_updated') setStats(event.data);
  });

  if (!stats && !error) {
    return (
      <div className="bo-loading">
        <div className="bo-spinner" />
        <span>Chargement du tableau de bord…</span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bo-page">
        <div className="bo-panel bo-panel-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      icon: Users,
      label: 'Utilisateurs',
      value: stats.users.total.toLocaleString(),
      sub: `${stats.users.producers} producteurs · ${stats.users.collectors} collecteurs`,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)',
    },
    {
      icon: Recycle,
      label: 'Déchets recyclés',
      value: `${(stats.environmental.total_weight_kg / 1000).toFixed(2)} t`,
      sub: `${stats.environmental.co2_avoided_kg.toFixed(1)} kg CO₂ évités`,
      color: '#34d399',
      bg: 'rgba(52,211,153,0.12)',
    },
    {
      icon: Truck,
      label: 'Collectes',
      value: stats.collections.total.toLocaleString(),
      sub: `${stats.collections.validated} validées`,
      color: '#14b8a6',
      bg: 'rgba(20,184,166,0.12)',
    },
    {
      icon: Receipt,
      label: 'Revenus',
      value: `${(stats.transactions.total_revenue_fcfa / 1000).toFixed(0)}k FCFA`,
      sub: `${stats.transactions.total} transactions`,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.12)',
    },
  ];

  const maxKg = Math.max(...Object.values(stats.environmental.by_category_kg), 1);

  return (
    <div className="bo-page bo-stagger">
      {/* Header */}
      <div className="bo-page-header">
        <div className="bo-page-header-left">
          <h1><Leaf size={22} /> Tableau de bord</h1>
          <div className="bo-page-subtitle">Vue d'ensemble de la plateforme EcoLoop</div>
        </div>
        <div className="bo-status-bar">
          <span className={`bo-status-dot${stats.ai_healthy ? ' online' : ' offline'}`} />
          {stats.ai_healthy ? 'IA opérationnelle' : 'IA hors ligne'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="bo-cards-grid">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bo-card" style={{ '--card-accent': card.color } as any}>
              <div className="bo-card-core">
                <div className="bo-card-header">
                  <div className="bo-card-icon" style={{ background: card.bg }}>
                    <Icon size={16} color={card.color} />
                  </div>
                  <span>{card.label}</span>
                </div>
                <div className="bo-card-value">{card.value}</div>
                <div className="bo-card-sub">
                  <TrendingUp size={11} color={card.color} />
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activité + Temps réel */}
      <div className="bo-grid-2">
        <div className="bo-panel">
          <h3><Activity size={16} /> Activité récente</h3>
          <div className="bo-activity-list">
            {activity.length === 0 && (
              <div className="bo-empty">
                <Activity size={28} color="var(--text-muted)" />
                Aucune activité récente
              </div>
            )}
            {activity.map((e, i) => (
              <div key={i} className="bo-activity-item">
                <span className={`bo-activity-dot ${e.type?.includes('collection') ? 'green' : 'blue'}`} />
                <div>
                  <div className="bo-activity-desc">{e.description}</div>
                  <div className="bo-activity-time">
                    {e.timestamp ? new Date(e.timestamp).toLocaleString('fr-FR') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bo-panel">
          <h3><AlertTriangle size={16} /> Événements temps réel</h3>
          <div className="bo-activity-list">
            {realtimeEvents.length === 0 && (
              <div className="bo-empty">
                <AlertTriangle size={28} color="var(--text-muted)" />
                En attente d'événements…
              </div>
            )}
            {realtimeEvents.map((e, i) => (
              <div key={i} className="bo-activity-item">
                <span className={`bo-activity-dot ${e.type?.includes('fraud') ? 'red' : 'green'}`} />
                <div>
                  <div className="bo-activity-desc">
                    <strong>{e.type}</strong>{e.data ? ` — ${JSON.stringify(e.data).slice(0, 55)}` : ''}
                  </div>
                  <div className="bo-activity-time">
                    {e.timestamp ? new Date(e.timestamp).toLocaleString('fr-FR') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition par catégorie */}
      {Object.keys(stats.environmental.by_category_kg).length > 0 && (
        <div className="bo-panel">
          <h3><Recycle size={16} /> Répartition des déchets par catégorie</h3>
          <div className="bo-category-bars">
            {Object.entries(stats.environmental.by_category_kg)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, kg]) => (
                <div key={cat} className="bo-category-row">
                  <span className="bo-cat-label">{cat}</span>
                  <div className="bo-bar-track">
                    <div className="bo-bar-fill" style={{ width: `${(kg / maxKg) * 100}%` }} />
                  </div>
                  <span className="bo-cat-value">{kg.toFixed(1)} kg</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
