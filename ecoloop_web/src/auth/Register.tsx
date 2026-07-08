import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './auth.css';

export type UserRole = 'producer' | 'collector' | 'industrial' | 'municipality';

const ROLES: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  {
    id: 'producer',
    label: 'Producteur',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3h18v18H3z" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
  },
  {
    id: 'collector',
    label: 'Collecteur',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13h18M5 13V7a2 2 0 012-2h10a2 2 0 012 2v6M5 13l-1 6h16l-1-6" />
      </svg>
    ),
  },
  {
    id: 'industrial',
    label: 'Industriel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V10l5-4 5 4v11M14 21v-7h4v7" />
      </svg>
    ),
  },
  {
    id: 'municipality',
    label: 'Mairie / RSE',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
      </svg>
    ),
  },
];

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

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('producer');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to auth.service.ts once the backend contract is ready
    console.log({ role, fullName, phone, password });
  };

  return (
    <AuthLayout>
      <div className="el-tabs">
        <button className="el-tab" type="button" onClick={() => navigate('/login')}>
          Connexion
        </button>
        <button className="el-tab active" type="button">
          Inscription
        </button>
      </div>
      <div className="el-perforation" />

      <form className="el-ticket-body" onSubmit={handleSubmit}>
        <div className="el-ticket-heading">Rejoindre EcoLoop</div>
        <p className="el-ticket-sub">Choisissez votre profil pour démarrer.</p>

        <span className="el-role-label">Je suis...</span>
        <div className="el-role-grid">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`el-role-chip${role === r.id ? ' active' : ''}`}
              onClick={() => setRole(r.id)}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        <div className="el-field">
          <label htmlFor="fullName">Nom complet</label>
          <div className="el-input-row">
            <input
              id="fullName"
              type="text"
              placeholder="Ex. Aïcha Koné"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="el-field">
          <label htmlFor="phone">Téléphone</label>
          <div className="el-input-row">
            <input
              id="phone"
              type="text"
              placeholder="+225 07 00 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="el-field">
          <label htmlFor="password">Mot de passe</label>
          <div className="el-input-row">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="8 caractères minimum"
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

        <button className="el-submit" type="submit" style={{ marginTop: 6 }}>
          Créer mon compte
          <ArrowIcon />
        </button>

        <div className="el-switch-line" style={{ marginTop: 18 }}>
          Déjà inscrit ?{' '}
          <button type="button" onClick={() => navigate('/login')}>
            Se connecter
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
