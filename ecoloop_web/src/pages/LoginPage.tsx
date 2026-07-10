import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo text-center">EcoLoop</div>
          <h2>Connexion à votre espace</h2>
          <p>Gérez vos déchets, optimisez vos tournées ou suivez l'impact de votre commune.</p>
        </div>

        {error && (
          <div className="demo-alert" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
            <AlertCircle size={20} className="text-critical" style={{ color: 'var(--critical)' }} />
            <div style={{ color: 'var(--critical)', fontSize: '0.9rem' }}>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input 
              type="email" 
              id="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion en cours...' : (
              <>Se connecter <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
