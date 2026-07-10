import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { startKeepAlive } from './services/keepAlive';

// Ne ping Render qu'en production — pas pendant le développement local
if (import.meta.env.PROD) {
  startKeepAlive();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
