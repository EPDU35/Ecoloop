import { Link } from 'react-router-dom';
import './PublicPages.css';

export function LegalPage() {
  return (
    <div className="public-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="logo">EcoLoop</Link>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-secondary">Se connecter</Link>
          </div>
        </div>
      </nav>

      <div className="page-container mt-8 mb-16">
        <div className="card max-w-4xl mx-auto p-12 markdown-content">
          <h1 className="text-3xl font-bold mb-8">📄 Mentions légales</h1>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Éditeur</h2>
            <p className="text-secondary leading-relaxed">
              EcoLoop est une plateforme numérique dédiée à la valorisation des déchets et à l'amélioration de la gestion environnementale grâce aux technologies numériques.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Hébergement</h2>
            <p className="text-secondary leading-relaxed mb-2">Le site est hébergé sur des infrastructures cloud sécurisées.</p>
            <ul className="list-disc list-inside text-secondary ml-4">
              <li><strong>Frontend :</strong> Vercel</li>
              <li><strong>Backend :</strong> Render</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Propriété intellectuelle</h2>
            <p className="text-secondary leading-relaxed mb-4">
              L'ensemble des contenus présents sur EcoLoop (textes, illustrations, logos, interfaces, éléments graphiques et logiciels) est protégé par les lois relatives à la propriété intellectuelle.
            </p>
            <p className="text-secondary leading-relaxed">
              Toute reproduction, modification ou diffusion sans autorisation préalable est interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Responsabilité</h2>
            <p className="text-secondary leading-relaxed mb-4">
              EcoLoop met tout en œuvre pour fournir des informations exactes et maintenir la disponibilité de ses services. Toutefois, aucune garantie absolue ne peut être donnée concernant :
            </p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2">
              <li>la disponibilité permanente du service ;</li>
              <li>l'absence d'erreurs ;</li>
              <li>l'exactitude des données fournies par les utilisateurs.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Données publiées</h2>
            <p className="text-secondary leading-relaxed mb-4">
              Les utilisateurs restent responsables des informations qu'ils publient sur la plateforme.
            </p>
            <p className="text-secondary leading-relaxed">
              EcoLoop se réserve le droit de supprimer tout contenu contraire à la législation ou aux présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Droit applicable</h2>
            <p className="text-secondary leading-relaxed">
              Les présentes mentions légales sont régies par le droit applicable en Côte d'Ivoire.
            </p>
          </section>
        </div>
      </div>
      
      <footer className="landing-footer text-center">
        <p>&copy; {new Date().getFullYear()} EcoLoop. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
