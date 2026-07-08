import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Header from '../components/Header';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Determine redirect path based on role
      const userStr = localStorage.getItem('access_token');
      if (userStr) {
        // Fetch profile payload through AuthContext check
        // To be safe, wait a brief moment for Context state to populate, or decode JWT
        const base64Url = userStr.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const role = payload.role?.toLowerCase();
        
        if (role === 'producteur') navigate('/dashboard/producer');
        else if (role === 'collecteur') navigate('/dashboard/collector');
        else if (role === 'industriel') navigate('/dashboard/industrial');
        else if (role === 'mairie') navigate('/dashboard/municipality');
        else navigate('/');
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Bon retour !</h2>
            <p>Connectez-vous à votre espace personnel EcoLoop</p>
          </div>

          {expired && (
            <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', color: '#f59e0b', marginBottom: '20px', fontSize: '0.9rem' }}>
              <Lock size={18} style={{ flexShrink: 0 }} />
              <span>Votre session a expiré. Veuillez vous reconnecter.</span>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="nom@exemple.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '10px' }} disabled={loading}>
              <LogIn size={18} />
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
            Nouveau sur EcoLoop ? <Link to="/register" style={{ color: '#10b981', fontWeight: 600 }}>Créez un compte</Link>
          </p>
        </div>
      </main>
    </div>
  );
};
export default Login;
