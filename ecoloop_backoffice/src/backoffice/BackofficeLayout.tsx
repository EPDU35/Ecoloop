import React from 'react';
import {
  LayoutDashboard, Users, Truck, Receipt, Cpu, Server, Activity, LogOut,
} from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'collections', label: 'Collectes', icon: Truck },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'ai', label: 'IA & Modèles', icon: Cpu },
  { id: 'system', label: 'Système', icon: Server },
];

export default function BackofficeLayout({ activeTab, onTabChange, onLogout, children }: Props) {
  return (
    <div className="bo-layout">
      <aside className="bo-sidebar">
        <div className="bo-logo">
          <Activity size={24} />
          <span>EcoLoop Admin</span>
        </div>
        <nav className="bo-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`bo-nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="bo-sidebar-footer">
          <button className="bo-nav-item" onClick={onLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <main className="bo-main">
        {children}
      </main>
    </div>
  );
}
