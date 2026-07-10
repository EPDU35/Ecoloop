import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card text-center" style={{ padding: '48px 24px', maxWidth: '500px' }}>
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: '24px', display: 'inline-block' }}>
          <FileQuestion size={48} />
        </div>
        <h1 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Page introuvable</h1>
        <p className="text-secondary" style={{ marginBottom: '32px' }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/" className="btn btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
