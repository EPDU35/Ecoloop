import AppLayout from '../components/AppLayout';

export default function AiExplain() {
  return (
    <AppLayout role="municipality" activeKey="ai-explain" title="">
      <div className="el-shell">
        <div className="el-content">
          <div className="el-fade-in" style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0 }}>
              Comment EcoLoop prédit les risques ? 🧠
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
              Une approche hybride combinant données contextuelles et moteur de règles métier.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 1fr', gap: 24, alignItems: 'center' }}>
            
            {/* Colonne Entrées */}
            <div className="el-card el-fade-in" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>Entrées & Contexte</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>📊</span> Historique des déchets (tonnage moyen)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>👥</span> Densité de population par zone
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>🌤️</span> Données météorologiques (saison des pluies)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>🚛</span> Capacité actuelle des collecteurs
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>📅</span> Fréquence des collectes passées
                </li>
              </ul>
            </div>

            {/* Moteur */}
            <div className="el-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animationDelay: '0.1s' }}>
              <div style={{ fontSize: '2rem', color: '#10B981', marginBottom: 8 }}>➔</div>
              <div style={{ background: '#10B981', color: '#fff', padding: '24px 32px', borderRadius: 16, fontWeight: 700, fontSize: '1.2rem', boxShadow: '0 10px 25px -5px rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚙️</div>
                Risk Prediction Engine
              </div>
              <div style={{ fontSize: '2rem', color: '#10B981', marginTop: 8 }}>➔</div>
            </div>

            {/* Sortie */}
            <div className="el-card el-fade-in" style={{ padding: 24, background: 'var(--warning-light)', borderColor: 'var(--warning)', animationDelay: '0.2s' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#B45309', borderBottom: '2px solid rgba(245,158,11,0.2)', paddingBottom: 8 }}>Résultats Actionnables</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>Score de Risque</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D97706' }}>87%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Action Recommandée</div>
                  <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, color: '#D97706', fontWeight: 600, border: '1px solid rgba(245,158,11,0.3)' }}>
                    Déployer 2 collecteurs supplémentaires en priorité.
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="el-card el-fade-in" style={{ marginTop: 40, background: '#F8FAFC', padding: 24, animationDelay: '0.3s' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Note Technique (Version VIBEATHON)</h4>
            <p style={{ margin: 0, color: '#64748B', lineHeight: 1.6 }}>
              Pour ce MVP, nous utilisons une architecture hybride qui combine des <strong>règles métier strictes</strong> avec les <strong>historiques de collecte</strong> simulés et des facteurs contextuels. 
              Cette conception permet d'éviter l'effet "boîte noire" (Explainable AI) et garantit que l'architecture est prête à intégrer, dans sa version finale, des modèles de Machine Learning (ex: Random Forest, XGBoost) entraînés sur les données réelles du terrain ivoirien.
            </p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
