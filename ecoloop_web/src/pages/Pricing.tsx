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

const PRICING_CARDS = [
  {
    role: 'Producteur',
    icon: '🏭',
    price: 'Gratuit',
    subtitle: 'Commission sur ventes uniquement',
    features: [
      'Publication illimitée de lots',
      'Scanner IA déchets inclus',
      'Suivi collectes temps réel',
      'Paiement Mobile Money / virement',
      'Tableau de bord impact écologique',
      'Historique complet des transactions',
    ],
    cta: 'Créer un compte producteur',
    href: '/inscription?role=producteur',
    highlight: false,
  },
  {
    role: 'Collecteur',
    icon: '🚚',
    price: 'Gratuit',
    subtitle: 'Commission 5-10% par collecte',
    features: [
      'Accès marketplace missions',
      'Optimisation tournées IA',
      'Scanner QR + preuve photo',
      'Paiement instantané',
      'Score réputation collecteur',
      'Zone de couverture personnalisable',
    ],
    cta: 'Devenir collecteur',
    href: '/inscription?role=collecteur',
    highlight: false,
  },
  {
    role: 'Industriel / Recycleur',
    icon: '♻️',
    price: 'Sur devis',
    subtitle: 'Abonnement mensuel + commission',
    features: [
      'Catalogue matières temps réel',
      'Contrats cadres automatisés',
      'Prévision volumes par IA',
      'Certificats valorisation (CO₂, tonnes)',
      'API d\'intégration ERP',
      'Gestion fournisseurs & qualité',
      'Reporting RSE complet',
    ],
    cta: 'Demander une démo',
    href: '/contact?role=industriel',
    highlight: true,
  },
  {
    role: 'Mairie / Collectivité',
    icon: '🏛️',
    price: 'Sur devis',
    subtitle: 'Partenariat cadre annuel',
    features: [
      'Carte intelligente zones critiques',
      'Alertes prédictives saturation (J-4)',
      'Programmation collectes préventives',
      'Tableau de bord impact territorial',
      'Rapports PDF/Excel automatiques',
      'Gestion collecteurs agréés',
      'Indicateurs CO₂ évité, emplois créés',
    ],
    cta: 'Contacter le commercial',
    href: '/contact?role=mairie',
    highlight: true,
  },
];

function PricingCard({ role, icon, price, subtitle, features, cta, href, highlight }: typeof PRICING_CARDS[0]) {
  return (
    <article className={`el-pricing-card ${highlight ? 'highlight' : ''}`}>
      <div className="el-pricing-head">
        <span className="el-pricing-icon">{icon}</span>
        <h3>{role}</h3>
      </div>
      <div className="el-pricing-price">
        <span className="el-price-amount">{price}</span>
        <span className="el-price-sub">{subtitle}</span>
      </div>
      <ul className="el-pricing-features">
        {features.map((f, i) => (
          <li key={i}><span className="el-check" />{f}</li>
        ))}
      </ul>
      <a className={`el-btn ${highlight ? 'el-btn-emerald' : 'el-btn-amber'}`} href={href} style={{ width: '100%', marginTop: 'auto' }}>
        {cta}
      </a>
    </article>
  );
}

const MODEL_STEPS = [
  { step: '1', title: 'Producteur publie', desc: 'Photo + IA → lot publié sur marketplace', icon: '📸' },
  { step: '2', title: 'Collecteur récupère', desc: 'Mission acceptée → collecte → QR + poids réel', icon: '🚚' },
  { step: '3', title: 'Industriel achète', desc: 'Commande validée → livraison → réception', icon: '🏭' },
  { step: '4', title: 'EcoLoop commissionne', desc: '5-10% sur transaction → répartition auto', icon: '💰' },
  { step: '5', title: 'Acteurs payés', desc: 'Producteur + collecteur crédités instantanément', icon: '⚡' },
];

