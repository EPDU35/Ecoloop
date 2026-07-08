import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Header from '../components/Header';
import { ShieldCheck, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'PRODUCTEUR', // Matches enum values uppercase
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      setStep(2);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(formData.email, otp);
      setStep(3);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Code OTP invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
          
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Rejoignez EcoLoop</h2>
                <p>Créez votre compte en quelques secondes</p>
              </div>

              {error && (
                <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Jean Kouassi"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="jean@exemple.ci"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+2250102030405"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rôle</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={loading}
                    style={{ background: '#101b33' }}
                  >
                    <option value="PRODUCTEUR">Producteur (Ménage / Commerce)</option>
                    <option value="COLLECTEUR">Collecteur (Ramassage)</option>
                    <option value="INDUSTRIEL">Industriel (Recycleur / Acheteur)</option>
                    <option value="MAIRIE">Mairie (Superviseur communal)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '10px' }} disabled={loading}>
                  <span>Continuer</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
                Déjà inscrit ? <Link to="/login" style={{ color: '#10b981', fontWeight: 600 }}>Connectez-vous</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Vérification OTP</h2>
                <p>Un code à 6 chiffres a été envoyé à <strong>{formData.email}</strong></p>
              </div>

              {error && (
                <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Code OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="form-input"
                    placeholder="123456"
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem' }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '10px' }} disabled={loading}>
                  <ShieldCheck size={18} />
                  <span>{loading ? 'Vérification...' : 'Valider mon compte'}</span>
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-flex', color: '#10b981', marginBottom: '24px' }}>
                <CheckCircle2 size={64} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Compte activé !</h2>
              <p style={{ marginBottom: '32px' }}>Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.</p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Se connecter
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
export default Register;
