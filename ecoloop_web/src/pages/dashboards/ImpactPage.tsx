import { ArrowLeft, Leaf, Droplets, Wind, ShieldCheck, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';

export function ImpactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg font-body text-text-main pb-24">
      <div className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="max-w-3xl mx-auto text-center mt-4">
          <h1 className="font-heading text-2xl font-bold text-deep-forest mb-2">Votre Impact</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard 
            title="Matière Recyclée" 
            value="236 kg" 
            icon={<Leaf size={24} />} 
            colorClass="text-ecoloop-green"
          />
          <StatCard 
            title="CO₂ Évité" 
            value="210 kg" 
            icon={<Wind size={24} />} 
            colorClass="text-gray-700"
          />
          <StatCard 
            title="Eau Économisée" 
            value="1 250 L" 
            icon={<Droplets size={24} />} 
            colorClass="text-blue-500"
          />
          <StatCard 
            title="Arbres Préservés" 
            value="4" 
            icon={<Leaf size={24} />} 
            colorClass="text-ecoloop-green"
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-deep-forest mb-4 px-2">Vos Récompenses</h2>
          
          <Card className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Award size={32} />
            </div>
            <div>
              <span className="font-bold text-xl text-deep-forest block">Niveau Argent</span>
              <span className="text-sm text-text-secondary">Continuez à recycler pour atteindre le niveau Or.</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-50 text-ecoloop-green rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div>
              <span className="font-bold text-xl text-deep-forest block">Badge EcoCitizen</span>
              <span className="text-sm text-text-secondary">Décerné pour vos 100 premiers kilos recyclés.</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
