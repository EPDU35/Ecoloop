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

const PARTNER_TYPES = [
  {
    category: 'Entreprises de recyclage',
    icon: '♻️',
    color: 'var(--el-signal)',
    partners: [
      { name: 'SITRADE', location: 'Abidjan — Côte d\'Ivoire', type: 'Plastique, Métaux', desc: 'Leader ivoirien du recyclage industriel, partenaire historique V1.' },
      { name: 'COVECI', location: 'Abidjan — Côte d\'Ivoire', type: 'Verre, Carton', desc: 'Spécialiste de la valorisation verre et cellulose, contrat cadre V2.' },
      { name: 'AFRIREC', location: 'Bouaké — Côte d\'Ivoire', type: 'Métaux, DEEE', desc: 'Unité de traitement déchets électroniques et métaux, zone centre.' },
    ],
  },
  {
    category: 'Mairies & Collectivités',
    icon: '🏛️',
    color: 'var(--el-ink)',
    partners: [
      { name: 'Mairie de Cocody', location: 'Abidjan — Côte d\'Ivoire', type: 'Collecte sélective', desc: 'Pilotage 12 communes, 450k hab. — Dashboard RSE temps réel.' },
      { name: 'Mairie de Yopougon', location: 'Abidjan — Côte d\'Ivoire', type: 'Gestion déchets urbains', desc: 'Plus grande commune d\'Afrique de l\'Ouest, programme "Yop Propre".' },
      { name: 'District de Yamoussoukro', location: 'Yamoussoukro — Côte d\'Ivoire', type: 'Plan déchets territorial', desc: 'Capitale politique, déploiement carte intelligente saturation.' },
    ],
  },
  {
    category: 'ONG & Institutions',
    icon: '🤝',
    color: 'var(--el-amber)',
    partners: [
      { name: 'Fondation Friedrich Ebert', location: 'Abidjan — Côte d\'Ivoire', type: 'Appui technique', desc: 'Financement phase pilote collecteurs indépendants, formation.' },
      { name: 'GIZ ProClimat', location: 'Abidjan — Côte d\'Ivoire', type: 'MRV Carbone', desc: 'Certification crédits carbone évités par valorisation matière.' },
      { name: 'Banque Mondiale — PRODEM', location: 'Côte d\'Ivoire', type: 'Financement infrastructure', desc: 'Appui stations de transfert, équipement collecteurs V2.' },
    ],
  },
];

function PartnerCard({ name, location, type, desc }: typeof PARTNER_TYPES[0]['partners'][0]) {
  return (
    <div className="el-partner-card">
      <div className="el-partner-head">
        <h4>{name}</h4>
        <span className="el-partner-type">{type}</span>
      </div>
      <p className="el-partner-location">{location}</p>
      <p className="el-partner-desc">{desc}</p>
    </div>
  );
}

function PartnerSection({ category, icon, color, partners }: typeof PARTNER_TYPES[0]) {
  return (
    <section className="el-section" style={{ background: 'var(--el-paper-2)' }}>
      <div className="el-section-inner">
        <div className="el-section-head">
          <span className="el-section-eyebrow" style={{ color: color }}>{icon} {category}</span>
          <h2>{partners.length} partenaires actifs</h2>
          <p>Des acteurs engagés qui font vivre la boucle circulaire sur le terrain.</p>
        </div>
        <div className="el-partners-grid">
          {partners.map((p) => (
            <PartnerCard key={p.name} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY_PARTNER = [
  { icon: '📊', title: 'Traçabilité totale', desc: 'Chaque kg collecté est tracé du producteur à l\'usine. Preuve d\'impact pour vos rapports RSE.' },
  { icon: '🌍', title: 'Mesure CO₂ évité', desc: 'Calcul automatique des tonnes de CO₂ évitées par filière. Certificats téléchargeables.' },
  { icon: '👥', title: 'Emploi local', desc: 'Soutien direct aux collecteurs indépendants. Indicateurs emplois créés / revenus générés.' },
  { icon: '📈', title: 'Conformité règlementaire', desc: 'Respect loi anti-gaspillage, décret déchets, objectifs ONU ODD. Export données pour audits.' },
  { icon: '🔌', title: 'API & Intégration', desc: 'Connectez vos SI (ERP, BI, SIG) via API REST. Webhooks temps réel collectes / paiements.' },
  { icon: '🤝', title: 'Accompagnement dédié', desc: 'Chef de projet EcoLoop attitré. Formation équipes, ateliers terrain, revues trimestrielles.' },
];

function WhyItem({ icon, title, desc }: typeof WHY_PARTNER[0]) {
  return (
    <div className="el-why-card">
      <div className="el-why-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function Partners() {
  return (
    <div className="el-fade-in" style={{ background: 'var(--el-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <section className="el-section el-section-hero" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow">Partenariats</span>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                Rejoignez l'<br /><em style={{ color: 'var(--el-amber)' }}>écosystème</em> EcoLoop
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--el-ink-soft)', lineHeight: 1.7 }}>
                Mairies, industriels, ONG, bailleurs : EcoLoop vous donne les outils pour mesurer, 
                valoriser et financer l'impact de la collecte de déchets sur votre territoire.
              </p>
            </div>
          </div>
        </section>

        <section className="el-section">
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow">Pourquoi nous rejoindre ?</span>
              <h2>6 raisons de devenir partenaire</h2>
            </div>
            <div className="el-why-grid">
              {WHY_PARTNER.map((w) => (
                <WhyItem key={w.title} {...w} />
              ))}
            </div>
          </div>
        </section>

        {PARTNER_TYPES.map((cat) => (
          <PartnerSection key={cat.category} {...cat} />
        ))}

        <section className="el-section" style={{ background: 'var(--el-forest)', color: 'var(--el-paper)' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow" style={{ color: 'var(--el-amber)' }}>Prêt à démarrer ?</span>
              <h2 style={{ color: 'var(--el-paper)' }}>Devenez partenaire EcoLoop</h2>
              <p style={{ color: 'var(--el-paper-2)' }}>Remplissez le formulaire — notre équipe partenariats vous recontacte sous 48h pour définir le cadre de collaboration.</p>
            </div>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <a className="el-btn el-btn-amber" href="/contact?type=partenariat" style={{ width: '100%', justifyContent: 'center' }}>
                Candidater comme partenaire
              </a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}