import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';

interface Tournee {
  id: string;
  zone: string;
  lots: number;
  distance: string;
  duree: string;
  date: string;
  status: 'planifiee' | 'en_cours' | 'terminee';
}

const MOCK_TOURNEES: Tournee[] = [
  { id: 'T-001', zone: 'Yopougon', lots: 3, distance: '12 km', duree: '2h30', date: '10/07/2026', status: 'planifiee' },
  { id: 'T-002', zone: 'Marcory — Koumassi', lots: 2, distance: '8 km', duree: '1h45', date: '11/07/2026', status: 'planifiee' },
  { id: 'T-003', zone: 'Cocody', lots: 1, distance: '5 km', duree: '1h', date: '09/07/2026', status: 'terminee' },
];

export default function Tournees() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="tournees" onSelect={handleSelect}
        user={{ name: "Kouamé Jean", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mes tournées optimisées" searchOpen={searchOpen}
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
          <div className="el-results-count"><strong>{MOCK_TOURNEES.length}</strong> tournée{MOCK_TOURNEES.length > 1 ? 's' : ''}</div>
          <div className="el-card" style={{ marginTop: '0.5rem' }}>
            <div className="el-table-wrap">
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Réf.</th><th>Zone</th><th>Lots</th><th>Distance</th><th>Durée estimée</th><th>Date</th><th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TOURNEES.map((t) => (
                    <tr key={t.id}>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{t.id}</td>
                      <td>{t.zone}</td>
                      <td className="el-mono">{t.lots}</td>
                      <td className="el-mono">{t.distance}</td>
                      <td className="el-mono">{t.duree}</td>
                      <td className="el-mono">{t.date}</td>
                      <td>
                        <span className={`el-pill ${t.status === 'planifiee' ? 'in_transit' : t.status === 'en_cours' ? 'late' : 'success'}`}>
                          {t.status === 'planifiee' ? 'Planifiée' : t.status === 'en_cours' ? 'En cours' : 'Terminée'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
