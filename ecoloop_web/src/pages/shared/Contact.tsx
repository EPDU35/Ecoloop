export default function Contact() {
  return (
    <div style={{ padding: '3rem', maxWidth: 640, margin: '0 auto', fontFamily: "'Manrope', sans-serif" }}>
      <div className="el-eyebrow" style={{ marginBottom: '0.75rem' }}>Nous contacter</div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.75rem', marginBottom: '1.5rem' }}>Contactez EcoLoop</h1>
      <p style={{ color: 'var(--el-ink-soft)', lineHeight: 1.6, marginBottom: '2rem' }}>
        Une question ? Un projet de partenariat RSE ? Notre équipe vous répond sous 48h.
      </p>
      <div className="el-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div><strong>Email</strong><div style={{ color: 'var(--el-ink-soft)', marginTop: 4 }}>contact@ecoloop.ci</div></div>
          <div><strong>Téléphone</strong><div style={{ color: 'var(--el-ink-soft)', marginTop: 4 }}>+225 05 05 05 05 05</div></div>
          <div><strong>Adresse</strong><div style={{ color: 'var(--el-ink-soft)', marginTop: 4 }}>Abidjan, Plateau — Côte d'Ivoire</div></div>
        </div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <a className="el-btn el-btn-amber" href="/">Retour à l'accueil</a>
      </div>
    </div>
  );
}
