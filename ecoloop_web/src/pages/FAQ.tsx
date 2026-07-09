export default function FAQ() {
  const faqs = [
    { q: "Comment publier un lot de déchets ?", r: "Prenez une photo de vos déchets via l'espace Producteur. L'IA reconnaît automatiquement le type, la qualité et le poids estimé." },
    { q: "Comment sont calculées les commissions ?", r: "EcoLoop prélève une commission de 5 à 10% sur chaque transaction entre producteur et collecteur." },
    { q: "Quels types de déchets sont acceptés ?", r: "PET, HDPE, Carton et Verre sont supportés. D'autres matériaux seront ajoutés dans les versions futures." },
    { q: "Comment sont reversés les paiements ?", r: "Les paiements sont traités via Mobile Money (Wave, Orange Money, MTN)." },
    { q: "Puis-je suivre mes collectes en temps réel ?", r: "Oui, chaque lot a un statut visible : disponible, en collecte, vendu." },
  ];

  return (
    <div style={{ padding: '3rem', maxWidth: 720, margin: '0 auto', fontFamily: "'Manrope', sans-serif" }}>
      <div className="el-eyebrow" style={{ marginBottom: '0.75rem' }}>Questions fréquentes</div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.75rem', marginBottom: '2rem' }}>FAQ — EcoLoop AI</h1>
      {faqs.map((faq, i) => (
        <details key={i} style={{ marginBottom: '0.75rem', border: '1px solid var(--el-line-dark)', borderRadius: 6, padding: '1rem' }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem' }}>{faq.q}</summary>
          <p style={{ color: 'var(--el-ink-soft)', marginTop: '0.75rem', lineHeight: 1.5, fontSize: '0.85rem' }}>{faq.r}</p>
        </details>
      ))}
      <div style={{ marginTop: '2rem' }}>
        <a className="el-btn el-btn-amber" href="/">Retour à l'accueil</a>
      </div>
    </div>
  );
}
