import { useEffect, useState } from "react";
// Pas d'import CSS ici : comme Dashboard.tsx, ce composant s'appuie sur les
// styles globaux chargés une seule fois dans main.tsx (voir landing.css).

/* ------------------------------------------------------------------
   Icônes de rôle — gardées ici (comme dans Sidebar.tsx) pour ne pas
   ajouter de fichier hors de la structure convenue.
   ------------------------------------------------------------------ */
const roleIconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };

const ProducerIcon = () => (
  <svg {...roleIconProps}><path d="M3 3h18v18H3z" /><path d="M9 9h6v6H9z" /></svg>
);
const CollectorIcon = () => (
  <svg {...roleIconProps}><path d="M3 13h18M5 13V7a2 2 0 012-2h10a2 2 0 012 2v6M5 13l-1 6h16l-1-6" /></svg>
);
const IndustrialIcon = () => (
  <svg {...roleIconProps}><path d="M3 21h18M5 21V10l5-4 5 4v11M14 21v-7h4v7" /></svg>
);
const MunicipalityIcon = () => (
  <svg {...roleIconProps}><path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" /></svg>
);

/* ------------------------------------------------------------------
   Démo du scanner IA — reprend les résultats donnés en exemple dans
   le cahier des charges (PET 94%, qualité A, 10 kg). Purement visuel,
   ne fait aucun appel réseau.
   ------------------------------------------------------------------ */
