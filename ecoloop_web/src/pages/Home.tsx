import { useEffect, useState } from "react";

/* ------------------------------------------------------------------
   Icônes inline — pas de dépendance externe sur la landing publique
   ------------------------------------------------------------------ */
const roleIconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };

const ProducerIcon = () => (
  <svg {...roleIconProps}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
);
const CollectorIcon = () => (
  <svg {...roleIconProps}><path d="M3 13h18M5 13V7a2 2 0 012-2h10a2 2 0 012 2v6M5 13l-1 6h16l-1-6" /></svg>
);
const IndustrialIcon = () => (
  <svg {...roleIconProps}><path d="M3 21h18M5 21V10l5-4 5 4v11M14 21v-7h4v7" /></svg>
);
const MunicipalityIcon = () => (
  <svg {...roleIconProps}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

/* ------------------------------------------------------------------
   Démo scanner IA — purement visuelle, aucun appel réseau
   ------------------------------------------------------------------ */
interface MaterialSample { name: string; confidence: number; note: string; }

const MATERIAL_SAMPLES: MaterialSample[] = [
  { name: "PET", confidence: 94, note: "QUALITÉ A · POIDS ESTIMÉ 10 KG" },
  { name: "CARTON", confidence: 88, note: "QUALITÉ B · POIDS ESTIMÉ 6 KG" },
  { name: "VERRE", confidence: 97, note: "QUALITÉ A · POIDS ESTIMÉ 14 KG" },
  { name: "MÉTAL", confidence: 91, note: "QUALITÉ A · POIDS ESTIMÉ 3 KG" },
];

function ScannerStamp() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % MATERIAL_SAMPLES.length);
        setVisible(true);
      }, 250);
      return () => clearTimeout(timeout);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const sample = MATERIAL_SAMPLES[index];

  return (
    <div className="el-stamp">
      <div className="el-stamp-label">🔬 Scanner IA — Reconnaissance de déchets</div>
      <div className="el-stamp-row" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}>
        <div className="el-stamp-material">{sample.name}</div>
        <div className="el-stamp-confidence">{sample.confidence}%</div>
      </div>
      <div className="el-stamp-bar">
        <div className="el-stamp-bar-fill" style={{ width: `${sample.confidence}%` }} />
      </div>
      <div className="el-stamp-note">{sample.note}</div>
      <p className="el-stamp-caption">
        Une photo suffit — le type de matière, la qualité et le poids estimé sont détectés
        automatiquement par l'IA, puis publiés instantanément sur la marketplace.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------
   Nav mobile avec hamburger
   ------------------------------------------------------------------ */
