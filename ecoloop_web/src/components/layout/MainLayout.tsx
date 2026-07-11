import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Camera, UserCircle, LogOut, Settings, Bell, Check, Trash2, X, Plus, Package, MapPin } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DemoController } from '../DemoController';

// Mock Notifications
const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'mission', title: 'Nouvelle mission disponible', desc: 'Collecte de 50kg de PET à proximité.', time: 'Il y a 5 min', read: false },
  { id: 2, type: 'success', title: 'Collecte validée', desc: 'Votre lot a été réceptionné par l\'industriel.', time: 'Il y a 2 h', read: false },
  { id: 3, type: 'reward', title: 'Récompense obtenue', desc: 'Vous avez reçu 500 points EcoLoop.', time: 'Hier', read: true },
  { id: 4, type: 'ai', title: 'Analyse IA terminée', desc: 'Votre déchet a été identifié comme HDPE.', time: 'Hier', read: true },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const userRole = user?.role.toLowerCase() || '';

  // Determine the correct dashboard path per role
  const dashboardPath = (() => {
    switch (userRole) {
      case 'collecteur': return '/collector/dashboard';
      case 'producteur': return '/household/dashboard';
      case 'industriel': return '/recycler/dashboard';
      case 'mairie': return '/municipality/dashboard';
      default: return '/dashboard';
    }
  })();

  const baseNavItems = [
    { label: 'Accueil', path: dashboardPath, icon: <Home size={24} /> },
    ...(userRole === 'collecteur' ? [
      { label: 'Carte', path: '/collector/map', icon: <Map size={24} /> }
    ] : []),
    { label: 'Profil', path: '/profile', icon: <UserCircle size={24} /> },
    { label: 'Réglages', path: '/settings', icon: <Settings size={24} /> }
  ];

  const isActive = (path: string) => {
    if (path === dashboardPath) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar-desktop">
        <div className="sidebar-logo">
          <Link to="/">EcoLoop</Link>
        </div>
        
        {user && (
          <div className="user-profile">
            <div className="avatar">{user.full_name?.charAt(0) || 'U'}</div>
            <div>
              <p className="user-name">{user.full_name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {userRole === 'producteur' ? (
            <>
              <Link to={dashboardPath} className={`nav-link ${isActive(dashboardPath) ? 'active' : ''}`}>
                <Home size={24} /> <span>Accueil</span>
              </Link>
              <Link to="/producer/new-lot" className={`nav-link ${isActive('/producer/new-lot') ? 'active' : ''}`}>
                <Package size={24} /> <span>Vendre</span>
              </Link>
              <Link to="/producer/report" className={`nav-link ${isActive('/producer/report') ? 'active' : ''}`}>
                <MapPin size={24} /> <span>Signaler</span>
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <UserCircle size={24} /> <span>Profil</span>
              </Link>
              <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
                <Settings size={24} /> <span>Réglages</span>
              </Link>
            </>
          ) : (
            baseNavItems.map((item, idx) => (
              <Link key={idx} to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))
          )}
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={logout} className="nav-link logout" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={24} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="main-content w-full relative z-0 flex-1">
        {/* Top bar + notifications */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40 pointer-events-none" ref={notifRef}>
          <div className="pointer-events-auto mt-2 md:mt-0">
            <div 
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-ecoloop-green px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-gray-100 cursor-help" 
              title="EcoLoop Demo Environment: Certaines données sont simulées afin de présenter le fonctionnement complet du produit."
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Demo Live
            </div>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={logout}
              className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 md:hidden"
              aria-label="Déconnexion"
            >
              <LogOut size={24} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-deep-forest hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ecoloop-green"
                aria-label="Notifications"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

            {isNotifOpen && (
              <div className="fixed inset-0 md:absolute md:inset-auto md:right-0 md:top-14 md:w-96 md:rounded-2xl bg-white shadow-2xl md:border md:border-gray-100 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white md:rounded-t-2xl">
                  <h3 className="font-bold text-lg text-deep-forest">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-medium text-ecoloop-green hover:underline cursor-pointer px-2 py-1">
                        Tout marquer lu
                      </button>
                    )}
                    <button onClick={() => setIsNotifOpen(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-96">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={40} className="mx-auto mb-3 opacity-20" />
                      <p>Aucune notification pour le moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-green-50/30' : ''}`} onClick={() => markAsRead(n.id)}>
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${!n.read ? 'bg-ecoloop-green text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {n.type === 'mission' && <Map size={18} />}
                            {n.type === 'success' && <Check size={18} />}
                            {n.type === 'reward' && <span className="font-bold text-sm">pts</span>}
                            {n.type === 'ai' && <Camera size={18} />}
                          </div>
                          <div className="flex-1 cursor-pointer">
                            <h4 className={`text-sm ${!n.read ? 'font-bold text-deep-forest' : 'font-medium text-gray-700'}`}>{n.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.desc}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="text-gray-300 hover:text-red-500 p-1 opacity-0 hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 text-center bg-gray-50 md:rounded-b-2xl">
                    <button className="text-sm font-bold text-deep-forest hover:text-ecoloop-green transition-colors cursor-pointer w-full py-1">
                      Voir toutes les notifications
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        <Outlet />
      </main>

      <DemoController />

      {/* FAB Producer */}
      {userRole === 'producteur' ? (
        <nav className="mobile-nav flex justify-around items-center px-6 pb-safe bg-white border-t border-gray-100 h-16 fixed bottom-0 left-0 right-0 z-40 md:hidden">
          <Link to={dashboardPath} className={`flex flex-col items-center gap-1 p-2 flex-1 ${isActive(dashboardPath) ? 'text-ecoloop-green' : 'text-gray-400 hover:text-gray-600'}`}>
            <Home size={24} />
            <span className="text-[10px] font-medium">Accueil</span>
          </Link>
          
          <div className="flex-1 flex justify-center relative -top-5">
            <button 
              onClick={() => setShowBottomSheet(true)}
              className="w-16 h-16 bg-ecoloop-green text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 hover:bg-green-600 active:scale-95 transition-all"
            >
              <Plus size={32} />
            </button>
          </div>

          <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 flex-1 ${isActive('/profile') ? 'text-ecoloop-green' : 'text-gray-400 hover:text-gray-600'}`}>
            <UserCircle size={24} />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </nav>
      ) : (
        <nav className="mobile-nav">
          {baseNavItems.slice(0, 4).map((item, idx) => (
            <Link key={idx} to={item.path} className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Bottom Sheet for Producer Actions */}
      <AnimatePresence>
        {showBottomSheet && (
          <div key="producer-actions-sheet" className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in duration-200" onClick={() => setShowBottomSheet(false)}>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full rounded-t-3xl overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-deep-forest text-center mb-2">Nouvelle action</h3>
                <p className="text-center text-text-secondary text-sm mb-6">Que voulez-vous faire ?</p>
                <div className="space-y-4">
                  <button onClick={() => { setShowBottomSheet(false); navigate('/producer/new-lot'); }} className="w-full bg-green-50 text-ecoloop-green font-bold text-lg p-5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-green-100 transition-colors active:scale-95 border border-green-100">
                    <div className="flex items-center gap-2">
                      <Package size={24} />
                      Vendre mes déchets
                    </div>
                    <span className="text-sm font-medium text-green-700">Transformer mes déchets en valeur</span>
                  </button>
                  <button onClick={() => { setShowBottomSheet(false); navigate('/producer/report'); }} className="w-full bg-blue-50 text-blue-600 font-bold text-lg p-5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-colors active:scale-95 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={24} />
                      Signaler un dépôt
                    </div>
                    <span className="text-sm font-medium text-blue-700">Alerter la ville d'un problème</span>
                  </button>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <button onClick={() => setShowBottomSheet(false)} className="w-full font-bold text-text-secondary py-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <X size={20} className="inline mr-2" /> Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
