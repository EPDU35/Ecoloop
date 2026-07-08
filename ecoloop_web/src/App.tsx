import React from 'react';
import { AuthProvider } from './auth/AuthContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: '#0b1120',
        color: '#f8fafc'
      }}>
        <h1 style={{ color: '#10b981', marginBottom: '16px' }}>EcoLoop Frontend</h1>
        <p style={{ color: '#94a3b8' }}>Le projet est configuré et connecté au backend.</p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>
          Consultez <code>src/services/api.ts</code> et <code>src/auth/AuthContext.tsx</code> pour intégrer l'API.
        </p>
      </div>
    </AuthProvider>
  );
};

export default App;
