import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export function StatusPage() {
  const services = [
    { name: 'API Backend', status: 'Opérationnelle' },
    { name: 'IA (Reconnaissance visuelle)', status: 'Opérationnelle' },
    { name: 'IA (Prédiction)', status: 'Opérationnelle' },
    { name: 'Système de Notifications', status: 'Opérationnelles' },
    { name: 'Marketplace B2B', status: 'Opérationnelle' },
    { name: 'Paiements Mobile Money', status: 'Opérationnelle' },
  ];

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      <nav className="bg-white border-b border-gray-100 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-deep-forest hover:text-ecoloop-green transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl font-bold text-deep-forest mb-4">Statut des services</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium">
            <CheckCircle2 size={18} />
            Tous les systèmes sont opérationnels
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {services.map((service, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-bold text-deep-forest">{service.name}</span>
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  {service.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          Dernière mise à jour : Il y a quelques instants.
        </p>
      </div>
    </div>
  );
}
