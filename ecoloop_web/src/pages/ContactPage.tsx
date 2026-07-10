import { Link } from 'react-router-dom';
import { Mail, Briefcase, Building, Recycle, Truck } from 'lucide-react';
import './PublicPages.css';

export function ContactPage() {
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
        <div className="card max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">📞 Contactez EcoLoop</h1>
          <p className="text-secondary text-lg mb-12">
            Nous sommes à votre écoute pour toute question, proposition de partenariat ou demande d'information.
          </p>

          <div className="grid-cols-2 mb-12">
            <div>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Informations générales</h2>
              <ul className="space-y-4">
                <li>
                  <strong>Nom :</strong> EcoLoop
                </li>
                <li>
                  <Mail className="inline mr-2 text-primary" size={20} />
                  <strong>Email :</strong> <a href="mailto:contact@ecoloop.ci" className="text-primary hover:underline">contact@ecoloop.ci</a>
                </li>
                <li>
                  <Mail className="inline mr-2 text-primary" size={20} />
                  <strong>Support technique :</strong> <a href="mailto:support@ecoloop.ci" className="text-primary hover:underline">support@ecoloop.ci</a>
                </li>
                <li>
                  <Mail className="inline mr-2 text-primary" size={20} />
                  <strong>Partenariats & collectivités :</strong> <a href="mailto:partenariats@ecoloop.ci" className="text-primary hover:underline">partenariats@ecoloop.ci</a>
                </li>
              </ul>
            </div>
            
            <div className="bg-light p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Horaires d'ouverture</h2>
              <p className="mb-2"><strong>Lundi – Vendredi</strong></p>
              <p className="text-secondary mb-4">08h00 – 18h00 (GMT)</p>
              
              <h2 className="text-xl font-bold mb-4 mt-8">Réseaux sociaux</h2>
              <p className="text-secondary">À venir.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-center">Vous êtes...</h2>
          
          <div className="grid-cols-2 gap-8">
            <div className="bg-light p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="text-primary" size={24} />
                <h3 className="text-lg font-bold">Une entreprise</h3>
              </div>
              <p className="text-secondary mb-4">Vous souhaitez améliorer la gestion de vos déchets ou obtenir des rapports d'impact environnemental ?</p>
              <p>Contactez notre équipe Business.</p>
            </div>
            
            <div className="bg-light p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Building className="text-primary" size={24} />
                <h3 className="text-lg font-bold">Une mairie ou institution</h3>
              </div>
              <p className="text-secondary mb-4">Vous souhaitez mettre en place une solution intelligente de gestion des déchets sur votre territoire ?</p>
              <p>Nos équipes peuvent vous accompagner dans un projet pilote.</p>
            </div>

            <div className="bg-light p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Recycle className="text-primary" size={24} />
                <h3 className="text-lg font-bold">Un centre de recyclage</h3>
              </div>
              <p className="text-secondary mb-4">Vous recherchez une source fiable de matières recyclables ?</p>
              <p>EcoLoop facilite la mise en relation avec des producteurs et collecteurs qualifiés.</p>
            </div>

            <div className="bg-light p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="text-primary" size={24} />
                <h3 className="text-lg font-bold">Un collecteur</h3>
              </div>
              <p className="text-secondary mb-4">Vous souhaitez rejoindre le réseau EcoLoop ?</p>
              <p>Créez un compte et commencez à recevoir des missions adaptées à votre capacité.</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="landing-footer text-center">
        <p>&copy; {new Date().getFullYear()} EcoLoop. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
