

export function MascotSVG({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ombre portée */}
      <ellipse cx="100" cy="180" rx="60" ry="10" fill="#1e402b" opacity="0.2" />

      {/* Bras Gauche avec feuille */}
      <path d="M 60 110 Q 30 110, 20 80" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 20 80 C 10 70, 0 85, 20 95" fill="#4ade80" />
      <path d="M 20 80 C 15 65, 30 65, 20 95" fill="#22c55e" />

      {/* Bras Droit avec feuille */}
      <path d="M 140 110 Q 170 110, 180 80" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 180 80 C 190 70, 200 85, 180 95" fill="#4ade80" />
      <path d="M 180 80 C 185 65, 170 65, 180 95" fill="#22c55e" />

      {/* Corps de la poubelle */}
      <path d="M 60 60 L 140 60 L 130 160 L 70 160 Z" fill="#4ade80" stroke="#166534" strokeWidth="6" strokeLinejoin="round" />
      
      {/* Reflets sur le corps */}
      <path d="M 70 65 L 75 155" stroke="#86efac" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M 85 65 L 90 155" stroke="#86efac" strokeWidth="4" strokeLinecap="round" opacity="0.5" />

      {/* Couvercle (ouvert et volant légèrement) */}
      <path d="M 50 45 L 145 35 L 150 45 L 55 55 Z" fill="#22c55e" stroke="#166534" strokeWidth="6" strokeLinejoin="round" />
      {/* Poignée du couvercle */}
      <path d="M 85 38 L 115 35" stroke="#166534" strokeWidth="6" strokeLinecap="round" />

      {/* Rebord supérieur */}
      <rect x="50" y="55" width="100" height="10" rx="4" fill="#22c55e" stroke="#166534" strokeWidth="6" />

      {/* Jambes */}
      <path d="M 80 160 L 75 175" stroke="#166534" strokeWidth="8" strokeLinecap="round" />
      <path d="M 120 160 L 125 175" stroke="#166534" strokeWidth="8" strokeLinecap="round" />
      
      {/* Pieds */}
      <ellipse cx="70" cy="175" rx="12" ry="6" fill="#166534" />
      <ellipse cx="130" cy="175" rx="12" ry="6" fill="#166534" />

      {/* Visage Mignon */}
      {/* Yeux (Blancs) */}
      <circle cx="85" cy="100" r="12" fill="white" stroke="#166534" strokeWidth="3" />
      <circle cx="115" cy="100" r="12" fill="white" stroke="#166534" strokeWidth="3" />
      
      {/* Pupilles (Noires avec reflet) */}
      <circle cx="88" cy="100" r="6" fill="#166534" />
      <circle cx="86" cy="98" r="2" fill="white" />
      
      <circle cx="112" cy="100" r="6" fill="#166534" />
      <circle cx="110" cy="98" r="2" fill="white" />

      {/* Grand Sourire */}
      <path d="M 85 120 Q 100 135, 115 120" stroke="#166534" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Joues roses */}
      <ellipse cx="72" cy="115" rx="6" ry="4" fill="#fca5a5" opacity="0.8" />
      <ellipse cx="128" cy="115" rx="6" ry="4" fill="#fca5a5" opacity="0.8" />
      
      {/* Logo Recyclage flottant à gauche */}
      <g transform="translate(30, 40) scale(0.6)">
        <path d="M 10 30 L 25 5 L 40 30 Z" fill="#16a34a" />
        <path d="M 35 30 L 50 55 L 20 55 Z" fill="#15803d" />
        <path d="M 20 55 L 5 30 L 35 30 Z" fill="#22c55e" />
      </g>
    </svg>
  );
}
