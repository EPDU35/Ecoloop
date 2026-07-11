import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Truck, Receipt, Cpu, Server, LogOut, Menu, X, Leaf, AlertTriangle
} from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Signalements', icon: AlertTriangle },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'collections', label: 'Collectes', icon: Truck },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'ai', label: 'IA & Modèles', icon: Cpu },
  { id: 'system', label: 'Système', icon: Server },
];

export default function BackofficeLayout({ activeTab, onTabChange, onLogout, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fermer la sidebar quand on change d'onglet (mobile)
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  // Fermer la sidebar si on redimensionne vers desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setSidebarOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="bo-layout">
      {/* Overlay mobile */}
      <div
        className={`bo-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Header mobile */}
      <header className="bo-mobile-header">
        <button className="bo-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="bo-mobile-logo">
          <Leaf size={18} color="#34d399" />
          <span>EcoLoop</span>
        </div>
        <div style={{ width: 36 }} />
      </header>

      {/* Sidebar */}
      <aside className={`bo-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="bo-logo">
          <div className="bo-logo-icon">
            <Leaf size={18} color="#0a0b0d" />
          </div>
          <div className="bo-logo-text">
            <strong>EcoLoop</strong>
            <small>Admin Console</small>
          </div>
        </div>

        <div className="bo-nav-section-label">Navigation</div>
        <nav className="bo-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`bo-nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="bo-sidebar-footer">
          <button className="bo-nav-item" onClick={onLogout}>
            <LogOut size={17} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="bo-main">
        {children}
      </main>
    </div>
  );
}
