import { useState } from 'react';
import api from './services/api';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0b1120', padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(17, 28, 52, 0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ color: '#10b981', fontFamily: 'Outfit, sans-serif', marginBottom: '8px', fontSize: '1.5rem' }}>
          EcoLoop Admin
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.9rem' }}>
          Connectez-vous pour accéder au panneau d'administration
        </p>

        {error && (
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              color: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Mot de passe</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              color: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, #14b8a6)',
          border: 'none', borderRadius: '8px', color: '#040814', fontWeight: 600,
          fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
