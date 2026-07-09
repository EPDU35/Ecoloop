import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';

interface Paiement {
  id: string;
  date: string;
  lotRef: string;
  material: string;
  producteur: string;
  montant: number;
  statut: 'paye' | 'en_attente';
}

const MOCK_PAIEMENTS: Paiement[] = [
  { id: 'P-001', date: '01/07/2026', lotRef: 'L-003', material: 'Verre', producteur: 'Aïcha Koné', montant: 12000, statut: 'paye' },
  { id: 'P-002', date: '28/06/2026', lotRef: 'L-002', material: 'Carton', producteur: 'Fatoumata Sy', montant: 8000, statut: 'paye' },
  { id: 'P-003', date: 'En attente', lotRef: 'L-001', material: 'PET', producteur: 'Aïcha Koné', montant: 7500, statut: 'en_attente' },
];

export default function Revenus() {
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

  const totalPaye = MOCK_PAIEMENTS.filter(p => p.statut === 'paye').reduce((s, p) => s + p.montant, 0);
  const totalAttente = MOCK_PAIEMENTS.filter(p => p.statut === 'en_attente').reduce((s, p) => s + p.montant, 0);

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="revenues" onSelect={handleSelect}
        user={{ name: "Kouamé Jean", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mes gains" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-kpi-grid">
            <div className="el-card">
              <div className="el-kpi-label">Total perçu</div>
              <div className="el-kpi-value">{totalPaye.toLocaleString('fr-FR')} FCFA</div>
            </div>
            <div className="el-card">
              <div className="el-kpi-label">En attente</div>
              <div className="el-kpi-value">{totalAttente.toLocaleString('fr-FR')} FCFA</div>
            </div>
            <div className="el-card">
              <div className="el-kpi-label">Moyenne par collecte</div>
              <div className="el-kpi-value">{Math.round(totalPaye / MOCK_PAIEMENTS.filter(p => p.statut === 'paye').length || 1).toLocaleString('fr-FR')} FCFA</div>
            </div>
          </div>

          <div className="el-card" style={{ marginTop: '0.5rem' }}>
            <div className="el-card-heading">
              <div className="el-card-title">Historique des paiements</div>
            </div>
            <div className="el-table-wrap">
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Réf.</th><th>Date</th><th>Lot</th><th>Matériau</th><th>Producteur</th><th>Montant</th><th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAIEMENTS.map((p) => (
                    <tr key={p.id}>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{p.id}</td>
                      <td className="el-mono">{p.date}</td>
                      <td className="el-mono">{p.lotRef}</td>
                      <td>{p.material}</td>
                      <td>{p.producteur}</td>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{p.montant.toLocaleString('fr-FR')} FCFA</td>
                      <td>
                        <span className={`el-pill ${p.statut === 'paye' ? 'success' : 'in_transit'}`}>
                          {p.statut === 'paye' ? 'Payé' : 'En attente'}
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
