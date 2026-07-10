import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, UserCheck, Leaf, Truck, Factory, Map } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import './LoginPage.css';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'producteur' | 'collecteur' | 'industriel' | 'mairie' | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Veuillez sélectionner un profil.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, phone, password, role }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erreur d'inscription.");
      }

      const { access_token, refresh_token } = await response.json();
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur d'inscription.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="landing-nav" style={{ position: 'absolute', top: 0, width: '100%', background: 'transparent', border: 'none' }}>
        <div className="nav-container">
          <Link to="/" className="logo">EcoLoop</Link>
        </div>
      </nav>

      <div className="login-container" style={{ maxWidth: step === 1 ? '700px' : '450px' }}>
        <div className="login-header">
          <h2>Créer un compte</h2>
          <p>{step === 1 ? 'Choisissez votre profil pour commencer' : 'Renseignez vos informations'}</p>
        </div>

        {error && (
          <div className="demo-alert" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', marginBottom: '24px' }}>
            <div style={{ color: 'var(--critical)', fontSize: '0.9rem' }}>{error}</div>
          </div>
        )}

        {step === 1 && (
          <div className="grid-cols-2 gap-4 mb-8">
            <button 
              className={`p-6 border rounded-xl flex flex-col items-center gap-3 transition hover:border-primary hover:bg-primary-light ${role === 'producteur' ? 'border-primary bg-primary-light ring-2 ring-primary' : 'bg-white'}`}
              onClick={() => setRole('producteur')}
            >
              <Leaf size={32} className={role === 'producteur' ? 'text-primary' : 'text-gray-400'} />
              <span className="font-bold">Producteur</span>
              <span className="text-sm text-secondary text-center">Je génère des déchets à valoriser</span>
            </button>

            <button 
              className={`p-6 border rounded-xl flex flex-col items-center gap-3 transition hover:border-info hover:bg-blue-50 ${role === 'collecteur' ? 'border-info bg-blue-50 ring-2 ring-info' : 'bg-white'}`}
              onClick={() => setRole('collecteur')}
            >
              <Truck size={32} className={role === 'collecteur' ? 'text-info' : 'text-gray-400'} />
              <span className="font-bold">Collecteur</span>
              <span className="text-sm text-secondary text-center">Je transporte et gère des collectes</span>
            </button>

            <button 
              className={`p-6 border rounded-xl flex flex-col items-center gap-3 transition hover:border-accent hover:bg-purple-50 ${role === 'industriel' ? 'border-accent bg-purple-50 ring-2 ring-accent' : 'bg-white'}`}
              onClick={() => setRole('industriel')}
            >
              <Factory size={32} className={role === 'industriel' ? 'text-accent' : 'text-gray-400'} />
              <span className="font-bold">Industriel / Recycleur</span>
              <span className="text-sm text-secondary text-center">J'achète de la matière première</span>
            </button>

            <button 
              className={`p-6 border rounded-xl flex flex-col items-center gap-3 transition hover:border-warning hover:bg-orange-50 ${role === 'mairie' ? 'border-warning bg-orange-50 ring-2 ring-warning' : 'bg-white'}`}
              onClick={() => setRole('mairie')}
            >
              <Map size={32} className={role === 'mairie' ? 'text-warning' : 'text-gray-400'} />
              <span className="font-bold">Mairie / État</span>
              <span className="text-sm text-secondary text-center">Je supervise mon territoire</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Nom complet ou Raison sociale</label>
              <input 
                type="text" 
                className="input" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Restaurant La Terrasse"
                required 
              />
            </div>
            <div className="form-group">
              <label>Adresse email</label>
              <input 
                type="email" 
                className="input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required 
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                required 
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input 
                type="password" 
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 10 caractères, majuscule, chiffre"
                required 
              />
            </div>
          </form>
        )}

        <div className="flex justify-between mt-8">
          {step === 2 && (
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Retour</button>
          )}
          {step === 1 ? (
            <button 
              className="btn btn-primary ml-auto" 
              onClick={() => {
                if (role) setStep(2);
                else setError("Veuillez sélectionner un profil");
              }}
            >
              Continuer <ArrowRight size={18} className="ml-2" />
            </button>
          ) : (
            <button 
              className="btn btn-primary flex-1 ml-4 justify-center" 
              onClick={handleRegister}
              disabled={isSubmitting || !fullName || !email || !phone || !password}
            >
              {isSubmitting ? 'Création...' : (
                <>S'inscrire <UserCheck size={18} className="ml-2" /></>
              )}
            </button>
          )}
        </div>

        <div className="text-center mt-8 text-secondary text-sm">
          Déjà un compte ? <Link to="/login" className="text-primary hover:underline font-bold">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
}
