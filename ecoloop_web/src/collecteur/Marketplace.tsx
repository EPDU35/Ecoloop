import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';

interface LotsDispo {
  id: string;
  producteur: string;
  material: string;
  quality: string;
  weightKg: number;
  pricePerKg: number;
  location: string;
  distanceKm: number;
}

const MOCK_LOTS: LotsDispo[] = [
  { id: 'L-001', producteur: 'Aïcha Koné', material: 'PET', quality: 'A', weightKg: 10, pricePerKg: 150, location: 'Yopougon', distanceKm: 3.2 },
  { id: 'L-004', producteur: 'Mamadou Diallo', material: 'HDPE', quality: 'A', weightKg: 5, pricePerKg: 120, location: 'Cocody', distanceKm: 5.1 },
  { id: 'L-005', producteur: 'Fatoumata Sy', material: 'Carton', quality: 'B', weightKg: 20, pricePerKg: 80, location: 'Marcory', distanceKm: 2.8 },
];

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#3fa34d', HDPE: '#6b8f79', Carton: '#d9a441', Verre: '#b4522f',
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [material, setMaterial] = useState('all');
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const filtered = useMemo(() => {
    return MOCK_LOTS.filter((lot) => material === 'all' || lot.material === material);
  }, [material]);

  const toggleClaim = (id: string) => {
    setClaimedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="el-shell">
      <Sidebar items={NAV_ITEMS} activeKey="marketplace" onSelect={handleSelect}
        user={{ name: "Kouamé Jean", role: "Collecteur" }}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="el-main">
        <Navbar title="Lots disponibles à collecter" searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="el-content">
          <div className="el-filter-bar">
            <div className="el-filter-field">
              <label htmlFor="mat-filter">Matériau</label>
              <select id="mat-filter" value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="all">Tous</option>
                <option value="PET">PET</option>
                <option value="HDPE">HDPE</option>
                <option value="Carton">Carton</option>
                <option value="Verre">Verre</option>
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
                    <span className="el-material-badge" style={{ background: MATERIAL_COLORS[lot.material] || '#6b8f79' }}>{lot.material}</span>
                    <span className="el-lot-distance">{lot.distanceKm} km</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--el-ink-soft)' }}>{lot.producteur}</div>
                  <div className="el-lot-weight">{lot.weightKg >= 1000 ? `${(lot.weightKg / 1000).toFixed(1)} t` : `${lot.weightKg} kg`}</div>
                  <div className="el-lot-location">{lot.location}</div>
                  <span className="el-pill success">Qualité {lot.quality}</span>
                  <div className="el-lot-footer">
                    <div className="el-lot-price">{lot.pricePerKg} FCFA<span>par kg</span></div>
                    <button type="button" className={`el-lot-btn${isClaimed ? ' added' : ''}`} onClick={() => toggleClaim(lot.id)}>
                      {isClaimed ? 'Confirmé ✓' : 'Collecter'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
