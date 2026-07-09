import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import { getAdminTransactions, type PlatformTransaction } from '../services/analytics.service';

export default function Transactions() {
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="el-content">Chargement des transactions...</div>;
  }

  // Calculs totaux
  const totalVolume = transactions.reduce((sum, t) => sum + t.weightKg, 0);
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);

  return (
    <AppLayout role="admin" activeKey="transactions" title="Historique des Transactions &amp; Commissions">
      <div className="el-kpi-grid">
        <KpiCard
          id="total_vol"
          label="Volume total échangé"
          value={`${totalVolume} kg`}
        />
        <KpiCard
          id="total_amount"
          label="Valeur totale des échanges"
          value={`${totalAmount.toLocaleString('fr-FR')} FCFA`}
        />
        <KpiCard
          id="total_comm"
          label="Commissions EcoLoop perçues"
          value={`${totalCommission.toLocaleString('fr-FR')} FCFA`}
        />
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
                  <td className="el-mono" style={{ color: 'var(--el-signal)', fontWeight: 600 }}>
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
    </AppLayout>
  );
}
