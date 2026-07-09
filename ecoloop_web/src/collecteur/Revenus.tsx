import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getTransactionHistory } from '../services/collecteur.service';
import type { TransactionOut } from '../models/Transaction';

export default function Revenus() {
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

  const paidTxns = transactions.filter(t => t.status === 'PAYEE');
  const pendingTxns = transactions.filter(t => t.status === 'EN_ATTENTE' || t.status === 'PENDING');
  const totalPaye = paidTxns.reduce((s, t) => s + t.net_amount, 0);
  const totalAttente = pendingTxns.reduce((s, t) => s + t.net_amount, 0);

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="revenues" onSelect={handleSelect}
        user={{ name: "Collecteur", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mes gains" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          {loading ? (
            <p className="el-empty">Chargement...</p>
          ) : error ? (
            <p className="el-empty">Erreur : {error}</p>
          ) : (
            <>
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
                  <div className="el-kpi-label">Moyenne par transaction</div>
                  <div className="el-kpi-value">{paidTxns.length ? Math.round(totalPaye / paidTxns.length).toLocaleString('fr-FR') : 0} FCFA</div>
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
                              {t.status === 'PAYEE' ? 'Payé' : t.status === 'EN_ATTENTE' ? 'En attente' : t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--el-ink-soft)' }}>Aucune transaction</td></tr>
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
