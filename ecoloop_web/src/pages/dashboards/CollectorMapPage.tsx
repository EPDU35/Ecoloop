import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Truck, Phone, MessageSquare } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

export function CollectorMapPage() {
  const navigate = useNavigate();
  const { setDemoStep } = useDemo();
  const [isNavigating, setIsNavigating] = useState(false);
  const [distance, setDistance] = useState('1.3 km');
  const [time, setTime] = useState('8 min');

  useEffect(() => {
    if (isNavigating) {
      const timer1 = setTimeout(() => {
        setDistance('800 m');
        setTime('4 min');
      }, 3000);
      const timer2 = setTimeout(() => {
        setDistance('200 m');
        setTime('1 min');
      }, 6000);
      const timer3 = setTimeout(() => {
        setDistance('0 m');
        setTime('Arrivé');
        // Simulator triggers completion
        setDemoStep(3);
        setTimeout(() => navigate('/collector/dashboard'), 2000);
      }, 9000);
      
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }
  }, [isNavigating, navigate, setDemoStep]);

  return (
    <div className="min-h-screen bg-gray-100 font-body relative flex flex-col h-[100dvh] overflow-hidden">
      
      {/* HEADER OVERLAY */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
        <button onClick={() => navigate(-1)} className="p-3 bg-white shadow-lg rounded-full pointer-events-auto transition-transform active:scale-95">
          <ArrowLeft size={24} className="text-deep-forest" />
        </button>
        <div className="bg-white px-4 py-2 rounded-full shadow-lg pointer-events-auto flex items-center gap-2 font-bold text-deep-forest">
          <Truck size={18} className="text-blue-600" />
          En route
        </div>
      </div>

      {/* FAKE MAP AREA */}
      <div className="flex-1 relative bg-[#e5e3df]">
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" 
          alt="Map" 
          className="w-full h-full object-cover opacity-70"
        />
        {/* Fake itinerary line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
            <path d="M 100 400 Q 200 300 250 200 T 300 100" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 12" className="animate-[dash_1s_linear_infinite]" />
            <circle cx="300" cy="100" r="8" fill="#16a34a" stroke="white" strokeWidth="3" />
            <circle cx="100" cy="400" r="8" fill="#2563eb" stroke="white" strokeWidth="3" />
          </svg>
        </div>
        
        {/* User pin */}
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10 animate-bounce">
          <Truck size={20} className="text-white" />
        </div>
        
        {/* Destination pin */}
        <div className="absolute top-[20%] left-[70%] w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10">
          <MapPin size={18} className="text-white" />
        </div>
      </div>

      {/* BOTTOM SHEET INFO */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 relative p-6 pb-8">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-heading text-3xl font-black text-blue-600 mb-1">{time}</h2>
            <p className="text-gray-500 font-bold">{distance} • Arrivée estimée 14:30</p>
          </div>
          <button 
            onClick={() => setIsNavigating(true)} 
            disabled={isNavigating}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${isNavigating ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white active:scale-95'}`}
          >
            <Navigation size={24} className={isNavigating ? 'animate-pulse' : ''} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-green-700">PR</span>
            </div>
            <div>
              <p className="font-bold text-deep-forest">Producteur (Koffi)</p>
              <p className="text-xs text-text-secondary">Cocody Riviera - Lot PET</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-50">
              <MessageSquare size={18} />
            </button>
            <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-50">
              <Phone size={18} />
            </button>
          </div>
        </div>

        {isNavigating && (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
            <Navigation className="animate-bounce" size={20} />
            <span className="font-bold text-sm">Navigation en cours, suivez l'itinéraire...</span>
          </div>
        )}
      </div>
    </div>
  );
}
