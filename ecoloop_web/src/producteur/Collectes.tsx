import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';

interface Collecte {
  id: string;
  collecteur: string;
  lotRef: string;
  material: string;
  datePrevue: string;
  status: 'programmee' | 'en_cours' | 'effectuee';
}

const MOCK_COLLECTES: Collecte[] = [
  { id: 'C-001', collecteur: 'Kouamé Jean', lotRef: 'L-002', material: 'Carton', datePrevue: '10/07/2026', status: 'programmee' },
  { id: 'C-002', collecteur: 'Fatou Diop', lotRef: 'L-001', material: 'PET', datePrevue: '12/07/2026', status: 'programmee' },
  { id: 'C-003', collecteur: 'Mamadou Traoré', lotRef: 'L-003', material: 'Verre', datePrevue: '28/06/2026', status: 'effectuee' },
];

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#3fa34d', HDPE: '#6b8f79', Carton: '#d9a441', Verre: '#b4522f',
};

export default function Collectes() {
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
      <Sidebar items={NAV_ITEMS} activeKey="collectes" onSelect={handleSelect}
        user={{ name: "Aïcha Koné", role: "Producteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Suivi des collectes" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-results-count"><strong>{MOCK_COLLECTES.length}</strong> collecte{MOCK_COLLECTES.length > 1 ? 's' : ''}</div>
          <div className="el-card" style={{ marginTop: '0.5rem' }}>
            <div className="el-table-wrap">
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Réf.</th><th>Collecteur</th><th>Lot</th><th>Matériau</th><th>Date prévue</th><th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COLLECTES.map((c) => (
                    <tr key={c.id}>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{c.id}</td>
                      <td>{c.collecteur}</td>
                      <td className="el-mono">{c.lotRef}</td>
                      <td>
                        <span className="el-material-badge" style={{ background: MATERIAL_COLORS[c.material] || '#6b8f79' }}>
                          {c.material}
                        </span>
                      </td>
                      <td className="el-mono">{c.datePrevue}</td>
                      <td>
                        <span className={`el-pill ${c.status === 'programmee' ? 'in_transit' : c.status === 'en_cours' ? 'late' : 'success'}`}>
                          {c.status === 'programmee' ? 'Programmée' : c.status === 'en_cours' ? 'En cours' : 'Effectuée'}
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
