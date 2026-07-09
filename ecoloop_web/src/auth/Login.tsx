import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to auth.service.ts once the backend contract is ready
    // TODO: wire up to auth.service.ts once the backend contract is ready
  };

  return (
    <AuthLayout>
      <div className="el-tabs">
        <button className="el-tab active" type="button">
          Connexion
        </button>
        <button className="el-tab" type="button" onClick={() => navigate('/register')}>
          Inscription
        </button>
      </div>
      <div className="el-perforation" />

      <form className="el-ticket-body" onSubmit={handleSubmit}>
        <div className="el-ticket-heading">Bon retour</div>
        <p className="el-ticket-sub">Accédez à votre espace pour suivre vos lots et vos collectes.</p>

        <div className="el-field">
          <label htmlFor="identifier">Téléphone ou e-mail</label>
          <div className="el-input-row">
            <input
              id="identifier"
              type="text"
              placeholder="+225 07 00 00 00 00"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
          <a href="#" className="el-link-muted">
            Mot de passe oublié
          </a>
        </div>

        <button className="el-submit" type="submit">
          Se connecter
          <ArrowIcon />
        </button>

        <div className="el-divider">ou</div>
        <div className="el-switch-line">
          Pas encore de compte ?{' '}
          <button type="button" onClick={() => navigate('/register')}>
            Créer un compte
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
