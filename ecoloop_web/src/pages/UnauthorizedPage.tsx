import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card text-center" style={{ padding: '48px 24px', maxWidth: '500px' }}>
        <div style={{ backgroundColor: '#fee2e2', color: 'var(--critical)', padding: '16px', borderRadius: '50%', marginBottom: '24px', display: 'inline-block' }}>
          <ShieldAlert size={48} />
        </div>
        <h1 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Accès Non Autorisé</h1>
        <p className="text-secondary" style={{ marginBottom: '32px' }}>
          Votre compte n'a pas les permissions requises pour accéder à cette section de la plateforme.
        </p>
        <Link to="/" className="btn btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
