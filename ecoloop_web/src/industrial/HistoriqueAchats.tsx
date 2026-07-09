import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { NAV_PATHS } from './nav';
import api from '../services/api';

interface PurchaseRecord {
  id: string;
  waste_lot_id: string;
  category: string;
  weight_kg: number;
  price_per_kg: number;
  total_amount: number;
  supplier_name: string;
  status: string;
  purchased_at: string;
  delivered_at: string | null;
  invoice_url: string | null;
  co2_avoided_kg: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  PET: '#10B981', HDPE: '#3B82F6', CARTON: '#F59E0B', VERRE: '#8B5CF6',
  PLASTIQUE: '#10B981', METAL: '#6B7280', PAPIER: '#F59E0B',
  ORGANIQUE: '#EC4899', BOIS: '#D97706',
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    livre: { label: 'Livré', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    en_transit: { label: 'En transit', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    en_attente: { label: 'En attente', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    valide: { label: 'Validé', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  };
  const s = cfg[status?.toLowerCase()] || { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
  return <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 }}>{s.label}</span>;
}

function SkeletonRow() {
  return (
    <div className="ih-row" style={{ animation: 'pdPulse 1.4s ease-in-out infinite' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '55%', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
        <div style={{ width: '35%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}

export default function HistoriqueAchats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', period: 'all' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'purchased_at', direction: 'desc' });

  useEffect(() => {
    api.get('/industrial/purchases')
      .then(r => { setPurchases(r.data || []); })
      .catch(e => { setError(e.message); console.error(e); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = purchases.filter(p => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.status !== 'all' && p.status?.toLowerCase() !== filters.status) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortConfig.key as keyof PurchaseRecord];
    const bVal = b[sortConfig.key as keyof PurchaseRecord];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const categories = [...new Set(purchases.map(p => p.category))].sort();
  const statuses = [...new Set(purchases.map(p => p.status?.toLowerCase()))].sort();

  const totals = sorted.reduce((acc, p) => {
    acc.weight += p.weight_kg;
    acc.amount += p.total_amount;
    acc.co2 += p.co2_avoided_kg || 0;
    return acc;
  }, { weight: 0, amount: 0, co2: 0 });

  return (
    <AppLayout role="industrial" activeKey="historique" title="Historique des achats">
      <div className="ih-root">

        {/* Filters */}
        <div className="ih-filters">
          <div className="el-filter-field">
            <label htmlFor="cat-filter">Catégorie</label>
            <select id="cat-filter" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="all">Toutes</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="el-filter-field">
            <label htmlFor="status-filter">Statut</label>
            <select id="status-filter" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="all">Tous</option>
              {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="el-filter-field">
            <label htmlFor="period-filter">Période</label>
            <select id="period-filter" value={filters.period} onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}>
              <option value="all">Toute l'année</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="ih-summary">
          <div className="ih-kpi">
            <div className="ih-kpi-label">Poids total acheté</div>
            <div className="ih-kpi-value">{totals.weight.toLocaleString('fr-FR')} kg</div>
          </div>
          <div className="ih-kpi">
            <div className="ih-kpi-label">Montant total</div>
            <div className="ih-kpi-value">{totals.amount.toLocaleString('fr-FR')} FCFA</div>
          </div>
          <div className="ih-kpi">
            <div className="ih-kpi-label">CO₂ évité</div>
            <div className="ih-kpi-value">{totals.co2.toFixed(1)} kg</div>
          </div>
          <div className="ih-kpi">
            <div className="ih-kpi-label">Transactions</div>
            <div className="ih-kpi-value">{sorted.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="el-card" style={{ marginTop: '1rem' }}>
          <div className="el-table-wrap">
            <table className="el-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('purchased_at')} style={{ cursor: 'pointer' }}>
                    Date <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>{sortConfig.key === 'purchased_at' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                  </th>
                  <th>Référence</th>
                  <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                    Matière <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>{sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                  </th>
                  <th onClick={() => handleSort('weight_kg')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                    Poids <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>{sortConfig.key === 'weight_kg' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                  </th>
                  <th onClick={() => handleSort('price_per_kg')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                    Prix/kg <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>{sortConfig.key === 'price_per_kg' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                  </th>
                  <th onClick={() => handleSort('total_amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                    Total <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>{sortConfig.key === 'total_amount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                  </th>
                  <th>Fournisseur</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                ) : error ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--el-ink-soft)' }}>Erreur : {error}</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--el-ink-soft)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                    <p>Aucun achat trouvé pour ces filtres.</p>
                  </td></tr>
                ) : (
                  sorted.map(p => (
                    <tr key={p.id} className="ih-row">
                      <td className="el-mono" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(p.purchased_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="el-mono" style={{ fontWeight: 600, fontSize: '0.78rem' }}>{p.id.slice(0, 10)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem' }}>
                            {p.category === 'PLASTIQUE' ? '🧴' : p.category === 'CARTON' ? '📦' :
                             p.category === 'METAL' ? '🔩' : p.category === 'VERRE' ? '🫙' : '♻️'}
                          </span>
                          <span style={{ fontWeight: 500 }}>{p.category}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }} className="el-mono">{p.weight_kg.toLocaleString('fr-FR')} kg</td>
                      <td style={{ textAlign: 'right' }} className="el-mono">{p.price_per_kg.toLocaleString('fr-FR')} FCFA</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }} className="el-mono">{p.total_amount.toLocaleString('fr-FR')} FCFA</td>
                      <td>{p.supplier_name || '—'}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {p.invoice_url && (
                            <a href={p.invoice_url} target="_blank" rel="noopener" className="ih-btn" title="Facture">📄</a>
                          )}
                          <a href={`/industrial/orders/${p.id}`} className="ih-btn" title="Détails">👁️</a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="el-btn el-btn-ghost" onClick={() => { /* export CSV */ }}>📥 Exporter CSV</button>
          <button className="el-btn el-btn-ghost" onClick={() => { /* export PDF */ }}>📄 Exporter PDF</button>
        </div>

      </div>
    </AppLayout>
  );
}