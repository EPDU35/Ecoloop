import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import api from '../services/api';

interface ImpactData {
  total_weight_kg: number;
  by_category_kg: Record<string, number>;
  total_paid_amount_fcfa: number;
}

// Facteurs d'estimation standards (ADEME) pour convertir un tonnage de déchets
// valorisés en équivalents pédagogiques. Ce sont des ordres de grandeur, pas des
// mesures directes.
const CO2_AVOIDED_PER_KG = 1.2; // kg CO2 évité par kg de déchet valorisé
const KG_CO2_PER_TREE_PER_YEAR = 25; // absorption moyenne d'un arbre par an
const KG_CO2_PER_CAR_PER_YEAR = 2000; // émissions moyennes d'une voiture par an

export default function Impact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/municipality/impact')
      .then(res => setData(res.data))
      .catch(() => setError('Impossible de charger les indicateurs d\'impact'))
      .finally(() => setLoading(false));
  }, []);

  const co2AvoidedKg = data ? data.total_weight_kg * CO2_AVOIDED_PER_KG : 0;
  const treesEquivalent = Math.round(co2AvoidedKg / KG_CO2_PER_TREE_PER_YEAR);
  const carsEquivalent = Math.round(co2AvoidedKg / KG_CO2_PER_CAR_PER_YEAR);

  return (
    <AppLayout role="municipality" activeKey="impact" title="Indicateurs d'impact RSE">
      {/* Section 1: Environnement */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="arbre">🌱</span> Impact Environnemental
      </h2>

      {error && <p className="el-empty">{error}</p>}

      <div className="el-kpi-grid">
        <KpiCard
          id="co2"
          label="Émissions CO₂ évitées (estimation)"
          value={loading ? '…' : `${(co2AvoidedKg / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} tonnes`}
          deltaLabel="Estimé à partir du tonnage total valorisé"
        />
        <KpiCard
          id="trees"
          label="Équivalence Arbres (estimation)"
          value={loading ? '…' : `${treesEquivalent.toLocaleString('fr-FR')} arbres`}
          deltaLabel="Arbres plantés en termes d'absorption CO₂ / an"
        />
        <KpiCard
          id="cars"
          label="Équivalence Voitures (estimation)"
          value={loading ? '…' : `${carsEquivalent.toLocaleString('fr-FR')} véhicules`}
          deltaLabel="Voitures retirées de la circulation pendant 1 an"
        />
      </div>

      {/* Section 2: Social */}
      <h2 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="groupe">👥</span> Impact Économique
      </h2>

      <div className="el-card">
        <div className="el-card-heading">
          <div className="el-card-title">Revenus distribués aux producteurs</div>
        </div>
        <div className="el-kpi-value" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {loading ? '…' : `${(data?.total_paid_amount_fcfa ?? 0).toLocaleString('fr-FR')} FCFA`}
        </div>
        <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Somme totale reversée directement aux producteurs de déchets (ménages, commerces, écoles)
          pour la valorisation de leurs matières recyclables, toutes transactions payées confondues.
        </p>
      </div>
    </AppLayout>
  );
}
