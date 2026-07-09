import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getCollectorDashboard } from '../services/collecteur.service';
import type { CollectorCollection } from '../models/Waste';

const STATUS_LABELS: Record<string, string> = {
  RESERVEE: 'Réservée',
  VALIDEE: 'Terminée',
  EN_COURS: 'En cours',
  ANNULEE: 'Annulée',
};

export default function Tournees() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collections, setCollections] = useState<CollectorCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    getCollectorDashboard()
      .then((data) => setCollections(data.my_collections))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="tournees" onSelect={handleSelect}
        user={{ name: "Collecteur", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mes collectes" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-card" style={{ marginBottom: '1rem' }}>
            <div className="el-card-heading">
              <div className="el-card-title">Optimisation IA des tournées</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--el-ink-soft)', lineHeight: 1.5 }}>
              Les tournées sont automatiquement calculées pour minimiser la distance parcourue et maximiser le volume collecté.
            </p>
          </div>

          {loading ? (
            <p className="el-empty">Chargement...</p>
          ) : error ? (
            <p className="el-empty">Erreur : {error}</p>
          ) : (
            <>
              <div className="el-results-count"><strong>{collections.length}</strong> collecte{collections.length > 1 ? 's' : ''}</div>
              <div className="el-card" style={{ marginTop: '0.5rem' }}>
                <div className="el-table-wrap">
                  <table className="el-table">
                    <thead>
                      <tr>
                        <th>Réf.</th><th>Lot</th><th>Poids réel</th><th>Réservée le</th><th>Validée le</th><th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map((c) => (
                        <tr key={c.id}>
                          <td className="el-mono" style={{ fontWeight: 600 }}>{c.id.slice(0, 8)}</td>
                          <td className="el-mono">{c.waste_lot_id.slice(0, 8)}</td>
                          <td className="el-mono">{c.actual_weight_kg ? `${c.actual_weight_kg} kg` : '-'}</td>
                          <td className="el-mono">{c.reserved_at ? new Date(c.reserved_at).toLocaleDateString('fr-FR') : '-'}</td>
                          <td className="el-mono">{c.validated_at ? new Date(c.validated_at).toLocaleDateString('fr-FR') : '-'}</td>
                          <td>
                            <span className={`el-pill ${c.status === 'RESERVEE' ? 'in_transit' : c.status === 'EN_COURS' ? 'late' : c.status === 'VALIDEE' ? 'success' : ''}`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {collections.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--el-ink-soft)' }}>Aucune collecte pour le moment</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
