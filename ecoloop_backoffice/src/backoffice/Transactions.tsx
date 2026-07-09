import { useEffect, useState } from 'react';
import api from '../services/api';

interface TransactionItem {
  id: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  payment_method: string;
  status: string;
  external_reference: string | null;
  producer_name: string;
  created_at: string;
  paid_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: 'warning',
  PAYEE: 'success',
  ECHOUEE: 'danger',
  REMBOURSEE: 'blue',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params: any = { limit: 50, offset: page * 50 };
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/transactions', { params }).then((r) => {
      setTransactions(r.data.transactions);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  return (
    <div className="bo-page">
      <div className="bo-page-header">
        <h1>Transactions</h1>
        <span className="bo-count">{total} total</span>
      </div>

      <div className="bo-toolbar">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYEE">Payée</option>
          <option value="ECHOUEE">Échouée</option>
          <option value="REMBOURSEE">Remboursée</option>
        </select>
      </div>

      <div className="bo-table-container">
        <table className="bo-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producteur</th>
              <th>Montant brut</th>
              <th>Commission</th>
              <th>Net</th>
              <th>Méthode</th>
              <th>Référence</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="bo-cell-mono">{t.id.slice(0, 8)}...</td>
                <td>{t.producer_name}</td>
                <td>{t.gross_amount.toLocaleString()} FCFA</td>
                <td>{t.commission_amount.toLocaleString()} FCFA</td>
                <td className="bo-cell-bold">{t.net_amount.toLocaleString()} FCFA</td>
                <td>{t.payment_method}</td>
                <td className="bo-cell-mono">{t.external_reference || '-'}</td>
                <td>
                  <span className={`bo-status-badge ${STATUS_COLORS[t.status] || 'warning'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="bo-cell-date">{t.created_at ? new Date(t.created_at).toLocaleString('fr-FR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bo-pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</button>
        <span>Page {page + 1} / {Math.ceil(total / 50)}</span>
        <button disabled={(page + 1) * 50 >= total} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </div>
  );
}
