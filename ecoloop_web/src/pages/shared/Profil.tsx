import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../auth/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  producteur: 'Producteur', collecteur: 'Collecteur', industriel: 'Industriel / Recycleur', mairie: 'Mairie / RSE', admin: 'Administrateur',
};

export default function Profil() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const navItems = [
    { key: 'profile', label: 'Mon profil', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 22c0-4 3.6-7 8-7s8 3 8 7" /></svg> },
  ];

  if (!user) return <div className="el-content" style={{ padding: '3rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div className="el-shell">
      <Sidebar items={navItems} activeKey="profile" onSelect={() => {}}
        user={{ name: user.full_name, role: ROLE_LABELS[user.role] || user.role }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mon profil" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content" style={{ maxWidth: 600 }}>
          <div className="el-card">
            <div className="el-card-heading">
              <div className="el-card-title">Informations personnelles</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div><label className="el-kpi-label" style={{ marginBottom: 4 }}>Nom complet</label><div>{user.full_name}</div></div>
              <div><label className="el-kpi-label" style={{ marginBottom: 4 }}>Email</label><div>{user.email}</div></div>
              <div><label className="el-kpi-label" style={{ marginBottom: 4 }}>Téléphone</label><div>{user.phone}</div></div>
              <div><label className="el-kpi-label" style={{ marginBottom: 4 }}>Rôle</label><div><span className="el-pill success">{ROLE_LABELS[user.role] || user.role}</span></div></div>
            </div>
          </div>
          <div className="el-card" style={{ marginTop: '1rem' }}>
            <div className="el-card-heading">
              <div className="el-card-title">Actions du compte</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="button" className="el-btn el-btn-ghost" onClick={() => navigate('/connexion')}>
                Changer de mot de passe
              </button>
              <button type="button" className="el-btn el-btn-ghost" style={{ color: 'var(--el-rust)', borderColor: 'rgba(180,82,47,0.3)' }}
                onClick={() => { logout(); navigate('/'); }}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
