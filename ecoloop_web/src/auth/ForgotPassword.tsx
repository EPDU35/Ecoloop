import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './auth.css';

const ArrowIcon = () => (
  <svg className="el-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'sent' | 'reset'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Appel API pour demander le reset
      const api = (await import('../services/api')).default;
      await api.post('/auth/password-reset/request', { email });
      setStep('sent');
    } catch (err: any) {
      // On affiche toujours le succès pour ne pas révéler si l'email existe (anti-énumération)
      setStep('sent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const api = (await import('../services/api')).default;
      await api.post('/auth/password-reset/confirm', { email, code, new_password: newPassword });
      setStep('reset');
    } catch (err: any) {
      const data = err?.response?.data;
      const detail = data?.detail || data;
      if (typeof detail === 'string') setError(detail);
      else if (Array.isArray(detail)) setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join('. '));
      else setError('Code invalide ou expiré.');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'sent') setStep('request');
    else if (step === 'reset') setStep('sent');
    else navigate('/connexion');
  };

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <AuthLayout>
      <div className="el-tabs">
        <button className="el-tab" type="button" onClick={() => navigate('/connexion')}>
          Connexion
        </button>
        <button className="el-tab active" type="button">
          Mot de passe oublié
        </button>
      </div>
      <div className="el-perforation" />

      <div className="el-ticket-body">
        {step === 'request' && (
          <>
            <div className="el-ticket-heading">Réinitialiser mon mot de passe</div>
            <p className="el-ticket-sub">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>

            {error && <div className="el-error-msg">{error}</div>}

            <form onSubmit={handleRequestReset}>
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
                    required
                  />
                </div>
              </div>

              <button className="el-submit" type="submit" disabled={submitting} style={{ marginTop: 6 }}>
                {submitting ? 'Envoi...' : 'Envoyer le lien'}
                <ArrowIcon />
              </button>
            </form>
          </>
        )}

        {step === 'sent' && (
          <>
            <div className="el-ticket-heading" style={{ textAlign: 'center' }}>Vérifiez votre boîte mail</div>
            <p className="el-ticket-sub" style={{ textAlign: 'center', maxWidth: '360px', margin: '0 auto 2rem' }}>
              Un email a été envoyé à <strong>{email}</strong> avec un code de vérification.
              <br />Le code expire dans 30 minutes.
            </p>

            <form onSubmit={handleVerifyCode}>
              <div className="el-field">
                <label htmlFor="code">Code de vérification</label>
                <div className="el-input-row">
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.25em' }}
                    required
                  />
                </div>
              </div>

              <div className="el-field">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <div className="el-input-row">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8 caractères minimum"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  <button
                    type="button"
                    className="el-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    <EyeIcon />
                  </button>
                </div>
              </div>

              <div className="el-field">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="el-input-row">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {error && <div className="el-error-msg">{error}</div>}

              <button className="el-submit" type="submit" disabled={submitting || code.length < 4 || newPassword.length < 8 || newPassword !== confirmPassword} style={{ marginTop: 6 }}>
                {submitting ? 'Réinitialisation...' : 'Valider et changer'}
                <ArrowIcon />
              </button>
            </form>

            <div className="el-switch-line" style={{ marginTop: 18 }}>
              <button type="button" onClick={goBack}>← Retour</button>
            </div>
          </>
        )}

        {step === 'reset' && (
          <>
            <div className="el-ticket-heading" style={{ textAlign: 'center' }}>Mot de passe modifié</div>
            <p className="el-ticket-sub" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
              <button
                type="button"
                className="el-submit"
                onClick={() => navigate('/connexion')}
                style={{ background: 'var(--el-ink)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Se connecter
                <ArrowIcon />
              </button>
              <button
                type="button"
                className="el-submit"
                onClick={() => { setStep('request'); setEmail(''); setCode(''); setNewPassword(''); setConfirmPassword(''); }}
                style={{ background: 'transparent', color: 'var(--el-ink)', border: '1px solid var(--el-line)', cursor: 'pointer' }}
              >
                Recommencer
              </button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}