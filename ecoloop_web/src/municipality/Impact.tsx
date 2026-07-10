import AppLayout from '../components/AppLayout';

export default function GlobalImpact() {
  return (
    <AppLayout role="municipality" activeKey="impact" title="">
      <div className="el-shell">
        <div className="el-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
          
          <div className="el-fade-in" style={{ marginBottom: 48, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: '#FEF3C7', color: '#92400E', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, border: '1px solid #FCD34D', whiteSpace: 'nowrap' }}>
              ⚠️ Mode démonstration - Données simulées VIBEATHON 2026
            </div>
            <div style={{ fontSize: '4rem', marginBottom: 16, marginTop: 24 }}>🌍</div>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: '3.5rem', margin: 0, lineHeight: 1.1, background: 'linear-gradient(to right, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Impact EcoLoop
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginTop: 16, maxWidth: 600 }}>
              La plateforme d'économie circulaire propulsée par l'IA qui transforme la gestion des déchets urbains.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 1000 }}>
            
            <div className="el-card el-fade-in" style={{ padding: '32px 48px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)', minWidth: 280 }}>
              <div style={{ fontSize: '3rem', fontFamily: 'Outfit', fontWeight: 800, color: '#10B981' }}>12.4</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>tonnes recyclées</div>
            </div>

            <div className="el-card el-fade-in" style={{ padding: '32px 48px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)', minWidth: 280, animationDelay: '0.1s' }}>
              <div style={{ fontSize: '3rem', fontFamily: 'Outfit', fontWeight: 800, color: '#3B82F6' }}>4 850</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>kg CO₂ évités</div>
            </div>

          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 1000, marginTop: 24 }}>
            
            <div className="el-card el-fade-in" style={{ padding: '24px 32px', minWidth: 200, animationDelay: '0.2s' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>38</div>
              <div style={{ color: 'var(--text-secondary)' }}>producteurs actifs</div>
            </div>
            
            <div className="el-card el-fade-in" style={{ padding: '24px 32px', minWidth: 200, animationDelay: '0.3s' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>15</div>
              <div style={{ color: 'var(--text-secondary)' }}>collecteurs actifs</div>
            </div>
            
            <div className="el-card el-fade-in" style={{ padding: '24px 32px', minWidth: 200, animationDelay: '0.4s' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>7</div>
              <div style={{ color: 'var(--text-secondary)' }}>entreprises de recyclage</div>
            </div>
            
          </div>

          <div className="el-fade-in" style={{ marginTop: 64, animationDelay: '0.6s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '10px 24px', borderRadius: 30 }}>
              <span style={{ fontSize: '1.5rem' }}>🧠</span>
              <span style={{ fontWeight: 700, color: '#60A5FA' }}>EcoLoop AI Engine Active</span>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
