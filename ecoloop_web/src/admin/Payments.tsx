import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getAdminPayments, processPayment, type PlatformPayment } from '../services/analytics.service';

export default function Payments() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [payments, setPayments] = useState<PlatformPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  async function loadData() {
    try {
      const data = await getAdminPayments();
      setPayments(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const handleProcessPayment = async (id: string) => {
    await processPayment(id);
    loadData();
  };

  if (loading) {
    return <div className="el-content">Chargement des paiements...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="payments"
        onSelect={handleSelect}
        user={{ name: "Admin EcoLoop", role: "Super-Administrateur" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Reversements Mobile Money"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-filter-bar">
            <div style={{ fontSize: '0.9rem', color: 'var(--el-ink-soft)' }}>
              Validez les demandes de paiement mobile (Wave, Orange Money, MTN Mobile Money) pour les producteurs et collecteurs.
            </div>
          </div>

          <div className="el-card" style={{ marginTop: '1rem' }}>
            <div className="el-card-heading">
              <div className="el-card-title">Paiements en attente de transfert</div>
            </div>

            <div className="el-table-wrap" style={{ marginTop: '0.5rem' }}>
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Réf. Payout</th>
                    <th>Bénéficiaire</th>
                    <th>Téléphone</th>
                    <th>Opérateur</th>
                    <th>Montant à verser</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{p.id}</td>
                      <td style={{ fontWeight: 600 }}>{p.beneficiary}</td>
                      <td className="el-mono">{p.phone}</td>
                      <td>
                        <span
                          className="el-material-badge"
                          style={{
                            background:
                              p.provider === 'Wave'
                                ? '#a0c4ff'
                                : p.provider === 'Orange Money'
                                  ? '#ffc6ff'
                                  : '#ffd60a',
                            color: '#1a1a1a',
                          }}
                        >
                          {p.provider}
                        </span>
                      </td>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{p.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td>
                        <span className={`el-pill ${p.status === 'paid' ? 'success' : p.status === 'pending' ? 'in_transit' : 'late'}`}>
                          {p.status === 'paid' ? 'Transféré' : p.status === 'pending' ? 'En attente' : 'Échoué'}
                        </span>
                      </td>
                      <td>
                        {p.status === 'pending' ? (
                          <button
                            type="button"
                            className="el-btn el-btn-emerald"
                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleProcessPayment(p.id)}
                          >
                            Valider le transfert
                          </button>
                        ) : (
                          <span style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem' }}>Aucune action (Traité)</span>
                        )}
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