interface MaterialSample {
  name: string;
  confidence: number;
  note: string;
}

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
      <div className="el-stamp-label">Scanner IA — reconnaissance de déchets</div>
      <div className="el-stamp-row" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}>
        <div className="el-stamp-material">{sample.name}</div>
        <div className="el-stamp-confidence">{sample.confidence}%</div>
      </div>
      <div className="el-stamp-bar">
        <div className="el-stamp-bar-fill" style={{ width: `${sample.confidence}%` }} />
      </div>
      <div className="el-stamp-note">{sample.note}</div>
      <p className="el-stamp-caption">
        Une photo suffit : le type de matière, sa qualité et son poids estimé sont détectés
        automatiquement, puis publiés sur la marketplace.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <nav className="el-marketing-nav">
        <div className="el-marketing-nav-inner">
          <div className="el-marketing-brand"><span className="dot" />EcoLoop AI</div>
          <div className="el-marketing-links">
            <a href="#comment">Comment ça marche</a>
            <a href="#profils">Profils</a>
            <a href="#modele">Modèle économique</a>
            <a href="#roadmap">Roadmap</a>
          </div>
          <div className="el-marketing-cta">
            <a className="el-btn el-btn-ghost" href="/connexion">Se connecter</a>
            <a className="el-btn el-btn-solid" href="/inscription">Rejoindre EcoLoop</a>
          </div>
        </div>
      </nav>

      <section className="el-hero">
        <div className="el-hero-inner">
          <div>
            <div className="el-eyebrow">Plateforme de collecte &amp; valorisation</div>
            <h1>Vos déchets ont<br />une <em>valeur</em>.<br />EcoLoop la révèle.</h1>
            <p className="el-lead">
              EcoLoop AI connecte producteurs, collecteurs, recycleurs et mairies sur une seule
              boucle, guidée par l'intelligence artificielle : reconnaissance des déchets,
              tournées optimisées, transactions tracées.
            </p>
            <div className="el-hero-ctas">
              <a className="el-btn el-btn-amber" href="/inscription">Publier un lot de déchets</a>
              <a className="el-btn el-btn-ghost on-forest" href="#comment">Voir comment ça marche</a>
            </div>
            <div className="el-trustline">
              <span><span className="dot" />4 profils connectés</span>
              <span><span className="dot" />Commission de 5 à 10% par transaction</span>
              <span><span className="dot" />Roadmap V1 → V3</span>
            </div>
          </div>

          <ScannerStamp />
        </div>
      </section>

      <div className="el-ticketstrip">
        <div className="el-ticketstrip-inner">
          <div className="el-tstat"><div className="num">10 000</div><div className="lbl">Producteurs inscrits — objectif à 12 mois</div></div>
          <div className="el-tstat"><div className="num">1 000</div><div className="lbl">Collecteurs actifs — objectif à 12 mois</div></div>
          <div className="el-tstat"><div className="num">500 t</div><div className="lbl">Déchets récupérés — objectif à 12 mois</div></div>
          <div className="el-tstat"><div className="num">5 villes</div><div className="lbl">Couverture visée — objectif à 12 mois</div></div>
        </div>
      </div>

      <section className="el-section" id="comment">
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Le parcours d'un déchet</span>
            <h2>Une photo suffit pour démarrer</h2>
            <p>
              De la photo à la collecte, EcoLoop suit chaque lot de bout en bout — c'est ce qui
              rend la matière recyclée fiable pour les industriels.
            </p>
          </div>
          <div className="el-flow">
            <div className="el-flow-card"><div className="fn">01</div><h4>Photo</h4><p>Le producteur prend en photo son déchet.</p></div>
            <div className="el-flow-card"><div className="fn">02</div><h4>IA Vision</h4><p>Type, qualité et poids estimé détectés automatiquement.</p></div>
            <div className="el-flow-card"><div className="fn">03</div><h4>Publication</h4><p>Le lot apparaît sur la marketplace.</p></div>
            <div className="el-flow-card"><div className="fn">04</div><h4>Collecte</h4><p>QR code scanné, poids réel vérifié.</p></div>
            <div className="el-flow-card"><div className="fn">05</div><h4>Paiement</h4><p>Le producteur est payé, transaction tracée.</p></div>
          </div>
        </div>
      </section>

      <section className="el-section" id="profils" style={{ background: "var(--el-paper-2)" }}>
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Écosystème</span>
            <h2>Une plateforme, quatre rôles</h2>
            <p>Chaque acteur a son propre espace, pensé pour son usage réel — sur le terrain ou au bureau.</p>
          </div>
          <div className="el-profiles">
            <div className="el-pticket role-producer">
              <div className="el-pticket-head"><ProducerIcon /><span className="el-pticket-role">Producteur</span></div>
              <div className="el-pticket-body">
                <h3>Transformer ses déchets en revenus</h3>
                <ul>
                  <li>Scanner IA des déchets</li>
                  <li>Publication d'un lot</li>
                  <li>Suivi de collecte en direct</li>
                </ul>
              </div>
            </div>
            <div className="el-pticket role-collector">
              <div className="el-pticket-head"><CollectorIcon /><span className="el-pticket-role">Collecteur</span></div>
              <div className="el-pticket-body">
                <h3>Trouver les lots les plus rentables</h3>
                <ul>
                  <li>Marketplace intelligente</li>
                  <li>Tournées optimisées par IA</li>
                  <li>Score de réputation</li>
                </ul>
              </div>
            </div>
            <div className="el-pticket role-industrial">
              <div className="el-pticket-head"><IndustrialIcon /><span className="el-pticket-role">Recycleur</span></div>
              <div className="el-pticket-body">
                <h3>Sécuriser un approvisionnement fiable</h3>
                <ul>
                  <li>Marketplace B2B</li>
                  <li>Contrats intelligents</li>
                  <li>Prévision IA des volumes</li>
                </ul>
              </div>
            </div>
            <div className="el-pticket role-municipality">
              <div className="el-pticket-head"><MunicipalityIcon /><span className="el-pticket-role">Mairie / RSE</span></div>
              <div className="el-pticket-body">
                <h3>Mesurer et financer l'impact</h3>
                <ul>
                  <li>Carte des zones critiques</li>
                  <li>Tonnes collectées, CO2 évité</li>
                  <li>Export PDF / Excel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="el-section" id="modele">
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Modèle économique</span>
            <h2>Un exemple de transaction</h2>
            <p>
              EcoLoop n'achète pas les déchets : la plateforme organise le marché et prend une
              commission de 5 à 10% sur chaque transaction.
            </p>
          </div>
          <div className="el-example-ticket">
            <div className="el-example-head">
              <span className="el-example-tag">Exemple illustratif</span>
              <span className="el-mono" style={{ fontSize: "0.75rem", color: "var(--el-ink-soft)" }}>100 kg de plastique PET</span>
            </div>
            <div className="el-example-body">
              <div className="el-example-row"><span>Prix de vente</span><span className="val">150 FCFA / kg</span></div>
              <div className="el-example-row"><span>Reversé au producteur</span><span className="val">10 000 FCFA</span></div>
              <div className="el-example-row"><span>Reversé au collecteur</span><span className="val">4 000 FCFA</span></div>
              <div className="el-example-row"><span>Commission EcoLoop</span><span className="val">1 000 FCFA</span></div>
              <div className="el-example-row total"><span>Valeur totale de la transaction</span><span className="val">15 000 FCFA</span></div>
              <p className="el-example-note">
                Chiffres à titre d'exemple, tels que présentés dans le cahier des charges — non
                représentatifs d'une transaction réelle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="el-section" id="roadmap" style={{ background: "var(--el-paper-2)" }}>
        <div className="el-section-inner">
          <div className="el-section-head">
            <span className="el-section-eyebrow">Trajectoire produit</span>
            <h2>Une roadmap en trois étapes</h2>
            <p>EcoLoop se construit progressivement, en validant chaque brique avant la suivante.</p>
          </div>
          <div className="el-roadmap">
            <div className="el-rcard active">
              <div className="rv">V1 — VALIDATION TERRAIN</div>
              <h4>Poser les bases</h4>
              <ul><li>Producteur &amp; collecteur</li><li>Publication des déchets</li><li>Collecte, paiement manuel</li></ul>
            </div>
            <div className="el-rcard">
              <div className="rv">V2 — MARKETPLACE COMPLÈTE</div>
              <h4>Ouvrir aux industriels</h4>
              <ul><li>Industriels &amp; contrats</li><li>Mobile Money</li><li>Système de notation</li></ul>
            </div>
            <div className="el-rcard">
              <div className="rv">V3 — ECOLOOP AI</div>
              <h4>Ajouter l'intelligence</h4>
              <ul><li>Vision IA &amp; prédiction</li><li>Optimisation des tournées</li><li>Dashboard collectivités</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section className="el-section">
        <div className="el-section-inner">
          <div className="el-ctaband">
            <h2>Prêt à faire entrer vos déchets dans la boucle ?</h2>
            <p>Producteur, collecteur, recycleur ou mairie — EcoLoop AI a un espace pour vous.</p>
            <div className="el-hero-ctas">
              <a className="el-btn el-btn-amber" href="/inscription">Créer un compte</a>
              <a className="el-btn el-btn-ghost on-forest" href="#">Demander une démo</a>
            </div>
          </div>
        </div>
      </section>

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
              <a href="#comment">Comment ça marche</a>
              <a href="#profils">Profils</a>
              <a href="#modele">Modèle économique</a>
              <a href="#roadmap">Roadmap</a>
            </div>
            <div className="el-foot-col">
              <h5>Entreprise</h5>
              <a href="#">À propos</a>
              <a href="#">Partenaires RSE</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="el-marketing-footer-inner el-foot-bottom">© 2026 EcoLoop AI — Tous droits réservés.</div>
      </footer>
    </div>
  );
}