function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Fermer sur scroll
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, []);

  return (
    <nav className="el-marketing-nav">
      <div className="el-marketing-nav-inner">
        <div className="el-marketing-brand">
          <span className="dot" />
          EcoLoop AI
        </div>

        {/* Liens desktop */}
        <div className="el-marketing-links">
          <a href="#comment">Comment ça marche</a>
          <a href="#profils">Pour qui ?</a>
          <a href="#modele">Tarifs</a>
          <a href="#roadmap">Roadmap</a>
        </div>

        {/* CTAs desktop */}
        <div className="el-marketing-cta el-marketing-cta--desktop">
          <a className="el-btn el-btn-ghost" href="/connexion">Se connecter</a>
          <a className="el-btn el-btn-solid" href="/inscription">Commencer gratuitement</a>
        </div>

        {/* Hamburger mobile */}
        <button
          className={`el-nav-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="el-mobile-menu">
          <a href="#comment" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
          <a href="#profils" onClick={() => setMenuOpen(false)}>Pour qui ?</a>
          <a href="#modele" onClick={() => setMenuOpen(false)}>Tarifs</a>
          <a href="#roadmap" onClick={() => setMenuOpen(false)}>Roadmap</a>
          <div className="el-mobile-menu-ctas">
            <a className="el-btn el-btn-ghost" href="/connexion">Se connecter</a>
            <a className="el-btn el-btn-solid" href="/inscription">Commencer gratuitement</a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------
   Page principale
   ------------------------------------------------------------------ */
export default function Home() {
  return (
    <div>
      <MarketingNav />

      {/* HERO */}
      <section className="el-hero">
        <div className="el-hero-inner">
          <div>
            <div className="el-eyebrow">♻️ Plateforme de valorisation des déchets — Afrique de l'Ouest</div>
            <h1>
              L'intelligence qui transforme<br />les déchets en <em>ressources</em>.<br />Anticiper. Optimiser. Recycler.
            </h1>
            <p className="el-lead">
              EcoLoop AI connecte producteurs de déchets, collecteurs, recycleurs et mairies
              sur une seule plateforme intelligente — reconnaissance IA, tournées optimisées,
              paiements tracés en temps réel.
            </p>
            <div className="el-hero-ctas">
              <a className="el-btn el-btn-amber" href="/inscription">Publier mon premier lot</a>
              <a className="el-btn el-btn-ghost on-forest" href="#comment">Voir comment ça marche →</a>
            </div>
            <div className="el-trustline">
              <span><span className="dot" />4 types d'acteurs connectés</span>
              <span><span className="dot" />Commission 5–10% par transaction</span>
              <span><span className="dot" />IA Vision embarquée</span>
            </div>
          </div>
          <ScannerStamp />
        </div>
      </section>

      {/* MÉTRIQUES */}
      <div className="el-ticketstrip">
        <div className="el-ticketstrip-inner">
          <div className="el-tstat"><div className="num">10 000</div><div className="lbl">Producteurs visés — objectif 12 mois</div></div>
          <div className="el-tstat"><div className="num">1 000</div><div className="lbl">Collecteurs actifs — objectif 12 mois</div></div>
          <div className="el-tstat"><div className="num">500 t</div><div className="lbl">Déchets valorisés — objectif 12 mois</div></div>
          <div className="el-tstat"><div className="num">5 villes</div><div className="lbl">Couverture géographique visée</div></div>
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <section className="el-section" id="comment">
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Le parcours d'un déchet</span>
            <h2>Une photo suffit pour démarrer</h2>
            <p>
              De la photo au paiement, EcoLoop suit chaque lot de bout en bout — traçabilité
              garantie, données fiables pour les industriels et les collectivités.
            </p>
          </div>
          <div className="el-flow">
            <div className="el-flow-card">
              <div className="fn">01</div>
              <h4>📸 Photo</h4>
              <p>Le producteur photographie son lot de déchets depuis l'application mobile.</p>
            </div>
            <div className="el-flow-card">
              <div className="fn">02</div>
              <h4>🤖 IA Vision</h4>
              <p>Type de matière, qualité et poids estimé sont détectés automatiquement.</p>
            </div>
            <div className="el-flow-card">
              <div className="fn">03</div>
              <h4>📋 Publication</h4>
              <p>Le lot est publié sur la marketplace et visible par tous les collecteurs.</p>
            </div>
            <div className="el-flow-card">
              <div className="fn">04</div>
              <h4>📦 Collecte</h4>
              <p>QR code scanné sur place, poids réel pesé et validé par les deux parties.</p>
            </div>
            <div className="el-flow-card">
              <div className="fn">05</div>
              <h4>💰 Paiement</h4>
              <p>Le producteur est payé par Mobile Money, la transaction est tracée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILS */}
      <section className="el-section" id="profils" style={{ background: "var(--el-paper-2)" }}>
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Écosystème</span>
            <h2>Une plateforme, quatre acteurs</h2>
            <p>Chaque profil dispose d'un espace dédié, conçu pour son usage réel — sur le terrain comme au bureau.</p>
          </div>
          <div className="el-profiles">
            <div className="el-pticket role-producer">
              <div className="el-pticket-head"><ProducerIcon /><span className="el-pticket-role">Producteur</span></div>
              <div className="el-pticket-body">
                <h3>Transformer vos déchets en revenus</h3>
                <ul>
                  <li>Scanner IA des déchets en photo</li>
                  <li>Publication de lot en 2 minutes</li>
                  <li>Paiement Mobile Money garanti</li>
                  <li>Suivi de collecte en temps réel</li>
                </ul>
              </div>
            </div>
            <div className="el-pticket role-collector">
              <div className="el-pticket-head"><CollectorIcon /><span className="el-pticket-role">Collecteur</span></div>
              <div className="el-pticket-body">
                <h3>Trouver les lots les plus rentables</h3>
                <ul>
                  <li>Marketplace géolocalisée</li>
                  <li>Tournées optimisées par IA</li>
                  <li>Score de réputation intégré</li>
                  <li>QR code de validation sur place</li>
                </ul>
              </div>
            </div>
            <div className="el-pticket role-industrial">
              <div className="el-pticket-head"><IndustrialIcon /><span className="el-pticket-role">Recycleur</span></div>
              <div className="el-pticket-body">
                <h3>Sécuriser un approvisionnement fiable</h3>
                <ul>
                  <li>Marketplace B2B qualifiée par IA</li>
                  <li>Contrats intelligents récurrents</li>
                  <li>Prévision IA des volumes</li>
                  <li>Rapports traçabilité exportables</li>
                </ul>
              </div>
            </div>
            <div className="el-pticket role-municipality">
              <div className="el-pticket-head"><MunicipalityIcon /><span className="el-pticket-role">Mairie / RSE</span></div>
              <div className="el-pticket-body">
                <h3>Mesurer et piloter l'impact</h3>
                <ul>
                  <li>Carte des zones à forte densité</li>
                  <li>Tonnes collectées, CO₂ évité</li>
                  <li>Dashboard collectivités</li>
                  <li>Export PDF / Excel / API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODÈLE ÉCONOMIQUE */}
      <section className="el-section" id="modele">
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Modèle économique</span>
            <h2>Simple, transparent, sans surprise</h2>
            <p>
              EcoLoop n'achète pas les déchets. La plateforme organise le marché et prélève
              une commission de 5 à 10% par transaction validée — zéro frais fixe.
            </p>
          </div>
          <div className="el-example-ticket">
            <div className="el-example-head">
              <span className="el-example-tag">Exemple illustratif</span>
              <span className="el-mono" style={{ fontSize: "0.75rem", color: "var(--el-ink-soft)" }}>100 kg de plastique PET · Qualité A</span>
            </div>
            <div className="el-example-body">
              <div className="el-example-row"><span>Prix de vente négocié</span><span className="val">150 FCFA / kg</span></div>
              <div className="el-example-row"><span>Reversé au producteur</span><span className="val">10 000 FCFA</span></div>
              <div className="el-example-row"><span>Reversé au collecteur</span><span className="val">4 000 FCFA</span></div>
              <div className="el-example-row"><span>Commission EcoLoop (6,7%)</span><span className="val">1 000 FCFA</span></div>
              <div className="el-example-row total"><span>Valeur totale de la transaction</span><span className="val">15 000 FCFA</span></div>
              <p className="el-example-note">
                Chiffres illustratifs, présentés à titre d'exemple — non représentatifs d'une transaction réelle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="el-section" id="roadmap" style={{ background: "var(--el-paper-2)" }}>
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Trajectoire produit</span>
            <h2>Trois étapes, une vision</h2>
            <p>EcoLoop se construit progressivement en validant chaque brique avec le terrain avant de passer à la suivante.</p>
          </div>
          <div className="el-roadmap">
            <div className="el-rcard active">
              <div className="rv">V1 · EN COURS — VALIDATION TERRAIN</div>
              <h4>Poser les bases</h4>
              <ul>
                <li>Producteur & collecteur</li>
                <li>Publication des déchets</li>
                <li>Collecte, paiement manuel tracé</li>
                <li>Scanner IA V1</li>
              </ul>
            </div>
            <div className="el-rcard">
              <div className="rv">V2 — MARKETPLACE COMPLÈTE</div>
              <h4>Ouvrir aux industriels</h4>
              <ul>
                <li>Recycleurs & contrats</li>
                <li>Mobile Money automatisé</li>
                <li>Système de notation croisé</li>
                <li>Dashboard collectivités</li>
              </ul>
            </div>
            <div className="el-rcard">
              <div className="rv">V3 — ECOLOOP AI</div>
              <h4>Ajouter l'intelligence</h4>
              <ul>
                <li>Vision IA & prédiction des volumes</li>
                <li>Optimisation des tournées</li>
                <li>Détection de fraude automatique</li>
                <li>API ouverte & partenariats</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="el-section">
        <div className="el-section-inner">
          <div className="el-ctaband">
            <h2>Prêt à faire entrer vos déchets dans la boucle ?</h2>
            <p>Producteur, collecteur, recycleur ou mairie — EcoLoop AI a un espace conçu pour vous.</p>
            <div className="el-hero-ctas">
              <a className="el-btn el-btn-amber" href="/inscription">Créer un compte gratuit</a>
              <a className="el-btn el-btn-ghost on-forest" href="mailto:contact@ecoloop.ci">Demander une démo →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="el-marketing-footer">
        <div className="el-marketing-footer-inner">
          <div>
            <div className="el-marketing-brand" style={{ marginBottom: "0.6rem" }}>
              <span className="dot" />EcoLoop AI
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--el-ink-soft)", maxWidth: 260, lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>
              La boucle intelligente qui connecte producteurs, collecteurs et recycleurs de déchets en Afrique de l'Ouest.
            </p>
          </div>
          <div className="el-foot-cols">
            <div className="el-foot-col">
              <h5>Plateforme</h5>
              <a href="#comment">Comment ça marche</a>
              <a href="#profils">Pour qui ?</a>
              <a href="#modele">Tarifs</a>
              <a href="#roadmap">Roadmap</a>
            </div>
            <div className="el-foot-col">
              <h5>Entreprise</h5>
              <a href="/about">À propos</a>
              <a href="/partners">Partenaires RSE</a>
              <a href="mailto:contact@ecoloop.ci">Contact</a>
            </div>
            <div className="el-foot-col">
              <h5>Légal</h5>
              <a href="/cgu">Conditions d'utilisation</a>
              <a href="/faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="el-marketing-footer-inner el-foot-bottom">
          © 2026 EcoLoop AI — Tous droits réservés · Abidjan, Côte d'Ivoire
        </div>
      </footer>
    </div>
  );
}
