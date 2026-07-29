import { RefreshCw, WifiOff, ShieldX, AlertTriangle, ServerOff } from 'lucide-react';

interface ApiErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  context?: string;
}

function getErrorInfo(error: any): { icon: React.ReactNode; title: string; message: string; canRetry: boolean } {
  const status = error?.response?.status;
  const isNetworkError = !error?.response && error?.code !== 'ECONNABORTED';
  const isTimeout = error?.code === 'ECONNABORTED';

  if (isTimeout) {
    return {
      icon: <ServerOff size={32} className="text-orange-500" />,
      title: 'Le serveur met du temps à répondre',
      message: 'Le serveur est peut-être en cours de réveil. Réessayez dans quelques instants.',
      canRetry: true,
    };
  }

  if (isNetworkError) {
    return {
      icon: <WifiOff size={32} className="text-red-500" />,
      title: 'Connexion perdue',
      message: 'Vérifiez votre connexion internet et réessayez.',
      canRetry: true,
    };
  }

  switch (status) {
    case 401:
      return {
        icon: <ShieldX size={32} className="text-orange-500" />,
        title: 'Session expirée',
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
        canRetry: false,
      };
    case 403:
      return {
        icon: <ShieldX size={32} className="text-red-500" />,
        title: 'Accès refusé',
        message: 'Vous n\'avez pas les droits pour accéder à cette ressource.',
        canRetry: false,
      };
    case 404:
      return {
        icon: <AlertTriangle size={32} className="text-gray-400" />,
        title: 'Ressource introuvable',
        message: 'Les données demandées n\'existent pas ou ont été supprimées.',
        canRetry: false,
      };
    case 409:
      return {
        icon: <AlertTriangle size={32} className="text-orange-500" />,
        title: 'Action déjà effectuée',
        message: error?.response?.data?.detail || 'Ce lot a déjà été réservé par un autre collecteur.',
        canRetry: false,
      };
    case 500:
      return {
        icon: <ServerOff size={32} className="text-red-500" />,
        title: 'Erreur serveur',
        message: 'Une erreur interne est survenue. Réessayez dans quelques instants.',
        canRetry: true,
      };
    default:
      return {
        icon: <AlertTriangle size={32} className="text-red-500" />,
        title: 'Erreur inattendue',
        message: error?.response?.data?.detail || 'Une erreur est survenue. Réessayez.',
        canRetry: true,
      };
  }
}

export function ApiErrorDisplay({ error, onRetry, context }: ApiErrorDisplayProps) {
  const { icon, title, message, canRetry } = getErrorInfo(error);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">{message}</p>
      {context && (
        <p className="text-xs text-gray-400 mb-4">{context}</p>
      )}
      {canRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors flex items-center gap-2 active:scale-[0.98]"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      )}
    </div>
  );
}
