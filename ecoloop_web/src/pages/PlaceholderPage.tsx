import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import './PublicPages.css';

interface PlaceholderProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderProps) {
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

      <div className="page-container mt-8 mb-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="bg-light p-8 rounded-full mb-8">
          <Construction size={64} className="text-primary opacity-50" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-secondary max-w-2xl mb-8">
          {description}
        </p>
        <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
      
      <footer className="landing-footer text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} EcoLoop. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
