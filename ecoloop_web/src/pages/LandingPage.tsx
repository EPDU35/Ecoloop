import { Link } from 'react-router-dom';
import { 
  ArrowRight, Leaf, ShieldCheck, Factory, BrainCircuit, 
  CheckCircle2, TrendingUp, Truck,
  Building2, AlertTriangle, XCircle, Droplets, Banknote, Plus,
  Menu, X
} from 'lucide-react';
import { useState } from 'react';

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqs = [
    { question: "Le service est-il gratuit pour les producteurs ?", answer: "Oui, la collecte est entièrement gratuite pour les producteurs, et vous êtes même récompensés pour vos déchets triés." },
    { question: "Quels types de déchets acceptez-vous ?", answer: "Nous acceptons principalement le plastique (PET, HDPE), le carton, l'aluminium et le verre. La liste s'étend régulièrement." },
    { question: "Comment les collecteurs sont-ils payés ?", answer: "Les collecteurs reçoivent leur paiement instantanément sur leur portefeuille mobile une fois la livraison confirmée par l'industriel." }
  ];

  return (
    <div className="min-h-screen bg-bg text-text-main font-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="text-ecoloop-green" size={28} />
            <span className="font-heading font-bold text-xl tracking-tight text-deep-forest">EcoLoop</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-text-secondary">
            <a href="#solution" className="hover:text-ecoloop-green transition-colors">Notre Solution</a>
            <a href="#acteurs" className="hover:text-ecoloop-green transition-colors">Les Acteurs</a>
            <a href="#impact" className="hover:text-ecoloop-green transition-colors">Impact</a>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-ecoloop-green">Connexion</Link>
            <Link to="/register" className="btn-primary py-2 px-4 text-sm">
              Créer un compte
            </Link>
          </div>
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-lg">
            <a href="#solution" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Notre Solution</a>
            <a href="#acteurs" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Les Acteurs</a>
            <a href="#impact" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Impact</a>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
              <Link to="/login" className="text-sm font-medium text-center py-2.5 rounded-lg border border-gray-200 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
              <Link to="/register" className="btn-primary py-2.5 text-sm" onClick={() => setMobileMenuOpen(false)}>Créer un compte</Link>
            </div>
          </div>
        )}
      </nav>

      {/* 1. Hero Section */}
      <section className="pt-24 pb-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-deep-forest leading-tight mb-6">
            Transformer les déchets en ressources pour construire des villes plus propres et une économie circulaire plus forte.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-3xl mx-auto font-medium">
            <span className="block mb-2 font-bold text-ecoloop-green">Producteurs • Collecteurs • Industriels • Mairies</span>
            Une plateforme unique pour connecter toute la chaîne de valeur.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Demander une collecte <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Le problème */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-deep-forest mb-12">Un constat alarmant</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2 text-deep-forest">5% Recyclés</h3>
              <p className="text-text-secondary text-sm">À peine 5% des déchets plastiques en Afrique de l'Ouest sont recyclés aujourd'hui.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <Droplets size={40} className="text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2 text-deep-forest">Inondations</h3>
              <p className="text-text-secondary text-sm">Les canaux de drainage saturés par les déchets causent des inondations mortelles chaque année.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <Banknote size={40} className="text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2 text-deep-forest">Perte de valeur</h3>
              <p className="text-text-secondary text-sm">Des millions de francs CFA dorment dans nos rues sous forme de matière première non valorisée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pourquoi les solutions actuelles échouent */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-deep-forest mb-12">Pourquoi ça ne marche pas aujourd'hui ?</h2>
          <div className="flex flex-col gap-4 max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" />
              <p className="text-deep-forest"><strong className="block">Informel et désorganisé</strong> Les collecteurs marchent des kilomètres sans savoir où trouver la matière.</p>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" />
              <p className="text-deep-forest"><strong className="block">Manque de traçabilité</strong> Les industriels ne peuvent pas certifier l'origine de leur plastique (critères ESG).</p>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" />
              <p className="text-deep-forest"><strong className="block">Pas d'incitation</strong> Les producteurs n'ont aucun intérêt financier immédiat à trier leurs déchets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Notre solution */}
      <section id="solution" className="py-24 bg-deep-forest text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold mb-6">Notre Solution : EcoLoop</h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-16">
            Une marketplace logistique intelligente qui transforme la chaîne de valeur du déchet de bout en bout.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <CheckCircle2 size={48} className="text-ecoloop-green mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Connecter</h3>
              <p className="text-green-100 text-sm">Mise en relation directe entre le gisement (producteur) et la demande (industriel) via un réseau de collecteurs indépendants.</p>
            </div>
            <div>
              <ShieldCheck size={48} className="text-ecoloop-green mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Tracer</h3>
              <p className="text-green-100 text-sm">Chaque kilo est géolocalisé, pesé et tracé, offrant une garantie ESG parfaite aux acheteurs.</p>
            </div>
            <div>
              <TrendingUp size={48} className="text-ecoloop-green mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Valoriser</h3>
              <p className="text-green-100 text-sm">Paiements instantanés et micro-récompenses qui créent une véritable économie de la propreté.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Les 4 acteurs */}
      <section id="acteurs" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-deep-forest text-center mb-12">4 Acteurs, 1 Écosystème</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-green-500">
              <Leaf size={32} className="text-green-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">1. Le Producteur</h3>
              <p className="text-sm text-text-secondary">Trie ses déchets, signale leur disponibilité et reçoit des Points EcoLoop ou du cash.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500">
              <Truck size={32} className="text-blue-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">2. Le Collecteur</h3>
              <p className="text-sm text-text-secondary">Est orienté par l'IA vers les zones rentables, optimise son trajet et sécurise son revenu.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-purple-500">
              <Factory size={32} className="text-purple-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">3. L'Industriel</h3>
              <p className="text-sm text-text-secondary">Achète la matière sur notre marketplace B2B avec des certificats de traçabilité ESG.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-gray-800">
              <Building2 size={32} className="text-gray-800 mb-4" />
              <h3 className="font-bold text-lg mb-2">4. La Mairie</h3>
              <p className="text-sm text-text-secondary">Pilote le territoire via un centre de commandement, prévient les crises et suit l'impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comment ça marche */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-deep-forest mb-16">Comment ça fonctionne ?</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 overflow-x-auto pb-4">
            
            <div className="flex flex-col items-center flex-1 min-w-[120px]">
              <div className="w-16 h-16 bg-green-50 text-ecoloop-green rounded-full flex items-center justify-center mb-4 border border-green-100 shadow-sm">
                <Leaf size={28} />
              </div>
              <span className="font-bold text-deep-forest">Producteur</span>
            </div>

            <ArrowRight className="hidden md:block text-gray-300 flex-shrink-0" size={24} />

            <div className="flex flex-col items-center flex-1 min-w-[120px]">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                <Truck size={28} />
              </div>
              <span className="font-bold text-deep-forest">Collecteur</span>
            </div>

            <ArrowRight className="hidden md:block text-gray-300 flex-shrink-0" size={24} />

            <div className="flex flex-col items-center flex-1 min-w-[120px]">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 border border-orange-100 shadow-sm">
                <Building2 size={28} />
              </div>
              <span className="font-bold text-deep-forest">Centre de tri</span>
            </div>

            <ArrowRight className="hidden md:block text-gray-300 flex-shrink-0" size={24} />

            <div className="flex flex-col items-center flex-1 min-w-[120px]">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 border border-purple-100 shadow-sm">
                <Factory size={28} />
              </div>
              <span className="font-bold text-deep-forest">Industriel</span>
            </div>

            <ArrowRight className="hidden md:block text-gray-300 flex-shrink-0" size={24} />

            <div className="flex flex-col items-center flex-1 min-w-[120px]">
              <div className="w-16 h-16 bg-gray-50 text-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                <TrendingUp size={28} />
              </div>
              <span className="font-bold text-deep-forest text-center">Nouvelle matière première</span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. EcoLoop AI */}
      <section className="py-20 bg-purple-900 text-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
              <BrainCircuit className="text-purple-300" size={40} /> L'avantage de l'IA
            </h2>
            <ul className="space-y-4 text-purple-100">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-purple-400 mt-1 flex-shrink-0" />
                <span><strong>Optimisation des tournées :</strong> L'algorithme regroupe les demandes proches pour minimiser les trajets des collecteurs.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-purple-400 mt-1 flex-shrink-0" />
                <span><strong>Analyse prédictive :</strong> Croisement des données de collecte et de la météo pour prévenir les inondations.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-purple-400 mt-1 flex-shrink-0" />
                <span><strong>Identification visuelle :</strong> Un simple scan photo permet de catégoriser la matière (PET, HDPE) instantanément.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-purple-800 rounded-2xl p-8 border border-purple-700 shadow-xl">
            <pre className="text-xs text-purple-300 overflow-x-auto">
              <code>{`{
  "zone": "Cocody Riviera",
  "risk_score": 85,
  "alert": "CRITICAL",
  "reason": "Baisse de collecte (40%) + Pluies J+3",
  "ai_action": "Déployer 5 collecteurs d'urgence"
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 8. Impact */}
      <section id="impact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-deep-forest mb-12">Un impact mesurable</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="block text-5xl font-extrabold text-ecoloop-green mb-2">12k</span>
              <span className="font-bold text-deep-forest">Tonnes détournées</span>
              <p className="text-sm text-text-secondary mt-2">Matières sauvées de l'enfouissement</p>
            </div>
            <div>
              <span className="block text-5xl font-extrabold text-blue-500 mb-2">850</span>
              <span className="font-bold text-deep-forest">Emplois créés</span>
              <p className="text-sm text-text-secondary mt-2">Collecteurs professionnalisés</p>
            </div>
            <div>
              <span className="block text-5xl font-extrabold text-purple-500 mb-2">45M</span>
              <span className="font-bold text-deep-forest">FCFA redistribués</span>
              <p className="text-sm text-text-secondary mt-2">Aux particuliers et professionnels</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Business Model */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-deep-forest mb-12">Business Model</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full md:w-1/3">
              <h3 className="font-bold text-lg mb-2">1. Commission B2B</h3>
              <p className="text-sm text-text-secondary">Nous prenons une marge (10-15%) sur la revente de gros aux industriels (Marketplace).</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full md:w-1/3">
              <h3 className="font-bold text-lg mb-2">2. SaaS Mairie</h3>
              <p className="text-sm text-text-secondary">Abonnement logiciel pour le Centre de Commandement et les analyses prédictives.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full md:w-1/3">
              <h3 className="font-bold text-lg mb-2">3. Certificats ESG</h3>
              <p className="text-sm text-text-secondary">Monétisation des crédits carbone et certificats de traçabilité plastique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Roadmap */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-deep-forest text-center mb-12">Roadmap</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-ecoloop-green text-white flex items-center justify-center font-bold">1</div>
                <div className="w-0.5 h-full bg-green-200 my-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="font-bold text-lg text-deep-forest">Q3 2026 : Lancement MVP</h3>
                <p className="text-sm text-text-secondary">Déploiement sur Abidjan, acquisition des 500 premiers collecteurs.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
                <div className="w-0.5 h-full bg-gray-100 my-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="font-bold text-lg text-gray-500">Q1 2027 : Scale National</h3>
                <p className="text-sm text-gray-400">Expansion dans 5 villes majeures, intégration des paiements Mobile Money automatisés.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
              </div>
              <div className="pb-0">
                <h3 className="font-bold text-lg text-gray-500">Q4 2027 : Modèle Prédictif Avancé</h3>
                <p className="text-sm text-gray-400">Vente des données environnementales aux institutions et assurances.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-deep-forest text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left font-bold text-deep-forest flex items-center justify-between"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  {faq.question}
                  <Plus size={20} className={`transform transition-transform ${activeFaq === index ? 'rotate-45' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-sm text-text-secondary">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CTA Final */}
      <section className="py-24 bg-deep-forest text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-4xl font-bold mb-6">Prêt à transformer vos déchets en valeur ?</h2>
          <p className="text-lg opacity-90 mb-10">Rejoignez la révolution circulaire aujourd'hui.</p>
          <Link to="/register" className="btn-primary bg-white text-deep-forest hover:bg-gray-100 text-xl px-10 py-5 inline-flex">
            S'inscrire maintenant
          </Link>
        </div>
      </section>

      <footer className="py-16 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6 text-white">
                <Leaf className="text-ecoloop-green" size={24} />
                <span className="font-heading font-bold text-xl tracking-tight">EcoLoop</span>
              </div>
              <p className="text-sm">Transformer les déchets en ressources pour l'Afrique de demain.</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/status" className="hover:text-white transition-colors">Statut du service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Légal & Sécurité</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/security" className="hover:text-white transition-colors">Sécurité</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:contact@ecoloop.africa" className="hover:text-white transition-colors">contact@ecoloop.africa</a></li>
                <li><a href="https://linkedin.com/company/ecoloop" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2026 EcoLoop. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

