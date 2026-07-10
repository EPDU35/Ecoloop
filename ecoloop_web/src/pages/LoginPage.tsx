import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { MOCK_USERS } from '@/services/mocks/mockData';
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
    
    const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

    try {
      if (isDemo) {
        const user = Object.values(MOCK_USERS).find(u => u.email === email);
        if (!user) throw new Error("Email démo non reconnu.");
        await login(email, password);
      } else {
        await login(email, password);
      }
      
      navigate('/'); 
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo text-center">EcoLoop</div>
          <h2>Connexion à votre espace</h2>
          <p>Gérez vos déchets, optimisez vos tournées ou suivez l'impact de votre commune.</p>
        </div>

        {import.meta.env.VITE_DEMO_MODE === 'true' && (
          <div className="demo-alert">
            <AlertCircle size={20} className="text-alert" />
            <div>
              <strong>Mode Démo Actif</strong>
              <p>Sélectionnez un profil pour tester la plateforme :</p>
              <div className="demo-buttons">
                <button type="button" onClick={() => fillDemoCredentials('mairie@abobo.ci')} className="demo-btn">Mairie</button>
                <button type="button" onClick={() => fillDemoCredentials('producteur@restaurant.ci')} className="demo-btn">Producteur</button>
                <button type="button" onClick={() => fillDemoCredentials('collecteur@express.ci')} className="demo-btn">Collecteur</button>
                <button type="button" onClick={() => fillDemoCredentials('industriel@plastique.ci')} className="demo-btn">Industriel</button>
              </div>
            </div>
          </div>
        )}

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
