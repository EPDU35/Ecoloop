import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useNavigate } from 'react-router-dom';
import { getMairieAlerts, type MairieAlert } from '../services/analytics.service';

export default function Alerts() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [alerts, setAlerts] = useState<MairieAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'reported' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    let cancelled = false;
    async function loadAlerts() {
      try {
        const data = await getMairieAlerts();
        if (cancelled) return;
        setAlerts(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const updateAlertStatus = (id: string, newStatus: 'in_progress' | 'resolved') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filtered = alerts.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="alertes"
        onSelect={handleSelect}
        user={{ name: "Koffi N'Guessan", role: "Mairie d'Abidjan (RSE)" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Signalements de dépôts sauvages"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-filter-bar">
            <div className="el-filter-field">
              <label htmlFor="statusFilter">Filtrer par statut</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tous les signalements</option>
                <option value="reported">Nouveaux (Signalés)</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolus</option>
              </select>
            </div>
          </div>

          <div className="el-results-count" style={{ marginTop: '1rem' }}>
            <strong>{filtered.length}</strong> signalement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </div>

          {loading ? (
            <div>Chargement des signalements...</div>
          ) : (
            <div className="el-card" style={{ marginTop: '0.5rem' }}>
              <div className="el-table-wrap">
                <table className="el-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Zone / Quartier</th>
                      <th>Description</th>
                      <th>Poids estimé</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id}>
                        <td className="el-mono" style={{ fontWeight: 600 }}>{a.id}</td>
                        <td className="el-mono">{a.date}</td>
                        <td>{a.zone}</td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: '0.85rem' }}>
                          {a.description}
                        </td>
                        <td className="el-mono">{a.weightEstimate}</td>
                        <td>
                          <span className={`el-pill ${a.status === 'reported' ? 'late' : a.status === 'in_progress' ? 'in_transit' : 'success'}`}>
                            {a.status === 'reported' ? 'Signalé' : a.status === 'in_progress' ? 'En cours' : 'Résolu'}
                          </span>
                        </td>
                        <td>
                          {a.status === 'reported' && (
                            <button
                              type="button"
                              className="el-card-link"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                              onClick={() => updateAlertStatus(a.id, 'in_progress')}
                            >
                              Prendre en charge
                            </button>
                          )}
                          {a.status === 'in_progress' && (
                            <button
                              type="button"
                              className="el-card-link"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-emerald)', fontWeight: 600, padding: 0 }}
                              onClick={() => updateAlertStatus(a.id, 'resolved')}
                            >
                              Marquer résolu
                            </button>
                          )}
                          {a.status === 'resolved' && (
                            <span style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem' }}>Aucune action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
