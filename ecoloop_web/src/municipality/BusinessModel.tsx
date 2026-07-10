import AppLayout from '../components/AppLayout';

export default function BusinessModel() {
  return (
    <AppLayout role="municipality" activeKey="business" title="">
      <div className="el-shell">
        <div className="el-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
          
          <div className="el-fade-in" style={{ marginBottom: 48, textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '3rem', margin: 0, color: 'var(--text-primary)' }}>
              Business Model
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginTop: 16, maxWidth: 600 }}>
              Un modèle de monétisation tripartite qui aligne les incitations de tous les acteurs de la chaîne.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, width: '100%', maxWidth: 1000 }}>
            
            <div className="el-card el-fade-in" style={{ padding: 32, borderTop: '4px solid #10B981' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🚛</div>
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 16px 0' }}>Collecteurs</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Commission transactionnelle sur le volume collecté via le matching IA.
              </p>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: 16, borderRadius: 8, color: '#059669', fontWeight: 600 }}>
                EcoLoop prélève 5-10% sur chaque transaction réussie.
              </div>
            </div>

            <div className="el-card el-fade-in" style={{ padding: 32, borderTop: '4px solid #3B82F6', animationDelay: '0.1s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🏭</div>
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 16px 0' }}>Industriels (B2B)</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Plateforme SaaS premium d'approvisionnement en matières premières secondaires vérifiées.
              </p>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: 16, borderRadius: 8, color: '#2563EB', fontWeight: 600 }}>
                Abonnement mensuel (EcoLoop Pro) : Accès prioritaire, traçabilité ESG, alertes volumes.
              </div>
            </div>

            <div className="el-card el-fade-in" style={{ padding: 32, borderTop: '4px solid #F59E0B', animationDelay: '0.2s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🏛️</div>
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 16px 0' }}>Mairies</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Système d'aide à la décision SaaS (Intelligence Center) pour la gestion urbaine.
              </p>
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: 8, color: '#D97706', fontWeight: 600 }}>
                Licence annuelle : Prévision des risques, cartographie temps réel, data RSE.
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
