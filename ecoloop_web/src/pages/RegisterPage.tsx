import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, AlertCircle, ArrowRight, Recycle, Truck, Factory, Building } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/api/authService';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const slideIn = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(3);
    }
  };

  const handleRoleSelection = async (selectedRole: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Enregistrement (sans OTP)
      await authService.register({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/\s+/g, ''),
        password: formData.password,
        role: selectedRole
      });

      // 2. Auto-login
      await login(formData.email, formData.password);
      
      // 3. Redirection
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Erreur lors de l'inscription, veuillez réessayer.");
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
              <h2 className="font-heading text-3xl font-bold text-deep-forest mb-4">Rejoignez EcoLoop</h2>
              <p className="text-xl text-text-secondary mb-12">
                Ensemble, transformons nos déchets en ressources.
              </p>
              <button 
                onClick={() => setStep(2)}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
              >
                Créer un compte <ArrowRight size={20} />
              </button>
              <div className="mt-6">
                <p className="text-sm text-text-secondary">
                  Vous avez déjà un compte ? <Link to="/login" className="text-ecoloop-green hover:underline font-medium">Connectez-vous</Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORM */}
          {step === 2 && (
            <motion.div key="step2" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100">
              <h2 className="font-heading text-2xl font-bold text-deep-forest mb-6">Vos informations</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green outline-none transition-colors"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green outline-none transition-colors"
                    placeholder="jean@exemple.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">+225</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-16 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green outline-none transition-colors"
                      placeholder="01 02 03 04 05"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Au moins 8 caractères.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-ecoloop-green focus:border-ecoloop-green outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                    Continuer <ArrowRight size={18} />
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full mt-3 py-3 text-text-secondary font-medium hover:text-deep-forest">
                    Retour
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: ROLE */}
          {step === 3 && (
            <motion.div key="step3" variants={slideIn} initial="hidden" animate="visible" exit="exit">
              <h2 className="font-heading text-2xl font-bold text-deep-forest mb-6 text-center">Vous êtes ?</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
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
                    <h3 className="font-bold text-lg text-deep-forest">Producteur de déchets</h3>
                    <p className="text-sm text-text-secondary">Je souhaite recycler ou valoriser mes déchets.</p>
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
                    <h3 className="font-bold text-lg text-deep-forest">Collecteur</h3>
                    <p className="text-sm text-text-secondary">Je récupère et transporte les déchets.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleRoleSelection('industriel')}
                  disabled={isSubmitting}
                  className="w-full p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-left hover:border-ecoloop-green hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Factory size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-deep-forest">Industriel</h3>
                    <p className="text-sm text-text-secondary">Je transforme et valorise les matières premières.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleRoleSelection('mairie')}
                  disabled={isSubmitting}
                  className="w-full p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-left hover:border-ecoloop-green hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-deep-forest">Mairie</h3>
                    <p className="text-sm text-text-secondary">Je gère le ramassage sur ma commune.</p>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 flex flex-col items-center">
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  disabled={isSubmitting}
                  className="py-3 px-6 text-text-secondary font-medium hover:text-deep-forest"
                >
                  Retour
                </button>
                {isSubmitting && (
                  <p className="text-center mt-2 text-ecoloop-green font-medium animate-pulse">
                    Création de votre compte en cours...
                  </p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
