import { Link } from 'react-router-dom';
import './PublicPages.css';

export function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-8">🔒 Politique de confidentialité</h1>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Notre engagement</h2>
            <p className="text-secondary leading-relaxed mb-4">
              Chez EcoLoop, nous accordons une grande importance à la protection des données personnelles de nos utilisateurs.
            </p>
            <p className="text-secondary leading-relaxed">
              Nous collectons uniquement les informations nécessaires au fonctionnement de la plateforme.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Données collectées</h2>
            <p className="text-secondary leading-relaxed mb-4">Selon votre profil, nous pouvons collecter :</p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2">
              <li>nom et prénom ;</li>
              <li>adresse email ;</li>
              <li>numéro de téléphone ;</li>
              <li>rôle (producteur, collecteur, industriel, mairie) ;</li>
              <li>informations liées aux collectes de déchets ;</li>
              <li>données de géolocalisation (uniquement lorsque nécessaire et avec votre autorisation) ;</li>
              <li>statistiques d'utilisation.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Utilisation des données</h2>
            <p className="text-secondary leading-relaxed mb-4">Les informations sont utilisées pour :</p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2">
              <li>créer votre compte ;</li>
              <li>gérer les collectes ;</li>
              <li>mettre en relation les acteurs ;</li>
              <li>améliorer les recommandations du moteur décisionnel EcoLoop ;</li>
              <li>produire des statistiques d'impact ;</li>
              <li>assurer la sécurité de la plateforme.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Partage des données</h2>
            <p className="text-secondary leading-relaxed mb-4">
              EcoLoop ne vend jamais les données personnelles de ses utilisateurs.
            </p>
            <p className="text-secondary leading-relaxed mb-2">Certaines informations peuvent être partagées uniquement :</p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2">
              <li>avec les partenaires nécessaires au fonctionnement du service ;</li>
              <li>lorsqu'une obligation légale l'exige.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Conservation</h2>
            <p className="text-secondary leading-relaxed">
              Les données sont conservées uniquement pendant la durée nécessaire au fonctionnement du service ou conformément aux obligations légales applicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Sécurité</h2>
            <p className="text-secondary leading-relaxed mb-2">Nous mettons en œuvre des mesures techniques et organisationnelles afin de protéger les données contre :</p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2">
              <li>l'accès non autorisé ;</li>
              <li>la perte ;</li>
              <li>l'altération ;</li>
              <li>la divulgation.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Vos droits</h2>
            <p className="text-secondary leading-relaxed mb-2">Vous pouvez à tout moment :</p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2 mb-4">
              <li>consulter vos informations ;</li>
              <li>demander leur modification ;</li>
              <li>demander leur suppression lorsque cela est applicable ;</li>
              <li>retirer votre consentement pour certains traitements.</li>
            </ul>
            <p className="text-secondary leading-relaxed">
              Pour toute demande : <a href="mailto:privacy@ecoloop.ci" className="text-primary hover:underline">privacy@ecoloop.ci</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Cookies</h2>
            <p className="text-secondary leading-relaxed mb-2">EcoLoop utilise des cookies et technologies similaires afin de :</p>
            <ul className="list-disc list-inside text-secondary ml-4 space-y-2 mb-4">
              <li>maintenir votre session ouverte ;</li>
              <li>améliorer votre expérience utilisateur ;</li>
              <li>mesurer les performances de la plateforme.</li>
            </ul>
            <p className="text-secondary leading-relaxed">
              Vous pouvez gérer vos préférences directement depuis votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Évolution de cette politique</h2>
            <p className="text-secondary leading-relaxed mb-4">
              Cette politique de confidentialité peut être mise à jour afin de refléter les évolutions de la plateforme ou les exigences réglementaires.
            </p>
            <p className="text-secondary leading-relaxed">
              Nous informerons les utilisateurs en cas de modification importante.
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
