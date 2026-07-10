import AppLayout from '../components/AppLayout';

export default function Architecture() {
  return (
    <AppLayout role="municipality" activeKey="architecture" title="">
      <div className="el-shell">
        <div className="el-content">
          
          <div className="el-fade-in" style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0 }}>
              Architecture Technique 🏗️
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
              Une infrastructure scalable et résiliente pour la gestion des données environnementales.
            </p>
          </div>

          <div className="el-card el-fade-in" style={{ padding: 40, background: '#0F172A', color: '#F8FAFC', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Top Tier: Frontend */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: 12, textAlign: 'center', width: 200 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📱</div>
                <div style={{ fontWeight: 600 }}>Mobile App</div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Collecteurs (PWA)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: 12, textAlign: 'center', width: 200 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>💻</div>
                <div style={{ fontWeight: 600 }}>Web Dashboards</div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>React / Vite</div>
              </div>
            </div>

            {/* Down Arrow */}
            <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), #3B82F6)', marginBottom: 40 }} />

            {/* API Gateway / Backend */}
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3B82F6', padding: '16px 40px', borderRadius: 12, textAlign: 'center', width: '100%', maxWidth: 500, marginBottom: 40, boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚡</div>
              <div style={{ fontWeight: 700, color: '#60A5FA', fontSize: '1.2rem' }}>Backend FastAPI</div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>API Gateway & Core Services (Python)</div>
            </div>

            {/* Down Arrow Split */}
            <div style={{ display: 'flex', gap: 150, marginBottom: 40 }}>
              <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), #10B981)', transform: 'rotate(20deg)', transformOrigin: 'top' }} />
              <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), #F59E0B)', transform: 'rotate(-20deg)', transformOrigin: 'top' }} />
            </div>

            {/* Bottom Tier: DB & AI */}
            <div style={{ display: 'flex', gap: 40, width: '100%', maxWidth: 700, justifyContent: 'center' }}>
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', padding: '24px', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🗄️</div>
                <div style={{ fontWeight: 700, color: '#34D399', fontSize: '1.1rem', marginBottom: 4 }}>Base de Données</div>
                <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>PostgreSQL + Alembic (Migrations)</div>
                <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Users</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Wastes</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Transactions</span>
                </div>
              </div>

              <div style={{ flex: 1, background: 'rgba(245,158,11,0.1)', border: '1px solid #F59E0B', padding: '24px', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🧠</div>
                <div style={{ fontWeight: 700, color: '#FBBF24', fontSize: '1.1rem', marginBottom: 4 }}>EcoLoop AI Engine</div>
                <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Hybride Rules + Predictive Services</div>
                <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Zone Risk Prediction</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Collector Matching</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Impact Scoring</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
