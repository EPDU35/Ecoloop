import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useNavigate } from 'react-router-dom';

export default function Impact() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="impact"
        onSelect={handleSelect}
        user={{ name: "Koffi N'Guessan", role: "Mairie d'Abidjan (RSE)" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Indicateurs d'impact RSE"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          {/* Section 1: Environnement */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            🌱 Impact Environnemental
          </h2>

          <div className="el-kpi-grid">
            <div className="el-card">
              <div className="el-kpi-label">Émissions CO₂ évitées</div>
              <div className="el-kpi-value">46.2 tonnes</div>
              <div className="el-kpi-delta up">↑ 8% vs mois dernier</div>
            </div>

            <div className="el-card">
              <div className="el-kpi-label">Équivalence Arbres</div>
              <div className="el-kpi-value">1 850 arbres</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)', marginTop: 4 }}>
                Arbres plantés en termes d'absorption CO₂
              </div>
            </div>

            <div className="el-card">
              <div className="el-kpi-label">Équivalence Voitures</div>
              <div className="el-kpi-value">22 véhicules</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)', marginTop: 4 }}>
                Voitures retirées de la circulation pendant 1 an
              </div>
            </div>
          </div>

          {/* Section 2: Social */}
          <h2 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            👥 Impact Social & Économique
          </h2>

          <div className="el-grid-2">
            <div className="el-card">
              <div className="el-card-heading">
                <div className="el-card-title">Soutien aux collecteurs locaux</div>
              </div>
              <div className="el-kpi-value" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>35 collecteurs</div>
              <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Nombre d'auto-entrepreneurs de collecte de déchets enregistrés et soutenus financièrement
                dans la commune grâce aux transactions de la plateforme.
              </p>
              
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span>Objectif annuel (50 collecteurs)</span>
                  <strong>70%</strong>
                </div>
                <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '70%', background: 'var(--el-emerald)' }} />
                </div>
              </div>
            </div>

            <div className="el-card">
              <div className="el-card-heading">
                <div className="el-card-title">Revenus distribués aux ménages</div>
              </div>
              <div className="el-kpi-value" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>3.5 M FCFA</div>
              <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Somme totale reversée directement aux producteurs de déchets (ménages, commerces, écoles) 
                pour la valorisation de leurs matières recyclables.
              </p>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span>Objectif de redistribution (5 M FCFA)</span>
                  <strong>70%</strong>
                </div>
                <div style={{ height: 8, background: 'var(--el-paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '70%', background: 'var(--el-emerald)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
