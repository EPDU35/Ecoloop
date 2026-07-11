import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-8 mx-auto">
        <SearchX size={48} />
      </div>
      <h1 className="font-heading text-4xl font-extrabold text-deep-forest mb-4">Cette ressource n'existe pas.</h1>
      <p className="text-xl text-text-secondary mb-8 max-w-md mx-auto">
        La page ou le document que vous cherchez a peut-être été déplacé ou supprimé.
      </p>
      <Link to="/dashboard">
        <Button size="lg" leftIcon={<ArrowLeft size={20} />}>
          Retour au tableau de bord
        </Button>
      </Link>
    </div>
  );
}
