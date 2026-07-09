import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { getContracts, createContract } from '../services/waste.service';
import { getSuppliers, getCurrentUser } from '../services/user.service';
import type { Contract } from '../models/Transaction';
import type { Supplier, IndustrialUser } from '../models/User';

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire de nouveau contrat
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('PET');
  const [targetKg, setTargetKg] = useState('');
  const [priceKg, setPriceKg] = useState('');
  const [duration, setDuration] = useState('6');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [contractsData, suppliersData, userData] = await Promise.all([
        getContracts(),
        getSuppliers(),
        getCurrentUser(),
      ]);
      setContracts(contractsData);
      setSuppliers(suppliersData);
      setUser(userData);
      if (suppliersData.length > 0) {
        setSelectedSupplier(suppliersData[0].name);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetKg || !priceKg || !selectedSupplier) return;

    setSubmitting(true);
    try {
      await createContract({
        supplier: selectedSupplier,
        material: selectedMaterial,
        monthlyTargetKg: Number(targetKg),
        pricePerKg: Number(priceKg),
        durationMonths: Number(duration),
      });
      // Réinitialiser le formulaire
      setTargetKg('');
      setPriceKg('');
      setShowForm(false);
      // Recharger
      const updatedContracts = await getContracts();
      setContracts(updatedContracts);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div className="el-content">Chargement des contrats...</div>;
  }

  return (
    <AppLayout role="industrial" activeKey="contracts" title="Contrats d'approvisionnement">
      <div className="el-filter-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--el-ink-soft)' }}>
          Configurez vos contrats récurrents de rachat de matières premières recyclées.
        </div>
        <button
          type="button"
          className="el-btn el-btn-emerald"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annuler' : 'Créer un contrat'}
        </button>
      </div>

      {showForm && (
        <div className="el-card" style={{ marginTop: '1rem', maxWidth: 600 }}>
          <div className="el-card-heading">
            <div className="el-card-title">Nouveau contrat d'approvisionnement</div>
          </div>
          <form onSubmit={handleCreateContract} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="supplierSelect">Fournisseur certifié</label>
              <select
                id="supplierSelect"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.zone})
                  </option>
                ))}
              </select>
            </div>

            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="materialSelect">Matériau recyclé</label>
              <select
                id="materialSelect"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="PET">PET (Plastique)</option>
                <option value="HDPE">HDPE</option>
                <option value="Carton">Carton / Papier</option>
                <option value="Verre">Verre</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="targetInput">Volume cible mensuel (kg)</label>
                <input
                  id="targetInput"
                  type="number"
                  placeholder="Ex. 5000"
                  value={targetKg}
                  onChange={(e) => setTargetKg(e.target.value)}
                  required
                />
              </div>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="priceInput">Prix fixe (FCFA/kg)</label>
                <input
                  id="priceInput"
                  type="number"
                  placeholder="Ex. 150"
                  value={priceKg}
                  onChange={(e) => setPriceKg(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="durationSelect">Durée d'engagement</label>
              <select
                id="durationSelect"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="3">3 mois</option>
                <option value="6">6 mois</option>
                <option value="12">12 mois</option>
              </select>
            </div>

            <button
              type="submit"
              className="el-btn el-btn-emerald"
              style={{ alignSelf: 'flex-start' }}
              disabled={submitting}
            >
              {submitting ? 'Création...' : 'Valider et signer le contrat'}
            </button>
          </form>
        </div>
      )}

      <div className="el-card" style={{ marginTop: '1rem' }}>
        <div className="el-table-wrap">
          <table className="el-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Fournisseur</th>
                <th>Matériau</th>
                <th>Prix / kg</th>
                <th>Engagement mensuel</th>
                <th>Progression du mois</th>
                <th>Début &amp; Durée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const percent = Math.min(
                  Math.round((c.suppliedThisMonthKg / c.monthlyTargetKg) * 100),
                  100
                );
                return (
                  <tr key={c.id}>
                    <td className="el-mono" style={{ fontWeight: 600 }}>{c.id}</td>
                    <td>{c.supplier}</td>
                    <td>
                      <span
                        className="el-material-badge"
                        style={{
                          background:
                            c.material === 'PET'
                              ? '#3fa34d'
                              : c.material === 'HDPE'
                                ? '#6b8f79'
                                : c.material === 'Carton'
                                  ? '#d9a441'
                                  : '#b4522f',
                        }}
                      >
                        {c.material}
                      </span>
                    </td>
                    <td className="el-mono">{c.pricePerKg} FCFA</td>
                    <td className="el-mono">
                      {c.monthlyTargetKg >= 1000
                        ? `${(c.monthlyTargetKg / 1000).toFixed(1)} t`
                        : `${c.monthlyTargetKg} kg`}
                    </td>
                    <td>
                      <div style={{ minWidth: 150 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 2 }}>
                          <span className="el-mono">
                            {(c.suppliedThisMonthKg / 1000).toFixed(1)} t / {(c.monthlyTargetKg / 1000).toFixed(1)} t
                          </span>
                          <strong>{percent}%</strong>
                        </div>
                        <div style={{ height: 6, background: 'var(--el-paper-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percent}%`,
                              background: percent >= 100 ? 'var(--el-emerald)' : 'var(--el-amber)',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="el-mono">
                      {c.startDate} ({c.durationMonths}m)
                    </td>
                    <td>
                      <span className={`el-pill ${c.status === 'active' ? 'success' : 'late'}`}>
                        {c.status === 'active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
