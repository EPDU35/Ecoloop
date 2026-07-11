import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Globe, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text-main font-body">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-deep-forest hover:text-ecoloop-green transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-heading text-4xl font-extrabold text-deep-forest mb-6">À propos d'EcoLoop</h1>
        <p className="text-xl text-text-secondary mb-12">
          Nous construisons l'infrastructure numérique de l'économie circulaire en Afrique.
        </p>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 text-ecoloop-green rounded-lg">
                <Target size={24} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-deep-forest">Notre Mission</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Transformer les déchets en ressources précieuses tout en créant des opportunités économiques pour les acteurs locaux. Nous croyons que la technologie peut résoudre le problème de la gestion des déchets à grande échelle.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe size={24} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-deep-forest">Notre Vision (ODD)</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">
              EcoLoop s'aligne directement avec les Objectifs de Développement Durable des Nations Unies, notamment :
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <strong className="text-deep-forest">ODD 11</strong> : Villes et communautés durables.
              </li>
              <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <strong className="text-deep-forest">ODD 12</strong> : Consommation et production responsables.
              </li>
              <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <strong className="text-deep-forest">ODD 8</strong> : Travail décent et croissance économique.
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <Users size={24} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-deep-forest">L'équipe</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">
              Nous sommes une équipe de passionnés de technologie, d'experts en logistique et d'ingénieurs environnementaux basés en Afrique de l'Ouest, unis par une conviction commune.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-deep-forest mb-1">Amadou Diallo</h3>
                <p className="text-sm text-text-secondary">CEO & Co-fondateur</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-deep-forest mb-1">Sarah Koné</h3>
                <p className="text-sm text-text-secondary">CTO</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
            <Heart size={32} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-deep-forest mb-4">Rejoignez l'aventure</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Vous partagez notre vision ? Découvrez comment vous pouvez contribuer à l'économie circulaire avec EcoLoop.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button>Créer un compte</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
