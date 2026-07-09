import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [reportType, setReportType] = useState('impact');
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="reports"
        onSelect={handleSelect}
        user={{ name: "Koffi N'Guessan", role: "Mairie d'Abidjan (RSE)" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Rapports d'impact & d'activité"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-grid-2" style={{ gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
            <div className="el-card">
              <div className="el-card-heading">
                <div className="el-card-title">Configurer le rapport</div>
              </div>

              <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <label htmlFor="reportType" style={{ marginBottom: 4 }}>Type de rapport</label>
                  <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="impact">Rapport d'Impact RSE et Environnemental</option>
                    <option value="volumes">Bilan des Volumes Collectés par Quartier</option>
                    <option value="wild_dumps">Rapport d'Assainissement (Dépôts Sauvages)</option>
                  </select>
                </div>

                <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <label htmlFor="period" style={{ marginBottom: 4 }}>Période</label>
                  <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="month">Mois en cours (Juillet 2026)</option>
                    <option value="quarter">3 derniers mois</option>
                    <option value="year">Année en cours (2026)</option>
                  </select>
                </div>

                <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <label htmlFor="format" style={{ marginBottom: 4 }}>Format d'export</label>
                  <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="pdf">Document PDF (.pdf)</option>
                    <option value="excel">Tableau Excel (.xlsx)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="el-btn el-btn-emerald"
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                  disabled={loading}
                >
                  {loading ? 'Génération...' : 'Générer le rapport'}
                </button>

                {success && (
                  <div style={{ background: '#e6f4ea', color: '#137333', padding: '0.75rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 500 }}>
                    ✓ Rapport généré avec succès ! Le téléchargement de votre fichier {format.toUpperCase()} va démarrer automatiquement dans quelques secondes.
                  </div>
                )}
              </form>
            </div>

            <div className="el-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="el-card-heading">
                <div className="el-card-title">Historique des exports</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--el-border)', paddingBottom: 8 }}>
                  <div>
                    <strong>Rapport Impact T2 2026</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>01/07/2026 · PDF</div>
                  </div>
                  <a href="#" className="el-card-link" onClick={(e) => e.preventDefault()}>Télécharger</a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--el-border)', paddingBottom: 8 }}>
                  <div>
                    <strong>Bilan Volumes Yopougon Juin</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>15/06/2026 · Excel</div>
                  </div>
                  <a href="#" className="el-card-link" onClick={(e) => e.preventDefault()}>Télécharger</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
