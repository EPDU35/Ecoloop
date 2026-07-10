import { useState, useEffect } from 'react';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from './services/api';

interface Props { onLogin: () => void; }

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupérer l'URL de chaque service Render au chargement (warm-up visuel)
  useEffect(() => {
    document.title = 'EcoLoop Admin — Connexion';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      onLogin();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Impossible de se connecter. Vérifiez vos identifiants.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Background décor */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Leaf size={22} color="#0a0b0d" />
          </div>
          <div>
            <div className="login-logo-name">EcoLoop</div>
            <div className="login-logo-tag">Console d'administration</div>
          </div>
        </div>

        {/* Titre */}
        <h1 className="login-title">Bienvenue 👋</h1>
        <p className="login-subtitle">Connectez-vous pour gérer la plateforme EcoLoop</p>

        {/* Erreur */}
        {error && (
          <div className="login-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecoloop.ci"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Mot de passe</label>
            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" />
                Connexion en cours…
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <p className="login-footer">
          Accès réservé aux administrateurs EcoLoop
        </p>
      </div>
    </div>
  );
}
