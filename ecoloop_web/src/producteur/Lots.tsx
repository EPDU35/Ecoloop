import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getMyWastes } from '../services/producteur.service';
import type { WasteLotOut } from '../models/Waste';

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#3fa34d', HDPE: '#6b8f79', CARTON: '#d9a441', VERRE: '#b4522f',
  PLASTIQUE: '#3fa34d', METAL: '#6b8f79', PAPIER: '#d9a441',
};

const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  COLLECTE: 'En collecte',
  VENDU: 'Vendu',
  COLLECTE_VALIDEE: 'Collecté',
};

export default function Lots() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lots, setLots] = useState<WasteLotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    getMyWastes()
      .then(setLots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="lots" onSelect={handleSelect}
        user={{ name: "Producteur", role: "Producteur" }}
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
              Prenez une photo de vos déchets avec votre téléphone. L'IA EcoLoop identifiera automatiquement le type, la qualité et le poids estimé.
            </p>
            <button type="button" className="el-btn el-btn-amber" style={{ marginTop: '1rem' }}
              onClick={() => alert('Scanner IA — fonctionnalité à connecter au modèle YOLO.')}>
              Scanner un déchet
            </button>
          </div>

          {loading ? (
            <p className="el-empty">Chargement...</p>
          ) : error ? (
            <p className="el-empty">Erreur : {error}</p>
          ) : (
            <>
              <div className="el-results-count"><strong>{lots.length}</strong> lot{lots.length > 1 ? 's' : ''}</div>
              <div className="el-card">
                <div className="el-table-wrap">
                  <table className="el-table">
                    <thead>
                      <tr>
                        <th>Réf.</th><th>Matériau</th><th>Poids</th><th>Prix/kg</th><th>Statut</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lots.map((lot) => (
                        <tr key={lot.id}>
                          <td className="el-mono" style={{ fontWeight: 600 }}>{lot.id.slice(0, 8)}</td>
                          <td>
                            <span className="el-material-badge" style={{ background: MATERIAL_COLORS[lot.category] || '#6b8f79' }}>
                              {lot.category}
                            </span>
                          </td>
                          <td className="el-mono">{lot.weight_kg} kg</td>
                          <td className="el-mono">{lot.price_per_kg.toLocaleString('fr-FR')} FCFA</td>
                          <td>
                            <span className={`el-pill ${lot.status === 'DISPONIBLE' ? 'in_transit' : lot.status === 'COLLECTE' ? 'late' : 'success'}`}>
                              {STATUS_LABELS[lot.status] || lot.status}
                            </span>
                          </td>
                          <td className="el-mono">{lot.created_at ? new Date(lot.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                        </tr>
                      ))}
                      {lots.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--el-ink-soft)' }}>Aucun lot publié</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
