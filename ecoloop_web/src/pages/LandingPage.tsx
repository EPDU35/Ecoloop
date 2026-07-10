import { Link } from 'react-router-dom';
import { 
  ArrowRight, Leaf, ShieldCheck, Factory, BrainCircuit, 
  Map, BarChart3, Zap, CheckCircle2,
  ChevronDown, Globe, TrendingUp, Truck,
  Recycle, Building2, Eye, AlertTriangle, Droplets, CloudOff
} from 'lucide-react';
import { useState } from 'react';
import './LandingPage.css';

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo flex items-center gap-2">
            <Leaf className="text-primary" size={28} />
            <span>EcoLoop</span>
          </div>
          <div className="nav-links">
            <a href="#solution">Solution</a>
            <a href="#fonctionnement">Fonctionnement</a>
            <a href="#acteurs">Acteurs</a>
            <a href="#intelligence">Intelligence</a>
            <a href="#impact">Impact</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#faq">Ressources</a>
          </div>
          <div className="nav-actions hidden md:flex">
            <Link to="/login" className="btn btn-secondary">Connexion</Link>
            <Link to="/register" className="btn btn-primary ml-4">Créer un compte</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section text-center fade-in-up">
        <div className="hero-content">
          <div className="badge-new mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-full font-medium text-sm mx-auto">
            <Zap size={16} /> Nouveau &bull; EcoLoop 2.0 disponible
          </div>
          <h1 className="hero-title">
            Les déchets ne sont plus un problème.<br />
            <span className="text-gradient">Ils deviennent une ressource.</span>
          </h1>
          <p className="hero-subtitle max-w-3xl mx-auto">
            EcoLoop connecte producteurs, collecteurs, recycleurs et collectivités dans une seule plateforme intelligente pour rendre la gestion des déchets plus simple, plus rentable et plus durable.
          </p>
          <div className="hero-cta mt-10 flex flex-col md:flex-row justify-center gap-4">
            <Link to="/register" className="btn btn-primary btn-lg w-full md:w-auto text-center justify-center">
              Commencer gratuitement <ArrowRight size={20} className="ml-2 inline" />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg w-full md:w-auto text-center justify-center">
              Demander une démonstration
            </Link>
          </div>
        </div>
      </header>

      {/* Chiffres */}
      <section className="section py-20 border-b">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="impact-stat">
              <span className="impact-number text-primary">+14 000</span>
              <span className="impact-label">Tonnes de déchets valorisées</span>
            </div>
            <div className="impact-stat">
              <span className="impact-number text-info">5 000+</span>
              <span className="impact-label">Tonnes de CO₂ évitées</span>
            </div>
            <div className="impact-stat">
              <span className="impact-number text-accent">250+</span>
              <span className="impact-label">Acteurs connectés</span>
            </div>
            <div className="impact-stat">
              <span className="impact-number text-warning">12</span>
              <span className="impact-label">Communes accompagnées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Le problème */}
      <section id="probleme" className="section bg-light py-24">
        <div className="section-container text-center max-w-5xl">
          <h2 className="section-title mb-6">Aujourd'hui, la chaîne de gestion des déchets est fragmentée.</h2>
          <p className="section-description text-xl text-secondary mb-16 max-w-3xl mx-auto">
            Chaque acteur avise pour lui-même, sans visibilité sur le reste de la chaîne.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16">
            <div className="problem-card flex items-start gap-4">
              <AlertTriangle size={24} className="text-alert flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Les producteurs ne savent pas où envoyer leurs déchets.</h3>
                <p className="text-secondary">Restaurants, supermarchés, entreprises : ils génèrent des matières recyclables sans savoir comment les valoriser.</p>
              </div>
            </div>
            <div className="problem-card flex items-start gap-4">
              <Truck size={24} className="text-alert flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Les collecteurs perdent du temps à chercher des missions rentables.</h3>
                <p className="text-secondary">Sans visibilité sur les volumes disponibles, ils parcourent des kilomètres pour des résultats incertains.</p>
              </div>
            </div>
            <div className="problem-card flex items-start gap-4">
              <Factory size={24} className="text-alert flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Les industriels peinent à sécuriser leur approvisionnement.</h3>
                <p className="text-secondary">La matière recyclable manque de traçabilité et de qualité constante.</p>
              </div>
            </div>
            <div className="problem-card flex items-start gap-4">
              <Building2 size={24} className="text-alert flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Les collectivités manquent de visibilité pour anticiper les zones à risque.</h3>
                <p className="text-secondary">Sans données fiables, elles réagissent aux problèmes au lieu de les prévenir.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <Eye size={16} /> Perte économique
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <Recycle size={16} /> Pollution
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <Droplets size={16} /> Inondations
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <CloudOff size={16} /> Émissions de CO₂
            </span>
          </div>
        </div>
      </section>

      {/* Notre solution */}
      <section id="solution" className="section py-24">
        <div className="section-container text-center max-w-5xl">
          <h2 className="section-title mb-4">Une seule plateforme.<br />Toute la chaîne de valeur.</h2>
          <p className="section-description text-xl text-secondary mb-16 max-w-3xl mx-auto">
            EcoLoop centralise les informations, coordonne les acteurs et facilite chaque étape du recyclage.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { icon: <Leaf size={20} />, text: "Déclarer un lot" },
              { icon: <Truck size={20} />, text: "Trouver un collecteur" },
              { icon: <Factory size={20} />, text: "Acheter des matières recyclables" },
              { icon: <BarChart3 size={20} />, text: "Suivre l'impact environnemental" },
              { icon: <Map size={20} />, text: "Anticiper les risques urbains" },
              { icon: <ShieldCheck size={20} />, text: "Garantir la traçabilité" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                <span className="text-primary flex-shrink-0">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Les 4 Acteurs Section */}
      <section id="acteurs" className="section bg-light py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="section-title">Les acteurs de la chaîne</h2>
            <p className="section-description max-w-2xl mx-auto">
              Chaque profil dispose d'un espace conçu pour ses besoins spécifiques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Producteur */}
            <div className="actor-card theme-producer group">
              <div className="actor-icon"><Leaf size={32} /></div>
              <h3>Producteurs</h3>
              <p className="text-sm text-secondary mb-4">Restaurants, entreprises, supermarchés, hôtels, particuliers.</p>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Ils peuvent :</p>
              <ul className="space-y-2 text-sm">
                <li><CheckCircle2 size={16} /> Publier leurs déchets en quelques secondes</li>
                <li><CheckCircle2 size={16} /> Recevoir des récompenses</li>
                <li><CheckCircle2 size={16} /> Suivre leur impact environnemental</li>
                <li><CheckCircle2 size={16} /> Consulter leur historique</li>
              </ul>
            </div>

            {/* Collecteur */}
            <div className="actor-card theme-collector group">
              <div className="actor-icon"><Truck size={32} /></div>
              <h3>Collecteurs</h3>
              <p className="text-sm text-secondary mb-4">Flottes professionnelles et collecteurs indépendants.</p>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Ils reçoivent :</p>
              <ul className="space-y-2 text-sm">
                <li><CheckCircle2 size={16} /> Des missions optimisées</li>
                <li><CheckCircle2 size={16} /> Les meilleurs itinéraires</li>
                <li><CheckCircle2 size={16} /> Leurs gains</li>
                <li><CheckCircle2 size={16} /> Leurs performances</li>
              </ul>
            </div>

            {/* Industriel */}
            <div className="actor-card theme-recycler group">
              <div className="actor-icon"><Factory size={32} /></div>
              <h3>Industriels</h3>
              <p className="text-sm text-secondary mb-4">Centres de recyclage et acheteurs B2B.</p>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Ils accèdent à :</p>
              <ul className="space-y-2 text-sm">
                <li><CheckCircle2 size={16} /> Une marketplace qualifiée</li>
                <li><CheckCircle2 size={16} /> Des matières traçables</li>
                <li><CheckCircle2 size={16} /> Des rapports ESG</li>
                <li><CheckCircle2 size={16} /> Des contrats numériques</li>
              </ul>
            </div>

            {/* Mairie */}
            <div className="actor-card theme-municipality group">
              <div className="actor-icon"><Building2 size={32} /></div>
              <h3>Collectivités</h3>
              <p className="text-sm text-secondary mb-4">Mairies, communes et institutions publiques.</p>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Elles disposent de :</p>
              <ul className="space-y-2 text-sm">
                <li><CheckCircle2 size={16} /> Cartographie des zones</li>
                <li><CheckCircle2 size={16} /> Indicateurs clés</li>
                <li><CheckCircle2 size={16} /> Alertes et recommandations</li>
                <li><CheckCircle2 size={16} /> Historique des décisions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence EcoLoop */}
      <section id="intelligence" className="section bg-dark text-white py-24">
        <div className="section-container text-center">
          <div className="inline-block p-4 bg-white/10 rounded-2xl mb-8">
            <BrainCircuit size={48} className="text-white" />
          </div>
          <h2 className="section-title text-white">Une aide à la décision, pas une boîte noire.</h2>
          <p className="section-description text-gray-400 max-w-3xl mx-auto mb-16">
            Notre moteur d'analyse exploite les données disponibles pour proposer des recommandations compréhensibles et vérifiables.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { title: "Suggestion de tri", desc: "Identifier automatiquement la nature d'un déchet (plastique, carton, verre, métal)." },
              { title: "Estimation de valeur", desc: "Proposer un prix juste en fonction du marché local et de la qualité." },
              { title: "Collecteur recommandé", desc: "Suggérer le collecteur le plus adapté selon la position et la capacité." },
              { title: "Zones d'attention", desc: "Identifier les quartiers nécessitant une intervention prioritaire." },
              { title: "Actions préventives", desc: "Anticiper les risques de saturation et proposer des solutions." },
              { title: "Transparence totale", desc: "Chaque recommandation est accompagnée d'une explication claire." },
            ].map((item, i) => (
              <div key={i} className="glass-card">
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section id="fonctionnement" className="section py-24">
        <div className="section-container text-center max-w-4xl">
          <h2 className="section-title mb-16">Comment ça fonctionne ?</h2>
          
          <div className="space-y-8 text-left">
            {[
              { step: "1", title: "Le producteur publie un lot.", desc: "Il déclare ses déchets en quelques secondes via l'application." },
              { step: "2", title: "Le moteur analyse les informations disponibles.", desc: "Classification, estimation de valeur, collecteur recommandé." },
              { step: "3", title: "Les collecteurs reçoivent les missions les plus pertinentes.", desc: "Itinéraires optimisés et gains garantis." },
              { step: "4", title: "L'industriel achète les matières recyclables.", desc: "Marketplace qualifiée avec traçabilité complète." },
              { step: "5", title: "La collectivité suit l'impact en temps réel.", desc: "Dashboard, alertes et recommandations d'action." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi EcoLoop */}
      <section className="section bg-light py-24">
        <div className="section-container text-center max-w-5xl">
          <h2 className="section-title mb-16">Une plateforme pensée pour l'Afrique.</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { icon: <Globe size={24} />, text: "Adaptée aux réalités locales" },
              { icon: <Zap size={24} />, text: "Accessible sur mobile" },
              { icon: <TrendingUp size={24} />, text: "Évolutive" },
              { icon: <ShieldCheck size={24} />, text: "Sécurisée" },
              { icon: <Eye size={24} />, text: "Traçable" },
              { icon: <Recycle size={24} />, text: "Économie circulaire" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-6">
                <span className="text-primary">{item.icon}</span>
                <span className="font-medium text-center">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="section py-24 border-b">
        <div className="section-container text-center max-w-4xl">
          <h2 className="section-title mb-6">Chaque collecte compte.</h2>
          <p className="section-description text-xl text-secondary mb-12">
            Grâce à EcoLoop :
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              "Moins de déchets abandonnés",
              "Moins d'inondations liées aux déchets",
              "Moins de pollution",
              "Plus de matières recyclées",
              "Plus de revenus pour les collecteurs",
              "Une meilleure visibilité pour les collectivités",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                <span className="font-medium text-green-900">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap & Business Model */}
      <section id="tarifs" className="section py-24">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Un modèle économique durable.</h2>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-primary">Marketplace</h3>
                <p className="text-secondary">Commission sur les transactions entre collecteurs et industriels.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-accent">SaaS Industriels</h3>
                <p className="text-secondary">Abonnement donnant accès aux fonctionnalités avancées, aux rapports ESG et aux outils de suivi.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-warning">SaaS Collectivités</h3>
                <p className="text-secondary">Licence annuelle incluant le centre de pilotage, les tableaux de bord et les indicateurs territoriaux.</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-8">Roadmap</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot bg-primary"></div>
                <div className="timeline-content">
                  <h4 className="font-bold">2026</h4>
                  <p className="text-sm text-secondary">Déploiement pilote à Abidjan.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot bg-info"></div>
                <div className="timeline-content">
                  <h4 className="font-bold">2027</h4>
                  <p className="text-sm text-secondary">Extension à plusieurs communes ivoiriennes.</p>
                </div>
              </div>
              <div className="timeline-item pb-0">
                <div className="timeline-dot bg-accent"></div>
                <div className="timeline-content">
                  <h4 className="font-bold">2028</h4>
                  <p className="text-sm text-secondary">Ouverture vers d'autres grandes villes d'Afrique de l'Ouest.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section bg-light py-24">
        <div className="section-container max-w-3xl">
          <h2 className="section-title text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "Les producteurs paient-ils pour publier leurs déchets ?", a: "La publication est gratuite." },
              { q: "Comment les collecteurs sont-ils rémunérés ?", a: "Ils reçoivent directement le paiement prévu pour chaque mission validée." },
              { q: "EcoLoop possède-t-elle sa propre flotte ?", a: "Non. Nous connectons et optimisons les acteurs déjà présents sur le terrain." },
              { q: "Les données sont-elles sécurisées ?", a: "Oui. Toutes les communications sont protégées et les accès sont sécurisés par authentification." },
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  className="w-full text-left p-6 flex justify-between items-center bg-white font-bold hover:bg-gray-50"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`transition-transform duration-300 flex-shrink-0 ml-4 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-secondary">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section bg-gradient-to-r from-primary to-primary-dark text-white text-center py-24">
        <div className="section-container max-w-3xl">
          <h2 className="text-4xl font-bold mb-6 text-white">Rejoignez la nouvelle génération de l'économie circulaire.</h2>
          <p className="text-lg opacity-90 mb-10">
            Transformons les déchets en opportunités économiques et environnementales.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 btn-lg">
              Créer un compte
            </Link>
            <Link to="/contact" className="btn border-2 border-white text-white hover:bg-white hover:text-primary btn-lg">
              Planifier une démonstration
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Exhaustif */}
      <footer className="footer-mega py-16 bg-gray-900 text-gray-400">
        <div className="section-container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="logo flex items-center gap-2 mb-6">
                <Leaf className="text-white" size={28} />
                <span className="text-white text-2xl font-bold">EcoLoop</span>
              </div>
              <p className="mb-6 max-w-sm leading-relaxed">
                La plateforme qui transforme les déchets en ressources. Connectons la chaîne de valeur du recyclage pour une Afrique plus propre et plus rentable.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Produit</h4>
              <ul className="space-y-4">
                <li><Link to="/register" className="hover:text-white transition">Producteurs</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Collecteurs</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Industriels</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Collectivités</Link></li>
                <li><a href="#tarifs" className="hover:text-white transition">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Ressources</h4>
              <ul className="space-y-4">
                <li><Link to="/docs" className="hover:text-white transition">Documentation</Link></li>
                <li><Link to="/docs" className="hover:text-white transition">API</Link></li>
                <li><Link to="/help" className="hover:text-white transition">Centre d'aide</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/status" className="hover:text-white transition">Statut des services</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Entreprise</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="hover:text-white transition">À propos</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Carrières</Link></li>
                <li><Link to="/press" className="hover:text-white transition">Presse</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2026 EcoLoop &mdash; Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/legal" className="hover:text-white transition">Mentions légales</Link>
              <Link to="/privacy" className="hover:text-white transition">Politique de confidentialité</Link>
              <Link to="/terms" className="hover:text-white transition">Conditions d'utilisation</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
