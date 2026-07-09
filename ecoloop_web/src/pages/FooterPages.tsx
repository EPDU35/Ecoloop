import { useState } from 'react';
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
          <p style={{ fontSize: "0.8rem", color: "var(--el-ink-soft)", maxWidth: 260, lineHeight: 1.5 }}>
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

export function About() {
  const navigate = useNavigate();
  return (
    <div className="el-fade-in" style={{ background: 'var(--el-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => navigate('/')} 
          className="el-link-muted" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--el-ink)' }}
        >
          ← Retour à l'accueil
        </button>
        
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.5rem', marginBottom: '1.5rem' }}>À propos d'EcoLoop AI</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>
          EcoLoop AI est né de la volonté de révolutionner la gestion des déchets à Abidjan et en Côte d'Ivoire. Nous croyons que chaque déchet possède une valeur intrinsèque et qu'avec l'aide de l'intelligence artificielle, nous pouvons organiser une économie circulaire pérenne, éthique et performante.
        </p>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', marginTop: '2.5rem', marginBottom: '1rem' }}>Notre Vision</h2>
        <p style={{ lineHeight: 1.6, color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>
          Créer un écosystème connecté où la collecte n'est plus une contrainte mais une opportunité économique pour les producteurs (ménages, entreprises) et les collecteurs indépendants. Grâce à la traçabilité des matériaux, nous garantissons aux industriels recycleurs un flux d'approvisionnement stable et de haute qualité.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}

export function Partners() {
  const navigate = useNavigate();
  return (
    <div className="el-fade-in" style={{ background: 'var(--el-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => navigate('/')} 
          className="el-link-muted" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--el-ink)' }}
        >
          ← Retour à l'accueil
        </button>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Partenaires RSE</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>
          Mairies, institutions publiques, et grandes entreprises engagées dans le développement durable en Côte d'Ivoire : EcoLoop AI vous fournit des indicateurs précis pour mesurer, valoriser et financer l'impact écologique et social de la collecte de déchets.
        </p>
        <div className="el-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Pourquoi nous rejoindre ?</h3>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.6, color: 'var(--el-ink-soft)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Traçabilité totale des déchets collectés sur votre territoire.</li>
            <li>Mesure directe du CO₂ évité et création d'équivalences environnementales.</li>
            <li>Dynamisation de l'emploi local par le soutien aux collecteurs indépendants.</li>
          </ul>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function Contact() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="el-fade-in" style={{ background: 'var(--el-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => navigate('/')} 
          className="el-link-muted" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--el-ink)' }}
        >
          ← Retour à l'accueil
        </button>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Contactez-nous</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--el-ink-soft)', marginBottom: '2rem' }}>
          Une question sur la plateforme ? Un besoin d'intégration RSE ? Remplissez ce formulaire et notre équipe à Abidjan vous répondra sous 24h.
        </p>

        <div className="el-grid-2" style={{ gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
          <div className="el-card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="contactName">Nom</label>
                <input id="contactName" type="text" placeholder="Ex. Koffi Jean" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="contactEmail">Adresse email</label>
                <input id="contactEmail" type="email" placeholder="Ex. jean@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label htmlFor="contactMessage">Votre message</label>
                <textarea id="contactMessage" rows={5} placeholder="Décrivez votre projet ou votre demande..." value={message} onChange={(e) => setMessage(e.target.value)} required style={{ padding: '8px', border: '1.5px solid var(--el-line-dark)', borderRadius: 'var(--radius-sm)', background: 'transparent', outline: 'none', color: 'var(--el-ink)' }} />
              </div>
              <button type="submit" className="el-btn el-btn-emerald" style={{ alignSelf: 'flex-start' }}>Envoyer le message</button>
              {sent && (
                <div style={{ color: '#137333', background: '#e6f4ea', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  ✓ Votre message a bien été envoyé ! Merci.
                </div>
              )}
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="el-card">
              <h4 style={{ fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Nos coordonnées</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--el-ink-soft)' }}>
                📍 Cocody Centre, Abidjan, Côte d'Ivoire<br />
                📞 +225 07 00 00 00 00<br />
                ✉ contact@ecoloop.ai
              </p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
