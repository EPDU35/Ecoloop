import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getAdminTransactions, type PlatformTransaction } from '../services/analytics.service';

export default function Transactions() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminTransactions();
        setTransactions(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading) {
    return <div className="el-content">Chargement des transactions...</div>;
  }

  // Calculs totaux
  const totalVolume = transactions.reduce((sum, t) => sum + t.weightKg, 0);
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="transactions"
        onSelect={handleSelect}
        user={{ name: "Admin EcoLoop", role: "Super-Administrateur" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Historique des Transactions &amp; Commissions"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-kpi-grid">
            <div className="el-card">
              <div className="el-kpi-label">Volume total échangé</div>
              <div className="el-kpi-value">{totalVolume} kg</div>
            </div>
            
            <div className="el-card">
              <div className="el-kpi-label">Valeur totale des échanges</div>
              <div className="el-kpi-value">{totalAmount.toLocaleString('fr-FR')} FCFA</div>
            </div>

            <div className="el-card">
              <div className="el-kpi-label">Commissions EcoLoop perçues</div>
              <div className="el-kpi-value">{totalCommission.toLocaleString('fr-FR')} FCFA</div>
            </div>
          </div>

          <div className="el-card" style={{ marginTop: '1.5rem' }}>
            <div className="el-card-heading">
              <div className="el-card-title">Flux de transactions</div>
            </div>

            <div className="el-table-wrap" style={{ marginTop: '0.5rem' }}>
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Réf. TXN</th>
                    <th>Date</th>
                    <th>Producteur</th>
                    <th>Collecteur</th>
                    <th>Matériau</th>
                    <th>Poids (kg)</th>
                    <th>Montant transaction</th>
                    <th>Commission EcoLoop</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{t.id}</td>
                      <td className="el-mono">{t.date}</td>
                      <td>{t.producer}</td>
                      <td>{t.collector}</td>
                      <td>
                        <span
                          className="el-material-badge"
                          style={{
                            background:
                              t.material === 'PET'
                                ? '#3fa34d'
                                : t.material === 'HDPE'
                                  ? '#6b8f79'
                                  : t.material === 'Carton'
                                    ? '#d9a441'
                                    : '#b4522f',
                          }}
                        >
                          {t.material}
                        </span>
                      </td>
                      <td className="el-mono">{t.weightKg} kg</td>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{t.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="el-mono" style={{ color: 'var(--el-emerald)', fontWeight: 600 }}>
                        {t.commission.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <span className={`el-pill ${t.status === 'completed' ? 'success' : 'in_transit'}`}>
                          {t.status === 'completed' ? 'Validé' : 'En attente'}
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
