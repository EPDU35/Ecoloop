import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, CheckCircle2, Recycle, AlertCircle, Truck, Info } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Phone, 3: OTP, 4: Intent/Role
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const cleanPhone = phone.replace(/\s+/g, '');
  const isValidPhone = cleanPhone.length >= 8 && cleanPhone.match(/^[0-9+]+$/);

  const slideIn = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidPhone) {
      setStep(3);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length >= 4) {
      setStep(4);
    }
  };

  const handleRoleSelection = async (selectedRole: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecoloop-backend-s1vd.onrender.com/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: "Utilisateur", 
          email: `${cleanPhone}@ecoloop.com`, 
          phone: cleanPhone, 
          password: 'DefaultPassword123', 
          role: selectedRole,
          metadata: {}
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de créer le compte, veuillez vérifier votre connexion.");
      }

      const { access_token, refresh_token } = await response.json();
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      await login(`${cleanPhone}@ecoloop.com`, 'DefaultPassword123');
      navigate('/dashboard');
    } catch (err: unknown) {
      setError("Erreur technique, veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 px-6 sm:px-6 lg:px-8 font-body text-text-main">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="text-ecoloop-green" size={28} />
          <span className="font-heading font-bold text-xl text-deep-forest">EcoLoop</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <motion.div key="step1" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Leaf size={40} className="text-ecoloop-green" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-deep-forest mb-4">Bienvenue sur EcoLoop</h2>
              <p className="text-xl text-text-secondary mb-12">
                Vos déchets peuvent devenir une ressource.
              </p>
              <button 
                onClick={() => setStep(2)}
                className="btn-primary w-full text-lg py-4"
              >
                Commencer
              </button>
            </motion.div>
          )}

          {/* STEP 2: PHONE */}
          {step === 2 && (
            <motion.div key="step2" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100">
              <h2 className="font-heading text-2xl font-bold text-deep-forest mb-6">Votre numéro</h2>
              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">+225</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`block w-full pl-16 pr-4 py-4 border ${phone && isValidPhone ? 'border-ecoloop-green bg-green-50/30' : 'border-gray-200'} rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green font-medium text-lg outline-none transition-colors`}
                    placeholder="05 00 00 00 00"
                    autoFocus
                  />
                  {phone && isValidPhone && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-ecoloop-green font-medium flex items-center gap-1">
                      <CheckCircle2 size={16} /> ✓ Format valide
                    </motion.p>
                  )}
                  {phone && !isValidPhone && phone.length > 3 && (
                    <p className="mt-3 text-sm text-gray-500 font-medium flex items-center gap-1">
                      En attente d'un numéro complet...
                    </p>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={!isValidPhone}
                  className={`btn-primary w-full py-4 ${!isValidPhone ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : ''}`}
                >
                  Recevoir le code
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full mt-4 py-4 text-text-secondary font-medium hover:text-deep-forest">
                  Retour
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: OTP */}
          {step === 3 && (
            <motion.div key="step3" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100">
              <h2 className="font-heading text-2xl font-bold text-deep-forest mb-2">Code envoyé</h2>
              <p className="text-text-secondary mb-6">Au +225 {phone}</p>
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-8">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    className="block w-full px-4 py-4 text-center tracking-[1em] text-2xl border border-gray-200 rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green font-bold outline-none"
                    placeholder="••••"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={otpCode.length < 4}
                  className={`btn-primary w-full py-4 ${otpCode.length < 4 ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : ''}`}
                >
                  Vérifier
                </button>
                <button type="button" onClick={() => setStep(2)} className="w-full mt-4 py-4 text-text-secondary font-medium hover:text-deep-forest">
                  Modifier le numéro
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: INTENT */}
          {step === 4 && (
            <motion.div key="step4" variants={slideIn} initial="hidden" animate="visible" exit="exit">
              <h2 className="font-heading text-2xl font-bold text-deep-forest mb-6 text-center">Que souhaitez-vous faire ?</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={() => handleRoleSelection('producteur')}
                  disabled={isSubmitting}
                  className="w-full p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-left hover:border-ecoloop-green hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 bg-green-50 text-ecoloop-green rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Recycle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-deep-forest">Recycler mes déchets</h3>
                  </div>
                </button>

                <button 
                  onClick={() => handleRoleSelection('producteur')}
                  disabled={isSubmitting}
                  className="w-full p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-left hover:border-ecoloop-green hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-deep-forest">Signaler un dépôt</h3>
                  </div>
                </button>

                <button 
                  onClick={() => handleRoleSelection('collecteur')}
                  disabled={isSubmitting}
                  className="w-full p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-left hover:border-ecoloop-green hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-deep-forest">Trouver un collecteur</h3>
                  </div>
                </button>

                <button 
                  onClick={() => handleRoleSelection('mairie')}
                  disabled={isSubmitting}
                  className="w-full p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-left hover:border-ecoloop-green hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-deep-forest">Simplement découvrir</h3>
                  </div>
                </button>
              </div>
              
              {isSubmitting && (
                <p className="text-center mt-6 text-ecoloop-green font-medium animate-pulse">
                  Préparation de votre espace...
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

