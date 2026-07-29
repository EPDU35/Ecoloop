import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { useServerHealth } from '@/hooks/useApi';

export function ServerWakeup({ children }: { children: React.ReactNode }) {
  const { isReady, isWaking, isError, retry } = useServerHealth();

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-950 via-gray-950 to-gray-900 flex items-center justify-center z-[9999]">
      <div className="max-w-sm mx-auto text-center px-6">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
          <span className="text-3xl font-black text-white tracking-tighter">E</span>
        </div>

        {isWaking && (
          <>
            <h2 className="text-2xl font-bold text-white mb-3">
              Réveil du serveur…
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Première connexion : le serveur peut mettre jusqu'à 1 minute à se réveiller. Merci de patienter.
            </p>

            {/* Animated loader */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 size={20} className="text-green-400 animate-spin" />
              <span className="text-green-400 font-medium text-sm">Connexion en cours…</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full animate-pulse"
                style={{ width: '60%', transition: 'width 2s ease' }}
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
              <Wifi size={14} />
              <span>Tentative de connexion au serveur EcoLoop…</span>
            </div>
          </>
        )}

        {isError && (
          <>
            <h2 className="text-2xl font-bold text-white mb-3">
              Serveur indisponible
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Le serveur ne répond pas. Vérifiez votre connexion internet ou réessayez dans quelques instants.
            </p>

            <div className="flex items-center justify-center gap-2 text-red-400 mb-6">
              <WifiOff size={20} />
              <span className="font-medium text-sm">Connexion échouée</span>
            </div>

            <button
              onClick={() => retry()}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <RefreshCw size={20} />
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
