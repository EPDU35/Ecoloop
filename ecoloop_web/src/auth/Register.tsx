import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthLayout from './AuthLayout';
import './auth.css';

export type UserRole = 'producteur' | 'collecteur' | 'industriel' | 'mairie';

const ROLES: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  {
    id: 'producteur',
    label: 'Producteur',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3h18v18H3z" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
  },
  {
    id: 'collecteur',
    label: 'Collecteur',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13h18M5 13V7a2 2 0 012-2h10a2 2 0 012 2v6M5 13l-1 6h16l-1-6" />
      </svg>
    ),
  },
  {
    id: 'industriel',
    label: 'Industriel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V10l5-4 5 4v11M14 21v-7h4v7" />
      </svg>
    ),
  },
  {
    id: 'mairie',
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
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('producteur');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let raw = val.replace(/\D/g, '');
    
    if (raw.length === 0) {
      setPhone('');
      return;
    }

    if (raw.startsWith('225')) {
      raw = raw.substring(3);
    }

    let formatted = '+225';
    for (let i = 0; i < raw.length && i < 10; i++) {
      if (i % 2 === 0) formatted += ' ';
      formatted += raw[i];
    }
    
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    if (fullName.trim().length < 2) {
      setError('Le nom complet doit contenir au moins 2 caractères.');
      setSubmitting(false);
      return;
    }

    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(cleanedPhone)) {
      setError('Numéro de téléphone invalide (8 à 15 chiffres requis).');
      setSubmitting(false);
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
      setSubmitting(false);
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: cleanedPhone,
        password,
        role: role.toUpperCase(),
      });
      navigate(`/verifier-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join('. '));
      } else {
        setError(detail || 'Erreur lors de l\'inscription.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="el-tabs">
        <button className="el-tab" type="button" onClick={() => navigate('/connexion')}>
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

        {error && <div className="el-error-msg">{error}</div>}

        <span className="el-role-label">Je suis...</span>
        <div className="el-role-grid">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`el-role-chip${role === r.id ? ' active' : ''}`}
              onClick={() => setRole(r.id)}
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>
        </div>

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
          <label htmlFor="phone">Téléphone</label>
          <div className="el-input-row">
            <input
              id="phone"
              type="text"
              placeholder="+225 07 00 00 00 00"
              value={phone}
              onChange={handlePhoneChange}
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
              placeholder="8 caractères minimum"
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

        <button className="el-submit" type="submit" disabled={submitting} style={{ marginTop: 6 }}>
          {submitting ? 'Inscription...' : 'Créer mon compte'}
          <ArrowIcon />
        </button>

        <div className="el-switch-line" style={{ marginTop: 18 }}>
          Déjà inscrit ?{' '}
          <button type="button" onClick={() => navigate('/connexion')}>
            Se connecter
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
