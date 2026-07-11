import { useState, useEffect } from 'react';
import BackofficeLayout from './backoffice/BackofficeLayout';
import Dashboard from './backoffice/Dashboard';
import Users from './backoffice/Users';
import Collections from './backoffice/Collections';
import Transactions from './backoffice/Transactions';
import AI from './backoffice/AI';
import System from './backoffice/System';
import { Reports } from './backoffice/Reports';
import Login from './Login';
import './backoffice/backoffice.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setAuthenticated(true);
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'reports': return <Reports />;
      case 'users': return <Users />;
      case 'collections': return <Collections />;
      case 'transactions': return <Transactions />;
      case 'ai': return <AI />;
      case 'system': return <System />;
      default: return <Dashboard />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuthenticated(false);
  };

  return (
    <BackofficeLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {renderContent()}
    </BackofficeLayout>
  );
}
