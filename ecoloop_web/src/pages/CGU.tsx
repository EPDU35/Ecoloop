export default function CGU() {
  return (
    <div style={{ padding: '3rem', maxWidth: 720, margin: '0 auto', fontFamily: "'Manrope', sans-serif" }}>
      <div className="el-eyebrow" style={{ marginBottom: '0.75rem' }}>Légal</div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.75rem', marginBottom: '1.5rem' }}>Conditions Générales d'Utilisation</h1>
      <div style={{ color: 'var(--el-ink-soft)', lineHeight: 1.7, fontSize: '0.88rem' }}>
        <p style={{ marginBottom: '1rem' }}><strong>1. Objet</strong> — Les présentes CGU régissent l'accès et l'utilisation de la plateforme EcoLoop AI.</p>
        <p style={{ marginBottom: '1rem' }}><strong>2. Rôles</strong> — La plateforme connecte quatre types d'acteurs : producteurs, collecteurs, industriels (recycleurs) et mairies.</p>
        <p style={{ marginBottom: '1rem' }}><strong>3. Transactions</strong> — EcoLoop organise le marché et perçoit une commission de 5 à 10% sur chaque transaction. La plateforme n'achète ni ne revend les déchets.</p>
        <p style={{ marginBottom: '1rem' }}><strong>4. Données personnelles</strong> — Les données collectées sont utilisées uniquement dans le cadre du fonctionnement de la plateforme.</p>
        <p style={{ marginBottom: '1rem' }}><strong>5. Responsabilité</strong> — EcoLoop agit comme intermédiaire. La qualité et la quantité des lots relèvent de la responsabilité des utilisateurs.</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <a className="el-btn el-btn-amber" href="/">Retour à l'accueil</a>
      </div>
    </div>
  );
}
