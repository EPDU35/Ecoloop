import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getTransactionHistory } from '../services/producteur.service';
import type { TransactionOut } from '../models/Transaction';

export default function Collectes() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    getTransactionHistory()
      .then(setTransactions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="collectes" onSelect={handleSelect}
        user={{ name: "Producteur", role: "Producteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Suivi des collectes" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          {loading ? (
            <p className="el-empty">Chargement...</p>
          ) : error ? (
            <p className="el-empty">Erreur : {error}</p>
          ) : (
            <>
              <div className="el-results-count"><strong>{transactions.length}</strong> transaction{transactions.length > 1 ? 's' : ''}</div>
              <div className="el-card" style={{ marginTop: '0.5rem' }}>
                <div className="el-table-wrap">
                  <table className="el-table">
                    <thead>
                      <tr>
                        <th>Réf.</th><th>Date</th><th>Montant brut</th><th>Commission</th><th>Net</th><th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="el-mono" style={{ fontWeight: 600 }}>{t.id.slice(0, 8)}</td>
                          <td className="el-mono">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="el-mono">{t.gross_amount.toLocaleString('fr-FR')} FCFA</td>
                          <td className="el-mono">{t.commission_amount.toLocaleString('fr-FR')} FCFA</td>
                          <td className="el-mono" style={{ fontWeight: 600 }}>{t.net_amount.toLocaleString('fr-FR')} FCFA</td>
                          <td>
                            <span className={`el-pill ${t.status === 'PAYEE' ? 'success' : 'in_transit'}`}>
                              {t.status === 'PAYEE' ? 'Payée' : t.status === 'EN_ATTENTE' ? 'En attente' : t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
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
