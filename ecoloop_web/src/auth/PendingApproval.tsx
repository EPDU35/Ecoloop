import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './auth.css';

const ArrowIcon = () => (
  <svg className="el-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function PendingApproval() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [dots, setDots] = useState(0);

  // Animation des points
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <AuthLayout>
      <div className="el-tabs">
        <button className="el-tab" type="button" onClick={() => navigate('/connexion')}>
          Connexion
        </button>
        <button className="el-tab active" type="button">
          En attente
        </button>
      </div>
      <div className="el-perforation" />

      <div className="el-ticket-body" style={{ textAlign: 'center', padding: '2rem 2rem 1.5rem' }}>
        <div className="el-pending-icon" style={{ marginBottom: '1.25rem' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--el-signal)" strokeWidth="1.5" style={{ animation: 'el-pulse 2s ease-in-out infinite' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="el-ticket-heading" style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
          Compte en attente de validation
        </h1>
        <p className="el-ticket-sub" style={{ maxWidth: '360px', margin: '0 auto 1.5rem' }}>
          Merci pour votre inscription <strong>{email || 'à EcoLoop'}</strong>.
          <br />
          Votre compte professionnel (Collecteur, Industriel ou Mairie/RSE) doit être
          validé par notre équipe.
        </p>

        <div className="el-pending-steps" style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="el-pending-step" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--el-signal)' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--el-signal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>1</span>
            <span>Inscription reçue <span className="el-check">✓</span></span>
          </div>
          <div className="el-pending-step" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--el-signal)' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--el-signal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>{'.'.repeat(dots) + ' '.repeat(3 - dots)}</span>
            <span>Validation par notre équipe en cours</span>
          </div>
          <div className="el-pending-step" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--el-ink-soft)' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--el-line)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>3</span>
            <span>Activation + email de confirmation</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--el-ink-soft)', marginBottom: '1.5rem' }}>
          D&eacute;lai habituel : <strong>{' < 24h ouvr&eacute;es'}</strong>. Vous recevrez un email d&egrave;s que votre
          compte sera activ&eacute;.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
          <button
            type="button"
            className="el-submit"
            onClick={() => navigate('/connexion')}
            style={{ background: 'var(--el-ink)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Aller à la connexion
            <ArrowIcon />
          </button>

          <button
            type="button"
            className="el-submit"
            onClick={() => navigate('/inscription')}
            style={{ background: 'transparent', color: 'var(--el-ink)', border: '1px solid var(--el-line)', cursor: 'pointer' }}
          >
            Modifier mes informations
          </button>
        </div>

        <div className="el-switch-line" style={{ marginTop: 18 }}>
          Besoin d&rsquo;aide ?{' '}
          <a href="mailto:support@ecoloop.ci" style={{ color: 'var(--el-signal)', fontWeight: 500 }}>
            contactez-nous
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}