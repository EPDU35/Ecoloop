import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';

export default function Impact() {
  return (
    <AppLayout role="municipality" activeKey="impact" title="Indicateurs d'impact RSE">
      {/* Section 1: Environnement */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="arbre">🌱</span> Impact Environnemental
      </h2>

      <div className="el-kpi-grid">
        <KpiCard
          id="co2"
          label="Émissions CO₂ évitées"
          value="46.2 tonnes"
          deltaLabel="8% vs mois dernier"
          deltaDirection="up"
        />
        <KpiCard
          id="trees"
          label="Équivalence Arbres"
          value="1 850 arbres"
          deltaLabel="Arbres plantés en termes d'absorption CO₂"
        />
        <KpiCard
          id="cars"
          label="Équivalence Voitures"
          value="22 véhicules"
          deltaLabel="Voitures retirées de la circulation pendant 1 an"
        />
      </div>

      {/* Section 2: Social */}
      <h2 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="groupe">👥</span> Impact Social &amp; Économique
      </h2>

      <div className="el-grid-2">
        <div className="el-card">
          <div className="el-card-heading">
            <div className="el-card-title">Soutien aux collecteurs locaux</div>
          </div>
          <div className="el-kpi-value" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>35 collecteurs</div>
          <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Nombre d'auto-entrepreneurs de collecte de déchets enregistrés et soutenus financièrement
            dans la commune grâce aux transactions de la plateforme.
          </p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
              <span>Objectif annuel (50 collecteurs)</span>
              <strong>70%</strong>
            </div>
            <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '70%', background: 'var(--el-emerald)' }} />
            </div>
          </div>
        </div>

        <div className="el-card">
          <div className="el-card-heading">
            <div className="el-card-title">Revenus distribués aux ménages</div>
          </div>
          <div className="el-kpi-value" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>3.5 M FCFA</div>
          <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Somme totale reversée directement aux producteurs de déchets (ménages, commerces, écoles) 
            pour la valorisation de leurs matières recyclables.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
              <span>Objectif de redistribution (5 M FCFA)</span>
              <strong>70%</strong>
            </div>
            <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '70%', background: 'var(--el-emerald)' }} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
