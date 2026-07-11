import { ArrowLeft, Target, ShieldCheck, HeartHandshake, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VisionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-[100px]">
      <div className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-deep-forest" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-deep-forest">Pourquoi EcoLoop ?</h1>
            <p className="text-sm text-text-secondary">Notre vision pour l'économie circulaire africaine</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-12">
        
        {/* Le Problème */}
        <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <Target size={20} />
            </div>
            <h2 className="font-heading text-xl font-bold text-red-900">Le Problème</h2>
          </div>
          <p className="text-red-800 text-lg leading-relaxed">
            Aujourd'hui, l'essentiel des déchets produits en Afrique termine dans des décharges à ciel ouvert ou dans la nature. Or, ces "déchets" sont en réalité des <strong>ressources naturelles non exploitées</strong>. Leur mauvaise gestion entraîne une pollution massive et oblige les industriels à importer des matières premières vierges (pétrole, minerais) à un coût financier et écologique exorbitant.
          </p>
        </section>

        {/* La Solution */}
        <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ecoloop-green/10 text-ecoloop-green rounded-xl flex items-center justify-center">
              <Lightbulb size={20} />
            </div>
            <h2 className="font-heading text-xl font-bold text-deep-forest">Notre Solution</h2>
          </div>
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            EcoLoop est l'infrastructure numérique qui connecte tous les acteurs de la chaîne de valeur : 
          </p>
          <ul className="space-y-4 text-deep-forest font-medium">
            <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-ecoloop-green"></span> <strong>Producteurs</strong> : trient et vendent leurs déchets.</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <strong>Collecteurs</strong> : optimisent leurs tournées grâce à l'IA.</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-500"></span> <strong>Industriels</strong> : achètent des matières premières secondaires de qualité via notre Marketplace.</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-orange-500"></span> <strong>Mairies</strong> : suivent l'impact environnemental en temps réel.</li>
          </ul>
        </section>

        {/* Le Modèle Économique */}
        <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <HeartHandshake size={20} />
            </div>
            <h2 className="font-heading text-xl font-bold text-deep-forest">Notre Modèle Économique</h2>
          </div>
          <p className="text-text-secondary text-lg leading-relaxed mb-4">
            Nous créons de la valeur pour tout le monde, tout en sécurisant un modèle économique SaaS et transactionnel solide :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block font-bold text-deep-forest mb-1">Commission B2B</span>
              <p className="text-sm text-text-secondary">Marge prise sur chaque transaction entre le collecteur et l'industriel.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block font-bold text-deep-forest mb-1">SaaS Industriel/Mairie</span>
              <p className="text-sm text-text-secondary">Abonnement pour l'accès aux données de traçabilité, rapports RSE et Dashboard.</p>
            </div>
          </div>
        </section>

        {/* L'Impact */}
        <section className="bg-deep-forest text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ecoloop-green/20 rounded-full blur-3xl mix-blend-screen -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 text-ecoloop-green rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck size={20} />
              </div>
              <h2 className="font-heading text-xl font-bold">L'Impact (Ressources Naturelles)</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              En réintégrant ces matières dans l'économie, nous évitons l'extraction de nouvelles ressources naturelles (pétrole, bois, eau, minerais) tout en assainissant nos villes. 
              <strong> Ce n'est pas juste de la gestion des déchets, c'est de la préservation de ressources.</strong>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
