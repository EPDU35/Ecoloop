import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthLayout from './AuthLayout';
import './auth.css';

export default function OtpVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email non trouvé. Veuillez vous réinscrire.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await verifyOtp(email, code);
      navigate('/connexion?verified=true');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Code invalide ou expiré.');
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
          Vérification
        </button>
      </div>
      <div className="el-perforation" />

      <form className="el-ticket-body" onSubmit={handleSubmit}>
        <div className="el-ticket-heading">Vérifiez votre email</div>
        <p className="el-ticket-sub">
          Un code de vérification a été envoyé à <strong>{email || 'votre adresse'}</strong>.
        </p>

        {error && <div className="el-error-msg">{error}</div>}

        <div className="el-field">
          <label htmlFor="otp">Code de vérification</label>
          <div className="el-input-row">
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={submitting}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.25em' }}
            />
          </div>
        </div>

        <button className="el-submit" type="submit" disabled={submitting || code.length < 4}>
          {submitting ? 'Vérification...' : 'Vérifier mon compte'}
        </button>

        <div className="el-switch-line" style={{ marginTop: 18 }}>
          Déjà vérifié ?{' '}
          <button type="button" onClick={() => navigate('/connexion')}>
            Se connecter
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
