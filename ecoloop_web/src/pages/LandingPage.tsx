import { Link } from 'react-router-dom';
import { 
  ArrowRight, Leaf, ShieldCheck, Factory, BrainCircuit, 
  Map, BarChart3, Users, Zap, CheckCircle2,
  ChevronDown, Globe, Award, TrendingUp, Truck
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
            <a href="#acteurs">Pour qui ?</a>
            <a href="#intelligence">Intelligence</a>
            <a href="#impact">Impact</a>
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
            <Zap size={16} /> EcoLoop 2.0 est disponible
          </div>
          <h1 className="hero-title">
            L'intelligence qui transforme les déchets en <span className="text-gradient">ressources stratégiques.</span>
          </h1>
          <p className="hero-subtitle max-w-3xl mx-auto">
            La première plateforme africaine qui orchestre la collecte, la traçabilité et la valorisation des déchets grâce à un moteur décisionnel de pointe.
          </p>
          <div className="hero-cta mt-10 flex flex-col md:flex-row justify-center gap-4">
            <Link to="/register" className="btn btn-primary btn-lg w-full md:w-auto text-center justify-center">
              Démarrer gratuitement <ArrowRight size={20} className="ml-2 inline" />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg w-full md:w-auto text-center justify-center">
              Contacter les ventes
            </Link>
          </div>
        </div>
      </header>

      {/* Problème Section */}
      <section id="probleme" className="section bg-light py-20">
        <div className="section-container text-center max-w-4xl">
          <h2 className="section-title mb-6">Le chaos de la gestion des déchets</h2>
          <p className="section-description text-xl text-secondary mb-12">
            Actuellement, les producteurs ne savent pas comment valoriser leurs déchets, les collecteurs perdent du temps à chercher de la matière, l'industrie manque de matières premières fiables et les mairies naviguent à vue.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="problem-card">
              <h3 className="font-bold text-lg mb-2 text-alert">0 Visibilité</h3>
              <p className="text-secondary">Aucune traçabilité des volumes générés par quartier.</p>
            </div>
            <div className="problem-card">
              <h3 className="font-bold text-lg mb-2 text-alert">40% Pertes</h3>
              <p className="text-secondary">Temps et carburant gaspillés par les collecteurs.</p>
            </div>
            <div className="problem-card">
              <h3 className="font-bold text-lg mb-2 text-alert">Déficit matière</h3>
              <p className="text-secondary">Les industriels importent de la matière recyclable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Les 4 Acteurs Section */}
      <section id="acteurs" className="section py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="section-title">Une plateforme, quatre univers métiers</h2>
            <p className="section-description max-w-2xl mx-auto">
              Nous avons conçu des outils spécifiques pour chaque acteur de la chaîne de valeur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Producteur */}
            <div className="actor-card theme-producer group">
              <div className="actor-icon"><Leaf size={32} /></div>
              <h3>Producteurs</h3>
              <p>Hôtels, supermarchés, entreprises et particuliers.</p>
              <ul className="mt-6 space-y-3">
                <li><CheckCircle2 size={18} /> Déclaration en 1 clic</li>
                <li><CheckCircle2 size={18} /> Gain de récompenses</li>
                <li><CheckCircle2 size={18} /> Rapports d'impact</li>
              </ul>
            </div>

            {/* Collecteur */}
            <div className="actor-card theme-collector group">
              <div className="actor-icon"><Truck size={32} /></div>
              <h3>Collecteurs</h3>
              <p>Flottes formelles et collecteurs indépendants.</p>
              <ul className="mt-6 space-y-3">
                <li><CheckCircle2 size={18} /> GPS & Itinéraires</li>
                <li><CheckCircle2 size={18} /> Missions recommandées</li>
                <li><CheckCircle2 size={18} /> Paiement garanti</li>
              </ul>
            </div>

            {/* Industriel */}
            <div className="actor-card theme-recycler group">
              <div className="actor-icon"><Factory size={32} /></div>
              <h3>Industriels</h3>
              <p>Centres de recyclage et acheteurs B2B.</p>
              <ul className="mt-6 space-y-3">
                <li><CheckCircle2 size={18} /> Marketplace qualifiée</li>
                <li><CheckCircle2 size={18} /> Traçabilité totale</li>
                <li><CheckCircle2 size={18} /> Exports ESG</li>
              </ul>
            </div>

            {/* Mairie */}
            <div className="actor-card theme-municipality group">
              <div className="actor-icon"><Map size={32} /></div>
              <h3>Mairies & État</h3>
              <p>Gestionnaires urbains et régulateurs.</p>
              <ul className="mt-6 space-y-3">
                <li><CheckCircle2 size={18} /> Dashboard supervision</li>
                <li><CheckCircle2 size={18} /> Alertes saturation</li>
                <li><CheckCircle2 size={18} /> Cartographie IA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section id="intelligence" className="section bg-dark text-white py-24">
        <div className="section-container text-center">
          <div className="inline-block p-4 bg-white/10 rounded-2xl mb-8">
            <BrainCircuit size={48} className="text-white" />
          </div>
          <h2 className="section-title text-white">Analyse Assistée & Décisions</h2>
          <p className="section-description text-gray-400 max-w-3xl mx-auto mb-16">
            EcoLoop embarque un moteur d'assistance qui aide au tri et optimise les trajets en temps réel, offrant des recommandations explicables, transparentes et auditables.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <div className="glass-card">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <ShieldCheck className="text-primary" /> Assistant de tri
              </h3>
              <p className="text-gray-400 mb-6">
                Le producteur prend une photo. Notre modèle suggère la classification des matériaux (PET, Carton, Verre), estime la qualité et propose un prix juste.
              </p>
            </div>
            
            <div className="glass-card">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <BarChart3 className="text-warning" /> Intelligence Center
              </h3>
              <p className="text-gray-400 mb-6">
                Prévisions à J+7 des zones à risque de saturation pour les mairies, basées sur la démographie, la saisonnalité et l'historique de collecte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques & Impact */}
      <section className="section py-24 border-b">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="impact-stat">
              <TrendingUp size={40} className="text-primary mb-4 mx-auto" />
              <span className="impact-number">...</span>
              <span className="impact-label">Tonnes tracées</span>
            </div>
            <div className="impact-stat">
              <Globe size={40} className="text-info mb-4 mx-auto" />
              <span className="impact-number">14K</span>
              <span className="impact-label">T. CO₂ évitées</span>
            </div>
            <div className="impact-stat">
              <Users size={40} className="text-accent mb-4 mx-auto" />
              <span className="impact-number">5K+</span>
              <span className="impact-label">Emplois soutenus</span>
            </div>
            <div className="impact-stat">
              <Award size={40} className="text-warning mb-4 mx-auto" />
              <span className="impact-number">12</span>
              <span className="impact-label">Communes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap & Business Model */}
      <section className="section py-24 bg-light">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Business Model</h2>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-primary">Marketplace B2B (Frais de transaction)</h3>
                <p className="text-secondary">Commission de 5 à 8% sur les transactions de gros volumes entre collecteurs et industriels.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-warning">SaaS Communes (Abonnement)</h3>
                <p className="text-secondary">Licence mensuelle pour l'accès à l'Intelligence Center et aux rapports prédictifs.</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-8">Roadmap 2026-2027</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot bg-primary"></div>
                <div className="timeline-content">
                  <h4 className="font-bold">Q3 2026 - Lancement Abidjan</h4>
                  <p className="text-sm text-secondary">Déploiement sur 3 communes pilotes.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot bg-info"></div>
                <div className="timeline-content">
                  <h4 className="font-bold">Q1 2027 - API Ouverte</h4>
                  <p className="text-sm text-secondary">Connexion avec les systèmes comptables des industriels.</p>
                </div>
              </div>
              <div className="timeline-item pb-0">
                <div className="timeline-dot bg-accent"></div>
                <div className="timeline-content">
                  <h4 className="font-bold">Q3 2027 - Expansion Sous-Région</h4>
                  <p className="text-sm text-secondary">Ouverture à Dakar et Accra.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section py-24">
        <div className="section-container max-w-3xl">
          <h2 className="section-title text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "La plateforme est-elle gratuite pour les producteurs ?", a: "Oui, la création de compte et la publication de lots sont 100% gratuites pour les producteurs (particuliers et entreprises)." },
              { q: "Comment les collecteurs sont-ils payés ?", a: "Les collecteurs sont payés directement via mobile money ou virement bancaire une fois le lot livré et validé par l'industriel." },
              { q: "EcoLoop possède-t-elle des camions ?", a: "Non, EcoLoop est une plateforme technologique (SaaS/Marketplace) qui connecte l'écosystème existant sans posséder d'actifs physiques lourds." }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  className="w-full text-left p-6 flex justify-between items-center bg-white font-bold hover:bg-gray-50"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
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
          <h2 className="text-4xl font-bold mb-6 text-white">Prêt à transformer la gestion des déchets ?</h2>
          <p className="text-lg opacity-90 mb-10">
            Rejoignez des centaines d'acteurs engagés dans l'économie circulaire d'aujourd'hui.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 btn-lg">
              Créer un compte
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
                Le système d'exploitation de l'économie circulaire. Nous connectons la chaîne de valeur du recyclage grâce à l'analyse de données.
              </p>
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition cursor-pointer">In</span>
                <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition cursor-pointer">X</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Produit</h4>
              <ul className="space-y-4">
                <li><Link to="/producteurs" className="hover:text-white transition">Producteurs</Link></li>
                <li><Link to="/collecteurs" className="hover:text-white transition">Collecteurs</Link></li>
                <li><Link to="/industriels" className="hover:text-white transition">Industriels</Link></li>
                <li><Link to="/mairies" className="hover:text-white transition">Mairies & État</Link></li>
                <li><Link to="/tarifs" className="hover:text-white transition">Tarifs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Ressources</h4>
              <ul className="space-y-4">
                <li><Link to="/docs" className="hover:text-white transition">Documentation API</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/help" className="hover:text-white transition">Centre d'aide</Link></li>
                <li><Link to="/status" className="hover:text-white transition">Statut du service</Link></li>
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
            <p>&copy; {new Date().getFullYear()} EcoLoop Inc. Tous droits réservés.</p>
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
