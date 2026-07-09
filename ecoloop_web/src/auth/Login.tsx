import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthLayout from './AuthLayout';
import './auth.css';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="el-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const pending = searchParams.get('pending') === 'true';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const data = err?.response?.data;
      const detail = data?.detail || data;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join('. '));
      } else if (typeof detail === 'object' && detail !== null) {
        setError(detail.msg || JSON.stringify(detail));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const registered = searchParams.get('registered') === 'true';

  // On affiche les bannières séparément des erreurs
  const showSuccessBanner = (verified || registered) && !error;
  const showPendingBanner = pending && !error;

  return (
    <AuthLayout>
      <div className="el-tabs">
        <button className="el-tab active" type="button">
          Connexion
        </button>
        <button className="el-tab" type="button" onClick={() => navigate('/inscription')}>
          Inscription
        </button>
      </div>
      <div className="el-perforation" />

      <form className="el-ticket-body" onSubmit={handleSubmit}>
        <div className="el-ticket-heading">Bon retour</div>
        <p className="el-ticket-sub">Accédez à votre espace pour suivre vos lots et vos collectes.</p>

        {showSuccessBanner && (
          <div className="el-banner el-banner-success" style={{ marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8, flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <span>Email vérifié avec succès ! Vous pouvez maintenant vous connecter.</span>
          </div>
        )}

        {showPendingBanner && (
          <div className="el-banner el-banner-warning" style={{ marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8, flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <span>Compte en attente de validation par un administrateur. Vérifiez votre email.</span>
          </div>
        )}

        {error && !showSuccessBanner && !showPendingBanner && (
          <div className="el-error-msg">{error}</div>
        )}

        <div className="el-field">
          <label htmlFor="email">Email</label>
          <div className="el-input-row">
            <input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="el-field">
          <label htmlFor="password">Mot de passe</label>
          <div className="el-input-row">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="button"
              className="el-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              <EyeIcon />
            </button>
          </div>
        </div>

        <div className="el-row-between">
          <label className="el-checkbox-line">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Rester connecté
          </label>
          <a href="/mot-de-passe-oublie" className="el-link-muted">
            Mot de passe oublié
          </a>
        </div>

        <button className="el-submit" type="submit" disabled={submitting}>
          {submitting ? 'Connexion...' : 'Se connecter'}
          <ArrowIcon />
        </button>

        <div className="el-divider">ou</div>
        <div className="el-switch-line">
          Pas encore de compte ?{' '}
          <button type="button" onClick={() => navigate('/inscription')}>
            Créer un compte
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
