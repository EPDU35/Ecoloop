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
          
          <button type="submit" className="btn btn-primary login-btn flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>Connexion en cours...</span>
            ) : (
              <span className="flex items-center gap-2">Se connecter <ArrowRight size={18} /></span>
            )}
          </button>
        </form>

        {/* SECTION DEMO HACKATHON */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4 text-center font-medium">Connexion rapide (Démo)</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => { setEmail('demo-producteur@ecoloop.ci'); setPassword('Demo2026Pass!'); }}
              className="px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors text-left"
            >
              🌱 Producteur
            </button>
            <button 
              type="button"
              onClick={() => { setEmail('demo-collecteur@ecoloop.ci'); setPassword('Demo2026Pass!'); }}
              className="px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors text-left"
            >
              🚛 Collecteur
            </button>
            <button 
              type="button"
              onClick={() => { setEmail('demo-industriel@ecoloop.ci'); setPassword('Demo2026Pass!'); }}
              className="px-3 py-2 text-xs font-medium bg-purple-50 text-purple-700 rounded-md border border-purple-200 hover:bg-purple-100 transition-colors text-left"
            >
              🏭 Industriel
            </button>
            <button 
              type="button"
              onClick={() => { setEmail('demo-mairie@ecoloop.ci'); setPassword('Demo2026Pass!'); }}
              className="px-3 py-2 text-xs font-medium bg-orange-50 text-orange-700 rounded-md border border-orange-200 hover:bg-orange-100 transition-colors text-left"
            >
              🏛️ Mairie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
