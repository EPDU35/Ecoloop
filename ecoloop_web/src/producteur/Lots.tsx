import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';

interface Lot {
  id: string;
  material: string;
  quality: string;
  weight: string;
  status: 'disponible' | 'collecte' | 'vendu';
  date: string;
}

const MOCK_LOTS: Lot[] = [
  { id: 'L-001', material: 'PET', quality: 'A', weight: '10 kg', status: 'disponible', date: '08/07/2026' },
  { id: 'L-002', material: 'Carton', quality: 'B', weight: '6 kg', status: 'collecte', date: '06/07/2026' },
  { id: 'L-003', material: 'Verre', quality: 'A', weight: '14 kg', status: 'vendu', date: '01/07/2026' },
  { id: 'L-004', material: 'HDPE', quality: 'A', weight: '5 kg', status: 'disponible', date: '09/07/2026' },
];

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#3fa34d', HDPE: '#6b8f79', Carton: '#d9a441', Verre: '#b4522f',
};

export default function Lots() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="lots" onSelect={handleSelect}
        user={{ name: "Aïcha Koné", role: "Producteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Mes lots de déchets" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-card" style={{ marginBottom: '1rem' }}>
            <div className="el-card-heading">
              <div className="el-card-title">Publier un nouveau lot</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--el-ink-soft)', lineHeight: 1.5 }}>
              Prenez une photo de vos déchets avec votre téléphone. L'IA EcoLoop识别era automatiquement le type, la qualité et le poids estimé.
            </p>
            <button type="button" className="el-btn el-btn-amber" style={{ marginTop: '1rem' }}
              onClick={() => alert('🧪 Scanner IA — démo : téléphone requis pour la capture. Fonctionnalité à connecter au modèle YOLO.')}>
              Scanner un déchet
            </button>
          </div>

          <div className="el-results-count"><strong>{MOCK_LOTS.length}</strong> lots</div>
          <div className="el-card">
            <div className="el-table-wrap">
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Réf.</th><th>Matériau</th><th>Qualité</th><th>Poids</th><th>Statut</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LOTS.map((lot) => (
                    <tr key={lot.id}>
                      <td className="el-mono" style={{ fontWeight: 600 }}>{lot.id}</td>
                      <td>
                        <span className="el-material-badge" style={{ background: MATERIAL_COLORS[lot.material] || '#6b8f79' }}>
                          {lot.material}
                        </span>
                      </td>
                      <td><span className="el-pill success">Qualité {lot.quality}</span></td>
                      <td className="el-mono">{lot.weight}</td>
                      <td>
                        <span className={`el-pill ${lot.status === 'disponible' ? 'in_transit' : lot.status === 'collecte' ? 'late' : 'success'}`}>
                          {lot.status === 'disponible' ? 'Disponible' : lot.status === 'collecte' ? 'En collecte' : 'Vendu'}
                        </span>
                      </td>
                      <td className="el-mono">{lot.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