function ModelStep({ step, title, desc, icon }: typeof MODEL_STEPS[0]) {
  return (
    <div className="el-model-step">
      <div className="el-model-step-num">{step}</div>
      <div className="el-model-step-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="el-fade-in" style={{ background: 'var(--el-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <section className="el-section el-section-hero" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow">Modèle économique</span>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                Tarifs simples,<br /><em style={{ color: 'var(--el-amber)' }}>alignés</em> sur vos intérêts
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--el-ink-soft)', lineHeight: 1.7 }}>
                Pas d'abonnement caché. EcoLoop ne gagne que quand vous gagnez : commission sur 
                transaction réussie. Chaque rôle a son modèle, transparent et sans surprise.
              </p>
            </div>
          </div>
        </section>

        <section className="el-section" style={{ background: 'var(--el-paper-2)' }}>
          <div className="el-section-inner">
            <div className="el-pricing-grid">
              {PRICING_CARDS.map((card) => (
                <PricingCard key={card.role} {...card} />
              ))}
            </div>
          </div>
        </section>

        <section className="el-section">
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow">Fonctionnement</span>
              <h2>Comment l'argent circule</h2>
              <p>Une transaction, 5 étapes, 0 opacité. Chaque acteur voit où va chaque franc CFA.</p>
            </div>
            <div className="el-model-flow">
              {MODEL_STEPS.map((s) => (
                <ModelStep key={s.step} {...s} />
              ))}
            </div>
          </div>
        </section>

        <section className="el-section" style={{ background: 'var(--el-paper-2)' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow">Transparence</span>
              <h2>Exemple chiffré : 100 kg PET</h2>
            </div>
            <div className="el-example-ticket" style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className="el-example-head">
                <span className="el-example-tag">Exemple illustratif</span>
                <span className="el-mono" style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>100 kg plastique PET — Qualité A</span>
              </div>
              <div className="el-example-body">
                <div className="el-example-row"><span>Prix de vente industriel</span><span className="val">150 FCFA / kg</span></div>
                <div className="el-example-row"><span>Valeur brute lot</span><span className="val">15 000 FCFA</span></div>
                <div className="el-example-row"><span>Reversé au producteur (60%)</span><span className="val">9 000 FCFA</span></div>
                <div className="el-example-row"><span>Reversé au collecteur (27%)</span><span className="val">4 050 FCFA</span></div>
                <div className="el-example-row"><span>Commission EcoLoop (10%)</span><span className="val">1 500 FCFA</span></div>
                <div className="el-example-row"><span>Frais transaction / Mobile Money (3%)</span><span className="val">450 FCFA</span></div>
                <div className="el-example-row total"><span>Total distribué</span><span className="val">15 000 FCFA</span></div>
                <p className="el-example-note">
                  Chiffres à titre d'exemple — commissions réelles : 5-10% selon volume et contrat. 
                  Frais Mobile Money selon opérateur (Orange Money, Moov Money, Wave).
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="el-section" style={{ background: 'var(--el-forest)', color: 'var(--el-paper)' }}>
          <div className="el-section-inner">
            <div className="el-section-head" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 3rem' }}>
              <span className="el-section-eyebrow" style={{ color: 'var(--el-amber)' }}>Questions fréquentes</span>
              <h2 style={{ color: 'var(--el-paper)' }}>Tout comprendre sur la facturation</h2>
            </div>
            <div className="el-faq-grid" style={{ maxWidth: 800, margin: '0 auto' }}>
              <details className="el-faq-item">
                <summary>Y a-t-il des frais d'inscription ?</summary>
                <p>Non. L'inscription est gratuite pour tous les rôles. Seules les transactions réussies génèrent une commission.</p>
              </details>
              <details className="el-faq-item">
                <summary>Comment sont calculées les commissions ?</summary>
                <p>Pourcentage fixe (5-10%) sur le montant HT de la transaction entre producteur et industriel. Le taux dépend du volume mensuel et du type de contrat.</p>
              </details>
              <details className="el-faq-item">
                <summary>Qui paie les frais Mobile Money ?</summary>
                <p>Les frais opérateur (Orange Money, Moov Money, Wave) sont déduits automatiquement avant répartition. Ils varient selon l'opérateur et le montant (environ 1-3%).</p>
              </details>
              <details className="el-faq-item">
                <summary>Puis-je avoir un contrat cadre avec taux fixe ?</summary>
                <p>Oui, pour les industriels et mairies avec volumes prévisibles. Contactez notre équipe commerciale via la page Contact.</p>
              </details>
              <details className="el-faq-item">
                <summary>Comment sont payés les collecteurs ?</summary>
                <p>Paiement instantané (Mobile Money) dès validation de la livraison chez l'industriel. Le collecteur voit son solde en temps réel dans l'app.</p>
              </details>
              <details className="el-faq-item">
                <summary>Y a-t-il un engagement de durée ?</summary>
                <p>Aucun. Vous pouvez arrêter d'utiliser la plateforme à tout moment. Les contrats cadres industriels/mairies sont annuels reconductibles.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="el-section">
          <div className="el-section-inner">
            <div className="el-ctaband">
              <h2>Prêt à rejoindre la boucle ?</h2>
              <p>Choisissez votre rôle et créez votre compte en 2 minutes. Gratuit, sans engagement.</p>
              <div className="el-hero-ctas">
                <a className="el-btn el-btn-amber" href="/inscription?role=producteur">Je suis producteur</a>
                <a className="el-btn el-btn-ghost" style={{ borderColor: 'var(--el-amber)', color: 'var(--el-amber)' }} href="/inscription?role=collecteur">Je suis collecteur</a>
                <a className="el-btn el-btn-ghost" style={{ borderColor: 'var(--el-amber)', color: 'var(--el-amber)' }} href="/contact?role=industriel">Je suis industriel</a>
                <a className="el-btn el-btn-ghost" style={{ borderColor: 'var(--el-amber)', color: 'var(--el-amber)' }} href="/contact?role=mairie">Je représente une mairie</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}