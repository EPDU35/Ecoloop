
import { Sparkles } from 'lucide-react';
import { MascotSVG } from './MascotSVG';

interface AILoadingMascotProps {
  message?: string;
}

export function AILoadingMascot({ message = "L'IA analyse votre photo..." }: AILoadingMascotProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
      
      {/* Mascot Container with Bouncing Animation */}
      <div className="relative w-40 h-40 mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
        {/* Pulsing glow effect behind mascot */}
        <div className="absolute inset-0 bg-ecoloop-green/20 rounded-full blur-2xl animate-pulse"></div>
        
        <MascotSVG className="relative z-10 w-full h-full drop-shadow-xl" />
        
        {/* Scanning Line Animation overlaying the mascot */}
        <div className="absolute inset-0 z-20 overflow-hidden rounded-full opacity-50">
          <div className="w-full h-1 bg-green-400 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" style={{
            boxShadow: '0 0 10px 2px #4ade80'
          }}></div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-ecoloop-green animate-pulse" />
        <h3 className="text-2xl font-bold text-deep-forest">
          EcoLoop AI
        </h3>
        <Sparkles className="w-5 h-5 text-ecoloop-green animate-pulse" />
      </div>
      
      <p className="text-blue-600 font-medium animate-pulse text-lg">
        {message}
      </p>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(160px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
