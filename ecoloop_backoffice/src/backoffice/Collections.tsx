import { useEffect, useState } from 'react';
import api from '../services/api';

interface CollectionItem {
  id: string;
  status: string;
  category: string;
  actual_weight_kg: number | null;
  estimated_weight_kg: number | null;
  collector_name: string;
  reserved_at: string;
  validated_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  RESERVEE: 'warning',
  EN_ROUTE: 'blue',
  VALIDEE: 'success',
  ANNULEE: 'danger',
};

export default function Collections() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params: any = { limit: 50, offset: page * 50 };
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/collections', { params }).then((r) => {
      setCollections(r.data.collections);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  return (
    <div className="bo-page">
      <div className="bo-page-header">
        <h1>Collectes</h1>
        <span className="bo-count">{total} total</span>
      </div>

      <div className="bo-toolbar">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">Tous les statuts</option>
          <option value="RESERVEE">Réservée</option>
          <option value="EN_ROUTE">En route</option>
          <option value="VALIDEE">Validée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
      </div>

      <div className="bo-table-container">
        <table className="bo-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Catégorie</th>
              <th>Poids estimé</th>
              <th>Poids réel</th>
              <th>Collecteur</th>
              <th>Statut</th>
              <th>Réservée le</th>
              <th>Validée le</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id}>
                <td className="bo-cell-mono">{c.id.slice(0, 8)}...</td>
                <td>{c.category || '-'}</td>
                <td>{c.estimated_weight_kg ? `${c.estimated_weight_kg} kg` : '-'}</td>
                <td>{c.actual_weight_kg ? `${c.actual_weight_kg} kg` : '-'}</td>
                <td>{c.collector_name}</td>
                <td>
                  <span className={`bo-status-badge ${STATUS_COLORS[c.status] || 'warning'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="bo-cell-date">{c.reserved_at ? new Date(c.reserved_at).toLocaleString('fr-FR') : '-'}</td>
                <td className="bo-cell-date">{c.validated_at ? new Date(c.validated_at).toLocaleString('fr-FR') : '-'}</td>
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
