
import { Sparkles } from 'lucide-react';

interface AILoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function AILoadingOverlay({ isVisible, message = "L'IA analyse votre photo..." }: AILoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-2xl border border-primary/20 max-w-sm mx-4 text-center transform transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Mascot Container with Bouncing Animation */}
        <div className="relative w-40 h-40 mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
          {/* Pulsing glow effect behind mascot */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          
          <img 
            src="/mascot.png" 
            alt="EcoLoop Mascot" 
            className="relative z-10 w-full h-full object-contain drop-shadow-xl"
            onError={(e) => {
              // Fallback if image not found
              (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3299/3299935.png';
            }}
          />
          
          {/* Scanning Line Animation overlaying the mascot */}
          <div className="absolute inset-0 z-20 overflow-hidden rounded-full opacity-50">
            <div className="w-full h-1 bg-green-400 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" style={{
              boxShadow: '0 0 10px 2px #4ade80'
            }}></div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-xl font-bold text-gray-800">
            EcoLoop AI
          </h3>
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
        
        <p className="text-gray-600 font-medium animate-pulse">
          {message}
        </p>
        
        {/* Add custom keyframes for the scan line */}
        <style>{`
          @keyframes scan {
            0% { transform: translateY(-20px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(160px); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
