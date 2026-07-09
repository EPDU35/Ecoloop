import { useState } from 'react';
import AppLayout from '../components/AppLayout';

export default function Settings() {
  // Paramètres modifiables
  const [commissionRate, setCommissionRate] = useState('6.5');
  const [petPrice, setPetPrice] = useState('150');
  const [hdpePrice, setHdpePrice] = useState('120');
  const [cartonPrice, setCartonPrice] = useState('80');
  const [glassPrice, setGlassPrice] = useState('60');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <AppLayout role="admin" activeKey="settings" title="Configuration de la Marketplace">
      <div className="el-grid-2" style={{ gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div className="el-card">
          <div className="el-card-heading">
            <div className="el-card-title">Barème de prix de rachat indicatif (par kg)</div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="commission">Taux de commission EcoLoop (%)</label>
              <input
                id="commission"
                type="number"
                step="0.1"
                min="5"
                max="10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                required
              />
              <small style={{ color: 'var(--el-ink-soft)', marginTop: 4 }}>
                Doit être compris entre 5.0% et 10.0% selon le cahier des charges.
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="pet">Plastique PET (FCFA/kg)</label>
                <input
                  id="pet"
                  type="number"
                  value={petPrice}
                  onChange={(e) => setPetPrice(e.target.value)}
                  required
                />
              </div>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="hdpe">HDPE (FCFA/kg)</label>
                <input
                  id="hdpe"
                  type="number"
                  value={hdpePrice}
                  onChange={(e) => setHdpePrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="carton">Carton / Papier (FCFA/kg)</label>
                <input
                  id="carton"
                  type="number"
                  value={cartonPrice}
                  onChange={(e) => setCartonPrice(e.target.value)}
                  required
                />
              </div>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="glass">Verre (FCFA/kg)</label>
                <input
                  id="glass"
                  type="number"
                  value={glassPrice}
                  onChange={(e) => setGlassPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="el-btn el-btn-emerald"
              style={{ alignSelf: 'flex-start' }}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>

            {success && (
              <div style={{ background: '#e6f4ea', color: '#137333', padding: '0.75rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 500 }}>
                ✓ Paramètres enregistrés et appliqués à la marketplace avec succès.
              </div>
            )}
          </form>
        </div>

        <div className="el-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="el-card-heading">
            <div className="el-card-title">Informations de conformité</div>
          </div>
          <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Les prix indiqués ici servent de recommandation de base lors de la publication d'un lot par un producteur ou son estimation automatique par l'IA.
          </p>
          <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Le taux de commission s'applique sur chaque transaction complétée sur la plateforme entre un producteur et un collecteur.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
