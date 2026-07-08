import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Recycle, LogOut, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <Recycle size={28} style={{ color: '#10b981' }} />
          <span>EcoLoop</span>
        </Link>
        
        <nav className="nav-links">
          {user ? (
            <>
              <span className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} />
                <span>{user.full_name} ({user.role.toUpperCase()})</span>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                S'inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Header;
