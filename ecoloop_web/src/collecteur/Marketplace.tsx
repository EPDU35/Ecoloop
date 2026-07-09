import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getAvailableWastes, reserveWasteLot } from '../services/collecteur.service';
import type { WasteLotOut } from '../models/Waste';

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#3fa34d', HDPE: '#6b8f79', CARTON: '#d9a441', VERRE: '#b4522f',
  PLASTIQUE: '#3fa34d', METAL: '#6b8f79', PAPIER: '#d9a441',
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lots, setLots] = useState<WasteLotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [material, setMaterial] = useState('all');
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [reserving, setReserving] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    getAvailableWastes()
      .then(setLots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const filtered = useMemo(() => {
    return lots.filter((lot) => material === 'all' || lot.category === material);
  }, [lots, material]);

  const toggleClaim = async (id: string) => {
    if (claimedIds.has(id)) return;
    setReserving(id);
    try {
      await reserveWasteLot(id);
      setClaimedIds((prev) => new Set(prev).add(id));
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la réservation');
    } finally {
      setReserving(null);
    }
  };

  const uniqueCategories = [...new Set(lots.map((l) => l.category))];

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="marketplace" onSelect={handleSelect}
        user={{ name: "Collecteur", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Lots disponibles à collecter" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          {loading ? (
            <p className="el-empty">Chargement...</p>
          ) : error ? (
            <p className="el-empty">Erreur : {error}</p>
          ) : (
            <>
              <div className="el-filter-bar">
                <div className="el-filter-field">
                  <label htmlFor="mat-filter">Matériau</label>
                  <select id="mat-filter" value={material} onChange={(e) => setMaterial(e.target.value)}>
                    <option value="all">Tous</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="el-results-count"><strong>{filtered.length}</strong> lot{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</div>
              <div className="el-lot-grid">
                {filtered.map((lot) => {
                  const isClaimed = claimedIds.has(lot.id);
                  return (
                    <div className="el-lot-card" key={lot.id}>
                      <div className="el-lot-header">
                        <span className="el-material-badge" style={{ background: MATERIAL_COLORS[lot.category] || '#6b8f79' }}>{lot.category}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--el-ink-soft)' }}>{lot.description || 'Aucune description'}</div>
                      <div className="el-lot-weight">{lot.weight_kg >= 1000 ? `${(lot.weight_kg / 1000).toFixed(1)} t` : `${lot.weight_kg} kg`}</div>
                      <div className="el-lot-location">{lot.latitude?.toFixed(4)}, {lot.longitude?.toFixed(4)}</div>
                      <div className="el-lot-footer">
                        <div className="el-lot-price">{lot.price_per_kg.toLocaleString('fr-FR')} FCFA<span>par kg</span></div>
                        <button type="button"
                          className={`el-lot-btn${isClaimed ? ' added' : ''}`}
                          disabled={reserving === lot.id}
                          onClick={() => toggleClaim(lot.id)}>
                          {reserving === lot.id ? '...' : isClaimed ? 'Confirmé ✓' : 'Collecter'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="el-empty" style={{ gridColumn: '1 / -1' }}>Aucun lot disponible</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
