import { useState, useEffect } from 'react';
import { RefreshCw, Leaf, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServerHealth } from '@/hooks/useApi';

export function ServerWakeup({ children }: { children: React.ReactNode }) {
  const { isReady, isWaking, isError, retry } = useServerHealth();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isReady) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isReady]);

  const handleManualRetry = () => {
    setElapsed(0);
    retry();
  };

  if (isReady) {
    return <>{children}</>;
  }

  // Dynamic status messages based on elapsed time (no technical jargon)
  let statusMessage = "Connexion à votre espace...";
  let statusSubtitle = "";

  if (elapsed >= 30) {
    statusMessage = "Nous préparons votre espace EcoLoop...";
    statusSubtitle = "Cela prend un peu plus de temps que prévu.";
  } else if (elapsed >= 10) {
    statusMessage = "Préparation de votre écosystème...";
    statusSubtitle = "Le service démarre, merci de patienter quelques instants.";
  }

  // Progress estimation (0 to 90% smooth fill)
  const progressPercent = Math.min(92, Math.round((elapsed / 45) * 90) + 8);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-950 via-deep-forest to-gray-950 flex flex-col items-center justify-between py-12 px-6 z-[9999] font-body text-white select-none">
      
      {/* Top spacing */}
      <div />

      {/* Main Splash Content */}
      <div className="max-w-sm mx-auto text-center flex flex-col items-center">
        
        {/* Animated Brand Logo */}
        <motion.div 
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-ecoloop-green to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30 border border-white/20">
            <Leaf size={48} className="text-white transform -rotate-12 animate-pulse" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="absolute -inset-2 rounded-[2rem] border border-green-400/20 border-t-green-400/60 pointer-events-none"
          />
        </motion.div>

        {/* Brand Name & Tagline */}
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center justify-center gap-2">
          EcoLoop <Sparkles size={20} className="text-yellow-300 animate-bounce" />
        </h1>
        <p className="text-xs uppercase tracking-widest text-green-300 font-bold mb-10 opacity-90">
          Recycler • Récompenser • Préserver
        </p>

        {isWaking && (
          <div className="w-full space-y-6">
            {/* Dynamic Status Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={statusMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <p className="font-bold text-base text-green-100">{statusMessage}</p>
                {statusSubtitle && (
                  <p className="text-xs text-green-300/80 leading-relaxed">{statusSubtitle}</p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Smooth Animated Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 p-0.5 backdrop-blur-md overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Optional Manual Retry button after 30s */}
            {elapsed >= 30 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleManualRetry}
                className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-green-200 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
              >
                <RefreshCw size={14} />
                Réessayer la connexion
              </motion.button>
            )}
          </div>
        )}

        {isError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-6"
          >
            <p className="font-bold text-lg text-red-200">
              Impossible de joindre l'écosystème EcoLoop.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Vérifiez votre connexion internet et réessayez.
            </p>

            <button
              onClick={handleManualRetry}
              className="w-full py-4 bg-ecoloop-green hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={18} />
              Réessayer la connexion
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-green-400/60 font-medium tracking-wide">
        EcoLoop Ivory Coast • Économie Circulaire
      </div>
    </div>
  );
}
