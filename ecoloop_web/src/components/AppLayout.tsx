import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { NAV_ITEMS as IND_ITEMS, NAV_PATHS as IND_PATHS } from '../industrial/nav';
import { NAV_ITEMS as MUN_ITEMS, NAV_PATHS as MUN_PATHS } from '../municipality/nav';
import { NAV_ITEMS as ADM_ITEMS, NAV_PATHS as ADM_PATHS } from '../admin/nav';

import { NAV_ITEMS as PROD_ITEMS, NAV_PATHS as PROD_PATHS } from '../producteur/nav';

type RoleType = 'industrial' | 'municipality' | 'admin' | 'producteur';

type AppLayoutProps = {
  children: React.ReactNode;
  activeKey: string;
  title: string;
  role: RoleType;
};

export default function AppLayout({ children, activeKey, title, role }: AppLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Bloquer le défilement tactile sur iOS et le défilement standard sur ordinateur quand le menu mobile est ouvert
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Résout le problème iOS Safari
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [sidebarOpen]);

  // Récupérer le menu et les chemins associés selon le rôle
  let items = IND_ITEMS;
  let paths = IND_PATHS;
  let user = { name: 'Espace Industriel', role: 'Industriel / Recycleur' };

  if (role === 'municipality') {
    items = MUN_ITEMS;
    paths = MUN_PATHS;
    user = { name: "Mairie d'Abobo", role: 'Régulateur' };
  } else if (role === 'admin') {
    items = ADM_ITEMS;
    paths = ADM_PATHS;
    user = { name: 'Admin EcoLoop', role: 'Super-Administrateur' };
  } else if (role === 'producteur') {
    items = PROD_ITEMS;
    paths = PROD_PATHS;
    user = { name: 'Espace Producteur', role: 'Producteur de Déchets' };
  }

  const handleSelect = (key: string) => {
    const path = paths[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar
        items={items}
        activeKey={activeKey}
        onSelect={handleSelect}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title={title}
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content el-fade-in" style={{ paddingBottom: '80px' }}>
          {children}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="el-bottom-nav">
          {items.slice(0, 5).map((item) => (
            <button
              key={item.key}
              className={`el-bottom-nav-item${activeKey === item.key ? ' active' : ''}`}
              onClick={() => handleSelect(item.key)}
            >
              <div className="el-bottom-nav-icon">{item.icon}</div>
              <span className="el-bottom-nav-label">{item.label.replace(' 📸', '')}</span>
            </button>
          ))}
          {items.length > 5 && (
            <button
              className="el-bottom-nav-item"
              onClick={() => setSidebarOpen(true)}
            >
              <div className="el-bottom-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </div>
              <span className="el-bottom-nav-label">Plus</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
