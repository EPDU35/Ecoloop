import { useNavigate } from 'react-router-dom';

function PublicHeader() {
  const navigate = useNavigate();
  return (
    <nav className="el-marketing-nav" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--el-forest)' }}>
      <div className="el-marketing-nav-inner">
        <button 
          onClick={() => navigate('/')} 
          className="el-marketing-brand" 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}
        >
          <span className="dot" />EcoLoop AI
        </button>
        <div className="el-marketing-links">
          <button onClick={() => navigate('/#comment')} className="el-link-muted" style={{ border: 'none', color: 'var(--el-paper-2)' }}>Comment ça marche</button>
          <button onClick={() => navigate('/#profils')} className="el-link-muted" style={{ border: 'none', color: 'var(--el-paper-2)' }}>Profils</button>
          <button onClick={() => navigate('/about')} className="el-link-muted" style={{ border: 'none', color: 'var(--el-paper-2)' }}>À propos</button>
          <button onClick={() => navigate('/contact')} className="el-link-muted" style={{ border: 'none', color: 'var(--el-paper-2)' }}>Contact</button>
        </div>
        <div className="el-marketing-cta">
          <a className="el-btn el-btn-ghost" href="/connexion">Se connecter</a>
          <a className="el-btn el-btn-solid" href="/inscription">Rejoindre EcoLoop</a>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter() {
  const navigate = useNavigate();
  return (
    <footer className="el-marketing-footer">
      <div className="el-marketing-footer-inner">
        <div>
          <div className="el-marketing-brand" style={{ marginBottom: "0.6rem" }}><span className="dot" />EcoLoop AI</div>
          <p style={{ fontSize: "0.8rem", color: "var(--el-ink-soft)", maxWidth: 260, lineHeight: 1.5, fontFamily: "'Manrope', sans-serif" }}>
            La boucle intelligente qui connecte producteurs, collecteurs et recycleurs de déchets.
          </p>
        </div>
        <div className="el-foot-cols">
          <div className="el-foot-col">
            <h5>Plateforme</h5>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--el-ink-soft)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Accueil</button>
            <button onClick={() => navigate('/about')} style={{ background: 'none', border: 'none', color: 'var(--el-ink-soft)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>À propos</button>
          </div>
          <div className="el-foot-col">
            <h5>Entreprise</h5>
            <button onClick={() => navigate('/partners')} style={{ background: 'none', border: 'none', color: 'var(--el-ink-soft)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Partenaires RSE</button>
            <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: 'var(--el-ink-soft)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Contact</button>
          </div>
        </div>
      </div>
      <div className="el-marketing-footer-inner el-foot-bottom">© 2026 EcoLoop AI — Tous droits réservés.</div>
    </footer>
  );
}

const STEPS_PRODUCTEUR = [
  { step: '01', title: 'Déclarez', desc: 'Prenez en photo vos déchets via l\'app. L\'IA identifie le type, la qualité et estime le poids.', icon: '📸' },
  { step: '02', title: 'Publiez', desc: 'Le lot est publié sur la marketplace. Les collecteurs proches sont notifiés automatiquement.', icon: '📤' },
  { step: '03', title: 'Collecte', desc: 'Un collecteur accepte la mission, vient sur place, scanne le QR code et pèse le lot réel.', icon: '🚚' },
  { step: '04', title: 'Valorisation', desc: 'Le déchet rejoint l\'industriel recycleur. La traçabilité est garantie de bout en bout.', icon: '♻️' },
  { step: '05', title: 'Récompense', desc: 'Vous recevez votre paiement (Mobile Money / virement) et vos points EcoLoop.', icon: '💰' },
];

const STEPS_COLLECTEUR = [
  { step: '01', title: 'Trouvez', desc: 'Ouvrez la marketplace. Filtrez par type de déchet, distance, poids estimé et gain.', icon: '🔍' },
  { step: '02', title: 'Acceptez', desc: 'Réservez la mission. Le producteur reçoit une notification. La tournée s\'optimise automatiquement.', icon: '✅' },
  { step: '03', title: 'Collectez', desc: 'Rendez-vous sur place. Scannez le QR code. Saisissez le poids réel. Ajoutez une photo de preuve.', icon: '📦' },
  { step: '04', title: 'Livrez', desc: 'Déposez le lot chez l\'industriel partenaire. Validez la livraison via l\'app.', icon: '🏭' },
  { step: '05', title: 'Gagnez', desc: 'Votre gain est crédité instantanément. Votre score de réputation augmente.', icon: '💵' },
];

const STEPS_INDUSTRIEL = [
  { step: '01', title: 'Trouvez', desc: 'Accédez au catalogue de matières disponibles. Filtrez par type, qualité, localisation, volume.', icon: '🔍' },
  { step: '02', title: 'Achetez', desc: 'Passez commande ou faites une offre. Les contrats cadres automatisent les achats récurrents.', icon: '💳' },
  { step: '03', title: 'Recevez', desc: 'La livraison est planifiée. Vous contrôlez la qualité à la réception. Traçabilité complète.', icon: '📦' },
  { step: '04', title: 'Transformez', desc: 'Intégrez la matière dans votre process. EcoLoop génère les certificats de valorisation.', icon: '⚙️' },
];

const STEPS_MAIRie = [
  { step: '01', title: 'Surveillez', desc: 'Visualisez en temps réel l\'état des zones de collecte sur la carte interactive.', icon: '🗺️' },
  { step: '02', title: 'Anticipez', desc: 'L\'IA prédit les zones à risque de saturation. Recevez des alertes 4 jours avant.', icon: '⚠️' },
  { step: '03', title: 'Intervenez', desc: 'Programmez des collectes préventives. Mobilisez vos équipes ou les collecteurs partenaires.', icon: '🚛' },
  { step: '04', title: 'Mesurez', desc: 'Générez des rapports d\'impact : tonnes collectées, CO₂ évité, taux de valorisation.', icon: '📊' },
];

function StepCard({ step, title, desc, icon }: { step: string; title: string; desc: string; icon: string }) {
  return (
    <div className="el-step-card">
      <div className="el-step-badge">{step}</div>
      <div className="el-step-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function RoleSection({ title, icon, steps, colorClass }: { title: string; icon: string; steps: typeof STEPS_PRODUCTEUR; colorClass: string }) {
  return (
    <section className={`el-section ${colorClass}`} style={{ background: 'var(--el-paper-2)' }}>
      <div className="el-section-inner">
        <div className="el-section-head">
          <span className="el-section-eyebrow">{icon} {title}</span>
          <h2>Parcours {title.toLowerCase()}</h2>
          <p>Chaque étape est conçue pour être simple, rapide et tracée de bout en bout.</p>
        </div>
        <div className="el-steps-grid">
          {steps.map((s) => (
            <StepCard key={s.step} step={s.step} title={s.title} desc={s.desc} icon={s.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Fonctionnement() {
  return (
    <div className="el-fade-in" style={{ background: 'var(--el-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <section className="el-section el-section-hero" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow">Fonctionnement</span>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                Comment ça marche ?
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--el-ink-soft)', lineHeight: 1.7 }}>
                EcoLoop connecte les 4 acteurs de la boucle circulaire. Chaque rôle a son parcours fluide, 
                piloté par l'IA — de la photo du déchet au certificat de valorisation.
              </p>
            </div>
          </div>
        </section>

        <RoleSection title="Producteur" icon="🏭" steps={STEPS_PRODUCTEUR} colorClass="role-producer" />
        <RoleSection title="Collecteur" icon="🚚" steps={STEPS_COLLECTEUR} colorClass="role-collector" />
        <RoleSection title="Industriel / Recycleur" icon="♻️" steps={STEPS_INDUSTRIEL} colorClass="role-industrial" />
        <RoleSection title="Mairie / Collectivité" icon="🏛️" steps={STEPS_MAIRie} colorClass="role-municipality" />

        <section className="el-section" style={{ background: 'var(--el-forest)', color: 'var(--el-paper)' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow" style={{ color: 'var(--el-amber)' }}>Prêt à rejoindre la boucle ?</span>
              <h2 style={{ color: 'var(--el-paper)' }}>Choisissez votre rôle et commencez dès aujourd'hui</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="el-btn el-btn-amber" href="/inscription?role=producteur">Je suis producteur</a>
              <a className="el-btn el-btn-ghost" style={{ borderColor: 'var(--el-amber)', color: 'var(--el-amber)' }} href="/inscription?role=collecteur">Je suis collecteur</a>
              <a className="el-btn el-btn-ghost" style={{ borderColor: 'var(--el-amber)', color: 'var(--el-amber)' }} href="/inscription?role=industriel">Je suis industriel</a>
              <a className="el-btn el-btn-ghost" style={{ borderColor: 'var(--el-amber)', color: 'var(--el-amber)' }} href="/inscription?role=mairie">Je représente une mairie</a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}