import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Map, Camera, UserCircle, LogOut, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role.toLowerCase() || '';

  const navItems = [
    { label: 'Accueil', path: user ? `/dashboard` : '/', icon: <Home size={24} /> },
    ...(userRole === 'producteur' ? [
      { label: 'Signaler', path: '/producer/new-lot', icon: <Camera size={24} /> }
    ] : []),
    ...(userRole === 'collecteur' ? [
      { label: 'Carte', path: '/collector/dashboard', icon: <Map size={24} /> }
    ] : []),
    { label: 'Profil', path: '/profile', icon: <UserCircle size={24} /> },
    { label: 'Réglages', path: '/settings', icon: <Settings size={24} /> }
  ];

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
          {navItems.map((item, idx) => (
            <Link key={idx} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={logout} className="nav-link logout" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={24} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="main-content relative">
        {/* Top bar mobile + notifications */}
        <div className="md:hidden absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
          <div className="w-10 h-10"></div>
          <button className="relative p-2 bg-white/20 backdrop-blur-md rounded-full text-white pointer-events-auto">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        <Outlet />
      </main>

      <nav className="mobile-nav">
        {navItems.slice(0, 4).map((item, idx) => (
          <Link key={idx} to={item.path} className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
